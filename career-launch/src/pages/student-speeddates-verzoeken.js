// src/views/student-speeddates-verzoeken.js

import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderQRPopup } from './student-qr-popup.js';

export function renderSpeeddatesRequests(rootElement, studentData = {}) {
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <!-- HEADER -->
      <header class="student-profile-header">
        <div class="logo-section">
          <img 
            src="${logoIcon}" 
            alt="Logo EhB Career Launch" 
            width="32" 
            height="32"
          />
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
        <!-- SIDEBAR -->
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>

        <!-- MAIN CONTENT: Speeddates-verzoeken -->
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Speeddates-verzoeken</h1>
            
            <div class="requests-list" style="background: #e0e0e0; border-radius: 8px; padding: 1rem; max-height: 60vh; overflow-y: auto;">
              <!-- Voorbeeldverzoek 1 -->
              <div class="request-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #bbb;">
                <div style="flex: 1;">
                  <span style="font-weight: bold;">Microsoft</span><br>
                  <span style="font-size: 0.9rem; color: #333;">14u05 – 14u10</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="request-accept-btn" style="background: #52c41a; border: none; color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">✔</button>
                  <button class="request-reject-btn" style="background: #ff4d4f; border: none; color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">✕</button>
                </div>
              </div>
              
              <!-- Voorbeeldverzoek 2 -->
              <div class="request-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #bbb;">
                <div style="flex: 1;">
                  <span style="font-weight: bold;">Google</span><br>
                  <span style="font-size: 0.9rem; color: #333;">14u20 – 14u25</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="request-accept-btn" style="background: #52c41a; border: none; color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">✔</button>
                  <button class="request-reject-btn" style="background: #ff4d4f; border: none; color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">✕</button>
                </div>
              </div>
              
              <!-- Voeg hier extra verzoeken toe indien nodig -->
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#">Privacy Policy</a> |
        <a id="contacteer-ons" href="#">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Sidebar-navigatie
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', e => {
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile':
          renderStudentProfiel(rootElement, studentData);
          break;
        case 'search':
          renderSearchCriteriaStudent(rootElement, studentData);
          break;
        case 'speeddates':
          renderSpeeddates(rootElement, studentData);
          break;
        case 'requests':
          // al op deze pagina
          break;
        case 'qr':
          renderQRPopup(rootElement, studentData);
          break;
      }
    });
  });

  // Burger-menu toggler
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  burger.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Hamburger-opties (alerts)
  document.getElementById('nav-dashboard').addEventListener('click', () => {
    alert('Navigeren naar Dashboard (nog te implementeren)');
  });
  document.getElementById('nav-settings').addEventListener('click', () => {
    alert('Navigeren naar Instellingen (nog te implementeren)');
  });
  document.getElementById('nav-delete-account').addEventListener('click', () => {
    if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
      alert('Account verwijderen (nog te implementeren)');
    }
  });
  document.getElementById('nav-logout').addEventListener('click', () => {
    renderLogin(rootElement);
  });

   // Accept / Reject knoplogica
  document.querySelectorAll('.request-accept-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const parent = e.currentTarget.closest('.request-item');
      const companyName = parent.querySelector('span').textContent;
      if (confirm('Aanvraag voor "' + companyName + '" accepteren?')) {
        parent.remove();
        console.log('Aanvraag voor "' + companyName + '" geaccepteerd.');
      }
    });
  });
  document.querySelectorAll('.request-reject-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const parent = e.currentTarget.closest('.request-item');
      const companyName = parent.querySelector('span').textContent;
      if (confirm('Aanvraag voor "' + companyName + '" weigeren?')) {
        parent.remove();
        console.log('Aanvraag voor "' + companyName + '" geweigerd.');
      }
    });
  }); }
