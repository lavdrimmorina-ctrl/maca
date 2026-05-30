// script.js — full “Operation Forever” logic

// Utility: hide all overlays, then show one
function hideAll() {
  document.querySelectorAll('.overlay').forEach(el => el.classList.remove('show'));
}
function show(id) {
  document.getElementById(id).classList.add('show');
}

// ---- STEP 1: Virus Alert ----
document.getElementById('quarantine-btn').addEventListener('click', () => {
  hideAll();
  show('progress-overlay');
  fakeProgress();
});

// ---- STEP 2: Fake Progress Bar ----
function fakeProgress() {
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  let width = 0;
  const messages = [
    'Deleting singleness...',
    'Installing cuddles...',
    'Loading shared dreams...',
    'Compiling inside jokes...',
    'Scanning for imperfections – none found ❤️',
    'Love virus successfully contained... 💕'
  ];
  
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      text.textContent = 'Complete!';
      setTimeout(() => {
        hideAll();
        show('game-overlay');
        startMemoryGame();
      }, 1000);
    } else {
      // Random progress jumps
      width += Math.floor(Math.random() * 15) + 5;
      if (width > 100) width = 100;
      bar.style.width = width + '%';
      
      // Pick a message based on progress
      const idx = Math.min(
        Math.floor((width / 100) * messages.length),
        messages.length - 1
      );
      text.textContent = messages[idx];
    }
  }, 800);
}

// ---- STEP 3: Memory Game ----
const emojis = ['😻', '🐶', '🌸', '🍕', '🎸', '✈️', '💑']; // replace with image URLs if you want photos
let cards = [...emojis, ...emojis]; // duplicate each for pairs
let flipped = [];
let matched = 0;

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startMemoryGame() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  flipped = [];
  matched = 0;
  cards = shuffle([...emojis, ...emojis]); // reshuffle each time
  
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });
  document.getElementById('game-message').textContent = 'Match all pairs to prove you’re in love 💞';
}

function flipCard(e) {
  const card = e.target;
  // Prevent clicking already matched cards or more than 2
  if (card.classList.contains('matched') || flipped.length >= 2) return;
  
  card.textContent = card.dataset.emoji;
  flipped.push(card);
  
  if (flipped.length === 2) {
    const [card1, card2] = flipped;
    if (card1.dataset.emoji === card2.dataset.emoji) {
      // Match!
      card1.classList.add('matched');
      card2.classList.add('matched');
      matched += 2;
      flipped = [];
      
      if (matched === cards.length) {
        document.getElementById('game-message').textContent = 'Love confirmed!';
        setTimeout(() => {
          hideAll();
          show('proposal-overlay');
        }, 1200);
      }
    } else {
      // No match – hide after a short delay
      setTimeout(() => {
        card1.textContent = '';
        card2.textContent = '';
        flipped = [];
      }, 800);
    }
  }
}

// ---- STEP 4: The Proposal ----
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const confettiContainer = document.getElementById('confetti');

yesBtn.addEventListener('click', () => {
  // Celebration effect
  confettiContainer.innerHTML = '🎉💖💍💖🎉';
  // You could also trigger a real confetti animation (add a small library or a CSS keyframe)
  // Optionally: reveal a hidden message or redirect
  setTimeout(() => {
    alert('Yay! She said YES! 💑 Now go celebrate!');
  }, 500);
});

// Runaway "No" button
noBtn.addEventListener('mouseover', () => {
  // Move the button to a random position within the window
  const maxX = window.innerWidth - noBtn.offsetWidth;
  const maxY = window.innerHeight - noBtn.offsetHeight;
  noBtn.style.position = 'fixed'; // ensure it can roam anywhere
  noBtn.style.left = Math.random() * maxX + 'px';
  noBtn.style.top = Math.random() * maxY + 'px';
});

// If she somehow clicks it (mobile touch, etc.)
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Error 404: Rejection not found. Please try “Yes”. 💕');
  // Move it again for good measure
  const maxX = window.innerWidth - noBtn.offsetWidth;
  const maxY = window.innerHeight - noBtn.offsetHeight;
  noBtn.style.left = Math.random() * maxX + 'px';
  noBtn.style.top = Math.random() * maxY + 'px';
});
