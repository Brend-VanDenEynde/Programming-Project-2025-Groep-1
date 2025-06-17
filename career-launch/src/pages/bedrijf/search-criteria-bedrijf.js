import logoIcon from '../../icons/favicon-32x32.png';

export function renderSearchCriteriaBedrijf(rootElement, bedrijfData = {}) {
  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
          <img src="${logoIcon}" alt="Logo EhB Career Launch" width="32" height="32" />
          <span>EhB Career Launch</span>
        </div>
        <button id="burger-menu" class="bedrijf-profile-burger">☰</button>
        <ul id="burger-dropdown" class="bedrijf-profile-dropdown" style="display: none;">
          <li><button id="nav-settings">Instellingen</button></li>
          <li><button id="nav-logout">Log out</button></li>
        </ul>
      </header>
      
      <div class="bedrijf-profile-main">
        <nav class="bedrijf-profile-sidebar">
          <ul>
            <li><button data-route="profile" class="sidebar-link">Profiel</button></li>
            <li><button data-route="search-criteria" class="sidebar-link active">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>
            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
            <li><button data-route="qr" class="sidebar-link">QR-code</button></li>
          </ul>
        </nav>
        
        <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Zoek-criteria</h1>
            <p>Dit is de zoek-criteria pagina. Hier komen de zoek-criteria voor studenten.</p>
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
          case 'profile':
            Router.navigate('/bedrijf/bedrijf-profiel');
            break;
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
          case 'qr':
            Router.navigate('/bedrijf/qr-code');
            break;
        }
      });
    });
  });

  // Burger menu and other functionality
  const burger = document.getElementById('burger-menu');
  const dropdown = document.getElementById('burger-dropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target) && event.target !== burger) {
        dropdown.style.display = 'none';
      }
    });
  }

  document.getElementById('nav-settings')?.addEventListener('click', () => {
    dropdown.style.display = 'none';
    alert('Instellingen komen binnenkort');
  });

  document.getElementById('nav-logout')?.addEventListener('click', () => {
    dropdown.style.display = 'none';
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
