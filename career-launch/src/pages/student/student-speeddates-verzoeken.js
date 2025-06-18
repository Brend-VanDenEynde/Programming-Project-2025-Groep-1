import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';

// API helpers
async function fetchPendingSpeeddates() {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    renderLogin(document.body);
    return [];
  }
  const resp = await fetch('https://api.ehb-match.me/speeddates/pending', {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (!resp.ok) throw new Error(`Fout bij ophalen: ${resp.status}`);
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

function getSortArrow(key, currentSort) {
  const found = currentSort.find(s => s.key === key);
  // Altijd ruimte voor de sorteerdriehoek
  return `<span class="sort-arrow">${found ? (found.asc ? '▲' : '▼') : ''}</span>`;
}
function formatTime(dtString) {
  if (!dtString) return '-';
  const dt = new Date(dtString);
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatUTCTime(isoString) {
  const d = new Date(isoString);
  let hh = d.getUTCHours().toString().padStart(2, '0');
  let mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// export function renderSpeeddatesRequests(rootElement, studentData = {}) {
export function renderSpeeddatesRequests(rootElement, studentData = {}) {
  let currentSort = [{ key: 'begin', asc: true }];

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
            <li><button data-route="speeddates" class="sidebar-link" type="button">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link" type="button">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link" type="button">Bedrijven</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Speeddates-verzoeken</h1>
            <div id="speeddates-requests-table">
              <p>Speeddate verzoeken laden...</p>
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

  function getSortArrow(key) {
    const found = currentSort.find(s => s.key === key);
    // Altijd ruimte voor de sorteerdriehoek
    return `<span class="sort-arrow">${found ? (found.asc ? '▲' : '▼') : ''}</span>`;
  }

  function formatTimeFromBegin(begin) {
    if (!begin) return '-';
    const dt = new Date(begin);
    if (isNaN(dt.getTime())) return '-';
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function compareValues(a, b, key) {
    let aVal = a[key];
    let bVal = b[key];
    if (key === 'begin') {
      aVal = aVal ? new Date(aVal).getTime() : Number.POSITIVE_INFINITY;
      bVal = bVal ? new Date(bVal).getTime() : Number.POSITIVE_INFINITY;
    } else if (key === 'naam_bedrijf' || key === 'lokaal') {
      // Alfabetisch sorteren met Nederlandse collator
      const collator = new Intl.Collator('nl', { sensitivity: 'base' });
      aVal = (aVal || '').toLowerCase();
      bVal = (bVal || '').toLowerCase();
      return collator.compare(aVal, bVal);
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  }

  function renderTable(verzoeken) {
    if (!verzoeken || verzoeken.length === 0) {
      document.getElementById('speeddates-requests-table').innerHTML = `<p style="text-align:center;">Nog geen speeddates-verzoeken gevonden.</p>`;
      return;
    }
    if (!currentSort.length) currentSort = [{ key: 'begin', asc: true }];
    // --- SORTEREN ---
    const sorted = [...verzoeken].sort((a, b) => {
      for (const sort of currentSort) {
        const cmp = compareValues(a, b, sort.key);
        if (cmp !== 0) return sort.asc ? cmp : -cmp;
      }
      return 0;
    });
    // --- RENDEREN ---
    const rows = sorted.map(v => `
      <tr>
        <td><span class="bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(v)}' style="color:#0077cc;cursor:pointer;text-decoration:underline;">${v.naam_bedrijf}</span></td>
        <td>${v.lokaal || '-'}</td>
        <td>${formatUTCTime(v.begin)}</td>
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
              <th class="sortable" data-key="naam_bedrijf">Bedrijf${getSortArrow('naam_bedrijf', currentSort)}</th>
              <th class="sortable" data-key="lokaal">Lokaal${getSortArrow('lokaal', currentSort)}</th>
              <th class="sortable" data-key="begin">Tijd${getSortArrow('begin', currentSort)}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    // --- EVENTS op de headers voor sortering ---
    document.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('mousedown', (e) => {
        if (e.shiftKey) e.preventDefault(); // geen text-select bij shift
      });
      th.addEventListener('click', (e) => {
        const key = th.dataset.key;
        const found = currentSort.find(s => s.key === key);
        if (!e.shiftKey) {
          // Gewoon klik: alleen deze kolom (toggle asc/desc)
          if (found) {
            found.asc = !found.asc;
            currentSort = [found];
          } else {
            currentSort = [{ key, asc: true }];
          }
        } else {
          // Shift+klik: multi-level toevoegen/toggles
          if (found) {
            found.asc = !found.asc;
          } else {
            currentSort.push({ key, asc: true });
          }
        }
        renderTable(verzoeken);
      });
    });
    // Knoppen event handlers
    document.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          await acceptSpeeddate(id);
          const updated = await fetchPendingSpeeddates();
          const bedrijfVerzoeken = updated.filter(v => String(v.asked_by) === String(v.id_bedrijf));
          renderTable(bedrijfVerzoeken);
        } catch (err) { alert('Fout bij accepteren: ' + err.message); }
      });
    });
    document.querySelectorAll('.deny-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          await rejectSpeeddate(id);
          const updated = await fetchPendingSpeeddates();
          const bedrijfVerzoeken = updated.filter(v => String(v.asked_by) === String(v.id_bedrijf));
          renderTable(bedrijfVerzoeken);
        } catch (err) { alert('Fout bij weigeren: ' + err.message); }
      });
    });
    document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
      el.addEventListener('click', async () => {
        const data = JSON.parse(el.dataset.bedrijf);
        await createBedrijfPopup(data);
      });
    });
  }

  fetchPendingSpeeddates()
    .then(verzoeken => {
      // Toon alleen verzoeken gestart door bedrijven:
      const bedrijfVerzoeken = verzoeken.filter(v => String(v.asked_by) === String(v.id_bedrijf));
      renderTable(bedrijfVerzoeken);
    })
    .catch(err => {
      document.getElementById('speeddates-requests-table').innerHTML = `<p style="color:red;">Fout: ${err.message}</p>`;
    });

  // --- Sidebar navigatie uniform maken ---
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          // case 'profile': // verwijderd
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

  // Hamburger menu Profiel knop
  const navProfileBtn = document.getElementById('nav-profile');
  const dropdown = document.getElementById('burger-dropdown');
  if (navProfileBtn && dropdown) {
    navProfileBtn.addEventListener('click', () => {
      dropdown.classList.remove('open');
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/student/student-profiel');
      });
    });
  }

  const burger = document.getElementById('burger-menu');
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

  // --- Popup met bedrijfsinfo ---
  async function createBedrijfPopup(s) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
      z-index: 3000;
    `;
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
      position: relative;
    `;
    popup.innerHTML = `
      <button id=\"popup-close\" style=\"position:absolute;top:10px;right:12px;font-size:1.4rem;background:none;border:none;cursor:pointer;\">×</button>
      <h2 style=\"margin-top:0;\">${s.naam_bedrijf}</h2>
      <p><strong>Tijd:</strong> ${s.begin ? new Date(s.begin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Onbekend'}</p>
      <p><strong>Locatie:</strong> ${s.lokaal || 'Onbekend'}</p>
      <p><strong>Status:</strong> ${s.akkoord !== undefined ? (s.akkoord ? 'Geaccepteerd' : 'In afwachting') : '-'}</p>
      <p><strong>LinkedIn:</strong> <a id="popup-linkedin" href="#" target="_blank">Laden...</a></p>
      <div id="popup-skills"><em>Skills laden...</em></div>
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById('popup-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    // Extra data ophalen
    const bedrijfId = s.id_bedrijf || s.gebruiker_id;
    if (bedrijfId) {
      const { functies, skills } = await fetchFunctiesSkills(bedrijfId);
      const skillsHtml = skills.length
        ? skills.map(skill =>
            `<span style=\"display:inline-block;padding:4px 8px;margin:3px;border-radius:6px;background:#f1f1f1;font-size:0.85rem;\">${skill.naam}</span>`
          ).join('')
        : '<em>Geen skills beschikbaar</em>';
      document.getElementById('popup-skills').innerHTML = `<strong>Skills:</strong><div style=\"margin-top:0.4rem;\">${skillsHtml}</div>`;
    }
    // LinkedIn
    if (s.linkedin) {
      document.getElementById('popup-linkedin').textContent = s.linkedin;
      document.getElementById('popup-linkedin').href = s.linkedin;
    } else {
      document.getElementById('popup-linkedin').textContent = 'Niet beschikbaar';
      document.getElementById('popup-linkedin').removeAttribute('href');
    }
  }
}
