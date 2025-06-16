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
  readonlyMode = true
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
  setTimeout(async () => {
    rootElement.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Zoekcriteria laden...</div>
      </div>
    `;

    // Declare these at the top of the function scope
    let allSkills = [],
      allTalen = [],
      alleFuncties = [
        { id: 1, naam: 'Fulltime' },
        { id: 2, naam: 'Parttime' },
        { id: 3, naam: 'Stagiair(e)' }
      ],
      studentFunctieIds = [];
    try {
      const all = await fetchAllSkills();
      allSkills = all.filter((s) => s.type === 0); // Skills
      allTalen = all.filter((s) => s.type === 1); // Talen
      // Functies ophalen van student
      console.log('studentId voor fetchStudentFuncties:', studentId);
      console.log('token voor fetchStudentFuncties:', sessionStorage.getItem('authToken'));
      studentFunctieIds = (await fetchStudentFuncties(studentId)).map(f => f.id);
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
    }
    function renderCheckboxes(list, checkedArr, name) {
      return list
        .map(
          (item) => `
            <label class="checkbox-option">
              <input type="checkbox" name="${name}" value="${item.id}" ${
            isChecked(item.id, checkedArr) ? 'checked' : ''
          } ${readonlyMode ? 'disabled' : ''}>
              <span>${item.naam}</span>
            </label>
          `
        )
        .join('');
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
              <li><button data-route="search" class="sidebar-link active">Zoek-criteria</button></li>
              <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
              <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
              <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
              <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
            </ul>
          </nav>
          <div class="student-profile-content">
            <div class="student-profile-form-container">
              <h1 class="student-profile-title">Zoek-criteria</h1>
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
                    ${renderCheckboxes(allSkills, studentData.skills, 'skills')}
                  </div>
                  ${
                    !readonlyMode
                      ? `<div class="add-custom-wrapper">
                          <input type="text" id="skill-andere-text" placeholder="Andere skill..." class="form-input" style="width:180px;"/>
                          <button id="add-skill-btn" class="add-btn" type="button">+ Toevoegen</button>
                      </div>`
                      : ''
                  }
                </fieldset>
                <fieldset class="search-fieldset">
                  <legend>Mijn Talen</legend>
                  <div class="checkbox-group" id="talen-list">
                    ${renderCheckboxes(allTalen, studentData.talen, 'talen')}
                  </div>
                  ${
                    !readonlyMode
                      ? `<div class="add-custom-wrapper">
                          <input type="text" id="taal-andere-text" placeholder="Andere taal..." class="form-input" style="width:180px;"/>
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
                    <button id="btn-reset" type="button" class="student-profile-btn student-profile-btn-secondary">RESET</button>
                    <button id="btn-cancel" type="button" class="student-profile-btn student-profile-btn-secondary">CANCEL</button>
                  `
                  }
                </div>
              </form>
            </div>
          </div>
        </div>
        <footer class="student-profile-footer">
          <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
          <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
        </footer>
      </div>
    `;

    // --- Interactie (EVENTS) ---
    const form = document.getElementById('criteriaForm');
    if (form) {
      // EDIT
      const editBtn = document.getElementById('btn-edit');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          renderSearchCriteriaStudent(rootElement, studentData, false);
        });
      }
      // RESET
      const resetBtn = document.getElementById('btn-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
          studentData.skills = [];
          studentData.talen = [];
          try {
            await updateFunctiesForStudent(studentId, []);
            // Skills/talen worden via syncStudentSkills verwijderd
            let studentSkillsAll = await fetchStudentSkills(studentId);
            let allStudentSkillIds = studentSkillsAll
              .filter((s) => s.type === 0)
              .map((s) => s.id);
            let allStudentTaalIds = studentSkillsAll
              .filter((s) => s.type === 1)
              .map((s) => s.id);
            for (const id of allStudentSkillIds.concat(allStudentTaalIds)) {
              await removeSkillFromStudent(studentId, id);
            }
          } catch (e) {
            console.error('Reset fout:', e);
            alert('Fout bij resetten: ' + e.message);
          }
          renderSearchCriteriaStudent(rootElement, studentData, false);
        });
      }
      // CANCEL
      const cancelBtn = document.getElementById('btn-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          renderSearchCriteriaStudent(rootElement, studentData, true);
        });
      }
      // SAVE
      const saveBtn = document.getElementById('btn-save');
      if (saveBtn) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          let checkedSkills = Array.from(
            form.querySelectorAll('input[name="skills"]:checked')
          ).map((i) => Number(i.value));
          let checkedTalen = Array.from(
            form.querySelectorAll('input[name="talen"]:checked')
          ).map((i) => Number(i.value));
          const selectedRadio = form.querySelector(
            'input[name="jobType"]:checked'
          );
          const selectedFunctieId = selectedRadio ? parseInt(selectedRadio.value, 10) : null;
          const zoekType = selectedRadio ? selectedRadio.value : '';
          const skillInput = document.getElementById('skill-andere-text');
          if (skillInput && skillInput.value.trim()) {
            const value = skillInput.value.trim();
            if (
              !allSkills.some(
                (skill) => skill.naam.toLowerCase() === value.toLowerCase()
              )
            ) {
              try {
                const nieuwSkill = await addSkillOrTaal(value, 0);
                allSkills.push(nieuwSkill);
                checkedSkills.push(nieuwSkill.id);
              } catch (e) {
                alert('Skill toevoegen mislukt: ' + e.message);
                return;
              }
            }
          }
          const taalInput = document.getElementById('taal-andere-text');
          if (taalInput && taalInput.value.trim()) {
            const value = taalInput.value.trim();
            if (
              !allTalen.some(
                (taal) => taal.naam.toLowerCase() === value.toLowerCase()
              )
            ) {
              try {
                const nieuweTaal = await addSkillOrTaal(value, 1);
                allTalen.push(nieuwTaal);
                checkedTalen.push(nieuwTaal.id);
              } catch (e) {
                alert('Taal toevoegen mislukt: ' + e.message);
                return;
              }
            }
          }
          if (!selectedFunctieId) return alert('Selecteer een zoektype!');
          await syncStudentSkills(
            studentId,
            checkedSkills,
            checkedTalen
          );
          try {
            await updateFunctiesForStudent(studentId, selectedFunctieId ? [selectedFunctieId] : []);
            studentData.skills = checkedSkills;
            studentData.talen = checkedTalen;
            studentData.zoekType = selectedFunctieId; // ✅ DIT IS TOEGEVOEGD
            sessionStorage.setItem('studentData', JSON.stringify(studentData));
            renderSearchCriteriaStudent(rootElement, studentData, true);
          } catch (e) {
            console.error('Fout bij opslaan:', e);
            alert('Fout bij opslaan: ' + e.message);
          }
        });
      }
      // Toevoegen custom skill
      const addSkillBtn = document.getElementById('add-skill-btn');
      if (addSkillBtn) {
        addSkillBtn.addEventListener('click', async () => {
          const input = document.getElementById('skill-andere-text');
          const value = input.value.trim();
          if (!value) return;
          if (
            allSkills.some(
              (skill) => skill.naam.toLowerCase() === value.toLowerCase()
            )
          ) {
            alert('Skill bestaat al!');
            return;
          }
          try {
            const nieuwSkill = await addSkillOrTaal(value, 0);
            allSkills.push(nieuwSkill);
            input.value = '';

            // Haal alle nu geselecteerde vinkjes op:
            const checkedSkills = Array.from(
              document.querySelectorAll('input[name="skills"]:checked')
            ).map((i) => Number(i.value));
            // Voeg de nieuwe toe aan de selectie:
            if (!checkedSkills.includes(nieuwSkill.id))
              checkedSkills.push(nieuwSkill.id);
            // Zet als geselecteerd voor render:
            studentData.skills = checkedSkills;

            renderSearchCriteriaStudent(rootElement, studentData, false);
          } catch (e) {
            alert('Skill toevoegen mislukt: ' + e.message);
          }
        });
      }
      // Toevoegen custom taal
      const addTaalBtn = document.getElementById('add-taal-btn');
      if (addTaalBtn) {
        addTaalBtn.addEventListener('click', async () => {
          const input = document.getElementById('taal-andere-text');
          const value = input.value.trim();
          if (!value) return;
          if (
            allTalen.some(
              (taal) => taal.naam.toLowerCase() === value.toLowerCase()
            )
          ) {
            alert('Taal bestaat al!');
            return;
          }
          try {
            const nieuweTaal = await addSkillOrTaal(value, 1);
            allTalen.push(nieuwTaal);
            input.value = '';

            // Haal alle nu geselecteerde vinkjes op:
            const checkedTalen = Array.from(
              document.querySelectorAll('input[name="talen"]:checked')
            ).map((i) => Number(i.value));
            // Voeg de nieuwe toe aan de selectie:
            if (!checkedTalen.includes(nieuweTaal.id))
              checkedTalen.push(nieuweTaal.id);
            // Zet als geselecteerd voor render:
            studentData.talen = checkedTalen;

            renderSearchCriteriaStudent(rootElement, studentData, false);
          } catch (e) {
            alert('Taal toevoegen mislukt: ' + e.message);
          }
        });
      }
    }

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
        navProfileBtn.addEventListener('click', () => {
          dropdown.classList.remove('open');
          import('../../router.js').then((module) => {
            const Router = module.default;
            Router.navigate('/student/student-profiel');
          });
        });
      }
    }
    // END setTimeout
  }, 200);
}
