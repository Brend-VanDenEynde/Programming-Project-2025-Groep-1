# Refresh Token Implementation Guide

## Overzicht

De refresh token functionaliteit is geïmplementeerd om automatisch verlopen authentication tokens te vernieuwen zonder dat de gebruiker opnieuw hoeft in te loggen. Dit zorgt voor een betere gebruikerservaring en verhoogt de beveiliging.

## Wat is er toegevoegd?

### 1. Refresh Token Functie (`auth-api.js`)

```javascript
export async function refreshToken()
```

- Roept de `/auth/refresh` endpoint aan
- Werkt automatisch de `authToken` bij in sessionStorage
- Retourneert nieuwe token informatie

### 2. API Utility Functies (`api.js`)

```javascript
export async function authenticatedFetch(url, options)
export async function apiGet(url, options)
export async function apiPost(url, data, options)
export async function apiPut(url, data, options)
export async function apiDelete(url, options)
export async function apiPatch(url, data, options)
```

### 3. Helper Functies (`auth-api.js`)

```javascript
export async function retryWithTokenRefresh(apiCall, ...args)
export function isTokenExpiredError(response)
```

## Hoe werkt het?

1. **Automatische detectie**: Wanneer een API call een 401 (Unauthorized) status retourneert
2. **Token refresh**: Automatisch de `refreshToken()` functie aanroepen
3. **Retry**: De originele API call opnieuw proberen met de nieuwe token
4. **Fallback**: Bij falen doorsturen naar login pagina

## Waar moet je het gebruiken?

### ✅ Vervang alle directe `fetch()` calls naar beveiligde endpoints

**❌ Oud (directe fetch):**

```javascript
const response = await fetch('http://localhost:3001/opleiding/', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${window.sessionStorage.getItem('authToken')}`,
  },
});
const data = await response.json();
```

**✅ Nieuw (met automatische refresh):**

```javascript
import { apiGet } from '../utils/api.js';

const data = await apiGet('http://localhost:3001/opleiding/');
```

### Belangrijke endpoints om te vervangen:

1. **Student gegevens**

   - `GET /studenten/` - Lijst van studenten
   - `GET /studenten/:id` - Specifieke student
   - `PUT /studenten/:id` - Update student profiel

2. **Bedrijf gegevens**

   - `GET /bedrijven/` - Lijst van bedrijven
   - `GET /bedrijven/:id` - Specifiek bedrijf
   - `PUT /bedrijven/:id` - Update bedrijf profiel

3. **Skills en opleidingen**

   - `GET /skills/` - Lijst van skills
   - `GET /opleiding/` - Lijst van opleidingen

4. **Zoek-criteria**
   - `POST /studenten/:id/criteria` - Opslaan zoek-criteria
   - `GET /studenten/:id/criteria` - Ophalen zoek-criteria

## Implementatie voorbeelden

### Voorbeeld 1: Student Profiel laden

```javascript
import { fetchStudentById } from '../utils/data-api.js';

export async function renderStudentProfiel(rootElement, studentData = {}) {
  let profileData = studentData;

  if (!studentData.id) {
    try {
      const studentId = window.sessionStorage.getItem('currentStudentId');
      profileData = await fetchStudentById(studentId);
    } catch (error) {
      if (error.message.includes('Authentication failed')) {
        renderLogin(rootElement);
        return;
      }
      // Fallback naar default data
    }
  }

  // ... rest van de rendering
}
```

### Voorbeeld 2: Profiel opslaan

```javascript
import { updateStudentProfile } from '../utils/data-api.js';

document
  .getElementById('save-profile-btn')
  .addEventListener('click', async () => {
    try {
      const studentId = window.sessionStorage.getItem('currentStudentId');
      const response = await updateStudentProfile(studentId, updatedData);
      alert('Profiel succesvol bijgewerkt!');
    } catch (error) {
      if (error.message.includes('Authentication failed')) {
        alert(
          'Je sessie is verlopen. Je wordt doorgestuurd naar de login pagina.'
        );
        renderLogin(rootElement);
      } else {
        alert('Er is een fout opgetreden bij het opslaan.');
      }
    }
  });
```

### Voorbeeld 3: Skills laden

```javascript
import { fetchSkills } from '../utils/data-api.js';

export async function renderSearchCriteria(rootElement) {
  try {
    const skills = await fetchSkills();
    // Gebruik skills om checkboxes te genereren
  } catch (error) {
    if (error.message.includes('Authentication failed')) {
      renderLogin(rootElement);
      return;
    }
    // Fallback naar hardcoded skills
  }
}
```

## Bestanden die geüpdatet moeten worden

### Hoogste prioriteit:

1. `src/pages/student-profiel.js` - ✅ Voorbeeld beschikbaar
2. `src/pages/search-criteria-student.js` - ✅ Voorbeeld beschikbaar
3. `src/pages/student-opleiding.js` - ✅ Al geüpdatet
4. `src/pages/bedrijf-profiel.js`
5. `src/pages/search-criteria-bedrijf.js`

### Lagere prioriteit:

1. `src/pages/student-speeddates.js`
2. `src/pages/student-speeddates-verzoeken.js`
3. Admin pagina's in `src/pages/admin/`

## Error Handling

Gebruik altijd proper error handling:

```javascript
try {
  const data = await apiGet('/some-endpoint');
  // Success handling
} catch (error) {
  console.error('API Error:', error);

  if (error.message.includes('Authentication failed')) {
    // Token refresh failed, redirect to login
    renderLogin(rootElement);
  } else {
    // Other error, show user-friendly message
    alert('Er is een fout opgetreden. Probeer het opnieuw.');
  }
}
```

## Testing

Om de refresh functionaliteit te testen:

1. Log in met geldige credentials
2. Wacht tot de token verloopt (of forceer een 401 response)
3. Maak een API call via een pagina die de nieuwe functies gebruikt
4. Verificeer dat:
   - De token automatisch wordt vernieuwd
   - De originele API call succesvol wordt herhaald
   - De gebruiker geen onderbreking ervaart

## Geavanceerde gebruik

Voor complexere scenarios kun je de `retryWithTokenRefresh` functie direct gebruiken:

```javascript
import { retryWithTokenRefresh } from '../utils/auth-api.js';

// Wrap bestaande API functie
const result = await retryWithTokenRefresh(
  someExistingApiFunction,
  param1,
  param2
);
```

## Notes

- De refresh token wordt opgeslagen als httpOnly cookie door de backend
- Access tokens worden opgeslagen in sessionStorage
- Bij falen van token refresh wordt de gebruiker automatisch uitgelogd
- Alle API utilities loggen errors voor debugging
