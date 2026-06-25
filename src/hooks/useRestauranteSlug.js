import { useParams, useLocation } from 'react-router-dom';

export function useRestauranteSlug() {
  const { slug } = useParams();
  const location = useLocation();

  if (slug) return slug;

  const match = location.pathname.match(/^\/([^/]+)/);
  return match ? match[1] : '';
}
