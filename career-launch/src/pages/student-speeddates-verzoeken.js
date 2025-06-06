// src/views/student-speeddates-verzoeken.js
import { renderLogin } from './login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderQRPopup } from './student-qr-popup.js';

if (!document.getElementById('speeddates-verzoeken-styles')) {
  const style = document.createElement('style');
  style.id = 'speeddates-verzoeken-styles';
  style.innerHTML = `
    .speeddates-table-container {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 2px 16px 0 rgba(44,44,44,0.08);
      padding: 18px 10px 32px 10px;
      margin: 32px auto 0 auto;
      max-width: 960px;
    }
    .speeddates-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 1.08rem;
      background: none;
    }
    .speeddates-table thead tr {
      background: #f6f7fb;
      font-size: 1.12rem;
    }
    .speeddates-table th, .speeddates-table td {
      padding: 20px 18px;
      border-bottom: 1.5px solid #ececec;
      vertical-align: middle;
      font-weight: 500;
    }
    .speeddates-table th {
      color: #22293c;
      font-weight: 700;
      letter-spacing: 0.02em;
      background: #f6f7fb;
      border-bottom: 2px solid #e1e6ef;
      vertical-align: middle;
      text-align: center;
    }
    .speeddates-table td {
      text-align: center;
    }
    .speeddates-table tbody tr:last-child td {
      border-bottom: none;
    }
    .status-cell {
      display: flex;
      align-items: center;
      gap: 14px;
      min-height: 56px;
      justify-content: center;
    }
    .accept-btn, .deny-btn {
      min-width: 110px;
      padding: 9px 0;
      border: none;
      border-radius: 22px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      margin: 0 3px;
      box-shadow: 0 2px 6px 0 rgba(44,44,44,0.05);
      transition: background 0.17s, color 0.17s, box-shadow 0.17s;
      display: inline-block;
    }
    .accept-btn {
      background: linear-gradient(90deg, #3dd686 0%, #28bb8a 100%);
      color: #fff;
    }
    .accept-btn:hover {
      background: linear-gradient(90deg, #28bb8a 0%, #3dd686 100%);
      color: #fff;
      box-shadow: 0 3px 16px 0 rgba(61,214,134,0.13);
    }
    .deny-btn {
      background: linear-gradient(90deg, #fa626a 0%, #fd7855 100%);
      color: #fff;
    }
    .deny-btn:hover {
      background: linear-gradient(90deg, #fd7855 0%, #fa626a 100%);
      color: #fff;
      box-shadow: 0 3px 16px 0 rgba(250,98,106,0.13);
    }
    .badge-accepted {
      background: #e1f9ec;
      color: #2aa97b !important;
      padding: 10px 32px;
      border-radius: 22px;
      font-weight: 700;
      display: inline-block;
      min-width: 130px;
      text-align: center;
      font-size: 1.05rem;
      border: none;
    }
    .badge-denied {
      background: #fff2f3;
      color: #ee2b43 !important;
      padding: 10px 32px;
      border-radius: 22px;
      font-weight: 700;
      display: inline-block;
      min-width: 130px;
      text-align: center;
      font-size: 1.05rem;
      border: none;
    }
    @media (max-width: 700px) {
      .speeddates-table-container {padding: 0;}
      .speeddates-table th, .speeddates-table td {padding: 13px 4px;font-size:0.98rem;}
      .accept-btn, .deny-btn, .badge-accepted, .badge-denied {min-width:80px;padding:7px 0;}
    }
  `;
  document.head.appendChild(style);
}

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
                  <td>
                    <div class="status-cell">
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
                    </div>
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
          <li><button id="nav-dashboard">Dashboard</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-delete-account">Verwijder account</button></li>
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
    burger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.getElementById('nav-dashboard').addEventListener('click', () => {});
  document.getElementById('nav-settings').addEventListener('click', () => {});
  document.getElementById('nav-delete-account').addEventListener('click', () => {
    if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
      // Account verwijderen (nog te implementeren)
    }
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
