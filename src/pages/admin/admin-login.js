// Admin login pagina
import Router from '../../router.js';

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
      // Make API call
      const response = await fetch('https://api.ehb-match.me/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      // Parse JSON response
      const responseData = await response.json(); // Debugging: Log API responses

      if (response.ok) {
        // Store important information in session storage
        sessionStorage.setItem('authToken', responseData.accessToken);
        sessionStorage.setItem('accessToken', responseData.accessToken);
        sessionStorage.setItem(
          'accessTokenExpiresAt',
          responseData.accessTokenExpiresAt
        );
        // Set adminLoggedIn session variable
        sessionStorage.setItem('adminLoggedIn', 'true');

        // Make GET request to fetch additional info
        const infoResponse = await fetch('https://api.ehb-match.me/auth/info', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${responseData.accessToken}`,
          },
        });
        const infoData = await infoResponse.json();

        // Debugging: Log user info

        if (infoData.user.type === 1) {
          // User is an admin, store admin email and redirect directly to ingeschreven studenten
          sessionStorage.setItem('adminUsername', infoData.user.email);
          sessionStorage.setItem('adminEmail', infoData.user.email);
          Router.navigate('/admin-dashboard/ingeschreven-studenten');
        } else {
          // User is not an admin, display error message
          errorMessage.textContent = 'Je bent geen admin!';
          errorMessage.style.display = 'block';
        }
      } else {
        // Show error message only for failed requests
        errorMessage.textContent =
          responseData.message || 'Onjuiste inloggegevens.';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      // Handle errors
      errorMessage.textContent =
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
