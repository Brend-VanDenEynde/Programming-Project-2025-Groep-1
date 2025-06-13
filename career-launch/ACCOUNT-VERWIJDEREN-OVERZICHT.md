# Account Verwijderen API - Implementatie Overzicht

## ✅ Wat is geïmplementeerd

### 1. API Functionaliteit (`src/utils/data-api.js`)
- ✅ `deleteUser(userId)` functie toegevoegd
- ✅ Roept DELETE `/user/{userID}` endpoint aan
- ✅ Gebruikt bestaande `apiDelete` utility met automatische token refresh

### 2. API Utility Verbetering (`src/utils/api.js`)
- ✅ `apiDelete` functie geüpdatet om 204 No Content responses correct af te handelen
- ✅ Automatische detectie van JSON content-type
- ✅ Proper response handling voor verschillende success scenarios

### 3. Admin Student Detail Pagina (`src/pages/admin/admin-student-detail.js`)
- ✅ Import van `deleteUser` functie toegevoegd
- ✅ Delete button event handler geüpdatet met API call
- ✅ Comprehensive error handling (403, 404, algemene fouten)
- ✅ Success feedback en automatische navigatie
- ✅ Mock student data geüpdatet met `userId` velden voor demo

### 4. Admin Company Detail Pagina (`src/pages/admin/admin-company-detail.js`)
- ✅ Import van `deleteUser` functie toegevoegd
- ✅ Delete button event handler geüpdatet met API call
- ✅ Comprehensive error handling (403, 404, algemene fouten)
- ✅ Success feedback en automatische navigatie
- ✅ Mock company data geüpdatet met `userId` velden voor demo

### 5. Documentatie en Demo
- ✅ Uitgebreide documentatie (`docs/delete-user-api-implementation.md`)
- ✅ Demo functie (`src/examples/delete-user-integration-demo.js`)

## 🎯 API Specificatie

```
DELETE https://api.ehb-match.me/user/{userID}

Parameters:
- userID (integer, path): De ID van de gebruiker om te verwijderen

Responses:
- 204 No Content: Gebruiker succesvol verwijderd
- 403 Forbidden: Geen admin rechten
- 404 User not found: Gebruiker bestaat niet
```

## 🔧 Gebruik

### In Admin Pagina's:
```javascript
import { deleteUser } from '../../utils/data-api.js';

// Event handler voor delete button
deleteBtn.addEventListener('click', async () => {
  if (confirm('Weet je zeker dat je dit account wilt verwijderen?')) {
    try {
      await deleteUser(userId);
      alert('Account succesvol verwijderd.');
      Router.navigate('/admin-dashboard/overview');
    } catch (error) {
      // Error handling...
    }
  }
});
```

## 🛡️ Beveiliging & Error Handling

- **Admin Only**: Alleen admin gebruikers kunnen accounts verwijderen
- **Confirmatie**: Dubbele confirmatie vereist voor verwijdering
- **Error Feedback**: Duidelijke error messages voor verschillende scenarios:
  - 403: "Je hebt geen toestemming om dit account te verwijderen"
  - 404: "Gebruiker niet gevonden"
  - Algemeen: "Er is een fout opgetreden. Probeer het opnieuw"

## 📊 Mock Data Updates

Voor demo doeleinden zijn userId velden toegevoegd:

**Studenten:**
- tiberius-kirk: userId 101
- john-smith: userId 102  
- jean-luc-picard: userId 103
- daniel-vonkman: userId 104
- len-jaxtyn: userId 105
- kimberley-hester: userId 106
- ed-marvin: userId 107
- demo: userId 999

**Bedrijven:**
- carrefour: userId 201
- delhaize: userId 202
- colruyt: userId 203
- proximus: userId 204
- kbc: userId 205
- demo: userId 999

## 🚀 Testen

1. Log in als admin
2. Ga naar student of bedrijf detail pagina
3. Klik op "Verwijder account" of "Verwijderen" knop
4. Bevestig verwijdering
5. Controleer API call en feedback

## 📝 Volgende Stappen

Voor productie deployment:
- [ ] Vervang mock userId's met echte database ID's
- [ ] Implementeer soft delete als gewenst
- [ ] Voeg audit logging toe
- [ ] Test met echte backend API
- [ ] Voeg bulk delete functionaliteit toe (optioneel)

## 🔗 Gerelateerde Bestanden

- `src/utils/data-api.js` - Delete functie
- `src/utils/api.js` - API utilities
- `src/pages/admin/admin-student-detail.js` - Student delete implementation
- `src/pages/admin/admin-company-detail.js` - Company delete implementation
- `docs/delete-user-api-implementation.md` - Uitgebreide documentatie
- `src/examples/delete-user-integration-demo.js` - Demo functie
