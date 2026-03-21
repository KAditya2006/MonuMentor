document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Please login to view dashboard')
    window.location.href = '/'
    return
  }

  fetchDashboardData()
})

async function fetchDashboardData () {
  try {
    const res = await fetch('/api/user/dashboard', {
      headers: getAuthHeaders()
    })

    if (res.ok) {
      const user = await res.json()
      populateDashboard(user)
    } else {
      console.error('Failed to fetch dashboard data')
    }
  } catch (err) {
    console.error(err)
  }
}

function populateDashboard (user) {
  document.getElementById('user-name').innerText = user.username
  document.getElementById('total-score').innerText = user.totalQuizScore || 0

  const favList = document.getElementById('fav-list')
  const visitedList = document.getElementById('visited-list')

  document.getElementById('fav-count').innerText = user.favoriteMonuments.length
  document.getElementById('visited-count').innerText = user.visitedMonuments.length

  favList.innerHTML = ''
  if (user.favoriteMonuments.length === 0) {
    favList.innerHTML = '<li>No favorites added yet.</li>'
  } else {
    user.favoriteMonuments.forEach(m => {
      favList.innerHTML += `<li>${m.name} <a href="/monument?id=${m._id}">View</a></li>`
    })
  }

  visitedList.innerHTML = ''
  if (user.visitedMonuments.length === 0) {
    visitedList.innerHTML = '<li>No monuments visited yet.</li>'
  } else {
    user.visitedMonuments.forEach(m => {
      visitedList.innerHTML += `<li>${m.name} <a href="/monument?id=${m._id}">View</a></li>`
    })
  }

  // Render Chart
  const ctx = document.getElementById('progressChart').getContext('2d')
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Visited (10x)', 'Favorites (5x)', 'Quiz Score'],
      datasets: [{
        data: [
          user.visitedMonuments.length * 10,
          user.favoriteMonuments.length * 5,
          user.totalQuizScore || 1
        ],
        backgroundColor: [
          '#138808',
          '#FF9933',
          '#0D47A1'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#fff' } }
      }
    }
  })
}
