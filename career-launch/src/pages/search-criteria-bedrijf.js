// src/views/search-criteria-bedrijf.js

import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderBedrijfProfiel } from './bedrijf-profiel.js';
import { performLogout } from '../utils/auth-api.js';

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
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #ccc;">
      <div style="display: flex; align-items: center;">
        <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" style="margin-right: 0.5rem;" />
        <span>EhB Career Launch</span>
      </div>
      <button id="burger-menu" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">☰</button>
      <ul id="burger-dropdown" style="position: absolute; top: 3rem; right: 1rem; list-style: none; padding: 0.5rem; margin: 0; border: 1px solid #ccc; background: white; display: none; z-index: 100;">
        <li><button id="nav-dashboard" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Dashboard</button></li>
        <li><button id="nav-settings" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Instellingen</button></li>
        <li><button id="nav-delete-account" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Verwijder account</button></li>
        <li><button id="nav-logout" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Log out</button></li>
      </ul>
    </header>

    <div style="display: flex; margin-top: 0.5rem;">
      <nav id="sidebar" style="width: 180px; border-right: 1px solid #ccc; padding-right: 1rem;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li><button data-route="profile" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Profiel</button></li>
          <li><button data-route="search" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Zoek-criteria</button></li>
          <li><button data-route="speeddates" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Speeddates</button></li>
          <li><button data-route="requests" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Speeddates-verzoeken</button></li>
        </ul>
      </nav>

      <main style="flex: 1; padding: 1rem;">
        <h1>Zoek-criteria</h1>

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
          </fieldset>

          <div style="margin-top: 2rem;">
            <button id="btn-reset" style="margin-right: 1rem;">RESET</button>
            <button id="btn-save">SAVE</button>
          </div>
        </div>
      </main>
    </div>

    <footer style="text-align: center; margin-top: 1rem;">
      <a id="privacy-policy" href="#">Privacy Policy</a> |
      <a id="contacteer-ons" href="#">Contacteer ons</a>
    </footer>
  `;

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

  document.getElementById('nav-logout').addEventListener('click', async () => {
    try {
      const result = await performLogout();
      console.log('Logout result:', result);
      renderLogin(rootElement);
    } catch (error) {
      console.error('Logout error:', error);
      renderLogin(rootElement);
    }
  });

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
    try {
      const result = await performLogout();
      console.log('Logout result:', result);
      renderLogin(rootElement);
    } catch (error) {
      console.error('Logout error:', error);
      renderLogin(rootElement);
    }
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
    // Radiokoze: enkel één waarde
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
