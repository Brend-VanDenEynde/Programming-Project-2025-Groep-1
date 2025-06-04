// main.js
import Router from './router.js';
import './style.css';
import { renderHome } from './pages/home.js';

function renderNotFound(rootElement) {
    rootElement.innerHTML = `
        <h1>404 - Pagina niet gevonden</h1>
        <p>De pagina die je zoekt bestaat niet.</p>
    `;
}

const routes = {
    '/': renderHome,
    '/404': renderNotFound,
};

const router = new Router(routes);

window.addEventListener('popstate', () => router.handleRouteChange());
