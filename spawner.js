// spawner.js - Dynamic GPS-Based Brainrot Spawner & Spawns

let spawnedCreatures = [];
let lastSpawnLat = null;
let lastSpawnLng = null;

// Expose activeCreatures globally so battle.js can filter them out on capture
window.activeCreatures = spawnedCreatures;

// Stricter level generator with a massive bias for Level 1:
// - Level 1: 60% (The absolute most common spawn)
// - Levels 2-10: 28% (Common low levels)
// - Levels 11-20: 10% (Uncommon)
// - Levels 21-50: 1.8% (Very rare)
// - Levels 51-100: 0.2% (Extremely rare)
function getRandomLevel() {
  const roll = Math.random();
  if (roll < 0.60) {
    return 1;                                        // Exactly Level 1 (60%)
  } else if (roll < 0.88) {
    return Math.floor(Math.random() * 9) + 2;        // Levels 2 - 10 (28%)
  } else if (roll < 0.98) {
    return Math.floor(Math.random() * 10) + 11;      // Levels 11 - 20 (10%)
  } else if (roll < 0.998) {
    return Math.floor(Math.random() * 30) + 21;      // Levels 21 - 50 (1.8%)
  } else {
    return Math.floor(Math.random() * 50) + 51;      // Levels 51 - 100 (0.2%)
  }
}

// 1. Get a random brainrot character that actually has an image loaded
function getRandomBrainrot() {
  const availableCharacters = brainrotCharacters.filter(char => char.image && char.image.trim() !== "");
  if (availableCharacters.length === 0) return brainrotCharacters[0];
  const randomIndex = Math.floor(Math.random() * availableCharacters.length);
  return availableCharacters[randomIndex];
}

// Helper to get rarity color for the cards
function getRarityColor(rarity) {
  switch ((rarity || '').toLowerCase()) {
    case 'secret': return '#ff0055';    // Neon Pink
    case 'mythic': return '#9900ff';    // Purple
    case 'legendary': return '#ffaa00'; // Gold
    case 'epic': return '#0088ff';      // Blue
    case 'rare': return '#00cc44';      // Green
    case 'uncommon': return '#cccc00';  // Yellow
    default: return '#888888';          // Grey
  }
}

// Global function to trigger battle from the popup
window.startEncounter = function(name, rarity, reward, imageUrl, level, maxHp) {
  const modal = document.getElementById('battleModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  
  const wildNameEl = document.getElementById('wildName');
  if (wildNameEl) wildNameEl.innerText = `${name} (Lvl ${level})`;

  const wildRarityEl = document.getElementById('wildRarity');
  if (wildRarityEl) wildRarityEl.innerText = `RARITY: ${rarity.toUpperCase()}`;

  const wildBadgeName = document.getElementById('wildBadgeName');
  if (wildBadgeName) wildBadgeName.innerText = `${name} (Lvl ${level})`;

  // Find the exact active creature instance matching this encounter so battle.js can reference it
  const matchedCreature = spawnedCreatures.find(c => c.data.name === name && c.data.level === Number(level))?.data || {
    name, 
    rarity, 
    reward, 
    image: imageUrl,
    level: Number(level),
    maxHp: Number(maxHp),
    hp: Number(maxHp)
  };

  // Initialize battle with exact level and stat scaling
  if (typeof window.initBattle === 'function') {
    window.initBattle(matchedCreature);
  }
};

// 2. Spawn Rarity-Colored Cards close to the player's immediate radius
function spawnSingleCreature(lat, lng) {
  // Ensure Leaflet map is fully initialized before attempting to spawn
  if (typeof L === 'undefined' || typeof map === 'undefined' || !map || typeof map.addLayer !== 'function') {
    return;
  }

  const currentLat = lat || (typeof playerLat !== 'undefined' ? playerLat : 53.45565);
  const currentLng = lng || (typeof playerLng !== 'undefined' ? playerLng : -2.97733);

  const characterTemplate = getRandomBrainrot();
  const level = getRandomLevel();
  const maxHp = 50 + (level - 1) * 12;

  const creatureInstance = {
    ...characterTemplate,
    level: level,
    maxHp: maxHp,
    hp: maxHp
  };
  
  // Tighter radius offset (~65 meters max spread so they appear right around you)
  const offsetLat = (Math.random() - 0.5) * 0.0006;
  const offsetLng = (Math.random() - 0.5) * 0.0006;
  
  const spawnLat = currentLat + offsetLat;
  const spawnLng = currentLng + offsetLng;

  const imageUrl = creatureInstance.image;
  const rarityColor = getRarityColor(creatureInstance.rarity);
  const safeName = creatureInstance.name.replace(/'/g, "\\'");
    
  const cardHtml = `
    <div style="position: relative;">
      <div style="
        width: 80px; 
        background: linear-gradient(135deg, #111111, ${rarityColor}55); 
        border: 3px solid ${rarityColor}; 
        border-radius: 8px; 
        box-shadow: 0 0 15px ${rarityColor}; 
        padding: 4px; 
        display: flex; 
        flex-direction: column; 
        align-items: center;
      ">
        <div style="
          width: 100%; 
          height: 70px; 
          background-color: #ffffff; 
          border-radius: 4px; 
          overflow: hidden; 
          border: 1px solid #444;
        ">
            <img src="${imageUrl}" style="
              width: 100%; 
              height: 100%; 
              object-fit: cover;
              mix-blend-mode: multiply;
              filter: brightness(1.2) contrast(3);
            " onerror="this.style.display='none';">
        </div>
      </div>
      <div style="
        position: absolute; 
        bottom: -14px; 
        left: 50%; 
        transform: translateX(-50%); 
        background: rgba(0,0,0,0.85); 
        border: 1px solid ${rarityColor}; 
        color: ${rarityColor}; 
        font-size: 8px; 
        font-family: monospace; 
        padding: 1px 5px; 
        border-radius: 4px; 
        white-space: nowrap; 
        font-weight: bold;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
      ">
        Lvl ${level}
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    className: '', 
    html: cardHtml,
    iconSize: [80, 90], 
    iconAnchor: [40, 45],
    popupAnchor: [0, -40]
  });

  const marker = L.marker([spawnLat, spawnLng], { icon: customIcon }).addTo(map);
  
  // Attach marker reference directly to the creature object so battle.js can delete it
  creatureInstance.marker = marker;

  marker.bindPopup(`
    <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
      <b style="font-size: 15px; color: #222;">${creatureInstance.name}</b><br>
      <span style="font-size: 11px; color: #555; font-weight: bold; display: block; margin-top: 2px;">Level ${level}</span>
      <span style="font-size: 11px; color: #008000; font-weight: bold; display: block; margin-top: 2px;">Reward: ${creatureInstance.reward} Rot</span>
      <button onclick="startEncounter('${safeName}', '${creatureInstance.rarity}', '${creatureInstance.reward}', '${imageUrl}', ${level}, ${maxHp})" style="
        margin-top: 8px;
        background: #ff0055;
        color: white;
        border: none;
        padding: 6px 14px;
        font-weight: bold;
        border-radius: 6px;
        cursor: pointer;
        font-family: monospace;
        box-shadow: 0 0 8px rgba(255,0,85,0.5);
      ">⚔️ FIGHT</button>
    </div>
  `);
  
  const spawnedEntry = {
    marker: marker,
    data: creatureInstance,
    lat: spawnLat,
    lng: spawnLng
  };

  spawnedCreatures.push(spawnedEntry);
}

// 3. Spawn a batch of creatures
function spawnBatch(playerLat, playerLng, count = 8) {
  for (let i = 0; i < count; i++) {
    spawnSingleCreature(playerLat, playerLng);
  }
}

// 4. Remove creatures that are too far away (despawns as you walk past them beyond 150 meters)
function cleanUpFarCreatures(pLat, pLng, maxDistanceMeters = 150) {
  const currentLat = pLat !== undefined ? pLat : (typeof playerLat !== 'undefined' ? playerLat : null);
  const currentLng = pLng !== undefined ? pLng : (typeof playerLng !== 'undefined' ? playerLng : null);

  spawnedCreatures = spawnedCreatures.filter(creature => {
    if (typeof map !== 'undefined' && map && typeof map.distance === 'function' && currentLat !== null && currentLng !== null) {
      const distance = map.distance([currentLat, currentLng], [creature.lat, creature.lng]);
      
      if (distance > maxDistanceMeters) {
        if (creature.marker && typeof creature.marker.remove === 'function') {
          creature.marker.remove();
        } else if (creature.marker && typeof map.removeLayer === 'function') {
          map.removeLayer(creature.marker);
        }
        return false;
      }
    }
    return true;
  });
  window.activeCreatures = spawnedCreatures;
}

// 5. Dynamic Spawner Loop tracking movement
function initSpawner() {
  setInterval(() => {
    let currentPos = null;

    if (typeof playerMarker !== 'undefined' && playerMarker && typeof playerMarker.getLatLng === 'function') {
      currentPos = playerMarker.getLatLng();
    } else if (typeof playerLat !== 'undefined' && typeof playerLng !== 'undefined') {
      currentPos = { lat: playerLat, lng: playerLng };
    } else if (window.currentLat && window.currentLng) {
      currentPos = { lat: window.currentLat, lng: window.currentLng };
    }

    if (!currentPos) return;

    // Clean up far creatures (despawn when walking past them)
    cleanUpFarCreatures(currentPos.lat, currentPos.lng);

    // If player moves, spawn new local rots around their current position
    if (lastSpawnLat === null || lastSpawnLng === null || 
        Math.abs(currentPos.lat - lastSpawnLat) > 0.0003 || 
        Math.abs(currentPos.lng - lastSpawnLng) > 0.0003) {
        
      spawnBatch(currentPos.lat, currentPos.lng, 8);
      window.activeCreatures = spawnedCreatures;
      lastSpawnLat = currentPos.lat;
      lastSpawnLng = currentPos.lng;
    }
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initSpawner, 2000);
});