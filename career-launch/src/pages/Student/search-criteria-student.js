import { refreshToken } from '../../utils/auth-api.js';

/**
 * Centrale authenticated request (zoals in bedrijf)
 */
async function makeAuthenticatedRequest(url, options = {}) {
  let authToken = window.sessionStorage.getItem('authToken');
  if (!authToken) throw new Error('Geen auth token gevonden');

  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    }
  };

  let response = await fetch(url, requestOptions);
  if (response.status === 401) {
    const refreshResult = await refreshToken();
    if (refreshResult.success && refreshResult.accessToken) {
      requestOptions.headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
      response = await fetch(url, requestOptions);
    } else {
      throw new Error('Authenticatie mislukt - log opnieuw in');
    }
  }
  return response;
}

/**
 * Haal alle skills (en talen) op
 */
export async function fetchAllSkills() {
  try {
    const resp = await makeAuthenticatedRequest('https://api.ehb-match.me/skills', { method: 'GET' });
    if (!resp.ok) throw new Error('Kan skills niet ophalen');
    return await resp.json();
  } catch (err) {
    // Fallback skills indien gewenst (zoals bij bedrijf)
    return [
      { id: null, naam: 'JavaScript', type: 0 },
      { id: null, naam: 'Python', type: 0 },
      { id: null, naam: 'Nederlands', type: 1 },
      { id: null, naam: 'Engels', type: 1 }
    ];
  }
}

/**
 * Haal skills en talen van een student op
 */
export async function fetchStudentSkills(studentId) {
  try {
    const resp = await makeAuthenticatedRequest(`https://api.ehb-match.me/studenten/${studentId}/skills`, { method: 'GET' });
    if (!resp.ok) throw new Error('Kan student skills niet ophalen');
    return await resp.json();
  } catch (err) {
    return [];
  }
}

/**
 * Haal functies van een student op
 */
export async function fetchStudentFuncties(studentId) {
  try {
    const resp = await makeAuthenticatedRequest(`https://api.ehb-match.me/studenten/${studentId}/functies`, { method: 'GET' });
    if (!resp.ok) throw new Error('Kan functies niet ophalen');
    return await resp.json();
  } catch (err) {
    return [];
  }
}

/**
 * Voeg nieuwe skill of taal toe aan skills database (type: 0 = skill, 1 = taal)
 */
export async function addSkillOrTaal(name, isTaal = 0) {
  try {
    const payload = { naam: name, type: isTaal };
    const resp = await makeAuthenticatedRequest('https://api.ehb-match.me/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const errorText = await resp.text();
      if (resp.status === 400 || resp.status === 409) {
        // Skill bestaat waarschijnlijk al, haal alle skills opnieuw op
        const all = await fetchAllSkills();
        return all.find(s => s.naam.toLowerCase() === name.toLowerCase() && s.type === isTaal);
      }
      throw new Error('Skill/Taal toevoegen mislukt: ' + errorText);
    }
    return (await resp.json()).skill;
  } catch (err) {
    throw new Error('Skill/Taal toevoegen mislukt: ' + err.message);
  }
}

/**
 * Zet alle skills/talen voor een student (overschrijft bestaande)
 */
export async function setStudentSkills(studentId, skillIds) {
  if (!Array.isArray(skillIds)) throw new Error('skillIds is geen array!');
  // Sta id === 0 toe (zoals API verwacht)
  const ids = skillIds.filter(id => typeof id === 'number' && Number.isFinite(id) && id >= 0);
  if (ids.length === 0) throw new Error('Je moet minstens één skill of taal selecteren.');
  const payload = { skills: ids };
  try {
    const resp = await makeAuthenticatedRequest(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error('Skills setten faalt: ' + txt);
    }
    return await resp.json();
  } catch (err) {
    throw new Error('Skills setten faalt: ' + err.message);
  }
}

/**
 * Zet alle functies voor een student (overschrijft bestaande)
 */
export async function setStudentFuncties(studentId, functieIds) {
  if (!Array.isArray(functieIds)) throw new Error('functieIds is geen array!');
  // Remove dups & maak platte array
  const cleanFuncties = [...new Set(functieIds.flat().filter(id => typeof id === 'number' && id > 0))];
  if (cleanFuncties.length === 0) throw new Error('Je moet minstens één functie selecteren.');
  const payload = { functies: cleanFuncties }; // GEEN dubbele array!
  console.log('Functies naar backend (platte array):', JSON.stringify(payload));
  try {
    const resp = await makeAuthenticatedRequest(
      `https://api.ehb-match.me/studenten/${studentId}/functies`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error('Functies setten faalt: ' + txt);
    }
    return await resp.json();
  } catch (err) {
    throw new Error('Functies setten faalt: ' + err.message);
  }
}

/**
 * Verwijder een skill van een student
 */
export async function removeStudentSkill(studentId, skillId) {
  try {
    const resp = await makeAuthenticatedRequest(
      `https://api.ehb-match.me/studenten/${studentId}/skills/${skillId}`,
      { method: 'DELETE' }
    );
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error('Skill verwijderen faalt: ' + txt);
    }
    return await resp.json();
  } catch (err) {
    throw new Error('Skill verwijderen faalt: ' + err.message);
  }
}

/**
 * Verwijder een functie van een student
 */
export async function removeStudentFunctie(studentId, functieId) {
  try {
    const resp = await makeAuthenticatedRequest(
      `https://api.ehb-match.me/studenten/${studentId}/functies/${functieId}`,
      { method: 'DELETE' }
    );
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error('Functie verwijderen faalt: ' + txt);
    }
    return await resp.json();
  } catch (err) {
    throw new Error('Functie verwijderen faalt: ' + err.message);
  }
}

import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';

const FUNCTIES = [
  { id: 1, naam: 'Fulltime' },
  { id: 2, naam: 'Parttime' },
  { id: 3, naam: 'Stagiair(e)' },
];

/**
 * Inject CSS styles for criteria chips and autocomplete
 */
function injectStyle() {
  if (document.getElementById('criteria-chips-style')) return;
  const style = document.createElement('style');
  style.id = 'criteria-chips-style';
  style.textContent = `
    .chip { display:inline-flex;align-items:center;background:#f2f2f7;border-radius:20px;padding:0.35em 0.9em;margin:0 0.4em 0.4em 0;font-size:0.98em;color:#2364aa;border:1.5px solid #e1e5e9;box-shadow:0 1px 3px #00000008; }
    .chip-remove { cursor:pointer;color:#888;font-size:1.15em;margin-left:0.4em; }
    .chip-remove:hover { color:#d33; }
    .autocomplete-dropdown { position:absolute;z-index:10;background:#fff;border:1px solid #e1e5e9;border-radius:6px;box-shadow:0 2px 8px #0001;max-height:180px;overflow:auto;width:180px; }
    .suggestie { padding:0.4em 0.8em;cursor:pointer; }
    .suggestie:hover { background:#e6f0fa; }
  `;
  document.head.appendChild(style);
}

/**
 * Render chips for skills or languages
 */
function renderChips(list, allItems, containerId, readonly, onRemove) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = list.map(id => {
    const item = allItems.find(s => s.id === id);
    if (!item) return '';
    return `<span class="chip">${item.naam}${!readonly ? `<span class="chip-remove" data-id="${id}">&#10005;</span>` : ''}</span>`;
  }).join('');
  if (!readonly) {
    container.querySelectorAll('.chip-remove').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        onRemove(Number(btn.getAttribute('data-id')));
      };
    });
  }
}

/**
 * Render the search criteria student view
 */
export async function renderSearchCriteriaStudent(
  root, studentData = {}, readonly = true, allSkills = null, allTalen = null,
  localSkillsParam = null, localTalenParam = null, localFunctiesParam = null
) {
  injectStyle();
  // --- State ophalen ---
  if (!studentData || (!studentData.id && !studentData.gebruiker_id)) {
    const stored = sessionStorage.getItem('studentData');
    if (stored) studentData = JSON.parse(stored);
    else { alert('Geen student info gevonden. Log opnieuw in.'); return; }
  }
  // Gebruik altijd de id uit de API (id of gebruiker_id)
  const studentId = studentData.id || studentData.gebruiker_id;
  console.log('Gebruikte studentId:', studentId, 'studentData:', studentData); // Debug
  if (!studentId) { alert('Student ID ontbreekt!'); return; }

  // Data ophalen
  if (!allSkills || !allTalen) {
    const all = await fetchAllSkills();
    allSkills = all.filter(s => s.type === 0);
    allTalen = all.filter(s => s.type === 1);
  }
  // Haal skills/talen van student (type 0/1 apart), alleen ID's
  const allStudentSkills = await fetchStudentSkills(studentId);
  const studentSkills = allStudentSkills.filter(s => s.type === 0).map(s => s.id);
  const studentTalen  = allStudentSkills.filter(s => s.type === 1).map(s => s.id);
  const studentFuncties = (await fetchStudentFuncties(studentId)).map(f => f.id);

  // ---- Local state (alleen in edit mode gemuteerd) ----
  let localSkills = localSkillsParam ?? [...studentSkills];
  let localTalen = localTalenParam ?? [...studentTalen];
  let localFuncties = localFunctiesParam ?? [...studentFuncties];
  let localAllSkills = [...allSkills]; // kan tijdelijke nieuwe skills bevatten (neg ID)
  let localAllTalen = [...allTalen];   // idem

  // ----- UI rendering -----
  root.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger" type="button">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown">
          <li><button id="nav-profile" type="button">Profiel</button></li>
          <li><button id="nav-settings" type="button">Instellingen</button></li>
          <li><button id="nav-logout" type="button">Log out</button></li>
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
          <div class="student-profile-form-container" style="position:relative;">
            <button id="btn-to-profile" type="button" class="skills-btn" style="position:absolute;top:0;left:0;margin:0.2em 0 0 0.2em;z-index:2;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2364aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.5em;"><path d="M15 18l-6-6 6-6"/></svg>
              Terug naar profiel
            </button>
            <div style="height:2.2em;"></div>
            <h1 class="student-profile-title">Skills & voorkeuren</h1>
            <form id="criteriaForm" class="criteria-form" autocomplete="off">
              <fieldset class="search-fieldset">
                <legend>Ik zoek</legend>
                <div class="checkbox-group">
                  ${FUNCTIES.map(f => `
                    <label class="checkbox-option">
                      <input type="radio" name="jobType" value="${f.id}" ${localFuncties.includes(f.id) ? 'checked' : ''} onchange="this.blur();">
                      <span>${f.naam}</span>
                    </label>
                  `).join('')}
                </div>
              </fieldset>
              <fieldset class="search-fieldset">
                <legend>Mijn Skills</legend>
                <div id="skills-chips" class="chips-row"></div>
                <div class="add-custom-wrapper" style="position:relative; margin-top: 1em;">
                  <input type="text" id="skill-input" placeholder="Andere skill..." class="form-input" style="width:180px;" autocomplete="off"/>
                  <div id="skill-suggesties" class="autocomplete-dropdown"></div>
                  <button id="add-skill-btn" class="add-btn" type="button">+ Toevoegen</button>
                </div>
              </fieldset>
              <fieldset class="search-fieldset">
                <legend>Mijn Talen</legend>
                <div id="talen-chips" class="chips-row"></div>
                <div class="add-custom-wrapper" style="position:relative; margin-top: 1em;">
                  <input type="text" id="taal-input" placeholder="Andere taal..." class="form-input" style="width:180px;" autocomplete="off"/>
                  <div id="taal-suggesties" class="autocomplete-dropdown"></div>
                  <button id="add-taal-btn" class="add-btn" type="button">+ Toevoegen</button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Chips rendering met verwijderknop ---
  renderChips(localSkills, localAllSkills, 'skills-chips', true, async id => {
    const nieuweSkills = localSkills.filter(sid => sid !== id);
    const alleIds = [...new Set([...nieuweSkills, ...localTalen])];
    await setStudentSkills(studentId, alleIds);
    renderSearchCriteriaStudent(
      root, studentData, true, localAllSkills, localAllTalen,
      nieuweSkills, localTalen, localFuncties
    );
  });
  renderChips(localTalen, localAllTalen, 'talen-chips', true, async id => {
    const nieuweTalen = localTalen.filter(tid => tid !== id);
    const alleIds = [...new Set([...localSkills, ...nieuweTalen])];
    await setStudentSkills(studentId, alleIds);
    renderSearchCriteriaStudent(
      root, studentData, true, localAllSkills, localAllTalen,
      localSkills, nieuweTalen, localFuncties
    );
  });

  // Direct updaten bij click op functie-radio:
  document.querySelectorAll('input[name="jobType"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const newId = parseInt(e.target.value, 10);
      try {
        await setStudentFuncties(studentId, [newId]);
        renderSearchCriteriaStudent(root, studentData, true, allSkills, allTalen, localSkills, localTalen, [newId]);
      } catch (err) {
        alert('Fout bij aanpassen functie: ' + err.message);
      }
    });
  });

  // Add skill (direct sync, geen lokale array)
  const addSkillBtn = document.getElementById('add-skill-btn');
  if (addSkillBtn) {
    addSkillBtn.onclick = async e => {
      e.preventDefault();
      const input = document.getElementById('skill-input');
      const value = input.value.trim();
      if (!value) return;
      let bestaande = allSkills.find(skill => skill.naam.toLowerCase() === value.toLowerCase());
      let id;
      if (bestaande) {
        id = bestaande.id;
      } else {
        const nieuwSkill = await addSkillOrTaal(value, 0);
        id = nieuwSkill.id;
        allSkills.push(nieuwSkill);
      }
      // Haal huidige skills/talen van student op
      const allStudentSkills = await fetchStudentSkills(studentId);
      const studentTalen = allStudentSkills.filter(s => s.type === 1).map(s => s.id);
      const alleIds = [...new Set([id, ...studentTalen])];
      await setStudentSkills(studentId, alleIds);
      renderSearchCriteriaStudent(root, studentData, true, allSkills, allTalen, null, null, localFuncties);
      input.value = '';
    };
  }
  // Add taal (direct sync, geen lokale array)
  const addTaalBtn = document.getElementById('add-taal-btn');
  if (addTaalBtn) {
    addTaalBtn.onclick = async e => {
      e.preventDefault();
      const input = document.getElementById('taal-input');
      const value = input.value.trim();
      if (!value) return;
      let bestaande = allTalen.find(taal => taal.naam.toLowerCase() === value.toLowerCase());
      let id;
      if (bestaande) {
        id = bestaande.id;
      } else {
        const nieuwTaal = await addSkillOrTaal(value, 1);
        id = nieuwTaal.id;
        allTalen.push(nieuwTaal);
      }
      // Haal huidige skills/talen van student op
      const allStudentSkills = await fetchStudentSkills(studentId);
      const studentSkills = allStudentSkills.filter(s => s.type === 0).map(s => s.id);
      const alleIds = [...new Set([...studentSkills, id])];
      await setStudentSkills(studentId, alleIds);
      renderSearchCriteriaStudent(root, studentData, true, allSkills, allTalen, null, null, localFuncties);
      input.value = '';
    };
  }
  // Autocomplete skills (direct sync)
  const skillInput = document.getElementById('skill-input');
  const skillSuggestiesDiv = document.getElementById('skill-suggesties');
  if (skillInput && skillSuggestiesDiv) {
    skillInput.addEventListener('input', () => {
      const query = skillInput.value.toLowerCase();
      const filtered = allSkills.filter(s => s.naam.toLowerCase().includes(query));
      if (query && filtered.length > 0) {
        skillSuggestiesDiv.innerHTML = filtered.map(s => `<div class="suggestie" data-id="${s.id}">${s.naam}</div>`).join('');
        skillSuggestiesDiv.style.display = 'block';
      } else {
        skillSuggestiesDiv.innerHTML = '';
        skillSuggestiesDiv.style.display = 'none';
      }
    });
    skillSuggestiesDiv.addEventListener('click', async e => {
      const target = e.target.closest('.suggestie');
      if (!target) return;
      const id = parseInt(target.getAttribute('data-id'));
      // Haal huidige skills/talen van student op
      const allStudentSkills = await fetchStudentSkills(studentId);
      const studentTalen = allStudentSkills.filter(s => s.type === 1).map(s => s.id);
      const alleIds = [...new Set([id, ...studentTalen])];
      await setStudentSkills(studentId, alleIds);
      skillInput.value = '';
      skillSuggestiesDiv.innerHTML = '';
      skillSuggestiesDiv.style.display = 'none';
      renderSearchCriteriaStudent(root, studentData, true, allSkills, allTalen, null, null, localFuncties);
    });
    document.addEventListener('click', e => {
      if (!skillSuggestiesDiv.contains(e.target) && e.target !== skillInput) {
        skillSuggestiesDiv.innerHTML = '';
        skillSuggestiesDiv.style.display = 'none';
      }
    });
  }
  // Autocomplete talen (direct sync)
  const taalInput = document.getElementById('taal-input');
  const taalSuggestiesDiv = document.getElementById('taal-suggesties');
  if (taalInput && taalSuggestiesDiv) {
    taalInput.addEventListener('input', () => {
      const query = taalInput.value.toLowerCase();
      const filtered = allTalen.filter(t => t.naam.toLowerCase().includes(query));
      if (query && filtered.length > 0) {
        taalSuggestiesDiv.innerHTML = filtered.map(t => `<div class="suggestie" data-id="${t.id}">${t.naam}</div>`).join('');
        taalSuggestiesDiv.style.display = 'block';
      } else {
        taalSuggestiesDiv.innerHTML = '';
        taalSuggestiesDiv.style.display = 'none';
      }
    });
    taalSuggestiesDiv.addEventListener('click', async e => {
      const target = e.target.closest('.suggestie');
      if (!target) return;
      const id = parseInt(target.getAttribute('data-id'));
      // Haal huidige skills/talen van student op
      const allStudentSkills = await fetchStudentSkills(studentId);
      const studentSkills = allStudentSkills.filter(s => s.type === 0).map(s => s.id);
      const alleIds = [...new Set([...studentSkills, id])];
      await setStudentSkills(studentId, alleIds);
      taalInput.value = '';
      taalSuggestiesDiv.innerHTML = '';
      taalSuggestiesDiv.style.display = 'none';
      renderSearchCriteriaStudent(root, studentData, true, allSkills, allTalen, null, null, localFuncties);
    });
    document.addEventListener('click', e => {
      if (!taalSuggestiesDiv.contains(e.target) && e.target !== taalInput) {
        taalSuggestiesDiv.innerHTML = '';
        taalSuggestiesDiv.style.display = 'none';
      }
    });
  }
  // Sidebar navigatie
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then(module => {
        const Router = module.default;
        switch (route) {
          case 'search': Router.navigate('/student/zoek-criteria'); break;
          case 'speeddates': Router.navigate('/student/student-speeddates'); break;
          case 'requests': Router.navigate('/student/student-speeddates-verzoeken'); break;
          case 'bedrijven': Router.navigate('/student/bedrijven'); break;
          case 'qr': Router.navigate('/student/student-qr-popup'); break;
        }
      });
    });
  });
  // Hamburger menu
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    dropdown.classList.remove('open');
    burger.addEventListener('click', event => {
      event.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function (event) {
      if (dropdown.classList.contains('open') && !dropdown.contains(event.target) && event.target !== burger) {
        dropdown.classList.remove('open');
      }
    });
    document.getElementById('nav-settings').addEventListener('click', () => {
      dropdown.classList.remove('open');
      showSettingsPopup();
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      window.sessionStorage.removeItem('studentData');
      window.sessionStorage.removeItem('authToken');
      window.sessionStorage.removeItem('userType');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(root);
    });
    const navProfileBtn = document.getElementById('nav-profile');
    if (navProfileBtn) {
      navProfileBtn.addEventListener('click', () => {
        dropdown.classList.remove('open');
        import('../../router.js').then(module => {
          const Router = module.default;
          Router.navigate('/student/student-profiel');
        });
      });
    }
  }
}
