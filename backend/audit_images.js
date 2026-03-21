const mongoose = require('mongoose')
require('dotenv').config()
const Monument = require('./models/Monument')

async function pingUrl(url) {
  if (!url || !url.startsWith('http')) return false
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok // true if status is 200-299
  } catch (e) {
    return false
  }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800',
  'https://images.unsplash.com/photo-1564507592224-2fc8c626ebc8?q=80&w=800',
  'https://images.unsplash.com/photo-1590139115047-4fc642e1debc?q=80&w=800',
  'https://images.unsplash.com/photo-1557690756-62754e561982?q=80&w=800',
  'https://images.unsplash.com/photo-1622308644420-a7d0840bed87?q=80&w=800',
  'https://images.unsplash.com/photo-1600025983808-59c4b7261a86?q=80&w=800'
]

function getRandomFallback() {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]
}

async function fixBrokenImages() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'
  await mongoose.connect(uri)
  console.log('Connected to MongoDB. Scanning images...')

  try {
    const monuments = await Monument.find({})
    let brokenCount = 0

    // Process in batches so we don't overwhelm network with fetch calls
    const BATCH_SIZE = 50
    for (let i = 0; i < monuments.length; i += BATCH_SIZE) {
      const batch = monuments.slice(i, i + BATCH_SIZE)
      
      const promises = batch.map(async (m) => {
        const url = m.imageUrl
        const isValid = await pingUrl(url)
        
        if (!isValid) {
          brokenCount++
          console.log(`[BROKEN] ${m.name} -> ${url}`)
          const newUrl = getRandomFallback()
          m.imageUrl = newUrl
          await m.save()
          console.log(`[FIXED] ${m.name} -> Swapped with fallback.`)
        }
      })
      
      await Promise.all(promises)
      console.log(`Processed ${Math.min(i + BATCH_SIZE, monuments.length)} / ${monuments.length}`)
    }

    console.log(`\nScan Complete! Fixed ${brokenCount} broken/empty images.`)
  } catch (err) {
    console.error('Error during scan:', err)
  } finally {
    mongoose.connection.close()
  }
}

fixBrokenImages()
