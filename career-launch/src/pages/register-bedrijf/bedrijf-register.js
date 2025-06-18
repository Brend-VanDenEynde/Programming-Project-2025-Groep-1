// import { renderStudentOpleiding } from '../register-student/student-opleiding.js';
import '../../css/consolidated-style.css';
import Router from '../../router.js';
import { authenticatedFetch } from '../../utils/auth-api.js';
import { registerCompany } from '../../utils/data-api.js';

import { previousData } from '../register.js';

let fileKey = null;

export function renderBedrijfRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button" id="back-button">← Terug</button>
      <div class="upload-section">
        <div class="upload-icon" data-alt="⬆" style="position:relative;">
          <img src="" alt="⬆" class="uploaded-photo" />
          <button type="button" class="delete-overlay" style="display:none;" aria-label="Verwijder geüploade foto" tabindex="0">&#10006;</button>
        </div>
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
      <a href="/privacy" data-route="/privacy">Privacy Policy</a> | <a href="/contact" data-route="/contact">Contacteer Ons</a>
    </footer>
  </div>
  `;
  const form = document.getElementById('bedrijfForm');
  form.addEventListener('submit', handleBedrijfRegister);

  // File input functionaliteit
  const fileInput = document.getElementById('profielFoto');
  const browseButton = document.querySelector('.browse-button');
  const fileStatus = document.querySelector('.file-status');
  const uploadIcon = document.querySelector('.upload-icon');
  const uploadedPhoto = document.querySelector('.uploaded-photo');
  const deleteOverlay = document.querySelector('.delete-overlay');

  browseButton.addEventListener('click', () => {
    fileInput.click();
  });

  let hasUploadedPhoto = false;

  function updateDeleteOverlay() {
    hasUploadedPhoto = !!fileKey;
    // Always hide overlay by default
    deleteOverlay.style.display = 'none';
  }

  uploadIcon.addEventListener('mouseenter', () => {
    if (hasUploadedPhoto) {
      deleteOverlay.style.display = 'flex';
    }
  });
  uploadIcon.addEventListener('mouseleave', () => {
    deleteOverlay.style.display = 'none';
  });

  deleteOverlay.addEventListener('click', handlePhotoClick);

  async function handlePhotoClick() {
    authenticatedFetch(`https://api.ehb-match.me/profielfotos/${fileKey}`, {
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) {
        console.error(`Failed to delete photo: ${response.status}`);
      }
    });
    uploadedPhoto.alt = '⬆';
    uploadedPhoto.src = '';
    fileStatus.textContent = 'No file selected.'; // Reset file status
    uploadedPhoto.removeEventListener('click', handlePhotoClick);
    fileKey = null; // Reset file key
    updateDeleteOverlay();
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      fileStatus.textContent = file.name;

      const formData = new FormData();

      formData.append('image', file);
      const uploadResponse = await authenticatedFetch('https://api.ehb-match.me/profielfotos', {
        method: 'POST',
        body: formData,
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        } else {
          return response.json();
        }
      });

      fileKey = uploadResponse.profiel_foto_key || null;

      uploadedPhoto.alt = '';
      uploadedPhoto.src = uploadResponse.profiel_foto_url || '';
      updateDeleteOverlay();
      uploadedPhoto.addEventListener('click', handlePhotoClick);
    } else {
      fileStatus.textContent = 'No file selected.';
      updateDeleteOverlay();
    }
  });
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      Router.goBack('/registreer');
    });
  }

  // Footer links: gebruik alleen Router.navigate, geen hash of import
  const privacyLink = document.querySelector('a[href="/privacy"]');
  if (privacyLink) {
    privacyLink.setAttribute('href', '#');
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/privacy');
    });
  }
  const contactLink = document.querySelector('a[href="/contact"]');
  if (contactLink) {
    contactLink.setAttribute('href', '#');
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/contact');
    });
  }
}

async function handleBedrijfRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const errorLabel = document.getElementById('error-label');
  errorLabel.style.display = 'none';


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
  let linkedinInput = formData.get('linkedin');
  let linkedinValue = null;
  if (linkedinInput && linkedinInput.trim() !== '') {
    linkedinInput = linkedinInput.trim();
    // Remove both 'https://www.linkedin.com' and 'https://linkedin.com' from the start
    linkedinInput = linkedinInput.replace(/^(https?:\/\/)?(www\.)?linkedin\.com/i, '');
    // Accept if it starts with '/company/'
    if (linkedinInput.startsWith('/company/')) {
      linkedinValue = linkedinInput;
    } else {
      linkedinValue = null;
    }
  }

  // Prepare data according to API specification
  const data = {
    email: previousData.email,
    password: previousData.password,
    naam: bedrijfnaam,
    plaats: plaats,
    contact_email: contactEmail,
    linkedin: linkedinValue,
    profiel_foto: fileKey || null,
  };
  try {
    const result = await registerCompany(data);
    console.log('Bedrijf registratie succesvol:', result);

    // Clear stored user data

    alert('Uw bedrijfsaccount is succesvol aangemaakt! Gelieve te wachten tot ons team uw account bevestigt.');
    Router.navigate('/login');
  } catch (error) {
    console.error('Fout bij het aanmaken van bedrijf account:', error);
    errorLabel.textContent =
      error.message ||
      'Er is een fout opgetreden bij het aanmaken van uw account.';
    errorLabel.style.display = 'block';
  }
}
