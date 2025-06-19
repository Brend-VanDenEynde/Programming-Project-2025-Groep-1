// src/router.js

// Importeer al je paginacomponenten
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/student/search-criteria-student.js';
import { renderAdmin } from './pages/admin/admin-login.js';
import { renderAdminSelectDashboard } from './pages/admin/admin-select-dashboard.js';
import { renderAdminIngeschrevenStudenten } from './pages/admin/admin-ingeschreven-studenten.js';
import { renderAdminIngeschrevenBedrijven } from './pages/admin/admin-ingeschreven-bedrijven.js';
import { renderAdminBedrijvenInBehandeling } from './pages/admin/admin-bedrijven-in-behandeling.js';
import { renderAdminStudentDetail } from './pages/admin/admin-student-detail.js';
import { renderAdminCompanyDetail } from './pages/admin/admin-company-detail.js';
import { renderAdminProcessingCompanyDetail } from './pages/admin/admin-processing-company-detail.js';
import { renderAdminContacten } from './pages/admin/admin-contacten.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';
import { renderSpeeddates } from './pages/student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/student/student-speeddates-verzoeken.js';
import { showSettingsPopup } from './pages/student/student-settings.js';
import { renderBedrijfProfiel } from './pages/bedrijf/bedrijf-profiel.js';
import { renderBedrijfRegister } from './pages/register-bedrijf/bedrijf-register.js';
import { renderBedrijven } from './pages/student/bedrijven.js';
import { renderSearchCriteriaBedrijf } from './pages/bedrijf/search-criteria-bedrijf.js';
import { renderBedrijfSpeeddates } from './pages/bedrijf/bedrijf-speeddates.js';
import { renderBedrijfSpeeddatesRequests } from './pages/bedrijf/bedrijf-speeddates-verzoeken.js';
import { renderStudenten } from './pages/bedrijf/studenten.js';

function renderNotFound(rootElement) {
  rootElement.innerHTML = `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <p>Pagina niet gevonden</p>
        <a href="/" data-route="/">← Terug naar home</a>
      </div>
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
  '/student/student-speeddates': renderSpeeddates,
  '/student/student-speeddates-verzoeken': renderSpeeddatesRequests,
  '/student/student-settings': showSettingsPopup,
  '/student/bedrijven': (rootElement) => {
    const studentData = JSON.parse(
      window.sessionStorage.getItem('studentData')
    );
    renderBedrijven(rootElement, studentData);
  },
  '/admin': renderAdmin,
  '/admin-login': renderAdmin,
  '/admin-select-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard': renderAdminIngeschrevenStudenten,
  '/admin-dashboard/ingeschreven-studenten': renderAdminIngeschrevenStudenten,
  '/admin-dashboard/ingeschreven-bedrijven': renderAdminIngeschrevenBedrijven,
  '/admin-dashboard/bedrijven-in-behandeling':
    renderAdminBedrijvenInBehandeling,
  '/admin-dashboard/contacten': renderAdminContacten,
  '/admin-dashboard/student-detail': renderAdminStudentDetail,
  '/admin-dashboard/company-detail': renderAdminCompanyDetail,
  '/admin-dashboard/processing-company-detail':
    renderAdminProcessingCompanyDetail,
  '/privacy': renderPrivacy,
  '/contact': renderContact,
  '/bedrijf/bedrijf-profiel': async (rootElement) => {
    const bedrijfData = JSON.parse(
      window.sessionStorage.getItem('bedrijfData') || '{}'
    );
    await renderBedrijfProfiel(rootElement, bedrijfData, true);
  },
  '/bedrijf/zoek-criteria': (rootElement) => {
    const bedrijfData = JSON.parse(
      window.sessionStorage.getItem('bedrijfData') || '{}'
    );
    renderSearchCriteriaBedrijf(rootElement, bedrijfData);
  },
  '/bedrijf/speeddates': (rootElement) => {
    const bedrijfData = JSON.parse(
      window.sessionStorage.getItem('bedrijfData') || '{}'
    );
    renderBedrijfSpeeddates(rootElement, bedrijfData);
  },
  '/bedrijf/speeddates-verzoeken': (rootElement) => {
    const bedrijfData = JSON.parse(
      window.sessionStorage.getItem('bedrijfData') || '{}'
    );
    renderBedrijfSpeeddatesRequests(rootElement, bedrijfData);
  },
  '/bedrijf/studenten': (rootElement) => {
    const bedrijfData = JSON.parse(
      window.sessionStorage.getItem('bedrijfData') || '{}'
    );
    renderStudenten(rootElement, bedrijfData);
  },
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

  // Verbeterde back navigation methode
  goBack(fallbackPath = '/') {
    // Probeer eerst terug te gaan via browser history
    if (window.history.length > 1 && document.referrer) {
      // Check of de referrer van dezelfde origin is om veiligheidsredenen
      try {
        const referrerUrl = new URL(document.referrer);
        const currentUrl = new URL(window.location.href);

        if (referrerUrl.origin === currentUrl.origin) {
          window.history.back();
          return;
        }
      } catch (e) {
        // Als er een fout is bij het parsen van URLs, gebruik fallback
      }
    }

    // Fallback naar de opgegeven route
    this.navigate(fallbackPath);
  }
  handleRouteChange() {
    let path = window.location.pathname;
    if (!path.startsWith('/')) path = '/' + path;
    path = path.replace(/\/+/g, '/');

    // Als route niet bestaat: 404
    const route = this.routes[path] || this.routes['/404'];
    if (route) {
      this.rootElement.innerHTML = '';
      // Handle both sync and async route functions
      const result = route(this.rootElement);
      if (result && typeof result.then === 'function') {
        // It's a promise, handle async
        result.catch((error) => {
          console.error('Route error:', error);
          this.rootElement.innerHTML = '<div>Error loading page</div>';
        });
      }
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
      '/student/student-speeddates': 'Jouw Speeddates - Career Launch 2025',
      '/student/student-speeddates-verzoeken':
        'Speeddate Verzoeken - Career Launch 2025',
      '/student/student-settings': 'Instellingen - Career Launch 2025',
      '/student/bedrijven': 'Bedrijven - Career Launch 2025',
      '/admin': 'Admin - Career Launch 2025',
      '/admin-login': 'Admin Login - Career Launch 2025',
      '/admin-dashboard': 'Ingeschreven Studenten - Admin - Career Launch 2025',
      '/contact': 'Contacteer ons - Career Launch 2025',
      '/privacy': 'Privacy Beleid - Career Launch 2025',
      '/404': 'Pagina niet gevonden - Career Launch 2025',
      '/bedrijf/bedrijf-profiel': 'Bedrijf Profiel - Career Launch 2025',
      '/bedrijf/zoek-criteria': 'Zoek Criteria - Career Launch 2025',
      '/bedrijf/speeddates': 'Speeddates - Career Launch 2025',
      '/bedrijf/speeddates-verzoeken':
        'Speeddate Verzoeken - Career Launch 2025',
      '/bedrijf/settings': 'Instellingen - Career Launch 2025',
      '/bedrijf/studenten': 'Studenten - Career Launch 2025',
      '/registreer-bedrijf': 'Bedrijf Registreren - Career Launch 2025',
    };
    document.title = titles[path] || 'Career Launch 2025';
  }
  static navigate(path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  static goBack(fallbackPath = '/') {
    if (window.appRouter) {
      window.appRouter.goBack(fallbackPath);
    } else {
      // Fallback als er geen router instance is
      if (window.history.length > 1 && document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          const currentUrl = new URL(window.location.href);

          if (referrerUrl.origin === currentUrl.origin) {
            window.history.back();
            return;
          }
        } catch (e) {
          // Error in URL parsing, use fallback
        }
      }
      Router.navigate(fallbackPath);
    }
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
