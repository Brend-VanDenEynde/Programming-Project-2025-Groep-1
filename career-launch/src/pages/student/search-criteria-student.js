import logoIcon from '../../Icons/favicon-32x32.png';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';

export function renderSearchCriteriaStudent(
  rootElement,
  studentData = {},
  readonlyMode = true
) {
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
    const custom = studentData.criteria.customSkills || [];
    const result = standaard.concat(
      custom.map((c) => ({ value: c, label: c }))
    );
    return result
      .map(
        (skill) => `
      <label class="checkbox-option">
        <input type="checkbox" name="skills" value="${skill.value}" ${
          studentData.criteria.skills.includes(skill.value) ? 'checked' : ''
        } ${readonlyMode ? 'disabled' : ''} />
        <span>${skill.label}</span>
      </label>
    `
      )
      .join('');
  }

  function renderTalenCheckboxes() {
    const standaard = [
      { value: 'nederlands', label: 'Nederlands' },
      { value: 'frans', label: 'Frans' },
      { value: 'english', label: 'English' },
    ];
    const custom = studentData.criteria.customTalen || [];
    const result = standaard.concat(
      custom.map((c) => ({ value: c, label: c }))
    );
    return result
      .map(
        (taal) => `
      <label class="checkbox-option">
        <input type="checkbox" name="talen" value="${taal.value}" ${
          studentData.criteria.talen.includes(taal.value) ? 'checked' : ''
        } ${readonlyMode ? 'disabled' : ''}/>
        <span>${taal.label}</span>
      </label>
    `
      )
      .join('');
  }

  // --------- HIER KOMT DE DYNAMISCHE BUTTONS LOGICA ----------
  function renderButtons() {
    if (readonlyMode) {
      return `<button id="btn-edit" type="button" class="student-profile-btn student-profile-btn-secondary">EDIT</button>`;
    } else {
      return `
        <button id="btn-save" type="submit" class="student-profile-btn student-profile-btn-primary">SAVE</button>
        <button id="btn-reset" type="button" class="student-profile-btn student-profile-btn-secondary">RESET</button>
      `;
    }
  }
  // -----------------------------------------------------------

  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown">
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
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="fulltime" ${
                      studentData.criteria.zoekType === 'fulltime'
                        ? 'checked'
                        : ''
                    } ${readonlyMode ? 'disabled' : ''}/> <span>Fulltime</span>
                  </label>
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="parttime" ${
                      studentData.criteria.zoekType === 'parttime'
                        ? 'checked'
                        : ''
                    } ${readonlyMode ? 'disabled' : ''}/> <span>Parttime</span>
                  </label>
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="stagiaire" ${
                      studentData.criteria.zoekType === 'stagiaire'
                        ? 'checked'
                        : ''
                    } ${
    readonlyMode ? 'disabled' : ''
  }/> <span>Stagiair(e)</span>
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
                ${renderButtons()}
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
  // Sidebar nav - gebruik de router voor echte URL navigatie
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      // Gebruik de router om naar de juiste URL te navigeren
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'profile':
            Router.navigate('/student/student-profiel');
            break;
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
      showSettingsPopup(() =>
        renderSearchCriteriaStudent(rootElement, studentData)
      );
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    });
  }

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

  // Bewaar originele data voor reset
  const originalCriteria = JSON.parse(JSON.stringify(studentData.criteria));

  // Plaats deze code NA rootElement.innerHTML = ...
  const form = document.getElementById('criteriaForm');
  if (form) {
    // EDIT knop
    const editBtn = document.getElementById('btn-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        renderSearchCriteriaStudent(rootElement, studentData, false);
      });
    }

    // SAVE knop
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Verzamel nieuwe data uit het formulier
        const newCriteria = {
          zoekType: form.jobType ? form.jobType.value : '',
          skills: Array.from(
            form.querySelectorAll('input[name="skills"]:checked')
          ).map((i) => i.value),
          talen: Array.from(
            form.querySelectorAll('input[name="talen"]:checked')
          ).map((i) => i.value),
          customSkills: [...studentData.criteria.customSkills],
          customTalen: [...studentData.criteria.customTalen],
        };
        studentData.criteria = newCriteria;
        window.sessionStorage.setItem(
          'studentData',
          JSON.stringify(studentData)
        );
        renderSearchCriteriaStudent(rootElement, studentData, true);
      });
    }

    // RESET knop
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        studentData.criteria = JSON.parse(JSON.stringify(originalCriteria));
        renderSearchCriteriaStudent(rootElement, studentData, false);
      });
    }

    // Toevoegen custom skill
    const addSkillBtn = document.getElementById('add-skill-btn');
    if (addSkillBtn) {
      addSkillBtn.addEventListener('click', () => {
        const input = document.getElementById('skill-andere-text');
        const value = input.value.trim();
        if (value && !studentData.criteria.customSkills.includes(value)) {
          // Verzamel huidige geselecteerde skills vóór toevoegen
          const checkedSkills = Array.from(
            document.querySelectorAll('input[name="skills"]:checked')
          ).map((i) => i.value);
          // Voeg de nieuwe custom skill toe aan customSkills en checkedSkills
          const newCustomSkills = [...studentData.criteria.customSkills, value];
          const newSkills = [...checkedSkills, value];
          studentData.criteria.customSkills = newCustomSkills;
          studentData.criteria.skills = newSkills;
          input.value = '';
          renderSearchCriteriaStudent(rootElement, studentData, false);
        }
      });
    }

    // Toevoegen custom taal
    const addTaalBtn = document.getElementById('add-taal-btn');
    if (addTaalBtn) {
      addTaalBtn.addEventListener('click', () => {
        const input = document.getElementById('taal-andere-text');
        const value = input.value.trim();
        if (value && !studentData.criteria.customTalen.includes(value)) {
          // Verzamel huidige geselecteerde talen vóór toevoegen
          const checkedTalen = Array.from(
            document.querySelectorAll('input[name="talen"]:checked')
          ).map((i) => i.value);
          const newCustomTalen = [...studentData.criteria.customTalen, value];
          const newTalen = [...checkedTalen, value];
          studentData.criteria.customTalen = newCustomTalen;
          studentData.criteria.talen = newTalen;
          input.value = '';
          renderSearchCriteriaStudent(rootElement, studentData, false);
        }
      });
    }
  }
}
