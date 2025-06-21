// Admin student detail pagina
import Router from '../../router.js';
import defaultAvatar from '../../images/default.png';
import {
  performLogout,
  logoutUser,
  authenticatedFetch,
} from '../../utils/auth-api.js';
import { deleteUser } from '../../utils/data-api.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';

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
  // Show loading state first
  rootElement.innerHTML = `
    <div class="admin-dashboard-clean" style="background-color: white;">
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
              <li><button class="nav-btn" data-route="/admin-dashboard/contacten">Contacten</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean" style="background-color: white;">
          <div class="admin-section-header">
            <button id="back-btn" class="back-btn">← Terug naar studenten</button>
            <h1 id="section-title">Student Details laden...</h1>
          </div>
          <div class="admin-content-area" id="content-area" style="background-color: white;">
            <div class="loading-container" style="display: flex; justify-content: center; align-items: center; height: 200px;">
              <div class="loading-spinner" style="border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
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

  // Set up basic event handlers for the loading state
  document.getElementById('back-btn').addEventListener('click', () => {
    Router.navigate('/admin-dashboard/ingeschreven-studenten');
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logoutUser();
    window.sessionStorage.clear();
    localStorage.clear();
    Router.navigate('/');
  });

  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      Router.navigate(route);
    });
  });
  // Fetch student data from API
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    // Fetch fresh data from the API
    const response = await authenticatedFetch(
      `https://api.ehb-match.me/studenten/${studentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // Disable caching to always get fresh data
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const studentData = await response.json();

    // Also fetch student data from discover endpoint to get contactemail
    let studentDiscoverData = null;
    try {
      const discoverResponse = await authenticatedFetch(
        `https://api.ehb-match.me/discover/studenten`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        }
      );
      if (discoverResponse.ok) {
        const allStudents = await discoverResponse.json();

        // Find the specific student by ID - try both string and number comparison
        studentDiscoverData = allStudents.find((student) => {
          return (
            student.id == studentId ||
            student.id === parseInt(studentId) ||
            student.id === studentId.toString()
          );
        });
      }
    } catch (discoverError) {
      console.warn('Could not fetch discover data:', discoverError);
    } // Merge the data - use contact_email from original student data or discover if available
    const mergedStudentData = {
      ...studentData,
      contactemail:
        studentData.contact_email ||
        studentDiscoverData?.contact_email ||
        studentData.email,
    };

    // Render the full page with the fetched data
    renderFullDetailPage(rootElement, mergedStudentData, adminUsername);
  } catch (error) {
    console.error('Error fetching student details:', error);
    // Show error state
    document.getElementById('content-area').innerHTML = `
      <div class="error-container" style="text-align: center; padding: 20px;">
        <h2 style="color: #e74c3c;">Fout bij het laden van studentgegevens</h2>
        <p>Er is een probleem opgetreden bij het laden van de studentgegevens. Probeer het later opnieuw.</p>
        <button onclick="location.reload()" style="padding: 10px; margin-top: 10px;">Opnieuw proberen</button>
      </div>
    `;
  }
}

// Function to render the full detail page once data is loaded
function renderFullDetailPage(rootElement, studentData, adminUsername) {
  // Replace the loading view with the complete detail view
  const contentArea = document.getElementById('content-area');

  // Update the page title
  document.querySelector(
    '#section-title'
  ).textContent = `Student Details: ${studentData.voornaam} ${studentData.achternaam}`;

  // Replace the content area with the student details
  contentArea.innerHTML = `
    <div class="detail-container">
      <div class="detail-main-layout">
        <!-- Left side - Student Information -->
        <div class="detail-left">
          <!-- Profile Picture Section -->
          <div class="detail-logo-section">
            <img 
              src="${studentData.profiel_foto || defaultAvatar}" 
              alt="Profielfoto ${studentData.voornaam} ${
    studentData.achternaam
  }" 
              class="detail-logo"
            />
          </div>
          
          <!-- Student Information -->
          <div class="detail-info">
            <div class="detail-field">
              <label>Naam:</label>
              <span>${studentData.voornaam} ${studentData.achternaam}</span>
            </div>
              <div class="detail-field">
              <label>Contact-Email:</label>
              <span>${
                studentData.contactemail ||
                studentData.email ||
                'Niet beschikbaar'
              }</span>
            </div>
            
            <div class="detail-field">
              <label>LinkedIn-profiel:</label>
              <span>
                ${
                  studentData.linkedin
                    ? `<a href="${studentData.linkedin}" target="_blank" class="linkedin-link">${studentData.linkedin}</a>`
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
  `;

  // Add the speeddates modal to the page
  const modalContainer = document.createElement('div');
  modalContainer.id = 'speeddates-modal';
  modalContainer.className = 'speeddates-modal';
  modalContainer.style.display = 'none';
  modalContainer.innerHTML = `
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
  `;

  rootElement
    .querySelector('.admin-dashboard-clean')
    .appendChild(modalContainer);

  // Set up all event handlers
  setupEventHandlers(studentData);

  // Set the document title
  document.title = `Student Details: ${studentData.voornaam} ${studentData.achternaam} - Admin Dashboard`;
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
    const response = await authenticatedFetch(
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
      }); // Add event listeners for cancel buttons
      const cancelButtons = speedDatesList.querySelectorAll(
        '.speeddate-cancel-btn'
      );
      cancelButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const speedDateId = btn.dataset.speeddateId;
          if (confirm('Weet je zeker dat je deze speeddate wilt annuleren?')) {
            // Disable button during processing
            btn.disabled = true;
            btn.textContent = '⏳';
            try {
              // Call API to reject/delete the speeddate
              await rejectSpeeddate(speedDateId);

              // Remove from DOM only if API call succeeded
              btn.closest('.speeddate-item').remove();

              // Check if list is now empty
              if (speedDatesList.children.length === 0) {
                speedDatesList.innerHTML =
                  '<div class="no-speeddates">Geen speeddates gevonden</div>';
              }

              // Close modal after successful cancellation
              setTimeout(() => {
                closeSpeedDatesModal();
              }, 500);
            } catch (error) {
              console.error('Error rejecting speeddate:', error);
              alert(
                'Er is een fout opgetreden bij het annuleren van de speeddate. Probeer het opnieuw.'
              );

              // Re-enable button
              btn.disabled = false;
              btn.textContent = '✕';
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

function setupEventHandlers(studentData) {
  // Admin action buttons
  const contactBtn = document.getElementById('contact-student-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      // Create mailto link using the contact email from the merged data
      const email =
        studentData.contactemail ||
        studentData.email ||
        'onbekend@student.ehb.be';
      const mailtoLink = `mailto:${email}`;
      window.location.href = mailtoLink;
    });
  }

  const speedDatesBtn = document.getElementById('view-speeddates-btn');
  if (speedDatesBtn) {
    speedDatesBtn.removeEventListener('click', openSpeedDatesModal);
    speedDatesBtn.addEventListener('click', openSpeedDatesModal);
  }

  const deleteBtn = document.getElementById('delete-account-btn');
  if (deleteBtn) {
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
}

// Function to reject/delete a speeddate via API
async function rejectSpeeddate(speeddateId) {
  const accessToken = sessionStorage.getItem('accessToken');

  const response = await fetch(
    `https://api.ehb-match.me/speeddates/reject/${speeddateId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
