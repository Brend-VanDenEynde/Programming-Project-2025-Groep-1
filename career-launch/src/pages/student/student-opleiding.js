import { renderStudentSkills } from './student-skills.js';
import Router from '../router.js';
import '../css/student-register.css';

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
        </div>


      <select class="opleiding-select" name="opleiding">
          <option selected disabled>Opleiding</option>
          <option>Business IT</option>
          <option>Networks & Security</option>
          <option>Software Engineering</option>
          <option>Intelligent Robotics</option>
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
    Router.navigate('/registreer');
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
}

function handleJaarRegister(event) {
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

  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);

  renderStudentSkills(document.getElementById('app'));
}
//href
