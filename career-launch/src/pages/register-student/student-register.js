import { renderStudentOpleiding } from './student-opleiding.js';
import '../../css/consolidated-style.css';
import Router from '../../router.js';

export function renderStudentRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button" id="back-button">← Terug</button>      <div class="upload-section">
        <div class="upload-icon">⬆</div>
        <label for="profielFoto" class="upload-label">Foto</label>
        <div class="file-input-wrapper">
          <input type="file" id="profielFoto" name="profielFoto" accept="image/*" class="file-input" />
          <button type="button" class="browse-button">Browse...</button>
          <span class="file-status">No file selected.</span>
        </div>
      </div>

      <form class="naamForm" id="naamForm">
        <div class="name-row">
          <div class="input-group">
            <label for="voornaam" class="input-label">Voornaam</label>
            <input type="text" id="voornaam" name="voornaam" required placeholder="Voornaam" class="input-half" />
          </div>
          <div class="input-group">
            <label for="achternaam" class="input-label">Achternaam</label>
            <input type="text" id="achternaam" name="achternaam" required placeholder="Achternaam" class="input-half" />
          </div>
        </div>        <div class="form-spacing">
          <div class="input-group">
            <label for="geboortedatum" class="input-label">Geboortedatum</label>
            <input type="date" id="geboortedatum" name="geboortedatum" required placeholder="dd / mm / yyyy" class="input-full" />
          </div>
        </div>
        <div class="form-spacing">
          <div class="input-group">
            <label for="linkedin" class="input-label">LinkedIn-link</label>
            <input type="url" id="linkedin" name="linkedin" placeholder="LinkedIn-link" class="input-full" />
          </div>
        </div>
        <label id="error-label" class="error-label" style="color: red; display: none;"></label>
        <button type="submit" class="next-button">Volgende →</button>
      </form>

        </main>

    <footer class="footer">
      <a href="/privacy" data-route="/privacy">Privacy Policy</a> | <a href="/contact" data-route="/contact">Contacteer Ons</a>
    </footer>
  </div>
  `;
  const form = document.getElementById('naamForm');
  form.addEventListener('submit', handleNaamRegister);

  // File input functionaliteit
  const fileInput = document.getElementById('profielFoto');
  const browseButton = document.querySelector('.browse-button');
  const fileStatus = document.querySelector('.file-status');

  browseButton.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileStatus.textContent = file.name;
    } else {
      fileStatus.textContent = 'No file selected.';
    }
  });
  document.getElementById('back-button').addEventListener('click', () => {
    Router.goBack('/registreer');
  });
}

function handleNaamRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const linkedinInput = formData.get('linkedin');
  const currentData = {
    voornaam: formData.get('voornaam'),
    achternaam: formData.get('achternaam'),
    date_of_birth: formData.get('geboortedatum'),
    linkedin:
      linkedinInput && linkedinInput.trim() !== ''
        ? linkedinInput
        : 'https://www.linkedin.com/',
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
