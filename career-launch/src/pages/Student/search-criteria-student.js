import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';

// API helpers
async function fetchAllSkills() {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch('https://api.ehb-match.me/skills', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) throw new Error('Kan skills niet ophalen');
  return await resp.json();
}
async function fetchStudentSkills(studentId) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) throw new Error('Kan student skills niet ophalen');
  return await resp.json();
}
async function fetchStudentFuncties(studentId) {
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/studenten/${studentId}/functies`, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!resp.ok) throw new Error('Kan functies niet ophalen');
  return await resp.json();
}
async function addSkillOrTaal(name, isTaal = 0) {
  const token = sessionStorage.getItem('authToken');
  const payload = { naam: name, type: isTaal };
  console.log('Payload naar /skills:', JSON.stringify(payload));
  const resp = await fetch('https://api.ehb-match.me/skills', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error('Skill/Taal toevoegen mislukt');
  return (await resp.json()).skill;
}
async function setStudentSkills(studentId, skillIds) {
  if (!Array.isArray(skillIds)) throw new Error('skillIds is geen array!');
  const ids = skillIds.filter(id => typeof id === 'number' && id > 0);
  if (ids.length === 0) {
    throw new Error('Je moet minstens één skill of taal selecteren.');
  }
  const payload = { skills: ids };
  console.log('Payload naar /studenten/' + studentId + '/skills:', JSON.stringify(payload));
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/studenten/${studentId}/skills`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Skills setten mislukt:', txt);
    throw new Error('Skills setten faalt: ' + txt);
  }
  return await resp.json();
}
async function setStudentFuncties(studentId, functieIds) {
  if (!Array.isArray(functieIds)) throw new Error('functieIds is geen array!');
  // Remove dups & maak platte array
  const cleanFuncties = [...new Set(functieIds.flat().filter(id => typeof id === 'number' && id > 0))];
  if (cleanFuncties.length === 0) throw new Error('Je moet minstens één functie selecteren.');
  // API verwacht platte array!
  const payload = { functies: cleanFuncties };
  console.log('Payload naar /studenten/' + studentId + '/functies:', JSON.stringify(payload));
  const token = sessionStorage.getItem('authToken');
  const resp = await fetch(`https://api.ehb-match.me/studenten/${studentId}/functies`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Functies setten mislukt:', txt);
    throw new Error('Functies setten faalt: ' + txt);
  }
  return await resp.json();
}

const FUNCTIES = [
  { id: 1, naam: 'Fulltime' },
  { id: 2, naam: 'Parttime' },
  { id: 3, naam: 'Stagiair(e)' },
];

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
  const studentId = studentData.id || studentData.gebruiker_id;
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
            <li><button data-route="search" class="sidebar-link active" type="button">Zoek-criteria</button></li>
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

  // Add skill
  const addSkillBtn = document.getElementById('add-skill-btn');
  if (addSkillBtn) {
    addSkillBtn.onclick = async e => {
      e.preventDefault();
      const input = document.getElementById('skill-input');
      const value = input.value.trim();
      if (!value) return;
      let bestaande = localAllSkills.find(skill => skill.naam.toLowerCase() === value.toLowerCase());
      let id;
      if (bestaande) {
        id = bestaande.id;
      } else {
        const nieuwSkill = await addSkillOrTaal(value, 0);
        id = nieuwSkill.id;
        localAllSkills.push(nieuwSkill);
      }
      const alleIds = [...new Set([...localSkills, id, ...localTalen])];
      await setStudentSkills(studentId, alleIds);
      renderSearchCriteriaStudent(root, studentData, true, localAllSkills, localAllTalen, [...localSkills, id], localTalen, localFuncties);
      input.value = '';
    };
  }
  // Add taal
  const addTaalBtn = document.getElementById('add-taal-btn');
  if (addTaalBtn) {
    addTaalBtn.onclick = async e => {
      e.preventDefault();
      const input = document.getElementById('taal-input');
      const value = input.value.trim();
      if (!value) return;
      let bestaande = localAllTalen.find(taal => taal.naam.toLowerCase() === value.toLowerCase());
      let id;
      if (bestaande) {
        id = bestaande.id;
      } else {
        const nieuwTaal = await addSkillOrTaal(value, 1);
        id = nieuwTaal.id;
        localAllTalen.push(nieuwTaal);
      }
      const alleIds = [...new Set([...localSkills, ...localTalen, id])];
      await setStudentSkills(studentId, alleIds);
      renderSearchCriteriaStudent(root, studentData, true, localAllSkills, localAllTalen, localSkills, [...localTalen, id], localFuncties);
      input.value = '';
    };
  }
  // Autocomplete skills
  const skillInput = document.getElementById('skill-input');
  const skillSuggestiesDiv = document.getElementById('skill-suggesties');
  if (skillInput && skillSuggestiesDiv) {
    skillInput.addEventListener('input', () => {
      const query = skillInput.value.toLowerCase();
      const filtered = localAllSkills.filter(s => s.naam.toLowerCase().includes(query) && !localSkills.includes(s.id));
      if (query && filtered.length > 0) {
        skillSuggestiesDiv.innerHTML = filtered.map(s => `<div class=\"suggestie\" data-id=\"${s.id}\">${s.naam}</div>`).join('');
        skillSuggestiesDiv.style.display = 'block';
      } else {
        skillSuggestiesDiv.innerHTML = '';
        skillSuggestiesDiv.style.display = 'none';
      }
    });
    skillSuggestiesDiv.addEventListener('click', e => {
      const target = e.target.closest('.suggestie');
      if (!target) return;
      const id = parseInt(target.getAttribute('data-id'));
      if (!localSkills.includes(id)) localSkills.push(id);
      // Debug: check arrays voor rerender
      console.log('Voor rerender (autocomplete): localSkills:', localSkills, 'localAllSkills:', localAllSkills);
      skillInput.value = '';
      skillSuggestiesDiv.innerHTML = '';
      skillSuggestiesDiv.style.display = 'none';
      renderSearchCriteriaStudent(
        root, studentData, false, localAllSkills, localAllTalen,
        localSkills, localTalen, localFuncties
      );
    });
    document.addEventListener('click', e => {
      if (!skillSuggestiesDiv.contains(e.target) && e.target !== skillInput) {
        skillSuggestiesDiv.innerHTML = '';
        skillSuggestiesDiv.style.display = 'none';
      }
    });
  }
  // Autocomplete talen
  const taalInput = document.getElementById('taal-input');
  const taalSuggestiesDiv = document.getElementById('taal-suggesties');
  if (taalInput && taalSuggestiesDiv) {
    taalInput.addEventListener('input', () => {
      const query = taalInput.value.toLowerCase();
      const filtered = localAllTalen.filter(t => t.naam.toLowerCase().includes(query) && !localTalen.includes(t.id));
      if (query && filtered.length > 0) {
        taalSuggestiesDiv.innerHTML = filtered.map(t => `<div class="suggestie" data-id="${t.id}">${t.naam}</div>`).join('');
        taalSuggestiesDiv.style.display = 'block';
      } else {
        taalSuggestiesDiv.innerHTML = '';
        taalSuggestiesDiv.style.display = 'none';
      }
    });
    taalSuggestiesDiv.addEventListener('click', e => {
      const target = e.target.closest('.suggestie');
      if (!target) return;
      const id = parseInt(target.getAttribute('data-id'));
      if (!localTalen.includes(id)) localTalen.push(id);
      // Debug: check arrays voor rerender
      console.log('Voor rerender (autocomplete): localTalen:', localTalen, 'localAllTalen:', localAllTalen);
      taalInput.value = '';
      taalSuggestiesDiv.innerHTML = '';
      taalSuggestiesDiv.style.display = 'none';
      renderSearchCriteriaStudent(
        root, studentData, false, localAllSkills, localAllTalen,
        localSkills, localTalen, localFuncties
      );
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
