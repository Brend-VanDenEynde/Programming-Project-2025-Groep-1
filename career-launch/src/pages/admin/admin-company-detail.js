// Admin company detail pagina
import Router from '../../router.js';
import defaultCompanyLogo from '../../Images/BedrijfDefault.jpg';

export function renderAdminCompanyDetail(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  // Get company ID from URL or use default for demo
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('id') || 'demo';

  // Mock company data - in real app this would come from API
  const companyData = getCompanyData(companyId);

  rootElement.innerHTML = `
    <div class="admin-dashboard-clean" style="background-color: white;">
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
              <li><button class="nav-btn" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean" style="background-color: white;">
          <div class="admin-section-header">
            <button id="back-btn" class="back-btn">← Terug naar bedrijven</button>
            <h1 id="section-title">Bedrijf Details: ${companyData.name}</h1>
          </div>
          
          <div class="admin-content-area" id="content-area" style="background-color: white;">
            <div class="company-detail-container">
              <div class="company-detail-main-layout">
                <!-- Left side - Company Information -->
                <div class="company-detail-left">
                  <!-- Company Logo Section -->
                  <div class="company-detail-logo-section">
                    <img 
                      src="${companyData.logoUrl || defaultCompanyLogo}" 
                      alt="Logo ${companyData.name}" 
                      class="company-detail-logo"
                    />
                  </div>
                  
                  <!-- Company Information -->
                  <div class="company-detail-info">
                    <div class="company-detail-field">
                      <label>Naam:</label>
                      <span>${companyData.name}</span>
                    </div>
                    
                    <div class="company-detail-field">
                      <label>Contact-Email:</label>
                      <span>${companyData.email}</span>
                    </div>
                    
                    <div class="company-detail-field">
                      <label>Locatie:</label>
                      <span>${companyData.location}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Right side - Action Buttons -->
                <div class="company-detail-right">
                  <div class="company-detail-actions">
                    <button id="view-speeddates-btn" class="company-action-btn speeddates">
                      Speeddates
                    </button>
                    <button id="contact-company-btn" class="company-action-btn contact">
                      Contacteren
                    </button>
                    <button id="delete-company-btn" class="company-action-btn delete">
                      Verwijderen
                    </button>
                  </div>
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

  // Event handlers
  setupEventHandlers();

  document.title = `Bedrijf Details: ${companyData.name} - Admin Dashboard`;
}

function getCompanyData(companyId) {
  // Mock data - in real app this would fetch from API
  const companyDatabase = {
    carrefour: {
      name: 'Carrefour',
      email: 'contact@carrefour.be',
      location: 'Brussel',
      logoUrl: null,
      registrationDate: '2024-08-20',
      status: 'Actief',
      lastLogin: '2024-12-08',
    },
    delhaize: {
      name: 'Delhaize',
      email: 'hr@delhaize.be',
      location: 'Antwerpen',
      logoUrl: null,
      registrationDate: '2024-09-05',
      status: 'Actief',
      lastLogin: '2024-12-07',
    },
    colruyt: {
      name: 'Colruyt',
      email: 'jobs@colruyt.com',
      location: 'Gent',
      logoUrl: null,
      registrationDate: '2024-09-12',
      status: 'Actief',
      lastLogin: '2024-12-06',
    },
    proximus: {
      name: 'Proximus',
      email: 'careers@proximus.be',
      location: 'Brussel',
      logoUrl: null,
      registrationDate: '2024-10-01',
      status: 'Actief',
      lastLogin: '2024-12-09',
    },
    kbc: {
      name: 'KBC Bank',
      email: 'talent@kbc.be',
      location: 'Leuven',
      logoUrl: null,
      registrationDate: '2024-10-15',
      status: 'Actief',
      lastLogin: '2024-12-08',
    },
    demo: {
      name: 'Demo Bedrijf',
      email: 'demo@bedrijf.be',
      location: 'Demo Stad',
      logoUrl: null,
      registrationDate: '2024-01-01',
      status: 'Actief',
      lastLogin: '2024-12-09',
    },
  };

  return companyDatabase[companyId] || companyDatabase['demo'];
}

function setupEventHandlers() {
  // Back button
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', () => {
    Router.navigate('/admin-dashboard/ingeschreven-bedrijven');
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');
    Router.navigate('/admin-login');
  });

  // Navigation buttons
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

  // Admin action buttons
  const contactBtn = document.getElementById('contact-company-btn');
  contactBtn.addEventListener('click', () => {
    alert('Contact functionaliteit zou hier geïmplementeerd worden.');
  });

  const speedDatesBtn = document.getElementById('view-speeddates-btn');
  speedDatesBtn.addEventListener('click', () => {
    alert('Speeddates overzicht zou hier getoond worden.');
  });

  const deleteBtn = document.getElementById('delete-company-btn');
  deleteBtn.addEventListener('click', () => {
    if (confirm('Weet je zeker dat je dit bedrijf wilt verwijderen?')) {
      alert('Bedrijf verwijdering zou hier geïmplementeerd worden.');
    }
  });

  // Footer links
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });
}
