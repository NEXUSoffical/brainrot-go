// shop.js - Clean Store, CS:GO Weapon Unboxing, & Stripe Real-Money Purchases

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
    position: fixed; top: 0; left: 0; width: 100vw; height: 100%; max-height: -webkit-fill-available;
    background: rgba(10, 10, 15, 0.98); backdrop-filter: blur(12px);
    z-index: 999999; display: flex; flex-direction: column; align-items: center;
    color: #fff; font-family: monospace; padding: 20px;
    box-sizing: border-box; overflow: hidden;
  `;

  modal.innerHTML = `
    <!-- Header -->
    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ffcc00; padding-bottom: 15px; flex-shrink: 0;">
      <div>
        <h2 style="color: #ffcc00; font-size: 1.8rem; text-shadow: 0 0 15px rgba(255,204,0,0.6); margin: 0 0 5px 0;">&#128722; HUNTER SHOP</h2>
        <p style="font-size: 0.75rem; color: #aaa; margin: 0 0 10px 0;">Spend coins, open crates, or grab upgrades</p>
        <div style="display: inline-block; background: rgba(255,204,0,0.15); border: 2px solid #ffcc00; padding: 6px 16px; border-radius: 30px; font-size: 1rem; font-weight: bold; color: #ffcc00; box-shadow: 0 0 15px rgba(255,204,0,0.2);">
          &#129689; <span id="shopCoinBalance">${currentCoins}</span>
        </div>
      </div>
      <button onclick="document.getElementById('shopModal').remove()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 40px; height: 40px; font-weight: bold; font-size: 1.2rem; cursor: pointer; flex-shrink: 0; box-shadow: 0 0 10px rgba(255,0,85,0.5);">X</button>
    </div>

    <!-- Scrollable Content -->
    <div style="width: 100%; flex: 1; overflow-y: auto; margin-top: 15px; padding-right: 5px; padding-bottom: 30px; display: flex; flex-direction: column; gap: 20px; text-align: left;">
      
      <!-- WEAPON CRATES -->
      <div style="font-size: 0.85rem; color: #ff0000; font-weight: bold; letter-spacing: 1.5px;">ARSENAL WEAPON CRATES</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
        
        <div style="background: #16161a; border: 2px solid #ff5500; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#9876;&#65039;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Standard Arsenal</div>
              <div style="font-size: 0.7rem; color: #aaa; margin-top: 2px;">Drops Common to Epic Weapons</div>
            </div>
          </div>
          <button onclick="openWeaponCrate('standard', 400)" style="background: #ffcc00; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            &#129689; 400
          </button>
        </div>

        <div style="background: #16161a; border: 2px solid #ffcc00; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#128293;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Premium Arsenal</div>
              <div style="font-size: 0.7rem; color: #ffcc00; margin-top: 2px;">Guaranteed Rare or Better!</div>
            </div>
          </div>
          <button onclick="openWeaponCrate('premium', 1200)" style="background: #ffcc00; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            &#129689; 1200
          </button>
        </div>
      </div>

      <!-- ENTITY CRATES -->
      <div style="font-size: 0.85rem; color: #ff00ff; font-weight: bold; letter-spacing: 1.5px; margin-top: 10px;">ENTITY CONTAINMENT CRATES</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
        
        <div style="background: #16161a; border: 2px solid #aaa; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#128230;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Common Crate</div>
              <div style="font-size: 0.7rem; color: #aaa; margin-top: 2px;">Guaranteed Common Entity</div>
            </div>
          </div>
          <button onclick="buyCrate('common', 300)" style="background: #ffcc00; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            &#129689; 300
          </button>
        </div>

        <div style="background: #16161a; border: 2px solid #ff007f; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#127873;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Epic Crate</div>
              <div style="font-size: 0.7rem; color: #ff007f; margin-top: 2px;">Chance for Epic / Rare</div>
            </div>
          </div>
          <button onclick="buyCrate('epic', 1000)" style="background: #ffcc00; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            &#129689; 1000
          </button>
        </div>

        <div style="background: #16161a; border: 2px solid #00ff55; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#127775;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Legendary Crate</div>
              <div style="font-size: 0.7rem; color: #00ff55; margin-top: 2px;">High chance for Legends!</div>
            </div>
          </div>
          <button onclick="buyCrate('legendary', 2500)" style="background: #ffcc00; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            &#129689; 2500
          </button>
        </div>
      </div>

      <!-- UTILITY & UPGRADES -->
      <div style="font-size: 0.85rem; color: #76ff03; font-weight: bold; letter-spacing: 1.5px; margin-top: 10px;">UTILITY & UPGRADES</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
        
        <div style="background: #16161a; border: 2px solid #00ccff; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#127890;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Vault Expansion</div>
              <div style="font-size: 0.7rem; color: #00ccff; margin-top: 2px;">Capacity: ${currentMaxSlots} Slots (+5)</div>
            </div>
          </div>
          <button onclick="buyBackpackUpgrade()" style="background: #00ccff; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(0,204,255,0.4); white-space: nowrap;">
            &#129689; 1000
          </button>
        </div>

        <div style="background: #16161a; border: 2px solid #00ccff; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#129514;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Revive Potion (1x)</div>
              <div style="font-size: 0.7rem; color: #00ccff; margin-top: 2px;">Wakes up a fainted entity!</div>
            </div>
          </div>
          <button onclick="buyItem('revive', 150)" style="background: #ffcc00; color: #000; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,204,0,0.4); white-space: nowrap;">
            &#129689; 150
          </button>
        </div>
      </div>

      <!-- STRIPE REAL-MONEY PURCHASES -->
      <div style="font-size: 0.85rem; color: #ff0055; font-weight: bold; letter-spacing: 1.5px; margin-top: 10px;">SEASON PASS & CURRENCY</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
        
        <div style="background: #16161a; border: 2px solid #ff0055; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#127915;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">Season 1 Hunter Pass</div>
              <div style="font-size: 0.7rem; color: #ff0055; margin-top: 2px;">Unlock all 100 reward tiers</div>
            </div>
          </div>
          <button onclick="buyRotCurrency('battle_pass', 999)" style="background: #ff0055; color: #fff; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,0,85,0.4); white-space: nowrap;">
            $9.99
          </button>
        </div>

        <div style="background: #16161a; border: 2px solid #ff0055; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#129689;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">5,000 Coin Pack</div>
              <div style="font-size: 0.7rem; color: #ff0055; margin-top: 2px;">Instant Currency Bundle</div>
            </div>
          </div>
          <button onclick="buyRotCurrency('5000_rot_pack', 499)" style="background: #ff0055; color: #fff; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,0,85,0.4); white-space: nowrap;">
            $4.99
          </button>
        </div>

        <div style="background: #16161a; border: 2px solid #ff0055; border-radius: 12px; padding: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2.2rem;">&#128176;</div>
            <div>
              <div style="font-weight: bold; font-size: 1rem; color: #fff;">15,000 Coin Pack</div>
              <div style="font-size: 0.7rem; color: #ff0055; margin-top: 2px;">Massive Currency Bundle</div>
            </div>
          </div>
          <button onclick="buyRotCurrency('15000_rot_pack', 999)" style="background: #ff0055; color: #fff; border: none; padding: 10px 14px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 0 12px rgba(255,0,85,0.4); white-space: nowrap;">
            $9.99
          </button>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// =========================================================
// CS:GO STYLE WEAPON UNBOXING SYSTEM
// =========================================================

window.openWeaponCrate = function(tier, cost) {
    if (!playerData) return;
    
    if ((playerData.rotBalance || 0) < cost) {
        if (typeof showGameToast === 'function') showGameToast("Not enough coins!", "#ff0000");
        else alert("Not enough coins!");
        return;
    }

    if (typeof weaponDatabase === 'undefined' || weaponDatabase.length === 0) {
        alert("Weapon database is empty or loading! Ensure gear.js is loaded.");
        return;
    }

    // Deduct coins & close shop
    playerData.rotBalance -= cost;
    if (typeof updateShopBalances === 'function') updateShopBalances();
    document.getElementById('shopModal').remove(); 

    // Determine Drop Rates
    let roll = Math.random() * 100;
    let targetRarity = "Common";
    
    if (tier === 'standard') {
        if (roll > 60 && roll <= 85) targetRarity = "Uncommon";
        else if (roll > 85 && roll <= 95) targetRarity = "Rare";
        else if (roll > 95 && roll <= 99) targetRarity = "Epic";
        else if (roll > 99) targetRarity = "Legendary";
    } else if (tier === 'premium') {
        targetRarity = "Rare"; 
        if (roll > 60 && roll <= 90) targetRarity = "Epic";
        else if (roll > 90) targetRarity = "Legendary";
    }

    let possibleWinners = weaponDatabase.filter(w => w.rarity === targetRarity);
    if (possibleWinners.length === 0) possibleWinners = weaponDatabase;
    
    let winner = possibleWinners[Math.floor(Math.random() * possibleWinners.length)];

    const getRarityColor = (rarity) => {
        if(rarity === "Common") return "#aaaaaa";
        if(rarity === "Uncommon") return "#00ccff";
        if(rarity === "Rare") return "#9900ff";
        if(rarity === "Epic") return "#ff007f";
        if(rarity === "Legendary") return "#ffcc00";
        return "#fff";
    };

    let modal = document.createElement('div');
    modal.id = 'unboxingModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 2, 10, 0.98); z-index: 9999999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
    `;

    modal.innerHTML = `
        <h2 style="color: #fff; font-family: monospace; font-size: 2rem; margin-bottom: 30px; text-shadow: 0 0 10px #ff0055;">UNLOCKING CRATE...</h2>
        
        <div id="spinnerContainer" style="width: 100%; max-width: 800px; height: 160px; background: #0a0a0a; border-top: 3px solid #333; border-bottom: 3px solid #333; position: relative; overflow: hidden; box-shadow: inset 0 0 50px rgba(0,0,0,1);">
            <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; background: #ff0055; z-index: 10; transform: translateX(-50%); box-shadow: 0 0 15px #ff0055;"></div>
            <div id="spinnerTrack" style="display: flex; height: 100%; width: max-content; transition: transform 6s cubic-bezier(0.15, 0.9, 0.2, 1);"></div>
        </div>
        
        <button id="claimWeaponBtn" style="display: none; background: #00ff80; color: #000; border: none; padding: 15px 30px; font-weight: bold; font-size: 1.2rem; font-family: monospace; border-radius: 10px; margin-top: 30px; cursor: pointer; box-shadow: 0 0 20px #00ff80;">
            CLAIM WEAPON
        </button>
    `;
    document.body.appendChild(modal);

    let track = document.getElementById('spinnerTrack');
    let cardWidth = 140; 

    for (let i = 0; i < 60; i++) {
        let itemToRender = (i === 45) ? winner : weaponDatabase[Math.floor(Math.random() * weaponDatabase.length)];
        let color = getRarityColor(itemToRender.rarity);
        
        let card = document.createElement('div');
        card.style.cssText = `
            width: ${cardWidth}px; height: 100%; display: flex; flex-direction: column; 
            align-items: center; justify-content: center; background: #16161a; 
            border-bottom: 8px solid ${color}; border-right: 2px solid #0a0a0a; flex-shrink: 0;
        `;
        card.innerHTML = `
            <img src="${itemToRender.image}" style="width: 70px; height: 70px; object-fit: contain; margin-bottom: 10px; filter: drop-shadow(0 0 5px ${color}88);" onerror="this.style.display='none'">
            <div style="color: #fff; font-family: monospace; font-size: 0.75rem; font-weight: bold; text-align: center; padding: 0 5px; text-shadow: 0 0 5px #000;">${itemToRender.name}</div>
        `;
        track.appendChild(card);
    }

    setTimeout(() => {
        let containerWidth = document.getElementById('spinnerContainer').offsetWidth;
        let randomNudge = Math.floor(Math.random() * 80) - 40; 
        let finalOffset = -((45 * cardWidth) - (containerWidth / 2) + (cardWidth / 2) + randomNudge);
        track.style.transform = `translateX(${finalOffset}px)`;
    }, 100);

    setTimeout(() => {
        let claimBtn = document.getElementById('claimWeaponBtn');
        claimBtn.style.display = 'block';
        
        claimBtn.onclick = () => {
            if (!playerData.gear) playerData.gear = [];
            if (!playerData.gear.includes(winner.id)) {
                playerData.gear.push(winner.id);
            }
            if (typeof saveGameData === 'function') saveGameData();
            
            document.getElementById('unboxingModal').remove();
            
            if (typeof showGameToast === 'function') {
                showGameToast(`UNBOXED: ${winner.name} (${winner.rarity})!`, getRarityColor(winner.rarity));
            } else {
                alert(`You unboxed: ${winner.name}!`);
            }
        };
    }, 6500); 
};

// =========================================================
// STANDARD SHOP FUNCTIONS
// =========================================================

window.buyItem = function(itemType, cost) {
  if (!playerData) return;
  if ((playerData.rotBalance || 0) < cost) {
    alert("Not enough coins!"); return;
  }
  playerData.rotBalance -= cost;
  if (itemType === 'revive') {
    playerData.revivePotions = (playerData.revivePotions || 0) + 1;
    if(typeof showGameToast === 'function') showGameToast("+1 Revive Potion!");
  }
  updateShopBalances();
};

window.buyCrate = function(tier, cost) {
  if (!playerData) return;
  if ((playerData.rotBalance || 0) < cost) {
    alert("Not enough coins!"); return;
  }
  const maxSlots = playerData.maxInventorySlots || 20;
  if (!playerData.inventory) playerData.inventory = [];
  if (playerData.inventory.length >= maxSlots) {
    alert("Your vault is full! Expand your capacity."); return;
  }
  if (typeof brainrotCharacters === 'undefined') return;

  let pool = [];
  if (tier === 'common') pool = brainrotCharacters.filter(c => c.rarity && c.rarity.toLowerCase() === 'common');
  else if (tier === 'epic') pool = brainrotCharacters.filter(c => c.rarity && (c.rarity.toLowerCase() === 'epic' || c.rarity.toLowerCase() === 'rare'));
  else if (tier === 'legendary') pool = brainrotCharacters.filter(c => c.rarity && (c.rarity.toLowerCase() === 'legendary' || c.rarity.toLowerCase() === 'epic'));
  if (pool.length === 0) pool = brainrotCharacters; 

  const chosenTemplate = pool[Math.floor(Math.random() * pool.length)];
  playerData.rotBalance -= cost;
  const targetLevel = tier === 'legendary' ? 10 : (tier === 'epic' ? 5 : 1);
  const newRot = typeof createNewRot === 'function' 
    ? createNewRot(chosenTemplate, targetLevel) 
    : { id: chosenTemplate.id, name: chosenTemplate.name, rarity: chosenTemplate.rarity, image: chosenTemplate.image, level: targetLevel, quality: 50, maxHp: 50, hp: 50, fainted: false, inGym: false };
  playerData.inventory.push(newRot);

  alert(`Crate Opened! You contained a Lvl ${newRot.level} ${newRot.name} (${newRot.rarity.toUpperCase()}) with ${newRot.quality}% IV!`);
  updateShopBalances();
};

window.buyBackpackUpgrade = function() {
  if (!playerData) return;
  const upgradeCost = 1000;
  if ((playerData.rotBalance || 0) < upgradeCost) { alert("You need 1,000 coins!"); return; }
  playerData.rotBalance -= upgradeCost;
  playerData.maxInventorySlots = (playerData.maxInventorySlots || 20) + 5;
  if(typeof showGameToast === 'function') showGameToast("Vault Expanded!", "#00ccff");
  updateShopBalances();
};

function updateShopBalances() {
  if (typeof saveGameData === 'function') saveGameData();
  const balanceEl = document.getElementById('shopCoinBalance');
  if (balanceEl && playerData) balanceEl.innerText = playerData.rotBalance;
  const mainBalanceEl = document.getElementById('rotBalance');
  if (mainBalanceEl && playerData) mainBalanceEl.innerText = playerData.rotBalance;
}

// =========================================================
// STRIPE CHECKOUT CONNECTOR
// =========================================================

window.buyRotCurrency = async function(packageId, priceInCents) {
    try {
        if(typeof showGameToast === 'function') showGameToast("Opening secure checkout...", "#00ccff");

        const response = await fetch('https://brainrot-go.onrender.com/create-checkout-session', {
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
            alert("Payment error: " + session.error);
            return;
        }

        if (session.url) {
            window.location.href = session.url; 
        } else {
            alert("Failed to retrieve checkout session URL.");
        }
    } catch (err) {
        console.error("Stripe Error:", err);
        alert("Failed to connect to payment server.");
    }
};