// src/views/student-speeddates.js
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { showSettingsPopup } from './student-settings.js';
import { fetchStudentSpeeddates } from '../../utils/data-api.js';


// Nieuw: API fetch
async function fetchSpeeddates(filter = null) {
  const token = sessionStorage.getItem('authToken');
  let url = 'https://api.ehb-match.me/speeddates';
  if (filter === 'Geaccepteerd') {
    url += '/accepted';
  } else if (filter === 'In afwachting') {
    url += '/pending';
  }
  const resp = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Kon speeddates niet ophalen: ${resp.status} – ${txt}`);

  }
  return await resp.json(); // array met speeddate-objecten
}

function getStatusBadge(akkoord) {
  return akkoord
    ? '<span class="status-badge badge-accepted">Geaccepteerd</span>'
    : '<span class="status-badge badge-waiting">In afwachting</span>';
}

function renderSpeeddatesError(root, err) {
  root.innerHTML = `
    <div class="error">Fout bij ophalen speeddates:<br>${err.message}</div>
    <button id="reload-speeddates">Probeer opnieuw</button>
  `;
  document.getElementById('reload-speeddates').onclick = () => renderSpeeddates(root);
}

let currentSort = [{ key: 'begin', asc: true }];
let currentStatusFilter = null; // null = alles tonen

function getSortArrow(key) {
  const found = currentSort.find(s => s.key === key);
  if (!found) return '';
  return found.asc ? ' ▲' : ' ▼';
}

export async function renderSpeeddates(rootElement, studentData = {}) {
  let speeddates = [];
  try {
    speeddates = await fetchSpeeddates(currentStatusFilter);
  } catch (e) {
    console.error(e);
    speeddates = []; // Fallback: leeg array bij API-fout
  }

  // Sorteren (meerdere kolommen)
  const sorted = [...speeddates].sort((a, b) => {
    for (const sort of currentSort) {
      let aVal = a[sort.key];
      let bVal = b[sort.key];
      if (sort.key === 'begin') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sort.key === 'akkoord') {
        aVal = aVal === true ? 1 : 0;
        bVal = bVal === true ? 1 : 0;
      }
      if (aVal < bVal) return sort.asc ? -1 : 1;
      if (aVal > bVal) return sort.asc ? 1 : -1;
    }
    return 0;
  });

  const tableRows = sorted
    .map(
      (s) => `
    <tr>
      <td>${s.naam_bedrijf}</td>
      <td>${s.begin ? new Date(s.begin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
      <td>${s.lokaal || ''}</td>
      <td>${getStatusBadge(s.akkoord)}</td>
    </tr>
  `
    )
    .join('');

  // Now render the complete page with the fetched data
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
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
            <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>

        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
            <div class="filter-buttons" style="margin-bottom:10px;text-align:center;">
              <button class="filter-btn${currentStatusFilter === null ? ' active' : ''}" data-status="all">Alles</button>
              <button class="filter-btn${currentStatusFilter === 'Geaccepteerd' ? ' active' : ''}" data-status="Geaccepteerd">Geaccepteerd</button>
              <button class="filter-btn${currentStatusFilter === 'In afwachting' ? ' active' : ''}" data-status="In afwachting">In afwachting</button>
            </div>
            <div>
              ${
                sorted.length === 0
                  ? `<p style="text-align:center;">Geen speeddates gevonden.</p>`
                  : `
                    <div class="speeddates-table-container">
                      <table class="speeddates-table">
                        <thead>
                          <tr>
                            <th class="sortable" data-key="naam_bedrijf">Bedrijf${getSortArrow('naam_bedrijf')}</th>
                            <th class="sortable" data-key="begin">Tijd${getSortArrow('begin')}</th>
                            <th class="sortable" data-key="lokaal">Locatie${getSortArrow('lokaal')}</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${tableRows}
                        </tbody>
                      </table>
                    </div>
                  `
              }
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
    </div>
  `;

  // Sorteerbare kolommen (shift-klik = multi, gewone klik = enkel)
  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('mousedown', (e) => {
      if (e.shiftKey) e.preventDefault(); // voorkomt selectie bij shift-klik
    });
    th.addEventListener('click', (e) => {
      const key = th.dataset.key;
      if (!e.shiftKey) {
        // Gewone klik: reset sortering naar deze kolom (ASC)
        currentSort = [{ key, asc: true }];
      } else {
        // Shift-klik: voeg toe of toggle richting
        const existing = currentSort.find(s => s.key === key);
        if (existing) {
          existing.asc = !existing.asc;
        } else {
          currentSort.push({ key, asc: true });
        }
      }
      renderSpeeddates(rootElement, studentData);
    });
  });
  // Filterknoppen
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;
      currentStatusFilter = status === 'all' ? null : status;
      renderSpeeddates(rootElement, studentData);
    });
  });

  // Sidebar nav - gebruik de router voor echte URL navigatie
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'profile':
            Router.navigate('/student/student-profiel');
            break;
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
      showSettingsPopup(() => renderSpeeddates(rootElement, studentData));
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
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
