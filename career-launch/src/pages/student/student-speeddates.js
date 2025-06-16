// src/views/student-speeddates.js
import logoIcon from '../../Icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
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

  // Utility om correcte foto-URL te krijgen
  function getProfielFotoUrl(profiel_foto) {
    if (!profiel_foto || profiel_foto === 'null') return '/src/Images/default.jpg';
    if (profiel_foto.startsWith('http')) return profiel_foto;
    return 'https://gt0kk4fbet.ufs.sh/f/' + profiel_foto;
  }

  function getStatusBadge(status) {
    if (status === 'Bevestigd') {
      return `<span class="status-badge badge-accepted">Bevestigd</span>`;
    } else if (status === 'In afwachting') {
      return `<span class="status-badge badge-waiting">In afwachting</span>`;
    } else if (status === 'Geweigerd') {
      return `<span class="status-badge badge-denied">Geweigerd</span>`;
    } else if (status === 'Geaccepteerd') {
      return `<span class="status-badge badge-accepted">Geaccepteerd</span>`;
    } else {
      return `<span class="status-badge badge-other">${status}</span>`;
    }
  }

// Nieuw: helper om functies en skills op te halen
async function fetchFunctiesSkills(bedrijfId) {
  const token = sessionStorage.getItem('authToken');
  let functies = [];
  let skills = [];
  try {
    const resFuncties = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}/functies`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (resFuncties.ok) functies = await resFuncties.json();
  } catch {}
  try {
    const resSkills = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (resSkills.ok) skills = await resSkills.json();
  } catch {}
  return { functies, skills };
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

function getSlotStatusClass(slot) {
  if (slot.status === 'pending') return 'slot-pending';
  if (slot.status === 'taken') return 'slot-taken';
  return '';
}

async function fetchSpeeddatesWithStatus(rootElement, status = null, studentId = null) {
  const token = sessionStorage.getItem('authToken');
  let url = 'https://api.ehb-match.me/speeddates';
  if (status === 'Geaccepteerd') url += '/accepted';
  else if (status === 'In afwachting') url += '/pending';
  if (studentId) url += (url.includes('?') ? '&' : '?') + 'id=' + studentId;
  const resp = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!resp.ok) {
    if (resp.status === 401) {
      sessionStorage.removeItem('authToken');
      renderLogin(rootElement);
      return [];
    }
    const txt = await resp.text();
    throw new Error(`Kon speeddates niet ophalen: ${resp.status} – ${txt}`);
  }
  return await resp.json();
}

export async function renderSpeeddates(rootElement, studentData = {}) {
  let speeddates = [];
  try {
    speeddates = await fetchSpeeddates(rootElement);
    console.log('Alle opgehaalde speeddates:', speeddates);
  } catch (e) {
    if (e.message.includes('401')) {
      renderLogin(rootElement);
      return;
    }
    console.error(e);
    speeddates = []; // Fallback: leeg array bij API-fout
  }
  // DEBUG: Toon studentData en studentId
  console.log('studentData:', studentData);
  console.log('sessionStorage.user:', sessionStorage.getItem('user'));
  let studentId = studentData?.id || studentData?.gebruiker_id;
  if (!studentId) {
    const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
    console.log('Gevonden stored user:', stored);
    studentId = stored.id || stored.gebruiker_id;
  }
  if (!studentId && speeddates && speeddates.length) {
    studentId = speeddates[0].id_student;
    console.warn('DEV: studentId fallback naar', studentId);
  }
  // Haal speeddates direct gefilterd op via API
  try {
    speeddates = await fetchSpeeddatesWithStatus(rootElement, currentStatusFilter, studentId);
    console.log('Alle opgehaalde speeddates:', speeddates);
  } catch (e) {
    if (e.message.includes('401')) {
      renderLogin(rootElement);
      return;
    }
    console.error(e);
    speeddates = [];
  }
  // Sorteren (meerdere kolommen)
  const sorted = [...speeddates].sort((a, b) => {
    for (const sort of currentSort) {
      let aVal = a[sort.key];
      let bVal = b[sort.key];
      if (sort.key === 'begin') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sort.key === 'naam_bedrijf' || sort.key === 'lokaal') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
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
      <td><span class="bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(s)}' style="color:#222;cursor:pointer;">${s.naam_bedrijf}</span></td>
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

  // Sorteerbare kolommen (shift-klik = multi, gewone klik = enkel, altijd unieke keys)
  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('mousedown', (e) => {
      if (e.shiftKey) e.preventDefault();
    });
    th.addEventListener('click', (e) => {
      const key = th.dataset.key;
      const foundIdx = currentSort.findIndex(s => s.key === key);
      if (!e.shiftKey) {
        // Gewoon klik: alleen deze kolom
        currentSort = [{
          key,
          asc: foundIdx >= 0 ? !currentSort[foundIdx].asc : true
        }];
      } else {
        // Shift+klik: toevoegen/toggle maar uniek houden
        if (foundIdx >= 0) {
          currentSort[foundIdx].asc = !currentSort[foundIdx].asc;
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

  // Popup event listeners voor bedrijfsnaam
  document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
    el.addEventListener('click', async () => {
      const data = JSON.parse(el.dataset.bedrijf);
      await createBedrijfPopup(data);
    });
  });

  // Sidebar nav - gebruik de router voor echte URL navigatie
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
        case 'bedrijven':
          import('./bedrijven.js').then(m => m.renderBedrijven(rootElement, studentData));
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
    dropdown.classList.remove('open');
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!dropdown.classList.contains('open')) {
        dropdown.classList.add('open');
      } else {
        dropdown.classList.remove('open');
      }
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
