import logoIcon from '../../Icons/favicon-32x32.png';
import { renderBedrijfProfiel } from './bedrijf-profiel.js';
import { renderBedrijfSpeeddates } from './bedrijf-speeddates.js';
import { renderBedrijfSpeeddatesRequests } from './bedrijf-speeddates-verzoeken.js';
import { renderBedrijfQRPopup } from './bedrijf-qr-popup.js';
import { renderLogin } from '../login.js';
import { showBedrijfSettingsPopup } from './bedrijf-settings.js';

export function renderSearchCriteriaBedrijf(rootElement, bedrijfData = {}, readonlyMode = true) {
  if (!bedrijfData.criteria) {
    bedrijfData.criteria = {
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
    const custom = (bedrijfData.criteria.customSkills || []);
    const result = standaard.concat(custom.map(c => ({ value: c, label: c })));
    return result.map(skill => `
      <label class="checkbox-option">
        <input type="checkbox" name="skills" value="${skill.value}" ${bedrijfData.criteria.skills.includes(skill.value) ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''} />
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
    const custom = (bedrijfData.criteria.customTalen || []);
    const result = standaard.concat(custom.map(c => ({ value: c, label: c })));
    return result.map(taal => `
      <label class="checkbox-option">
        <input type="checkbox" name="talen" value="${taal.value}" ${bedrijfData.criteria.talen.includes(taal.value) ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/>
        <span>${taal.label}</span>
      </label>
    `).join('');
  }

  // --------- HIER KOMT DE DYNAMISCHE BUTTONS LOGICA ----------
  function renderButtons() {
    if (readonlyMode) {
      return `<button id="btn-edit" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">EDIT</button>`;
    } else {
      return `
        <button id="btn-save" type="submit" class="bedrijf-profile-btn bedrijf-profile-btn-primary">SAVE</button>
        <button id="btn-reset" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">RESET</button>
      `;
    }
  }
  // -----------------------------------------------------------

  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link active">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Zoek-criteria</h1>
            <form id="criteriaForm" class="criteria-form" autocomplete="off">
              <fieldset class="search-fieldset">
                <legend>Ik zoek</legend>
                <div class="checkbox-group">
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="fulltime" ${bedrijfData.criteria.zoekType === 'fulltime' ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/> <span>Fulltime</span>
                  </label>
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="parttime" ${bedrijfData.criteria.zoekType === 'parttime' ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/> <span>Parttime</span>
                  </label>
                  <label class="checkbox-option" style="border-radius:18px;">
                    <input type="radio" name="jobType" value="stagiaire" ${bedrijfData.criteria.zoekType === 'stagiaire' ? 'checked' : ''} ${readonlyMode ? 'disabled' : ''}/> <span>Stagiair(e)</span>
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
              <div class="bedrijf-profile-buttons">
                ${renderButtons()}
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer class="bedrijf-profile-footer">
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
        case 'profile':
          renderBedrijfProfiel(rootElement, bedrijfData);
          break;
        case 'search':
          renderSearchCriteriaBedrijf(rootElement, bedrijfData);
          break;
        case 'speeddates':
          renderBedrijfSpeeddates(rootElement, bedrijfData);
          break;
        case 'requests':
          renderBedrijfSpeeddatesRequests(rootElement, bedrijfData);
          break;
        case 'studenten':
          import('./studenten.js').then(m => m.renderStudenten(rootElement, bedrijfData));
          break;
        case 'qr':
          renderBedrijfQRPopup(rootElement, bedrijfData);
          break;
      }
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
    document.addEventListener('click', function(event) {
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
      showBedrijfSettingsPopup(() => renderSearchCriteriaBedrijf(rootElement, bedrijfData));
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
  const originalCriteria = JSON.parse(JSON.stringify(bedrijfData.criteria));

  // Plaats deze code NA rootElement.innerHTML = ...
  const form = document.getElementById('criteriaForm');
  if (form) {
    // EDIT knop
    const editBtn = document.getElementById('btn-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        renderSearchCriteriaBedrijf(rootElement, bedrijfData, false);
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
          skills: Array.from(form.querySelectorAll('input[name="skills"]:checked')).map(i => i.value),
          talen: Array.from(form.querySelectorAll('input[name="talen"]:checked')).map(i => i.value),
          customSkills: [...bedrijfData.criteria.customSkills],
          customTalen: [...bedrijfData.criteria.customTalen],
        };
        bedrijfData.criteria = newCriteria;
        window.sessionStorage.setItem('bedrijfData', JSON.stringify(bedrijfData));
        renderSearchCriteriaBedrijf(rootElement, bedrijfData, true);
      });
    }

    // RESET knop
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        bedrijfData.criteria = JSON.parse(JSON.stringify(originalCriteria));
        renderSearchCriteriaBedrijf(rootElement, bedrijfData, false);
      });
    }

    // Toevoegen custom skill
    const addSkillBtn = document.getElementById('add-skill-btn');
    if (addSkillBtn) {
      addSkillBtn.addEventListener('click', () => {
        const input = document.getElementById('skill-andere-text');
        const value = input.value.trim();
        if (value && !bedrijfData.criteria.customSkills.includes(value)) {
          // Verzamel huidige geselecteerde skills vóór toevoegen
          const checkedSkills = Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(i => i.value);
          // Voeg de nieuwe custom skill toe aan customSkills en checkedSkills
          const newCustomSkills = [...bedrijfData.criteria.customSkills, value];
          const newSkills = [...checkedSkills, value];
          bedrijfData.criteria.customSkills = newCustomSkills;
          bedrijfData.criteria.skills = newSkills;
          input.value = '';
          renderSearchCriteriaBedrijf(rootElement, bedrijfData, false);
        }
      });
    }

    // Toevoegen custom taal
    const addTaalBtn = document.getElementById('add-taal-btn');
    if (addTaalBtn) {
      addTaalBtn.addEventListener('click', () => {
        const input = document.getElementById('taal-andere-text');
        const value = input.value.trim();
        if (value && !bedrijfData.criteria.customTalen.includes(value)) {
          // Verzamel huidige geselecteerde talen vóór toevoegen
          const checkedTalen = Array.from(document.querySelectorAll('input[name="talen"]:checked')).map(i => i.value);
          const newCustomTalen = [...bedrijfData.criteria.customTalen, value];
          const newTalen = [...checkedTalen, value];
          bedrijfData.criteria.customTalen = newCustomTalen;
          bedrijfData.criteria.talen = newTalen;
          input.value = '';
          renderSearchCriteriaBedrijf(rootElement, bedrijfData, false);
        }
      });
    }
  }
}
