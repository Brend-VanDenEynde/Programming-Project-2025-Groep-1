import { renderStudentSkills } from './student-skills.js';
import '../../css/student-register.css';
import Router from '../../router.js';
import { apiGet, apiPost } from '../../utils/api.js';

export function renderStudentOpleiding(rootElement) {
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; background-color: #f7f9fb;">
      <button class="back-button-outside" id="back-button">← Terug</button>
      
      <main class="form-container opleiding-container">
        <div class="opleiding-content">
          <h2 class="opleiding-title">Vertel ons meer over jezelf</h2>
          
          <form class="jaarForm" id="jaarForm">
            <div class="form-section">
              <h3 class="section-title">Ik ben een</h3>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="jaar" value="1">
                  <span class="radio-text">1ste jaar</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="jaar" value="2">
                  <span class="radio-text">2de jaar</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="jaar" value="3">
                  <span class="radio-text">3de jaar</span>
                </label>
              </div>
            </div>

            <div class="form-section">
              <label class="select-label">Selecteer je opleiding</label>
              <select class="opleiding-select" name="opleiding">
              </select>
            </div>

            <label id="error-label" class="error-label" style="color: #e74c3c; display: none; margin-top: 1rem; text-align: center;"></label>
            
            <button type="submit" class="create-account-button">Account Aanmaken</button>
          </form>
        </div>
      </main>

      <footer class="footer">
        <a href="#" id="privacy-link">Privacy Policy</a> | <a href="#" id="contact-link">Contacteer Ons</a>
        <label id="footer-error-label" class="error-label" style="color: #e74c3c; display: none; margin-top: 0.5rem;"></label>
      </footer>
    </div>
  `;

  const form = document.getElementById('jaarForm');
  form.addEventListener('submit', handleJaarRegister);
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
  }  }

  // Voorbeeld: als er een uitlogknop zou zijn














// No changes needed for image imports in this file. All asset and API usage is correct.}  }    });      Router.navigate('/');      localStorage.clear();      window.sessionStorage.clear();      // Hier zou je eventueel een logoutUser() API call doen    logoutBtn.addEventListener('click', async () => {    logoutBtn.onclick = null;  if (logoutBtn) {  const logoutBtn = document.getElementById('logout-btn');// No changes needed for image imports in this file. All asset and API usage is correct.
