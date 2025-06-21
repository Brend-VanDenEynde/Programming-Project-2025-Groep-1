// Admin contacten pagina
import Router from '../../router.js';
import { performLogout } from '../../utils/auth-api.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';

export async function renderAdminContacten(rootElement) {
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
        
        <main class="admin-content-clean">
          <div class="admin-section-header">
            <h1 id="section-title">Contacten</h1>
            <div class="search-bar-container">
              <input 
                type="text" 
                id="contact-search" 
                placeholder="Zoek op email of onderwerp..." 
                class="search-input"
              />
            </div>
          </div>
            <div class="admin-content-area" id="content-area">
            <div class="contact-list">
              <!-- Contact items will be populated by JavaScript -->
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
      await performLogout();
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

  // Fetch contact messages from API
  const accessToken = sessionStorage.getItem('accessToken');
  let allContacts = []; // Store all contacts for filtering
  try {
    const response = await fetch('https://api.ehb-match.me/contact', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allContacts = await response.json();
    renderContactList(allContacts); // Initial render of all contacts
  } catch (error) {
    console.error('Error fetching contacts:', error);
    // Show fallback message if API call fails
    const contactListContainer = document.querySelector('.contact-list');
    contactListContainer.innerHTML = '<div class="no-results">Fout bij het ophalen van contacten. Probeer het later opnieuw.</div>';
  }

  // Function to render contact list
  function renderContactList(contacts) {
    const contactListContainer = document.querySelector('.contact-list');
    contactListContainer.innerHTML = ''; // Clear existing content

    if (!contacts || contacts.length === 0) {
      contactListContainer.innerHTML =
        '<div class="no-results">Geen contactberichten gevonden.</div>';
      return;
    }    contacts.forEach((contact) => {
      const contactItem = document.createElement('div');
      contactItem.className = 'company-item';
      contactItem.dataset.contactId = contact.id;      contactItem.innerHTML = `
        <div style="margin-bottom: 8px;">
          <span class="company-name">Email: ${contact.email}</span>
        </div>
        <div>
          <span class="company-info">Onderwerp: ${contact.onderwerp}</span>
        </div>
      `;      contactItem.addEventListener('click', () => {
        Router.navigate(`/admin-dashboard/contact-detail?id=${contact.id}`);
      });

      contactListContainer.appendChild(contactItem);
    });}

  // Function to show contact detail modal
  function showContactDetail(contact) {
    const modal = document.createElement('div');
    modal.className = 'contact-detail-modal';
    modal.innerHTML = `
      <div class="modal-overlay" id="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Contact Details</h2>
          <button class="close-modal" id="close-modal">&times;</button>
        </div>
        <div class="modal-body">          <div class="contact-detail-field">
            <label>Email:</label>
            <span>${contact.email}</span>
          </div>
          <div class="contact-detail-field">
            <label>Onderwerp:</label>
            <span>${contact.onderwerp}</span>
          </div>
          <div class="contact-detail-field">
            <label>Bericht:</label>
            <div class="contact-message-full">${contact.bericht}</div>
          </div>
          <div class="modal-actions">
            <button class="btn-reply" onclick="replyToContact('${contact.email}', '${contact.onderwerp}')">Beantwoorden</button>
            <button class="btn-mark-read" onclick="markAsRead(${contact.id})">Markeer als gelezen</button>
            <button class="btn-archive" onclick="archiveContact(${contact.id})">Archiveren</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Modal close handlers
    document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('modal-overlay').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Global functions for modal actions
  window.replyToContact = function(email, subject) {
    const mailtoLink = `mailto:${email}?subject=Re: ${subject}`;
    window.open(mailtoLink);
  };
  // Search functionality
  const searchInput = document.getElementById('contact-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (searchTerm === '') {
        renderContactList(allContacts); // Show all contacts if search is empty
      } else {
        const filteredContacts = allContacts.filter((contact) => {
          const email = (contact.email || '').toLowerCase();
          const onderwerp = (contact.onderwerp || '').toLowerCase();
          return email.includes(searchTerm) || onderwerp.includes(searchTerm);
        });
        renderContactList(filteredContacts);
      }
    });
  }

  document.title = 'Contacten - Admin Dashboard';
}