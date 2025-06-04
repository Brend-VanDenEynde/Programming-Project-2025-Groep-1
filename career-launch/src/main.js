// main.js file
import Router from './router.js';
import './style.css';

// importeer de pagina's
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/student-profiel.js';

// functie om de 404 pagina te renderen (Nog aanpassen)
function renderNotFound(rootElement) {
  rootElement.innerHTML = `
        <h1>404 - Pagina niet gevonden</h1>
        <p>De pagina die je zoekt bestaat niet.</p>
    `;
}

// Definieer de routes
const routes = {
  '/': renderHome,
  '/404': renderNotFound,
  '/registreer': renderRegister,
  '/login' : renderLogin,
  'Student-Profiel': renderStudentProfiel


};

const router = new Router(routes);

window.addEventListener('popstate', () => router.handleRouteChange());
