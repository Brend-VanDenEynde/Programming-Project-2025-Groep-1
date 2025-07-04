import logoIcon from '/icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
import { showBedrijfInfoPopup } from './bedrijven.js';
import { formatTijdslotStudent } from './student-speeddates.js';

let pendingDeleteAfspraakId = null; // Gebruik één globale state, identiek aan bedrijven

// utility.js (of bovenin je bestand)
export function getStudentId(studentData = {}) {
  let studentId = studentData?.id || studentData?.gebruiker_id;
  if (!studentId) {
    try {
      const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
      studentId = stored.id || stored.gebruiker_id;
    } catch {}
  }
  return studentId;
}

// API helpers
async function fetchPendingSpeeddates(studentData) {
  const token = sessionStorage.getItem('authToken');
  const studentId = getStudentId(studentData);
  if (!token) {
    renderLogin(document.body);
    return [];
  }
  if (!studentId) {
    alert('Student ID niet gevonden. Probeer opnieuw in te loggen.');
    renderLogin(document.body);
    return [];
  }
  const resp = await fetch(
    `https://api.ehb-match.me/speeddates/pending?id=${studentId}`,
    {
      headers: { Authorization: 'Bearer ' + token },
    }
  );
  if (!resp.ok) throw new Error(`Fout bij ophalen: ${resp.status}`);
  const data = await resp.json();

  // Haal alle relevante bedrijven op via /discover/bedrijven?id={studentId}
  const bedrijvenResp = await fetch(
    `https://api.ehb-match.me/discover/bedrijven?id=${studentId}`,
    { headers: { Authorization: 'Bearer ' + token } }
  );
  const bedrijven = bedrijvenResp.ok ? await bedrijvenResp.json() : [];
  const bedrijfIds = new Set(bedrijven.map((b) => b.gebruiker_id));

  // Filter alleen verzoeken waar asked_by een bedrijf is EN niet jezelf
  const filtered = data.filter(
    (s) => bedrijfIds.has(s.asked_by) && s.asked_by !== studentId
  );

  filtered.forEach((s) => {
    if (s.asked_by == studentId) {
      console.warn('Je eigen verzoek zit in filtered! Debug:', s);
    }
  });
  // Debug info

  return filtered;
}
async function acceptSpeeddate(id) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/speeddates/accept/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('Accepteren mislukt: ' + errText);
  }
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
  if (!found) return '';
  return found.asc ? ' ▲' : ' ▼';
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

// Utility voor bedrijfsfoto's
function getBedrijfFotoUrl(foto) {
  if (!foto) return '/images/default.png';
  if (foto.startsWith('http')) return foto;
  return `https://gt0kk4fbet.ufs.sh/f/${foto}`;
}

// export function renderSpeeddatesRequests(rootElement, studentData = {}) {
export async function renderSpeeddatesRequests(rootElement, studentData = {}) {
  // --- PROBEER ALTIJD EEN STUDENT TE VINDEN ---
  let actualStudentData = studentData;
  if (
    !actualStudentData ||
    (!actualStudentData.id && !actualStudentData.gebruiker_id)
  ) {
    const fromSession =
      sessionStorage.getItem('studentData') || sessionStorage.getItem('user');
    if (fromSession) {
      try {
        actualStudentData = JSON.parse(fromSession);
      } catch {}
    }
  }
  if (
    !actualStudentData ||
    (!actualStudentData.id && !actualStudentData.gebruiker_id)
  ) {
    renderLogin(rootElement);
    return;
  }

  // 1. Zet je page structure neer
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
            <li><button data-route="speeddates" class="sidebar-link">Mijn speeddates</button></li>
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
    <div id="modal-overlay" class="modal-overlay" style="display:none;">
      <div class="modal">
        <p id="modal-message">Weet je zeker dat je deze speeddate wilt weigeren?</p>
        <div class="modal-buttons">
          <button id="modal-yes" class="modal-yes-btn" type="button">Ja</button>
          <button id="modal-no" class="modal-no-btn" type="button">Nee</button>
        </div>
      </div>
    </div>
  `;
  // Bind modal events direct na render
  bindModalEvents();

  // 2. Fetch de data pas NA de render!
  let verzoeken = [];
  try {
    verzoeken = await fetchPendingSpeeddates(actualStudentData); // GEEN tweede filter meer hier
  } catch (e) {
    const el = document.getElementById('speeddates-requests-table');
    if (el) el.innerHTML = `<p style="color:red;">Fout: ${e.message}</p>`;
    return;
  }

  // 3. Render de data in de child-div
  renderTable(verzoeken);

  // Event delegation voor actions (net als bedrijven)
  const tableDiv = document.getElementById('speeddates-table');
  if (tableDiv) {
    tableDiv.removeEventListener('click', handleSpeeddatesTableClick);
    tableDiv.addEventListener('click', handleSpeeddatesTableClick);
  }

  // 4. Zet eventListeners en alles wat met DOM refs te maken heeft NA renderTable
  function renderTable(verzoeken) {
    const table = document.getElementById('speeddates-requests-table');
    if (!table) return;
    if (!verzoeken || verzoeken.length === 0) {
      table.innerHTML = `<p class="geen-data">Nog geen speeddates-verzoeken gevonden.</p>`;
      return;
    }
    table.innerHTML = `
      <div class="speeddates-lijst">
        <div class="speeddates-header">
          <h2>Pending Speeddates-verzoeken (${verzoeken.length})</h2>
        </div>
        <div class="speeddates-table" id="speeddates-table">
          ${verzoeken
            .map(
              (v) => `
            <div class="speeddate-item pending" data-id="${v.id}">
              <div class="speeddate-info">
                <div class="student-info">
                  <img src="${getBedrijfFotoUrl(
                    v.profiel_foto_bedrijf
                  )}" alt="${
                v.naam_bedrijf
              }" class="profiel-foto bedrijf-foto" onerror="this.src='/images/default.png'" />
                  <div class="student-details">
                    <h4 class="bedrijf-popup-trigger" data-bedrijf='${JSON.stringify(
                      v
                    )}' style="cursor:pointer;text-decoration:none;">${
                v.naam_bedrijf
              }</h4>
                  </div>
                </div>
                <div class="afspraak-details">
                  <div class="tijd-lokaal">
                    <p class="tijdslot">${
                      v.begin ? formatTijdslotStudent(v.begin, v.einde) : '-'
                    }</p>
                    <p class="lokaal"><strong>Lokaal:</strong> ${
                      v.lokaal || '-'
                    } </p>
                  </div>
                </div>
                <div class="speeddate-actions">
                  <button class="action-btn accept-btn" data-action="accept" data-id="${
                    v.id
                  }">Accepteren</button>
                  <button class="deny-btn" data-action="delete" data-id="${
                    v.id
                  }">Verwijderen</button>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    // Bind popup triggers after rendering
    setTimeout(() => {
      document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
        el.addEventListener('click', async () => {
          const data = JSON.parse(el.getAttribute('data-bedrijf'));
          await showBedrijfInfoPopup(data);
        });
      });
    }, 0);
  }

  function handleSpeeddatesTableClick(e) {
    const target = e.target.closest('button[data-action]');
    if (!target) return;
    const afspraakId = target.getAttribute('data-id');
    const action = target.getAttribute('data-action');
    if (action === 'accept') {
      acceptSpeeddate(afspraakId).then(() =>
        renderSpeeddatesRequests(rootElement, studentData)
      );
    } else if (action === 'delete') {
      pendingDeleteAfspraakId = afspraakId;
      openDeleteModal();
    }
  }

  function openDeleteModal() {
    const overlay = document.getElementById('modal-overlay');

    if (overlay) overlay.style.display = 'flex';
  }
  function closeDeleteModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function bindModalEvents() {
    const yesBtn = document.getElementById('modal-yes');
    const noBtn = document.getElementById('modal-no');
    const modalMessage = document.getElementById('modal-message');
    const modalButtons = document.querySelector('.modal-buttons');

    if (yesBtn && noBtn) {
      yesBtn.onclick = async () => {
        if (pendingDeleteAfspraakId) {
          yesBtn.disabled = true;
          noBtn.disabled = true;
          try {
            await rejectSpeeddate(pendingDeleteAfspraakId);
            pendingDeleteAfspraakId = null;
            modalMessage.textContent = 'Speeddate succesvol verwijderd!';
            modalButtons.style.display = 'none';
            setTimeout(() => {
              closeDeleteModal();
              renderSpeeddatesRequests(rootElement, studentData);
              modalMessage.textContent =
                'Weet je zeker dat je deze speeddate wilt weigeren?';
              modalButtons.style.display = 'flex';
              yesBtn.disabled = false;
              noBtn.disabled = false;
            }, 1200);
          } catch (err) {
            modalMessage.textContent = 'Fout bij verwijderen: ' + err.message;
            yesBtn.disabled = false;
            noBtn.disabled = false;
          }
        }
      };
      noBtn.onclick = () => {
        pendingDeleteAfspraakId = null;
        closeDeleteModal();
        modalMessage.textContent =
          'Weet je zeker dat je deze speeddate wilt weigeren?';
        modalButtons.style.display = 'flex';
        yesBtn.disabled = false;
        noBtn.disabled = false;
      };
    } else {
      // Modal DOM is niet gevonden
      console.error('Modal buttons niet gevonden bij het binden van events!');
    }
  }

  // Sidebar nav
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
    // Fix: eerst alle oude event listeners verwijderen (eventueel), dan click event toevoegen
    burger.onclick = (event) => {
      event.stopPropagation();
      dropdown.classList.toggle('open');
    };
    // Sluit dropdown als je buiten klikt
    document.addEventListener('click', function (event) {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });
    document.getElementById('nav-settings').onclick = () => {
      dropdown.classList.remove('open');
      showSettingsPopup(() =>
        renderSpeeddatesRequests(rootElement, studentData)
      );
    };
    document.getElementById('nav-logout').onclick = () => {
      dropdown.classList.remove('open');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    };
  }

  // Privacy en contact event listeners, met null-checks
  const privacy = document.getElementById('privacy-policy');
  if (privacy) {
    privacy.addEventListener('click', (e) => {
      e.preventDefault();
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/privacy');
      });
    });
  }
  const contact = document.getElementById('contacteer-ons');
  if (contact) {
    contact.addEventListener('click', (e) => {
      e.preventDefault();
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/contact');
      });
    });
  }

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
      <p><strong>Tijd:</strong> ${
        s.begin
          ? new Date(s.begin).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Onbekend'
      }</p>
      <p><strong>Locatie:</strong> ${s.lokaal || 'Onbekend'}</p>
      <p><strong>Status:</strong> ${
        s.akkoord !== undefined
          ? s.akkoord
            ? 'Geaccepteerd'
            : 'In behandeling'
          : '-'
      }</p>
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
      // Haal student skills/functies uit sessionStorage (voor matching)
      let studentSkills = [],
        studentFuncties = [];
      try {
        const studentData = JSON.parse(
          sessionStorage.getItem('studentData') ||
            sessionStorage.getItem('user') ||
            '{}'
        );
        if (studentData.skills && Array.isArray(studentData.skills)) {
          studentSkills = studentData.skills
            .map((s) => (typeof s === 'string' ? s : s.naam))
            .filter(Boolean)
            .map((s) => s.toLowerCase());
        }
        if (studentData.functies && Array.isArray(studentData.functies)) {
          studentFuncties = studentData.functies
            .map((f) => (typeof f === 'string' ? f : f.naam))
            .filter(Boolean)
            .map((f) => f.toLowerCase());
        }
      } catch {}
      const skillsHtml = skills.length
        ? skills
            .map((skill) => {
              const isMatch = studentSkills.includes(
                (skill.naam || '').toLowerCase()
              );
              return `<span style=\"display:inline-block;padding:4px 8px;margin:3px;border-radius:6px;background:${
                isMatch ? '#e3f2fd' : '#f1f1f1'
              };color:${isMatch ? '#1565c0' : '#222'};font-size:0.85rem;\">${
                skill.naam
              }</span>`;
            })
            .join('')
        : '<em>Geen skills beschikbaar</em>';
      document.getElementById(
        'popup-skills'
      ).innerHTML = `<strong>Skills:</strong><div style=\"margin-top:0.4rem;\">${skillsHtml}</div>`;
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

// Debug/test utility voor modal direct testen
window.showTestModal = () => showDeleteModal(123, () => alert('Success!'));
// Vervang in addBedrijfPopupListeners of soortgelijke plek:
// document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
//   el.addEventListener('click', async () => {
//     const data = JSON.parse(el.dataset.bedrijf);
//     await createBedrijfPopup(data);
//   });
// });
// Door:
document.querySelectorAll('.bedrijf-popup-trigger').forEach((el) => {
  el.addEventListener('click', async () => {
    const data = JSON.parse(el.dataset.bedrijf);
    await showBedrijfInfoPopup(data);
  });
});
