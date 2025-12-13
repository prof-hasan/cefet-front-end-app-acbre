const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player');
const timer = document.querySelector('.timer');

// Firebase imports
let db = null;
import('./firebase-config.js').then(module => {
  db = module.db;
}).catch(err => {
  console.warn('Firebase não disponível:', err);
  db = null;
});

const characters = [
  'Jessica Watkins',
  'Joan Higginbotham',
  'Jeanette Epps',
  'Ellen Ochoa',
  'Shannon Lucid',
  'Michael Collins',
  'Bernard Harris',
  'Ronald McNair',
  'Buzz Aldrin',
  'Neil Armstrong',
];

const createElement = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

let firstCard = '';
let secondCard = '';
let gameOver = false;

const BASE_TIME = 60;
let wins = Number(localStorage.getItem('memoria_wins')) || 0;

let timeLeft = Math.max(10, BASE_TIME - wins * 5);

// Salva score tanto localmente quanto no Firebase (fallback para local se Firebase falhar)
async function saveScore(name, score) {
  // Local backup
  const scores = JSON.parse(localStorage.getItem('ranking') || '[]');
  scores.push({ name, score, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('ranking', JSON.stringify(scores));

  // Firebase
  if (db) {
    try {
      const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
      await addDoc(collection(db, 'ranking'), {
        name,
        score,
        createdAt: new Date()
      });
      console.log('Score salvo no Firebase');
    } catch (err) {
      console.warn('Erro ao salvar no Firebase:', err);
    }
  }
}

function showEndOverlay(message, isWin) {
  const msg = document.getElementById('end-message');
  if (!msg) return;
  msg.textContent = message;
  msg.style.display = 'block';
  if (isWin) {
    saveScore(spanPlayer.innerHTML, timeLeft);
  }
}

function hideEndOverlay() {
  const msg = document.getElementById('end-message');
  if (msg) msg.style.display = 'none';
}

function resetBoard(resetToBase) {
  clearInterval(this.loop);
  gameOver = false;
  hideEndOverlay();
  firstCard = '';
  secondCard = '';
  grid.innerHTML = '';
  if (resetToBase) {
    wins = 0;
    localStorage.setItem('memoria_wins', String(wins));
  }
  timeLeft = Math.max(10, BASE_TIME - wins * 5);
  timer.innerHTML = String(timeLeft);
  loadGame();
  startTimer();
}

const checkEndGame = () => {
  const disabledCards = document.querySelectorAll('.disabled-card');

  if (disabledCards.length === 20) {
    clearInterval(this.loop);
    gameOver = true;
    showEndOverlay(`Parabéns, ${spanPlayer.innerHTML}! Você venceu com ${timeLeft} segundos restantes.`, true);
  }
}

const checkCards = () => {
  const firstCharacter = firstCard.getAttribute('data-character');
  const secondCharacter = secondCard.getAttribute('data-character');

  if (firstCharacter === secondCharacter) {

    firstCard.firstChild.classList.add('disabled-card');
    secondCard.firstChild.classList.add('disabled-card');

    firstCard = '';
    secondCard = '';

    checkEndGame();

  } else {
    setTimeout(() => {

      firstCard.classList.remove('reveal-card');
      secondCard.classList.remove('reveal-card');

      firstCard = '';
      secondCard = '';

    }, 500);
  }

}

const revealCard = ({ target }) => {
  if (gameOver) return;

  if (target.parentNode.className.includes('reveal-card')) {
    return;
  }

  if (firstCard === '') {

    target.parentNode.classList.add('reveal-card');
    firstCard = target.parentNode;

  } else if (secondCard === '') {

    target.parentNode.classList.add('reveal-card');
    secondCard = target.parentNode;

    checkCards();

  }
}

const createCard = (character) => {

  const card = createElement('div', 'card');
  const front = createElement('div', 'face front');
  const back = createElement('div', 'face back');

  front.style.backgroundImage = `url('./img/${character}.jpg')`;

  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener('click', revealCard);
  card.setAttribute('data-character', character)

  return card;
}

const loadGame = () => {
  const duplicateCharacters = [...characters, ...characters];

  const shuffledArray = duplicateCharacters.sort(() => Math.random() - 0.5);

  shuffledArray.forEach((character) => {
    const card = createCard(character);
    grid.appendChild(card);
  });
}

const startTimer = () => {
  timer.innerHTML = String(timeLeft);
  this.loop = setInterval(() => {
    if (gameOver) return;
    timeLeft -= 1;
    timer.innerHTML = String(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(this.loop);
      gameOver = true;
      showEndOverlay(`Tempo esgotado! ${spanPlayer.innerHTML}, você perdeu.`, false);
    }
  }, 1000);

}

window.onload = () => {
  spanPlayer.innerHTML = localStorage.getItem('player');
  startTimer();
  loadGame();

  const btnNext = document.getElementById('btn-next-phase');
  const btnRestart = document.getElementById('btn-restart');
  const btnResetAll = document.getElementById('btn-reset-all');
  const btnBack = document.getElementById('btn-back');
  const btnRanking = document.getElementById('btn-ranking');

  if (btnNext) btnNext.addEventListener('click', () => {
    if (gameOver) hideEndOverlay();
    wins += 1;
    localStorage.setItem('memoria_wins', String(wins));
    resetBoard(false);
  });

  if (btnRestart) btnRestart.addEventListener('click', () => {
    if (gameOver) hideEndOverlay();
    resetBoard(false);
  });

  if (btnResetAll) btnResetAll.addEventListener('click', () => {
    if (gameOver) hideEndOverlay();
    wins = 0;
    localStorage.setItem('memoria_wins', String(wins));
    resetBoard(true);
  });

  if (btnRanking) btnRanking.addEventListener('click', () => {
    window.location.href = './ranking.html';
  });

  if (btnBack) btnBack.addEventListener('click', () => {
    window.location.href = '../espaconaves.html';
  });
}