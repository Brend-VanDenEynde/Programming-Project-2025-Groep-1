// src/views/student-profile.js
import { renderLogin } from '../login.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import Router from '../router.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { showSettingsPopup } from './student-settings.js';

const defaultProfile = {
  firstName: 'Voornaam',
  lastName: 'Achternaam',
  email: 'student@voorbeeld.com',
  studyProgram: 'Opleiding',
  year: '1',
  profilePictureUrl: 'src/Images/default.jpg',
  linkedIn: '',
  birthDate: '',
  description: '',
};

export function renderStudentProfiel(rootElement, studentData = {}, readonlyMode = true) {
  const {
    firstName = defaultProfile.firstName,
    lastName = defaultProfile.lastName,
    email = defaultProfile.email,
    studyProgram = defaultProfile.studyProgram,
    year = defaultProfile.year,
    profilePictureUrl = defaultProfile.profilePictureUrl,
    linkedIn = defaultProfile.linkedIn,
    birthDate = defaultProfile.birthDate,
    description = defaultProfile.description,
  } = studentData;

  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="src/Icons/favicon-32x32.png" alt="Logo EhB Career Launch" width="32" height="32"/>
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
            <li><button data-route="profile" class="sidebar-link active">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Profiel</h1>
            <form id="profileForm" class="student-profile-form" autocomplete="off" enctype="multipart/form-data">
              <div class="student-profile-avatar-section">
                <img 
                  src="${profilePictureUrl}" 
                  alt="Profielfoto ${firstName} ${lastName}" 
                  id="avatar-preview"
                  class="student-profile-avatar"
                />
                <input type="file" accept="image/*" id="photoInput" style="display:${readonlyMode ? 'none' : 'block'};margin-top:10px;">
              </div>
              <div class="student-profile-form-group">
                <label for="firstNameInput">Voornaam</label>
                <input type="text" id="firstNameInput" value="${firstName}" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="lastNameInput">Achternaam</label>
                <input type="text" id="lastNameInput" value="${lastName}" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="studyProgramInput">Studieprogramma</label>
                <input type="text" id="studyProgramInput" value="${studyProgram}" ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="yearInput">Opleidingsjaar</label>
                <select id="yearInput" ${readonlyMode ? 'disabled' : ''}>
                  <option value="1" ${year == '1' ? 'selected' : ''}>1</option>
                  <option value="2" ${year == '2' ? 'selected' : ''}>2</option>
                  <option value="3" ${year == '3' ? 'selected' : ''}>3</option>
                </select>
              </div>
              <div class="student-profile-form-group">
                <label for="birthDateInput">Geboortedatum</label>
                <input type="date" id="birthDateInput" value="${birthDate}" ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedIn}" ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-buttons">
                ${
                  readonlyMode
                    ? `
                      <button id="btn-edit-profile" type="button" class="student-profile-btn student-profile-btn-secondary">EDIT</button>
                      <button id="logout-btn" type="button" class="student-profile-btn student-profile-btn-secondary">LOG OUT</button>
                    `
                    : `
                      <button id="btn-save-profile" type="submit" class="student-profile-btn student-profile-btn-primary">SAVE</button>
                      <button id="btn-reset-profile" type="button" class="student-profile-btn student-profile-btn-secondary">RESET</button>
                    `
                }
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

 document.querySelectorAll('.sidebar-link').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const route = e.currentTarget.getAttribute('data-route');
    switch (route) {
      case 'profile':
        window.appRouter.navigate('/Student/Student-Profiel');
        break;
      case 'search':
        window.appRouter.navigate('/Student/Zoek-Criteria');
        break;
      case 'speeddates':
        window.appRouter.navigate('/Student/Student-Speeddates');
        break;
      case 'requests':
        window.appRouter.navigate('/Student/Student-Speeddates-Verzoeken');
        break;
      case 'qr':
        window.appRouter.navigate('/Student/Student-QR-Popup');
        break;
    }
  });
});


  // Burger menu
const burger = document.getElementById('burger-menu');
const dropdown = document.getElementById('burger-dropdown');

if (burger && dropdown) {
  // Toggle menu bij klik op burger
  burger.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Sluit menu bij klik buiten menu of burger
  document.addEventListener('click', function(event) {
    if (
      dropdown.classList.contains('open') &&
      !dropdown.contains(event.target) &&
      event.target !== burger
    ) {
      dropdown.classList.remove('open');
    }
  });

  // Navigeer via de router!
  document.getElementById('nav-settings').addEventListener('click', () => {
    dropdown.classList.remove('open');
    showSettingsPopup(() => renderStudentProfiel(rootElement));
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    dropdown.classList.remove('open');
    window.appRouter.navigate('/login');
  });
}


  // ===== Edit functionaliteit =====
  const form = document.getElementById('profileForm');
  const btnEdit = document.getElementById('btn-edit-profile');
  const btnSave = document.getElementById('btn-save-profile');
  const btnReset = document.getElementById('btn-reset-profile');
  const photoInput = document.getElementById('photoInput');
  const avatarPreview = document.getElementById('avatar-preview');

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
  if (photoInput) photoInput.style.display = readonlyMode ? 'none' : 'block';

  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      renderStudentProfiel(rootElement, studentData, false);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      renderStudentProfiel(rootElement, { ...defaultProfile }, false);
    });
  }

  if (btnSave) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedData = {
        ...studentData,
        firstName: document.getElementById('firstNameInput').value.trim(),
        lastName: document.getElementById('lastNameInput').value.trim(),
        email: document.getElementById('emailInput').value.trim(),
        studyProgram: document.getElementById('studyProgramInput').value.trim(),
        year: document.getElementById('yearInput').value,
        birthDate: document.getElementById('birthDateInput').value,
        description: document.getElementById('descriptionInput').value.trim(),
        linkedIn: document.getElementById('linkedinInput').value.trim(),
        profilePictureUrl: studentData.profilePictureUrl,
      };
      renderStudentProfiel(rootElement, updatedData, true);
    });
  }

  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('De foto mag maximaal 2 MB zijn.');
          e.target.value = '';
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        avatarPreview.src = objectUrl;
        studentData.profilePictureUrl = objectUrl;
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
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
}
