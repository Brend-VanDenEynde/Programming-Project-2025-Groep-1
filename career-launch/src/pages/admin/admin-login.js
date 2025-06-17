// Admin login pagina
import Router from '../../router.js';
import { initializeAuthSession } from '../../utils/auth-api.js';
import { apiPost, apiGet } from '../../utils/api.js';

export function renderAdmin(rootElement) {
  rootElement.innerHTML = `
        <div class="admin-container">
            <div class="admin-card">
                <h1>Admin Login</h1>
                <form id="admin-login-form" class="admin-form">                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required placeholder="Email">
                    </div><div class="form-group">
                        <label for="password">Wachtwoord:</label>
                        <input type="password" id="password" name="password" required placeholder="Wachtwoord">
                    </div>
                    <button type="submit" class="admin-btn">Inloggen</button>
                    <label id="error-message" class="error-message" style="display: none; color: red;"></label>
                </form>
            </div>
              <!-- FOOTER -->
            <footer class="student-profile-footer">
                <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
                <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
            </footer>
        </div>
    `;

  // Handle login form submission
  const loginForm = document.getElementById('admin-login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Create JSON object
    const loginData = {
      email: email,
      password: password,
    };
    try {
      // Make API call using new authentication system
      const responseData = await apiPost(
        'https://api.ehb-match.me/auth/login',
        loginData
      ); // Initialize authentication session with automatic token refresh
      // For admin login, we store the accessToken
      window.sessionStorage.setItem('accessToken', responseData.accessToken);
      window.sessionStorage.setItem('authToken', responseData.accessToken);
      if (responseData.accessTokenExpiresAt) {
        window.sessionStorage.setItem(
          'accessTokenExpiresAt',
          responseData.accessTokenExpiresAt
        );
      }

      // Set adminLoggedIn session variable
      sessionStorage.setItem('adminLoggedIn', 'true');

      // Initialize automatic token refresh monitoring
      initializeAuthSession(); // Make GET request to fetch additional info using new API utilities
      const infoData = await apiGet('https://api.ehb-match.me/auth/info');

      // Debugging: Log user type
      console.log('User Type:', infoData.user.type);

      // Check user type
      if (infoData.user.type === 1) {
        // Store admin username if available
        if (infoData.user.email) {
          sessionStorage.setItem('adminUsername', infoData.user.email);
        }

        // User is an admin, proceed to dashboard
        Router.navigate('/admin-dashboard');
      } else {
        // User is not an admin, display error message
        errorMessage.textContent = 'Je bent geen admin!';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      // Handle errors
      errorMessage.textContent =
        error.message ||
        'Er is een fout opgetreden bij het maken van de API-aanroep.';
      errorMessage.style.display = 'block';
      errorMessage.style.backgroundColor = 'transparent'; // Remove background styling
      console.error(error);
    }

    // Clear form
    loginForm.reset();
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
