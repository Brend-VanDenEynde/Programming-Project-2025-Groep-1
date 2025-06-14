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
      <button id="btn-login" class="btn" data-route="/login">Login</button>    </div>      <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
  `; // Event listeners voor buttons (als fallback of voor speciale handling)
  const btnReg = document.getElementById('btn-register');
  const btnLog = document.getElementById('btn-login');

  btnReg.addEventListener('click', () => {
    Router.navigate('/registreer');
  });
  btnLog.addEventListener('click', () => {
    Router.navigate('/login');
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
      // Use absolute path to ensure correct navigation regardless of current path
      Router.navigate('/contact');
    });
  });
}
