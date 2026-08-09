// revive.js - Revive Potions & Fainted Rots System

function openReviveModal() {
  let existing = document.getElementById('reviveModal');
  if (existing) existing.remove();

  let faintedRots = [];
  if (playerData && playerData.inventory) {
    faintedRots = playerData.inventory.filter(rot => rot.fainted === true);
  }

  let listHtml = '';
  if (faintedRots.length === 0) {
    listHtml = '<p style="color: #00ff00; font-size: 0.8rem; margin: 20px 0;">✨ No fainted rots! Everyone is fighting fit.</p>';
  } else {
    faintedRots.forEach((rot) => {
      // Find the actual index in the main inventory
      let realIndex = playerData.inventory.indexOf(rot);
      listHtml += `
        <div style="background: #222; border: 2px solid #ff0055; border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${rot.image}" style="width: 45px; height: 45px; object-fit: contain; filter: grayscale(100%);">
            <div style="text-align: left;">
              <div style="font-weight: bold; font-size: 0.8rem; color: #fff;">${rot.name}</div>
              <div style="font-size: 0.65rem; color: #ff0055;">💀 FAINTED (Lvl ${rot.level || 1})</div>
            </div>
          </div>
          <button onclick="reviveRot(${realIndex})" style="background: #00ff00; color: #000; border: none; padding: 6px 12px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">🧪 REVIVE</button>
        </div>
      `;
    });
  }

  const modal = document.createElement('div');
  modal.id = 'reviveModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.95); z-index: 999999; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    color: #fff; font-family: monospace; padding: 20px;
  `;

  modal.innerHTML = `
    <div style="background: #111; border: 3px solid #00ff55; border-radius: 15px; padding: 20px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 0 30px rgba(0,255,85,0.4);">
      <h2 style="color: #00ff55; font-size: 1.3rem; margin-bottom: 4px;">🧪 REVIVE STATION</h2>
      <p style="font-size: 0.75rem; color: #aaa; margin-bottom: 12px;">Revive Potions Available: <b style="color: #00ff00;" id="potionCountDisplay">${playerData.revivePotions || 0}</b></p>
      
      <div style="max-height: 260px; overflow-y: auto; margin-bottom: 15px; padding-right: 4px;">
        ${listHtml}
      </div>

      <button onclick="document.getElementById('reviveModal').remove()" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE</button>
    </div>
  `;
  document.body.appendChild(modal);
}

window.reviveRot = function(index) {
  if (!playerData.revivePotions || playerData.revivePotions <= 0) {
    if (typeof showGameToast === 'function') showGameToast("❌ You don't have any Revive Potions left!");
    else alert("❌ You don't have any Revive Potions left!");
    return;
  }

  let rot = playerData.inventory[index];
  if (!rot || !rot.fainted) return;

  playerData.revivePotions--;
  rot.fainted = false;

  if (typeof saveGameData === 'function') saveGameData();
  
  if (typeof showGameToast === 'function') {
    showGameToast(`🎉 Success! ${rot.name} has been revived!`);
  }
  
  updatePotionHud(); // Tell the main screen to update the button number!
  openReviveModal(); // Refresh the modal list
};

// 🔄 NEW: A function just to keep the main screen button accurate
window.updatePotionHud = function() {
  const potionHudEl = document.getElementById('potionHudCount');
  if (potionHudEl && typeof playerData !== 'undefined') {
    potionHudEl.innerText = playerData.revivePotions || 0;
  }
};

// Run this every second to make sure the button always matches your real backpack
setInterval(updatePotionHud, 1000);