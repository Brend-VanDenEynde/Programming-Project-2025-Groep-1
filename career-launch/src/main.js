// main.js file
import Router from './router.js';
import './style.css';

// importeer de pagina's
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/search-criteria-student.js';
import { renderAdmin } from './pages/admin.js';
import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';

// functie om de 404 pagina te renderen
function renderNotFound(rootElement) {
  rootElement.innerHTML = `
        <div class="not-found-container">
            <h1>404 - Pagina niet gevonden</h1>
            <p>De pagina die je zoekt bestaat niet.</p>
            <a href="/" data-route="/">Terug naar home</a>
        </div>
    `;
}

// Definieer de routes
const routes = {
  '/': renderHome,
  '/404': renderNotFound,
  '/registreer': renderRegister,
  '/login': renderLogin,
  '/Student/Student-Profiel': renderStudentProfiel,
  '/Student/Zoek-Criteria': renderSearchCriteriaStudent,
  '/admin': renderAdmin,
  '/admin-dashboard': renderAdminDashboard,
  '/admin-dashboard/ingeschreven-studenten': renderAdminDashboard,
  '/admin-dashboard/ingeschreven-bedrijven': renderAdminDashboard,
  '/admin-dashboard/bedrijven-in-behandeling': renderAdminDashboard,
  '/privacy': renderPrivacy,
  '/contact': renderContact,
};

// Initialize router
const router = new Router(routes);

// Make router globally available for pages to use
window.appRouter = router;
