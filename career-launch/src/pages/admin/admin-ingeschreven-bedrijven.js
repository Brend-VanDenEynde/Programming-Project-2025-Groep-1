// Admin ingeschreven bedrijven pagina
import Router from '../../router.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';
import defaultImage from '../../images/default.png';
import { logoutUser } from '../../utils/auth-api.js';

export async function renderAdminIngeschrevenBedrijven(rootElement) {
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
          <img src="${ehbLogo}" alt="Logo" width="40" height="40">
          <span>EhB Career Launch</span>
        </div>        <div class="admin-header-right">
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
              <li><button class="nav-btn active" data-route="/admin-dashboard/ingeschreven-bedrijven">Ingeschreven Bedrijven</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean">
          <div class="admin-section-header">
            <h1 id="section-title">Ingeschreven Bedrijven</h1>
          </div>
            <div class="admin-content-area" id="content-area">
            <div class="companies-list company-list">
              <!-- Dynamically populated company items will be inserted here -->
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
  if (logoutBtn) {
    logoutBtn.onclick = null;
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      window.sessionStorage.clear();
      localStorage.clear();
      Router.navigate('/');
    });
  }

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
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });

  // Fetch approved companies from API
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    const response = await fetch(
      'https://api.ehb-match.me/bedrijven/goedgekeurd',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const companies = await response.json();

    const companyListContainer = document.querySelector('.companies-list');
    companyListContainer.innerHTML = ''; // Clear existing content

    if (companies.length === 0) {
      companyListContainer.innerHTML =
        '<p class="no-companies">Geen bedrijven zijn goedgekeurd om naar de Career Launch te komen.</p>';
    } else {
      companies.forEach((company) => {
        const companyItem = document.createElement('div');
        companyItem.className = 'company-item clickable-company';
        companyItem.dataset.companyId = company.gebruiker_id;

        companyItem.innerHTML = `
          <img src="${company.profiel_foto || defaultImage}" alt="${
          company.naam
        }" class="company-logo" style="height: 40px; width: auto; margin-right: 10px;">
          <span class="company-name">${company.naam}</span>
        `;

        companyListContainer.appendChild(companyItem);
      });
    }
  } catch (error) {
    console.error('Error fetching approved companies:', error);
  }

  // Add click handlers for company items
  const companyItems = document.querySelectorAll('.clickable-company');
  companyItems.forEach((item) => {
    item.addEventListener('click', () => {
      const companyId = item.dataset.companyId;
      Router.navigate(`/admin-dashboard/company-detail?id=${companyId}`);
    });
  });

  document.title = 'Ingeschreven Bedrijven - Admin Dashboard';
}
