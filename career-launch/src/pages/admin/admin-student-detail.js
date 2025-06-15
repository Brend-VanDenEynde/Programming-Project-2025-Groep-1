// Admin student detail pagina
import Router from '../../router.js';
import defaultAvatar from '../../images/default.png';
import { performLogout, logoutUser } from '../../utils/auth-api.js';
import { deleteUser } from '../../utils/data-api.js';

export async function renderAdminStudentDetail(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  // Get student ID from URL or use default for demo
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    console.error('Student ID is missing in the URL');
    return;
  }

  // Mock student data - in real app this would come from API
  const studentData = getStudentData(studentId);

  rootElement.innerHTML = `
    <div class="admin-dashboard-clean" style="background-color: white;">
      <header class="admin-header-clean">
        <div class="admin-logo-section">
          <img src="src/Images/EhB-logo-transparant.png" alt="Logo" width="40" height="40">
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
              <li><button class="nav-btn" data-route="/admin-dashboard/ingeschreven-bedrijven">Ingeschreven Bedrijven</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean" style="background-color: white;">
          <div class="admin-section-header">
            <button id="back-btn" class="back-btn">← Terug naar studenten</button>
            <h1 id="section-title">Student Details: ${studentData.firstName} ${
    studentData.lastName
  }</h1>
          </div>            <div class="admin-content-area" id="content-area" style="background-color: white;">
            <div class="detail-container">
              <div class="detail-main-layout">
                <!-- Left side - Student Information -->
                <div class="detail-left">
                  <!-- Profile Picture Section -->
                  <div class="detail-logo-section">
                    <img 
                      src="${studentData.profilePictureUrl || defaultAvatar}" 
                      alt="Profielfoto ${studentData.firstName} ${
    studentData.lastName
  }" 
                      class="detail-logo"
                    />
                  </div>
                  
                  <!-- Student Information -->
                  <div class="detail-info">
                    <div class="detail-field">
                      <label>Naam:</label>
                      <span>${studentData.firstName} ${
    studentData.lastName
  }</span>
                    </div>
                    
                    <div class="detail-field">
                      <label>Contact-Email:</label>
                      <span>${studentData.email}</span>
                    </div>
                    
                    <div class="detail-field">
                      <label>LinkedIn-profiel:</label>
                      <span>
                        ${
                          studentData.linkedIn
                            ? `<a href="${studentData.linkedIn}" target="_blank" class="linkedin-link">${studentData.linkedIn}</a>`
                            : 'Niet ingesteld'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Right side - Action Buttons -->
                <div class="detail-right">
                  <div class="detail-actions">
                    <button id="view-speeddates-btn" class="detail-action-btn speeddates">
                      Speeddates
                    </button>
                    <button id="contact-student-btn" class="detail-action-btn contact">
                      Contact
                    </button>
                    <button id="delete-account-btn" class="detail-action-btn delete">
                      Verwijder account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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

  // Event handlers
  setupEventHandlers();
  document.title = `Student Details: ${studentData.firstName} ${studentData.lastName} - Admin Dashboard`;

  // Fetch student data from API
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    const response = await fetch(
      `https://api.ehb-match.me/studenten/${studentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const studentData = await response.json();

    // Update the page with student data
    document.querySelector(
      '.admin-section-header h1'
    ).textContent = `Student Details: ${studentData.voornaam} ${studentData.achternaam}`;
    document.querySelector('.detail-logo-section img').src =
      studentData.profiel_foto || defaultAvatar;
    document.querySelector(
      '.detail-info .detail-field:nth-child(1) span'
    ).textContent = `${studentData.voornaam} ${studentData.achternaam}`;
    document.querySelector(
      '.detail-info .detail-field:nth-child(2) span'
    ).textContent = studentData.email || 'Niet beschikbaar';
    document.querySelector(
      '.detail-info .detail-field:nth-child(3) span'
    ).innerHTML = studentData.linkedin
      ? `<a href="${studentData.linkedin}" target="_blank" class="linkedin-link">${studentData.linkedin}</a>`
      : 'Niet ingesteld';
  } catch (error) {
    console.error('Error fetching student details:', error);
  }
}

// Modal functionality for speeddates
async function openSpeedDatesModal() {
  const modal = document.getElementById('speeddates-modal');
  const speedDatesList = document.getElementById('speeddates-list');

  // Get current student ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id') || 'demo';

  // Clear existing content
  speedDatesList.innerHTML = '';

  try {
    // Fetch speeddates data from API with student ID
    const accessToken = sessionStorage.getItem('accessToken');
    const response = await fetch(
      `https://api.ehb-match.me/speeddates?id=${studentId}`,
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
            <span class="speeddate-company">${speeddate.naam_bedrijf}</span>
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

function getStudentSpeedDates(studentId) {
  // This function is no longer needed as speeddate data comes from API
  return [];
}

function getStudentData(studentId) {
  // This function is no longer needed as student data comes from API
  // Return minimal fallback data only
  return {
    userId: 999,
    firstName: 'Onbekend',
    lastName: 'Student',
    email: 'onbekend@student.ehb.be',
    studyProgram: 'Onbekend',
    year: 'Onbekend',
    birthDate: '1997-01-01',
    linkedIn: '',
    description: 'Student data wordt opgehaald van de API.',
    profilePictureUrl: null,
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
      Router.navigate('/admin-dashboard/ingeschreven-studenten');
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
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Admin action buttons
  const contactBtn = document.getElementById('contact-student-btn');
  contactBtn.addEventListener('click', () => {
    // Get current student ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id') || 'demo';

    // Get student data to access email
    const studentData = getStudentData(studentId);

    // Create mailto link and open it
    const mailtoLink = `mailto:${studentData.email}`;
    window.location.href = mailtoLink;
  });
  const speedDatesBtn = document.getElementById('view-speeddates-btn');
  if (speedDatesBtn) {
    speedDatesBtn.removeEventListener('click', openSpeedDatesModal);
    speedDatesBtn.addEventListener('click', openSpeedDatesModal);
  }
  const deleteBtn = document.getElementById('delete-account-btn');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Weet je zeker dat je dit account wilt verwijderen?')) {
      try {
        // Get current student ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('id');

        if (!studentId) {
          alert('Student ID niet gevonden.');
          return;
        }

        // Use the student ID as the user ID for the delete API call
        // The studentId in the URL is actually the gebruiker_id from the API
        const userId = studentId;

        // Call the delete API
        await deleteUser(userId);

        alert('Student succesvol verwijderd.');

        // Navigate back to students overview
        Router.navigate('/admin-dashboard/ingeschreven-studenten');
      } catch (error) {
        console.error('Error deleting user:', error);

        // Handle different error types
        if (error.message.includes('403')) {
          alert('Je hebt geen toestemming om dit account te verwijderen.');
        } else if (error.message.includes('404')) {
          alert('Gebruiker niet gevonden.');
        } else {
          alert(
            'Er is een fout opgetreden bij het verwijderen van het account. Probeer het opnieuw.'
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
