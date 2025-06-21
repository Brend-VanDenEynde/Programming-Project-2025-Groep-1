import '../../css/consolidated-style.css';
import Router from '../../router.js';
import { authenticatedFetch } from '../../utils/auth-api.js';

// Skills ophalen uit de API
async function fetchSkills() {
  const resp = await authenticatedFetch('https://api.ehb-match.me/skills');
  if (!resp.ok) throw new Error('Skills ophalen mislukt');
  return await resp.json(); // [{id: 1, skill: 'JavaScript'}, ...]
}

export async function renderStudentSkills(rootElement) {
  // Laad de skills eerst!
  let skills = [];
  try {
    skills = await fetchSkills();
  } catch (e) {
    alert('Skills ophalen mislukt: ' + e.message);
    skills = [];
  }

  // Maak dynamisch HTML voor je skills (checkboxes)
  const skillInputs = skills
    .map(
      (s) =>
        `<label><input type="checkbox" name="skills" value="${s.id}"> ${s.skill}</label>`
    )
    .join('');

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
            <div class="checkbox-group">
              ${skillInputs}
            </div>
          </div>
          <div class="button-row">
            <button class="skip-button" id="skip-button">SKIP</button>
            <button class="save-button" id="save-button">SAVE</button>
          </div>
        </form>      </main>
      <footer class="footer">
        <a href="/privacy" data-route="/privacy">Privacy Policy</a> | <a href="/contact" data-route="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  document
    .getElementById('skillsForm')
    .addEventListener('submit', handleSkillsRegister);
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        Router.navigate('/student-opleiding');
      }
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

function handleSkillsRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const job = formData.get('job');
  // Haal alle aangevinkte skills op als array:
  const selectedSkills = Array.from(
    document.querySelectorAll('input[name="skills"]:checked')
  ).map((cb) => Number(cb.value));
  const data = {
    job,
    skills: selectedSkills, // <-- array met ids!
  };

  // Hier kun je data naar server sturen...
  // Router.navigate(...) etc.
}
