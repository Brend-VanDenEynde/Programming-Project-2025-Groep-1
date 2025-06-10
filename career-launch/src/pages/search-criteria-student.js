import { renderStudentProfiel } from './student-profiel.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderLogin } from './login.js';
import { showSettingsPopup } from './student-settings.js';

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
      showSettingsPopup();
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.style.display = 'none';
      renderLogin(rootElement);
    });
  }

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
    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
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
      // Sla eerst de huidige selectie op
      const checkedSkills = [...document.querySelectorAll('input[name="skills"]:checked')].map(cb => cb.value);
      studentData.criteria.skills = checkedSkills;
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
      // Sla eerst de huidige selectie op
      const checkedTalen = [...document.querySelectorAll('input[name="talen"]:checked')].map(cb => cb.value);
      studentData.criteria.talen = checkedTalen;
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
