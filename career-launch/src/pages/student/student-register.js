import { renderStudentOpleiding } from './student-opleiding.js';
import '../../css/consolidated-style.css';
import Router from '../../router.js';

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
      <div class="footer-content">
        <span>&copy; 2025 EhB Career Launch</span>
        <div class="footer-links">
          <a href="/privacy" data-route="/privacy">Privacy</a>
          <a href="/contact" data-route="/contact">Contact</a>
        </div>
      </div>
    </footer>
  </div>
  `;

  const form = document.getElementById('naamForm');
  form.addEventListener('submit', handleNaamRegister);

  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        Router.navigate('/registreer');
      }
    });
  }
}

function handleNaamRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const linkedinInput = formData.get('linkedin');
  const data = {
    voornaam: formData.get('voornaam'),
    achternaam: formData.get('achternaam'),
    linkedinLink:
      linkedinInput && linkedinInput.trim() !== ''
        ? linkedinInput
        : 'https://www.linkedin.com/',
  };

  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);
  alert(`Welkom ${data.voornaam}! Je account is aangemaakt.`);

  renderStudentOpleiding(document.getElementById('app'));
}
// registerForm
