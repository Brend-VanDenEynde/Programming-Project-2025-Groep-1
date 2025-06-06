/**
 * Test bestand voor de registratie JSON-functionaliteit
 * Open dit bestand in de browser console om de JSON-structuur te testen
 */

// Importeer de functies (in een echte implementatie zou je deze import gebruiken)
// import { createUserRegistrationJSON, validateRegistrationData } from './utils/registration-api.js';

// Test data voor een student
const testStudentData = {
  firstName: 'Jan',
  lastName: 'Janssen',
  email: 'jan.janssen@student.ehb.be',
  password: 'veiligWachtwoord123',
  confirmPassword: 'veiligWachtwoord123',
  rol: 'student',
};

// Test data voor een bedrijf
const testCompanyData = {
  firstName: 'Marie',
  lastName: 'Peeters',
  email: 'marie.peeters@techcorp.be',
  password: 'bedrijfWachtwoord456',
  confirmPassword: 'bedrijfWachtwoord456',
  rol: 'bedrijf',
};

/**
 * Test de JSON-conversie voor een student
 */
function testStudentRegistration() {
  console.log('=== TEST: Student Registratie JSON ===');

  // Valideer eerst de data
  const validation = validateRegistrationData(testStudentData);
  console.log('Validatie resultaat:', validation);

  if (validation.isValid) {
    // Maak JSON object
    const studentJSON = createUserRegistrationJSON(testStudentData);

    console.log('Student JSON object:');
    console.log(JSON.stringify(studentJSON, null, 2));

    // Toon specifieke velden
    console.log('\nHoofdgegevens:');
    console.log(
      '- Naam:',
      studentJSON.user.firstName,
      studentJSON.user.lastName
    );
    console.log('- Email:', studentJSON.user.email);
    console.log('- Rol:', studentJSON.user.role);

    console.log('\nStudent specifieke gegevens:');
    console.log('- Student info:', studentJSON.profile.studentInfo);

    console.log('\nMetadata:');
    console.log('- Registratie datum:', studentJSON.metadata.registrationDate);
    console.log('- Browser info:', studentJSON.metadata.userAgent);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

/**
 * Test de JSON-conversie voor een bedrijf
 */
function testCompanyRegistration() {
  console.log('=== TEST: Bedrijf Registratie JSON ===');

  // Valideer eerst de data
  const validation = validateRegistrationData(testCompanyData);
  console.log('Validatie resultaat:', validation);

  if (validation.isValid) {
    // Maak JSON object
    const companyJSON = createUserRegistrationJSON(testCompanyData);

    console.log('Bedrijf JSON object:');
    console.log(JSON.stringify(companyJSON, null, 2));

    // Toon specifieke velden
    console.log('\nHoofdgegevens:');
    console.log(
      '- Naam:',
      companyJSON.user.firstName,
      companyJSON.user.lastName
    );
    console.log('- Email:', companyJSON.user.email);
    console.log('- Rol:', companyJSON.user.role);

    console.log('\nBedrijf specifieke gegevens:');
    console.log('- Bedrijf info:', companyJSON.profile.companyInfo);
    console.log(
      '- Contact persoon:',
      companyJSON.profile.companyInfo.contactPerson
    );
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

/**
 * Test validatie fouten
 */
function testValidationErrors() {
  console.log('=== TEST: Validatie Fouten ===');

  const invalidData = {
    firstName: '', // Leeg
    lastName: 'Test',
    email: 'invalid-email', // Ongeldig formaat
    password: '123', // Te kort
    confirmPassword: '456', // Komt niet overeen
    rol: '', // Leeg
  };

  const validation = validateRegistrationData(invalidData);
  console.log('Validatie resultaat voor ongeldige data:', validation);
  console.log('Fouten:', validation.errors);

  console.log('\n' + '='.repeat(50) + '\n');
}

/**
 * Simuleer een complete registratie flow
 */
async function simulateRegistrationFlow() {
  console.log('=== SIMULATIE: Complete Registratie Flow ===');

  try {
    // 1. Valideer formulier data
    console.log('1. Valideren formulier data...');
    const validation = validateRegistrationData(testStudentData);

    if (!validation.isValid) {
      console.error('Validatie gefaald:', validation.errors);
      return;
    }

    // 2. Maak JSON object
    console.log('2. JSON object maken...');
    const userData = createUserRegistrationJSON(testStudentData);

    // 3. Simuleer API call (gebruik mock functie)
    console.log('3. API call simuleren...');
    console.log('Verzenden naar API endpoint: /api/register');
    console.log('Payload grootte:', JSON.stringify(userData).length, 'bytes');

    // In de echte implementatie zou hier de API call komen:
    // const result = await sendRegistrationToAPI(userData);

    // Simuleer succesvol response
    const mockResponse = {
      success: true,
      userId: 12345,
      message: 'Registratie succesvol!',
      data: {
        id: 12345,
        email: userData.user.email,
        role: userData.user.role,
        createdAt: new Date().toISOString(),
      },
    };

    console.log('4. API response ontvangen:');
    console.log(mockResponse);

    console.log('✅ Registratie flow voltooid!');
  } catch (error) {
    console.error('❌ Fout in registratie flow:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

/**
 * Toon de verwachte database structuur
 */
function showDatabaseStructure() {
  console.log('=== DATABASE STRUCTUUR ===');

  const dbStructure = {
    tables: {
      users: {
        description: 'Hoofdtabel voor alle gebruikers',
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'password_hash',
          'role',
          'is_active',
          'created_at',
        ],
      },
      user_metadata: {
        description: 'Metadata over registratie en browser info',
        fields: [
          'user_id',
          'registration_method',
          'user_agent',
          'source',
          'ip_address',
        ],
      },
      student_profiles: {
        description: 'Student-specifieke profielgegevens',
        fields: [
          'user_id',
          'student_number',
          'university',
          'study_program',
          'graduation_year',
          'cv_file_path',
        ],
      },
      company_profiles: {
        description: 'Bedrijf-specifieke profielgegevens',
        fields: [
          'user_id',
          'company_name',
          'company_size',
          'industry',
          'website',
          'description',
        ],
      },
      user_preferences: {
        description: 'Gebruikersvoorkeuren en privacy instellingen',
        fields: [
          'user_id',
          'email_notifications',
          'profile_visibility',
          'contact_info_visibility',
        ],
      },
    },
  };

  console.log('Database tabellen structuur:');
  console.log(JSON.stringify(dbStructure, null, 2));

  console.log('\n' + '='.repeat(50) + '\n');
}

// Auto-run tests wanneer bestand wordt geladen
if (typeof window !== 'undefined') {
  console.log('🚀 Registratie JSON Tests Starten...\n');

  // Run alle tests
  testStudentRegistration();
  testCompanyRegistration();
  testValidationErrors();
  simulateRegistrationFlow();
  showDatabaseStructure();

  console.log('✅ Alle tests voltooid!');
  console.log(
    'Tip: Open de Network tab in Developer Tools om de echte API calls te zien wanneer je het registratieformulier gebruikt.'
  );
}

// Export voor gebruik in andere bestanden
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testStudentRegistration,
    testCompanyRegistration,
    testValidationErrors,
    simulateRegistrationFlow,
    showDatabaseStructure,
    testStudentData,
    testCompanyData,
  };
}
