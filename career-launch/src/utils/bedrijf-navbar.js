// src/utils/bedrijf-navbar.js
import logoIcon from '../icons/favicon-32x32.png';

export function createBedrijfNavbar(activeRoute = '') {
  return `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>

      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link ${
              activeRoute === 'profile' ? 'active' : ''
            }">Profiel</button></li>
            <li><button data-route="search-criteria" class="sidebar-link ${
              activeRoute === 'search-criteria' ? 'active' : ''
            }">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link ${
              activeRoute === 'speeddates' ? 'active' : ''
            }">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link ${
              activeRoute === 'requests' ? 'active' : ''
            }">Speeddates-verzoeken</button></li>            <li><button data-route="studenten" class="sidebar-link ${
    activeRoute === 'studenten' ? 'active' : ''
  }">Studenten</button></li>
          </ul>
        </nav>

        <div class="bedrijf-profile-content">
`;
}

export function closeBedrijfNavbar() {
  return `
        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;
}

export function setupBedrijfNavbarEvents() {
  console.log('Setting up bedrijf navbar events...');

  // Sidebar navigation
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  console.log('Found sidebar links:', sidebarLinks.length);

  sidebarLinks.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      console.log('Clicking route:', route);

      import('../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'profile':
            console.log('Navigating to bedrijf profile...');
            Router.navigate('/bedrijf/bedrijf-profiel');
            break;
          case 'search-criteria':
            Router.navigate('/bedrijf/zoek-criteria');
            break;
          case 'speeddates':
            Router.navigate('/bedrijf/speeddates');
            break;
          case 'requests':
            Router.navigate('/bedrijf/speeddates-verzoeken');
            break;
          case 'studenten':
            Router.navigate('/bedrijf/studenten');
            break;
        }
      });
    });
  });
  // Burger menu functionality
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    dropdown.classList.remove('open');
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!dropdown.classList.contains('open')) {
        dropdown.classList.add('open');
      } else {
        dropdown.classList.remove('open');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });
  }
  // Settings button
  const settingsButton = document.getElementById('nav-settings');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      dropdown.classList.remove('open');
      import('../pages/bedrijf/bedrijf-settings.js').then((module) => {
        module.showBedrijfSettingsPopup();
      });
    });
  }

  // Logout button
  const logoutButton = document.getElementById('nav-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      const { logoutUser } = await import('../utils/auth-api.js');
      await logoutUser();

      // Clear session data
      window.sessionStorage.removeItem('companyData');
      window.sessionStorage.removeItem('authToken');
      window.sessionStorage.removeItem('userType');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');

      // Navigate to login
      import('../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/login');
      });
    });
  }

  // Footer links
  const privacyLink = document.getElementById('privacy-policy');
  if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      import('../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/privacy');
      });
    });
  }

  const contactLink = document.getElementById('contacteer-ons');
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      import('../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/contact');
      });
    });
  }
}
