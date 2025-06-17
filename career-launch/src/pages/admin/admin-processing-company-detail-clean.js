// filepath: c:\Users\larsc\Documents\Programming-Project-2025-Groep-1\career-launch\src\pages\admin\admin-processing-company-detail.js
// Admin processing company detail pagina
import Router from '../../router.js';
import { performLogout, logoutUser } from '../../utils/auth-api.js';
import { apiGet, apiPost, apiDelete } from '../../utils/api.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';
import defaultCompanyLogo from '../../images/defaultlogo.webp';

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
          <img src="${ehbLogo}" alt="Logo" width="40" height="40">
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
            <h1 id="section-title">Bedrijf in Behandeling - Loading...</h1>
            <button id="back-btn" class="back-btn">← Terug</button>
          </div>
          <div class="admin-content-area" id="content-area">
            <div class="detail-page">
              <div class="detail-header">
                <div class="detail-logo-section">
                  <img src="${defaultCompanyLogo}" alt="Company Logo" class="detail-logo" width="80" height="80">
                </div>
                <div class="detail-info">
                  <!-- Company details will be loaded here -->
                </div>
                <div class="detail-actions">
                  <button id="contact-btn" class="action-btn contact-btn">Contact</button>
                  <button id="accept-btn" class="action-btn accept-btn">Accepteren</button>
                  <button id="reject-btn" class="action-btn reject-btn">Weigeren</button>
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
  // Fetch company data from API using new API utilities
  try {
    const company = await apiGet(
      `https://api.ehb-match.me/bedrijven/${companyId}`
    );

    // Update the page with company data
    document.querySelector(
      '#section-title'
    ).textContent = `Bedrijf in Behandeling - ${company.naam}`;
    document.querySelector('.detail-logo-section img').src =
      company.profiel_foto || defaultCompanyLogo;
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
        <span>${
          company.linkedin
            ? `<a href="https://www.linkedin.com/in/${company.linkedin}" target="_blank">${company.linkedin}</a>`
            : 'Niet ingesteld'
        }</span>
      </div>
    `;

    // Update contact button
    const contactBtn = document.getElementById('contact-btn');
    contactBtn.addEventListener('click', () => {
      const mailtoLink = `mailto:${company.contact_email}`;
      window.location.href = mailtoLink;
    });

    // Handle action buttons - moved here so company data is available
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');

    acceptBtn.addEventListener('click', async () => {
      if (confirm(`Weet je zeker dat je ${company.naam} wilt accepteren?`)) {
        try {
          // Disable the button to prevent double-clicks
          acceptBtn.disabled = true;
          acceptBtn.textContent = 'Verwerken...'; // Call the API to approve the company using new API utilities
          const result = await apiPost(
            `https://api.ehb-match.me/bedrijven/keur/${companyId}`
          );

          console.log('Company approved successfully:', result);

          alert(
            `${company.naam} is geaccepteerd en toegevoegd aan ingeschreven bedrijven.`
          );
          Router.navigate('/admin-dashboard/ingeschreven-bedrijven');
        } catch (error) {
          console.error('Error approving company:', error);

          let errorMessage =
            'Er is een fout opgetreden bij het accepteren van het bedrijf.';

          if (error.message) {
            errorMessage = error.message;
          }

          alert(errorMessage);

          // Re-enable the button
          acceptBtn.disabled = false;
          acceptBtn.textContent = 'Accepteren';
        }
      }
    });

    rejectBtn.addEventListener('click', async () => {
      if (
        confirm(
          `Weet je zeker dat je ${company.naam} wilt weigeren? Dit zal het bedrijf permanent verwijderen uit het systeem.`
        )
      ) {
        try {
          // Disable the button to prevent double-clicks
          rejectBtn.disabled = true;
          rejectBtn.textContent = 'Verwerken...'; // Call the DELETE user endpoint to reject/delete the company using new API utilities
          await apiDelete(`https://api.ehb-match.me/user/${companyId}`);

          console.log('Company deleted successfully');

          alert(
            `${company.naam} is geweigerd en permanent verwijderd uit het systeem.`
          );
          Router.navigate('/admin-dashboard/bedrijven-in-behandeling');
        } catch (error) {
          console.error('Error rejecting company:', error);

          let errorMessage =
            'Er is een fout opgetreden bij het weigeren van het bedrijf.';

          if (error.message) {
            errorMessage = error.message;
          }

          alert(errorMessage);

          // Re-enable the button
          rejectBtn.disabled = false;
          rejectBtn.textContent = 'Weigeren';
        }
      }
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    document.querySelector('#section-title').textContent =
      'Er is een probleem. Probeer opnieuw.';
    document.querySelector('.detail-info').innerHTML =
      '<p>Er is een probleem met het ophalen van de bedrijfsgegevens. Probeer het later opnieuw.</p>';
  }

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

  // Handle back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      Router.navigate('/admin-dashboard/bedrijven-in-behandeling');
    });
  }

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
}
