const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

// @route   POST api/auth/register
// @desc    Register user (Instant JWT Grant)
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!email || !password || !username) {
     return res.status(400).json({ msg: 'Please provide username, email, and password.' })
  }

  try {
    // Check database connectivity
    if (!User.collection.conn.readyState) {
      return res.status(503).json({ 
        msg: 'Database is not connected',
        details: 'Please ensure MongoDB is running'
      })
    }

    let user = await User.findOne({ $or: [{ email }, { username }] })
    if (user) {
      return res.status(400).json({ msg: 'User already exists' })
    }

    user = new User({
      username,
      email,
      password
    })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

    const payload = { user: { id: user.id, role: user.role } }

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err
        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } })
      }
    )
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ msg: 'We are currently refining our explorer registry. Please try your request again shortly.' })
  }
})


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Check database connectivity
    if (!User.collection.conn.readyState) {
      return res.status(503).json({ 
        msg: 'Database is not connected',
        details: 'Please ensure MongoDB is running'
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' })
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
      }
    )
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ msg: 'We are currently refining our explorer registry. Please try your request again shortly.' })
  }
})

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error('Auth check error:', err)
    res.status(500).json({ msg: 'Heritage verification in progress. Please wait.' })
  }
})

module.exports = router
