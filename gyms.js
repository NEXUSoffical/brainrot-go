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

// 🟢 ORIGINAL PIN DESIGN: MASSIVE, SPINNING, GLOWING, & BOUNCING 🟢
function renderGymMarker(gymData) {
  if (gymMarkers.some(g => g.id === gymData.id)) return;

  const gymIcon = L.divIcon({
    className: '',
    html: `
      <style>
        @keyframes massiveGymBounceAndSpin {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1.4);
            filter: drop-shadow(0 0 20px #00ff55);
          }
          50% {
            transform: translateY(-15px) rotate(180deg) scale(1.6);
            filter: drop-shadow(0 0 40px #00ffff) drop-shadow(0 0 20px #00ff55);
          }
        }
        @keyframes groundRadarPulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          50% { transform: scale(1.8); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.9; }
        }
      </style>
      <div style="position: relative; width: 90px; height: 110px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        
        <!-- The Massive Animated & Spinning Original Pin -->
        <div style="
          width: 65px;
          height: 65px;
          background: linear-gradient(135deg, #00ff55, #00aa33);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 30px #00ff55;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #fff;
          z-index: 2;
          animation: massiveGymBounceAndSpin 3s ease-in-out infinite;
        ">
          <!-- The white dot in the middle -->
          <div style="
            width: 22px;
            height: 22px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 15px #fff;
            transform: rotate(45deg);
          "></div>
        </div>
        
        <!-- The Huge Glowing Target Ring on the Ground -->
        <div style="
          position: absolute;
          bottom: 2px;
          width: 55px;
          height: 18px;
          border: 4px solid #00ff55;
          border-radius: 50%;
          box-shadow: 0 0 25px #00ff55, inset 0 0 12px #00ff55;
          animation: groundRadarPulse 2s infinite ease-in-out;
        "></div>
      </div>
    `,
    iconSize: [90, 110],
    iconAnchor: [45, 105] // Perfectly anchors the base of the radar ring to the map location
  });

  const marker = L.marker([gymData.lat, gymData.lng], { icon: gymIcon }).addTo(map);
  updateGymPopup(marker, gymData);
  gymMarkers.push({ id: gymData.id, marker: marker, data: gymData });
}

function updateGymPopup(marker, gymData) {
  const isOwner = playerData && gymData.owner === playerData.username;
  marker.bindPopup(`
    <div style="text-align: center; font-family: monospace;">
      <b style="color: #00ff55; font-size: 14px;">🟢 MEME GYM</b><br>
      <span style="font-size: 11px; color: #333;">Defender: ${gymData.defenderName} (Lvl ${gymData.defenderLevel})</span><br>
      <span style="font-size: 10px; color: #666;">Controlled by: ${gymData.owner}</span><br>
      ${isOwner ? 
        `<span style="color: #00ff00; font-size: 11px; font-weight: bold; display: block; margin-top: 6px;">👑 YOU DEFEND THIS GYM</span>` :
        `<button onclick="openGymBattle('${gymData.id}')" style="
          margin-top: 8px; background: #00ff55; color: black; border: none;
          padding: 6px 12px; font-weight: bold; border-radius: 6px; cursor: pointer;
        ">⚔️ CHALLENGE GYM</button>`
      }
    </div>
  `);
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
    alert(`❌ Gyms are locked! You need to be Account Level 10 to challenge gyms. (Current Level: ${accountLevel})`);
    return;
  }

  const gymRef = db.collection('gyms').doc(gymId);
  const doc = await gymRef.get();
  if (!doc.exists) return;

  const gymData = doc.data();
  activeGymId = gymId;

  if (gymData.owner === playerData.username) {
    alert("You already defend this gym!");
    return;
  }

  // 📺 FIX: We are turning the TV screen ON so you can actually see the battle! 📺
  const modal = document.getElementById('battleModal');
  if (modal) modal.style.display = 'flex';

  // Fix all the text at the top so it says you are fighting a Gym Defender
  const wildNameEl = document.getElementById('wildName');
  if (wildNameEl) wildNameEl.innerText = `GYM LEADER: ${gymData.defenderName} (Lvl ${gymData.defenderLevel})`;

  const wildRarityEl = document.getElementById('wildRarity');
  if (wildRarityEl) wildRarityEl.innerText = `RARITY: EPIC DEFENDER`;

  const wildBadgeName = document.getElementById('wildBadgeName');
  if (wildBadgeName) wildBadgeName.innerText = `${gymData.defenderName} (Lvl ${gymData.defenderLevel})`;

  // Close the little map pop-up bubble so it gets out of the way
  if (typeof map !== 'undefined' && map) map.closePopup();

  if (typeof window.initBattle === 'function') {
    window.initBattle({
      name: gymData.defenderName,
      rarity: 'epic',
      level: gymData.defenderLevel,
      image: gymData.defenderImage,
      maxHp: 50 + (gymData.defenderLevel - 1) * 20
    });

    // Lock the claim button until defender HP reaches 0
    const vaultBtn = document.getElementById('vaultCatchBtn');
    if (vaultBtn) {
      vaultBtn.innerText = "🔒 DEFEAT DEFENDER TO CLAIM";
      vaultBtn.style.background = "#444";
      vaultBtn.style.color = "#aaa";
      vaultBtn.onclick = function() {
        if (typeof wildHp !== 'undefined' && wildHp > 0) {
          alert("⚠️ You must completely defeat the defending rot in battle before claiming the gym!");
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
    if (wildHp <= 0 && vaultBtn.innerText.includes("DEFEAT DEFENDER")) {
      vaultBtn.innerText = "👑 VICTORY! CHOOSE GYM DEFENDER";
      vaultBtn.style.background = "#00ff00";
      vaultBtn.style.color = "#000";
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
    gridHtml = '<p style="color: #aaa;">No rots in inventory!</p>';
  } else {
    playerData.inventory.forEach((rot, index) => {
      // Skip rots that are already fainted or busy in another gym
      const isUnavailable = rot.fainted || rot.inGym;
      
      gridHtml += `
        <div onclick="${isUnavailable ? `alert('❌ This rot is unavailable (fainted or defending a gym)!')` : `executeGymClaim('${gymId}', ${index})`}" style="
          background: ${isUnavailable ? '#1a1a1a' : '#222'}; 
          border: 2px solid ${isUnavailable ? '#444' : '#00ff55'}; 
          border-radius: 8px; padding: 8px; cursor: ${isUnavailable ? 'not-allowed' : 'pointer'}; 
          text-align: center; opacity: ${isUnavailable ? '0.4' : '1'};
        ">
          <img src="${rot.image}" style="width: 55px; height: 55px; object-fit: contain; ${isUnavailable ? 'filter: grayscale(100%);' : ''}">
          <div style="font-size: 0.7rem; margin-top: 4px; font-weight: bold; color: #fff;">${rot.name}</div>
          <div style="font-size: 0.6rem; color: ${rot.inGym ? '#00ccff' : (rot.fainted ? '#ff0055' : '#aaa')};">
            ${rot.inGym ? '🏟️ [IN GYM]' : (rot.fainted ? '💀 FAINTED' : 'Lvl ' + (rot.level || 1))}
          </div>
        </div>
      `;
    });
  }

  modal.innerHTML = `
    <div style="background: #111; border: 3px solid #00ff55; border-radius: 15px; padding: 20px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 0 30px rgba(0,255,85,0.4);">
      <h2 style="color: #00ff55; font-size: 1.2rem; margin-bottom: 6px;">👑 CHOOSE GYM DEFENDER</h2>
      <p style="font-size: 0.72rem; color: #aaa; margin-bottom: 12px;">Select which rot you want to leave behind to guard this gym:</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 260px; overflow-y: auto; margin-bottom: 15px; padding: 4px; background: #181818; border-radius: 8px;">
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
    // 🏟️ LOCK THE ROT TO THE GYM 🏟️
    chosenRot.inGym = true;

    // If the rot they just stationed was their active fighter, switch active fighter to someone else available
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

    alert(`🎉 Victory! ${playerData.username} claimed the gym and stationed ${chosenRot.name} as the defender!`);
    
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