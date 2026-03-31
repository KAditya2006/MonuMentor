const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config()

const Monument = require('./models/Monument')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'
const CSV_PATH = path.join(__dirname, '../completeDataset.csv')

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
    console.log(`📡 [SYSTEM] Attempting Monument Database Restoration...`);
    
    // Detailed connection options for Atlas vs Local
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, connectionOptions)
    console.log('✅ Connected to MongoDB for Restoration.')
    
    console.log('🧹 [DATABASE] Clearing current records to prevent duplicates...');
    await Monument.deleteMany({})

    const monuments = []
    
    console.log('📖 [DATA] Reading dataset from CSV...');
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
        // Sanitize headers and values (remove BOM, extra spaces)
        const row = {};
        Object.keys(data).forEach(key => {
          row[key.trim().replace(/^\uFEFF/, '')] = data[key]?.trim();
        });

        // Skip truly empty rows or comments
        if (!row.monument_name && !row.state) return;

        // Map verified CSV fields to Monument Schema
        // Dataset headers: state,district,monument_name,latitude,longitude,description,image_link,model_3d_link
        monuments.push({
          name: row.monument_name || 'Unknown Monument',
          state: row.state || 'Unknown State',
          city: row.district || 'Unknown',
          category: row.category || 'Monuments',
          description: row.description || '',
          coordinates: {
            lat: parseFloat(row.latitude) || 0,
            lng: parseFloat(row.longitude) || 0
          },
          images: row.image_link ? [row.image_link] : [fallbackImg],
          modelUrl: row.model_3d_link === 'N/A' ? null : row.model_3d_link
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
        console.log('🚀 [SUCCESS] Monument database successfully restored.');
        process.exit(0)
      })

  } catch (err) {
    console.error('❌ Restoration Error:', err)
    process.exit(1)
  }
}

seedDatabase()
