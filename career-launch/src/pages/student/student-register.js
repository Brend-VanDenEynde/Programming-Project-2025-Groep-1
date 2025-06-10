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
        <label>Foto</label>
      </div>

      <form class="naamForm" id="naamForm">
        <div class="name-row">
          <input type="voornaam" id="voornaam" name="voornaam" required placeholder="Voornaam" class="input-half" />
          <input type="achternaam" id="achternaam" name="achternaam" required placeholder="Achternaam" class="input-half" />
        </div>
        <input type="linkedin" id="linkedin" name"linkedin" placeholder="LinkedIn-link" class="input-full" />

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
  const data = {
    voornaam: formData.get('voornaam'),
    achternaam: formData.get('achternaam'),
    linkedinLink: formData.get('linkedin'),
  };

  

  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);
  alert(`Welkom ${data.voornaam}! Je account is aangemaakt.`);

  renderStudentOpleiding(document.getElementById('app'));
}
// registerForm