import logoIcon from '../../icons/favicon-32x32.png';
import { renderBedrijfProfiel } from './bedrijf-profiel.js';
import { renderSearchCriteriaBedrijf } from './search-criteria-bedrijf.js';
import { renderBedrijfSpeeddates } from './bedrijf-speeddates.js';
import { renderBedrijfSpeeddatesRequests } from './bedrijf-speeddates-verzoeken.js';
import { renderBedrijfQRPopup } from './bedrijf-qr-popup.js';
import { renderLogin } from '../login.js';
import { showBedrijfSettingsPopup } from './bedrijf-settings.js';
import { fetchStudents } from '../../utils/data-api.js';
import defaultFoto from '../../images/default.png';
import { createBedrijfNavbar, closeBedrijfNavbar, setupBedrijfNavbarEvents } from '../../utils/bedrijf-navbar.js';

// Globale variabele voor studenten data
let studenten = [];

// Popup voor student detail
function showStudentPopup(student) {
  // Verwijder bestaande popup als die er is
  const existing = document.getElementById('student-popup-modal');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'student-popup-modal';
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100vw';
  popup.style.height = '100vh';
  popup.style.background = 'rgba(0,0,0,0.5)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.style.zIndex = '2000';

  // Tijdslots voor speeddate
  const tijdslots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
  ];
  popup.innerHTML = `
    <div id="student-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:400px;width:95vw;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="student-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">&times;</button>
      <img src="${student.foto}" alt="Logo ${
    student.naam
  }" style="width:90px;height:90px;object-fit:contain;margin-bottom:1.2rem;" onerror="this.onerror=null;this.src='${defaultFoto}'">
      <h2 style="margin-bottom:0.5rem;text-align:center;">${student.naam}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">${
        student.locatie
      }</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${
        student.werkdomein
      }</div>
      <a href="${
        student.linkedin
      }" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>
      <p style="text-align:center;margin-bottom:1.2rem;">${student.bio}</p>
      <div style="margin-bottom:1rem;width:100%;">
        <label for="speeddates-tijdslot" style="font-weight:500;">Kies een tijdslot:</label>
        <select id="speeddates-tijdslot" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:6px;border:1.5px solid #e1e5e9;">
          <option value="">-- Selecteer een tijdslot --</option>
          ${tijdslots
            .map((slot) => `<option value="${slot}">${slot}</option>`)
            .join('')}
        </select>
      </div>
      <button id="speeddates-aanvraag-btn" style="background:#00bcd4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1rem;cursor:pointer;" disabled>Confirmeer aanvraag</button>
      <div id="speeddates-aanvraag-status" style="margin-top:1rem;font-size:1rem;color:#2aa97b;display:none;">Speeddate aangevraagd!</div>
    </div>
  `;
  document.body.appendChild(popup);

  // Sluit popup bij klik op kruisje of buiten popup
  document.getElementById('student-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });

  // Enable/disable button op basis van tijdslot
  const tijdslotSelect = document.getElementById('speeddates-tijdslot');
  const aanvraagBtn = document.getElementById('speeddates-aanvraag-btn');
  tijdslotSelect.addEventListener('change', () => {
    aanvraagBtn.disabled = !tijdslotSelect.value;
  });

  // Speeddate aanvraag knop
  aanvraagBtn.onclick = () => {
    const status = document.getElementById('speeddates-aanvraag-status');
    status.textContent = `Speeddate aangevraagd voor ${tijdslotSelect.value}!`;
    status.style.display = 'block';
    aanvraagBtn.disabled = true;
    tijdslotSelect.disabled = true;
    setTimeout(() => {
      status.style.display = 'none';
      popup.remove();
    }, 1500);
  };
}

// Filter en zoek functionaliteit (alleen op naam zoeken)
function filterStudenten({ zoek = '', locatie = '', werkdomein = '' }) {
  return studenten.filter((b) => {
    const matchZoek = zoek
      ? b.naam.toLowerCase().includes(zoek.toLowerCase())
      : true;
    const matchLocatie = locatie ? b.locatie === locatie : true;
    const matchDomein = werkdomein
      ? b.werkdomein.toLowerCase().includes(werkdomein.toLowerCase())
      : true;
    return matchZoek && matchLocatie && matchDomein;
  });
}

// Unieke locaties en domeinen voor filters
function getUniekeLocaties() {
  return [...new Set(studenten.map((b) => b.locatie))];
}
function getUniekeDomeinen() {
  // Splits domeinen op komma's en maak uniek
  return [
    ...new Set(
      studenten.flatMap((b) => b.werkdomein.split(',').map((d) => d.trim()))
    ),
  ];
}

// Hoofdfunctie: lijst van studenten
export async function renderStudenten(rootElement, bedrijfData = {}) {
  let huidigeZoek = '';
  let huidigeLocatie = '';
  let huidigeDomein = '';
  // Check if user is authenticated
  const authToken = window.sessionStorage.getItem('authToken');
  if (!authToken) {
    renderLogin(rootElement);
    return;
  }

  // Load students from API
  try {
    const students = await fetchStudents(); // Check if response is an array
    if (!Array.isArray(students)) {
      studenten = [];
    } else {
      // Map API response to expected format
      studenten = students.map((student) => ({
        naam: student.naam,
        linkedin: student.linkedin || '',
        bio: student.bio || '',
        foto:
          student.foto && student.foto.trim() !== ''
            ? student.foto
            : defaultFoto, // Use default if no foto or empty
        locatie: student.plaats || '',
        werkdomein: student.werkdomein || '',
        contact_email: student.contact_email,
        gebruiker_id: student.gebruiker_id,
      }));
    }
  } catch (error) {
    // If authentication failed, redirect to login
    if (error.message.includes('Authentication failed')) {
      renderLogin(rootElement);
      return;
    }
    studenten = [];
  }
  function renderList() {
    const studentenListElement = document.getElementById('studenten-list');
    if (!studentenListElement) return;
    if (studenten.length === 0) {
      studentenListElement.innerHTML = `<div style="text-align:center;width:100%;color:#888;">Laden van studenten...</div>`;
      return;
    }
    const gefilterd = filterStudenten({
      zoek: huidigeZoek,
      locatie: huidigeLocatie,
      werkdomein: huidigeDomein,
    });
    studentenListElement.innerHTML = gefilterd.length
      ? gefilterd
          .map(
            (student, idx) => `
    <div class="student-card" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;padding:1.5rem 1rem;display:flex;flex-direction:column;align-items:center;width:220px;cursor:pointer;transition:box-shadow 0.2s;" data-student-idx="${studenten.indexOf(
      student
    )}">
      <img src="${student.foto}" alt="Logo ${
              student.naam
            }" style="width:80px;height:80px;border-radius:50%;object-fit:contain;margin-bottom:1rem;" onerror="this.onerror=null;this.src='${defaultFoto}'">
      <h3 style="margin-bottom:0.5rem;text-align:center;">${student.naam}</h3>
      <div style="font-size:0.97rem;color:#666;margin-bottom:0.3rem;">${
        student.locatie
      }</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.3rem;">${
        student.werkdomein
      }</div>
    </div>
  `
          )
          .join('')
      : `<div style="text-align:center;width:100%;color:#888;">Geen studenten gevonden.</div>`;
    document.querySelectorAll('.student-card').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = card.getAttribute('data-student-idx');
        showStudentPopup(studenten[idx]);
      });
    });
  }
  // Initial render with loading state
  rootElement.innerHTML = `
    ${createBedrijfNavbar('studenten')}
    <div class="bedrijf-profile-content">
      <div class="bedrijf-profile-form-container">
        <h1 class="bedrijf-profile-title">Studenten</h1>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.2rem;">
          <input id="student-zoek" type="text" placeholder="Zoek student, locatie of domein..." style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;min-width:180px;">
          <select id="student-filter-locatie" style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;">
            <option value="">Alle locaties</option>
          </select>
          <select id="student-filter-domein" style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;">
            <option value="">Alle domeinen</option>
          </select>
        </div>
        <div id="studenten-list" class="studenten-list" style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;">
          <div style="text-align:center;width:100%;color:#888;">Laden van studenten...</div>
        </div>
      </div>
    </div>
    ${closeBedrijfNavbar()}
  `;
  setupBedrijfNavbarEvents();
  function updateFilters() {
    const locatieSelect = document.getElementById('student-filter-locatie');
    const domeinSelect = document.getElementById('student-filter-domein');
    if (locatieSelect && domeinSelect) {
      const uniekeLocaties = getUniekeLocaties();
      locatieSelect.innerHTML =
        '<option value="">Alle locaties</option>' +
        uniekeLocaties
          .map((loc) => `<option value="${loc}">${loc}</option>`)
          .join('');
      const uniekeDomeinen = getUniekeDomeinen();
      domeinSelect.innerHTML =
        '<option value="">Alle domeinen</option>' +
        uniekeDomeinen
          .map((dom) => `<option value="${dom}">${dom}</option>`)
          .join('');
    }
  }
  updateFilters();
  renderList();
  const setupEventListeners = () => {
    const zoekElement = document.getElementById('student-zoek');
    const locatieElement = document.getElementById('student-filter-locatie');
    const domeinElement = document.getElementById('student-filter-domein');
    if (zoekElement) {
      zoekElement.addEventListener('input', (e) => {
        huidigeZoek = e.target.value;
        renderList();
      });
    }
    if (locatieElement) {
      locatieElement.addEventListener('change', (e) => {
        huidigeLocatie = e.target.value;
        renderList();
      });
    }
    if (domeinElement) {
      domeinElement.addEventListener('change', (e) => {
        huidigeDomein = e.target.value;
        renderList();
      });
    }
  };
  setupEventListeners();
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.getElementById('nav-settings').addEventListener('click', () => {
      dropdown.style.display = 'none';
      // TODO: implement bedrijf settings popup
      showSettingsPopup(() => renderStudenten(rootElement, bedrijfData));
      alert('Instellingen popup nog niet geïmplementeerd.');
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.style.display = 'none';
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
