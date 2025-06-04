// Admin dashboard pagina
export function renderAdminDashboard(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');

  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    window.location.hash = '#/admin';
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
        </div>
    `;

  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    // Clear session
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');

    // Redirect to admin login
    window.location.hash = '#/admin';
  });
}
