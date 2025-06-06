// src/views/student-profile.js
import defaultAvatar from '../Images/default.jpg';
import { renderLogin } from './login.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';

const defaultProfile = {
  firstName: 'Voornaam',
  lastName: 'Achternaam',
  email: 'student@voorbeeld.com',
  studyProgram: 'Opleiding',
  year: '1',
  profilePictureUrl: defaultAvatar,
  linkedIn: '',
  birthDate: '',
  description: '',
};

if (!document.getElementById('student-profile-styles')) {
  const style = document.createElement('style');
  style.id = 'student-profile-styles';
  style.innerHTML = `
    .student-profile-form-container {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 2px 16px 0 rgba(44,44,44,0.08);
      padding: 30px 22px 38px 22px;
      margin: 38px auto 0 auto;
      max-width: 620px;
    }
    .student-profile-title {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 32px;
      color: #1e2a45;
      text-align: center;
    }
    .student-profile-form-group {
      margin-bottom: 20px;
    }
    .student-profile-form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #344164;
      font-size: 1.07rem;
      letter-spacing: .01em;
    }
    .student-profile-form-group input[type="text"],
    .student-profile-form-group input[type="email"],
    .student-profile-form-group input[type="date"],
    .student-profile-form-group input[type="url"],
    .student-profile-form-group select,
    .student-profile-form-group textarea {
      width: 100%;
      border: 1.3px solid #e1e6ef;
      background: #f6f7fb;
      border-radius: 10px;
      font-size: 1.07rem;
      padding: 12px 15px;
      margin-top: 2px;
      color: #1e2a45;
      outline: none;
      transition: border .17s;
      resize: none;
    }
    .student-profile-form-group input:disabled,
    .student-profile-form-group select:disabled,
    .student-profile-form-group textarea:disabled {
      color: #98a0b3;
      background: #f6f7fb;
      border-color: #e9ebf0;
    }
    .student-profile-form-group input[type="file"] {
      margin-top: 7px;
      padding: 0;
      border: none;
      background: none;
    }
    .student-profile-avatar-section {
      text-align: center;
      margin-bottom: 24px;
    }
    .student-profile-avatar {
      object-fit: cover;
      width: 110px;
      height: 110px;
      border-radius: 50%;
      box-shadow: 0 2px 8px #0001;
      border: 3px solid #f6f7fb;
      background: #fff;
    }
    .student-profile-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
      margin-top: 14px;
    }
    .student-profile-btn {
      min-width: 110px;
      border: none;
      border-radius: 22px;
      font-weight: 700;
      font-size: 1rem;
      padding: 11px 0;
      cursor: pointer;
      transition: background .17s, color .17s, box-shadow .17s;
      box-shadow: 0 2px 8px 0 rgba(44,44,44,0.06);
      letter-spacing: .04em;
    }
    .student-profile-btn-primary {
      background: linear-gradient(90deg, #3dd686 0%, #28bb8a 100%);
      color: #fff;
    }
    .student-profile-btn-primary:hover {
      background: linear-gradient(90deg, #28bb8a 0%, #3dd686 100%);
      color: #fff;
      box-shadow: 0 4px 14px 0 rgba(61,214,134,0.16);
    }
    .student-profile-btn-secondary {
      background: linear-gradient(90deg, #e4eafd 0%, #cfd7ea 100%);
      color: #234;
    }
    .student-profile-btn-secondary:hover {
      background: linear-gradient(90deg, #cfd7ea 0%, #e4eafd 100%);
      color: #222;
      box-shadow: 0 4px 14px 0 rgba(44,44,44,0.08);
    }
    @media (max-width: 700px) {
      .student-profile-form-container {padding: 10px 2px 20px 2px;}
      .student-profile-title {font-size: 1.3rem;}
      .student-profile-avatar {width:78px;height:78px;}
    }
  `;
  document.head.appendChild(style);
}

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
                <label for="descriptionInput">Beschrijving</label>
                <textarea id="descriptionInput" rows="3" ${readonlyMode ? 'disabled' : ''}>${description}</textarea>
              </div>
              <div class="student-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedIn}" ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-buttons">
                ${
                  readonlyMode
                    ? `
                      <button id="btn-edit-profile" type="button" class="student-profile-btn student-profile-btn-secondary">BEWERK</button>
                      <button id="logout-btn" type="button" class="student-profile-btn student-profile-btn-secondary">UITLOGGEN</button>
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
        case 'profile': renderStudentProfiel(rootElement, studentData, true); break;
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
      dropdown.style.display =
        dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.getElementById('nav-dashboard').addEventListener('click', () => {});
  document.getElementById('nav-settings').addEventListener('click', () => {});
  document.getElementById('nav-delete-account').addEventListener('click', () => {
    if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
      // Account verwijderen (nog te implementeren)
    }
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    renderLogin(rootElement);
  });

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
      renderLogin(rootElement);
    });
  }

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
