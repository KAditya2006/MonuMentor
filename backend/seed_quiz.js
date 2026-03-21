const mongoose = require('mongoose')
require('dotenv').config()

const QuizQuestion = require('./models/QuizQuestion')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

const questions = [
  {
    question: 'Which Indian monument was built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal?',
    options: ['Red Fort', 'Qutub Minar', 'Taj Mahal', 'Fatehpur Sikri'],
    correctAnswerIndex: 2,
    category: 'Monuments',
    difficulty: 'easy'
  },
  {
    question: 'The Brihadeeswarar Temple, a UNESCO World Heritage Site, is an outstanding example of which architectural style?',
    options: ['Nagara', 'Dravidian', 'Vesara', 'Kalinga'],
    correctAnswerIndex: 1,
    category: 'Architecture',
    difficulty: 'medium'
  },
  {
    question: 'Which is the oldest surviving rock-cut cave in India, dating back to the Mauryan Empire?',
    options: ['Ajanta Caves', 'Ellora Caves', 'Elephanta Caves', 'Barabar Caves'],
    correctAnswerIndex: 3,
    category: 'Monuments',
    difficulty: 'hard'
  },
  {
    question: "Hawa Mahal, also known as the 'Palace of Winds', is located in which city?",
    options: ['Udaipur', 'Jodhpur', 'Jaipur', 'Bikaner'],
    correctAnswerIndex: 2,
    category: 'Monuments',
    difficulty: 'easy'
  },
  {
    question: "Which Indian fort is known as the 'Golden Fort' or 'Sonar Quila' because of its yellow sandstone architecture?",
    options: ['Agra Fort', 'Gwalior Fort', 'Jaisalmer Fort', 'Amber Fort'],
    correctAnswerIndex: 2,
    category: 'Architecture',
    difficulty: 'medium'
  },
  {
    question: 'Sanchi Stupa, one of the oldest stone structures in India, was originally commissioned by which ruler?',
    options: ['Chandragupta Maurya', 'Ashoka', 'Harshavardhana', 'Kanishka'],
    correctAnswerIndex: 1,
    category: 'Indian History',
    difficulty: 'medium'
  },
  {
    question: 'The famous Konark Sun Temple in Odisha is designed in the shape of a colossal:',
    options: ['Lotus', 'Chariot', 'Elephant', 'Mountain'],
    correctAnswerIndex: 1,
    category: 'Architecture',
    difficulty: 'easy'
  },
  {
    question: 'Which heritage site features 34 monasteries and temples, extending over more than 2 km, dug side by side in the wall of a high basalt cliff?',
    options: ['Ajanta Caves', 'Bhimbetka Rock Shelters', 'Ellora Caves', 'Badami Caves'],
    correctAnswerIndex: 2,
    category: 'Monuments',
    difficulty: 'medium'
  },
  {
    question: 'Victoria Memorial, an iconic marble building dedicated to the memory of Queen Victoria, is located in:',
    options: ['Mumbai', 'Chennai', 'Kolkata', 'New Delhi'],
    correctAnswerIndex: 2,
    category: 'Monuments',
    difficulty: 'easy'
  },
  {
    question: 'Which temple is recognized as having the longest temple corridor in the world?',
    options: ['Meenakshi Amman Temple', 'Ramanathaswamy Temple (Rameswaram)', 'Brihadeeswarar Temple', 'Jagannath Temple'],
    correctAnswerIndex: 1,
    category: 'Architecture',
    difficulty: 'hard'
  },
  {
    question: 'The Iron Pillar of Delhi, famous for its rust-resistant composition, is located in the complex of which monument?',
    options: ['Red Fort', "Humayun's Tomb", 'Qutub Minar', 'Safdarjung Tomb'],
    correctAnswerIndex: 2,
    category: 'Monuments',
    difficulty: 'medium'
  },
  {
    question: 'The ruins of the ancient city of Vijayanagara are found at which UNESCO World Heritage Site?',
    options: ['Pattadakal', 'Aihole', 'Badami', 'Hampi'],
    correctAnswerIndex: 3,
    category: 'Indian History',
    difficulty: 'easy'
  },
  {
    question: 'Gol Gumbaz, the mausoleum of King Mohammed Adil Shah, is famous for its massive dome. Where is it located?',
    options: ['Hyderabad', 'Bijapur (Vijayapura)', 'Bidar', 'Gulbarga'],
    correctAnswerIndex: 1,
    category: 'Architecture',
    difficulty: 'medium'
  },
  {
    question: 'Which Indian stepwell (vav) has been printed on the reverse side of the new ₹100 currency note?',
    options: ['Chand Baori', 'Adalaj Stepwell', 'Rani ki Vav', 'Agrasen ki Baoli'],
    correctAnswerIndex: 2,
    category: 'Culture',
    difficulty: 'medium'
  },
  {
    question: 'What is the primary material used in the construction of the Khajuraho group of monuments?',
    options: ['Marble', 'Sandstone', 'Granite', 'Basalt'],
    correctAnswerIndex: 1,
    category: 'Architecture',
    difficulty: 'hard'
  },
  {
    question: 'The Meenakshi Amman Temple in Madurai is heavily associated with which ancient Tamil dynasty?',
    options: ['Chola', 'Chera', 'Pandya', 'Pallava'],
    correctAnswerIndex: 2,
    category: 'Indian History',
    difficulty: 'medium'
  },
  {
    question: 'Which of the following was NOT built by the Mughals?',
    options: ['Jama Masjid, Delhi', 'Taj Mahal', 'Buland Darwaza', 'Gateway of India'],
    correctAnswerIndex: 3,
    category: 'Indian History',
    difficulty: 'easy'
  },
  {
    question: "The 'Living Root Bridges' are a unique structural phenomenon heavily utilizing rubber fig trees. In which Indian state are they primarily found?",
    options: ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Sikkim'],
    correctAnswerIndex: 1,
    category: 'Culture',
    difficulty: 'medium'
  },
  {
    question: 'Fatehpur Sikri, the short-lived capital of the Mughal Empire, was primarily constructed using:',
    options: ['White Marble', 'Red Sandstone', 'Red Brick', 'Granite'],
    correctAnswerIndex: 1,
    category: 'Architecture',
    difficulty: 'medium'
  },
  {
    question: 'Who designed the modern city of Chandigarh?',
    options: ['Edwin Lutyens', 'Herbert Baker', 'Le Corbusier', 'Charles Correa'],
    correctAnswerIndex: 2,
    category: 'Architecture',
    difficulty: 'hard'
  },
  {
    question: 'Which famous monument in Hyderabad was built in 1591 to celebrate the end of a deadly plague?',
    options: ['Golconda Fort', 'Charminar', 'Chowmahalla Palace', 'Qutb Shahi Tombs'],
    correctAnswerIndex: 1,
    category: 'Indian History',
    difficulty: 'easy'
  },
  {
    question: 'The Elephanta Caves primarily contain rock cut temples dedicated to which Hindu deity?',
    options: ['Vishnu', 'Brahma', 'Shiva', 'Ganesha'],
    correctAnswerIndex: 2,
    category: 'Culture',
    difficulty: 'medium'
  },
  {
    question: 'Which Indian monument features a famous acoustic phenomenon where a handclap at the entrance can be heard clearly at the highest point of the structure?',
    options: ['Golconda Fort', 'Red Fort', 'Gwalior Fort', 'Mehrangarh Fort'],
    correctAnswerIndex: 0,
    category: 'Architecture',
    difficulty: 'hard'
  },
  {
    question: 'The Nalanda University ruins, an ancient center of learning, are located in which modern-day state?',
    options: ['Uttar Pradesh', 'Bihar', 'West Bengal', 'Odisha'],
    correctAnswerIndex: 1,
    category: 'Indian History',
    difficulty: 'easy'
  },
  {
    question: 'The Shore Temple at Mahabalipuram was built during the reign of which dynasty?',
    options: ['Chola', 'Pallava', 'Chalukya', 'Rashtrakuta'],
    correctAnswerIndex: 1,
    category: 'Indian History',
    difficulty: 'hard'
  }
]

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Wiping old quiz data...')
    await QuizQuestion.deleteMany({})

    console.log(`Inserting ${questions.length} real-world quiz questions...`)
    await QuizQuestion.insertMany(questions)

    console.log('Successfully seeded the quiz database!')
    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
