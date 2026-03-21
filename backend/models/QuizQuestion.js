const mongoose = require('mongoose')

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  category: { type: String, required: true }, // Monuments, Indian History, Culture, Architecture
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  monumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monument' } // Optional link to specific monument
}, { timestamps: true })

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema)
