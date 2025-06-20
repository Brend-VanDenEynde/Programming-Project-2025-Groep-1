# Speeddate Authorization Security Fix

## Probleem Beschrijving

Er werd een kritieke autorisatiefout ontdekt in het speeddate systeem waarbij:

1. **Studenten hun eigen verzoeken konden accepteren** - Dit ondermijnt de workflow waarbij het bedrijf de beslissende partij moet zijn
2. **Gebruikers verzoeken van anderen konden manipuleren** - Potentie voor cross-user autorisatie problemen
3. **Ontbrekende server-side validatie** - Client-side filtering alleen is onvoldoende voor beveiliging

## Geïmplementeerde Oplossingen

### 1. Client-side Autorisatiecontroles

#### Student-side (`student-speeddates-verzoeken.js`)

- **Extra verificatie** bij accept/reject acties
- **Controle op `asked_by` veld** om te voorkomen dat studenten hun eigen verzoeken behandelen
- **Logging van beveiligingsschendingen** voor monitoring

#### Bedrijf-side (`bedrijf-speeddates-verzoeken.js`)

- **Vergelijkbare verificaties** voor bedrijven
- **Validatie van bedrijf ID** uit session storage
- **Foute handelingen worden gelogd** en geblokkeerd

### 2. API Utility Verbeteringen (`data-api.js`)

#### `acceptSpeeddateRequest()` & `rejectSpeeddateRequest()`

- **Pre-flight validatie** - Controleert speeddate details voor autorisatie
- **Cross-user verificatie** - Voorkomt dat gebruikers verzoeken van anderen behandelen
- **Role-based access control** - Student vs Bedrijf specifieke validaties

#### `createSpeeddate()`

- **Self-request preventie** - Voorkomt verzoeken naar jezelf
- **Identity verification** - Controleert of gebruiker namens de juiste partij handelt
- **Enhanced error handling** - Duidelijke foutmeldingen voor beveiligingsschendingen

### 3. Beveiligingslagen

#### Laag 1: Filtering

```javascript
// Student kant - filtert alleen bedrijfsverzoeken
const filtered = data.filter(
  (s) => bedrijfIds.has(s.asked_by) && s.asked_by !== studentId
);

// Bedrijf kant - filtert eigen verzoeken
const filteredData = data.filter((item) => item.asked_by !== bedrijfId);
```

#### Laag 2: Pre-action Verification

```javascript
// Verificatie voor accept/reject acties
const verifyResp = await fetch(`/speeddates/pending/${id}`);
if (verzoekData.asked_by === currentUserId) {
  throw new Error('Je kunt je eigen verzoeken niet accepteren');
}
```

#### Laag 3: API Utility Guards

```javascript
// Controle in data-api.js functies
if (pendingDetails.asked_by === currentUserId) {
  console.error('SECURITY VIOLATION: User attempting to accept own request');
  throw new Error('Beveiligingsovertreding gedetecteerd');
}
```

## Beveiligingsbenefits

### 🛡️ **Defense in Depth**

Meerdere lagen van beveiliging zorgen ervoor dat zelfs als één laag gefaald wordt, andere lagen de beveiliging handhaven.

### 📊 **Audit Trail**

Alle beveiligingsschendingen worden gelogd naar de console voor monitoring en onderzoek.

### 🚫 **Preventieve Controles**

Proactieve validatie voorkomt ongeldige acties voordat ze de server bereiken.

### 💭 **User Experience**

Duidelijke foutmeldingen helpen gebruikers begrijpen waarom bepaalde acties niet toegestaan zijn.

## Aanbevelingen voor Server-side

**KRITIEK**: Deze client-side fixes zijn een belangrijke verbetering maar **server-side validatie is essentieel**:

### 1. JWT Token Validatie

```javascript
// Backend validatie voorbeeld
app.post('/speeddates/accept/:id', authenticateToken, async (req, res) => {
  const speeddate = await getSpeeddate(req.params.id);
  const userId = req.user.id;

  // Valideer dat de gebruiker geautoriseerd is
  if (speeddate.asked_by === userId) {
    return res.status(403).json({ error: 'Cannot accept own request' });
  }

  if (req.user.role === 'bedrijf' && speeddate.id_bedrijf !== userId) {
    return res.status(403).json({ error: 'Not authorized for this request' });
  }

  // Voer acceptatie uit...
});
```

### 2. Database Constraints

- **Foreign key constraints** om data integriteit te waarborgen
- **Check constraints** om business rules af te dwingen
- **Audit logs** voor alle speeddate acties

### 3. Rate Limiting

- **Beperk het aantal verzoeken** per gebruiker per tijdsperiode
- **API throttling** om misbruik te voorkomen

## Testing

### Scenario's om te testen:

1. ✅ **Student probeert eigen verzoek te accepteren** - Moet geblokkeerd worden
2. ✅ **Bedrijf probeert eigen verzoek te weigeren** - Moet geblokkeerd worden
3. ✅ **Cross-user manipulatie pogingen** - Moeten gedetecteerd en gelogd worden
4. ✅ **Normale workflow** - Moet blijven functioneren
5. ✅ **Error handling** - Gebruikers krijgen duidelijke feedback

## Monitoring

### Console Logs

Alle beveiligingsschendingen worden gelogd met:

- **Timestamp**
- **User ID**
- **Action attempted**
- **Security violation type**

### Aanbevolen Metrics

- Aantal beveiligingsschendingen per dag
- Meest voorkomende schendingstypes
- Gebruikers met verdachte activiteit

## Conclusie

Deze implementatie voegt kritieke beveiligingslagen toe aan het speeddate systeem en voorkomt de meest voor de hand liggende aanvalsvectoren. **Voor productie is aanvullende server-side validatie echter absoluut noodzakelijk**.

---

_Geïmplementeerd op: 20 juni 2025_  
_Status: Client-side beveiliging ✅ | Server-side validatie ⚠️ (aanbevolen)_
