const express = require('express')
const { OAuth2Client } = require('google-auth-library')
const jwt = require('jsonwebtoken')
const { getOrCreateUser } = require('./firestore')

function createAuthRouter(secrets) {
  const router = express.Router()
  const oauth2Client = new OAuth2Client(
    secrets.clientId,
    secrets.clientSecret,
  )

  // Verify Google ID token (from frontend Sign-In)
  router.post('/google', async (req, res) => {
    try {
      const { credential } = req.body
      if (!credential) return res.status(400).json({ error: 'Missing credential' })

      const ticket = await oauth2Client.verifyIdToken({
        idToken: credential,
        audience: secrets.clientId,
      })
      const payload = ticket.getPayload()

      const user = await getOrCreateUser(payload.sub, {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      })

      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, picture: user.picture },
        secrets.jwtSecret,
        { expiresIn: '7d' },
      )

      res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } })
    } catch (err) {
      console.error('Auth error:', err)
      res.status(401).json({ error: 'Authentication failed' })
    }
  })

  // Get current user
  router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    res.json({ user: req.user })
  })

  return router
}

// JWT middleware
function authMiddleware(jwtSecret) {
  return (req, res, next) => {
    const auth = req.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        req.user = jwt.verify(auth.slice(7), jwtSecret)
      } catch {
        req.user = null
      }
    }
    next()
  }
}

// Require auth middleware
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Login required' })
  next()
}

module.exports = { createAuthRouter, authMiddleware, requireAuth }
