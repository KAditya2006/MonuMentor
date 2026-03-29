/**
 * MonuMentor AI Assistant 2.0
 * Handles real-time chat, voice synthesis, and premium typing interactions.
 */

const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input-field');
const voiceBtn = document.getElementById('voice-btn');
const aiStatusLabel = document.getElementById('ai-status-label');

let isBotThinking = false;
let isDictating = false;

// 1. Core Chat Logic
function appendMessage(sender, text, isTyping = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    if (isTyping && sender === 'bot') {
        typeWriter(msgDiv, text);
    } else {
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    }
    
    chatBox.appendChild(msgDiv);
    scrollToBottom();

    if (sender === 'bot' && !isTyping) {
        speakText(text);
    }
}

function typeWriter(element, text, speed = 15) {
    let i = 0;
    element.innerHTML = "";
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
            i++;
            scrollToBottom();
            setTimeout(type, speed);
        } else {
            // Typing finished, speak
            speakText(text);
        }
    }
    type();
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || isBotThinking) return;

    appendMessage('user', text);
    chatInput.value = '';
    
    // Get currently selected language from voice.js state or storage
    const currentLang = localStorage.getItem('rw_voice_lang') || 'en-IN';
    
    showTypingIndicator();
    isBotThinking = true;
    aiStatusLabel.textContent = "THINKING...";

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                lang: currentLang 
            })
        });

        hideTypingIndicator();
        isBotThinking = false;
        aiStatusLabel.textContent = "SYSTEM ONLINE";

        if (res.ok) {
            const data = await res.json();
            appendMessage('bot', data.response, true);
        } else {
            appendMessage('bot', "Forgive me, my connection to the heritage records is weak right now. Please try again.");
        }
    } catch (err) {
        hideTypingIndicator();
        isBotThinking = false;
        aiStatusLabel.textContent = "CONNECTION ERROR";
        appendMessage('bot', 'A network disturbance occurred. My ancient records are temporarily unreachable.');
    }
}

// 2. UI Helpers
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(indicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleKey(e) {
    if (e.key === 'Enter') sendMessage();
}

function sendQuick(text) {
    chatInput.value = text;
    sendMessage();
}

// 3. Voice Logic
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function toggleVoice() {
    if (!SpeechRecognition) {
        alert('Your browser does not support the ancient art of voice recognition.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isDictating) {
        isDictating = true;
        voiceBtn.classList.add('active');
        aiStatusLabel.textContent = "LISTENING...";
        recognition.start();

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            voiceBtn.classList.remove('active');
            sendMessage();
        };

        recognition.onerror = function() {
            isDictating = false;
            voiceBtn.classList.remove('active');
            aiStatusLabel.textContent = "SYSTEM ONLINE";
        };

        recognition.onend = function() {
            isDictating = false;
            voiceBtn.classList.remove('active');
            aiStatusLabel.textContent = "SYSTEM ONLINE";
        };
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get currently selected language
        const currentLang = localStorage.getItem('rw_voice_lang') || 'en-IN';
        utterance.lang = currentLang;

        // Try to match the voice to the language
        const voices = window.speechSynthesis.getVoices();
        const targetVoice = voices.find(v => v.lang.includes(currentLang.split('-')[0]));
        if (targetVoice) utterance.voice = targetVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}
