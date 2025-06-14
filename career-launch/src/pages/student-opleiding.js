import { renderStudentSkills } from './student-skills.js';
import './student-register.css';
import Router from '../router.js';

export async function renderStudentOpleiding(rootElement) {
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
        </div>

      <select class="opleiding-select" name="opleiding" id="opleiding-select">
          <option selected disabled>Opleiding</option>
      </select>

      <button class="save-button">SAVE</button>
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
    Router.navigate('/Student-Register');
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

  // Fetch opleidingen from API and populate dropdown
  try {
    const response = await fetch('http://localhost:3001/opleiding/', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer 1234',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const opleidingen = await response.json();
    const opleidingSelect = document.getElementById('opleiding-select');
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

  if (!jaar) {
    alert('Selecteer een jaar!');
    return;
  }
  if (!opleiding || opleiding === 'Opleiding') {
    alert('Selecteer een opleiding!');
    return;
  }

  const data = {
    jaar: formData.get('jaar'), // geselecteerde radio
    opleiding: formData.get('opleiding'), // geselecteerde optie uit select
  };

  try {
    const response = await fetch('http://localhost:3001/opleiding/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1234',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('API response:', responseData);

    // Ga verder naar volgende pagina
    renderStudentSkills(document.getElementById('app'));
  } catch (error) {
    console.error('Fout bij API call:', error);
    alert('Er is een fout opgetreden bij het registreren. Probeer opnieuw.');
  }
}
//href