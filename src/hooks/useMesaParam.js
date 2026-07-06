import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const chaveMesa = 'cardapio_mesa';

function buscarParametroMesa(search) {
  const params = new URLSearchParams(search.replace(/^#/, '').replace(/^.*\?/, '?'));
  const mesa = params.get('mesa');
  return mesa && /^\d+$/.test(mesa) ? mesa : null;
}

export function useMesaParam() {
  const { search, pathname } = useLocation();
  const [numeroMesa, setNumeroMesa] = useState(null);

  useEffect(() => {
    // 1. tenta ler da URL (HashRouter inclui search em location.search)
    let mesa = buscarParametroMesa(search);

    // 2. se nao houver, tenta do hash
    if (!mesa) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, '').split('?')[1] || '');
      const mesaHash = hashParams.get('mesa');
      if (mesaHash && /^\d+$/.test(mesaHash)) mesa = mesaHash;
    }

    // 3. fallback: localStorage (manter mesa ao navegar entre telas)
    if (mesa) {
      localStorage.setItem(chaveMesa, mesa);
    } else {
      const salva = localStorage.getItem(chaveMesa);
      if (salva && /^\d+$/.test(salva)) mesa = salva;
    }

    // 4. limpa localStorage se estiver saindo da pagina do restaurante (opcional)
    // Nao limpamos aqui para manter enquanto o cliente navega no cardapio

    setNumeroMesa(mesa);
  }, [search, pathname]);

  return numeroMesa;
}

export function limparMesaSalva() {
  localStorage.removeItem(chaveMesa);
}
