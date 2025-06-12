import { renderStudentSkills } from './student-skills.js';
import './student-register.css';
import Router from '../router.js';
import { apiGet, apiPost } from '../utils/api.js';

export function renderStudentOpleiding(rootElement) {
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container opleiding-container">
      <button class="back-button" id="back-button">← Terug</button>

      <form class="jaarForm" id="jaarForm">
      <h3>Ik ben een</h3>
        <div class="radio-group">
          <label><input type="radio" name="jaar" value="1"> 1ste jaar</label>
          <label><input type="radio" name="jaar" value="2"> 2de jaar</label>
          <label><input type="radio" name="jaar" value="3"> 3de jaar</label>
        </div>      <select class="opleiding-select" name="opleiding">

      </select>

      <label id="error-label" class="error-label" style="color: red; display: none;"></label>
      <label id="footer-error-label" class="error-label" style="color: red; display: none;"></label>

      <button class="save-button">Account Aanmaken</button>
      </form>
    </main>

    <footer class="footer">
      <a href="#" id="privacy-link">Privacy Policy</a> | <a href="#" id="contact-link">Contacteer Ons</a>
    </footer>
  </div>
  `;

  const form = document.getElementById('jaarForm');
  form.addEventListener('submit', handleJaarRegister);
  document.getElementById('back-button').addEventListener('click', () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to register if no history
      Router.navigate('/registreer');
    }
  });

  // Footer links
  const privacyLink = document.getElementById('privacy-link');
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    const footerErrorLabel = document.getElementById('footer-error-label');
    footerErrorLabel.textContent =
      'Privacy Policy pagina nog niet geïmplementeerd';
    footerErrorLabel.style.display = 'block';
  });
  const contactLink = document.getElementById('contact-link');
  contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    const footerErrorLabel = document.getElementById('footer-error-label');
    footerErrorLabel.textContent = 'Contact pagina nog niet geïmplementeerd';
    footerErrorLabel.style.display = 'block';
  });

  // Fetch opleidingen from API and populate dropdown
  loadOpleidingen();
}

async function loadOpleidingen() {
  try {
    const opleidingen = await apiGet('https://api.ehb-match.me/opleidingen/');
    const opleidingSelect = document.querySelector('.opleiding-select');
    opleidingSelect.innerHTML = ''; // Clear all existing options

    const defaultOption = document.createElement('option');
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.textContent = 'Opleiding';
    opleidingSelect.appendChild(defaultOption); // Add default option

    if (opleidingen.length === 0) {
      const option = document.createElement('option');
      option.disabled = true;
      option.textContent = 'Geen opleidingen beschikbaar';
      opleidingSelect.appendChild(option);
    } else {
      opleidingen.forEach((opleiding) => {
        const option = document.createElement('option');
        option.value = opleiding.id; // Use `id` as the value
        option.textContent = opleiding.naam; // Use `naam` for the display text
        opleidingSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Fout bij het ophalen van opleidingen:', error);
    alert('Er is een fout opgetreden bij het ophalen van opleidingen.');
  }
}

async function handleJaarRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const jaar = formData.get('jaar');
  const opleiding = formData.get('opleiding');

  const errorLabel = document.getElementById('error-label');
  errorLabel.style.display = 'none';

  if (!jaar) {
    errorLabel.textContent = 'Selecteer een jaar!';
    errorLabel.style.display = 'block';
    return;
  }
  if (!opleiding || opleiding === 'Opleiding') {
    errorLabel.textContent = 'Selecteer een opleiding!';
    errorLabel.style.display = 'block';
    return;
  }
  const previousData = JSON.parse(localStorage.getItem('userData')) || {};
  const data = {
    email: previousData.email || '',
    password: previousData.password || '',
    voornaam: previousData.voornaam || '',
    achternaam: previousData.achternaam || '',
    linkedin:
      previousData.linkedin && previousData.linkedin.trim() !== ''
        ? previousData.linkedin
        : 'https://www.linkedin.com/',
    profielFoto: previousData.profielFoto,
    studiejaar: parseInt(jaar, 10),
    opleiding_id: parseInt(opleiding, 10),
    date_of_birth: previousData.date_of_birth || '',
  };
  try {
    const response = await fetch(
      'https://api.ehb-match.me/auth/register/student',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error('Fout bij het aanmaken van account.');
    }

    const result = await response.json();

    Router.navigate('/login');
  } catch (error) {
    console.error('Fout bij het aanmaken van account:', error);
    errorLabel.textContent =
      'Er is een fout opgetreden bij het aanmaken van je account.';
    errorLabel.style.display = 'block';
  }
}
