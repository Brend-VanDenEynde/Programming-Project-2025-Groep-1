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
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) throw new Error(`Fout bij ophalen: ${resp.status}`);
  return await resp.json();
}
async function acceptSpeeddate(id) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/speeddates/accept/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Accepteren mislukt');
}
async function rejectSpeeddate(id) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/speeddates/reject/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Weigeren mislukt');
}
async function fetchFunctiesSkills(bedrijfId) {
  const token = sessionStorage.getItem('authToken');
  let functies = [];
  let skills = [];
  try {
    const resFuncties = await fetch(
      `https://api.ehb-match.me/bedrijven/${bedrijfId}/functies`,
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    if (resFuncties.ok) functies = await resFuncties.json();
  } catch {}
  try {
    const resSkills = await fetch(
      `https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`,
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    if (resSkills.ok) skills = await resSkills.json();
  } catch {}
  return { functies, skills };
}

function getSortArrow(key, currentSort) {
  const found = currentSort.find((s) => s.key === key);
  // Altijd ruimte voor de sorteerdriehoek
  return `<span class="sort-arrow">${
    found ? (found.asc ? '▲' : '▼') : ''
  }</span>`;
}
function formatTime(dtString) {
  if (!dtString) return '-';
  const dt = new Date(dtString);
  return dt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
function formatUTCTime(isoString) {
  const d = new Date(isoString);
  let hh = d.getUTCHours().toString().padStart(2, '0');
  let mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function renderSpeeddatesRequests(rootElement, studentData = {}) {
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
    const found = currentSort.find((s) => s.key === key);
    // Altijd ruimte voor de sorteerdriehoek
    return `<span class="sort-arrow">${
      found ? (found.asc ? '▲' : '▼') : ''
    }</span>`;
  }

  function formatTimeFromBegin(begin) {
    if (!begin) return '-';
    const dt = new Date(begin);
    if (isNaN(dt.getTime())) return '-';
    return dt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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
  function renderRequestCards(verzoeken) {
    if (!verzoeken || verzoeken.length === 0) {
      document.getElementById(
        'speeddates-requests-table'
      ).innerHTML = `<p style="text-align:center;">Nog geen speeddates-verzoeken gevonden.</p>`;
      return;
    }

    // Sort by begin time (most recent first)
    const sorted = [...verzoeken].sort((a, b) => {
      const aTime = a.begin ? new Date(a.begin).getTime() : 0;
      const bTime = b.begin ? new Date(b.begin).getTime() : 0;
      return bTime - aTime;
    });

    // Create card-based layout similar to company requests
    const cards = sorted
      .map(
        (v) => `
      <div class="speeddate-item pending bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(
        v
      )}' style="cursor:pointer;">
        <div class="speeddate-info">
          <div class="bedrijf-info">
            <img src="${
              v.profiel_foto_bedrijf || v.foto || '/images/defaultlogo.webp'
            }" 
                 alt="${v.naam_bedrijf}" 
                 class="profiel-foto bedrijf-foto"
                 onerror="this.src='/images/defaultlogo.webp'" />
            <div class="bedrijf-details">
              <h4>${v.naam_bedrijf}</h4>
              <p class="bedrijf-id">Bedrijf ID: ${v.id_bedrijf}</p>
            </div>
          </div>
          
          <div class="afspraak-details">
            <div class="tijd-lokaal">
              <p class="tijdslot"><strong>Tijd:</strong> ${formatUTCTime(
                v.begin
              )}</p>
              <p class="lokaal"><strong>Lokaal:</strong> ${v.lokaal || '-'}</p>
            </div>
          </div>
          
          <div class="speeddate-actions">
            <button class="action-btn accept-btn" data-id="${
              v.id
            }" onclick="event.stopPropagation();">
              Accepteer
            </button>
            <button class="action-btn deny-btn" data-id="${
              v.id
            }" onclick="event.stopPropagation();">
              Weiger
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join('');

    document.getElementById('speeddates-requests-table').innerHTML = `
      <div class="speeddates-lijst">
        <div class="speeddates-header">
          <h2>Speeddate Verzoeken (${sorted.length})</h2>
        </div>
        <div class="speeddates-table">
          ${cards}
        </div>
      </div>
    `;

    // Add event handlers for accept/deny buttons
    document.querySelectorAll('.accept-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent card click
        const id = e.currentTarget.dataset.id;
        try {
          await acceptSpeeddate(id);
          const updated = await fetchPendingSpeeddates();
          const bedrijfVerzoeken = updated.filter(
            (v) => String(v.asked_by) === String(v.id_bedrijf)
          );
          renderRequestCards(bedrijfVerzoeken);
        } catch (err) {
          alert('Fout bij accepteren: ' + err.message);
        }
      });
    });

    document.querySelectorAll('.deny-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent card click
        const id = e.currentTarget.dataset.id;
        try {
          await rejectSpeeddate(id);
          const updated = await fetchPendingSpeeddates();
          const bedrijfVerzoeken = updated.filter(
            (v) => String(v.asked_by) === String(v.id_bedrijf)
          );
          renderRequestCards(bedrijfVerzoeken);
        } catch (err) {
          alert('Fout bij weigeren: ' + err.message);
        }
      });
    });

    addBedrijfPopupListeners();
  }

  function addBedrijfPopupListeners() {
    document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
      el.addEventListener('click', async () => {
        const data = JSON.parse(el.dataset.bedrijf);
        await createBedrijfPopup(data);
      });
    });
  }
  fetchPendingSpeeddates()
    .then((verzoeken) => {
      // Toon alleen verzoeken gestart door bedrijven:
      const bedrijfVerzoeken = verzoeken.filter(
        (v) => String(v.asked_by) === String(v.id_bedrijf)
      );
      renderRequestCards(bedrijfVerzoeken);
    })
    .catch((err) => {
      document.getElementById(
        'speeddates-requests-table'
      ).innerHTML = `<p style="color:red;">Fout: ${err.message}</p>`;
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

  // --- Popup met bedrijfsinfo (compact, bedrijven-style) ---
  async function createBedrijfPopup(s) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
      z-index: 3000;
    `;
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: #fff;
      padding: 1.5rem 1.2rem 1.2rem 1.2rem;
      border-radius: 14px;
      max-width: 420px;
      width: 96vw;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
    const profielFoto =
      s.foto && s.foto.trim() !== '' ? s.foto : '/src/Images/defaultlogo.webp';
    popup.innerHTML = `
      <button id=\"popup-close\" style=\"position:absolute;top:10px;right:12px;font-size:1.4rem;background:none;border:none;cursor:pointer;\">×</button>
      <img src=\"${profielFoto}\" alt=\"Logo ${
      s.naam_bedrijf
    }\" style=\"width:70px;height:70px;border-radius:50%;object-fit:contain;margin-bottom:1rem;\" onerror=\"this.onerror=null;this.src='../../Images/defaultlogo.webp'\">
      <h2 style=\"margin-bottom:0.3rem;text-align:center;\">${
        s.naam_bedrijf
      }</h2>
      <div style=\"font-size:1rem;color:#666;margin-bottom:0.2rem;\">${
        s.locatie || ''
      }</div>
      <div style=\"font-size:0.97rem;color:#888;margin-bottom:0.5rem;\">${
        s.werkdomein || ''
      }</div>
      <a href=\"${
        s.linkedin || '#'
      }\" target=\"_blank\" style=\"color:#0077b5;margin-bottom:0.7rem;\">${
      s.linkedin ? 'LinkedIn' : ''
    }</a>
      <div style=\"font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;\">
        <a href=\"mailto:${s.contact_email || ''}\" style=\"color:#444;\">${
      s.contact_email || ''
    }</a>
      </div>
      <div style=\"margin-bottom:0.7rem;width:100%;display:flex;flex-direction:row;gap:1.5rem;justify-content:center;\">
        <div style=\"text-align:left;\">
          <strong>Functies:</strong>
          <div id=\"popup-functies\" style=\"margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;\"></div>
        </div>
        <div style=\"text-align:left;\">
          <strong>Skills/talen:</strong>
          <div id=\"popup-skills\" style=\"margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;\"></div>
        </div>
      </div>
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
      const functiesHtml = functies.length
        ? functies
            .map(
              (f) =>
                `<span style=\"display:inline-block;padding:4px 8px;margin:3px;border-radius:6px;background:#e3f2fd;font-size:0.85rem;\">${f.naam}</span>`
            )
            .join('')
        : '<em>Geen functies beschikbaar</em>';
      document.getElementById('popup-functies').innerHTML = functiesHtml;
      const skillsHtml = skills.length
        ? skills
            .map(
              (skill) =>
                `<span style=\"display:inline-block;padding:4px 8px;margin:3px;border-radius:6px;background:#f1f1f1;font-size:0.85rem;\">${skill.naam}</span>`
            )
            .join('')
        : '<em>Geen skills beschikbaar</em>';
      document.getElementById('popup-skills').innerHTML = skillsHtml;
    }
  }
}
