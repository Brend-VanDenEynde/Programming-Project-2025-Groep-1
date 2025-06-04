// src/views/student-profile.js

import defaultAvatar from '../Images/default.jpg';             // import default profielfoto
import logoIcon from '../Icons/favicon-32x32.png';             // import logo‐icoon
import { renderLogin } from './login.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';

export function renderStudentProfiel(rootElement, studentData = {}) {
  // Destructure met fallback‐waarden
  const {
    firstName = 'Voornaam',
    lastName = 'Achternaam',
    email = 'student@voorbeeld.com',
    studyProgram = 'Opleiding',
    year = 'Jaar',
    profilePictureUrl = defaultAvatar,
    linkedIn = '',
    birthDate = '',
    description = '',
  } = studentData;

  // Injecteer alle benodigde HTML (zonder extra CSS)
  rootElement.innerHTML = `
    <!-- HEADER -->
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #ccc;">
      <div style="display: flex; align-items: center;">
        <img 
          src="${logoIcon}" 
          alt="Logo EhB Career Launch" 
          width="32" 
          height="32" 
          style="margin-right: 0.5rem;"
        />
        <span>EhB Career Launch</span>
      </div>
      <button id="burger-menu" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">☰</button>
      <ul id="burger-dropdown" style="position: absolute; top: 3rem; right: 1rem; list-style: none; padding: 0.5rem; margin: 0; border: 1px solid #ccc; background: white; display: none;">
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
        <h1>Profiel</h1>

        <!-- Profiel-weergave -->
        <div id="profile-view">
          <div>
            <img 
              src="${profilePictureUrl}" 
              alt="Profielfoto ${firstName} ${lastName}" 
              id="avatar-display"
              width="120" height="120"
            />
          </div>
          <div>
            <label>Naam:</label>
            <span id="display-name">${firstName} ${lastName}</span>
          </div>
          <div>
            <label>E-mailadres:</label>
            <span id="display-email">${email}</span>
          </div>
          <div>
            <label>Studieprogramma:</label>
            <span id="display-studyProgram">${studyProgram}</span>
          </div>
          <div>
            <label>Leerlingsjaar:</label>
            <span id="display-year">${year}</span>
          </div>
          <div>
            <label>Geboortedatum:</label>
            <span id="display-birthDate">${birthDate}</span>
          </div>
          <div>
            <label>Beschrijving:</label>
            <span id="display-description">${description}</span>
          </div>
          <div>
            <label>LinkedIn:</label>
            <a id="display-linkedin" href="${linkedIn}" target="_blank">
              ${linkedIn ? linkedIn : 'Niet ingesteld'}
            </a>
          </div>

          <div style="margin-top: 1rem;">
            <button id="edit-profile-btn">BEWERK</button>
            <button id="logout-btn">UITLOGGEN</button>
          </div>
        </div>

        <!-- Profiel bewerken -->
        <div id="profile-edit" style="display: none; margin-top: 1rem;">
          <div>
            <img 
              src="${profilePictureUrl}" 
              alt="Profielfoto ${firstName} ${lastName}" 
              id="avatar-preview"
              width="120" height="120"
            />
          </div>
          <div>
            <label for="photoInput">Profielfoto (max 2MB)</label><br>
            <input type="file" accept="image/*" id="photoInput">
          </div>
          <div>
            <label for="firstNameInput">Voornaam</label><br>
            <input type="text" id="firstNameInput" value="${firstName}" required>
          </div>
          <div>
            <label for="lastNameInput">Achternaam</label><br>
            <input type="text" id="lastNameInput" value="${lastName}" required>
          </div>
          <div>
            <label for="emailInput">E-mailadres</label><br>
            <input type="email" id="emailInput" value="${email}" required>
          </div>
          <div>
            <label for="studyProgramInput">Studieprogramma</label><br>
            <input type="text" id="studyProgramInput" value="${studyProgram}">
          </div>
          <div>
            <label for="yearInput">Leerlingsjaar</label><br>
            <input type="text" id="yearInput" value="${year}">
          </div>
          <div>
            <label for="birthDateInput">Geboortedatum</label><br>
            <input type="date" id="birthDateInput" value="${birthDate}">
          </div>
          <div>
            <label for="descriptionInput">Beschrijving</label><br>
            <textarea id="descriptionInput" rows="3">${description}</textarea>
          </div>
          <div>
            <label for="linkedinInput">LinkedIn-link</label><br>
            <input type="url" id="linkedinInput" value="${linkedIn}">
          </div>

          <div style="margin-top: 1rem;">
            <button id="save-profile-btn">OPSLAAN</button>
            <button id="cancel-edit-btn">ANNULEREN</button>
          </div>
        </div>
      </main>
    </div>

    <!-- FOOTER -->
    <footer style="text-align: center; margin-top: 1rem;">
      <a id="privacy-policy" href="#">Privacy Policy</a> |
      <a id="contacteer-ons" href="#">Contacteer ons</a>
    </footer>
  `;

  // Sidebar-navigatie: “Zoek-criteria” link
  const searchBtn = document.querySelector('[data-route="search"]');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      renderSearchCriteriaStudent(rootElement, studentData);
    });
  }

  // Sidebar toggler (burger-menu)
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }

  // Hamburger‐opties: Dashboard, Instellingen, Verwijder account, Log out
  document.getElementById('nav-dashboard').addEventListener('click', () => {
    alert('Navigeren naar Dashboard (nog te implementeren)');
  });
  document.getElementById('nav-settings').addEventListener('click', () => {
    alert('Navigeren naar Instellingen (nog te implementeren)');
  });
  document.getElementById('nav-delete-account').addEventListener('click', () => {
    if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
      alert('Account verwijderen (nog te implementeren)');
    }
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    renderLogin(rootElement);
  });

  // UITLOGGEN (in profiel‐weergave)
  document.getElementById('logout-btn').addEventListener('click', () => {
    renderLogin(rootElement);
  });

  // SCHAKEL WEERGAVE ↔ BEWERKEN
  const editBtn = document.getElementById('edit-profile-btn');
  const viewSection = document.getElementById('profile-view');
  const editSection = document.getElementById('profile-edit');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  editBtn.addEventListener('click', () => {
    viewSection.style.display = 'none';
    editSection.style.display = 'block';
  });
  cancelBtn.addEventListener('click', () => {
    editSection.style.display = 'none';
    viewSection.style.display = 'block';
  });

  // PROFIElFOTO‐UPLOAD EN PREVIEW
  document.getElementById('photoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxSize) {
        alert('De foto mag maximaal 2 MB zijn.');
        e.target.value = '';
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      document.getElementById('avatar-preview').src = objectUrl;
      // Werk in‐memory studentData bij
      studentData.profilePictureUrl = objectUrl;
    }
  });

  // OPSLAAN‐KNOP (zonder e-mailvalidatie)
  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const updatedData = {
      ...studentData,
      firstName: document.getElementById('firstNameInput').value.trim(),
      lastName: document.getElementById('lastNameInput').value.trim(),
      email: document.getElementById('emailInput').value.trim(),
      studyProgram: document.getElementById('studyProgramInput').value.trim(),
      year: document.getElementById('yearInput').value.trim(),
      birthDate: document.getElementById('birthDateInput').value,
      description: document.getElementById('descriptionInput').value.trim(),
      linkedIn: document.getElementById('linkedinInput').value.trim(),
      profilePictureUrl: studentData.profilePictureUrl
    };

    // Eenvoudige validatie: alleen verplicht voornaam/achternaam
    if (!updatedData.firstName || !updatedData.lastName) {
      alert('Voor- en achternaam mogen niet leeg zijn.');
      return;
    }

    // TODO: stuur updatedData naar backend

    // Toon opnieuw de view‐sectie met bijgewerkte data
    renderStudentProfiel(rootElement, updatedData);
    alert('Profielgegevens succesvol opgeslagen.');
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
