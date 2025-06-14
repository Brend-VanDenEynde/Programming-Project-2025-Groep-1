import logoIcon from '../../icons/favicon-32x32.png';
import { renderLogin } from '../login.js';
import { showSettingsPopup } from './student-settings.js';
import { fetchCompanies } from '../../utils/data-api.js';
import defaultBedrijfLogo from '../../images/BedrijfDefault.jpg';




// Globale variabele voor bedrijven data
let bedrijven = [];

// Popup voor bedrijf detail
// Popup voor bedrijf detail - MET slots en speeddate verzoek
function showBedrijfPopup(bedrijf, studentId) {
  // Remove any existing popup
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

  // Uren en slots genereren
  const uren = [10, 11, 12, 13, 14, 15];
  const slotDuur = 10; // minuten
  const slotsPerUur = 6; // 0,10,20,30,40,50
  const datum = '2025-10-01'; // vaste dag in jouw voorbeeld
  function getSlotsForUur(uur) {
    return Array.from({ length: slotsPerUur }, (_, i) => {
      const min = i * slotDuur;
      const mm = min < 10 ? `0${min}` : `${min}`;
      return {
        label: `${uur}u${mm}`,
        value: `${datum}T${uur < 10 ? '0' : ''}${uur}:${mm}:00Z`
      };
    });
  }

  popup.innerHTML = `
    <div id="bedrijf-popup-content" style="background:#fff;padding:2.2rem 2rem 1.5rem 2rem;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:420px;width:95vw;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="bedrijf-popup-close" style="position:absolute;top:10px;right:14px;font-size:1.7rem;background:none;border:none;cursor:pointer;color:#888;">&times;</button>
      <img src="${bedrijf.foto}" alt="Logo ${
        bedrijf.naam
      }" style="width:90px;height:90px;object-fit:contain;margin-bottom:1.2rem;" onerror="this.onerror=null;this.src='${defaultBedrijfLogo}'">
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
        <label for="speeddates-uur" style="font-weight:500;">Kies een uur:</label>
        <select id="speeddates-uur" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:6px;border:1.5px solid #e1e5e9;">
          <option value="">-- Selecteer een uur --</option>
          ${uren.map((uur) => `<option value="${uur}">${uur}:00 - ${uur}:59</option>`).join('')}
        </select>
      </div>
      <div style="margin-bottom:1rem;width:100%;">
        <label for="speeddates-minuten" style="font-weight:500;">Kies een tijdslot:</label>
        <select id="speeddates-minuten" style="width:100%;margin-top:0.5rem;padding:0.5rem;border-radius:6px;border:1.5px solid #e1e5e9;" disabled>
          <option value="">-- Selecteer een tijdslot --</option>
        </select>
      </div>
      <button id="speeddates-aanvraag-btn" style="background:#00bcd4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-size:1rem;cursor:pointer;" disabled>Confirmeer aanvraag</button>
      <div id="speeddates-aanvraag-status" style="margin-top:1rem;font-size:1rem;color:#2aa97b;display:none;">Speeddate aangevraagd!</div>
    </div>
  `;
  document.body.appendChild(popup);

  // Sluiten popup
  document.getElementById('bedrijf-popup-close').onclick = () => popup.remove();
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });

  // Dynamische slots vullen na uur-keuze
  const uurSelect = document.getElementById('speeddates-uur');
  const minutenSelect = document.getElementById('speeddates-minuten');
  const aanvraagBtn = document.getElementById('speeddates-aanvraag-btn');
  let gekozenDatum = '';

  uurSelect.addEventListener('change', () => {
    minutenSelect.innerHTML = `<option value="">-- Selecteer een tijdslot --</option>`;
    minutenSelect.disabled = !uurSelect.value;
    aanvraagBtn.disabled = true;
    if (uurSelect.value) {
      const slots = getSlotsForUur(Number(uurSelect.value));
      slots.forEach(slot => {
        const opt = document.createElement('option');
        opt.value = slot.value;
        opt.textContent = slot.label;
        minutenSelect.appendChild(opt);
      });
    }
  });

  minutenSelect.addEventListener('change', () => {
    aanvraagBtn.disabled = !minutenSelect.value;
    gekozenDatum = minutenSelect.value;
  });

  // Speeddate aanvraag knop (API-call)
  // Speeddate aanvraag knop (API-call)
aanvraagBtn.onclick = async () => {
  const status = document.getElementById('speeddates-aanvraag-status');
  aanvraagBtn.disabled = true;
  uurSelect.disabled = true;
  minutenSelect.disabled = true;
  status.textContent = 'Aanvraag wordt verstuurd...';
  status.style.display = 'block';
  try {
    const req = await fetch('https://api.ehb-match.me/speeddate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.sessionStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        id_student: studentId,
        id_bedrijf: bedrijf.gebruiker_id,
        datum: gekozenDatum
      })
    });
    if (req.ok) {
      status.textContent = `Speeddate aangevraagd voor ${uurSelect.value}u${minutenSelect.selectedOptions[0].textContent.slice(-2)}!`;
      // ---->>> HIER confirmatie in de console
      console.log(
        '[Speeddate aanvraag verstuurd]',
        {
          id_student: studentId,
          id_bedrijf: bedrijf.gebruiker_id,
          datum: gekozenDatum
        }
      );
    } else {
      const err = await req.json();
      status.textContent = err.message || 'Er ging iets mis!';
      status.style.color = '#da2727';
    }
  } catch (e) {
    status.textContent = 'Er ging iets mis bij het verzenden!';
    status.style.color = '#da2727';
  }
  setTimeout(() => {
    status.style.display = 'none';
    popup.remove();
  }, 1800);
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
export async function renderBedrijven(rootElement, studentData = {}) {

  // DIT MAG NIET BOVENAAN STAAN:
console.log(studentData); // <-- error!

  setTimeout(async () => {
    let huidigeZoek = '';
    let huidigeLocatie = '';
    let huidigeDomein = '';
    // Check if user is authenticated
    const authToken = window.sessionStorage.getItem('authToken');
    if (!authToken) {
      renderLogin(rootElement);
      return;
    }
    // Loading-indicator tijdens data ophalen
    rootElement.innerHTML = '<div class="loading-spinner" style="text-align:center;padding:2em;"><span>Loading...</span></div>';
    // Load companies from API
    try {
      const companies = await fetchCompanies();
      if (!Array.isArray(companies)) {
        bedrijven = [];
      } else {
        bedrijven = companies.map((company) => ({
          naam: company.naam,
          linkedin: company.linkedin || '',
          bio: company.bio || '',
          foto:
            company.foto && company.foto.trim() !== ''
              ? company.foto
              : defaultBedrijfLogo,
          locatie: company.plaats || '',
          werkdomein: company.werkdomein || '',
          contact_email: company.contact_email,
          gebruiker_id: company.gebruiker_id,
        }));
      }
    } catch (error) {
      if (error.message.includes('Authentication failed')) {
        renderLogin(rootElement);
        return;
      }
      bedrijven = [];
    }
    function renderList() {
      const bedrijvenListElement = document.getElementById('bedrijven-list');

      if (!bedrijvenListElement) return;

      if (bedrijven.length === 0) {
        bedrijvenListElement.innerHTML = `<div style="text-align:center;width:100%;color:#888;">Laden van bedrijven...</div>`;
        return;
      }

      const gefilterd = filterBedrijven({
        zoek: huidigeZoek,
        locatie: huidigeLocatie,
        werkdomein: huidigeDomein,
      });

      bedrijvenListElement.innerHTML = gefilterd.length
        ? gefilterd
            .map(
              (bedrijf, idx) => `
    <div class="bedrijf-card" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001;padding:1.5rem 1rem;display:flex;flex-direction:column;align-items:center;width:220px;cursor:pointer;transition:box-shadow 0.2s;" data-bedrijf-idx="${bedrijven.indexOf(
        bedrijf
      )}">
      <img src="${bedrijf.foto}" alt="Logo ${
                bedrijf.naam
              }" style="width:80px;height:80px;border-radius:50%;object-fit:contain;margin-bottom:1rem;" onerror="this.onerror=null;this.src='${defaultBedrijfLogo}'">
      <h3 style="margin-bottom:0.5rem;text-align:center;">${bedrijf.naam}</h3>
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

    document.querySelectorAll('.bedrijf-card').forEach((card) => {
  card.addEventListener('click', () => {
    const idx = card.getAttribute('data-bedrijf-idx');
showBedrijfPopup(bedrijven[idx], studentData.id || studentData.gebruiker_id);
  });
});
 }
    // Initial render with loading state
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
              </select>
              <select id="bedrijf-filter-domein" style="padding:0.7rem 1rem;border-radius:8px;border:1.5px solid #e1e5e9;">
                <option value="">Alle domeinen</option>
              </select>
            </div>
            <div id="bedrijven-list" class="bedrijven-list" style="display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;">
              <div style="text-align:center;width:100%;color:#888;">Laden van bedrijven...</div>
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

    // Update filters after data is loaded
    function updateFilters() {
      const locatieSelect = document.getElementById('bedrijf-filter-locatie');
      const domeinSelect = document.getElementById('bedrijf-filter-domein');

      if (locatieSelect && domeinSelect) {
        // Update location filter
        const uniekeLocaties = getUniekeLocaties();
        locatieSelect.innerHTML =
          '<option value="">Alle locaties</option>' +
          uniekeLocaties
            .map((loc) => `<option value="${loc}">${loc}</option>`)
            .join('');

        // Update domain filter
        const uniekeDomeinen = getUniekeDomeinen();
        domeinSelect.innerHTML =
          '<option value="">Alle domeinen</option>' +
          uniekeDomeinen
            .map((dom) => `<option value="${dom}">${dom}</option>`)
            .join('');
      }
    }

    // Update filters and render list after data is loaded
    updateFilters();
    renderList();
    // --- Sidebar navigatie uniform maken ---
    document.querySelectorAll('.sidebar-link').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const route = e.currentTarget.getAttribute('data-route');
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
    // Filter & zoek events - setup after data is loaded
    const setupEventListeners = () => {
      const zoekElement = document.getElementById('bedrijf-zoek');
      const locatieElement = document.getElementById('bedrijf-filter-locatie');
      const domeinElement = document.getElementById('bedrijf-filter-domein');

      if (zoekElement) {
        zoekElement.addEventListener('input', (e) => {
          huidigeZoek = e.target.value;
          renderList();
        });
      }

      if (locatieElement) {
        locatieElement.addEventListener('change', (e) => {
          huidigeLocatie = e.target.value;
          renderList();
        });
      }

      if (domeinElement) {
        domeinElement.addEventListener('change', (e) => {
          huidigeDomein = e.target.value;
          renderList();
        });
      }
    };

    setupEventListeners();

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
  }, 200);
  return;
}
