// ----- CONFIGURATION -----
const START_DATE = new Date('2026-01-01'); // Change to your launch day!
const END_DATE = new Date('2026-06-26');
const TODAY = new Date();
TODAY.setHours(0,0,0,0);

// ----- ALL LEVELS DEFINED -----
// Each level object: { date: 'YYYY-MM-DD', type: 'memory'|'quiz'|'message'|'special', ...specific props }
const levels = [
  // Sample levels (add one for every day!)
  { date: '2026-01-01', type: 'message', title: 'Welcome!', text: 'This is your first daily quest! Come back tomorrow for a new surprise. ❤️' },
  { date: '2026-01-02', type: 'memory', emojis: ['🐶','🌸','🎸','🍕'], title: 'Memory Match', },
  { date: '2026-01-03', type: 'quiz', question: 'What was our first movie together?', options: ['Titanic', 'The Notebook', 'La La Land', 'Up'], correct: 1, title: 'Quiz Time' },
  { date: '2026-06-26', type: 'proposal', title: 'The Final Quest' } // Special
];

// Build a map for quick access
const levelMap = {};
levels.forEach(l => { levelMap[l.date] = l; });

// ----- STATE -----
let completed = JSON.parse(localStorage.getItem('loveQuestCompleted') || '[]');
// If today hasn't been completed yet, it's not in the array
function isCompleted(dateStr) { return completed.includes(dateStr); }
function markCompleted(dateStr) {
  if (!isCompleted(dateStr)) {
    completed.push(dateStr);
    localStorage.setItem('loveQuestCompleted', JSON.stringify(completed));
  }
}

// ----- SCREEN SWITCHING -----
const calendarScreen = document.getElementById('calendar-screen');
const levelScreen = document.getElementById('level-screen');
const levelContent = document.getElementById('level-content');
const levelDateDisplay = document.getElementById('level-date-display');
const proposalOverlay = document.getElementById('proposal-overlay');

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ----- CALENDAR RENDERING -----
function getDaysArray(start, end) {
  const arr = [];
  let current = new Date(start);
  while (current <= end) {
    arr.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return arr;
}

function formatDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function isToday(d) {
  return d.getTime() === TODAY.getTime();
}
function isFuture(d) {
  return d > TODAY;
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  const days = getDaysArray(START_DATE, END_DATE);
  let completedCount = 0;
  
  days.forEach(d => {
    const dateStr = formatDateStr(d);
    const completedDay = isCompleted(dateStr);
    if (completedDay) completedCount++;
    
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.textContent = d.getDate();
    
    if (completedDay) {
      dayEl.classList.add('completed');
    } else if (isToday(d)) {
      dayEl.classList.add('today');
    } else if (isFuture(d)) {
      dayEl.classList.add('future');
    }
    
    // Click handler for today (if not completed) or any completed day to view
    if (!isFuture(d)) {
      dayEl.addEventListener('click', () => {
        if (isToday(d) && !completedDay) {
          // Play today's level
          openLevel(dateStr);
        } else if (completedDay) {
          // Replay completed level (read-only or replay)
          openLevel(dateStr, true);
        } else {
          alert('You can only play today’s quest!');
        }
      });
    }
    
    grid.appendChild(dayEl);
  });
  
  // Progress bar
  const total = days.length;
  const perc = Math.round((completedCount / total) * 100);
  document.getElementById('progress-fill').style.width = perc + '%';
  document.getElementById('progress-text').textContent = `${completedCount} / ${total} days completed`;
}

// ----- OPEN A LEVEL -----
function openLevel(dateStr, isReplay = false) {
  const level = levelMap[dateStr];
  if (!level) {
    alert('No quest defined for this day yet! (come back later)');
    return;
  }
  
  showScreen(levelScreen);
  levelDateDisplay.textContent = dateStr;
  
  // Clear previous content
  levelContent.innerHTML = '';
  
  if (level.type === 'message') {
    levelContent.innerHTML = `<h2>${level.title}</h2><p style="font-size:1.2rem; max-width:300px; margin:20px auto;">${level.text}</p>`;
    // Add complete button
    addCompleteButton(dateStr);
  }
  else if (level.type === 'memory') {
    buildMemoryGame(level, dateStr);
  }
  else if (level.type === 'quiz') {
    buildQuiz(level, dateStr);
  }
  else if (level.type === 'proposal') {
    // Proposal level
    if (dateStr === '2026-06-26' && !isReplay) {
      // Start proposal flow (maybe a mini-game first, then final question)
      buildProposalLevel();
    } else {
      levelContent.innerHTML = '<p>✨ Come back on June 26, 2026! ✨</p>';
    }
  }
  else {
    levelContent.innerHTML = '<p>Quest coming soon...</p>';
  }
}

function addCompleteButton(dateStr) {
  const btn = document.createElement('button');
  btn.textContent = 'Quest Complete! ❤️';
  btn.className = 'big-yes';
  btn.style.margin = '20px auto';
  btn.addEventListener('click', () => {
    markCompleted(dateStr);
    renderCalendar();
    showScreen(calendarScreen);
  });
  levelContent.appendChild(btn);
}

// ----- MEMORY GAME BUILDER -----
function buildMemoryGame(level, dateStr) {
  levelContent.innerHTML = `<h2>${level.title || 'Memory Match'}</h2><p>Match all pairs!</p>`;
  const emojis = level.emojis || ['💖','💍','🎉','🐶'];
  const cardsArray = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  
  let flipped = [];
  let matched = 0;
  
  cardsArray.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.addEventListener('click', () => {
      if (card.classList.contains('matched') || flipped.length >= 2) return;
      card.textContent = emoji;
      flipped.push(card);
      if (flipped.length === 2) {
        if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
          flipped[0].classList.add('matched');
          flipped[1].classList.add('matched');
          matched += 2;
          flipped = [];
          if (matched === cardsArray.length) {
            setTimeout(() => {
              markCompleted(dateStr);
              renderCalendar();
              showScreen(calendarScreen);
            }, 800);
          }
        } else {
          setTimeout(() => {
            flipped[0].textContent = '';
            flipped[1].textContent = '';
            flipped = [];
          }, 700);
        }
      }
    });
    grid.appendChild(card);
  });
  levelContent.appendChild(grid);
}

// ----- QUIZ BUILDER -----
function buildQuiz(level, dateStr) {
  levelContent.innerHTML = `<h2>${level.title || 'Daily Quiz'}</h2>`;
  const q = document.createElement('p');
  q.className = 'quiz-question';
  q.textContent = level.question;
  levelContent.appendChild(q);
  
  const optsDiv = document.createElement('div');
  optsDiv.className = 'quiz-options';
  
  level.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (idx === level.correct) {
        btn.classList.add('correct');
        markCompleted(dateStr);
        renderCalendar();
        setTimeout(() => showScreen(calendarScreen), 1000);
      } else {
        btn.classList.add('wrong');
        setTimeout(() => {
          btn.classList.remove('wrong');
        }, 500);
      }
    });
    optsDiv.appendChild(btn);
  });
  levelContent.appendChild(optsDiv);
}

// ----- PROPOSAL LEVEL (Final Day) -----
function buildProposalLevel() {
  // Hide level screen and show proposal overlay
  proposalOverlay.classList.add('show');
  // Runaway no button
  const noBtn = document.getElementById('no-btn');
  noBtn.addEventListener('mouseover', () => {
    const maxX = window.innerWidth - noBtn.offsetWidth;
    const maxY = window.innerHeight - noBtn.offsetHeight;
    noBtn.style.position = 'fixed';
    noBtn.style.left = Math.random() * maxX + 'px';
    noBtn.style.top = Math.random() * maxY + 'px';
  });
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Error: Cannot compute rejection. Please press YES.');
    noBtn.style.left = Math.random() * (window.innerWidth-80) + 'px';
    noBtn.style.top = Math.random() * (window.innerHeight-40) + 'px';
  });
  
  document.getElementById('yes-btn').addEventListener('click', () => {
    document.getElementById('confetti').innerHTML = '🎉💍💖💍🎉';
    document.getElementById('confetti').style.display = 'block';
    alert('She said YES! Congratulations!');
    // Mark proposal day completed
    markCompleted('2026-06-26');
    renderCalendar();
    proposalOverlay.classList.remove('show');
    showScreen(calendarScreen);
  });
}

// ----- BACK BUTTON -----
document.getElementById('back-btn').addEventListener('click', () => {
  proposalOverlay.classList.remove('show');
  showScreen(calendarScreen);
});

// ----- INIT -----
renderCalendar();
// If today is the proposal day and not yet completed, automatically start the proposal flow?
const todayStr = formatDateStr(TODAY);
if (todayStr === '2026-06-26' && !isCompleted(todayStr)) {
  openLevel(todayStr);
}
