import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
import Router from '../../router.js';

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
function formatUTCTime(isoString) {
  const d = new Date(isoString);
  let hh = d.getUTCHours().toString().padStart(2, '0');
  let mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// Functie om pending speeddate lijst te renderen
function renderPendingSpeeddatesList(speeddates) {
  if (!speeddates || speeddates.length === 0) {
    return '<p class="geen-data">Geen speeddate-verzoeken gevonden.</p>';
  }

  return `
    <div class="speeddates-lijst">
      <div class="speeddates-header">
        <h2>Pending Speeddates-verzoeken (${speeddates.length})</h2>
      </div>
      <div class="speeddates-table">
        ${speeddates
          .map(
            (speeddate) => `
          <div class="speeddate-item pending">
            <div class="speeddate-info">
              <div class="bedrijf-info">
                <img src="${
                  speeddate.profiel_foto_bedrijf || '/images/defaultlogo.webp'
                }" 
                     alt="${speeddate.naam_bedrijf}" 
                     class="profiel-foto bedrijf-foto" 
                     onerror="this.src='/images/defaultlogo.webp'" />
                <div class="bedrijf-details">
                  <h4><span class="bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(
                    speeddate
                  )}' style="color:#0077b5;cursor:pointer;text-decoration:none;">${
              speeddate.naam_bedrijf
            }</span></h4>
                  <p class="sector">${speeddate.sector || 'Onbekend'}</p>
                </div>
              </div>
              
              <div class="afspraak-details">
                <div class="tijd-lokaal">
                  <p class="tijdslot"><strong>Tijd:</strong> ${
                    speeddate.begin
                      ? formatUTCTime(speeddate.begin)
                      : 'Onbekend'
                  }</p>
                  <p class="lokaal"><strong>Lokaal:</strong> ${
                    speeddate.lokaal || 'Onbekend'
                  }</p>
                </div>
              </div>
              
              <div class="speeddate-actions">
                <button class="action-btn accept-btn" data-id="${speeddate.id}">
                  Accepteren
                </button>
                <button class="action-btn delete-btn" data-id="${speeddate.id}">
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

// export function renderSpeeddatesRequests(rootElement, studentData = {}) {
export function renderSpeeddatesRequests(rootElement, studentData = {}) {
  // AUTH CHECK: blokkeer toegang zonder geldige login
  const token = window.sessionStorage.getItem('authToken');
  if (!token) {
    import('../login.js').then((module) => {
      module.renderLogin(rootElement);
    });
    return;
  }

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
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title" style="text-align:center;width:100%;">Speeddates-verzoeken</h1>
            <div id="speeddates-requests-content">
              <div class="loading">Laden van speeddate verzoeken...</div>
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

  // Laad pending speeddate data
  async function loadPendingSpeeddateData() {
    const contentDiv = document.getElementById('speeddates-requests-content');
    try {
      const speeddates = await fetchPendingSpeeddates();
      contentDiv.innerHTML = renderPendingSpeeddatesList(speeddates);

      // Event listeners voor accept/reject knoppen
      document.querySelectorAll('.accept-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          try {
            await acceptSpeeddate(id);
            alert('Speeddate geaccepteerd!');
            loadPendingSpeeddateData(); // Reload data
          } catch (error) {
            alert('Fout bij accepteren: ' + error.message);
          }
        });
      });

      document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (confirm('Weet je zeker dat je dit verzoek wilt afwijzen?')) {
            const id = btn.dataset.id;
            try {
              await rejectSpeeddate(id);
              alert('Speeddate verzoek afgewezen');
              loadPendingSpeeddateData(); // Reload data
            } catch (error) {
              alert('Fout bij afwijzen: ' + error.message);
            }
          }
        });
      });

      // Popup event listeners voor bedrijfsnaam
      document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
        el.addEventListener('click', async () => {
          const data = JSON.parse(el.dataset.bedrijf);
          await createBedrijfPopup(data);
        });
      });
    } catch (error) {
      contentDiv.innerHTML =
        '<p class="error">Er is een fout opgetreden: ' + error.message + '</p>';
    }
  }

  // Start loading data
  loadPendingSpeeddateData();

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
      <p><strong>Status:</strong> <span class="status-badge pending">In afwachting</span></p>
      <p><strong>LinkedIn:</strong> <a id="popup-linkedin" href="#" target="_blank">Laden...</a></p>
      <div id="popup-skills"><em>Skills laden...</em></div>
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
