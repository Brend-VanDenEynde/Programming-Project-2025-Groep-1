// import { renderStudentOpleiding } from '../register-student/student-opleiding.js';
import '../../css/student-register.css';
import Router from '../../router.js';
import { registerCompany } from '../../utils/data-api.js';

export function renderBedrijfRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button" id="back-button">← Terug</button>      <div class="upload-section">
        <div class="upload-icon">⬆</div>
        <label for="profielFoto" class="upload-label">Logo</label>
        <div class="file-input-wrapper">
          <input type="file" id="profielFoto" name="profielFoto" accept="image/*" class="file-input" />
          <button type="button" class="browse-button">Browse...</button>
          <span class="file-status">No file selected.</span>
        </div>
      </div><form class="bedrijfForm" id="bedrijfForm">
        <div class="form-spacing">
          <input type="text" id="bedrijfnaam" name="bedrijfnaam" required placeholder="Bedrijfsnaam" class="input-full" />
        </div>
        <div class="form-spacing">
          <input type="text" id="plaats" name="plaats" required placeholder="Plaats (bijv. Brussel)" class="input-full" />
        </div>
        <div class="form-spacing">
          <input type="email" id="contact_email" name="contact_email" required placeholder="Contact e-mail" class="input-full" />
        </div>
        <div class="form-spacing">
          <input type="text" id="linkedin" name="linkedin" placeholder="LinkedIn-link (bijv. /company/techsolutions)" class="input-full" />
        </div>
        <label id="error-label" class="error-label" style="color: red; display: none;"></label>
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
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      Router.goBack('/registreer');
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

async function handleBedrijfRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const errorLabel = document.getElementById('error-label');
  errorLabel.style.display = 'none';

  // Get previously stored email and password from localStorage
  const previousData = JSON.parse(localStorage.getItem('userData')) || {};

  // Validate required fields
  const bedrijfnaam = formData.get('bedrijfnaam');
  const plaats = formData.get('plaats');
  const contactEmail = formData.get('contact_email');

  if (!bedrijfnaam || !plaats || !contactEmail) {
    errorLabel.textContent = 'Vul alle verplichte velden in.';
    errorLabel.style.display = 'block';
    return;
  }

  if (!previousData.email || !previousData.password) {
    errorLabel.textContent =
      'E-mail en wachtwoord ontbreken. Probeer opnieuw te registreren.';
    errorLabel.style.display = 'block';
    return;
  }

  // Prepare LinkedIn link
  const linkedinInput = formData.get('linkedin');
  const linkedinValue =
    linkedinInput && linkedinInput.trim() !== '' ? linkedinInput : '';

  // Prepare profile photo
  const profielFotoFile = formData.get('profielFoto');
  const profielFoto =
    profielFotoFile && profielFotoFile.name
      ? `/company_logo.jpg` // For now, use a default path as per API example
      : '';

  // Prepare data according to API specification
  const data = {
    email: previousData.email,
    password: previousData.password,
    naam: bedrijfnaam,
    plaats: plaats,
    contact_email: contactEmail,
    linkedin: linkedinValue,
    profiel_foto: profielFoto,
  };
  try {
    const result = await registerCompany(data);
    console.log('Bedrijf registratie succesvol:', result);

    // Clear stored user data
    localStorage.removeItem('userData');

    alert('Je bedrijf account is succesvol aangemaakt! Je kunt nu inloggen.');
    Router.navigate('/login');
  } catch (error) {
    console.error('Fout bij het aanmaken van bedrijf account:', error);
    errorLabel.textContent =
      error.message ||
      'Er is een fout opgetreden bij het aanmaken van je account.';
    errorLabel.style.display = 'block';
  }
}
