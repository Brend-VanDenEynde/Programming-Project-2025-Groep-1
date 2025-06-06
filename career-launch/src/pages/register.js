import { renderLogin } from './login.js';
import Router from '../router.js';
import {
  createUserRegistrationJSON,
  sendRegistrationToAPI,
  validateRegistrationData,
  mockRegistrationAPI,
} from '../utils/registration-api.js';

export function renderRegister(rootElement) {
  rootElement.innerHTML = `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <button class="back-button" id="back-button" data-route="/">← Terug</button>
          <h1>Registreren</h1>
          <p>Vermeld je school-email en een wachtwoord voor je account</p>
        </div>
        
        <form id="registerForm">
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="Email"
            class="register-input full-width"
          >
          
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            placeholder="Wachtwoord"
            minlength="8"
            class="register-input full-width"
          >
          
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            required 
            placeholder="Bevestig wachtwoord"
            minlength="8"
            class="register-input full-width"
          >

          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" id="student" name="rol" value="student" required>
              <span class="radio-checkmark"></span>
              Student
            </label>
            <label class="radio-option">
              <input type="radio" id="bedrijf" name="rol" value="bedrijf">
              <span class="radio-checkmark"></span>
              Bedrijf
            </label>
          </div>
          
          <button type="submit" class="register-btn">Registreer</button>
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
          <div class="login-link">
          <p>Heb je al een account? 
            <a id="login-link" data-route="/login" style="cursor:pointer;">Inloggen</a>
          </p>
        </div>
      </div>
        <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  const form = document.getElementById('registerForm');
  form.addEventListener('submit', handleRegister);

  document.getElementById('back-button').addEventListener('click', () => {
    Router.navigate('/');
  });

  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.addEventListener('click', () => {
      Router.navigate('/login');
    });
  }
  // LinkedIn button
  const linkedinButton = document.getElementById('linkedin-btn');
  linkedinButton.addEventListener('click', () => {
    // LinkedIn integratie nog niet geïmplementeerd
  });

  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}

// Nieuwe handleRegister functie met JSON-structurering en API-call
function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    rol: formData.get('rol'),
  };

  // Validatie
  if (data.password !== data.confirmPassword) {
    alert('Wachtwoorden komen niet overeen!');
    return;
  }
  if (data.password.length < 8) {
    alert('Wachtwoord moet minimaal 8 karakters bevatten!');
    return;
  }
  if (!data.rol) {
    alert('Selecteer “Student” of “Bedrijf”!');
    return;
  }
  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);

  // Redirect naar login (of andere actie)
  renderLogin(document.getElementById('app'));
}
