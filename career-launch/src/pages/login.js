import { renderRegister } from './register.js';

export function renderLogin(rootElement) {
  rootElement.innerHTML = `
    <div class="login-container">
      <div class="login-form">
        <h1>Inloggen</h1>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="email">E-mailadres</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="je.email@voorbeeld.com"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Wachtwoord</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="Minimaal 8 karakters"
              minlength="8"
            >
          </div>
          
          <button type="submit" class="login-btn">Inloggen</button>
        </form>
        
        <div class="login-link">
          <p>Heb je nog geen account? 
            <a id="register-link" style="cursor:pointer;">Registreren</a>
          </p>
        </div>
      </div>
    </div>
  `;

  // 1) Event listener voor het login-formulier
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', handleLogin);

  // 2) Event listener voor de “Registreren”-link
  const registerLink = document.getElementById('register-link');
  registerLink.addEventListener('click', () => {
    renderRegister(rootElement);
  });
}

function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email').trim();
  const password = formData.get('password');

  // Simpele validatie
  if (!email || !password) {
    alert('Vul zowel e-mailadres als wachtwoord in.');
    return;
  }
  if (password.length < 8) {
    alert('Wachtwoord moet minimaal 8 karakters bevatten!');
    return;
  }

  // TODO: stuur credentials naar je backend
  console.log('Inlogdata:', { email, password });
  alert(`Welkom terug, ${email}!`);

}
