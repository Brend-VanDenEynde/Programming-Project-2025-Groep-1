// src/router.js

// Importeer al je paginacomponenten
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/student/search-criteria-student.js';
import { renderAdmin } from './pages/admin/admin.js';
import { renderAdminSelectDashboard } from './pages/admin/admin-select-dashboard.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';
import { renderQRPopup } from './pages/student/student-qr-popup.js';
import { renderSpeeddates } from './pages/student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/student/student-speeddates-verzoeken.js';
import { showSettingsPopup } from './pages/student/student-settings.js';
import { renderBedrijfProfiel } from './pages/bedrijf/bedrijf-profiel.js';
import { renderBedrijfRegister } from './pages/register-bedrijf/bedrijf-register.js';
import { renderBedrijven } from './pages/student/bedrijven.js';

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
  '/student/student-profiel': renderStudentProfiel,
  '/student/zoek-criteria': renderSearchCriteriaStudent,
  '/student/student-qr-popup': renderQRPopup,
  '/student/student-speeddates': renderSpeeddates,
  '/student/student-speeddates-verzoeken': renderSpeeddatesRequests,
  '/student/student-settings': showSettingsPopup,
  '/student/bedrijven': renderBedrijven,
  '/admin': renderAdmin,
  '/admin-select-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard': renderAdminSelectDashboard,
  '/privacy': renderPrivacy,
  '/contact': renderContact,
  '/bedrijf/bedrijf-profiel': renderBedrijfProfiel,
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
      '/student/student-profiel': 'Student Profiel - Career Launch 2025',
      '/student/zoek-criteria': 'Zoek Criteria - Career Launch 2025',
      '/student/student-qr-popup': 'Jouw QR-code - Career Launch 2025',
      '/student/student-speeddates': 'Jouw Speeddates - Career Launch 2025',
      '/student/student-speeddates-verzoeken':
        'Speeddate Verzoeken - Career Launch 2025',
      '/student/student-settings': 'Instellingen - Career Launch 2025',
      '/student/bedrijven': 'Bedrijven - Career Launch 2025',
      '/admin': 'Admin Login - Career Launch 2025',
      '/admin-dashboard': 'Admin Dashboard - Career Launch 2025',
      '/contact': 'Contacteer ons - Career Launch 2025',
      '/privacy': 'Privacy Beleid - Career Launch 2025',
      '/404': 'Pagina niet gevonden - Career Launch 2025',
      '/bedrijf/bedrijf-profiel': 'Bedrijf Profiel - Career Launch 2025',
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
if (
  window.location.protocol === 'http:' &&
  !window.location.hostname.includes('localhost')
) {
  window.location.href = window.location.href.replace('http:', 'https:');
}

// *** HIERONDER default export ***
export default Router;
