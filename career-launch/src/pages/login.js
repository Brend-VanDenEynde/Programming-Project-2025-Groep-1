import Router from '../router.js';
import { fetchAndStoreStudentProfile } from './student/student-profiel.js';

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
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="Email"
            class="login-input"
          >
          <div class="form-group">
            <label for="passwordInput">Wachtwoord</label>
            <div style="position:relative;display:flex;align-items:center;">
              <input type="password" id="passwordInput" name="password" required placeholder="Wachtwoord" style="flex:1;">
              <button type="button" id="togglePassword" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;">
                <img id="togglePasswordIcon" src="src/Icons/hide.png" alt="Toon wachtwoord" style="height:22px;width:22px;vertical-align:middle;" />
              </button>
            </div>
          </div>
          <button type="submit" class="login-btn">Login</button>
        </form>
        <div class="divider">
          <hr>
        </div>
        <button class="linkedin-btn" id="linkedin-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Sign in with LinkedIn
        </button>
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

  document.getElementById('loginForm').addEventListener('submit', (e) => handleLogin(e, rootElement));
  document.getElementById('register-link').addEventListener('click', () => Router.navigate('/registreer'));
  document.getElementById('back-button').addEventListener('click', () => Router.goBack('/'));
  document.getElementById('linkedin-btn').addEventListener('click', () => {});
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });

  const passwordInput = document.getElementById('passwordInput');
  const togglePassword = document.getElementById('togglePassword');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  if (passwordInput && togglePassword && togglePasswordIcon) {
    togglePassword.addEventListener('click', () => {
      const isVisible = passwordInput.type === 'text';
      passwordInput.type = isVisible ? 'password' : 'text';
      togglePasswordIcon.src = isVisible ? 'src/Icons/hide.png' : 'src/Icons/eye.png';
      togglePasswordIcon.alt = isVisible ? 'Toon wachtwoord' : 'Verberg wachtwoord';
    });
  }
}

async function loginUser(email, password) {
  const apiUrl = 'https://api.ehb-match.me/auth/login';
  const loginData = { email, password };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData),
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
  const response = await fetch(infoUrl, {
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

    if (!user || !user.type) {
      alert('Geen gebruikersinformatie ontvangen. Neem contact op met support.');
      throw new Error('Authentication failed: No user info');
    }

    if (user.type === 2) {
      window.sessionStorage.setItem('userType', 'student');
      await fetchAndStoreStudentProfile();
      Router.navigate('/student/student-profiel');
    } else if (user.type === 3) {
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
    alert('Inloggen mislukt. Controleer je e-mailadres en wachtwoord.');
  }
}
