import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
import { fetchCompanies } from '../../utils/data-api.js';
import defaultBedrijfLogo from '../../images/defaultlogo.webp';
import {
  getFavoriteCompanies,
  addFavoriteCompany,
  removeFavoriteCompany,
  isCompanyFavorite,
  toggleFavoriteCompany,
  filterFavoriteCompanies,
} from '../../utils/favorites-storage.js';
import { fetchAndStoreStudentProfile } from '../../utils/fetch-student-profile.js';

// Globale variabele voor bedrijven data
let bedrijven = [];
let currentStudentId = null;

// Feedback notification function
function showFeedbackNotification(message, type = 'success') {
  // Remove any existing notification
  const existing = document.querySelector('.feedback-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `feedback-notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// Popup voor bedrijf detail
// Popup voor bedrijf detail - MET slots en speeddate verzoek
async function showBedrijfPopup(bedrijf, studentId) {
  // Remove any existing popup
  const existing = document.getElementById('bedrijf-popup-modal');
  if (existing) existing.remove();

  // Haal functies en skills op
  let functies = [];
  let skills = [];
  try {
    const functiesResp = await fetch(
      `https://api.ehb-match.me/bedrijven/${bedrijf.gebruiker_id}/functies`,
      {
        headers: {
          Authorization: 'Bearer ' + sessionStorage.getItem('authToken'),
        },
      }
    );
    if (functiesResp.ok) functies = await functiesResp.json();
  } catch {}
  try {
    const skillsResp = await fetch(
      `https://api.ehb-match.me/bedrijven/${bedrijf.gebruiker_id}/skills`,
      {
        headers: {
          Authorization: 'Bearer ' + sessionStorage.getItem('authToken'),
        },
      }
    );
    if (skillsResp.ok) skills = await skillsResp.json();
  } catch {}

  const popup = document.createElement('div');
  popup.id = 'bedrijf-popup-modal';
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

  // Uren en slots genereren
  const uren = [10, 11, 12, 13, 14, 15];
  const slotDuur = 10; // minuten
  const slotsPerUur = 6; // 0,10,20,30,40,50
  const datum = '2025-10-01'; // vaste dag in jouw voorbeeld
  function getSlotsForUur(uur) {
    return Array.from({ length: slotsPerUur }, (_, i) => {
      const min = i * slotDuur;
      const mm = min < 10 ? `0${min}` : `${min}`;
      return {
        label: `${uur}u${mm}`,
        value: `${datum}T${uur < 10 ? '0' : ''}${uur}:${mm}:00Z`,
      };
    });
  }
  const isFavoriet = currentStudentId
    ? isCompanyFavorite(currentStudentId, bedrijf.gebruiker_id)
    : false;
  const hartIcon = isFavoriet ? '❤️' : '🤍';

  popup.innerHTML = `
    <div id="bedrijf-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:420px;width:95vw;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="bedrijf-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">&times;</button>
      <button id="popup-favorite-btn" class="popup-favorite-btn" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}">${hartIcon}</button>
      <img src="${bedrijf.foto}" alt="Logo ${
    bedrijf.naam
  }" style="width:90px;height:90px;object-fit:contain;margin-bottom:1.2rem;" onerror="this.onerror=null;this.src='${defaultBedrijfLogo}'">
      <h2 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">${bedrijf.locatie}</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${bedrijf.werkdomein}</div>
      <a href="${bedrijf.linkedin}" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>
      <p style="text-align:center;margin-bottom:1.2rem;">${bedrijf.bio}</p>
      <div style="font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;">
        <a href="mailto:${bedrijf.contact_email}" style="color:#444;">${bedrijf.contact_email}</a>
      </div>
      <div style="margin-bottom:1rem;text-align:left;width:100%;">
        <strong>Openstaande functies:</strong>
        <div style="margin-top:0.3rem;">
          ${
            functies.length
              ? functies.map((f) => `<span class="functie-badge">${f.naam}</span>`).join(' ')
              : '<span style="color:#aaa;">Geen functies bekend</span>'
          }
        </div>
      </div>
      <div style="margin-bottom:1rem;text-align:left;width:100%;">
        <strong>Gevraagde skills:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem;">
          ${
            skills.length
              ? skills
                  .map(
                    (s) =>
                      `<span style="background:#eee;border-radius:6px;padding:0.3rem 0.7rem;font-size:0.85rem;">${s.naam}</span>`
                  )
                  .join('')
              : '<span style="color:#aaa;">Geen skills opgegeven</span>'
          }
        </div>
      </div>
      <div style="margin-bottom:1rem;width:100%;">
        <label for="speeddates-uur" style="font-weight:500;">Kies een uur:</label>
        <select id="speeddates-uur" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:6px;border:1.5px solid #e1e5e9;">
          <option value="">-- Selecteer een uur --</option>
          ${uren
            .map(
              (uur) => `<option value="${uur}">${uur}:00 - ${uur}:59</option>`
            )
            .join('')}
        </select>
      </div>
      <div style="margin-bottom:1rem;width:100%;">
        <label for="speeddates-minuten" style="font-weight:500;">Kies een tijdslot:</label>
        <select id="speeddates-minuten" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:6px;border:1.5px solid #e1e5e9;" disabled>
          <option value="">-- Selecteer een tijdslot --</option>
        </select>
      </div>
      <button id="speeddates-aanvraag-btn" style="background:#00bcd4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1rem;cursor:pointer;" disabled>Confirmeer aanvraag</button>
      <div id="speeddates-aanvraag-status" style="margin-top:1rem;font-size:1rem;color:#2aa97b;display:none;">Speeddate aangevraagd!</div>
    </div>
  `;
  document.body.appendChild(popup);
  // Sluiten popup
  document.getElementById('bedrijf-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });

  // Favoriet knop in popup
  const popupFavoriteBtn = document.getElementById('popup-favorite-btn');
  if (popupFavoriteBtn && currentStudentId) {
    popupFavoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      const isNowFavorite = toggleFavoriteCompany(
        currentStudentId,
        bedrijf.gebruiker_id
      );

      // Update de button icon en tooltip
      popupFavoriteBtn.innerHTML = isNowFavorite ? '❤️' : '🤍';
      popupFavoriteBtn.title = isNowFavorite
        ? 'Verwijder uit favorieten'
        : 'Voeg toe aan favorieten';
      // Update ook de kaart in de achtergrond als die nog zichtbaar is
      const cardFavoriteBtn = document.querySelector(
        `[data-company-id="${bedrijf.gebruiker_id}"]`
      );
      if (cardFavoriteBtn) {
        cardFavoriteBtn.innerHTML = isNowFavorite ? '❤️' : '🤍';
        cardFavoriteBtn.title = isNowFavorite
          ? 'Verwijder uit favorieten'
          : 'Voeg toe aan favorieten';
      }

      // Toon feedback notificatie
      const message = isNowFavorite
        ? `${bedrijf.naam} toegevoegd aan favorieten!`
        : `${bedrijf.naam} verwijderd uit favorieten`;
      showFeedbackNotification(message, isNowFavorite ? 'success' : 'info');
      // Voeg animatie toe aan de button
      popupFavoriteBtn.classList.add('animating');
      setTimeout(() => popupFavoriteBtn.classList.remove('animating'), 400);

      // Update favorites count
      const countElement = document.getElementById('favorites-count');
      if (countElement) {
        const favoriteCompanies = getFavoriteCompanies(currentStudentId);
        countElement.textContent = `(${favoriteCompanies.length})`;
      }
    });
  }

  // Dynamische slots vullen na uur-keuze
  const uurSelect = document.getElementById('speeddates-uur');
  const minutenSelect = document.getElementById('speeddates-minuten');
  const aanvraagBtn = document.getElementById('speeddates-aanvraag-btn');
  let gekozenDatum = '';

  uurSelect.addEventListener('change', () => {
    minutenSelect.innerHTML = `<option value="">-- Selecteer een tijdslot --</option>`;
    minutenSelect.disabled = !uurSelect.value;
    aanvraagBtn.disabled = true;
    if (uurSelect.value) {
      const slots = getSlotsForUur(Number(uurSelect.value));
      slots.forEach((slot) => {
        const opt = document.createElement('option');
        opt.value = slot.value;
        opt.textContent = slot.label;
        minutenSelect.appendChild(opt);
      });
    }
  });

  minutenSelect.addEventListener('change', () => {
    aanvraagBtn.disabled = !minutenSelect.value;
    gekozenDatum = minutenSelect.value;
  });

  // Speeddate aanvraag knop (API-call)
  // Speeddate aanvraag knop (API-call)
  aanvraagBtn.onclick = async () => {
    const status = document.getElementById('speeddates-aanvraag-status');
    aanvraagBtn.disabled = true;
    uurSelect.disabled = true;
    minutenSelect.disabled = true;
    status.textContent = 'Aanvraag wordt verstuurd...';
    status.style.display = 'block';
    try {
      const req = await fetch('https://api.ehb-match.me/speeddate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          id_student: studentId,
          id_bedrijf: bedrijf.gebruiker_id,
          datum: gekozenDatum,
        }),
      });
      if (req.ok) {
        status.textContent = `Speeddate aangevraagd voor ${
          uurSelect.value
        }u${minutenSelect.selectedOptions[0].textContent.slice(-2)}!`;
      } else {
        const err = await req.json();
        status.textContent = err.message || 'Er ging iets mis!';
        status.style.color = '#da2727';
      }
    } catch (e) {
      status.textContent = 'Er ging iets mis bij het verzenden!';
      status.style.color = '#da2727';
    }
    setTimeout(() => {
      status.style.display = 'none';
      popup.remove();
    }, 1800);
  };
}

// Filter en zoek functionaliteit (inclusief favorieten)
// Nieuwe filterfunctie: multi-select voor locatie, functie, skills, talen + favorieten
function filterBedrijven({ zoek = '', locaties = [], functies = [], skills = [], talen = [], toonAlleFavorieten = false }) {
  let gefilterdeBedrijven = bedrijven.filter((b) => {
    const matchZoek = zoek
      ? b.naam.toLowerCase().includes(zoek.toLowerCase())
      : true;
    const matchLocatie = locaties.length > 0 ? locaties.includes(b.locatie) : true;
    const matchFunctie = functies.length > 0
      ? (b.functiesArray || []).some(f => functies.includes(f.naam))
      : true;
    const matchSkill = skills.length > 0
      ? (b.skillsArray || []).some(s => s.type === 0 && skills.includes(s.naam))
      : true;
    const matchTaal = talen.length > 0
      ? (b.skillsArray || []).some(s => s.type === 1 && talen.includes(s.naam))
      : true;
    return matchZoek && matchLocatie && matchFunctie && matchSkill && matchTaal;
  });
  // Alleen favorieten tonen indien gewenst
  if (toonAlleFavorieten && currentStudentId) {
    gefilterdeBedrijven = filterFavoriteCompanies(
      gefilterdeBedrijven,
      currentStudentId
    );
  }
  return gefilterdeBedrijven;
}

// Unieke locaties, functies, skills (type 0), talen (type 1)
function getUniekeLocaties() {
  return [...new Set(bedrijven.map((b) => b.locatie).filter(Boolean))];
}
function getUniekeFuncties() {
  return [...new Set(bedrijven.flatMap(b => (b.functiesArray || []).map(f => f.naam)))];
}
function getUniekeSkills() {
  return [...new Set(bedrijven.flatMap(b => (b.skillsArray || []).filter(s => s.type === 0).map(s => s.naam)))];
}
function getUniekeTalen() {
  return [...new Set(bedrijven.flatMap(b => (b.skillsArray || []).filter(s => s.type === 1).map(s => s.naam)))];
}

// SlimSelect CDN injectie (indien nog niet aanwezig)
function injectSlimSelectCDN() {
  if (!document.getElementById('slimselect-css')) {
    const link = document.createElement('link');
    link.id = 'slimselect-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/slim-select@2.8.0/dist/slimselect.css';
    document.head.appendChild(link);
  }
  if (!document.getElementById('slimselect-js')) {
    const script = document.createElement('script');
    script.id = 'slimselect-js';
    script.src = 'https://cdn.jsdelivr.net/npm/slim-select@2.8.0/dist/slimselect.min.js';
    document.head.appendChild(script);
  }
}

// Hoofdfunctie: lijst van bedrijven
export async function renderBedrijven(rootElement, studentData = {}) {
  injectSlimSelectCDN();
  setTimeout(async () => {
    let huidigeZoek = '';
    let huidigeLocaties = [];
    let huidigeFuncties = [];
    let huidigeSkills = [];
    let huidigeTalen = [];
    let toonAlleFavorieten = false;
    // Probeer eerst studentData uit sessionStorage te halen
    let actualStudentData = studentData;
    if (!actualStudentData || (!actualStudentData.id && !actualStudentData.gebruiker_id)) {
      const storedData = window.sessionStorage.getItem('studentData');
      if (storedData) {
        try {
          actualStudentData = JSON.parse(storedData);
        } catch (e) {}
      }
    }
    if (!actualStudentData || (!actualStudentData.id && !actualStudentData.gebruiker_id)) {
      try {
        actualStudentData = await fetchAndStoreStudentProfile();
      } catch (error) {
        actualStudentData = {
          id: 'anonymous-user',
          gebruiker_id: 'anonymous-user',
        };
      }
    }
    currentStudentId = actualStudentData?.id || actualStudentData?.gebruiker_id;
    // Check if user is authenticated
    const authToken = window.sessionStorage.getItem('authToken');
    if (!authToken) {
      renderLogin(rootElement);
      return;
    }
    // Loading-indicator tijdens data ophalen
    rootElement.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Bedrijven laden...</div>
      </div>
    `;
    // Load companies from API
    try {
      const companies = await fetchCompanies();
      if (!Array.isArray(companies)) {
        bedrijven = [];
      } else {
        bedrijven = await Promise.all(companies.map(async (company) => {
          let functiesArray = [];
          let skillsArray = [];
          try {
            const functiesResp = await fetch(`https://api.ehb-match.me/bedrijven/${company.gebruiker_id}/functies`, {
              headers: { Authorization: 'Bearer ' + sessionStorage.getItem('authToken') }
            });
            if (functiesResp.ok) functiesArray = await functiesResp.json();
          } catch {}
          try {
            const skillsResp = await fetch(`https://api.ehb-match.me/bedrijven/${company.gebruiker_id}/skills`, {
              headers: { Authorization: 'Bearer ' + sessionStorage.getItem('authToken') }
            });
            if (skillsResp.ok) skillsArray = await skillsResp.json();
          } catch {}
          return {
            naam: company.naam,
            linkedin: company.linkedin || '',
            bio: company.bio || '',
            foto:
              company.profiel_foto_url && company.profiel_foto_url.trim() !== ''
                ? company.profiel_foto_url
                : defaultBedrijfLogo,
            locatie: company.plaats || '',
            werkdomein: company.werkdomein || '',
            contact_email: company.contact_email,
            gebruiker_id: company.gebruiker_id,
            functiesArray,
            skillsArray
          };
        }));
      }
    } catch (error) {
      if (error.message.includes('Authentication failed')) {
        renderLogin(rootElement);
        return;
      }
      bedrijven = [];
    }
    // Function to update favorites count display
    function updateFavoritesCount() {
      const countElement = document.getElementById('favorites-count');
      if (countElement && currentStudentId) {
        const favoriteCompanies = getFavoriteCompanies(currentStudentId);
        countElement.textContent = `(${favoriteCompanies.length})`;
      }
    }
    function renderList() {
      const bedrijvenListElement = document.getElementById('bedrijven-list');
      if (!bedrijvenListElement) return;
      if (bedrijven.length === 0) {
        bedrijvenListElement.innerHTML = `<div style="text-align:center;width:100%;color:#888;">Laden van bedrijven...</div>`;
        return;
      }
      const gefilterd = filterBedrijven({
        zoek: huidigeZoek,
        locaties: huidigeLocaties,
        functies: huidigeFuncties,
        skills: huidigeSkills,
        talen: huidigeTalen,
        toonAlleFavorieten: toonAlleFavorieten
      });
      bedrijvenListElement.innerHTML = gefilterd.length
        ? gefilterd
            .map((bedrijf, idx) => {
              const isFavoriet = currentStudentId
                ? isCompanyFavorite(currentStudentId, bedrijf.gebruiker_id)
                : false;
              const hartIcon = isFavoriet ? '❤️' : '🤍';
              return `
    <div class="bedrijf-card" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;padding:1.5rem 1rem;display:flex;flex-direction:column;align-items:center;width:220px;cursor:pointer;transition:box-shadow 0.2s;position:relative;" data-bedrijf-idx="${bedrijven.indexOf(bedrijf)}">
      <button class="favorite-btn" data-company-id="${bedrijf.gebruiker_id}" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;cursor:pointer;z-index:2;">${hartIcon}</button>
      <img src="${bedrijf.foto}" alt="Logo ${bedrijf.naam}" style="width:80px;height:80px;border-radius:50%;object-fit:contain;margin-bottom:1rem;" onerror="this.onerror=null;this.src='${defaultBedrijfLogo}'">
      <h3 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h3>
      <div style="font-size:0.97rem;color:#666;margin-bottom:0.3rem;">${bedrijf.locatie}</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.3rem;">${bedrijf.werkdomein}</div>
    </div>
  `;
            })
            .join('')
        : `<div style="text-align:center;width:100%;color:#888;">Geen bedrijven gevonden.</div>`;
      document.querySelectorAll('.bedrijf-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('favorite-btn')) {
            return;
          }
          const idx = card.getAttribute('data-bedrijf-idx');
          showBedrijfPopup(
            bedrijven[idx],
            actualStudentData.id || actualStudentData.gebruiker_id
          );
        });
      });
      document.querySelectorAll('.favorite-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const companyId = btn.getAttribute('data-company-id');
          if (!currentStudentId || !companyId) {
            return;
          }
          const isNowFavorite = toggleFavoriteCompany(
            currentStudentId,
            companyId
          );
          btn.innerHTML = isNowFavorite ? '❤️' : '🤍';
          btn.title = isNowFavorite
            ? 'Verwijder uit favorieten'
            : 'Voeg toe aan favorieten';
          const bedrijf = bedrijven.find((b) => b.gebruiker_id == companyId);
          const bedrijfNaam = bedrijf ? bedrijf.naam : 'Bedrijf';
          const message = isNowFavorite
            ? `${bedrijfNaam} toegevoegd aan favorieten!`
            : `${bedrijfNaam} verwijderd uit favorieten`;
          showFeedbackNotification(message, isNowFavorite ? 'success' : 'info');
          btn.classList.add('animating');
          setTimeout(() => btn.classList.remove('animating'), 400);
          updateFavoritesCount();
        });
      });
      updateFavoritesCount();
    }
    // Initial render with loading state
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
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link active">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container" style="padding:2.5rem 2.2rem 2.2rem 2.2rem; border-radius:18px; background:#fff; box-shadow:0 4px 24px #0001; max-width:1200px; margin:auto;">
            <h1 class="student-profile-title">Bedrijven</h1>
            <div id="bedrijven-filterbar" class="bedrijven-filterbar-grid" style="background:#f8fafc; padding:1.2rem 1.2rem 1.2rem 1.2rem; border-radius:14px; margin-bottom:2.2rem; box-shadow:0 2px 8px #0001; border:1.5px solid #e1e5e9;">
              <div class="zoek-group">
                <label for="bedrijf-zoek">Zoeken</label>
                <input id="bedrijf-zoek" type="text" placeholder="Zoek bedrijf of locatie...">
              </div>
              <div id="filter-locaties" class="filter-group"></div>
              <div id="filter-functies" class="filter-group"></div>
              <div id="filter-skills" class="filter-group"></div>
              <div id="filter-talen" class="filter-group"></div>
              <div class="reset-group">
                <button id="reset-filters" style="padding:0.6rem 1.2rem;border-radius:8px;border:1.5px solid #e1e5e9;background:#f5f5f5;cursor:pointer;min-width:120px;">Reset filters</button>
              </div>
            </div>
            <div style="height:1px;width:100%;background:#e1e5e9;margin-bottom:2.2rem;"></div>
            <div id="bedrijven-list" class="bedrijven-list" style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;">
              <div style="text-align:center;width:100%;color:#888;">Laden van bedrijven...</div>
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

    // Voeg moderne grid CSS toe voor de filterbalk en card
    const style = document.createElement('style');
    style.innerHTML = `
      .student-profile-form-container.bedrijven-form-card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 24px #0001;
        padding: 2.2rem 2.2rem 2.5rem 2.2rem;
        margin: 2.5rem auto 2.5rem auto;
        max-width: 1200px;
        width: 100%;
        box-sizing: border-box;
        position: relative;
      }
      .bedrijven-filterbar-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.2rem 1.6rem;
        align-items: end;
        background: transparent;
        border-radius: 12px;
        margin-bottom: 1.2rem;
        padding: 0;
        position: relative;
      }
      .bedrijven-filterbar-grid .filter-group,
      .bedrijven-filterbar-grid .zoek-group,
      .bedrijven-filterbar-grid .reset-group {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
        width: 100%;
      }
      .bedrijven-filterbar-grid label {
        font-weight: 500;
        font-size: 0.9rem;
        margin-bottom: 0.2rem;
      }
      .bedrijven-filterbar-grid select,
      .bedrijven-filterbar-grid input[type="text"] {
        padding: 0.6rem 0.9rem;
        border-radius: 8px;
        border: 1.5px solid #e1e5e9;
        font-size: 0.95rem;
        min-height: 42px;
        height: 42px;
        box-sizing: border-box;
        width: 100%;
      }
      .bedrijven-filterbar-grid .ss-main {
        min-height: 42px !important;
        height: 42px !important;
        box-sizing: border-box;
      }
      /* SlimSelect: scrollbare chips bij veel geselecteerde opties */
      .bedrijven-filterbar-grid .ss-main.multi {
        max-height: 86px !important;
        overflow-y: auto !important;
        flex-wrap: wrap !important;
        align-items: flex-start !important;
        scrollbar-width: thin;
      }
      .bedrijven-filterbar-grid .ss-main {
        padding: 0.6rem 0.8rem;
      }
      /* Scrollbar styling voor Chrome */
      .bedrijven-filterbar-grid .ss-main.multi::-webkit-scrollbar {
        height: 6px;
        width: 6px;
      }
      .bedrijven-filterbar-grid .ss-main.multi::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 6px;
      }
      .bedrijven-divider {
        border: none;
        border-top: 1.5px solid #e1e5e9;
        margin: 1.2rem 0 2.2rem 0;
      }
      @media (min-width: 1200px) {
        .bedrijven-filterbar-grid {
          grid-template-columns: repeat(6, 1fr);
        }
        .student-profile-form-container.bedrijven-form-card {
          padding: 2.5rem 3.5rem 2.8rem 3.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Custom filter UI rendering
    function renderFilterOptions() {
      // Locaties (popup trigger ipv select)
      const locaties = getUniekeLocaties();
      const locatieDiv = document.getElementById('filter-locaties');
      locatieDiv.innerHTML = `
        <label for="locaties-popup-trigger">Locatie</label>
        <button id="locaties-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeLocaties.length ? huidigeLocaties.join(', ') : 'Locatie kiezen...'}
        </button>
      `;
      // Functies (popup trigger ipv select)
      const functies = getUniekeFuncties();
      const functieDiv = document.getElementById('filter-functies');
      functieDiv.innerHTML = `
        <label for="functies-popup-trigger">Functie</label>
        <button id="functies-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeFuncties.length ? huidigeFuncties.join(', ') : 'Functie kiezen...'}
        </button>
      `;
      // Skills (popup trigger ipv select)
      const skills = getUniekeSkills();
      const skillDiv = document.getElementById('filter-skills');
      skillDiv.innerHTML = `
        <label for="skills-popup-trigger">Skills</label>
        <button id="skills-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeSkills.length ? huidigeSkills.join(', ') : 'Skills kiezen...'}
        </button>
      `;
      // Talen (popup trigger ipv select)
      const talen = getUniekeTalen();
      const taalDiv = document.getElementById('filter-talen');
      taalDiv.innerHTML = `
        <label for="talen-popup-trigger">Talen</label>
        <button id="talen-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeTalen.length ? huidigeTalen.join(', ') : 'Talen kiezen...'}
        </button>
      `;
      // Popup triggers voor alle filters
      document.getElementById('locaties-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'locaties-filter-popup',
          title: 'Kies locaties',
          options: getUniekeLocaties(),
          selected: huidigeLocaties,
          onSave: (gekozen) => {
            huidigeLocaties = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      document.getElementById('functies-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'functies-filter-popup',
          title: 'Kies functies',
          options: getUniekeFuncties(),
          selected: huidigeFuncties,
          onSave: (gekozen) => {
            huidigeFuncties = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      document.getElementById('skills-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'skills-filter-popup',
          title: 'Kies je skills',
          options: getUniekeSkills(),
          selected: huidigeSkills,
          onSave: (gekozen) => {
            huidigeSkills = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      document.getElementById('talen-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'talen-filter-popup',
          title: 'Kies je talen',
          options: getUniekeTalen(),
          selected: huidigeTalen,
          onSave: (gekozen) => {
            huidigeTalen = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      // Favorieten-toggle
      const filterbar = document.getElementById('bedrijven-filterbar');
      if (filterbar && !document.getElementById('favorieten-toggle-group')) {
        const favDiv = document.createElement('div');
        favDiv.className = 'filter-group';
        favDiv.id = 'favorieten-toggle-group';
        favDiv.innerHTML = `
          <label for="filter-favorieten">Favorieten</label>
          <label class="favorites-filter-label" style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;padding:0.5rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#f8f9fa;">
            <input type="checkbox" id="filter-favorieten" style="margin:0;">
            <span style="font-size:0.9rem;">Alleen favorieten ❤️</span>
            <span id="favorites-count" style="font-size:0.8rem;color:#666;font-weight:normal;">(0)</span>
          </label>
        `;
        filterbar.appendChild(favDiv);
      }
      .bedrijven-filterbar-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.2rem 1.6rem;
        align-items: end;
        background: transparent;
        border-radius: 12px;
        margin-bottom: 1.2rem;
        padding: 0;
      }
      .bedrijven-filterbar-grid .filter-group,
      .bedrijven-filterbar-grid .zoek-group,
      .bedrijven-filterbar-grid .reset-group {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
        width: 100%;
      }
      .bedrijven-filterbar-grid label {
        font-weight: 500;
        font-size: 0.9rem;
        margin-bottom: 0.2rem;
      }
      .bedrijven-filterbar-grid select,
      .bedrijven-filterbar-grid input[type="text"] {
        padding: 0.6rem 0.9rem;
        border-radius: 8px;
        border: 1.5px solid #e1e5e9;
        font-size: 0.95rem;
        min-height: 42px;
        height: 42px;
        box-sizing: border-box;
        width: 100%;
      }
      .bedrijven-filterbar-grid .ss-main {
        min-height: 42px !important;
        height: 42px !important;
        box-sizing: border-box;
      }
      /* SlimSelect: scrollbare chips bij veel geselecteerde opties */
      .bedrijven-filterbar-grid .ss-main.multi {
        max-height: 86px !important;
        overflow-y: auto !important;
        flex-wrap: wrap !important;
        align-items: flex-start !important;
        scrollbar-width: thin;
      }
      .bedrijven-filterbar-grid .ss-main {
        padding: 0.6rem 0.8rem;
      }
      /* Scrollbar styling voor Chrome */
      .bedrijven-filterbar-grid .ss-main.multi::-webkit-scrollbar {
        height: 6px;
        width: 6px;
      }
      .bedrijven-filterbar-grid .ss-main.multi::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 6px;
      }
      .bedrijven-divider {
        border: none;
        border-top: 1.5px solid #e1e5e9;
        margin: 1.2rem 0 2.2rem 0;
      }
      @media (min-width: 1200px) {
        .bedrijven-filterbar-grid {
          grid-template-columns: repeat(6, 1fr);
        }
        .student-profile-form-container.bedrijven-form-card {
          padding: 2.5rem 3.5rem 2.8rem 3.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Custom filter UI rendering
    function renderFilterOptions() {
      // Locaties (popup trigger ipv select)
      const locaties = getUniekeLocaties();
      const locatieDiv = document.getElementById('filter-locaties');
      locatieDiv.innerHTML = `
        <label for="locaties-popup-trigger">Locatie</label>
        <button id="locaties-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeLocaties.length ? huidigeLocaties.join(', ') : 'Locatie kiezen...'}
        </button>
      `;
      // Functies (popup trigger ipv select)
      const functies = getUniekeFuncties();
      const functieDiv = document.getElementById('filter-functies');
      functieDiv.innerHTML = `
        <label for="functies-popup-trigger">Functie</label>
        <button id="functies-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeFuncties.length ? huidigeFuncties.join(', ') : 'Functie kiezen...'}
        </button>
      `;
      // Skills (popup trigger ipv select)
      const skills = getUniekeSkills();
      const skillDiv = document.getElementById('filter-skills');
      skillDiv.innerHTML = `
        <label for="skills-popup-trigger">Skills</label>
        <button id="skills-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeSkills.length ? huidigeSkills.join(', ') : 'Skills kiezen...'}
        </button>
      `;
      // Talen (popup trigger ipv select)
      const talen = getUniekeTalen();
      const taalDiv = document.getElementById('filter-talen');
      taalDiv.innerHTML = `
        <label for="talen-popup-trigger">Talen</label>
        <button id="talen-popup-trigger" type="button" style="padding:0.6rem 0.9rem;border:1.5px solid #e1e5e9;border-radius:8px;background:#fff;cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
          ${huidigeTalen.length ? huidigeTalen.join(', ') : 'Talen kiezen...'}
        </button>
      `;
      // Popup triggers voor alle filters
      document.getElementById('locaties-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'locaties-filter-popup',
          title: 'Kies locaties',
          options: getUniekeLocaties(),
          selected: huidigeLocaties,
          onSave: (gekozen) => {
            huidigeLocaties = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      document.getElementById('functies-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'functies-filter-popup',
          title: 'Kies functies',
          options: getUniekeFuncties(),
          selected: huidigeFuncties,
          onSave: (gekozen) => {
            huidigeFuncties = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      document.getElementById('skills-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'skills-filter-popup',
          title: 'Kies je skills',
          options: getUniekeSkills(),
          selected: huidigeSkills,
          onSave: (gekozen) => {
            huidigeSkills = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
      document.getElementById('talen-popup-trigger').addEventListener('click', () => {
        createPopup({
          id: 'talen-filter-popup',
          title: 'Kies je talen',
          options: getUniekeTalen(),
          selected: huidigeTalen,
          onSave: (gekozen) => {
            huidigeTalen = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      });
    }

    // Update filters and render list after data is loaded
    renderFilterOptions();
    renderList();

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

    // Filter & zoek events - setup after data is loaded
    const setupEventListeners = () => {
      const zoekElement = document.getElementById('bedrijf-zoek');
      if (zoekElement) {
        zoekElement.addEventListener('input', (e) => {
          huidigeZoek = e.target.value;
          renderList();
        });
      }
      // Favorieten-toggle event
      const favorietenElement = document.getElementById('filter-favorieten');
      if (favorietenElement) {
        favorietenElement.addEventListener('change', (e) => {
          toonAlleFavorieten = e.target.checked;
          renderList();
        });
      }
      // Multi-select events
      const locatieSelect = document.getElementById('filter-locaties-select');
      if (locatieSelect) {
        locatieSelect.addEventListener('change', (e) => {
          huidigeLocaties = Array.from(e.target.selectedOptions).map(opt => opt.value);
          renderList();
        });
      }
      const functieSelect = document.getElementById('filter-functies-select');
      if (functieSelect) {
        functieSelect.addEventListener('change', (e) => {
          huidigeFuncties = Array.from(e.target.selectedOptions).map(opt => opt.value);
          renderList();
        });
      }
      const skillSelect = document.getElementById('filter-skills-select');
      if (skillSelect) {
        skillSelect.addEventListener('change', (e) => {
          huidigeSkills = Array.from(e.target.selectedOptions).map(opt => opt.value);
          renderList();
        });
      }
      const taalSelect = document.getElementById('filter-talen-select');
      if (taalSelect) {
        taalSelect.addEventListener('change', (e) => {
          huidigeTalen = Array.from(e.target.selectedOptions).map(opt => opt.value);
          renderList();
        });
      }
      // Reset button
      document.getElementById('reset-filters').addEventListener('click', () => {
        huidigeZoek = '';
        huidigeLocaties = [];
        huidigeFuncties = [];
        huidigeSkills = [];
        huidigeTalen = [];
        document.getElementById('bedrijf-zoek').value = '';
        renderFilterOptions();
        setupEventListeners();
        renderList();
      });
    };
    setupEventListeners();
    // Burger menu
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
          renderBedrijven(rootElement, actualStudentData)
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
  }, 200);
  return;
}

function createPopup({ id, title, options = [], selected = [], onSave }) {
  // Verwijder oude popup
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;
    z-index: 3000;
  `;
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: #fff; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px;
    max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  popup.innerHTML = `
    <h2 style="margin-bottom:1rem;">${title}</h2>
    <div id="${id}-options" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.5rem;"></div>
    <div style="display:flex;justify-content:flex-end;gap:1rem;">
      <button id="${id}-cancel" style="padding:0.5rem 1.2rem;border:none;background:#eee;border-radius:6px;cursor:pointer;">Annuleer</button>
      <button id="${id}-save" style="padding:0.5rem 1.2rem;border:none;background:#007bff;color:white;border-radius:6px;cursor:pointer;">Opslaan</button>
    </div>
  `;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  // Voeg checkboxen toe
  const optionsContainer = document.getElementById(`${id}-options`);
  options.forEach((opt) => {
    const div = document.createElement('label');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.innerHTML = `
      <input type="checkbox" value="${opt}" ${selected.includes(opt) ? 'checked' : ''} />
      <span style="margin-left:0.6rem;">${opt}</span>
    `;
    optionsContainer.appendChild(div);
  });
  // Handlers
  document.getElementById(`${id}-cancel`).onclick = () => overlay.remove();
  document.getElementById(`${id}-save`).onclick = () => {
    const gekozen = Array.from(optionsContainer.querySelectorAll('input:checked')).map(i => i.value);
    onSave(gekozen);
    overlay.remove();
  };
}
