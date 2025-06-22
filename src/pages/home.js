import Router from '../router.js';
import { showCookieBanner } from '../utils/cookie-banner.js';
import ehbLogo from '/images/EhB-logo-transparant.png';

export function renderHome(rootElement) {
  // Zet altijd light mode bij laden van home
  localStorage.setItem('darkmode', 'false');
  document.body.classList.remove('darkmode');

  rootElement.innerHTML = `
    <div class="home-background">
      <div class="home-container">
        <img 
          src="${ehbLogo}"
          alt="Erasmus Hogeschool Brussels Logo" 
        />

         
          <h2>CAREER LAUNCH 2025</h2>

          <p>Geïnteresseerd?</p>
          <button id="btn-register" class="btn" data-route="/registreer">Registreer je nu!</button>
          <p>Al ingeschreven?</p>
          <button id="btn-login" class="btn" data-route="/login">Login</button>
          <!-- FOOTER -->
          <footer class="student-profile-footer">
            <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
            <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
          </footer>
        </div>
      </div>
    </div>`;

  // Event listeners voor navigatie knoppen
  const btnReg = document.getElementById('btn-register');
  const btnLog = document.getElementById('btn-login');

  if (btnReg) {
    btnReg.addEventListener('click', () => {
      Router.navigate('/registreer');
    });
  }

  if (btnLog) {
    btnLog.addEventListener('click', () => {
      Router.navigate('/login');
    });
  }

  // Footer links: gebruik alleen Router.navigate, geen hash of import
  const privacyLink = document.querySelector('a[href="/privacy"]');
  if (privacyLink) {
    privacyLink.setAttribute('href', '#');
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/privacy');
    });
  }
  const contactLink = document.querySelector('a[href="/contact"]');
  if (contactLink) {
    contactLink.setAttribute('href', '#');
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/contact');
    });
  }
}

showCookieBanner();