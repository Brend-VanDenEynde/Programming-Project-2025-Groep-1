export function renderLogin(rootElement) {
  rootElement.innerHTML = `
        <div class="login-container">
            <div class="login-form">
                <h1>Inloggen</h1>
                
                <form id="loginForm">
                    
                    
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
                    
                    
                    
                    <button type="submit" class="login-btn">Inloggen</button>
                </form>
                
                <div class="login-link">
                    <p>Heb je nog geen account? <a href="/register">Registreren</a></p>
                </div>
            </div>
        </div>
    `;

  // Event listener voor het formulier
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', handleLogin);
}