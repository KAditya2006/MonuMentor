const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const translate = require('translate-google-api') // fallback or UI translation

// Initialize Gemini if key exists
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

// The "Heritage Specialist" System Prompt
const SYSTEM_PROMPT = `
You are the MonuMentor Heritage Specialist, an expert AI agent with deep knowledge of Indian history, architecture, dynasties (Mughal, Chola, Maratha, etc.), and cultural myths.
- Provide 100% accurate historical facts.
- Explain the significance of architectural styles (Dravidian, Indo-Islamic, etc.).
- Be respectful and professional.
- Use a storytelling tone when possible to make heritage accessible.
- RESPOND DIRECTLY in the language requested by the user. If they selected Hindi, your entire response MUST be in Hindi.
`;

// @route   POST api/chat
// @desc    High-performance Heritage AI Expert (Gemini)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message, lang = 'en-IN' } = req.body
    const targetLangFull = lang || 'en-IN';
    const targetLangCode = targetLangFull.split('-')[0];

    // If API Key is missing, provide a helpful hackathon fallback or error
    if (!genAI || !process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing from .env. Falling back to basics.");
      return res.status(401).json({ 
        response: `The Heritage Expert Engine requires an API Key. Please add 'GEMINI_API_KEY' to your .env file to unlock the best AI knowledge. Current language: ${targetLangFull}`
      });
    }

    // Prepare prompt with language instruction
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${message}\n\nPlease respond in: ${targetLangFull} (Native formatting)`;

    // Generate real AI response
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    res.json({ response: responseText });

  } catch (err) {
    console.error("Gemini AI Error:", err.message);
    res.status(500).json({ response: "The archives are currently unreachable. Please ensure your API Key is valid and try again." })
  }
})

module.exports = router
