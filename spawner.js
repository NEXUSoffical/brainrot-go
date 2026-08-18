// spawner.js - Dynamic GPS-Based Brainrot Spawner & Spawns

let spawnedCreatures = [];
let lastSpawnLat = null;
let lastSpawnLng = null;

// Expose activeCreatures globally so battle.js can filter them out on capture
window.activeCreatures = spawnedCreatures;
window.currentBattleEntry = null;

// Inject CSS Keyframe Animations for Hovering, Shimmer, Stars, and RAIN!
function injectShinyStyles() {
  if (document.getElementById('shinyDiamondStyles')) return;
  const style = document.createElement('style');
  style.id = 'shinyDiamondStyles';
  style.innerHTML = `
    @keyframes battleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .battle-float {
      animation: battleFloat 2.5s ease-in-out infinite;
    }

    @keyframes diamondPulse {
      0%, 100% {
        box-shadow: 0 0 15px #ffffff, 0 0 30px #ffd700, inset 0 0 10px #ffffff;
        border-color: #ffffff;
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 35px #ffffff, 0 0 55px #00ffff, inset 0 0 22px #ffd700;
        border-color: #00ffff;
        transform: scale(1.08);
      }
    }

    @keyframes diamondShimmerBeam {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes makeItRain {
      0% { transform: translateY(0px); opacity: 0; }
      10% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(35px); opacity: 0; }
    }
    
    .rain-drop {
      position: absolute;
      width: 2px;
      height: 8px;
      background: #00ccff;
      border-radius: 2px;
      box-shadow: 0 0 4px #00ccff;
      animation: makeItRain 0.8s linear infinite;
    }
    
    .rain-drop:nth-child(1) { left: 10px; animation-delay: 0.0s; }
    .rain-drop:nth-child(2) { left: 20px; animation-delay: 0.3s; }
    .rain-drop:nth-child(3) { left: 30px; animation-delay: 0.1s; }
    .rain-drop:nth-child(4) { left: 40px; animation-delay: 0.5s; }
    .rain-drop:nth-child(5) { left: 25px; animation-delay: 0.2s; }
  `;
  document.head.appendChild(style);
}

injectShinyStyles();

function shouldFloat(charName) {
  if (!charName) return false;
  const lower = charName.toLowerCase().replace(/[\s-]/g, '');
  return lower.includes('cloud') || lower.includes('hashtag') || lower.includes('glitch') || lower.includes('spirit') || lower.includes('phantom') || lower.includes('fomo') || lower.includes('blimpy') || lower.includes('pufflet') || lower.includes('gigabyte');
}

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

function getRandomBrainrot() {
  if (typeof brainrotCharacters === 'undefined' || !Array.isArray(brainrotCharacters)) {
    console.warn("⚠️ brainrotCharacters is missing or not an array!");
    return { name: "Chad Cloud", rarity: "common", reward: 3, image: "brainrots/chad_cloud.png" };
  }

  const validCharacters = brainrotCharacters.filter(char => {
    if (!char || !char.image || char.image.trim() === "") return false;
    
    const name = char.name.toLowerCase().trim();
    const excludedForms = [
      "hashtag hell",
      "god cloud",
      "fomo doom",
      "blimpy",
      "wafflewrecker",
      "titan mech",
      "glitchnyan",
      "voidprowler",
      "celestial purr",
      "blazemew",
      "verdantstalker"
    ];
    
    return !excludedForms.includes(name);
  });
  
  if (validCharacters.length === 0) {
    return { name: "Chad Cloud", rarity: "common", reward: 3, image: "brainrots/chad_cloud.png" };
  }

  const weightedPool = [];
  validCharacters.forEach(char => {
    const rarity = (char.rarity || 'common').toLowerCase();
    let weight = 1;

    if (rarity === 'common') {
      weight = 10; 
    } else if (rarity === 'rare') {
      weight = 4;  
    } else if (rarity === 'secret' || rarity === 'og') {
      weight = 1;  
    }

    for (let i = 0; i < weight; i++) {
      weightedPool.push(char);
    }
  });

  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
}

function getRarityColor(rarity) {
  switch ((rarity || '').toLowerCase()) {
    case 'og': return '#ffd700';        
    case 'secret': return '#ff00ea';    
    case 'mythic': return '#9900ff';    
    case 'legendary': return '#ffaa00'; 
    case 'epic': return '#0088ff';      
    case 'rare': return '#00cc44';      
    case 'uncommon': return '#cccc00';  
    default: return '#888888';          
  }
}

function playUltraRareSpawnSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + (index * 0.1));
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime + (index * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (index * 0.1) + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + (index * 0.1));
      osc.stop(ctx.currentTime + (index * 0.1) + 0.4);
    });
  } catch (e) {}
}

window.startEncounter = function(name, rarity, reward, imageUrl, level, maxHp, isShiny) {
  const maxSlots = 100;
  const currentSlots = (window.playerData && window.playerData.inventory) ? window.playerData.inventory.length : 0;
  if (currentSlots >= maxSlots) {
    if (typeof showGameToast === 'function') {
      showGameToast("🚨 Inventory is full (100 / 100)! Transfer some rots first.");
    } else {
      alert("🚨 Inventory is full (100 / 100)! Transfer some rots first.");
    }
    return;
  }

  const matchedEntry = spawnedCreatures.find(c => c.data.name === name && c.data.level === Number(level) && (c.data.shiny ? '1' : '0') === String(isShiny) && !c.captured);
  
  if (matchedEntry) {
    const pLat = typeof playerLat !== 'undefined' ? playerLat : null;
    const pLng = typeof playerLng !== 'undefined' ? playerLng : null;

    if (pLat !== null && pLng !== null && typeof map !== 'undefined' && map && typeof map.distance === 'function') {
      const distanceMeters = map.distance([pLat, pLng], [matchedEntry.lat, matchedEntry.lng]);
      if (distanceMeters > 35) {
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
  if (wildNameEl) wildNameEl.innerText = `${isShiny === 'true' || isShiny === true ? '💎 DIAMOND SHINY ' : ''}${name} (Lvl ${level})`;

  const wildRarityEl = document.getElementById('wildRarity');
  if (wildRarityEl) wildRarityEl.innerText = `RARITY: ${rarity.toUpperCase()}${isShiny === 'true' || isShiny === true ? ' [💎 DIAMOND SHINY]' : ''}`;

  const wildBadgeName = document.getElementById('wildBadgeName');
  if (wildBadgeName) wildBadgeName.innerText = `${name} (Lvl ${level})`;

  const matchedCreature = matchedEntry ? matchedEntry.data : {
    name, 
    rarity, 
    reward: Number(reward), 
    image: imageUrl,
    level: Number(level),
    maxHp: Number(maxHp),
    hp: Number(maxHp),
    shiny: isShiny === 'true' || isShiny === true
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
  
  // 💎 1.5% Ultra-Rare Diamond Shiny Chance
  const isShiny = Math.random() < 0.015;
  const baseReward = Number(characterTemplate.reward) || 3;

  // ✨ GENERATE WITH PERCENTAGE IV RATING & STAT SCALING ✨
  const creatureInstance = typeof createNewRot === 'function' 
    ? createNewRot(characterTemplate, level) 
    : {
        ...characterTemplate,
        level: level,
        maxHp: 50,
        hp: 50,
        atk: 15,
        def: 10,
        quality: 50
      };

  // Apply shiny flag and bonus stats if shiny
  creatureInstance.shiny = isShiny;
  creatureInstance.reward = baseReward;
  if (isShiny) {
    creatureInstance.maxHp = Math.floor(creatureInstance.maxHp * 1.3);
    creatureInstance.hp = creatureInstance.maxHp;
    creatureInstance.atk = Math.floor(creatureInstance.atk * 1.3);
    creatureInstance.def = Math.floor(creatureInstance.def * 1.3);
  }
  
  playUltraRareSpawnSound();

  const offsetLat = (Math.random() - 0.5) * 0.0003;
  const offsetLng = (Math.random() - 0.5) * 0.0003;
  
  const spawnLat = currentLat + offsetLat;
  const spawnLng = currentLng + offsetLng;

  const imageUrl = creatureInstance.image;
  const rarityColor = getRarityColor(creatureInstance.rarity);
  const safeName = creatureInstance.name.replace(/'/g, "\\'");

  const isFloating = shouldFloat(creatureInstance.name);

  let characterEffect = '';
  if (creatureInstance.name.toLowerCase().includes("cloud")) {
    characterEffect = `
      <div style="position: absolute; top: 35px; left: 0; width: 50px; height: 40px; pointer-events: none; z-index: 5;">
        <div class="rain-drop"></div>
        <div class="rain-drop"></div>
        <div class="rain-drop"></div>
        <div class="rain-drop"></div>
        <div class="rain-drop"></div>
      </div>
    `;
  }
    
  const cardHtml = `
    <div class="${isFloating ? 'battle-float' : ''}" style="transform: scale(1.3); transform-origin: bottom center; position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
      <div style="background: transparent; border: none; padding: 0; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 55px; height: 80px; background: transparent; display: flex; align-items: center; justify-content: center; overflow: visible; position: relative; ${isShiny ? 'animation: diamondPulse 1.5s infinite;' : ''}">
            <img src="${imageUrl}" style="max-width: 55px; max-height: 80px; width: 100%; height: auto; object-fit: contain; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.9)) ${isShiny ? 'drop-shadow(0 0 8px #00ffff)' : ''}; z-index: 10;" onerror="this.style.display='none';">
            ${characterEffect}
        </div>
      </div>
      <div style="
        background: rgba(0,0,0,0.85); 
        border: 1px solid ${isShiny ? '#00ffff' : rarityColor}; 
        color: ${isShiny ? '#00ffff' : rarityColor}; 
        font-size: 7px; 
        font-family: monospace; 
        padding: 1px 4px; 
        border-radius: 3px; 
        white-space: nowrap; 
        font-weight: bold;
        box-shadow: 0 0 ${isShiny ? '8px #00ffff' : '4px rgba(0,0,0,0.8)'};
        margin-top: 1px;
      ">
        ${isShiny ? '💎 ' : ''}${creatureInstance.name} (Lvl ${level})
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    className: '', 
    html: cardHtml,
    iconSize: [55, 95], 
    iconAnchor: [27, 95],
    popupAnchor: [0, -100]
  });

  const marker = L.marker([spawnLat, spawnLng], { icon: customIcon }).addTo(map);

  marker.bindPopup(`
    <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
      <b style="font-size: 15px; color: #222;">${isShiny ? '💎 DIAMOND SHINY ' : ''}${creatureInstance.name}</b><br>
      <span style="font-size: 11px; color: ${isShiny ? '#00ffff' : rarityColor}; font-weight: bold; display: block; margin-top: 2px;">${isShiny ? '💎 DIAMOND SHINY' : creatureInstance.rarity.toUpperCase()}</span>
      <span style="font-size: 11px; color: #555; font-weight: bold; display: block; margin-top: 2px;">Level ${level}</span>
      <span style="font-size: 11px; color: #008000; font-weight: bold; display: block; margin-top: 2px;">Reward: ${creatureInstance.reward} Rot</span>
      <button onclick="startEncounter('${safeName}', '${creatureInstance.rarity}', '${creatureInstance.reward}', '${imageUrl}', ${level}, ${creatureInstance.maxHp}, ${isShiny})" style="
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

function spawnBatch(playerLat, playerLng, count = 1) {
  const maxActive = 3;
  if (spawnedCreatures.length >= maxActive) return;
  
  const slotsAvailable = maxActive - spawnedCreatures.length;
  const toSpawn = Math.min(count, slotsAvailable);

  for (let i = 0; i < toSpawn; i++) {
    spawnSingleCreature(playerLat, playerLng);
  }
}

function cleanUpFarCreatures(pLat, pLng, maxDistanceMeters = 45) {
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

    if (spawnedCreatures.length < 3) {
      spawnBatch(currentPos.lat, currentPos.lng, 1);
      window.activeCreatures = spawnedCreatures;
    }
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initSpawner, 2000);
});