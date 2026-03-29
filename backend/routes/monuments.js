const express = require('express')
const router = express.Router()
const Monument = require('../models/Monument')
const auth = require('../middleware/auth')

// @route   GET api/monuments
// @desc    Get all monuments (with optional filtering and search)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { state, category, search } = req.query
    const query = {}

    if (state) {
      query.state = state
    }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { architectureStyle: { $regex: search, $options: 'i' } }
      ]
    }

    const monuments = await Monument.find(query)
    res.json(monuments)
  } catch (err) {
    console.error('Monument Feature Error:', err)
    res.status(500).json({ msg: 'We are currently optimizing our heritage database for a smoother experience. Please refresh in a moment.' })
  }
})

// @route   GET api/monuments/:id
// @desc    Get monument by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const monument = await Monument.findById(req.params.id)
    if (!monument) {
      return res.status(404).json({ msg: 'Monument not found' })
    }
    res.json(monument)
  } catch (err) {
    console.error('Monument Details Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(444).json({ msg: 'We could not locate this monument in our ancient scrolls.' })
    }
    res.status(500).json({ msg: 'Our archives are momentarily unavailable as we update specific site details.' })
  }
})

// @route   POST api/monuments
// @desc    Add a monument
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  // Assuming basic auth for hackathon, add role check later if needed
  try {
    const newMonument = new Monument(req.body)
    const monument = await newMonument.save()
    res.json(monument)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
