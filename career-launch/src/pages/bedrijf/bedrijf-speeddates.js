// src/views/bedrijf-speeddates.js
import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import '../../css/consolidated-style.css';
import { createBedrijfNavbar, closeBedrijfNavbar, setupBedrijfNavbarEvents } from '../../utils/bedrijf-navbar.js';

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
    ${createBedrijfNavbar('speeddates')}
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
    ${closeBedrijfNavbar()}
  `;

  setupBedrijfNavbarEvents();

  // Fetch user info to get gebruiker_id
  const token = sessionStorage.getItem('authToken');

  if (!token) {
    console.error('Geen geldig token gevonden in sessionStorage.');
    alert('Uw sessie is verlopen. Log opnieuw in om verder te gaan.');
    window.location.href = '/login';
    return;
  }

  // Fetch user info to get gebruiker_id
  fetch('https://api.ehb-match.me/auth/info', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Fout bij ophalen van gebruikersinformatie:', response.status);
        return response.text().then((text) => {
          console.error('Response text:', text);
          throw new Error('Fout bij ophalen van gebruikersinformatie');
        });
      }
      return response.json();
    })
    .then((userInfo) => {
      const gebruikerId = userInfo.user.id;

      if (!gebruikerId) {
        console.error('Gebruiker ID ontbreekt in de API-respons:', userInfo);
        alert('Er is een probleem met het ophalen van uw gebruikersinformatie. Neem contact op met de beheerder.');
        return;
      }

      // Fetch speeddates using gebruiker_id
      fetch(`https://api.ehb-match.me/speeddates/accepted?id=${gebruikerId}`, {
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
          console.log('API Response Data:', data);
          if (!Array.isArray(data)) {
            console.warn('API response is not an array. Wrapping it in an array for processing.');
            data = [data];
          }

          const speeddatesHtml = data.map((speeddate) => `
            <tr>
              <td>${speeddate.voornaam_student} ${speeddate.achternaam_student}</td>
              <td>${new Date(speeddate.begin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(speeddate.einde).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td>${speeddate.lokaal}</td>
              <td>${speeddate.akkoord ? 'Akkoord' : 'Niet akkoord'}</td>
            </tr>
          `).join('');

          rootElement.querySelector('.bedrijf-profile-content').innerHTML = `
            <div class="bedrijf-profile-form-container">
              <h1 class="bedrijf-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
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
                    ${speeddatesHtml}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        })
        .catch((error) => {
          console.error('Fout bij ophalen van speeddates:', error);
          alert('Er is een fout opgetreden bij het ophalen van speeddates. Controleer de console voor meer details.');
        });
    })
    .catch((error) => {
      console.error('Fout bij ophalen van gebruikersinformatie:', error);
      alert('Er is een fout opgetreden bij het ophalen van gebruikersinformatie. Controleer de console voor meer details.');
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