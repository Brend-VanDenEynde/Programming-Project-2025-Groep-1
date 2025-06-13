// Admin processing company detail pagina
import Router from '../../router.js';
import { performLogout } from '../../utils/auth-api.js';

// Make the render function async to support await
export async function renderAdminProcessingCompanyDetail(rootElement) {
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
            <h1 id="section-title">Bedrijf in Behandeling</h1>
          </div><div class="admin-content-area" id="content-area">
            <div class="detail-container">
              <div class="detail-main-layout">
                <!-- Left side - Company Information -->
                <div class="detail-left">
                  <div class="detail-logo-section">
                    <img 
                      src="src/Images/BedrijfDefault.jpg" 
                      alt="Logo" 
                      class="detail-logo"
                    />
                  </div>
                  
                  <!-- Company Information -->
                  <div class="detail-info">
                    <div class="detail-field">
                      <label>Naam:</label>
                      <span></span>
                    </div>
                    
                    <div class="detail-field">
                      <label>Locatie:</label>
                      <span></span>
                    </div>
                    
                    <div class="detail-field">
                      <label>LinkedIn:</label>
                      <span>
                        <a href="#" target="_blank" class="linkedin-link"></a>
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
  // Fetch company data from API
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    const response = await fetch(`https://api.ehb-match.me/bedrijven/${companyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }

    const company = await response.json();

    // Update the page with company data
    document.querySelector('#section-title').textContent = `Bedrijf in Behandeling - ${company.naam}`;
    document.querySelector('.detail-logo-section img').src = company.profiel_foto || 'src/Images/BedrijfDefault.jpg';
    document.querySelector('.detail-logo').alt = `Logo ${company.naam}`;
    document.querySelector('.detail-info').innerHTML = `
      <div class="detail-field">
        <label>Naam:</label>
        <span>${company.naam}</span>
      </div>
      <div class="detail-field">
        <label>Locatie:</label>
        <span>${company.plaats || 'Niet beschikbaar'}</span>
      </div>
      <div class="detail-field">
        <label>LinkedIn:</label>
        <span>${company.linkedin ? `<a href="https://www.linkedin.com/in/${company.linkedin}" target="_blank">${company.linkedin}</a>` : 'Niet ingesteld'}</span>
      </div>
    `;

    // Update contact button
    const contactBtn = document.getElementById('contact-btn');
    contactBtn.addEventListener('click', () => {
      const mailtoLink = `mailto:${company.contact_email}`;
      window.location.href = mailtoLink;
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    document.querySelector('#section-title').textContent = 'Er is een probleem. Probeer opnieuw.';
    document.querySelector('.detail-info').innerHTML = '<p>Er is een probleem met het ophalen van de bedrijfsgegevens. Probeer het later opnieuw.</p>';
  }

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
  const acceptBtn = document.getElementById('accept-btn');
  const rejectBtn = document.getElementById('reject-btn');
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
