// src/views/student-speeddates.js
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { showSettingsPopup } from './student-settings.js';
import { fetchStudentSpeeddates } from '../../utils/data-api.js';
import Router from '../../router.js';

// API fetch function
async function fetchSpeeddates(rootElement) {
  const token = sessionStorage.getItem('authToken');
  console.log('authToken:', token);
  if (!token) {
    renderLogin(rootElement);
    return [];
  }
  const resp = await fetch('https://api.ehb-match.me/speeddates', {
    headers: { Authorization: 'Bearer ' + token },
  });
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

// Helper function to fetch company functions and skills
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

function renderSpeeddatesError(root, err) {
  root.innerHTML = `
    <div class="error">Fout bij ophalen speeddates:<br>${err.message}</div>
    <button id="reload-speeddates">Probeer opnieuw</button>
  `;
  document.getElementById('reload-speeddates').onclick = () =>
    renderSpeeddates(root);
}

function getSlotStatusClass(slot) {
  if (slot.status === 'pending') return 'slot-pending';
  if (slot.status === 'taken') return 'slot-taken';
  return '';
}

function formatUTCTime(isoString) {
  const d = new Date(isoString);
  let hh = d.getUTCHours().toString().padStart(2, '0');
  let mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export async function renderSpeeddates(rootElement, studentData = {}) {
  // AUTH CHECK: blokkeer toegang zonder geldige login
  const token = window.sessionStorage.getItem('authToken');
  if (!token) {
    const module = await import('../login.js');
    module.renderLogin(rootElement);
    return;
  }

  // Haal speeddates op via API
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
    speeddates = [];
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

  // Create speeddate cards
  const speeddateCards = speeddates
    .map(
      (s) => `
        <div class="speeddate-item ${
          s.akkoord ? 'goedgekeurd' : 'in-behandeling'
        }">
          <div class="speeddate-info">
            <div class="bedrijf-info">
              <img src="${
                s.profiel_foto_bedrijf || '/images/defaultlogo.webp'
              }" 
                   alt="${s.naam_bedrijf}" 
                   class="profiel-foto bedrijf-foto" 
                   onerror="this.src='/images/defaultlogo.webp'" />
              <div class="bedrijf-details">
                <h4><span class="bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(
                  s
                )}' style="color:#0077b5;cursor:pointer;text-decoration:none;">${
        s.naam_bedrijf
      }</span></h4>
                <p class="sector">${s.sector || 'Onbekend'}</p>
              </div>
            </div>
            
            <div class="afspraak-details">
              <div class="tijd-lokaal">
                <p class="tijdslot"><strong>Tijd:</strong> ${
                  s.begin ? formatUTCTime(s.begin) : 'Onbekend'
                }</p>
                <p class="lokaal"><strong>Lokaal:</strong> ${
                  s.lokaal || 'Onbekend'
                }</p>
              </div>
              <div class="status">
                <span class="status-badge ${
                  s.akkoord ? 'goedgekeurd' : 'in-behandeling'
                }">
                  ${s.akkoord ? 'Geaccepteerd' : 'In afwachting'}
                </span>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  // Render the complete page
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
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">            <h1 class="student-profile-title" style="text-align:center;width:100%;">Geplande Speeddates</h1>
            <div>
              ${
                speeddates.length === 0
                  ? `<p style="text-align:center;">Geen speeddates gevonden.</p>`
                  : `
                    <div class="speeddates-lijst">
                      <div class="speeddates-header">
                        <h2>Geplande Speeddates (${speeddates.length})</h2>
                      </div>
                      <div class="speeddates-table">
                        ${speeddateCards}
                      </div>
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

  // Popup event listeners voor bedrijfsnaam
  document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
    el.addEventListener('click', async () => {
      const data = JSON.parse(el.dataset.bedrijf);
      await createBedrijfPopup(data);
    });
  });

  // Sidebar navigation
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

  // Hamburger menu
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
    Router.navigate('/privacy');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });

  // Company popup function
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
    let slotsHtml = '';
    const slots = s.slots || [];
    if (slots.length > 0) {
      slotsHtml = '<div class="slots-list">';
      for (const slot of slots) {
        const statusClass = getSlotStatusClass(slot);
        const disabled = statusClass ? 'disabled' : '';
        slotsHtml += `<button class="slot-btn ${statusClass}" ${disabled}>${slot.tijd}</button>`;
      }
      slotsHtml += '</div>';
    }
    popup.innerHTML = `
      <button id="popup-close" style="position:absolute;top:10px;right:12px;font-size:1.4rem;background:none;border:none;cursor:pointer;">×</button>
      <h2 style="margin-top:0;">${s.naam_bedrijf}</h2>
      <p><strong>Tijd:</strong> ${
        s.begin
          ? new Date(s.begin).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Onbekend'
      }</p>
      <p><strong>Locatie:</strong> ${s.lokaal || 'Onbekend'}</p>
      <p><strong>Status:</strong> <span class="status-badge ${
        s.akkoord ? 'goedgekeurd' : 'in-behandeling'
      }">${s.akkoord ? 'Geaccepteerd' : 'In afwachting'}</span></p>
      <p><strong>LinkedIn:</strong> <a id="popup-linkedin" href="#" target="_blank">Laden...</a></p>
      <div id="popup-skills"><em>Skills laden...</em></div>
      ${slotsHtml}
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById('popup-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Fetch additional data
    const bedrijfId = s.id_bedrijf || s.gebruiker_id;
    if (bedrijfId) {
      const { functies, skills } = await fetchFunctiesSkills(bedrijfId);
      const skillsHtml = skills.length
        ? skills
            .map(
              (skill) =>
                `<span style="display:inline-block;padding:4px 8px;margin:3px;border-radius:6px;background:#f1f1f1;font-size:0.85rem;">${skill.naam}</span>`
            )
            .join('')
        : '<em>Geen skills beschikbaar</em>';
      document.getElementById(
        'popup-skills'
      ).innerHTML = `<strong>Skills:</strong><div style="margin-top:0.4rem;">${skillsHtml}</div>`;
    }

    // LinkedIn
    if (s.linkedin) {
      document.getElementById('popup-linkedin').textContent = s.linkedin;
      document.getElementById('popup-linkedin').href = s.linkedin;
    } else {
      document.getElementById('popup-linkedin').textContent =
        'Niet beschikbaar';
      document.getElementById('popup-linkedin').removeAttribute('href');
    }
  }
}
