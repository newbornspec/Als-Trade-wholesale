import { useEffect } from 'react';

// ── Site-wide SEO settings ───────────────────────────────────────────
// Change the site name or base URL here if they ever change.
const SITE_NAME = 'A.L.S Trade';
const BASE_URL  = 'https://www.alswholesale.co.uk';
// Fallback share image, used whenever a page does not supply its own.
const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.png`;

// Make a possibly-relative image path absolute — social scrapers require
// fully-qualified og:image URLs.
const absolute = (src) => {
  if (!src) return DEFAULT_OG_IMAGE;
  if (src.startsWith('http')) return src;
  return `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content == null || content === '') {
    if (el) el.remove();
    return;
  }
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
// Sets the page <title>, meta description, canonical URL, robots directive,
// and Open Graph / Twitter tags whenever a page mounts.
//
// Usage inside a page component:
//   useSeo({ title: 'Contact Us', description: '…', path: '/contact' });
//   useSeo({ title, description, path, ogImage, ogType: 'product' });
//   useSeo({ title: 'Sign in', path: '/sign-in', noIndex: true });
//
// NOTE: these tags are applied client-side, so JS-rendering crawlers
// (Googlebot) see them but non-JS social scrapers do not — they read the
// static tags in index.html. Per-URL crawler HTML needs prerendering/SSR.
export default function useSeo({
  title,
  description,
  path = '',
  ogImage,
  ogType = 'website',
  noIndex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url   = `${BASE_URL}${path}`;
    const image = absolute(ogImage);

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);

    // Always set robots explicitly so a noindex page cannot leave its
    // directive behind for the next page the SPA renders.
    upsertMeta('name', 'robots', noIndex ? 'noindex, follow' : 'index, follow');

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
  }, [title, description, path, ogImage, ogType, noIndex]);
}
