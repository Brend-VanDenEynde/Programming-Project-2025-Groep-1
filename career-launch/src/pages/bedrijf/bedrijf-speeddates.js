// src/pages/bedrijf/bedrijf-speeddates.js
import {
  createBedrijfNavbar,
  setupBedrijfNavbarEvents,
} from '../../utils/bedrijf-navbar.js';
import { fetchCompanySpeeddates } from '../../utils/data-api.js';

export async function renderBedrijfSpeeddates(rootElement, bedrijfData = {}) {
  // Show loading state
  rootElement.innerHTML = `
    ${createBedrijfNavbar('speeddates')}
      <div class="content-header">
        <h1>Speeddates Overzicht</h1>
        <p>Bekijk en beheer al je geplande speeddates</p>
      </div>
      <div class="speeddates-content">
        <div class="loading-state">
          <p>Speeddates laden...</p>
        </div>
      </div>
    </div>
  `;

  let speeddates = [];

  try {
    // Fetch speeddates from API
    const apiSpeeddates = await fetchCompanySpeeddates();

    // Transform API data to expected format
    speeddates = apiSpeeddates.map((speeddate) => ({
      id: speeddate.id,
      student: `${speeddate.voornaam_student} ${speeddate.achternaam_student}`,
      datum: new Date(speeddate.begin).toLocaleDateString('nl-NL'),
      tijd: new Date(speeddate.begin).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      lokaal: speeddate.lokaal,
      status: speeddate.akkoord ? 'Bevestigd' : 'In afwachting',
      begin: speeddate.begin,
      einde: speeddate.einde,
    }));
  } catch (error) {
    console.error('Error fetching speeddates:', error);
    // Fall back to empty array, will show "no speeddates" message
    speeddates = [];
  }

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
          <div class="content-header">
            <h1>Speeddates Overzicht</h1>
            <p>Bekijk en beheer al je geplande speeddates</p>
          </div>

          <div class="speeddates-content">
            ${
              speeddates.length === 0
                ? `<div class="no-speeddates">
                   <p>Je hebt nog geen speeddates ingepland.</p>
                   <button class="btn-primary" onclick="planNewSpeeddate()">Plan je eerste speeddate</button>
                 </div>`
                : `<div class="speeddates-stats">
                   <div class="stat-card">
                     <h3>${speeddates.length}</h3>
                     <p>Totaal Speeddates</p>
                   </div>
                   <div class="stat-card">
                     <h3>${
                       speeddates.filter((s) => s.status === 'Bevestigd').length
                     }</h3>
                     <p>Bevestigd</p>
                   </div>
                   <div class="stat-card">
                     <h3>${
                       speeddates.filter((s) => s.status === 'In afwachting')
                         .length
                     }</h3>
                     <p>In afwachting</p>
                   </div>
                 </div>
                 
                 <div class="speeddates-table-container">
                   <table class="speeddates-table">
                     <thead>
                       <tr>
                         <th>Student</th>
                         <th>Datum</th>
                         <th>Tijd</th>
                         <th>Lokaal</th>
                         <th>Status</th>
                         <th>Acties</th>
                       </tr>
                     </thead>
                     <tbody>
                       ${speeddates
                         .map(
                           (speeddate) => `
                         <tr data-speeddate-id="${speeddate.id}">
                           <td>${speeddate.student}</td>
                           <td>${speeddate.datum}</td>
                           <td>${speeddate.tijd}</td>
                           <td>${speeddate.lokaal}</td>
                           <td>${getStatusBadge(speeddate.status)}</td>
                           <td>
                             <button class="btn-small btn-primary" onclick="viewSpeeddate(${
                               speeddate.id
                             })">Bekijk</button>
                             ${
                               speeddate.status === 'In afwachting'
                                 ? `<button class="btn-small btn-success" onclick="confirmSpeeddate(${speeddate.id})">Bevestig</button>`
                                 : ''
                             }
                           </td>
                         </tr>
                       `
                         )
                         .join('')}
                     </tbody>
                   </table>
                 </div>
                 
                 <div class="speeddates-actions">
                   <button class="btn-primary" onclick="planNewSpeeddate()">Nieuwe Speeddate Plannen</button>
                   <button class="btn-secondary" onclick="exportSpeeddates()">Exporteer naar Kalender</button>
                 </div>`
            }
          </div>        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>

      </footer>
    </div>
  `;

  // Setup navbar events
  setupBedrijfNavbarEvents();

  // Setup speeddate management functions
  window.viewSpeeddate = (id) => {
    const speeddate = speeddates.find((s) => s.id === id);
    if (speeddate) {
      alert(
        `Speeddate details:\nStudent: ${speeddate.student}\nDatum: ${speeddate.datum}\nTijd: ${speeddate.tijd}\nLokaal: ${speeddate.lokaal}`
      );
    }
  };

  window.confirmSpeeddate = (id) => {
    const speeddate = speeddates.find((s) => s.id === id);
    if (speeddate && confirm(`Bevestig speeddate met ${speeddate.student}?`)) {
      speeddate.status = 'Bevestigd';
      renderBedrijfSpeeddates(rootElement, bedrijfData);
      alert(`Speeddate met ${speeddate.student} bevestigd!`);
    }
  };

  window.planNewSpeeddate = () => {
    alert('Nieuwe speeddate plannen functionaliteit wordt geïmplementeerd.');
  };

  window.exportSpeeddates = () => {
    alert('Kalender export functionaliteit wordt geïmplementeerd.');
  };
}

export function setupNavigationLinks() {
  // This function is kept for backward compatibility but is now handled by the navbar utility
  console.log('setupNavigationLinks called - now handled by bedrijf navbar');
}

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
          if (data.length === 0) {
            rootElement.querySelector('.bedrijf-profile-content').innerHTML = `
              <div class="bedrijf-profile-form-container">
                <h1 class="bedrijf-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
                <p style="text-align:center;">U heeft nog geen speeddates ingepland.</p>
              </div>
            `;
            return;
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
