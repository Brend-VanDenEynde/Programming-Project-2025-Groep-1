// src/views/student-speeddates-verzoeken.js
import logoIcon from '../../icons/favicon-32x32.png';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderQRPopup } from './student-qr-popup.js';
import { showSettingsPopup } from './student-settings.js';
import { fetchStudentSpeeddateRequests } from '../../utils/data-api.js';


export async function renderSpeeddatesRequests(rootElement, studentData = {}) {
  // Initially show loading state
  let verzoeken = [];

  // Show loading UI first
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
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Speeddates-verzoeken</h1>
            <div class="loading-container">
              <p>Speeddate verzoeken laden...</p>
            </div>
          </div>
        </div>
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

  try {
    // Fetch speeddate requests from API
    const apiRequests = await fetchStudentSpeeddateRequests(); // Transform API data to expected format
    verzoeken = apiRequests.map((request) => ({
      bedrijf: request.naam_bedrijf,
      lokaal: request.lokaal,
      tijd: new Date(request.begin).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status:
        request.akkoord === true
          ? 'Geaccepteerd'
          : request.akkoord === false
          ? 'Geweigerd'
          : 'In afwachting',
      id: request.id,
      datum: new Date(request.begin).toLocaleDateString('nl-NL'),
    }));
  } catch (error) {
    console.error('Error fetching speeddate requests:', error);
    // Fall back to empty array, will show "no requests" message
    verzoeken = [];
  }

  function renderTable() {
    const tableHtml =
      verzoeken.length === 0
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
              ${verzoeken
                .map(
                  (v, idx) => `
                <tr>
                  <td>${v.bedrijf}</td>
                  <td>${v.lokaal}</td>
                  <td>${v.tijd}</td>                  <td class="status-cell">
                    ${
                      v.status === 'Geaccepteerd'
                        ? `<span class="status-badge badge-accepted">Geaccepteerd</span>`
                        : v.status === 'Geweigerd'
                        ? `<span class="status-badge badge-denied">Geweigerd</span>`
                        : `<span class="status-badge badge-waiting">${v.status}</span>`
                    }
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>      `;
    document.getElementById('speeddates-requests-table').innerHTML = tableHtml;
  }
// API helpers
async function fetchPendingSpeeddates() {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/speeddates/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Fout bij ophalen: ${resp.status} – ${text}`);
  }
  return await resp.json();
}

async function acceptSpeeddate(id) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/speeddates/accept/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) throw new Error('Accepteren mislukt');
}

async function rejectSpeeddate(id) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/speeddates/reject/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) throw new Error('Weigeren mislukt');
}


async function renderSpeeddatesRequests(rootElement, studentData = {}) {
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
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Speeddates-verzoeken</h1>
            <div id="speeddates-requests-table"></div>        </div>
        </div>
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

  function getSortArrow(key) {
    const found = currentSort.find(s => s.key === key);
    if (!found) return '';
    return found.asc ? ' ▲' : ' ▼';
  }

  let currentSort = [{ key: 'begin', asc: true }];

  function renderTable(verzoeken) {
    if (!verzoeken || verzoeken.length === 0) {
      document.getElementById('speeddates-requests-table').innerHTML =
        `<p style="text-align:center;">Nog geen speeddates-verzoeken gevonden.</p>`;
      return;
    }
    // Sorteren (meerdere kolommen)
    const sorted = [...verzoeken].sort((a, b) => {
      for (const sort of currentSort) {
        let aVal = a[sort.key];
        let bVal = b[sort.key];
        if (sort.key === 'begin') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        if (aVal < bVal) return sort.asc ? -1 : 1;
        if (aVal > bVal) return sort.asc ? 1 : -1;
      }
      return 0;
    });
    const rows = sorted.map(v => `
      <tr>
        <td>${v.naam_bedrijf}</td>
        <td>${v.lokaal || '-'}</td>
        <td>${v.begin ? new Date(v.begin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
        <td class="status-cell">
          <button class="accept-btn" data-id="${v.id}">Accepteer</button>
          <button class="deny-btn" data-id="${v.id}">Weiger</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('speeddates-requests-table').innerHTML = `
      <div class="speeddates-table-container">
        <table class="speeddates-table">
          <thead>
            <tr>
              <th class="sortable" data-key="naam_bedrijf">Bedrijf${getSortArrow('naam_bedrijf')}</th>
              <th class="sortable" data-key="lokaal">Lokaal${getSortArrow('lokaal')}</th>
              <th class="sortable" data-key="begin">Tijd${getSortArrow('begin')}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    document.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          await acceptSpeeddate(id);
          const updated = await fetchPendingSpeeddates();
          renderTable(updated);
        } catch (err) {
          alert('Fout bij accepteren: ' + err.message);
        }
      });
    });
    document.querySelectorAll('.deny-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          await rejectSpeeddate(id);
          const updated = await fetchPendingSpeeddates();
          renderTable(updated);
        } catch (err) {
          alert('Fout bij weigeren: ' + err.message);
        }
      });
    });
    // Sorteerbare kolommen (shift-klik = multi, gewone klik = enkel)
    document.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('mousedown', (e) => {
        if (e.shiftKey) e.preventDefault(); // voorkomt selectie bij shift-klik
      });
      th.addEventListener('click', (e) => {
        const key = th.dataset.key;
        if (!e.shiftKey) {
          currentSort = [{ key, asc: true }];
        } else {
          const existing = currentSort.find(s => s.key === key);
          if (existing) {
            existing.asc = !existing.asc;
          } else {
            currentSort.push({ key, asc: true });
          }
        }
        // Herteken tabel met nieuwe sortering
        renderTable(verzoeken);
      });
    });
  }

  fetchPendingSpeeddates()
    .then(verzoeken => renderTable(verzoeken))
    .catch(err => {
      document.getElementById('speeddates-requests-table').innerHTML =
        `<p style="color:red;">Fout: ${err.message}</p>`;
    });

  // --- Sidebar navigatie uniform maken ---
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
      showSettingsPopup(() =>
        renderSpeeddatesRequests(rootElement, studentData)
      );
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
}}
