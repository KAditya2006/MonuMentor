const express = require('express')
const router = express.Router()

// Mock LLM API for Hackathon
const getMockResponse = (message) => {
  const lowerMsg = message.toLowerCase()
  if (lowerMsg.includes('taj mahal')) {
    return 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, Uttar Pradesh, India. It was commissioned in 1631 by the Mughal emperor Shah Jahan.'
  }
  if (lowerMsg.includes('hawa mahal')) {
    return 'Hawa Mahal is a palace in Jaipur, India. Made with the red and pink sandstone, the palace sits on the edge of the City Palace, Jaipur.'
  }
  return 'I am the AI Heritage Assistant. I can tell you about Indian monuments. How can I help you?'
}

// @route   POST api/chat
// @desc    Chat with AI Assistant
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message } = req.body

    // Simulate API latency
    setTimeout(() => {
      const responseText = getMockResponse(message)
      res.json({ response: responseText })
    }, 1000)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
