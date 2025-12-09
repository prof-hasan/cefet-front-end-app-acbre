let playerName = "";
let canvas, ctx;
let player = { x: 275, y: 350, width: 50, height: 50, speed: 5 };
let enemies = [];
let bullets = [];
let enemyBullets = [];
let obstacles = [];
let powerUps = []; 
let stars = [];
let score = 0;
let level = 1;
let enemySpeed = 2;
let bulletSpeed = 15;
let enemyBulletSpeed = 1000;
let lastShot = 0;
let gameRunning = false;
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
let lives = 1; 
let shieldActive = false;  
let shieldEndTime = 0;
let tripleShotActive = false;  
let tripleShotEndTime = 0;

// Novo: sons
let sounds = {};
function loadSounds() {
  sounds.shoot = new Audio('tiro.wav');
  sounds.enemyShoot = new Audio('tiro_inimigo.wav');
  sounds.explosion = new Audio('explosao.wav');
  sounds.powerup = new Audio('powerup.wav');
  sounds.gameover = new Audio('gameover.wav');
}
function playSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play().catch(() => {});  
  }
}

let playerImg = new Image();
playerImg.src = "nave.png";

let enemyImg = new Image();
enemyImg.src = "inimigo.png";

function startGame() {
  playerName = document.getElementById("playerName").value || "Jogador Anônimo";
  loadSounds();  
  document.getElementById("login").style.display = "none";
  document.getElementById("game").style.display = "block";
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  initStars();
  initLevel();
  gameRunning = true;
  gameLoop();
}

function initStars() {
  stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
    });
  }
}

function initLevel() {
  enemies = [];
  obstacles = [];
  powerUps = [];  
  let numEnemies = 5 + (level - 1) * 2;
  let enemiesPerRow = 8;
  let rows = Math.ceil(numEnemies / enemiesPerRow);
  for (let row = 0; row < rows; row++) {
    for (
      let col = 0;
      col < enemiesPerRow && row * enemiesPerRow + col < numEnemies;
      col++
    ) {
      enemies.push({
        x: col * 70 + 30,  
        y: 50 + row * 40,
        width: 30,
        height: 30,
        dx: enemySpeed,
        lastShot: Date.now(), 
      });
    }
  }
  enemyBulletSpeed *= 2.2;
  if (enemyBulletSpeed > 6) enemyBulletSpeed = 6;  

  if (level >= 2 && level <= 4) {
    obstacles.push({
      x: 50,  
      y: 300,  
      width: 100,
      height: 18,  
    });
    obstacles.push({
      x: canvas.width - 150,  
      y: 300,
      width: 100,
      height: 18,
    });
  }

  if (level >= 1) {
    enemySpeed += 0.1;  
  }
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  stars.forEach((star) => {
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
  });

  if (level >= 3 && Math.random() < 0.002) { 
    let types = ['shield', 'tripleShot', 'extraLife'];
    powerUps.push({
      x: Math.random() * (canvas.width - 20),
      y: 0,
      type: types[Math.floor(Math.random() * types.length)],
      dy: 2,  
      spawnTime: Date.now(),
    });
  }

  powerUps.forEach((pu, index) => {
    pu.y += pu.dy;
    if (pu.y > canvas.height || Date.now() - pu.spawnTime > 10000) {  // Expira em 10s
      powerUps.splice(index, 1);
    }
  });

  if (shieldActive && Date.now() > shieldEndTime) shieldActive = false;
  if (tripleShotActive && Date.now() > tripleShotEndTime) tripleShotActive = false;

  let moveLeft = keys["a"] && player.x > 0;
  let moveRight = keys["d"] && player.x < canvas.width - player.width;
  if (moveLeft && !moveRight) player.x -= player.speed;
  if (moveRight && !moveLeft) player.x += player.speed;

  enemies.forEach((enemy) => {
    enemy.x += enemy.dx;
    if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) enemy.dx *= -1;

    let chance = 0.01 + level * 0.001;
    if (Math.random() < chance) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        dy: enemyBulletSpeed,
      });
      enemy.lastShot = Date.now();
      playSound('enemyShoot'); 
    }
  });

  bullets.forEach((bullet, index) => {
    bullet.y -= bulletSpeed;
    if (bullet.y < 0) bullets.splice(index, 1);
  });

  enemyBullets.forEach((bullet, index) => {
    bullet.y += bullet.dy;
    if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
  });

  enemyBullets.forEach((bullet, index) => {
    obstacles.forEach((obstacle) => {
      if (
        bullet.x < obstacle.x + obstacle.width &&
        bullet.x + 10 > obstacle.x &&
        bullet.y < obstacle.y + obstacle.height &&
        bullet.y + 10 > obstacle.y
      ) {
        enemyBullets.splice(index, 1);
      }
    });
  });

  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + 10 > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + 10 > enemy.y
      ) {
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        score += 15;  
        playSound('explosion');  
        if (enemies.length === 0) {
          level++;
          initLevel();
        }
      }
    });
  });

  powerUps.forEach((pu, index) => {
    if (
      player.x < pu.x + 20 &&
      player.x + player.width > pu.x &&
      player.y < pu.y + 20 &&
      player.y + player.height > pu.y
    ) {
      powerUps.splice(index, 1);
      playSound('powerup');  
      if (pu.type === 'shield') {
        shieldActive = true;
        shieldEndTime = Date.now() + 5000;
      } else if (pu.type === 'tripleShot') {
        tripleShotActive = true;
        tripleShotEndTime = Date.now() + 10000;
      } else if (pu.type === 'extraLife') {
        lives++;
      }
    }
  });

  if (!shieldActive) {
    enemyBullets.forEach((bullet, index) => {
      let bulletCenterX = bullet.x + 5;  
      let bulletCenterY = bullet.y + 5;
      if (
        bulletCenterX < player.x + player.width &&
        bulletCenterX > player.x &&
        bulletCenterY < player.y + player.height &&
        bulletCenterY > player.y
      ) {
        lives--;
        if (lives <= 0) gameOver();
        enemyBullets.splice(index, 1); 
      }
    });
  }

  if (!shieldActive) {
    enemies.forEach((enemy) => {
      let playerCenterX = player.x + player.width / 2;
      let playerCenterY = player.y + player.height / 2;
      if (
        enemy.x < playerCenterX + 20 && 
        enemy.x + enemy.width > playerCenterX - 20 &&
        enemy.y < playerCenterY + 20 &&
        enemy.y + enemy.height > playerCenterY - 20
      ) {
        lives--;
        if (lives <= 0) gameOver();
      }
    });
  }

  obstacles.forEach((obstacle) => {
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    ) {
      gameOver();
    }
  });

  bullets.forEach((bullet, index) => {
    obstacles.forEach((obstacle) => {
      if (
        bullet.x < obstacle.x + obstacle.width &&
        bullet.x + 10 > obstacle.x &&
        bullet.y < obstacle.y + obstacle.height &&
        bullet.y + 10 > obstacle.y
      ) {
        bullets.splice(index, 1);
      }
    });
  });

  document.getElementById("score").textContent =
    `Pontuação: ${score} | Nível: ${level} | Vidas: ${lives}`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  stars.forEach((star) => ctx.fillRect(star.x, star.y, 1, 1));

  obstacles.forEach((obstacle) => {
    let gradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
    gradient.addColorStop(0, "#001122");  
    gradient.addColorStop(1, "#00aaff"); 
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#00aaff"; 
    ctx.shadowBlur = 10;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.shadowBlur = 0; 
  });

  powerUps.forEach((pu) => {
    ctx.fillStyle = pu.type === 'shield' ? '#00aaff' : pu.type === 'tripleShot' ? '#ffff00' : '#00ff00';
    ctx.fillRect(pu.x, pu.y, 20, 20);
  });

  if (shieldActive) {
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 15;
  }
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0; 
  enemies.forEach((enemy) => {
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
  });

  ctx.fillStyle = "#ffff00";
  bullets.forEach((bullet) => ctx.fillRect(bullet.x, bullet.y, 10, 10));

  ctx.fillStyle = "#ff00ff";
  enemyBullets.forEach((bullet) => ctx.fillRect(bullet.x, bullet.y, 10, 10));
}

function gameOver() {
  gameRunning = false;
  playSound('gameover');  
  ranking.push({ name: playerName, score: score });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);
  localStorage.setItem("ranking", JSON.stringify(ranking));

  document.getElementById("finalScore").textContent = `Sua pontuação: ${score}`;
  document.getElementById("rankingList").innerHTML = ranking
    .map((entry) => `<li>${entry.name}: ${entry.score}</li>`)
    .join("");
  document.getElementById("game").style.display = "none";
  document.getElementById("gameOver").style.display = "block";
}

function restartGame() {
  score = 0;
  level = 1;
  enemyBulletSpeed = 3;
  enemySpeed = 2;
  lives = 1; 
  shieldActive = false;
  tripleShotActive = false;
  bullets = [];
  enemyBullets = [];
  obstacles = [];
  powerUps = [];
  document.getElementById("gameOver").style.display = "none";
  startGame();
}

let keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " ") {
    e.preventDefault();
    if (Date.now() - lastShot > 500) {
      playSound('shoot');  
      if (tripleShotActive) {
        bullets.push({ x: player.x + player.width / 2 - 15, y: player.y });
        bullets.push({ x: player.x + player.width / 2 - 5, y: player.y });
        bullets.push({ x: player.x + player.width / 2 + 5, y: player.y });
      } else {
        bullets.push({ x: player.x + player.width / 2 - 5, y: player.y });
      }
      lastShot = Date.now();
    }
  }
});
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));