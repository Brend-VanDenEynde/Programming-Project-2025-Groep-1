import Router from '../router.js';

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
          
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            placeholder="Wachtwoord"
            minlength="8"
            class="login-input"
          >
          
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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API call successful:', data);
    return data;
  } catch (error) {
    // Re-throw the error so it can be caught by the calling function (handleLogin)
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

    // Handle successful login based on user type
    if (response.userType === 'student') {
      // Handle student login
      const studentData = {
        firstName: response.firstName || 'Student',
        lastName: response.lastName || 'User',
        email: email,
        studyProgram: response.studyProgram || 'Webontwikkeling',
        year: response.year || '2e Bachelor',
        profilePictureUrl:
          response.profilePictureUrl || '/src/Images/default.jpg',
      };

      // Store student data
      window.sessionStorage.setItem('studentData', JSON.stringify(studentData));
      window.sessionStorage.setItem('authToken', response.token);

      // Navigate to student profile
      Router.navigate('/Student/Student-Profiel');
    } else if (response.userType === 'company') {
      // Handle company login
      const bedrijfData = {
        companyName: response.companyName || 'Microsoft',
        email: email,
        description:
          response.description ||
          'Wij zijn een technologiebedrijf dat innovatieve oplossingen biedt.',
        linkedIn:
          response.linkedIn || 'https://www.linkedin.com/company/microsoft',
        profilePictureUrl:
          response.profilePictureUrl || '/src/Images/default.jpg',
      };

      // Store company data
      window.sessionStorage.setItem('bedrijfData', JSON.stringify(bedrijfData));
      window.sessionStorage.setItem('authToken', response.token);

      // Navigate to company profile
      Router.navigate('/Bedrijf/Bedrijf-Profiel');
    } else {
      alert('Onbekend gebruikerstype. Contacteer de administrator.');
    }
  } catch (error) {
    console.error('Login error:', error);

    // Handle different types of errors
    if (error.message.includes('401')) {
      alert('Ongeldige inloggegevens. Controleer je email en wachtwoord.');
    } else if (error.message.includes('403')) {
      alert(
        'Account niet geactiveerd of geblokkeerd. Contacteer de administrator.'
      );
    } else if (error.message.includes('404')) {
      alert('Login service niet beschikbaar. Probeer later opnieuw.');
    } else if (error.message.includes('500')) {
      alert('Server error. Probeer later opnieuw.');
    } else {
      alert(
        'Er is een fout opgetreden tijdens het inloggen. Controleer je internetverbinding en probeer opnieuw.'
      );
    }
  }
}
// renderBedrijfProfiel(rootElement, bedrijfData);
