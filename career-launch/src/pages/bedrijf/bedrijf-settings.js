import { logoutUser } from '../../utils/auth-api.js';
import { deleteUser } from '../../utils/data-api.js';

// Main renderfunctie:
export function showBedrijfSettingsPopup(onClose) {
  // Voeg popup-styles toe
  if (!document.getElementById('settings-popup-style')) {
    const style = document.createElement('style');
    style.id = 'settings-popup-style';
    style.innerHTML = `
      .settings-modal-root { position: fixed; left:0;top:0;right:0;bottom:0;z-index:2999; background: rgba(30,34,54,0.32); display: flex; align-items: center; justify-content: center; animation: fadeIn .22s; }
      .settings-popup-card {
        background: #fff;
        border-radius: 28px;
        box-shadow: 0 8px 40px 0 rgba(44,44,44,0.18);
        padding: 38px 32px 38px 32px;
        min-width: 320px;
        max-width: 95vw;
        position: relative;
        animation: popupIn .33s cubic-bezier(.4,1.6,.6,1);
      }
      .settings-popup-close {
        position: absolute; right: 18px; top: 18px; background: none; border: none; font-size: 1.7rem; color: #222; cursor: pointer; transition: color .18s; z-index: 2;
      }
      .settings-popup-close:hover { color: #28bb8a; }
      .settings-title { text-align: center; font-size: 2rem; font-weight: 900; color: #21254a; margin-bottom: 32px; letter-spacing: .02em; }
      .settings-row { margin-bottom: 32px; display: flex; flex-direction: column; gap: 13px; }
      .settings-label { font-weight: 700; font-size: 1.11rem; color: #222845; margin-bottom: 6px; }
      .switch { position: relative; display: inline-block; width: 58px; height: 30px; vertical-align: middle; }
      .switch input { display: none;}
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #e3e7ef; transition: .3s; border-radius: 24px; }
      .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 5px; bottom: 4px; background: #3dd686; transition: .3s; border-radius: 50%; }
      input:checked + .slider { background: #262e40; }
      input:checked + .slider:before { transform: translateX(25px); background: #f7c948; }
      .settings-btn-row { display: flex; gap: 18px; justify-content: flex-end; margin-top: 28px; }
      .settings-action-btn { border: none; border-radius: 20px; font-weight: 800; font-size: 1.09rem; padding: 13px 0; min-width: 140px; cursor: pointer; box-shadow: 0 2px 10px 0 rgba(44,44,44,0.06); letter-spacing: .04em; transition: background .17s, color .17s, box-shadow .17s; margin: 0; background: linear-gradient(90deg, #3dd686 0%, #28bb8a 100%); color: #fff; }
      .settings-action-btn.logout { background: linear-gradient(90deg, #e4eafd 0%, #cfd7ea 100%); color: #222; }
      .settings-action-btn.delete { background: linear-gradient(90deg, #fa626a 0%, #fd7855 100%); color: #fff; }
      .settings-action-btn:hover { filter: brightness(1.07) drop-shadow(0 0 12px #3dd68625); color: #fff; }
      .settings-action-btn.logout:hover { background: linear-gradient(90deg, #cfd7ea 0%, #e4eafd 100%);}
      .settings-action-btn.delete:hover { background: linear-gradient(90deg, #fd7855 0%, #fa626a 100%);}
      @keyframes popupIn { 0% { transform: scale(0.85) translateY(40px); } 100% { transform: scale(1) translateY(0); } }
      @media (max-width: 600px) { .settings-popup-card {padding:8px 2vw;} .settings-title {font-size:1.19rem;} }
      body.darkmode, .darkmode .settings-popup-card { background: #232846 !important; color: #f3f6fa; }
    `;
    document.head.appendChild(style);
  }

  // Voeg overlay toe aan body
  let modalRoot = document.getElementById('settings-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'settings-modal-root';
    modalRoot.className = 'settings-modal-root';
    document.body.appendChild(modalRoot);
  }

  modalRoot.innerHTML = `
    <div class="settings-popup-card">
      <button class="settings-popup-close" id="settings-close">&times;</button>
      <h2 class="settings-title">Instellingen</h2>
      <div class="settings-row">
        <label class="settings-label">Donkere modus</label>
        <label class="switch">
          <input type="checkbox" id="dark-mode-toggle">
          <span class="slider"></span>
        </label>
      </div>
      <div class="settings-btn-row">
        <button class="settings-action-btn logout" id="logout-btn">Log uit</button>
        <button class="settings-action-btn delete" id="delete-account-btn">Verwijder account</button>
      </div>
    </div>`;

  document.getElementById('settings-close').addEventListener('click', () => {
    modalRoot.remove();
    if (onClose) onClose();
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser();
    window.location.reload();
  });
  document
    .getElementById('delete-account-btn')
    .addEventListener('click', () => {
      if (confirm('Weet je zeker dat je je account wilt verwijderen?')) {
        deleteUser();
        window.location.reload();
      }
    });
}
