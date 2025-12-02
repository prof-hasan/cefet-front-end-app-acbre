const tela = document.getElementById('tela-jogo');
const contexto = tela.getContext('2d');
const elementoPontuacao = document.getElementById('pontuacao');

const LARGURA_JOGADOR = 40;
const ALTURA_JOGADOR = 40;
const LARGURA_INIMIGO = 40;
const ALTURA_INIMIGO = 40;

const jogo = {
  jogador: {
    x: tela.width / 2 - LARGURA_JOGADOR / 2,
    y: tela.height - ALTURA_JOGADOR - 10,
    velocidade: 5,
    tiros: [],
    pontuacao: 0
  },
  inimigos: [],
  teclas: {},
  gameOver: false
};

class Tiro {
  constructor(x, y, ehInimigo = false) {
    this.x = x;
    this.y = y;
    this.largura = 5;
    this.altura = 10;
    this.velocidade = ehInimigo ? 4 : -7;
    this.ehInimigo = ehInimigo;
  }

  desenhar() {
    contexto.fillStyle = this.ehInimigo ? 'red' : 'white';
    contexto.fillRect(this.x, this.y, this.largura, this.altura);
  }

  mover() {
    this.y += this.velocidade;
  }
}

class Inimigo {
  constructor() {
    this.x = Math.random() * (tela.width - LARGURA_INIMIGO);
    this.y = 0;
    this.velocidade = Math.random() * 2 + 1;
    this.intervaloTiro = Math.random() * 100 + 50;
    this.contadorTiro = 0;
  }

  desenhar() {
    contexto.fillStyle = 'red';
    contexto.fillRect(this.x, this.y, LARGURA_INIMIGO, ALTURA_INIMIGO);
  }

  mover() {
    this.y += this.velocidade;
    this.contadorTiro++;
    if (this.contadorTiro >= this.intervaloTiro) {
      this.atirar();
      this.contadorTiro = 0;
    }
  }

  atirar() {
    jogo.jogador.tiros.push(new Tiro(this.x + LARGURA_INIMIGO / 2, this.y + ALTURA_INIMIGO, true));
  }
}

function desenharJogador() {
  contexto.fillStyle = 'blue';
  contexto.fillRect(jogo.jogador.x, jogo.jogador.y, LARGURA_JOGADOR, ALTURA_JOGADOR);
}

function moverJogador() {
  if (jogo.gameOver) return;

  if ((jogo.teclas['ArrowLeft'] || jogo.teclas['a']) && jogo.jogador.x > 0) {
    jogo.jogador.x -= jogo.jogador.velocidade;
  }
  if ((jogo.teclas['ArrowRight'] || jogo.teclas['d']) && jogo.jogador.x < tela.width - LARGURA_JOGADOR) {
    jogo.jogador.x += jogo.jogador.velocidade;
  }
  if ((jogo.teclas['ArrowUp'] || jogo.teclas['w']) && jogo.jogador.y > 0) {
    jogo.jogador.y -= jogo.jogador.velocidade;
  }
  if ((jogo.teclas['ArrowDown'] || jogo.teclas['s']) && jogo.jogador.y < tela.height - ALTURA_JOGADOR) {
    jogo.jogador.y += jogo.jogador.velocidade;
  }
}

function atirar() {
  if (!jogo.gameOver) {
    jogo.jogador.tiros.push(new Tiro(jogo.jogador.x + LARGURA_JOGADOR / 2, jogo.jogador.y));
  }
}

function atualizarTiros() {
  jogo.jogador.tiros = jogo.jogador.tiros.filter(tiro => {
    tiro.mover();

    if (!tiro.ehInimigo) {
      jogo.inimigos = jogo.inimigos.filter(inimigo => {
        if (verificarColisao(tiro, inimigo)) {
          jogo.jogador.pontuacao += 10;
          elementoPontuacao.textContent = `Pontuação: ${jogo.jogador.pontuacao}`;
          return false;
        }
        return true;
      });
    }

    if (!jogo.gameOver && tiro.ehInimigo && verificarColisao(tiro, jogo.jogador)) {
      jogo.gameOver = true;
    }
    return tiro.y > 0 && tiro.y < tela.height;
  });
}

function verificarColisao(objeto1, objeto2) {
  return !(objeto1.x > objeto2.x + LARGURA_INIMIGO ||
           objeto1.x + objeto1.largura < objeto2.x ||
           objeto1.y > objeto2.y + ALTURA_INIMIGO ||
           objeto1.y + objeto1.altura < objeto2.y);
}

function atualizarInimigos() {
  if (!jogo.gameOver) {
    if (Math.random() < 0.02) {
      jogo.inimigos.push(new Inimigo());
    }
    jogo.inimigos = jogo.inimigos.filter(inimigo => {
      inimigo.mover();
      return inimigo.y <= tela.height;
    });
  }
}

function desenhar() {
  contexto.clearRect(0, 0, tela.width, tela.height);
  desenharJogador();
  jogo.jogador.tiros.forEach(tiro => tiro.desenhar());
  jogo.inimigos.forEach(inimigo => inimigo.desenhar());

  if (jogo.gameOver) {
    contexto.fillStyle = 'rgba(0, 0, 0, 0.5)';
    contexto.fillRect(0, 0, tela.width, tela.height);
    contexto.fillStyle = 'red';
    contexto.font = '48px Arial';
    contexto.textAlign = 'center';
    contexto.fillText('GAME OVER', tela.width / 2, tela.height / 2);
    contexto.font = '20px Arial';
    contexto.fillText(`Pontuação: ${jogo.jogador.pontuacao}`, tela.width / 2, tela.height / 2 + 40);
    contexto.fillText('Pressione ENTER para reiniciar', tela.width / 2, tela.height / 2 + 80);
  }
}

function loopJogo() {
  moverJogador();
  atualizarTiros();
  atualizarInimigos();
  desenhar();
  requestAnimationFrame(loopJogo);
}

function reiniciarJogo() {
  jogo.jogador.x = tela.width / 2 - LARGURA_JOGADOR / 2;
  jogo.jogador.y = tela.height - ALTURA_JOGADOR - 10;
  jogo.jogador.tiros = [];
  jogo.inimigos = [];
  jogo.jogador.pontuacao = 0;
  elementoPontuacao.textContent = 'Pontuação: 0';
  jogo.gameOver = false;
}

window.addEventListener('keydown', (evento) => {
  jogo.teclas[evento.key] = true;
  if (evento.key === 'Enter' && jogo.gameOver) reiniciarJogo();
  if (evento.key === ' ' && !jogo.gameOver) atirar();
});

window.addEventListener('keyup', (evento) => {
  jogo.teclas[evento.key] = false;
});

loopJogo();