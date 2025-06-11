import { renderAdmin } from './pages/admin/admin-login.js';
import { renderAdminDashboard } from './pages/admin/admin-dashboard.js';
import { renderAdminSelectDashboard } from './pages/admin/admin-select-dashboard.js';

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

  navigate(path, {replace = false} = {}) {
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

    // Protected route check
    if (path === '/admin/admin-dashboard') {
      const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
      if (!isLoggedIn || isLoggedIn !== 'true') {
        sessionStorage.setItem('redirectAfterLogin', path);
        this.navigate('/admin', {replace: true});
        return;
      }
    }

    const route = this.routes[path] || this.routes['/404'];
    if (route) {
      this.rootElement.innerHTML = '';
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
      '/admin/admin-dashboard': 'Admin Dashboard - Career Launch 2025',
      '/contact': 'Contacteer ons - Career Launch 2025',
      '/privacy': 'Privacy Beleid - Career Launch 2025',
      '/404': 'Pagina niet gevonden - Career Launch 2025',
      '/Bedrijf/Bedrijf-Profiel': 'Bedrijf Profiel - Career Launch 2025',
      '/Bedrijf/Zoek-Criteria': 'Zoek Criteria Bedrijf - Career Launch 2025',
      '/Student-Register': 'Student Registreren - Career Launch 2025',
      '/Student-Opleiding': 'Student Opleiding - Career Launch 2025',
      '/Student-Skills': 'Student Skills - Career Launch 2025',
      '/Bedrijf-Register': 'Bedrijf Registreren - Career Launch 2025',
    };
    document.title = titles[path] || 'Career Launch 2025';
  }

  static navigate(path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export default Router;
