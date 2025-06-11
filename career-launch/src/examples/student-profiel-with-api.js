/**
 * Voorbeeld van hoe de student-profiel.js pagina geüpdatet zou kunnen worden
 * om de refresh token functionaliteit te gebruiken
 */

import defaultAvatar from '../Images/default.jpg';
import logoIcon from '../Icons/favicon-32x32.png';
import { renderLogin } from './login.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { performLogout } from '../utils/auth-api.js';
import { fetchStudentById, updateStudentProfile } from '../utils/data-api.js';

const defaultProfile = {
  firstName: 'Voornaam',
  lastName: 'Achternaam',
  email: 'student@voorbeeld.com',
  studyProgram: 'Opleiding',
  year: '1',
  profilePictureUrl: defaultAvatar,
  linkedIn: '',
  birthDate: '',
  description: '',
};

export async function renderStudentProfiel(rootElement, studentData = {}) {
  // Als we geen studentData hebben, probeer deze van de API te halen
  let profileData = studentData;

  if (!studentData.id && window.sessionStorage.getItem('currentStudentId')) {
    try {
      const studentId = window.sessionStorage.getItem('currentStudentId');
      console.log('Fetching student profile from API...');
      profileData = await fetchStudentById(studentId);
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
      // Fallback naar default profiel als API call faalt
      profileData = defaultProfile;

      // Als het een authenticatie error is, redirect naar login
      if (error.message.includes('Authentication failed')) {
        renderLogin(rootElement);
        return;
      }
    }
  }

  const {
    firstName = defaultProfile.firstName,
    lastName = defaultProfile.lastName,
    email = defaultProfile.email,
    studyProgram = defaultProfile.studyProgram,
    year = defaultProfile.year,
    profilePictureUrl = defaultProfile.profilePictureUrl,
    linkedIn = defaultProfile.linkedIn,
    birthDate = defaultProfile.birthDate,
    description = defaultProfile.description,
  } = profileData;

  // ... rest van de HTML rendering blijft hetzelfde ...
  rootElement.innerHTML = `
    <div class="student-profile-container">
      <!-- Hier komt de bestaande HTML -->
      <!-- ... -->
    </div>
  `;

  // Event listeners...

  // OPSLAAN-KNOP met API call
  document
    .getElementById('save-profile-btn')
    .addEventListener('click', async () => {
      const updatedData = {
        firstName: document.getElementById('firstNameInput').value.trim(),
        lastName: document.getElementById('lastNameInput').value.trim(),
        email: document.getElementById('emailInput').value.trim(),
        studyProgram: document.getElementById('studyProgramInput').value.trim(),
        year: document.getElementById('yearInput').value.trim(),
        birthDate: document.getElementById('birthDateInput').value,
        description: document.getElementById('descriptionInput').value.trim(),
        linkedIn: document.getElementById('linkedinInput').value.trim(),
        profilePictureUrl: profileData.profilePictureUrl,
      };

      // Validatie
      if (!updatedData.firstName || !updatedData.lastName) {
        alert('Voor- en achternaam mogen niet leeg zijn.');
        return;
      }

      try {
        // API call met automatische token refresh
        const studentId = window.sessionStorage.getItem('currentStudentId');
        console.log('Updating student profile via API...');

        const response = await updateStudentProfile(studentId, updatedData);

        console.log('Profile updated successfully:', response);
        alert('Profiel succesvol bijgewerkt!');

        // Re-render met nieuwe data
        renderStudentProfiel(rootElement, response);
      } catch (error) {
        console.error('Failed to update profile:', error);

        if (error.message.includes('Authentication failed')) {
          alert(
            'Je sessie is verlopen. Je wordt doorgestuurd naar de login pagina.'
          );
          renderLogin(rootElement);
        } else {
          alert(
            'Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.'
          );
        }
      }
    });

  // UITLOGGEN met API call
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await performLogout();
      renderLogin(rootElement);
    } catch (error) {
      console.error('Logout error:', error);
      // Ook bij fouten uitloggen voor veiligheid
      renderLogin(rootElement);
    }
  });

  // ... rest van de event listeners ...
}
