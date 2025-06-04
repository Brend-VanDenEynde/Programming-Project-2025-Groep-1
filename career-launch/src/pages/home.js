//import { renderLogin } from './login.js';
//import { renderRegister } from './register.js';

export function renderHome(rootElement) {
  rootElement.innerHTML = `
    <div class="home-container">
      <img 
        src="/src/Images/EhB-logo-transparant.png" 
        alt="EHB Logo" 
        style="max-width: 200px; margin-bottom: 24px;"
      />

      <h1>Erasmus Hogeschool</h1>
      <h2>Career Launch</h2>

      <p>Geïnteresseerd?</p>
      <button id="btn-register" class="btn">Registreer nu!</button>

      <p>Al ingeschreven?</p>
      <button id="btn-login" class="btn">Login</button>
    </div>
  `;

  const btnReg = document.getElementById('btn-register');
  const btnLog = document.getElementById('btn-login');

  btnReg.addEventListener('click', () => {
    renderRegister(rootElement);
  });

  btnLog.addEventListener('click', () => {
    renderLogin(rootElement);
  });
}
