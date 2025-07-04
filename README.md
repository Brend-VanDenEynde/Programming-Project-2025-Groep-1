# EhB-Match / Career Launch

EhB-Match is een professionele webapplicatie die studenten en bedrijven met elkaar verbindt om carrièremogelijkheden, stages en werving te faciliteren. Studenten kunnen hun profiel en vaardigheden presenteren, terwijl bedrijven hun open functies, gewenste opleidingen en gewenste vaardigheden plaatsen en kandidaten zoeken. Het platform bevat uitgebreide authenticatie, robuuste API-integratie, toegankelijke UX en een modern, schaalbaar frontend-ontwerp. Uniek aan EhB-Match is het gebruik van een eigen, proprietair algoritme dat studenten en bedrijven optimaal aan elkaar koppelt op basis van vaardigheden, voorkeuren en bedrijfsbehoeften. Hiermee wordt het probleem van complexe ontdekking en contact tussen studenten en bedrijven opgelost: beide partijen vinden sneller en eenvoudiger de juiste match.

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
- [Bronnen & Credits](#bronnen--credits)

---

## Belangrijkste Functionaliteiten

- **Registratie & Login** voor studenten, bedrijven en admins
- **Studentprofielen**: opleiding, vaardigheden, profielfoto, privacy
- **Bedrijfsprofielen**: bedrijfsinfo, logo, contactinfo
- **Zoekfunctionaliteit**: studenten zoeken naar opportuniteiten, bedrijven zoeken naar kandidaten
- **Proprietair matching-algoritme**: koppelt studenten en bedrijven op basis van relevante criteria voor de beste match
- **Speeddate-verzoeken**: bedrijven en studenten kunnen speeddates aanvragen
- **Admin dashboard**: beheer van gebruikers, bedrijven, content en moderatie
- **Geavanceerde authenticatie**: JWT, refresh tokens, automatische tokenvernieuwing
- **Bestand- en afbeelding upload**: veilige upload van profielfoto’s
- **Responsief & toegankelijk ontwerp**: toetsenbordnavigatie, ARIA-labels

---

## Architectuur & Technologieën

- **Frontend**: JavaScript (ES6+), Vite, HTML5, CSS3 (geconsolideerd, responsive)
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
│   └── icons/, images/, vite.svg, ...
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

## API

De backend API voor EhB-Match is open source en beschikbaar voor integratie, testing en verdere ontwikkeling.

- **API repository:** [https://github.com/imadofficial/programming-project-2025-groep-1-API](https://github.com/imadofficial/programming-project-2025-groep-1-API)
- **API documentatie:** [https://api.ehb-match.me/](https://api.ehb-match.me/)

De API biedt endpoints voor authenticatie, registratie, profielbeheer, matching, speeddate-verzoeken en meer. Raadpleeg de documentatie voor een volledig overzicht van alle beschikbare routes, request/response formats en security best practices.

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

- Delen van de code zijn (mede) tot stand gekomen met behulp van AI.
- Documentatie, codevoorbeelden en best practices zijn mede tot stand gekomen met behulp van AI-assistentie, waaronder [GitHub Copilot](https://github.com/features/copilot).
- Inspiratie en technische richtlijnen zijn deels gebaseerd op de officiële documentatie van [Vite](https://vitejs.dev/), [MDN Web Docs](https://developer.mozilla.org/), en [OWASP](https://owasp.org/) voor security best practices.
- Bijdragen van het projectteam.
- **API repository:** [https://github.com/imadofficial/programming-project-2025-groep-1-API](https://github.com/imadofficial/programming-project-2025-groep-1-API)
- **API documentatie:** [https://api.ehb-match.me/](https://api.ehb-match.me/)

---

Made with ❤️ by us.

© 2025 Programming Project Groep 1 – EhB-Match.me