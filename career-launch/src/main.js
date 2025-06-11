import Router from './router.js';
import './css/style.css';
import './css/admin-style.css';

import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/Student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/Student/search-criteria-student.js';
import { renderAdmin } from './pages/Admin/admin.js';
import { renderAdminDashboard } from './pages/Admin/admin-dashboard.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';
import { renderQRPopup } from './pages/Student/student-qr-popup.js';
import { renderSpeeddates } from './pages/Student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/Student/student-speeddates-verzoeken.js';
import { showSettingsPopup } from './pages/Student/student-settings.js';

function renderNotFound(rootElement) {
  rootElement.innerHTML = `
    <div class="not-found-container">
      <h1>404 - Pagina niet gevonden</h1>
      <p>De pagina die je zoekt bestaat niet.</p>
      <a href="/" data-route="/">Terug naar home</a>
    </div>
  `;
}

const routes = {
  '/': renderHome,
  '/404': renderNotFound,
  '/registreer': renderRegister,
  '/login': renderLogin,
  '/Student/Student-Profiel': renderStudentProfiel,
  '/Student/Zoek-Criteria': renderSearchCriteriaStudent,
  '/admin': redirectToAdminLogin,
  '/admin-login': renderAdmin,
  '/admin-select-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard': renderAdminDashboard,
  '/admin-dashboard/ingeschreven-studenten': renderAdminIngeschrevenStudenten,
  '/admin-dashboard/ingeschreven-bedrijven': renderAdminIngeschrevenBedrijven,
  '/admin-dashboard/bedrijven-in-behandeling':
    renderAdminBedrijvenInBehandeling,
  '/admin-dashboard/student-detail': renderAdminStudentDetail,
  '/admin-dashboard/company-detail': renderAdminCompanyDetail,
  '/admin-dashboard/processing-company-detail':
    renderAdminProcessingCompanyDetail,
  '/privacy': renderPrivacy,
  '/contact': renderContact,
  '/Student/Student-QR-Popup': renderQRPopup,
  '/Student/Student-Speeddates': renderSpeeddates,
  '/Student/Student-Speeddates-Verzoeken': renderSpeeddatesRequests,
  '/Student/Student-Settings': showSettingsPopup,
};

const router = new Router(routes);
window.appRouter = router;

if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
  window.location.href = window.location.href.replace('http:', 'https:');
}
