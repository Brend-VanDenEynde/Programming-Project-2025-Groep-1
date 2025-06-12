import './student-register.css';
import Router from '../router.js';

export function renderStudentSkills(rootElement) {
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <main class="form-container skills-container">
      <button class="back-button" id="back-button">← Terug</button>

      <form class="skillsForm" id="skillsForm">
      <div class="Job-Search">
      <h3>Ik zoek een</h3>
        <div class="radio-group">
          <label><input type="radio" name="job" value="fulltime"> Fultime</label>
          <label><input type="radio" name="job" value="parttime"> Parttime</label>
          <label><input type="radio" name="job" value="stage"> Stage</label>
        </div>
      </div>

      <div class="Skills-Select">
      <h3>Mijn Skills</h3>
        <div class="radio-group">
          <label><input type="radio" name="skill" value="1"> Cybersecurity</label>
          <label><input type="radio" name="skill" value="2"> C#</label>
          <label><input type="radio" name="skill" value="3"> Java</label>
        </div>
      </div>
      <div class="button-row">
        <button class="skip-button" id="skip-button">SKIP</button>
        <button class="save-button" id="save-button">SAVE</button>
      </div>
      </form>
    </main>

    <footer class="footer">
      <a href="#" id="privacy-link">Privacy Policy</a> | <a href="#" id="contact-link">Contacteer Ons</a>
    </footer>
  </div>
  `;

  const form = document.getElementById('skillsForm');
  form.addEventListener('submit', handleSkillsRegister);
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
    alert('Privacy Policy pagina nog niet geïmplementeerd');
  });

  const contactLink = document.getElementById('contact-link');
  contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Contact pagina nog niet geïmplementeerd');
  });
}

function handleSkillsRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const job = formData.get('job');
  const skill = formData.get('skill');

  const data = {
    job: formData.get('job'), // geselecteerde radio
    skill: formData.get('skill'),
  };

  // Data naar server sturen (voorbeeld)
  console.log('Registratie data:', data);
  alert(`Je account is nu in orde.`);

  // Navigeren naar de volgende pagina
  Router.navigate('/Student/Student-Profiel');
}
