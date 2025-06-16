import Router from '../router.js';
import { sendContactMessage } from '../utils/data-api.js';

// Hoofdfunctie voor het renderen van de contactpagina
export function renderContact(rootElement) {
  rootElement.innerHTML = `
    <div class="contact-container">
      <button class="back-button" id="back-button">← Terug</button>
      <div class="modern-contact-content">
        <!-- Contactformulier sectie -->
        <div class="contact-form-section">
          <h2>Stuur ons een bericht</h2>
          
          <form id="modernContactForm" class="modern-contact-form" novalidate>
            <!-- E-mail veld -->
            <div class="form-group">
              <label for="email">E-mailadres *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="bijvoorbeeld: jan.janssen@email.com"
                required
                autocomplete="email"
              >
              <div class="error-message" id="email-error"></div>
            </div>

            <!-- Onderwerp veld -->
            <div class="form-group">
              <label for="subject">Onderwerp *</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                placeholder="Korte omschrijving van je vraag"
                required
              >
              <div class="error-message" id="subject-error"></div>
            </div>

            <!-- Bericht veld -->
            <div class="form-group">
              <label for="message">Bericht *</label>
              <textarea 
                id="message" 
                name="message" 
                rows="6" 
                placeholder="Schrijf hier je bericht..."
                required
              ></textarea>
              <div class="error-message" id="message-error"></div>
              <div class="character-count">
                <span id="char-count">0</span> / 1000 tekens
              </div>
            </div>            <!-- Submit knop -->
            <button 
              type="submit" 
              id="submit-button" 
              class="modern-submit-button" 
              
            >
              <span class="button-text">Bericht verzenden</span>
            </button>

            <!-- Form status indicator -->
            <div class="form-status" id="form-status"></div>
          </form>
        </div>
      </div>    </div>

    <!-- Loading overlay -->
    <div id="loading-overlay" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Bericht wordt verzonden...</p>
    </div>
    
    <!-- FOOTER -->
    <footer class="student-profile-footer">
      <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
      <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
    </footer>
  `;

  // Initialiseer alle event listeners en functionaliteit
  initializeContactPage();
}

// Functie om alle event listeners en validatie te initialiseren
function initializeContactPage() {
  // Back button
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      Router.goBack('/');
    });
  }

  // Form elements
  const form = document.getElementById('modernContactForm');
  const messageField = document.getElementById('message');
  const charCount = document.getElementById('char-count');

  // Character counter for message field
  messageField.addEventListener('input', () => {
    charCount.textContent = messageField.value.length;
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitForm();
  });

  // Submit function
  async function submitForm() {
    const loadingOverlay = document.getElementById('loading-overlay');

    try {
      loadingOverlay.style.display = 'flex';

      const formData = new FormData(form);
      const contactData = {
        email: formData.get('email'),
        onderwerp: formData.get('subject'),
        bericht: formData.get('message'),
      };
      const response = await sendContactMessage(contactData);

      loadingOverlay.style.display = 'none';

      alert('Bericht verzonden!');

      form.reset();
      charCount.textContent = '0';
    } catch (error) {
      loadingOverlay.style.display = 'none';
      alert('Fout bij verzenden: ' + error.message);
    }
  }
}
