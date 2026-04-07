const express = require('express')
const cors = require('cors')
const path = require('path')
const { loadSecrets } = require('./secrets')
const { createAuthRouter, authMiddleware } = require('./auth')
const wrongAnswersRouter = require('./wrong-answers')

async function main() {
  const secrets = await loadSecrets()
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(authMiddleware(secrets.jwtSecret))

  // API routes
  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.get('/api/config', (req, res) => res.json({ googleClientId: secrets.clientId }))
  app.use('/api/auth', createAuthRouter(secrets))
  app.use('/api/wrong-answers', wrongAnswersRouter)

  // Serve static frontend in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')))
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'))
    })
  }

  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`Server running on port ${port}`))
}

main().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
