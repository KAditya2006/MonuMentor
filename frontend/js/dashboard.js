/**
 * MonuMentor Dashboard 2.0 - Advanced Heritage UI
 * Handles data fetching, visualization, and premium UI rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/'; // Simple protection, backend verifies token
        return;
    }

    initDashboard();
});

async function initDashboard() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/user/dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        const userData = await response.json();
        
        if (response.ok) {
            updateUI(userData);
            renderPerformanceChart(userData);
        } else {
            handleError("Session expired. Please login again.");
        }
    } catch (err) {
        console.error("Dashboard Error:", err);
        handleError("Connection to heritage vault lost. Retrying...");
    }
}

function updateUI(user) {
    // 1. Profile & Greetings
    const username = user.username || user.name || "Explorer";
    document.getElementById('user-display-name').textContent = username;
    document.getElementById('welcome-name').textContent = username;
    document.getElementById('user-avatar-initials').textContent = username.charAt(0).toUpperCase();

    // 2. Stats
    const visitedCount = user.visitedMonuments?.length || 0;
    const favCount = user.favoriteMonuments?.length || 0;
    const quizScore = user.totalQuizScore || 0;

    // Real Dynamic Sub-text
    const dynamicGreeting = `Continue your journey through India's history. You have explored **${visitedCount}** monuments and earned **${quizScore}** points. Your legacy continues!`;
    document.getElementById('welcome-stats-text').innerHTML = dynamicGreeting.replace(/\*\*(.*?)\*\*/g, '<span style="color: var(--primary-saffron); font-weight: 700;">$1</span>');
    
    document.getElementById('stat-visited').textContent = visitedCount;
    document.getElementById('stat-quiz-score').textContent = quizScore;
    document.getElementById('stat-favorites').textContent = favCount;
    
    // Rank logic
    let rank = "Bronze Explorer";
    if (quizScore > 100) rank = "Silver Historian";
    if (quizScore > 500) rank = "Gold Archivist";
    if (quizScore > 1000) rank = "Platinum Guardian";
    document.getElementById('stat-rank').textContent = rank;

    // 3. Favorites List (Mini)
    const favList = document.getElementById('favorites-mini-list');
    if (user.favoriteMonuments && user.favoriteMonuments.length > 0) {
        favList.innerHTML = user.favoriteMonuments.slice(0, 4).map(m => `
            <div class="list-item">
                <img src="${m.ImageLink || 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=150'}" class="item-img" alt="${m.name}">
                <div class="item-info">
                    <h4>${m.name || m['Monument Name']}</h4>
                    <p style="color:#A1A1AA; font-size:0.75rem;">${m.State}, ${m.District}</p>
                </div>
                <a href="/monument?id=${m._id}" style="margin-left: auto; color: var(--primary-saffron); font-size: 0.8rem; font-weight: 600;">VIEW</a>
            </div>
        `).join('');
    }

    // 4. Recently Explored (Grid)
    const visitedGrid = document.getElementById('recent-explored-grid');
    if (user.visitedMonuments && user.visitedMonuments.length > 0) {
        visitedGrid.innerHTML = user.visitedMonuments.slice(0, 4).map(m => `
            <div class="stat-card" style="padding: 1rem; flex-direction: column; align-items: flex-start; gap: 8px;">
                <img src="${m.ImageLink || 'https://via.placeholder.com/300x150'}" style="width: 100%; height: 100px; border-radius: 12px; object-fit: cover;">
                <h4 style="font-size: 0.9rem; margin-top: 8px;">${m.name || m['Monument Name']}</h4>
                <p style="color: var(--text-dim); font-size: 0.7rem;">${m.District}, ${m.State}</p>
            </div>
        `).join('');
    }
}

function renderPerformanceChart(user) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Process real quiz data
    const quizHistory = user.quizHistory || [];
    // Sort oldest to newest for the chart timeline
    const chronologicalHistory = [...quizHistory].reverse();
    
    const scores = chronologicalHistory.length > 0 
        ? chronologicalHistory.map(q => q.score) 
        : [0]; // Fallback if no history yet
    
    const labels = chronologicalHistory.length > 0
        ? chronologicalHistory.map(q => {
            const date = new Date(q.createdAt);
            return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        })
        : ["Start Journey"];

    // Gradient setup
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 153, 51, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 153, 51, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Heritage Mastery',
                data: scores,
                borderColor: '#FF9933',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#FF9933',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#A1A1AA', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#A1A1AA', font: { size: 10 } }
                }
            }
        }
    });
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
}

function handleError(msg) {
    console.error(msg);
    // Optional: add a toast or error UI
}

// Mobile sidebar toggle (if implemented in HTML buttons later)
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}
