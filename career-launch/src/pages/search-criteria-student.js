import { renderStudentProfiel } from './student-profiel.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderLogin } from './login.js';

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
      <label class="checkbox-option" style="margin-right:2rem;">
        <input type="checkbox" name="skills" value="${skill.value}" ${studentData.criteria.skills.includes(skill.value) ? 'checked' : ''} /> ${skill.label}
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
      <label class="checkbox-option" style="margin-right:2rem;">
        <input type="checkbox" name="talen" value="${taal.value}" ${studentData.criteria.talen.includes(taal.value) ? 'checked' : ''}/> ${taal.label}
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
          <li><button id="nav-dashboard">Dashboard</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-delete-account">Verwijder account</button></li>
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
                <div style="display:flex; gap:2rem; flex-wrap:wrap;">
                  <label class="radio-option">
                    <input type="radio" name="jobType" value="fulltime" ${studentData.criteria.zoekType === 'fulltime' ? 'checked' : ''} /> Fulltime
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="jobType" value="parttime" ${studentData.criteria.zoekType === 'parttime' ? 'checked' : ''} /> Parttime
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="jobType" value="stagiaire" ${studentData.criteria.zoekType === 'stagiaire' ? 'checked' : ''} /> Stagiair(e)
                  </label>
                </div>
              </fieldset>
              <fieldset class="search-fieldset">
                <legend>Mijn Skills</legend>
                <div style="display:flex; flex-wrap:wrap; gap:1rem 0.5rem;">${renderSkillCheckboxes()}</div>
                <div style="display:flex; align-items:center; margin-top:0.5rem;">
                  <label class="checkbox-option" style="margin-right:0.5rem;">
                    <input type="checkbox" name="skills" value="andere" id="skill-andere" ${studentData.criteria.skillAndere ? 'checked' : ''}/> Andere:
                  </label>
                  <input type="text" id="skill-andere-text" name="skillAndereText" placeholder="Omschrijf hier" class="form-input" value="${studentData.criteria.skillAndere || ''}" style="width:180px;"/>
                </div>
              </fieldset>
              <fieldset class="search-fieldset">
                <legend>Mijn Talen</legend>
                <div style="display:flex; flex-wrap:wrap; gap:1rem 0.5rem;">${renderTalenCheckboxes()}</div>
                <div style="display:flex; align-items:center; margin-top:0.5rem;">
                  <label class="checkbox-option" style="margin-right:0.5rem;">
                    <input type="checkbox" name="talen" value="andere" id="taal-andere" ${studentData.criteria.taalAndere ? 'checked' : ''}/> Andere:
                  </label>
                  <input type="text" id="taal-andere-text" name="taalAndereText" placeholder="Omschrijf hier" class="form-input" value="${studentData.criteria.taalAndere || ''}" style="width:180px;"/>
                </div>
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
    burger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.getElementById('nav-dashboard').addEventListener('click', () => {});
  document.getElementById('nav-settings').addEventListener('click', () => {});
  document.getElementById('nav-delete-account').addEventListener('click', () => {
    if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {}
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    renderLogin(rootElement);
  });

  // Form
  const form = document.getElementById('criteriaForm');
  const btnEdit = document.getElementById('btn-edit');
  const btnSave = document.getElementById('btn-save');
  const btnReset = document.getElementById('btn-reset');

  // LET OP: Alleen inputs/selects/checkboxes/radios disabled maken, GEEN BUTTONS!
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
      studentData.criteria.skills = [...form.querySelectorAll('input[name="skills"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== 'andere');
      studentData.criteria.talen = [...form.querySelectorAll('input[name="talen"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== 'andere');
      studentData.criteria.skillAndere = data.get('skillAndereText') || '';
      studentData.criteria.taalAndere = data.get('taalAndereText') || '';
      renderSearchCriteriaStudent(rootElement, studentData, true);
    });
  }

  // ANDERE SKILL -> custom toevoegen (en huidige selectie behouden!)
  const skillAndereBox = form.querySelector('#skill-andere');
  if (skillAndereBox) {
    skillAndereBox.addEventListener('change', (e) => {
      // Huidige skills ophalen (zodat je geen geselecteerde kwijtraakt!)
      studentData.criteria.skills = [...form.querySelectorAll('input[name="skills"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== 'andere');
      const textValue = form.querySelector('#skill-andere-text').value.trim();
      if (e.target.checked && textValue) {
        if (!studentData.criteria.customSkills.includes(textValue)) {
          studentData.criteria.customSkills.push(textValue);
          if (!studentData.criteria.skills.includes(textValue)) {
            studentData.criteria.skills.push(textValue);
          }
        }
        studentData.criteria.skillAndere = '';
        renderSearchCriteriaStudent(rootElement, studentData, false);
      }
    });
  }

  // ANDERE TAAL -> custom toevoegen (en huidige selectie behouden!)
  const taalAndereBox = form.querySelector('#taal-andere');
  if (taalAndereBox) {
    taalAndereBox.addEventListener('change', (e) => {
      // Huidige talen ophalen (zodat je geen geselecteerde kwijtraakt!)
      studentData.criteria.talen = [...form.querySelectorAll('input[name="talen"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== 'andere');
      const textValue = form.querySelector('#taal-andere-text').value.trim();
      if (e.target.checked && textValue) {
        if (!studentData.criteria.customTalen.includes(textValue)) {
          studentData.criteria.customTalen.push(textValue);
          if (!studentData.criteria.talen.includes(textValue)) {
            studentData.criteria.talen.push(textValue);
          }
        }
        studentData.criteria.taalAndere = '';
        renderSearchCriteriaStudent(rootElement, studentData, false);
      }
    });
  }

  // Maak andere tekstvak leeg als hij leeg is → vinkje uit
  const skillAndereText = form.querySelector('#skill-andere-text');
  if (skillAndereText) {
    skillAndereText.addEventListener('input', (e) => {
      if (!e.target.value.trim()) {
        form.querySelector('#skill-andere').checked = false;
      }
    });
  }
  const taalAndereText = form.querySelector('#taal-andere-text');
  if (taalAndereText) {
    taalAndereText.addEventListener('input', (e) => {
      if (!e.target.value.trim()) {
        form.querySelector('#taal-andere').checked = false;
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
