const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
let secrets = null
let authRouter = null

app.use(cors())
app.use(express.json())

// JWT auth middleware - skip if secrets not loaded yet
app.use((req, res, next) => {
  if (!secrets) return next()
  const { authMiddleware } = require('./auth')
  authMiddleware(secrets.jwtSecret)(req, res, next)
})

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true, ready: !!secrets }))

app.get('/api/config', (req, res) => {
  if (!secrets) return res.status(503).json({ error: 'Initializing' })
  res.json({ googleClientId: secrets.clientId })
})

app.use('/api/auth', (req, res, next) => {
  if (!secrets) return res.status(503).json({ error: 'Initializing' })
  const { createAuthRouter } = require('./auth')
  if (!authRouter) authRouter = createAuthRouter(secrets)
  authRouter(req, res, next)
})

app.use('/api/wrong-answers', require('./wrong-answers'))
app.use('/api/history', require('./history'))
app.use('/api/answers', require('./answers'))

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Start server immediately on 0.0.0.0
const port = parseInt(process.env.PORT, 10) || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`)

  // Load secrets async after server is up
  const { loadSecrets } = require('./secrets')
  loadSecrets()
    .then(s => {
      secrets = s
      console.log('Secrets loaded successfully')
    })
    .catch(err => {
      console.error('Failed to load secrets:', err.message)
    })
})
