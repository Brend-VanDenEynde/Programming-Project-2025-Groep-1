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

// Zorg dat deze functie buiten andere functies staat
function setupNavigationLinks() {
  const links = {
    profile: '/bedrijf/bedrijf-profiel',
    speeddates: '/bedrijf/bedrijf-speeddates',
    requests: '/bedrijf/bedrijf-speeddates-verzoeken',
    qr: '/bedrijf/bedrijf-qr',
  };
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    const route = link.getAttribute('data-route');
    if (links[route]) {
      link.addEventListener('click', () => {
        window.location.href = links[route];
      });
    }
  });


  
setupNavigationLinks();
