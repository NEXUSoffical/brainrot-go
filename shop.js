// shop.js - In-Game Shop System

function openShopModal() {
  let existing = document.getElementById('shopModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'shopModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.95); z-index: 999999; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    color: #fff; font-family: monospace; padding: 20px;
  `;

  modal.innerHTML = `
    <div style="background: #111; border: 3px solid #ffcc00; border-radius: 15px; padding: 20px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 0 30px rgba(255,204,0,0.4);">
      <h2 style="color: #ffcc00; font-size: 1.4rem; margin-bottom: 6px;">🛒 ROT SHOP</h2>
      <p style="font-size: 0.75rem; color: #aaa; margin-bottom: 15px;">Your Coins: <b style="color: #00ff00;" id="shopCoinDisplay">${playerData.rotBalance || 0}</b> ROT</p>
      
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
        <!-- Revive Potion Item -->
        <div style="background: #222; border: 2px solid #444; border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: space-between;">
          <div style="text-align: left;">
            <div style="font-weight: bold; font-size: 0.85rem; color: #fff;">🧪 Revive Potion</div>
            <div style="font-size: 0.65rem; color: #aaa;">Revives a fainted rot</div>
            <div style="font-size: 0.7rem; color: #ffcc00; margin-top: 2px;">💰 150 ROT</div>
          </div>
          <button onclick="buyShopItem('potion', 150)" style="background: #ffcc00; color: #000; border: none; padding: 8px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">BUY</button>
        </div>
      </div>

      <button onclick="document.getElementById('shopModal').remove()" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE SHOP</button>
    </div>
  `;
  document.body.appendChild(modal);
}

window.buyShopItem = function(itemType, cost) {
  if (!playerData) return;

  if (playerData.rotBalance < cost) {
    alert("❌ You don't have enough ROT coins!");
    return;
  }

  playerData.rotBalance -= cost;

  if (itemType === 'potion') {
    playerData.revivePotions = (playerData.revivePotions || 0) + 1;
    alert("🎉 Purchased 1x Revive Potion!");
  }

  // Update coin displays across the UI
  const rotBalanceEl = document.getElementById('rotBalance');
  if (rotBalanceEl) rotBalanceEl.innerText = playerData.rotBalance;

  const coinDisplay = document.getElementById('shopCoinDisplay');
  if (coinDisplay) coinDisplay.innerText = playerData.rotBalance;

  if (typeof window.saveGameData === 'function') {
    window.saveGameData();
  }
};