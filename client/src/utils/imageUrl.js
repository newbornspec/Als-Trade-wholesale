/**
 * Returns the correct URL for a batch image.
 *
 * In development, Vite proxies /uploads → als-trade-wholesale-production.up.railway.app,
 * so relative paths like /uploads/batches/RT3426-xxx.jpg work fine.
 *
 * In production, the frontend is on a different domain from the API,
 * so we prepend the full API origin (VITE_API_URL without the /api suffix).
 */
const API_ORIGIN = (() => {
  const base = import.meta.env.VITE_API_URL || 'http://als-trade-wholesale-production.up.railway.app/api';
  // Strip the trailing /api to get the origin only
  return base.replace(/\/api\/?$/, '');
})();

const IS_DEV = import.meta.env.DEV;

export function getImageUrl(path) {
  if (!path) return null;

  // Already a full URL (http/https) — return as-is
  if (path.startsWith('http')) return path;

  // In dev: Vite proxy handles /uploads, so just use the relative path
  if (IS_DEV) return path;

  // In production: prepend the API origin
  return `${API_ORIGIN}${path}`;
}
