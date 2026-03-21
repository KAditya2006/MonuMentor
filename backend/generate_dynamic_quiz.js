const mongoose = require('mongoose')
require('dotenv').config()

const Monument = require('./models/Monument')
const QuizQuestion = require('./models/QuizQuestion')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

function shuffle (array) {
  let currentIndex = array.length; let randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

function getRandomElements (arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, num)
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Generating quiz questions based on the LIVE monument database...')

    const monuments = await Monument.find({})
    console.log(`Found ${monuments.length} monuments.`)

    // Generate unique sets
    const allStates = [...new Set(monuments.map(m => m.state))]
    const allCategories = [...new Set(monuments.map(m => m.category))]

    const questions = []

    // For every monument, generate 1-2 unique tracking questions
    for (const mon of monuments) {
      // Question Type 1: State Location
      const wrongStates = getRandomElements(allStates.filter(s => s !== mon.state), 3)
      const q1Options = shuffle([mon.state, ...wrongStates])
      const q1Correct = q1Options.indexOf(mon.state)

      questions.push({
        question: `Which Indian State or Union Territory is ${mon.name} located in?`,
        options: q1Options,
        correctAnswerIndex: q1Correct,
        category: 'Geography',
        difficulty: 'medium',
        monumentId: mon._id
      })

      // Question Type 2: Category Identification (Only for non-generic names)
      if (mon.category !== 'Monuments' && !mon.name.includes(mon.category.substring(0, mon.category.length - 1))) {
        const wrongCats = getRandomElements(allCategories.filter(c => c !== mon.category), 3)
        const q2Options = shuffle([mon.category, ...wrongCats])
        const q2Correct = q2Options.indexOf(mon.category)

        questions.push({
          question: `Based on its architectural and historical significance, what category does ${mon.name} belong to?`,
          options: q2Options,
          correctAnswerIndex: q2Correct,
          category: 'Architecture',
          difficulty: 'easy',
          monumentId: mon._id
        })
      }
    }

    // Add "Reverse" state questions (Which of these is in X state?)
    for (const state of allStates) {
      const stateMons = monuments.filter(m => m.state === state)
      if (stateMons.length === 0) continue

      const correctMon = getRandomElements(stateMons, 1)[0]
      const otherMons = getRandomElements(monuments.filter(m => m.state !== state), 3)

      const q3Options = shuffle([correctMon.name, ...otherMons.map(m => m.name)])
      const q3Correct = q3Options.indexOf(correctMon.name)

      questions.push({
        question: `Which of the following famous monuments is physically located in ${state}?`,
        options: q3Options,
        correctAnswerIndex: q3Correct,
        category: 'Geography',
        difficulty: 'hard',
        monumentId: correctMon._id
      })
    }

    console.log(`Generated ${questions.length} massive, unique questions from the dataset!`)
    console.log('Wiping old hardcoded quiz DB...')
    await QuizQuestion.deleteMany({})

    console.log(`Inserting ${questions.length} questions...`)
    await QuizQuestion.insertMany(questions)

    console.log('Successfully completed dynamic quiz database generation!')
    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
