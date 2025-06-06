// Admin dashboard pagina
import Router from '../router.js';

export function renderAdminDashboard(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin');
    return;
  }
  rootElement.innerHTML = `
        <div class="admin-dashboard-clean">            <header class="admin-header-clean">
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
            
            <div class="admin-main-layout">                <aside class="admin-sidebar-clean">
                    <nav class="admin-nav">
                        <ul>
                            <li><button class="nav-btn active" data-section="students">Ingeschreven studenten</button></li>
                            <li><button class="nav-btn" data-section="companies">Ingeschreven Bedrijven</button></li>
                            <li><button class="nav-btn" data-section="processing">Bedrijven in behandeling</button></li>
                        </ul>
                    </nav>
                </aside>
                
                <main class="admin-content-clean">
                    <div class="admin-section-header">
                        <h1 id="section-title">Ingeschreven Studenten</h1>
                    </div>
                    
                    <div class="admin-content-area" id="content-area">
                        <!-- Content will be loaded here based on selected section -->
                    </div>
                </main>
            </div>
              
            <!-- FOOTER -->
            <footer class="student-profile-footer">
                <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
                <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
            </footer>
        </div>
    `; // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    // Clear session
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');
    // Redirect to admin login
    Router.navigate('/admin');
  });
  // Handle navigation between sections
  const navButtons = document.querySelectorAll('.nav-btn');
  const sectionTitle = document.getElementById('section-title');
  const contentArea = document.getElementById('content-area');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      navButtons.forEach((b) => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');

      const section = btn.dataset.section;
      navigateToSection(section);
    });
  });

  // Function to navigate to a section and update URL
  function navigateToSection(section) {
    let newPath;
    switch (section) {
      case 'students':
        newPath = '/admin-dashboard/ingeschreven-studenten';
        break;
      case 'companies':
        newPath = '/admin-dashboard/ingeschreven-bedrijven';
        break;
      case 'processing':
        newPath = '/admin-dashboard/bedrijven-in-behandeling';
        break;
      default:
        newPath = '/admin-dashboard/ingeschreven-studenten';
    }

    // Update URL without triggering a full page reload
    window.history.pushState(null, '', newPath);
    loadSection(section);

    // Update page title
    const titles = {
      students: 'Ingeschreven Studenten - Admin Dashboard',
      companies: 'Ingeschreven Bedrijven - Admin Dashboard',
      processing: 'Bedrijven in Behandeling - Admin Dashboard',
    };
    document.title = titles[section] || 'Admin Dashboard - Career Launch 2025';
  }

  // Function to load different sections
  function loadSection(section) {
    switch (section) {
      case 'students':
        sectionTitle.textContent = 'Ingeschreven Studenten';
        loadStudentsSection();
        break;
      case 'companies':
        sectionTitle.textContent = 'Ingeschreven Bedrijven';
        loadCompaniesSection();
        break;
      case 'processing':
        sectionTitle.textContent = 'Bedrijven in behandeling';
        loadProcessingSection();
        break;
    }
  }

  // Function to load students section
  function loadStudentsSection() {
    // Sample student data - in a real app this would come from an API
    const students = [
      'Tiberius Kirk',
      'John Smith',
      'Tiberius Kirk',
      'Jean-Luc Picard',
      'Daniel Vonkman',
      'Len Jaxtyn',
      'Kimberley Hester',
      'Ed Marvin',
    ];

    contentArea.innerHTML = `
      <div class="student-list">
        ${students
          .map(
            (student) => `
          <div class="student-item">
            <span class="student-name">${student}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  // Function to load companies section
  function loadCompaniesSection() {
    contentArea.innerHTML = `
      <div class="companies-list">
        <div class="empty-state">
          <p>Geen bedrijven ingeschreven</p>
        </div>
      </div>
    `;
  }

  // Function to load processing section
  function loadProcessingSection() {
    contentArea.innerHTML = `
      <div class="processing-list">
        <div class="empty-state">
          <p>Geen bedrijven in behandeling</p>
        </div>
      </div>
    `;
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar-clean');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
  // Function to initialize the correct section based on current URL
  function initializeCurrentSection() {
    const currentPath = window.location.pathname;
    let section = 'students'; // default

    // Determine section from URL
    if (currentPath.includes('/ingeschreven-studenten')) {
      section = 'students';
    } else if (currentPath.includes('/ingeschreven-bedrijven')) {
      section = 'companies';
    } else if (currentPath.includes('/bedrijven-in-behandeling')) {
      section = 'processing';
    }

    // Update active button
    navButtons.forEach((b) => b.classList.remove('active'));
    const activeButton = document.querySelector(`[data-section="${section}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    // Load the section content
    loadSection(section);

    // If we're on the base admin-dashboard URL, redirect to the students section
    if (currentPath === '/admin-dashboard') {
      window.history.replaceState(
        null,
        '',
        '/admin-dashboard/ingeschreven-studenten'
      );
      document.title = 'Ingeschreven Studenten - Admin Dashboard';
    }
  }

  // Load default section
  initializeCurrentSection();

  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
