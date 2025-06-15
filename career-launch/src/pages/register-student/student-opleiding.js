import { renderStudentSkills } from './student-skills.js';
import '../../css/consolidated-style.css';
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
      </main>      <footer class="footer">
        <a href="/privacy" data-route="/privacy">Privacy Policy</a> | <a href="/contact" data-route="/contact">Contacteer Ons</a>
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
      Router.goBack('/registreer');
    });
  }
  // Footer links
  // Privacy and Contact pages are now properly routed via data-route attributes

  // Fetch opleidingen from API and populate dropdown
  loadOpleidingen();
}

async function loadOpleidingen() {
  try {
    // Try direct fetch first since this might be a public endpoint
    console.log('Fetching opleidingen from API...');

    let opleidingen;
    try {
      const response = await fetch('https://api.ehb-match.me/opleidingen/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      opleidingen = await response.json();
      console.log(
        'Successfully fetched opleidingen with direct fetch:',
        opleidingen
      );
    } catch (fetchError) {
      console.warn('Direct fetch failed, trying with apiGet:', fetchError);
      // Fallback to apiGet in case authentication is required
      opleidingen = await apiGet('https://api.ehb-match.me/opleidingen/');
    }

    const opleidingSelect = document.querySelector('.opleiding-select');
    opleidingSelect.innerHTML = ''; // Clear all existing options

    const defaultOption = document.createElement('option');
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.textContent = 'Opleiding';
    opleidingSelect.appendChild(defaultOption); // Add default option

    if (!opleidingen || opleidingen.length === 0) {
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

    // Show more specific error message
    const opleidingSelect = document.querySelector('.opleiding-select');
    opleidingSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.textContent = 'Fout bij laden opleidingen';
    opleidingSelect.appendChild(defaultOption);

    const errorOption = document.createElement('option');
    errorOption.disabled = true;
    errorOption.textContent = `Error: ${error.message}`;
    opleidingSelect.appendChild(errorOption);
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

  // Format LinkedIn URL to match API expectations
  let linkedinValue = '';
  if (previousData.linkedin && previousData.linkedin.trim() !== '') {
    const linkedin = previousData.linkedin.trim();
    // If it's a full URL, extract the path part
    if (linkedin.startsWith('https://www.linkedin.com/in/')) {
      linkedinValue = linkedin.replace('https://www.linkedin.com', '');
    } else if (linkedin.startsWith('/in/')) {
      linkedinValue = linkedin;
    } else if (linkedin !== 'https://www.linkedin.com/') {
      // Assume it's a username and format it properly
      linkedinValue = `/in/${linkedin}`;
    } else {
      linkedinValue = '/in/profile'; // Default placeholder
    }
  } else {
    linkedinValue = '/in/profile'; // Default placeholder instead of full URL
  }
  const data = {
    email: previousData.email || '',
    password: previousData.password || '',
    voornaam: previousData.voornaam || '',
    achternaam: previousData.achternaam || '',
    linkedin: linkedinValue,
    profiel_foto: previousData.profielFoto,
    studiejaar: parseInt(jaar, 10),
    opleiding_id: parseInt(opleiding, 10),
    date_of_birth: previousData.date_of_birth || '',
  };

  // Validate required fields before sending
  const requiredFields = [
    'email',
    'password',
    'voornaam',
    'achternaam',
    'date_of_birth',
  ];
  const missingFields = requiredFields.filter(
    (field) => !data[field] || data[field].trim() === ''
  );

  if (missingFields.length > 0) {
    errorLabel.textContent = `Ontbrekende gegevens: ${missingFields.join(
      ', '
    )}. Ga terug naar de vorige stap om deze in te vullen.`;
    errorLabel.style.display = 'block';
    return;
  }

  // Validate numeric fields
  if (isNaN(data.studiejaar) || data.studiejaar < 1 || data.studiejaar > 3) {
    errorLabel.textContent = 'Ongeldig studiejaar geselecteerd.';
    errorLabel.style.display = 'block';
    return;
  }
  if (isNaN(data.opleiding_id) || data.opleiding_id <= 0) {
    errorLabel.textContent = 'Ongeldige opleiding geselecteerd.';
    errorLabel.style.display = 'block';
    return;
  }

  try {
    console.log('Sending data to API:', JSON.stringify(data, null, 2));

    // Log environment info for debugging
    console.log('Current hostname:', window.location.hostname);
    console.log('User agent:', navigator.userAgent);
    console.log(
      'LocalStorage userData keys:',
      Object.keys(
        localStorage.getItem('userData')
          ? JSON.parse(localStorage.getItem('userData'))
          : {}
      )
    );

    // Alternative approach: Try using the existing apiPost utility
    // which might handle CORS or other production issues better
    try {
      console.log('Attempting registration with apiPost utility...');
      const result = await apiPost(
        'https://api.ehb-match.me/auth/register/student',
        data
      );
      console.log('Registration successful with apiPost:', result);
      Router.navigate('/login');
      return;
    } catch (apiPostError) {
      console.warn('apiPost failed, falling back to fetch:', apiPostError);
    }

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

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      // Try to get the actual error message from the API
      let errorMessage = `Fout bij het aanmaken van account (${response.status}).`;
      let detailedError = '';

      try {
        const errorData = await response.json();
        console.error('API error response:', errorData);

        // Extract error details more comprehensively
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }

        // Log additional error information for debugging
        if (errorData.errors) {
          console.error('Validation errors:', errorData.errors);
          detailedError = JSON.stringify(errorData.errors);
        }
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
        try {
          const errorText = await response.text();
          console.error('API error text:', errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Failed to read response as text:', textError);
        }
      }

      // Include more debugging info in production
      const fullErrorMessage = detailedError
        ? `${errorMessage}. Details: ${detailedError}`
        : errorMessage;

      throw new Error(fullErrorMessage);
    }

    const result = await response.json();
    console.log('Registration successful:', result);
    Router.navigate('/login');
  } catch (error) {
    console.error('Fout bij het aanmaken van account:', error);
    errorLabel.textContent =
      error.message ||
      'Er is een fout opgetreden bij het aanmaken van je account.';
    errorLabel.style.display = 'block';
  }
}
