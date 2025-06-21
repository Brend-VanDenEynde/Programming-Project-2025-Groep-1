import { showSettingsPopup } from './student-settings.js';
import logoIcon from '/icons/favicon-32x32.png';
import { getOpleidingNaamById, opleidingen } from './student-opleidingen.js';
import defaultAvatar from '/images/default.png';
import { authenticatedFetch, performLogout } from '../../utils/auth-api.js';
import { renderBedrijven } from './bedrijven.js';

const defaultProfile = {
  voornaam: '',
  achternaam: '',
  email: '',
  studiejaar: '1',
  profiel_foto: null,
  linkedin: '',
  date_of_birth: '',
  opleiding_id: null,
};

const BASE_AVATAR_URL = 'https://gt0kk4fbet.ufs.sh/f/';

function isoToDateString(isoString) {
  if (!isoString) return '';
  return isoString.split('T')[0];
}

function getProfielFotoUrl(profiel_foto) {
  if (!profiel_foto || profiel_foto === 'null') return defaultAvatar;
  if (profiel_foto.startsWith('http')) return profiel_foto;
  return 'https://gt0kk4fbet.ufs.sh/f/' + profiel_foto;
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
      if (!studentData || Object.keys(studentData).length === 0) {

        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/login');
        });
      }
    } catch (e) { }
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
  const profiel_foto = getProfielFotoUrl(rawProfielFoto);

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
        <div class="logo-section" id="logo-navigation">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown">
          <li><button id="nav-profile">Profiel</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="student-profile-main">
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="speeddates" class="sidebar-link" type="button">Mijn speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link" type="button">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link" type="button">Bedrijven</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container" style="position:relative;">
            <button id="to-search-criteria-btn" class="to-search-criteria-btn" type="button">Zoekcriteria</button>
            <h1 class="student-profile-title">Profiel</h1>
            <form id="profileForm" class="student-profile-form" autocomplete="off" enctype="multipart/form-data">
              <div class="student-profile-avatar-section">
                <div class="student-profile-avatar-div" style="position:relative;">
                  <img 
                    src="${profiel_foto}" 
                    alt="Profielfoto ${voornaam} ${achternaam}" 
                    id="avatar-preview"
                    class="student-profile-avatar"
                  />
                  <button type="button" class="delete-overlay" style="display:none;" aria-label="Verwijder geüploade foto" tabindex="0">&#10006;</button>
                </div>
                <input type="file" accept="image/*" id="photoInput" style="display:${readonlyMode ? 'none' : 'block'
    };margin-top:10px;">
              </div>
              <div class="student-profile-form-group">
                <label for="firstNameInput">Voornaam</label>
                <input type="text" id="firstNameInput" value="${voornaam}" placeholder="voornaam" required ${readonlyMode ? 'disabled' : ''
    }>
              </div>
              <div class="student-profile-form-group">
                <label for="lastNameInput">Achternaam</label>
                <input type="text" id="lastNameInput" value="${achternaam}" placeholder="achternaam" required ${readonlyMode ? 'disabled' : ''
    }>
              </div>
              <div class="student-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" placeholder="e-mailadres" required ${readonlyMode ? 'disabled' : ''
    }>
              </div>
              <div class="student-profile-form-group">
                <label for="studyProgramInput">Studieprogramma</label>
                <select id="opleidingSelect" ${readonlyMode ? 'disabled' : ''}>
                  <option value="">Selecteer opleiding</option>
                  ${opleidingen
      .map(
        (o) =>
          `<option value="${o.id}" ${o.id == resolvedOpleidingId ? 'selected' : ''
          }>${o.naam}</option>`
      )
      .join('')}
                </select>
              </div>
              <div class="student-profile-form-group">
                <label for="yearInput">Opleidingsjaar</label>
                <select id="yearInput" ${readonlyMode ? 'disabled' : ''}>
                  <option value="1" ${studiejaar == '1' ? 'selected' : ''
    }>1</option>
                  <option value="2" ${studiejaar == '2' ? 'selected' : ''
    }>2</option>
                  <option value="3" ${studiejaar == '3' ? 'selected' : ''
    }>3</option>
                </select>
              </div>
              <div class="student-profile-form-group">
                <label for="birthDateInput">Geboortedatum</label>
                <input type="date" id="birthDateInput" value="${geboortedatum}" placeholder="geboortedatum" ${readonlyMode ? 'disabled' : ''
    }>
                <div id="birthDateError" style="color: red; font-size: 0.9em; min-height: 1.2em;"></div>
              </div>
              <div class="student-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedin}" placeholder="https://www.linkedin.com/in/jouwprofiel" ${readonlyMode ? 'disabled' : ''
    }>
              </div>
              <div class="student-profile-buttons">
                ${readonlyMode
      ? `
                      <button id="btn-edit-profile" type="button" class="student-profile-btn student-profile-btn-secondary">EDIT</button>
                      <button id="logout-btn" type="button" class="student-profile-btn student-profile-btn-secondary">LOG OUT</button>
                    `
      : `
                      <button id="btn-save-profile" type="submit" class="student-profile-btn student-profile-btn-primary">SAVE</button>
                      <button id="btn-reset-profile" type="button" class="student-profile-btn student-profile-btn-secondary">RESET</button>
                      <button id="btn-cancel-profile" type="button" class="student-profile-btn student-profile-btn-secondary">CANCEL</button>
                    `
    }
              </div>
            </form>
          </div>        </div>
      </div>
      
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
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
          // case 'profile': // verwijderd
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

    // Logo navigation event listener
    const logoSection = document.getElementById('logo-navigation');
    if (logoSection) {
      logoSection.addEventListener('click', () => {
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/student/student-speeddates');
        });
      });
    }

    // Profiel knop in hamburger menu
    const navProfileBtn = document.getElementById('nav-profile');
    if (navProfileBtn) {
      navProfileBtn.addEventListener('click', () => {
        dropdown.classList.remove('open');
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/student/student-profiel');
        });
      });
    }
    document
      .getElementById('nav-logout').addEventListener('click', async () => {
        dropdown.classList.remove('open');
        const response = await performLogout();
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
        const response = await performLogout();
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
  // Knop naar zoekcriteria (skills/voorkeuren)
  const toSearchCriteriaBtn = document.getElementById('to-search-criteria-btn');
  if (toSearchCriteriaBtn) {
    toSearchCriteriaBtn.addEventListener('click', () => {
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/student/zoek-criteria');
      });
    });
  }
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
        // Haal token op voor API-calls
        let token = sessionStorage.getItem('authToken');
        if (!token) {
          alert('Geen inlogsessie gevonden. Log opnieuw in.');
          return;
        }
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

        // Haal altijd de juiste ID’s uit sessionStorage
        // let studentID = studentData.gebruiker_id;
        // let userID = studentData.gebruiker_id;

        if (!studentID || !userID) {
          alert('Student ID of gebruiker_id ontbreekt!');
          return;
        }
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

            const respUser = await authenticatedFetch(
              `https://api.ehb-match.me/user/${userID}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: nieuweEmail }),
              }
            );

            if (!respUser.ok) {
              const errText = await respUser.text();

              throw new Error('E-mail bijwerken mislukt: ' + errText);
            }
            const userResult = await respUser.json();
            if (userResult.user && userResult.user.email) {
              studentData.email = userResult.user.email;
            }
          }

          // 2. Profielfoto uploaden indien geselecteerd of delete
          let profielFotoKey = null;
          if (
            studentData.profiel_foto &&
            typeof studentData.profiel_foto === 'string'
          ) {
            if (studentData.profiel_foto.startsWith('http')) {
              const parts = studentData.profiel_foto.split('/');
              profielFotoKey = parts[parts.length - 1];
            } else {
              profielFotoKey = studentData.profiel_foto;
            }
          }
          if (
            deleteProfilePicture &&
            savedProfilePicture &&
            savedProfilePicture !== '/images/defaultlogo.webp'
          ) {
            // remove https://gt0kk4fbet.ufs.sh/f/ prefix if present
            profielFotoKey = savedProfilePicture.replace(BASE_AVATAR_URL, '');
            const currentToken = window.sessionStorage.getItem('authToken');
            const deleteResp = await authenticatedFetch(
              `https://api.ehb-match.me/profielfotos/${profielFotoKey}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: 'Bearer ' + currentToken,
                },
              }
            );

            profielFotoKey = null; // Reset de profielfoto key
          }
          const photoInput = document.getElementById('photoInput');
          if (photoInput && photoInput.files && photoInput.files.length > 0) {
            const file = photoInput.files[0];
            // Controleer bestandstype en grootte
            if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
              alert(
                'Ongeldig bestandstype. Kies een jpg, png of gif afbeelding.'
              );
              return;
            }
            if (file.size > 2 * 1024 * 1024) {
              alert('Bestand is te groot. Maximaal 2 MB toegestaan.');
              return;
            }
            // Gebruik altijd 'image' als veldnaam
            const fileForm = new FormData();
            fileForm.append('image', file);
            const uploadResp = await authenticatedFetch(
              'https://api.ehb-match.me/profielfotos',
              {
                method: 'POST',
                body: fileForm,
              }
            );
            if (!uploadResp.ok) {
              const errText = await uploadResp.text();

              throw new Error('Foto uploaden mislukt: ' + errText);
            }
            const uploadResult = await uploadResp.json();
            profielFotoKey = uploadResult.profiel_foto_key;
          }

          // 3. Overige profielinfo via /studenten/{studentID} (JSON)
          const payload = {
            voornaam: document.getElementById('firstNameInput').value.trim(),
            achternaam: document.getElementById('lastNameInput').value.trim(),
            studiejaar: parseInt(
              document.getElementById('yearInput').value,
              10
            ),
            date_of_birth: document.getElementById('birthDateInput').value, // <-- correct!
            linkedin: document.getElementById('linkedinInput').value.trim(),
            opleiding_id: parseInt(newOpleidingId, 10),
            profiel_foto: profielFotoKey,
          };

          // Remove empty or null values
          Object.keys(payload).forEach((key) => {
            if (
              payload[key] === null ||
              payload[key] === undefined ||
              payload[key] === ''
            ) {
              if (key === 'profiel_foto') {
                // Keep profiel_foto even if null to maintain consistency
                payload[key] = profielFotoKey || null;
              } else if (key === 'linkedin') {
                // LinkedIn can be empty
                payload[key] = payload[key] || '';
              } else if (key !== 'studiejaar' && key !== 'opleiding_id') {
                // Don't remove numeric fields
                delete payload[key];
              }
            }
          });



          // Validate required fields
          if (!payload.voornaam || !payload.achternaam) {
            alert('Voor- en achternaam zijn verplicht.');
            return;
          }

          if (!payload.date_of_birth) {
            alert('Geboortedatum is verplicht.');
            return;
          }

          if (
            isNaN(payload.studiejaar) ||
            payload.studiejaar < 1 ||
            payload.studiejaar > 5
          ) {
            alert('Selecteer een geldig studiejaar (1-5).');
            return;
          }
          if (isNaN(payload.opleiding_id) || payload.opleiding_id <= 0) {
            alert('Selecteer een geldige opleiding.');
            return;
          }



          const respStudent = await authenticatedFetch(
            `https://api.ehb-match.me/studenten/${studentID}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            }
          ); if (!respStudent.ok) {
            const errText = await respStudent.text();

            // Try to parse JSON error if possible
            let errorMessage = 'Profiel bijwerken mislukt';
            try {
              const errorData = JSON.parse(errText);
              errorMessage =
                errorData.message || errorData.error || errorMessage;
            } catch (e) {
              // If not JSON, use the raw text
              errorMessage = errText || errorMessage;
            }

            throw new Error(errorMessage);
          }
          const result = await respStudent.json();
          // Backend geeft { message, student } terug
          if (result.student) {
            alert('Je profiel is succesvol opgeslagen!');
            // Haal altijd de nieuwste studentdata op na update
            const nieuweStudentData = await fetchAndStoreStudentProfile();
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
    // CANCEL knop
    const cancelBtn = document.getElementById('btn-cancel-profile');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        renderStudentProfiel(rootElement, studentData, true);
      });
    }

    // Preview afbeelding direct tonen als gebruiker een bestand kiest
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            const avatarPreview = document.getElementById('avatar-preview');
            if (avatarPreview) avatarPreview.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }    // Navigatie naar zoekcriteria/student-skills pagina
    const btnSearchCriteria = document.getElementById('btn-search-criteria');
    if (btnSearchCriteria) {
      btnSearchCriteria.addEventListener('click', () => {
        import('../../router.js').then((module) => {
          const Router = module.default;
          Router.navigate('/student/zoek-criteria');
        });
      });
    }

    // Delete overlay voor profielfoto (bedrijf-profiel.js stijl)
    const profileAvatar = document.querySelector('.student-profile-avatar-div');
    const deleteOverlay = document.querySelector('.delete-overlay');
    const studentAvatar = document.getElementById('avatar-preview');

    let deleteProfilePicture = false;
    let savedProfilePicture = studentAvatar ? studentAvatar.src : null;

    if (profileAvatar && deleteOverlay && studentAvatar) {
      profileAvatar.addEventListener('mouseenter', () => {
        if (!readonlyMode && !deleteProfilePicture && studentAvatar.src !== defaultAvatar) {
          deleteOverlay.style.display = 'flex';
        }
      });
      profileAvatar.addEventListener('mouseleave', () => {
        deleteOverlay.style.display = 'none';
      });
      deleteOverlay.addEventListener('click', (e) => {
        if (!readonlyMode && studentAvatar.src !== defaultAvatar) {
          if (photoInput) photoInput.value = '';
          studentAvatar.src = defaultAvatar;
          deleteProfilePicture = true;
        }
      });
    }
  }
}

// Utility: Haal gecombineerde studentdata + email op en sla op in sessionStorage
export async function fetchAndStoreStudentProfile() {
  const token = sessionStorage.getItem('authToken');
  if (!token) throw new Error('Geen authToken gevonden');
  // 1. Haal user-info op (voor email en userID)
  const respUser = await authenticatedFetch(
    'https://api.ehb-match.me/auth/info'
  );
  if (!respUser.ok) throw new Error('Kan user-info niet ophalen');
  const userResult = await respUser.json();
  const user = userResult.user;
  if (!user || !user.id) throw new Error('User info onvolledig');
  // 2. Haal alle studenten op en zoek juiste student
  const respStudents = await authenticatedFetch(
    'https://api.ehb-match.me/studenten'
  );
  if (!respStudents.ok) throw new Error('Kan studentenlijst niet ophalen');
  const studenten = await respStudents.json();
  const student = studenten.find((s) => s.gebruiker_id === user.id);
  if (!student) throw new Error('Student niet gevonden voor deze gebruiker!');
  // 3. Combineer info (voeg email toe aan studentdata)
  const combined = { ...student, email: user.email, gebruiker_id: user.id };
  sessionStorage.setItem('studentData', JSON.stringify(combined));
  return combined;
}

// Utility functie om na login direct naar speeddates te gaan
export function redirectToSpeeddates() {
  import('../../router.js').then((module) => {
    const Router = module.default;
    Router.navigate('/student/student-speeddates');
  });
}
