// src/views/search-criteria-bedrijf.js

import { renderLogin } from '../login.js';
import { renderBedrijfProfiel } from './bedrijf-profiel.js';
import { performLogout, logoutUser } from '../../utils/auth-api.js';
import {
  createBedrijfNavbar,
  setupBedrijfNavbarEvents,
} from '../../utils/bedrijf-navbar.js';

export function renderSearchCriteriaBedrijf(rootElement, bedrijfData = {}) {
  if (!bedrijfData.criteria) {
    bedrijfData.criteria = {
      zoekType: '',
      skills: [],
      skillAndere: '',
      talen: [],
      taalAndere: '',
    };
  }

  const { zoekType, skills, skillAndere, talen, taalAndere } =
    bedrijfData.criteria;
  rootElement.innerHTML = `
    ${createBedrijfNavbar('search-criteria')}
          <div class="content-header">
            <h1>Zoek-criteria</h1>
            <p>Stel je zoekcriteria in om de juiste studenten te vinden</p>
          </div>

        <div style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px;">
          <fieldset id="fieldset-jobType" style="margin-bottom: 1.5rem; border: none; padding: 0;">
            <legend><strong>Wij zoeken een</strong></legend>
            <input type="radio" id="radio-student" name="jobType" value="student">
            <label for="radio-student">Student</label><br>
            <input type="radio" id="radio-stagiair" name="jobType" value="stagiair">
            <label for="radio-stagiair">Stagiair</label><br>
            <input type="radio" id="radio-medewerker" name="jobType" value="medewerker">
            <label for="radio-medewerker">Medewerker</label>
          </fieldset>

          <fieldset id="fieldset-skills" style="margin-bottom: 1.5rem; border: none; padding: 0;">
            <legend><strong>Gewenste Skills</strong></legend>
            <input type="checkbox" id="skill-cyber" name="skills" value="cybersecurity">
            <label for="skill-cyber">Cybersecurity</label><br>
            <input type="checkbox" id="skill-networking" name="skills" value="networking">
            <label for="skill-networking">Networking</label><br>
            <input type="checkbox" id="skill-support" name="skills" value="tech-support">
            <label for="skill-support">Tech-Support</label><br>
            <input type="checkbox" id="skill-linux" name="skills" value="linux">
            <label for="skill-linux">Linux</label><br>
            <input type="checkbox" id="skill-andere" name="skills" value="andere">
            <label for="skill-andere">Andere</label>
            <input type="text" id="skill-andere-text" name="skillAndereText" placeholder="Omschrijf hier" style="margin-left: 0.5rem;">
          </fieldset>

          <fieldset id="fieldset-talen" style="margin-bottom: 1.5rem; border: none; padding: 0;">
            <legend><strong>Gewenste Talen</strong></legend>
            <input type="checkbox" id="taal-nl" name="talen" value="nederlands">
            <label for="taal-nl">Nederlands</label><br>
            <input type="checkbox" id="taal-fr" name="talen" value="frans">
            <label for="taal-fr">Frans</label><br>
            <input type="checkbox" id="taal-en" name="talen" value="english">
            <label for="taal-en">English</label><br>
            <input type="checkbox" id="taal-andere" name="talen" value="andere">
            <label for="taal-andere">Andere</label>
            <input type="text" id="taal-andere-text" name="taalAndereText" placeholder="Omschrijf hier" style="margin-left: 0.5rem;">
          </fieldset>          <div style="margin-top: 2rem;">
            <button id="btn-reset" style="margin-right: 1rem;">RESET</button>
            <button id="btn-save">SAVE</button>
          </div>        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Setup navbar events
  setupBedrijfNavbarEvents();

  const restoreCriteria = () => {
    if (zoekType) {
      const radio = document.querySelector(
        `#fieldset-jobType input[value="${zoekType}"]`
      );
      if (radio) radio.checked = true;
    }

    skills.forEach((val) => {
      let checkbox = document.querySelector(
        `#fieldset-skills input[value="${val}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      } else {
        const fieldsetSkills = document.getElementById('fieldset-skills');
        const newId = `skill-${val.replace(/\s+/g, '-').toLowerCase()}`;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
          <input type="checkbox" id="${newId}" name="skills" value="${val}" checked>
          <label for="${newId}">${val}</label><br>
        `;
        fieldsetSkills.appendChild(wrapper);
      }
    });
    if (skillAndere) {
      document.getElementById('skill-andere-text').value = skillAndere;
      document.getElementById('skill-andere').checked = true;
    }

    talen.forEach((val) => {
      let checkbox = document.querySelector(
        `#fieldset-talen input[value="${val}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      } else {
        const fieldsetTalen = document.getElementById('fieldset-talen');
        const newId = `taal-${val.replace(/\s+/g, '-').toLowerCase()}`;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
          <input type="checkbox" id="${newId}" name="talen" value="${val}" checked>
          <label for="${newId}">${val}</label><br>
        `;
        fieldsetTalen.appendChild(wrapper);
      }
    });
    if (taalAndere) {
      document.getElementById('taal-andere-text').value = taalAndere;
      document.getElementById('taal-andere').checked = true;
    }
  };

  restoreCriteria();

  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile':
          renderBedrijfProfiel(rootElement, bedrijfData);
          break;
      }
    });
  });

  // Burger-menu logout
  const navLogout = document.getElementById('nav-logout');
  if (navLogout) {
    navLogout.onclick = null;
    navLogout.addEventListener('click', async () => {
      const response = await logoutUser();
      console.log('Logout API response:', response);
      window.sessionStorage.clear();
      localStorage.clear();
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/');
      });
    });
  }
  // Profiel-formulier logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = null;
    logoutBtn.addEventListener('click', async () => {
      const response = await logoutUser();
      console.log('Logout API response:', response);
      window.sessionStorage.clear();
      localStorage.clear();
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/');
      });
    });
  }

  // BURGER-MENU
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', () => {
      dropdown.style.display =
        dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.getElementById('nav-dashboard').addEventListener('click', () => {
    alert('Navigeren naar Dashboard (nog te implementeren)');
  });
  document.getElementById('nav-settings').addEventListener('click', () => {
    alert('Navigeren naar Instellingen (nog te implementeren)');
  });
  document
    .getElementById('nav-delete-account')
    .addEventListener('click', () => {
      if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
        alert('Account verwijderen (nog te implementeren)');
      }
    });
  document.getElementById('nav-logout').addEventListener('click', async () => {
    await logoutUser();
    window.sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  });

  // RESET-KNOP
  document.getElementById('btn-reset').addEventListener('click', () => {
    document
      .querySelectorAll('input[type="checkbox"], input[type="radio"]')
      .forEach((chk) => {
        chk.checked = false;
      });
    document.getElementById('skill-andere-text').value = '';
    document.getElementById('taal-andere-text').value = '';
    // Reset opgeslagen criteria
    bedrijfData.criteria = {
      zoekType: '',
      skills: [],
      skillAndere: '',
      talen: [],
      taalAndere: '',
    };
  });

  // “Andere” SKILL: direct een nieuwe checkbox maken en originele “Andere” unchecken
  const skillAndereCheckbox = document.getElementById('skill-andere');
  skillAndereCheckbox.addEventListener('change', () => {
    const textValue = document.getElementById('skill-andere-text').value.trim();
    if (skillAndereCheckbox.checked && textValue) {
      skillAndereCheckbox.checked = false; // uncheck originele
      // Voeg dynamische checkbox toe
      const fieldsetSkills = document.getElementById('fieldset-skills');
      const existing = fieldsetSkills.querySelector(
        `input[value="${textValue}"]`
      );
      if (!existing) {
        const newId = `skill-${textValue.replace(/\s+/g, '-').toLowerCase()}`;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
          <input type="checkbox" id="${newId}" name="skills" value="${textValue}" checked>
          <label for="${newId}">${textValue}</label><br>
        `;
        fieldsetSkills.appendChild(wrapper);
      }
      // Sla direct op in bedrijfData
      if (!bedrijfData.criteria.skills.includes(textValue)) {
        bedrijfData.criteria.skills.push(textValue);
      }
      bedrijfData.criteria.skillAndere = textValue;
    }
  });

  // “Andere” TAAL: idem
  const taalAndereCheckbox = document.getElementById('taal-andere');
  taalAndereCheckbox.addEventListener('change', () => {
    const textValue = document.getElementById('taal-andere-text').value.trim();
    if (taalAndereCheckbox.checked && textValue) {
      taalAndereCheckbox.checked = false;
      // Voeg dynamische checkbox toe
      const fieldsetTalen = document.getElementById('fieldset-talen');
      const existing = fieldsetTalen.querySelector(
        `input[value="${textValue}"]`
      );
      if (!existing) {
        const newId = `taal-${textValue.replace(/\s+/g, '-').toLowerCase()}`;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
          <input type="checkbox" id="${newId}" name="talen" value="${textValue}" checked>
          <label for="${newId}">${textValue}</label><br>
        `;
        fieldsetTalen.appendChild(wrapper);
      }
      if (!bedrijfData.criteria.talen.includes(textValue)) {
        bedrijfData.criteria.talen.push(textValue);
      }
      bedrijfData.criteria.taalAndere = textValue;
    }
  });

  // SAVE-KNOP: bewaar radiokeuze, checkboxes, maar re-render niet
  document.getElementById('btn-save').addEventListener('click', () => {
    // Radiikoze: enkel één waarde
    const selectedRadio = document.querySelector(
      'input[name="jobType"]:checked'
    );
    bedrijfData.criteria.zoekType = selectedRadio ? selectedRadio.value : '';

    // Skills: alle checked (inclusief dynamische)
    const selectedSkills = Array.from(
      document.querySelectorAll('input[name="skills"]:checked')
    ).map((el) => el.value);
    bedrijfData.criteria.skills = selectedSkills;

    // Talen: alle checked
    const selectedTalen = Array.from(
      document.querySelectorAll('input[name="talen"]:checked')
    ).map((el) => el.value);
    bedrijfData.criteria.talen = selectedTalen;

    // SkillAndere en TaalAndere blijven zoals eerder ingesteld

    console.log('Opgeslagen Zoek-criteria:', bedrijfData.criteria);
    alert('Zoek-criteria zijn opgeslagen.');
    // Geen re-render → checkboxen/radio’s blijven zichtbaar zoals ze staan
  });

  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Privacy Policy pagina wordt hier geladen.');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Contacteer ons formulier wordt hier geladen.');
  });
}
// Bedrijf
