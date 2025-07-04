import '../../css/consolidated-style.css';
import Router from '../../router.js';

export async function renderStudentSkills(rootElement) {
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
      </form>    </main>

    <footer class="footer">
      <a href="/privacy" data-route="/privacy">Privacy Policy</a> | <a href="/contact" data-route="/contact">Contacteer Ons</a>
    </footer>
  `;

  const form = document.getElementById('skillsForm');
  form.addEventListener('submit', handleSkillsRegister);
  document.getElementById('back-button').addEventListener('click', () => {
    Router.goBack('/registreer');
  });

  // Footer links: gebruik alleen Router.navigate, geen hash of import, en selecteer alleen de lokale footer links
  const privacyLink = document.querySelector(
    '.footer-links a[data-route="/privacy"]'
  );
  if (privacyLink) {
    privacyLink.setAttribute('href', '#');
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/privacy');
    });
  }
  const contactLink = document.querySelector(
    '.footer-links a[data-route="/contact"]'
  );
  if (contactLink) {
    contactLink.setAttribute('href', '#');
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      Router.navigate('/contact');
    });
  }
}

function handleSkillsRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const job = formData.get('job');
  const skill = formData.get('skill');

  const data = {
    job: formData.get('job'),
    skill: formData.get('skill'),
  };

  // Data naar server sturen (voorbeeld)

  alert(`Je account is nu in orde.`);

  // Navigeren naar de juiste profielpagina
  Router.navigate('/Student/Student-Profiel');
}
