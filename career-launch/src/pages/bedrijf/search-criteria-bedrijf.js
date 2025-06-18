import logoIcon from '../../icons/favicon-32x32.png';
import { authenticatedFetch, refreshToken } from '../../utils/auth-api.js';

export function renderSearchCriteriaBedrijf(rootElement, bedrijfData = {}) {
  rootElement.innerHTML = `
    <div class="bedrijf-profile-container">
      <header class="bedrijf-profile-header">
        <div class="logo-section">
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
            <li><button data-route="search-criteria" class="sidebar-link active">Zoek-criteria</button></li>
            <li><button data-route="speeddates" class="sidebar-link">Speeddates</button></li>            <li><button data-route="requests" class="sidebar-link">Speeddates-verzoeken</button></li>
            <li><button data-route="studenten" class="sidebar-link">Studenten</button></li>
          </ul>
        </nav>
          <div class="bedrijf-profile-content">
          <div class="bedrijf-profile-form-container">
            <h1 class="bedrijf-profile-title">Zoek-criteria</h1>
              <form id="search-criteria-form" class="search-criteria-form">              <div class="form-group">
                <label for="skills-input">Vereiste Skills:</label>
                <div class="skills-input-container">
                  <div class="skills-input-wrapper">
                    <input type="text" id="skills-input" placeholder="Voer een skill in (bijv. JavaScript, React, Python...)" autocomplete="off" />
                    <div id="skills-dropdown" class="skills-dropdown" style="display: none;"></div>
                  </div>
                  <button type="button" id="add-skill-btn" class="btn">Toevoegen</button>
                </div>
                <div id="selected-skills" class="selected-skills"></div>
              </div>              <div class="form-group">
                <label for="languages-input">Vereiste Talen:</label>
                <div class="skills-input-container">
                  <div class="skills-input-wrapper">
                    <input type="text" id="languages-input" placeholder="Voer een taal in (bijv. Nederlands, Engels, Frans...)" autocomplete="off" />
                    <div id="languages-dropdown" class="skills-dropdown" style="display: none;"></div>
                  </div>
                  <button type="button" id="add-language-btn" class="btn">Toevoegen</button>
                </div>
                <div id="selected-languages" class="selected-skills"></div>
              </div>              <div class="form-group">
                <label>Werktype:</label>
                <div class="werktype-container">
                  <div class="werktype-option">
                    <input type="checkbox" id="parttime" name="werktype" value="parttime">
                    <label for="parttime">Parttime</label>
                  </div>
                  
                  <div class="werktype-option">
                    <input type="checkbox" id="fulltime" name="werktype" value="fulltime">
                    <label for="fulltime">Fulltime</label>
                  </div>
                  
                  <div class="werktype-option">
                    <input type="checkbox" id="stage" name="werktype" value="stage">
                    <label for="stage">Stagair</label>
                  </div>
                </div>
              </div>
            </form>
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
  });  document.getElementById('contacteer-ons')?.addEventListener('click', (e) => {
    e.preventDefault();
    import('../../router.js').then((module) => {
      const Router = module.default;
      Router.navigate('/contact');
    });
  });  // Werktype functionality
  let selectedWerktypes = [];
  const werktypeCheckboxes = document.querySelectorAll('input[name="werktype"]');
  
  // Werktype ID mapping
  const werktypeMapping = {
    'parttime': 1,
    'fulltime': 2, 
    'stage': 3
  };
  
  const werktypeReverseMapping = {
    1: 'parttime',
    2: 'fulltime',
    3: 'stage'
  };

  // Skills functionality
  let selectedSkills = [];
  let availableSkills = []; // Array van {id, naam} objecten
  let skillsLoaded = false;

  const skillsInput = document.getElementById('skills-input');
  const addSkillBtn = document.getElementById('add-skill-btn');
  const selectedSkillsContainer = document.getElementById('selected-skills');
  const skillsDropdown = document.getElementById('skills-dropdown');

  // Languages functionality  
  let selectedLanguages = [];
  let availableLanguages = []; // Array van {id, naam} objecten
  let languagesLoaded = false;

  const languagesInput = document.getElementById('languages-input');
  const addLanguageBtn = document.getElementById('add-language-btn');
  const selectedLanguagesContainer = document.getElementById('selected-languages');
  const languagesDropdown = document.getElementById('languages-dropdown');

  let currentFocus = -1;async function fetchSkills() {
    try {
      const response = await makeAuthenticatedRequest('https://api.ehb-match.me/skills', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter alleen skills (type: 0), geen talen (type: 1)
      const skills = data.filter(item => item.type === 0);
      
      // Return volledige objecten met id en naam
      return skills;
    } catch (error) {
      // Fallback skills als API niet werkt (zonder IDs)
      return [
        {id: null, naam: 'JavaScript'}, {id: null, naam: 'Python'}, {id: null, naam: 'Java'}, 
        {id: null, naam: 'C#'}, {id: null, naam: 'C++'}, {id: null, naam: 'PHP'}, 
        {id: null, naam: 'Ruby'}, {id: null, naam: 'React'}, {id: null, naam: 'Vue.js'}, 
        {id: null, naam: 'Angular'}, {id: null, naam: 'Node.js'}, {id: null, naam: 'HTML'}, 
        {id: null, naam: 'CSS'}, {id: null, naam: 'MySQL'}, {id: null, naam: 'PostgreSQL'}, 
        {id: null, naam: 'MongoDB'}, {id: null, naam: 'Git'}, {id: null, naam: 'Docker'}
      ];
    }
  }
  // Initialiseer skills bij het laden van de pagina
  async function initializeSkills() {
    if (!skillsLoaded) {
      // Update placeholder om loading te tonen
      if (skillsInput) {
        skillsInput.placeholder = 'Skills laden...';
        skillsInput.disabled = true;
      }
      
      availableSkills = await fetchSkills();
      skillsLoaded = true;      // Reset placeholder en enable input
      if (skillsInput) {
        skillsInput.placeholder = 'Voer een skill in (bijv. JavaScript, React, Python...)';
        skillsInput.disabled = false;      }
    }
  }
  // Functie om bestaande bedrijf skills te laden en weer te geven
  async function loadBedrijfSkills() {
    // Probeer bedrijf ID op verschillende manieren te krijgen (hergebruik logic)
    let bedrijfId = bedrijfData?.id || bedrijfData?.gebruiker_id;
    
    if (!bedrijfId) {
      try {
        const stored = window.sessionStorage.getItem('bedrijfData');
        if (stored) {
          const storedData = JSON.parse(stored);
          bedrijfId = storedData.id || storedData.gebruiker_id;
        }
      } catch (e) {
        console.error('Error parsing stored bedrijfData:', e);
      }
    }
    
    if (!bedrijfId) {
      try {
        const authToken = window.sessionStorage.getItem('authToken');
        const response = await authenticatedFetch('https://api.ehb-match.me/auth/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          bedrijfId = data.user?.id || data.user?.gebruiker_id || data.id || data.gebruiker_id;
        }
      } catch (e) {
        console.error('Error fetching user info:', e);
      }
    }

    if (!bedrijfId) {
      console.warn('Kan bedrijf ID niet ophalen - bestaande skills worden niet geladen');
      console.warn('Functionaliteit voor het toevoegen van nieuwe skills blijft beschikbaar');
      return;
    }    // Haal bestaande skills op
    const existingSkillsAndLanguages = await fetchBedrijfSkills(bedrijfId);
    
    if (existingSkillsAndLanguages.length === 0) {
      return;
    }

    // Filter alleen skills (type 0)
    const skillsOnly = existingSkillsAndLanguages.filter(item => item.type === 0);
    
    if (skillsOnly.length === 0) {
      return;
    }

    // Voeg ze toe aan selectedSkills (als objecten met id en naam)
    selectedSkills = skillsOnly.map(skill => ({
      id: skill.id,
      naam: skill.naam
    }));

    // Render de skills
    renderSelectedSkills();
  }
  // Functie om bestaande bedrijf talen te laden en weer te geven
  async function loadBedrijfLanguages() {
    // Probeer bedrijf ID te krijgen
    const bedrijfId = await getCurrentBedrijfId();
    
    if (!bedrijfId) {
      return;
    }

    try {
      // Haal bestaande skills en talen op
      const existingSkillsAndLanguages = await fetchBedrijfSkills(bedrijfId);
      
      if (existingSkillsAndLanguages.length === 0) {
        return;
      }

      // Filter alleen talen (type 1) uit de opgehaalde skills
      const languagesOnly = existingSkillsAndLanguages.filter(item => item.type === 1);

      if (languagesOnly.length === 0) {
        return;
      }

      // Voeg ze toe aan selectedLanguages (als objecten met id en naam)
      selectedLanguages = languagesOnly.map(language => ({
        id: language.id,
        naam: language.naam
      }));
      
      // Render de talen
      renderSelectedLanguages();
    } catch (error) {
      console.error('Foul bij laden van bestaande talen:', error);
    }
  }

  function filterSkills(query) {
    if (!query || !skillsLoaded) return [];
    
    return availableSkills.filter(skill => 
      skill.naam.toLowerCase().includes(query.toLowerCase()) &&
      !selectedSkills.some(selected => selected.naam === skill.naam)
    ).slice(0, 8); // Maximaal 8 suggesties
  }

  function showDropdown(skills) {
    if (skills.length === 0) {
      hideDropdown();
      return;
    }    const html = skills.map((skill, index) => 
      `<div class="skill-suggestion" data-skill="${skill.naam}" data-skill-id="${skill.id}" data-index="${index}">${skill.naam}</div>`
    ).join('');

    skillsDropdown.innerHTML = html;
    skillsDropdown.style.display = 'block';
    currentFocus = -1;    // Event listeners voor skill suggesties
    document.querySelectorAll('.skill-suggestion').forEach(item => {
      item.addEventListener('click', () => {
        const skillName = item.getAttribute('data-skill');
        const skillId = item.getAttribute('data-skill-id');
        addSkillFromDropdown({naam: skillName, id: skillId});
      });
    });
  }
  function hideDropdown() {
    skillsDropdown.style.display = 'none';
    currentFocus = -1;
  }
  // Helper functie voor API calls met automatische token refresh
  async function makeAuthenticatedRequest(url, options = {}) {
    let authToken = window.sessionStorage.getItem('authToken');

    if (!authToken) {
      throw new Error('Geen auth token gevonden');
    }

    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
      }
    };

    let response = await authenticatedFetch(url, requestOptions);    // Als we een 401 krijgen, probeer token te refreshen
    if (response.status === 401) {
        throw new Error('Authenticatie mislukt - log opnieuw in');
    }

    return response;
  }
  async function fetchBedrijfSkills(bedrijfId) {
    if (!bedrijfId) {
      return [];
    }

    try {
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Soms kunnen de skills direct een array zijn, soms onder een 'skills' property
      const skillsArray = Array.isArray(data) ? data : (data.skills || []);
      
      // Return ALLE skills en talen (zonder filtering op type)
      // De filtering gebeurt later in loadBedrijfSkills en loadBedrijfLanguages
      return skillsArray.map(skill => ({
        id: skill.id,
        naam: skill.naam || skill.name,
        type: skill.type || 0 // Fallback naar type 0 als type niet beschikbaar is
      }));

    } catch (error) {
      console.error('Fout bij ophalen bedrijf skills/talen:', error);
      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        // Redirect naar login pagina
        window.location.href = '#/bedrijf-login';
      }
      
      return [];
    }
  }
  // Functie om skill op te slaan naar database
  async function saveSkillToDatabase(skillId) {
    // Probeer bedrijf ID op verschillende manieren te krijgen
    let bedrijfId = bedrijfData?.id || bedrijfData?.gebruiker_id;
      // Als niet beschikbaar, probeer uit sessionStorage
    if (!bedrijfId) {
      try {
        const stored = window.sessionStorage.getItem('bedrijfData');
        if (stored) {
          const storedData = JSON.parse(stored);
          bedrijfId = storedData.id || storedData.gebruiker_id;
        }
      } catch (e) {
        // Silently fail
      }
    }
    
    // Als nog steeds niet beschikbaar, haal user info op van API
    if (!bedrijfId) {
      try {
        const response = await makeAuthenticatedRequest('https://api.ehb-match.me/auth/info', {
          method: 'GET'
        });
        
        if (response.ok) {
          const data = await response.json();
          bedrijfId = data.user?.id || data.user?.gebruiker_id || data.id || data.gebruiker_id;
        }
      } catch (e) {
        // Silently fail
      }
    }

    if (!bedrijfId) {
      return false;    }

    try {
      // Controleer of skillId geldig is
      if (!skillId && skillId !== 0) {
        console.error('Skill ID is null, undefined of empty:', skillId);
        throw new Error('Skill heeft geen geldig ID - kan niet opslaan in bedrijfsprofiel');
      }

      // Zorg ervoor dat skillId een nummer is
      const skillIdNumber = parseInt(skillId);
      if (isNaN(skillIdNumber)) {
        console.error('Skill ID is geen geldig nummer:', skillId);
        throw new Error(`Invalid skill ID: ${skillId}`);
      }
      
      // Gebruik het juiste API format
      const requestBody = { skills: [skillIdNumber] };
      
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });      if (!response.ok) {
        // Probeer response body te lezen voor meer details
        const errorText = await response.text();
          // Specifieke foutafhandeling voor verschillende statuscodes
        if (response.status === 400) {
          // Mogelijk skill al toegevoegd aan bedrijf
          if (errorText.includes('already') || errorText.includes('duplicate')) {
            // Skill is al toegevoegd, dit is eigenlijk succesvol
            return true;
          }
        } else if (response.status === 403) {
          // Forbidden - waarschijnlijk verkeerd bedrijf ID of geen toegang
          console.error('403 Forbidden - controleer of het juiste bedrijf ID wordt gebruikt');
          throw new Error('Geen toegang tot dit bedrijfsprofiel. Controleer of u bent ingelogd als de juiste gebruiker.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      return true;
    } catch (error) {
      // Log meer details voor debugging
      console.error('Fout bij opslaan skill in bedrijfsprofiel:', {
        skillId,
        bedrijfId,
        errorMessage: error.message,
        errorStack: error.stack      });
      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      } else if (error.message.includes('Geen toegang tot dit bedrijfsprofiel')) {
        alert(error.message);
        // Redirect naar login om opnieuw in te loggen
        window.location.href = '#/bedrijf-login';
      }
      
      return false;
    }
  }
  function addSkillFromDropdown(skillObj) {
    // Controleer of skill al bestaat
    if (selectedSkills.some(skill => skill.naam === skillObj.naam)) {
      alert('Deze skill is al toegevoegd');
      skillsInput.value = '';
      hideDropdown();
      return;
    }
    
    selectedSkills.push(skillObj);
    renderSelectedSkills();
    skillsInput.value = '';
    hideDropdown();

    // Sla skill op in database als het een bestaande skill is (heeft ID)
    if (skillObj.id) {
      saveSkillToDatabase(skillObj.id).then(success => {
        if (!success) {
          alert('Skill toegevoegd lokaal, maar kon niet worden opgeslagen in database');
        }
      });
    }
  }  // Functie om nieuwe skill aan te maken in database
  async function createSkillInDatabase(skillName) {
    try {
      const requestBody = {
        naam: skillName,
        type: 0  // 0 voor skills, 1 voor talen
      };
      
      const response = await makeAuthenticatedRequest('https://api.ehb-match.me/skills', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Als de skill al bestaat, probeer deze op te halen
        if (response.status === 400 || response.status === 409) {
          // Skill bestaat waarschijnlijk al, zoek in availableSkills of haal opnieuw op
          const existingSkill = availableSkills.find(skill => 
            skill.naam.toLowerCase() === skillName.toLowerCase()
          );
          
          if (existingSkill) {
            return existingSkill;
          }
          
          // Als niet gevonden in lokale lijst, haal alle skills opnieuw op
          try {
            const updatedSkills = await fetchSkills();
            const foundSkill = updatedSkills.find(skill => 
              skill.naam.toLowerCase() === skillName.toLowerCase()
            );
            
            if (foundSkill) {
              // Update availableSkills met nieuwe data
              availableSkills.length = 0;
              availableSkills.push(...updatedSkills);
              return foundSkill;
            }
          } catch (fetchError) {
            // Fallback als fetch faalt
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      
      // Return de nieuwe skill met id
      return {
        id: responseData.skill.id,
        naam: responseData.skill.naam,
        type: responseData.skill.type
      };
    } catch (error) {      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }
      
      return null;
    }
  }

  async function addSkill() {  
    const skillValue = skillsInput.value.trim();
    
    if (skillValue === '') {
      alert('Voer een skill in');
      return;
    }
    
    if (selectedSkills.some(skill => skill.naam === skillValue)) {
      alert('Deze skill is al toegevoegd');
      skillsInput.value = '';
      hideDropdown();
      return;
    }
      // Toon loading state
    const addButton = document.getElementById('add-skill-btn');
    const originalButtonText = addButton.textContent;
    addButton.textContent = 'Toevoegen...';
    addButton.disabled = true;
    skillsInput.disabled = true;
    
    try {
      // Zoek of de skill bestaat in availableSkills
      const existingSkill = availableSkills.find(skill => skill.naam.toLowerCase() === skillValue.toLowerCase());
      
      let skillToAdd;
      
      if (existingSkill) {
        // Bestaande skill
        skillToAdd = existingSkill;
      } else {        // Nieuwe skill - maak eerst aan in database
        skillToAdd = await createSkillInDatabase(skillValue);
        
        if (!skillToAdd) {
          alert('Skill bestaat mogelijk al of er is een probleem opgetreden. Probeer de pagina te vernieuwen.');
          return;
        }
        
        // Controleer nogmaals of skill niet al is toegevoegd tijdens het aanmaken
        const duplicateCheck = availableSkills.find(skill => skill.id === skillToAdd.id);
        if (!duplicateCheck) {
          // Voeg toe aan availableSkills voor toekomstige autocomplete
          availableSkills.push(skillToAdd);
        }
      }
        // Voeg toe aan selectedSkills
      selectedSkills.push(skillToAdd);
      renderSelectedSkills();
      skillsInput.value = '';
      hideDropdown();

      // Controleer of skill een geldig ID heeft voordat we proberen op te slaan
      if (!skillToAdd.id && skillToAdd.id !== 0) {
        console.error('Skill heeft geen geldig ID:', skillToAdd);
        alert('Skill toegevoegd lokaal, maar kan niet worden opgeslagen (geen ID)');
        return;
      }

      // Sla op als bedrijf skill met retry mechanisme
      let success = await saveSkillToDatabase(skillToAdd.id);
      
      // Als eerste poging mislukt, probeer nog een keer na korte pauze
      if (!success) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 seconde wachten
        success = await saveSkillToDatabase(skillToAdd.id);
      }
      
      if (!success) {
        // Controleer eerst of skill misschien al toegevoegd is aan bedrijf
        try {
          const bedrijfId = bedrijfData?.id || bedrijfData?.gebruiker_id;
          if (bedrijfId) {
            const existingBedrijfSkills = await fetchBedrijfSkills(bedrijfId);
            const isAlreadyAdded = existingBedrijfSkills.some(skill => skill.id === skillToAdd.id);
            
            if (isAlreadyAdded) {
              // Skill is al toegevoegd aan bedrijf, geen probleem
              return;
            }
          }
        } catch (checkError) {
          // Silently fail check
        }
        
        alert('Skill is aangemaakt maar kon niet worden toegevoegd aan uw bedrijfsprofiel. Controleer uw internetverbinding en probeer het opnieuw.');
        // Verwijder uit selectedSkills als het opslaan mislukt
        selectedSkills = selectedSkills.filter(skill => skill.id !== skillToAdd.id);
        renderSelectedSkills();
      }
      
    } finally {
      // Reset button staat
      addButton.textContent = originalButtonText;
      addButton.disabled = false;
      skillsInput.disabled = false;
    }
  }// Functie om skill te verwijderen uit database
  async function removeSkillFromDatabase(skillId) {    const bedrijfId = await getCurrentBedrijfId();

    if (!bedrijfId) {
      console.error('Geen bedrijf ID gevonden na alle pogingen');
      return false;
    }

    try {
      // Zorg ervoor dat skillId een nummer is
      const skillIdNumber = parseInt(skillId);
      if (isNaN(skillIdNumber)) {
        throw new Error(`Invalid skill ID: ${skillId}`);
      }
      
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills/${skillIdNumber}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // Probeer response body te lezen voor meer details
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      return true;
    } catch (error) {      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }
      
      return false;
    }
  }

  async function removeSkill(skillToRemove) {
    // Vind de skill om te verwijderen
    const skillToDelete = selectedSkills.find(skill => skill.naam === skillToRemove);
    
    if (!skillToDelete) {
      return;
    }

    // Als de skill een ID heeft, probeer het uit de database te verwijderen
    if (skillToDelete.id) {
      const success = await removeSkillFromDatabase(skillToDelete.id);
      
      if (!success) {
        alert('Kon skill niet verwijderen uit database. Probeer het opnieuw.');
        return;
      }
    }

    // Verwijder uit lokale lijst
    selectedSkills = selectedSkills.filter(skill => skill.naam !== skillToRemove);
    renderSelectedSkills();
  }

  function renderSelectedSkills() {
    if (selectedSkills.length === 0) {
      selectedSkillsContainer.innerHTML = '<p class="no-skills">Nog geen skills toegevoegd</p>';
      return;
    }

    const skillsHtml = selectedSkills.map(skill => `
      <div class="skill-tag">
        <span>${skill.naam}</span>
        <button type="button" class="remove-skill" data-skill="${skill.naam}">×</button>
      </div>
    `).join('');

    selectedSkillsContainer.innerHTML = `
      <div class="skills-list">
        ${skillsHtml}
      </div>
    `;    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-skill').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const skillToRemove = e.target.getAttribute('data-skill');
        
        // Voeg loading state toe
        const button = e.target;
        const originalText = button.textContent;
        button.textContent = '...';
        button.disabled = true;
        
        await removeSkill(skillToRemove);
        
        // Reset button staat (als skill nog bestaat na falen)
        if (selectedSkills.some(skill => skill.naam === skillToRemove)) {
          button.textContent = originalText;
          button.disabled = false;
        }
      });
    });
  }

  // Functie om geselecteerde talen weer te geven
  function renderSelectedLanguages() {
    if (selectedLanguages.length === 0) {
      selectedLanguagesContainer.innerHTML = '<p class="no-skills">Nog geen talen toegevoegd</p>';
      return;
    }

    const languagesHtml = selectedLanguages.map(language => `
      <div class="skill-tag">
        <span>${language.naam}</span>
        <button type="button" class="remove-skill" data-language="${language.naam}">×</button>
      </div>
    `).join('');

    selectedLanguagesContainer.innerHTML = `
      <div class="skills-list">
        ${languagesHtml}
      </div>
    `;

    // Add event listeners for remove buttons
    document.querySelectorAll('#selected-languages .remove-skill').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const languageToRemove = e.target.getAttribute('data-language');
        
        // Voeg loading state toe
        const button = e.target;
        const originalText = button.textContent;
        button.textContent = '...';
        button.disabled = true;
        
        await removeLanguage(languageToRemove);
        
        // Reset button staat (als taal nog bestaat na falen)
        if (selectedLanguages.some(language => language.naam === languageToRemove)) {
          button.textContent = originalText;
          button.disabled = false;
        }
      });
    });
  }

  // Functie om taal toe te voegen
  async function addLanguage() {
    const languageValue = languagesInput.value.trim();
    
    if (languageValue === '') {
      alert('Voer een taal in');
      return;
    }
    
    if (selectedLanguages.some(language => language.naam === languageValue)) {
      alert('Deze taal is al toegevoegd');
      languagesInput.value = '';
      hideLanguageDropdown();
      return;
    }
    
    // Toon loading state
    const addButton = document.getElementById('add-language-btn');
    const originalButtonText = addButton.textContent;
    addButton.textContent = 'Toevoegen...';
    addButton.disabled = true;
    languagesInput.disabled = true;
    
    try {
      // Zoek of de taal bestaat in availableLanguages
      let existingLanguage = availableLanguages.find(language => language.naam.toLowerCase() === languageValue.toLowerCase());
      
      let languageToAdd;
      
      if (existingLanguage) {
        // Bestaande taal
        languageToAdd = existingLanguage;
      } else {
        // Nieuwe taal - maak eerst aan in database
        languageToAdd = await createLanguageInDatabase(languageValue);
        
        if (!languageToAdd) {
          alert('Taal bestaat mogelijk al of er is een probleem opgetreden. Probeer de pagina te vernieuwen.');
          return;
        }
        
        // Controleer nogmaals of taal niet al is toegevoegd tijdens het aanmaken
        const duplicateCheck = availableLanguages.find(language => language.id === languageToAdd.id);
        if (!duplicateCheck) {
          // Voeg toe aan availableLanguages voor toekomstige autocomplete
          availableLanguages.push(languageToAdd);
        }
      }
      
      // Voeg toe aan selectedLanguages
      selectedLanguages.push(languageToAdd);
      renderSelectedLanguages();
      languagesInput.value = '';
      hideLanguageDropdown();

      // Controleer of taal een geldig ID heeft voordat we proberen op te slaan
      if (!languageToAdd.id && languageToAdd.id !== 0) {
        alert('Taal toegevoegd lokaal, maar kan niet worden opgeslagen (geen ID)');
        return;
      }

      // Sla op als bedrijf taal met retry mechanisme
      let success = await saveLanguageToDatabase(languageToAdd.id);
      
      // Als eerste poging mislukt, probeer nog een keer na korte pauze
      if (!success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        success = await saveLanguageToDatabase(languageToAdd.id);
      }
      
      if (!success) {
        alert('Taal is aangemaakt maar kon niet worden toegevoegd aan uw bedrijfsprofiel. Controleer uw internetverbinding en probeer het opnieuw.');
        // Verwijder uit selectedLanguages als het opslaan mislukt
        selectedLanguages = selectedLanguages.filter(language => language.id !== languageToAdd.id);
        renderSelectedLanguages();
      }
      
    } finally {
      // Reset button staat
      addButton.textContent = originalButtonText;
      addButton.disabled = false;
      languagesInput.disabled = false;
    }
  }

  // Functie om taal te verwijderen
  async function removeLanguage(languageToRemove) {
    // Vind de taal om te verwijderen
    const languageToDelete = selectedLanguages.find(language => language.naam === languageToRemove);
    
    if (!languageToDelete) {
      return;
    }

    // Als de taal een ID heeft, probeer het uit de database te verwijderen
    if (languageToDelete.id) {
      const success = await removeLanguageFromDatabase(languageToDelete.id);
      
      if (!success) {
        alert('Kon taal niet verwijderen uit database. Probeer het opnieuw.');
        return;
      }
    }

    // Verwijder uit lokale lijst
    selectedLanguages = selectedLanguages.filter(language => language.naam !== languageToRemove);
    renderSelectedLanguages();
  }

  // Helper functies voor talen dropdown
  function hideLanguageDropdown() {
    languagesDropdown.style.display = 'none';
    languagesDropdown.innerHTML = '';
  }

  // Helper functie om het juiste bedrijf ID te krijgen
  async function getCurrentBedrijfId() {
    // Eerst proberen via API om zeker te zijn van de juiste gebruiker
    try {
      const response = await makeAuthenticatedRequest('https://api.ehb-match.me/auth/info', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        const userId = data.user?.id || data.id;
        
        if (userId) {
          // Sla op in sessionStorage voor toekomstige gebruik
          window.sessionStorage.setItem('currentUserId', userId.toString());
          return userId;
        }
      }
    } catch (e) {
      console.error('Error fetching user info:', e);
    }
    
    // Fallback: probeer uit bedrijfData parameter
    let bedrijfId = bedrijfData?.id || bedrijfData?.gebruiker_id;
    
    // Als niet beschikbaar, probeer uit sessionStorage
    if (!bedrijfId) {
      try {
        const stored = window.sessionStorage.getItem('bedrijfData');
        if (stored) {
          const storedData = JSON.parse(stored);
          bedrijfId = storedData.id || storedData.gebruiker_id;
        }
      } catch (e) {
        // Silently fail
      }
    }
    
    // Laatste fallback: uit sessionStorage
    if (!bedrijfId) {
      const storedUserId = window.sessionStorage.getItem('currentUserId');
      if (storedUserId) {
        bedrijfId = parseInt(storedUserId);
      }
    }
    
    return bedrijfId;
  }

  // Functie om talen op te halen van de API
  async function fetchLanguages() {
    try {
      const response = await makeAuthenticatedRequest('https://api.ehb-match.me/skills', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter alleen talen (type: 1), geen skills (type: 0)
      const languages = data.filter(item => item.type === 1);
      
      // Return volledige objecten met id en naam
      return languages;
    } catch (error) {
      // Fallback talen als API niet werkt (zonder IDs)
      return [
        {id: null, naam: 'Nederlands'}, {id: null, naam: 'Engels'}, {id: null, naam: 'Frans'}, 
        {id: null, naam: 'Duits'}, {id: null, naam: 'Spaans'}, {id: null, naam: 'Italiaans'}, 
        {id: null, naam: 'Portugees'}, {id: null, naam: 'Russisch'}, {id: null, naam: 'Chinees'}, 
        {id: null, naam: 'Japans'}, {id: null, naam: 'Arabisch'}, {id: null, naam: 'Hindi'}
      ];
    }
  }

  // Initialiseer talen bij het laden van de pagina
  async function initializeLanguages() {
    if (!languagesLoaded) {
      // Update placeholder om loading te tonen
      if (languagesInput) {
        languagesInput.placeholder = 'Talen laden...';
        languagesInput.disabled = true;
      }
      
      availableLanguages = await fetchLanguages();
      languagesLoaded = true;

      // Reset placeholder en enable input
      if (languagesInput) {
        languagesInput.placeholder = 'Voer een taal in (bijv. Nederlands, Engels, Frans...)';
        languagesInput.disabled = false;
      }
    }
  }  // Functie om nieuwe taal aan te maken in database
  async function createLanguageInDatabase(languageName) {
    try {
      const requestBody = {
        naam: languageName,
        type: 1  // 1 voor talen, 0 voor skills
      };
      
      const response = await makeAuthenticatedRequest('https://api.ehb-match.me/skills', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Als de taal al bestaat, probeer deze op te halen
        if (response.status === 400 || response.status === 409) {
          // Taal bestaat waarschijnlijk al, zoek in availableLanguages of haal opnieuw op
          const existingLanguage = availableLanguages.find(language => 
            language.naam.toLowerCase() === languageName.toLowerCase()
          );
          
          if (existingLanguage) {
            return existingLanguage;
          }
          
          // Als niet gevonden in lokale lijst, haal alle talen opnieuw op
          try {
            const updatedLanguages = await fetchLanguages();
            const foundLanguage = updatedLanguages.find(language => 
              language.naam.toLowerCase() === languageName.toLowerCase()
            );
            
            if (foundLanguage) {
              // Update availableLanguages met nieuwe data
              availableLanguages.length = 0;
              availableLanguages.push(...updatedLanguages);
              return foundLanguage;
            }
          } catch (fetchError) {
            console.error('Fout bij ophalen talen:', fetchError);
            // Fallback als fetch faalt
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      
      // Return de nieuwe taal met id
      return {
        id: responseData.skill.id,
        naam: responseData.skill.naam,
        type: responseData.skill.type
      };
    } catch (error) {
      console.error('Fout bij aanmaken nieuwe taal:', {
        languageName,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }
      
      return null;
    }
  }  // Database functies voor talen
  async function saveLanguageToDatabase(languageId) {
    const bedrijfId = await getCurrentBedrijfId();
    if (!bedrijfId) {
      console.error('Geen bedrijf ID gevonden voor taal opslaan');
      return false;
    }

    try {
      if (!languageId && languageId !== 0) {
        console.error('Taal ID is ongeldig:', languageId);
        throw new Error('Taal heeft geen geldig ID');
      }

      const languageIdNumber = parseInt(languageId);
      if (isNaN(languageIdNumber)) {
        console.error('Taal ID is geen nummer:', languageId);
        throw new Error(`Invalid language ID: ${languageId}`);
      }
      
      const requestBody = { skills: [languageIdNumber] };
      
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response voor taal:', errorText);
        
        if (response.status === 400 && (errorText.includes('already') || errorText.includes('duplicate'))) {
          return true;
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      return true;
    } catch (error) {
      console.error('Fout bij opslaan taal:', {
        languageId,
        bedrijfId, 
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }
      return false;
    }
  }

  async function removeLanguageFromDatabase(languageId) {
    const bedrijfId = await getCurrentBedrijfId();
    if (!bedrijfId) return false;

    try {
      const languageIdNumber = parseInt(languageId);
      if (isNaN(languageIdNumber)) {
        throw new Error(`Invalid language ID: ${languageId}`);
      }
      
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/skills/${languageIdNumber}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }      return false;
    }
  }  // Event listeners voor werktype
  werktypeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const value = e.target.value;
      const functieId = werktypeMapping[value];
      
      if (e.target.checked) {
        // Voeg functie toe
        const success = await addFunctieToDatabase(functieId);
        if (success) {
          if (!selectedWerktypes.includes(value)) {
            selectedWerktypes.push(value);
          }
        } else {
          // Reset checkbox als opslaan mislukt
          e.target.checked = false;
        }
      } else {
        // Verwijder functie
        const success = await removeFunctieFromDatabase(functieId);
        if (success) {
          selectedWerktypes = selectedWerktypes.filter(type => type !== value);
        } else {
          // Reset checkbox als verwijderen mislukt
          e.target.checked = true;
        }
      }
    });
  });

  // Functie om functie toe te voegen
  async function addFunctieToDatabase(functieId) {
    const bedrijfId = await getCurrentBedrijfId();
    if (!bedrijfId) {
      console.error('Geen bedrijf ID gevonden voor functie toevoegen');
      return false;
    }

    try {
      const requestBody = { functies: [functieId] };
      
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/functies`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response voor functie toevoegen:', errorText);
        
        // Check of functie al bestaat
        if (response.status === 400 && (errorText.includes('already') || errorText.includes('duplicate'))) {
          return true; // Functie bestaat al, dat is OK
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Fout bij toevoegen functie:', {
        functieId,
        bedrijfId,
        errorMessage: error.message
      });
      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }
      return false;
    }
  }

  // Functie om functie te verwijderen
  async function removeFunctieFromDatabase(functieId) {
    const bedrijfId = await getCurrentBedrijfId();
    if (!bedrijfId) {
      console.error('Geen bedrijf ID gevonden voor functie verwijderen');
      return false;
    }

    try {
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/functies/${functieId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response voor functie verwijderen:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Fout bij verwijderen functie:', {
        functieId,
        bedrijfId,
        errorMessage: error.message
      });
      
      if (error.message.includes('Authenticatie mislukt')) {
        alert('Uw sessie is verlopen. Log opnieuw in.');
        window.location.href = '#/bedrijf-login';
      }
      return false;
    }  }

  // Functie om bestaande werktypes te laden
  async function loadBedrijfWerktypes() {
    const bedrijfId = await getCurrentBedrijfId();
    
    if (!bedrijfId) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`https://api.ehb-match.me/bedrijven/${bedrijfId}/functies`, {
        method: 'GET'
      });

      if (response.ok) {
        const functies = await response.json();
        
        if (Array.isArray(functies) && functies.length > 0) {
          // Converteer functie IDs naar werktype namen
          const werktypeNames = functies
            .map(functie => werktypeReverseMapping[functie.id])
            .filter(name => name !== undefined);
          
          selectedWerktypes = werktypeNames;
          
          // Set de checkboxes
          werktypeNames.forEach(werktype => {
            const checkbox = document.querySelector(`input[name="werktype"][value="${werktype}"]`);
            if (checkbox) {
              checkbox.checked = true;
            }
          });
        }
      }
    } catch (error) {
      console.error('Fout bij laden werktypes:', error);
    }
  }

  // Event listeners voor skills
  skillsInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      const filteredSkills = filterSkills(query);
      showDropdown(filteredSkills);
    } else {
      hideDropdown();
    }
  });

  skillsInput?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await addSkill();
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  addSkillBtn?.addEventListener('click', async () => {
    await addSkill();
  });

  // Event listeners voor talen
  languagesInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      showLanguageDropdown(query);
    } else {
      hideLanguageDropdown();
    }
  });

  languagesInput?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await addLanguage();
    } else if (e.key === 'Escape') {
      hideLanguageDropdown();
    }
  });

  addLanguageBtn?.addEventListener('click', async () => {
    await addLanguage();
  });

  // Functie om talen dropdown te tonen
  function showLanguageDropdown(query) {
    const filteredLanguages = availableLanguages.filter(language =>
      language.naam.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredLanguages.length === 0) {
      hideLanguageDropdown();
      return;
    }

    const suggestionsHtml = filteredLanguages.slice(0, 10).map(language => `
      <div class="skill-suggestion" data-language="${language.naam}" data-language-id="${language.id}">
        ${language.naam}
      </div>
    `).join('');

    languagesDropdown.innerHTML = suggestionsHtml;
    languagesDropdown.style.display = 'block';    // Event listeners voor suggesties
    document.querySelectorAll('#languages-dropdown .skill-suggestion').forEach(suggestion => {
      suggestion.addEventListener('click', async () => {
        const languageName = suggestion.getAttribute('data-language');
        const languageId = suggestion.getAttribute('data-language-id');
        await addLanguageFromDropdown({naam: languageName, id: languageId});
      });
    });
  }
  // Functie om taal toe te voegen vanuit dropdown
  async function addLanguageFromDropdown(languageObj) {
    // Controleer of taal al bestaat
    if (selectedLanguages.some(language => language.naam === languageObj.naam)) {
      alert('Deze taal is al toegevoegd');
      languagesInput.value = '';
      hideLanguageDropdown();
      return;
    }
    
    selectedLanguages.push(languageObj);
    renderSelectedLanguages();
    languagesInput.value = '';
    hideLanguageDropdown();

    // Sla taal op in database als het een bestaande taal is (heeft ID)
    if (languageObj.id && languageObj.id !== 'null') {
      const success = await saveLanguageToDatabase(languageObj.id);
      if (!success) {
        alert('Taal toegevoegd lokaal, maar kon niet worden opgeslagen in database');
        // Verwijder uit selectedLanguages als het opslaan mislukt
        selectedLanguages = selectedLanguages.filter(language => language.naam !== languageObj.naam);
        renderSelectedLanguages();
      }
    } else {
      // Taal heeft geen ID (fallback taal), probeer deze eerst aan te maken
      try {
        const createdLanguage = await createLanguageInDatabase(languageObj.naam);
        if (createdLanguage && createdLanguage.id) {
          // Update de taal in selectedLanguages met het nieuwe ID
          const languageIndex = selectedLanguages.findIndex(lang => lang.naam === languageObj.naam);
          if (languageIndex !== -1) {
            selectedLanguages[languageIndex] = createdLanguage;
          }
          
          // Probeer nu op te slaan
          const success = await saveLanguageToDatabase(createdLanguage.id);
          if (!success) {
            alert('Taal aangemaakt maar kon niet worden toegevoegd aan uw profiel');
            selectedLanguages = selectedLanguages.filter(language => language.naam !== languageObj.naam);
            renderSelectedLanguages();
          }
        } else {
          alert('Kon taal niet aanmaken in database');
          selectedLanguages = selectedLanguages.filter(language => language.naam !== languageObj.naam);
          renderSelectedLanguages();
        }
      } catch (error) {
        alert('Fout bij aanmaken van taal');
        selectedLanguages = selectedLanguages.filter(language => language.naam !== languageObj.naam);
        renderSelectedLanguages();      }
    }
  }

  // Initialize displays
  renderSelectedSkills();
  renderSelectedLanguages();

  // Laad skills, talen en bestaande bedrijf data bij het laden van de pagina
  Promise.allSettled([
    initializeSkills(),
    initializeLanguages(),
    loadBedrijfSkills(),
    loadBedrijfLanguages(),
    loadBedrijfWerktypes()
  ]).then((results) => {
    const [skillsResult, languagesResult, bedrijfSkillsResult, bedrijfLanguagesResult, bedrijfWerktypesResult] = results;
    
    if (skillsResult.status === 'rejected') {
      console.warn('Skills database kon niet geladen worden, maar fallback is beschikbaar');
    }
    
    if (languagesResult.status === 'rejected') {
      console.warn('Languages database kon niet geladen worden, maar fallback is beschikbaar');
    }
    
    if (bedrijfSkillsResult.status === 'rejected') {
      console.warn('Bestaande bedrijf skills konden niet geladen worden');
    }
    
    if (bedrijfLanguagesResult.status === 'rejected') {
      console.warn('Bestaande bedrijf talen konden niet geladen worden');
    }    if (bedrijfWerktypesResult.status === 'rejected') {
      console.warn('Bestaande werktypes konden niet geladen worden');
    }
  });
}