// import { renderStudentOpleiding } from '../register-student/student-opleiding.js';
import '../../css/student-register.css';
import Router from '../../router.js';

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

  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        Router.navigate('/registreer-bedrijf');
      }
    });
  }

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
  const linkedinInput = formData.get('linkedin');
  const data = {
    bedrijfnaam: formData.get('bedrijfnaam'),
    contactpersoon: formData.get('contactpersoon'),
    telefoon: formData.get('telefoon'),
    linkedinLink:
      linkedinInput && linkedinInput.trim() !== ''
        ? linkedinInput
        : 'https://www.linkedin.com/',
  };

  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);
  alert(`Je account is nu in orde.`);

  Router.navigate('/bedrijf/bedrijf-profiel');
}
