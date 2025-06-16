// src/views/bedrijf-speeddates.js
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import '../../css/consolidated-style.css';

export function renderBedrijfSpeeddates(rootElement, bedrijfData = {}) {
  const speeddates = [];

  function getStatusBadge(status) {
    if (status === 'Bevestigd') {
      return `<span class="status-badge badge-accepted">Bevestigd</span>`;
    } else if (status === 'In afwachting') {
      return `<span class="status-badge badge-waiting">In afwachting</span>`;
    } else if (status === 'Geweigerd') {
      return `<span class="status-badge badge-denied">Geweigerd</span>`;
    } else {
      return `<span class="status-badge badge-other">${status}</span>`;
    }
  }

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
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
            <li><button data-route="settings" class="sidebar-link">Instellingen</button></li>
            <li><button data-route="contact" class="sidebar-link">Contact</button></li>
            <li><button data-route="privacy" class="sidebar-link">Privacy Policy</button></li>
          </ul>
        </nav>

        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
            <div>
              ${
                speeddates.length === 0
                  ? `<p style="text-align:center;">U heeft nog geen speeddates ingepland.</p>`
                  : `
                    <div class="speeddates-table-container">
                      <table class="speeddates-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Tijd</th>
                            <th>Locatie</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${speeddates
                            .map(
                              (s) => `
                            <tr>
                              <td>${s.student}</td>
                              <td>${s.tijd}</td>
                              <td>${s.locatie}</td>
                              <td>${getStatusBadge(s.status)}</td>
                            </tr>
                          `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </div>
                  `
              }
            </div>
          </div>
        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Sidebar nav - gebruik de router voor echte URL navigatie
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      alert(`Navigeren naar: ${btn.getAttribute('data-route')}`);
    });
  });

  // Burger menu functionaliteit
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }

  // Fetch speeddates from API
  const token = sessionStorage.getItem('authToken');
  const bedrijfId = bedrijfData.id || bedrijfData.gebruiker_id;

  fetch(`https://api.ehb-match.me/speeddates?id=${bedrijfId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Response status:', response.status);
        return response.text().then((text) => {
          console.error('Response text:', text);
          throw new Error('Fout bij ophalen van speeddates');
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.length === 0) {
        rootElement.querySelector('.bedrijf-profile-content').innerHTML = `
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
            <p style="text-align:center;">U heeft nog geen speeddates ingepland.</p>
          </div>
        `;
        return;
      }

      speeddates.push(...data);
      renderBedrijfSpeeddates(rootElement, bedrijfData);
    })
    .catch((error) => {
      console.error('Fout bij ophalen van speeddates:', error);
      alert('Er is een fout opgetreden bij het ophalen van speeddates.');
    });
}

export function setupNavigationLinks() {
  const links = {
    profile: '/bedrijf-profiel',
    speeddates: '/bedrijf-speeddates',
    requests: '/bedrijf-speeddates-verzoeken',
    settings: '/bedrijf-settings',
    qr: '/bedrijf-qr-popup',
  };

  document.querySelectorAll('.sidebar-link').forEach((link) => {
    const route = link.getAttribute('data-route');
    if (links[route]) {
      link.addEventListener('click', () => {
        window.location.href = links[route];
      });
    }
  });
}

setupNavigationLinks();
