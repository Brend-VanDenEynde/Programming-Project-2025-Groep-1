class Router {
  constructor(routes) {
    this.routes = routes;
    this.rootElement = document.getElementById('app');

    // Luister naar popstate (browser back/forward)
    window.addEventListener('popstate', () => this.handleRouteChange());

    // Luister naar hash changes voor development
    window.addEventListener('hashchange', () => this.handleRouteChange());

    // Luister naar clicks op interne links
    this.setupLinkHandling();

    // Initial route check
    this.handleRouteChange();
  }
  setupLinkHandling() {
    // Intercept clicks op interne links
    document.addEventListener('click', (e) => {
      const link = e.target.closest(
        'a[href^="/"], a[href^="#/"], a[data-route]'
      );
      if (link) {
        e.preventDefault();
        let path = link.getAttribute('href') || link.getAttribute('data-route');

        // Als het een hash link is, haal de hash weg
        if (path.startsWith('#')) {
          path = path.slice(1);
        }

        console.log('Router: Link clicked, navigating to:', path);
        this.navigate(path);
      }
    });
  }
  navigate(path) {
    console.log('Router: Navigating to:', path);

    // Voor development: gebruik hash-based routing
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      // Update hash en trigger hashchange event
      window.location.hash = path;
      // Handmatig triggeren voor als hashchange niet automatisch werkt
      setTimeout(() => this.handleRouteChange(), 10);
    } else {
      // Voor productie: gebruik normale URL routing
      window.history.pushState(null, '', path);
      this.handleRouteChange();
    }
  }
  handleRouteChange() {
    let path = window.location.pathname;

    // Voor development: gebruik hash-based routing als we op localhost zijn
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      if (window.location.hash) {
        path = window.location.hash.slice(1);
      } else {
        // Als er geen hash is op localhost, ga naar home
        path = '/';
      }
    }

    // Zorg ervoor dat path begint met /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Clean up any double slashes
    path = path.replace(/\/+/g, '/');

    // Check admin access
    if (path === '/admin-dashboard' || path === '/admin/admin-dashboard') {
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
      '/admin/admin-dashboard': 'Admin Dashboard - Career Launch 2025',
      '/contact': 'Contacteer ons - Career Launch 2025',
      '/privacy': 'Privacy Beleid - Career Launch 2025',
      '/404': 'Pagina niet gevonden - Career Launch 2025',
    };

    document.title = titles[path] || 'Career Launch 2025';
  }
  // Helper method voor gebruik in pagina's
  static navigate(path) {
    console.log('Static Router.navigate called with:', path);

    // Voor development: gebruik hash-based routing
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      window.location.hash = path;
    } else {
      window.history.pushState(null, '', path);
      // Trigger een custom event zodat de router weet dat er genavigeerd is
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
}

export default Router;
