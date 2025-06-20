import { renderStudentRegister } from './student-register.js';
import { renderBedrijfRegister } from './bedrijf-register.js';
import Router from '../router.js';
import { renderLogin } from './login.js';
import hideIcon from '../icons/hide.png';
import eyeIcon from '../icons/eye.png';

export let previousData = null;

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
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="Email"
              class="register-input full-width"
            >
          </div>
            <div class="form-group">
            <label for="passwordInput">Wachtwoord</label>
            <div style="position:relative;display:flex;align-items:center;">
              <input type="password" id="passwordInput" name="password" required placeholder="Wachtwoord" style="flex:1;">
              <button type="button" id="togglePassword" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;" tabindex="-1">
                <img id="togglePasswordIcon" src="${hideIcon}" alt="Toon wachtwoord" style="height:22px;width:22px;vertical-align:middle;" tabindex="-1" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPasswordInput">Bevestig wachtwoord</label>
            <div style="position:relative;display:flex;align-items:center;">
              <input type="password" id="confirmPasswordInput" name="confirmPassword" required placeholder="Bevestig wachtwoord" style="flex:1;">
              <button type="button" id="toggleConfirmPassword" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;" tabindex="-1">
                <img id="toggleConfirmPasswordIcon" src="${hideIcon}" alt="Toon wachtwoord" style="height:22px;width:22px;vertical-align:middle;" tabindex="-1" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" id="student" name="rol" value="student" required>
              <span class="radio-checkmark"></span>
              Student
            </label>
            <label class="radio-option">
              <input type="radio" id="bedrijf" name="rol" value="bedrijf" required>
              <span class="radio-checkmark"></span>
              Bedrijf
            </label>
          </div>
          
          <label id="error-message" class="error-label" style="color: red; display: none;" aria-live="polite"></label>

          <button type="submit" class="register-btn">Registreer</button>
        </form>
        
        <div class="divider">
          <hr>
        </div>
        
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
    Router.goBack('/');
  });

  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.addEventListener('click', () => {
      Router.navigate('/login');
    });
  }
  
  // FOOTER LINKS (verwijder dubbele listeners, alleen deze behouden)
  const privacyLink = document.getElementById('privacy-policy');
  if (privacyLink) {
    privacyLink.setAttribute('href', '#');
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/privacy');
    });
  }
  const contactLink = document.getElementById('contacteer-ons');
  if (contactLink) {
    contactLink.setAttribute('href', '#');
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/contact');
    });
  }

  // Zet altijd light mode bij laden van register
  localStorage.setItem('darkmode', 'false');
  document.body.classList.remove('darkmode');

  // Password toggle functionaliteit
  function setupPasswordToggle(inputId, toggleButtonId, iconId) {
    const input = document.getElementById(inputId);
    const toggleButton = document.getElementById(toggleButtonId);
    const icon = document.getElementById(iconId);

    if (input && toggleButton && icon) {
      toggleButton.addEventListener('click', () => {
        const isVisible = input.type === 'text';
        input.type = isVisible ? 'password' : 'text';
        icon.src = isVisible ? hideIcon : eyeIcon;
        icon.alt = isVisible ? 'Toon wachtwoord' : 'Verberg wachtwoord';
      });
    }
  }

  setupPasswordToggle('passwordInput', 'togglePassword', 'togglePasswordIcon');
  setupPasswordToggle('confirmPasswordInput', 'toggleConfirmPassword', 'toggleConfirmPasswordIcon');
}

// Nieuwe handleRegister functie met JSON-structurering en API-call
function handleRegister(event) {
  event.preventDefault();

  const errorMessageLabel = document.getElementById('error-message');
  errorMessageLabel.style.display = 'none'; // Reset error message visibility

  const formData = new FormData(event.target);
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validatie
  if (formData.get('password') !== formData.get('confirmPassword')) {
    errorMessageLabel.textContent = 'Wachtwoorden komen niet overeen!';
    errorMessageLabel.style.display = 'block';
    return;
  }
  if (formData.get('password').length < 8) {
    errorMessageLabel.textContent =
      'Wachtwoord moet minimaal 8 karakters bevatten!';
    errorMessageLabel.style.display = 'block';
    return;
  }

  previousData = data;

  // Data naar server sturen (voorbeeld)
  if (formData.get('rol') === 'student') {
    renderStudentRegister(document.getElementById('app'), data);
  } else if (formData.get('rol') === 'bedrijf') {
    renderBedrijfRegister(document.getElementById('app'), data);
  } else {
    renderLogin(document.getElementById('app'));
  }
}
