import { createContext, useContext, useEffect, useState } from 'react';
import { ESTABELECIMENTO, PRODUTOS_INICIAIS } from '../data/constants';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('cardapio_config');
    return saved ? { ...ESTABELECIMENTO, ...JSON.parse(saved) } : ESTABELECIMENTO;
  });

  const [produtos, setProdutos] = useState(() => {
    const saved = localStorage.getItem('cardapio_produtos');
    return saved ? JSON.parse(saved) : PRODUTOS_INICIAIS;
  });

  const [carrinho, setCarrinho] = useState(() => {
    const saved = localStorage.getItem('cardapio_carrinho');
    return saved ? JSON.parse(saved) : [];
  });

  const [observacoes, setObservacoes] = useState('');

  useEffect(() => localStorage.setItem('cardapio_produtos', JSON.stringify(produtos)), [produtos]);
  useEffect(() => localStorage.setItem('cardapio_config', JSON.stringify(config)), [config]);
  useEffect(() => localStorage.setItem('cardapio_carrinho', JSON.stringify(carrinho)), [carrinho]);

  const produtosAtivos = produtos.filter((p) => p.ativo !== false);

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

  function salvarProduto(novoProduto) {
    setProdutos((prev) => {
      if (novoProduto.id) {
        return prev.map((p) => (p.id === novoProduto.id ? novoProduto : p));
      }
      const ids = prev.map((p) => p.id);
      const id = ids.length ? Math.max(...ids) + 1 : 1;
      return [...prev, { ...novoProduto, id }];
    });
  }

  function excluirProduto(id) {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  function alternarAtivo(id) {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
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
        salvarProduto,
        excluirProduto,
        alternarAtivo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
