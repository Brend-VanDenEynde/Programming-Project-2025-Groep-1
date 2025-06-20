import Router from '../router.js';

// Defineer icon paths
const hideIcon = 'src/icons/hide.png';

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
          
          <div class="form-group">
            <label for="passwordInput">Wachtwoord</label>
            <div style="position:relative;display:flex;align-items:center;">
              <input type="password" id="passwordInput" name="password" required placeholder="Wachtwoord" style="flex:1;">
              <button type="button" id="togglePassword" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;">
                <img id="togglePasswordIcon" src="${hideIcon}" alt="Toon wachtwoord" style="height:22px;width:22px;vertical-align:middle;" />
              </button>
            </div>
          </div>          <button type="submit" class="login-btn">Login</button>
        </form>
        <div id="error-message" class="error-message" style="display: none;"></div>
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
  // 1) Event listener voor het login-formulier
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => handleLogin(e, rootElement));
  // Hide error message when user starts typing
  const emailInput = document.getElementById('email');
  const passwordField = document.getElementById('passwordInput');
  
  if (emailInput) {
    emailInput.addEventListener('input', hideErrorMessage);
  }
  if (passwordField) {
    passwordField.addEventListener('input', hideErrorMessage);
  }

  // 2) Event listener voor de "Registreren"-link
  const registerLink = document.getElementById('register-link');
  registerLink.addEventListener('click', () => {
    Router.navigate('/registreer');
  });

  // Back button
  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    Router.navigate('/');
  });
  // LinkedIn button
  const linkedinButton = document.getElementById('linkedin-btn');
  linkedinButton.addEventListener('click', () => {
    // LinkedIn integratie nog niet geïmplementeerd
  });

  // Password toggle functionaliteit
  const passwordInput = document.getElementById('passwordInput');
  const togglePassword = document.getElementById('togglePassword');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  if (passwordInput && togglePassword && togglePasswordIcon) {
    togglePassword.addEventListener('click', () => {
      const isVisible = passwordInput.type === 'text';
      passwordInput.type = isVisible ? 'password' : 'text';
      togglePasswordIcon.src = isVisible
        ? 'src/Icons/hide.png'
        : 'src/Icons/eye.png';
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

// Functie om error messages te tonen
function showErrorMessage(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

// Functie om error messages te verbergen
function hideErrorMessage() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

async function handleLogin(event, rootElement) {
  event.preventDefault();

  // Verberg eventuele vorige error messages
  hideErrorMessage();

  const formData = new FormData(event.target);
  const email = formData.get('email').trim();
  const password = formData.get('password');
  if (!email || !password) {
    showErrorMessage('Vul zowel e-mailadres als wachtwoord in.');
    return;
  }
  if (password.length < 8) {
    showErrorMessage('Wachtwoord moet minimaal 8 karakters bevatten!');
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
      showErrorMessage('Geen gebruikersinformatie ontvangen. Neem contact op met support.');
      throw new Error('Authentication failed: No user info');
    }

    if (user.type === 2) {
      window.sessionStorage.setItem('userType', 'student');
      Router.navigate('/Student/Student-Profiel');
    } else if (user.type === 3) { // bedrijf
      // Controleer of het bedrijf goedgekeurd is
      if (user.approved === false || user.approved === 0 || user.status === 'pending') {
        showErrorMessage('Uw bedrijfsaccount is nog niet goedgekeurd. Neem contact op met support voor meer informatie.');
        // Zorg ervoor dat de gebruiker uitgelogd blijft
        window.sessionStorage.removeItem('authToken');
        return;
      }
      
      const companyData = {
        type: user.type,
        gebruiker_id: user?.gebruiker_id || user?.id || null,
        naam: user?.naam || user?.companyName || '',
        plaats: user?.plaats || user?.location || '',
        contact_email: user?.contact_email || user?.email || '',
        linkedin: user?.linkedin || '',
        profiel_foto: user?.profiel_foto || user?.profilePictureUrl || '/src/Images/default-company.jpg',
      };
      window.sessionStorage.setItem('companyData', JSON.stringify(companyData));
      window.sessionStorage.setItem('userType', 'company');
      Router.navigate('/bedrijf/bedrijf-profiel');    } else if (user.type === 1) {
      window.sessionStorage.setItem('adminData', JSON.stringify(user));
      window.sessionStorage.setItem('userType', 'admin');
      Router.navigate('/admin-dashboard');
    } else {
      showErrorMessage('Onbekend of niet ondersteund gebruikerstype.');
    }
  } catch (error) {
    console.error('Login error:', error);
    window.sessionStorage.removeItem('authToken');
    window.sessionStorage.removeItem('studentData');
    window.sessionStorage.removeItem('companyData');
    window.sessionStorage.removeItem('userType');    // Specifieke error handling gebaseerd op API response
    const errorMessage = error.message.toLowerCase();
    
    console.log('Full error message:', error.message); // Debug log
    
    if (errorMessage.includes('invalid credentials')) {
      // Check if the email looks like a company email to provide better guidance
      const emailInput = document.getElementById('email').value;
      if (emailInput && !emailInput.includes('@student.') && !emailInput.includes('@ehb.be')) {
        showErrorMessage('Onjuiste inloggegevens. Als u een bedrijfsaccount heeft, controleer dan of uw account is goedgekeurd door de administrator.');
      } else {
        showErrorMessage('Onjuiste e-mailadres of wachtwoord. Probeer het opnieuw.');
      }
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      // Voor 401 errors, check of het mogelijk een niet-goedgekeurd bedrijfsaccount is
      const emailInput = document.getElementById('email').value;
      if (emailInput && !emailInput.includes('@student.') && !emailInput.includes('@ehb.be')) {
        showErrorMessage('Uw bedrijfsaccount is mogelijk nog niet goedgekeurd. Neem contact op met support voor meer informatie.');
      } else {
        showErrorMessage('Onjuiste e-mailadres of wachtwoord. Probeer het opnieuw.');
      }
    } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      showErrorMessage('Uw account heeft geen toegang. Neem contact op met support.');
    } else if (errorMessage.includes('404')) {
      showErrorMessage('Account niet gevonden. Controleer uw e-mailadres of registreer eerst.');
    } else if (errorMessage.includes('429')) {
      showErrorMessage('Te veel inlogpogingen. Probeer het later opnieuw.');
    } else if (errorMessage.includes('500')) {
      showErrorMessage('Serverfout. Probeer het later opnieuw of neem contact op met support.');
    } else {
      showErrorMessage('Inloggen mislukt. Controleer uw e-mailadres en wachtwoord. Als u een bedrijfsaccount heeft, kan het zijn dat uw account nog niet is goedgekeurd.');
    }
  }
}
