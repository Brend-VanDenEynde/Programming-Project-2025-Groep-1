import { renderLogin } from './login.js';
import { renderRegister } from './register.js';

export function renderHome(rootElement) {
  rootElement.innerHTML = `
    <div class="home-container">
      <img 
        src="/src/Images/EhB-logo-transparant.png" 
        alt="Erasmus Hogeschool Brussels Logo" 
      />

     
      <h2>CAREER LAUNCH 2025</h2>

      <p>Geïnteresseerd?</p>
      <button id="btn-register" class="btn">Registreer je nu!</button>

      <p>Al ingeschreven?</p>
      <button id="btn-login" class="btn">Login</button>
    </div>
      <div class="footer-links">
      <a href="#privacy">Privacy Policy</a>
      <a href="#contact">Contacteer Ons</a>
      <a href="#/admin">Admin</a>
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
