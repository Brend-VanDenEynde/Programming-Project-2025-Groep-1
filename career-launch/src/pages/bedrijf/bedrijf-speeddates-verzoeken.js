import logoIcon from '../../icons/favicon-32x32.png';
import { authenticatedFetch } from '../../utils/auth-api.js';
import Router from '../../router.js';

// Functie om pending speeddate data op te halen van de API
async function fetchPendingSpeeddateData(bedrijfId, token) {
  const url = `https://api.ehb-match.me/speeddates/pending?id=${bedrijfId}`;
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

    // Structureer de data voor eenvoudige rendering
    return formatPendingSpeeddateData(data);
  } catch (error) {
    console.error('Fout bij ophalen van pending speeddate data:', error);
    throw error;
  }
}

// Functie om de rauwe API data te formatteren voor weergave
function formatPendingSpeeddateData(rawData) {
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
  }));
}

// Hulpfunctie om tijdslot te formatteren
function formatTijdslot(beginISO, eindeISO) {
  const begin = new Date(beginISO);
  const einde = new Date(eindeISO);

  const opties = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const beginFormatted = begin.toLocaleDateString('nl-NL', opties);
  const eindeFormatted = einde.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${beginFormatted} - ${eindeFormatted}`;
}

// Functie om pending speeddate lijst te renderen
function renderPendingSpeeddatesList(speeddates) {
  if (!speeddates || speeddates.length === 0) {
    return '<p class="geen-data">Geen pending speeddates gevonden.</p>';
  }

  return `
    <div class="speeddates-lijst">
      <div class="speeddates-header">
        <h2>Pending Speeddates-verzoeken (${speeddates.length})</h2>
      </div>
      <div class="speeddates-table">
        ${speeddates
          .map(
            (afspraak) => `
          <div class="speeddate-item pending">
            <div class="speeddate-info">
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
              
              <div class="afspraak-details">
                <div class="tijd-lokaal">
                  <p class="tijdslot"><strong>Tijd:</strong> ${
                    afspraak.tijdslot.geformatteerd
                  }</p>
                  <p class="lokaal"><strong>Lokaal:</strong> ${
                    afspraak.lokaal
                  }</p>
                </div>
              </div>
              
              <div class="speeddate-actions">
                <button class="action-btn accept-btn" onclick="acceptSpeeddate(${
                  afspraak.id
                })">
                  Accepteren
                </button>
                <button class="action-btn delete-btn" onclick="deleteSpeeddate(${
                  afspraak.id
                })">
                  Verwijderen
                </button>
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

// Functie om een speeddate te accepteren
async function acceptSpeeddate(afspraakId) {
  const token = window.sessionStorage.getItem('authToken');

  if (!token) {
    alert('Geen geldige authenticatie. Log opnieuw in.');
    return;
  }

  try {
    const response = await authenticatedFetch(
      `https://api.ehb-match.me/speeddates/accept/${afspraakId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    // Navigeer naar de speeddates pagina na succesvolle acceptatie
    alert('Speeddate succesvol geaccepteerd!');

    // Import router en navigeer naar speeddates pagina
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/bedrijf/speeddates');
    });
  } catch (error) {
    console.error('Fout bij accepteren van speeddate:', error);
    alert('Er is een fout opgetreden bij het accepteren van de speeddate.');
  }
}

// Functie om een speeddate te verwijderen/afwijzen
async function deleteSpeeddate(afspraakId) {
  if (!confirm('Weet je zeker dat je deze speeddate wilt afwijzen?')) {
    return;
  }

  const token = window.sessionStorage.getItem('authToken');

  if (!token) {
    alert('Geen geldige authenticatie. Log opnieuw in.');
    return;
  }

  try {
    const response = await authenticatedFetch(
      `https://api.ehb-match.me/speeddates/reject/${afspraakId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    // Herlaad de data na succesvolle afwijzing
    await loadPendingSpeeddateData();
    alert('Speeddate succesvol verwijderd!');
  } catch (error) {
    console.error('Fout bij afwijzen van speeddate:', error);
    alert('Er is een fout opgetreden bij het afwijzen van de speeddate.');
  }
}

// Maak functies globaal beschikbaar
window.acceptSpeeddate = acceptSpeeddate;
window.deleteSpeeddate = deleteSpeeddate;

// Functie om pending speeddate data te laden en weer te geven
async function loadPendingSpeeddateData() {
  const contentDiv = document.getElementById('pending-speeddates-content');

  if (!contentDiv) return;

  try {
    // Haal authToken uit sessionStorage
    const token = window.sessionStorage.getItem('authToken');

    if (!token) {
      contentDiv.innerHTML =
        '<p class="error">Geen authenticatie token gevonden. <a href="#login">Log opnieuw in</a>.</p>';
      return;
    }

    // Haal companyData uit sessionStorage voor bedrijf ID
    const companyDataString = window.sessionStorage.getItem('companyData');
    let bedrijfId;

    if (companyDataString) {
      try {
        const companyData = JSON.parse(companyDataString);
        bedrijfId = companyData.id;
      } catch (parseError) {
        console.error('Fout bij parsen companyData:', parseError);
      }
    }

    // Fallback naar test ID als geen bedrijfId gevonden
    if (!bedrijfId) {
      console.warn(
        'Geen bedrijf ID gevonden in companyData, gebruik test ID 24'
      );
      bedrijfId = '24'; // Test ID
    }

    // Haal pending speeddate data op
    const speeddates = await fetchPendingSpeeddateData(bedrijfId, token);

    // Render de pending speeddate lijst
    contentDiv.innerHTML = renderPendingSpeeddatesList(speeddates);
  } catch (error) {
    console.error('Fout bij laden van pending speeddate data:', error);
    contentDiv.innerHTML =
      '<p class="error">Er is een fout opgetreden: ' + error.message + '</p>';
  }
}

export function renderBedrijfSpeeddatesRequests(rootElement, bedrijfData = {}) {
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
            <li><button data-route="search-criteria" class="sidebar-link">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>            <li><button data-route="requests" class="sidebar-link active">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
          </ul>
        </nav>
          <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Speeddates-verzoeken</h1>
            <div id="pending-speeddates-content">
              <div class="loading">Laden van speeddate verzoeken...</div>
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

  // Sidebar navigation
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.currentTarget.getAttribute('data-route');
      import('../../router.js').then((module) => {
        const Router = module.default;
        switch (route) {
          case 'search-criteria':
            Router.navigate('/bedrijf/zoek-criteria');
            break;
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

  document.getElementById('nav-logout')?.addEventListener('click', () => {
    dropdown.classList.remove('open');
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

  // Laad pending speeddate data wanneer de pagina wordt gerenderd
  loadPendingSpeeddateData();
}
