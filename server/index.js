const express = require('express')
const cors = require('cors')
const path = require('path')
const { loadSecrets } = require('./secrets')
const { createAuthRouter, authMiddleware } = require('./auth')
const wrongAnswersRouter = require('./wrong-answers')

const app = express()
let secrets = null

app.use(cors())
app.use(express.json())

// JWT auth middleware - skip if secrets not loaded yet
app.use((req, res, next) => {
  if (!secrets) return next()
  authMiddleware(secrets.jwtSecret)(req, res, next)
})

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true, ready: !!secrets }))

app.get('/api/config', (req, res) => {
  if (!secrets) return res.status(503).json({ error: 'Initializing' })
  res.json({ googleClientId: secrets.clientId })
})

let authRouter = null
app.use('/api/auth', (req, res, next) => {
  if (!secrets) return res.status(503).json({ error: 'Initializing' })
  if (!authRouter) authRouter = createAuthRouter(secrets)
  authRouter(req, res, next)
})

app.use('/api/wrong-answers', wrongAnswersRouter)

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Start server immediately, load secrets async
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
  loadSecrets()
    .then(s => {
      secrets = s
      console.log('Secrets loaded successfully')
    })
    .catch(err => {
      console.error('Failed to load secrets:', err.message)
    })
})
