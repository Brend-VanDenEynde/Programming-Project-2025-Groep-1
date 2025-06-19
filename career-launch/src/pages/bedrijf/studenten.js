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
import Router from '../../router.js';

// Global variables for students data
let studenten = [];
let currentBedrijfId = null;

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

// Function to show student detail popup
async function showStudentPopup(student) {
  // Remove any existing popup
  const existing = document.getElementById('student-popup-modal');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'student-popup-modal';
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  const photo = getStudentPhotoUrl(
    student.profiel_foto_key,
    student.profiel_foto_url
  );
  const fullName = `${student.voornaam} ${student.achternaam}`;

  // Get color scheme for match percentage
  const matchPercentage = student.match_percentage
    ? Number(student.match_percentage)
    : 0;
  const colorScheme = getMatchColorScheme(matchPercentage);

  // Calculate age from date_of_birth
  let ageText = '';
  if (student.date_of_birth) {
    const birthDate = new Date(student.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    ageText = `, ${age} jaar`;
  }

  // Get opleiding name from opleiding_id (you might want to fetch this from API)
  const opleidingResponse = await authenticatedFetch('https://api.ehb-match.me/opleidingen/' + student.opleiding_id, {
    method: 'GET',
  }).then((response) => {
    if (!response.ok) {
      console.error(`Failed to fetch opleiding: ${response.status}`);
      return {};
    }
    return response.json();
  });
  let opleidingText = opleidingResponse.type + ' ' + opleidingResponse.naam || 'Onbekend';

  popup.innerHTML = `
    <div style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:600px;width:98vw;min-width:340px;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="student-popup-close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">×</button>
      
      <img src="${photo}" alt="Foto ${fullName}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:1rem;" onerror="this.src='${defaultStudentAvatar}'">
      
      <h2 style="margin-bottom:0.5rem;text-align:center;">${fullName}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">Studiejaar: ${
        student.studiejaar
      }${ageText}</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${opleidingText}</div>
      
      ${
        student.linkedin
          ? `<a href="${student.linkedin}" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>`
          : ''
      }
      
      <div style="font-size:0.95rem;color:#555;text-align:center;margin-bottom:1.5rem;">
        <a href="mailto:${student.contact_email}" style="color:#444;">${
    student.contact_email
  }</a>
      </div>      <!-- Match Score Information -->
      <div style="background:#f8f9fa;padding:1rem;border-radius:8px;width:100%;margin-bottom:1rem;border-left: 4px solid ${
        colorScheme.cardBorder
      };">
        <h3 style="margin:0 0 0.5rem 0;font-size:1.1rem;">Match Score</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
          <span>Match Percentage:</span>
          <strong style="color:${colorScheme.background};background:${
    colorScheme.background
  }10;padding:0.2rem 0.5rem;border-radius:4px;">${
    Number.isFinite(Number(student.match_percentage))
      ? Number(student.match_percentage).toFixed(1)
      : '0.0'
  }% - ${colorScheme.label}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
          <span>Functie matches:</span>
          <span>${student.functie_matches || 0}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
          <span>Opleiding matches:</span>
          <span>${student.opleiding_matches || 0}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Skill matches:</span>
          <span>${student.skill_matches || 0}</span>
        </div>      </div>

      <div style="display:flex;justify-content:center;margin-top:1rem;">
        <button id="request-speeddate-btn" style="padding:0.8rem 2rem;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;">Speeddate Aanvragen</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Event listeners
  document.getElementById('student-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });

  document.getElementById('request-speeddate-btn').onclick = () => {
    // You can implement speeddate request functionality here
    showSpeeddateRequestPopup(student, currentBedrijfId);
    popup.remove();
  };
}

// Function to show speeddate request popup
async function showSpeeddateRequestPopup(student, bedrijfId) {
  // Remove any existing popup
  const existing = document.getElementById('speeddate-request-modal');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'speeddate-request-modal';
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `;

  const fullName = `${student.voornaam} ${student.achternaam}`;
  const studentId = student.gebruiker_id || student.id;
  const studentPhoto = getStudentPhotoUrl(
    student.profiel_foto_key,
    student.profiel_foto_url
  );

  // Fixed date for speeddate event
  const speeddateDate = '2025-10-01'; // Fixed date as per requirement
  const formattedDate = new Date(speeddateDate).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Time slot configuration  // Time slot configuration
  const uren = [12, 13, 14, 15, 16, 17];
  const slotDuur = 10; // minutes
  const slotsPerUur = 6; // 0,10,20,30,40,50

  try {
    // Fetch unavailable time slots and pending requests for both student and company
    const token = sessionStorage.getItem('authToken');
    const [
      studentUnavailable,
      companyUnavailable,
      studentPending,
      companyPending,
    ] = await Promise.all([
      authenticatedFetch(
      `https://api.ehb-match.me/speeddates/accepted?id=${studentId}`
    ).then((r) => (r.ok ? r.json() : [])),
      authenticatedFetch(
      `https://api.ehb-match.me/speeddates/accepted?id=${bedrijfId}`
    ).then((r) => (r.ok ? r.json() : [])),
      authenticatedFetch(
        `https://api.ehb-match.me/speeddates/pending?id=${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((r) => (r.ok ? r.json() : [])),
      authenticatedFetch(
        `https://api.ehb-match.me/speeddates/pending?id=${bedrijfId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((r) => (r.ok ? r.json() : [])),
    ]);

    // Combine all unavailable slots from both student and company
    const allUnavailable = [...studentUnavailable, ...companyUnavailable];
    // Combine all pending requests from both student and company
    const allPending = [...studentPending, ...companyPending]; // Status function - check if time slot is unavailable or pending
    function getStatusForTijd(tijd, allAccepted, allPending) {
    const isConfirmed = allAccepted.some((s) => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      return (
        `${dt.getHours().toString().padStart(2, '0')}:${dt
          .getMinutes()
          .toString()
          .padStart(2, '0')}` === tijd
      );
    });
    if (isConfirmed) return 'unavailable';
    const isPending = allPending.some((s) => {
      if (!s.begin) return false;
      const dt = new Date(s.begin);
      return (
        `${dt.getHours().toString().padStart(2, '0')}:${dt
          .getMinutes()
          .toString()
          .padStart(2, '0')}` === tijd
      );
    });
    if (isPending) return 'pending';
    return 'free';
  }

    // Build time slots
    function buildTimeSlotOptions({
      uren,
      slotDuur,
      slotsPerUur,
      unavailableSlots,
      pendingSlots,
    }) {
      const slots = [];
      uren.forEach((uur) => {
        for (let i = 0; i < slotsPerUur; ++i) {
          const min = i * slotDuur;
          const mm = min < 10 ? `0${min}` : `${min}`;
          const tijd = `${uur < 10 ? '0' : ''}${uur}:${mm}`;
          const status = getStatusForTijd(tijd, unavailableSlots, pendingSlots);
          let kleur = '#fff',
            disabled = false,
            label = `${uur}u${mm}`;

          if (status === 'unavailable') {
            kleur = '#ffe0e0';
            disabled = true;
            label += ' (bezet)';
          } else if (status === 'pending') {
            kleur = '#fff3cd';
            disabled = true;
            label += ' (pending)';
          }

          slots.push({ value: tijd, label, kleur, disabled, status });
        }
      });
      return slots;
    }

    const allSlots = buildTimeSlotOptions({
      uren,
      slotDuur,
      slotsPerUur,
      unavailableSlots: allUnavailable,
      pendingSlots: allPending,
    });

    popup.innerHTML = `
      <div style="background:#fff;padding:2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:600px;width:90vw;min-width:400px;position:relative;">
        <button id="speeddate-popup-close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">×</button>
        
        <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:1.5rem;">
          <img src="${studentPhoto}" alt="Foto ${fullName}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:1rem;" onerror="this.src='${defaultStudentAvatar}'">
          <h2 style="margin-bottom:0.5rem;text-align:center;color:#333;">Speeddate Aanvragen</h2>
          <p style="margin-bottom:0.5rem;text-align:center;color:#666;">Vraag een speeddate aan met <strong>${fullName}</strong></p>
          <p style="margin-bottom:0;text-align:center;color:#888;font-size:0.9rem;">Datum: ${formattedDate}</p>
        </div>          <div style="margin-bottom:1rem;">
          <div style="margin-bottom:0.5rem;font-size:0.95rem;text-align:center;">
            <strong>Tijdslot legenda:</strong>
            <span style="background:#fff;border:1px solid #ccc;padding:0.2rem 0.5rem;border-radius:5px;margin-left:0.5rem;font-size:0.85rem;">Vrij</span>
            <span style="background:#fff3cd;border:1px solid #ffeaa7;padding:0.2rem 0.5rem;border-radius:5px;margin-left:0.5rem;font-size:0.85rem;">Pending</span>
            <span style="background:#ffe0e0;border:1px solid #ffbdbd;padding:0.2rem 0.5rem;border-radius:5px;margin-left:0.5rem;font-size:0.85rem;">Bezet</span>
          </div>
        </div>
        
        <div id="uren-lijst" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;justify-content:center;"></div>
        <div id="slots-lijst" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;justify-content:center;min-height:60px;"></div>
        
        <div style="display:flex;gap:1rem;margin-top:1rem;">
          <button type="button" id="cancel-speeddate" style="flex:1;padding:0.8rem;background:#6b7280;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;">Annuleren</button>
          <button type="button" id="submit-speeddate" style="flex:1;padding:0.8rem;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;" disabled>Aanvragen</button>
        </div>
        
        <div id="speeddate-status" style="margin-top:1rem;text-align:center;font-size:0.9rem;display:none;"></div>
      </div>
    `;

    document.body.appendChild(popup);

    // Initialize variables
    const urenLijst = document.getElementById('uren-lijst');
    const slotsLijst = document.getElementById('slots-lijst');
    const submitBtn = document.getElementById('submit-speeddate');
    const statusDiv = document.getElementById('speeddate-status');
    let geselecteerdUur = null;
    let gekozenTijd = ''; // Create hour selection buttons
    uren.forEach((uur) => {
      const slotsForHour = allSlots.filter((slot) => {
        const slotHour = parseInt(slot.value.split(':')[0], 10);
        return slotHour === uur;
      });
      const vrijeSlots = slotsForHour.filter(
        (slot) => slot.status === 'free'
      ).length;

      const btn = document.createElement('button');

      // Bepaal kleur en style gebaseerd op aantal vrije slots
      const isUnavailable = vrijeSlots === 0;
      const backgroundColor = isUnavailable ? '#ffebee' : '#eef1fa';
      const borderColor = isUnavailable ? '#f44336' : '#b7b7ff';
      const textColor = isUnavailable ? '#c62828' : '#4e7bfa';
      const spanBackground = isUnavailable ? '#ffcdd2' : '#fff';
      const spanBorderColor = isUnavailable ? '#f44336' : '#b7b7ff';
      const spanTextColor = isUnavailable ? '#c62828' : '#4e7bfa';

      btn.innerHTML = `${uur}u <span style="background:${spanBackground};border-radius:8px;padding:0.1rem 0.7rem;font-size:0.85em;margin-left:0.5em;border:1px solid ${spanBorderColor};color:${spanTextColor};" title="Aantal beschikbare tijdslots">${vrijeSlots}</span>`;
      btn.style.cssText = `
        background:${backgroundColor};
        border:1.5px solid ${borderColor};
        border-radius:8px;
        padding:0.5rem 1rem;
        font-size:0.95rem;
        cursor:${isUnavailable ? 'not-allowed' : 'pointer'};
        margin:0;
        transition:box-shadow .2s;
        display:flex;align-items:center;gap:0.4em;
        color:${textColor};
        opacity:${isUnavailable ? '0.7' : '1'};
      `;

      if (isUnavailable) {
        btn.disabled = true;
        btn.title = 'Geen tijdslots beschikbaar voor dit uur';
      } else {
        btn.title = `${vrijeSlots} beschikbare tijdslots voor ${uur}:00 uur`;
      }

      btn.addEventListener('click', () => {
        if (isUnavailable) return;
        geselecteerdUur = uur;
        urenLijst
          .querySelectorAll('button')
          .forEach((b) => (b.style.boxShadow = ''));
        btn.style.boxShadow = '0 0 0 2.5px #4e7bfa';
        renderSlotsForHour(uur);
      });
      urenLijst.appendChild(btn);
    });

    // Render slots for selected hour
    function renderSlotsForHour(uur) {
      const slotsForHour = allSlots.filter((slot) => {
        const slotHour = parseInt(slot.value.split(':')[0], 10);
        return slotHour === uur;
      });

      slotsLijst.innerHTML = slotsForHour
        .map(
          (slot) => `
        <button 
          class="slot-btn"
          data-slot="${slot.value}" 
          style="background:${
            slot.kleur
          };border:1.5px solid #e1e5e9;border-radius:8px;padding:0.5rem 1rem;min-width:80px;cursor:${
            slot.disabled ? 'not-allowed' : 'pointer'
          };opacity:${slot.disabled ? '0.65' : '1'};font-weight:${
            slot.status === 'unavailable' ? 'bold' : 'normal'
          };font-size:0.9rem;"
          ${slot.disabled ? 'disabled' : ''}
          title="${slot.label}"
        >${slot.label.split(' ')[0]}</button>
      `
        )
        .join('');

      gekozenTijd = '';
      submitBtn.disabled = true;

      slotsLijst.querySelectorAll('.slot-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          slotsLijst
            .querySelectorAll('.slot-btn')
            .forEach((b) => (b.style.outline = ''));
          btn.style.outline = '2.5px solid #007bff';
          gekozenTijd = btn.getAttribute('data-slot');
          submitBtn.disabled = false;
        });
      });
    } // Auto-select first available hour (not unavailable/red)
    if (uren.length) {
      const firstAvailableButton = urenLijst.querySelector(
        'button:not([disabled])'
      );
      if (firstAvailableButton) {
        firstAvailableButton.click();
      }
    }

    // Event listeners
    document.getElementById('speeddate-popup-close').onclick = () =>
      popup.remove();
    document.getElementById('cancel-speeddate').onclick = () => popup.remove();

    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });

    // Submit speeddate request
    submitBtn.addEventListener('click', async () => {
      if (!gekozenTijd) {
        alert('Selecteer een tijdslot');
        return;
      }

      const datetime = `${speeddateDate} ${gekozenTijd}:00`;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Aanvragen...';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#666';
        statusDiv.textContent = 'Speeddate aanvraag wordt verstuurd...';

        const response = await createSpeeddate(studentId, bedrijfId, datetime);

        statusDiv.style.color = '#28a745';
        statusDiv.textContent = `Speeddate aanvraag succesvol verstuurd naar ${fullName}!`;

        setTimeout(() => {
          popup.remove();
        }, 2000);
      } catch (error) {
        console.error('Error creating speeddate:', error);
        statusDiv.style.color = '#dc3545';
        statusDiv.textContent =
          'Er is een fout opgetreden bij het aanvragen van de speeddate. Probeer het opnieuw.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Aanvragen';
      }
    });
  } catch (error) {
    console.error('Error fetching speeddate data:', error);

    // Fallback popup without slot checking
    popup.innerHTML = `
      <div style="background:#fff;padding:2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:500px;width:90vw;min-width:300px;position:relative;">
        <button id="speeddate-popup-close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">×</button>
        
        <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:1.5rem;">
          <img src="${studentPhoto}" alt="Foto ${fullName}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:1rem;" onerror="this.src='${defaultStudentAvatar}'">
          <h2 style="margin-bottom:0.5rem;text-align:center;color:#333;">Speeddate Aanvragen</h2>
          <p style="margin-bottom:0.5rem;text-align:center;color:#666;">Vraag een speeddate aan met <strong>${fullName}</strong></p>
        </div>
        
        <p style="color:#dc3545;text-align:center;margin-bottom:1rem;">Kon beschikbaarheid niet laden. Probeer het later opnieuw.</p>
        
        <div style="display:flex;gap:1rem;">
          <button type="button" id="cancel-speeddate" style="flex:1;padding:0.8rem;background:#6b7280;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;">Sluiten</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    document.getElementById('speeddate-popup-close').onclick = () =>
      popup.remove();
    document.getElementById('cancel-speeddate').onclick = () => popup.remove();
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });
  }
}

export async function renderStudenten(rootElement, bedrijfData = {}) {
  // Load bedrijf data from sessionStorage if empty
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('bedrijfData');
      if (stored) bedrijfData = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing bedrijfData from sessionStorage:', e);
    }
  }

  // Try to get bedrijf data from API if still empty
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

  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-profile">Profiel</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      
      <div class="bedrijf-profile-main">        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="search-criteria" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link active">Studenten</button></li>
          </ul>
        </nav>
        
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">            <h1 class="bedrijf-profile-title">Matched Studenten</h1>
            
            <!-- Filter Controls and Color Legend combined -->
            <div class="studenten-filters" style="background:#f8fafc; padding:1.2rem; border-radius:14px; margin-bottom:2.2rem; box-shadow:0 2px 8px #0001; border:1.5px solid #e1e5e9;">
              <div style="display:flex;gap:2rem;align-items:start;">
                <!-- Search section -->
                <div style="flex:1;min-width:300px;">
                  <label for="student-zoek" style="font-weight:500;font-size:0.9rem;margin-bottom:0.2rem;display:block;">Zoeken</label>
                  <input id="student-zoek" type="text" placeholder="Zoek student op naam of email..." style="width:100%;padding:0.6rem;border:1.5px solid #e1e5e9;border-radius:8px;">
                </div>
                
                <!-- Color Legend section -->
                <div style="flex:2;min-width:400px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem;">
                    <label style="font-weight:500;font-size:0.9rem;margin:0;color:#374151;">Match Percentage Legenda</label>
                    <button id="toggle-legend" style="background:none;border:none;font-size:1rem;cursor:pointer;color:#6b7280;" title="Legenda in-/uitklappen">▼</button>
                  </div>
                  <div id="legend-content" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.6rem;">
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#10b981;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">90%+ Uitstekend</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#22c55e;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">80-89% Zeer goed</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#84cc16;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">70-79% Goed</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#eab308;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">60-69% Redelijk</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#f97316;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">50-59% Matig</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#ef4444;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">30-49% Zwak</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                      <div style="width:16px;height:16px;background:#6b7280;border-radius:3px;"></div>
                      <span style="font-size:0.8rem;">&lt;30% Zeer zwak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Students List -->
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
      width: 280px;
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
    }
    .studenten-filters label {
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
      display: block;
    }
    .studenten-filters input[type="checkbox"] {
      margin-right: 0.5rem;
    }
  `;
  document.head.appendChild(style);

  // Function to render students list
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
        // Convert match_percentage to number for proper formatting
        const matchPercentage = student.match_percentage
          ? Number(student.match_percentage)
          : 0;
        const formattedMatch = Number.isFinite(matchPercentage)
          ? matchPercentage.toFixed(0)
          : '0';

        // Get color scheme for this match percentage
        const colorScheme = getMatchColorScheme(matchPercentage);
        return `
          <div class="student-card" data-student-idx="${idx}" style="border-left: 4px solid ${
          colorScheme.cardBorder
        };">
            <div class="match-badge" style="background: ${
              colorScheme.background
            }; color: ${colorScheme.color}; border: 2px solid ${
          colorScheme.borderColor
        };" title="${colorScheme.label}">${formattedMatch}%</div>
            <img src="${photo}" alt="Foto ${fullName}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:1rem;" onerror="this.src='${defaultStudentAvatar}'">
            <h3 style="margin-bottom:0.5rem;text-align:center;">${fullName}</h3>
            <div style="font-size:0.9rem;color:#666;margin-bottom:0.3rem;">${student.opleiding_type} ${student.opleiding_naam}</div>
            <div style="font-size:0.85rem;color:#888;text-align:center;">
              <div>Functie: ${student.functie_matches || 0} | Opleiding: ${
          student.opleiding_matches || 0
        }</div>
              <div>Skills: ${student.skill_matches || 0}</div>
            </div>
            <div class="match-label" style="font-size:0.75rem;color:${
              colorScheme.background
            };font-weight:600;text-align:center;margin-top:0.5rem;">${
          colorScheme.label
        }</div>
          </div>
        `;
      })
      .join('');

    // Add click listeners to student cards
    document.querySelectorAll('.student-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const idx = card.getAttribute('data-student-idx');
        showStudentPopup(studentsToShow[idx]);
      });
    });
  }
  // Function to load students
  async function loadStudents() {
    try {
      // Use default values: suggestions = true, onlyNew = false
      const suggestions = true;
      const onlyNew = false;

      studenten = await fetchDiscoverStudenten(
        currentBedrijfId,
        suggestions,
        onlyNew
      );
      renderStudentsList();
    } catch (error) {
      console.error('Error loading students:', error);
      document.getElementById('studenten-list').innerHTML =
        '<div style="text-align:center;width:100%;color:#888;">Fout bij laden van studenten. Probeer opnieuw.</div>';
    }
  } // Initial load
  loadStudents();

  // Toggle legend functionality
  document.getElementById('toggle-legend')?.addEventListener('click', () => {
    const content = document.getElementById('legend-content');
    const toggle = document.getElementById('toggle-legend');
    if (content && toggle) {
      if (content.style.display === 'none') {
        content.style.display = 'grid';
        toggle.textContent = '▼';
        toggle.title = 'Legenda inklappen';
      } else {
        content.style.display = 'none';
        toggle.textContent = '▶';
        toggle.title = 'Legenda uitklappen';
      }
    }
  }); // Event listeners for filters
  document.getElementById('student-zoek')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = studenten.filter(
      (student) =>
        `${student.voornaam} ${student.achternaam}`
          .toLowerCase()
          .includes(searchTerm) ||
        student.contact_email.toLowerCase().includes(searchTerm)
    );
    renderStudentsList(filtered);
  });

  // Sidebar navigation
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'search-criteria':
          Router.navigate('/bedrijf/zoek-criteria');
          break;
        case 'speeddates':
          Router.navigate('/bedrijf/speeddates');
          break;
        case 'requests':
          Router.navigate('/bedrijf/speeddates-verzoeken');
          break;
        case 'studenten':
          Router.navigate('/bedrijf/studenten');
          break;
      }
    });
  });

  // Burger menu and other functionality
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

    document.addEventListener('click', (event) => {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });
  }

  // Profile button
  document.getElementById('nav-profile')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/bedrijf/bedrijf-profiel');
    });
  });

  document.getElementById('nav-settings')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
    import('./bedrijf-settings.js').then((module) => {
      module.showBedrijfSettingsPopup();
    });
  });

  document.getElementById('nav-logout')?.addEventListener('click', async () => {
    dropdown.classList.remove('open');
    const response = await logoutUser();
    console.log('Logout API response:', response);
    window.sessionStorage.removeItem('bedrijfData');
    window.sessionStorage.removeItem('authToken');
    window.sessionStorage.removeItem('userType');
    localStorage.setItem('darkmode', 'false');
    document.body.classList.remove('darkmode');
    Router.navigate('/');
  });

  document.getElementById('privacy-policy')?.addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });
  document.getElementById('contacteer-ons')?.addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });
}
