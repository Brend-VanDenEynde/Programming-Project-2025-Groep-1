import logoIcon from '../../icons/favicon-32x32.png';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';

// ... [alle utility functies uit jouw code hierboven, niet aangepast] ...
// Skills ophalen: false = skill, true = taal
async function fetchAllSkills() {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch('https://api.ehb-match.me/skills', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) throw new Error('Kan skills niet ophalen');
  return await resp.json(); // [{id, naam, type}]
}

// Skill/taal toevoegen: type is boolean: false (skill), true (taal)
async function addSkillOrTaal(name, isTaal = 0) {
  const token = sessionStorage.getItem('authToken');
  console.log('Toevoegen skill/taal:', { naam: name, type: isTaal });
  const resp = await fetch('https://api.ehb-match.me/skills', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ naam: name, type: isTaal }), // type: false/true
  });
  const text = await resp.text();
  if (!resp.ok) {
    console.error('API error response:', text);
    throw new Error('Skill/Taal toevoegen mislukt: ' + text);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error('API gaf geen geldige JSON: ' + text);
  }
  return json.skill || json; // meestal { id, naam, type }
}

// Skill/taal verwijderen van student
async function removeSkillFromStudent(studentId, skillId) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(
    `https://api.ehb-match.me/studenten/${studentId}/skills/${skillId}`,
    {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    }
  );
  const text = await resp.text();
  if (!resp.ok) {
    console.error('Fout bij verwijderen skill:', text);
    throw new Error(`Skill met ID ${skillId} kon niet verwijderd worden: ${text}`);
  }
  return true;
}

// Haal alle skills/talen van de student op
async function fetchStudentSkills(studentId) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(
    `https://api.ehb-match.me/studenten/${studentId}/skills`,
    {
      headers: { Authorization: 'Bearer ' + token },
    }
  );
  const text = await resp.text();
  if (!resp.ok) {
    console.error('API error response:', text);
    throw new Error('Kan student skills niet ophalen: ' + text);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error('API gaf geen geldige JSON: ' + text);
  }
  return json; // [{id, naam, type}]
}

// Gecombineerde utility: haal skills/talen én functies tegelijk op
async function fetchStudentSkillsAndFuncties(studentId) {
  const [studentSkillsAll, studentFuncties] = await Promise.all([
    fetchStudentSkills(studentId),
    fetchStudentFuncties(studentId)
  ]);
  
  return {
    skills: studentSkillsAll.filter(s => s.type === 0).map(s => s.id),
    talen: studentSkillsAll.filter(s => s.type === 1).map(s => s.id),
    functies: studentFuncties.map(f => f.id),
    allSkillsData: studentSkillsAll,
    allFunctiesData: studentFuncties
  };
}

// Skills/talen in bulk instellen
async function setStudentSkills(studentId, skillIds) {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    alert('Je bent niet ingelogd of je sessie is verlopen. Log opnieuw in.');
    import('../login.js').then(({ renderLogin }) => renderLogin(document.body));
    throw new Error('Geen auth token aanwezig (401)');
  }
  const huidigeSkills = await fetchStudentSkills(studentId);
  const huidigeSkillIds = huidigeSkills.map((s) => s.id);

  // Skills verwijderen (alle oude)
  for (const id of huidigeSkillIds) {
    await removeSkillFromStudent(studentId, id);
  }

  // Skills toevoegen (alle nieuwe)
  if (!skillIds || skillIds.length === 0) {
    console.warn('Skills array is leeg; niets gepost.');
    return [];
  }

  const resp = await fetch(
    `https://api.ehb-match.me/studenten/${studentId}/skills`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills: skillIds }),
    }
  );

  const text = await resp.text();
  console.log('Status:', resp.status, 'Response:', text);

  if (!resp.ok) {
    console.error('API error response:', text);
    throw new Error('Skills instellen mislukt: ' + text);
  }

  return JSON.parse(text).skills;
}

// Debug: voeg skills één voor één toe om te zien welke ID crasht
async function debugSetStudentSkillsIndividueel(studentId, skillIds) {
  const token = sessionStorage.getItem('authToken');
  for (const id of skillIds) {
    try {
      const resp = await fetch(
        `https://api.ehb-match.me/studenten/${studentId}/skills`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ skills: [id] }),
        }
      );
      const text = await resp.text();
      console.log(`Skill ${id}: status ${resp.status}`, text);
      if (!resp.ok) {
        alert(`Skill ${id} toevoegen faalt: ${text}`);
      }
    } catch (e) {
      console.error(`Skill ${id} exception:`, e);
    }
  }
}

// Sync skills/talen van student met de aangevinkte waardes (in bulk)
async function syncStudentSkills(studentId, checkedSkillIds, checkedTaalIds) {
  // Debug: toon alle ID's en types
  const allIds = [...checkedSkillIds, ...checkedTaalIds].map(Number);
  console.log('All IDs naar API:', allIds, allIds.map(x => typeof x));
  await setStudentSkills(studentId, allIds);
}

// Functies (API-conform: id = 1,2,3)
const functies = [
  { id: 1, naam: 'Fulltime' },
  { id: 2, naam: 'Parttime' },
  { id: 3, naam: 'Stagiair(e)' },
];

// Functies API helper
async function updateFunctiesForStudent(studentId, selectedFunctieIds) {
  if (!selectedFunctieIds || selectedFunctieIds.length === 0) {
    selectedFunctieIds = [];
  }
  const token = sessionStorage.getItem('authToken');
  // Haal huidige functies op
  const resp = await fetch(
    `https://api.ehb-match.me/studenten/${studentId}/functies`,
    {
      headers: { Authorization: 'Bearer ' + token },
    }
  );
  if (!resp.ok) throw new Error('Kan functies niet ophalen');
  const huidigeFuncties = await resp.json();
  const huidigeIds = huidigeFuncties.map((f) => f.id);
  // Bepaal toe te voegen en te verwijderen functies
  const toeTeVoegen = selectedFunctieIds.filter((id) => !huidigeIds.includes(id));
  const teVerwijderen = huidigeIds.filter((id) => !selectedFunctieIds.includes(id));
  // Verwijder oude
  for (const id of teVerwijderen) {
    await fetch(
      `https://api.ehb-match.me/studenten/${studentId}/functies/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
  }
  // Voeg nieuwe toe
  if (!Array.isArray(toeTeVoegen)) {
    console.warn('Toe te voegen is geen array:', toeTeVoegen);
  }
  console.log('Type van toeTeVoegen:', Array.isArray(toeTeVoegen), toeTeVoegen);
  if (toeTeVoegen.length > 0) {
    // Flatten als het een nested array is
    const functiesBody = { functies: Array.isArray(toeTeVoegen[0]) ? toeTeVoegen[0] : toeTeVoegen };
    console.log('Functies body =', JSON.stringify(functiesBody));
    console.log('Verstuur naar API:', {
      studentId,
      functiesBody
    });
    const resp = await fetch(
      `https://api.ehb-match.me/studenten/${studentId}/functies`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(functiesBody), // ✅ juiste key
      }
    );
    const text = await resp.text();
    console.log('API response:', resp.status, text);
  } else {
    console.log('Geen functies om toe te voegen, POST wordt niet uitgevoerd.');
  }
}

// Functies ophalen van student
async function fetchStudentFuncties(studentId) {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    console.warn('GEEN token gevonden in sessionStorage!');
  }
  console.log('fetchStudentFuncties: studentId:', studentId, 'token:', token);
  const resp = await fetch(`https://api.ehb-match.me/studenten/${studentId}/functies`, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`Fout bij ophalen functies: ${resp.status} - ${errText}`);
    throw new Error('Kan functies niet ophalen');
  }
  return await resp.json(); // [{ id, naam }]
}

// ---- HOOFDFUNCTIE ----
export async function renderSearchCriteriaStudent(
  rootElement,
  studentData = {},
  readonlyMode = true,
  allSkillsFromParent = null,
  allTalenFromParent = null
) {
  // Patch: Altijd proberen de studentData te laden uit sessionStorage
  if (!studentData || (!studentData.id && !studentData.gebruiker_id)) {
    const stored = sessionStorage.getItem('studentData');
    if (stored) {
      studentData = JSON.parse(stored);
    } else {
      alert('Geen student info gevonden. Log opnieuw in.');
      return;
    }
  }
  // Patch: altijd één variabele voor ID
  const studentId = studentData.id || studentData.gebruiker_id;
  if (!studentId) {
    alert('Student ID ontbreekt! Probeer opnieuw in te loggen.');
    return;
  }
  // Direct laden zonder setTimeout om race conditions te voorkomen
  // VERWIJDERD: rootElement.innerHTML = ... (oude, te vroege render)

  // --- VERVANGEN BLOK: actuele data uit API halen ---
  let allSkills = allSkillsFromParent,
      allTalen = allTalenFromParent,
      alleFuncties = [
        { id: 1, naam: 'Fulltime' },
        { id: 2, naam: 'Parttime' },
        { id: 3, naam: 'Stagiair(e)' }
      ],
      studentFunctieIds = [];

    try {
      // Alleen ophalen als niet meegegeven (eerste keer laden)
      if (!allSkills || !allTalen) {
        const all = await fetchAllSkills();
        allSkills = all.filter((s) => s.type === 0); // Skills
        allTalen = all.filter((s) => s.type === 1); // Talen
      }

      // Skills/talen EN functies van student ophalen & in studentData zetten
      const studentDataRefresh = await fetchStudentSkillsAndFuncties(studentId);
      studentData.skills = studentDataRefresh.skills;
      studentData.talen = studentDataRefresh.talen;
      studentData.functies = studentDataRefresh.functies;
      studentFunctieIds = studentDataRefresh.functies;
    } catch (e) {
      rootElement.innerHTML = `<div style="color:red">Fout bij ophalen skills/talen/functies: ${e.message}</div>`;
      return;
    }

    // Dynamisch radiobuttons genereren
    const radiobuttonsHtml = alleFuncties
      .map(
        (f) => `
        <label class="checkbox-option">
          <input type="radio" name="jobType" value="${f.id}" ${
            studentFunctieIds.includes(f.id) ? 'checked' : ''
          } ${readonlyMode ? 'disabled' : ''}>
          <span>${f.naam}</span>
        </label>
      `
      )
      .join('');

    if (!studentData.skills) studentData.skills = [];
    if (!studentData.talen) studentData.talen = [];
    if (!studentData.zoekType) studentData.zoekType = '';

    function isChecked(id, list) {
      return list.map(Number).includes(Number(id));
    }    // Alleen skills/talen van de student tonen (niet complete lijst!)
    function renderCheckboxes(list, name, readonlyMode = true) {
      // Toon alleen items die in de lijst zitten (checked state altijd true)
      return list.map(item => `
        <label class="checkbox-option">
          <input type="checkbox" name="${name}" value="${item.id}" checked ${readonlyMode ? 'disabled' : ''}>
          <span>${item.naam}</span>
        </label>
      `).join('');
    }

    rootElement.innerHTML = `
      <div class="student-profile-container">
        <header class="student-profile-header">
          <div class="logo-section">
            <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
            <span>EhB Career Launch</span>
          </div>          <button id="burger-menu" class="student-profile-burger" type="button">☰</button>
          <ul id="burger-dropdown" class="student-profile-dropdown">
            <li><button id="nav-profile" type="button">Profiel</button></li>
            <li><button id="nav-settings" type="button">Instellingen</button></li>
            <li><button id="nav-logout" type="button">Log out</button></li>
          </ul>
        </header>
        <div class="student-profile-main">
          <nav class="student-profile-sidebar">
            <ul>              <li><button data-route="search" class="sidebar-link active" type="button">Zoek-criteria</button></li>
              <li><button data-route="speeddates" class="sidebar-link" type="button">Speeddates</button></li>
              <li><button data-route="requests" class="sidebar-link" type="button">Speeddates-verzoeken</button></li>
              <li><button data-route="bedrijven" class="sidebar-link" type="button">Bedrijven</button></li>
              <li><button data-route="qr" class="sidebar-link" type="button">QR-code</button></li>
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
                    ${radiobuttonsHtml}
                  </div>
                </fieldset>
                <fieldset class="search-fieldset">
                  <legend>Mijn Skills</legend>
                  <div class="checkbox-group" id="skills-list">
                    ${renderCheckboxes(allSkills.filter(s => studentData.skills.includes(s.id)), 'skills', readonlyMode)}
                  </div>
                  ${
                    !readonlyMode
                      ? `<div class="add-custom-wrapper" style="position:relative; margin-top: 1em;">
                            <input type="text" id="skill-andere-text" placeholder="Andere skill..." class="form-input" style="width:180px;" autocomplete="off"/>
                            <div id="skill-suggesties" class="autocomplete-dropdown"></div>
                            <div id="selected-skills-chips" class="chips-row"></div>
                            <button id="add-skill-btn" class="add-btn" type="button">+ Toevoegen</button>
                        </div>`
                      : ''
                  }
                </fieldset>
                <fieldset class="search-fieldset">
                  <legend>Mijn Talen</legend>
                  <div class="checkbox-group" id="talen-list">
                    ${renderCheckboxes(allTalen.filter(t => studentData.talen.includes(t.id)), 'talen', readonlyMode)}
                  </div>
                  ${
                    !readonlyMode
                      ? `<div class="add-custom-wrapper" style="position:relative; margin-top: 1em;">
                            <input type="text" id="taal-andere-text" placeholder="Andere taal..." class="form-input" style="width:180px;" autocomplete="off"/>
                            <div id="taal-suggesties" class="autocomplete-dropdown"></div>
                            <div id="selected-talen-chips" class="chips-row"></div>
                            <button id="add-taal-btn" class="add-btn" type="button">+ Toevoegen</button>
                        </div>`
                      : ''
                  }
                </fieldset>
                <div class="student-profile-buttons">
                ${
                  readonlyMode
                    ? `<button id="btn-edit" type="button" class="student-profile-btn student-profile-btn-secondary">EDIT</button>`
                    : `
                  <button id="btn-save" type="submit" class="student-profile-btn student-profile-btn-primary">SAVE</button>
                  <button id="btn-reset" type="button" class="student-profile-btn student-profile-btn-secondary">CLEAR</button>
                  <button id="btn-cancel" type="button" class="student-profile-btn student-profile-btn-secondary">CANCEL</button>
                `
                }
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    // Voeg event toe voor terugknop naar profiel (router integratie)
    const btnToProfile = document.getElementById('btn-to-profile');
    if (btnToProfile) {
      btnToProfile.onclick = function(e) {
        e.preventDefault();
        if (window.appRouter && typeof window.appRouter.navigate === 'function') {
          window.appRouter.navigate('/student/student-profiel');
        } else {
          window.location.pathname = '/student/student-profiel';
        }
      };
    }    // Helper: fetch actuele data en render in readonly
    async function fetchAndRenderReadonly() {
      const studentDataRefresh = await fetchStudentSkillsAndFuncties(studentId);
      studentData.skills = studentDataRefresh.skills;
      studentData.talen = studentDataRefresh.talen;
      studentData.functies = studentDataRefresh.functies;
      // BELANGRIJK: geef arrays NIET door - we willen fresh data uit API bij cancel/save
      renderSearchCriteriaStudent(rootElement, studentData, true);
    }// --- Interactie (EVENTS) ---
    const form = document.getElementById('criteriaForm');
    if (form) {
      // Globale preventDefault: voorkomt ALLE browser submits behalve expliciet via JS
      form.addEventListener('submit', e => e.preventDefault());
      // --- Chips rendering functie ---
      function renderSelectedSkillsChips(skills, selectedIds, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const selected = skills.filter(s => selectedIds.includes(s.id));        container.innerHTML = selected.map(s =>
          `<span class="chip">${s.naam}<span class="chip-remove" data-id="${s.id}" title="Verwijder">&#10005;</span></span>`
        ).join('');
        
        // Event: remove chip
        container.querySelectorAll('.chip-remove').forEach(btn => {          btn.onclick = (e) => {
            e.preventDefault(); // voorkomt form submit
            e.stopPropagation(); // voorkomt event bubbling
            e.stopImmediatePropagation(); // voorkomt alle andere handlers
            const id = Number(btn.getAttribute('data-id'));
            const idx = selectedIds.indexOf(id);
            if (idx !== -1) selectedIds.splice(idx, 1);
            renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen);
          };
        });
      } // Einde renderSelectedSkillsChips functie

      // EDIT
      const editBtn = document.getElementById('btn-edit');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.preventDefault(); // voorkomt form submit
          renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen);
        });
      }      // CLEAR (was reset): alles uitvinken, geen API-call
      const clearBtn = document.getElementById('btn-reset');
      if (clearBtn) {
        clearBtn.textContent = 'CLEAR';
        clearBtn.onclick = function(e) {
          e.preventDefault();
          form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => el.checked = false);
          studentData.skills = [];
          studentData.talen = [];
          studentData.functies = [];
          renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen);
        };
      }// CANCEL
      const cancelBtn = document.getElementById('btn-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', async (e) => {
          e.preventDefault(); // voorkomt form submit
          await fetchAndRenderReadonly();
        });      }// SAVE - eerst nieuwe items aanmaken, dan alles opslaan
      const saveBtn = document.getElementById('btn-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation(); // voorkomt alle andere handlers
          
          // Verzamel alle aangevinkte skills/talen uit checkboxes
          let checkedSkills = Array.from(
            form.querySelectorAll('input[name="skills"]:checked')
          ).map((i) => Number(i.value));
          let checkedTalen = Array.from(
            form.querySelectorAll('input[name="talen"]:checked')
          ).map((i) => Number(i.value));
          
          // 1. Nieuwe skills aanmaken (negatieve IDs)
          const nieuweSkills = checkedSkills.filter(id => id < 0).map(tempId => 
            allSkills.find(s => s.id === tempId)
          );
          for (const skill of nieuweSkills) {
            try {
              const nieuwSkill = await addSkillOrTaal(skill.naam, 0);
              // Update IDs overal
              const oldId = skill.id;
              allSkills = allSkills.map(s => s.id === oldId ? nieuwSkill : s);
              checkedSkills = checkedSkills.map(id => id === oldId ? nieuwSkill.id : id);
              studentData.skills = studentData.skills.map(id => id === oldId ? nieuwSkill.id : id);
            } catch (e) {
              alert('Skill aanmaken mislukt: ' + e.message);
              return;
            }
          }
          
          // 2. Nieuwe talen aanmaken (negatieve IDs)
          const nieuweTalen = checkedTalen.filter(id => id < 0).map(tempId => 
            allTalen.find(t => t.id === tempId)
          );
          for (const taal of nieuweTalen) {
            try {
              const nieuweTaal = await addSkillOrTaal(taal.naam, 1);
              // Update IDs overal
              const oldId = taal.id;
              allTalen = allTalen.map(t => t.id === oldId ? nieuweTaal : t);
              checkedTalen = checkedTalen.map(id => id === oldId ? nieuweTaal.id : id);
              studentData.talen = studentData.talen.map(id => id === oldId ? nieuweTaal.id : id);
            } catch (e) {
              alert('Taal aanmaken mislukt: ' + e.message);
              return;
            }
          }
          
          // 3. Functies
          const selectedRadio = form.querySelector('input[name="jobType"]:checked');
          const selectedFunctieId = selectedRadio ? parseInt(selectedRadio.value, 10) : null;
            // 4. Alles naar server sturen
          await setStudentSkills(studentId, [...checkedSkills, ...checkedTalen]);
          await updateFunctiesForStudent(studentId, selectedFunctieId ? [selectedFunctieId] : []);
          
          // Na save: fetch opnieuw en render readonly
          await fetchAndRenderReadonly();
        });
      }
      // Add-skill-btn handler
      const addSkillBtn = document.getElementById('add-skill-btn');
      if (addSkillBtn) {
        addSkillBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const input = document.getElementById('skill-andere-text');
          const value = input.value.trim();
          if (!value) return;
          
          // 1. Zoek of skill al bestaat in allSkills
          let bestaande = allSkills.find(skill => skill.naam.toLowerCase() === value.toLowerCase());
          if (bestaande) {
            // Bestaat al: voeg alleen lokaal toe aan studentData
            if (!studentData.skills.includes(bestaande.id)) {
              studentData.skills.push(bestaande.id);
            }
            input.value = '';
            renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
            return;
          }
          
          // 2. Bestaat niet: maak tijdelijk lokaal item aan (negatief ID)
          const tempId = -(studentData.skills.length + Date.now()); // uniek negatief ID
          const newSkill = { id: tempId, naam: value, type: 0 };
          allSkills.push(newSkill); // voeg toe aan alle opties
          studentData.skills.push(tempId); // voeg toe aan student's skills
          input.value = '';
          renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
        });
      }
      // Add-taal-btn handler
      const addTaalBtn = document.getElementById('add-taal-btn');
      if (addTaalBtn) {
        addTaalBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const input = document.getElementById('taal-andere-text');
          const value = input.value.trim();
          if (!value) return;
          
          // 1. Zoek of taal al bestaat in allTalen
          let bestaande = allTalen.find(taal => taal.naam.toLowerCase() === value.toLowerCase());
          if (bestaande) {
            // Bestaat al: voeg alleen lokaal toe aan studentData
            if (!studentData.talen.includes(bestaande.id)) {
              studentData.talen.push(bestaande.id);
            }
            input.value = '';
            renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
            return;
          }
          
          // 2. Bestaat niet: maak tijdelijk lokaal item aan (negatief ID)
          const tempId = -(studentData.talen.length + Date.now()); // uniek negatief ID
          const newTaal = { id: tempId, naam: value, type: 1 };
          allTalen.push(newTaal); // voeg toe aan alle opties
          studentData.talen.push(tempId); // voeg toe aan student's talen
          input.value = '';
          renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
        });
      }// --- Autocomplete/suggesties voor skills ---
      const skillInput = document.getElementById('skill-andere-text');
      const skillSuggestiesDiv = document.getElementById('skill-suggesties');
      if (skillInput && skillSuggestiesDiv) {
        // Render chips
        renderSelectedSkillsChips(allSkills, studentData.skills, 'selected-skills-chips');
        
        skillInput.addEventListener('input', () => {
          const query = skillInput.value.toLowerCase();
          const filteredSkills = allSkills
            .filter(s => s.type === 0 && s.naam.toLowerCase().includes(query))
            .filter(s => !studentData.skills.includes(s.id));
          if (query && filteredSkills.length > 0) {
            skillSuggestiesDiv.innerHTML = filteredSkills.map(s =>
              `<div class=\"suggestie\" data-id=\"${s.id}\">${s.naam}</div>`
            ).join('');
            skillSuggestiesDiv.style.display = 'block';
          } else {
            skillSuggestiesDiv.innerHTML = '';
            skillSuggestiesDiv.style.display = 'none';
          }
        });        skillSuggestiesDiv.addEventListener('click', (e) => {
          e.preventDefault(); // voorkomt form submit door bubbling
          e.stopPropagation(); // voorkomt verder bubbling
          e.stopImmediatePropagation(); // voorkomt alle andere handlers
          const target = e.target.closest('.suggestie');
          if (!target) return;
          const id = parseInt(target.getAttribute('data-id'));
          // Alleen lokaal toevoegen (geen API call)
          if (!studentData.skills.includes(id)) studentData.skills.push(id);
          skillInput.value = '';
          skillSuggestiesDiv.innerHTML = '';
          skillSuggestiesDiv.style.display = 'none';
          renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
        });
        // Klik buiten de suggestielijst sluit hem
        document.addEventListener('click', (e) => {
          if (!skillSuggestiesDiv.contains(e.target) && e.target !== skillInput) {
            skillSuggestiesDiv.innerHTML = '';
            skillSuggestiesDiv.style.display = 'none';
          }
        });        skillInput.addEventListener('blur', () => {
          // Direct verbergen, geen setTimeout (vermijdt race conditions)
          skillSuggestiesDiv.innerHTML = '';
          skillSuggestiesDiv.style.display = 'none';
        });skillInput.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const value = skillInput.value.trim();
            if (!value) return;
            
            // 1. Zoek of skill al bestaat in allSkills
            let bestaande = allSkills.find(skill => skill.naam.toLowerCase() === value.toLowerCase());
            if (bestaande) {
              // Bestaat al: voeg alleen lokaal toe aan studentData
              if (!studentData.skills.includes(bestaande.id)) studentData.skills.push(bestaande.id);
              skillInput.value = '';
              skillSuggestiesDiv.innerHTML = '';
              skillSuggestiesDiv.style.display = 'none';
              renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
              return;
            }
            
            // 2. Bestaat niet: maak tijdelijk lokaal item aan (negatief ID)
            const tempId = -(studentData.skills.length + Date.now()); // uniek negatief ID
            const newSkill = { id: tempId, naam: value, type: 0 };
            allSkills.push(newSkill); // voeg toe aan alle opties
            studentData.skills.push(tempId); // voeg toe aan student's skills
            skillInput.value = '';
            skillSuggestiesDiv.innerHTML = '';
            skillSuggestiesDiv.style.display = 'none';
            renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
          }
        });
      }// --- Autocomplete/suggesties voor talen ---
      const taalInput = document.getElementById('taal-andere-text');
      const taalSuggestiesDiv = document.getElementById('taal-suggesties');
      if (taalInput && taalSuggestiesDiv) {
        // Render chips
        renderSelectedSkillsChips(allTalen, studentData.talen, 'selected-talen-chips');
        
        taalInput.addEventListener('input', () => {
          const query = taalInput.value.toLowerCase();
          const filteredTalen = allTalen
            .filter(s => s.type === 1 && s.naam.toLowerCase().includes(query))
            .filter(s => !studentData.talen.includes(s.id));
          if (query && filteredTalen.length > 0) {
            taalSuggestiesDiv.innerHTML = filteredTalen.map(s =>
              `<div class=\"suggestie\" data-id=\"${s.id}\">${s.naam}</div>`
            ).join('');
            taalSuggestiesDiv.style.display = 'block';
          } else {
            taalSuggestiesDiv.innerHTML = '';
            taalSuggestiesDiv.style.display = 'none';
          }
        });        taalSuggestiesDiv.addEventListener('click', (e) => {
          e.preventDefault(); // voorkomt form submit door bubbling
          e.stopPropagation(); // voorkomt verder bubbling
          e.stopImmediatePropagation(); // voorkomt alle andere handlers
          const target = e.target.closest('.suggestie');
          if (!target) return;
          const id = parseInt(target.getAttribute('data-id'));
          // Alleen lokaal toevoegen (geen API call)
          if (!studentData.talen.includes(id)) studentData.talen.push(id);
          taalInput.value = '';
          taalSuggestiesDiv.innerHTML = '';
          taalSuggestiesDiv.style.display = 'none';
          renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
        });
        // Klik buiten de suggestielijst sluit hem
        document.addEventListener('click', (e) => {
          if (!taalSuggestiesDiv.contains(e.target) && e.target !== taalInput) {
            taalSuggestiesDiv.innerHTML = '';
            taalSuggestiesDiv.style.display = 'none';
          }
        });        taalInput.addEventListener('blur', () => {
          // Direct verbergen, geen setTimeout (vermijdt race conditions)
          taalSuggestiesDiv.innerHTML = '';
          taalSuggestiesDiv.style.display = 'none';
        });taalInput.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const value = taalInput.value.trim();
            if (!value) return;
            
            // 1. Zoek of taal al bestaat in allTalen
            let bestaande = allTalen.find(taal => taal.naam.toLowerCase() === value.toLowerCase());
            if (bestaande) {
              // Bestaat al: voeg alleen lokaal toe aan studentData
              if (!studentData.talen.includes(bestaande.id)) studentData.talen.push(bestaande.id);
              taalInput.value = '';
              taalSuggestiesDiv.innerHTML = '';
              taalSuggestiesDiv.style.display = 'none';
              renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
              return;
            }
            
            // 2. Bestaat niet: maak tijdelijk lokaal item aan (negatief ID)
            const tempId = -(studentData.talen.length + Date.now()); // uniek negatief ID
            const newTaal = { id: tempId, naam: value, type: 1 };
            allTalen.push(newTaal); // voeg toe aan alle opties
            studentData.talen.push(tempId); // voeg toe aan student's talen
            taalInput.value = '';
            taalSuggestiesDiv.innerHTML = '';
            taalSuggestiesDiv.style.display = 'none';
            renderSearchCriteriaStudent(rootElement, studentData, false, allSkills, allTalen); // behoud arrays!
          }        });
      }    } // Einde if (form) block

    // --- Sidebar navigatie ---
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

    // --- Hamburger menu ---
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
        showSettingsPopup();
      });
      document.getElementById('nav-logout').addEventListener('click', () => {
        dropdown.classList.remove('open');
        window.sessionStorage.removeItem('studentData');
        window.sessionStorage.removeItem('authToken');
        window.sessionStorage.removeItem('userType');
        localStorage.setItem('darkmode', 'false');
        document.body.classList.remove('darkmode');
        renderLogin(rootElement);
      });
      // Hamburger menu Profiel knop
      const navProfileBtn = document.getElementById('nav-profile');
      if (navProfileBtn) {
        navProfileBtn.addEventListener('click', () => {          dropdown.classList.remove('open');
          import('../../router.js').then((module) => {
            const Router = module.default;
            Router.navigate('/student/student-profiel');
          });        });
      }
    } // Einde hamburger menu
/* Einde renderSearchCriteriaStudent functie */
  }