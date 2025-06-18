// Admin select dashboard page
import Router from '../../router.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';

export function renderAdminSelectDashboard(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  rootElement.innerHTML = `
    <div class="admin-select-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 20px; text-align: center;">
        <img src="${ehbLogo}" alt="Logo" style="max-width: 150px; margin-bottom: 30px;">
        <h1>Admin Dashboard Selectie</h1>
        <p style="margin-bottom: 30px;">Kies een sectie om naar te navigeren:</p>
        <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 15px;"><button class="select-dashboard-btn" data-target="/admin-dashboard/ingeschreven-studenten">Ingeschreven Studenten</button></li>
            <li style="margin-bottom: 15px;"><button class="select-dashboard-btn" data-target="/admin-dashboard/ingeschreven-bedrijven">Ingeschreven Bedrijven</button></li>
            <li style="margin-bottom: 15px;"><button class="select-dashboard-btn" data-target="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in Behandeling</button></li>
            <li style="margin-bottom: 15px;"><button class="select-dashboard-btn" data-route="/admin-dashboard/contacten">Contacten</button></li>
        </ul>
    </div>
    <style>
      .admin-select-container h1 {
        font-size: 2em;
        color: #333;
        margin-bottom: 10px;
      }
      .select-dashboard-btn {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 12px 25px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        min-width: 250px; /* Ensure buttons have a nice width */
      }
      .select-dashboard-btn:hover {
        background-color: #0056b3;
      }
    </style>
  `;

  document.querySelectorAll('.select-dashboard-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const targetPath = event.target.dataset.target;
      Router.navigate(targetPath);
    });
  });

  document.title = 'Admin Selectie - Career Launch 2025';
}
