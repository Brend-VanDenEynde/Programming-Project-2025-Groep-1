/**
 * Test bestand om de JSON output te testen en te demonstreren
 * Dit laat zien hoe de registratiedata wordt omgezet naar JSON
 */

import { createUserRegistrationJSON } from '../utils/registration-api.js';

/**
 * Test functie om JSON generatie te demonstreren
 */
export function testJSONGeneration() {
  console.log('=== JSON GENERATIE TEST ===');

  // Test data voor een student
  const studentFormData = {
    firstName: 'Jan',
    lastName: 'Janssen',
    email: 'jan.janssen@student.hu.nl',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    rol: 'student',
  };

  // Test data voor een bedrijf
  const bedrijfFormData = {
    firstName: 'Maria',
    lastName: 'Peters',
    email: 'maria@techbedrijf.nl',
    password: 'CompanyPass456!',
    confirmPassword: 'CompanyPass456!',
    rol: 'bedrijf',
  };

  // Genereer JSON voor student
  const studentJSON = createUserRegistrationJSON(studentFormData);
  console.log('Student JSON:', JSON.stringify(studentJSON, null, 2));

  // Genereer JSON voor bedrijf
  const bedrijfJSON = createUserRegistrationJSON(bedrijfFormData);
  console.log('Bedrijf JSON:', JSON.stringify(bedrijfJSON, null, 2));

  // Voorbeeld SQL INSERT statements
  console.log('\n=== SQL VOORBEELDEN ===');

  console.log('Student INSERT SQL:');
  console.log(`INSERT INTO users (firstName, lastName, email, password, role) 
VALUES ('${studentJSON.firstName}', '${studentJSON.lastName}', '${studentJSON.email}', 'hashed_password', '${studentJSON.role}');`);

  console.log('\nBedrijf INSERT SQL:');
  console.log(`INSERT INTO users (firstName, lastName, email, password, role) 
VALUES ('${bedrijfJSON.firstName}', '${bedrijfJSON.lastName}', '${bedrijfJSON.email}', 'hashed_password', '${bedrijfJSON.role}');`);

  console.log('\n=== API CALL VOORBEELD ===');
  console.log('Fetch request naar backend:');
  console.log(`
fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(studentJSON)})
});`);

  return { studentJSON, bedrijfJSON };
}

/**
 * Test functie voor formulier simulatie
 */
export function simulateFormSubmission() {
  // Simuleer een formulier submit event
  const testData = {
    firstName: 'Test',
    lastName: 'Gebruiker',
    email: 'test@voorbeeld.nl',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    rol: 'student',
  };

  const jsonOutput = createUserRegistrationJSON(testData);

  console.log('\n=== FORMULIER SIMULATIE ===');
  console.log('Input data:', testData);
  console.log('JSON output:', JSON.stringify(jsonOutput, null, 2));

  return jsonOutput;
}

// Auto-run test wanneer dit bestand wordt geladen
if (typeof window !== 'undefined') {
  // Browser environment
  window.testRegistrationJSON = {
    testJSONGeneration,
    simulateFormSubmission,
  };

  console.log('JSON test functies geladen! Roep aan met:');
  console.log('- window.testRegistrationJSON.testJSONGeneration()');
  console.log('- window.testRegistrationJSON.simulateFormSubmission()');
}
