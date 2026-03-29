const express = require('express')
const router = express.Router()
const User = require('../models/User')
const QuizResult = require('../models/QuizResult')
const auth = require('../middleware/auth')

// @route   POST api/user/favorite
// @desc    Add or remove favorite monument
// @access  Private
router.post('/favorite', auth, async (req, res) => {
  try {
    const { monumentId } = req.body
    const user = await User.findById(req.user.id)

    const index = user.favoriteMonuments.indexOf(monumentId)
    if (index === -1) {
      user.favoriteMonuments.push(monumentId)
    } else {
      user.favoriteMonuments.splice(index, 1)
    }

    await user.save()
    res.json(user.favoriteMonuments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route   POST api/user/visit
// @desc    Mark monument as visited
// @access  Private
router.post('/visit', auth, async (req, res) => {
  try {
    const { monumentId } = req.body
    const user = await User.findById(req.user.id)

    if (!user.visitedMonuments.includes(monumentId)) {
      user.visitedMonuments.push(monumentId)
      await user.save()
    }

    res.json(user.visitedMonuments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route   GET api/user/dashboard
// @desc    Get user dashboard stats
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favoriteMonuments')
      .populate('visitedMonuments')
      .select('-password')
    
    // Fetch last 6 quiz results for the user
    const quizHistory = await QuizResult.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(6)

    res.json({ ...user.toObject(), quizHistory })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
