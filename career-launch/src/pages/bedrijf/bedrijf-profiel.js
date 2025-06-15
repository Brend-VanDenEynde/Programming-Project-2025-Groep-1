// src/views/bedrijf-profiel.js

import defaultAvatar from '../../images/BedrijfDefault.jpg';
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderSearchCriteriaBedrijf } from './search-criteria-bedrijf.js';
import { performLogout, logoutUser } from '../../utils/auth-api.js';

export function renderBedrijfProfiel(rootElement, bedrijfData = {}) {
  // Haal altijd de meest recente bedrijfData uit sessionStorage als deze leeg is
  if (!bedrijfData || Object.keys(bedrijfData).length === 0) {
    try {
      const stored = window.sessionStorage.getItem('companyData');
      if (stored) bedrijfData = JSON.parse(stored);
    } catch (e) {}
  }

  const {
    name = 'Microsoft',
    email = 'bedrijf@voorbeeld.com',
    profilePictureUrl = defaultAvatar,
    linkedIn = '',
    description = '',
  } = bedrijfData;

  rootElement.innerHTML = `
  <div class="page-container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #ccc;">
    <div style="display: flex; align-items: center;">
      <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" style="margin-right: 0.5rem;" />
      <span>EhB Career Launch</span>
    </div>
    <button id="burger-menu" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">☰</button>
    <ul id="burger-dropdown" style="position: absolute; top: 3rem; right: 1rem; list-style: none; padding: 0.5rem; margin: 0; border: 1px solid #ccc; background: white; display: none; z-index: 100;">
      <li><button id="nav-dashboard" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Dashboard</button></li>
      <li><button id="nav-settings" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Instellingen</button></li>
      <li><button id="nav-delete-account" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Verwijder account</button></li>
      <li><button id="nav-logout" style="background:none; border:none; width:100%; text-align:left; padding:0.25rem 0;">Log out</button></li>
    </ul>
    </header>
    <div style="display: flex; flex: 1; margin-top: 0.5rem;">
    <nav id="sidebar" style="width: 180px; border-right: 1px solid #ccc; padding-right: 1rem;">
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li><button data-route="profile" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Profiel</button></li>
        <li><button data-route="search" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Zoek-criteria</button></li>
        <li><button data-route="speeddates" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Speeddates</button></li>
        <li><button data-route="requests" class="sidebar-link" style="background:none; border:none; padding:0.25rem 0; width:100%; text-align:left;">Speeddates-verzoeken</button></li>
      </ul>
    </nav>
    <main style="flex: 1; padding: 1rem;">
      <div id="profile-view">
        <div class="profile-avatar-section" style="display: flex; justify-content: center; margin-bottom: 1rem;">
            <img src="${profilePictureUrl}" alt="Profielfoto" id="avatar-display" style="width: 96px; height: 96px; object-fit: cover; border-radius: 50%;" />
        </div>
        <div class="profile-info-section" style="text-align: center;">
  <div>
    <label>Naam:</label>
    <span id="display-name">${name}</span>
  </div>
        <div>
            <label>E-mailadres:</label>
            <span id="display-email">${email}</span>
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
        </div>
        <div class="profile-buttons" style="text-align: center; margin-top: 1rem;">
            <button id="edit-profile-btn">Bewerk</button>
            <button id="logout-btn">Uitloggen</button>
        </div>
      </div>
      <div id="profile-edit" style="display: none;">
        <div>
          <label for="photoInput">Logo (max 2MB)</label>
          <input type="file" accept="image/*" id="photoInput">
        </div>        <div>
          <label for="nameInput">Bedrijfsnaam</label>
          <input type="text" id="nameInput" value="${name}" placeholder="Bedrijfsnaam" required>
        </div><div>
          <label for="emailInput">E-mailadres</label>
          <input type="email" id="emailInput" value="${email}" placeholder="Email" required>
        </div>        <div>
          <label for="descriptionInput">Beschrijving</label>
          <textarea id="descriptionInput" rows="3" placeholder="Beschrijf je bedrijf...">${description}</textarea>
        </div>        <div>
          <label for="linkedinInput">LinkedIn-link</label>
          <input type="url" id="linkedinInput" value="${linkedIn}" placeholder="https://www.linkedin.com/company/...">
        </div>
        <button id="cancel-edit-btn">Reset</button>
        <button id="save-profile-btn">Save</button>
      </div>
    </main>
  </div>
      <footer style="text-align: center; margin-top: 1rem;">
        <a href="/privacy" data-route="/privacy">Privacy Policy</a> |
        <a href="/contact" data-route="/contact">Contacteer ons</a>
    </footer>
  </div>
  
  `;

  // Events etc. identiek zoals eerder: sidebar, burger-menu, form-beheer ...
  // Deze kunnen desgewenst gekopieerd worden vanuit je originele component.

  // ➕ Voeg gerust hier de JS logica toe zoals je in bedrijf-profiel had

  // Sidebar-navigatie: “Zoek-criteria” link
  const searchBtn = document.querySelector('[data-route="search"]');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      renderSearchCriteriaBedrijf(rootElement, bedrijfData);
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
    alert('Navigeren naar Dashboard (nog te implementeren)');
  });
  document.getElementById('nav-settings').addEventListener('click', () => {
    alert('Navigeren naar Instellingen (nog te implementeren)');
  });
  document
    .getElementById('nav-delete-account')
    .addEventListener('click', () => {
      if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
        alert('Account verwijderen (nog te implementeren)');
      }
    });
  // Burger-menu logout
  const navLogout = document.getElementById('nav-logout');
  if (navLogout) {
    navLogout.onclick = null;
    navLogout.addEventListener('click', async () => {
      const response = await logoutUser();
      console.log('Logout API response:', response);
      window.sessionStorage.clear();
      localStorage.clear();
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/');
      });
    });
  }
  // Profiel-formulier logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = null;
    logoutBtn.addEventListener('click', async () => {
      const response = await logoutUser();
      console.log('Logout API response:', response);
      window.sessionStorage.clear();
      localStorage.clear();
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/');
      });
    });
  }

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
        class="bedrijf-profile-avatar"
      />`;

      // Werk in‐memory bedrijfData bij
      bedrijfData.profilePictureUrl = objectUrl;
    }
  });

  // OPSLAAN‐KNOP (zonder e-mailvalidatie voor bedrijf)
  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const updatedData = {
      ...bedrijfData,
      name: document.getElementById('nameInput').value.trim(),
      email: document.getElementById('emailInput').value.trim(),
      description: document.getElementById('descriptionInput').value.trim(),
      linkedIn: document.getElementById('linkedinInput').value.trim(),
      profilePictureUrl: bedrijfData.profilePictureUrl,
    };

    // Eenvoudige validatie: alleen bedrijfsnaam is verplicht
    if (!updatedData.name) {
      alert('De bedrijfsnaam mag niet leeg zijn.');
      return;
    }

    // TODO: stuur updatedData naar backend

    // Toon opnieuw de view‐sectie met bijgewerkte data
    renderBedrijfProfiel(rootElement, updatedData);
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
// default.jpg
