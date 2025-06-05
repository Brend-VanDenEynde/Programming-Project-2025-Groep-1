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
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Sign in with LinkedIn
        </button>
          <div class="footer-links">
          <a href="/privacy" data-route="/privacy">Privacy Policy</a>
          <a href="/contact" data-route="/contact">Contacteer Ons</a>
        </div>
        
        <div class="register-link">
          <p>Heb je nog geen account? 
            <a id="register-link" data-route="/registreer" style="cursor:pointer;">Registreren</a>
          </p>
        </div>
      </div>
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
    alert('LinkedIn integratie nog niet geïmplementeerd');
  });

  // Footer links
  const privacyLink = document.getElementById('privacy-link');
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Privacy Policy pagina nog niet geïmplementeerd');
  });

  const contactLink = document.getElementById('contact-link');
  contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Contact pagina nog niet geïmplementeerd');
  });
}

function handleLogin(event, rootElement) {
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

  // TODO: stuur credentials naar je backend
  console.log('Inlogdata:', { email, password });
  alert(`Welkom terug, ${email}!`);

  
  /* Student data terugsteken

  // Simuleer studentData na succesvolle login
  const studentData = {
    firstName: 'Jan',
    lastName: 'Jansen',
    email: email,
    studyProgram: 'Webontwikkeling',
    year: '2e Bachelor',
    profilePictureUrl: '/src/Images/default.jpg',
  };

  // Ga naar student-profiel via router
  Router.navigate('/Student/Student-Profiel');

  */

  // Simuleer bedrijfData na succesvolle login
const bedrijfData = {
  companyName: 'Microsoft',
  email: email,
  description: 'Wij zijn een technologiebedrijf dat innovatieve oplossingen biedt.',
  linkedIn: 'https://www.linkedin.com/company/microsoft',
  profilePictureUrl: '/src/Images/default.jpg',
};

// Sla bedrijfData eventueel tijdelijk op (bijv. in geheugen, lokale opslag of context)
window.sessionStorage.setItem('bedrijfData', JSON.stringify(bedrijfData));

// Navigeer naar bedrijf-profiel via router
Router.navigate('/Bedrijf/Bedrijf-Profiel');

}
// renderBedrijfProfiel(rootElement, bedrijfData);