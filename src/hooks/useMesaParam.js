import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const chaveMesa = 'cardapio_mesa';

function extrairParametroMesa(rawSearch) {
  // HashRouter guarda search em location.search
  let params = new URLSearchParams(rawSearch || '');
  let mesa = (params.get('mesa') || '').trim();

  if (!mesa && window.location.hash.includes('?')) {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    mesa = (hashParams.get('mesa') || '').trim();
  }

  return /^\d+$/.test(mesa) ? mesa : null;
}

export function useMesaParam() {
  const { search } = useLocation();
  const [numeroMesa, setNumeroMesa] = useState(null);

  useEffect(() => {
    const mesa = extrairParametroMesa(search);

    if (mesa) {
      localStorage.setItem(chaveMesa, mesa);
      setNumeroMesa(mesa);
    } else {
      const salva = localStorage.getItem(chaveMesa);
      if (salva && /^\d+$/.test(salva)) {
        setNumeroMesa(salva);
      } else {
        setNumeroMesa(null);
      }
    }
  }, [search]);

  return numeroMesa;
}

export function limparMesaSalva() {
  localStorage.removeItem(chaveMesa);
}
