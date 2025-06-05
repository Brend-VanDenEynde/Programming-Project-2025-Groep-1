import Router from '../router.js';

// Hoofdfunctie voor het renderen van de contactpagina
export function renderContact(rootElement) {
  rootElement.innerHTML = `
    <div class="modern-contact-container">
      <!-- Header sectie met terug knop en titel -->
      <div class="modern-contact-header">
        <button class="modern-back-button" id="back-button">
          <span class="back-arrow">←</span>
          Terug naar Home
        </button>
        <h1 class="modern-contact-title">Contacteer Ons</h1>
        <p class="modern-contact-subtitle">We helpen je graag verder</p>
      </div>      <div class="modern-contact-content">
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
            </div>

            <!-- Submit knop -->
            <button 
              type="submit" 
              id="submit-button" 
              class="modern-submit-button" 
              disabled
            >
              <span class="button-text">Bericht verzenden</span>
              <span class="button-icon">📤</span>
            </button>

            <!-- Form status indicator -->
            <div class="form-status" id="form-status"></div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div id="success-modal" class="success-modal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="success-icon">✅</div>
          <h3>Bericht verzonden!</h3>
        </div>
        <div class="modal-body">
          <p>Bedankt voor je bericht. We hebben je aanvraag ontvangen en nemen binnen 2 werkdagen contact met je op.</p>
          <p class="modal-reference">Referentienummer: <span id="reference-number"></span></p>
        </div>
        <div class="modal-footer">
          <button id="close-modal" class="modal-close-button">Sluiten</button>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div id="loading-overlay" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Bericht wordt verzonden...</p>
    </div>
  `;

  // Initialiseer alle event listeners en functionaliteit
  initializeContactPage();
}

// Functie om alle event listeners en validatie te initialiseren
function initializeContactPage() {
  // Terug knop functionaliteit
  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    Router.navigate('/');
  });
  // Formulier elementen ophalen
  const form = document.getElementById('modernContactForm');
  const emailField = document.getElementById('email');
  const subjectField = document.getElementById('subject');
  const messageField = document.getElementById('message');
  const submitButton = document.getElementById('submit-button');
  const charCount = document.getElementById('char-count');

  // Validatie regels
  const validationRules = {
    email: {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    subject: {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000
    }
  };

  // Functie voor het valideren van individuele velden
  function validateField(fieldName, value) {
    const rules = validationRules[fieldName];
    const errors = [];

    if (rules.required && (!value || value.trim() === '')) {
      errors.push('Dit veld is verplicht');
    } else if (value && value.trim() !== '') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Minimaal ${rules.minLength} tekens vereist`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Maximaal ${rules.maxLength} tekens toegestaan`);
      }        if (rules.pattern && !rules.pattern.test(value)) {
          if (fieldName === 'email') {
            errors.push('Voer een geldig e-mailadres in');
          }
        }
    }

    return errors;
  }
  // Functie om foutmeldingen weer te geven (alleen bij submit)
  function showFieldError(fieldName, errors, showErrors = false) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const fieldElement = document.getElementById(fieldName);
    
    if (errors.length > 0 && showErrors) {
      errorElement.textContent = errors[0];
      errorElement.style.display = 'block';
      fieldElement.classList.add('error');
      fieldElement.classList.remove('valid');
    } else {
      errorElement.style.display = 'none';
      fieldElement.classList.remove('error');
      // Verwijder ook valid class tenzij expliciet gewenst
      fieldElement.classList.remove('valid');
    }
  }

  // Functie om de volledige formulier validatie te controleren
  function validateForm() {
    const formData = new FormData(form);
    let isValid = true;

    // Valideer elk veld
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = formData.get(fieldName) || '';
      const errors = validateField(fieldName, value);
      showFieldError(fieldName, errors);
      
      if (errors.length > 0) {
        isValid = false;
      }
    }

    // Update submit knop status
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('enabled', isValid);

    return isValid;
  }
  // Realtime validatie voor elk veld
  [emailField, subjectField, messageField].forEach(field => {
    // Validatie bij typen (met vertraging)
    let validationTimer;
    field.addEventListener('input', () => {
      clearTimeout(validationTimer);
      validationTimer = setTimeout(() => {
        validateForm();
      }, 300);
    });

    // Directe validatie bij focus verlies
    field.addEventListener('blur', () => {
      const errors = validateField(field.name, field.value);
      showFieldError(field.name, errors);
      validateForm();
    });

    // Focus styling
    field.addEventListener('focus', () => {
      field.parentElement.classList.add('focused');
    });

    field.addEventListener('blur', () => {
      field.parentElement.classList.remove('focused');
    });
  });
  // Karakter teller voor bericht veld
  messageField.addEventListener('input', () => {
    const currentLength = messageField.value.length;
    charCount.textContent = currentLength;
    
    // Behoud neutrale kleur
    charCount.style.color = '#666';
  });

  // Formulier submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showFormStatus('error', 'Gelieve alle velden correct in te vullen');
      return;
    }

    await submitForm();
  });

  // Functie voor het versturen van het formulier
  async function submitForm() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const successModal = document.getElementById('success-modal');
    
    try {
      // Toon loading overlay
      loadingOverlay.style.display = 'flex';
      
      // Simuleer API call (in een echte app zou hier een fetch naar de backend komen)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Genereer referentienummer
      const referenceNumber = 'CL' + Date.now().toString().slice(-6);
      document.getElementById('reference-number').textContent = referenceNumber;
      
      // Verberg loading en toon success modal
      loadingOverlay.style.display = 'none';
      successModal.style.display = 'flex';
      
      // Reset formulier
      form.reset();
      validateForm();
        // Reset karakter teller
      charCount.textContent = '0';
      charCount.style.color = '#666';
        // Verwijder alle validatie klassen
      [emailField, subjectField, messageField].forEach(field => {
        field.classList.remove('error', 'valid');
      });
      
    } catch (error) {
      loadingOverlay.style.display = 'none';
      showFormStatus('error', 'Er is een fout opgetreden. Probeer het later opnieuw.');
    }
  }

  // Functie om form status berichten te tonen
  function showFormStatus(type, message) {
    const statusElement = document.getElementById('form-status');
    statusElement.className = `form-status ${type}`;
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    
    // Auto-hide na 5 seconden
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }

  // Modal sluiten functionaliteit
  const closeModalButton = document.getElementById('close-modal');
  const successModal = document.getElementById('success-modal');
  
  closeModalButton.addEventListener('click', () => {
    successModal.style.display = 'none';
  });

  // Modal sluiten bij klikken buiten de modal
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.style.display = 'none';
    }
  });

  // ESC toets om modal te sluiten
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.style.display === 'flex') {
      successModal.style.display = 'none';
    }
  });

  // Initiële validatie
  validateForm();
}
