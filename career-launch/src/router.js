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
                const path = link.getAttribute('href') || link.getAttribute('data-route');
                this.navigate(path);
            }
        });
    }

    navigate(path) {
        // Update browser URL zonder pagina reload
        window.history.pushState(null, '', path);
        this.handleRouteChange();
    }

    handleRouteChange() {
        let path = window.location.pathname;
        
        // Als we op localhost zijn, moet je development setup misschien nog hash gebruiken
        // Dit check of we hash-based routing gebruiken als fallback
        if (path === '/' && window.location.hash) {
            path = window.location.hash.slice(1);
        }
        
        // Zorg ervoor dat path begint met /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

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
            '/404': 'Pagina niet gevonden - Career Launch 2025'
        };
        
        document.title = titles[path] || 'Career Launch 2025';
    }

    // Helper method voor gebruik in pagina's
    static navigate(path) {
        window.history.pushState(null, '', path);
        // Trigger een custom event zodat de router weet dat er genavigeerd is
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}

export default Router;