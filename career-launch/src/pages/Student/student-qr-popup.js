import { renderLogin } from '../login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { showSettingsPopup } from './student-settings.js';

export function renderQRPopup(rootElement, studentData = {}) {
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="src/Icons/favicon-32x32.png" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="student-profile-main">
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link active">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Jouw QR-code</h1>
            <div class="qr-code-section">
              <div class="qr-code-label">Laat deze QR-code scannen door bedrijven of tijdens events</div>
              <img id="qr-code-img" src="/src/Images/default.jpg" alt="QR code" class="qr-code-img" style="cursor:pointer;">
              <div class="qr-code-description">(Niet delen op sociale media)</div>
            </div>
          </div>
        </div>
      </div>
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // ====== Sidebar navigatie via router ======
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile':
          window.appRouter.navigate('/Student/Student-Profiel');
          break;
        case 'search':
          window.appRouter.navigate('/Student/Zoek-Criteria');
          break;
        case 'speeddates':
          window.appRouter.navigate('/Student/Student-Speeddates');
          break;
        case 'requests':
          window.appRouter.navigate('/Student/Student-Speeddates-Verzoeken');
          break;
        case 'qr':
          window.appRouter.navigate('/Student/Student-QR-Popup');
          break;
      }
    });
  });

  // ====== Burger menu ======
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', function(event) {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });

    document.getElementById('nav-settings').addEventListener('click', () => {
      dropdown.classList.remove('open');
      showSettingsPopup(() => renderQRPopup(rootElement));
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      window.appRouter.navigate('/login');
    });
  }

  // ====== Footer links via router ======
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    window.appRouter.navigate('/privacy');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    window.appRouter.navigate('/contact');
  });

  // ====== QR CODE POPUP ======
  const qrImg = document.getElementById('qr-code-img');
  if (qrImg) {
    qrImg.addEventListener('click', () => {
      // Overlay maken
      let overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.7)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = 3000;
      overlay.id = 'qr-img-popup-overlay';

      let bigImg = document.createElement('img');
      bigImg.src = qrImg.src;
      bigImg.alt = 'QR code groot';
      bigImg.style.width = 'min(400px, 90vw)';
      bigImg.style.height = bigImg.style.width;
      bigImg.style.maxWidth = '90vw';
      bigImg.style.maxHeight = '90vw';
      bigImg.style.objectFit = 'contain';
      bigImg.style.borderRadius = '18px';
      bigImg.style.boxShadow = '0 8px 40px 0 rgba(44,44,44,0.18)';
      bigImg.style.background = '#fff';
      bigImg.style.padding = '18px';

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });
      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);
    });
  }
}
