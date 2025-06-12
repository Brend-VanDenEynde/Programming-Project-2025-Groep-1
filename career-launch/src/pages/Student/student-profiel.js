import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
import logoIcon from '../../Icons/favicon-32x32.png';

// defaultProfile gebruikt nu ook enkel NL velden!
const defaultProfile = {
  voornaam: 'Voornaam',
  achternaam: 'Achternaam',
  email: 'student@voorbeeld.com',
  studiejaar: '1',
  profiel_foto: 'src/Images/default.jpg',
  linkedin: '',
  geboortedatum: '',
  opleiding_id: null,
};

export function renderStudentProfiel(rootElement, studentData = {}, readonlyMode = true) {
  // Direct alle velden uit je backend of fallback naar default:
  const {
    voornaam = defaultProfile.voornaam,
    achternaam = defaultProfile.achternaam,
    email = defaultProfile.email,
    studiejaar = defaultProfile.studiejaar,
    profiel_foto = defaultProfile.profiel_foto,
    linkedin = defaultProfile.linkedin,
    geboortedatum = defaultProfile.geboortedatum,
    opleiding_id = defaultProfile.opleiding_id,
  } = studentData;

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
            <li><button data-route="profile" class="sidebar-link active">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Profiel</h1>
            <form id="profileForm" class="student-profile-form" autocomplete="off" enctype="multipart/form-data">
              <div class="student-profile-avatar-section">
                <img 
                  src="${profiel_foto}" 
                  alt="Profielfoto ${voornaam} ${achternaam}" 
                  id="avatar-preview"
                  class="student-profile-avatar"
                />
                <input type="file" accept="image/*" id="photoInput" style="display:${readonlyMode ? 'none' : 'block'};margin-top:10px;">
              </div>
              <div class="student-profile-form-group">
                <label for="firstNameInput">Voornaam</label>
                <input type="text" id="firstNameInput" value="${voornaam}" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="lastNameInput">Achternaam</label>
                <input type="text" id="lastNameInput" value="${achternaam}" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="studyProgramInput">Studieprogramma</label>
                <input type="text" id="studyProgramInput" value="${opleiding_id !== null ? opleiding_id : ''}" disabled>
              </div>
              <div class="student-profile-form-group">
                <label for="yearInput">Opleidingsjaar</label>
                <select id="yearInput" ${readonlyMode ? 'disabled' : ''}>
                  <option value="1" ${studiejaar == '1' ? 'selected' : ''}>1</option>
                  <option value="2" ${studiejaar == '2' ? 'selected' : ''}>2</option>
                  <option value="3" ${studiejaar == '3' ? 'selected' : ''}>3</option>
                </select>
              </div>
              <div class="student-profile-form-group">
                <label for="birthDateInput">Geboortedatum</label>
                <input type="date" id="birthDateInput" value="${geboortedatum}" ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="student-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedin}" ${readonlyMode ? 'disabled' : ''}>
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
          renderStudentProfiel(rootElement, studentData);
          break;
        case 'search':
          import('./search-criteria-student.js').then(m => m.renderSearchCriteriaStudent(rootElement, studentData));
          break;
        case 'speeddates':
          import('./student-speeddates.js').then(m => m.renderSpeeddates(rootElement, studentData));
          break;
        case 'requests':
          import('./student-speeddates-verzoeken.js').then(m => m.renderSpeeddatesRequests(rootElement, studentData));
          break;
        case 'bedrijven':
          import('./bedrijven.js').then(m => m.renderBedrijven(rootElement, studentData));
          break;
        case 'qr':
          import('./student-qr-popup.js').then(m => m.renderQRPopup(rootElement, studentData));
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
      // Eerst sluiten bij elke klik, daarna openen als hij nog niet open is
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
      showSettingsPopup(() => renderStudentProfiel(rootElement, studentData));
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      // Volledige logout: wis alle relevante storage
      window.sessionStorage.removeItem('studentData');
      window.sessionStorage.removeItem('authToken');
      window.sessionStorage.removeItem('userType');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    });

    // Ook de LOG OUT knop in het profiel-formulier zelf (voor desktop)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Volledige logout: wis alle relevante storage
        window.sessionStorage.removeItem('studentData');
        window.sessionStorage.removeItem('authToken');
        window.sessionStorage.removeItem('userType');
        localStorage.setItem('darkmode', 'false');
        document.body.classList.remove('darkmode');
        renderLogin(rootElement);
      });
    }
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

  // Originele data voor reset
  const originalData = { ...studentData };

  // Event handlers voor profiel bewerken
  const form = document.getElementById('profileForm');
  if (form) {
    // EDIT knop
    const editBtn = document.getElementById('btn-edit-profile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        renderStudentProfiel(rootElement, studentData, false);
      });
    }

    // SAVE knop
    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedData = {
          ...studentData,
          voornaam: document.getElementById('firstNameInput').value,
          achternaam: document.getElementById('lastNameInput').value,
          email: document.getElementById('emailInput').value,
          studiejaar: document.getElementById('yearInput').value,
          geboortedatum: document.getElementById('birthDateInput').value,
          linkedin: document.getElementById('linkedinInput').value,
          opleiding_id: opleiding_id,
        };
        const photoInput = document.getElementById('photoInput');
        if (photoInput && photoInput.files && photoInput.files[0]) {
          updatedData.profiel_foto = URL.createObjectURL(photoInput.files[0]);
        }
        window.sessionStorage.setItem('studentData', JSON.stringify(updatedData));
        renderStudentProfiel(rootElement, updatedData, true);
      });
    }

    // RESET knop
    const resetBtn = document.getElementById('btn-reset-profile');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        renderStudentProfiel(rootElement, originalData, false);
      });
    }
  }
}
