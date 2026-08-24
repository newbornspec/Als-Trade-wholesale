const Batch = require('../models/Batch');

const BASE = 'https://www.alswholesale.co.uk';

// Static, hand-known routes and how often they change.
const STATIC_ROUTES = [
  { path: '/',                changefreq: 'daily',   priority: '1.0' },
  { path: '/available-stock', changefreq: 'daily',   priority: '0.9' },
  { path: '/how-it-works',    changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',         changefreq: 'monthly', priority: '0.7' },
  { path: '/sold-stock',      changefreq: 'weekly',  priority: '0.6' },
  { path: '/about-us',        changefreq: 'monthly', priority: '0.6' },
];

const iso = (d) => (d ? new Date(d) : new Date()).toISOString().slice(0, 10);
const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

const urlNode = (loc, lastmod, changefreq, priority) =>
  `  <url><loc>${xmlEscape(loc)}</loc>` +
  (lastmod ? `<lastmod>${lastmod}</lastmod>` : '') +
  (changefreq ? `<changefreq>${changefreq}</changefreq>` : '') +
  (priority ? `<priority>${priority}</priority>` : '') +
  `</url>`;

// GET /sitemap.xml — the static marketing routes plus one entry per available
// batch product page, with lastmod drawn from the batch's real timestamps.
// Vercel proxies /sitemap.xml here (see client/vercel.json).
const getSitemap = async (req, res) => {
  try {
    const batches = await Batch.find({ status: 'available' })
      .select('slug updatedAt createdAt')
      .sort('-createdAt')
      .lean();

    const staticNewest = batches[0] ? iso(batches[0].updatedAt || batches[0].createdAt) : iso();

    const urls = [
      // The stock index changes whenever any batch does.
      ...STATIC_ROUTES.map((r) =>
        urlNode(`${BASE}${r.path}`, r.path === '/available-stock' ? staticNewest : undefined, r.changefreq, r.priority)),
      ...batches.map((b) =>
        urlNode(`${BASE}/available-stock/${b.slug}`, iso(b.updatedAt || b.createdAt), 'weekly', '0.8')),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.join('\n') + `\n</urlset>\n`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSitemap };
