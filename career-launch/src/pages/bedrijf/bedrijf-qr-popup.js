import logoIcon from '../../icons/favicon-32x32.png';
import defaultAvatar from '../../images/default.png';

export function renderBedrijfQRPopup(rootElement, companyData = {}) {
  rootElement.innerHTML = `
    <div class="company-profile-container">
      <header class="company-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="company-profile-burger">
          &#9776;
        </button>
        <ul id="burger-dropdown" class="company-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="company-profile-main">
        <!-- Dummy QR content -->
        <div style="padding:2rem;text-align:center;">QR-code Dummy</div>
      </div>
    </div>
  `;
}

export default renderBedrijfQRPopup;

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
}

renderSidebar();

