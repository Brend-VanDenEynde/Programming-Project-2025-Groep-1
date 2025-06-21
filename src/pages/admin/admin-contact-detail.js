// Admin contact detail pagina
import Router from '../../router.js';
import { performLogout } from '../../utils/auth-api.js';
import ehbLogo from '/images/EhB-logo-transparant.png';

export async function renderAdminContactDetail(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    Router.navigate('/admin-login');
    return;
  }

  // Get contact ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const contactId = urlParams.get('id');

  if (!contactId) {
    Router.navigate('/admin-dashboard/contacten');
    return;
  }

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
              <li><button class="nav-btn" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
              <li><button class="nav-btn active" data-route="/admin-dashboard/contacten">Contacten</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean">          <div class="admin-section-header">
            <button id="back-btn" class="back-btn">← Terug naar Contacten</button>
            <h1 id="section-title">Contact Details</h1>
          </div>
          
          <div class="admin-content-area" id="content-area">
            <div class="loading-message">Contact gegevens laden...</div>
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
    logoutBtn.addEventListener('click', async () => {
      await performLogout();
      window.sessionStorage.clear();
      localStorage.clear();
      Router.navigate('/');
    });
  }

  // Handle navigation
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      Router.navigate(route);
    });
  });
  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      Router.navigate('/admin-dashboard/contacten');
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar-clean');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Footer links
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });

  // Fetch contact details
  await loadContactDetails(contactId);

  document.title = 'Contact Details - Admin Dashboard';
}

async function loadContactDetails(contactId) {
  const accessToken = sessionStorage.getItem('accessToken');
  const contentArea = document.getElementById('content-area');

  try {
    const response = await fetch(`https://api.ehb-match.me/contact/${contactId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contact = await response.json();
    renderContactDetails(contact);
  } catch (error) {
    console.error('Error fetching contact details:', error);
    contentArea.innerHTML = `
      <div class="error-message">
        <h3>Fout bij het laden van contact gegevens</h3>
        <p>Er is een fout opgetreden bij het ophalen van de contact gegevens.</p>
        <button onclick="window.location.reload()">Probeer opnieuw</button>
      </div>
    `;
  }
}

function renderContactDetails(contact) {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="detail-container">
      <div class="detail-main-layout">
        <!-- Left side - Contact Information -->
        <div class="detail-left">
          <div class="detail-info">
            <div class="detail-field">
              <label>Email:</label>
              <span>${contact.email}</span>
            </div>
            
            <div class="detail-field">
              <label>Onderwerp:</label>
              <span>${contact.onderwerp}</span>
            </div>
            
            <div class="detail-field">
              <label>Bericht:</label>
              <div class="message-content">${contact.bericht}</div>
            </div>
          </div>
        </div>
        
        <!-- Right side - Action Buttons -->
        <div class="detail-right">          <div class="detail-actions">
            <button id="mailto-btn" class="detail-action-btn contact">
              Contacteren
            </button>
            <button id="delete-btn" class="detail-action-btn reject">
              Contact Verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup action buttons
  setupActionButtons(contact);
}

function setupActionButtons(contact) {
  // Mailto button
  const mailtoBtn = document.getElementById('mailto-btn');
  mailtoBtn.addEventListener('click', () => {
    const subject = `Re: ${contact.onderwerp}`;
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoLink);
  });  // Delete button
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Weet je zeker dat je dit contact wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {        // Disable the button to prevent double-clicks
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '⏳ Verwerken...';
        
        await deleteContact(contact.id);
      } catch (error) {
        // Re-enable the button if there's an error
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '🗑️ Contact Verwijderen';
      }
    }
  });
}

async function deleteContact(contactId) {
  const accessToken = sessionStorage.getItem('accessToken');

  try {
    const response = await fetch(`https://api.ehb-match.me/contact/${contactId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert('Contact succesvol verwijderd!');
    Router.navigate('/admin-dashboard/contacten');
  } catch (error) {
    console.error('Error deleting contact:', error);
    alert('Er is een fout opgetreden bij het verwijderen van het contact. Probeer het opnieuw.');
  }
}