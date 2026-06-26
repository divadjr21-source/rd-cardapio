import { useEffect, useMemo, useState } from 'react';
import { ESTABELECIMENTO } from '../data/constants';
import { supabase } from '../lib/supabase';
import { AppContext } from './AppContext.js';

export function AppProvider({ children, restauranteSlug }) {
  const [config, setConfig] = useState(ESTABELECIMENTO);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [carrinho, setCarrinho] = useState(() => {
    const saved = localStorage.getItem('cardapio_carrinho');
    return saved ? JSON.parse(saved) : [];
  });

  const [observacoes, setObservacoes] = useState('');

  useEffect(() => localStorage.setItem('cardapio_carrinho', JSON.stringify(carrinho)), [carrinho]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUsuario(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let ignorar = false;

    async function carregarRestaurante() {
      if (!restauranteSlug) {
        setCarregando(false);
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
        slug: restaurante.slug,
        id: restaurante.id,
      });

      await recarregarProdutos(restaurante.id);

      if (!ignorar) setCarregando(false);
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

    return () => {
      ignorar = true;
    };
  }, [restauranteSlug]);

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
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
      })
      .eq('id', restauranteId);

    if (error) throw error;
    setConfig(novaConfig);
  }

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

  function formatarMensagem(cliente) {
    const linhas = carrinho.map(
      (item) => `* ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
    );
    const obs = observacoes.trim();
    const partes = [
      'Olá, gostaria de fazer um pedido:',
      `Nome: ${cliente.nome}`,
      `Telefone: ${cliente.telefone}`,
      cliente.endereco ? `Endereço: ${cliente.endereco}` : '',
      'Pedido:',
      ...linhas,
      `Total: R$ ${total.toFixed(2).replace('.', ',')}`,
      obs ? `Observação: ${obs}` : '',
    ];
    return partes.filter(Boolean).join('\n');
  }

  function enviarPedido(cliente) {
    const texto = encodeURIComponent(formatarMensagem(cliente));
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
        loginAdmin,
        logoutAdmin,
        salvarProduto,
        excluirProduto,
        alternarAtivo,
        salvarConfiguracoes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
