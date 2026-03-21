const mongoose = require('mongoose')

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  category: { type: String, required: true },
  timeTakenMs: { type: Number }
}, { timestamps: true })

module.exports = mongoose.model('QuizResult', quizResultSchema)
