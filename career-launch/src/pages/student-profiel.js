// src/views/student-profile.js

import defaultAvatar from '../Images/default.jpg'; // import default profielfoto
import logoIcon from '../Icons/favicon-32x32.png'; // import logo‐icoon
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
  // Injecteer alle benodigde HTML met CSS classes
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <!-- HEADER -->
      <header class="student-profile-header">
        <div class="logo-section">
          <img 
            src="${logoIcon}" 
            alt="Logo EhB Career Launch" 
            width="32" 
            height="32"
          />
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
        <!-- SIDEBAR -->
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link active">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>

        <!-- MAIN CONTENT -->
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Profiel</h1>            <!-- Profiel-weergave -->
            <div id="profile-view" class="student-profile-form-section">              <div class="student-profile-avatar-section">
                ${
                  profilePictureUrl
                    ? `<img 
                    src="${profilePictureUrl}" 
                    alt="Profielfoto ${firstName} ${lastName}" 
                    id="avatar-display"
                    class="student-profile-avatar"
                  />`
                    : `<div class="student-profile-avatar-placeholder" id="avatar-display">
                    <span>×</span>
                  </div>`
                }
              </div>
              
              <div class="student-profile-form-group">
                <label>Naam:</label>
                <div class="student-profile-display-field" id="display-name">${firstName} ${lastName}</div>
              </div>
              
              <div class="student-profile-form-group">
                <label>E-mailadres:</label>
                <div class="student-profile-display-field" id="display-email">${email}</div>
              </div>
              
              <div class="student-profile-form-group">
                <label>Studieprogramma:</label>
                <div class="student-profile-display-field" id="display-studyProgram">${studyProgram}</div>
              </div>
              
              <div class="student-profile-form-group">
                <label>Leerlingsjaar:</label>
                <div class="student-profile-display-field" id="display-year">${year}</div>
              </div>
              
              <div class="student-profile-form-group">
                <label>Geboortedatum:</label>
                <div class="student-profile-display-field" id="display-birthDate">${birthDate}</div>
              </div>
              
              <div class="student-profile-form-group">
                <label>Beschrijving:</label>
                <div class="student-profile-display-field" id="display-description">${description}</div>
              </div>
              
              <div class="student-profile-form-group">
                <label>LinkedIn:</label>
                <div class="student-profile-display-field">
                  <a id="display-linkedin" href="${linkedIn}" target="_blank" style="color: #007bff; text-decoration: none;">
                    ${linkedIn ? linkedIn : 'Niet ingesteld'}
                  </a>
                </div>
              </div>

              <div class="student-profile-buttons">
                <button id="edit-profile-btn" class="student-profile-btn student-profile-btn-secondary">BEWERK</button>
                <button id="logout-btn" class="student-profile-btn student-profile-btn-primary">UITLOGGEN</button>
              </div>
            </div>            <!-- Profiel bewerken -->
            <div id="profile-edit" class="student-profile-form-section" style="display: none;">              <div class="student-profile-avatar-section">
                ${
                  profilePictureUrl
                    ? `<img 
                    src="${profilePictureUrl}" 
                    alt="Profielfoto ${firstName} ${lastName}" 
                    id="avatar-preview"
                    class="student-profile-avatar"
                  />`
                    : `<div class="student-profile-avatar-placeholder" id="avatar-preview">
                    <span>×</span>
                  </div>`
                }
              </div>
              
              <div class="student-profile-form-group">
                <label for="photoInput">Profielfoto (max 2MB)</label>
                <input type="file" accept="image/*" id="photoInput">
              </div>
              
              <div class="student-profile-form-group">
                <label for="firstNameInput">Voornaam</label>
                <input type="text" id="firstNameInput" value="${firstName}" required>
              </div>
              
              <div class="student-profile-form-group">
                <label for="lastNameInput">Achternaam</label>
                <input type="text" id="lastNameInput" value="${lastName}" required>
              </div>
              
              <div class="student-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" required>
              </div>
              
              <div class="student-profile-form-group">
                <label for="studyProgramInput">Studieprogramma</label>
                <input type="text" id="studyProgramInput" value="${studyProgram}">
              </div>
              
              <div class="student-profile-form-group">
                <label for="yearInput">Leerlingsjaar</label>
                <input type="text" id="yearInput" value="${year}">
              </div>
              
              <div class="student-profile-form-group">
                <label for="birthDateInput">Geboortedatum</label>
                <input type="date" id="birthDateInput" value="${birthDate}">
              </div>
              
              <div class="student-profile-form-group">
                <label for="descriptionInput">Beschrijving</label>
                <textarea id="descriptionInput" rows="3">${description}</textarea>
              </div>
              
              <div class="student-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedIn}">
              </div>

              <div class="student-profile-buttons">
                <button id="cancel-edit-btn" class="student-profile-btn student-profile-btn-secondary">RESET</button>
                <button id="save-profile-btn" class="student-profile-btn student-profile-btn-primary">SAVE</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->      <footer class="student-profile-footer">        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
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
      dropdown.style.display =
        dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  // Hamburger‐opties: Dashboard, Instellingen, Verwijder account, Log out
  document.getElementById('nav-dashboard').addEventListener('click', () => {
    // Navigeren naar Dashboard (nog te implementeren)
  });
  document.getElementById('nav-settings').addEventListener('click', () => {
    // Navigeren naar Instellingen (nog te implementeren)
  });
  document
    .getElementById('nav-delete-account')
    .addEventListener('click', () => {
      if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
        // Account verwijderen (nog te implementeren)
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
      const avatarPreview = document.getElementById('avatar-preview');

      // Replace placeholder with actual image
      avatarPreview.outerHTML = `<img 
        src="${objectUrl}" 
        alt="Profielfoto preview" 
        id="avatar-preview"
        class="student-profile-avatar"
      />`;

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
      profilePictureUrl: studentData.profilePictureUrl,
    };

    // Eenvoudige validatie: alleen verplicht voornaam/achternaam
    if (!updatedData.firstName || !updatedData.lastName) {
      alert('Voor- en achternaam mogen niet leeg zijn.');
      return;
    }

    // TODO: stuur updatedData naar backend    // Toon opnieuw de view‐sectie met bijgewerkte data
    renderStudentProfiel(rootElement, updatedData);
  });
  // FOOTER LINKS
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
      // Use absolute path to ensure correct navigation regardless of current path
      Router.navigate('/contact');
    });
  });
  //aaaaa
}
