import Router from '../router.js';

export function renderPrivacy(rootElement) {
  rootElement.innerHTML = `
    <div class="privacy-container">
      <div class="content-card">
        <div class="header">
          <button class="back-button" id="back-button" data-route="/">← Terug naar Home</button>
          <h1>Privacy Policy</h1>
        </div>
        
        <div class="content">
          <h2>Privacy Beleid - Career Launch 2025</h2>
          
          <h3>1. Verzameling van gegevens</h3>
          <p>Wij verzamelen alleen de gegevens die noodzakelijk zijn voor het functioneren van het Career Launch platform:</p>
          <ul>
            <li>Naam en contactgegevens</li>
            <li>Studierichting en jaar</li>
            <li>CV en portfolio informatie</li>
            <li>Voorkeuren voor stages en jobs</li>
          </ul>
          
          <h3>2. Gebruik van gegevens</h3>
          <p>Je gegevens worden gebruikt om:</p>
          <ul>
            <li>Je te matchen met relevante stage- en jobmogelijkheden</li>
            <li>Werkgevers te voorzien van relevante kandidaatprofielen</li>
            <li>Het platform te verbeteren</li>
          </ul>
          
          <h3>3. Delen van gegevens</h3>
          <p>Je gegevens worden alleen gedeeld met werkgevers waarmee je expliciet contact wilt.</p>
          
          <h3>4. Contact</h3>
          <p>Voor vragen over privacy kun je contact opnemen via: privacy@ehb.be</p>
        </div>
      </div>
    </div>
  `;

  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    Router.navigate('/');
  });
}
