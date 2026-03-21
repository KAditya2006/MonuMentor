const mongoose = require('mongoose')
require('dotenv').config()

const Monument = require('./models/Monument')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg'

async function findBetterImage (query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.query && data.query.pages) {
      const pages = data.query.pages
      const firstPageId = Object.keys(pages)[0]
      const thumb = pages[firstPageId].thumbnail?.source
      if (thumb) return thumb
    }
  } catch (err) {
    console.error('Wiki search failed for', query)
  }
  return null
}

const delay = ms => new Promise(res => setTimeout(res, ms))

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Scanning for bad images...')

    // Find monuments that have the fallback image or an svg image
    const allMonuments = await Monument.find({})
    const toFix = allMonuments.filter(m => {
      if (!m.images || m.images.length === 0) return true
      const img = m.images[0].toLowerCase()
      return img === FALLBACK_IMG.toLowerCase() || img.endsWith('.svg')
    })

    console.log(`Found ${toFix.length} monuments that need image fixing.`)

    let fixedCount = 0

    for (let i = 0; i < toFix.length; i++) {
      const doc = toFix[i]

      let newImg = await findBetterImage(doc.name)
      if (!newImg && doc.name.includes(' Temple')) {
        newImg = await findBetterImage(doc.name.replace(' Temple', ''))
      }
      if (!newImg && doc.name.includes(' Fort')) {
        newImg = await findBetterImage(doc.name.replace(' Fort', ''))
      }

      if (newImg) {
        doc.images = [newImg]
        await doc.save()
        fixedCount++
        console.log(`[${i + 1}/${toFix.length}] Fixed: ${doc.name}`)
      } else {
        console.log(`[${i + 1}/${toFix.length}] Still no image for: ${doc.name}`)
      }

      await delay(300) // Prevent rate limiting
    }

    console.log(`Finished! Fixed ${fixedCount} images. Exiting.`)
    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
