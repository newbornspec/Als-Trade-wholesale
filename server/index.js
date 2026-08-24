const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

dotenv.config()

// Railway is provisioned with MONGODB_URI, everything else uses MONGO_URI.
// Accept either so the API connects wherever it runs.
const mongoUri = () => process.env.MONGO_URI || process.env.MONGODB_URI

console.log('Mongo URI loaded:', mongoUri() ? 'YES' : 'MISSING')

// A missing key used to crash the API on boot, which at least made it obvious.
// It degrades quietly now, so say so loudly here instead.
if (!process.env.RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY is not set — contact enquiries will save but send no email')
}

const app = express()
app.set('trust proxy', 1) 
// ... rest stays the same
// ── Global Middleware ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://als-trade-wholesale.vercel.app',
  'https://alswholesale.co.uk',
  'https://www.alswholesale.co.uk',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  // The site is served from a different origin to this API, so a custom
  // header stays invisible to browser JS unless it is named here.
  exposedHeaders: ['X-Total-Count'],
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/uploads', express.static('uploads'))

// ── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again in 15 minutes.' },
})
app.use('/api/users/login',    authLimiter)
app.use('/api/users/register', authLimiter)

// ── MongoDB ────────────────────────────────────────────────────────────────
mongoose.connect(mongoUri())
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err))

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/users',   require('./routes/userRoutes'))
app.use('/api/batches', require('./routes/batchRoutes'))
app.use('/api/contact', require('./routes/contactRoutes'))
app.use('/api/admin',   require('./routes/adminRoutes'))

// Dynamic sitemap. Served at the site root via a Vercel rewrite so the URL is
// https://www.alswholesale.co.uk/sitemap.xml (matching robots.txt).
app.get('/sitemap.xml', require('./controllers/sitemapController').getSitemap)

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', env: process.env.NODE_ENV, time: new Date() })
})

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'
  if (process.env.NODE_ENV === 'development') console.error(err.stack)
  res.status(status).json({ message })
})

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n A.L.S Trade  API running`)
  console.log(` http://localhost:${PORT}`)
  console.log(` Mode: ${process.env.NODE_ENV}\n`)
})