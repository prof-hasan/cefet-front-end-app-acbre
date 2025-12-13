const input = document.querySelector('.login__input');
const button = document.querySelector('.login__button');
const form = document.querySelector('.login-form');

const validateInput = ({ target }) => {
  const value = target.value.trim();
  const errorEl = document.getElementById('input-error');
  if (value.length > 3 && value.length < 10) {
    button.removeAttribute('disabled');
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
    return;
  }

  button.setAttribute('disabled', '');
  if (errorEl) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'O nome deve ter entre 4 e 9 caracteres.';
  }
}

const handleSubmit = (event) => {
  event.preventDefault();

  localStorage.setItem('player', input.value);
  window.location = 'joguinho.html';
}

input.addEventListener('input', validateInput);
form.addEventListener('submit', handleSubmit);
validateInput({ target: input });

const loginImage = document.getElementById('login-image');
const loginAudio = document.getElementById('login-audio');
if (loginImage && loginAudio) {
  loginImage.addEventListener('click', () => {
    try {
      loginAudio.currentTime = 0;
      loginAudio.play().catch(() => {});
    } catch (e) {
    }
  });
}
