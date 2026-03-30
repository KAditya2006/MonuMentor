const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config()

const Monument = require('./models/Monument')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'
const CSV_PATH = path.join(__dirname, '../india_520_monuments_dataset.csv')

const fallbackImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg'

const getWikiImage = async (title) => {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    const data = await res.json()
    return data.thumbnail ? data.thumbnail.source : null
  } catch (e) {
    return null
  }
}

const seedDatabase = async () => {
  try {
    console.log(`📡 [SYSTEM] Attempting 520-Monument Restoration...`);
    
    // Detailed connection options for Atlas vs Local
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, connectionOptions)
    console.log('✅ Connected to MongoDB (Atlas or Local) for Restoration.')
    
    console.log('🧹 [DATABASE] Clearing current records to prevent duplicates...');
    await Monument.deleteMany({})

    const monuments = []
    
    console.log('📖 [DATA] Reading verified 520 dataset from CSV...');
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
        // Sanitize headers and values (remove BOM, extra spaces)
        const row = {};
        Object.keys(data).forEach(key => {
          row[key.trim().replace(/^\uFEFF/, '')] = data[key]?.trim();
        });

        // Skip truly empty rows or comments
        if (!row['Monument Name'] && !row['State/UT']) return;

        // Map verified CSV fields to Monument Schema
        monuments.push({
          name: row['Monument Name'] || 'Unknown Monument',
          state: row['State/UT'] || 'Unknown State', // Required field
          city: row.City || 'Unknown', // Required field
          category: row.Category || 'Monuments', // Required field
          description: row.Description || '',
          coordinates: {
            lat: parseFloat(row.Latitude) || 0,
            lng: parseFloat(row.Longitude) || 0
          },
          images: row['Image URL'] ? [row['Image URL']] : [fallbackImg]
        })
      })
      .on('end', async () => {
        console.log(`📦 Processing ${monuments.length} verified records...`)
        
        // Only fetch first 20 images to avoid rate limiting during large seeds
        // The rest will use fallback or be lazy-loaded in future versions
        const finalMonuments = await Promise.all(monuments.map(async (mon, index) => {
          let img = null
          if (index < 20) {
            img = await getWikiImage(mon.name)
          }
          return {
            ...mon,
            images: [img || fallbackImg]
          }
        }))

        await Monument.insertMany(finalMonuments)
        console.log('🚀 [SUCCESS] 520 Real Monuments successfully restored to Database.')
        process.exit(0)
      })

  } catch (err) {
    console.error('❌ Restoration Error:', err)
    process.exit(1)
  }
}

seedDatabase()
