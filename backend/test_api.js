const mongoose = require('mongoose')
require('dotenv').config()
const Monument = require('./models/Monument')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const doc = await Monument.findOne({})
    console.log('Mock Monument:')
    console.log(JSON.stringify(doc, null, 2))

    // Simulate what the frontend does
    console.log('\nFrontend expects: ')
    console.log('mon.name:', doc.name)
    console.log('mon.category:', doc.category)
    console.log('mon.city:', doc.city)
    console.log('mon.state:', doc.state)
    console.log('mon.description:', doc.description)
    console.log('mon.modelUrl:', doc.modelUrl || 'Using fallback')

    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
