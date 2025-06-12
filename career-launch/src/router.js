import { renderStudentProfiel } from './pages/Student/student-profiel.js';
import { renderBedrijfRegister } from './pages/Register-Bedrijf/bedrijf-register.js';

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
      '/Student/Student-Profiel': (rootElement) => {
    let studentData = {};
    try {
      studentData = JSON.parse(window.sessionStorage.getItem('studentData')) || {};
    } catch (e) {
      studentData = {};
    }
    renderStudentProfiel(rootElement, studentData, true);
  },
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

const routes = {
  '/': (rootElement) => {
    rootElement.innerHTML = '<h1>Home</h1>';
  },
  '/registreer': (rootElement) => {
    rootElement.innerHTML = '<h1>Registreren</h1>';
  },
  '/login': (rootElement) => {
    rootElement.innerHTML = '<h1>Inloggen</h1>';
  },
  '/Student/Student-Profiel': (rootElement) => {
    let studentData = {};
    try {
      studentData = JSON.parse(window.sessionStorage.getItem('studentData')) || {};
    } catch (e) {
      studentData = {};
    }
    renderStudentProfiel(rootElement, studentData, true);
  },
  '/Student/Zoek-Criteria': (rootElement) => {
    rootElement.innerHTML = '<h1>Zoek Criteria</h1>';
  },
  '/Student/Student-QR-Popup': (rootElement) => {
    rootElement.innerHTML = '<h1>Jouw QR-code</h1>';
  },
  '/Student/Student-Speeddates': (rootElement) => {
    rootElement.innerHTML = '<h1>Jouw Speeddates</h1>';
  },
  '/Student/Student-Speeddates-Verzoeken': (rootElement) => {
    rootElement.innerHTML = '<h1>Speeddate Verzoeken</h1>';
  },
  '/Student/Student-Settings': (rootElement) => {
    rootElement.innerHTML = '<h1>Instellingen</h1>';
  },
  '/admin': (rootElement) => {
    rootElement.innerHTML = '<h1>Admin Login</h1>';
  },
  '/admin/admin-dashboard': (rootElement) => {
    rootElement.innerHTML = '<h1>Admin Dashboard</h1>';
  },
  '/contact': (rootElement) => {
    rootElement.innerHTML = '<h1>Contacteer ons</h1>';
  },
  '/privacy': (rootElement) => {
    rootElement.innerHTML = '<h1>Privacy Beleid</h1>';
  },
  '/404': (rootElement) => {
    rootElement.innerHTML = '<h1>Pagina niet gevonden</h1>';
  },
  '/Bedrijf/Bedrijf-Profiel': (rootElement) => {
    rootElement.innerHTML = '<h1>Bedrijf Profiel</h1>';
  },
  '/Bedrijf/Zoek-Criteria': (rootElement) => {
    rootElement.innerHTML = '<h1>Zoek Criteria Bedrijf</h1>';
  },
  '/Student-Register': (rootElement) => {
    rootElement.innerHTML = '<h1>Student Registreren</h1>';
  },
  '/Student-Opleiding': (rootElement) => {
    rootElement.innerHTML = '<h1>Student Opleiding</h1>';
  },
  '/Student-Skills': (rootElement) => {
    rootElement.innerHTML = '<h1>Student Skills</h1>';
  },
  '/Bedrijf-Register': renderBedrijfRegister,
};

export default Router;
