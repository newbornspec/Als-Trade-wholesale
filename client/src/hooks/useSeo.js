import { useEffect } from 'react';

// ── Site-wide SEO settings ───────────────────────────────────────────
// Change the site name or base URL here if they ever change.
const SITE_NAME = 'A.L.S Trade';
const BASE_URL  = 'https://www.alswholesale.co.uk';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  if (!href) return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Lightweight per-page SEO for the single-page app.
// Sets the page <title>, meta description, canonical URL, and
// Open Graph / Twitter tags whenever a page mounts.
//
// Usage inside a page component:
//   useSeo({ title: 'Contact Us', description: '…', path: '/contact' });
export default function useSeo({ title, description, path = '' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = `${BASE_URL}${path}`;

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);

    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
  }, [title, description, path]);
}
