const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { dispatchDualChannelOTP } = require('../utils/sendOTP')

// @route   POST api/auth/register
// @desc    Register user (Sets isVerified=false and Dispatches OTP)
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, mobile, password } = req.body

  if (!mobile || !email || !password || !username) {
     return res.status(400).json({ msg: 'Please provide username, email, mobile, and password.' })
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { username }, { mobile }] })
    if (user) {
      if (!user.isVerified && user.email === email) {
         // Resend OTP if user registered but didn't verify
         const otp = Math.floor(100000 + Math.random() * 900000).toString()
         user.otp = otp;
         await user.save()
         await dispatchDualChannelOTP(email, mobile, otp)
         return res.status(200).json({ msg: 'OTP Resent. Account pending verification.', pending: true })
      }
      return res.status(400).json({ msg: 'User already exists' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    user = new User({
      username,
      email,
      mobile,
      password,
      isVerified: false,
      otp: otp
    })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()
    await dispatchDualChannelOTP(email, mobile, otp)

    res.status(200).json({ msg: 'Registration secured. OTP dispatched to email and mobile.', pending: true })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ msg: err.message || 'Server error' })
  }
})

// @route   POST api/auth/verify-otp
// @desc    Verify Dual-Channel OTP & Grant JWT Token
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'User not found' })
    
    if (user.isVerified) return res.status(400).json({ msg: 'User already verified. Please login.' })
    
    if (user.otp !== otp) return res.status(400).json({ msg: 'Invalid Verification Code' })

    // Success! Verify user and clear OTP
    user.isVerified = true
    user.otp = null
    await user.save()

    const payload = { user: { id: user.id, role: user.role } }

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
      }
    )
  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' })
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Account not verified. Please complete OTP verification.' })
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
    console.error(err.message)
    res.status(500).json({ msg: err.message || 'Server error' })
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
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
