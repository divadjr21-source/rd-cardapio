-- Passo 3 e 4: Controle de acesso e multi-lojas
-- Execute este SQL no SQL Editor do Supabase

-- Extensão UUID caso ainda não exista
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão pgcrypto para crypt() caso ainda não exista
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- Tabela de perfis de usuários
-- Vincula um usuário do Supabase Auth a um restaurante e um papel
-- ==========================================
CREATE TABLE IF NOT EXISTS public.perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE SET NULL,
  papel text NOT NULL CHECK (papel IN ('super_admin', 'lojista')),
  nome text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_perfis_restaurante_id ON public.perfis(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_perfis_papel ON public.perfis(papel);

-- Apenas um super_admin por email (evita duplicidade, se desejado)
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_email ON public.perfis(email);

-- ==========================================
-- Tabela de pedidos (relatório de vendas)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurante_id uuid NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
  cliente_nome text NOT NULL,
  cliente_telefone text,
  cliente_endereco text,
  localizacao_maps text,
  total numeric(10,2) NOT NULL,
  observacao text,
  status text NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido','aceito','entregue','cancelado')),
  itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_restaurante_id ON public.pedidos(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at);

-- ==========================================
-- RLS políticas
-- ==========================================
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- perfis: cada usuário vê o próprio perfil; super_admin vê todos
DROP POLICY IF EXISTS "perfis_select_super" ON public.perfis;
DROP POLICY IF EXISTS "perfis_select_proprio" ON public.perfis;
DROP POLICY IF EXISTS "perfis_select" ON public.perfis;
CREATE POLICY "perfis_select" ON public.perfis
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    auth.uid() IN (SELECT id FROM public.perfis WHERE papel = 'super_admin')
  );

DROP POLICY IF EXISTS "perfis_update_super" ON public.perfis;
CREATE POLICY "perfis_update_super" ON public.perfis
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.perfis WHERE papel = 'super_admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.perfis WHERE papel = 'super_admin'));

DROP POLICY IF EXISTS "perfis_insert_super" ON public.perfis;
CREATE POLICY "perfis_insert_super" ON public.perfis
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.perfis WHERE papel = 'super_admin'));

-- pedidos: lojista vê apenas do próprio restaurante; super_admin vê todos (verificado no app)
DROP POLICY IF EXISTS "pedidos_select_super" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_select_lojista" ON public.pedidos;
CREATE POLICY "pedidos_select" ON public.pedidos
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (
      SELECT p.id FROM public.perfis p
      WHERE p.id = auth.uid() AND (
        p.papel = 'super_admin' OR
        (p.papel = 'lojista' AND p.restaurante_id = pedidos.restaurante_id)
      )
    )
  );

-- pedidos: o app (anon/authenticated) pode inserir pedidos (checkout)
DROP POLICY IF EXISTS "pedidos_insert_publico" ON public.pedidos;
CREATE POLICY "pedidos_insert_publico" ON public.pedidos
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ==========================================
-- Função para inserir novo usuário/lojista
-- ==========================================
CREATE OR REPLACE FUNCTION public.criar_usuario_lojista(
  p_email text,
  p_senha text,
  p_restaurante_id uuid,
  p_nome text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_hash text;
BEGIN
  v_user_id := extensions.uuid_generate_v4();
  v_hash := crypt(p_senha, gen_salt('bf'));

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    p_email,
    v_hash,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nome', p_nome),
    false,
    'authenticated'
  );

  INSERT INTO public.perfis (id, email, restaurante_id, papel, nome)
  VALUES (v_user_id, p_email, p_restaurante_id, 'lojista', p_nome);
END;
$$;

-- ==========================================
-- Função para promover usuário existente a super_admin
-- Rode após criar o usuário no Supabase Auth
-- ==========================================
CREATE OR REPLACE FUNCTION public.promover_super_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_email;
  END IF;

  INSERT INTO public.perfis (id, email, papel, nome)
  VALUES (
    v_user_id,
    p_email,
    'super_admin',
    (SELECT raw_user_meta_data->>'nome' FROM auth.users WHERE id = v_user_id)
  )
  ON CONFLICT (id) DO UPDATE SET papel = 'super_admin';
END;
$$;

CREATE OR REPLACE FUNCTION public.excluir_usuario_lojista(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.perfis WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Adiciona coluna de endereco na tabela restaurantes
ALTER TABLE public.restaurantes ADD COLUMN IF NOT EXISTS endereco text;

-- Adiciona coluna de logo/imagem na tabela restaurantes
ALTER TABLE public.restaurantes ADD COLUMN IF NOT EXISTS logo text;

-- Garante colunas status/atualizado em restaurantes
ALTER TABLE public.restaurantes ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo' CHECK (status IN ('ativo','inativo'));

-- Adiciona colunas de modulos de negocio (controladas apenas pelo super admin)
ALTER TABLE public.restaurantes ADD COLUMN IF NOT EXISTS modulo_delivery boolean DEFAULT true;
ALTER TABLE public.restaurantes ADD COLUMN IF NOT EXISTS modulo_mesa boolean DEFAULT false;

-- Adiciona numero da mesa no pedido (nulo quando for delivery)
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS numero_mesa text;

-- Atualiza todas as lojas existentes para ativo (migracao segura)
UPDATE public.restaurantes SET status = 'ativo' WHERE status IS NULL;
