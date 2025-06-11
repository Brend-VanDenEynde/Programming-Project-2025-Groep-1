import Router from '../router.js';

export function renderPrivacy(rootElement) {
  rootElement.innerHTML = `
    <div class="privacy-container">
      <button class="back-button" id="back-button">← Terug</button>
      <div class="content-card">
        <div class="header">
          <h1>Privacy Policy</h1>
        </div>
          <div class="content">
          <h2>Privacy Beleid - Career Launch 2025</h2>
          <p class="intro">Bij Career Launch respecteren we je privacy. Deze policy legt uit welke gegevens we verzamelen, waarom we dat doen, en welke rechten je hebt. Simpel en transparant.</p>
          
          <h3>🔍 Welke gegevens verzamelen we?</h3>
          <p><strong>Account informatie:</strong></p>
          <ul>
            <li>Naam en e-mailadres</li>
            <li>Studierichting en graduatiejaar</li>
            <li>Wachtwoord (versleuteld opgeslagen)</li>
          </ul>
          
          <p><strong>Profiel informatie:</strong></p>
          <ul>
            <li>CV en portfolio documenten</li>
            <li>Vaardigheden en competenties</li>
            <li>Voorkeuren voor stages en jobs</li>
            <li>Profielfoto (optioneel)</li>
          </ul>
          
          <p><strong>Gebruik informatie:</strong></p>
          <ul>
            <li>Wanneer je inlogt en welke pagina's je bezoekt</li>
            <li>Welke vacatures je bekijkt of waarop je solliciteert</li>
          </ul>
          
          <h3>🎯 Waarom gebruiken we je gegevens?</h3>
          <ul>
            <li><strong>Matching:</strong> Je koppelen aan relevante stage- en jobmogelijkheden</li>
            <li><strong>Communicatie:</strong> Je informeren over nieuwe kansen en updates</li>
            <li><strong>Verbetering:</strong> Het platform beter maken op basis van gebruik</li>
            <li><strong>Veiligheid:</strong> Je account en gegevens beschermen</li>
          </ul>
          
          <h3>🤝 Delen we je gegevens?</h3>
          <p><strong>Met werkgevers:</strong> Alleen je publieke profielinformatie, en alleen als je expliciet solliciteert of interest toont.</p>
          <p><strong>Met anderen:</strong> Nooit. We verkopen of verhuren je gegevens niet aan derden.</p>
          <p><strong>Bij overnames:</strong> Als Career Launch wordt overgenomen, informeren we je vooraf.</p>
          
          <h3>🔒 Hoe beschermen we je gegevens?</h3>
          <ul>
            <li>Versleutelde verbindingen (HTTPS)</li>
            <li>Veilige servers binnen de EU</li>
            <li>Beperkte toegang voor medewerkers</li>
            <li>Regelmatige veiligheidsupdates</li>
          </ul>
          
          <h3>⚡ Jouw rechten</h3>
          <p>Je hebt altijd de controle over je gegevens:</p>
          <ul>
            <li><strong>Inzien:</strong> Vraag een overzicht van al je gegevens</li>
            <li><strong>Corrigeren:</strong> Pas onjuiste informatie aan</li>
            <li><strong>Verwijderen:</strong> Laat je account en gegevens volledig verwijderen</li>
            <li><strong>Beperken:</strong> Tijdelijk stoppen met bepaalde verwerkingen</li>
            <li><strong>Overdragen:</strong> Krijg je gegevens in een leesbaar formaat</li>
            <li><strong>Bezwaar:</strong> Stop bepaalde verwerkingen van je gegevens</li>
          </ul>
          
          <h3>🍪 Cookies</h3>
          <p>We gebruiken alleen essentiële cookies om je ingelogd te houden en het platform te laten werken. Geen tracking, geen advertenties.</p>
          
          <h3>📅 Bewaarperiode</h3>
          <p>We bewaren je gegevens zolang je account actief is. Na 2 jaar inactiviteit nemen we contact op. Wil je weg? Alles wordt binnen 30 dagen verwijderd.</p>
          
          <h3>📞 Vragen of klachten?</h3>
          <p>Contact opnemen kan altijd:</p>
          <ul>
            <li><strong>E-mail:</strong> privacy@ehb.be</li>
            <li><strong>Post:</strong> Erasmushogeschool Brussel, Nijverheidskaai 170, 1070 Anderlecht</li>
          </ul>
          <p>Niet tevreden? Je kunt ook een klacht indienen bij de <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank">Gegevensbeschermingsautoriteit</a>.</p>
          
          <p class="last-updated"><strong>Laatste update:</strong> 5 juni 2025</p>
        </div>
      </div>
      
      <!-- FOOTER -->      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Gebruik alleen history.back() zodat je altijd teruggaat naar de vorige pagina
      window.history.back();
    });
  }
  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });

  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  });
}
