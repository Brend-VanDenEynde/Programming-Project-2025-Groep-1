import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
// Gebruik GEEN fetchCompanies uit data-api.js, maar direct de Discover API
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
import { authenticatedFetch } from '../../utils/auth-api.js';

// Globale variabelen
let bedrijven = [];
let currentStudentId = null;
let huidigeZoek = '';
let huidigeLocaties = [];
let huidigeSkills = [];
let huidigeDomeinen = [];
let huidigeFuncties = [];
let toonAlleFavorieten = false;
let sortPercentageAsc = false; // standaard: DESC (hoog naar laag)

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
    const functiesResp = await authenticatedFetch(
      `https://api.ehb-match.me/bedrijven/${bedrijf.gebruiker_id}/functies`
    );
    if (functiesResp.ok) functies = await functiesResp.json();
  } catch {}
  try {
    const skillsResp = await authenticatedFetch(
      `https://api.ehb-match.me/bedrijven/${bedrijf.gebruiker_id}/skills`
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
    authenticatedFetch(`https://api.ehb-match.me/speeddates/accepted?id=${studentId}`).then(r => r.ok ? r.json() : []),
    authenticatedFetch(`https://api.ehb-match.me/speeddates/pending?id=${studentId}`).then(r => r.ok ? r.json() : []),
    authenticatedFetch(`https://api.ehb-match.me/speeddates/accepted?id=${bedrijf.gebruiker_id}`).then(r => r.ok ? r.json() : []),
    authenticatedFetch(`https://api.ehb-match.me/speeddates/pending?id=${bedrijf.gebruiker_id}`).then(r => r.ok ? r.json() : []),
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

  // In de popup: toon álle functies/skills van het bedrijf, highlight matches met student
  const studentSkills = Array.isArray(huidigeSkills) ? huidigeSkills : [];
  const studentFuncties = Array.isArray(huidigeFuncties) ? huidigeFuncties : [];
  // Skills type 0 van het bedrijf
  const bedrijfSkillsType0 = (Array.isArray(skills) ? skills : []).filter(s => s.type === 0);
  const skillsHTML = bedrijfSkillsType0.length
    ? bedrijfSkillsType0.map(s => `<span class="skill-badge" style="display:inline-block;margin:0 0.3em 0.3em 0;padding:0.2em 0.7em;border-radius:7px;background:${studentSkills.includes(s.naam) ? '#e3f2fd' : '#f5f5f5'};color:#222;font-size:0.97em;">${s.naam}</span>`).join(' ')
    : '<span style="color:#aaa;">Geen skills/talen bekend</span>';

  // Alle functies van het bedrijf
  const bedrijfFuncties = Array.isArray(functies) ? functies : [];
  const functiesHTML = bedrijfFuncties.length
    ? bedrijfFuncties.map(f => `<span class="functie-badge" style="display:inline-block;margin:0 0.3em 0.3em 0;padding:0.2em 0.7em;border-radius:7px;background:${studentFuncties.includes(f.naam) ? '#e3f2fd' : '#f5f5f5'};color:#222;font-size:0.97em;">${f.naam}</span>`).join(' ')
    : '<span style="color:#aaa;">Geen functies bekend</span>';

  popup.innerHTML = `
    <div id="bedrijf-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:600px;width:98vw;min-width:340px;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="bedrijf-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">&times;</button>
      <button id="popup-favorite-btn" class="popup-favorite-btn" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}">${hartIcon}</button>
      <img src="${bedrijf.foto}" alt="Logo ${bedrijf.naam}" style="width:90px;height:90px;object-fit:contain;margin-bottom:1.2rem;" onerror="this.onerror=null;this.src='/src/images/defaultlogo.webp'">
      <h2 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">${bedrijf.locatie}</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${bedrijf.werkdomein}</div>
      <a href="${bedrijf.linkedin}" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>
      <div style="font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;">
        <a href="mailto:${bedrijf.contact_email}" style="color:#444;">${bedrijf.contact_email}</a>
      </div>
      <div style="margin-bottom:0.7rem;width:100%;display:flex;flex-direction:row;gap:1.5rem;justify-content:center;">
        <div style="text-align:left;">
          <strong>Gezochte functies:</strong>
          <div style="margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;">
            ${functiesHTML}
          </div>
        </div>
        <div style="text-align:left;">
          <strong>Gezochte skills/talen:</strong>
          <div style="margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;">
            ${skillsHTML}
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
      const req = await authenticatedFetch('https://api.ehb-match.me/speeddates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        aanvraagBtn.disabled = true;
        // Alles in de popup on-click uitzetten (read-only)
        Array.from(popup.querySelectorAll('button, input, select')).forEach(el => {
          el.disabled = true;
          el.style.pointerEvents = 'none';
          el.style.opacity = '0.7';
        });
        setTimeout(() => {
          const popupEl = document.getElementById('bedrijf-popup-modal');
          if (popupEl) popupEl.remove();
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

// Haal alle skills op uit de algemene skills API
async function fetchAllSkills() {
  try {
    const resp = await authenticatedFetch('https://api.ehb-match.me/skills');
    return resp.ok ? await resp.json() : [];
  } catch {
    return [];
  }
}
// Haal per bedrijf de skills op en voeg toe aan bedrijven
async function fetchSkillsForAllCompanies() {
  await Promise.all(bedrijven.map(async (bedrijf) => {
    try {
      const resp = await authenticatedFetch(
        `https://api.ehb-match.me/bedrijven/${bedrijf.gebruiker_id}/skills`
      );
      bedrijf.skillsArray = resp.ok ? await resp.json() : [];
    } catch {
      bedrijf.skillsArray = [];
    }
  }));
}

// Haal per bedrijf de functies op en voeg toe aan bedrijven
async function fetchFunctiesForAllCompanies() {
  await Promise.all(bedrijven.map(async (bedrijf) => {
    try {
      const resp = await authenticatedFetch(
        `https://api.ehb-match.me/bedrijven/${bedrijf.gebruiker_id}/functies`
      );
      bedrijf.functiesArray = resp.ok ? await resp.json() : [];
    } catch {
      bedrijf.functiesArray = [];
    }
  }));
}

function getUniekeSkills() {
  // alle unieke skill-namen
  const alleSkills = bedrijven.flatMap(b => 
    Array.isArray(b.skillsArray) ? b.skillsArray.map(s => s.naam) : []
  );
  return [...new Set(alleSkills.filter(Boolean))];
}

// Filter en zoek functionaliteit (inclusief favorieten)
// Nieuwe filterfunctie: multi-select voor locatie, functie, skills, talen + favorieten
function filterBedrijven({ zoek = '', locaties = [], domeinen = [], functies = [], skills = [], toonAlleFavorieten = false }) {
  let gefilterdeBedrijven = bedrijven.filter((b) => {
    const matchZoek = zoek
      ? b.naam.toLowerCase().includes(zoek.toLowerCase())
      : true;
    const matchLocatie = locaties.length > 0 ? locaties.includes(b.locatie) : true;
    const matchDomein = domeinen.length > 0 ? domeinen.includes(b.werkdomein) : true;
    const matchFunctie = functies.length > 0
      ? (Array.isArray(b.functiesArray) && b.functiesArray.length
          ? b.functiesArray.some(f => functies.includes(f.naam))
          : false)
      : true;
    const matchSkill = skills.length > 0
      ? (Array.isArray(b.skillsArray) && b.skillsArray.length
          ? b.skillsArray.some(s => skills.includes(s.naam))
          : false)
      : true;
    return matchZoek && matchLocatie && matchDomein && matchFunctie && matchSkill;
  });
  if (toonAlleFavorieten && currentStudentId) {
    gefilterdeBedrijven = filterFavoriteCompanies(
      gefilterdeBedrijven,
      currentStudentId
    );
  }
  return gefilterdeBedrijven;
}

// Unieke locaties, domeinen, functies
function getUniekeLocaties() {
  return [...new Set(bedrijven.map((b) => b.locatie).filter(Boolean))];
}
function getUniekeDomeinen() {
  return [...new Set(bedrijven.map((b) => b.werkdomein).filter(Boolean))];
}
function getUniekeFuncties() {
  // Verzamel alle unieke functie-namen uit functie_matches of een vergelijkbaar veld
  const alleFuncties = bedrijven.flatMap(b => {
    if (Array.isArray(b.functiesArray) && b.functiesArray.length) {
      return b.functiesArray.map(f => f.naam);
    }
    if (Array.isArray(b.functie_matches) && b.functie_matches.length) {
      return b.functie_matches.map(f => f.naam || f);
    }
    if (typeof b.functie_matches === 'string') {
      return [b.functie_matches];
    }
    return [];
  });
  return [...new Set(alleFuncties.filter(Boolean))];
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
    // Load companies from Discover API
    try {
      // Gebruik de juiste Discover endpoint met student-id
      let apiUrl = 'https://api.ehb-match.me/discover/bedrijven';
      if (currentStudentId && currentStudentId !== 'anonymous-user') {
        apiUrl += `?id=${currentStudentId}`;
      }
      const resp = await authenticatedFetch(apiUrl);
      const companies = resp.ok ? await resp.json() : [];
      console.log('API Companies:', companies); // DEBUG: check of match_percentage aanwezig is
      if (!Array.isArray(companies)) {
        bedrijven = [];
      } else {
        bedrijven = companies.map((company) => ({
          naam: company.naam,
          linkedin: company.linkedin || '',
          bio: company.bio || '',
          foto:
            company.profiel_foto_url && company.profiel_foto_url.trim() !== ''
              ? company.profiel_foto_url
              : defaultBedrijfLogo,
          locatie: company.plaats || '',
          werkdomein: company.sector_bedrijf || '',
          contact_email: company.contact_email,
          gebruiker_id: company.gebruiker_id,
          functiesArray: [], // niet uit Discover API
          skillsArray: [],   // niet uit Discover API
          match_percentage:
            company.match_percentage !== undefined && company.match_percentage !== null
              ? Number(company.match_percentage)
              : null
        }));
      }
    } catch (error) {
      if (error.message && error.message.includes('Authentication failed')) {
        renderLogin(rootElement);
        return;
      }
      bedrijven = [];
    }
    // Voeg skills en functies toe aan bedrijven
    await Promise.all([
      fetchSkillsForAllCompanies(),
      fetchFunctiesForAllCompanies()
    ]);
    // Function to update favorites count display
    function updateFavoritesCount() {
      const countElement = document.getElementById('favorites-count');
      if (countElement && currentStudentId) {
        const favoriteCompanies = getFavoriteCompanies(currentStudentId);
        countElement.textContent = `(${favoriteCompanies.length})`;
      }
    }
    // Nieuwe CSS voor filterbalk en favorietenknop
    const style = document.createElement('style');
    style.innerHTML = `
.bedrijven-filterbar-flex {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: stretch;
  gap: 1.1rem;
  background: #f8fafc;
  padding: 0.7rem 1.2rem 0.7rem 1.2rem;
  border-radius: 14px;
  margin-bottom: 2.2rem;
  box-shadow: 0 2px 8px #0001;
  border: 1.5px solid #e1e5e9;
  position: relative;
  min-width: 0;
}
.bedrijven-filterbar-flex .filter-group,
.bedrijven-filterbar-flex .zoek-group,
.bedrijven-filterbar-flex .sort-group,
.bedrijven-filterbar-flex .reset-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1 1 0;
  gap: 0.2rem;
  min-width: 0;
  max-width: 100%;
}
.bedrijven-filterbar-flex label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}
.bedrijven-filterbar-flex select,
.bedrijven-filterbar-flex input[type="text"],
.bedrijven-filterbar-flex button:not(#filter-favorieten-btn) {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border: 1.5px solid #e1e5e9;
  font-size: 0.95rem;
  min-height: 42px;
  height: 42px;
  box-sizing: border-box;
  width: 100%;
  background: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bedrijven-filterbar-flex button:not(#filter-favorieten-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#sort-percentage-btn, .bedrijven-filterbar-flex .sort-group button {
  background: #f5f5f5;
  border: 1.5px solid #e1e5e9;
  color: #222;
  font-weight: 600;
  min-width: 120px;
  max-width: 100%;
  transition: background 0.2s, border 0.2s;
  box-shadow: 0 1px 4px #0001;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#sort-percentage-btn:hover, .bedrijven-filterbar-flex .sort-group button:hover {
  background: #e1e5e9;
  border-color: #b7b7ff;
}
#filter-favorieten-btn {
  position: absolute;
  top: 2px;
  right: 18px;
  font-size: 1.7rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 5;
  transition: transform 0.3s;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: content-box;
}
#filter-favorieten-btn.animating {
  transform: scale(1.3);
}
.popup-favorite-btn {
  position: absolute;
  top: 10px;
  left: 14px;
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: transform 0.2s;
}
.popup-favorite-btn.animating {
  transform: scale(1.3);
}
@media (max-width: 1100px) {
  .bedrijven-filterbar-flex {
    flex-wrap: wrap;
  }
  .bedrijven-filterbar-flex .filter-group,
  .bedrijven-filterbar-flex .zoek-group,
  .bedrijven-filterbar-flex .sort-group,
  .bedrijven-filterbar-flex .reset-group {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
  }
}
@media (max-width: 900px) {
  #filter-favorieten-btn {
    top: 8px;
    left: 10px;
  }
}
@media (max-width: 700px) {
  .bedrijven-filterbar-flex {
    flex-direction: column;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 0.7rem 0;
    min-width: 0;
  }
  .bedrijven-filterbar-flex .filter-group,
  .bedrijven-filterbar-flex .zoek-group,
  .bedrijven-filterbar-flex .sort-group,
  .bedrijven-filterbar-flex .reset-group {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
  }
  #filter-favorieten-btn {
    top: 8px;
    left: 10px;
  }
}
`;
    document.head.appendChild(style);
    // Custom filter UI rendering
    function renderFilterOptions() {
      // Locaties
      const locaties = getUniekeLocaties();
      const locatieDiv = document.getElementById('filter-locaties');
      locatieDiv.innerHTML = `
        <label for="locaties-popup-trigger">Locatie</label>
        <button id="locaties-popup-trigger" type="button">${huidigeLocaties.length ? huidigeLocaties.join(', ') : (locaties.length ? 'Locatie kiezen...' : 'Geen locaties')}</button>
      `;
      // DOMEIN
      const domeinen = getUniekeDomeinen();
      const domeinDiv = document.getElementById('filter-domein');
      domeinDiv.innerHTML = `
        <label for="domein-popup-trigger">Domein</label>
        <button id="domein-popup-trigger" type="button">${huidigeDomeinen && huidigeDomeinen.length ? huidigeDomeinen.join(', ') : (domeinen.length ? 'Domein kiezen...' : 'Geen domeinen')}</button>
      `;
      // FUNCTIE
      const functies = getUniekeFuncties();
      const functieDiv = document.getElementById('filter-functie');
      functieDiv.innerHTML = `
        <label for="functie-popup-trigger">Functie</label>
        <button id="functie-popup-trigger" type="button">${huidigeFuncties && huidigeFuncties.length ? huidigeFuncties.join(', ') : (functies.length ? 'Functie kiezen...' : 'Geen functies')}</button>
      `;
      // SKILLS
      const skills = getUniekeSkills();
      const skillsDiv = document.getElementById('filter-skills');
      skillsDiv.innerHTML = `
        <label for="skills-popup-trigger">Skills/talen</label>
        <button id="skills-popup-trigger" type="button">${huidigeSkills && huidigeSkills.length ? huidigeSkills.join(', ') : (skills.length ? 'Skills/talen kiezen...' : 'Geen skills')}</button>
      `;
      // Sorteerknop vóór resetknop
      const sortDiv = document.getElementById('sort-group');
      sortDiv.innerHTML = `
        <label for="sort-percentage-btn">&nbsp;</label>
        <button id="sort-percentage-btn" type="button" style="padding:0.6rem 1.2rem;border-radius:8px;border:1.5px solid #e1e5e9;background:#f5f5f5;cursor:pointer;min-width:120px;">
          matchpercentage${sortPercentageAsc ? '▲' : '▼'}
        </button>
      `;
      // Popup triggers
      document.getElementById('locaties-popup-trigger').onclick = () => {
        if (!locaties.length) return;
        createPopup({
          id: 'locaties-filter-popup',
          title: 'Kies locaties',
          options: locaties,
          selected: huidigeLocaties,
          onSave: (gekozen) => {
            huidigeLocaties = gekozen;
            renderFilterOptions();
            renderList();
          },
          showSearch: true
        });
      };
      document.getElementById('domein-popup-trigger').onclick = () => {
        if (!domeinen.length) return;
        createPopup({
          id: 'domein-filter-popup',
          title: 'Kies domeinen',
          options: domeinen,
          selected: huidigeDomeinen || [],
          onSave: (gekozen) => {
            huidigeDomeinen = gekozen;
            renderFilterOptions();
            renderList();
          },
          showSearch: true
        });
      };
      document.getElementById('functie-popup-trigger').onclick = () => {
        if (!functies.length) return;
        createPopup({
          id: 'functie-filter-popup',
          title: 'Kies functies',
          options: functies,
          selected: huidigeFuncties || [],
          onSave: (gekozen) => {
            huidigeFuncties = gekozen;
            renderFilterOptions();
            renderList();
          }
        });
      };
      document.getElementById('skills-popup-trigger').onclick = () => {
        if (!skills.length) return;
        createPopup({
          id: 'skills-filter-popup',
          title: 'Kies skills/talen',
          options: skills,
          selected: huidigeSkills || [],
          onSave: (gekozen) => {
            huidigeSkills = gekozen;
            renderFilterOptions();
            renderList();
          },
          showSearch: true
        });
      };
      document.getElementById('sort-percentage-btn').onclick = () => {
        sortPercentageAsc = !sortPercentageAsc;
        renderFilterOptions();
        renderList();
      };
    }
    // Initial render with nieuwe filterbalk structuur
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
          <div class="student-profile-form-container" style="padding:2.5rem 2.2rem 2.2rem 2.2rem; border-radius:18px; background:#fff; box-shadow:0 4px 24px #0001; max-width:1200px; margin:auto;">
            <h1 class="student-profile-title" style="margin: 0 0 1.4rem 0;">Bedrijven</h1>
            <div id="bedrijven-filterbar" class="bedrijven-filterbar-flex">
              <div class="zoek-group">
                <label for="bedrijf-zoek">Zoeken</label>
                <input id="bedrijf-zoek" type="text" placeholder="Zoek bedrijf of locatie...">
              </div>
              <div id="filter-locaties" class="filter-group"></div>
              <div id="filter-domein" class="filter-group"></div>
              <div id="filter-functie" class="filter-group"></div>
              <div id="filter-skills" class="filter-group"></div>
              <div id="sort-group" class="sort-group"></div>
              <div class="reset-group">
                <label for="reset-filters">&nbsp;</label>
                <button id="reset-filters" title="Reset filters">Reset filters</button>
              </div>
              <button id="filter-favorieten-btn" title="Toon alleen favorieten" class="" style="padding-bottom:20px;">🤍</button>
            </div>
            <div style="height:24px;width:100%;padding-bottom:40px"></div>
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
    renderFilterOptions();
    function renderList() {
      const bedrijvenListElement = document.getElementById('bedrijven-list');
      if (!bedrijvenListElement) return;
      let gefilterd = filterBedrijven({
        zoek: huidigeZoek,
        locaties: huidigeLocaties,
        domeinen: huidigeDomeinen,
        functies: huidigeFuncties,
        skills: huidigeSkills,
        toonAlleFavorieten
      });
      // Sorteer op match_percentage
      gefilterd.sort((a, b) =>
        sortPercentageAsc
          ? a.match_percentage - b.match_percentage
          : b.match_percentage - a.match_percentage
      );
      bedrijvenListElement.innerHTML =
        (gefilterd.length
          ? gefilterd
              .map((bedrijf, idx) => {
                const isFavoriet = currentStudentId
                  ? isCompanyFavorite(currentStudentId, bedrijf.gebruiker_id)
                  : false;
                const hartIcon = isFavoriet ? '❤️' : '🤍';
                let matchPercentage = bedrijf.match_percentage;
                let badgeColor = '#e74c3c';
                if (typeof matchPercentage === 'number' && matchPercentage >= 80) badgeColor = '#2ecc40';
                else if (typeof matchPercentage === 'number' && matchPercentage >= 60) badgeColor = '#f1c40f';
                else if (typeof matchPercentage === 'number' && matchPercentage >= 40) badgeColor = '#ff9800';
                const profielFoto = (bedrijf.foto && bedrijf.foto.trim() !== '') ? bedrijf.foto : defaultBedrijfLogo;
                return `
  <div class="bedrijf-card" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;padding:1.5rem 1rem;display:flex;flex-direction:column;align-items:center;width:220px;cursor:pointer;transition:box-shadow 0.2s;position:relative;" data-bedrijf-idx="${bedrijven.indexOf(bedrijf)}">
    <span class="match-badge" style="position:absolute;top:10px;left:10px;background:${badgeColor};color:#fff;font-weight:bold;padding:0.3em 0.8em;border-radius:16px;font-size:0.98em;z-index:3;box-shadow:0 2px 8px #0002;">${typeof matchPercentage === 'number' ? matchPercentage.toFixed(1) : '?'}%</span>
    <button class="favorite-btn" data-company-id="${bedrijf.gebruiker_id}" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;cursor:pointer;z-index:2;">${hartIcon}</button>
    <img src="${profielFoto}" alt="Logo ${bedrijf.naam}" style="width:80px;height:80px;border-radius:50%;object-fit:contain;margin-bottom:1rem;" onerror="this.onerror=null;this.src='/src/images/defaultlogo.webp'">
    <h3 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h3>
    <div style="font-size:0.97rem;color:#666;margin-bottom:0.3rem;">${bedrijf.locatie}</div>
    <div style="font-size:0.97rem;color:#888;margin-bottom:0.3rem;">${bedrijf.werkdomein}</div>
    <div style="font-size:0.95rem;color:#555;margin-bottom:0.3rem;">${(Array.isArray(bedrijf.functiesArray) && bedrijf.functiesArray.length) ? bedrijf.functiesArray.map(f => f.naam).join(', ') : (Array.isArray(bedrijf.functie_matches) && bedrijf.functie_matches.length ? bedrijf.functie_matches.map(f => f.naam || f).join(', ') : '')}</div>
  </div>
  `;
              })
              .join('')
          : `<div style="text-align:center;width:100%;color:#888;">Geen bedrijven gevonden.</div>`
        );
      document.querySelectorAll('.bedrijf-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('favorite-btn')) {
            return;
          }
          const idx = card.getAttribute('data-bedrijf-idx');
          showBedrijfPopup(
            bedrijven[idx],
            currentStudentId
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
    renderList();
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
      // (popup events zitten in renderFilterOptions)
      // Reset button
      document.getElementById('reset-filters').addEventListener('click', () => {
        huidigeZoek = '';
        huidigeLocaties = [];
        huidigeSkills = [];
        huidigeDomeinen = [];
        huidigeFuncties = [];
        document.getElementById('bedrijf-zoek').value = '';
        renderFilterOptions();
        setupEventListeners();
        renderList();
      });
    };
    setupEventListeners();
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
    // const setupEventListeners = () => { ... } // VERWIJDER DEZE DUBBELE DECLARATIE indien aanwezig
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

function createPopup({ id, title, options = [], selected = [], onSave, showSearch = false }) {
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
    ${showSearch ? '<input id="popup-search" type="text" placeholder="Zoeken..." style="margin-bottom:1rem;padding:0.5rem 1rem;width:100%;border-radius:6px;border:1.2px solid #e1e5e9;font-size:1rem;">' : ''}
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
  function renderOptions(filter = '') {
    optionsContainer.innerHTML = '';
    options.filter(opt => !filter || opt.toLowerCase().includes(filter.toLowerCase())).forEach((opt) => {
      const div = document.createElement('label');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.innerHTML = `
        <input type="checkbox" value="${opt}" ${selected.includes(opt) ? 'checked' : ''} />
        <span style="margin-left:0.6rem;">${opt}</span>
      `;
      optionsContainer.appendChild(div);
    });
  }
  renderOptions();
  if (showSearch) {
    const searchInput = document.getElementById('popup-search');
    searchInput.addEventListener('input', (e) => {
      renderOptions(e.target.value);
    });
  }
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

// Match kleur functie
function getMatchColor(percentage) {
  if (percentage >= 80) return '#2aa97b'; // groen
  if (percentage >= 60) return '#f7b500'; // geel
  if (percentage >= 40) return '#ff9800'; // oranje
  return '#da2727'; // rood
}
