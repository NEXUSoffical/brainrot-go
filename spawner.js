// spawner.js - Spawns wild brainrots with strict, rare-heavy level distribution

let spawnedCreatures = [];

// Stricter level generator:
// - Level 1-10: 88% (Standard common spawns)
// - Level 11-20: 10% (Uncommon)
// - Level 21-50: 1.8% (Very rare)
// - Level 51-100: 0.2% (Extremely rare / "Go tell your friends")
function getRandomLevel() {
  const roll = Math.random();
  if (roll < 0.88) {
    return Math.floor(Math.random() * 10) + 1;       // Levels 1 - 10 (88%)
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

  // Initialize battle with exact level and stat scaling
  if (typeof window.initBattle === 'function') {
    window.initBattle({ 
      name, 
      rarity, 
      reward, 
      image: imageUrl,
      level: Number(level),
      maxHp: Number(maxHp),
      hp: Number(maxHp)
    });
  }
};

// 2. Spawn Rarity-Colored Cards with Level Badges & Working Fight Button
function spawnSingleCreature(lat, lng) {
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
  
  const offsetLat = (Math.random() - 0.5) * 0.003;
  const offsetLng = (Math.random() - 0.5) * 0.003;
  
  const spawnLat = currentLat + offsetLat;
  const spawnLng = currentLng + offsetLng;

  const imageUrl = creatureInstance.image;
  const rarityColor = getRarityColor(creatureInstance.rarity);
  const safeName = creatureInstance.name.replace(/'/g, "\\'");

  if (typeof L !== 'undefined' && typeof map !== 'undefined') {
    
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
    
    spawnedCreatures.push({
      marker: marker,
      data: creatureInstance,
      lat: spawnLat,
      lng: spawnLng
    });
  }
}

// 3. Spawn a batch of creatures
function spawnBatch(playerLat, playerLng, count = 10) {
  for (let i = 0; i < count; i++) {
    spawnSingleCreature(playerLat, playerLng);
  }
}

// 4. Remove creatures that are too far away
function cleanUpFarCreatures(playerLat, playerLng, maxDistanceMeters = 800) {
  spawnedCreatures = spawnedCreatures.filter(creature => {
    if (typeof map !== 'undefined' && playerLat && playerLng) {
      const distance = map.distance([playerLat, playerLng], [creature.lat, creature.lng]);
      
      if (distance > maxDistanceMeters) {
        map.removeLayer(creature.marker);
        return false;
      }
    }
    return true;
  });
}