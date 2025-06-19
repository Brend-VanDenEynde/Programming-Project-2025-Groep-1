import logoIcon from '../../icons/favicon-32x32.png';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
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
  try {
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
  } catch (error) {
    if (error.message && error.message.includes('401')) {
      alert('Je sessie is verlopen. Log opnieuw in.');
      import('../login.js').then(({ renderLogin }) => renderLogin(document.body));
    }
    throw error;
  }
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

// --- GENERIC SKILL/TALEN SELECTOR VOOR STUDENT ---
function renderSkillSelectorStudent({root, label, allSkills, selected, onAdd, onRemove, type}) {
  root.innerHTML = `
    <label>${label}</label>
    <input type="text" class="skills-input" placeholder="Voeg toe..." autocomplete="off" />
    <div class="skills-dropdown" style="display:none"></div>
    <div class="skills-list"></div>
  `;
  const input = root.querySelector('.skills-input');
  const dropdown = root.querySelector('.skills-dropdown');
  const list = root.querySelector('.skills-list');
  let currentFocus = -1;

  function updateList() {
    list.innerHTML = selected.map(skill =>
      `<span class="skill-tag">${skill.naam} <button data-remove="${skill.id}">×</button></span>`
    ).join('');
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => onRemove(Number(btn.dataset.remove));
    });
  }
  updateList();

  input.addEventListener('input', () => {
    const val = input.value.toLowerCase();
    const matches = allSkills.filter(s =>
      s.naam.toLowerCase().includes(val) && !selected.some(sel => sel.id === s.id) && s.type === type
    ).slice(0, 8);
    dropdown.style.display = matches.length ? 'block' : 'none';
    dropdown.innerHTML = matches.map((s, i) =>
      `<div class="skill-suggestion${i === currentFocus ? ' active' : ''}" data-add="${s.id}">${s.naam}</div>`
    ).join('');
    dropdown.querySelectorAll('[data-add]').forEach(el => {
      el.onclick = () => { onAdd(el.textContent, Number(el.dataset.add)); input.value = ''; dropdown.style.display = 'none'; };
    });
  });
  input.addEventListener('keydown', e => {
    const suggestions = Array.from(dropdown.querySelectorAll('.skill-suggestion'));
    if (e.key === 'ArrowDown') { currentFocus = (currentFocus + 1) % suggestions.length; setActive(suggestions, currentFocus); e.preventDefault(); }
    if (e.key === 'ArrowUp') { currentFocus = (currentFocus - 1 + suggestions.length) % suggestions.length; setActive(suggestions, currentFocus); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (currentFocus >= 0 && suggestions[currentFocus]) { suggestions[currentFocus].click(); e.preventDefault(); }
      else if (input.value.trim()) { onAdd(input.value.trim()); input.value = ''; dropdown.style.display = 'none'; e.preventDefault(); }
    }
    if (e.key === 'Escape') { dropdown.style.display = 'none'; }
  });
  function setActive(items, idx) {
    items.forEach((el, i) => el.classList.toggle('active', i === idx));
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
  }
}

// ---- HOOFDFUNCTIE ----
export async function renderSearchCriteriaStudent(
  rootElement,
  studentData = {}
) {
  // AUTH CHECK: blokkeer toegang zonder geldige login
  const token = window.sessionStorage.getItem('authToken');
  if (!token) {
    import('../login.js').then((module) => {
      module.renderLogin(rootElement);
    });
    return;
  }

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

    let allSkills = [],
      allTalen = [],
      studentFunctieIds = [],
      selectedSkills = [],
      selectedLanguages = [];
    try {
      const all = await fetchAllSkills();
      allSkills = all.filter((s) => s.type === 0); // Skills
      allTalen = all.filter((s) => s.type === 1); // Talen
      studentFunctieIds = (await fetchStudentFuncties(studentId)).map(f => f.id);
      // Skills/talen van student ophalen
      const studentSkills = await fetchStudentSkills(studentId);
      selectedSkills = studentSkills.filter(s => s.type === 0);
      selectedLanguages = studentSkills.filter(s => s.type === 1);
    } catch (e) {
      rootElement.innerHTML = `<div style="color:red">Fout bij ophalen skills/talen/functies: ${e.message}</div>`;
      return;
    }


    // --- HTML rendering (bedrijf-style, met expliciete input/btn/dropdown zoals bij bedrijf) ---
    rootElement.innerHTML = `
      <div class="bedrijf-profile-container">
        <header class="bedrijf-profile-header">
          <div class="logo-section">
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
              <li><button data-route="search-criteria" class="sidebar-link active">Zoek-criteria</button></li>
              <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
              <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
              <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            </ul>
          </nav>
          <div class="bedrijf-profile-content">
            <div class="bedrijf-profile-form-container">
              <h1 class="bedrijf-profile-title">Zoek-criteria</h1>
              <form id="bedrijf-criteria-form" class="criteria-form" autocomplete="off">
                <fieldset class="search-fieldset">
                  <legend>Ik zoek</legend>
                  <div class="checkbox-group" id="bedrijf-functies-list">
                    <label class="checkbox-option">
                      <input type="checkbox" name="bedrijfFuncties" value="1" ${studentFunctieIds.includes(1) ? 'checked' : ''}>
                      <span>Fulltime</span>
                    </label>
                    <label class="checkbox-option">
                      <input type="checkbox" name="bedrijfFuncties" value="2" ${studentFunctieIds.includes(2) ? 'checked' : ''}>
                      <span>Parttime</span>
                    </label>
                    <label class="checkbox-option">
                      <input type="checkbox" name="bedrijfFuncties" value="3" ${studentFunctieIds.includes(3) ? 'checked' : ''}>
                      <span>Stagiair(e)</span>
                    </label>
                  </div>
                </fieldset>
                <fieldset class="search-fieldset">
                  <legend>Mijn Skills</legend>
                  <div id="selected-skills" class="selected-skills"></div>
                  <div class="skills-input-container">
                    <div class="skills-input-wrapper">
                      <input type="text" id="skills-input" class="bedrijf-skills-input" placeholder="Voer een skill in (bijv. JavaScript, React, Python...)" autocomplete="off" />
                      <div id="skills-dropdown" class="skills-dropdown" style="display: none;"></div>
                    </div>
                    <button type="button" id="add-skill-btn" class="btn">Toevoegen</button>
                  </div>
                </fieldset>
                <fieldset class="search-fieldset">
                  <legend>Mijn Talen</legend>
                  <div id="selected-languages" class="selected-skills"></div>
                  <div class="languages-input-container">
                    <div class="languages-input-wrapper">
                      <input type="text" id="languages-input" class="bedrijf-languages-input" placeholder="Voer een taal in (bijv. Nederlands, Engels, Frans...)" autocomplete="off" />
                      <div id="languages-dropdown" class="skills-dropdown" style="display: none;"></div>
                    </div>
                    <button type="button" id="add-language-btn" class="btn">Toevoegen</button>
                  </div>
                </fieldset>
                <div class="student-profile-buttons">
                  <!-- Buttons verwijderd op verzoek -->
                </div>
              </form>
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

    // --- Skills event handlers & autocomplete (bedrijf-style, student-API) ---
    // Verwijder dubbele let-declaraties, gebruik bestaande variabelen
    // selectedSkills en selectedLanguages zijn al gedeclareerd bovenaan
    // Vul ze opnieuw met API-data indien nodig, maar niet opnieuw declareren
    async function updateAndRenderSkills() {
      const studentSkills = await fetchStudentSkills(studentId);
      selectedSkills = studentSkills.filter(s => s.type === 0);
      selectedLanguages = studentSkills.filter(s => s.type === 1);
      renderSelectedSkills();
      renderSelectedLanguages();
    }

    function renderSelectedSkills() {
      const container = document.getElementById('selected-skills');
      if (!selectedSkills.length) {
        container.innerHTML = '<p class="no-skills">Nog geen skills toegevoegd</p>';
        return;
      }
      container.innerHTML = `<div class="skills-list">${selectedSkills.map(skill => `
        <div class="skill-tag"><span>${skill.naam}</span><button type="button" class="remove-skill" data-skill-id="${skill.id}">×</button></div>
      `).join('')}</div>`;
      container.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const skillId = parseInt(e.target.getAttribute('data-skill-id'));
          await removeSkillFromStudent(studentId, skillId);
          await updateAndRenderSkills();
        });
      });
    }
    renderSelectedSkills();
    const skillsInput = document.getElementById('skills-input');
    const addSkillBtn = document.getElementById('add-skill-btn');
    const skillsDropdown = document.getElementById('skills-dropdown');
    let currentFocus = -1;
    skillsInput.addEventListener('input', function(e) {
      const query = e.target.value.trim().toLowerCase();
      if (!query) { skillsDropdown.style.display = 'none'; return; }
      const suggestions = allSkills.filter(skill =>
        skill.naam.toLowerCase().includes(query) &&
        !selectedSkills.some(s => s.id === skill.id)
      ).slice(0, 8);
      if (!suggestions.length) { skillsDropdown.style.display = 'none'; return; }
      skillsDropdown.innerHTML = suggestions.map((skill, i) =>
        `<div class="skill-suggestion${i === currentFocus ? ' active' : ''}" data-skill-id="${skill.id}">${skill.naam}</div>`
      ).join('');
      skillsDropdown.style.display = 'block';
      skillsDropdown.querySelectorAll('.skill-suggestion').forEach((el, idx) => {
        el.addEventListener('click', async () => {
          let skill = suggestions[idx];
          await fetch(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + sessionStorage.getItem('authToken'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: [skill.id] })
          });
          await updateAndRenderSkills();
          skillsInput.value = '';
          skillsDropdown.style.display = 'none';
        });
      });
    });
    skillsInput.addEventListener('keydown', function(e) {
      const suggestions = Array.from(skillsDropdown.querySelectorAll('.skill-suggestion'));
      if (e.key === 'ArrowDown') { currentFocus = (currentFocus + 1) % suggestions.length; setActive(suggestions, currentFocus); e.preventDefault(); }
      if (e.key === 'ArrowUp') { currentFocus = (currentFocus - 1 + suggestions.length) % suggestions.length; setActive(suggestions, currentFocus); e.preventDefault(); }
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (currentFocus >= 0 && suggestions[currentFocus]) { suggestions[currentFocus].click(); e.preventDefault(); }
        else if (skillsInput.value.trim()) { addSkillBtn.click(); e.preventDefault(); }
      }
      if (e.key === 'Escape') { skillsDropdown.style.display = 'none'; }
    });
    function setActive(items, idx) {
      items.forEach((el, i) => el.classList.toggle('active', i === idx));
      if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
    }
    addSkillBtn.addEventListener('click', async () => {
      const value = skillsInput.value.trim();
      if (!value) return;
      let skill = allSkills.find(s => s.naam.toLowerCase() === value.toLowerCase());
      if (!skill) {
        skill = await addSkillOrTaal(value, 0);
        allSkills.push(skill);
      }
      if (selectedSkills.some(s => s.id === skill.id) || skill.id == null) {
        showFeedback('Skill al toegevoegd');
        return;
      }
      await fetch(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem('authToken'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: [skill.id] })
      });
      await updateAndRenderSkills();
      skillsInput.value = '';
      skillsDropdown.style.display = 'none';
    });

    // --- Talen event handlers & autocomplete (bedrijf-style, student-API) ---
    function renderSelectedLanguages() {
      const container = document.getElementById('selected-languages');
      if (!selectedLanguages.length) {
        container.innerHTML = '<p class="no-skills">Nog geen talen toegevoegd</p>';
        return;
      }
      container.innerHTML = `<div class="skills-list">${selectedLanguages.map(taal => `
        <div class="skill-tag"><span>${taal.naam}</span><button type="button" class="remove-language" data-language-id="${taal.id}">×</button></div>
      `).join('')}</div>`;
      container.querySelectorAll('.remove-language').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const taalId = parseInt(e.target.getAttribute('data-language-id'));
          await removeSkillFromStudent(studentId, taalId);
          await updateAndRenderSkills();
        });
      });
    }
    renderSelectedLanguages();
    const languagesInput = document.getElementById('languages-input');
    const addLanguageBtn = document.getElementById('add-language-btn');
    const languagesDropdown = document.getElementById('languages-dropdown');
    let currentFocusLang = -1;
    languagesInput.addEventListener('input', function(e) {
      const query = e.target.value.trim().toLowerCase();
      if (!query) { languagesDropdown.style.display = 'none'; return; }
      const suggestions = allTalen.filter(taal =>
        taal.naam.toLowerCase().includes(query) &&
        !selectedLanguages.some(t => t.id === taal.id)
      ).slice(0, 8);
      if (!suggestions.length) { languagesDropdown.style.display = 'none'; return; }
      languagesDropdown.innerHTML = suggestions.map((taal, i) =>
        `<div class="skill-suggestion${i === currentFocusLang ? ' active' : ''}" data-language-id="${taal.id}">${taal.naam}</div>`
      ).join('');
      languagesDropdown.style.display = 'block';
      languagesDropdown.querySelectorAll('.skill-suggestion').forEach((el, idx) => {
        el.addEventListener('click', async () => {
          let taal = suggestions[idx];
          await fetch(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + sessionStorage.getItem('authToken'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: [taal.id] })
          });
          await updateAndRenderSkills();
          languagesInput.value = '';
          languagesDropdown.style.display = 'none';
        });
      });
    });
    languagesInput.addEventListener('keydown', function(e) {
      const suggestions = Array.from(languagesDropdown.querySelectorAll('.skill-suggestion'));
      if (e.key === 'ArrowDown') { currentFocusLang = (currentFocusLang + 1) % suggestions.length; setActiveLang(suggestions, currentFocusLang); e.preventDefault(); }
      if (e.key === 'ArrowUp') { currentFocusLang = (currentFocusLang - 1 + suggestions.length) % suggestions.length; setActiveLang(suggestions, currentFocusLang); e.preventDefault(); }
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (currentFocusLang >= 0 && suggestions[currentFocusLang]) { suggestions[currentFocusLang].click(); e.preventDefault(); }
        else if (languagesInput.value.trim()) { addLanguageBtn.click(); e.preventDefault(); }
      }
      if (e.key === 'Escape') { languagesDropdown.style.display = 'none'; }
    });
    function setActiveLang(items, idx) {
      items.forEach((el, i) => el.classList.toggle('active', i === idx));
      if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
    }
    addLanguageBtn.addEventListener('click', async () => {
      const value = languagesInput.value.trim();
      if (!value) return;
      let taal = allTalen.find(t => t.naam.toLowerCase() === value.toLowerCase());
      if (!taal) {
        taal = await addSkillOrTaal(value, 1);
        allTalen.push(taal);
      }
      if (selectedLanguages.some(t => t.id === taal.id)) return;
      await fetch(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem('authToken'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: [taal.id] })
      });
      await updateAndRenderSkills();
      languagesInput.value = '';
      languagesDropdown.style.display = 'none';
    });

    // --- Interactie (EVENTS) ---
    const form = document.getElementById('bedrijf-criteria-form');
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

      // --- Nieuwe autocomplete en toevoegen voor skills (student, zoals bedrijf) ---
      const skillInput = document.getElementById('skills-input');
      const skillsDropdown = document.getElementById('skills-dropdown');
      let skillSuggestions = [];
      skillInput.addEventListener('input', () => {
        const query = skillInput.value.trim().toLowerCase();
        if (!query) {
          skillsDropdown.style.display = 'none';
          return;
        }
        skillSuggestions = allSkills.filter(skill =>
          skill.naam.toLowerCase().includes(query) &&
          !studentData.skills.includes(skill.id)
        ).slice(0, 8);
        if (skillSuggestions.length === 0) {
          skillsDropdown.style.display = 'none';
          return;
        }
        skillsDropdown.innerHTML = skillSuggestions.map((skill, idx) =>
          `<div class="skill-suggestion" data-skill-id="${skill.id}">${skill.naam}</div>`
        ).join('');
        skillsDropdown.style.display = 'block';
        skillsDropdown.querySelectorAll('.skill-suggestion').forEach((el, idx) => {
          el.addEventListener('click', async () => {
            // Voeg toe via student-API
            try {
              const studentId = studentData.id || studentData.gebruiker_id;
              // Voeg toe aan student via API
              await addSkillOrTaal(skillSuggestions[idx].naam, 0);
              if (!studentData.skills.includes(skillSuggestions[idx].id)) {
                studentData.skills.push(skillSuggestions[idx].id);
              }
              renderSearchCriteriaStudent(rootElement, studentData, false);
            } catch (e) {
              alert('Skill toevoegen mislukt: ' + e.message);
            }
          });
        });
      });
      document.addEventListener('click', (e) => {
        if (!skillsDropdown.contains(e.target) && e.target !== skillInput) {
          skillsDropdown.style.display = 'none';
        }
      });
      // --- Nieuwe autocomplete en toevoegen voor talen (student, zoals bedrijf) ---
      const taalInput = document.getElementById('languages-input');
      const talenDropdown = document.getElementById('languages-dropdown');
      let taalSuggestions = [];
      taalInput.addEventListener('input', () => {
        const query = taalInput.value.trim().toLowerCase();
        if (!query) {
          talenDropdown.style.display = 'none';
          return;
        }
        taalSuggestions = allTalen.filter(taal =>
          taal.naam.toLowerCase().includes(query) &&
          !studentData.talen.includes(taal.id)
        ).slice(0, 8);
        if (taalSuggestions.length === 0) {
          talenDropdown.style.display = 'none';
          return;
        }
        talenDropdown.innerHTML = taalSuggestions.map((taal, idx) =>
          `<div class="skill-suggestion" data-taal-id="${taal.id}">${taal.naam}</div>`
        ).join('');
        talenDropdown.style.display = 'block';
        talenDropdown.querySelectorAll('.skill-suggestion').forEach((el, idx) => {
          el.addEventListener('click', async () => {
            // Voeg toe via student-API
            try {
              const studentId = studentData.id || studentData.gebruiker_id;
              await addSkillOrTaal(taalSuggestions[idx].naam, 1);
              if (!studentData.talen.includes(taalSuggestions[idx].id)) {
                studentData.talen.push(taalSuggestions[idx].id);
              }
              renderSearchCriteriaStudent(rootElement, studentData, false);
            } catch (e) {
              alert('Taal toevoegen mislukt: ' + e.message);
            }
          });
        });
      });
      document.addEventListener('click', (e) => {
        if (!talenDropdown.contains(e.target) && e.target !== taalInput) {
          talenDropdown.style.display = 'none';
        }
      });
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
    // --- Footer links: gebruik alleen Router.navigate, geen hash of import ---
    const privacyLink = document.getElementById('privacy-policy');
    if (privacyLink) {
      privacyLink.setAttribute('href', '#');
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/privacy');
        });
      });
    }
    const contactLink = document.getElementById('contacteer-ons');
    if (contactLink) {
      contactLink.setAttribute('href', '#');
      contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/contact');
        });
      });
    }
    // END setTimeout
  }, 200);
}
