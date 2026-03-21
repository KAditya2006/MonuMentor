const mongoose = require('mongoose')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config()

const QuizQuestion = require('./models/QuizQuestion')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

async function importQuizData (filePath) {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB. Preparing to import quiz questions...')

    const parsedQuestions = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          // Columns: QuestionID,Category,Question,OptionA,OptionB,OptionC,OptionD,Answer
          if (!data.Question || data.Question.trim() === '') return

          const optA = data.OptionA ? data.OptionA.trim() : ''
          const optB = data.OptionB ? data.OptionB.trim() : ''
          const optC = data.OptionC ? data.OptionC.trim() : ''
          const optD = data.OptionD ? data.OptionD.trim() : ''

          const options = [optA, optB, optC, optD].filter(o => o !== '')
          if (options.length === 0) return

          const answerStr = data.Answer ? data.Answer.trim() : ''
          let correctIndex = options.findIndex(opt => opt === answerStr)

          // Fallback if the answer doesn't perfectly match any string
          if (correctIndex === -1 && options.length > 0) {
            const possibleIdx = options.findIndex(opt => opt.includes(answerStr) || answerStr.includes(opt))
            correctIndex = possibleIdx !== -1 ? possibleIdx : 0
          }

          parsedQuestions.push({
            question: data.Question.trim(),
            options,
            correctAnswerIndex: correctIndex,
            category: data.Category ? data.Category.trim() : 'General',
            difficulty: 'medium' // default
          })
        } catch (e) {
          console.error('Error processing a row:', e)
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${parsedQuestions.length} valid questions from CSV!`)
        console.log('Inserting into database safely...')

        try {
          await QuizQuestion.insertMany(parsedQuestions)
          console.log('Successfully saved to database! Your new questions are now live.')
        } catch (err) {
          console.error('DB Insert Error:', err)
        }
        process.exit()
      })
  } catch (err) {
    console.error('Error connecting to DB:', err)
    process.exit(1)
  }
}

const filePath = '../user_quiz_dataset.csv'
importQuizData(filePath)
