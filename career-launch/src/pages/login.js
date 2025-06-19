import Router from '../router.js';
import { fetchAndStoreStudentProfile } from './student/student-profiel.js';
import hideIcon from '../icons/hide.png';
import eyeIcon from '../icons/eye.png';
import { authenticatedFetch } from '../utils/auth-api.js';

// Zet altijd light mode bij laden van login
localStorage.setItem('darkmode', 'false');
document.body.classList.remove('darkmode');

export function renderLogin(rootElement) {
  rootElement.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <button class="back-button" id="back-button" data-route="/">← Terug</button>
          <h1>Inloggen</h1>
          <p>Log je in met je school-email</p>
        </div>
        <form id="loginForm">
        <div class="form-group">
          <label for="email">E-mailadres</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="Email"
            class="login-input"
          >
        </div>
          <div class="form-group">
            <label for="passwordInput">Wachtwoord</label>
            <div style="position:relative;display:flex;align-items:center;">
              <input type="password" id="passwordInput" name="password" required placeholder="Wachtwoord" style="flex:1;">
              <button type="button" id="togglePassword" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;">
                <img id="togglePasswordIcon" src="${hideIcon}" alt="Toon wachtwoord" style="height:22px;width:22px;vertical-align:middle;" />
              </button>
            </div>
          </div>
          <button type="submit" class="login-btn">Login</button>        </form>
        <div class="register-link">
          <p>Heb je nog geen account? 
            <a id="register-link" data-route="/registreer" style="cursor:pointer;">Registreren</a>
          </p>
        </div>
      </div>
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;
  document
    .getElementById('loginForm')
    .addEventListener('submit', (e) => handleLogin(e, rootElement));
  document
    .getElementById('register-link')
    .addEventListener('click', () => Router.navigate('/registreer'));
  document
    .getElementById('back-button')
    .addEventListener('click', () => Router.navigate('/'));

  // Footer links: gebruik alleen Router.navigate, geen hash of import
  const privacyLink = document.querySelector('a[href="/privacy"]');
  if (privacyLink) {
    privacyLink.setAttribute('href', '#');
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/privacy');
    });
  }
  const contactLink = document.querySelector('a[href="/contact"]');
  if (contactLink) {
    contactLink.setAttribute('href', '#');
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/contact');
    });
  }

  const passwordInput = document.getElementById('passwordInput');
  const togglePassword = document.getElementById('togglePassword');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  if (passwordInput && togglePassword && togglePasswordIcon) {
    togglePassword.addEventListener('click', () => {
      const isVisible = passwordInput.type === 'text';
      passwordInput.type = isVisible ? 'password' : 'text';
      togglePasswordIcon.src = isVisible ? `${hideIcon}` : `${eyeIcon}`;
      togglePasswordIcon.alt = isVisible
        ? 'Toon wachtwoord'
        : 'Verberg wachtwoord';
    });
  }
}

async function loginUser(email, password) {
  const apiUrl = 'https://api.ehb-match.me/auth/login';
  const loginData = { email, password };

  const response = await authenticatedFetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData),
    credentials: 'include', // Include cookies in the request (for refresh token)
  });

  const data = await response.json();
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    if (data.message) errorMessage += ` - ${data.message}`;
    else if (data.error) errorMessage += ` - ${data.error}`;
    throw new Error(errorMessage);
  }
  return data;
}

async function fetchUserInfo(token) {
  const infoUrl = 'https://api.ehb-match.me/auth/info';
  const response = await authenticatedFetch(infoUrl, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
    },
  });
  const user = await response.json();
  if (!response.ok) throw new Error('Ophalen gebruikersinfo mislukt');
  return user;
}

async function handleLogin(event, rootElement) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email').trim();
  const password = formData.get('password');

  if (!email || !password) {
    alert('Vul zowel e-mailadres als wachtwoord in.');
    return;
  }
  if (password.length < 8) {
    alert('Wachtwoord moet minimaal 8 karakters bevatten!');
    return;
  }
  try {
    const loginRes = await loginUser(email, password);
    if (!loginRes.accessToken) throw new Error('Geen accessToken ontvangen');
    window.sessionStorage.setItem('authToken', loginRes.accessToken);

    const infoRes = await fetchUserInfo(loginRes.accessToken);
    const user = infoRes.user;

    // Debug: log de volledige user-object
    console.log('USER OBJECT:', user);

    if (!user || !user.type) {
      alert(
        'Geen gebruikersinformatie ontvangen. Neem contact op met support.'
      );
      throw new Error('Authentication failed: No user info');
    }

    if (user.type === 2) {
      window.sessionStorage.setItem('userType', 'student');

      await fetchAndStoreStudentProfile();
      Router.navigate('/student/student-profiel');
    } else if (user.type === 3) {
      // Controleer of id aanwezig is en geldig is
      if (!user.id || typeof user.id !== 'number') {
        console.error('Ongeldig of ontbrekend id in companyData:', user);
        alert('Fout: Ongeldig of ontbrekend id in de bedrijfsgegevens.');
        return;
      }
      window.sessionStorage.setItem('companyData', JSON.stringify(user));
      window.sessionStorage.setItem('userType', 'company');
      Router.navigate('/bedrijf/bedrijf-profiel');
    } else if (user.type === 1) {
      window.sessionStorage.setItem('adminData', JSON.stringify(user));
      window.sessionStorage.setItem('userType', 'admin');
      Router.navigate('/admin-dashboard');
    } else {
      alert('Onbekend of niet ondersteund gebruikerstype.');
    }
  } catch (error) {
    console.error('Login error:', error);
    window.sessionStorage.removeItem('authToken');
    window.sessionStorage.removeItem('studentData');
    window.sessionStorage.removeItem('companyData');
    window.sessionStorage.removeItem('userType');

    alert('Inloggen mislukt. Controleer uw e-mailadres en wachtwoord.\nIndien u een bedrijfsaccount heeft, kan het zijn dat uw account nog niet is goedgekeurd. Neem contact op met support als het probleem aanhoudt.');
  }
}
