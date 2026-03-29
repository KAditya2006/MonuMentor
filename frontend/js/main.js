// Auth State Management
let authMode = 'login' // 'login' or 'register'
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : 'https://monumentor-dgpy.onrender.com/api'

// --- Custom Toast Notification ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '💬';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '🚨';

  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-message">${message}</span>`;
  container.appendChild(toast);

  // Trigger reflow for animation
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 4500);
}

// Global Alert Override
window.alert = function(msg) {
  showToast(msg, 'info');
}

// GSAP Animations and Responsive Navbar
document.addEventListener('DOMContentLoaded', () => {
  // Dynamically Inject Hamburger Menu for Mobile
  const navbar = document.querySelector('.navbar')
  if (navbar && !document.querySelector('.hamburger')) {
    const hamburger = document.createElement('div')
    hamburger.className = 'hamburger'
    hamburger.innerHTML = '<span></span><span></span><span></span>'
    
    // Insert before nav-links
    const navLinks = document.querySelector('.nav-links')
    if (navLinks) {
      navbar.insertBefore(hamburger, navLinks)
    }

    // Insert overlay for click-outside detection
    const overlay = document.createElement('div')
    overlay.className = 'mobile-overlay'
    document.body.appendChild(overlay)

    // Toggle logic
    const toggleMenu = () => {
      const navLinks = document.querySelector('.nav-links')
      const navButtons = document.querySelector('.nav-buttons')
      if (navLinks) navLinks.classList.toggle('nav-active')
      if (navButtons) navButtons.classList.toggle('nav-active')
      hamburger.classList.toggle('toggle')
      overlay.classList.toggle('nav-active')
    }

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleMenu()
    })

    // Click anywhere outside the menu to close
    overlay.addEventListener('click', () => {
      if (overlay.classList.contains('nav-active')) {
        toggleMenu()
      }
    })
  }

  if (typeof gsap !== 'undefined') {
    gsap.to('.fade-up', {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    })
  }

  checkAuth()

  // GLOBAL ROUTE PROTECTION
  const protectedRoutes = ['/explore', '/dashboard', '/monument', '/quiz', '/chatbot'];
  if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
    if (!localStorage.getItem('token')) {
       alert("Please login first to proceed to the platform features.");
       // Redirect immediately if they tried to bypass directly via URL
       window.location.replace('/');
       return;
    }
  }

  // Force clear stale PWA Service Workers to deploy the new OTP DOM logic
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister()
        console.log("Stale ServiceWorker purged for forced OTP UI deployment.")
      }
    })
  }
})

// Modal Logic
function openModal (mode) {
  authMode = mode
  document.getElementById('auth-modal').style.display = 'flex'
  updateModalUI()
}

function closeModal () {
  document.getElementById('auth-modal').style.display = 'none'
}

function toggleAuthMode () {
  authMode = authMode === 'login' ? 'register' : 'login'
  updateModalUI()
}

function updateModalUI () {
  const title = document.getElementById('modal-title')
  const userGroup = document.getElementById('username-group')
  const usernameInput = document.getElementById('username')
  const submitBtn = document.getElementById('submit-btn')
  const toggleText = document.getElementById('toggle-text')

  if (authMode === 'login') {
    title.innerText = 'Login'
    userGroup.style.display = 'none'
    usernameInput.removeAttribute('required')
    submitBtn.innerText = 'Login'
    toggleText.innerHTML = 'Don\'t have an account? <span onclick="toggleAuthMode()" style="color:var(--primary-saffron);cursor:pointer;">Register</span>'
  } else if (authMode === 'register') {
    title.innerText = 'Register'
    userGroup.style.display = 'block'
    usernameInput.setAttribute('required', 'true')
    submitBtn.innerText = 'Register'
    toggleText.innerHTML = 'Already have an account? <span onclick="toggleAuthMode()" style="color:var(--primary-saffron);cursor:pointer;">Login</span>'
  }
}

// Authentication Flow
if (document.getElementById('auth-form')) {
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const username = document.getElementById('username')?.value
    const submitBtn = document.getElementById('submit-btn')

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register'
    const body = authMode === 'login' ? { email, password } : { username, email, password }

    // Show loading state
    const originalText = submitBtn.innerText
    submitBtn.disabled = true
    submitBtn.innerText = 'Please wait...'

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        closeModal()
        checkAuth()
        showToast('Authentication successful! Welcome to the AR Platform.', 'success')
      } else {
        // Handle specific error codes
        if (res.status === 503) {
          showToast(`${data.msg}\n${data.details || 'Start MongoDB with: mongod'}`, 'error')
        } else {
          showToast(data.msg || 'Authentication failed', 'error')
        }
      }
    } catch (err) {
      console.error(err)
      showToast('Server Connection Error - Please ensure the backend is running', 'error')
    } finally {
      // Restore button state
      submitBtn.disabled = false
      submitBtn.innerText = originalText
    }
  })
}

function checkAuth () {
  const token = localStorage.getItem('token')
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch (e) {}

  const container = document.getElementById('nav-auth-container')
  if (!container) return

  if (token && user) {
    container.innerHTML = `
      <a href="/dashboard" class="btn btn-outline">Dashboard</a>
      <button class="btn btn-primary" onclick="logout()">Logout</button>
    `
  } else {
    container.innerHTML = `
      <button class="btn btn-outline" onclick="openModal('login')">Login</button>
      <button class="btn btn-primary" onclick="openModal('register')">Register</button>
    `
  }
}

function logout () {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  checkAuth()
  window.location.href = '/'
}

// Intercepts link clicks in HTML to bounce unauthorized users
window.requireAuth = function(e, url) {
  if (!localStorage.getItem('token')) {
    if (e) e.preventDefault();
    openModal('login');
    alert("Please login first to proceed.");
    return false;
  }
  if (url) window.location.href = url;
  return true;
}

// Global utility for auth token header
function getAuthHeaders () {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || ''
  }
}

// ==========================================
// Global 3D Hover Preview Core Injection
// ==========================================
let hoverTimeout = null;
let globalHoverData = null;

function initGlobalHoverPreview() {
  if(document.getElementById('global-hover-preview')) return;
  
  if (!window.AFRAME && !document.querySelector('script[src*="aframe"]')) {
     const tag = document.createElement('script');
     tag.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
     document.head.appendChild(tag);
  }

  const previewHTML = `
    <div id="global-hover-preview">
      <div id="hover-preview-media">
        <img id="hover-preview-img" src="" alt="">
        <div id="hover-preview-3d" style="width:100%; height:100%; position:absolute; top:0; left:0; display:none;"></div>
      </div>
      <div id="hover-preview-content">
        <h4 id="hover-preview-title" class="notranslate"></h4>
        <p id="hover-preview-desc"></p>
        <button id="hover-speak-btn" class="btn btn-outline" style="width: 100%; padding: 0.8rem; font-size: 0.9rem; pointer-events:auto;">🔊 Listen in Selected Language</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', previewHTML);

  const preview = document.getElementById('global-hover-preview');
  preview.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
  preview.addEventListener('mouseleave', () => window.hideHoverPreview());

  document.getElementById('hover-speak-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.speakText) {
       window.speakText('hover-preview-content');
    }
  });
}

window.showHoverPreview = function(e, mon) {
  clearTimeout(hoverTimeout);
  const preview = document.getElementById('global-hover-preview');
  if(!preview) return;
  
  if(globalHoverData !== mon._id) {
     const titleEl = document.getElementById('hover-preview-title');
     const descEl = document.getElementById('hover-preview-desc');
     const imgEl = document.getElementById('hover-preview-img');
     const container3D = document.getElementById('hover-preview-3d');
     
     titleEl.classList.remove('notranslate');
     titleEl.innerText = mon.name || '';
     descEl.innerText = (mon.city && mon.state) ? `${mon.city}, ${mon.state} - Experience the heritage in 3D AR.` : "Indian Cultural Heritage Node.";
     
     if (mon.modelUrl) {
        imgEl.style.display = 'none';
        container3D.style.display = 'block';
        container3D.innerHTML = `
          <a-scene embedded vr-mode-ui="enabled: false"
                   renderer="antialias: true; colorManagement: true; alpha: true;">
            <a-entity gltf-model="${mon.modelUrl}" 
                      position="0 -0.5 -1.5" 
                      scale="0.05 0.05 0.05"
                      animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear;">
            </a-entity>
            <a-camera position="0 0 0" look-controls="enabled: false" wasd-controls="enabled: false"></a-camera>
            <a-light type="ambient" color="#ffffff" intensity="2.0"></a-light>
          </a-scene>
        `;
     } else {
        imgEl.style.display = 'block';
        container3D.style.display = 'none';
        container3D.innerHTML = '';
        
        const fallback = "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=400";
        imgEl.src = (mon.images && mon.images.length > 0) ? mon.images[0] : fallback;
     }
     
     globalHoverData = mon._id;
  }
  
  preview.classList.add('active');

  let x = e.clientX + 15;
  let y = e.clientY - 150;
  if(x + 350 > window.innerWidth) x = e.clientX - 365;
  if(y < 10) y = 10;
  if(y + 350 > window.innerHeight) y = window.innerHeight - 360;

  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;
};

window.hideHoverPreview = function() {
  hoverTimeout = setTimeout(() => {
    const preview = document.getElementById('global-hover-preview');
    if(preview) preview.classList.remove('active');
    
    const container3D = document.getElementById('hover-preview-3d');
    if(container3D) container3D.innerHTML = '';
    globalHoverData = null;
  }, 400);
};

document.addEventListener('DOMContentLoaded', initGlobalHoverPreview);
