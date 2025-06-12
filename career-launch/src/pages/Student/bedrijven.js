import logoIcon from '../../Icons/favicon-32x32.png';
import { renderStudentProfiel } from './student-profiel.js';
import { renderSearchCriteriaStudent } from './search-criteria-student.js';
import { renderSpeeddates } from './student-speeddates.js';
import { renderSpeeddatesRequests } from './student-speeddates-verzoeken.js';
import { renderQRPopup } from './student-qr-popup.js';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';

// Belgische bedrijven met locatie, werkdomein en bedrijfslogo's (PNG/JPG/SVG direct van bedrijven of Wikipedia)
const bedrijven = [
  {
    naam: 'Proximus',
    linkedin: 'https://www.linkedin.com/company/proximus',
    bio: 'Proximus is een toonaangevende Belgische telecomoperator en ICT-provider.',
    foto: 'https://www.proximus.com/dam/jcr:8e2e5c1e-7f8c-4e2f-8e5e-6b7e7b7e7b7e/proximus-logo.png', // PNG logo
    locatie: 'Brussel, België',
    werkdomein: 'Telecom, ICT',
  },
  {
    naam: 'Colruyt Group',
    linkedin: 'https://www.linkedin.com/company/colruyt-group',
    bio: 'Colruyt Group is een Belgische retailgroep actief in voeding, energie en meer.',
    foto: 'https://www.colruytgroup.com/sites/default/files/styles/og_image/public/2021-03/colruytgroup-logo.png', // PNG logo
    locatie: 'Halle, België',
    werkdomein: 'Retail, Energie',
  },
  {
    naam: 'Barco',
    linkedin: 'https://www.linkedin.com/company/barco',
    bio: 'Barco is een Belgisch technologiebedrijf gespecialiseerd in visualisatie en displayoplossingen.',
    foto: 'https://www.barco.com/content/dam/barco/global/logos/barco-logo.png', // PNG logo
    locatie: 'Kortrijk, België',
    werkdomein: 'Technologie, Visualisatie',
  },
  {
    naam: 'UCB',
    linkedin: 'https://www.linkedin.com/company/ucb-pharma',
    bio: 'UCB is een Belgisch biofarmaceutisch bedrijf met focus op neurowetenschappen en immunologie.',
    foto: 'https://www.ucb.com/sites/default/files/2021-03/ucb-logo.png', // PNG logo
    locatie: 'Brussel, België',
    werkdomein: 'Farmaceutica, Biotechnologie',
  },
  {
    naam: 'Solvay',
    linkedin: 'https://www.linkedin.com/company/solvay',
    bio: 'Solvay is een Belgisch chemiebedrijf actief in geavanceerde materialen en chemie.',
    foto: 'https://www.solvay.com/sites/g/files/srpend221/files/styles/og_image/public/2021-03/solvay-logo.png', // PNG logo
    locatie: 'Brussel, België',
    werkdomein: 'Chemie, Materialen',
  },
  {
    naam: 'Belfius',
    linkedin: 'https://www.linkedin.com/company/belfius',
    bio: 'Belfius is een Belgische bank en verzekeraar met focus op digitale innovatie.',
    foto: 'https://www.belfius.com/images/default-source/default-album/belfius-logo.png', // PNG logo
    locatie: 'Brussel, België',
    werkdomein: 'Bank, Verzekeringen',
  },
  {
    naam: 'Telenet',
    linkedin: 'https://www.linkedin.com/company/telenet',
    bio: 'Telenet is een Belgische aanbieder van kabeltelevisie, internet en telefonie.',
    foto: 'https://www.telenet.be/content/dam/www-telenet-be/logos/telenet-logo.png', // PNG logo
    locatie: 'Mechelen, België',
    werkdomein: 'Telecom, Media',
  },
  {
    naam: 'Delhaize',
    linkedin: 'https://www.linkedin.com/company/delhaize',
    bio: 'Delhaize is een Belgische supermarktketen, onderdeel van Ahold Delhaize.',
    foto: 'https://www.delhaize.be/etc/designs/delhaize/clientlibs/img/logo.png', // PNG logo
    locatie: 'Brussel, België',
    werkdomein: 'Retail, Voeding',
  },
];

// Popup voor bedrijf detail
function showBedrijfPopup(bedrijf) {
  // Verwijder bestaande popup als die er is
  const existing = document.getElementById('bedrijf-popup-modal');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'bedrijf-popup-modal';
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100vw';
  popup.style.height = '100vh';
  popup.style.background = 'rgba(0,0,0,0.5)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.style.zIndex = '2000';

  // Tijdslots voor speeddate
  const tijdslots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
  ];

  popup.innerHTML = `
    <div id="bedrijf-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:400px;width:95vw;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="bedrijf-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">&times;</button>
      <img src="${bedrijf.foto}" alt="Logo ${
    bedrijf.naam
  }" style="width:90px;height:90px;object-fit:contain;margin-bottom:1.2rem;">
      <h2 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h2>
      <div style="font-size:1rem;color:#666;margin-bottom:0.3rem;">${
        bedrijf.locatie
      }</div>
      <div style="font-size:0.97rem;color:#888;margin-bottom:0.7rem;">${
        bedrijf.werkdomein
      }</div>
      <a href="${
        bedrijf.linkedin
      }" target="_blank" style="color:#0077b5;margin-bottom:1rem;">LinkedIn</a>
      <p style="text-align:center;margin-bottom:1.2rem;">${bedrijf.bio}</p>
      <div style="margin-bottom:1rem;width:100%;">
        <label for="speeddates-tijdslot" style="font-weight:500;">Kies een tijdslot:</label>
        <select id="speeddates-tijdslot" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:6px;border:1.5px solid #e1e5e9;">
          <option value="">-- Selecteer een tijdslot --</option>
          ${tijdslots
            .map((slot) => `<option value="${slot}">${slot}</option>`)
            .join('')}
        </select>
      </div>
      <button id="speeddates-aanvraag-btn" style="background:#00bcd4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1rem;cursor:pointer;" disabled>Confirmeer aanvraag</button>
      <div id="speeddates-aanvraag-status" style="margin-top:1rem;font-size:1rem;color:#2aa97b;display:none;">Speeddate aangevraagd!</div>
    </div>
  `;
  document.body.appendChild(popup);

  // Sluit popup bij klik op kruisje of buiten popup
  document.getElementById('bedrijf-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });

  // Enable/disable button op basis van tijdslot
  const tijdslotSelect = document.getElementById('speeddates-tijdslot');
  const aanvraagBtn = document.getElementById('speeddates-aanvraag-btn');
  tijdslotSelect.addEventListener('change', () => {
    aanvraagBtn.disabled = !tijdslotSelect.value;
  });

  // Speeddate aanvraag knop
  aanvraagBtn.onclick = () => {
    const status = document.getElementById('speeddates-aanvraag-status');
    status.textContent = `Speeddate aangevraagd voor ${tijdslotSelect.value}!`;
    status.style.display = 'block';
    aanvraagBtn.disabled = true;
    tijdslotSelect.disabled = true;
    setTimeout(() => {
      status.style.display = 'none';
      popup.remove();
    }, 1500);
  };
}

// Filter en zoek functionaliteit (alleen op naam zoeken)
function filterBedrijven({ zoek = '', locatie = '', werkdomein = '' }) {
  return bedrijven.filter((b) => {
    const matchZoek = zoek
      ? b.naam.toLowerCase().includes(zoek.toLowerCase())
      : true;
    const matchLocatie = locatie ? b.locatie === locatie : true;
    const matchDomein = werkdomein
      ? b.werkdomein.toLowerCase().includes(werkdomein.toLowerCase())
      : true;
    return matchZoek && matchLocatie && matchDomein;
  });
}

// Unieke locaties en domeinen voor filters
function getUniekeLocaties() {
  return [...new Set(bedrijven.map((b) => b.locatie))];
}
function getUniekeDomeinen() {
  // Splits domeinen op komma's en maak uniek
  return [
    ...new Set(
      bedrijven.flatMap((b) => b.werkdomein.split(',').map((d) => d.trim()))
    ),
  ];
}

// Hoofdfunctie: lijst van bedrijven
export function renderBedrijven(rootElement, studentData = {}) {
  let huidigeZoek = '';
  let huidigeLocatie = '';
  let huidigeDomein = '';

  function renderList() {
    const gefilterd = filterBedrijven({
      zoek: huidigeZoek,
      locatie: huidigeLocatie,
      werkdomein: huidigeDomein,
    });

    document.getElementById('bedrijven-list').innerHTML = gefilterd.length
      ? gefilterd
          .map(
            (bedrijf, idx) => `
        <div class="bedrijf-card" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;padding:1.5rem 1rem;display:flex;flex-direction:column;align-items:center;width:220px;cursor:pointer;transition:box-shadow 0.2s;" data-bedrijf-idx="${bedrijven.indexOf(
          bedrijf
        )}">
          <img src="${bedrijf.foto}" alt="Logo ${
              bedrijf.naam
            }" style="width:80px;height:80px;border-radius:50%;object-fit:contain;margin-bottom:1rem;">
          <h3 style="margin-bottom:0.5rem;text-align:center;">${
            bedrijf.naam
          }</h3>
          <div style="font-size:0.97rem;color:#666;margin-bottom:0.3rem;">${
            bedrijf.locatie
          }</div>
          <div style="font-size:0.97rem;color:#888;margin-bottom:0.3rem;">${
            bedrijf.werkdomein
          }</div>
        </div>
      `
          )
          .join('')
      : `<div style="text-align:center;width:100%;color:#888;">Geen bedrijven gevonden.</div>`;

    // Popup event
    document.querySelectorAll('.bedrijf-card').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = card.getAttribute('data-bedrijf-idx');
        showBedrijfPopup(bedrijven[idx]);
      });
    });
  }

  rootElement.innerHTML = `
    <div class="student-profile-container">
      <header class="student-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="student-profile-burger">☰</button>
        <ul id="burger-dropdown" class="student-profile-dropdown">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      <div class="student-profile-main">
        <nav class="student-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="bedrijven" class="sidebar-link active">Bedrijven</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        <div class="student-profile-content">
          <div class="student-profile-form-container">
            <h1 class="student-profile-title">Bedrijven</h1>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.2rem;">
              <input id="bedrijf-zoek" type="text" placeholder="Zoek bedrijf, locatie of domein..." style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;min-width:180px;">
              <select id="bedrijf-filter-locatie" style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;">
                <option value="">Alle locaties</option>
                ${getUniekeLocaties()
                  .map((loc) => `<option value="${loc}">${loc}</option>`)
                  .join('')}
              </select>
              <select id="bedrijf-filter-domein" style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;">
                <option value="">Alle domeinen</option>
                ${getUniekeDomeinen()
                  .map((dom) => `<option value="${dom}">${dom}</option>`)
                  .join('')}
              </select>
            </div>
            <div id="bedrijven-list" class="bedrijven-list" style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;">
              <!-- Cards komen hier dynamisch -->
            </div>
          </div>
        </div>
      </div>
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="#/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="#/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;
  // Sidebar nav - gebruik de router voor echte URL navigatie
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      // Gebruik de router om naar de juiste URL te navigeren
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'profile':
            Router.navigate('/student/student-profiel');
            break;
          case 'search':
            Router.navigate('/student/zoek-criteria');
            break;
          case 'speeddates':
            Router.navigate('/student/student-speeddates');
            break;
          case 'requests':
            Router.navigate('/student/student-speeddates-verzoeken');
            break;
          case 'bedrijven':
            Router.navigate('/student/bedrijven');
            break;
          case 'qr':
            Router.navigate('/student/student-qr-popup');
            break;
        }
      });
    });
  });

  // Filter & zoek events
  document.getElementById('bedrijf-zoek').addEventListener('input', (e) => {
    huidigeZoek = e.target.value;
    renderList();
  });
  document
    .getElementById('bedrijf-filter-locatie')
    .addEventListener('change', (e) => {
      huidigeLocatie = e.target.value;
      renderList();
    });
  document
    .getElementById('bedrijf-filter-domein')
    .addEventListener('change', (e) => {
      huidigeDomein = e.target.value;
      renderList();
    });

  renderList();

  // Burger menu
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    dropdown.classList.remove('open');
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!dropdown.classList.contains('open')) {
        dropdown.classList.add('open');
      } else {
        dropdown.classList.remove('open');
      }
    });
    document.addEventListener('click', function (event) {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });
    document.getElementById('nav-settings').addEventListener('click', () => {
      dropdown.classList.remove('open');
      showSettingsPopup(() => renderBedrijven(rootElement, studentData));
    });
    document.getElementById('nav-logout').addEventListener('click', () => {
      dropdown.classList.remove('open');
      localStorage.setItem('darkmode', 'false');
      document.body.classList.remove('darkmode');
      renderLogin(rootElement);
    });
  }

  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
