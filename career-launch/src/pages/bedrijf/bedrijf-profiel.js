// src/views/bedrijf-profiel.js

import defaultAvatar from '../../images/BedrijfDefault.jpg';
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderSearchCriteriaBedrijf } from './search-criteria-bedrijf.js';
import { performLogout, logoutUser } from '../../utils/auth-api.js';
import '../../css/consolidated-style.css';
import { setupNavigationLinks } from './bedrijf-speeddates.js';

export async function fetchAndRenderBedrijfProfiel(rootElement, bedrijfId) {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    alert('Geen geldige sessie gevonden. Log opnieuw in.');
    return;
  }

  try {
    const response = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Fout bij ophalen bedrijfsgegevens');
    }

    const bedrijfData = await response.json();

    const mappedData = {
      naam: bedrijfData.naam,
      contact_email: bedrijfData.contact_email,
      profiel_foto: bedrijfData.profiel_foto || defaultAvatar,
      linkedin: bedrijfData.linkedin,
      plaats: bedrijfData.plaats, // Assuming "plaats" is used as a description
    };

    renderBedrijfProfiel(rootElement, mappedData);
  } catch (error) {
    alert('Er is een fout opgetreden bij het ophalen van de bedrijfsgegevens.');
  }
}

// Add default profile structure
const defaultProfile = {
  name: '',
  email: '',
  profilePictureUrl: defaultAvatar,
  linkedIn: '',
  description: '',
};

export function renderBedrijfProfiel(rootElement, bedrijfData = {}, readonlyMode = true) {
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('companyData');
      if (stored) bedrijfData = JSON.parse(stored);
    } catch (e) {}
  }

  const {
    naam = '',
    contact_email = '',
    profiel_foto = defaultAvatar,
    linkedin = '',
    plaats = '',
  } = bedrijfData;

  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown" style="display: none;">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link active">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Profiel</h1>
            <form id="profileForm" class="bedrijf-profile-form" autocomplete="off" enctype="multipart/form-data">
              <div class="bedrijf-profile-avatar-section">
                <img 
                  src="${profiel_foto}" 
                  alt="Profielfoto ${naam}" 
                  id="avatar-preview"
                  class="bedrijf-profile-avatar"
                />
                <input type="file" accept="image/*" id="photoInput" style="display:${readonlyMode ? 'none' : 'block'};margin-top:10px;">
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="nameInput">Bedrijfsnaam</label>
                <input type="text" id="nameInput" value="${naam}" placeholder="Bedrijfsnaam" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${contact_email}" placeholder="E-mailadres" required ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="descriptionInput">Plaats</label>
                <input type="text" id="descriptionInput" value="${plaats}" placeholder="Plaats" ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedin}" placeholder="https://www.linkedin.com/company/..." ${readonlyMode ? 'disabled' : ''}>
              </div>
              <div class="bedrijf-profile-buttons">
                ${
                  readonlyMode
                    ? `<button id="btn-edit-profile" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">EDIT</button>`
                    : `<button id="btn-save-profile" type="submit" class="bedrijf-profile-btn bedrijf-profile-btn-primary">SAVE</button>
                       <button id="btn-reset-profile" type="button" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">RESET</button>`
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

  const form = document.getElementById('profileForm');
  if (form) {
    const editBtn = document.getElementById('btn-edit-profile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        renderBedrijfProfiel(rootElement, bedrijfData, false);
      });
    }

    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedData = {
          naam: document.getElementById('nameInput').value,
          contact_email: document.getElementById('emailInput').value,
          plaats: document.getElementById('descriptionInput').value,
          linkedin: document.getElementById('linkedinInput').value,
          profiel_foto: document.getElementById('photoInput').files[0]?.name || bedrijfData.profiel_foto,
        };

        try {
          const token = sessionStorage.getItem('authToken');
          const bedrijfId = bedrijfData.id || bedrijfData.gebruiker_id;

          const response = await fetch(`https://api.ehb-match.me/bedrijven/${bedrijfId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Fout bij opslaan: ${errorText}`);
          }

          const result = await response.json();
          alert('Profiel succesvol opgeslagen!');
          renderBedrijfProfiel(rootElement, result, true);
        } catch (error) {
          alert(`Er is een fout opgetreden: ${error.message}`);
        }
      });
    }

    const resetBtn = document.getElementById('btn-reset-profile');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        renderBedrijfProfiel(rootElement, bedrijfData, false);
      });
    }
  } else {
    console.error('Formulier niet gevonden in de DOM.');
  }

  // Controleer andere elementen zoals burger-menu en footer links
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  } else {
    console.error('Burger-menu of dropdown niet gevonden in de DOM.');
  }

  const privacyPolicyLink = document.getElementById('privacy-policy');
  if (privacyPolicyLink) {
    privacyPolicyLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Privacy Policy pagina wordt hier geladen.');
    });
  } else {
    console.error('Privacy Policy link niet gevonden in de DOM.');
  }

  const contactLink = document.getElementById('contacteer-ons');
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Contacteer ons formulier wordt hier geladen.');
    });
  } else {
    console.error('Contact link niet gevonden in de DOM.');
  }

  const logoutButton = document.getElementById('nav-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      performLogout();
      alert('U bent succesvol uitgelogd.');
      renderLogin(document.getElementById('app'));
    });
  } else {
    console.error('Log out knop niet gevonden in de DOM.');
  }

  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.getAttribute('data-route');
      if (route === 'speeddates') {
        import('./bedrijf-speeddates.js').then((module) => {
          module.renderBedrijfSpeeddates(document.getElementById('app'), bedrijfData);
        });
      }
    });
  });
}

function renderSidebar() {
  const sidebarHtml = `
    <nav class="company-profile-sidebar">
      <ul>
        <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
        <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
        <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
        <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
      </ul>
    </nav>`;

  const sidebarContainer = document.querySelector('.sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebarHtml;
  }

  setupNavigationLinks();
}

renderSidebar();

// Testaanroep om het juiste bedrijfId dynamisch op te halen
window.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('app'); // Zorg ervoor dat er een element met id 'app' bestaat

  try {
    const storedCompanyData = sessionStorage.getItem('companyData');

    if (!storedCompanyData) {
      console.error('Geen bedrijfgegevens gevonden in sessionStorage. Controleer of de data correct wordt opgeslagen.');
      return;
    }

    const companyData = JSON.parse(storedCompanyData);

    const bedrijfId = companyData.gebruiker_id || companyData.id; // Controleer alternatieve velden

    if (!bedrijfId) {
      console.error('Geen geldig bedrijfId gevonden in de opgeslagen gegevens. Controleer de structuur van companyData:', companyData);
      return;
    }

    if (rootElement) {
      fetchAndRenderBedrijfProfiel(rootElement, bedrijfId);
    } else {
      console.error('Root element met id "app" niet gevonden. Controleer of de HTML correct is geladen.');
    }
  } catch (error) {
    console.error('Fout bij het ophalen van bedrijfgegevens uit sessionStorage:', error);
  }
});
