import Router from './router.js';
import './css/consolidated-style.css';

import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderLogin } from './pages/login.js';
import { renderStudentProfiel } from './pages/student/student-profiel.js';
import { renderSearchCriteriaStudent } from './pages/student/search-criteria-student.js';
import { renderAdmin } from './pages/admin/admin-login.js';
import { renderAdminSelectDashboard } from './pages/Admin/admin-select-dashboard.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderContact } from './pages/contact.js';
import { renderQRPopup } from './pages/student/student-qr-popup.js';
import { renderSpeeddates } from './pages/student/student-speeddates.js';
import { renderSpeeddatesRequests } from './pages/student/student-speeddates-verzoeken.js';
import { showSettingsPopup } from './pages/student/student-settings.js';
import { renderAdminIngeschrevenStudenten } from './pages/Admin/admin-ingeschreven-studenten.js';
import { renderAdminIngeschrevenBedrijven } from './pages/Admin/admin-ingeschreven-bedrijven.js';
import { renderAdminBedrijvenInBehandeling } from './pages/Admin/admin-bedrijven-in-behandeling.js';
import { renderAdminContacten } from './pages/Admin/admin-contacten.js';
import { renderAdminContactDetail } from './pages/Admin/admin-contact-detail.js';
import { renderAdminStudentDetail } from './pages/Admin/admin-student-detail.js';
import { renderAdminCompanyDetail } from './pages/Admin/admin-company-detail.js';
import { renderAdminProcessingCompanyDetail } from './pages/Admin/admin-processing-company-detail.js';
import { renderBedrijfProfiel } from './pages/bedrijf/bedrijf-profiel.js';
import { renderBedrijfRegister } from './pages/register-bedrijf/bedrijf-register.js';
import { renderBedrijven } from './pages/student/bedrijven.js';
import { renderBedrijfSpeeddates } from './pages/bedrijf/bedrijf-speeddates.js';
import { renderBedrijfSpeeddatesRequests } from './pages/bedrijf/bedrijf-speeddates-verzoeken.js';
import { renderSearchCriteriaBedrijf } from './pages/bedrijf/search-criteria-bedrijf.js';
import { renderStudenten } from './pages/bedrijf/studenten.js';

function renderNotFound(rootElement) {
  rootElement.innerHTML = `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <p>Pagina niet gevonden</p>
        <a href="/" data-route="/">← Terug naar home</a>
      </div>
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
  '/admin': renderAdmin,
  '/admin-login': renderAdmin,
  '/admin-select-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard': renderAdminSelectDashboard,
  '/admin-dashboard/ingeschreven-studenten': renderAdminIngeschrevenStudenten,
  '/admin-dashboard/ingeschreven-bedrijven': renderAdminIngeschrevenBedrijven,
  '/admin-dashboard/bedrijven-in-behandeling': renderAdminBedrijvenInBehandeling,
  '/admin-dashboard/contacten': renderAdminContacten,
  '/admin-dashboard/contact-detail': renderAdminContactDetail,
  '/admin-dashboard/student-detail': renderAdminStudentDetail,
  '/admin-dashboard/company-detail': renderAdminCompanyDetail,
  '/admin-dashboard/processing-company-detail': renderAdminProcessingCompanyDetail,
  '/privacy': renderPrivacy,
  '/contact': renderContact,
  '/student/student-qr-popup': renderQRPopup,
  '/student/student-speeddates': renderSpeeddates,
  '/student/student-speeddates-verzoeken': renderSpeeddatesRequests,
  '/student/student-settings': showSettingsPopup,
  '/student/bedrijven': renderBedrijven,
  '/bedrijf/bedrijf-profiel': renderBedrijfProfiel,
  '/registreer-bedrijf': renderBedrijfRegister,
  '/bedrijf/speeddates': renderBedrijfSpeeddates,
  '/bedrijf/speeddates-verzoeken': renderBedrijfSpeeddatesRequests,
  '/bedrijf/zoek-criteria': renderSearchCriteriaBedrijf,
  '/bedrijf/studenten': renderStudenten,
  '/bedrijf/bedrijf-settings': showSettingsPopup,
};

const router = new Router(routes);
window.appRouter = router;

// Footer event listeners éénmalig toevoegen na elke route change
function setupFooterLinks() {
  const privacyLink = document.getElementById('privacy-policy');
  if (privacyLink) {
    privacyLink.onclick = (e) => {
      e.preventDefault();
      window.appRouter.navigate('/privacy');
    };
  }
  const contactLink = document.getElementById('contacteer-ons');
  if (contactLink) {
    contactLink.onclick = (e) => {
      e.preventDefault();
      window.appRouter.navigate('/contact');
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
