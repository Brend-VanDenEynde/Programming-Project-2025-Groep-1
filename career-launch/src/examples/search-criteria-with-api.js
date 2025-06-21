/**
 * Voorbeeld van hoe de search-criteria-student.js pagina geüpdatet zou kunnen worden
 * om skills en andere data van de API te halen met automatische token refresh
 */

import logoIcon from '../icons/favicon-32x32.png';
import { renderLogin } from '../pages/login.js';
import { renderStudentProfiel } from '../pages/student/student-profiel.js';
import { fetchSkills, saveSearchCriteria } from '../utils/data-api.js';

export async function renderSearchCriteriaStudent(
  rootElement,
  studentData = {}
) {
  // Maak criteria-object als het nog niet bestaat
  if (!studentData.criteria) {
    studentData.criteria = {
      zoekType: '',
      skills: [],
      skillAndere: '',
      talen: [],
      taalAndere: '',
    };
  }

  const { zoekType, skills, skillAndere, talen, taalAndere } =
    studentData.criteria;

  // Haal skills van de API op
  let availableSkills = [];
  try {
    availableSkills = await fetchSkills();
  } catch (error) {
    console.error('Failed to fetch skills:', error);

    if (error.message.includes('Authentication failed')) {
      alert(
        'Je sessie is verlopen. Je wordt doorgestuurd naar de login pagina.'
      );
      renderLogin(rootElement);
      return;
    }

    // Fallback naar hardcoded skills
    availableSkills = [
      { id: 1, naam: 'JavaScript' },
      { id: 2, naam: 'Python' },
      { id: 3, naam: 'Java' },
      { id: 4, naam: 'C#' },
      { id: 5, naam: 'CSS' },
      { id: 6, naam: 'HTML' },
    ];
  }

  // Genereer skills checkboxes dynamisch
  const skillsHTML = availableSkills
    .map(
      (skill) =>
        `<input type="checkbox" id="skill-${skill.id}" name="skills" value="${skill.naam}">
     <label for="skill-${skill.id}">${skill.naam}</label><br>`
    )
    .join('');

  rootElement.innerHTML = `
    <!-- HEADER -->
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #ccc;">
      <div style="display: flex; align-items: center;">
        <img 
          src="${logoIcon}" 
          alt="Logo EhB Career Launch" 
          width="32" 
          height="32"
        />
        <span style="margin-left: 0.5rem; font-weight: bold;">EhB Career Launch</span>
      </div>
      <button id="burger-menu" style="background: none; border: none; font-size: 1.5rem;">☰</button>
      <ul id="burger-dropdown" style="display: none; position: absolute; top: 3rem; right: 1rem; background: white; border: 1px solid #ccc; list-style: none; padding: 0.5rem; margin: 0;">
        <li><button id="nav-dashboard" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Dashboard</button></li>
        <li><button id="nav-settings" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Instellingen</button></li>
        <li><button id="nav-delete-account" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Verwijder account</button></li>
        <li><button id="nav-logout" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Log out</button></li>
      </ul>
    </header>

    <div style="display: flex; margin-top: 0.5rem;">
      <!-- SIDEBAR -->
      <nav id="sidebar" style="width: 180px; border-right: 1px solid #ccc; padding-right: 1rem;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li><button data-route="profile" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Profiel</button></li>
          <li><button data-route="search" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Zoek-criteria</button></li>
          <li><button data-route="speeddates" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Speeddates</button></li>
          <li><button data-route="requests" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Speeddates-verzoeken</button></li>
          <li><button data-route="qr" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">QR-code</button></li>
        </ul>
      </nav>

      <!-- MAIN CONTENT -->
      <main style="flex: 1; padding: 1rem;">
        <h1>Zoek-criteria</h1>

        <div style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px;">
          <!-- Ik zoek (radio-buttons) -->
          <fieldset id="fieldset-jobType" style="margin-bottom: 1.5rem; border: none; padding: 0;">
            <legend><strong>Ik zoek</strong></legend>
            <input type="radio" id="radio-fulltime" name="jobType" value="fulltime">
            <label for="radio-fulltime">Fulltime</label><br>
            <input type="radio" id="radio-parttime" name="jobType" value="parttime">
            <label for="radio-parttime">Parttime</label><br>
            <input type="radio" id="radio-stagiaire" name="jobType" value="stagiaire">
            <label for="radio-stagiaire">Stagiair(e)</label>
          </fieldset>

          <!-- Mijn Skills (dynamisch geladen van API) -->
          <fieldset id="fieldset-skills" style="margin-bottom: 1.5rem; border: none; padding: 0;">
            <legend><strong>Mijn Skills</strong></legend>
            ${skillsHTML}
            <input type="checkbox" id="skill-andere" name="skills" value="andere">
            <label for="skill-andere">Andere</label>
            <input type="text" id="skill-andere-text" name="skillAndereText" placeholder="Omschrijf hier" style="margin-left: 0.5rem;">
          </fieldset>

          <!-- Mijn Talen (checkboxes + "Andere") -->
          <fieldset id="fieldset-talen" style="margin-bottom: 1.5rem; border: none; padding: 0;">
            <legend><strong>Mijn Talen</strong></legend>
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

          <!-- Knoppen -->
          <div style="margin-top: 2rem;">
            <button id="btn-reset" style="margin-right: 1rem;">RESET</button>
            <button id="btn-save">SAVE</button>
          </div>
        </div>
      </main>
    </div>
    
    <!-- FOOTER -->
    <footer class="student-profile-footer">
      <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
      <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
    </footer>
  `;

  // Restore opgeslagen criteria
  restoreCriteria();

  // SAVE-KNOP: bewaar naar API
  document.getElementById('btn-save').addEventListener('click', async () => {
    // Verzamel alle geselecteerde waarden
    const selectedRadio = document.querySelector(
      'input[name="jobType"]:checked'
    );
    studentData.criteria.zoekType = selectedRadio ? selectedRadio.value : '';

    const selectedSkills = Array.from(
      document.querySelectorAll('input[name="skills"]:checked')
    ).map((el) => el.value);
    studentData.criteria.skills = selectedSkills;

    const selectedTalen = Array.from(
      document.querySelectorAll('input[name="talen"]:checked')
    ).map((el) => el.value);
    studentData.criteria.talen = selectedTalen;

    // Probeer criteria op te slaan via API
    try {
      const studentId = window.sessionStorage.getItem('currentStudentId');
      if (studentId) {
        await saveSearchCriteria(studentId, studentData.criteria);
        alert('Zoek-criteria succesvol opgeslagen!');
      } else {
        alert('Zoek-criteria zijn lokaal opgeslagen.');
      }
    } catch (error) {
      console.error('Failed to save search criteria:', error);

      if (error.message.includes('Authentication failed')) {
        alert(
          'Je sessie is verlopen. Je wordt doorgestuurd naar de login pagina.'
        );
        renderLogin(rootElement);
        return;
      }

      alert(
        'Criteria zijn lokaal opgeslagen, maar konden niet naar de server worden gestuurd.'
      );
    }
  });

  // ... rest van de event listeners blijven hetzelfde ...

  function restoreCriteria() {
    // Radio-buttons
    if (zoekType) {
      const radio = document.querySelector(
        `#fieldset-jobType input[value="${zoekType}"]`
      );
      if (radio) radio.checked = true;
    }

    // Skills checkboxes
    skills.forEach((val) => {
      let checkbox = document.querySelector(
        `#fieldset-skills input[value="${val}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    // Talen checkboxes
    talen.forEach((val) => {
      let checkbox = document.querySelector(
        `#fieldset-talen input[value="${val}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    // Andere velden
    if (skillAndere) {
      document.getElementById('skill-andere-text').value = skillAndere;
    }
    if (taalAndere) {
      document.getElementById('taal-andere-text').value = taalAndere;
    }
  }
}
