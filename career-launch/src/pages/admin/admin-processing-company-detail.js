// Admin processing company detail pagina
import Router from '../../router.js';
import { performLogout } from '../../utils/auth-api.js';

export function renderAdminProcessingCompanyDetail(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  // Get company ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('id');
  // Mock company data - in real app this would come from database
  const companyData = {
    carrefour: {
      name: 'Carrefour',
      email: 'hr@carrefour.be',
      location: 'Brussel, België',
      linkedin: 'https://www.linkedin.com/company/carrefour',
    },
    mediamarkt: {
      name: 'MediaMarkt',
      email: 'recruitment@mediamarkt.be',
      location: 'Vilvoorde, België',
      linkedin: 'https://www.linkedin.com/company/mediamarkt',
    },
    'bol.com': {
      name: 'Bol.com',
      email: 'jobs@bol.com',
      location: 'Utrecht, Nederland',
      linkedin: 'https://www.linkedin.com/company/bol-com',
    },
  };

  const company = companyData[companyId] || {
    name: 'Onbekend Bedrijf',
    email: 'onbekend@email.com',
    location: 'Onbekende locatie',
    linkedin: '#',
  };

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
            <button id="back-btn" class="back-btn">← Terug naar overzicht</button>
            <h1 id="section-title">Bedrijf in Behandeling - ${company.name}</h1>
          </div><div class="admin-content-area" id="content-area">
            <div class="detail-container">
              <div class="detail-main-layout">
                <!-- Left side - Company Information -->
                <div class="detail-left">
                  <div class="detail-logo-section">
                    <img 
                      src="src/Images/BedrijfDefault.jpg" 
                      alt="Logo ${company.name}" 
                      class="detail-logo"
                    />
                  </div>
                  
                  <!-- Company Information -->
                  <div class="detail-info">
                    <div class="detail-field">
                      <label>Naam:</label>
                      <span>${company.name}</span>
                    </div>
                    
                    <div class="detail-field">
                      <label>Locatie:</label>
                      <span>${company.location}</span>
                    </div>
                    
                    <div class="detail-field">
                      <label>LinkedIn:</label>
                      <span>
                        <a href="${company.linkedin}" target="_blank" class="linkedin-link">${company.linkedin}</a>
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Right side - Action Buttons -->
                <div class="detail-right">
                  <div class="detail-actions">
                    <button id="contact-btn" class="detail-action-btn contact">Contacteren</button>
                    <button id="accept-btn" class="detail-action-btn accept">Accepteren</button>
                    <button id="reject-btn" class="detail-action-btn reject">Weigeren</button>
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
  logoutBtn.addEventListener('click', async () => {
    try {
      const result = await performLogout();
      console.log('Admin logout result:', result);
      Router.navigate('/admin-login');
    } catch (error) {
      console.error('Admin logout error:', error);
      // Still navigate to login even if logout API fails
      Router.navigate('/admin-login');
    }
  });

  // Handle navigation between sections
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      Router.navigate(route);
    });
  });

  // Handle back button
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', () => {
    Router.navigate('/admin-dashboard/bedrijven-in-behandeling');
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
  });

  // Handle action buttons
  const contactBtn = document.getElementById('contact-btn');
  const acceptBtn = document.getElementById('accept-btn');
  const rejectBtn = document.getElementById('reject-btn');
  contactBtn.addEventListener('click', () => {
    // Create mailto link and open it
    const mailtoLink = `mailto:${company.email}`;
    window.location.href = mailtoLink;
  });

  acceptBtn.addEventListener('click', () => {
    if (confirm(`Weet je zeker dat je ${company.name} wilt accepteren?`)) {
      alert(
        `${company.name} is geaccepteerd en toegevoegd aan ingeschreven bedrijven.`
      );
      Router.navigate('/admin-dashboard/bedrijven-in-behandeling');
    }
  });

  rejectBtn.addEventListener('click', () => {
    if (confirm(`Weet je zeker dat je ${company.name} wilt weigeren?`)) {
      alert(`${company.name} is geweigerd.`);
      Router.navigate('/admin-dashboard/bedrijven-in-behandeling');
    }
  });

  document.title = `${company.name} - Bedrijf in Behandeling - Admin Dashboard`;
}
