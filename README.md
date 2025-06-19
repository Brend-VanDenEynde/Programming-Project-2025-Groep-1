# EhBMatch / Career Launch

EhBMatch is een professionele webapplicatie die studenten en bedrijven met elkaar verbindt om carrièremogelijkheden, stages en werving te faciliteren. Studenten kunnen hun profiel en vaardigheden presenteren, terwijl bedrijven vacatures plaatsen en kandidaten zoeken. Het platform bevat uitgebreide authenticatie, robuuste API-integratie, toegankelijke UX en een modern, schaalbaar frontend-ontwerp.

---

## Inhoudsopgave

- [Belangrijkste Functionaliteiten](#belangrijkste-functionaliteiten)
- [Architectuur & Technologieën](#architectuur--technologieën)
- [Mappenstructuur](#mappenstructuur)
- [Installatie & Setup](#installatie--setup)
- [Gebruiksinstructies](#gebruiksinstructies)
- [Authenticatie & Security](#authenticatie--security)
- [API & Dataflow](#api--dataflow)
- [Best Practices & Toegankelijkheid](#best-practices--toegankelijkheid)
- [Probleemoplossing](#probleemoplossing)
- [Bijdragen](#bijdragen)
- [Licentie](#licentie)
- [Bronnen & Credits](#bronnen--credits)

---

## Belangrijkste Functionaliteiten

- **Registratie & Login** voor studenten, bedrijven en admins
- **Studentprofielen**: opleiding, vaardigheden, cv, profielfoto, privacy
- **Bedrijfsprofielen**: bedrijfsinfo, vacatures, logo, contactpersonen
- **Zoekfunctionaliteit**: studenten zoeken naar jobs, bedrijven zoeken naar kandidaten
- **Speeddate-verzoeken**: bedrijven en studenten kunnen speeddates aanvragen
- **Admin dashboard**: beheer van gebruikers, bedrijven, content en moderatie
- **Geavanceerde authenticatie**: JWT, refresh tokens, automatische tokenvernieuwing
- **Bestand- en afbeelding upload**: veilige upload van cv’s en profielfoto’s
- **Responsief & toegankelijk ontwerp**: dark mode, toetsenbordnavigatie, ARIA-labels

---

## Architectuur & Technologieën

- **Frontend**: JavaScript (ES6+), Vite, HTML5, CSS3 (geconsolideerd, responsive, dark mode)
- **API-communicatie**: Fetch API wrappers (`authenticatedFetch`, `apiGet`, `apiPost`, ...)
- **Authenticatie**: JWT, refresh tokens, cookies (secure, HttpOnly), automatische token refresh
- **Bestandbeheer**: FormData voor uploads, fallback/placeholder images
- **Projectstructuur**: Modulaire JS-bestanden, gescheiden per functionaliteit
- **Build & tooling**: Vite, npm scripts, sourcemaps, hot reload

---

## Mappenstructuur

```
career-launch/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── Icons/, images/, vite.svg, ...
├── src/
│   ├── main.js, router.js
│   ├── css/
│   │   ├── consolidated-style.css, ...
│   ├── pages/
│   │   ├── login.js, register.js, ...
│   │   ├── student/, bedrijf/, admin/, ...
│   ├── utils/
│   │   ├── api.js, auth-api.js, data-api.js, ...
│   ├── examples/, docs/, icons/, images/
│   └── ...
└── ...
```

Zie de map `src/` voor alle broncode, componenten en utilities. CSS is geconsolideerd voor performance en onderhoudbaarheid.

---

## Installatie & Setup

### Systeemvereisten
- Node.js (v18 of hoger aanbevolen)
- npm (of yarn)

### Installatie
1. **Clone de repository** of download de broncode.
2. **Navigeer naar de projectmap:**
   ```powershell
   cd career-launch
   ```
3. **Installeer afhankelijkheden:**
   ```powershell
   npm install
   ```

### Omgevingsvariabelen
- Configureer API endpoints en secrets via `.env` indien nodig (zie `vite.config.js` voor base URL).

---

## Gebruiksinstructies

- **Start de ontwikkelserver:**
  ```powershell
  npm run dev
  ```
  Applicatie draait standaard op `http://localhost:3001` (zie `vite.config.js`).

- **Build voor productie:**
  ```powershell
  npm run build
  ```
  Output in `dist/` map.

- **Preview productie-build lokaal:**
  ```powershell
  npm run preview
  ```
  Preview draait standaard op `http://localhost:4173` (zie `vite.config.js`).

---

## Authenticatie & Security

- **JWT authenticatie** met automatische token refresh via `authenticatedFetch`.
- **Refresh tokens** worden veilig beheerd (cookie, HttpOnly, Secure).
- **Automatische afhandeling van 401/expired tokens**: gebruikers worden niet onderbroken.
- **Logout** wist tokens, cookies en sessiegegevens volledig.
- **Beveiligde endpoints**: alleen geauthenticeerde gebruikers kunnen gevoelige API’s aanroepen.
- **Input validatie** en **sanitatie** op zowel frontend als backend.

---

## API & Dataflow

- **API-wrappers**: Gebruik altijd `authenticatedFetch` of `apiGet`/`apiPost` voor API-calls.
- **Token refresh**: 401-responses triggeren automatisch een refresh en retry.
- **Bestand uploads**: Gebruik `FormData` voor afbeeldingen en cv’s (zie registratie- en profielpagina’s).
- **Foutafhandeling**: Robuuste error handling, duidelijke gebruikersmeldingen.
- **Voorbeeld endpoints**:
  - `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`
  - `GET/PUT /studenten/:id`, `GET/PUT /bedrijven/:id`, `GET /skills/`, ...

Zie `/src/utils/api.js` en `/src/utils/auth-api.js` voor implementatie.

---

## Best Practices & Toegankelijkheid

- **Toegankelijkheid**: ARIA-labels, toetsenbordnavigatie, duidelijke focus states
- **Responsief ontwerp**: Mobile-first, dark mode, flexbox/grid
- **Codekwaliteit**: Modulaire structuur, duidelijke bestandsnamen, JSDoc, error handling
- **Performance**: Geconsolideerde CSS, minimale bundlegrootte, lazy loading waar mogelijk
- **Veiligheid**: Geen gevoelige data in frontend, HTTPS verplicht in productie

---

## Probleemoplossing

- **API werkt niet / 401-fouten**: Controleer of backend draait en CORS/cookie-instellingen correct zijn.
- **Afbeeldingen worden niet geladen**: Controleer bestandsnamen, permissies en fallback-logica.
- **Build errors**: Controleer Node.js-versie en npm dependencies.
- **Login/registratie werkt niet**: Controleer API endpoint, netwerk en browserconsole op fouten.

---

## Bronnen & Credits

- Documentatie, codevoorbeelden en best practices zijn mede tot stand gekomen met behulp van AI-assistentie, waaronder [GitHub Copilot](https://github.com/features/copilot).
- Inspiratie en technische richtlijnen zijn deels gebaseerd op de officiële documentatie van [Vite](https://vitejs.dev/), [MDN Web Docs](https://developer.mozilla.org/), en [OWASP](https://owasp.org/) voor security best practices.
- Bijdragen van het projectteam en open source community.

---

Made with ❤️ by us.

© 2025 Programming Project Group 1 – EHB Match