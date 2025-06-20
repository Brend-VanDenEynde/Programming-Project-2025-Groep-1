import logoIcon from '../../icons/favicon-32x32.png';
import { authenticatedFetch } from '../../utils/auth-api.js';
import Router from '../../router.js';
import { performLogout } from '../../utils/auth-api.js';

// Functie om speeddate data op te halen van de API
async function fetchSpeeddateData(bedrijfId, token) {
  const url = `https://api.ehb-match.me/speeddates`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await authenticatedFetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Filter out unaccepted speeddate requests made by other users
    const filteredData = data.filter((item) => item.akkoord !== 0 || item.asked_by === bedrijfId);

    // Structureer de data voor eenvoudige rendering
    return formatSpeeddateData(filteredData);
  } catch (error) {
    console.error('Fout bij ophalen van speeddate data:', error);
    throw error;
  }
}

// Functie om de rauwe API data te formatteren voor weergave
function formatSpeeddateData(rawData) {
  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((afspraak) => ({
    id: afspraak.id,
    bedrijf: {
      id: afspraak.id_bedrijf,
      naam: afspraak.naam_bedrijf,
      profielfoto: afspraak.profiel_foto_bedrijf,
      sector: afspraak.sector_bedrijf,
    },
    student: {
      id: afspraak.id_student,
      naam: `${afspraak.voornaam_student} ${afspraak.achternaam_student}`,
      profielfoto: afspraak.profiel_foto_student,
    },
    tijdslot: {
      begin: new Date(afspraak.begin),
      einde: new Date(afspraak.einde),
      geformatteerd: formatTijdslot(afspraak.begin, afspraak.einde),
    },
    lokaal: afspraak.lokaal,
    akkoord: afspraak.akkoord,
    status: afspraak.akkoord ? 'Goedgekeurd' : 'In behandeling',
  }));
}

// Hulpfunctie om tijdslot te formatteren
function formatTijdslot(beginISO, eindeISO) {
  const begin = new Date(beginISO);
  const einde = new Date(eindeISO);

  // Dag en datum
  const dagOpties = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const dagDatum = begin.toLocaleDateString('nl-BE', dagOpties);

  // Uur
  const tijdOpties = { hour: '2-digit', minute: '2-digit' };
  const beginTijd = begin.toLocaleTimeString('nl-BE', tijdOpties);
  const eindeTijd = einde.toLocaleTimeString('nl-BE', tijdOpties);

  // Output: dag: datum\n uur: tijd-tijd
  return `<span class="speeddate-dag"><strong>Dag:</strong> ${dagDatum}</span><br><span class="speeddate-uur"><strong>Uur:</strong> ${beginTijd} - ${eindeTijd}</span>`;
}

// Functie om speeddate lijst te renderen
function renderSpeeddatesList(speeddates) {
  if (!speeddates || speeddates.length === 0) {
    return '<p class="geen-data">Geen geplande speeddates gevonden.</p>';
  }

  return `
    <div class="speeddates-lijst">
      <div class="speeddates-header">
        <h2>Geplande Speeddates (${speeddates.length})</h2>
        <div class="speeddates-filter-group">
          <button class="speeddates-filter-btn active" data-filter="all">Alle speeddates</button>
          <button class="speeddates-filter-btn" data-filter="goedgekeurd">Goedgekeurd</button>
          <button class="speeddates-filter-btn" data-filter="in-behandeling">In behandeling</button>
        </div>
      </div>
      <div class="speeddates-table">
        ${speeddates
          .map(
            (afspraak) => `
          <div class="speeddate-item ${
            afspraak.akkoord ? 'goedgekeurd' : 'in-behandeling'
          }" style="min-width:600px;max-width:1200px;width:100%;display:flex;align-items:center;">
            <div class="speeddate-info" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:24px;">
              <div class="student-info">
                <img src="${
                  afspraak.student.profielfoto || '/images/default.png'
                }" 
                     alt="${afspraak.student.naam}" 
                     class="profiel-foto student-foto"
                     onerror="this.src='/images/default.png'" />
                <div class="student-details">
                  <h4>${afspraak.student.naam}</h4>
                </div>
              </div>
              <div class="afspraak-details" style="display:flex;flex-direction:row;align-items:center;gap:24px;">
                <div class="tijd-lokaal">
                  ${afspraak.tijdslot.geformatteerd}
                </div>
                <div class="status">
                  <span class="status-badge ${
                    afspraak.akkoord ? 'goedgekeurd' : 'in-behandeling'
                  }">
                    ${afspraak.akkoord ? 'GOEDGEKEURD' : 'IN BEHANDELING'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
    
    
  `;
}

// Placeholder functies voor de actieknoppen
window.showSpeeddateDetails = function (afspraakId) {
  alert(
    `Details voor afspraak ${afspraakId} - Deze functionaliteit komt binnenkort!`
  );
};

window.startSpeeddate = function (afspraakId) {
  alert(
    `Start gesprek voor afspraak ${afspraakId} - Deze functionaliteit komt binnenkort!`
  );
};

window.cancelSpeeddate = function (afspraakId) {
  if (confirm('Weet je zeker dat je deze speeddate wilt annuleren?')) {
    alert(
      `Afspraak ${afspraakId} geannuleerd - Deze functionaliteit komt binnenkort!`
    );
  }
};

// Functie om speeddate data te laden en weer te geven
async function loadSpeeddateData() {
  const contentDiv = document.getElementById('speeddates-content');

  try {
    // Haal authToken uit sessionStorage (niet localStorage!)
    const token = window.sessionStorage.getItem('authToken');

    if (!token) {
      contentDiv.innerHTML =
        '<p class="error">Geen authenticatie token gevonden. <a href="#login">Log opnieuw in</a>.</p>';
      return;
    }

    // Haal companyData uit sessionStorage
    const companyDataString = window.sessionStorage.getItem('companyData');
    let bedrijfId;

    if (companyDataString) {
      try {
        const companyData = JSON.parse(companyDataString);
        bedrijfId = companyData.id;
        console.log('Company data gevonden:', companyData);
      } catch (parseError) {
        console.error('Fout bij parsen companyData:', parseError);
      }
    }

    // Fallback naar test ID als geen bedrijfId gevonden
    if (!bedrijfId) {
      console.warn(
        'Geen bedrijf ID gevonden in companyData, gebruik test ID 24'
      );
      bedrijfId = '24'; // Test ID uit je API voorbeeld
    }

    console.log('Gebruikte credentials:', {
      token: token ? 'Token beschikbaar' : 'Geen token',
      bedrijfId: bedrijfId,
    });

    // Haal speeddate data op
    const speeddates = await fetchSpeeddateData(bedrijfId, token);

    // Render de speeddate lijst
    contentDiv.innerHTML = renderSpeeddatesList(speeddates);
    initSpeeddatesFilter();
  } catch (error) {
    console.error('Fout bij laden van speeddate data:', error);
    contentDiv.innerHTML =
      '<p class="error">Er is een fout opgetreden: ' + error.message + '</p>';
  }
}

// Filter functionaliteit voor speeddates (bedrijf/student)
function initSpeeddatesFilter() {
  const filterBtns = document.querySelectorAll('.speeddates-filter-btn');
  if (!filterBtns.length) return;
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;
      document.querySelectorAll('.speeddate-item').forEach(item => {
        const badge = item.querySelector('.status-badge');
        if (filter === 'all') {
          item.style.display = '';
        } else if (filter === 'goedgekeurd') {
          item.style.display = badge && badge.classList.contains('goedgekeurd') ? '' : 'none';
        } else if (filter === 'in-behandeling') {
          item.style.display = badge && badge.classList.contains('in-behandeling') ? '' : 'none';
        }
      });
    });
  });
}

export function renderBedrijfSpeeddates(rootElement, bedrijfData = {}) {
  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section" id="logo-navigation">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown">
          <li><button id="nav-profile">Profiel</button></li>
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      
      <div class="bedrijf-profile-main">        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="speeddates" class="sidebar-link active">Speeddates</button></li>            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
          </ul>
        </nav>
        
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Speeddates</h1>
            <div id="speeddates-content">
              <div class="loading">Laden van speeddates...</div>
            </div>
          </div>
        </div>
      </div>
      
      <footer class="bedrijf-profile-footer">
        <div class="footer-content">
          <span>&copy; 2025 EhB Career Launch</span>
          <div class="footer-links">
            <a href="/privacy" id="privacy-policy">Privacy</a>
            <a href="/contact" id="contacteer-ons">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `;

  // Laad speeddate data wanneer de pagina wordt gerenderd
  loadSpeeddateData();

  // Sidebar navigation
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'speeddates':
            Router.navigate('/bedrijf/speeddates');
            break;
          case 'requests':
            Router.navigate('/bedrijf/speeddates-verzoeken');
            break;
          case 'studenten':
            Router.navigate('/bedrijf/studenten');
            break;
        }
      });
    });
  });

  // Logo navigation event listener
  const logoSection = document.getElementById('logo-navigation');
  if (logoSection) {
    logoSection.addEventListener('click', () => {
      Router.navigate('/bedrijf/speeddates');
    });
  }

  // Burger menu and other functionality
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

    document.addEventListener('click', (event) => {
      if (
        dropdown.classList.contains('open') &&
        !dropdown.contains(event.target) &&
        event.target !== burger
      ) {
        dropdown.classList.remove('open');
      }
    });
  }

  // Profile button
  document.getElementById('nav-profile')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/bedrijf/bedrijf-profiel');
    });
  });

  document.getElementById('nav-settings')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
    import('./bedrijf-settings.js').then((module) => {
      module.showBedrijfSettingsPopup();
    });
  });

  document.getElementById('nav-logout')?.addEventListener('click', async () => {
    dropdown.classList.remove('open');
    await performLogout();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/');
    });
  });

  document.getElementById('privacy-policy')?.addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/privacy');
    });
  });

  document.getElementById('contacteer-ons')?.addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });
}
