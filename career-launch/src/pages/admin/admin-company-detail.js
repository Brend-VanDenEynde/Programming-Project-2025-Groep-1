// Admin company detail pagina
import Router from '../../router.js';
import defaultCompanyLogo from '../../images/BedrijfDefault.jpg';
import { logoutUser } from '../../utils/auth-api.js';
import { deleteUser } from '../../utils/data-api.js';

export async function renderAdminCompanyDetail(rootElement) {
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
            <div class="detail-container">
              <div class="detail-main-layout">
                <!-- Left side - Company Information -->
                <div class="detail-left">
                  <!-- Company Logo Section -->
                  <div class="detail-logo-section">
                    <img 
                      src="${companyData.logoUrl || defaultCompanyLogo}" 
                      alt="Logo ${companyData.name}" 
                      class="detail-logo"
                    />
                  </div>
                  
                  <!-- Company Information -->
                  <div class="detail-info">
                    <div class="detail-field">
                      <label>Naam:</label>
                      <span>${companyData.name}</span>
                    </div>
                    
                    <div class="detail-field">
                      <label>Contact-Email:</label>
                      <span>${companyData.email}</span>
                    </div>
                    
                    <div class="detail-field">
                      <label>Locatie:</label>
                      <span>${companyData.location}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Right side - Action Buttons -->
                <div class="detail-right">
                  <div class="detail-actions">
                    <button id="view-speeddates-btn" class="detail-action-btn speeddates">
                      Speeddates
                    </button>
                    <button id="contact-company-btn" class="detail-action-btn contact">
                      Contacteren
                    </button>
                    <button id="delete-company-btn" class="detail-action-btn delete">
                      Verwijderen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>        </main>
      </div>
      
      <!-- Speeddates Modal -->
      <div id="speeddates-modal" class="speeddates-modal" style="display: none;">
        <div class="speeddates-modal-content">
          <div class="speeddates-modal-header">
            <h2>Speeddates</h2>
            <button id="close-modal" class="close-modal-btn">&times;</button>
          </div>
          <div class="speeddates-modal-body">
            <div id="speeddates-list" class="speeddates-list">
              <!-- Speeddates will be populated here -->
            </div>
          </div>
        </div>
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
    const response = await fetch(
      `https://api.ehb-match.me/bedrijven/${companyId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }

    const companyData = await response.json();

    // Update the page with company data
    document.querySelector(
      '#section-title'
    ).textContent = `Bedrijf Details: ${companyData.naam}`;
    document.querySelector('.detail-logo-section img').src =
      companyData.profiel_foto || defaultCompanyLogo;
    document.querySelector('.detail-info').innerHTML = `
      <div class="detail-field">
        <label>Naam:</label>
        <span>${companyData.naam}</span>
      </div>
      <div class="detail-field">
        <label>Locatie:</label>
        <span>${companyData.plaats || 'Niet beschikbaar'}</span>
      </div>
      <div class="detail-field">
        <label>Contact-Email:</label>
        <span>${companyData.contact_email || 'Niet beschikbaar'}</span>
      </div>
      <div class="detail-field">
        <label>LinkedIn:</label>
        <span>${
          companyData.linkedin
            ? `<a href="https://www.linkedin.com/in/${companyData.linkedin}" target="_blank">${companyData.linkedin}</a>`
            : 'Niet ingesteld'
        }</span>
      </div>
      <div class="detail-field">
        <label>Sector ID:</label>
        <span>${companyData.sector_id || 'Niet beschikbaar'}</span>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching company details:', error);
    document.querySelector('#section-title').textContent =
      'Er is een probleem. Probeer opnieuw.';
    document.querySelector('.detail-logo-section img').src = defaultCompanyLogo;
    document.querySelector('.detail-info').innerHTML =
      '<p>Er is een probleem met het ophalen van de bedrijfsgegevens. Probeer het later opnieuw.</p>';
  }

  // Event handlers
  setupEventHandlers();

  document.title = `Bedrijf Details: ${companyData.name} - Admin Dashboard`;
}

function getCompanyData(companyId) {
  // This function is no longer needed as company data comes from API
  // Return minimal fallback data only
  return {
    userId: 999,
    name: 'Onbekend Bedrijf',
    email: 'onbekend@bedrijf.be',
    location: 'Onbekend',
    logoUrl: null,
    registrationDate: '2024-01-01',
    status: 'Actief',
    lastLogin: '2024-12-09',
  };
}

function setupEventHandlers() {
  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      Router.navigate('/admin-dashboard/ingeschreven-bedrijven');
    });
  }

  // Logout button
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
  // Zorg ervoor dat de contacteer-knop correct werkt
  const contactBtn = document.getElementById('contact-company-btn');
  contactBtn.addEventListener('click', async () => {
    try {
      // Haal het huidige bedrijf ID op uit de URL
      const urlParams = new URLSearchParams(window.location.search);
      const companyId = urlParams.get('id');

      // Haal de toegangstoken op
      const accessToken = sessionStorage.getItem('accessToken');

      // Maak een API-aanroep om bedrijfsgegevens op te halen
      const response = await fetch(
        `https://api.ehb-match.me/bedrijven/${companyId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const companyData = await response.json();

      // Gebruik het contact_email van de opgehaalde gegevens
      const mailtoLink = `mailto:${companyData.contact_email || ''}`;
      if (companyData.contact_email) {
        window.location.href = mailtoLink;
      } else {
        alert('Het e-mailadres is niet beschikbaar.');
      }
    } catch (error) {
      console.error('Error fetching company details for contact:', error);
      alert(
        'Er is een probleem opgetreden bij het ophalen van de contactgegevens. Probeer het later opnieuw.'
      );
    }
  });

  const speedDatesBtn = document.getElementById('view-speeddates-btn');
  if (speedDatesBtn) {
    speedDatesBtn.removeEventListener('click', openSpeedDatesModal);
    speedDatesBtn.addEventListener('click', openSpeedDatesModal);
  }
  const deleteBtn = document.getElementById('delete-company-btn');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Weet je zeker dat je dit bedrijf wilt verwijderen?')) {
      try {
        // Get current company ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const companyId = urlParams.get('id') || 'demo';

        // Get company data to access user ID (in real app this would be the actual user ID)
        const companyData = getCompanyData(companyId);

        // In a real implementation, you would use the actual user ID from the company data
        // For demo purposes, we'll use a mock ID
        const userId = companyData.userId || 2; // This should be the actual user ID from your database

        // Call the delete API
        await deleteUser(userId);

        alert('Bedrijf succesvol verwijderd.');

        // Navigate back to companies overview
        Router.navigate('/admin-dashboard/ingeschreven-bedrijven');
      } catch (error) {
        console.error('Error deleting company:', error);

        // Handle different error types
        if (error.message.includes('403')) {
          alert('Je hebt geen toestemming om dit bedrijf te verwijderen.');
        } else if (error.message.includes('404')) {
          alert('Bedrijf niet gevonden.');
        } else {
          alert(
            'Er is een fout opgetreden bij het verwijderen van het bedrijf. Probeer het opnieuw.'
          );
        }
      }
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

// Modal functionality for speeddates
async function openSpeedDatesModal() {
  const modal = document.getElementById('speeddates-modal');
  const speedDatesList = document.getElementById('speeddates-list');

  // Get current company ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('id') || 'demo';

  // Clear existing content
  speedDatesList.innerHTML = '';

  try {
    // Fetch speeddates data from API with company ID
    const accessToken = sessionStorage.getItem('accessToken');
    const response = await fetch(
      `https://api.ehb-match.me/speeddates?id=${companyId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch speeddates data');
    }

    const speeddates = await response.json();

    if (speeddates.length === 0) {
      speedDatesList.innerHTML =
        '<div class="no-speeddates">Geen speeddates gevonden</div>';
    } else {
      speeddates.forEach((speeddate) => {
        const speedDateItem = document.createElement('div');
        speedDateItem.className = 'speeddate-item';
        speedDateItem.innerHTML = `
          <div class="speeddate-info">
            <span class="speeddate-time">${new Date(
              speeddate.begin
            ).toLocaleTimeString()} - ${new Date(
          speeddate.einde
        ).toLocaleTimeString()}</span>
            <span class="speeddate-student">${speeddate.voornaam_student} ${
          speeddate.achternaam_student
        }</span>
          </div>
          <button class="speeddate-cancel-btn" data-speeddate-id="${
            speeddate.id
          }" title="Annuleren">✕</button>
        `;
        speedDatesList.appendChild(speedDateItem);
      });

      // Add event listeners for cancel buttons
      const cancelButtons = speedDatesList.querySelectorAll(
        '.speeddate-cancel-btn'
      );
      cancelButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const speedDateId = btn.dataset.speeddateId;
          if (confirm('Weet je zeker dat je deze speeddate wilt annuleren?')) {
            btn.closest('.speeddate-item').remove();
            console.log(`Speeddate ${speedDateId} geannuleerd`);

            // Check if list is now empty
            if (speedDatesList.children.length === 0) {
              speedDatesList.innerHTML =
                '<div class="no-speeddates">Geen speeddates gevonden</div>';
            }
          }
        });
      });
    }
  } catch (error) {
    console.error('Error fetching speeddates:', error);
    speedDatesList.innerHTML =
      '<div class="error">Er is een probleem opgetreden bij het ophalen van de speeddates. Probeer het later opnieuw.</div>';
  }

  modal.style.display = 'flex';

  // Add event listeners for closing modal
  const closeBtn = document.getElementById('close-modal');
  const modalOverlay = modal;

  closeBtn.addEventListener('click', closeSpeedDatesModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeSpeedDatesModal();
    }
  });

  // ESC key to close modal
  document.addEventListener('keydown', function escKeyHandler(e) {
    if (e.key === 'Escape') {
      closeSpeedDatesModal();
      document.removeEventListener('keydown', escKeyHandler);
    }
  });
}

function closeSpeedDatesModal() {
  const modal = document.getElementById('speeddates-modal');
  modal.style.display = 'none';
}

function getCompanySpeedDates(companyId) {
  // This function is no longer needed as speeddate data comes from API
  return [];
}
