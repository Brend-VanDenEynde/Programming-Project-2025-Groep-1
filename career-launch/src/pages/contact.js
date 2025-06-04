import Router from '../router.js';

export function renderContact(rootElement) {
  rootElement.innerHTML = `
    <div class="contact-container">
      <div class="content-card">
        <div class="header">
          <button class="back-button" id="back-button" data-route="/">← Terug naar Home</button>
          <h1>Contacteer Ons</h1>
        </div>
        
        <div class="content">
          <h2>Neem contact met ons op</h2>
          
          <div class="contact-info">
            <div class="contact-item">
              <h3>📧 Email</h3>
              <p><a href="mailto:careerlaunch@ehb.be">careerlaunch@ehb.be</a></p>
            </div>
            
            <div class="contact-item">
              <h3>📱 Telefoon</h3>
              <p>+32 2 210 12 11</p>
            </div>
            
            <div class="contact-item">
              <h3>📍 Adres</h3>
              <p>
                Erasmushogeschool Brussel<br>
                Nijverheidskaai 170<br>
                1070 Anderlecht<br>
                België
              </p>
            </div>
            
            <div class="contact-item">
              <h3>🕒 Openingsuren</h3>
              <p>
                Maandag - Vrijdag: 9:00 - 17:00<br>
                Weekend: Gesloten
              </p>
            </div>
          </div>
          
          <div class="contact-form">
            <h3>Stuur ons een bericht</h3>
            <form id="contactForm">
              <input type="text" placeholder="Je naam" required>
              <input type="email" placeholder="Je email" required>
              <textarea placeholder="Je bericht" rows="5" required></textarea>
              <button type="submit" class="btn-primary">Verstuur</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    Router.navigate('/');
  });

  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.');
    contactForm.reset();
  });
}
