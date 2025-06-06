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
        <div class="admin-dashboard">
            <header class="admin-header">
                <h1>Admin Dashboard</h1>
                <div class="admin-user-info">
                    <span>Welkom, ${adminUsername}</span>
                    <button id="logout-btn" class="logout-btn">Uitloggen</button>
                </div>
            </header>
              <main class="admin-content">
                <!-- Admin dashboard content wordt hier toegevoegd -->
            </main>
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
    Router.navigate('/admin');
  });

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
