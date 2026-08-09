// shop.js - Full-Screen Immersive Store for buying items, bundles, gacha crates, and Stripe packs

function openShopModal() {
  let existing = document.getElementById('shopModal');
  if (existing) existing.remove();

  if (typeof playerData !== 'undefined' && typeof playerData.rotBalance === 'undefined') {
    playerData.rotBalance = 0;
  }

  const currentCoins = playerData.rotBalance || 0;
  const currentMaxSlots = (playerData && playerData.maxInventorySlots) ? playerData.maxInventorySlots : 20;

  const modal = document.createElement('div');
  modal.id = 'shopModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(10, 10, 15, 0.98); backdrop-filter: blur(12px);
    z-index: 999999; display: flex; flex-direction: column; align-items: center;
    justify-content: space-between; color: #fff; font-family: monospace; padding: 30px 40px;
    box-sizing: border-box;
  `;

  modal.innerHTML = `
    <!-- Top Full-Width Header -->
    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ffcc00; padding-bottom: 20px;">
      <div>
        <h2 style="color: #ffcc00; font-size: 2rem; text-shadow: 0 0 15px rgba(255,204,0,0.6); margin-bottom: 4px;">🛒 THE ITEM SHOP</h2>
        <p style="font-size: 0.85rem; color: #aaa;">Spend coins, open character crates, or grab currency packs</p>
      </div>
      <div style="background: rgba(255,204,0,0.15); border: 2px solid #ffcc00; padding: 10px 22px; border-radius: 30px; font-size: 1.1rem; font-weight: bold; color: #ffcc00; box-shadow: 0 0 15px rgba(255,204,0,0.2);">
        🪙 <span id="shopCoinBalance">${currentCoins}</span>
      </div>
    </div>

    <!-- Full-Width Scrollable Grid Content Area -->
    <div style="width: 100%; flex: 1; overflow-y: auto; margin: 25px 0; padding-right: 10px; display: flex; flex-direction: column; gap: 20px; text-align: left;">
      
      <div style="font-size: 0.85rem; color: #ff00ff; font-weight: bold; letter-spacing: 1.5px;">MYSTERY CHARACTER CRATES</div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
        <!-- Common Crate -->
        <div style="background: #16161a; border: 2px solid #aaa; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">📦</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Common Crate</div>
              <div style="font-size: 0.75rem; color: #aaa; margin-top: 2px;">Guaranteed Common Rot</div>
            </div>
          </div>
          <button onclick="buyCrate('common', 300)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 300
          </button>
        </div>

        <!-- Epic Crate -->
        <div style="background: #16161a; border: 2px solid #ff007f; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">🎁</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Epic Crate</div>
              <div style="font-size: 0.75rem; color: #ff007f; margin-top: 2px;">Chance for Epic / Rare Rots</div>
            </div>
          </div>
          <button onclick="buyCrate('epic', 1000)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 1000
          </button>
        </div>

        <!-- Legendary Titan Crate -->
        <div style="background: #16161a; border: 2px solid #00ff55; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">🌟</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Legendary Titan Crate</div>
              <div style="font-size: 0.75rem; color: #00ff55; margin-top: 2px;">High chance for Titan Mech & Legends!</div>
            </div>
          </div>
          <button onclick="buyCrate('legendary', 2500)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 2500
          </button>
        </div>
      </div>

      <div style="font-size: 0.85rem; color: #76ff03; font-weight: bold; letter-spacing: 1.5px; margin-top: 10px;">UTILITY & UPGRADES</div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
        <!-- Backpack / Inventory Upgrade -->
        <div style="background: #16161a; border: 2px solid #00ccff; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">🎒</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Backpack Expansion</div>
              <div style="font-size: 0.75rem; color: #00ccff; margin-top: 2px;">Capacity: ${currentMaxSlots} Slots (+5 Slots)</div>
            </div>
          </div>
          <button onclick="buyBackpackUpgrade()" style="background: #00ccff; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(0,204,255,0.4); white-space: nowrap;">
            🪙 1000
          </button>
        </div>

        <!-- Revive Potion -->
        <div style="background: #16161a; border: 2px solid #00ccff; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">🧪</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Revive Potion (1x)</div>
              <div style="font-size: 0.75rem; color: #00ccff; margin-top: 2px;">Wakes up a fainted rot!</div>
            </div>
          </div>
          <button onclick="buyItem('revive', 150)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 150
          </button>
        </div>

        <!-- Lucky Egg -->
        <div style="background: #16161a; border: 2px solid #ff00ff; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">🥚</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Lucky Egg (1x)</div>
              <div style="font-size: 0.75rem; color: #ff00ff; margin-top: 2px;">Double Account XP for 1hr!</div>
            </div>
          </div>
          <button onclick="buyItem('egg', 500)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 500
          </button>
        </div>
      </div>

      <div style="font-size: 0.85rem; color: #00ff55; font-weight: bold; letter-spacing: 1.5px; margin-top: 10px;">VALUE BUNDLES</div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
        <!-- Potion Bundle (5x Revive) -->
        <div style="background: #16161a; border: 2px solid #00ff55; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">📦🧪</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Potion Bundle (5x)</div>
              <div style="font-size: 0.75rem; color: #00ff55; margin-top: 2px;">Stock up on revive potions!</div>
            </div>
          </div>
          <button onclick="buyBundle('potions_5', 600)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 600
          </button>
        </div>

        <!-- Egg Bundle (3x Lucky Eggs) -->
        <div style="background: #16161a; border: 2px solid #00ff55; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">📦🥚</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">Egg Bundle (3x)</div>
              <div style="font-size: 0.75rem; color: #00ff55; margin-top: 2px;">Triple XP Boost Pack!</div>
            </div>
          </div>
          <button onclick="buyBundle('eggs_3', 1200)" style="background: #ffcc00; color: #000; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            🪙 1200
          </button>
        </div>
      </div>

      <div style="font-size: 0.85rem; color: #ff0055; font-weight: bold; letter-spacing: 1.5px; margin-top: 10px;">GET MORE ROT (STRIPE CARD)</div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
        <!-- 5,000 Rot Pack -->
        <div style="background: #16161a; border: 2px solid #ff0055; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">💰</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">5,000 Rot Pack</div>
              <div style="font-size: 0.75rem; color: #ff0055; margin-top: 2px;">Instant Currency Bundle</div>
            </div>
          </div>
          <button onclick="buyRotCurrency('5000_rot_pack', 499)" style="background: #ff0055; color: #fff; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,0,85,0.4); white-space: nowrap;">
            $4.99
          </button>
        </div>

        <!-- 15,000 Rot Pack -->
        <div style="background: #16161a; border: 2px solid #ff0055; border-radius: 12px; padding: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5rem;">💎</div>
            <div>
              <div style="font-weight: bold; font-size: 1.05rem; color: #fff;">15,000 Rot Pack</div>
              <div style="font-size: 0.75rem; color: #ff0055; margin-top: 2px;">Massive Currency Bundle</div>
            </div>
          </div>
          <button onclick="buyRotCurrency('15000_rot_pack', 999)" style="background: #ff0055; color: #fff; border: none; padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,0,85,0.4); white-space: nowrap;">
            $9.99
          </button>
        </div>
      </div>

    </div>

    <!-- Bottom Full-Width Close Button -->
    <div style="width: 100%;">
      <button onclick="document.getElementById('shopModal').remove()" style="background: #333; color: #fff; border: none; padding: 16px; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%; font-size: 1.05rem; font-family: monospace; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">LEAVE SHOP</button>
    </div>
  `;

  document.body.appendChild(modal);
}

window.buyItem = function(itemType, cost) {
  if (!playerData) return;
  
  if ((playerData.rotBalance || 0) < cost) {
    alert("❌ Not enough coins! Go defeat some wild brain rots to earn more!");
    return;
  }

  playerData.rotBalance -= cost;

  if (itemType === 'revive') {
    playerData.revivePotions = (playerData.revivePotions || 0) + 1;
    alert("🧪 Successfully bought 1x Revive Potion!");
  } else if (itemType === 'egg') {
    playerData.luckyEggs = (playerData.luckyEggs || 0) + 1;
    alert("🥚 Successfully bought 1x Lucky Egg!");
  }

  updateShopBalances();
};

window.buyBundle = function(bundleType, cost) {
  if (!playerData) return;
  
  if ((playerData.rotBalance || 0) < cost) {
    alert("❌ Not enough coins to purchase this bundle!");
    return;
  }

  playerData.rotBalance -= cost;

  if (bundleType === 'potions_5') {
    playerData.revivePotions = (playerData.revivePotions || 0) + 5;
    alert("📦 Successfully bought Potion Bundle (5x Revive Potions)!");
  } else if (bundleType === 'eggs_3') {
    playerData.luckyEggs = (playerData.luckyEggs || 0) + 3;
    alert("📦 Successfully bought Egg Bundle (3x Lucky Eggs)!");
  }

  updateShopBalances();
};

window.buyCrate = function(tier, cost) {
  if (!playerData) return;

  if ((playerData.rotBalance || 0) < cost) {
    alert("❌ Not enough coins to open this crate!");
    return;
  }

  // Check inventory capacity
  const maxSlots = playerData.maxInventorySlots || 20;
  if (!playerData.inventory) playerData.inventory = [];
  if (playerData.inventory.length >= maxSlots) {
    alert("❌ Your backpack is full! Upgrade your backpack capacity or transfer rots before opening crates.");
    return;
  }

  if (typeof brainrotCharacters === 'undefined') {
    alert("❌ Character database not loaded.");
    return;
  }

  // Filter characters by tier
  let pool = [];
  if (tier === 'common') {
    pool = brainrotCharacters.filter(c => c.rarity && c.rarity.toLowerCase() === 'common');
  } else if (tier === 'epic') {
    pool = brainrotCharacters.filter(c => c.rarity && (c.rarity.toLowerCase() === 'epic' || c.rarity.toLowerCase() === 'rare'));
  } else if (tier === 'legendary') {
    pool = brainrotCharacters.filter(c => c.rarity && (c.rarity.toLowerCase() === 'legendary' || c.rarity.toLowerCase() === 'epic'));
  }

  if (pool.length === 0) pool = brainrotCharacters; // Fallback

  // Pick a random character from the pool
  const chosenTemplate = pool[Math.floor(Math.random() * pool.length)];
  
  playerData.rotBalance -= cost;

  // Add new rot to player inventory
  const newRot = {
    id: chosenTemplate.id,
    name: chosenTemplate.name,
    rarity: chosenTemplate.rarity,
    image: chosenTemplate.image,
    level: tier === 'legendary' ? 10 : (tier === 'epic' ? 5 : 1),
    maxHp: 50 + ((tier === 'legendary' ? 10 : (tier === 'epic' ? 5 : 1)) - 1) * 20,
    hp: 50 + ((tier === 'legendary' ? 10 : (tier === 'epic' ? 5 : 1)) - 1) * 20,
    fainted: false,
    inGym: false
  };

  playerData.inventory.push(newRot);

  alert(`🎉 Crate Opened! You pulled a Lvl ${newRot.level} ${newRot.name} (${newRot.rarity.toUpperCase()})!`);
  updateShopBalances();
};

window.buyBackpackUpgrade = function() {
  if (!playerData) return;
  
  const upgradeCost = 1000;
  if ((playerData.rotBalance || 0) < upgradeCost) {
    alert("❌ You need 1,000 coins to expand your backpack!");
    return;
  }

  playerData.rotBalance -= upgradeCost;
  playerData.maxInventorySlots = (playerData.maxInventorySlots || 20) + 5;

  alert(`🎒 Backpack successfully upgraded! New max capacity: ${playerData.maxInventorySlots} slots.`);
  updateShopBalances();
};

function updateShopBalances() {
  if (typeof saveGameData === 'function') {
    saveGameData();
  }

  const balanceEl = document.getElementById('shopCoinBalance');
  if (balanceEl && playerData) {
    balanceEl.innerText = playerData.rotBalance;
  }
  
  const mainBalanceEl = document.getElementById('rotBalance');
  if (mainBalanceEl && playerData) {
    mainBalanceEl.innerText = playerData.rotBalance;
  }
  
  if (typeof updatePotionHud === 'function') {
    updatePotionHud();
  }

  if (document.getElementById('shopModal')) {
    openShopModal();
  }
}

// 💳 STRIPE CHECKOUT CONNECTOR
const stripe = typeof Stripe !== 'undefined' ? Stripe('pk_test_51U2bHZKpUjLzVxeCp5bFtUCD2JXSWy2pbb53F7LxDuOe4R6FUmRACXeZE7lGhB6Ky7T1PZo76DVj1bswGQYtmHYJ00HXnOcmNV') : null;

window.buyRotCurrency = async function(packageId, priceInCents) {
    if (!stripe) {
        alert("❌ Stripe SDK not loaded.");
        return;
    }

    try {
        alert("Opening secure Stripe checkout...");

        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                packageId: packageId,
                amount: priceInCents,
                username: (typeof playerData !== 'undefined' && playerData.username) ? playerData.username : "Guest"
            })
        });

        const session = await response.json();
        if (session.error) {
            alert("❌ Payment error: " + session.error);
            return;
        }

        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) {
            alert(result.error.message);
        }
    } catch (err) {
        console.error("Stripe Error:", err);
        alert("❌ Failed to connect to payment server.");
    }
};