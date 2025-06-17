import logoIcon from '../../icons/favicon-32x32.png';
import defaultLogo from '../../images/defaultlogo.webp';
import {
  logoutUser,
  fetchUserInfo,
  updateBedrijfProfile,
} from '../../utils/auth-api.js';
import Router from '../../router.js';

// Default bedrijf profiel data (using API field names)
const defaultBedrijfProfile = {
  contact_email: '',
  naam: '',
  profiel_foto_url: defaultLogo,
  plaats: '',
  linkedin: '',
  sector_bedrijf: '',
};

function getBedrijfLogoUrl(foto) {
  if (!foto || foto === 'null') return defaultLogo;
  if (foto.startsWith('http')) return foto;
  return 'https://gt0kk4fbet.ufs.sh/f/' + foto;
}

export async function renderBedrijfProfiel(
  rootElement,
  bedrijfData = {},
  readonlyMode = true
) {
  // Laad uit sessionStorage als leeg
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('bedrijfData');
      if (stored) bedrijfData = JSON.parse(stored);
    } catch (e) { }
  }

  // Probeer echte data van de API op te halen als geen data beschikbaar is
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const userInfoResult = await fetchUserInfo();
      if (userInfoResult.success && userInfoResult.user) {
        const apiUser = userInfoResult.user;
        // Log de ruwe API data voor debugging
        console.log('Raw API user data:', apiUser);
        console.log('USER OBJECT:', apiUser); // Map API data naar bedrijf profiel velden (gebruik API veldnamen)
        bedrijfData = {
          id: apiUser.id || apiUser.gebruiker_id,
          contact_email: apiUser.contact_email || apiUser.email || '',
          naam:
            apiUser.naam ||
            apiUser.bedrijfsnaam ||
            apiUser.company_name ||
            'Mijn Bedrijf',
          profiel_foto_url:
            apiUser.profiel_foto_url || apiUser.logo_url || defaultLogo,
          plaats: apiUser.plaats || apiUser.locatie || apiUser.location || '',
          linkedin: apiUser.linkedin || '',
          sector_bedrijf: apiUser.sector_bedrijf || apiUser.sector || '',
        };

        // Log de gemapte bedrijf data voor debugging
        console.log('Mapped bedrijf data:', bedrijfData);
        console.log('Bedrijf ID voor API call:', bedrijfData.id);

        // Sla de gegevens op in sessionStorage voor toekomstig gebruik
        window.sessionStorage.setItem(
          'bedrijfData',
          JSON.stringify(bedrijfData)
        );
      } else {
        console.warn('Could not fetch user info from API, using dummy data');
        // Fallback naar dummy data
        bedrijfData = {
          contact_email: 'info@techcorp.be',
          naam: 'TechCorp Belgium',
          profiel_foto_url: defaultLogo,
          plaats: 'Brussel',
          linkedin: 'https://www.linkedin.com/company/techcorp-belgium',
          sector_bedrijf: 'IT & Technology',
        };
      }
    } catch (error) {
      console.error('Error fetching user info from API:', error);
      // Fallback naar dummy data
      bedrijfData = {
        contact_email: 'info@techcorp.be',
        naam: 'TechCorp Belgium',
        profiel_foto_url: defaultLogo,
        plaats: 'Brussel',
        linkedin: 'https://www.linkedin.com/company/techcorp-belgium',
        sector_bedrijf: 'IT & Technology',
      };
    }
  } // Gebruik ENKEL de huidige API velden
  const {
    contact_email = defaultBedrijfProfile.contact_email,
    naam = defaultBedrijfProfile.naam,
    profiel_foto_url: rawFoto = defaultBedrijfProfile.profiel_foto_url,
    plaats = defaultBedrijfProfile.plaats,
    linkedin = defaultBedrijfProfile.linkedin,
    sector_bedrijf = defaultBedrijfProfile.sector_bedrijf,
  } = bedrijfData;

  // Gebruik default als foto null, leeg of undefined is
  const foto = getBedrijfLogoUrl(rawFoto);

  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      
      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link active">Profiel</button></li>
            <li><button data-route="search-criteria" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
          </ul>
        </nav>
        
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Bedrijf Profiel</h1>
            <form id="bedrijfProfileForm" class="bedrijf-profile-form" autocomplete="off" enctype="multipart/form-data">              <div class="bedrijf-profile-avatar-section">
                <img 
                  src="${foto}" 
                  alt="Logo ${naam}" 
                  id="logo-preview"
                  class="bedrijf-profile-avatar"
                />
                <input type="file" accept="image/*" id="logoInput" style="display:${
                  readonlyMode ? 'none' : 'block'
                };margin-top:10px;">
              </div>
              
              <div class="bedrijf-profile-form-group">
                <label for="bedrijfsnaamInput">Bedrijfsnaam</label>
                <input type="text" id="bedrijfsnaamInput" value="${naam}" placeholder="Bedrijfsnaam" required ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              
              <div class="bedrijf-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${contact_email}" placeholder="contact@bedrijf.be" required ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              
              <div class="bedrijf-profile-form-group">
                <label for="plaatsInput">Plaats</label>
                <input type="text" id="plaatsInput" value="${plaats}" placeholder="Brussel" ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              
              <div class="bedrijf-profile-form-group">
                <label for="linkedinInput">LinkedIn</label>
                <input type="url" id="linkedinInput" value="${linkedin}" placeholder="https://www.linkedin.com/company/bedrijf" ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              
              <div class="bedrijf-profile-form-group">
                <label for="sectorInput">Sector</label>
                <input type="text" id="sectorInput" value="${sector_bedrijf}" placeholder="IT & Technology" ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              
              <div class="bedrijf-profile-buttons">
                ${
                  readonlyMode
                    ? `
                      <button id="btn-edit-bedrijf" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">EDIT</button>
                      <button id="logout-btn" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">LOG OUT</button>
                    `
                    : `
                      <button id="btn-save-bedrijf" type="submit" class="bedrijf-profile-btn bedrijf-profile-btn-primary">SAVE</button>
                      <button id="btn-reset-bedrijf" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">RESET</button>
                      <button id="btn-cancel-bedrijf" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">CANCEL</button>
                    `
                }
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;
  // Event listeners

  // Burger menu
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    dropdown.classList.remove('open');
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
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
  }

  // Settings en logout
  document.getElementById('nav-settings')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
    alert('Instellingen komen binnenkort');
  });

  document.getElementById('nav-logout')?.addEventListener('click', async () => {
    dropdown.classList.remove('open');
    const response = await logoutUser();
    console.log('Logout API response:', response);
    window.sessionStorage.removeItem('bedrijfData');
    window.sessionStorage.removeItem('authToken');
    window.sessionStorage.removeItem('userType');
    localStorage.setItem('darkmode', 'false');
    document.body.classList.remove('darkmode');
    Router.navigate('/');
  });

  // Ook de LOG OUT knop in het profiel-formulier zelf
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const response = await logoutUser();
      console.log('Logout API response:', response);
      window.sessionStorage.removeItem('bedrijfData');
      window.sessionStorage.removeItem('authToken');
      window.sessionStorage.removeItem('userType');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      Router.navigate('/');
    });
  }

  // EDIT knop
  const editBtn = document.getElementById('btn-edit-bedrijf');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      renderBedrijfProfiel(rootElement, bedrijfData, false);
    });
  }
  // SAVE knop
  const saveBtn = document.getElementById('btn-save-bedrijf');
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        // Verzamel form data met API veldnamen (alleen velden die de API accepteert)
        const updateData = {
          naam: document.getElementById('bedrijfsnaamInput').value,
          contact_email: document.getElementById('emailInput').value,
          plaats: document.getElementById('plaatsInput').value,
          linkedin: document.getElementById('linkedinInput').value,
          // sector_bedrijf wordt niet geaccepteerd door de API, dus weggelaten
        }; // Haal het bedrijf ID op uit de huidige data
        const bedrijfID = bedrijfData.id || bedrijfData.gebruiker_id;

        console.log('Debug bedrijf ID lookup:');
        console.log('bedrijfData:', bedrijfData);
        console.log('bedrijfData.id:', bedrijfData.id);
        console.log('bedrijfData.gebruiker_id:', bedrijfData.gebruiker_id);
        console.log('Final bedrijfID:', bedrijfID);

        if (!bedrijfID) {
          alert('Kon bedrijf ID niet vinden. Probeer opnieuw in te loggen.');
          return;
        }

        console.log(
          'Updating bedrijf with ID:',
          bedrijfID,
          'Data:',
          updateData
        );

        // Roep de API aan om het bedrijf bij te werken
        const result = await updateBedrijfProfile(bedrijfID, updateData);

        if (result.success) {
          alert('Bedrijfsprofiel succesvol opgeslagen!');
          // Update local data met de nieuwe gegevens
          const updatedBedrijfData = {
            ...bedrijfData,
            ...updateData,
            // Behoud sector_bedrijf omdat dit niet via API wordt geüpdatet
            sector_bedrijf: document.getElementById('sectorInput').value,
            profiel_foto_url:
              result.bedrijf?.profiel_foto_url || bedrijfData.profiel_foto_url,
          };

          // Opslaan in sessionStorage
          window.sessionStorage.setItem(
            'bedrijfData',
            JSON.stringify(updatedBedrijfData)
          );

          // Render de pagina opnieuw in readonly mode
          renderBedrijfProfiel(rootElement, updatedBedrijfData, true);
        } else {
          alert(`Fout bij opslaan: ${result.message}`);
        }
      } catch (error) {
        console.error('Error updating bedrijf profile:', error);
        alert('Er is een fout opgetreden bij het opslaan. Probeer opnieuw.');
      }
    });
  } // RESET knop
  const resetBtn = document.getElementById('btn-reset-bedrijf');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset naar de huidige opgeslagen gegevens (niet naar lege waarden)
      document.getElementById('bedrijfsnaamInput').value = naam;
      document.getElementById('emailInput').value = contact_email;
      document.getElementById('plaatsInput').value = plaats;
      document.getElementById('linkedinInput').value = linkedin;
      document.getElementById('sectorInput').value = sector_bedrijf;
    });
  }

  // CANCEL knop
  const cancelBtn = document.getElementById('btn-cancel-bedrijf');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      renderBedrijfProfiel(rootElement, bedrijfData, true);
    });
  }

  // Sidebar navigation
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile':
          Router.navigate('/bedrijf/bedrijf-profiel');
          break;
        case 'search-criteria':
          Router.navigate('/bedrijf/zoek-criteria');
          break;
        case 'speeddates':
          Router.navigate('/bedrijf/speeddates');
          break;
        case 'requests':
          Router.navigate('/bedrijf/speeddates-verzoeken');
          break;
        case 'studenten':
          Router.navigate('/bedrijf/studenten');
          break;
      }
    });
  });

  // Footer links
  document.getElementById('privacy-policy')?.addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });

  document.getElementById('contacteer-ons')?.addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });

  // Logo upload preview (demo functionaliteit)
  const logoInput = document.getElementById('logoInput');
  const logoPreview = document.getElementById('logo-preview');
  if (logoInput && logoPreview) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          logoPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
