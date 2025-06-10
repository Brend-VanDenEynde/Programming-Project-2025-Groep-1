// src/views/student-speeddates.js
import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { showSettingsPopup } from './student-settings.js';

export function renderSpeeddates(rootElement, studentData = {}) {
  const speeddates = [
    {
      bedrijf: 'Web & Co',
      tijd: '10:00',
      locatie: 'Stand A101',
      status: 'Bevestigd',
    },
    {
      bedrijf: 'DesignXperts',
      tijd: '14:30',
      locatie: 'Stand B202',
      status: 'Bevestigd',
    },
    {
      bedrijf: 'SoftDev BV',
      tijd: '09:00',
      locatie: 'Stand C303',
      status: 'In afwachting',
    },
  ];

  function getStatusBadge(status) {
    if (status === 'Bevestigd') {
      return `<span class="status-badge badge-bevestigd">Bevestigd</span>`;
    } else if (status === 'In afwachting') {
      return `<span class="status-badge badge-waiting">In afwachting</span>`;
    } else {
      return `<span class="status-badge badge-anders">${status}</span>`;
    }
  }

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
            <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>

        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
            <div>
              ${
                speeddates.length === 0
                  ? `<p style="text-align:center;">Je hebt nog geen speeddates ingepland.</p>`
                  : `
                    <div class="speeddates-table-container">
                      <table class="speeddates-table">
                        <thead>
                          <tr>
                            <th>Bedrijf</th>
                            <th>Tijd</th>
                            <th>Locatie</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${speeddates
                            .map(
                              (s) => `
                            <tr>
                              <td>${s.bedrijf}</td>
                              <td>${s.tijd}</td>
                              <td>${s.locatie}</td>
                              <td>${getStatusBadge(s.status)}</td>
                            </tr>
                          `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </div>
                  `
              }
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
        case 'requests':
          renderSpeeddatesRequests(rootElement, studentData);
          break;
        case 'qr':
          renderQRPopup(rootElement, studentData);
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
// // src/views/student-speeddates.js

// import logoIcon from '../Icons/favicon-32x32.png';
// import { renderLogin } from './login.js';
// import { renderStudentProfiel } from './student-profiel.js';
// import { renderSearchCriteriaStudent } from './search-criteria-student.js';
// import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
// import { renderQRPopup } from './student-qr-popup.js';

// export function renderSpeeddates(rootElement, studentData = {}) {
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
//             <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>
//             <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
//             <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
//           </ul>
//         </nav>

//         <!-- MAIN CONTENT: Speeddates -->
//         <div class="student-profile-content">
//           <div class="student-profile-form-container">
//             <h1 class="student-profile-title">Speeddates</h1>

//             <div class="speeddates-list" style="background: #e0e0e0; border-radius: 8px; padding: 1rem; max-height: 60vh; overflow-y: auto;">
//               <!-- Voorbeeld-item 1 -->
//               <div class="speeddate-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #bbb;">
//                 <div>
//                   <div style="font-weight: bold;">Carrefour</div>
//                   <div style="font-size: 0.9rem; color: #333;">12u40</div>
//                 </div>
//                 <div style="font-size: 0.9rem; color: #333;">Lokaal: B0.48</div>
//                 <button class="speeddate-delete-btn" style="background: #ff4d4f; border: none; color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">✕</button>
//               </div>

//               <!-- Voorbeeld-item 2 -->
//               <div class="speeddate-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #bbb;">
//                 <div>
//                   <div style="font-weight: bold;">Philips</div>
//                   <div style="font-size: 0.9rem; color: #333;">12u45</div>
//                 </div>
//                 <div style="font-size: 0.9rem; color: #333;">Lokaal: B0.48</div>
//                 <button class="speeddate-delete-btn" style="background: #ff4d4f; border: none; color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">✕</button>
//               </div>

//               <!-- Voeg hier dynamisch meer speeddates toe indien nodig -->
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- FOOTER -->
//       <footer class="student-profile-footer">
//         <a id="privacy-policy" href="#">Privacy Policy</a> |
//         <a id="contacteer-ons" href="#">Contacteer Ons</a>
//       </footer>
//     </div>
//   `;

//   // Sidebar-navigatie (exact dezelfde data-route afhandeling)
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
//           // al op deze pagina → niets doen
//           break;
//         case 'requests':
//           renderSpeeddatesRequests(rootElement, studentData);
//           break;
//         case 'qr':
//           renderQRPopup(rootElement, studentData);
//           break;
//       }
//     });
//   });

//   // Burger-menu toggler
//   const burger = document.getElementById('burger-menu');
//   const dropdown = document.getElementById('burger-dropdown');
//   burger.addEventListener('click', () => {
//     dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
//   });

//   // Hamburger-opties (alerts)
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

//   // “✕” knop voor elk speeddatetimeeting
//   document.querySelectorAll('.speeddate-delete-btn').forEach(btn => {
//     btn.addEventListener('click', e => {
//       const parent = e.currentTarget.closest('.speeddate-item');
//       const companyName = parent.querySelector('div > div:first-child').textContent;
//       if (confirm(`Weet je zeker dat je speeddatetimeeting met "${companyName}" wilt verwijderen?`)) {
//         parent.remove();
//         console.log(`Speeddatetimeeting met "${companyName}" verwijderd.`);
//       }
//     });
//   });

//   // Footer-links
//   document.getElementById('privacy-policy').addEventListener('click', e => {
//     e.preventDefault();
//     alert('Privacy Policy pagina wordt hier geladen.');
//   });
//   document.getElementById('contacteer-ons').addEventListener('click', e => {
//     e.preventDefault();
//     alert('Contacteer ons formulier wordt hier geladen.');
//   });
// }
