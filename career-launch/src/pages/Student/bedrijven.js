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
  const uren = [12, 13, 14, 15, 16, 17];
  const slotDuur = 10; // minuten
  const slotsPerUur = 6; // 0,10,20,30,40,50
  const datum = '2025-10-01'; // vaste dag in jouw voorbeeld
  // 1. Haal alle accepted en pending speeddates op voor student en bedrijf
  const [
    acceptedStudentDates,
    pendingStudentDates,
    acceptedCompanyDates,
    pendingCompanyDates
  ] = await Promise.all([
    fetch(`https://api.ehb-match.me/speeddates/accepted?id=${studentId}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }).then(r => r.ok ? r.json() : []),
    fetch(`https://api.ehb-match.me/speeddates/pending?id=${studentId}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }).then(r => r.ok ? r.json() : []),
    fetch(`https://api.ehb-match.me/speeddates/accepted?id=${bedrijf.gebruiker_id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }).then(r => r.ok ? r.json() : []),
    fetch(`https://api.ehb-match.me/speeddates/pending?id=${bedrijf.gebruiker_id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } }).then(r => r.ok ? r.json() : []),
  ]);
  const allAccepted = [...acceptedStudentDates, ...acceptedCompanyDates];
  const allPending  = [...pendingStudentDates, ...pendingCompanyDates];

  // Status functie
  function getStatusForTijd(tijd, allAccepted, allPending) {
    const isConfirmed = allAccepted.some(s => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      return `${dt.getUTCHours().toString().padStart(2, '0')}:${dt.getUTCMinutes().toString().padStart(2, '0')}` === tijd;
    });
    if (isConfirmed) return 'confirmed';
    const isPending = allPending.some(s => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      return `${dt.getUTCHours().toString().padStart(2, '0')}:${dt.getUTCMinutes().toString().padStart(2, '0')}` === tijd;
    });
    if (isPending) return 'pending';
    return 'free';
  }

  // Bouw de slots:
  function buildTimeSlotOptions({ uren, slotDuur, slotsPerUur, allAccepted, allPending }) {
    const slots = [];
    uren.forEach(uur => {
      for (let i = 0; i < slotsPerUur; ++i) {
        const min = i * slotDuur;
        const mm = min < 10 ? `0${min}` : `${min}`;
        const tijd = `${uur < 10 ? '0' : ''}${uur}:${mm}`;
        const status = getStatusForTijd(tijd, allAccepted, allPending);
        let kleur = '#fff', disabled = false, label = `${uur}u${mm}`;
        if (status === 'pending') {
          kleur = '#fff9d1'; disabled = true; label += ' (in afwachting)';
        } else if (status === 'confirmed') {
          kleur = '#ffe0e0'; disabled = true; label += ' (bevestigd)';
        }
        slots.push({ value: tijd, label, kleur, disabled, status });
      }
    });
    return slots;
  }

  // Bouw alle slots met status
  const allSlots = buildTimeSlotOptions({ uren, slotDuur, slotsPerUur, allAccepted, allPending });

  // Favoriet status bepalen vóór HTML genereren
  const isFavoriet = isCompanyFavorite(studentId, bedrijf.gebruiker_id);
  const hartIcon = isFavoriet ? '❤️' : '🤍';

  popup.innerHTML = `
    <div id="bedrijf-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:600px;width:98vw;min-width:340px;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="bedrijf-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">&times;</button>
      <button id="popup-favorite-btn" class="popup-favorite-btn" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}">${hartIcon}</button>
      <img src="${bedrijf.foto}" alt="Logo ${bedrijf.naam}" style="width:90px;height:90px;object-fit:contain;margin-bottom:1.2rem;" onerror="this.onerror=null;this.src='${defaultBedrijfLogo}'">
      <h2 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">${bedrijf.locatie}</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${bedrijf.werkdomein}</div>
      <a href="${bedrijf.linkedin}" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>
      <p style="text-align:center;margin-bottom:1.2rem;max-height:3.2em;overflow:hidden;">${bedrijf.bio}</p>
      <div style="font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;">
        <a href="mailto:${bedrijf.contact_email}" style="color:#444;">${bedrijf.contact_email}</a>
      </div>
      <div style="margin-bottom:0.7rem;width:100%;display:flex;flex-direction:row;gap:1.5rem;justify-content:center;">
        <div style="text-align:left;">
          <strong>Functies:</strong>
          <div style="margin-top:0.3rem;max-width:220px;white-space:normal;">
            ${
              functies.length
                ? functies.map((f) => `<span class="functie-badge">${f.naam}</span>`).join(' ')
                : '<span style="color:#aaa;">Geen functies bekend</span>'
            }
          </div>
        </div>
        <div style="text-align:left;">
          <strong>Skills:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem;max-width:220px;white-space:normal;">
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
      </div>
      <div style="margin-bottom:0.7rem;width:100%;">
        <div style="margin-bottom:0.4rem;font-size:0.97rem;">
          <strong>Legenda:</strong>
          <span style="background:#fff;border:1px solid #ccc;padding:0.1rem 0.5rem;border-radius:5px;margin-left:0.5rem;">Vrij</span>
          <span style="background:#fff9d1;border:1px solid #ffe9a0;padding:0.1rem 0.5rem;border-radius:5px;margin-left:0.5rem;">Pending</span>
          <span style="background:#ffe0e0;border:1px solid #ffbdbd;padding:0.1rem 0.5rem;border-radius:5px;margin-left:0.5rem;">Bezet</span>
        </div>
      </div>
      <div id="slots-list" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;justify-content:center;"></div>
      <button id="speeddates-aanvraag-btn" style="background:#00bcd4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1rem;cursor:pointer;" disabled>Confirmeer aanvraag</button>
      <div id="speeddates-aanvraag-status" style="margin-top:1rem;font-size:1rem;color:#2aa97b;display:none;">Speeddate aangevraagd!</div>
    </div>
  `;
  document.body.appendChild(popup);

  // Initialiseer variabelen en check op bestaan
  const slotsList = popup.querySelector('#slots-list');
  const aanvraagBtn = popup.querySelector('#speeddates-aanvraag-btn');
  if (!slotsList || !aanvraagBtn) {
    console.error('Kan slotsList of aanvraagBtn niet vinden!');
    return;
  }
  let gekozenDatum = '';
  let geselecteerdUur = null;
  aanvraagBtn.disabled = true;

  // DEBUG
  console.log('allSlots', allSlots);
  console.log('slotsList', slotsList);

  // Compacte urenbalk boven de slots
  const urenLijst = document.createElement('div');
  urenLijst.id = 'uren-list';
  urenLijst.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;justify-content:center;';
  uren.forEach(uur => {
    // Bereken aantal vrije slots voor dit uur
    const slotsForHour = allSlots.filter(slot => {
      const slotHour = parseInt(slot.value.split(':')[0], 10);
      return slotHour === uur;
    });
    const vrijeSlots = slotsForHour.filter(slot => slot.status === 'free').length;
    const btn = document.createElement('button');
    btn.innerHTML = `${uur}u <span style="background:#fff;border-radius:8px;padding:0.1rem 0.7rem;font-size:0.92em;margin-left:0.5em;border:1px solid #b7b7ff;color:#4e7bfa;">${vrijeSlots}</span>`;
    btn.style.cssText = `
      background:#eef1fa;
      border:1.5px solid #b7b7ff;
      border-radius:8px;
      padding:0.5rem 1.2rem;
      font-size:1.05rem;
      cursor:pointer;
      margin:0;
      transition:box-shadow .2s;
      display:flex;align-items:center;gap:0.4em;
    `;
    btn.addEventListener('click', () => {
      geselecteerdUur = uur;
      urenLijst.querySelectorAll('button').forEach(b => b.style.boxShadow = '');
      btn.style.boxShadow = '0 0 0 2.5px #4e7bfa';
      renderSlotsForHour(uur);
    });
    urenLijst.appendChild(btn);
  });
  popup.querySelector('#bedrijf-popup-content').insertBefore(urenLijst, slotsList);

  // Render alleen slots van geselecteerd uur
  function renderSlotsForHour(uur) {
    const slotsForHour = allSlots.filter(slot => {
      const slotHour = parseInt(slot.value.split(':')[0], 10);
      return slotHour === uur;
    });
    // console.log(slotsForHour); // Debug
    slotsList.innerHTML = slotsForHour.map(slot => `
      <button 
        class="slot-btn"
        data-slot="${slot.value}" 
        style="background:${slot.kleur};border:1.5px solid #e1e5e9;border-radius:8px;padding:0.5rem 1rem;min-width:75px;cursor:${slot.disabled ? 'not-allowed' : 'pointer'};opacity:${slot.disabled ? '0.65' : '1'};font-weight:${slot.status === 'confirmed' ? 'bold' : 'normal'};font-size:0.97rem;"
        ${slot.disabled ? 'disabled' : ''}
        title="${slot.label}"
      >${slot.label.split(' ')[0]}</button>
    `).join('');
    aanvraagBtn.disabled = true;
    gekozenDatum = '';
    slotsList.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        slotsList.querySelectorAll('.slot-btn').forEach(b => b.style.outline = '');
        btn.style.outline = '2.5px solid #007bff';
        gekozenDatum = btn.getAttribute('data-slot');
        aanvraagBtn.disabled = false;
      });
    });
  }
  // Automatisch eerste uur tonen
  if (uren.length) {
    urenLijst.querySelector('button').click();
  }

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

  // Speeddate aanvraag knop (API-call)
  aanvraagBtn.onclick = async () => {
    const status = document.getElementById('speeddates-aanvraag-status');
    aanvraagBtn.disabled = true;
    slotsList.disabled = true;
    status.textContent = 'Aanvraag wordt verstuurd...';
    status.style.display = 'block';
    // 🛑 DUBBELE BOEKING PREVENTIE: check of student op dit tijdstip al een speeddate heeft (pending/confirmed)
    const tijd = gekozenDatum; // nu alleen HH:MM
    const alreadyBooked = [...acceptedStudentDates, ...pendingStudentDates, ...acceptedCompanyDates, ...pendingCompanyDates].some(s => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      const slotTijd = `${dt.getUTCHours().toString().padStart(2, '0')}:${dt.getUTCMinutes().toString().padStart(2, '0')}`;
      return slotTijd === tijd;
    });
    if (alreadyBooked) {
      status.textContent = 'Je hebt al een speeddate op dit tijdstip! Kies een ander slot.';
      status.style.color = '#da2727';
      aanvraagBtn.disabled = false;
      slotsList.disabled = false;
      return;
    }
    try {
      // Combineer datum + tijd voor de API
      const apiDatum = `${datum} ${tijd}:00`;
      const req = await fetch('https://api.ehb-match.me/speeddates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          id_student: Number(studentId),
          id_bedrijf: Number(bedrijf.gebruiker_id),
          datum: apiDatum, // LET OP: spatie, geen T
        }),
      });
      if (req.status === 201) {
        status.textContent = `✅ Speeddate succesvol aangevraagd voor ${tijd}!`;
        status.style.color = '#2aa97b';
        setTimeout(() => {
          const popup = document.getElementById('bedrijf-popup-modal');
          if (popup) popup.remove();
        }, 1300);
      } else {
        const err = await req.json();
        status.textContent = err.message || 'Er ging iets mis!';
        status.style.color = '#da2727';
        aanvraagBtn.disabled = false;
        slotsList.disabled = false;
      }
    } catch (e) {
      status.textContent = 'Er ging iets mis bij het verzenden!';
      status.style.color = '#da2727';
      aanvraagBtn.disabled = false;
      slotsList.disabled = false;
    }
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
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link active">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container" style="padding:2.5rem 2.2rem 2.2rem 2.2rem; border-radius:18px; background:#fff; box-shadow:0 4px 24px #0001; max-width:1200px; margin:auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.4rem;">
              <h1 class="student-profile-title" style="margin: 0;">Bedrijven</h1>
              <button id="filter-favorieten-btn" title="Toon alleen favorieten" style="font-size: 1.5rem; background: none; border: none; cursor: pointer; transition: transform 0.3s ease;" class="${toonAlleFavorieten ? 'animating' : ''}">${toonAlleFavorieten ? '❤️' : '🤍'}</button>
            </div>
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
#filter-favorieten-btn.animating {
  transform: scale(1.3);
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
      // Favorietenknop rechtsboven in de filterbalk
      const filterbar = document.getElementById('bedrijven-filterbar');
      let favBtn = document.getElementById('filter-favorieten-btn');
      if (favBtn) favBtn.remove();
      favBtn = document.createElement('button');
      favBtn.id = 'filter-favorieten-btn';
      favBtn.title = 'Toon alleen favorieten';
      favBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 14px;
        font-size: 1.4rem;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 5;
      `;
      favBtn.innerHTML = toonAlleFavorieten ? '❤️' : '🤍';
      filterbar.appendChild(favBtn);
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

    // Filter & zoek events - setup after data is loaded
    const setupEventListeners = () => {
      const zoekElement = document.getElementById('bedrijf-zoek');
      if (zoekElement) {
        zoekElement.addEventListener('input', (e) => {
          huidigeZoek = e.target.value;
          renderList();
        });
      }
      // Favorieten-toggle event (icon button)
      const favorietenBtn = document.getElementById('filter-favorieten-btn');
      if (favorietenBtn) {
        favorietenBtn.addEventListener('click', () => {
          toonAlleFavorieten = !toonAlleFavorieten;
          favorietenBtn.innerHTML = toonAlleFavorieten ? '❤️' : '🤍';
          favorietenBtn.classList.add('animating');
          renderList();
          setTimeout(() => favorietenBtn.classList.remove('animating'), 400);
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
    if (burger) {
      burger.addEventListener('click', (event) => {
        event.stopPropagation();
        const dropdown = document.getElementById('burger-dropdown');
        if (dropdown) {
          dropdown.classList.toggle('open');
        }
      });
    }
    document.addEventListener('click', function (event) {
      const dropdown = document.getElementById('burger-dropdown');
      if (dropdown && dropdown.classList.contains('open')) {
        if (!dropdown.contains(event.target) && event.target.id !== 'burger-menu') {
          dropdown.classList.remove('open');
        }
      }
    });
    document.getElementById('nav-settings').addEventListener('click', () => {
      const dropdown = document.getElementById('burger-dropdown');
      if (dropdown) {
        dropdown.classList.remove('open');
      }
      showSettingsPopup(() =>
        renderBedrijven(rootElement, actualStudentData)
      );
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      const dropdown = document.getElementById('burger-dropdown');
      if (dropdown) {
        dropdown.classList.remove('open');
      }
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    });

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

// Helper: ISO naar API datum formaat
function isoToAPIDate(iso) {
  return iso.replace('T', ' ').replace('Z', '');
}
