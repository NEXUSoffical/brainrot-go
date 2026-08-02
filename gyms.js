// gyms.js - Shared World Meme Gyms System with Custom Defender Selection

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

function renderGymMarker(gymData) {
  if (gymMarkers.some(g => g.id === gymData.id)) return;

  const gymIcon = L.divIcon({
    className: '',
    html: `
      <div style="
        background: linear-gradient(135deg, #ff007f, #7f00ff);
        border: 3px solid #fff;
        border-radius: 500px;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px #ff007f;
        cursor: pointer;
        font-size: 20px;
      ">🏰</div>
    `,
    iconSize: [45, 45],
    iconAnchor: [22, 22]
  });

  const marker = L.marker([gymData.lat, gymData.lng], { icon: gymIcon }).addTo(map);
  updateGymPopup(marker, gymData);
  gymMarkers.push({ id: gymData.id, marker: marker, data: gymData });
}

function updateGymPopup(marker, gymData) {
  const isOwner = playerData && gymData.owner === playerData.username;
  marker.bindPopup(`
    <div style="text-align: center; font-family: monospace;">
      <b style="color: #ff007f; font-size: 14px;">🏰 MEME GYM</b><br>
      <span style="font-size: 11px; color: #333;">Defender: ${gymData.defenderName} (Lvl ${gymData.defenderLevel})</span><br>
      <span style="font-size: 10px; color: #666;">Controlled by: ${gymData.owner}</span><br>
      ${isOwner ? 
        `<span style="color: #00ff00; font-size: 11px; font-weight: bold; display: block; margin-top: 6px;">👑 YOU DEFEND THIS GYM</span>` :
        `<button onclick="openGymBattle('${gymData.id}')" style="
          margin-top: 8px; background: #ff007f; color: white; border: none;
          padding: 6px 12px; font-weight: bold; border-radius: 6px; cursor: pointer;
        ">⚔️ CHALLENGE GYM</button>`
      }
    </div>
  `);
}

window.openGymBattle = async function(gymId) {
  const gymRef = db.collection('gyms').doc(gymId);
  const doc = await gymRef.get();
  if (!doc.exists) return;

  const gymData = doc.data();
  activeGymId = gymId;

  if (gymData.owner === playerData.username) {
    alert("You already defend this gym!");
    return;
  }

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
      gridHtml += `
        <div onclick="executeGymClaim('${gymId}', ${index})" style="
          background: #222; border: 2px solid #ff007f; border-radius: 8px;
          padding: 8px; cursor: pointer; text-align: center; transition: transform 0.1s;
        ">
          <img src="${rot.image}" style="width: 55px; height: 55px; object-fit: contain;">
          <div style="font-size: 0.7rem; margin-top: 4px; font-weight: bold; color: #fff;">${rot.name}</div>
          <div style="font-size: 0.6rem; color: #aaa;">Lvl ${rot.level || 1}</div>
        </div>
      `;
    });
  }

  modal.innerHTML = `
    <div style="background: #111; border: 3px solid #ff007f; border-radius: 15px; padding: 20px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 0 30px rgba(255,0,127,0.4);">
      <h2 style="color: #ff007f; font-size: 1.2rem; margin-bottom: 6px;">👑 CHOOSE GYM DEFENDER</h2>
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
  if (!chosenRot) return;

  try {
    await db.collection('gyms').doc(gymId).update({
      defenderName: chosenRot.name,
      defenderImage: chosenRot.image,
      defenderLevel: chosenRot.level || 1,
      owner: playerData.username || "Player"
    });

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