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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

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

// Catch-all route for SPA logic and 404s
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  const { exec } = require('child_process')
  const url = `http://localhost:${PORT}`
  const command = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`
  exec(command)
})
