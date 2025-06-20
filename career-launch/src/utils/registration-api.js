/**
 * Utility functies voor gebruikersregistratie en API-communicatie
 * Dit bestand bevat de logica voor het omzetten van formulierdata naar JSON
 * en het versturen naar de backend API
 */

/**
 * Creëert een JSON-object voor gebruikersregistratie met alleen user-gegevens
 * @param {Object} formData - De ruwe formulierdata van het registratieformulier
 * @returns {Object} JSON-object met alleen het user object
 */
export function createUserRegistrationJSON(formData) {
  // Eenvoudige gebruikersstructuur - alleen de user-gegevens
  const userJSON = {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.toLowerCase().trim(),
    password: formData.password, // Backend zal dit hashen
    role: formData.rol, // 'student' of 'bedrijf'
  };

  return userJSON;
}

/**
 * Verzendt registratiedata naar de backend API
 * @param {Object} userData - Het gestructureerde JSON-object
 * @returns {Promise<Object>} API response
 */
export async function sendRegistrationToAPI(userData) {
  try {
    // API endpoint configuratie
    const API_BASE_URL = window.location.origin; // Of een specifieke backend URL
    const API_ENDPOINT = `${API_BASE_URL}/api/register`;

    console.log('Verzenden registratiedata naar:', API_ENDPOINT);
    console.log('JSON payload:', JSON.stringify(userData, null, 2));

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // CSRF token indien nodig
        // 'X-CSRF-Token': getCsrfToken(),
        // API key indien nodig
        // 'X-API-Key': 'your-api-key-here'
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Error handling voor verschillende HTTP status codes
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message || errorData.error || 'Onbekende server fout';
      } catch {
        errorMessage = `Server fout: ${response.status} ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Registratie succesvol:', result);

    return {
      success: true,
      data: result,
      message: result.message || 'Registratie succesvol!',
    };
  } catch (error) {
    console.error('API call failed:', error);

    // Specifieke error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Netwerkfout. Controleer je internetverbinding.');
    }

    throw error;
  }
}

/**
 * Voorbeeldfunctie voor het simuleren van een backend response
 * Deze functie is niet meer nodig en wordt vervangen door echte API calls
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export async function mockRegistrationAPI(userData) {
  // Deze mock functie is vervangen door echte API integratie
  throw new Error(
    'Mock API is niet meer beschikbaar. Gebruik echte API endpoints.'
  );
}

/**
 * Valideert de formulierdata voordat het naar JSON wordt geconverteerd
 * @param {Object} formData
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateRegistrationData(formData) {
  const errors = [];

  // Required fields
  if (!formData.firstName?.trim()) {
    errors.push('Voornaam is verplicht');
  }
  if (!formData.lastName?.trim()) {
    errors.push('Achternaam is verplicht');
  }
  if (!formData.email?.trim()) {
    errors.push('E-mailadres is verplicht');
  }
  if (!formData.password) {
    errors.push('Wachtwoord is verplicht');
  }
  if (!formData.rol) {
    errors.push('Selecteer een rol (Student of Bedrijf)');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.push('Ongeldig e-mailadres formaat');
  }

  // Password validation
  if (formData.password && formData.password.length < 8) {
    errors.push('Wachtwoord moet minimaal 8 karakters bevatten');
  }

  // Password confirmation
  if (formData.password !== formData.confirmPassword) {
    errors.push('Wachtwoorden komen niet overeen');
  }

  // School email validation (optioneel)
  if (
    formData.rol === 'student' &&
    formData.email &&
    !formData.email.includes('.be')
  ) {
    // Waarschuwing voor school e-mail
    console.warn('Geen .be e-mailadres gedetecteerd voor student');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Voorbeeldstructuur is verwijderd - gebruik echte API endpoints
 */
export const EXAMPLE_REGISTRATION_JSON = {
  message: 'Hardcoded examples zijn verwijderd. Gebruik echte API data.',
};
