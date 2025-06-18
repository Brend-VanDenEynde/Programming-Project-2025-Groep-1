# EhBMatch

EhBMatch is een webapplicatie ontworpen om studenten en bedrijven met elkaar te verbinden, waardoor carrièremogelijkheden en werving worden vergemakkelijkt. Het biedt een platform voor studenten om profielen aan te maken, hun vaardigheden te tonen en naar banen te zoeken, terwijl bedrijven vacatures kunnen plaatsen en geschikte kandidaten kunnen vinden.

## Belangrijkste Kenmerken en Functionaliteit

- Gebruikersregistratie en login voor studenten en bedrijven.
- Aanmaken van studentprofielen, inclusief opleiding, vaardigheden en ervaring.
- Aanmaken van bedrijfsprofielen en de mogelijkheid om vacatures te plaatsen.
- Zoekfunctionaliteit voor studenten om banen te vinden en voor bedrijven om kandidaten te vinden.
- Admin dashboard voor het beheren van gebruikers en site-inhoud.

## Technologie Stack & Afhankelijkheden

- **Programmeertaal:** JavaScript
- **Framework/Bibliotheek:** Vite
- **Opmaak/Styling:** HTML, CSS
- **Afhankelijkheden:**
  - `vite`: Een snelle build tool en ontwikkelingsserver.

## Installatie-instructies

### Systeemvereisten

- Node.js (inclusief npm of yarn)

### Vereiste Afhankelijkheden/Voorwaarden

- Zorg ervoor dat Node.js op uw systeem is geïnstalleerd. U kunt het downloaden van [nodejs.org](https://nodejs.org/).

### Installatiecommando's

1.  Kloon de repository (indien van toepassing) of download de projectbestanden.
2.  Navigeer naar de `career-launch` map in uw terminal:
    ```powershell
    cd career-launch
    ```
3.  Installeer de projectafhankelijkheden:
    ```powershell
    npm install
    ```

## Basis Gebruiksvoorbeelden

1.  **Om de ontwikkelingsserver te starten:**
    Open uw terminal, navigeer naar de `career-launch` map en voer uit:

    ```powershell
    npm run dev
    ```

    Dit start de applicatie doorgaans op `http://localhost:5173`.

2.  **Om het project te bouwen voor productie:**

    ```powershell
    npm run build
    ```

    Dit commando zal een `dist` map aanmaken in de `career-launch` map met de geoptimaliseerde productie build.

3.  **Om de productie build lokaal te bekijken:**
    ```powershell
    npm run preview
    ```
    Dit zal de inhoud van de `dist` map serveren.
