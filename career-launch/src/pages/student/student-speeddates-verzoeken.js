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
  if (!found) return '';
  return found.asc ? ' ▲' : ' ▼';
}
function formatTime(dtString) {
  if (!dtString) return '-';
  const dt = new Date(dtString);
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
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
        <div class="footer-content">
          <span>&copy; 2025 EhB Career Launch</span>
          <div class="footer-links">
            <a href="/privacy" id="privacy-policy">Privacy</a>
            <a href="/contact" id="contacteer-ons">Contact</a>
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
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  }

  // Helper voor bedrijfsfoto's
  function getBedrijfFotoUrl(profielfoto) {
    if (!profielfoto || profielfoto === 'null') return '/images/defaultlogo.webp';
    if (profielfoto.startsWith('http')) return profielfoto;
    return 'https://gt0kk4fbet.ufs.sh/f/' + profielfoto;
  }

  function renderTable(verzoeken) {
    if (!verzoeken || verzoeken.length === 0) {
      document.getElementById('speeddates-requests-table').innerHTML = `<p class="geen-data">Nog geen speeddates-verzoeken gevonden.</p>`;
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
    document.getElementById('speeddates-requests-table').innerHTML = `
      <div class="speeddates-lijst">
        <div class="speeddates-header">
          <h2>Pending Speeddates-verzoeken (${sorted.length})</h2>
        </div>
        <div class="speeddates-table" id="speeddates-table">
          ${sorted
            .map(
              (v) => `
            <div class="speeddate-item pending" data-id="${v.id}">
              <div class="speeddate-info">
                <div class="student-info">
                  <img src="${getBedrijfFotoUrl(v.profiel_foto_bedrijf)}" alt="${v.naam_bedrijf}" class="profiel-foto bedrijf-foto" onerror="this.src='/images/default.png'" />
                  <div class="student-details">
                    <h4>${v.naam_bedrijf}</h4>
                  </div>
                </div>
                <div class="afspraak-details">
                  <div class="tijd-lokaal">
                    <p class="tijdslot"><strong>Tijd:</strong> ${formatTimeFromBegin(v.begin)}</p>
                    <p class="lokaal"><strong>Lokaal:</strong> ${v.lokaal || '-'} </p>
                  </div>
                </div>
                <div class="speeddate-actions">
                  <button class="action-btn accept-btn" data-action="accept" data-id="${v.id}">Accepteren</button>
                  <button class="deny-btn" data-action="delete" data-id="${v.id}">Verwijderen</button>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
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
          renderTable(updated);
        } catch (err) { alert('Fout bij accepteren: ' + err.message); }
      });
    });
    document.querySelectorAll('.deny-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showDeleteModal(id, async () => {
          const updated = await fetchPendingSpeeddates();
          renderTable(updated);
        });
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
    .then(verzoeken => renderTable(verzoeken))
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
      <p><strong>LinkedIn:</strong> <a id=\"popup-linkedin\" href=\"#\" target=\"_blank\">Laden...</a></p>
      <div id=\"popup-skills\"><em>Skills laden...</em></div>
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

  // --- MODAL LOGIC VOOR VERWIJDEREN ---
  let pendingDeleteId = null;

  function showDeleteModal(id, onSuccess) {
    // Modal HTML toevoegen als die er nog niet is
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.style.display = 'none';
      overlay.innerHTML = `
        <div class="modal">
          <p id="modal-message">Weet je zeker dat je deze speeddate wilt weigeren?</p>
          <div class="modal-buttons">
            <button id="modal-yes" class="modal-yes-btn">Ja</button>
            <button id="modal-no" class="modal-no-btn">Nee</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    const modalMessage = overlay.querySelector('#modal-message');
    const modalButtons = overlay.querySelector('.modal-buttons');
    const yesBtn = overlay.querySelector('#modal-yes');
    const noBtn = overlay.querySelector('#modal-no');
    overlay.style.display = 'flex';
    modalMessage.textContent = 'Weet je zeker dat je deze speeddate wilt weigeren?';
    modalButtons.style.display = 'flex';
    yesBtn.disabled = false;
    noBtn.disabled = false;

    yesBtn.onclick = async () => {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      try {
        await rejectSpeeddate(id);
        modalMessage.textContent = 'Speeddate succesvol verwijderd!';
        modalButtons.style.display = 'none';
        setTimeout(() => {
          overlay.style.display = 'none';
          if (onSuccess) onSuccess();
        }, 1200);
      } catch (err) {
        modalMessage.textContent = 'Fout bij verwijderen: ' + err.message;
        yesBtn.disabled = false;
        noBtn.disabled = false;
      }
    };
    noBtn.onclick = () => {
      overlay.style.display = 'none';
    };
  }
}
