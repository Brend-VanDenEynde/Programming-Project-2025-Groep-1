import './student-register.css';

export function renderStudentRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button">← Terug</button>

      <div class="upload-section">
        <div class="upload-icon">⬆</div>
        <label>Foto</label>
      </div>

      <div class="form-fields">
        <div class="name-row">
          <input type="text" placeholder="Voornaam" class="input-half" />
          <input type="text" placeholder="Achternaam" class="input-half" />
        </div>
        <input type="url" placeholder="LinkedIn-link" class="input-full" />
      </div>

      <button class="next-button">Volgende →</button>
    </main>

    <footer class="footer">
      <a href="#">Privacy Policy</a> | <a href="#">Contacteer Ons</a>
    </footer>
  </div>
  `;

  const form = document.getElementById('registerForm');
  form.addEventListener('submit', handleRegister);

  document.getElementById('back-button').addEventListener('click', () => {
    Router.navigate('/');
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
