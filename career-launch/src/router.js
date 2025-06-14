class Router {
  constructor(routes) {
    this.routes = routes;
    this.rootElement = document.getElementById('app');

    // Luister naar popstate (browser back/forward)
    window.addEventListener('popstate', () => this.handleRouteChange());

    // Luister naar clicks op interne links
    this.setupLinkHandling();

    // Initial route check
    this.handleRouteChange();
  }
  setupLinkHandling() {
    // Intercept clicks op interne links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"], a[data-route]');
      if (link) {
        e.preventDefault();
        let path = link.getAttribute('href') || link.getAttribute('data-route');

        console.log('Router: Link clicked, navigating to:', path);
        this.navigate(path);
      }
    });
  }
  navigate(path) {
    console.log('Router: Navigating to:', path);

    // Gebruik altijd normale URL routing (geen hash)
    window.history.pushState(null, '', path);
    this.handleRouteChange();
  }
  handleRouteChange() {
    let path = window.location.pathname;

    // Zorg ervoor dat path begint met /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Clean up any double slashes
    path = path.replace(/\/+/g, '/'); // Check admin access
    if (path === '/admin-dashboard') {
      const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
      if (!isLoggedIn || isLoggedIn !== 'true') {
        this.navigate('/admin');
        return;
      }
    }

    const route = this.routes[path] || this.routes['/404'];
    if (route) {
      this.rootElement.innerHTML = '';
      route(this.rootElement);

      // Update document title
      this.updateTitle(path);
    }

    console.log('Navigated to:', path);
    console.log('Route exists?', !!this.routes[path]);
  }
  updateTitle(path) {
    const titles = {
      '/': 'Career Launch 2025 - Home',
      '/registreer': 'Registreren - Career Launch 2025',
      '/login': 'Inloggen - Career Launch 2025',
      '/Student/Student-Profiel': 'Student Profiel - Career Launch 2025',
      '/Student/Zoek-Criteria': 'Zoek Criteria - Career Launch 2025',
      '/admin': 'Admin Login - Career Launch 2025',
      '/admin-dashboard': 'Admin Dashboard - Career Launch 2025',
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
  } // Helper method voor gebruik in pagina's
  static navigate(path) {
    console.log('Static Router.navigate called with:', path);

    // Gebruik altijd normale URL routing (geen hash)
    window.history.pushState(null, '', path);
    // Trigger een custom event zodat de router weet dat er genavigeerd is
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export default Router;
