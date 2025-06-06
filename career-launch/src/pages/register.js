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
          <div class="form-row">
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              required 
              placeholder="Voornaam"
              class="register-input"
            >
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              required 
              placeholder="Achternaam"
              class="register-input"
            >
          </div>
          
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
  // Event listeners
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', handleRegister);

  // Back button
  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    Router.navigate('/');
  });

  // Login link
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
  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    rol: formData.get('rol'),
  };

  // Uitgebreide validatie
  const validation = validateRegistrationData(rawData);
  if (!validation.isValid) {
    showErrorMessage(validation.errors.join(', '));
    return;
  }
  // Maak gestructureerd JSON-object klaar voor API
  const userRegistrationData = createUserRegistrationJSON(rawData);

  // Log het JSON-object voor debugging
  console.log('=== GESTRUCTUREERD JSON-OBJECT VOOR API ===');
  console.log(JSON.stringify(userRegistrationData, null, 2));
  console.log('=== EINDE JSON-OBJECT ===');

  // Toon het JSON ook visueel in een modal voor eenvoudige inspectie
  showJSONPreview(userRegistrationData);

  // Voorlopig niet doorgan naar API call - wacht op bevestiging
  console.log(
    '⚠️  API-call wordt NIET uitgevoerd - JSON is gelogd voor inspectie'
  );
  showInfoMessage(
    'JSON-object is gegenereerd en gelogd in de console. Open Developer Tools (F12) om het te bekijken.'
  );

  // Uncomment de volgende regel om de API-call uit te voeren:
  // performRegistration(userRegistrationData);
}

/**
 * Voert de registratie uit met de backend API
 * @param {Object} userData - Het gestructureerde JSON-object
 */
async function performRegistration(userData) {
  try {
    // Toon loading indicator
    showLoadingState(true);

    // Gebruik mockAPI voor development, echte API voor productie
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    let result;
    if (isDevelopment) {
      // Gebruik mock API voor testing
      console.log('Development modus: gebruik mock API');
      result = await mockRegistrationAPI(userData);
    } else {
      // Gebruik echte API
      result = await sendRegistrationToAPI(userData);
    }

    // Verberg loading indicator
    showLoadingState(false);

    if (result.success) {
      console.log('Registratie succesvol:', result);

      // Toon successmelding
      showSuccessMessage(
        result.message ||
          'Registratie succesvol! Je ontvangt een bevestigingsmail.'
      );

      // Redirect naar login pagina na korte delay
      setTimeout(() => {
        Router.navigate('/login');
      }, 2500);
    }
  } catch (error) {
    showLoadingState(false);
    console.error('Registratie gefaald:', error);
    showErrorMessage(
      error.message || 'Er is een fout opgetreden tijdens de registratie.'
    );
  }
}

/**
 * Toont/verbergt loading state
 * @param {boolean} isLoading
 */
function showLoadingState(isLoading) {
  const submitButton = document.querySelector('.register-btn');
  if (submitButton) {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Registreren...';
      submitButton.style.opacity = '0.7';
      submitButton.style.cursor = 'not-allowed';
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Registreer';
      submitButton.style.opacity = '1';
      submitButton.style.cursor = 'pointer';
    }
  }
}

/**
 * Toont een successmelding
 * @param {string} message
 */
function showSuccessMessage(message) {
  removeExistingMessages();

  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.style.cssText = `
    background-color: #d4edda;
    color: #155724;
    padding: 12px 16px;
    border: 1px solid #c3e6cb;
    border-radius: 6px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  messageDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span style="font-size: 16px;">✅</span>
      <span>${message}</span>
    </div>
  `;

  const form = document.getElementById('registerForm');
  form.parentNode.insertBefore(messageDiv, form);

  // Auto-remove na 5 seconden
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

/**
 * Toont een errormelding
 * @param {string} message
 */
function showErrorMessage(message) {
  removeExistingMessages();

  const messageDiv = document.createElement('div');
  messageDiv.className = 'error-message';
  messageDiv.style.cssText = `
    background-color: #f8d7da;
    color: #721c24;
    padding: 12px 16px;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  messageDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span style="font-size: 16px;">❌</span>
      <span>${message}</span>
    </div>
  `;

  const form = document.getElementById('registerForm');
  form.parentNode.insertBefore(messageDiv, form);

  // Auto-remove na 8 seconden
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 8000);
}

/**
 * Toont het JSON-object in een visuele preview modal
 * @param {Object} jsonData
 */
function showJSONPreview(jsonData) {
  // Verwijder eventuele bestaande preview
  const existingPreview = document.querySelector('.json-preview-modal');
  if (existingPreview) {
    existingPreview.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'json-preview-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  `;

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
      <h3 style="margin: 0; color: #333;">📄 JSON Object Preview</h3>
      <button id="closeJsonPreview" style="
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
      ">Sluiten ✕</button>
    </div>
    
    <div style="margin-bottom: 15px;">
      <strong>Dit JSON-object wordt naar de backend API verzonden:</strong>
    </div>
    
    <pre style="
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      overflow-x: auto;
      white-space: pre-wrap;
      max-height: 400px;
      overflow-y: auto;
    ">${JSON.stringify(jsonData, null, 2)}</pre>
    
    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 4px; border-left: 4px solid #2196F3;">
      <strong>💡 Tip:</strong> Open Developer Tools (F12) → Console tab voor meer details en kopieerbare JSON.
    </div>
    
    <div style="margin-top: 15px; text-align: center;">
      <button id="continueRegistration" style="
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 16px;
        margin-right: 10px;
      ">✅ JSON is OK - Doorgaan met registratie</button>
      
      <button id="cancelRegistration" style="
        background: #757575;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 16px;
      ">❌ Annuleren</button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Event listeners voor knoppen
  document.getElementById('closeJsonPreview').onclick = () => modal.remove();
  document.getElementById('cancelRegistration').onclick = () => modal.remove();
  document.getElementById('continueRegistration').onclick = () => {
    modal.remove();
    // Nu pas de API-call uitvoeren
    performRegistration(jsonData);
  };

  // Sluit modal bij klikken buiten content
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
}

/**
 * Toont een info-melding (blauwe kleur)
 * @param {string} message
 */
function showInfoMessage(message) {
  removeExistingMessages();

  const messageDiv = document.createElement('div');
  messageDiv.className = 'info-message';
  messageDiv.style.cssText = `
    background-color: #d1ecf1;
    color: #0c5460;
    padding: 12px 16px;
    border: 1px solid #bee5eb;
    border-radius: 6px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  messageDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span style="font-size: 16px;">ℹ️</span>
      <span>${message}</span>
    </div>
  `;

  const form = document.getElementById('registerForm');
  form.parentNode.insertBefore(messageDiv, form);

  // Auto-remove na 10 seconden
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 10000);
}

/**
 * Verwijdert bestaande success/error/info meldingen
 */
function removeExistingMessages() {
  const existingMessages = document.querySelectorAll(
    '.success-message, .error-message, .info-message'
  );
  existingMessages.forEach((msg) => msg.remove());
}
