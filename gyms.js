// gyms.js - Shared World Meme Gyms System (~500m spacing)

let gymMarkers = [];
let activeGymData = null;

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
  // Round to create ~500-meter grid cells
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

  marker.bindPopup(`
    <div style="text-align: center; font-family: monospace;">
      <b style="color: #ff007f; font-size: 14px;">🏰 MEME GYM</b><br>
      <span style="font-size: 11px; color: #333;">Defender: ${gymData.defenderName} (Lvl ${gymData.defenderLevel})</span><br>
      <span style="font-size: 10px; color: #666;">Controlled by: ${gymData.owner}</span><br>
      <button onclick="openGymBattle('${gymData.id}')" style="
        margin-top: 8px; background: #ff007f; color: white; border: none;
        padding: 6px 12px; font-weight: bold; border-radius: 6px; cursor: pointer;
      ">⚔️ CHALLENGE GYM</button>
    </div>
  `);

  gymMarkers.push({ id: gymData.id, marker: marker, data: gymData });
}

window.openGymBattle = async function(gymId) {
  const gymRef = db.collection('gyms').doc(gymId);
  const doc = await gymRef.get();
  if (!doc.exists) return;

  activeGymData = doc.data();
  
  if (typeof window.initBattle === 'function') {
    window.initBattle({
      name: activeGymData.defenderName,
      rarity: 'legendary',
      level: activeGymData.defenderLevel,
      image: activeGymData.defenderImage,
      maxHp: 50 + (activeGymData.defenderLevel - 1) * 15
    });
    
    const vaultBtn = document.getElementById('vaultCatchBtn');
    if (vaultBtn) {
      vaultBtn.innerText = "👑 CLAIM GYM TERRITORY";
      vaultBtn.onclick = function() {
        claimGym(gymId);
      };
    }
  }
};

async function claimGym(gymId) {
  let activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
  if (!activeFighter) return;

  await db.collection('gyms').doc(gymId).update({
    defenderName: activeFighter.name,
    defenderImage: activeFighter.image,
    defenderLevel: activeFighter.level || 1,
    owner: playerData.username || "Player"
  });

  alert(`Success! ${playerData.username} has claimed this Meme Gym!`);
  if (typeof closeBattle === 'function') closeBattle();
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initGymSystem, 3000);
});