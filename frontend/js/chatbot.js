const chatBox = document.getElementById('chat-box')
const chatInput = document.getElementById('chat-input-field')

function appendMessage (sender, text) {
  const msgDiv = document.createElement('div')
  msgDiv.className = `message ${sender}`
  msgDiv.innerText = text
  chatBox.appendChild(msgDiv)
  chatBox.scrollTop = chatBox.scrollHeight

  if (sender === 'bot') {
    speakText(text)
  }
}

async function sendMessage () {
  const text = chatInput.value.trim()
  if (!text) return

  appendMessage('user', text)
  chatInput.value = ''

  const loadingId = 'loading-' + Date.now()
  const loadingDiv = document.createElement('div')
  loadingDiv.className = 'message bot'
  loadingDiv.id = loadingId
  loadingDiv.innerText = 'Thinking...'
  chatBox.appendChild(loadingDiv)
  chatBox.scrollTop = chatBox.scrollHeight

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })

    document.getElementById(loadingId).remove()

    if (res.ok) {
      const data = await res.json()
      appendMessage('bot', data.response)
    } else {
      appendMessage('bot', "I'm having trouble connecting right now.")
    }
  } catch (err) {
    document.getElementById(loadingId).remove()
    appendMessage('bot', 'Network error. Please try again.')
  }
}

function handleKey (e) {
  if (e.key === 'Enter') sendMessage()
}

function sendQuick (text) {
  chatInput.value = text
  sendMessage()
}

let isDictating = false
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function toggleVoice () {
  if (!SpeechRecognition) {
    alert('Voice recognition not supported in this browser.')
    return
  }

  const voiceBtn = document.getElementById('voice-btn')
  const recognition = new SpeechRecognition()

  if (!isDictating) {
    isDictating = true
    voiceBtn.style.color = 'red'
    recognition.start()

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript
      chatInput.value = transcript
      sendMessage()
    }

    recognition.onend = function () {
      isDictating = false
      voiceBtn.style.color = ''
    }
  }
}

function speakText (text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }
}
