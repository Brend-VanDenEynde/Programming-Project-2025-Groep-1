import logoIcon from '../../icons/favicon-32x32.png';
import defaultStudentAvatar from '../../images/default.png';
import {
  logoutUser,
  fetchUserInfo,
  authenticatedFetch,
} from '../../utils/auth-api.js';
import {
  fetchDiscoverStudenten,
  createSpeeddate,
} from '../../utils/data-api.js';
import {
  getFavoriteStudents,
  addFavoriteStudent,
  removeFavoriteStudent,
  isStudentFavorite,
  toggleFavoriteStudent,
  filterFavoriteStudents,
} from '../../utils/bedrijf-favorites-storage.js';
import Router from '../../router.js';

// Global variables for students data
let studenten = [];
let currentBedrijfId = null;
let toonAlleFavorieten = false;

// --- FILTER STATE ---
let huidigeZoek = '';
let huidigeSkills = [];
let huidigeOpleidingen = [];
let huidigeStudiejaren = [];
let huidigeFuncties = [];
let sortPercentageAsc = false;

// --- UNIEKE FILTER OPTIES ---
function getUniekeOpleidingen() {
  // Verzamel alle unieke, niet-lege opleiding_naam waarden uit studenten
  if (!Array.isArray(studenten) || studenten.length === 0) return [];
  return [...new Set(studenten.map((s) => s && s.opleiding_naam ? String(s.opleiding_naam).trim() : null).filter(Boolean))];
}
function getUniekeSkills() {
  if (!Array.isArray(studenten) || studenten.length === 0) return [];
  const alleSkills = studenten.flatMap((s) => {
    if (!s.skills) return [];
    if (Array.isArray(s.skills)) {
      // Skills als array van objecten of strings
      return s.skills.map(sk =>
        typeof sk === 'string'
          ? sk.trim()
          : sk && sk.naam ? sk.naam.trim() : null
      );
    }
    if (typeof s.skills === 'string') {
      // Skills als 1 string (comma-separated)
      return s.skills.split(',').map(sk => sk.trim());
    }
    return [];
  });
  return [...new Set(alleSkills.filter(Boolean))];
}
function getUniekeFuncties() {
  if (!Array.isArray(studenten) || studenten.length === 0) return [];
  const alleFuncties = studenten.flatMap((s) => {
    if (!s.functies) return [];
    if (Array.isArray(s.functies)) {
      return s.functies.map(f =>
        typeof f === 'string'
          ? f.trim()
          : f && f.naam ? f.naam.trim() : null
      );
    }
    if (typeof s.functies === 'string') {
      return s.functies.split(',').map(f => f.trim());
    }
    return [];
  });
  return [...new Set(alleFuncties.filter(Boolean))];
}
function getUniekeStudiejaren() {
  // Verzamel alle unieke, niet-lege studiejaar waarden uit studenten
  if (!Array.isArray(studenten) || studenten.length === 0) return [];
  return [...new Set(studenten.map((s) => s && s.studiejaar ? String(s.studiejaar).trim() : null).filter(Boolean))];
}

// --- FILTEREN ---
function filterStudenten({
  zoek = '',
  opleidingen = [],
  skills = [],
  functies = [],
  studiejaren = [],
  toonAlleFavorieten = false,
}) {
  let filtered = studenten.filter((s) => {
    const matchZoek = zoek
      ? (`${s.voornaam} ${s.achternaam} ${s.contact_email}`)
          .toLowerCase()
          .includes(zoek.toLowerCase())
      : true;
    const matchOpleiding = opleidingen.length ? opleidingen.includes(s.opleiding_naam) : true;
    const matchSkill = skills.length && Array.isArray(s.skills)
      ? s.skills.some((sk) => skills.includes(sk.naam || sk))
      : true;
    const matchFunctie = functies.length && Array.isArray(s.functies)
      ? s.functies.some((f) => functies.includes(f.naam || f))
      : true;
    const matchStudiejaar = studiejaren.length ? studiejaren.includes(s.studiejaar) : true;
    return (
      matchZoek &&
      matchOpleiding &&
      matchSkill &&
      matchFunctie &&
      matchStudiejaar
    );
  });
  if (toonAlleFavorieten && currentBedrijfId) {
    filtered = filterFavoriteStudents(filtered, currentBedrijfId);
  }
  return filtered;
}

// Feedback notification function
function showFeedbackNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#6b7280'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    font-weight: 500;
    max-width: 350px;
    word-wrap: break-word;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    notification.style.transition = 'all 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Function to get student profile photo URL
function getStudentPhotoUrl(profiel_foto_key, profiel_foto_url) {
  if (profiel_foto_url && profiel_foto_url !== 'null') {
    if (profiel_foto_url.startsWith('http')) {
      return profiel_foto_url;
    }
    return `https://gt0kk4fbet.ufs.sh/f/${profiel_foto_url}`;
  }
  if (profiel_foto_key && profiel_foto_key !== 'null') {
    return `https://gt0kk4fbet.ufs.sh/f/${profiel_foto_key}`;
  }
  return defaultStudentAvatar;
}

// Function to get color scheme based on match percentage
function getMatchColorScheme(percentage) {
  const num = Number(percentage) || 0;

  if (num >= 90) {
    return {
      background: '#10b981', // emerald-500
      color: '#ffffff',
      borderColor: '#059669', // emerald-600
      cardBorder: '#10b981',
      label: 'Uitstekende match',
    };
  } else if (num >= 80) {
    return {
      background: '#22c55e', // green-500
      color: '#ffffff',
      borderColor: '#16a34a', // green-600
      cardBorder: '#22c55e',
      label: 'Zeer goede match',
    };
  } else if (num >= 70) {
    return {
      background: '#84cc16', // lime-500
      color: '#ffffff',
      borderColor: '#65a30d', // lime-600
      cardBorder: '#84cc16',
      label: 'Goede match',
    };
  } else if (num >= 60) {
    return {
      background: '#eab308', // yellow-500
      color: '#ffffff',
      borderColor: '#ca8a04', // yellow-600
      cardBorder: '#eab308',
      label: 'Redelijke match',
    };
  } else if (num >= 50) {
    return {
      background: '#f97316', // orange-500
      color: '#ffffff',
      borderColor: '#ea580c', // orange-600
      cardBorder: '#f97316',
      label: 'Matige match',
    };
  } else if (num >= 30) {
    return {
      background: '#ef4444', // red-500
      color: '#ffffff',
      borderColor: '#dc2626', // red-600
      cardBorder: '#ef4444',
      label: 'Zwakke match',
    };
  } else {
    return {
      background: '#6b7280', // gray-500
      color: '#ffffff',
      borderColor: '#4b5563', // gray-600
      cardBorder: '#6b7280',
      label: 'Zeer zwakke match',
    };
  }
}

// Helper: Haal altijd de actuele skills en functies van een student op
async function fetchStudentSkillsAndFuncties(studentId) {
  const [skillsResp, functiesResp] = await Promise.all([
    authenticatedFetch(`https://api.ehb-match.me/studenten/${studentId}/skills`).then(r => r.ok ? r.json() : []),
    authenticatedFetch(`https://api.ehb-match.me/studenten/${studentId}/functies`).then(r => r.ok ? r.json() : [])
  ]);
  return {
    skills: skillsResp.map(s => s.naam),
    functies: functiesResp.map(f => f.naam),
  };
}

// Function to show student detail popup
async function showStudentPopup(student) {
  // Remove any existing popup
  const existing = document.getElementById('student-popup-modal');
  if (existing) existing.remove();

  // Haal actuele student skills/functies op
  const { skills: studentSkills, functies: studentFuncties } = await fetchStudentSkillsAndFuncties(student.gebruiker_id);

  // Opleiding ophalen
  let opleidingText = '';
  try {
    const opleidingResponse = await authenticatedFetch(
      'https://api.ehb-match.me/opleidingen/' + student.opleiding_id,
      { method: 'GET' }
    ).then((response) => response.ok ? response.json() : {});
    opleidingText = (opleidingResponse.type ? opleidingResponse.type + ' ' : '') + (opleidingResponse.naam || 'Onbekend');
  } catch (e) {
    opleidingText = 'Onbekend';
  }

  // Speeddate slotconfiguratie
  const uren = [12, 13, 14, 15, 16, 17];
  const slotDuur = 10;
  const slotsPerUur = 6;
  const speeddateDate = '2025-10-01';
  let allAccepted = [], allPending = [];
  let slotError = null;
  try {
    const token = sessionStorage.getItem('authToken');
    const [studentUnavailable, companyUnavailable, studentPending, companyPending] = await Promise.all([
      authenticatedFetch(`https://api.ehb-match.me/speeddates/accepted?id=${student.gebruiker_id}`).then(r => r.ok ? r.json() : []),
      authenticatedFetch(`https://api.ehb-match.me/speeddates/accepted?id=${currentBedrijfId}`).then(r => r.ok ? r.json() : []),
      authenticatedFetch(`https://api.ehb-match.me/speeddates/pending?id=${student.gebruiker_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      authenticatedFetch(`https://api.ehb-match.me/speeddates/pending?id=${currentBedrijfId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : [])
    ]);
    allAccepted = [...studentUnavailable, ...companyUnavailable];
    allPending = [...studentPending, ...companyPending];
  } catch (e) { slotError = e; }

  function getStatusForTijd(tijd, allAccepted, allPending) {
    const isConfirmed = allAccepted.some((s) => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}` === tijd;
    });
    if (isConfirmed) return 'confirmed';
    const isPending = allPending.some((s) => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}` === tijd;
    });
    if (isPending) return 'pending';
    return 'free';
  }
  function buildTimeSlotOptions({ uren, slotDuur, slotsPerUur, allAccepted, allPending }) {
    const slots = [];
    uren.forEach((uur) => {
      for (let i = 0; i < slotsPerUur; ++i) {
        const min = i * slotDuur;
        const mm = min < 10 ? `0${min}` : `${min}`;
        const tijd = `${uur < 10 ? '0' : ''}${uur}:${mm}`;
        const status = getStatusForTijd(tijd, allAccepted, allPending);
        let kleur = '#fff', disabled = false, label = `${uur}u${mm}`;
        if (status === 'pending') {
          kleur = '#fff9d1';
          disabled = true;
          label += ' (in afwachting)';
        } else if (status === 'confirmed') {
          kleur = '#ffe0e0';
          disabled = true;
          label += ' (bezet)';
        }
        slots.push({ value: tijd, label, kleur, disabled, status });
      }
    });
    return slots;
  }
  const allSlots = buildTimeSlotOptions({ uren, slotDuur, slotsPerUur, allAccepted, allPending });

  const photo = getStudentPhotoUrl(student.profiel_foto_key, student.profiel_foto_url);
  const fullName = `${student.voornaam} ${student.achternaam}`;
  const isFavoriet = isStudentFavorite(currentBedrijfId, student.gebruiker_id);
  const hartIcon = isFavoriet ? '❤️' : '🤍';

  const popup = document.createElement('div');
  popup.id = 'student-popup-modal';
  popup.style.cssText = `position: fixed;top: 0;left: 0;width: 100vw;height: 100vh;background: rgba(0,0,0,0.5);display: flex;align-items: center;justify-content: center;z-index: 2000;`;

  // Skills en functies badges (harmonisatie: highlight alleen matches met bedrijf)
  // Haal de skills/functies van het bedrijf op
  let bedrijfSkills = [];
  let bedrijfFuncties = [];
  try {
    const resp = await authenticatedFetch(`https://api.ehb-match.me/bedrijven/${currentBedrijfId}/skills`);
    if (resp.ok) bedrijfSkills = await resp.json();
  } catch {}
  try {
    const resp = await authenticatedFetch(`https://api.ehb-match.me/bedrijven/${currentBedrijfId}/functies`);
    if (resp.ok) bedrijfFuncties = await resp.json();
  } catch {}
  const bedrijfSkillNamen = bedrijfSkills.map(s => s.naam);
  const bedrijfFunctieNamen = bedrijfFuncties.map(f => f.naam);

  // Highlight alleen matches met bedrijf
  const skillsHTML = Array.isArray(studentSkills) && studentSkills.length
    ? studentSkills
        .map(
          (s) =>
            `<span class="skill-badge" style="display:inline-block;margin:0 0.3em 0.3em 0;padding:0.2em 0.7em;border-radius:7px;background:${bedrijfSkillNamen.includes(s) ? '#e3f2fd' : '#f5f5f5'};color:#222;font-size:0.97em;" title="${bedrijfSkillNamen.includes(s) ? 'Deze skill matcht met het bedrijf!' : ''}">${s}</span>`
        )
        .join(' ')
    : '<span style="color:#aaa;">Geen skills/talen bekend</span>';

  const functiesHTML = Array.isArray(studentFuncties) && studentFuncties.length
    ? studentFuncties
        .map(
          (f) =>
            `<span class="functie-badge" style="display:inline-block;margin:0 0.3em 0.3em 0;padding:0.2em 0.7em;border-radius:7px;background:${bedrijfFunctieNamen.includes(f) ? '#e3f2fd' : '#f5f5f5'};color:#222;font-size:0.97em;" title="${bedrijfFunctieNamen.includes(f) ? 'Deze functie matcht met het bedrijf!' : ''}">${f}</span>`
        )
        .join(' ')
    : '<span style="color:#aaa;">Geen functies bekend</span>';

  popup.innerHTML = `
    <div id="student-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:600px;width:98vw;min-width:340px;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="student-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">×</button>
      <button id="popup-favorite-btn" class="popup-favorite-btn" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}">${hartIcon}</button>
      <img src="${photo}" alt="Foto ${fullName}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:1rem;" onerror="this.src='${defaultStudentAvatar}'">
      <h2 style="margin-bottom:0.5rem;text-align:center;">${fullName}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">Studiejaar: ${student.studiejaar}</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${opleidingText}</div>
      ${student.linkedin ? `<a href="${student.linkedin}" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>` : ''}
      <div style="font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;"><a href="mailto:${student.contact_email}" style="color:#444;">${student.contact_email}</a></div>
      <div style="margin-bottom:0.7rem;width:100%;display:flex;flex-direction:row;gap:1.5rem;justify-content:center;">
        <div style="text-align:left;"><strong>Functies:</strong><div style="margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;">${functiesHTML}</div></div>
        <div style="text-align:left;"><strong>Skills/talen:</strong><div style="margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;">${skillsHTML}</div></div>
      </div>
      <div style="margin-bottom:0.7rem;width:100%;">
        <div style="margin-bottom:0.4rem;font-size:0.97rem;text-align:center;">
          <strong>Tijdslot legenda:</strong>
          <span style="background:#fff;border:1px solid #ccc;padding:0.1rem 0.5rem;border-radius:5px;margin-left:0.5rem;">Vrij</span>
          <span style="background:#fff9d1;border:1px solid #ffe9a0;padding:0.1rem 0.5rem;border-radius:5px;margin-left:0.5rem;">Pending</span>
          <span style="background:#ffe0e0;border:1px solid #ffbdbd;padding:0.1rem 0.5rem;border-radius:5px;margin-left:0.5rem;">Bezet</span>
        </div>
      </div>
      <div id="uren-list" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; justify-content: center;"></div>
      <div id="slots-list" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;justify-content:center;"></div>
      <button id="speeddates-aanvraag-btn" style="background:#00bcd4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1rem;cursor:pointer;" disabled>Confirmeer aanvraag</button>
      <div id="speeddates-aanvraag-status" style="margin-top:1rem;font-size:1rem;color:#2aa97b;display:none;">Speeddate aangevraagd!</div>
    </div>
  `;
  document.body.appendChild(popup);

  // Favoriet event
  const popupFavoriteBtn = document.getElementById('popup-favorite-btn');
  if (popupFavoriteBtn && currentBedrijfId) {
    popupFavoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isNowFavorite = toggleFavoriteStudent(currentBedrijfId, student.gebruiker_id);
      popupFavoriteBtn.innerHTML = isNowFavorite ? '❤️' : '🤍';
      popupFavoriteBtn.title = isNowFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten';
      const cardFavoriteBtn = document.querySelector(`[data-student-id="${student.gebruiker_id}"]`);
      if (cardFavoriteBtn) {
        cardFavoriteBtn.innerHTML = isNowFavorite ? '❤️' : '🤍';
        cardFavoriteBtn.title = isNowFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten';
      }
      showFeedbackNotification(isNowFavorite ? `${fullName} toegevoegd aan favorieten!` : `${fullName} verwijderd uit favorieten`, isNowFavorite ? 'success' : 'info');
      popupFavoriteBtn.classList.add('animating');
      setTimeout(() => popupFavoriteBtn.classList.remove('animating'), 400);
    });
  }
  document.getElementById('student-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });

  // Urenbalk en slotselectie
  const urenLijst = popup.querySelector('#uren-list');
  const slotsList = popup.querySelector('#slots-list');
  const aanvraagBtn = popup.querySelector('#speeddates-aanvraag-btn');
  const statusDiv = popup.querySelector('#speeddates-aanvraag-status');
  let geselecteerdUur = null;
  let gekozenTijd = '';
  aanvraagBtn.disabled = true;

  uren.forEach((uur) => {
    const slotsForHour = allSlots.filter((slot) => parseInt(slot.value.split(':')[0], 10) === uur);
    const vrijeSlots = slotsForHour.filter((slot) => slot.status === 'free').length;
    const btn = document.createElement('button');
    const isUnavailable = vrijeSlots === 0;
    const backgroundColor = isUnavailable ? '#ffebee' : '#eef1fa';
    const borderColor = isUnavailable ? '#f44336' : '#b7b7ff';
    const textColor = isUnavailable ? '#c62828' : '#4e7bfa';
    const spanBackground = isUnavailable ? '#ffcdd2' : '#fff';
    const spanBorderColor = isUnavailable ? '#f44336' : '#b7b7ff';
    const spanTextColor = isUnavailable ? '#c62828' : '#4e7bfa';
    btn.innerHTML = `${uur}u <span style="background:${spanBackground};border-radius:8px;padding:0.1rem 0.7rem;font-size:0.92em;margin-left:0.5em;border:1px solid ${spanBorderColor};color:${spanTextColor};" title="Aantal beschikbare tijdslots">${vrijeSlots}</span>`;
    btn.style.cssText = `background:${backgroundColor};border:1.5px solid ${borderColor};border-radius:8px;padding:0.5rem 1.2rem;font-size:1.05rem;cursor:${isUnavailable ? 'not-allowed' : 'pointer'};margin:0;transition:box-shadow .2s;display:flex;align-items:center;gap:0.4em;color:${textColor};opacity:${isUnavailable ? '0.7' : '1'};`;
    if (isUnavailable) {
      btn.disabled = true;
      btn.title = 'Geen tijdslots beschikbaar voor dit uur';
    } else {
      btn.title = `${vrijeSlots} beschikbare tijdslots voor ${uur}:00 uur`;
    }
    btn.addEventListener('click', () => {
      if (isUnavailable) return;
      geselecteerdUur = uur;
      urenLijst.querySelectorAll('button').forEach((b) => (b.style.boxShadow = ''));
      btn.style.boxShadow = '0 0 0 2.5px #4e7bfa';
      renderSlotsForHour(uur);
    });
    urenLijst.appendChild(btn);
  });
  function renderSlotsForHour(uur) {
    const slotsForHour = allSlots.filter((slot) => parseInt(slot.value.split(':')[0], 10) === uur);
    slotsList.innerHTML = slotsForHour
      .map((slot) => `
        <button class="slot-btn" data-slot="${slot.value}" style="background:${slot.kleur};border:1.5px solid #e1e5e9;border-radius:8px;padding:0.5rem 1rem;min-width:75px;cursor:${slot.disabled ? 'not-allowed' : 'pointer'};opacity:${slot.disabled ? '0.65' : '1'};font-weight:${slot.status === 'confirmed' ? 'bold' : 'normal'};font-size:0.97rem;" ${slot.disabled ? 'disabled' : ''} title="${slot.label}">${slot.label.split(' ')[0]}</button>
      `).join('');
    aanvraagBtn.disabled = true;
    gekozenTijd = '';
    slotsList.querySelectorAll('.slot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        slotsList.querySelectorAll('.slot-btn').forEach((b) => (b.style.outline = ''));
        btn.style.outline = '2.5px solid #007bff';
        gekozenTijd = btn.getAttribute('data-slot');
        aanvraagBtn.disabled = false;
      });
    });
  }
  // Auto-selecteer eerste beschikbare uur
  if (uren.length) {
    const firstAvailableButton = urenLijst.querySelector('button:not([disabled])');
    if (firstAvailableButton) firstAvailableButton.click();
  }

  aanvraagBtn.addEventListener('click', async () => {
    if (!gekozenTijd) return;
    // Disable all popup controls immediately when request is sent
    const popupControls = Array.from(popup.querySelectorAll('button, input, select'));
    popupControls.forEach((el) => {
      el.disabled = true;
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.7';
    });
    const datetime = `${speeddateDate} ${gekozenTijd}:00`;
    try {
      aanvraagBtn.disabled = true;
      aanvraagBtn.textContent = 'Aanvragen...';
      statusDiv.style.display = 'block';
      statusDiv.style.color = '#666';
      statusDiv.textContent = 'Speeddate aanvraag wordt verstuurd...';
      const response = await createSpeeddate(student.gebruiker_id, currentBedrijfId, datetime);
      // Highlight het gekozen tijdslot direct lichtgeel
      if (gekozenTijd) {
        const slotBtn = slotsList.querySelector(`.slot-btn[data-slot="${gekozenTijd}"]`);
        if (slotBtn) {
          slotBtn.style.background = '#fff9d1';
          slotBtn.style.borderColor = '#ffe9a0';
          slotBtn.style.opacity = '1';
        }
      }
      statusDiv.style.color = '#28a745';
      statusDiv.textContent = `Speeddate aanvraag succesvol verstuurd naar ${fullName}!`;
      setTimeout(() => { popup.remove(); }, 2000);
    } catch (error) {
      statusDiv.style.color = '#dc3545';
      statusDiv.textContent = 'Er is een fout opgetreden bij het aanvragen van de speeddate. Probeer het opnieuw.';
      // Re-enable controls if request fails
      popupControls.forEach((el) => {
        el.disabled = false;
        el.style.pointerEvents = '';
        el.style.opacity = '';
      });
      aanvraagBtn.disabled = false;
      aanvraagBtn.textContent = 'Confirmeer aanvraag';
    }
  });
}

// Toon studentinfo popup met actuele info en matching skills/functies
export async function showStudentInfoPopup(student) {
  // Remove any existing popup
  const existing = document.getElementById('student-popup-modal');
  if (existing) existing.remove();

  // Haal altijd de meest actuele studentinfo op via API
  let studentId = student.gebruiker_id || student.id_student || student.id;
  let studentData = { ...student };
  if (studentId) {
    try {
      const resp = await authenticatedFetch(`https://api.ehb-match.me/studenten/${studentId}`);
      if (resp.ok) {
        const apiData = await resp.json();
        studentData = { ...studentData, ...apiData };
      }
    } catch {}
  }

  // Haal functies en skills op
  let functies = [];
  let skills = [];
  try {
    const functiesResp = await authenticatedFetch(
      `https://api.ehb-match.me/studenten/${studentId}/functies`
    );
    if (functiesResp.ok) functies = await functiesResp.json();
  } catch {}
  try {
    const skillsResp = await authenticatedFetch(
      `https://api.ehb-match.me/studenten/${studentId}/skills`
    );
    if (skillsResp.ok) skills = await skillsResp.json();
  } catch {}

  // Haal bedrijf skills/functies uit sessionStorage (voor matching)
  let bedrijfSkills = [], bedrijfFuncties = [];
  try {
    const bedrijfData = JSON.parse(sessionStorage.getItem('bedrijfData') || sessionStorage.getItem('user') || '{}');
    if (bedrijfData.skills && Array.isArray(bedrijfData.skills)) {
      bedrijfSkills = bedrijfData.skills.map(s => (typeof s === 'string' ? s : s.naam)).filter(Boolean).map(s => s.toLowerCase());
    }
    if (bedrijfData.functies && Array.isArray(bedrijfData.functies)) {
      bedrijfFuncties = bedrijfData.functies.map(f => (typeof f === 'string' ? f : f.naam)).filter(Boolean).map(f => f.toLowerCase());
    }
  } catch {}

  // Vul ontbrekende velden aan met fallback keys uit studentData
  const naam = (studentData.voornaam || '') + ' ' + (studentData.achternaam || '');
  const opleiding = studentData.opleiding_naam || studentData.opleiding || '';
  const email = studentData.contact_email || studentData.email || '';
  const studiejaar = studentData.studiejaar || '';
  const profielFoto = getStudentPhotoUrl(studentData.profiel_foto_key, studentData.profiel_foto_url);

  // Toon alleen niet-lege velden
  const opleidingHtml = opleiding ? `<div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">${opleiding}</div>` : '';
  const studiejaarHtml = studiejaar ? `<div style=\"font-size:0.97rem;color:#888;margin-bottom:0.7rem;\">Studiejaar: ${studiejaar}</div>` : '';
  const emailHtml = email ? `<div style=\"font-size:0.95rem;color:#555;text-align:center;margin-bottom:0.5rem;\"><a href=\"mailto:${email}\" style=\"color:#444;\">${email}</a></div>` : '';

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
  popup.innerHTML = `
    <div id=\"student-popup-content\" style=\"background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:600px;width:98vw;min-width:340px;position:relative;display:flex;flex-direction:column;align-items:center;\">
      <button id=\"student-popup-close\" style=\"position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;\">&times;</button>
      <img src=\"${profielFoto}\" alt=\"Profielfoto ${naam}\" style=\"width:90px;height:90px;object-fit:cover;margin-bottom:1.2rem;\" onerror=\"this.onerror=null;this.src='${defaultStudentAvatar}'">
      <h2 style=\"margin-bottom:0.5rem;text-align:center;\">${naam}</h2>
      ${opleidingHtml}
      ${studiejaarHtml}
      ${emailHtml}
      <div style=\"margin-bottom:0.7rem;width:100%;display:flex;flex-direction:row;gap:1.5rem;justify-content:center;\">
        <div style=\"text-align:left;\">
          <strong>Functies:</strong>
          <div style=\"margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;\">
            ${Array.isArray(functies) && functies.length ? functies.map(f => {
              const isMatch = bedrijfFuncties.includes((f.naam||'').toLowerCase());
              return `<span class='functie-badge' style='display:inline-block;margin:0 0.3em 0.3em 0;padding:0.2em 0.7em;border-radius:7px;background:${isMatch ? '#e3f2fd' : '#f5f5f5'};color:${isMatch ? '#1565c0' : '#222'};font-size:0.97em;'>${f.naam}</span>`;
            }).join(' ') : '<span style=\"color:#aaa;\">Geen functies bekend</span>'}
          </div>
        </div>
        <div style=\"text-align:left;\">
          <strong>Skills/talen:</strong>
          <div style=\"margin-top:0.3rem;max-width:100%;white-space:normal;display:flex;flex-wrap:wrap;gap:0.3em;\">
            ${Array.isArray(skills) && skills.length ? skills.map(s => {
              const isMatch = bedrijfSkills.includes((s.naam||'').toLowerCase());
              return `<span class='skill-badge' style='display:inline-block;margin:0 0.3em 0.3em 0;padding:0.2em 0.7em;border-radius:7px;background:${isMatch ? '#e3f2fd' : '#f5f5f5'};color:${isMatch ? '#1565c0' : '#222'};font-size:0.97em;'>${s.naam}</span>`;
            }).join(' ') : '<span style=\"color:#aaa;\">Geen skills/talen bekend</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById('student-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
}

// --- HOOFDFUNCTIE: renderStudenten ---
export async function renderStudenten(rootElement, bedrijfData = {}) {
  // Laad bedrijfData uit sessionStorage indien leeg
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('bedrijfData');
      if (stored) bedrijfData = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing bedrijfData from sessionStorage:', e);
    }
  }
  // Probeer bedrijfData uit API indien nog leeg
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const userInfoResult = await fetchUserInfo();
      if (userInfoResult.success && userInfoResult.user) {
        const apiUser = userInfoResult.user;
        bedrijfData = {
          id: apiUser.id || apiUser.gebruiker_id,
          naam: apiUser.naam || apiUser.bedrijfsnaam || 'Mijn Bedrijf',
        };
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }
  currentBedrijfId = bedrijfData.id || bedrijfData.gebruiker_id;
  // --- UI STRUCTUUR: identiek aan student/bedrijven.js ---
  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section" id="logo-navigation">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-profile">Profiel</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link active">Studenten</button></li>
          </ul>
        </nav>
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container" style="padding:2.5rem 2.2rem 2.2rem 2.2rem; border-radius:18px; background:#fff; box-shadow:0 4px 24px #0001; max-width:1200px; margin:auto;">
            <h1 class="bedrijf-profile-title">Studenten</h1>
            <!-- Filterbalk -->
            <div class="studenten-filterbar-flex" style="background:#f8fafc; padding:1.2rem; border-radius:14px; margin-bottom:2.2rem; box-shadow:0 2px 8px #0001; border:1.5px solid #e1e5e9; position:relative;">
              <div class="zoek-group">
                <label for="student-zoek" style="font-weight:500;font-size:0.9rem;margin-bottom:0.2rem;display:block;">Zoeken</label>
                <input id="student-zoek" type="text" placeholder="Zoek student of email...">
              </div>
              <div id="filter-opleiding" class="filter-group"></div>
              <div id="filter-functie" class="filter-group"></div>
              <div id="filter-skills" class="filter-group"></div>
              <div id="filter-studiejaar" class="filter-group"></div>
              <div id="sort-group" class="sort-group"></div>
              <div class="reset-group">
                <button id="reset-filters" style="padding:0.6rem 1.2rem;background:#e2e8f0;color:#333;border:none;border-radius:8px;cursor:pointer;font-weight:500;">Reset filters</button>
              </div>
              <button id="filter-favorieten-btn" title="Toon alleen favorieten" class="" style="font-size:1.7rem;background:none;border:none;cursor:pointer;z-index:5;transition:transform 0.3s;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;box-sizing:content-box;">🤍</button>
            </div>
            <div style="height:24px;width:100%;padding-bottom:40px"></div>
            <div style="height:1px;width:100%;background:#e1e5e9;margin-bottom:2.2rem;"></div>
            <!-- Studentenlijst -->
            <div id="studenten-list" class="studenten-list" style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;">
              <div style="text-align:center;width:100%;color:#888;">Studenten laden...</div>
            </div>
          </div>
        </div>
      </div>
      <footer class="bedrijf-profile-footer">
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

  // Add CSS for student cards
  const style = document.createElement('style');
  style.innerHTML = `
    .student-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 220px;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s;
      position: relative;
    }
    .student-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    .match-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #28a745;
      color: white;
      padding: 0.3rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }    .studenten-filters label {
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
      display: block;
    }
    .studenten-filters input[type="checkbox"] {
      margin-right: 0.5rem;
    }
    .favorite-btn.animating, .popup-favorite-btn.animating {
      transform: scale(1.3);
    }    #filter-favorieten-btn.animating {
      transform: scale(1.3);
    }
  `;
  document.head.appendChild(style);
  // --- HARMONISEER STUDENT KAART EN POPUP ---
  // Gebruik dezelfde structuur als bedrijf.js, maar met studentdata en API-calls
  // Kaart: foto, naam, opleiding, studiejaar, email, skills, functies, match%, favoriet-knop
  // Popup: alle info, skills/functies badges, LinkedIn, speeddate, etc.
  // Filterbar: toon alleen filters die relevant zijn voor student (opleiding, studiejaar, locatie, skills, functies, favorieten)

  // --- PAS RENDERSTUDENTSLIST AAN ---
  function renderStudentsList(studentsToShow = studenten) {
    const listElement = document.getElementById('studenten-list');
    if (!listElement) return;
    if (studentsToShow.length === 0) {
      listElement.innerHTML =
        '<div style="text-align:center;width:100%;color:#888;">Geen studenten gevonden.</div>';
      return;
    }
    listElement.innerHTML = studentsToShow
      .map((student, idx) => {
        const photo = getStudentPhotoUrl(
          student.profiel_foto_key,
          student.profiel_foto_url
        );
        const fullName = `${student.voornaam} ${student.achternaam}`;
        const opleiding = student.opleiding_naam || '';
        const studiejaar = student.studiejaar ? `Studiejaar: ${student.studiejaar}` : '';
        const email = student.contact_email || '';
        const matchPercentage = student.match_percentage ? Number(student.match_percentage) : 0;
        const formattedMatch = Number.isFinite(matchPercentage) ? matchPercentage.toFixed(1) : '0.0';
        const colorScheme = getMatchColorScheme(matchPercentage);
        const isFavoriet = currentBedrijfId ? isStudentFavorite(currentBedrijfId, student.gebruiker_id) : false;
        const hartIcon = isFavoriet ? '❤️' : '🤍';
        // Skills/functies badges (optioneel, als array aanwezig)
        const skillsBadges = '';
        const functiesBadges = '';
        return `
          <div class="student-card" data-student-idx="${idx}" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001, -8px 0 16px 0 ${colorScheme.background}33;padding:1.5rem 1rem;display:flex;flex-direction:column;align-items:center;width:220px;cursor:pointer;transition:box-shadow 0.2s;position:relative;">
            <span class="match-badge" style="position:absolute;top:10px;left:10px;background:${colorScheme.background};color:#fff;font-weight:bold;padding:0.3em 0.8em;border-radius:16px;font-size:0.98em;z-index:3;box-shadow:0 2px 8px #0002;min-width:unset;max-width:70px;text-align:center;">${formattedMatch}%</span>
            <button class="favorite-btn" data-student-id="${student.gebruiker_id}" title="${isFavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;cursor:pointer;z-index:2;">${hartIcon}</button>
            <div class="student-card-clickable" style="width:100%;display:flex;flex-direction:column;align-items:center;" tabindex="0">
              <img src="${photo}" alt="Foto ${fullName}" style="width:80px;height:80px;border-radius:50%;object-fit:contain;margin-bottom:1rem;" onerror="this.src='${defaultStudentAvatar}'">
              <h3 style="margin-bottom:0.5rem;text-align:center;">${fullName}</h3>
              <div style="font-size:0.97rem;color:#666;margin-bottom:0.3rem;">${opleiding}</div>
              <div style="font-size:0.97rem;color:#888;margin-bottom:0.3rem;">${studiejaar}</div>
              <div style="font-size:0.95rem;color:#555;margin-bottom:0.3rem;">${functiesBadges}</div>
              <div style="font-size:0.95rem;color:#555;margin-bottom:0.3rem;">${skillsBadges}</div>
            </div>
          </div>
        `;
      })
      .join('');
    document.querySelectorAll('.student-card .student-card-clickable').forEach((card) => {
      card.addEventListener('click', (e) => {
        const parent = card.closest('.student-card');
        if (!parent) return;
        const idx = parent.getAttribute('data-student-idx');
        showStudentPopup(studentsToShow[idx]);
      });
    });
    document.querySelectorAll('.favorite-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = btn.getAttribute('data-student-id');
        if (!currentBedrijfId || !studentId) return;
        const isNowFavorite = toggleFavoriteStudent(currentBedrijfId, studentId);
        btn.innerHTML = isNowFavorite ? '❤️' : '🤍';
        btn.title = isNowFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten';
        const student = studentsToShow.find((s) => s.gebruiker_id == studentId);
        const studentNaam = student ? `${student.voornaam} ${student.achternaam}` : 'Student';
        showFeedbackNotification(isNowFavorite ? `${studentNaam} toegevoegd aan favorieten!` : `${studentNaam} verwijderd uit favorieten`, isNowFavorite ? 'success' : 'info');
        btn.classList.add('animating');
        setTimeout(() => btn.classList.remove('animating'), 400);
      });
    });
  }

  // --- FILTERBAR UI (VOEG TOE IN renderStudenten) ---
  // Plaats deze HTML in je renderStudenten functie, vervang de oude filterbalk:
  /*
  <div class="studenten-filterbar-flex">
    <div class="zoek-group">
      <label for="student-zoek">Zoeken</label>
      <input id="student-zoek" type="text" placeholder="Zoek student of email...">
    </div>
    <div id="filter-locaties" class="filter-group"></div>
    <div id="filter-opleiding" class="filter-group"></div>
    <div id="filter-functie" class="filter-group"></div>
    <div id="filter-skills" class="filter-group"></div>
    <div id="filter-studiejaar" class="filter-group"></div>
    <div id="sort-group" class="sort-group"></div>
    <div class="reset-group">
      <button id="reset-filters">Reset filters</button>
    </div>
    <button id="filter-favorieten-btn">🤍</button>
  </div>
  */
  // Voeg per filter een popup/select toe met alle unieke opties (zoals in bedrijven.js)
  // Update de filterwaarden en her-render de lijst bij elke wijziging.
  // Voeg een reset-knop toe die alle filters wist.
  // Sorteer standaard op match-percentage (desc/asc toggle).

  // --- CSS HARMONISATIE: filterbar, knoppen, popups ---
  (function injectHarmonizedFilterbarCSS() {
    if (!document.getElementById('bedrijven-filterbar-css')) {
      const style = document.createElement('style');
      style.id = 'bedrijven-filterbar-css';
      style.innerHTML = `
.bedrijven-filterbar-flex, .studenten-filterbar-flex {
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
.bedrijven-filterbar-flex .reset-group,
.studenten-filterbar-flex .filter-group,
.studenten-filterbar-flex .zoek-group,
.studenten-filterbar-flex .sort-group,
.studenten-filterbar-flex .reset-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1 1 0;
  gap: 0.2rem;
  min-width: 0;
  max-width: 100%;
}
.bedrijven-filterbar-flex label, .studenten-filterbar-flex label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}
.bedrijven-filterbar-flex select,
.bedrijven-filterbar-flex input[type="text"],
.bedrijven-filterbar-flex button:not(#filter-favorieten-btn),
.studenten-filterbar-flex select,
.studenten-filterbar-flex input[type="text"],
.studenten-filterbar-flex button:not(#filter-favorieten-btn) {
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
  transition: background 0.18s, border 0.18s, box-shadow 0.18s, color 0.18s, transform 0.12s;
}
.bedrijven-filterbar-flex input[type="text"],
.studenten-filterbar-flex input[type="text"] {
  cursor: text;
}
.bedrijven-filterbar-flex button:not(#filter-favorieten-btn),
.studenten-filterbar-flex button:not(#filter-favorieten-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#sort-percentage-btn, .bedrijven-filterbar-flex .sort-group button, .studenten-filterbar-flex .sort-group button {
  background: #f5f5f5;
  border: 1.5px solid #e1e5e9;
  color: #222;
  font-weight: 600;
  min-width: 150px;
  max-width: 100%;
  transition: background 0.2s, border 0.2s, box-shadow 0.18s, color 0.18s, transform 0.12s;
  box-shadow: 0 1px 4px #0001;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.85rem, 1.1vw, 1.05rem);
  line-height: 1.1;
  padding: 0.6rem 0.9rem;
}
#sort-percentage-btn:hover, .bedrijven-filterbar-flex .sort-group button:hover, .studenten-filterbar-flex .sort-group button:hover,
.bedrijven-filterbar-flex button:not(#filter-favorieten-btn):hover,
.studenten-filterbar-flex button:not(#filter-favorieten-btn):hover {
  background: #e1e5e9;
  border-color: #b7b7ff;
  color: #1a237e;
  box-shadow: 0 2px 8px #b7b7ff33;
}
#sort-percentage-btn:active, .bedrijven-filterbar-flex .sort-group button:active, .studenten-filterbar-flex .sort-group button:active,
.bedrijven-filterbar-flex button:not(#filter-favorieten-btn):active,
.studenten-filterbar-flex button:not(#filter-favorieten-btn):active {
  background: #dde3f7;
  border-color: #4e7bfa;
  color: #0d47a1;
  box-shadow: 0 1px 2px #4e7bfa33;
  transform: scale(0.97);
}
.bedrijven-filterbar-flex input[type="text"]:hover,
.studenten-filterbar-flex input[type="text"]:hover {
  border-color: #b7b7ff;
  background: #f5f7fa;
  box-shadow: 0 2px 8px #b7b7ff22;
}
.bedrijven-filterbar-flex input[type="text"]:focus,
.studenten-filterbar-flex input[type="text"]:focus {
  border-color: #4e7bfa;
  background: #fff;
  box-shadow: 0 2px 8px #4e7bfa33;
  outline: none;
}
.bedrijven-filterbar-flex input[type="text"]:active,
.studenten-filterbar-flex input[type="text"]:active {
  border-color: #4e7bfa;
  background: #eef1fa;
  box-shadow: 0 1px 2px #4e7bfa22;
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
  transition: transform 0.3s, color 0.18s;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: content-box;
  color: #b7b7ff;
}
#filter-favorieten-btn:hover {
  color: #4e7bfa;
  transform: scale(1.13);
}
#filter-favorieten-btn:active {
  color: #1a237e;
  transform: scale(0.97);
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
  .bedrijven-filterbar-flex, .studenten-filterbar-flex {
    flex-wrap: wrap;
  }
  .bedrijven-filterbar-flex .filter-group,
  .bedrijven-filterbar-flex .zoek-group,
  .bedrijven-filterbar-flex .sort-group,
  .bedrijven-filterbar-flex .reset-group,
  .studenten-filterbar-flex .filter-group,
  .studenten-filterbar-flex .zoek-group,
  .studenten-filterbar-flex .sort-group,
  .studenten-filterbar-flex .reset-group {
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
  .bedrijven-filterbar-flex, .studenten-filterbar-flex {
    flex-direction: column;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 0.7rem 0;
    min-width: 0;
  }
  .bedrijven-filterbar-flex .filter-group,
  .bedrijven-filterbar-flex .zoek-group,
  .bedrijven-filterbar-flex .sort-group,
  .bedrijven-filterbar-flex .reset-group,
  .studenten-filterbar-flex .filter-group,
  .studenten-filterbar-flex .zoek-group,
  .studenten-filterbar-flex .sort-group,
  .studenten-filterbar-flex .reset-group {
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
    }
  })();

  // --- FILTERBAR HARMONISATIE ---
  function renderFilterOptions() {
    // Opleidingen
    const opleidingen = getUniekeOpleidingen().sort((a, b) => a.localeCompare(b));
    const opleidingDiv = document.getElementById('filter-opleiding');
    if (opleidingDiv) {
      opleidingDiv.innerHTML = `
        <label for="opleiding-popup-trigger">Opleiding</label>
        <button id="opleiding-popup-trigger" type="button">${
          huidigeOpleidingen.length
            ? huidigeOpleidingen.join(', ')
            : 'Opleiding kiezen...'
        }</button>
      `;
      const opleidingBtn = document.getElementById('opleiding-popup-trigger');
      if (opleidingBtn) {
        opleidingBtn.onclick = () => {
          createPopup({
            id: 'opleiding-filter-popup',
            title: 'Kies opleidingen',
            options: opleidingen,
            selected: huidigeOpleidingen,
            onSave: (gekozen) => {
              huidigeOpleidingen = gekozen;
              renderFilterOptions();
              rerenderStudentenList();
            },
            showSearch: true,
          });
        };
      }
    }
    // Functies
    const functies = getUniekeFuncties().sort((a, b) => a.localeCompare(b));
    const functiesDiv = document.getElementById('filter-functie');
    if (functiesDiv) {
      functiesDiv.innerHTML = `
        <label for="functie-popup-trigger">Functie</label>
        <button id="functie-popup-trigger" type="button">${
          huidigeFuncties.length
            ? huidigeFuncties.join(', ')
            : 'Functie kiezen...'
        }</button>
      `;
      const functieBtn = document.getElementById('functie-popup-trigger');
      if (functieBtn) {
        functieBtn.onclick = () => {
          createPopup({
            id: 'functie-filter-popup',
            title: 'Kies functies',
            options: functies,
            selected: huidigeFuncties,
            onSave: (gekozen) => {
              huidigeFuncties = gekozen;
              renderFilterOptions();
              rerenderStudentenList();
            },
            showSearch: true,
          });
        };
      }
    }
    // Skills
    const skills = getUniekeSkills().sort((a, b) => a.localeCompare(b));
    const skillsDiv = document.getElementById('filter-skills');
    if (skillsDiv) {
      skillsDiv.innerHTML = `
        <label for="skills-popup-trigger">Skills/talen</label>
        <button id="skills-popup-trigger" type="button">${
          huidigeSkills.length
            ? huidigeSkills.join(', ')
            : 'Skills/talen kiezen...'
        }</button>
      `;
      const skillsBtn = document.getElementById('skills-popup-trigger');
      if (skillsBtn) {
        skillsBtn.onclick = () => {
          createPopup({
            id: 'skills-filter-popup',
            title: 'Kies skills/talen',
            options: skills,
            selected: huidigeSkills,
            onSave: (gekozen) => {
              huidigeSkills = gekozen;
              renderFilterOptions();
              rerenderStudentenList();
            },
            showSearch: true,
          });
        };
      }
    }
    // Studiejaar
    const studiejaren = getUniekeStudiejaren().sort((a, b) => a.localeCompare(b));
    const jaarDiv = document.getElementById('filter-studiejaar');
    if (jaarDiv) {
      jaarDiv.innerHTML = `
        <label for="studiejaar-popup-trigger">Studiejaar</label>
        <button id="studiejaar-popup-trigger" type="button">${
          huidigeStudiejaren.length
            ? huidigeStudiejaren.join(', ')
            : 'Studiejaar kiezen...'
        }</button>
      `;
      const jaarBtn = document.getElementById('studiejaar-popup-trigger');
      if (jaarBtn) {
        jaarBtn.onclick = () => {
          createPopup({
            id: 'studiejaar-filter-popup',
            title: 'Kies studiejaren',
            options: studiejaren,
            selected: huidigeStudiejaren,
            onSave: (gekozen) => {
              huidigeStudiejaren = gekozen;
              renderFilterOptions();
              rerenderStudentenList();
            },
            showSearch: true,
          });
        };
      }
    }
    // Sorteerknop
    const sortDiv = document.getElementById('sort-group');
    if (sortDiv) {
      sortDiv.innerHTML = `
        <label for="sort-percentage-btn">&nbsp;</label>
        <button id="sort-percentage-btn" type="button">
          Matchpercentage ${sortPercentageAsc ? '▲' : '▼'}
        </button>
      `;
      const sortBtn = document.getElementById('sort-percentage-btn');
      if (sortBtn) {
        sortBtn.onclick = () => {
          sortPercentageAsc = !sortPercentageAsc;
          renderFilterOptions();
          rerenderStudentenList();
        };
      }
    }
    // Reset button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.className = '';
      resetBtn.style.padding = '';
      resetBtn.style.background = '';
      resetBtn.style.color = '';
      resetBtn.style.border = '';
      resetBtn.style.borderRadius = '';
      resetBtn.style.cursor = '';
      resetBtn.style.fontWeight = '';
      resetBtn.style.minHeight = '';
      resetBtn.style.minWidth = '';
      resetBtn.style.fontSize = '';
      resetBtn.style.boxShadow = '';
      resetBtn.style.transition = '';
      resetBtn.onclick = () => {
        huidigeZoek = '';
        huidigeSkills = [];
        huidigeOpleidingen = [];
        huidigeStudiejaren = [];
        huidigeFuncties = [];
        sortPercentageAsc = false;
        document.getElementById('student-zoek').value = '';
        renderFilterOptions();
        rerenderStudentenList();
      };
    }
  }

  // --- FILTERBAR EVENTS ---
  function setupFilterbarEvents() {
    // Zoekbalk
    const zoekElement = document.getElementById('student-zoek');
    if (zoekElement) {
      zoekElement.addEventListener('input', (e) => {
        huidigeZoek = e.target.value;
        rerenderStudentenList();
      });
    }
    // Favorieten-toggle event (icon button)
    const favorietenBtn = document.getElementById('filter-favorieten-btn');
    if (favorietenBtn) {
      favorietenBtn.addEventListener('click', () => {
        toonAlleFavorieten = !toonAlleFavorieten;
        favorietenBtn.innerHTML = toonAlleFavorieten ? '❤️' : '🤍';
        favorietenBtn.classList.add('animating');
        rerenderStudentenList();
        setTimeout(() => favorietenBtn.classList.remove('animating'), 400);
      });
    }
    // Reset button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.onclick = () => {
        huidigeZoek = '';
        huidigeSkills = [];
        huidigeOpleidingen = [];
        huidigeStudiejaren = [];
        huidigeFuncties = [];
        sortPercentageAsc = false;
        document.getElementById('student-zoek').value = '';
        renderFilterOptions();
        rerenderStudentenList();
      };
    }
  }

  // --- MULTI-SELECT POPUP (identiek aan bedrijven.js) ---
  function createPopup({ id, title, options = [], selected = [], onSave, showSearch = false }) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 3000;`;
    const popup = document.createElement('div');
    popup.style.cssText = `background: #fff; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15);`;
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
    const optionsContainer = document.getElementById(`${id}-options`);
    function renderOptions(filter = '') {
      optionsContainer.innerHTML = '';
      const filtered = options.filter((opt) => !filter || opt.toLowerCase().includes(filter.toLowerCase()));
      if (filtered.length === 0) {
        optionsContainer.innerHTML = '<div style="color:#888;padding:1rem 0;">Geen opties beschikbaar.</div>';
      } else {
        filtered.forEach((opt) => {
          const div = document.createElement('label');
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.innerHTML = `
          <input type="checkbox" value="${opt}" ${selected.includes(opt) ? 'checked' : ''} />
          <span style="margin-left:0.6rem;">${opt}</span>`;
          optionsContainer.appendChild(div);
        });
      }
    }
    renderOptions();
    if (showSearch) {
      const searchInput = document.getElementById('popup-search');
      searchInput.addEventListener('input', (e) => {
        renderOptions(e.target.value);
      });
    }
    document.getElementById(`${id}-cancel`).onclick = () => overlay.remove();
    document.getElementById(`${id}-save`).onclick = () => {
      const gekozen = Array.from(optionsContainer.querySelectorAll('input:checked')).map((i) => i.value);
      onSave(gekozen);
      overlay.remove();
    };
  }

  // --- In je renderStudenten functie, na het renderen van de filterbar ---
  renderFilterOptions();

  // --- FILTERBAR EVENTS: favorieten button ---
  const favorietenBtn = document.getElementById('filter-favorieten-btn');
  if (favorietenBtn) {
    favorietenBtn.addEventListener('click', () => {
      toonAlleFavorieten = !toonAlleFavorieten;
      favorietenBtn.innerHTML = toonAlleFavorieten ? '❤️' : '🤍';
      favorietenBtn.classList.add('animating');
      rerenderStudentenList();
      setTimeout(() => favorietenBtn.classList.remove('animating'), 400);
    });
  }

  // --- SIDEBAR EN MENU NAVIGATIE (IDENTIEK AAN BEDRIJVEN.JS) ---
  function setupSidebarAndMenuNavigation() {
    // Sidebar links
    document.querySelectorAll('.sidebar-link').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const route = e.currentTarget.getAttribute('data-route');
        import('../../router.js').then((module) => {
          const Router = module.default;
          switch (route) {
            case 'speeddates':
              Router.navigate('/bedrijf/speeddates');
              break;
            case 'requests':
              Router.navigate('/bedrijf/speeddates-verzoeken');
              break;
            case 'studenten':
              Router.navigate('/bedrijf/studenten');
              break;
            default:
              break;
          }
        });
      });
    });
    // Hamburger menu
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
    // Profiel knop
    const navProfileBtn = document.getElementById('nav-profile');
    const dropdown = document.getElementById('burger-dropdown');
    if (navProfileBtn && dropdown) {
      navProfileBtn.addEventListener('click', () => {
        dropdown.classList.remove('open');
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/bedrijf/bedrijf-profiel');
        });
      });
    }
    // Instellingen knop
   document.getElementById('nav-settings')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
    import('./bedrijf-settings.js').then((module) => {
      module.showBedrijfSettingsPopup();
    });
  });
    // Logout knop
    const navLogoutBtn = document.getElementById('nav-logout');
    if (navLogoutBtn && dropdown) {
      navLogoutBtn.addEventListener('click', () => {
        dropdown.classList.remove('open');

        localStorage.setItem('darkmode', 'false');
        document.body.classList.remove('darkmode');
               // Log uit en navigeer naar login
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/login');
        });
      });
    }
    // Logo navigation
    const logoSection = document.getElementById('logo-navigation');
    if (logoSection) {
      logoSection.addEventListener('click', () => {
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/bedrijf/studenten');
        });
      });
    }
  }
  setupSidebarAndMenuNavigation();

  // --- API CALLS EN INIT ---
  async function loadStudents() {
    try {
      // suggestions = true (default), onlyNew = false (default)
      const apiUrl = `https://api.ehb-match.me/discover/studenten?id=${currentBedrijfId}`;
      const resp = await authenticatedFetch(apiUrl);
      const data = resp.ok ? await resp.json() : [];
      studenten = Array.isArray(data) ? data : [];
      // Skills én functies ophalen per student (LET OP: veel API calls!)
      await Promise.all(studenten.map(async (s) => {
        try {
          const skillsResp = await authenticatedFetch(`https://api.ehb-match.me/studenten/${s.gebruiker_id}/skills`);
          s.skills = skillsResp.ok ? await skillsResp.json() : [];
          const functiesResp = await authenticatedFetch(`https://api.ehb-match.me/studenten/${s.gebruiker_id}/functies`);
          s.functies = functiesResp.ok ? await functiesResp.json() : [];
        } catch (e) {
          s.skills = [];
          s.functies = [];
        }
      }));
      renderFilterOptions();
      rerenderStudentenList();
    } catch (error) {
      console.error('Error loading students:', error);
      document.getElementById('studenten-list').innerHTML =
        '<div style="text-align:center;width:100%;color:#888;">Fout bij laden van studenten. Probeer opnieuw.</div>';
    }
  }

  // --- HARMONISATIE: rerenderStudentenList helper toevoegen ---
  function rerenderStudentenList() {
    let gefilterd = filterStudenten({
      zoek: huidigeZoek,
      opleidingen: huidigeOpleidingen,
      skills: huidigeSkills,
      studiejaren: huidigeStudiejaren,
      toonAlleFavorieten,
    });
    gefilterd.sort((a, b) => sortPercentageAsc ? a.match_percentage - b.match_percentage : b.match_percentage - a.match_percentage);
    if (typeof renderStudentsList === 'function') renderStudentsList(gefilterd);
  }

  // Roep loadStudents() aan in je renderStudenten-functie na het ophalen van currentBedrijfId
  await loadStudents(); // VULT studenten[]
  renderFilterOptions(); // NU zijn je opties gevuld
}
