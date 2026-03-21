async function test () {
  const q = 'Mahavir Mandir Patna'
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json`
  try {
    const res = await fetch(url)
    const data = await res.json()
    console.log(JSON.stringify(data, null, 2))

    if (data.query && data.query.pages) {
      const pages = data.query.pages
      const firstPageId = Object.keys(pages)[0]
      const thumb = pages[firstPageId].thumbnail?.source
      console.log('Image:', thumb)
    }
  } catch (e) {
    console.log('Error:', e)
  }
}
test()
