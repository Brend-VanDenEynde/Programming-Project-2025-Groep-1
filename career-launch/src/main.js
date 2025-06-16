import Router from './router.js';
import './css/consolidated-style.css';

import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/student/search-criteria-student.js';
import { renderAdmin } from './pages/admin/admin-login.js';
import { renderAdminSelectDashboard } from './pages/admin/admin-select-dashboard.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';
import { renderQRPopup } from './pages/student/student-qr-popup.js';
import { renderSpeeddates } from './pages/student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/student/student-speeddates-verzoeken.js';
import { showSettingsPopup } from './pages/student/student-settings.js';
import { renderAdminIngeschrevenStudenten } from './pages/admin/admin-ingeschreven-studenten.js';
import { renderAdminIngeschrevenBedrijven } from './pages/admin/admin-ingeschreven-bedrijven.js';
import { renderAdminBedrijvenInBehandeling } from './pages/admin/admin-bedrijven-in-behandeling.js';
import { renderAdminStudentDetail } from './pages/admin/admin-student-detail.js';
import { renderAdminCompanyDetail } from './pages/admin/admin-company-detail.js';
import { renderAdminProcessingCompanyDetail } from './pages/admin/admin-processing-company-detail.js';
import { renderBedrijfProfiel } from './pages/bedrijf/bedrijf-profiel.js';
import { renderBedrijfRegister } from './pages/register-bedrijf/bedrijf-register.js';
import { renderBedrijven } from './pages/student/bedrijven.js';

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
  '/student/student-profiel': renderStudentProfiel,
  '/student/zoek-criteria': renderSearchCriteriaStudent,
  '/admin-login': renderAdmin,
  '/admin-select-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard': renderAdminSelectDashboard,
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
  '/student/student-qr-popup': renderQRPopup,
  '/student/student-speeddates': renderSpeeddates,
  '/student/student-speeddates-verzoeken': renderSpeeddatesRequests,
  '/student/student-settings': showSettingsPopup,
  '/student/bedrijven': renderBedrijven,
  '/bedrijf/bedrijf-profiel': renderBedrijfProfiel,
  '/registreer-bedrijf': renderBedrijfRegister,
  '/bedrijf/bedrijf-speeddates': renderSpeeddates,
  '/bedrijf/bedrijf-speeddates-verzoeken': renderSpeeddatesRequests,
  '/bedrijf/bedrijf-settings': showSettingsPopup,
  '/bedrijf/bedrijf-qr-popup': renderQRPopup,
};

const router = new Router(routes);
window.appRouter = router;

// Footer event listeners éénmalig toevoegen na elke route change
function setupFooterLinks() {
  const privacyLink = document.getElementById('privacy-policy');
  if (privacyLink) {
    privacyLink.onclick = (e) => {
      e.preventDefault();
      window.appRouter.navigate('/privacy', { replace: true });
    };
  }
  const contactLink = document.getElementById('contacteer-ons');
  if (contactLink) {
    contactLink.onclick = (e) => {
      e.preventDefault();
      window.appRouter.navigate('/contact', { replace: true });
    };
  }
}

// Hook in op elke route change
window.addEventListener('popstate', setupFooterLinks);
document.addEventListener('DOMContentLoaded', setupFooterLinks);

if (
  window.location.protocol === 'http:' &&
  !window.location.hostname.includes('localhost')
) {
  window.location.href = window.location.href.replace('http:', 'https:');
}
