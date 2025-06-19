import Router from "../router.js";

export function renderPrivacy(rootElement) {
  rootElement.innerHTML = `
    <div class="privacy-container">
      <button class="back-button" id="back-button">← Terug</button>
      <div class="content-card">
        <div class="header">
          <h1>Privacy Policy</h1>
        </div>
          <div class="content">
          <h2>Privacy Policy</h2>
          
          <p class="intro">Voor alle informatie over hoe de Erasmushogeschool Brussel omgaat met je persoonlijke gegevens, verwijzen we je naar onze officiële privacy policy.</p>
          
          <!-- Officiële Privacy Policy Link -->
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; text-align: center; border: 2px solid #e9ecef;">
            <h3 style="margin-top: 0;">Privacy Policy</h3>
            <p style="margin-bottom: 1rem;">Career Launch valt onder het privacy beleid van de EhB</p>
            <a href="https://press.ehb.be/privacy-policy" target="_blank" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500;">
              Bekijk Privacy Policy
            </a>
          </div>

          <h3>Contact</h3>
          <p>Voor vragen over privacy kun je contact opnemen met:</p>
          <ul>
            <li><strong>E-mail:</strong> <a href="mailto:privacy@ehb.be">privacy@ehb.be</a></li>
            <li><strong>Adres:</strong> Erasmushogeschool Brussel, Nijverheidskaai 170, 1070 Anderlecht</li>
          </ul>

          
        </div>
      </div>
      
      <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;
  const backBtn = document.getElementById("back-button");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // If no history, go to home page
        Router.navigate('/');
      }
    });
  }
}
