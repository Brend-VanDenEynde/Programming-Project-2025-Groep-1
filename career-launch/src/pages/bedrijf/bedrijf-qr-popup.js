import logoIcon from '../../icons/favicon-32x32.png';
import defaultAvatar from '../../images/default.png';
import '../../css/consolidated-style.css';
import { createBedrijfNavbar, closeBedrijfNavbar, setupBedrijfNavbarEvents } from '../../utils/bedrijf-navbar.js';

export function renderBedrijfQRPopup(rootElement, companyData = {}) {
  rootElement.innerHTML = `
    ${createBedrijfNavbar('qr')}
    <div class="bedrijf-profile-content">
      <div class="bedrijf-profile-form-container">
        <h1 class="bedrijf-profile-title">Jouw QR-code</h1>
        <div class="qr-code-section">
          <div class="qr-code-label">Laat deze QR-code scannen door bedrijven of tijdens events</div>
          <img src="${companyData.qrCode || ''}" alt="QR code" class="qr-code-img" id="qr-code-img">
        </div>
      </div>
    </div>
    ${closeBedrijfNavbar()}
  `;

  setupBedrijfNavbarEvents();

  // QR-code popup functionaliteit (zonder sluitknop, sluit bij klik buiten popup)
  const qrImg = document.getElementById('qr-code-img');
  const qrModal = document.getElementById('qr-modal');
  const qrModalContent = document.getElementById('qr-modal-content');
  if (qrImg && qrModal && qrModalContent) {
    qrImg.style.cursor = 'pointer';
    qrImg.addEventListener('click', () => {
      qrModal.style.display = 'flex';
    });
    qrModal.addEventListener('click', (e) => {
      // Sluit alleen als je buiten de modal-content klikt
      if (e.target === qrModal) {
        qrModal.style.display = 'none';
      }
    });
    // voorkom sluiten bij klik op de content zelf
    qrModalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

export default renderBedrijfQRPopup;

