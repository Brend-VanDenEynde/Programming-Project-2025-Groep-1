// Admin bedrijven in behandeling pagina
import Router from '../../router.js';

export function renderAdminBedrijvenInBehandeling(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  rootElement.innerHTML = `
    <div class="admin-dashboard-clean">
      <header class="admin-header-clean">
        <div class="admin-logo-section">
          <img src="src/Images/EhB-logo-transparant.png" alt="Logo" width="40" height="40">
          <span>EhB Career Launch</span>
        </div>
        <div class="admin-header-right">
          <span class="admin-username">Welkom, ${adminUsername}</span>
          <button id="logout-btn" class="logout-btn-clean">Uitloggen</button>
          <button id="menu-toggle" class="menu-toggle-btn">☰</button>
        </div>
      </header>
      
      <div class="admin-main-layout">
        <aside class="admin-sidebar-clean">
          <nav class="admin-nav">
            <ul>
              <li><button class="nav-btn" data-route="/admin-dashboard/ingeschreven-studenten">Ingeschreven studenten</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/ingeschreven-bedrijven">Ingeschreven Bedrijven</button></li>
              <li><button class="nav-btn active" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean">
          <div class="admin-section-header">
            <h1 id="section-title">Bedrijven in Behandeling</h1>
          </div>            <div class="admin-content-area" id="content-area">            <div class="processing-list">
              <div class="processing-item clickable-processing" data-company-id="carrefour">
                <span class="processing-company-name">Carrefour</span>
                <div class="processing-actions">
                  <button class="approve-btn" data-company="Carrefour" title="Goedkeuren">✓</button>
                  <button class="reject-btn" data-company="Carrefour" title="Afwijzen">✕</button>
                </div>
              </div>
              <div class="processing-item clickable-processing" data-company-id="mediamarkt">
                <span class="processing-company-name">MediaMarkt</span>
                <div class="processing-actions">
                  <button class="approve-btn" data-company="MediaMarkt" title="Goedkeuren">✓</button>
                  <button class="reject-btn" data-company="MediaMarkt" title="Afwijzen">✕</button>
                </div>
              </div>
              <div class="processing-item clickable-processing" data-company-id="bol.com">
                <span class="processing-company-name">Bol.com</span>
                <div class="processing-actions">
                  <button class="approve-btn" data-company="Bol.com" title="Goedkeuren">✓</button>
                  <button class="reject-btn" data-company="Bol.com" title="Afwijzen">✕</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
        
      <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    // Clear session    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');
    // Redirect to admin login
    Router.navigate('/admin-login');
  });

  // Handle navigation between sections
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      Router.navigate(route);
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar-clean');
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  }); // Handle approve/reject buttons
  const approveButtons = document.querySelectorAll('.approve-btn');
  const rejectButtons = document.querySelectorAll('.reject-btn');

  // Handle clicking on entire processing items to go to detail page
  const clickableProcessingItems = document.querySelectorAll(
    '.clickable-processing'
  );
  clickableProcessingItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      // Don't navigate if clicking on action buttons
      if (
        e.target.classList.contains('approve-btn') ||
        e.target.classList.contains('reject-btn')
      ) {
        return;
      }

      const companyId = item.dataset.companyId;
      Router.navigate(
        `/admin-dashboard/processing-company-detail?id=${companyId}`
      );
    });
  });

  approveButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const companyName = btn.dataset.company;
      if (confirm(`Weet je zeker dat je ${companyName} wilt goedkeuren?`)) {
        // Remove the item from the list
        btn.closest('.processing-item').remove();
        alert(
          `${companyName} is goedgekeurd en toegevoegd aan ingeschreven bedrijven.`
        );

        // Check if list is empty
        const processingList = document.querySelector('.processing-list');
        if (processingList.children.length === 0) {
          processingList.innerHTML =
            '<div class="empty-state"><p>Geen bedrijven in behandeling</p></div>';
        }
      }
    });
  });

  rejectButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const companyName = btn.dataset.company;
      if (confirm(`Weet je zeker dat je ${companyName} wilt afwijzen?`)) {
        // Remove the item from the list
        btn.closest('.processing-item').remove();
        alert(`${companyName} is afgewezen.`);

        // Check if list is empty
        const processingList = document.querySelector('.processing-list');
        if (processingList.children.length === 0) {
          processingList.innerHTML =
            '<div class="empty-state"><p>Geen bedrijven in behandeling</p></div>';
        }
      }
    });
  });
  document.title = 'Bedrijven in Behandeling - Admin Dashboard';
}
