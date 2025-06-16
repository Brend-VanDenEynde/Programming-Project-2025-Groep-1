import {
  createBedrijfNavbar,
  closeBedrijfNavbar,
  setupBedrijfNavbarEvents,
} from '../../utils/bedrijf-navbar.js';
import {
  fetchPendingSpeeddates,
  acceptSpeeddateRequest,
  rejectSpeeddateRequest,
} from '../../utils/data-api.js';

export async function renderBedrijfSpeeddatesVerzoeken(
  rootElement,
  companyData = {}
) {
  // Show loading state
  rootElement.innerHTML = `
    ${createBedrijfNavbar('requests')}
      <div class="content-header">
        <h1>Speeddate Verzoeken</h1>
        <p>Beheer je inkomende speeddate verzoeken</p>
      </div>
      <div class="speeddates-verzoeken-content">
        <div class="loading-state">
          <p>Speeddate verzoeken laden...</p>
        </div>
      </div>
    ${closeBedrijfNavbar()}
  `;

  try {
    // Fetch pending speeddate requests from API
    const apiVerzoeken = await fetchPendingSpeeddates(); // Transform API data to match expected format
    const verzoeken = apiVerzoeken.map((request) => ({
      id: request.id,
      student: `${request.voornaam_student} ${request.achternaam_student}`,
      studentId: request.id_student,
      profielFoto: request.profiel_foto_student,
      lokaal: request.lokaal,
      tijd: new Date(request.begin).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      datum: new Date(request.begin).toLocaleDateString('nl-NL'),
      begin: request.begin,
      einde: request.einde,
      status:
        request.akkoord === true
          ? 'Geaccepteerd'
          : request.akkoord === false
          ? 'Geweigerd'
          : 'In afwachting',
      akkoord: request.akkoord,
    }));

    // Render the page with fetched data
    renderPageContent(rootElement, verzoeken, companyData);
  } catch (error) {
    console.error('Error fetching speeddate requests:', error);
    // Show error state
    rootElement.innerHTML = `
      ${createBedrijfNavbar('requests')}
        <div class="content-header">
          <h1>Speeddate Verzoeken</h1>
          <p>Beheer je inkomende speeddate verzoeken</p>
        </div>
        <div class="speeddates-verzoeken-content">
          <div class="error-state">
            <p>Er is een fout opgetreden bij het laden van de speeddate verzoeken.</p>
            <button onclick="location.reload()" class="btn-retry">Opnieuw proberen</button>
          </div>
        </div>
      ${closeBedrijfNavbar()}
    `;
  }
}

function renderPageContent(rootElement, verzoeken, companyData) {
  rootElement.innerHTML = `
    ${createBedrijfNavbar('requests')}
      <div class="content-header">
        <h1>Speeddate Verzoeken</h1>
        <p>Beheer je inkomende speeddate verzoeken</p>
      </div>

      <div class="speeddates-verzoeken-content">
        ${
          verzoeken.length === 0
            ? `<div class="no-requests">
               <p>Nog geen speeddate verzoeken ontvangen.</p>
             </div>`
            : `<div class="speeddates-table-container">
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
                   ${verzoeken
                     .map(
                       (v, index) => `
                       <tr data-request-id="${v.id}">
                         <td>
                           <div class="student-info">
                             ${
                               v.profielFoto
                                 ? `<img src="${v.profielFoto}" alt="${v.student}" class="student-avatar">`
                                 : ''
                             }
                             <span>${v.student}</span>
                           </div>
                         </td>
                         <td>${v.datum}</td>
                         <td>${v.tijd}</td>
                         <td>${v.lokaal}</td>
                         <td><span class="status ${v.status
                           .toLowerCase()
                           .replace(' ', '-')}">${v.status}</span></td>
                         <td>
                           ${
                             v.status === 'In afwachting'
                               ? `<button class="btn-accept" onclick="acceptRequest(${v.id}, '${v.student}')">Accepteren</button>
                                <button class="btn-decline" onclick="declineRequest(${v.id}, '${v.student}')">Weigeren</button>`
                               : `<span class="status-final">${v.status}</span>`
                           }
                         </td>
                       </tr>`
                     )
                     .join('')}
                 </tbody>
               </table>
             </div>`
        }
      </div>
    ${closeBedrijfNavbar()}
  `;
  // Setup navbar events
  setTimeout(() => {
    setupBedrijfNavbarEvents();
  }, 100);
  // Setup request management functions
  window.acceptRequest = async (requestId, studentName) => {
    try {
      // Show loading state
      const buttonElement = document.querySelector(
        `[onclick="acceptRequest(${requestId}, '${studentName}')"]`
      );
      if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.textContent = 'Accepteren...';
      } // Call API to accept speeddate request
      const result = await acceptSpeeddateRequest(requestId);

      // Show success message with information about where to find the speeddate
      alert(
        `Speeddate verzoek van ${studentName} geaccepteerd!\n\nDe speeddate is nu toegevoegd aan je speeddates overzicht en is zichtbaar voor de student.`
      );

      // Refresh the page to show updated data
      await renderBedrijfSpeeddatesVerzoeken(rootElement, companyData);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Er is een fout opgetreden bij het accepteren van het verzoek.');

      // Re-enable button on error
      const buttonElement = document.querySelector(
        `[onclick="acceptRequest(${requestId}, '${studentName}')"]`
      );
      if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.textContent = 'Accepteren';
      }
    }
  };
  window.declineRequest = async (requestId, studentName) => {
    try {
      // Show loading state
      const buttonElement = document.querySelector(
        `[onclick="declineRequest(${requestId}, '${studentName}')"]`
      );
      if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.textContent = 'Weigeren...';
      }

      // Call API to reject speeddate request
      const result = await rejectSpeeddateRequest(requestId);

      // Show success message
      alert(
        `Speeddate verzoek van ${studentName} geweigerd.\n\nHet verzoek is afgewezen en de student is hiervan op de hoogte gesteld.`
      );

      // Refresh the page to show updated data
      await renderBedrijfSpeeddatesVerzoeken(rootElement, companyData);
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Er is een fout opgetreden bij het weigeren van het verzoek.');

      // Re-enable button on error
      const buttonElement = document.querySelector(
        `[onclick="declineRequest(${requestId}, '${studentName}')"]`
      );
      if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.textContent = 'Weigeren';
      }
    }
  };
}