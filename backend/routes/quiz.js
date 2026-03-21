const express = require('express')
const router = express.Router()
const QuizQuestion = require('../models/QuizQuestion')
const QuizResult = require('../models/QuizResult')
const User = require('../models/User')
const auth = require('../middleware/auth')

// @route   GET api/quiz
// @desc    Get quiz questions by category
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query
    const query = category ? { category } : {}

    // Get random questions
    const questions = await QuizQuestion.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } }
    ])
    res.json(questions)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route   POST api/quiz/submit
// @desc    Submit quiz result and update user score
// @access  Private
router.post('/submit', auth, async (req, res) => {
  try {
    const { score, totalQuestions, category, timeTakenMs } = req.body

    const newResult = new QuizResult({
      user: req.user.id,
      score,
      totalQuestions,
      category,
      timeTakenMs
    })

    await newResult.save()

    // Update user's total score
    const user = await User.findById(req.user.id)
    user.totalQuizScore += score
    await user.save()

    res.json({ result: newResult, newTotalScore: user.totalQuizScore })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
