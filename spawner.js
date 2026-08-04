// spawner.js - Dynamic GPS-Based Brainrot Spawner & Spawns

let spawnedCreatures = [];
let lastSpawnLat = null;
let lastSpawnLng = null;

// Expose activeCreatures globally so battle.js can filter them out on capture
window.activeCreatures = spawnedCreatures;
window.currentBattleEntry = null;

function getRandomLevel() {
  const roll = Math.random();
  if (roll < 0.60) {
    return 1;                                        
  } else if (roll < 0.88) {
    return Math.floor(Math.random() * 9) + 2;        
  } else if (roll < 0.98) {
    return Math.floor(Math.random() * 10) + 11;      
  } else if (roll < 0.998) {
    return Math.floor(Math.random() * 30) + 21;      
  } else {
    return Math.floor(Math.random() * 50) + 51;      
  }
}

// 1. Get a random brainrot character safely with true "stupid lucky" grind rates for OG and Secret
function getRandomBrainrot() {
  if (typeof brainrotCharacters === 'undefined' || !Array.isArray(brainrotCharacters)) {
    return { name: "Noobini Pizzanini", rarity: "common", reward: 1, image: "brainrots/noobini_pizzanini.png" };
  }

  // Only pick characters that actually have an image file assigned
  const validCharacters = brainrotCharacters.filter(char => char && char.image && char.image.trim() !== "");
  if (validCharacters.length === 0) {
    return { name: "Noobini Pizzanini", rarity: "common", reward: 1, image: "brainrots/noobini_pizzanini.png" };
  }

  // Group valid characters by rarity tier
  const byRarity = {
    og: validCharacters.filter(c => (c.rarity || '').toLowerCase() === 'og'),
    secret: validCharacters.filter(c => (c.rarity || '').toLowerCase() === 'secret'),
    epic: validCharacters.filter(c => (c.rarity || '').toLowerCase() === 'epic'),
    rare: validCharacters.filter(c => (c.rarity || '').toLowerCase() === 'rare'),
    common: validCharacters.filter(c => (c.rarity || '').toLowerCase() === 'common')
  };

  // Roll a precise random number between 0 and 10,000
  const roll = Math.random() * 10000;
  let chosenRarity = 'common';

  if (roll < 5 && byRarity.og.length > 0) {
    chosenRarity = 'og'; // 0.05% (Extremely rare / Stupid lucky)
  } else if (roll < 50 && byRarity.secret.length > 0) {
    chosenRarity = 'secret'; // 0.45% (Heavy grind)
  } else if (roll < 550 && byRarity.epic.length > 0) {
    chosenRarity = 'epic'; // 5%
  } else if (roll < 2500 && byRarity.rare.length > 0) {
    chosenRarity = 'rare'; // 19.5%
  } else {
    chosenRarity = 'common'; // 75%
  }

  // Fallback just in case a tier has no active images yet
  let pool = byRarity[chosenRarity];
  if (!pool || pool.length === 0) {
    pool = byRarity.common.length > 0 ? byRarity.common : validCharacters;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// Helper to get rarity color for the cards
function getRarityColor(rarity) {
  switch ((rarity || '').toLowerCase()) {
    case 'secret': return '#ff0055';    
    case 'mythic': return '#9900ff';    
    case 'legendary': return '#ffaa00'; 
    case 'epic': return '#0088ff';      
    case 'rare': return '#00cc44';      
    case 'uncommon': return '#cccc00';  
    default: return '#888888';          
  }
}

// Global function to trigger battle from the popup with strict proximity check
window.startEncounter = function(name, rarity, reward, imageUrl, level, maxHp) {
  // Find the exact active entry in our array
  const matchedEntry = spawnedCreatures.find(c => c.data.name === name && c.data.level === Number(level) && !c.captured);
  
  if (matchedEntry) {
    // Check distance from player to the creature (must be within 30 meters)
    const pLat = typeof playerLat !== 'undefined' ? playerLat : null;
    const pLng = typeof playerLng !== 'undefined' ? playerLng : null;

    if (pLat !== null && pLng !== null && typeof map !== 'undefined' && map && typeof map.distance === 'function') {
      const distanceMeters = map.distance([pLat, pLng], [matchedEntry.lat, matchedEntry.lng]);
      if (distanceMeters > 30) {
        alert("You are too far away! Get closer to battle this Brainrot.");
        return;
      }
    }
    window.currentBattleEntry = matchedEntry;
  } else {
    window.currentBattleEntry = null;
  }

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

  const matchedCreature = matchedEntry ? matchedEntry.data : {
    name, 
    rarity, 
    reward, 
    image: imageUrl,
    level: Number(level),
    maxHp: Number(maxHp),
    hp: Number(maxHp)
  };

  if (typeof window.initBattle === 'function') {
    window.initBattle(matchedCreature);
  }
};

window.removeCapturedCreature = function() {
  if (window.currentBattleEntry) {
    if (window.currentBattleEntry.marker && typeof window.currentBattleEntry.marker.remove === 'function') {
      window.currentBattleEntry.marker.remove();
    } else if (window.currentBattleEntry.marker && typeof map.removeLayer === 'function') {
      map.removeLayer(window.currentBattleEntry.marker);
    }
    
    spawnedCreatures = spawnedCreatures.filter(c => c !== window.currentBattleEntry);
    window.activeCreatures = spawnedCreatures;
    window.currentBattleEntry = null;
  }
};

function spawnSingleCreature(lat, lng) {
  if (typeof L === 'undefined' || typeof map === 'undefined' || !map || typeof map.addLayer !== 'function') {
    return;
  }

  let currentLat = lat;
  let currentLng = lng;

  if (currentLat === undefined || currentLng === undefined) {
      if (typeof playerLat !== 'undefined' && typeof playerLng !== 'undefined' && playerLat !== undefined) {
          currentLat = playerLat;
          currentLng = playerLng;
      } else {
          return; 
      }
  }

  const characterTemplate = getRandomBrainrot();
  const level = getRandomLevel();
  const maxHp = 50 + (level - 1) * 12;

  const creatureInstance = {
    ...characterTemplate,
    level: level,
    maxHp: maxHp,
    hp: maxHp
  };
  
  // Keep spawns close to the player (within ~30-40 meters max)
  const offsetLat = (Math.random() - 0.5) * 0.0003;
  const offsetLng = (Math.random() - 0.5) * 0.0003;
  
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

// Strict cap limit of max 3 active creatures on screen at a time
function spawnBatch(playerLat, playerLng, count = 1) {
  const maxActive = 3;
  if (spawnedCreatures.length >= maxActive) return;
  
  const slotsAvailable = maxActive - spawnedCreatures.length;
  const toSpawn = Math.min(count, slotsAvailable);

  for (let i = 0; i < toSpawn; i++) {
    spawnSingleCreature(playerLat, playerLng);
  }
}

// Strict proximity clean-up: remove creatures if player walks more than 25 meters away
function cleanUpFarCreatures(pLat, pLng, maxDistanceMeters = 25) {
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

function initSpawner() {
  setInterval(() => {
    let currentPos = null;

    if (typeof playerMarker !== 'undefined' && playerMarker && typeof playerMarker.getLatLng === 'function') {
      currentPos = playerMarker.getLatLng();
    } else if (typeof playerLat !== 'undefined' && typeof playerLng !== 'undefined' && playerLat !== undefined) {
      currentPos = { lat: playerLat, lng: playerLng };
    } else if (window.currentLat && window.currentLng) {
      currentPos = { lat: window.currentLat, lng: window.currentLng };
    }

    if (!currentPos) return;

    cleanUpFarCreatures(currentPos.lat, currentPos.lng);

    // Maintain a maximum of 3 spawns nearby
    if (spawnedCreatures.length < 3) {
      spawnBatch(currentPos.lat, currentPos.lng, 1);
      window.activeCreatures = spawnedCreatures;
    }
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initSpawner, 2000);
});