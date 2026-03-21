let questions = []
let currentQIndex = 0
let score = 0
let timer
let timeLeft = 30
let hasAnswered = false

const MOCK_QUESTIONS = [
  { question: 'Which ancient university in India is considered one of the oldest in the world?', options: ['Nalanda', 'Taxila', 'Vikramashila', 'Valabhi'], correctAnswerIndex: 0 },
  { question: 'The Ellora Caves are located in which state?', options: ['Madhya Pradesh', 'Karnataka', 'Maharashtra', 'Gujarat'], correctAnswerIndex: 2 },
  { question: 'Which monument was built by Shah Jahan to house the tomb of his favorite wife?', options: ['Qutub Minar', 'Red Fort', 'Taj Mahal', 'Jama Masjid'], correctAnswerIndex: 2 }
]

async function startQuiz () {
  const category = document.getElementById('quiz-category').value
  document.getElementById('quiz-setup').style.display = 'none'
  document.getElementById('quiz-active').style.display = 'block'

  try {
    let url = '/api/quiz?limit=5'
    if (category) url += `&category=${category}`

    const res = await fetch(url)
    if (res.ok) {
      questions = await res.json()
    }
  } catch (err) {
    console.warn('Using mock questions.')
  }

  if (!questions || questions.length === 0) {
    questions = MOCK_QUESTIONS
  }

  document.getElementById('q-total').innerText = questions.length
  loadQuestion()
}

function loadQuestion () {
  hasAnswered = false
  timeLeft = 30
  document.getElementById('timer-display').innerText = timeLeft
  document.getElementById('next-btn').style.display = 'none'

  const q = questions[currentQIndex]
  document.getElementById('q-current').innerText = currentQIndex + 1
  document.getElementById('question-text').innerText = q.question

  const optionsContainer = document.getElementById('options-container')
  optionsContainer.innerHTML = ''

  q.options.forEach((opt, index) => {
    const btn = document.createElement('button')
    btn.className = 'option-btn'
    btn.innerText = opt
    btn.onclick = () => selectOption(index, btn)
    optionsContainer.appendChild(btn)
  })

  clearInterval(timer)
  timer = setInterval(() => {
    timeLeft--
    document.getElementById('timer-display').innerText = timeLeft
    if (timeLeft <= 0) {
      clearInterval(timer)
      handleTimeout()
    }
  }, 1000)
}

function selectOption (selectedIndex, btnElement) {
  if (hasAnswered) return
  hasAnswered = true
  clearInterval(timer)

  const q = questions[currentQIndex]
  const buttons = document.querySelectorAll('.option-btn')

  if (selectedIndex === q.correctAnswerIndex) {
    btnElement.classList.add('correct')
    score++
  } else {
    btnElement.classList.add('wrong')
    buttons[q.correctAnswerIndex].classList.add('correct')
  }

  document.getElementById('next-btn').style.display = 'inline-block'
}

function handleTimeout () {
  if (hasAnswered) return
  hasAnswered = true

  const q = questions[currentQIndex]
  const buttons = document.querySelectorAll('.option-btn')
  buttons[q.correctAnswerIndex].classList.add('correct')

  document.getElementById('next-btn').style.display = 'inline-block'
}

function nextQuestion () {
  currentQIndex++
  if (currentQIndex < questions.length) {
    loadQuestion()
  } else {
    showResults()
  }
}

async function showResults () {
  document.getElementById('quiz-active').style.display = 'none'
  document.getElementById('quiz-results').style.display = 'block'

  document.getElementById('final-score').innerText = score
  document.getElementById('r-total').innerText = questions.length

  const token = localStorage.getItem('token')
  if (token) {
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          score,
          totalQuestions: questions.length,
          category: document.getElementById('quiz-category').value || 'Mixed',
          timeTakenMs: 0
        })
      })
    } catch (err) {
      console.log('Error saving score:', err)
    }
  }
}
