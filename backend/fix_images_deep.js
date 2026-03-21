const mongoose = require('mongoose')
require('dotenv').config()

const Monument = require('./models/Monument')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg'

async function findCommonsImage (query) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query) + '&gsrlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json'
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RootsAndWings/1.0' } })
    const data = await res.json()
    if (data.query && data.query.pages) {
      const pages = data.query.pages
      for (const pageId in pages) {
        const thumb = pages[pageId].imageinfo && pages[pageId].imageinfo[0] ? pages[pageId].imageinfo[0].thumburl : null
        // Prefer jpg or png over svg
        if (thumb && !thumb.toLowerCase().endsWith('.svg') && !thumb.toLowerCase().endsWith('.tif')) return thumb
      }
      // If only SVG found
      const firstPageId = Object.keys(pages)[0]
      return pages[firstPageId].imageinfo && pages[firstPageId].imageinfo[0] ? pages[firstPageId].imageinfo[0].thumburl : null
    }
  } catch (err) {}
  return null
}

const delay = ms => new Promise(res => setTimeout(res, ms))

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Deep scanning for missing/fallback real images...')

    const allMonuments = await Monument.find({})
    const toFix = allMonuments.filter(m => {
      if (!m.images || m.images.length === 0) return true
      const img = m.images[0].toLowerCase()
      return img === FALLBACK_IMG.toLowerCase() || img.endsWith('.svg') || img.endsWith('taj_mahal')
    })

    console.log('Found ' + toFix.length + ' monuments needing real images.')

    let fixedCount = 0

    for (let i = 0; i < toFix.length; i++) {
      const doc = toFix[i]

      let newImg = await findCommonsImage(doc.name)

      if (!newImg && doc.name.includes(' Temple')) newImg = await findCommonsImage(doc.name.replace(' Temple', ''))
      if (!newImg && doc.name.includes(' Fort')) newImg = await findCommonsImage(doc.name.replace(' Fort', ''))
      if (!newImg && doc.name.includes(' Monastery')) newImg = await findCommonsImage(doc.name.replace(' Monastery', ''))
      if (!newImg && doc.name.includes(' Church')) newImg = await findCommonsImage(doc.name.replace(' Church', ''))
      if (!newImg) newImg = await findCommonsImage(doc.state + ' Monument') // Last resort broad search

      if (newImg) {
        doc.images = [newImg]
        await doc.save()
        fixedCount++
        console.log('[' + (i + 1) + '/' + toFix.length + '] Fixed: ' + doc.name)
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
