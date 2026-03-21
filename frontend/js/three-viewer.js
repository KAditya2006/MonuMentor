let currentMonumentId = null

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')

  if (id) {
    currentMonumentId = id
    fetchMonumentDetails(id)
  } else {
    document.getElementById('loading').innerText = 'Monument ID missing.'
  }
})

async function fetchMonumentDetails (id) {
  try {
    const res = await fetch(`/api/monuments/${id}`)
    if (res.ok) {
      const mon = await res.json()
      populateUI(mon)
    } else {
      document.getElementById('loading').innerText = 'Monument not found.'
    }
  } catch (err) {
    console.error(err)
    document.getElementById('loading').innerText = 'Error loading monument details.'
  }
}

function populateUI (mon) {
  const loader = document.getElementById('loading')
  if (loader) loader.style.opacity = '0'

  const content = document.getElementById('monument-content')
  if (content) {
    content.style.opacity = '1'
    content.style.pointerEvents = 'auto'
  }

  document.getElementById('m-name').innerText = mon.name
  document.getElementById('m-category').innerText = mon.category
  document.getElementById('m-location').innerText = `${mon.city}, ${mon.state}`
  document.getElementById('m-description').innerText = mon.description || 'Description not available.'

  if (mon.images && mon.images.length > 0) {
    document.getElementById('m-image').src = mon.images[0]
  }

  document.getElementById('m-year').innerText = mon.yearBuilt || 'Unknown'
  document.getElementById('m-style').innerText = mon.architectureStyle || 'N/A'
  document.getElementById('m-unesco').innerText = mon.UNESCOstatus ? 'Recognized' : 'None'
  document.getElementById('m-history').innerText = mon.history || 'History info not available.'

  // Update 3D model
  const modelUrl = mon.modelUrl || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf'

  document.getElementById('model-entity').setAttribute('gltf-model', modelUrl)
}

// User Actions
async function toggleFavorite () {
  const token = localStorage.getItem('token')
  if (!token) return alert('Please login first.')

  try {
    const res = await fetch('/api/user/favorite', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ monumentId: currentMonumentId })
    })
    if (res.ok) {
      alert('Favorites updated!')
    }
  } catch (err) {
    console.error(err)
  }
}

async function markVisited () {
  const token = localStorage.getItem('token')
  if (!token) return alert('Please login first.')

  try {
    const res = await fetch('/api/user/visit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ monumentId: currentMonumentId })
    })
    if (res.ok) {
      alert('Marked as visited!')
    }
  } catch (err) {
    console.error(err)
  }
}
