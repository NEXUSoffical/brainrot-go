// gyms.js - Shared World Meme Gyms System with Custom Defender Selection & In-Gym Lock

let gymMarkers = [];
let activeGymId = null;

function initGymSystem() {
  if (typeof db === 'undefined' || typeof map === 'undefined') {
    setTimeout(initGymSystem, 1000);
    return;
  }

  // Check for gyms near player every few seconds
  setInterval(() => {
    let pLat = typeof playerLat !== 'undefined' ? playerLat : window.currentLat;
    let pLng = typeof playerLng !== 'undefined' ? playerLng : window.currentLng;

    if (!pLat || !pLng) return;

    checkOrCreateNearbyGym(pLat, pLng);
  }, 5000);
}

// Convert coordinates into a shared grid key (~500-meter blocks)
function getGridKey(lat, lng) {
  return `gym_${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

async function checkOrCreateNearbyGym(lat, lng) {
  const gridLat = Math.round(lat * 200) / 200;
  const gridLng = Math.round(lng * 200) / 200;
  const gymId = getGridKey(gridLat, gridLng);

  try {
    const gymRef = db.collection('gyms').doc(gymId);
    const doc = await gymRef.get();

    if (!doc.exists) {
      const defaultGym = {
        id: gymId,
        lat: gridLat,
        lng: gridLng,
        defenderName: "Wild Noobini",
        defenderImage: "brainrots/noobini_pizzanini.png",
        defenderLevel: 5,
        owner: "Server AI",
        rewardPool: 100
      };
      await gymRef.set(defaultGym);
      renderGymMarker(defaultGym);
    } else {
      renderGymMarker(doc.data());
    }
  } catch (e) {
    console.error("Gym sync error:", e);
  }
}

// 🔴 MASSIVE, SPOOKY, PULSING RITUAL SITE 🔴
function renderGymMarker(gymData) {
  if (gymMarkers.some(g => g.id === gymData.id)) return;

  const gymIcon = L.divIcon({
    className: '',
    html: `
      <style>
        .gym-container {
            position: relative;
            width: 260px;
            height: 260px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        /* 1. Massive perfect circle container */
        .gym-ground-decal {
            position: absolute;
            top: 50%; left: 50%;
            width: 240px; height: 240px;
            margin-top: -120px; margin-left: -120px;
            mix-blend-mode: screen; 
            z-index: 1;
        }
        
        /* 2. Flat rotation */
        @keyframes flatSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Counter-rotation for the inner runes to make it look complex */
        @keyframes counterSpin {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
        }

        /* 3. Intense, spooky heartbeat pulse */
        @keyframes demonicPulse {
            0%, 100% { 
                filter: drop-shadow(0px 0px 8px #ff0033) drop-shadow(0px 0px 20px #880000); 
                transform: scale(1);
                opacity: 0.8;
            }
            50% { 
                filter: drop-shadow(0px 0px 20px #ff0033) drop-shadow(0px 0px 45px #ff0000); 
                transform: scale(1.04);
                opacity: 1;
            }
        }

        .gym-pentagram-svg {
            width: 100%;
            height: 100%;
            animation: flatSpin 25s linear infinite, demonicPulse 3s ease-in-out infinite;
        }
        
        .gym-inner-runes {
            transform-origin: 50px 50px;
            animation: counterSpin 15s linear infinite;
        }

        /* 4. The floating label */
        .gym-label {
            position: absolute;
            top: 15px;
            background: rgba(10, 0, 0, 0.95);
            border: 2px solid #ff0033;
            color: #ff0033;
            font-family: monospace;
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 1.1rem;
            text-shadow: 0 0 10px #ff0033, 0 0 20px #ff0000;
            box-shadow: 0 0 20px rgba(255, 0, 51, 0.8);
            letter-spacing: 2px;
            white-space: nowrap;
            z-index: 10;
        }
      </style>

      <div class="gym-container">
          <!-- RITUAL SITE LABEL -->
          <div class="gym-label">RITUAL SITE</div>
          
          <!-- THE FLAT FLOOR DECAL -->
          <div class="gym-ground-decal">
              <svg viewBox="0 0 100 100" class="gym-pentagram-svg">
                  <!-- Demonic Pentagram (Flipped Upside Down via SVG) -->
                  <g transform="rotate(180 50 50)">
                      <!-- Outer bloody aura -->
                      <circle cx="50" cy="50" r="48" fill="rgba(255,0,0,0.08)" stroke="#ff0033" stroke-width="1.5" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff0033" stroke-width="0.5" />
                      
                      <!-- Counter-rotating occult dashes -->
                      <g class="gym-inner-runes">
                          <circle cx="50" cy="50" r="41" fill="none" stroke="#ff0033" stroke-width="2" stroke-dasharray="2 6 8 4" />
                          <circle cx="50" cy="50" r="37" fill="none" stroke="#ff0033" stroke-width="0.5" stroke-dasharray="1 3" />
                      </g>

                      <polygon points="50,5 64,38 98,38 71,59 81,95 50,75 19,95 29,59 2,38 36,38" fill="rgba(255,0,0,0.1)" stroke="#ff0033" stroke-width="1.5" />
                      <circle cx="50" cy="50" r="23" fill="none" stroke="#ff0033" stroke-width="1" />
                      <circle cx="50" cy="50" r="4" fill="#ff0033" opacity="0.9" />
                  </g>
              </svg>
          </div>

          <!-- INVISIBLE CLICK TARGET (Covers the whole area so you can easily tap it) -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 20;" onclick="openGymBattle('${gymData.id}')"></div>
      </div>
    `,
    iconSize: [260, 260],
    iconAnchor: [130, 130] // Perfectly centers the massive marker
  });

  const marker = L.marker([gymData.lat, gymData.lng], { icon: gymIcon }).addTo(map);
  gymMarkers.push({ id: gymData.id, marker: marker, data: gymData });
}

// 🚶 REAL GPS WALKING VALIDATION CHECK 🚶
window.checkRealWorldAccess = function(featureName) {
    if (typeof isRealWorldMode === 'undefined' || !isRealWorldMode) {
        alert(`❌ Couch Potato Alert! You must switch to "REAL GPS" mode in the menu and walk outside to access ${featureName}.`);
        return false;
    }
    return true;
};

window.openGymBattle = async function(gymId) {
  // 🚶 REQUIRE REAL GPS WALKING MODE TO ACCESS GYMS 🚶
  if (!window.checkRealWorldAccess("Gyms")) return;

  // 🔒 REQUIRE ACCOUNT LEVEL 10 TO CHALLENGE GYMS 🔒
  const accountLevel = (playerData && playerData.accountLevel) || 1;
  if (accountLevel < 10) {
    alert(`❌ Ritual Sites are locked! You need to be Account Level 10 to challenge them. (Current Level: ${accountLevel})`);
    return;
  }

  const gymRef = db.collection('gyms').doc(gymId);
  const doc = await gymRef.get();
  if (!doc.exists) return;

  const gymData = doc.data();
  activeGymId = gymId;

  if (gymData.owner === playerData.username) {
    alert("You already defend this site!");
    return;
  }

  // 📺 TURN ON THE TV SCREEN BATTLE UI 📺
  const modal = document.getElementById('battleModal');
  if (modal) modal.style.display = 'flex';

  const wildNameEl = document.getElementById('wildName');
  if (wildNameEl) wildNameEl.innerText = `SITE GUARDIAN: ${gymData.defenderName} (Lvl ${gymData.defenderLevel})`;

  const wildRarityEl = document.getElementById('wildRarity');
  if (wildRarityEl) wildRarityEl.innerText = `RARITY: EPIC DEFENDER`;

  const wildBadgeName = document.getElementById('wildBadgeName');
  if (wildBadgeName) wildBadgeName.innerText = `${gymData.defenderName} (Lvl ${gymData.defenderLevel})`;

  if (typeof map !== 'undefined' && map) map.closePopup();

  if (typeof window.initBattle === 'function') {
    window.initBattle({
      name: gymData.defenderName,
      rarity: 'epic',
      level: gymData.defenderLevel,
      image: gymData.defenderImage,
      maxHp: 50 + (gymData.defenderLevel - 1) * 20
    });

    const vaultBtn = document.getElementById('vaultCatchBtn');
    if (vaultBtn) {
      vaultBtn.innerText = "🔒 DEFEAT GUARDIAN TO CLAIM";
      vaultBtn.style.background = "#444";
      vaultBtn.style.color = "#aaa";
      vaultBtn.onclick = function() {
        if (typeof wildHp !== 'undefined' && wildHp > 0) {
          alert("⚠️ You must completely defeat the defending entity in battle before claiming the site!");
          return;
        }
        openGymRotSelector(activeGymId);
      };
    }
  }
};

// Real-time listener to unlock claim button when the defender is beaten
setInterval(() => {
  const vaultBtn = document.getElementById('vaultCatchBtn');
  if (vaultBtn && activeGymId && typeof wildHp !== 'undefined') {
    if (wildHp <= 0 && vaultBtn.innerText.includes("DEFEAT GUARDIAN")) {
      vaultBtn.innerText = "👑 VICTORY! BIND NEW GUARDIAN";
      vaultBtn.style.background = "#ff0033"; 
      vaultBtn.style.color = "#fff";
    }
  }
}, 500);

function openGymRotSelector(gymId) {
  const existing = document.getElementById('gymSelectorModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'gymSelectorModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.95); z-index: 999999; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    color: #fff; font-family: monospace; padding: 20px;
  `;

  let gridHtml = '';
  if (!playerData || !playerData.inventory || playerData.inventory.length === 0) {
    gridHtml = '<p style="color: #aaa;">No entities in inventory!</p>';
  } else {
    playerData.inventory.forEach((rot, index) => {
      const isUnavailable = rot.fainted || rot.inGym;
      
      gridHtml += `
        <div onclick="${isUnavailable ? `alert('❌ This entity is unavailable (fainted or defending a site)!')` : `executeGymClaim('${gymId}', ${index})`}" style="
          background: ${isUnavailable ? '#1a0005' : '#2a000a'}; 
          border: 2px solid ${isUnavailable ? '#444' : '#ff0033'}; 
          border-radius: 8px; padding: 8px; cursor: ${isUnavailable ? 'not-allowed' : 'pointer'}; 
          text-align: center; opacity: ${isUnavailable ? '0.4' : '1'};
        ">
          <img src="${rot.image}" style="width: 55px; height: 55px; object-fit: contain; ${isUnavailable ? 'filter: grayscale(100%);' : ''}">
          <div style="font-size: 0.7rem; margin-top: 4px; font-weight: bold; color: #fff;">${rot.name}</div>
          <div style="font-size: 0.6rem; color: ${rot.inGym ? '#ffaa00' : (rot.fainted ? '#555' : '#ccc')};">
            ${rot.inGym ? '🛡️ [BOUND]' : (rot.fainted ? '💀 FAINTED' : 'Lvl ' + (rot.level || 1))}
          </div>
        </div>
      `;
    });
  }

  modal.innerHTML = `
    <div style="background: #0a0002; border: 3px solid #ff0033; border-radius: 15px; padding: 20px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 0 30px rgba(255,0,51,0.5);">
      <h2 style="color: #ff0033; font-size: 1.2rem; margin-bottom: 6px; text-shadow: 0 0 8px #ff0033;">👑 BIND SITE GUARDIAN</h2>
      <p style="font-size: 0.72rem; color: #aaa; margin-bottom: 12px;">Select which entity you want to bind to this Ritual Site as its guardian:</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 260px; overflow-y: auto; margin-bottom: 15px; padding: 4px; background: #110000; border-radius: 8px;">
        ${gridHtml}
      </div>
      <button onclick="document.getElementById('gymSelectorModal').remove()" style="background: #333; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CANCEL</button>
    </div>
  `;
  document.body.appendChild(modal);
}

window.executeGymClaim = async function(gymId, index) {
  let chosenRot = playerData.inventory[index];
  if (!chosenRot || chosenRot.inGym || chosenRot.fainted) return;

  try {
    // 🛡️ LOCK THE ROT TO THE GYM 🛡️
    chosenRot.inGym = true;

    if (playerData.activeFighterIndex === index) {
      const availableIndex = playerData.inventory.findIndex(r => !r.fainted && !r.inGym);
      playerData.activeFighterIndex = availableIndex !== -1 ? availableIndex : 0;
    }

    await db.collection('gyms').doc(gymId).update({
      defenderName: chosenRot.name,
      defenderImage: chosenRot.image,
      defenderLevel: chosenRot.level || 1,
      owner: playerData.username || "Player"
    });

    if (typeof saveGameData === 'function') {
      saveGameData();
    }

    alert(`🎉 Victory! ${playerData.username} claimed the site and bound ${chosenRot.name} as the guardian!`);
    
    const modal = document.getElementById('gymSelectorModal');
    if (modal) modal.remove();
    if (typeof closeBattle === 'function') closeBattle();
    location.reload();
  } catch (e) {
    console.error("Error claiming gym:", e);
    alert("Failed to claim gym. Check console.");
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initGymSystem, 3000);
});