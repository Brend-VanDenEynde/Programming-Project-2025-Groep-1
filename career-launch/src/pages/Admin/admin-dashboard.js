// Admin dashboard hoofdpagina

export function renderAdminDashboard(rootElement) {
  rootElement.innerHTML = `
    <div class="admin-dashboard-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 20px; text-align: center;">
      <h1>Admin Dashboard</h1>
      <p>Kies een sectie via het menu of ga terug naar de selectiepagina.</p>
      <button id="btn-admin-select" style="margin-top:2rem; padding:0.75rem 2rem; font-size:1.1rem;">Terug naar selectie</button>
    </div>
  `;

  const btn = document.getElementById('btn-admin-select');
  if (btn) {
    btn.addEventListener('click', () => {
      import('../../router.js').then((module) => {
        const Router = module.default;
        Router.navigate('/admin-select-dashboard');
      });
    });
  }

  document.title = 'Admin Dashboard - Career Launch 2025';
}

// Placeholder for renderAdminProcessingCompanyDetail to prevent ReferenceError
export function renderAdminProcessingCompanyDetail(rootElement) {
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <h2>Bedrijfsverwerking Detail</h2>
      <p>Detailpagina voor bedrijfsverwerking (placeholder).</p>
    </div>
  `;
}
