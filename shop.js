// shop.js - In-Game Store for buying items with Coins

function openShopModal() {
  let existing = document.getElementById('shopModal');
  if (existing) existing.remove();

  // Make sure the player has a coin purse, even if it's 0
  if (typeof playerData !== 'undefined' && typeof playerData.rotBalance === 'undefined') {
    playerData.rotBalance = 0;
  }

  const currentCoins = playerData.rotBalance || 0;

  const modal = document.createElement('div');
  modal.id = 'shopModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.95); z-index: 999999; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    color: #fff; font-family: monospace; padding: 20px;
  `;

  modal.innerHTML = `
    <div style="background: #111; border: 3px solid #ffcc00; border-radius: 15px; padding: 20px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 0 30px rgba(255,204,0,0.4);">
      <h2 style="color: #ffcc00; font-size: 1.4rem; margin-bottom: 4px;">🛒 ITEM SHOP</h2>
      <p style="font-size: 0.8rem; color: #aaa; margin-bottom: 15px;">
        Your Coins: <b style="color: #ffcc00; font-size: 1rem;" id="shopCoinBalance">🪙 ${currentCoins}</b>
      </p>

      <!-- Shop Items List -->
      <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px; padding-right: 4px;">
        
        <!-- Revive Potion -->
        <div style="background: #222; border: 2px solid #00ffcc; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2rem;">🧪</div>
            <div style="text-align: left;">
              <div style="font-weight: bold; font-size: 0.9rem; color: #fff;">Revive Potion</div>
              <div style="font-size: 0.7rem; color: #00ffcc;">Wakes up a fainted rot!</div>
            </div>
          </div>
          <!-- Change the 150 below to change the price! -->
          <button onclick="buyItem('revive', 150)" style="background: #ffcc00; color: #000; border: none; padding: 8px 12px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
            🪙 150
          </button>
        </div>

        <!-- Lucky Egg -->
        <div style="background: #222; border: 2px solid #ff00ff; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2rem;">🥚</div>
            <div style="text-align: left;">
              <div style="font-weight: bold; font-size: 0.9rem; color: #fff;">Lucky Egg</div>
              <div style="font-size: 0.7rem; color: #ff00ff;">Double Account XP for 1hr!</div>
            </div>
          </div>
          <!-- Change the 500 below to change the price! -->
          <button onclick="buyItem('egg', 500)" style="background: #ffcc00; color: #000; border: none; padding: 8px 12px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
            🪙 500
          </button>
        </div>

      </div>

      <button onclick="document.getElementById('shopModal').remove()" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">LEAVE SHOP</button>
    </div>
  `;

  document.body.appendChild(modal);
}

window.buyItem = function(itemType, cost) {
  if (!playerData) return;
  
  // 1. Check if they have enough money!
  if ((playerData.rotBalance || 0) < cost) {
    alert("❌ Not enough coins! Go defeat some wild brain rots to earn more!");
    return;
  }

  // 2. Take the money out of their wallet
  playerData.rotBalance -= cost;

  // 3. Put the item in their backpack
  if (itemType === 'revive') {
    playerData.revivePotions = (playerData.revivePotions || 0) + 1;
    alert("🧪 Successfully bought 1x Revive Potion!");
  } else if (itemType === 'egg') {
    playerData.luckyEggs = (playerData.luckyEggs || 0) + 1;
    alert("🥚 Successfully bought 1x Lucky Egg!");
  }

  // 4. Save the game to the cloud!
  if (typeof saveGameData === 'function') {
    saveGameData();
  }

  // 5. Update the shop screen to show their new wallet balance
  const balanceEl = document.getElementById('shopCoinBalance');
  if (balanceEl) {
    balanceEl.innerHTML = `🪙 ${playerData.rotBalance}`;
  }
  
  // 6. UPDATE THE MAIN HUD UI (This was the missing piece!)
  const mainBalanceEl = document.getElementById('rotBalance');
  if (mainBalanceEl) {
    mainBalanceEl.innerText = playerData.rotBalance;
  }
  
  // 7. Update the main screen potion counter so they see it instantly!
  if (typeof updatePotionHud === 'function') {
    updatePotionHud();
  }
};