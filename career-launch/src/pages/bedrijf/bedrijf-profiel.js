import logoIcon from '../../icons/favicon-32x32.png';
import defaultLogo from '../../images/defaultlogo.webp';
import { logoutUser } from '../../utils/auth-api.js';
import Router from '../../router.js';

// Default bedrijf profiel data
const defaultBedrijfProfile = {
  email: '',
  bedrijfsnaam: '',
  foto: defaultLogo,
  plaats: '',
  linkedin: '',
  sector: '',
};

function getBedrijfLogoUrl(foto) {
  if (!foto || foto === 'null') return defaultLogo;
  if (foto.startsWith('http')) return foto;
  return 'https://gt0kk4fbet.ufs.sh/f/' + foto;
}

export function renderBedrijfProfiel(
  rootElement,
  bedrijfData = {},
  readonlyMode = true
) {
  // Laad uit sessionStorage als leeg
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('bedrijfData');
      if (stored) bedrijfData = JSON.parse(stored);
    } catch (e) {}
  }
  // Gebruik dummy data als geen echte data beschikbaar is
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    bedrijfData = {
      email: 'info@techcorp.be',
      bedrijfsnaam: 'TechCorp Belgium',
      foto: defaultLogo,
      plaats: 'Brussel',
      linkedin: 'https://www.linkedin.com/company/techcorp-belgium',
      sector: 'IT & Technology',
    };
  }
  // Gebruik ENKEL de huidige API velden
  const {
    email = defaultBedrijfProfile.email,
    bedrijfsnaam = defaultBedrijfProfile.bedrijfsnaam,
    foto: rawFoto = defaultBedrijfProfile.foto,
    plaats = defaultBedrijfProfile.plaats,
    linkedin = defaultBedrijfProfile.linkedin,
    sector = defaultBedrijfProfile.sector,
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
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Bedrijf Profiel</h1>
            <form id="bedrijfProfileForm" class="bedrijf-profile-form" autocomplete="off" enctype="multipart/form-data">
              <div class="bedrijf-profile-avatar-section">
                <img 
                  src="${foto}" 
                  alt="Logo ${bedrijfsnaam}" 
                  id="logo-preview"
                  class="bedrijf-profile-avatar"
                />
                <input type="file" accept="image/*" id="logoInput" style="display:${
                  readonlyMode ? 'none' : 'block'
                };margin-top:10px;">
              </div>
                <div class="bedrijf-profile-form-group">
                <label for="bedrijfsnaamInput">Bedrijfsnaam</label>
                <input type="text" id="bedrijfsnaamInput" value="${bedrijfsnaam}" placeholder="Bedrijfsnaam" required ${
    readonlyMode ? 'disabled' : ''
  }>
              </div>
              
              <div class="bedrijf-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" placeholder="contact@bedrijf.be" required ${
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
                <input type="text" id="sectorInput" value="${sector}" placeholder="IT & Technology" ${
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
      // Hier zou normaal API call komen, nu tonen we alleen bericht
      const updatedData = {
        ...bedrijfData,
        bedrijfsnaam: document.getElementById('bedrijfsnaamInput').value,
        email: document.getElementById('emailInput').value,
        plaats: document.getElementById('plaatsInput').value,
        linkedin: document.getElementById('linkedinInput').value,
        sector: document.getElementById('sectorInput').value,
      };

      alert('Bedrijfsprofiel opgeslagen! (Dit is dummy data)');

      // Opslaan in sessionStorage voor demo
      window.sessionStorage.setItem('bedrijfData', JSON.stringify(updatedData));

      renderBedrijfProfiel(rootElement, updatedData, true);
    });
  }

  // RESET knop
  const resetBtn = document.getElementById('btn-reset-bedrijf');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const resetData = {
        ...defaultBedrijfProfile,
        bedrijfsnaam: 'Nieuw Bedrijf',
        email: 'contact@nieuwbedrijf.be',
        plaats: '',
        linkedin: '',
        sector: '',
      };
      renderBedrijfProfiel(rootElement, resetData, false);
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
        case 'qr':
          Router.navigate('/bedrijf/qr-code');
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
