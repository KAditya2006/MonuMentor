const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../frontend')))

// MongoDB Connection with Retry Logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'
const MAX_RETRIES = 5
const RETRY_DELAY = 3000 // 3 seconds

let isDbConnected = false

const connectToDatabase = async (attempt = 1) => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    isDbConnected = true
    console.log('✅ Connected to MongoDB')
    return true
  } catch (err) {
    console.error(`❌ MongoDB connection error (Attempt ${attempt}/${MAX_RETRIES}):`, err.message)
    
    if (attempt < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return connectToDatabase(attempt + 1)
    } else {
      console.error('❌ Failed to connect to MongoDB after', MAX_RETRIES, 'attempts')
      return false
    }
  }
}

// Middleware to check database connection
app.use((req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({ 
      msg: 'We are currently optimizing our heritage records for a smoother experience. Please try again briefly.'
    })
  }
  next()
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/monuments', require('./routes/monuments'))
app.use('/api/quiz', require('./routes/quiz'))
app.use('/api/user', require('./routes/user'))
app.use('/api/chat', require('./routes/chat'))
app.get('/explore', (req, res) => res.sendFile(path.join(__dirname, '../frontend/explore.html')))
app.get('/monument', (req, res) => res.sendFile(path.join(__dirname, '../frontend/monument.html')))
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, '../frontend/quiz.html')))
app.get('/chatbot', (req, res) => res.sendFile(path.join(__dirname, '../frontend/chatbot.html')))
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dashboard.html')))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: isDbConnected ? 'healthy' : 'unhealthy',
    database: isDbConnected ? 'connected' : 'disconnected'
  })
})

// Catch-all route for SPA logic and 404s
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

// Start server after MongoDB connection succeeds
const startServer = async () => {
  const connected = await connectToDatabase()
  if (connected) {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      // Open the browser only in development mode
      if (process.env.NODE_ENV !== 'production') {
        const { exec } = require('child_process');
        const url = `http://localhost:${PORT}`;
        const command = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
        exec(command);
      }
    })
  } else {
    console.error('⚠️ Server starting without database connection.')
    console.error('📝 To fix this:')
    console.error('1. Install MongoDB: https://www.mongodb.com/try/download/community')
    console.error('2. Start MongoDB: mongod')
    console.error('3. OR use MongoDB Atlas: https://www.mongodb.com/cloud/atlas')
    console.error('4. Set MONGODB_URI in .env file if using Atlas')
    process.exit(1)
  }
}

startServer()
