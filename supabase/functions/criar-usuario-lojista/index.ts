import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405 });
    }

    const { email, senha, restaurante_id, nome } = await req.json();

    if (!email || !senha || !restaurante_id) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verifica se quem chama é super_admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
    }

    const { data: perfil } = await supabaseClient
      .from('perfis')
      .select('papel')
      .eq('id', user.id)
      .single();

    if (perfil?.papel !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
    }

    // Cria o usuário no Auth usando service role
    const { data: authUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (createError || !authUser.user) {
      return new Response(
        JSON.stringify({ error: createError?.message || 'Erro ao criar usuário' }),
        { status: 400 }
      );
    }

    // Cria o perfil
    const { error: perfilError } = await supabaseClient.from('perfis').insert({
      id: authUser.user.id,
      email,
      restaurante_id,
      papel: 'lojista',
      nome,
    });

    if (perfilError) {
      await supabaseClient.auth.admin.deleteUser(authUser.user.id);
      return new Response(JSON.stringify({ error: perfilError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ id: authUser.user.id, email }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
