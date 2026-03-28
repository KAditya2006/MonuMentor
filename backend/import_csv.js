const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const Monument = require('./models/Monument')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'
const CSV_PATH = path.join(__dirname, '../india_520_monuments_dataset.csv')

const determineCategory = (name, city, description) => {
  const text = (name + ' ' + city + ' ' + description).toLowerCase()
  if (text.includes('temple') || text.includes('math') || text.includes('mandir')) return 'Temples'
  if (text.includes('fort') || text.includes('qila')) return 'Forts'
  if (text.includes('palace') || text.includes('mahal')) return 'Palaces'
  if (text.includes('cave')) return 'Caves'
  if (text.includes('unesco')) return 'UNESCO Sites'
  return 'Monuments'
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB')

    const csvData = fs.readFileSync(CSV_PATH, 'utf-8')
    const lines = csvData.split('\n')

    const newMonuments = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const row = []
      let cur = ''
      let inQuote = false

      for (const char of lines[i]) {
        if (char === '"') inQuote = !inQuote
        else if (char === ',' && !inQuote) {
          row.push(cur)
          cur = ''
        } else {
          cur += char
        }
      }
      row.push(cur)

      if (row.length < 6) continue

      const name = row[0] ? row[0].trim() : ''
      const state = row[1] ? row[1].trim() : ''
      const city = row[2] ? row[2].trim() : ''
      const lat = row[3] ? parseFloat(row[3]) : NaN
      const lng = row[4] ? parseFloat(row[4]) : NaN
      const description = row[5] ? row[5].replace(/^"|"$/g, '').trim() : ''
      const imageLink = row[6] ? row[6].replace(/^"|"$/g, '').trim() : ''
      const modelLink = row[7] ? row[7].replace(/^"|"$/g, '').trim() : ''

      const category = determineCategory(name, city, description)

      const monData = {
        name,
        state,
        city,
        category,
        description,
        // Only add image if it's a real link, not just the base domain
        images: imageLink && imageLink.length > 30 ? [imageLink] : []
      }

      if (modelLink !== '') {
        monData.modelUrl = modelLink
      }

      if (!isNaN(lat) && !isNaN(lng)) {
        monData.coordinates = { lat, lng }
      }

      newMonuments.push(monData)
    }

    console.log(`Parsed ${newMonuments.length} monuments. Inserting into DB...`)
    await Monument.insertMany(newMonuments)
    console.log('Successfully appended records to database!')
    process.exit()
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
