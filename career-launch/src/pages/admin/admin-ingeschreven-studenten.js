// Admin ingeschreven studenten pagina
import Router from '../../router.js';

export function renderAdminIngeschrevenStudenten(rootElement) {
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
              <li><button class="nav-btn active" data-route="/admin-dashboard/ingeschreven-studenten">Ingeschreven studenten</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/ingeschreven-bedrijven">Ingeschreven Bedrijven</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean">
          <div class="admin-section-header">
            <h1 id="section-title">Ingeschreven Studenten</h1>
          </div>
          
          <div class="admin-content-area" id="content-area">
            <div class="student-list">
              <div class="student-item clickable-student" data-student-id="tiberius-kirk">
                <span class="student-name">Tiberius Kirk</span>
              </div>
              <div class="student-item clickable-student" data-student-id="john-smith">
                <span class="student-name">John Smith</span>
              </div>
              <div class="student-item clickable-student" data-student-id="jean-luc-picard">
                <span class="student-name">Jean-Luc Picard</span>
              </div>
              <div class="student-item clickable-student" data-student-id="daniel-vonkman">
                <span class="student-name">Daniel Vonkman</span>
              </div>
              <div class="student-item clickable-student" data-student-id="len-jaxtyn">
                <span class="student-name">Len Jaxtyn</span>
              </div>
              <div class="student-item clickable-student" data-student-id="kimberley-hester">
                <span class="student-name">Kimberley Hester</span>
              </div>
              <div class="student-item clickable-student" data-student-id="ed-marvin">
                <span class="student-name">Ed Marvin</span>
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

  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    // Clear session
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');
    // Redirect to admin login
    Router.navigate('/admin-login');
  });

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

  // Add click handlers for student items
  const studentItems = document.querySelectorAll('.clickable-student');
  studentItems.forEach((item) => {
    item.addEventListener('click', () => {
      const studentId = item.dataset.studentId;
      Router.navigate(`/admin-dashboard/student-detail?id=${studentId}`);
    });
  });

  document.title = 'Ingeschreven Studenten - Admin Dashboard';
}
