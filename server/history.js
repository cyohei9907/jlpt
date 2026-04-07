const express = require('express')
const { requireAuth } = require('./auth')
const { addPracticeHistory, getPracticeHistory, clearPracticeHistory, deletePracticeHistory } = require('./firestore')

const router = express.Router()
router.use(requireAuth)

// Save a practice session
router.post('/', async (req, res) => {
  try {
    const { examLevel, examTime, questionType, totalQuestions, correctCount } = req.body
    await addPracticeHistory(req.user.userId, { examLevel, examTime, questionType, totalQuestions, correctCount })
    res.json({ ok: true })
  } catch (err) {
    console.error('Add history error:', err)
    res.status(500).json({ error: 'Failed to save' })
  }
})

// Get practice history
router.get('/', async (req, res) => {
  try {
    const items = await getPracticeHistory(req.user.userId)
    res.json({ items })
  } catch (err) {
    console.error('Get history error:', err)
    res.status(500).json({ error: 'Failed to fetch' })
  }
})

// Delete single history entry
router.delete('/:id', async (req, res) => {
  try {
    await deletePracticeHistory(req.user.userId, req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete history error:', err)
    res.status(500).json({ error: 'Failed to delete' })
  }
})

// Clear all history
router.delete('/', async (req, res) => {
  try {
    await clearPracticeHistory(req.user.userId)
    res.json({ ok: true })
  } catch (err) {
    console.error('Clear history error:', err)
    res.status(500).json({ error: 'Failed to clear' })
  }
})

module.exports = router
