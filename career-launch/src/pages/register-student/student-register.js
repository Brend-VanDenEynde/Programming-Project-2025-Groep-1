import { renderStudentOpleiding } from './student-opleiding.js';
import '../../css/consolidated-style.css';
import Router from '../../router.js';

import { previousData } from '../register.js';

let fileKey = null;

export let mergedData = null;



export function renderStudentRegister(rootElement) {
  rootElement.innerHTML = `
  
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container">
      <button class="back-button" id="back-button">← Terug</button>
      <div class="upload-section">
        <div class="upload-icon" data-alt="⬆" style="position:relative;">
          <img src="" alt="⬆" class="uploaded-photo" />
          <button type="button" class="delete-overlay" style="display:none;" aria-label="Verwijder geüploade foto" tabindex="0">&#10006;</button>
        </div>
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
    fetch(`https://api.ehb-match.me/profielfotos/${fileKey}`, {
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
      const uploadResponse = await fetch('https://api.ehb-match.me/profielfotos', {
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
  document.getElementById('back-button').addEventListener('click', () => {
    Router.goBack('/registreer');
  });

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

function handleNaamRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  let linkedinInput = formData.get('linkedin');
  let linkedinValue = null;
  if (linkedinInput && linkedinInput.trim() !== '') {
    linkedinInput = linkedinInput.trim();
    // Remove both 'https://www.linkedin.com' and 'https://linkedin.com' from the start
    linkedinInput = linkedinInput.replace(/^(https?:\/\/)?(www\.)?linkedin\.com/i, '');
    // Accept if it starts with '/in/'
    if (linkedinInput.startsWith('/in/')) {
      linkedinValue = linkedinInput;
    } else {
      linkedinValue = null;
    }
  }
  const currentData = {
    voornaam: formData.get('voornaam'),
    achternaam: formData.get('achternaam'),
    date_of_birth: formData.get('geboortedatum'),
    linkedin: linkedinValue,
    profielFoto: fileKey,
  };

  const errorLabel = document.getElementById('error-label');
  errorLabel.style.display = 'none';

  if (!currentData.voornaam || !currentData.achternaam) {
    errorLabel.textContent = 'Voornaam en achternaam zijn verplicht.';
    errorLabel.style.display = 'block';
    return;
  }

  mergedData = { ...previousData, ...currentData };

  renderStudentOpleiding(document.getElementById('app'));
}
// registerForm
