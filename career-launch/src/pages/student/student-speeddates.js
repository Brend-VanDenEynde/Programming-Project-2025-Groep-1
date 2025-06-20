// src/views/student-speeddates.js
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { showSettingsPopup } from './student-settings.js';
import { fetchStudentSpeeddates } from '../../utils/data-api.js';
import { authenticatedFetch } from '../../utils/auth-api.js';
import { showBedrijfInfoPopup } from './bedrijven.js';

// Nieuw: API fetch
async function fetchSpeeddates(rootElement) {
  const token = sessionStorage.getItem('authToken');
  console.log('authToken:', token);
  if (!token) {
    renderLogin(rootElement);
    return [];
  }
  const resp = await authenticatedFetch('https://api.ehb-match.me/speeddates');
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

// Nieuw: helper om functies en skills op te halen
async function fetchFunctiesSkills(bedrijfId) {
  const token = sessionStorage.getItem('authToken');
  let functies = [];
  let skills = [];
  try {
    const resFuncties = await authenticatedFetch(
      `https://api.ehb-match.me/bedrijven/${bedrijfId}/functies`
    );
    if (resFuncties.ok) functies = await resFuncties.json();
  } catch {}
  try {
    const resSkills = await authenticatedFetch(
      `https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`
    );
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
  document.getElementById('reload-speeddates').onclick = () =>
    renderSpeeddates(root);
}

let currentSort = [{ key: 'begin', asc: true }];

function getSortArrow(key) {
  const found = currentSort.find((s) => s.key === key);
  if (!found) return '';
  return found.asc ? ' ▲' : ' ▼';
}

function getSlotStatusClass(slot) {
  if (slot.status === 'pending') return 'slot-pending';
  if (slot.status === 'taken') return 'slot-taken';
  return '';
}

async function fetchSpeeddatesWithStatus(
  rootElement,
  status = null,
  studentId = null
) {
  const token = sessionStorage.getItem('authToken');
  let url = 'https://api.ehb-match.me/speeddates';
  if (status === 'Geaccepteerd') url += '/accepted';
  else if (status === 'In afwachting') url += '/pending';
  if (studentId) url += (url.includes('?') ? '&' : '?') + 'id=' + studentId;
  const resp = await authenticatedFetch(url);
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

function formatUTCTime(isoString) {
  const d = new Date(isoString);
  let hh = d.getUTCHours().toString().padStart(2, '0');
  let mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// Exporteer de tijdslot-functie zodat deze bruikbaar is in andere modules
export function formatTijdslotStudent(beginISO, eindeISO) {
  const begin = new Date(beginISO);
  const einde = new Date(eindeISO);
  // Dag en datum
  const dagOpties = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const dagDatum = begin.toLocaleDateString('nl-BE', dagOpties);
  // Uur
  const tijdOpties = { hour: '2-digit', minute: '2-digit' };
  const beginTijd = begin.toLocaleTimeString('nl-BE', tijdOpties);
  const eindeTijd = einde.toLocaleTimeString('nl-BE', tijdOpties);
  return `<span class=\"speeddate-dag\"><strong>Dag:</strong> ${dagDatum}</span><br><span class=\"speeddate-uur\"><strong>Uur:</strong> ${beginTijd} - ${eindeTijd}</span>`;
}

export async function renderSpeeddates(rootElement, studentData = {}) {
  // Sorteervolgorde behouden als er al gesorteerd is, anders default op tijd
  if (!currentSort || !Array.isArray(currentSort) || currentSort.length === 0) {
    currentSort = [{ key: 'begin', asc: true }];
  }
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
  } // Haal speeddates op
  try {
    speeddates = await fetchSpeeddates(rootElement);
    console.log('Alle opgehaalde speeddates:', speeddates);
    // Verwijder deze filter zodat ALLE speeddates (zowel inkomend als uitgaand) zichtbaar zijn
    // speeddates = speeddates.filter(s => s.asked_by !== studentId);
  } catch (e) {
    if (e.message.includes('401')) {
      renderLogin(rootElement);
      return;
    }
    console.error(e);
    speeddates = [];
  }
  // Sorteren (meerdere kolommen)
  const collator = new Intl.Collator('nl', { sensitivity: 'base' });
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
        const cmp = collator.compare(aVal, bVal);
        if (cmp !== 0) return sort.asc ? cmp : -cmp;
        continue;
      }
      if (aVal < bVal) return sort.asc ? -1 : 1;
      if (aVal > bVal) return sort.asc ? 1 : -1;
    }
    return 0;
  }); // Create card-based layout like bedrijf speeddates
  const speeddateCards = sorted
    .map(
      (s) => `
    <div class="speeddate-item ${
      s.akkoord ? 'goedgekeurd' : 'in-behandeling'
    } bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(
      s
    )}' style="min-width:600px;max-width:1200px;width:100%;cursor:pointer;">
      <div class="speeddate-info" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:24px;">
        <div class="bedrijf-info">
          <img src="${
            s.profiel_foto_bedrijf || s.foto || '/images/defaultlogo.webp'
          }" 
               alt="${s.naam_bedrijf}" 
               class="profiel-foto bedrijf-foto"
               onerror="this.src='/src/images/defaultlogo.webp'" />
          <div class="bedrijf-details">
            <h4>${s.naam_bedrijf}</h4>
          </div>
        </div>
        <div class="afspraak-details" style="display:flex;flex-direction:row;align-items:center;gap:24px;">
          <div class="tijd-lokaal">
            ${s.begin ? formatTijdslotStudent(s.begin, s.einde) : '-'}
          </div>
          <div class="status">
            <span class="status-badge ${
              s.akkoord ? 'goedgekeurd' : 'in-behandeling'
            }">
              ${s.akkoord ? 'GOEDGEKEURD' : 'IN AFWACHTING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
  // Now render the complete page with the fetched data
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section" id="logo-navigation">
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
            <li><button data-route="speeddates" class="sidebar-link" type="button">Mijn speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link" type="button">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link" type="button">Bedrijven</button></li>
          </ul>
        </nav>        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
            <div>
              ${
                sorted.length === 0
                  ? `<p style="text-align:center;">Geen speeddates gevonden.</p>`
                  : `
                    <div class="speeddates-lijst">
                      <div class="speeddates-header">
                        <h2>Geplande Speeddates (${sorted.length})</h2>
                        <div class="speeddates-filter-group">
                          <button class="speeddates-filter-btn active" data-filter="all">Alle speeddates</button>
                          <button class="speeddates-filter-btn" data-filter="goedgekeurd">Goedgekeurd</button>
                          <button class="speeddates-filter-btn" data-filter="in-behandeling">In behandeling</button>
                        </div>
                      </div>
                      <div class="speeddates-table">
                        ${speeddateCards}
                      </div>
                    </div>
                  `
              }
            </div>
          </div>        </div>
      </div>
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>  `;

  function addBedrijfPopupListeners() {
    document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
      el.addEventListener('click', async () => {
        const data = JSON.parse(el.dataset.bedrijf);
        // Zorg dat we altijd een bedrijf-id of gebruiker_id meegeven
        if (!data.gebruiker_id && data.id_bedrijf) data.gebruiker_id = data.id_bedrijf;
        await showBedrijfInfoPopup(data);
      });
    });
  }

  // Popup event listeners voor bedrijfsnaam
  addBedrijfPopupListeners();

  // Filter functionaliteit voor speeddates (student)
  initSpeeddatesFilter();

  // Sidebar nav - gebruik de router voor echte URL navigatie
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'speeddates':
            Router.navigate('/student/student-speeddates');
            break;
          case 'requests':
            Router.navigate('/student/student-speeddates-verzoeken');
            break;
          case 'bedrijven':
            Router.navigate('/student/bedrijven');
            break;
        }
      });
    });
  });

  // Logo navigation event listener
  const logoSection = document.getElementById('logo-navigation');
  if (logoSection) {
    logoSection.addEventListener('click', () => {
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/student/student-speeddates');
      });
    });
  }

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
      s.profiel_foto_bedrijf && s.profiel_foto_bedrijf.trim() !== ''
        ? s.profiel_foto_bedrijf
        : 'https://gt0kk4fbet.ufs.sh/f/69hQMvkhSwPrBnoUSJEphqgXTDlWRHMuSxI9LmrdCscbikZ4';
    popup.innerHTML = `
      <button id="popup-close" style="position:absolute;top:10px;right:12px;font-size:1.4rem;background:none;border:none;cursor:pointer;">×</button>
      <img src="${profielFoto}" alt="Logo ${
      s.naam_bedrijf
    }" style="width:70px;height:70px;border-radius:50%;object-fit:contain;margin-bottom:1rem;" onerror="this.onerror=null;this.src='../../Images/defaultlogo.webp'">
      <h2 style="margin-bottom:0.3rem;text-align:center;">${s.naam_bedrijf}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.2rem;">${
        s.locatie || ''
      }</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.5rem;">${
        s.werkdomein || ''
      }</div>
      <a href="${
        s.linkedin || '#'
      }" target="_blank" style="color:#0077b5;margin-bottom:0.7rem;">${
      s.linkedin ? 'LinkedIn' : ''
    }</a>
      <div style="font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;">
        <a href="mailto:${s.contact_email || ''}" style="color:#444;">${
      s.contact_email || ''
    }</a>
      </div>
      <div style="margin-bottom:0.7rem;width:100%;display:flex;flex-direction:row;gap:1.5rem;justify-content:center;">
        <div style="text-align:left;">
          <strong>Functies:</strong>
          <div id="popup-functies" style="margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;"></div>
        </div>
        <div style="text-align:left;">
          <strong>Skills/talen:</strong>
          <div id="popup-skills" style="margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;"></div>
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

// Filter functionaliteit voor speeddates (student)
function initSpeeddatesFilter() {
  const filterBtns = document.querySelectorAll('.speeddates-filter-btn');
  if (!filterBtns.length) return;
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;
      document.querySelectorAll('.speeddate-item').forEach(item => {
        const badge = item.querySelector('.status-badge');
        if (filter === 'all') {
          item.style.display = '';
        } else if (filter === 'goedgekeurd') {
          item.style.display = badge && badge.classList.contains('goedgekeurd') ? '' : 'none';
        } else if (filter === 'in-behandeling') {
          item.style.display = badge && badge.classList.contains('in-behandeling') ? '' : 'none';
        }
      });
    });
  });
}
setTimeout(initSpeeddatesFilter, 0);
document.addEventListener('DOMContentLoaded', initSpeeddatesFilter);
