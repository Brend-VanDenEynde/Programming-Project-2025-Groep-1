import { logoutUser } from '../../utils/auth-api.js';

// Admin Settings Popup - vergelijkbaar met student settings maar voor admin
export function showAdminSettingsPopup(onClose) {
  // Voeg popup-styles toe
  if (!document.getElementById('admin-settings-popup-style')) {
    const style = document.createElement('style');
    style.id = 'admin-settings-popup-style';
    style.innerHTML = `
      .admin-settings-modal-root { 
        position: fixed; 
        left:0;
        top:0;
        right:0;
        bottom:0;
        z-index:2999; 
        background: rgba(30,34,54,0.32); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        animation: fadeIn .22s; 
      }
      .admin-settings-popup-card {
        background: #fff;
        border-radius: 28px;
        box-shadow: 0 8px 40px 0 rgba(44,44,44,0.18);
        padding: 38px 32px 38px 32px;
        min-width: 320px;
        max-width: 95vw;
        position: relative;
        animation: popupIn .33s cubic-bezier(.4,1.6,.6,1);
      }
      .admin-settings-popup-close {
        position: absolute; 
        right: 18px; 
        top: 18px; 
        background: none; 
        border: none; 
        font-size: 1.7rem; 
        color: #222; 
        cursor: pointer; 
        transition: color .18s; 
        z-index: 2;
      }
      .admin-settings-popup-close:hover { color: #28bb8a; }
      .admin-settings-title { 
        text-align: center; 
        font-size: 2rem; 
        font-weight: 900; 
        color: #21254a; 
        margin-bottom: 32px; 
        letter-spacing: .02em; 
      }
      .admin-settings-row { 
        margin-bottom: 32px; 
        display: flex; 
        flex-direction: column; 
        gap: 13px; 
      }
      .admin-settings-label { 
        font-weight: 700; 
        font-size: 1.11rem; 
        color: #222845; 
        margin-bottom: 6px; 
      }
      .admin-switch { 
        position: relative; 
        display: inline-block; 
        width: 58px; 
        height: 30px; 
        vertical-align: middle; 
      }
      .admin-switch input { display: none;}
      .admin-slider { 
        position: absolute; 
        cursor: pointer; 
        top: 0; 
        left: 0; 
        right: 0; 
        bottom: 0; 
        background: #e3e7ef; 
        transition: .3s; 
        border-radius: 24px; 
      }
      .admin-slider:before { 
        position: absolute; 
        content: ""; 
        height: 22px; 
        width: 22px; 
        left: 5px; 
        bottom: 4px; 
        background: #3dd686; 
        transition: .3s; 
        border-radius: 50%; 
      }
      input:checked + .admin-slider { background: #262e40; }
      input:checked + .admin-slider:before { transform: translateX(25px); background: #f7c948; }
      .admin-settings-btn-row { 
        display: flex; 
        gap: 18px; 
        justify-content: flex-end; 
        margin-top: 28px; 
      }
      .admin-settings-action-btn { 
        border: none; 
        border-radius: 20px; 
        font-weight: 800; 
        font-size: 1.09rem; 
        padding: 13px 0; 
        min-width: 140px; 
        cursor: pointer; 
        box-shadow: 0 2px 10px 0 rgba(44,44,44,0.06); 
        letter-spacing: .04em; 
        transition: background .17s, color .17s, box-shadow .17s; 
        margin: 0; 
        background: linear-gradient(90deg, #3dd686 0%, #28bb8a 100%); 
        color: #fff; 
      }
      .admin-settings-action-btn.logout { 
        background: linear-gradient(90deg, #e4eafd 0%, #cfd7ea 100%); 
        color: #222; 
      }
      .admin-settings-action-btn:hover { 
        filter: brightness(1.07) drop-shadow(0 0 12px #3dd68625); 
        color: #fff; 
      }
      .admin-settings-action-btn.logout:hover { 
        background: linear-gradient(90deg, #cfd7ea 0%, #e4eafd 100%);
      }
      @keyframes popupIn { 
        0% { transform: scale(0.85) translateY(40px); } 
        100% { transform: scale(1) translateY(0); } 
      }
      @media (max-width: 600px) { 
        .admin-settings-popup-card {padding:8px 2vw;} 
        .admin-settings-title {font-size:1.19rem;} 
      }
      body.darkmode, .darkmode .admin-settings-popup-card { 
        background: #232846 !important; 
        color: #f3f6fa; 
      }
    `;
    document.head.appendChild(style);
  }

  // Voeg overlay toe aan body
  let modalRoot = document.getElementById('admin-settings-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'admin-settings-modal-root';
    document.body.appendChild(modalRoot);
  }
  modalRoot.className = 'admin-settings-modal-root';
  modalRoot.style.display = 'flex';

  let dark = localStorage.getItem('darkmode') === 'true';
  document.body.classList.toggle('darkmode', dark);

  modalRoot.innerHTML = `
    <div class="admin-settings-popup-card">
      <button class="admin-settings-popup-close" id="admin-settings-popup-close" title="Sluiten">&times;</button>
      <h2 class="admin-settings-title">Admin Instellingen</h2>
      <div class="admin-settings-row">
        <label class="admin-settings-label">Donkere modus</label>
        <label style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:1.22em;">🌞</span>
          <span class="admin-switch">
            <input id="admin-toggle-darkmode" type="checkbox" ${
              dark ? 'checked' : ''
            }/>
            <span class="admin-slider"></span>
          </span>
          <span style="font-size:1.22em;">🌙</span>
        </label>
      </div>
      <div class="admin-settings-btn-row">
        <button class="admin-settings-action-btn logout" id="admin-btn-logout">Log uit</button>
      </div>
    </div>
  `;

  // Close popup
  document.getElementById('admin-settings-popup-close').onclick = () => {
    modalRoot.style.display = 'none';
    if (typeof onClose === 'function') onClose();
  };

  // Sluit popup bij klik buiten de kaart
  modalRoot.onclick = (e) => {
    if (e.target === modalRoot) {
      modalRoot.style.display = 'none';
      if (typeof onClose === 'function') onClose();
    }
  };

  // Darkmode toggle
  document
    .getElementById('admin-toggle-darkmode')
    .addEventListener('change', (e) => {
      localStorage.setItem('darkmode', e.target.checked);
      document.body.classList.toggle('darkmode', e.target.checked);
    });

  // Logout functionality
  document
    .getElementById('admin-btn-logout')
    .addEventListener('click', async () => {
      if (confirm('Weet je zeker dat je wilt uitloggen?')) {
        try {
          await logoutUser();
          window.sessionStorage.clear();
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminUsername');

          // Sluit popup
          modalRoot.style.display = 'none';

          // Navigeer naar homepage
          import('../../router.js').then((module) => {
            const Router = module.default;
            Router.navigate('/');
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Ook bij error, log alsnog uit
          window.sessionStorage.clear();
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminUsername');

          modalRoot.style.display = 'none';

          import('../../router.js').then((module) => {
            const Router = module.default;
            Router.navigate('/');
          });
        }
      }
    });
}
