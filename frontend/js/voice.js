/**
 * voice.js - Multilingual Web Speech API Integration
 * Handles Speech-To-Text (STT) and Text-To-Speech (TTS) for Indian Languages.
 */

// Global state
let currentLanguage = 'en-IN'; // Default: Indian English
let speechRecognition = null;
let isRecording = false;

// Supported Languages (BCP 47 tags)
const languages = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' }
];

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognition = new SpeechRecognition();
  speechRecognition.continuous = false;
  speechRecognition.interimResults = false;
}

// Inject Language Selector into Navbar
function initVoiceUI() {
  const navContainer = document.querySelector('.nav-buttons');
  if (!navContainer) return;

  // Create language select dropdown
  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'lang-selector-wrapper';
  selectWrapper.style.marginRight = '1rem';
  selectWrapper.style.display = 'inline-block';

  const select = document.createElement('select');
  select.id = 'global-lang-select';
  select.style.padding = '0.5rem';
  select.style.borderRadius = 'var(--radius-sm)';
  select.style.background = 'rgba(255,255,255,0.1)';
  select.style.color = '#fff';
  select.style.border = '1px solid rgba(255,255,255,0.2)';
  select.style.outline = 'none';

  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    option.style.background = '#1a1a1a';
    select.appendChild(option);
  });

  // Load saved preference
  const savedLang = localStorage.getItem('rw_voice_lang');
  if (savedLang) {
    currentLanguage = savedLang;
    select.value = savedLang;
  }

  select.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('rw_voice_lang', currentLanguage);
    if (speechRecognition) {
      speechRecognition.lang = currentLanguage;
    }
    console.log(`Language changed to: ${currentLanguage}`);
    triggerGoogleTranslation(currentLanguage);
  });

  selectWrapper.appendChild(select);
  navContainer.insertBefore(selectWrapper, navContainer.firstChild);
}

// Google Translate DOM Integration
function loadGoogleTranslate() {
  const script = document.createElement('script');
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(script);

  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en', 
      autoDisplay: false
    }, 'google_translate_element');
  };
  
  const div = document.createElement('div');
  div.id = 'google_translate_element';
  div.style.display = 'none';
  document.body.appendChild(div);
}

function triggerGoogleTranslation(langCode) {
    const lang = langCode.split('-')[0];
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
        googleSelect.value = lang === 'en' ? '' : lang; // '' resets to English
        googleSelect.dispatchEvent(new Event('change'));
    } else {
        setTimeout(() => triggerGoogleTranslation(langCode), 500);
    }
}

// Speech-To-Text (STT) Function
function startVoiceInput(inputId, onCompleteCallback) {
  if (!speechRecognition) {
    alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
    return;
  }

  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  if (isRecording) {
    speechRecognition.stop();
    return;
  }

  speechRecognition.lang = currentLanguage;
  speechRecognition.start();

  speechRecognition.onstart = function() {
    isRecording = true;
    inputEl.placeholder = "Listening...";
    // Visual feedback
    if(document.getElementById('mic-btn')) {
        document.getElementById('mic-btn').style.color = 'red';
    }
  };

  speechRecognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    inputEl.value = transcript;
    console.log(`Heard: ${transcript} (Confidence: ${event.results[0][0].confidence})`);
    
    // Trigger callback if provided (e.g. applyFilters() for search)
    if (typeof onCompleteCallback === 'function') {
      onCompleteCallback(transcript);
    }
  };

  speechRecognition.onerror = function(event) {
    console.error("Speech Recognition Error:", event.error);
    inputEl.placeholder = "Search...";
    resetMicUI();
  };

  speechRecognition.onend = function() {
    isRecording = false;
    if(inputEl.placeholder === "Listening...") {
       inputEl.placeholder = "Search...";
    }
    resetMicUI();
  };
}

function resetMicUI() {
    isRecording = false;
    if(document.getElementById('mic-btn')) {
        document.getElementById('mic-btn').style.color = 'inherit';
    }
}

let currentFallbackAudio = null;

// Text-To-Speech (TTS) Function
function speakText(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Toggle off if currently speaking
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetSpeakerBtn();
    return;
  }
  if (currentFallbackAudio) {
    currentFallbackAudio.pause();
    currentFallbackAudio = null;
    resetSpeakerBtn();
    return;
  }

  // Get raw translated text
  let textToSpeak = element.innerText || element.textContent;
  textToSpeak = textToSpeak.replace(/[\r\n]+/g, ' ').trim();
  if (!textToSpeak) return;

  const shortLang = currentLanguage.split('-')[0];

  // Try to find native Web Speech Voice first
  let targetVoice = null;
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    targetVoice = voices.find(v => v.lang.replace('_', '-').includes(currentLanguage)) || 
                  voices.find(v => v.lang.includes(shortLang));
  }
  
  // Function to visually indicate reading
  function activateSpeakerBtn() {
     const bs = document.querySelectorAll('button[id*="speak"]');
     bs.forEach(b => b.style.color = 'var(--primary-saffron)');
  }
  function resetSpeakerBtn() {
     const bs = document.querySelectorAll('button[id*="speak"]');
     bs.forEach(b => b.style.color = 'inherit');
  }

  // Core execution: If we have a native voice, use it. Otherwise, force Cloud TTS.
  if (targetVoice && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = currentLanguage;
    utterance.voice = targetVoice;
    
    utterance.onstart = activateSpeakerBtn;
    utterance.onend = resetSpeakerBtn;
    utterance.onerror = resetSpeakerBtn;
    
    window.speechSynthesis.speak(utterance);
  } else {
    // Robust Cloud Audio Fallback Pipeline (Slices text to bypass 200char API limits)
    activateSpeakerBtn();
    const chunks = textToSpeak.match(/.{1,199}(\s|$)/g) || [textToSpeak];
    
    let playNextChunk = (index) => {
        if(index >= chunks.length) {
           currentFallbackAudio = null;
           return resetSpeakerBtn();
        }
        
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunks[index].trim())}&tl=${shortLang}&client=tw-ob`;
        currentFallbackAudio = new Audio(url);
        
        currentFallbackAudio.onended = () => playNextChunk(index + 1);
        currentFallbackAudio.onerror = () => resetSpeakerBtn(); // Skip gracefully on fetch limits
        currentFallbackAudio.play().catch(e => {
            console.error("Cloud TTS blocked/failed:", e);
            resetSpeakerBtn();
        });
    };
    
    playNextChunk(0);
  }
}

// Load voices async
window.speechSynthesis.onvoiceschanged = function() {
  window.speechSynthesis.getVoices();
};

// Initialize UI on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initVoiceUI();
  loadGoogleTranslate();
  
  // Trigger initial translation if saved
  const savedLang = localStorage.getItem('rw_voice_lang');
  if (savedLang && savedLang !== 'en-IN') {
    triggerGoogleTranslation(savedLang);
  }
});
