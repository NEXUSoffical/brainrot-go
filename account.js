// account.js - Player Account Level, XP, Lucky Eggs & Walking Packs System

if (typeof playerData !== 'undefined' && typeof playerData.accountLevel === 'undefined') {
  playerData.accountLevel = 1;
  playerData.accountXp = 0;
  playerData.accountXpMax = 100;
  playerData.luckyEggs = 1; // Start with 1 Lucky Egg
  playerData.luckyEggExpiry = 0; // Timestamp when double XP runs out
  playerData.walkingPacks = []; // Packs waiting to be walked open
}

window.addAccountXp = function(amount) {
  if (!playerData) return;
  
  playerData.accountLevel = playerData.accountLevel || 1;
  playerData.accountXp = playerData.accountXp || 0;
  playerData.accountXpMax = playerData.accountXpMax || 100;

  // Check if Lucky Egg double XP is active
  let multiplier = 1;
  if (playerData.luckyEggExpiry && Date.now() < playerData.luckyEggExpiry) {
    multiplier = 2;
  }

  let finalXp = amount * multiplier;
  playerData.accountXp += finalXp;

  let leveledUp = false;
  while (playerData.accountXp >= playerData.accountXpMax) {
    playerData.accountXp -= playerData.accountXpMax;
    playerData.accountLevel++;
    playerData.accountXpMax = Math.floor(playerData.accountXpMax * 1.5);
    leveledUp = true;
  }

  if (leveledUp) {
    playerData.revivePotions = (playerData.revivePotions || 0) + 1;
    playerData.luckyEggs = (playerData.luckyEggs || 0) + 1;
    
    if (!playerData.walkingPacks) playerData.walkingPacks = [];
    playerData.walkingPacks.push({
      id: Date.now(),
      targetDistance: 1000, // 1000 meters walk required
      currentDistance: 0,
      opened: false
    });
    
    alert(`🎉 ACCOUNT LEVEL UP!\nYou reached Account Level ${playerData.accountLevel}!\n\n🎁 REWARDS:\n+1 Revive Potion 🧪\n+1 Lucky Egg 🥚 (Double XP for 1hr)\n+1 Walking Pack 🎒 (Walk to unlock!)`);
  }

  if (typeof window.saveGameData === 'function') {
    window.saveGameData();
  }
  
  updateAccountWidget();
};

window.useLuckyEgg = function() {
  if (!playerData.luckyEggs || playerData.luckyEggs <= 0) {
    alert("❌ You don't have any Lucky Eggs! Level up your account to get more.");
    return;
  }

  playerData.luckyEggs--;
  playerData.luckyEggExpiry = Date.now() + (60 * 60 * 1000); // 1 hour from now
  alert("🥚 Lucky Egg activated! Double XP active for the next 1 hour!");
  if (typeof window.saveGameData === 'function') window.saveGameData();
};

window.updateWalkingProgress = function(metersWalked) {
  if (!playerData || !playerData.walkingPacks) return;

  let unlockedPack = false;
  playerData.walkingPacks.forEach(pack => {
    if (!pack.opened && pack.currentDistance < pack.targetDistance) {
      pack.currentDistance += metersWalked;
      if (pack.currentDistance >= pack.targetDistance) {
        unlockedPack = true;
      }
    }
  });

  if (unlockedPack) {
    alert("🎁 A Walking Pack is ready to open!");
  }
};

function updateAccountWidget() {
  if (typeof playerData === 'undefined') return;

  // Update old HUD text element if it exists
  const lvlEl = document.getElementById('accountLevelVal');
  if (lvlEl) lvlEl.innerText = playerData.accountLevel || 1;

  // Update top-right profile widget elements
  const widgetLvlEl = document.getElementById('widgetAccLevel');
  if (widgetLvlEl) widgetLvlEl.innerText = playerData.accountLevel || 1;

  const nameEl = document.getElementById('widgetUsername');
  if (nameEl) nameEl.innerText = playerData.username || "Player";

  const xpBar = document.getElementById('widgetXpBar');
  if (xpBar) {
    const current = playerData.accountXp || 0;
    const max = playerData.accountXpMax || 100;
    const pct = Math.min(100, Math.max(0, (current / max) * 100));
    xpBar.style.width = pct + '%';
  }

  const activeImg = document.getElementById('widgetActiveRotImg');
  if (activeImg && playerData.inventory && playerData.inventory.length > 0) {
    const activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    if (activeFighter && activeFighter.image) {
      activeImg.src = activeFighter.image;
    }
  }
}

setInterval(updateAccountWidget, 1000);