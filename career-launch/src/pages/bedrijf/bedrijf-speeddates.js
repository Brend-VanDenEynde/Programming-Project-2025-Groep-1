// src/views/bedrijf-speeddates.js
import logoIcon from '../../Icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { renderBedrijfProfiel } from './bedrijf-profiel.js';
import { renderSearchCriteriaBedrijf } from './search-criteria-bedrijf.js';
import { renderBedrijfSpeeddatesRequests } from './bedrijf-speeddates-verzoeken.js';
import { renderBedrijfQRPopup } from './bedrijf-qr-popup.js';
import { showBedrijfSettingsPopup } from './bedrijf-settings.js';

export function renderBedrijfSpeeddates(rootElement, bedrijfData = {}) {
  const speeddates = [
    {
      bedrijf: 'Web & Co',
      tijd: '10:00',
      locatie: 'Stand A101',
      status: 'Bevestigd',
    },
    {
      bedrijf: 'DesignXperts',
      tijd: '14:30',
      locatie: 'Stand B202',
      status: 'Bevestigd',
    },
    {
      bedrijf: 'SoftDev BV',
      tijd: '09:00',
      locatie: 'Stand C303',
      status: 'In afwachting',
    },
  ];

  function getStatusBadge(status) {
    if (status === 'Bevestigd') {
      return `<span class="status-badge badge-accepted">Bevestigd</span>`;
    } else if (status === 'In afwachting') {
      return `<span class="status-badge badge-waiting">In afwachting</span>`;
    } else if (status === 'Geweigerd') {
      return `<span class="status-badge badge-denied">Geweigerd</span>`;
    } else if (status === 'Geaccepteerd') {
      return `<span class="status-badge badge-accepted">Geaccepteerd</span>`;
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
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>

      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>

        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title" style="text-align:center;width:100%;">Mijn Speeddates</h1>
            <div>
              ${
                speeddates.length === 0
                  ? `<p style="text-align:center;">Je hebt nog geen speeddates ingepland.</p>`
                  : `
                    <div class="speeddates-table-container">
                      <table class="speeddates-table">
                        <thead>
                          <tr>
                            <th>Bedrijf</th>
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
                              <td>${s.bedrijf}</td>
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

  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      switch (route) {
        case 'profile':
          renderBedrijfProfiel(rootElement, bedrijfData);
          break;
        case 'search':
          import('./search-criteria-bedrijf.js').then(m => m.renderSearchCriteriaBedrijf(rootElement, bedrijfData));
          break;
        case 'speeddates':
          import('./bedrijf-speeddates.js').then(m => m.renderBedrijfSpeeddates(rootElement, bedrijfData));
          break;
        case 'requests':
          import('./bedrijf-speeddates-verzoeken.js').then(m => m.renderBedrijfSpeeddatesRequests(rootElement, bedrijfData));
          break;
        case 'studenten':
          import('./studenten.js').then(m => m.renderStudenten(rootElement, bedrijfData));
          break;
        case 'qr':
          import('./bedrijf-qr-popup.js').then(m => m.renderQRPopup(rootElement, bedrijfData));
          break;
      }
    });
  });

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
    document.addEventListener('click', function(event) {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });
    document.getElementById('nav-settings').addEventListener('click', () => {
      dropdown.classList.remove('open');
      showBedrijfSettingsPopup(() => renderBedrijfSpeeddates(rootElement, bedrijfData));
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    });
  }

  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
