const express = require('express')
const { requireAuth } = require('./auth')
const { saveAnswers, getAnswers } = require('./firestore')

const router = express.Router()
router.use(requireAuth)

// Save answers for an exam type
router.post('/', async (req, res) => {
  try {
    const { examLevel, examTime, questionType, answers, submitted } = req.body
    await saveAnswers(req.user.userId, { examLevel, examTime, questionType, answers, submitted })
    res.json({ ok: true })
  } catch (err) {
    console.error('Save answers error:', err)
    res.status(500).json({ error: 'Failed to save' })
  }
})

// Get saved answers for an exam
router.get('/:level/:time', async (req, res) => {
  try {
    const data = await getAnswers(req.user.userId, req.params.level, req.params.time)
    res.json({ data })
  } catch (err) {
    console.error('Get answers error:', err)
    res.status(500).json({ error: 'Failed to fetch' })
  }
})

module.exports = router
