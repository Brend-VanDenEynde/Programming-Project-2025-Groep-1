import logoIcon from '../../icons/favicon-32x32.png';
import { setupNavigationLinks } from './bedrijf-speeddates.js';

export function renderBedrijfSpeeddatesRequests(rootElement, companyData = {}) {
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

  function renderTable() {
    const tableHtml =
      verzoeken.length === 0
        ? `<p style="text-align:center;">Nog geen speeddates-verzoeken gevonden.</p>`
        : `
        <div class="speeddates-table-container">
          <table class="speeddates-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Lokaal</th>
                <th>Tijd</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${verzoeken
                .map(
                  (v) => `
                <tr>
                  <td>${v.student}</td>
                  <td>${v.lokaal}</td>
                  <td>${v.tijd}</td>
                  <td>${v.status}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`;

    rootElement.innerHTML = tableHtml;
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

  renderTable();
  renderSidebar();
}

// Dummy file for bedrijf-speeddates-verzoeken.js
export function renderBedrijfSpeeddatesVerzoeken() {
  return 'Bedrijf Speeddates Verzoeken Dummy';

}
export default renderBedrijfSpeeddatesVerzoeken;