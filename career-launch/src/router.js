// src/router.js

// Importeer al je paginacomponenten
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/Student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/Student/search-criteria-student.js';
import { renderAdmin } from './pages/Admin/admin.js';
import { renderAdminSelectDashboard } from './pages/Admin/admin-select-dashboard.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';
import { renderQRPopup } from './pages/Student/student-qr-popup.js';
import { renderSpeeddates } from './pages/Student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/Student/student-speeddates-verzoeken.js';
import { showSettingsPopup } from './pages/Student/student-settings.js';
import { renderBedrijfProfiel } from './pages/Bedrijf/bedrijf-profiel.js';
import { renderBedrijfRegister } from './pages/Register-Bedrijf/bedrijf-register.js';

function renderNotFound(rootElement) {
  rootElement.innerHTML = `
    <div class="not-found-container">
      <h1>404 - Pagina niet gevonden</h1>
      <p>De pagina die je zoekt bestaat niet.</p>
      <a href="/" data-route="/">Terug naar home</a>
    </div>
  `;
}

// Zet je routes op
const routes = {
  '/': renderHome,
  '/404': renderNotFound,
  '/registreer': renderRegister,
  '/login': renderLogin,
  '/Student/Student-Profiel': renderStudentProfiel,
  '/Student/Zoek-Criteria': renderSearchCriteriaStudent,
  '/admin': renderAdmin,
  '/admin-select-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard': renderAdminSelectDashboard,
  '/privacy': renderPrivacy,
  '/contact': renderContact,
  '/Student/Student-QR-Popup': renderQRPopup,
  '/Student/Student-Speeddates': renderSpeeddates,
  '/Student/Student-Speeddates-Verzoeken': renderSpeeddatesRequests,
  '/Student/Student-Settings': showSettingsPopup,
  '/Bedrijf/Bedrijf-Profiel': renderBedrijfProfiel,
  '/registreer-bedrijf': renderBedrijfRegister,
};

// Router class
class Router {
  constructor(routes) {
    this.routes = routes;
    this.rootElement = document.getElementById('app');
    window.addEventListener('popstate', () => this.handleRouteChange());
    this.setupLinkHandling();
    this.handleRouteChange();
  }

  setupLinkHandling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"], a[data-route]');
      if (link) {
        e.preventDefault();
        let path = link.getAttribute('href') || link.getAttribute('data-route');
        this.navigate(path);
      }
    });
  }

  navigate(path, { replace = false } = {}) {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    this.handleRouteChange();
  }

  handleRouteChange() {
    let path = window.location.pathname;
    if (!path.startsWith('/')) path = '/' + path;
    path = path.replace(/\/+/g, '/');

    // Als route niet bestaat: 404
    const route = this.routes[path] || this.routes['/404'];
    if (route) {
      this.rootElement.innerHTML = '';
      // Optioneel: je kan extra data meegeven als je wil
      route(this.rootElement);
      this.updateTitle(path);
    }
  }

  updateTitle(path) {
    const titles = {
      '/': 'Career Launch 2025 - Home',
      '/registreer': 'Registreren - Career Launch 2025',
      '/login': 'Inloggen - Career Launch 2025',
      '/Student/Student-Profiel': 'Student Profiel - Career Launch 2025',
      '/Student/Zoek-Criteria': 'Zoek Criteria - Career Launch 2025',
      '/Student/Student-QR-Popup': 'Jouw QR-code - Career Launch 2025',
      '/Student/Student-Speeddates': 'Jouw Speeddates - Career Launch 2025',
      '/Student/Student-Speeddates-Verzoeken': 'Speeddate Verzoeken - Career Launch 2025',
      '/Student/Student-Settings': 'Instellingen - Career Launch 2025',
      '/admin': 'Admin Login - Career Launch 2025',
      '/admin-dashboard': 'Admin Dashboard - Career Launch 2025',
      '/contact': 'Contacteer ons - Career Launch 2025',
      '/privacy': 'Privacy Beleid - Career Launch 2025',
      '/404': 'Pagina niet gevonden - Career Launch 2025',
      '/Bedrijf/Bedrijf-Profiel': 'Bedrijf Profiel - Career Launch 2025',
      '/registreer-bedrijf': 'Bedrijf Registreren - Career Launch 2025',
    };
    document.title = titles[path] || 'Career Launch 2025';
  }

  static navigate(path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

// Maak de router direct aan
const router = new Router(routes);
window.appRouter = router;

// Automatisch redirecten naar https op productie (niet localhost)
if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
  window.location.href = window.location.href.replace('http:', 'https:');
}

// *** HIERONDER default export ***
export default Router;
