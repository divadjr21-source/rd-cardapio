import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRestauranteSlug } from './useRestauranteSlug';

function extrairParametroMesa(rawSearch) {
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
  const slug = useRestauranteSlug();
  const [numeroMesa, setNumeroMesa] = useState(null);
  const chaveMesa = slug ? `cardapio_mesa_${slug}` : null;

  useEffect(() => {
    if (!chaveMesa) {
      setNumeroMesa(null);
      return;
    }

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
  }, [search, chaveMesa]);

  return numeroMesa;
}

export function limparMesaSalva(slug) {
  if (!slug) return;
  localStorage.removeItem(`cardapio_mesa_${slug}`);
}
