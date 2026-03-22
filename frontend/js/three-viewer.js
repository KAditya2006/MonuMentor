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

  // Load High-Res Primary Billboard Image to prevent any blur
  const defaultBg = 'https://images.unsplash.com/photo-1548013146-72479768bada?q=100&w=2048'
  let targetImage = mon.images && mon.images.length > 0 ? mon.images[0] : defaultBg
  
  // Force unsplash URLs to use high-res rendering by injecting the width param if missing
  if (targetImage.includes('unsplash.com') && !targetImage.includes('w=')) {
     targetImage += '&w=2048&q=100';
  } else if (targetImage.includes('unsplash.com')) {
     targetImage = targetImage.replace(/w=\d+/, 'w=2048').replace(/q=\d+/, 'q=100');
  }

  // Load Genuine 3D Architectural Structure (GLTF/GLB)
  const modelEntity = document.getElementById('model-entity');
  if (modelEntity) {
    // If database lacks the structural 3D file, fallback to a generic antique artifact (Lantern) instead of Fox
    const targetModel = mon.modelUrl || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF/Lantern.gltf';
    
    // Auto-scale generic models appropriately
    const scale = mon.modelUrl ? "1 1 1" : "0.05 0.05 0.05"; 
    modelEntity.setAttribute('scale', scale);
    modelEntity.setAttribute('gltf-model', `url(${targetModel})`);
  }

  // Execute True Satellite Reality View (Crisp Native Zoom)
  const satelliteFrame = document.getElementById('satellite-iframe');
  if (satelliteFrame) {
    const encodedQuery = encodeURIComponent(mon.name + " " + mon.city);
    satelliteFrame.src = `https://maps.google.com/maps?q=${encodedQuery}&t=k&z=18&output=embed`;
  }
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
