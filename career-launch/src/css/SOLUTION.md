# CSS Modules - Alternatieve Aanpak

Omdat @import statements problemen veroorzaken met de bundler, heb ik de originele CSS teruggeplaatst.

## Alternatieve modulaire aanpak

Voor betere organisatie kun je de volgende aanpak gebruiken:

### 1. Individuele imports in main.js

In plaats van CSS @import, importeer de modules direct in JavaScript:

```javascript
// In main.js
import './css/base.css';
import './css/layout.css';
import './css/forms.css';
import './css/forms-advanced.css';
import './css/student-profile.css';
import './css/tables.css';
import './css/modals.css';
import './css/dark-mode.css';
import './css/responsive.css';
```

### 2. Component-specifieke imports

Voor specifieke pagina's kun je CSS modules importeren:

```javascript
// In een specifieke pagina
import './student-profile.css';
```

### 3. Gedeelde utility bestanden

Maak utility bestanden die je kunt importeren waar nodig:

```css
/* utilities.css */
.flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.text-center {
  text-align: center;
}
```

## Voordelen van JavaScript imports

1. **Bundler compatibiliteit** - Werkt perfect met Vite
2. **Tree shaking** - Ongebruikte CSS wordt weggelaten
3. **Hot reload** - Wijzigingen worden direct zichtbaar
4. **Scope management** - Betere controle over CSS scope

## Huidige status

- `style.css` bevat alle originele styling (werkend)
- Modulaire bestanden zijn beschikbaar in de css/ folder
- `style-backup.css` is een backup van de originele file

## Volgende stappen

Als je modulaire CSS wilt gebruiken, kunnen we:

1. De imports aanpassen in main.js
2. Geleidelijk migreren naar kleinere bestanden
3. Component-specifieke CSS maken
