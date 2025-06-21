# Registratie JSON API Implementatie

Deze implementatie zorgt ervoor dat het registratieformulier automatisch alle ingevulde gebruikersgegevens omzet in een gestructureerd JSON-object dat klaarstaat voor API-calls naar de backend.

## 📁 Bestanden Overzicht

### Hoofdbestanden

- **`src/pages/register.js`** - Het registratieformulier met bijgewerkte `handleRegister` functie
- **`src/utils/registration-api.js`** - Utility functies voor JSON-creatie en API-communicatie

### Voorbeelden en Documentatie

- **`src/examples/backend-api-example.js`** - Backend implementatie voorbeeld (Node.js/Express)
- **`src/examples/registration-test.js`** - Test bestand voor JSON-functionaliteit
- **`README-registratie.md`** - Deze documentatie

## 🚀 Hoe het werkt

### 1. Formulier Indienen

Wanneer een gebruiker het registratieformulier indient:

```javascript
// Het addEventListener('submit') event wordt getriggered
form.addEventListener('submit', handleRegister);
```

### 2. Data Validatie

```javascript
const validation = validateRegistrationData(rawData);
if (!validation.isValid) {
  showErrorMessage(validation.errors.join(', '));
  return;
}
```

### 3. JSON Object Creatie

```javascript
const userRegistrationData = createUserRegistrationJSON(rawData);
```

### 4. API Call

```javascript
// Development: Mock API
// Productie: Echte API naar /api/register
const result = await sendRegistrationToAPI(userRegistrationData);
```

## 📊 JSON Object Structuur

### Voor een Student:

```json
{
  "user": {
    "firstName": "Jan",
    "lastName": "Janssen",
    "email": "jan.janssen@student.ehb.be",
    "password": "veiligWachtwoord123",
    "role": "student"
  },
  "metadata": {
    "registrationDate": "2025-06-06T10:30:00.000Z",
    "registrationMethod": "web_form",
    "userAgent": "Mozilla/5.0...",
    "source": "career-launch-app",
    "browserLanguage": "nl-BE",
    "timezone": "Europe/Brussels"
  },
  "profile": {
    "studentInfo": {
      "studentNumber": null,
      "university": null,
      "studyProgram": null,
      "graduationYear": null,
      "skills": [],
      "cv": null,
      "profilePicture": null
    }
  },
  "preferences": {
    "notifications": {
      "email": true,
      "push": false,
      "marketing": false
    },
    "privacy": {
      "profileVisibility": "public",
      "contactInfoVisibility": "limited"
    }
  },
  "status": {
    "isActive": true,
    "isVerified": false,
    "emailVerified": false,
    "profileCompleted": false
  }
}
```

### Voor een Bedrijf:

```json
{
  "user": {
    "firstName": "Marie",
    "lastName": "Peeters",
    "email": "marie.peeters@techcorp.be",
    "password": "bedrijfWachtwoord456",
    "role": "bedrijf"
  },
  "profile": {
    "companyInfo": {
      "companyName": null,
      "companySize": null,
      "industry": null,
      "website": null,
      "description": null,
      "contactPerson": {
        "name": "Marie Peeters",
        "position": null,
        "phone": null,
        "email": "marie.peeters@techcorp.be"
      }
    }
  }
  // ... rest van de structuur
}
```

## 🛠️ Implementatie Details

### API Endpoint

```javascript
// Productie
const API_ENDPOINT = '/api/register';

// Of volledig pad naar backend
const API_ENDPOINT = 'http://localhost:3000/api/register';
```

### HTTP Request

```javascript
fetch(API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify(userData),
});
```

### Form Event Handler

```javascript
// Het formulier gebruikt addEventListener('submit')
// en preventDefault() om pagina reload te voorkomen
function handleRegister(event) {
  event.preventDefault(); // ✅ Geen pagina reload

  // ... verwerking
}
```

## 🗃️ Database Structuur

De JSON-data is ontworpen om eenvoudig naar SQL tabellen te mappen:

### Hoofdtabellen:

1. **`users`** - Hoofdgegevens (naam, email, wachtwoord, rol)
2. **`user_metadata`** - Registratie metadata (browser info, datum, etc.)
3. **`student_profiles`** - Student-specifieke gegevens
4. **`company_profiles`** - Bedrijf-specifieke gegevens
5. **`user_preferences`** - Voorkeuren en privacy instellingen

### Voorbeeld SQL:

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'bedrijf') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testen

### Browser Console Test:

```javascript
// Kopieer de testfuncties uit registration-test.js
testStudentRegistration();
testCompanyRegistration();
```

### Mock API voor Development:

```javascript
// Automatisch gedetecteerd op localhost
const isDevelopment = window.location.hostname === 'localhost';
if (isDevelopment) {
  result = await mockRegistrationAPI(userData);
}
```

## 🎯 Functies

### ✅ Wat het doet:

- Converteert formulierdata naar gestructureerd JSON
- Valideert alle velden voordat verzending
- Maakt API-call naar backend zonder pagina reload
- Toont loading states en success/error meldingen
- Logt JSON voor debugging (kan uitgeschakeld worden)
- Ondersteunt zowel student als bedrijf registraties
- Bevat complete metadata voor audit trail

### ✅ Extra velden in JSON:

- **Metadata**: registratiedatum, browser info, IP (via backend)
- **Profiel placeholders**: ruimte voor latere profielaanvulling
- **Voorkeuren**: notificatie en privacy instellingen
- **Status velden**: verificatie en account status

### ✅ Error Handling:

- Formulier validatie
- Netwerk fouten
- Server fouten (4xx, 5xx)
- Friendly gebruikersmeldingen

## 🔧 Backend Integratie

### Express.js Voorbeeld:

```javascript
app.post('/api/register', async (req, res) => {
  const registrationData = req.body;

  // Hash wachtwoord
  const hashedPassword = await bcrypt.hash(registrationData.user.password, 12);

  // Insert in database
  const userId = await insertUser(registrationData, hashedPassword);

  // Stuur verificatie email
  await sendVerificationEmail(registrationData.user.email);

  res.json({ success: true, userId });
});
```

## 📝 Gebruik

1. **Import de utility functies** in je register.js:

```javascript
import {
  createUserRegistrationJSON,
  sendRegistrationToAPI,
  validateRegistrationData,
} from '../utils/registration-api.js';
```

2. **Het formulier werkt automatisch** met de bestaande HTML structuur

3. **Pas de API endpoint aan** naar jouw backend URL in `registration-api.js`

4. **Implementeer de backend** met het meegeleverde voorbeeld

## 🔒 Beveiliging

- Wachtwoorden worden niet gehashed in frontend (backend doet dit)
- Email validatie en normalisatie
- Input sanitization door FormData API
- SQL injection preventie via prepared statements
- HTTPS vereist voor productie

## 📱 Browser Ondersteuning

- Modern browsers (ES6+ features)
- Fetch API (native support of polyfill)
- FormData API
- JSON.stringify/parse

---

**Tip**: Open de browser Developer Tools (F12) → Network tab om de API calls live te zien wanneer je het formulier gebruikt!
