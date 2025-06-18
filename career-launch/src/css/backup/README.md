# CSS Structuur - EhB Career Launch

Dit project heeft een modulaire CSS architectuur voor betere onderhoudbaarheid en organisatie.

## ⚠️ Belangrijke Update - CSS Import Probleem Opgelost

**Probleem**: CSS `@import` statements werkten niet goed met Vite bundler
**Oplossing**: Originele `style.css` hersteld, modulaire bestanden beschikbaar voor toekomstige ontwikkeling

## Huidige Status

```
src/css/
├── style.css             # ✅ ACTIEF - Volledige werkende CSS
├── style-backup.css      # 💾 Backup van origineel bestand
├── admin-style.css       # 👨‍💼 Admin dashboard stijlen
│
├── main.css              # 📦 Modulair hoofdbestand (momenteel niet gebruikt)
├── base.css              # 🏗️ Reset, typography, basis utilities
├── layout.css            # 📐 Layout componenten (home, containers, footers)
├── forms.css             # 📝 Basis formulieren (login, registratie)
├── forms-advanced.css    # 🔍 Geavanceerde formulieren (zoekcriteria)
├── student-profile.css   # 👤 Student profiel systeem
├── tables.css            # 📊 Tabellen (speeddates)
├── modals.css            # 🪟 Modals en popups
├── dark-mode.css         # 🌙 Dark mode theming
└── responsive.css        # 📱 Media queries en responsive design
```

## Alternatieve Modulaire Aanpak

Voor betere organisatie kun je de volgende aanpak gebruiken:

### 1. JavaScript-based imports in main.js

In plaats van CSS @import, importeer modules direct in JavaScript:

```javascript
// In main.js - vervang huidige import
import './css/base.css';
import './css/layout.css';
import './css/forms.css';
import './css/forms-advanced.css';
import './css/student-profile.css';
import './css/tables.css';
import './css/modals.css';
import './css/dark-mode.css';
import './css/responsive.css';
// Verwijder: import './css/style.css';
```

### 2. Component-specifieke imports

Voor specifieke pagina's kun je CSS modules importeren:

```javascript
// In een specifieke pagina component
import '../css/student-profile.css';
```

### 3. Hybride aanpak

Combineer hoofdstijlen met specifieke modules:

```javascript
// Basis styling
import './css/style.css';
// Extra modules voor specifieke features
import './css/dark-mode.css';
```

## 💡 Voordelen van Modulaire CSS

### JavaScript imports (aanbevolen)

1. **Bundler compatibiliteit** - Werkt perfect met Vite
2. **Tree shaking** - Ongebruikte CSS wordt weggelaten
3. **Hot reload** - Wijzigingen worden direct zichtbaar
4. **Scope management** - Betere controle over CSS scope
5. **Performance** - Alleen benodigde CSS wordt geladen

### Modulaire organisatie

1. **Onderhoudbaarheid** - Makkelijker om specifieke componenten te vinden
2. **Samenwerking** - Meerdere developers kunnen aan verschillende modules werken
3. **Debuggen** - Sneller problemen lokaliseren in specifieke bestanden
4. **Herbruikbaarheid** - Modules kunnen individueel worden gebruikt

## 🚀 Migratie Strategieën

### Optie 1: Huidige situatie behouden (aanbevolen voor nu)

```javascript
// main.js - huidige werkende setup
import './css/style.css';
import './css/admin-style.css';
```

**Voordelen**: Werkt gegarandeerd, geen risico's, eenvoudig
**Nadelen**: Één groot CSS bestand, moeilijker te onderhouden bij groei

### Optie 2: Volledige modulaire migratie

```javascript
// main.js - vervang alle imports
import './css/base.css';
import './css/layout.css';
import './css/forms.css';
import './css/forms-advanced.css';
import './css/student-profile.css';
import './css/tables.css';
import './css/modals.css';
import './css/dark-mode.css';
import './css/responsive.css';
import './css/admin-style.css';
```

**Voordelen**: Modulair, onderhoudbaarder, betere performance
**Nadelen**: Meer setup, potentiële import volgorde problemen

### Optie 3: Hybride aanpak (beste van beide)

```javascript
// main.js - geleidelijke migratie
import './css/style.css'; // Basis styling
import './css/dark-mode.css'; // Nieuwe features als modules
import './css/admin-style.css';
```

**Voordelen**: Veilig, geleidelijke overgang, flexibel
**Nadelen**: Tijdelijk dubbele code mogelijk

## 📋 Best Practices

### Voor nieuwe features

1. **Maak een nieuwe CSS module** voor grote nieuwe componenten
2. **Gebruik utility classes** uit `base.css` waar mogelijk
3. **Test import volgorde** bij het toevoegen van nieuwe modules
4. **Documenteer dependencies** tussen modules

### Voor onderhoud

1. **Zoek eerst in style.css** voor bestaande styling
2. **Controleer responsive.css** voor mobile aanpassingen
3. **Update dark-mode.css** voor nieuwe dark mode support
4. **Test cross-browser** compatibiliteit na wijzigingen

### Voor performance

1. **Gebruik alleen benodigde modules** per pagina
2. **Minimaliseer CSS duplicatie** tussen modules
3. **Optimaliseer voor bundle size** bij productie builds
4. **Monitor CSS bundle size** met build tools

## 🔧 Gebruiksinstructies

### Nieuwe styling toevoegen

```css
/* Voeg toe aan het juiste bestand: */
/* style.css - voor algemene styling */
/* dark-mode.css - voor dark mode overrides */
/* responsive.css - voor media queries */
```

### Module maken voor nieuwe component

```css
/* 1. Maak nieuw bestand: new-component.css */
.new-component {
  /* styling hier */
}

/* 2. Importeer in main.js */
import './css/new-component.css';
```

### CSS debugging

```javascript
// Tijdelijk individuele modules laden voor debugging
import './css/base.css';
// import './css/layout.css';  // Uitcommentariëren om te testen
```

## 📝 Changelog

- **v2.0** - Modulaire CSS structuur gemaakt
- **v2.1** - CSS import problemen opgelost, terug naar werkende versie
- **v2.2** - Documentatie geconsolideerd, migratie strategieën toegevoegd

## 🆘 Troubleshooting

**Probleem**: Styling verdwijnt na wijzigingen
**Oplossing**: Controleer of style.css correct wordt geïmporteerd in main.js

**Probleem**: Conflicterende CSS tussen modules  
**Oplossing**: Controleer import volgorde en CSS specificiteit

**Probleem**: Dark mode werkt niet
**Oplossing**: Zorg dat dark-mode.css na andere styling wordt geladen

**Vraag**: Hoe terug naar originele CSS?
**Antwoord**: `style-backup.css` bevat de originele code
