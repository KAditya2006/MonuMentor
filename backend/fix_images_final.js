const mongoose = require('mongoose')
require('dotenv').config()

const Monument = require('./models/Monument')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg'

async function findBroadImage (query) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query) + '&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json'
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RootsAndWings/1.0' } })
    const data = await res.json()
    if (data.query && data.query.pages) {
      const pages = data.query.pages
      const firstPageId = Object.keys(pages)[0]
      const thumb = pages[firstPageId].thumbnail ? pages[firstPageId].thumbnail.source : null
      if (thumb && !thumb.toLowerCase().endsWith('.svg')) return thumb
    }
  } catch (err) {}
  return null
}

const delay = ms => new Promise(res => setTimeout(res, ms))

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Running final broad-search resolution...')

    const allMonuments = await Monument.find({})
    const toFix = allMonuments.filter(m => {
      if (!m.images || m.images.length === 0) return true
      const img = m.images[0].toLowerCase()
      return img === FALLBACK_IMG.toLowerCase() || img.endsWith('.svg') || img.includes('taj_mahal')
    })

    console.log('Remaining missing images: ' + toFix.length)

    let fixedCount = 0

    for (let i = 0; i < toFix.length; i++) {
      const doc = toFix[i]

      let newImg = null

      // 1. Try first 2 words
      const words = doc.name.split(' ')
      if (words.length >= 2 && !newImg) {
        newImg = await findBroadImage(words[0] + ' ' + words[1])
      }

      // 2. Try just the first word
      if (words.length >= 1 && !newImg) {
        newImg = await findBroadImage(words[0])
      }

      // 3. Try the state name + "tourism" or just state name
      if (!newImg) {
        newImg = await findBroadImage(doc.state + ' tourism')
      }
      if (!newImg) {
        newImg = await findBroadImage(doc.state)
      }

      if (newImg) {
        doc.images = [newImg]
        await doc.save()
        fixedCount++
        console.log('[' + (i + 1) + '/' + toFix.length + '] Fixed ' + doc.name + ' -> ' + newImg.split('/').pop())
      } else {
        console.log('[' + (i + 1) + '/' + toFix.length + '] Still no image: ' + doc.name)
      }

      await delay(300)
    }

    console.log('Finished! Fixed ' + fixedCount + ' images. Exiting.')
    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
