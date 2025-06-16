import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
import logoIcon from '../../icons/favicon-32x32.png';
import { getOpleidingNaamById, opleidingen } from './student-opleidingen.js';
import defaultAvatar from '../../images/default.png';
import { logoutUser } from '../../utils/auth-api.js';
import { renderBedrijven } from './bedrijven.js';

const defaultProfile = {
  voornaam: '',
  achternaam: '',
  email: '',
  studiejaar: '1',
  profiel_foto: defaultAvatar,
  linkedin: '',
  date_of_birth: '',
  opleiding_id: null,
};

function isoToDateString(isoString) {
  if (!isoString) return '';
  return isoString.split('T')[0];
}

export function renderStudentProfiel(
  rootElement,
  studentData = {},
  readonlyMode = true
) {
  // Laad uit sessionStorage als leeg
  if (!studentData || Object.keys(studentData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('studentData');
      if (stored) studentData = JSON.parse(stored);
    } catch (e) {}
  }

  // Gebruik altijd deze variabelen voor API-calls
  // In deze omgeving zijn studentID en userID gelijk, maar future-proof splitsen
  const studentID = studentData.id || studentData.gebruiker_id;
  const userID = studentData.gebruiker_id || studentData.id;

  // Gebruik ENKEL de huidige API velden
  const {
    voornaam = defaultProfile.voornaam,
    achternaam = defaultProfile.achternaam,
    email = studentData.email || defaultProfile.email,
    studiejaar = defaultProfile.studiejaar,
    profiel_foto: rawProfielFoto = defaultProfile.profiel_foto,
    linkedin = defaultProfile.linkedin,
    date_of_birth = defaultProfile.date_of_birth,
    opleiding_id = defaultProfile.opleiding_id,
  } = studentData;

  // Gebruik default als profiel_foto null, leeg of undefined is
  const profiel_foto =
    !rawProfielFoto || rawProfielFoto === 'null'
      ? defaultAvatar
      : rawProfielFoto;

  // Map opleiding name to id if id is missing
  let resolvedOpleidingId = opleiding_id;
  if (
    (!resolvedOpleidingId ||
      resolvedOpleidingId === null ||
      typeof resolvedOpleidingId === 'undefined') &&
    studentData.opleiding
  ) {
    const found = opleidingen.find((o) => o.naam === studentData.opleiding);
    if (found) resolvedOpleidingId = found.id;
  }

  const geboortedatum = isoToDateString(
    studentData.geboortedatum ||
      studentData.birthdate ||
      studentData.date_of_birth ||
      defaultProfile.date_of_birth
  );

  const opleidingNaam = getOpleidingNaamById(resolvedOpleidingId);

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
                <input type="file" accept="image/*" id="photoInput" style="display:${
                  readonlyMode ? 'none' : 'block'
                };margin-top:10px;">
              </div>
              <div class="student-profile-form-group">
                <label for="firstNameInput">Voornaam</label>
                <input type="text" id="firstNameInput" value="${voornaam}" placeholder="voornaam" required ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              <div class="student-profile-form-group">
                <label for="lastNameInput">Achternaam</label>
                <input type="text" id="lastNameInput" value="${achternaam}" placeholder="achternaam" required ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              <div class="student-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" placeholder="e-mailadres" required ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              <div class="student-profile-form-group">
                <label for="studyProgramInput">Studieprogramma</label>
                <input type="text" id="studyProgramInput" value="${opleidingNaam}" placeholder="opleiding" disabled ${
    !readonlyMode ? 'style="display:none;"' : ''
  }>
                ${
                  !readonlyMode
                    ? `<select id="opleidingSelect" required>
                        <option value="">Selecteer opleiding</option>
                        ${opleidingen
                          .map(
                            (o) =>
                              `<option value="${o.id}" ${
                                o.id == resolvedOpleidingId ? 'selected' : ''
                              }>${o.naam}</option>`
                          )
                          .join('')}
                      </select>`
                    : ''
                }
              </div>
              <div class="student-profile-form-group">
                <label for="yearInput">Opleidingsjaar</label>
                <select id="yearInput" ${readonlyMode ? 'disabled' : ''}>
                  <option value="1" ${
                    studiejaar == '1' ? 'selected' : ''
                  }>1</option>
                  <option value="2" ${
                    studiejaar == '2' ? 'selected' : ''
                  }>2</option>
                  <option value="3" ${
                    studiejaar == '3' ? 'selected' : ''
                  }>3</option>
                </select>
              </div>
              <div class="student-profile-form-group">
                <label for="birthDateInput">Geboortedatum</label>
                <input type="date" id="birthDateInput" value="${geboortedatum}" placeholder="geboortedatum" ${
    readonlyMode ? 'disabled' : ''
  }>
                <div id="birthDateError" style="color: red; font-size: 0.9em; min-height: 1.2em;"></div>
              </div>
              <div class="student-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedin}" placeholder="https://www.linkedin.com/in/jouwprofiel" ${
    readonlyMode ? 'disabled' : ''
  }>
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
          </div>        </div>
      </div>
      
      <footer class="student-profile-footer">
        <div class="footer-content">
          <span>&copy; 2025 EhB Career Launch</span>
          <div class="footer-links">
            <a href="/privacy" data-route="/privacy">Privacy</a>
            <a href="/contact" data-route="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `;
  // Sidebar nav - gebruik de router voor echte URL navigatie
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'profile':
            Router.navigate('/student/student-profiel');
            break;
          case 'search':
            Router.navigate('/student/zoek-criteria');
            break;
          case 'speeddates':
            Router.navigate('/student/student-speeddates');
            break;
          case 'requests':
            Router.navigate('/student/student-speeddates-verzoeken');
            break;
          case 'bedrijven':
            Router.navigate('/student/bedrijven');
            break;
          case 'qr':
            Router.navigate('/student/student-qr-popup');
            break;
        }
      });
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
    document.addEventListener('click', function (event) {
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
    document
      .getElementById('nav-logout')
      .addEventListener('click', async () => {
        dropdown.classList.remove('open');
        const response = await logoutUser();
        console.log('Logout API response:', response);
        window.sessionStorage.removeItem('studentData');
        window.sessionStorage.removeItem('authToken');
        window.sessionStorage.removeItem('userType');
        localStorage.setItem('darkmode', 'false');
        document.body.classList.remove('darkmode');
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/');
        });
      });

    // Ook de LOG OUT knop in het profiel-formulier zelf (voor desktop)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        const response = await logoutUser();
        console.log('Logout API response:', response);
        window.sessionStorage.removeItem('studentData');
        window.sessionStorage.removeItem('authToken');
        window.sessionStorage.removeItem('userType');
        localStorage.setItem('darkmode', 'false');
        document.body.classList.remove('darkmode');
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/');
        });
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
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let newOpleidingId = resolvedOpleidingId;
        if (!readonlyMode) {
          const select = document.getElementById('opleidingSelect');
          if (select) newOpleidingId = select.value;
        }
        // Verzamel nieuwe waarden, alleen geldige velden en types
        const nieuweEmail = document.getElementById('emailInput').value;
        const oudeEmail = studentData.email;
        const updatedStudentData = {
          voornaam: document.getElementById('firstNameInput').value,
          achternaam: document.getElementById('lastNameInput').value,
          studiejaar: parseInt(document.getElementById('yearInput').value, 10),
          date_of_birth: document.getElementById('birthDateInput').value,
          linkedin: document.getElementById('linkedinInput').value,
          opleiding_id: parseInt(newOpleidingId, 10),
        };
        // Debug: log de payload
        console.log(
          'Student update payload:',
          JSON.stringify(updatedStudentData)
        );
        const token = sessionStorage.getItem('authToken');
        // Haal altijd de juiste ID’s uit sessionStorage
        // let studentID = studentData.gebruiker_id;
        // let userID = studentData.gebruiker_id;
        if (!studentID || !userID) {
          alert('Student ID of gebruiker_id ontbreekt!');
          return;
        }
        // Debug: log de gebruikte ID's en token
        console.log(
          'studentData:',
          studentData,
          'studentID:',
          studentID,
          'userID:',
          userID,
          'token:',
          token
        );
        // Check geboortedatum niet in de toekomst en minstens 17 jaar oud
        const today = new Date();
        const minBirthDate = new Date(
          today.getFullYear() - 17,
          today.getMonth(),
          today.getDate()
        );
        const inputBirthDate = new Date(updatedStudentData.date_of_birth);
        // Inline validatie geboortedatum
        const birthDateError = document.getElementById('birthDateError');
        birthDateError.textContent = '';
        if (
          updatedStudentData.date_of_birth > today.toISOString().split('T')[0]
        ) {
          birthDateError.textContent =
            'Geboortedatum mag niet in de toekomst liggen.';
          return;
        }
        if (inputBirthDate > minBirthDate) {
          birthDateError.textContent = 'Je moet minstens 17 jaar oud zijn.';
          return;
        }
        try {
          // 1. E-mail gewijzigd? Eerst /user/{userID}
          if (nieuweEmail && nieuweEmail !== oudeEmail) {
            console.debug('PUT /user/' + userID, { email: nieuweEmail });
            const respUser = await fetch(
              `https://api.ehb-match.me/user/${userID}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({ email: nieuweEmail }),
              }
            );
            if (!respUser.ok) {
              const errText = await respUser.text();
              console.error('Backend response (user):', errText);
              throw new Error('E-mail bijwerken mislukt: ' + errText);
            }
            const userResult = await respUser.json();
            // Update email in sessionStorage studentData
            if (userResult.user && userResult.user.email) {
              studentData.email = userResult.user.email;
            }
          }
          // 2. Overige profielinfo via /studenten/{studentID}
          console.debug('PUT /studenten/' + studentID, updatedStudentData);
          const respStudent = await fetch(
            `https://api.ehb-match.me/studenten/${studentID}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
              body: JSON.stringify(updatedStudentData),
            }
          );
          if (!respStudent.ok) {
            const errText = await respStudent.text();
            console.error('Backend response (student):', errText);
            throw new Error('Profiel bijwerken mislukt: ' + errText);
          }
          const result = await respStudent.json();
          // Backend geeft { message, student } terug
          if (result.student) {
            // Combineer email met nieuwe studentdata voor sessionStorage
            const nieuweStudentData = {
              ...result.student,
              email: studentData.email,
            };
            sessionStorage.setItem(
              'studentData',
              JSON.stringify(nieuweStudentData)
            );
            renderStudentProfiel(rootElement, nieuweStudentData, true);
          } else {
            alert('Profiel opgeslagen, maar geen student-object in response!');
          }
        } catch (err) {
          alert('Fout bij opslaan profiel: ' + err.message);
        }
      });
    }

    // RESET knop
    const resetBtn = document.getElementById('btn-reset-profile');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Maak een nieuw object met default waarden, behalve email en geboortedatum
        const today = new Date().toISOString().split('T')[0];
        const resetData = {
          ...defaultProfile,
          email: '',
          date_of_birth: today,
          gebruiker_id: originalData.gebruiker_id,
          id: originalData.id, // altijd id behouden
          opleiding_id: '', // forceer selectie
        };
        renderStudentProfiel(rootElement, resetData, false);
      });
    }
  }
}

// Utility: Haal gecombineerde studentdata + email op en sla op in sessionStorage
export async function fetchAndStoreStudentProfile() {
  const token = sessionStorage.getItem('authToken');
  if (!token) throw new Error('Geen authToken gevonden');
  // 1. Haal user-info op (voor email en userID)
  const respUser = await fetch('https://api.ehb-match.me/auth/info', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!respUser.ok) throw new Error('Kan user-info niet ophalen');
  const userResult = await respUser.json();
  const user = userResult.user;
  if (!user || !user.id) throw new Error('User info onvolledig');
  // 2. Haal alle studenten op en zoek juiste student
  const respStudents = await fetch('https://api.ehb-match.me/studenten', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!respStudents.ok) throw new Error('Kan studentenlijst niet ophalen');
  const studenten = await respStudents.json();
  const student = studenten.find((s) => s.gebruiker_id === user.id);
  if (!student) throw new Error('Student niet gevonden voor deze gebruiker!');
  // 3. Combineer info (voeg email toe aan studentdata)
  const combined = { ...student, email: user.email, gebruiker_id: user.id };
  sessionStorage.setItem('studentData', JSON.stringify(combined));
  return combined;
}
