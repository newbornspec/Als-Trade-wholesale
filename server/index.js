import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createRequire } from 'module'

dotenv.config()

const require = createRequire(import.meta.url)
const app = express()

// ── Global Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://als-trade-wholesale.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}))

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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err))

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/users',   require('./routes/userRoutes'))
app.use('/api/batches', require('./routes/batchRoutes'))
app.use('/api/contact', require('./routes/contactRoutes'))
app.use('/api/admin',   require('./routes/adminRoutes'))

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