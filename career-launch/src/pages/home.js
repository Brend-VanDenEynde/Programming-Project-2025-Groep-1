import Router from '../router.js';

export function renderHome(rootElement) {
  rootElement.innerHTML = `
    <div class="home-container">
      <img 
        src="/src/Images/EhB-logo-transparant.png" 
        alt="Erasmus Hogeschool Brussels Logo" 
      />

     
      <h2>CAREER LAUNCH 2025</h2>

      <p>Geïnteresseerd?</p>
      <button id="btn-register" class="btn" data-route="/registreer">Registreer je nu!</button>      <p>Al ingeschreven?</p>
      <button id="btn-login" class="btn" data-route="/login">Login</button>
    </div><div class="footer-links">
      <a href="#/privacy" data-route="/privacy">Privacy Policy</a>
      <a href="#/contact" data-route="/contact">Contacteer Ons</a>
      <a href="#/admin" data-route="/admin">Admin</a>
    </div>
  `; // Event listeners voor buttons (als fallback of voor speciale handling)
  const btnReg = document.getElementById('btn-register');
  const btnLog = document.getElementById('btn-login');

  btnReg.addEventListener('click', () => {
    Router.navigate('/registreer');
  });

  btnLog.addEventListener('click', () => {
    Router.navigate('/login');
  });
  // Event listeners voor footer links om zeker te zijn dat ze werken
  document.querySelectorAll('.footer-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route =
        link.getAttribute('data-route') || link.getAttribute('href');
      console.log('Footer link clicked:', route);

      // Force navigate via Router voor betere controle
      if (route === '/contact') {
        console.log('Navigating to contact page...');
        Router.navigate('/contact');
      } else {
        Router.navigate(route);
      }
    });
  });
}
