import { renderStudentOpleiding } from './student-opleiding.js';
import './student-register.css';
import Router from '../router.js';

export function renderStudentRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button" id="back-button">← Terug</button>

      <div class="upload-section">
        <div class="upload-icon">⬆</div>
        <label for="profielFoto">Foto</label>
        <input type="file" id="profielFoto" name="profielFoto" accept="image/*" />
      </div>

      <form class="naamForm" id="naamForm">
        <div class="name-row">
          <input type="text" id="voornaam" name="voornaam" required placeholder="Voornaam" class="input-half" />
          <input type="text" id="achternaam" name="achternaam" required placeholder="Achternaam" class="input-half" />
        </div>
        <div class="form-spacing">
          <input type="date" id="geboortedatum" name="geboortedatum" required placeholder="Geboortedatum" class="input-full" />
        </div>        <div class="form-spacing">
          <input type="text" id="linkedin" name="linkedin" placeholder="LinkedIn-link" class="input-full" />
        </div>
        <label id="error-label" class="error-label" style="color: red; display: none;"></label>
        <button type="submit" class="next-button">Volgende →</button>
      </form>

      
    </main>

    <footer class="footer">
      <a href="#" id="privacy-link">Privacy Policy</a> | <a href="#" id="contact-link">Contacteer Ons</a>
    </footer>
  </div>
  `;

  const form = document.getElementById('naamForm');
  form.addEventListener('submit', handleNaamRegister);

  document.getElementById('back-button').addEventListener('click', () => {
    Router.navigate('/registreer');
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

function handleNaamRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const currentData = {
    voornaam: formData.get('voornaam'),
    achternaam: formData.get('achternaam'),
    linkedin: formData.get('linkedin'),
    profielFoto: formData.get('profielFoto')
      ? formData.get('profielFoto').name
      : null, // Get uploaded file name
  };

  const errorLabel = document.getElementById('error-label');
  errorLabel.style.display = 'none';

  if (!currentData.voornaam || !currentData.achternaam) {
    errorLabel.textContent = 'Voornaam en achternaam zijn verplicht.';
    errorLabel.style.display = 'block';
    return;
  }

  const previousData = JSON.parse(localStorage.getItem('userData')) || {};

  const mergedData = { ...previousData, ...currentData };

  // Store merged data in localStorage
  localStorage.setItem('userData', JSON.stringify(mergedData));

  renderStudentOpleiding(document.getElementById('app'));
}
// registerForm
