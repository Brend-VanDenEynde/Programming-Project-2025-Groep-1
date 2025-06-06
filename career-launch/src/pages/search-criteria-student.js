import { renderStudentProfiel } from './student-profiel.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderLogin } from './login.js';

// Voeg stijl 1x toe
if (!document.getElementById('search-criteria-student-styles')) {
  const style = document.createElement('style');
  style.id = 'search-criteria-student-styles';
  style.innerHTML = `
    .student-profile-form-container {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 2px 16px 0 rgba(44,44,44,0.08);
      padding: 36px 18px 38px 18px;
      margin: 38px auto 0 auto;
      max-width: 670px;
    }
    .student-profile-title {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 38px;
      color: #23294b;
      text-align: center;
      letter-spacing: 0.02em;
    }
    .search-fieldset {
      border: none;
      margin-bottom: 26px;
      padding: 0;
      background: #f6f7fb;
      border-radius: 18px;
      padding: 22px 16px 12px 18px;
      box-shadow: 0 1px 8px 0 rgba(44,44,44,0.04);
    }
    .search-fieldset legend {
      font-size: 1.19rem;
      font-weight: 700;
      margin-bottom: 16px;
      color: #222845;
      padding-bottom: 3px;
      border-bottom: none;
      display: block;
      letter-spacing: 0.03em;
    }
    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 18px;
      margin-bottom: 0.5rem;
    }
    .checkbox-option {
      font-weight: 600;
      color: #29335b;
      background: #fff;
      border-radius: 13px;
      padding: 13px 26px 12px 17px;
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 120px;
      border: 2px solid #e3e7ef;
      cursor: pointer;
      font-size: 1.13rem;
      box-shadow: 0 2px 8px 0 rgba(44,44,44,0.07);
      margin-bottom: 0;
      transition: border 0.15s, background 0.15s, color 0.15s;
      user-select: none;
    }
    .checkbox-option input[type="checkbox"] {
      accent-color: #22d088;
      width: 20px;
      height: 20px;
      margin: 0 6px 0 0;
      border-radius: 6px;
    }
    .checkbox-option input[type="checkbox"]:checked + span,
    .checkbox-option input[type="checkbox"]:checked {
      color: #24ba86 !important;
      border-color: #22d088;
    }
    .add-custom-wrapper {
      display: flex;
      gap: 10px;
      margin: 9px 0 0 0;
      align-items: center;
    }
    .form-input, .add-btn {
      font-size: 1.08rem;
      padding: 10px 13px;
      border-radius: 9px;
      border: 2px solid #e2e6f0;
      outline: none;
      background: #f8fafc;
      transition: border .16s;
    }
    .form-input:focus { border-color: #22d088; background: #f6fffa; }
    .add-btn {
      background: linear-gradient(90deg, #3dd686 0%, #28bb8a 100%);
      color: #fff;
      border: none;
      font-weight: 700;
      padding: 10px 20px;
      cursor: pointer;
      transition: background .18s, color .18s, box-shadow .18s;
      min-width: 92px;
      box-shadow: 0 2px 6px 0 rgba(44,44,44,0.05);
      font-size: 1.05rem;
    }
    .add-btn:hover, .add-btn:active {
      background: linear-gradient(90deg, #28bb8a 0%, #3dd686 100%);
      color: #fff;
      box-shadow: 0 3px 16px 0 rgba(61,214,134,0.13);
    }
    .student-profile-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
      margin-top: 22px;
    }
    .student-profile-btn {
      min-width: 120px;
      border: none;
      border-radius: 22px;
      font-weight: 800;
      font-size: 1.1rem;
      padding: 13px 0;
      cursor: pointer;
      transition: background .18s, color .18s, box-shadow .18s;
      box-shadow: 0 2px 8px 0 rgba(44,44,44,0.06);
      letter-spacing: .04em;
    }
    .student-profile-btn-primary {
      background: linear-gradient(90deg, #3dd686 0%, #28bb8a 100%);
      color: #fff;
    }
    .student-profile-btn-primary:hover {
      background: linear-gradient(90deg, #28bb8a 0%, #3dd686 100%);
      color: #fff;
      box-shadow: 0 4px 14px 0 rgba(61,214,134,0.16);
    }
    .student-profile-btn-secondary {
      background: linear-gradient(90deg, #e4eafd 0%, #cfd7ea 100%);
      color: #234;
    }
    .student-profile-btn-secondary:hover {
      background: linear-gradient(90deg, #cfd7ea 0%, #e4eafd 100%);
      color: #222;
      box-shadow: 0 4px 14px 0 rgba(44,44,44,0.08);
    }
    @media (max-width: 700px) {
      .student-profile-form-container {padding: 10px 2px 18px 2px;}
      .student-profile-title {font-size: 1.2rem;}
      .add-btn {padding:7px 8px; min-width:65px;}
      .checkbox-group {gap: 12px 5px;}
      .checkbox-option {padding: 9px 8px; font-size:1rem; min-width: 80px;}
    }
  `;
  document.head.appendChild(style);
}

export function renderSearchCriteriaStudent(rootElement, studentData = {}, readonlyMode = true) {
  if (!studentData.criteria) {
    studentData.criteria = {
      zoekType: '',
      skills: [],
      skillAndere: '',
      talen: [],
      taalAndere: '',
      customSkills: [],
      customTalen: [],
    };
  }

  function renderSkillCheckboxes() {
    const standaard = [
      { value: 'cybersecurity', label: 'Cybersecurity' },
      { value: 'networking', label: 'Networking' },
      { value: 'tech-support', label: 'Tech-Support' },
      { value: 'csharp', label: 'C#' },
      { value: 'consultancy', label: 'Consultancy' },
      { value: 'linux', label: 'Linux' },
      { value: 'java', label: 'Java' },
      { value: 'css', label: 'CSS' },
    ];
    const custom = (studentData.criteria.customSkills || []);
    const result = standaard.concat(custom.map(c => ({ value: c, label: c })));
    return result.map(skill => `
      <label class="checkbox-option">
        <input type="checkbox" name="skills" value="${skill.value}" ${studentData.criteria.skills.includes(skill.value) ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''} />
        <span>${skill.label}</span>
      </label>
    `).join('');
  }

  function renderTalenCheckboxes() {
    const standaard = [
      { value: 'nederlands', label: 'Nederlands' },
      { value: 'frans', label: 'Frans' },
      { value: 'english', label: 'English' }
    ];
    const custom = (studentData.criteria.customTalen || []);
    const result = standaard.concat(custom.map(c => ({ value: c, label: c })));
    return result.map(taal => `
      <label class="checkbox-option">
        <input type="checkbox" name="talen" value="${taal.value}" ${studentData.criteria.talen.includes(taal.value) ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/>
        <span>${taal.label}</span>
      </label>
    `).join('');
  }

  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="src/Icons/favicon-32x32.png" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown" style="display: none;">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="student-profile-main">
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link active">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
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
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="fulltime" ${studentData.criteria.zoekType === 'fulltime' ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/> <span>Fulltime</span>
                  </label>
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="parttime" ${studentData.criteria.zoekType === 'parttime' ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/> <span>Parttime</span>
                  </label>
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="stagiaire" ${studentData.criteria.zoekType === 'stagiaire' ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/> <span>Stagiair(e)</span>
                  </label>
                </div>
              </fieldset>
              <fieldset class="search-fieldset">
                <legend>Mijn Skills</legend>
                <div class="checkbox-group" id="skills-list">${renderSkillCheckboxes()}</div>
                ${
                  !readonlyMode
                  ? `<div class="add-custom-wrapper">
                        <input type="text" id="skill-andere-text" name="skillAndereText" placeholder="Andere skill..." class="form-input" style="width:180px;"/>
                        <button id="add-skill-btn" class="add-btn" type="button">+ Toevoegen</button>
                    </div>`
                  : ''
                }
              </fieldset>
              <fieldset class="search-fieldset">
                <legend>Mijn Talen</legend>
                <div class="checkbox-group" id="talen-list">${renderTalenCheckboxes()}</div>
                ${
                  !readonlyMode
                  ? `<div class="add-custom-wrapper">
                        <input type="text" id="taal-andere-text" name="taalAndereText" placeholder="Andere taal..." class="form-input" style="width:180px;"/>
                        <button id="add-taal-btn" class="add-btn" type="button">+ Toevoegen</button>
                    </div>`
                  : ''
                }
              </fieldset>
              <div class="student-profile-buttons">
                <button id="btn-edit" type="button" class="student-profile-btn student-profile-btn-secondary" style="${readonlyMode ? '' : 'display:none;'}">EDIT</button>
                <button id="btn-save" type="submit" class="student-profile-btn student-profile-btn-primary" style="${readonlyMode ? 'display:none;' : ''}">SAVE</button>
                <button id="btn-reset" type="button" class="student-profile-btn student-profile-btn-secondary" style="${readonlyMode ? 'display:none;' : ''}">RESET</button>
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

  // ---- INTERACTIE ----

  // Sidebar nav
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile': renderStudentProfiel(rootElement, studentData); break;
        case 'search': renderSearchCriteriaStudent(rootElement, studentData, true); break;
        case 'speeddates': renderSpeeddates(rootElement, studentData); break;
        case 'requests': renderSpeeddatesRequests(rootElement, studentData); break;
        case 'qr': renderQRPopup(rootElement, studentData); break;
      }
    });
  });

  // Burger menu
 const burger = document.getElementById('burger-menu');
const dropdown = document.getElementById('burger-dropdown');

if (burger && dropdown) {
  // Toggle hamburger-menu bij klik
  burger.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Sluit het menu bij klik buiten het menu
  document.addEventListener('click', function(event) {
    if (dropdown.style.display === 'block') {
      if (!dropdown.contains(event.target) && event.target !== burger) {
        dropdown.style.display = 'none';
      }
    }
  });

  // Sluit het menu bij klikken op een menu-item
  document.getElementById('nav-settings').addEventListener('click', () => {
    dropdown.style.display = 'none';
    // Navigeren naar Instellingen (eventueel logica hier)
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    dropdown.style.display = 'none';
    renderLogin(rootElement);
  });
}
ent.getElementById('nav-settings').addEventListener('click', () => {});
  
  document.getElementById('nav-logout').addEventListener('click', () => {
    renderLogin(rootElement);
  });

  // Form
  const form = document.getElementById('criteriaForm');
  const btnEdit = document.getElementById('btn-edit');
  const btnSave = document.getElementById('btn-save');
  const btnReset = document.getElementById('btn-reset');

  Array.from(form.elements).forEach(el => {
    if (
      el.tagName !== "BUTTON"
      && el.type !== "button"
      && el.type !== "submit"
      && el.type !== "reset"
    ) {
      el.disabled = readonlyMode;
    }
  });

  // RESET: wis alles (ook custom velden) en ga naar editmode
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      studentData.criteria = {
        zoekType: '',
        skills: [],
        skillAndere: '',
        talen: [],
        taalAndere: '',
        customSkills: [],
        customTalen: [],
      };
      renderSearchCriteriaStudent(rootElement, studentData, false);
    });
  }

  // EDIT: ga naar edit mode
  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      renderSearchCriteriaStudent(rootElement, studentData, false);
    });
  }

  // SAVE: alles bewaren en readonly mode
  if (btnSave) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      studentData.criteria.zoekType = data.get('jobType') || '';
      studentData.criteria.skills = [...form.querySelectorAll('input[name="skills"]:checked')].map(cb => cb.value);
      studentData.criteria.talen = [...form.querySelectorAll('input[name="talen"]:checked')].map(cb => cb.value);
      renderSearchCriteriaStudent(rootElement, studentData, true);
    });
  }

  // ANDERE SKILL TOEVOEGEN
  if (!readonlyMode) {
    const inputSkill = document.getElementById('skill-andere-text');
    const addSkillBtn = document.getElementById('add-skill-btn');
    function addCustomSkill(val) {
      const textValue = val.trim();
      if (textValue && !studentData.criteria.customSkills.includes(textValue)) {
        studentData.criteria.customSkills.push(textValue);
        studentData.criteria.skills.push(textValue);
        renderSearchCriteriaStudent(rootElement, studentData, false);
      }
    }
    addSkillBtn.addEventListener('click', () => {
      addCustomSkill(inputSkill.value);
    });
    inputSkill.addEventListener('keydown', (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomSkill(inputSkill.value);
      }
    });

    // ANDERE TAAL TOEVOEGEN
    const inputTaal = document.getElementById('taal-andere-text');
    const addTaalBtn = document.getElementById('add-taal-btn');
    function addCustomTaal(val) {
      const textValue = val.trim();
      if (textValue && !studentData.criteria.customTalen.includes(textValue)) {
        studentData.criteria.customTalen.push(textValue);
        studentData.criteria.talen.push(textValue);
        renderSearchCriteriaStudent(rootElement, studentData, false);
      }
    }
    addTaalBtn.addEventListener('click', () => {
      addCustomTaal(inputTaal.value);
    });
    inputTaal.addEventListener('keydown', (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomTaal(inputTaal.value);
      }
    });
  }

  // Footer links
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
