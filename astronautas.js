// Seleção do cartão
  const card = document.getElementById('card');

  // Alterna a classe is-flipped no clique (útil para toque)
  card.addEventListener('click', () => {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));
  });

  // Acessibilidade: permite virar com Enter / Space
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
      ev.preventDefault(); // evita scroll no Space
      card.click();
    }
  });

  // Evita que duplo toque na tela cause seleção
  card.addEventListener('touchstart', (e) => {
    // nada especial — apenas para melhorar responsividade se desejar
  }, {passive: true});