import {
  createBedrijfNavbar,
  setupBedrijfNavbarEvents,
} from '../../utils/bedrijf-navbar.js';

export function renderBedrijfSpeeddatesVerzoeken(
  rootElement,
  companyData = {}
) {
  let verzoeken = [
    {
      student: 'John Doe',
      lokaal: 'B102',
      tijd: '13:30',
      status: 'Geaccepteerd',
    },
    {
      student: 'Jane Smith',
      lokaal: 'A201',
      tijd: '11:00',
      status: 'In afwachting',
    },
    {
      student: 'Alice Johnson',
      lokaal: 'C004',
      tijd: '15:00',
      status: 'In afwachting',
    },
  ];

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
                         <th>Lokaal</th>
                         <th>Tijd</th>
                         <th>Status</th>
                         <th>Acties</th>
                       </tr>
                     </thead>
                     <tbody>
                       ${verzoeken
                         .map(
                           (v, index) => `
                           <tr data-request-id="${index}">
                             <td>${v.student}</td>
                             <td>${v.lokaal}</td>
                             <td>${v.tijd}</td>
                             <td><span class="status ${v.status
                               .toLowerCase()
                               .replace(' ', '-')}">${v.status}</span></td>
                             <td>
                               ${
                                 v.status === 'In afwachting'
                                   ? `<button class="btn-accept" onclick="acceptRequest(${index})">Accepteren</button>
                                    <button class="btn-decline" onclick="declineRequest(${index})">Weigeren</button>`
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

  // Setup request management functions
  window.acceptRequest = (index) => {
    verzoeken[index].status = 'Geaccepteerd';
    renderBedrijfSpeeddatesVerzoeken(rootElement, companyData);
    alert(`Speeddate verzoek van ${verzoeken[index].student} geaccepteerd!`);
  };

  window.declineRequest = (index) => {
    verzoeken[index].status = 'Geweigerd';
    renderBedrijfSpeeddatesVerzoeken(rootElement, companyData);
    alert(`Speeddate verzoek van ${verzoeken[index].student} geweigerd.`);
  };
}
