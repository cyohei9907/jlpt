const express = require('express')
const { requireAuth } = require('./auth')
const { addWrongAnswer, removeWrongAnswer, getWrongAnswers } = require('./firestore')

const router = express.Router()

// All routes require authentication
router.use(requireAuth)

// Add a wrong answer
router.post('/', async (req, res) => {
  try {
    const { questionId, examLevel, examTime, questionType, userAnswer, correctAnswer, questionData } = req.body
    await addWrongAnswer(req.user.userId, {
      questionId,
      examLevel,
      examTime,
      questionType,
      userAnswer,
      correctAnswer,
      questionData,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('Add wrong answer error:', err)
    res.status(500).json({ error: 'Failed to save' })
  }
})

// Get wrong answers
router.get('/', async (req, res) => {
  try {
    const { level, type } = req.query
    const items = await getWrongAnswers(req.user.userId, { level, type })
    res.json({ items })
  } catch (err) {
    console.error('Get wrong answers error:', err)
    res.status(500).json({ error: 'Failed to fetch' })
  }
})

// Remove a wrong answer
router.delete('/:id', async (req, res) => {
  try {
    await removeWrongAnswer(req.user.userId, req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('Remove wrong answer error:', err)
    res.status(500).json({ error: 'Failed to delete' })
  }
})

module.exports = router
