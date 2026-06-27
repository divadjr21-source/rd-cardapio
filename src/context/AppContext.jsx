import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ESTABELECIMENTO } from '../data/constants';
import { supabase } from '../lib/supabase';
import { AppContext } from './AppContext.js';

export function AppProvider({ children }) {
  const location = useLocation();
  const hashPath = location.hash.replace(/^#/, '') || location.pathname;
  const pathParts = hashPath.split('/').filter(Boolean);
  const isAdminRoute = pathParts[0] === 'login' || pathParts[0] === 'admin';
  const restauranteSlug = isAdminRoute ? null : pathParts[0] || null;
  const [config, setConfig] = useState(ESTABELECIMENTO);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(undefined);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [restaurantes, setRestaurantes] = useState([]);

  const [carrinho, setCarrinho] = useState(() => {
    const saved = localStorage.getItem('cardapio_carrinho');
    return saved ? JSON.parse(saved) : [];
  });

  const [observacoes, setObservacoes] = useState('');

  useEffect(() => localStorage.setItem('cardapio_carrinho', JSON.stringify(carrinho)), [carrinho]);

  useEffect(() => {
    let ignorar = false;

    async function carregarPerfil(userId) {
      if (!userId) {
        setPerfil(null);
        setVerificandoSessao(false);
        return;
      }

      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (ignorar) return;

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        setPerfil(null);
      } else {
        console.log('Perfil carregado:', data);
        setPerfil(data);
        if (data.papel === 'lojista' && data.restaurante_id) {
          const { data: rData } = await supabase
            .from('restaurantes')
            .select('*')
            .eq('id', data.restaurante_id)
            .single();

          if (rData) {
            setConfig({
              ...ESTABELECIMENTO,
              id: rData.id,
              nome: rData.nome_comercial || '',
              telefone: rData.whatsapp_contato || '',
              endereco: rData.endereco || '',
              slug: rData.slug || '',
            });
            await recarregarProdutos(rData.id);
          }
        }
      }
      setVerificandoSessao(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user || null);
      if (data.session?.user) {
        carregarPerfil(data.session.user.id);
      } else {
        setVerificandoSessao(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user || null;
      setUsuario(user);
      if (user) carregarPerfil(user.id);
      else {
        setPerfil(null);
        setVerificandoSessao(false);
      }
    });

    return () => {
      ignorar = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let ignorar = false;

    async function carregarRestaurante() {
      // Contexto administrativo: sem slug de restaurante
      if (!restauranteSlug) {
        setCarregando(false);
        setErro(null);
        return;
      }

      setCarregando(true);
      setErro(null);
      setConfig(ESTABELECIMENTO);
      setProdutos([]);

      const { data: restaurante, error: erroRestaurante } = await supabase
        .from('restaurantes')
        .select('*')
        .eq('slug', restauranteSlug)
        .eq('status', 'ativo')
        .single();

      if (ignorar) return;

      if (erroRestaurante || !restaurante) {
        setErro('Restaurante não encontrado.');
        setCarregando(false);
        return;
      }

      setConfig({
        ...ESTABELECIMENTO,
        nome: restaurante.nome_comercial,
        telefone: restaurante.whatsapp_contato || '',
        endereco: restaurante.endereco || '',
        slug: restaurante.slug,
        id: restaurante.id,
      });

      await recarregarProdutos(restaurante.id);

      if (!ignorar) setCarregando(false);
    }

    async function carregarRestaurantesAdmin() {
      if (restauranteSlug) return;
      if (perfil?.papel !== 'super_admin') return;

      const { data, error } = await supabase.from('restaurantes').select('*').order('nome_comercial');
      if (ignorar) return;
      if (!error) setRestaurantes(data || []);
    }

    async function recarregarProdutos(restauranteId) {
      const { data: produtosDb, error: erroProdutos } = await supabase
        .from('produtos')
        .select('nome, preco, categoria, disponivel, descricao, imagem, id, restaurante_id')
        .eq('restaurante_id', restauranteId)
        .eq('disponivel', true)
        .order('nome');

      if (ignorar) return;

      if (erroProdutos) {
        setErro('Erro ao carregar produtos.');
      } else {
        setProdutos(
          (produtosDb || []).map((p) => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao || '',
            preco: Number(p.preco),
            imagem: p.imagem || '',
            categoria: p.categoria,
            ativo: p.disponivel,
            restaurante_id: p.restaurante_id,
          }))
        );
      }
    }

    carregarRestaurante();
    carregarRestaurantesAdmin();

    return () => {
      ignorar = true;
    };
  }, [restauranteSlug, perfil]);

  async function recarregarProdutos(restauranteId) {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .order('nome');

    setProdutos(
      (data || []).map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao || '',
        preco: Number(p.preco),
        imagem: p.imagem || '',
        categoria: p.categoria,
        ativo: p.disponivel,
        restaurante_id: p.restaurante_id,
      }))
    );
  }

  async function loginAdmin(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    return { sucesso: !error, error };
  }

  async function logoutAdmin() {
    await supabase.auth.signOut();
  }

  async function salvarProduto(produto) {
    const restauranteId = config.id;
    if (!restauranteId) throw new Error('Restaurante não identificado.');

    const payload = {
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: Number(produto.preco),
      imagem: produto.imagem || '',
      categoria: produto.categoria,
      disponivel: produto.ativo !== false,
      restaurante_id: restauranteId,
    };

    let error;
    if (produto.id && typeof produto.id === 'string') {
      const res = await supabase.from('produtos').update(payload).eq('id', produto.id);
      error = res.error;
    } else {
      const res = await supabase.from('produtos').insert(payload);
      error = res.error;
    }

    if (error) throw error;
    await recarregarProdutos(restauranteId);
  }

  async function excluirProduto(id) {
    const restauranteId = config.id;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
    await recarregarProdutos(restauranteId);
  }

  async function alternarAtivo(id) {
    const restauranteId = config.id;
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return;
    const { error } = await supabase
      .from('produtos')
      .update({ disponivel: !produto.ativo })
      .eq('id', id);
    if (error) throw error;
    await recarregarProdutos(restauranteId);
  }

  async function salvarConfiguracoes(novaConfig) {
    const restauranteId = config.id;
    if (!restauranteId) throw new Error('Restaurante não identificado.');

    const { error } = await supabase
      .from('restaurantes')
      .update({
        nome_comercial: novaConfig.nome,
        whatsapp_contato: novaConfig.telefone,
        endereco: novaConfig.endereco || '',
      })
      .eq('id', restauranteId);

    if (error) throw error;
    setConfig(novaConfig);
  }

  // ========== Funções Super Admin e lojista ==========

  async function listarRestaurantesFn() {
    const { data, error } = await supabase.from('restaurantes').select('*').order('nome_comercial');
    if (error) throw error;
    return data || [];
  }

  async function criarRestaurante({ slug, nome_comercial, whatsapp_contato }) {
    const { error } = await supabase.from('restaurantes').insert({
      slug,
      nome_comercial,
      whatsapp_contato,
      status: 'ativo',
    });
    if (error) throw error;
    const data = await listarRestaurantesFn();
    setRestaurantes(data);
  }

  async function excluirRestaurante(id) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/super-api`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        acao: 'excluir_loja',
        restaurante_id: id,
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Erro ao excluir loja');
    }
    const data = await listarRestaurantesFn();
    setRestaurantes(data);
  }

  async function criarUsuarioLojista({ email, senha, restaurante_id, nome }) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/super-api`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        acao: 'criar_usuario',
        email,
        senha,
        restaurante_id,
        nome,
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Erro ao criar usuário');
    }
  }

  async function excluirUsuario(id) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/super-api`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        acao: 'excluir_usuario',
        user_id: id,
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Erro ao excluir usuário');
    }
  }

  async function listarUsuarios() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*, restaurantes:restaurante_id(*)')
      .neq('papel', 'super_admin')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function listarPedidosFn({ restauranteId, inicio, fim }) {
    let q = supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (restauranteId) q = q.eq('restaurante_id', restauranteId);
    if (inicio) q = q.gte('created_at', inicio);
    if (fim) q = q.lte('created_at', fim);

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function selecionarRestaurante(restaurante) {
    setConfig({
      ...ESTABELECIMENTO,
      id: restaurante.id,
      nome: restaurante.nome_comercial,
      telefone: restaurante.whatsapp_contato || '',
      endereco: restaurante.endereco || '',
      slug: restaurante.slug,
    });
    await recarregarProdutos(restaurante.id);
  }

  const isSuperAdmin = perfil?.papel === 'super_admin';
  const isLojista = perfil?.papel === 'lojista';

  const produtosAtivos = useMemo(() => produtos.filter((p) => p.ativo !== false), [produtos]);

  function adicionarAoCarrinho(produto) {
    setCarrinho((prev) => {
      const existente = prev.find((item) => item.id === produto.id);
      if (existente) {
        return prev.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  }

  function atualizarQuantidade(id, quantidade) {
    if (quantidade <= 0) {
      setCarrinho((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCarrinho((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantidade } : item))
      );
    }
  }

  function removerDoCarrinho(id) {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  }

  function limparCarrinho() {
    setCarrinho([]);
    setObservacoes('');
  }

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  function formatarMensagem(cliente, localizacao) {
    const linhas = carrinho.map(
      (item) => `* ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
    );
    const obs = observacoes.trim();
    const endereco = cliente.endereco?.trim();
    const mapLink = localizacao
      ? `Localização: https://www.google.com/maps?q=${localizacao.lat},${localizacao.lng}`
      : '';
    const partes = [
      'Olá, gostaria de fazer um pedido:',
      `Nome: ${cliente.nome}`,
      `Telefone: ${cliente.telefone}`,
      endereco ? `Endereço: ${endereco}` : '',
      mapLink,
      'Pedido:',
      ...linhas,
      `Total: R$ ${total.toFixed(2).replace('.', ',')}`,
      obs ? `Observação: ${obs}` : '',
    ];
    return partes.filter(Boolean).join('\n');
  }

  async function enviarPedido(cliente, localizacao) {
    const restauranteId = config.id || perfil?.restaurante_id;

    if (restauranteId) {
      try {
        const mapLink = localizacao
          ? `https://www.google.com/maps?q=${localizacao.lat},${localizacao.lng}`
          : null;

        await supabase.from('pedidos').insert({
          restaurante_id: restauranteId,
          cliente_nome: cliente.nome,
          cliente_telefone: cliente.telefone,
          cliente_endereco: cliente.endereco || '',
          localizacao_maps: mapLink,
          total,
          observacao: observacoes || '',
          itens: JSON.stringify(carrinho),
          status: 'recebido',
        });
      } catch (err) {
        console.error('Erro ao registrar pedido:', err);
      }
    }

    const texto = encodeURIComponent(formatarMensagem(cliente, localizacao));
    const url = `https://wa.me/${config.telefone.replace(/\D/g, '')}?text=${texto}`;
    window.open(url, '_blank');
    limparCarrinho();
  }

  return (
    <AppContext.Provider
      value={{
        config,
        setConfig,
        produtos,
        produtosAtivos,
        carrinho,
        observacoes,
        setObservacoes,
        total,
        adicionarAoCarrinho,
        atualizarQuantidade,
        removerDoCarrinho,
        limparCarrinho,
        enviarPedido,
        carregando,
        erro,
        usuario,
        perfil,
        verificandoSessao,
        isSuperAdmin,
        isLojista,
        restaurantes,
        loginAdmin,
        logoutAdmin,
        salvarProduto,
        excluirProduto,
        alternarAtivo,
        salvarConfiguracoes,
        listarRestaurantes: listarRestaurantesFn,
        criarRestaurante,
        excluirRestaurante,
        criarUsuarioLojista,
        excluirUsuario,
        listarUsuarios,
        listarPedidos: listarPedidosFn,
        selecionarRestaurante,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
