# Career Launch 2025 - Codebase Uitleg

## Projectoverzicht

Career Launch 2025 is een moderne webapplicatie die studenten en bedrijven met elkaar verbindt voor carrièremogelijkheden en werving. De applicatie is gebouwd als een Single Page Application (SPA) met vanilla JavaScript en Vite als build tool.

## Architectuur

### Technology Stack

**Frontend Framework**: Vanilla JavaScript (ES6+)
**Build Tool**: Vite
**Styling**: CSS3 met modulaire opzet
**Routing**: Custom client-side router
**State Management**: SessionStorage voor persistente data
**Deployment**: Statische hosting compatibel

### Project Structuur

```
career-launch/
├── index.html              # HTML entry point
├── package.json            # NPM configuratie
├── vite.config.js          # Build configuratie
├── public/                 # Statische assets
│   └── Icons/             # App icons en favicon
└── src/                   # Broncode
    ├── main.js            # Applicatie entry point
    ├── router.js          # Client-side routing
    ├── css/               # Stylesheets
    ├── pages/             # Pagina componenten
    ├── utils/             # Utility functies
    ├── Icons/             # UI iconen
    └── Images/            # Media assets
```

## Core Componenten

### Router Systeem

De applicatie gebruikt een aangepaste client-side router voor Single Page Application functionaliteit:

**Kernfuncties:**

- History API support voor browser navigatie
- Automatische link intercepting
- Route guards voor admin authenticatie
- Dynamische title updates
- 404 error handling

**Router implementatie:**

```javascript
class Router {
  constructor(routes) {
    this.routes = routes;
    this.setupLinkHandling();
    this.handleRouteChange();
  }

  navigate(path) {
    window.history.pushState(null, '', path);
    this.handleRouteChange();
  }
}
```

### API Management

De applicatie heeft een gelaagde API architectuur voor verschillende functionaliteiten:

**api.js**: Generic API wrapper met automatische token refresh
**auth-api.js**: Authenticatie specifieke endpoints
**data-api.js**: Data fetching voor studenten en bedrijven
**registration-api.js**: Registratie gerelateerde API calls

**Best Practice - Automatische Token Refresh:**

```javascript
export async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, requestOptions);

  if (response.status === 401) {
    const refreshResult = await refreshToken();
    if (refreshResult.success) {
      // Retry met nieuwe token
      return fetch(url, updatedOptions);
    }
  }

  return response;
}
```

### Component Architectuur

Elke pagina volgt een consistente component structuur:

```javascript
export function renderComponentName(rootElement, data = {}, options = {}) {
  // 1. Data destructuring met defaults
  const { prop1 = 'default', prop2 = 'default' } = data;

  // 2. HTML template generatie
  rootElement.innerHTML = `<!-- Component HTML -->`;

  // 3. Event listeners setup
  setupEventListeners();

  // 4. Component initialisatie
  initializeComponent();

  // 5. Cleanup functie (optioneel)
  return cleanupFunction;
}
```

## Pagina Structuur

### Authenticatie Flow

- **login.js**: Gebruiker authenticatie
- **register.js**: Registratie keuze (student/bedrijf)

### Student Module

- **student-profiel.js**: Profiel management en weergave
- **student-register.js**: Student registratie workflow
- **student-opleiding.js**: Opleiding selectie
- **student-skills.js**: Vaardigheden en job voorkeuren
- **student-speeddates.js**: Geplande afspraken overzicht
- **student-speeddates-verzoeken.js**: Inkomende speeddate verzoeken
- **student-qr-popup.js**: Netwerk QR code functionaliteit
- **search-criteria-student.js**: Zoekfilters en voorkeuren

### Bedrijf Module

- **bedrijf-profiel.js**: Bedrijfsprofiel management
- **bedrijf-register.js**: Bedrijf registratie proces
- **search-criteria-bedrijf.js**: Kandidaat zoekfilters

### Admin Dashboard

- **admin-login.js**: Admin authenticatie
- **admin-dashboard.js**: Hoofd dashboard met statistieken
- **admin-select-dashboard.js**: Dashboard navigatie
- **admin-ingeschreven-studenten.js**: Student overzicht en management
- **admin-ingeschreven-bedrijven.js**: Bedrijf overzicht en management
- **admin-bedrijven-in-behandeling.js**: Pending bedrijf approvals
- **admin-student-detail.js**: Gedetailleerde student informatie
- **admin-company-detail.js**: Gedetailleerde bedrijf informatie

## CSS Architectuur

### Modulaire Opzet

De applicatie gebruikt een modulaire CSS architectuur voor betere onderhoudbaarheid:

**style.css**: Hoofdstylesheets (volledig werkend)
**admin-style.css**: Admin dashboard specifieke styling
**base.css**: Reset, typography en utilities
**layout.css**: Layout componenten en grid systemen
**forms.css**: Basis formulier styling
**forms-advanced.css**: Geavanceerde formulier componenten
**responsive.css**: Media queries en responsive design
**dark-mode.css**: Dark theme implementatie
**modals.css**: Modal en popup styling
**tables.css**: Tabel styling voor data weergave

### CSS Import Strategie

```javascript
// In main.js
import './css/style.css'; // Basis styling
import './css/admin-style.css'; // Admin specifieke stijlen
```

**Voordelen van deze aanpak:**

- Vite bundling optimalisatie
- Tree shaking voor ongebruikte CSS
- Hot module reload tijdens development
- Component-scoped styling mogelijkheden

## Best Practices

### 1. Modulaire Architectuur

**Goed:**

```javascript
// Gescheiden concerns per feature
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteria } from './search-criteria.js';
```

**Vermijd:**

```javascript
// Alles in één monolithisch bestand
// Alle functies in main.js
```

### 2. Error Handling

**Consistent error handling pattern:**

```javascript
try {
  const result = await performOperation();
  handleSuccess(result);
} catch (error) {
  console.error('Operation failed:', error);
  handleError(error);
  showUserFriendlyMessage();
}
```

### 3. Event Management

**Event delegation voor performance:**

```javascript
// Goed - Event listeners op parent elements
document.querySelectorAll('.sidebar-link').forEach((btn) => {
  btn.addEventListener('click', handleNavigation);
});

// Vermijd - Inline event handlers
// <button onclick="handleClick()">
```

### 4. State Management

**Centralized data management:**

```javascript
// Gebruik sessionStorage voor persistente data
const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

function updateUserData(newData) {
  const currentData = getUserData();
  const updatedData = { ...currentData, ...newData };
  sessionStorage.setItem('userData', JSON.stringify(updatedData));
}
```

### 5. API Integration

**Gestandaardiseerde API utilities:**

```javascript
import { apiGet, apiPost } from '../utils/api.js';

const data = await apiGet('/students');
const result = await apiPost('/students', studentData);
```

### 6. Responsive Design

**Mobile-first approach:**

```css
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 1200px;
    padding: 2rem;
  }
}
```

### 7. Accessibility

**Semantic HTML en ARIA:**

```html
<button id="burger-menu" aria-label="Open navigation menu">☰</button>
<nav aria-label="Main navigation">
  <ul role="menu">
    <li role="menuitem">
      <button data-route="profile">Profiel</button>
    </li>
  </ul>
</nav>
```

### 8. Configuration Management

**Environment-specific configuraties:**

```javascript
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.ehb-match.me'
    : 'http://localhost:3001';
```

## Development Workflow

### Scripts

```bash
# Development server
npm run dev          # Start dev server op localhost:3001

# Production build
npm run build        # Build voor productie naar dist/

# Preview production build
npm run preview      # Serve productie build lokaal
```

### Vite Configuratie Voordelen

- **Fast Development**: ESM-based dev server
- **Optimized Builds**: Rollup-based productie builds
- **Tree Shaking**: Verwijdert ongebruikte code
- **Code Splitting**: Automatische bundle optimalisatie
- **Asset Processing**: Image en CSS optimalisatie
- **Hot Module Reload**: Instant updates tijdens development

## Data Flow Patterns

### Component Rendering Pattern

```javascript
export function renderComponent(rootElement, data = {}, options = {}) {
  // 1. Destructure data met defaults
  const { prop1 = 'default', prop2 = 'default' } = data;

  // 2. Genereer HTML
  rootElement.innerHTML = `<!-- HTML template -->`;

  // 3. Setup event listeners
  setupEventListeners();

  // 4. Initialize component state
  initializeComponent();
}
```

### Navigation Pattern

```javascript
document.querySelectorAll('.sidebar-link').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const route = e.currentTarget.getAttribute('data-route');
    switch (route) {
      case 'profile':
        renderStudentProfiel(rootElement, studentData);
        break;
      case 'search':
        renderSearchCriteria(rootElement, studentData);
        break;
    }
  });
});
```

## Performance Optimalisaties

### 1. Lazy Loading

```javascript
async function loadAdminDashboard() {
  const { renderAdminDashboard } = await import('./admin-dashboard.js');
  return renderAdminDashboard;
}
```

### 2. Event Optimization

```javascript
// Event delegation in plaats van individuele listeners
document.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    handleDelete(e.target.dataset.id);
  }
});
```

### 3. CSS Performance

- **Critical CSS** inline voor above-the-fold content
- **Non-critical CSS** geladen asynchroon
- **CSS Modules** voor component isolation

## File Naming Conventions

- **kebab-case** voor bestanden: `student-profiel.js`
- **camelCase** voor functies: `renderStudentProfiel`
- **UPPER_CASE** voor constanten: `API_BASE_URL`

## Authenticatie & Autorisatie

### Session Management

- **SessionStorage**: Lokale sessie data
- **Token System**: JWT tokens voor API authenticatie
- **Auto Refresh**: Automatische token vernieuwing
- **Logout Handling**: Volledige cleanup van sessie data

### User Types

```javascript
// Ondersteunde gebruikerstypes
userTypes = ['student', 'company', 'admin'];

// Sessie data structuur
sessionData = {
  authToken: 'jwt_token',
  userType: 'student|company|admin',
  userData: { ...userSpecificData },
};
```

## Toekomstige Uitbreidingen

### Potentiële Verbeteringen

1. **TypeScript**: Type safety en betere developer experience
2. **CSS-in-JS**: Component-scoped styling
3. **State Management Library**: Voor complexere state (Redux/Zustand)
4. **Testing Framework**: Unit en integration tests
5. **PWA Features**: Offline capabilities
6. **Real-time Features**: WebSocket integration
7. **Micro-frontends**: Voor grotere teams

### Schaalbaarheidsoverwegingen

- **Code Splitting**: Lazy loading van routes
- **Bundle Analysis**: Monitoring van bundle grootte
- **Performance Monitoring**: Real-time performance metrics
- **Error Tracking**: Production error monitoring

## Troubleshooting

### Veelvoorkomende Problemen

**Router Issues:**

- Controleer History API fallback in Vite config
- Verificeer route definities in main.js

**API Problemen:**

- Check token expiry en refresh mechanisme
- Valideer CORS configuratie

**CSS Styling:**

- Verificeer CSS import volgorde
- Check voor conflicterende selectors

**Build Problemen:**

- Clear node_modules en reinstall dependencies
- Verificeer Vite configuratie

## Changelog

- **v1.0**: Basis SPA architectuur
- **v1.1**: Modulaire CSS structuur
- **v1.2**: Gestandaardiseerde API utilities
- **v1.3**: Enhanced error handling
- **v2.0**: Huidige versie met volledige feature set

---

Deze documentatie biedt een uitgebreid overzicht van de Career Launch 2025 codebase architectuur, best practices en ontwikkelrichtlijnen. Voor specifieke implementatiedetails, raadpleeg de individuele component bestanden in de src/ directory.
