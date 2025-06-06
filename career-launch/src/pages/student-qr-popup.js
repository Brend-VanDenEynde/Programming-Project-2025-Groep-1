import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';


// src/views/student-qr-popup.js


export function renderQRPopup(rootElement, studentData = {}) {
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="src/Icons/favicon-32x32.png" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown" style="display: none;">
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
          <div class="student-profile-form-container" style="display: flex; flex-direction: column; align-items: center;">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Jouw QR-code</h1>
            <div style="margin: 2rem 0;">
              <!-- Je zou een echte QR-code kunnen genereren met een backend service. Hier placeholder -->
              <img src=" /src/Images/default.jpg" alt="QR code" style="width: 180px; height: 180px; border: 4px solid #dee2e6; border-radius: 12px; background: #fff;">
            </div>
            <p style="text-align:center;">Laat deze QR-code scannen door bedrijven of tijdens events.<br><span style="font-size:0.95rem;color:#888;">(Niet delen op sociale media)</span></p>
          </div>
        </div>
      </div>

      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

 document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile':
          renderStudentProfiel(rootElement, studentData);
          break;
        case 'search':
          renderSearchCriteriaStudent(rootElement, studentData);
          break;
        case 'speeddates':
          renderSpeeddates(rootElement, studentData);
          break;
        case 'requests':
          renderSpeeddatesRequests(rootElement, studentData);
          break;
       
      }
    });
  });
const burger = document.getElementById('burger-menu');
const dropdown = document.getElementById('burger-dropdown');

if (burger && dropdown) {
  // Toggle hamburger-menu bij klik
  burger.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Sluit het menu bij klik buiten het menu
  document.addEventListener('click', function(event) {
    if (dropdown.style.display === 'block') {
      if (!dropdown.contains(event.target) && event.target !== burger) {
        dropdown.style.display = 'none';
      }
    }
  });

  // Sluit het menu bij klikken op een menu-item
  document.getElementById('nav-settings').addEventListener('click', () => {
    dropdown.style.display = 'none';
    // Navigeren naar Instellingen (eventueel logica hier)
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    dropdown.style.display = 'none';
    renderLogin(rootElement);
  });
}

  
  document.getElementById('nav-settings').addEventListener('click', () => {
    // Navigeren naar Instellingen (nog te implementeren)
  });

   
   
  document.getElementById('nav-logout').addEventListener('click', () => {
    renderLogin(rootElement);
  });

 

  // Footer links
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
