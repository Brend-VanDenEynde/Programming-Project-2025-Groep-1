export function renderStudentRegister(rootElement) {
  rootElement.innerHTML = `
  <header class="header">
      <div class="header-left">
        <div class="logo-placeholder">Logo</div>
        <span>EhB Career Launch</span>
      </div>
    </header>

    <main class="form-container">
      <button class="back-button">← Terug</button>

      <div class="upload-section">
        <div class="upload-icon">⬆</div>
        <label>Foto</label>
      </div>

      <div class="form-fields">
        <div class="name-row">
          <input type="text" placeholder="Voornaam" class="input-half" />
          <input type="text" placeholder="Achternaam" class="input-half" />
        </div>
        <input type="email" placeholder="Contact-Email" class="input-full" />
        <input type="url" placeholder="LinkedIn-link" class="input-full" />
      </div>

      <button class="next-button">Volgende →</button>
    </main>

    <footer class="footer">
      <a href="#">Privacy Policy</a> | <a href="#">Contacteer Ons</a>
    </footer>
  `;
}