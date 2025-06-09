// Admin student detail pagina
import Router from '../../router.js';
import defaultAvatar from '../../Images/default.jpg';

export function renderAdminStudentDetail(rootElement) {
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
  const studentId = urlParams.get('id') || 'demo';

  // Mock student data - in real app this would come from API
  const studentData = getStudentData(studentId);

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
}

function getStudentData(studentId) {
  // Mock data - in real app this would fetch from API
  const studentDatabase = {
    'tiberius-kirk': {
      firstName: 'Tiberius',
      lastName: 'Kirk',
      email: 'Tiberius.Kirk@Enterprise.space',
      studyProgram: 'Computer Science',
      year: '3e jaar',
      birthDate: '1995-05-15',
      linkedIn: 'linkedin.com/in/Tiberius-Kirk',
      description:
        'Ambitieuze student met passie voor technologie en innovatie.',
      profilePictureUrl: null,
      registrationDate: '2024-09-15',
      status: 'Actief',
      lastLogin: '2024-12-08',
    },
    'john-smith': {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@student.ehb.be',
      studyProgram: 'Business Administration',
      year: '2e jaar',
      birthDate: '1996-03-22',
      linkedIn: '',
      description: 'Gedreven student met interesse in ondernemerschap.',
      profilePictureUrl: null,
      registrationDate: '2024-09-10',
      status: 'Actief',
      lastLogin: '2024-12-07',
    },
    'jean-luc-picard': {
      firstName: 'Jean-Luc',
      lastName: 'Picard',
      email: 'jean.luc.picard@student.ehb.be',
      studyProgram: 'International Relations',
      year: '4e jaar',
      birthDate: '1994-07-13',
      linkedIn: 'linkedin.com/in/jean-luc-picard',
      description:
        'Student met sterke leiderschapsvaardigheden en interesse in diplomatie.',
      profilePictureUrl: null,
      registrationDate: '2024-08-20',
      status: 'Actief',
      lastLogin: '2024-12-09',
    },
    'daniel-vonkman': {
      firstName: 'Daniel',
      lastName: 'Vonkman',
      email: 'daniel.vonkman@student.ehb.be',
      studyProgram: 'Marketing',
      year: '3e jaar',
      birthDate: '1995-11-08',
      linkedIn: '',
      description: 'Creatieve student met passie voor digitale marketing.',
      profilePictureUrl: null,
      registrationDate: '2024-09-05',
      status: 'Actief',
      lastLogin: '2024-12-06',
    },
    'len-jaxtyn': {
      firstName: 'Len',
      lastName: 'Jaxtyn',
      email: 'len.jaxtyn@student.ehb.be',
      studyProgram: 'Graphic Design',
      year: '2e jaar',
      birthDate: '1996-12-25',
      linkedIn: 'linkedin.com/in/len-jaxtyn',
      description: 'Artistieke student met expertise in visuele communicatie.',
      profilePictureUrl: null,
      registrationDate: '2024-09-12',
      status: 'Actief',
      lastLogin: '2024-12-08',
    },
    'kimberley-hester': {
      firstName: 'Kimberley',
      lastName: 'Hester',
      email: 'kimberley.hester@student.ehb.be',
      studyProgram: 'Psychology',
      year: '1e jaar',
      birthDate: '1997-04-17',
      linkedIn: '',
      description: 'Empathische student met interesse in menselijk gedrag.',
      profilePictureUrl: null,
      registrationDate: '2024-09-18',
      status: 'Actief',
      lastLogin: '2024-12-05',
    },
    'ed-marvin': {
      firstName: 'Ed',
      lastName: 'Marvin',
      email: 'ed.marvin@student.ehb.be',
      studyProgram: 'Engineering',
      year: '4e jaar',
      birthDate: '1994-09-30',
      linkedIn: 'linkedin.com/in/ed-marvin',
      description:
        'Technische student met specialisatie in duurzame technologieën.',
      profilePictureUrl: null,
      registrationDate: '2024-08-15',
      status: 'Actief',
      lastLogin: '2024-12-07',
    },
    demo: {
      firstName: 'Demo',
      lastName: 'Student',
      email: 'demo@student.ehb.be',
      studyProgram: 'Demo Programma',
      year: '1e jaar',
      birthDate: '1997-01-01',
      linkedIn: '',
      description: 'Dit is een demo student profiel.',
      profilePictureUrl: null,
      registrationDate: '2024-01-01',
      status: 'Actief',
      lastLogin: '2024-12-09',
    },
  };

  return studentDatabase[studentId] || studentDatabase['demo'];
}

function setupEventHandlers() {
  // Back button
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', () => {
    Router.navigate('/admin-dashboard/ingeschreven-studenten');
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
  const contactBtn = document.getElementById('contact-student-btn');
  contactBtn.addEventListener('click', () => {
    alert('Contact functionaliteit zou hier geïmplementeerd worden.');
  });

  const speedDatesBtn = document.getElementById('view-speeddates-btn');
  speedDatesBtn.addEventListener('click', () => {
    alert('Speeddates overzicht zou hier getoond worden.');
  });

  const deleteBtn = document.getElementById('delete-account-btn');
  deleteBtn.addEventListener('click', () => {
    if (confirm('Weet je zeker dat je dit account wilt verwijderen?')) {
      alert('Account verwijdering zou hier geïmplementeerd worden.');
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
