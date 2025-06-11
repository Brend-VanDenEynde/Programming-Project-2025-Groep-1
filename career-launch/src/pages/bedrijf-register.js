// import { renderBedrijfOpleiding } from './student-opleiding.js';
import './student-register.css';
import Router from '../router.js';

export function renderBedrijfRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button" id="back-button">← Terug</button>

      <div class="upload-section">
        <div class="upload-icon">⬆</div>
        <label>Logo</label>
      </div>

      <form class="bedrijfForm" id="bedrijfForm">
        <div class="form-spacing">
          <input type="text" id="bedrijfnaam" name="bedrijfnaam" required placeholder="Bedrijfsnaam" class="input-full" />
        </div>
        <div class="form-spacing">
          <input type="text" id="contactpersoon" name="contactpersoon" required placeholder="Naam contactpersoon" class="input-full" />
        </div>
        <div class="form-spacing">
          <input type="tel" id="telefoon" name="telefoon" required placeholder="Telefoonnummer contactpersoon" class="input-full" />
        </div>
        <div class="form-spacing">
          <input type="text" id="linkedin" name="linkedin" placeholder="LinkedIn-link" class="input-full" />
        </div>
        <button type="submit" class="next-button">Bevestigen →</button>
      </form>

      
    </main>

    <footer class="footer">
      <a href="#" id="privacy-link">Privacy Policy</a> | <a href="#" id="contact-link">Contacteer Ons</a>
    </footer>
  </div>
  `;

  const form = document.getElementById('bedrijfForm');
  form.addEventListener('submit', handleBedrijfRegister);

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

function handleBedrijfRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {
    bedrijfnaam: formData.get('bedrijfnaam'),
    contactpersoon: formData.get('contactpersoon'),
    telefoon: formData.get('telefoon'),
    linkedinLink: formData.get('linkedin'),
  };

  

  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);
  alert(`Welkom ${data.bedrijfnaam}! Je account is aangemaakt.`);

  Router.navigate('/Bedrijf/Bedrijf-Profiel');
}
// firstName