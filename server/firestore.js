const { Firestore } = require('@google-cloud/firestore')

const db = new Firestore({ databaseId: 'jlpt-test' })

// Collections
const usersCol = db.collection('users')
const wrongAnswersCol = db.collection('wrong_answers')

// User operations
async function getOrCreateUser(googleId, profile) {
  const doc = usersCol.doc(googleId)
  const snap = await doc.get()
  if (snap.exists) {
    await doc.update({ lastLogin: new Date(), ...profile })
    return { id: googleId, ...snap.data(), ...profile }
  }
  const user = {
    googleId,
    ...profile,
    createdAt: new Date(),
    lastLogin: new Date(),
  }
  await doc.set(user)
  return { id: googleId, ...user }
}

// Wrong answers operations
async function addWrongAnswer(userId, questionData) {
  const docId = `${userId}_${questionData.questionId}_${questionData.examLevel}_${questionData.examTime}`
  const doc = wrongAnswersCol.doc(docId)
  const snap = await doc.get()

  if (snap.exists) {
    await doc.update({
      wrongCount: (snap.data().wrongCount || 1) + 1,
      lastWrongAt: new Date(),
      userAnswer: questionData.userAnswer,
    })
  } else {
    await doc.set({
      userId,
      ...questionData,
      wrongCount: 1,
      createdAt: new Date(),
      lastWrongAt: new Date(),
    })
  }
}

async function removeWrongAnswer(userId, docId) {
  const doc = wrongAnswersCol.doc(docId)
  const snap = await doc.get()
  if (snap.exists && snap.data().userId === userId) {
    await doc.delete()
  }
}

async function getWrongAnswers(userId, { level, type } = {}) {
  let query = wrongAnswersCol.where('userId', '==', userId)
  if (level) query = query.where('examLevel', '==', level)
  if (type) query = query.where('questionType', '==', Number(type))

  const snap = await query.orderBy('lastWrongAt', 'desc').get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Practice history operations
const historyCol = db.collection('practice_history')

async function addPracticeHistory(userId, { examLevel, examTime, questionType, totalQuestions, correctCount }) {
  await historyCol.add({
    userId,
    examLevel,
    examTime,
    questionType,
    totalQuestions,
    correctCount,
    practicedAt: new Date(),
  })
}

async function getPracticeHistory(userId) {
  const snap = await historyCol
    .where('userId', '==', userId)
    .orderBy('practicedAt', 'desc')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function clearPracticeHistory(userId) {
  const snap = await historyCol.where('userId', '==', userId).get()
  const batch = db.batch()
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}

async function deletePracticeHistory(userId, docId) {
  const doc = historyCol.doc(docId)
  const snap = await doc.get()
  if (snap.exists && snap.data().userId === userId) {
    await doc.delete()
  }
}

module.exports = {
  getOrCreateUser,
  addWrongAnswer, removeWrongAnswer, getWrongAnswers,
  addPracticeHistory, getPracticeHistory, clearPracticeHistory, deletePracticeHistory,
}
