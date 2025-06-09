// Admin dashboard pagina
import Router from '../../router.js';

export function renderAdminDashboard(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  // Always redirect to admin selection dashboard
  Router.navigate('/admin-select-dashboard');
  return;
}
