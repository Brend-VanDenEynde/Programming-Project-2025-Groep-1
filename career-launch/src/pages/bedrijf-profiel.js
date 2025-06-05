// src/views/bedrijf-profiel.js

import defaultAvatar from '../Images/BedrijfDefault.jpg';
import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderSearchCriteriaBedrijf } from './search-criteria-bedrijf.js';

export function renderBedrijfProfiel(rootElement, bedrijfData = {}) {
  const {
    name = 'Microsoft',
    email = 'bedrijf@voorbeeld.com',
    profilePictureUrl = defaultAvatar,
    linkedIn = '',
    description = '',
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
          <li><button id="nav-dashboard">Dashboard</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-delete-account">Verwijder account</button></li>
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
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>

        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Profiel</h1>
            <div id="profile-view" class="bedrijf-profile-form-section">
              <div class="bedrijf-profile-avatar-section">
                ${profilePictureUrl ? `<img src="${profilePictureUrl}" alt="Logo ${name}" id="avatar-display" class="bedrijf-profile-avatar" />` : `<div class="bedrijf-profile-avatar-placeholder" id="avatar-display"><span>×</span></div>`}
              </div>
              <div class="bedrijf-profile-form-group">
                <label>Naam:</label>
                <div class="bedrijf-profile-display-field" id="display-name">${name}</div>
              </div>
              <div class="bedrijf-profile-form-group">
                <label>E-mailadres:</label>
                <div class="bedrijf-profile-display-field" id="display-email">${email}</div>
              </div>
              <div class="bedrijf-profile-form-group">
                <label>Beschrijving:</label>
                <div class="bedrijf-profile-display-field" id="display-description">${description}</div>
              </div>
              <div class="bedrijf-profile-form-group">
                <label>LinkedIn:</label>
                <div class="bedrijf-profile-display-field">
                  <a id="display-linkedin" href="${linkedIn}" target="_blank" style="color: #007bff; text-decoration: none;">
                    ${linkedIn ? linkedIn : 'Niet ingesteld'}
                  </a>
                </div>
              </div>
              <div class="bedrijf-profile-buttons">
                <button id="edit-profile-btn" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">BEWERK</button>
                <button id="logout-btn" class="bedrijf-profile-btn bedrijf-profile-btn-primary">UITLOGGEN</button>
              </div>
            </div>
            <div id="profile-edit" class="bedrijf-profile-form-section" style="display: none;">
              <div class="bedrijf-profile-avatar-section">
                ${profilePictureUrl ? `<img src="${profilePictureUrl}" alt="Logo preview" id="avatar-preview" class="bedrijf-profile-avatar" />` : `<div class="bedrijf-profile-avatar-placeholder" id="avatar-preview"><span>×</span></div>`}
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="photoInput">Logo (max 2MB)</label>
                <input type="file" accept="image/*" id="photoInput">
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="nameInput">Bedrijfsnaam</label>
                <input type="text" id="nameInput" value="${name}" required>
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="emailInput">E-mailadres</label>
                <input type="email" id="emailInput" value="${email}" required>
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="descriptionInput">Beschrijving</label>
                <textarea id="descriptionInput" rows="3">${description}</textarea>
              </div>
              <div class="bedrijf-profile-form-group">
                <label for="linkedinInput">LinkedIn-link</label>
                <input type="url" id="linkedinInput" value="${linkedIn}">
              </div>
              <div class="bedrijf-profile-buttons">
                <button id="cancel-edit-btn" class="bedrijf-profile-btn bedrijf-profile-btn-secondary">RESET</button>
                <button id="save-profile-btn" class="bedrijf-profile-btn bedrijf-profile-btn-primary">SAVE</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="#">Privacy Policy</a> |
        <a id="contacteer-ons" href="#">Contacteer Ons</a>
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