import Router from '../router.js';
import ehbLogo from '../Images/EhB-logo-transparant.png';

export function renderHome(rootElement) {
  // Zet altijd light mode bij laden van home
  localStorage.setItem('darkmode', 'false');
  document.body.classList.remove('darkmode');

  rootElement.innerHTML = `
    <div class="home-container">
      <img 
        src="${ehbLogo}"
        alt="Erasmus Hogeschool Brussels Logo" 
      />

     
      <h2>CAREER LAUNCH 2025</h2>

      <p>Geïnteresseerd?</p>
      <button id="btn-register" class="btn" data-route="/registreer">Registreer je nu!</button>      <p>Al ingeschreven?</p>
      <button id="btn-login" class="btn" data-route="/login">Login</button>    </div>      <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
  `; // Event listeners voor buttons (als fallback of voor speciale handling)
  const btnReg = document.getElementById('btn-register');
  const btnLog = document.getElementById('btn-login');

  btnReg.addEventListener('click', () => {
    Router.navigate('/registreer');
  });
  btnLog.addEventListener('click', () => {
    Router.navigate('/login');
  });
  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });
}
