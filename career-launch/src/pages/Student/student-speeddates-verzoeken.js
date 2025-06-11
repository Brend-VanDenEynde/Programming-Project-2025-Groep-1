// src/views/student-speeddates-verzoeken.js
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderQRPopup } from './student-qr-popup.js';
import { showSettingsPopup } from './student-settings.js';

export function renderSpeeddatesRequests(rootElement, studentData = {}) {
  let verzoeken = [
    {
      bedrijf: 'Web & Co',
      lokaal: 'B102',
      tijd: '13:30',
      status: 'Geaccepteerd',
    },
    {
      bedrijf: 'DesignXperts',
      lokaal: 'A201',
      tijd: '11:00',
      status: 'In afwachting',
    },
    {
      bedrijf: 'SoftDev BV',
      lokaal: 'C004',
      tijd: '15:00',
      status: 'In afwachting',
    },
  ];

  function renderTable() {
    const tableHtml = verzoeken.length === 0
      ? `<p style="text-align:center;">Nog geen speeddates-verzoeken gevonden.</p>`
      : `
        <div class="speeddates-table-container">
          <table class="speeddates-table">
            <thead>
              <tr>
                <th>Bedrijf</th>
                <th>Lokaal</th>
                <th>Tijd</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${verzoeken.map((v, idx) => `
                <tr>
                  <td>${v.bedrijf}</td>
                  <td>${v.lokaal}</td>
                  <td>${v.tijd}</td>
                  <td class="status-cell">
                    ${
                      v.status === 'Geaccepteerd'
                        ? `<span class="status-badge badge-accepted">Geaccepteerd</span>`
                        : v.status === 'Geweigerd'
                          ? `<span class="status-badge badge-denied">Geweigerd</span>`
                          : `
                            <button class="accept-btn" data-idx="${idx}">Accepteer</button>
                            <button class="deny-btn" data-idx="${idx}">Weiger</button>
                          `
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    document.getElementById('speeddates-requests-table').innerHTML = tableHtml;

    document.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
        verzoeken[idx].status = 'Geaccepteerd';
        renderTable();
      });
    });
    document.querySelectorAll('.deny-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
        verzoeken[idx].status = 'Geweigerd';
        renderTable();
      });
    });
  }

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
            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Speeddates-verzoeken</h1>
            <div id="speeddates-requests-table"></div>
          </div>
        </div>
      </div>

      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  renderTable();

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

const burger = document.getElementById('burger-menu');
const dropdown = document.getElementById('burger-dropdown');

if (burger && dropdown) {
  // Toggle menu bij klik op burger
  burger.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Sluit menu bij klik buiten menu of burger
  document.addEventListener('click', function(event) {
    if (
      dropdown.classList.contains('open') &&
      !dropdown.contains(event.target) &&
      event.target !== burger
    ) {
      dropdown.classList.remove('open');
    }
  });

  // Navigeer via de router!
  document.getElementById('nav-settings').addEventListener('click', () => {
    dropdown.classList.remove('open');
    showSettingsPopup(() => renderSpeeddatesRequests(rootElement));
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    dropdown.classList.remove('open');
    window.appRouter.navigate('/login');
  });
}


  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
