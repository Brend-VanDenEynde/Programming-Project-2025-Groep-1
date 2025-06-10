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
                        ? `<span class="badge-accepted">Geaccepteerd</span>`
                        : v.status === 'Geweigerd'
                          ? `<span class="badge-denied">Geweigerd</span>`
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
          renderStudentProfiel(rootElement, studentData);
          break;
        case 'search':
          renderSearchCriteriaStudent(rootElement, studentData);
          break;
        case 'speeddates':
          renderSpeeddates(rootElement, studentData);
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
    showSettingsPopup();
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    dropdown.style.display = 'none';
    renderLogin(rootElement);
  });
}

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
