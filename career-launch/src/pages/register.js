export function renderRegister(rootElement) {
  rootElement.innerHTML = `
        <div class="register-container">
            <div class="register-form">
                <h1>Registreren</h1>
                <p>Maak je account aan om te beginnen</p>
                
                <form id="registerForm">
                    <div class="form-group">
                        <label for="firstName">Voornaam</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            required 
                            placeholder="Je voornaam"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="lastName">Achternaam</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName" 
                            required 
                            placeholder="Je achternaam"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="email">E-mailadres</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="je.email@voorbeeld.com"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Wachtwoord</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            placeholder="Minimaal 8 karakters"
                            minlength="8"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">Bevestig wachtwoord</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            required 
                            placeholder="Herhaal je wachtwoord"
                            minlength="8"
                        >
                         
                        <input type="radio" id="student" name="rol" value="student" required>
  <label for="student">Student</label><br>
  <input type="radio" id="bedrijf" name="rol" value="bedrijf">
  <label for="bedrijf">Bedrijf</label>
                    </div>
                    
                    <button type="submit" class="register-btn">Registreren</button>
                </form>
                
                <div class="login-link">
                    <p>Heb je al een account? <a href="/login">Inloggen</a></p>
                </div>
            </div>
        </div>
    `;

  // Event listener voor het formulier
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', handleRegister);
}

function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  // Validatie
  if (data.password !== data.confirmPassword) {
    alert('Wachtwoorden komen niet overeen!');
    return;
  }

  if (data.password.length < 8) {
    alert('Wachtwoord moet minimaal 8 karakters bevatten!');
    return;
  }

  // Data naar server sturen
  console.log('Registratie data:', data);
  alert(`Welkom ${data.firstName}! Je account is aangemaakt.`);

  // Redirect naar home of login pagina
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
}
