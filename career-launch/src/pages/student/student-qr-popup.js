import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { showSettingsPopup } from './student-settings.js';
import defaultAvatar from '../../images/default.png';
import Router from '../../router.js';

// src/views/student-qr-popup.js

export function renderQRPopup(rootElement, studentData = {}) {
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown">
          <li><button id="nav-profile">Profiel</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="student-profile-main">
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link active">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Jouw QR-code</h1>
            <div class="qr-code-section">
              <div class="qr-code-label">Laat deze QR-code scannen door bedrijven of tijdens events</div>
              <img src="${defaultAvatar}" alt="QR code" class="qr-code-img" id="qr-code-img">
            </div>
          </div>        </div>
      </div>
      
      <footer class="student-profile-footer">
        <div class="footer-content">
          <span>&copy; 2025 EhB Career Launch</span>
          <div class="footer-links">
            <a href="/privacy" data-route="/privacy">Privacy</a>
            <a href="/contact" data-route="/contact">Contact</a>
          </div>
        </div>
      </footer>
      
      <div id="qr-modal" class="qr-modal" style="display:none;position:fixed;z-index:1000;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;">
        <div id="qr-modal-content" style="position:relative;background:#fff;padding:2rem;border-radius:10px;box-shadow:0 2px 16px rgba(0,0,0,0.3);display:flex;flex-direction:column;align-items:center;">
          <img src="${defaultAvatar}" alt="QR code groot" style="width:300px;height:300px;object-fit:contain;" id="qr-modal-img">
        </div>
      </div>
    </div>
  `;

  // --- Sidebar navigatie uniform maken ---
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'search':
            Router.navigate('/student/zoek-criteria');
            break;
          case 'speeddates':
            Router.navigate('/student/student-speeddates');
            break;
          case 'requests':
            Router.navigate('/student/student-speeddates-verzoeken');
            break;
          case 'bedrijven':
            Router.navigate('/student/bedrijven');
            break;
          case 'qr':
            Router.navigate('/student/student-qr-popup');
            break;
        }
      });
    });
  });

  // Burger menu logic (sluit bij klik buiten dropdown)
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    dropdown.classList.remove('open');
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!dropdown.classList.contains('open')) {
        dropdown.classList.add('open');
      } else {
        dropdown.classList.remove('open');
      }
    });
    document.addEventListener('click', function (event) {
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
      showSettingsPopup(() => renderQRPopup(rootElement, studentData));
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      window.sessionStorage.removeItem('studentData');
      window.sessionStorage.removeItem('authToken');
      window.sessionStorage.removeItem('userType');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    });
    // Hamburger menu Profiel knop
    const navProfileBtn = document.getElementById('nav-profile');
    if (navProfileBtn) {
      navProfileBtn.addEventListener('click', () => {
        dropdown.classList.remove('open');
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/student/student-profiel');
        });
      });
    }
  }

  // Footer links (router navigation, consistent)
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

  // QR-code popup functionaliteit (zonder sluitknop, sluit bij klik buiten popup)
  const qrImg = document.getElementById('qr-code-img');
  const qrModal = document.getElementById('qr-modal');
  const qrModalContent = document.getElementById('qr-modal-content');
  if (qrImg && qrModal && qrModalContent) {
    qrImg.style.cursor = 'pointer';
    qrImg.addEventListener('click', () => {
      qrModal.style.display = 'flex';
    });
    qrModal.addEventListener('click', (e) => {
      // Sluit alleen als je buiten de modal-content klikt
      if (e.target === qrModal) {
        qrModal.style.display = 'none';
      }
    });
    // voorkom sluiten bij klik op de content zelf
    qrModalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}
