const Batch = require('../models/Batch');

// ── Crawler HTML ────────────────────────────────────────────────────────────
// The site is a client-rendered SPA, so its per-page metadata is written by
// JavaScript. Social scrapers do not run JavaScript, so a shared batch link
// previewed as the generic homepage. Vercel routes known scraper user-agents
// here (see client/vercel.json) and this returns the same page as real HTML.
//
// The content served here mirrors what the SPA renders for the same URL — it
// is the same title, description and image, just produced server-side.

const SITE      = 'https://www.alswholesale.co.uk';
const SITE_NAME = 'A.L.S Trade';
const DEFAULT_IMAGE = `${SITE}/logo.png`;

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Mirrors the useSeo() calls in the client pages.
const STATIC_PAGES = {
  '/': {
    title: 'Bulk IT Hardware Wholesale UK',
    description: 'A.L.S Trade supplies bulk and refurbished IT hardware to registered businesses worldwide at genuine trade prices. Browse available stock.',
  },
  '/available-stock': {
    title: 'Available Wholesale IT Hardware Stock',
    description: 'Browse current batches of wholesale and refurbished IT hardware — laptops, computers and monitors — available to trade buyers. New stock added regularly.',
  },
  '/sold-stock': {
    title: 'Recently Sold Wholesale IT Stock',
    description: 'Recently sold batches of wholesale IT hardware — a snapshot of the laptops, computers and monitors A.L.S Trade moves for trade buyers.',
  },
  '/how-it-works': {
    title: 'How It Works',
    description: 'See how buying wholesale IT hardware from A.L.S Trade works, from enquiry to delivery, for registered businesses.',
  },
  '/about-us': {
    title: 'About Us',
    description: 'A.L.S Trade is a UK-based wholesaler of bulk IT hardware, trading with registered businesses worldwide from Birmingham.',
  },
  '/contact': {
    title: 'Contact Us',
    description: 'Get in touch with A.L.S Trade for wholesale IT hardware enquiries by phone, email, or WhatsApp.',
  },
};

const buildHtml = ({ title, description, canonical, image, ogType = 'website', jsonLd, heading, bodyText }) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${esc(canonical)}"/>
<meta name="robots" content="index, follow"/>
<meta property="og:title" content="${esc(fullTitle)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:type" content="${esc(ogType)}"/>
<meta property="og:site_name" content="${esc(SITE_NAME)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(fullTitle)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${esc(image)}"/>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<main>
<h1>${esc(heading || title)}</h1>
<p>${esc(bodyText || description)}</p>
<p><a href="${esc(canonical)}">View on ${esc(SITE_NAME)}</a></p>
</main>
</body>
</html>
`;
};

// GET /prerender and /prerender/*  — path taken from the URL after /prerender
const getPrerender = async (req, res) => {
  try {
    // req.path is '/' for the bare route, or '/available-stock/some-slug'
    const path = ('/' + (req.params[0] || '')).replace(/\/+$/, '') || '/';

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300');
    // Never let a proxy serve this HTML to a human.
    res.set('Vary', 'User-Agent');

    // ── Batch product page ──
    const batchMatch = path.match(/^\/available-stock\/([a-z0-9-]+)$/);
    if (batchMatch) {
      const batch = await Batch.findOne({ slug: batchMatch[1] })
        .select('slug title batchNumber category brand quantity description specs images status grade tested')
        .lean();

      if (!batch) {
        return res.status(404).send(buildHtml({
          title: 'Batch not found',
          description: 'This batch may have been sold or removed.',
          canonical: `${SITE}/available-stock`,
          image: DEFAULT_IMAGE,
        }));
      }

      const canonical = `${SITE}/available-stock/${batch.slug}`;
      const image = batch.images?.[0] || DEFAULT_IMAGE;
      const description = (batch.description || batch.specs
        || `Wholesale ${batch.category} — batch ${batch.batchNumber}, ${batch.quantity} units, at trade prices.`).slice(0, 160);

      // Same shape the client emits: availability and condition, never the
      // login-gated price.
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: batch.title,
        sku: batch.batchNumber,
        category: batch.category,
        description,
        itemCondition: batch.tested && batch.grade && batch.grade !== 'mixed'
          ? 'https://schema.org/RefurbishedCondition'
          : 'https://schema.org/UsedCondition',
        ...(batch.brand ? { brand: { '@type': 'Brand', name: batch.brand } } : {}),
        image,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'GBP',
          availability: batch.status === 'sold'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
          url: canonical,
        },
      };

      return res.send(buildHtml({
        title: `${batch.title} — Batch ${batch.batchNumber}`,
        description,
        canonical,
        image,
        ogType: 'product',
        jsonLd,
        heading: batch.title,
        bodyText: `${description} Batch ${batch.batchNumber} · ${batch.quantity} units.`,
      }));
    }

    // ── Known static page ──
    const page = STATIC_PAGES[path];
    if (page) {
      return res.send(buildHtml({
        ...page,
        canonical: `${SITE}${path === '/' ? '/' : path}`,
        image: DEFAULT_IMAGE,
      }));
    }

    // ── Anything else: describe the site rather than 404 a scraper ──
    return res.send(buildHtml({
      ...STATIC_PAGES['/'],
      canonical: `${SITE}/`,
      image: DEFAULT_IMAGE,
    }));
  } catch (err) {
    console.error('Prerender error:', err.message);
    res.status(500).send(buildHtml({
      title: SITE_NAME,
      description: 'Bulk and refurbished IT hardware for registered businesses, at trade prices.',
      canonical: `${SITE}/`,
      image: DEFAULT_IMAGE,
    }));
  }
};

module.exports = { getPrerender };
