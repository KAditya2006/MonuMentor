let map
let markersGroup = null // MarkerClusterGroup
let markers = []
let monuments = []
let allMonumentsForSuggestions = []

document.addEventListener('DOMContentLoaded', () => {
  initMap()
  fetchMonuments()
  fetchAllForSuggestions()

  const searchInput = document.getElementById('search-input')
  const stateSelect = document.getElementById('state-select')
  const categorySelect = document.getElementById('category-select')

  if (searchInput) searchInput.addEventListener('input', applyFilters)
  if (stateSelect) stateSelect.addEventListener('change', applyFilters)
  if (categorySelect) categorySelect.addEventListener('change', applyFilters)
})

async function fetchAllForSuggestions () {
  try {
    const res = await fetch('/api/monuments')
    if (res.ok) {
      allMonumentsForSuggestions = await res.json()
      const datalist = document.getElementById('monument-suggestions')
      if (datalist) {
        datalist.innerHTML = ''
        allMonumentsForSuggestions.forEach(mon => {
          const option = document.createElement('option')
          option.value = mon.name
          datalist.appendChild(option)
        })
      }
    }
  } catch (err) {
    console.error('Error fetching suggestions:', err)
  }
}

function initMap () {
  map = L.map('map').setView([20.5937, 78.9629], 4)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  // Initialize Marker Cluster Group
  markersGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    removeOutsideVisibleBounds: true,
    chunkedLoading: true
  })
  map.addLayer(markersGroup)
}

async function fetchMonuments () {
  const search = document.getElementById('search-input').value
  const state = document.getElementById('state-select').value
  const category = document.getElementById('category-select').value

  try {
    const url = new URL(window.location.origin + '/api/monuments')
    if (search) url.searchParams.append('search', search)
    if (state) url.searchParams.append('state', state)
    if (category) url.searchParams.append('category', category)

    const res = await fetch(url)
    if (res.ok) {
      monuments = await res.json()
      renderMonuments()
      updateMapMarkers()
    }
  } catch (err) {
    console.error('Error fetching monuments:', err)
    document.getElementById('monuments-container').innerHTML = '<p>Offline or failed to fetch data.</p>'
  }
}

function applyFilters () {
  fetchMonuments()
}

function renderMonuments () {
  const container = document.getElementById('monuments-container')
  container.innerHTML = ''

  if (monuments.length === 0) {
    container.innerHTML = '<p>No monuments found matching your criteria. (If database is empty, please run a seed script!)</p>'
    return
  }

  monuments.forEach(mon => {
    const card = document.createElement('div')
    card.className = 'monument-card'
    card.onclick = () => window.open(`/monument?id=${mon._id}`, '_self')
    
    card.onmouseenter = (e) => {
        if(window.showHoverPreview) window.showHoverPreview(e, mon);
    };
    card.onmouseleave = () => {
        if(window.hideHoverPreview) window.hideHoverPreview();
    };

    const imageUrl = mon.images && mon.images.length > 0 ? mon.images[0] : 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=400'

    card.innerHTML = `
      <img src="${imageUrl}" class="card-img" alt="${mon.name}">
      <div class="card-content">
        <span class="badge">${mon.category}</span>
        <h3>${mon.name}</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;">${mon.city}, ${mon.state}</p>
      </div>
    `
    container.appendChild(card)
  })
}

function updateMapMarkers () {
  markersGroup.clearLayers()
  markers = []

  monuments.forEach(mon => {
    if (mon.coordinates && mon.coordinates.lat && mon.coordinates.lng) {
      const marker = L.marker([mon.coordinates.lat, mon.coordinates.lng])
      
      marker.bindPopup(`
        <div style="color:black">
          <b>${mon.name}</b><br>${mon.city}, ${mon.state}<br>
          <a href="/monument?id=${mon._id}" target="_self" style="color:var(--primary-blue);text-decoration:underline">View Details</a>
        </div>
      `)
      
      marker.on('mouseover', (e) => {
          if (window.showHoverPreview) {
              window.showHoverPreview(e.originalEvent, mon);
          }
      });
      marker.on('mouseout', () => {
          if (window.hideHoverPreview) {
              window.hideHoverPreview();
          }
      });
      
      markers.push(marker)
      markersGroup.addLayer(marker)
    }
  })

  if (markers.length > 0) {
    const group = new L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
}
