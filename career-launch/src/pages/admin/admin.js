// Admin login pagina
import Router from '../../router.js';
import { authenticatedFetch } from '../../utils/auth-api.js';

export function renderAdmin(rootElement) {
  rootElement.innerHTML = `
    <style>
      .admin-container * {
        color: black !important;
      }
      .admin-container .message,
      .admin-container .error-message,
      .admin-container .notification,
      .admin-container .toast,
      .admin-container .alert {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      .admin-container [style*="color: red"],
      .admin-container [style*="color:red"] {
        display: none !important;
      }
    </style>
    <div class="admin-container">
      <div class="admin-card">
        <h1>Admin Login</h1>
        <form id="admin-login-form" class="admin-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required placeholder="Email">
          </div>
          <div class="form-group">
            <label for="password">Wachtwoord:</label>
            <input type="password" id="password" name="password" required placeholder="Wachtwoord">
          </div>
          <button type="submit" class="admin-btn">Inloggen</button>
          <label id="message" class="message" style="display: none;"></label>
        </form>
      </div>
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  const loginForm = document.getElementById('admin-login-form');
  const messageElement = document.getElementById('message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Verberg alle meldingen constant tijdens login
    const hideMessagesInterval = setInterval(() => {
      try {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent?.toLowerCase().trim();
          const color = window.getComputedStyle(el).color;
          const isRed = color === 'rgb(255, 0, 0)' || color === 'red';
          const isSuccessText = text.includes('succesvol') || text.includes('login goed');

          if (isRed || isSuccessText) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.height = '0';
            el.textContent = '';
          }
        });
      } catch {}
    }, 10);

    // Reset meldingsveld
    messageElement.style.display = 'none';
    messageElement.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await authenticatedFetch('https://api.ehb-match.me/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.accessToken) {
        sessionStorage.setItem('accessToken', responseData.accessToken);
        sessionStorage.setItem('accessTokenExpiresAt', responseData.accessTokenExpiresAt);
        sessionStorage.setItem('adminLoggedIn', 'true');

        const infoResponse = await authenticatedFetch('https://api.ehb-match.me/auth/info', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${responseData.accessToken}`,
          },
        });

        const infoData = await infoResponse.json();

        if (infoData.user.type === 1) {
          clearInterval(hideMessagesInterval);

          // Laadoverlay
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: white !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: Arial, sans-serif !important;
          `;
          overlay.innerHTML = '<div style="font-size: 24px; color: black;">Laden...</div>';
          document.body.appendChild(overlay);

          document.querySelectorAll('body > *:not(:last-child)').forEach(el => {
            el.style.display = 'none';
          });

          Router.navigate('/admin-dashboard');
          return;
        } else {
          clearInterval(hideMessagesInterval);
          messageElement.textContent = 'Je bent geen admin!';
          messageElement.style.display = 'block';
          messageElement.style.color = 'red';
        }
      } else {
        clearInterval(hideMessagesInterval);
        messageElement.textContent = responseData.message || 'Fout bij het inloggen.';
        messageElement.style.display = 'block';
        messageElement.style.color = 'red';
      }
    } catch (error) {
      clearInterval(hideMessagesInterval);
      messageElement.textContent = 'Er is een fout opgetreden bij het verbinden met de server.';
      messageElement.style.display = 'block';
      messageElement.style.color = 'red';
      console.error(error);
    }

    loginForm.reset();
  });

  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });
}
