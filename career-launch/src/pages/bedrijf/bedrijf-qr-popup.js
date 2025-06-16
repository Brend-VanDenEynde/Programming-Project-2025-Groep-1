import defaultAvatar from '../../images/default.png';
import {
  createBedrijfNavbar,
  setupBedrijfNavbarEvents,
} from '../../utils/bedrijf-navbar.js';

export function renderBedrijfQRPopup(rootElement, companyData = {}) {
  rootElement.innerHTML = `
    ${createBedrijfNavbar('qr')}
          <div class="content-header">
            <h1>QR Code</h1>
            <p>Deel je bedrijfsprofiel via QR code</p>
          </div>

          <div class="qr-code-container">
            <div class="qr-code-section">
              <div class="qr-code-label">Laat deze QR-code scannen door studenten of tijdens events</div>
              <div class="qr-code-wrapper">
                <img src="${defaultAvatar}" alt="QR code voor bedrijfsprofiel" class="qr-code-img" id="qr-code-img">
              </div>
              <div class="qr-code-info">
                <p>Deze QR-code leidt naar je bedrijfsprofiel en kan worden gebruikt tijdens:</p>
                <ul>
                  <li>Jobfairs en recruitment events</li>
                  <li>Speeddate sessies</li>
                  <li>Networking bijeenkomsten</li>
                  <li>Presentaties en workshops</li>
                </ul>
              </div>
              <div class="qr-code-actions">
                <button id="download-qr" class="btn-primary">Download QR Code</button>
                <button id="print-qr" class="btn-secondary">Print QR Code</button>
              </div>
            </div>
          </div>        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Setup navbar events
  setupBedrijfNavbarEvents();

  // Setup QR code functionality
  setupQRCodeFeatures(companyData);
}

function setupQRCodeFeatures(companyData) {
  const downloadBtn = document.getElementById('download-qr');
  const printBtn = document.getElementById('print-qr');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // In a real implementation, this would generate and download the actual QR code
      alert('QR Code download functionaliteit wordt geïmplementeerd.');
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // In a real implementation, this would open a print dialog for the QR code
      alert('QR Code print functionaliteit wordt geïmplementeerd.');
    });
  }

  // Generate QR code based on company data
  generateQRCode(companyData);
}

function generateQRCode(companyData) {
  // In a real implementation, you would use a QR code library like qrcode.js
  // For now, we'll just log what would be encoded
  const qrData = {
    type: 'company-profile',
    companyId: companyData.id || companyData.gebruiker_id,
    companyName: companyData.naam || 'Unknown Company',
    url: `${window.location.origin}/bedrijf/bedrijf-profiel?id=${
      companyData.id || companyData.gebruiker_id
    }`,
  };

  console.log('QR Code would contain:', qrData);
}
