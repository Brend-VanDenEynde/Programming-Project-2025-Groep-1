import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { showSettingsPopup } from './student-settings.js';

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
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Jouw QR-code</h1>
            <div class="qr-code-section">
              <div class="qr-code-label">Laat deze QR-code scannen door bedrijven of tijdens events</div>
              <img src="/src/Images/default.jpg" alt="QR code" class="qr-code-img">
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
    document.addEventListener('click', function (event) {
      if (dropdown.style.display === 'block') {
        if (!dropdown.contains(event.target) && event.target !== burger) {
          dropdown.style.display = 'none';
        }
      }
    });

    // Sluit het menu bij klikken op een menu-item
    document.getElementById('nav-settings').addEventListener('click', () => {
      dropdown.style.display = 'none';
      showSettingsPopup();
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
// // src/views/student-qr-popup.js

// import logoIcon from '../Icons/favicon-32x32.png';
// import { renderLogin } from './login.js';
// import { renderStudentProfiel } from './student-profiel.js';
// import { renderSearchCriteriaStudent } from './search-criteria-student.js';
// import { renderSpeeddates } from './student-speeddates.js';
// import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';

// export function renderQRPopup(rootElement, studentData = {}) {
//   // Bouw de volledige “overlay” inclusief header/sidebar/footer en QR‐inhoud
//   rootElement.innerHTML = `
//     <div class="student-profile-container">
//       <!-- HEADER -->
//       <header class="student-profile-header">
//         <div class="logo-section">
//           <img
//             src="${logoIcon}"
//             alt="Logo EhB Career Launch"
//             width="32"
//             height="32"
//           />
//           <span>EhB Career Launch</span>
//         </div>
//         <button id="burger-menu" class="student-profile-burger">☰</button>
//         <ul id="burger-dropdown" class="student-profile-dropdown" style="display: none;">
//           <li><button id="nav-dashboard">Dashboard</button></li>
//           <li><button id="nav-settings">Instellingen</button></li>
//           <li><button id="nav-delete-account">Verwijder account</button></li>
//           <li><button id="nav-logout">Log out</button></li>
//         </ul>
//       </header>

//       <div class="student-profile-main">
//         <!-- SIDEBAR -->
//         <nav class="student-profile-sidebar">
//           <ul>
//             <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
//             <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
//             <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
//             <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
//             <li><button data-route="qr" class="sidebar-link active">QR-code</button></li>
//           </ul>
//         </nav>

//         <!-- MAIN CONTENT: QR-code -->
//         <div class="student-profile-content">
//           <div class="student-profile-form-container" style="text-align: center;">
//             <h1 class="student-profile-title">Jouw QR-code</h1>

//             <div style="margin: 2rem auto; width: 300px; height: 300px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
//               <!-- Placeholder – vervang door <img src="pad/naar/qr.png" alt="QR-code" class="qr-image" /> zodra je echte QR-afbeelding hebt -->
//               <svg width="250" height="250">
//                 <rect x="0" y="0" width="250" height="250" fill="#d0d0d0" />
//               </svg>
//             </div>

//           </div>
//         </div>
//       </div>

//       <!-- FOOTER -->
//       <footer class="student-profile-footer">
//         <a id="privacy-policy" href="#" class="footer-link">Privacy Policy</a> |
//         <a id="contacteer-ons" href="#" class="footer-link">Contacteer Ons</a>
//       </footer>
//     </div>
//   `;

//   // Sidebar‐navigatie (ieder “.sidebar-link” wacht op data-route)
//   document.querySelectorAll('.sidebar-link').forEach(btn => {
//     btn.addEventListener('click', e => {
//       const route = e.currentTarget.getAttribute('data-route');
//       switch (route) {
//         case 'profile':
//           renderStudentProfiel(rootElement, studentData);
//           break;
//         case 'search':
//           renderSearchCriteriaStudent(rootElement, studentData);
//           break;
//         case 'speeddates':
//           renderSpeeddates(rootElement, studentData);
//           break;
//         case 'requests':
//           renderSpeeddatesRequests(rootElement, studentData);
//           break;
//         case 'qr':
//           // al op deze pagina → niets doen
//           break;
//       }
//     });
//   });

//   // Burger‐menu toggler
//   const burger = document.getElementById('burger-menu');
//   const dropdown = document.getElementById('burger-dropdown');
//   burger.addEventListener('click', () => {
//     dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
//   });

//   // Hamburger‐opties (alerts of dummy‐functionaliteit)
//   document.getElementById('nav-dashboard').addEventListener('click', () => {
//     alert('Navigeren naar Dashboard (nog te implementeren)');
//   });
//   document.getElementById('nav-settings').addEventListener('click', () => {
//     alert('Navigeren naar Instellingen (nog te implementeren)');
//   });
//   document.getElementById('nav-delete-account').addEventListener('click', () => {
//     if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
//       alert('Account verwijderen (nog te implementeren)');
//     }
//   });
//   document.getElementById('nav-logout').addEventListener('click', () => {
//     renderLogin(rootElement);
//   });

//   // Footer‐links (prevent default + alert of toekomstige navigatie)
//   document.getElementById('privacy-policy').addEventListener('click', e => {
//     e.preventDefault();
//     alert('Privacy Policy pagina wordt hier geladen.');
//   });
//   document.getElementById('contacteer-ons').addEventListener('click', e => {
//     e.preventDefault();
//     alert('Contacteer ons formulier wordt hier geladen.');
//   });
// }
