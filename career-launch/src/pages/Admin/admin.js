// Admin login pagina
import Router from '../../router.js';

export function renderAdmin(rootElement) {
  rootElement.innerHTML = `
        <div class="admin-container">
            <div class="admin-card">
                <h1>Admin Login</h1>
                <div id="error-message" class="error-message" style="display: none;"></div>
                <form id="admin-login-form" class="admin-form">
                    <div class="form-group">
                        <label for="username">Gebruikersnaam:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Wachtwoord:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="admin-btn">Inloggen</button>                </form>
            </div>
              <!-- FOOTER -->
            <footer class="student-profile-footer">
                <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
                <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
            </footer>
        </div>
    `;

  // Admin credentials (hardcoded)
  const adminCredentials = {
    username: 'admin',
    password: 'admin123',
  };

  // Handle login form submission
  const loginForm = document.getElementById('admin-login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check credentials
    if (
      username === adminCredentials.username &&
      password === adminCredentials.password
    ) {
      // Set session
      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('adminUsername', username); // Redirect to dashboard
      // Redirect to admin dashboard or specific section
      // For now, redirecting to a new selection page
      Router.navigate('/admin-select-dashboard');
    } else {
      // Show error message
      errorMessage.textContent = 'Ongeldige gebruikersnaam of wachtwoord!';
      errorMessage.style.display = 'block';

      // Clear form
      loginForm.reset();

      // Hide error after 5 seconds
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 5000);
    }
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
}
