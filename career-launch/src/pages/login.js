import Router from '../router.js';

// Zet altijd light mode bij laden van login
localStorage.setItem('darkmode', 'false');
document.body.classList.remove('darkmode');

export function renderLogin(rootElement) {
  // Verwijder de automatische skip naar student-profiel
  // Router.navigate('/Student/Student-Profiel');
  // return;

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
              <input type="password" id="passwordInput" name="password" required style="flex:1;">
              <button type="button" id="togglePassword" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;">
                <img id="togglePasswordIcon" src="src/Icons/icons8-closed-eye-HIDDEN.png" alt="Toon wachtwoord" style="height:22px;width:22px;vertical-align:middle;" />
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
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>          </svg>
          Sign in with LinkedIn
        </button>
        
        <div class="register-link">
          <p>Heb je nog geen account? 
            <a id="register-link" data-route="/registreer" style="cursor:pointer;">Registreren</a>
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

  // 1) Event listener voor het login-formulier
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => handleLogin(e, rootElement));

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
        ? 'src/Icons/icons8-closed-eye-HIDDEN.png'
        : 'src/Icons/icons8-closed-eye-CLEAR.png';
      togglePasswordIcon.alt = isVisible
        ? 'Toon wachtwoord'
        : 'Verberg wachtwoord';
    });
  }

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

async function loginUser(email, password) {
  const apiUrl = 'https://api.ehb-match.me/auth/login';
  const loginData = { email, password };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in the request
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      // Probeer de error response te lezen voor meer details
      let errorMessage = `HTTP error! Status: ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = `${errorMessage} - ${errorData.message}`;
        } else if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error}`;
        }
      } catch (jsonError) {
        // Als we de response niet kunnen parsen als JSON, gebruik de status code
        console.warn('Could not parse error response as JSON:', jsonError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API call successful:', data);
    return data;
  } catch (error) {
    // Als het een fetch error is (netwerkproblemen), geef dit duidelijk aan
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to server');
    }

    // Re-throw de error zodat deze opgevangen kan worden door handleLogin
    throw error;
  }
}

async function handleLogin(event, rootElement) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = formData.get('email').trim();
  const password = formData.get('password');

  // Simpele validatie
  if (!email || !password) {
    alert('Vul zowel e-mailadres als wachtwoord in.');
    return;
  }
  if (password.length < 8) {
    alert('Wachtwoord moet minimaal 8 karakters bevatten!');
    return;
  }
  try {
    // Call the API to authenticate the user
    const response = await loginUser(email, password);

    // Store authentication token
    if (response.accessToken) {
      window.sessionStorage.setItem('authToken', response.accessToken);
    }

    // Debug: Log the response to see what we're getting
    // console.log('Login response structure:', response); // Disabled to prevent sensitive information leakage in production
    if (!response.message || response.message !== 'Login successful') {
      throw new Error('Invalid login response');
    }

    // TEMPORARY: Since backend doesn't provide userType yet, we'll use email domain logic
    // TODO: Remove this when backend adds userType to response
    let userType = response.userType;

    if (!userType) {
      // Determine user type based on email domain (temporary solution)
      if (email.includes('@student.ehb.be') || email.includes('@ehb.be')) {
        userType = 'student';
      } else {
        userType = 'company';
      }
      console.warn(
        'userType not provided by API, using email-based detection:',
        userType
      );
    }

    // Handle successful login based on user type
    if (userType === 'student') {
      // Mapping API response to student profile fields
      const studentData = {
        id: response.user?.id || null,
        firstName:
          response.user?.firstName || response.user?.voornaam || 'Voornaam',
        lastName:
          response.user?.lastName || response.user?.achternaam || 'Achternaam',
        email: response.user?.email || email,
        studyProgram:
          response.user?.studyProgram || response.user?.opleiding_naam || '', // if available
        year: response.user?.year || response.user?.studiejaar || '',
        profilePictureUrl:
          response.user?.profilePictureUrl ||
          response.user?.profiel_foto ||
          '/src/Images/default.jpg',
        linkedIn:
          response.user?.linkedIn ||
          response.user?.linkedin ||
          'https://www.linkedin.com/',
        birthDate:
          response.user?.birthDate || response.user?.date_of_birth || '',
        opleiding_id: response.user?.opleiding_id || null,
      };

      window.sessionStorage.setItem('studentData', JSON.stringify(studentData));
      window.sessionStorage.setItem('userType', 'student');
      Router.navigate('/Student/Student-Profiel');
    } else if (userType === 'company') {
      // Handle company login with API data
      const companyData = {
        id: response.user?.id || null,
        companyName: response.user?.companyName || 'Bedrijf',
        email: response.user?.email || email,
        description: response.user?.description || '',
        linkedIn: response.user?.linkedIn || 'https://www.linkedin.com/',
        profilePictureUrl:
          response.user?.profilePictureUrl || '/src/Images/default-company.jpg',
      };

      // Store company data
      window.sessionStorage.setItem('companyData', JSON.stringify(companyData));
      window.sessionStorage.setItem('userType', 'company'); // Navigate to company profile
      Router.navigate('/Bedrijf/Bedrijf-Profiel');
    } else {
      // This should never happen with our email-based logic
      console.error('Onbekend gebruikerstype:', userType);
      throw new Error('Authentication failed: Unknown user type');
    }
  } catch (error) {
    console.error('Login error:', error);

    // Clear any stored authentication data on error
    window.sessionStorage.removeItem('authToken');
    window.sessionStorage.removeItem('studentData');
    window.sessionStorage.removeItem('companyData');
    window.sessionStorage.removeItem('userType');

    // User-friendly error messages based on HTTP status codes and error types
    if (
      error.message.includes('401') ||
      error.message.includes('HTTP error! Status: 401')
    ) {
      alert('Ongeldig e-mailadres of wachtwoord.');
    } else if (
      error.message.includes('400') ||
      error.message.includes('HTTP error! Status: 400')
    ) {
      alert(
        'Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.'
      );
    } else if (
      error.message.includes('403') ||
      error.message.includes('HTTP error! Status: 403')
    ) {
      alert('Je account is niet geactiveerd of geblokkeerd.');
    } else if (
      error.message.includes('404') ||
      error.message.includes('HTTP error! Status: 404')
    ) {
      alert('De dienst is momenteel niet beschikbaar.');
    } else if (
      error.message.includes('500') ||
      error.message.includes('HTTP error! Status: 500')
    ) {
      alert('Er is een serverfout opgetreden. Probeer het later opnieuw.');
    } else if (error.message.includes('Authentication failed')) {
      alert('Authenticatie mislukt. Controleer je inloggegevens.');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert(
        'Kan geen verbinding maken met de server. Controleer je internetverbinding.'
      );
    } else {
      // Voor alle andere fouten, geef een specifiekere boodschap
      alert('Inloggen mislukt. Controleer je e-mailadres en wachtwoord.');
    }
  }
}
// renderBedrijfProfiel(rootElement, bedrijfData);
