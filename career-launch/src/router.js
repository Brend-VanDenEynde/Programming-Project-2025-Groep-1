class Router {
    constructor(routes) {
        this.routes = routes;
        this.rootElement = document.getElementById('app');

        // Luister naar hash veranderingen
        window.addEventListener('hashchange', () => this.handleRouteChange());

        // Luister naar de initial load
        this.handleRouteChange(); // Initial route check
    }    handleRouteChange() {
        const path = window.location.hash.slice(1) || '/';
        
        // Check admin access
        if (path === '/admin-dashboard') {
            const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
            if (!isLoggedIn || isLoggedIn !== 'true') {
                // Redirect to admin login if not logged in
                window.location.hash = '#/admin';
                return;
            }
        }
        
        const route = this.routes[path] || this.routes['/404'];
        this.rootElement.innerHTML = '';
        route(this.rootElement);

        console.log('Path:', path);
        console.log('Route bestaat?', !!this.routes[path]);
    }
}

export default Router;