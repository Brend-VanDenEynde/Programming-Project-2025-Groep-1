// Admin ingeschreven studenten pagina
import Router from '../../router.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';
import { logoutUser } from '../../utils/auth-api.js';

export async function renderAdminIngeschrevenStudenten(rootElement) {
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
              <!-- Student items will be populated by JavaScript -->
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
  }); // Mobile menu toggle
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

  // Fetch students data from API
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    const response = await fetch('https://api.ehb-match.me/studenten/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const students = await response.json();

    const studentListContainer = document.querySelector('.student-list');
    studentListContainer.innerHTML = ''; // Clear existing content

    students.forEach((student) => {
      const studentItem = document.createElement('div');
      studentItem.className = 'student-item clickable-student';
      studentItem.dataset.studentId = student.gebruiker_id;

      studentItem.innerHTML = `
        <span class="student-name">${student.voornaam} ${student.achternaam}</span>
      `;

      studentItem.addEventListener('click', () => {
        Router.navigate(
          `/admin-dashboard/student-detail?id=${student.gebruiker_id}`
        );
      });

      studentListContainer.appendChild(studentItem);
    });
  } catch (error) {
    console.error('Error fetching students:', error);
  }

  document.title = 'Ingeschreven Studenten - Admin Dashboard';
}
