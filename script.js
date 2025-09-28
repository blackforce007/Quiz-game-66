const startBtn = document.getElementById('startBtn');
const quizSection = document.getElementById('quiz-section');
const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const timerEl = document.getElementById('timeRemaining');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');

const scoreEl = document.getElementById('score');
const correctCountEl = document.getElementById('correct');
const wrongCountEl = document.getElementById('wrong');

const resultSection = document.getElementById('result-section');
const finalScoreEl = document.getElementById('final-score');
const finalTimeEl = document.getElementById('final-time');
const correctCountFinal = document.getElementById('correct-count');
const wrongCountFinal = document.getElementById('wrong-count');

const leaderboardSection = document.getElementById('leaderboard-section');
const leaderboardEl = document.getElementById('leaderboard');

const restartBtn = document.getElementById('restartBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboard');

let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let timer;
let timePerQuestion = 15; // সেকেন্ড
let timeRemaining = 15;
let questionPool = [];
let askedQuestions = [];

let startTime;

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', resetQuiz);
document.getElementById('closeLeaderboard').addEventListener('click', () => {
    leaderboardSection.classList.add('hidden');
});

// শুরু করার ফাংশন
function startQuiz() {
    startBtn.classList.add('hidden');
    // নতুন প্রশ্নের তালিকা শুরুর জন্য
    questionPool = [...questions];
    askedQuestions = [];
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    updateScoreboard();
    document.getElementById('scoreboard').classList.remove('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    document.getElementById('result-section').classList.add('hidden');
    loadQuestion();
    startTime = Date.now();
}

// প্রশ্ন লোড
function loadQuestion() {
    resetOptions();
    feedbackEl.innerHTML = '';
    nextBtn.classList.add('hidden');
    // প্রশ্ন তালিকা থেকে এলোমেলো প্রশ্ন নিন
    if(questionPool.length === 0) {
        // সব প্রশ্ন শেষ হলে
        endQuiz();
        return;
    }
    const randIndex = Math.floor(Math.random() * questionPool.length);
    currentQuestion = questionPool.splice(randIndex,1)[0];
    askedQuestions.push(currentQuestion);
    questionEl.innerText = currentQuestion.question;
    optionsEl.innerHTML = '';

    currentQuestion.options.forEach((opt, index) => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.innerText = opt;
        btn.dataset.index = index;
        btn.addEventListener('click', handleOptionClick);
        optionsEl.appendChild(btn);
    });

    // Timer শুরু
    timeRemaining = timePerQuestion;
    document.getElementById('timeRemaining').innerText = timeRemaining;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

// টাইমার আপডেট
function updateTimer() {
    timeRemaining--;
    document.getElementById('timeRemaining').innerText = timeRemaining;
    if(timeRemaining <= 0) {
        clearInterval(timer);
        handleTimeout();
    }
}

// অপশন ক্লিক হ্যান্ডলার
function handleOptionClick(e) {
    clearInterval(timer);
    const selectedOption = parseInt(e.currentTarget.dataset.index);
    disableOptions();

    if(selectedOption === currentQuestion.answer) {
        // সঠিক উত্তর
        e.currentTarget.classList.add('correct');
        feedbackEl.innerHTML = 'সঠিক! ✅';
        // পয়েন্ট যোগ করুন
        score += 10 + (timeRemaining); // সময় বোনাস
        correctCount++;
    } else {
        // ভুল উত্তর
        e.currentTarget.classList.add('wrong');
        feedbackEl.innerHTML = 'ভুল! ❌';
        wrongCount++;
        // সঠিক উত্তর হাইলাইট করুন
        highlightCorrectOption();
    }
    updateScoreboard();
    nextBtn.classList.remove('hidden');
}

// প্রশ্নের উত্তর না দিয়ে সময় শেষ হলে
function handleTimeout() {
    disableOptions();
    feedbackEl.innerHTML = 'সময় শেষ! ❌';
    highlightCorrectOption();
    wrongCount++;
    updateScoreboard();
    nextBtn.classList.remove('hidden');
}

// সব অপশন অক্ষম করুন
function disableOptions() {
    Array.from(optionsEl.children).forEach(btn => {
        btn.removeEventListener('click', handleOptionClick);
        btn.style.pointerEvents = 'none';
    });
}

// সঠিক উত্তর হাইলাইট করুন
function highlightCorrectOption() {
    Array.from(optionsEl.children).forEach(btn => {
        if(parseInt(btn.dataset.index) === currentQuestion.answer) {
            btn.classList.add('correct');
        }
    });
}

// পরবর্তী প্রশ্ন লোড
function loadNextQuestion() {
    loadQuestion();
}

// স্কোরবোর্ড আপডেট
function updateScoreboard() {
    scoreEl.innerText = `স্কোর: ${score}`;
    correctCountEl.innerText = `সঠিক: ${correctCount}`;
    wrongCountEl.innerText = `ভুল: ${wrongCount}`;
}

// প্রশ্ন শেষ হলে ফলাফল দেখান
function endQuiz() {
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');
    finalScoreEl.innerText = `আপনার স্কোর: ${score}`;
    finalTimeEl.innerText = `সময়: ${(Date.now() - startTime)/1000} সেকেন্ড`;
    correctCountFinal.innerText = `সঠিক উত্তর: ${correctCount}`;
    wrongCountFinal.innerText = `ভুল উত্তর: ${wrongCount}`;

    saveToLeaderboard(score);
}

// রিসেট
function resetQuiz() {
    document.getElementById('result-section').classList.add('hidden');
    startBtn.classList.remove('hidden');
    // লিডারবোর্ড দেখাতে চাইলে
    showLeaderboard();
}

// লিডারবোর্ডে সংরক্ষণ
function saveToLeaderboard(score) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const playerName = prompt("আপনার নাম লিখুন:");
    if(playerName) {
        leaderboard.push({name: playerName, score: score, date: new Date().toLocaleString()});
        // সর্বোচ্চ ১০ জন
        leaderboard.sort((a,b) => b.score - a.score);
        if(leaderboard.length > 10) leaderboard.pop();
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
}

// লিডারবোর্ড দেখান
function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardEl.innerHTML = '';
    leaderboard.forEach(entry => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${entry.name}</strong>: ${entry.score} পয়েন্ট (${entry.date})`;
        leaderboardEl.appendChild(div);
    });
    leaderboardSection.classList.remove('hidden');
}
