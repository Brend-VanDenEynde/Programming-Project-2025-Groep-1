// main.js file
import Router from './router.js';

// CSS imports
import './css/style.css';
import './css/admin-style.css';

// Auth pages
import { renderLogin } from './pages/auth/login.js';
import { renderRegister } from './pages/auth/register.js';

// Common pages
import { renderHome } from './pages/common/home.js';
import { renderContact } from './pages/common/contact.js';
import { renderPrivacy } from './pages/common/privacy.js';

// Student pages
import { renderStudentProfiel } from './pages/student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/student/search-criteria-student.js';
import { renderStudentRegister } from './pages/student/student-register.js';
import { renderStudentOpleiding } from './pages/student/student-opleiding.js';
import { renderStudentSkills } from './pages/student/student-skills.js';
import { renderQRPopup } from './pages/student/student-qr-popup.js';
import { renderSpeeddates } from './pages/student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/student/student-speeddates-verzoeken.js';

// Company pages
import { renderBedrijfProfiel } from './pages/company/bedrijf-profiel.js';
import { renderSearchCriteriaBedrijf } from './pages/company/search-criteria-bedrijf.js';
import { renderBedrijfRegister } from './pages/company/bedrijf-register.js';

// Admin pages
import { renderAdmin } from './pages/admin/admin-login.js';
import { renderAdminDashboard } from './pages/admin/admin-dashboard.js';
import { renderAdminSelectDashboard } from './pages/admin/admin-select-dashboard.js';
import { renderAdminIngeschrevenStudenten } from './pages/admin/admin-ingeschreven-studenten.js';
import { renderAdminIngeschrevenBedrijven } from './pages/admin/admin-ingeschreven-bedrijven.js';
import { renderAdminBedrijvenInBehandeling } from './pages/admin/admin-bedrijven-in-behandeling.js';
import { renderAdminStudentDetail } from './pages/admin/admin-student-detail.js';
import { renderAdminCompanyDetail } from './pages/admin/admin-company-detail.js';
import { renderAdminProcessingCompanyDetail } from './pages/admin/admin-processing-company-detail.js';

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

// functie om redirect naar admin-login te maken
function redirectToAdminLogin(rootElement) {
  Router.navigate('/admin-login');
}

// Definieer de routes
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
  '/Bedrijf/Bedrijf-Profiel': renderBedrijfProfiel,
  '/Bedrijf/Zoek-Criteria': renderSearchCriteriaBedrijf,
  '/Student-Register': renderStudentRegister,
  '/Student-Opleiding': renderStudentOpleiding,
  '/Student-Skills': renderStudentSkills,
  '/Bedrijf-Register': renderBedrijfRegister,
  '/Student/Student-QR-Popup': renderQRPopup,
  '/Student/Student-Speeddates': renderSpeeddates,
  '/Student/Student-Speeddates-Verzoeken': renderSpeeddatesRequests,
};

// Initialize router
const router = new Router(routes);

// Make router globally available for pages to use
window.appRouter = router;
