async function test () {
  const query = 'Chandrakhuri Temple'
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent("'" + query + "'") + '&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json'

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'RootsAndWings/1.0 (test@example.com)'
      }
    })
    const data = await res.json()
    console.log(JSON.stringify(data, null, 2))

    if (data.query && data.query.pages) {
      const pages = data.query.pages
      const firstPageId = Object.keys(pages)[0]
      const thumb = pages[firstPageId].imageinfo && pages[firstPageId].imageinfo[0] ? pages[firstPageId].imageinfo[0].thumburl : null
      console.log('Image found:', thumb)
    } else {
      console.log("No image found, trying without 'Temple'")
      const url2 = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query.replace(' Temple', '')) + '&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json'
      const res2 = await fetch(url2, { headers: { 'User-Agent': 'RootsAndWings/1.0' } })
      const data2 = await res2.json()
      console.log(Object.keys(data2.query && data2.query.pages ? data2.query.pages : {}).length ? 'Fallback found!' : 'Fallback fail')

      if (data2.query && data2.query.pages) {
        const pages = data2.query.pages
        const firstPageId = Object.keys(pages)[0]
        const thumb = pages[firstPageId].imageinfo && pages[firstPageId].imageinfo[0] ? pages[firstPageId].imageinfo[0].thumburl : null
        console.log('Fallback Image found:', thumb)
      }
    }
  } catch (err) {
    console.error(err)
  }
}
test()
