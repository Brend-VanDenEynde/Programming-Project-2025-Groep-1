import Router from '../router.js';

export function showCookieBanner() {
  if (localStorage.getItem('cookieConsent')) return;
  if (document.getElementById('cookie-banner')) return;
  requestAnimationFrame(() => {
    if (document.getElementById('cookie-banner')) return;
    const cookieBanner = document.createElement('div');
    cookieBanner.id = 'cookie-banner';
    cookieBanner.setAttribute('role', 'dialog');
    cookieBanner.setAttribute('aria-modal', 'false');
    cookieBanner.setAttribute('aria-label', 'Cookie toestemming banner');
    cookieBanner.style.cssText = `
      position: fixed;
      bottom: 1.2rem;
      left: 1.2rem;
      max-width: 300px;
      min-width: 180px;
      background: #222;
      color: #fff;
      padding: 1rem 1.1rem 1rem 1.1rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      z-index: 9999;
      font-size: 0.98rem;
      box-shadow: 0 4px 18px #0004;
      border-radius: 12px;
      gap: 0.6em;
    `;
    cookieBanner.innerHTML = `
      <span style="margin-bottom:0.6em;line-height:1.5;">Deze website gebruikt cookies om de gebruikerservaring te verbeteren. <a href="/privacy" style="color:#4e7bfa;text-decoration:underline;">Meer info</a></span>
      <button id="cookie-accept-btn" style="align-self:flex-end;background:#4e7bfa;color:#fff;border:none;padding:0.45em 1.1em;border-radius:7px;font-size:0.97em;cursor:pointer;box-shadow:0 2px 8px #0002;">Akkoord</button>
    `;
    document.body.appendChild(cookieBanner);
    const acceptBtn = cookieBanner.querySelector('#cookie-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem('cookieConsent', 'true');
        if (cookieBanner && cookieBanner.parentNode) {
          cookieBanner.parentNode.removeChild(cookieBanner);
        }
      });
    }
    // Router navigation for privacy link
    const privacyLink = cookieBanner.querySelector('a[href="/privacy"]');
    if (privacyLink) {
      privacyLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof Router !== 'undefined' && Router.navigate) {
          Router.navigate('/privacy');
        } else {
          window.location.href = '/privacy';
        }
      });
    }
  });
}
