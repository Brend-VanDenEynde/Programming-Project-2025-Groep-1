// Admin contacten pagina
import Router from '../../router.js';
import { logoutUser } from '../../utils/auth-api.js';
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
            <h1 id="section-title">Contact Berichten</h1>
            <div class="search-bar-container">
              <input 
                type="text" 
                id="contact-search" 
                placeholder="Zoek op naam of onderwerp..." 
                class="search-input"
              />
            </div>
          </div>
          
          <div class="admin-content-area" id="content-area">
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Contact berichten laden...</p>
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

    <!-- Contact Detail Modal -->
    <div id="contact-detail-modal" class="contact-detail-modal" style="display: none;">
      <div class="contact-detail-modal-content">
        <div class="contact-detail-modal-header">
          <h2>Contact Bericht Details</h2>
          <button id="close-contact-modal" class="close-modal-btn">&times;</button>
        </div>
        <div class="contact-detail-modal-body">
          <div id="contact-detail-content">
            <!-- Contact details will be populated here -->
          </div>
        </div>
        <div class="contact-detail-modal-footer">
          <button id="mark-as-read-btn" class="modal-action-btn primary">Markeer als gelezen</button>
          <button id="reply-contact-btn" class="modal-action-btn secondary">Beantwoorden</button>
          <button id="delete-contact-btn" class="modal-action-btn danger">Verwijderen</button>
        </div>
      </div>
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

  // Search functionality
  const searchInput = document.getElementById('contact-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterContacts(e.target.value);
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

  // Load contact data
  await loadContactData();
}

async function loadContactData() {
  const contentArea = document.getElementById('content-area');
  
  try {
    // Simulate API call - replace with actual API endpoint
    const accessToken = sessionStorage.getItem('accessToken');
    
    // For now, we'll use mock data since we don't have a contacts API endpoint
    // In a real implementation, you would make an API call like:
    // const response = await fetch('https://api.ehb-match.me/contacts', {
    //   method: 'GET',
    //   headers: { Authorization: `Bearer ${accessToken}` }
    // });
    
    // Mock data for demonstration
    const mockContacts = [
      {
        id: 1,
        naam: 'Jan Janssen',
        email: 'jan.janssen@student.ehb.be',
        onderwerp: 'Vraag over inschrijving',
        bericht: 'Hallo, ik heb een vraag over de inschrijvingsprocedure. Kunnen jullie mij helpen?',
        datum: '2025-06-15T10:30:00Z',
        gelezen: false,
        type: 'student'
      },
      {
        id: 2,
        naam: 'TechCorp BV',
        email: 'hr@techcorp.be',
        onderwerp: 'Bedrijfsregistratie probleem',
        bericht: 'We ondervinden problemen bij het registreren van ons bedrijf. De pagina laadt niet correct.',
        datum: '2025-06-14T14:20:00Z',
        gelezen: true,
        type: 'bedrijf'
      },
      {
        id: 3,
        naam: 'Marie Dupont',
        email: 'marie.dupont@gmail.com',
        onderwerp: 'Feedback over platform',
        bericht: 'Het platform werkt goed, maar ik zou graag meer filtermogelijkheden zien voor het zoeken naar stages.',
        datum: '2025-06-13T16:45:00Z',
        gelezen: false,
        type: 'student'
      }
    ];

    displayContacts(mockContacts);
    
  } catch (error) {
    console.error('Error loading contacts:', error);
    contentArea.innerHTML = `
      <div class="error-container">
        <h2>Fout bij het laden van contacten</h2>
        <p>Er is een probleem opgetreden bij het laden van de contact berichten.</p>
        <button onclick="location.reload()" class="retry-btn">Opnieuw proberen</button>
      </div>
    `;
  }
}

function displayContacts(contacts) {
  const contentArea = document.getElementById('content-area');
  
  if (contacts.length === 0) {
    contentArea.innerHTML = `
      <div class="no-data-container">
        <h2>Geen contact berichten</h2>
        <p>Er zijn momenteel geen contact berichten ontvangen.</p>
      </div>
    `;
    return;
  }

  const contactsHTML = contacts.map(contact => `
    <div class="contact-item ${contact.gelezen ? 'read' : 'unread'}" data-contact-id="${contact.id}">
      <div class="contact-status-indicator ${contact.gelezen ? 'read-indicator' : 'unread-indicator'}"></div>
      <div class="contact-info">
        <div class="contact-header">
          <h3 class="contact-name">${contact.naam}</h3>
          <span class="contact-type ${contact.type}">${contact.type === 'student' ? 'Student' : 'Bedrijf'}</span>
          <span class="contact-date">${formatDate(contact.datum)}</span>
        </div>
        <div class="contact-subject">
          <strong>${contact.onderwerp}</strong>
        </div>
        <div class="contact-preview">
          ${contact.bericht.length > 100 ? contact.bericht.substring(0, 100) + '...' : contact.bericht}
        </div>
        <div class="contact-email">
          <small>${contact.email}</small>
        </div>
      </div>
      <div class="contact-actions">
        <button class="view-contact-btn" data-contact-id="${contact.id}">Bekijken</button>
      </div>
    </div>
  `).join('');

  contentArea.innerHTML = `
    <div class="contact-list">
      ${contactsHTML}
    </div>
  `;

  // Add event listeners for contact items
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    item.addEventListener('click', () => {
      const contactId = item.dataset.contactId;
      showContactDetail(contactId, contacts);
    });
  });

  // Add event listeners for view buttons
  const viewButtons = document.querySelectorAll('.view-contact-btn');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const contactId = btn.dataset.contactId;
      showContactDetail(contactId, contacts);
    });
  });

  // Store contacts globally for search functionality
  window.currentContacts = contacts;
}

function showContactDetail(contactId, contacts) {
  const contact = contacts.find(c => c.id == contactId);
  if (!contact) return;

  const modal = document.getElementById('contact-detail-modal');
  const content = document.getElementById('contact-detail-content');

  content.innerHTML = `
    <div class="contact-detail-info">
      <div class="detail-row">
        <strong>Van:</strong> ${contact.naam}
      </div>
      <div class="detail-row">
        <strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a>
      </div>
      <div class="detail-row">
        <strong>Type:</strong> <span class="contact-type ${contact.type}">${contact.type === 'student' ? 'Student' : 'Bedrijf'}</span>
      </div>
      <div class="detail-row">
        <strong>Datum:</strong> ${formatDate(contact.datum)}
      </div>
      <div class="detail-row">
        <strong>Status:</strong> <span class="status ${contact.gelezen ? 'read' : 'unread'}">${contact.gelezen ? 'Gelezen' : 'Ongelezen'}</span>
      </div>
      <div class="detail-row">
        <strong>Onderwerp:</strong> ${contact.onderwerp}
      </div>
      <div class="detail-row full-width">
        <strong>Bericht:</strong>
        <div class="contact-message">${contact.bericht}</div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  // Set up modal event listeners
  setupContactModalEventListeners(contact);
}

function setupContactModalEventListeners(contact) {
  const modal = document.getElementById('contact-detail-modal');
  const closeBtn = document.getElementById('close-contact-modal');
  const markAsReadBtn = document.getElementById('mark-as-read-btn');
  const replyBtn = document.getElementById('reply-contact-btn');
  const deleteBtn = document.getElementById('delete-contact-btn');

  // Close modal
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Mark as read
  markAsReadBtn.onclick = () => {
    console.log('Marking contact as read:', contact.id);
    // Here you would make an API call to mark the contact as read
    alert('Contact gemarkeerd als gelezen');
    modal.style.display = 'none';
    loadContactData(); // Reload to update the UI
  };

  // Reply to contact
  replyBtn.onclick = () => {
    const mailtoLink = `mailto:${contact.email}?subject=Re: ${contact.onderwerp}`;
    window.location.href = mailtoLink;
  };

  // Delete contact
  deleteBtn.onclick = () => {
    if (confirm('Weet je zeker dat je dit contact bericht wilt verwijderen?')) {
      console.log('Deleting contact:', contact.id);
      // Here you would make an API call to delete the contact
      alert('Contact bericht verwijderd');
      modal.style.display = 'none';
      loadContactData(); // Reload to update the UI
    }
  };
}

function filterContacts(searchTerm) {
  if (!window.currentContacts) return;
  
  const filteredContacts = window.currentContacts.filter(contact => 
    contact.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.onderwerp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.bericht.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  displayContacts(filteredContacts);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
