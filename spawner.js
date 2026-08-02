// Array to keep track of creatures currently spawned on the map
let spawnedCreatures = [];

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
window.startEncounter = function(name, rarity, reward, imageUrl) {
  const modal = document.getElementById('battleModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  
  const wildNameEl = document.getElementById('wildName');
  if (wildNameEl) wildNameEl.innerText = name;

  const wildRarityEl = document.getElementById('wildRarity');
  if (wildRarityEl) wildRarityEl.innerText = `RARITY: ${rarity.toUpperCase()}`;

  const wildBadgeName = document.getElementById('wildBadgeName');
  if (wildBadgeName) wildBadgeName.innerText = name;

  // If battle.js has its own initialization function, call it safely
  if (typeof window.initBattle === 'function') {
    window.initBattle({ name, rarity, reward, image: imageUrl });
  }
};

// 2. Spawn Rarity-Colored Cards with Working Fight Button
function spawnSingleCreature(lat, lng) {
  const currentLat = lat || (typeof playerLat !== 'undefined' ? playerLat : 53.45565);
  const currentLng = lng || (typeof playerLng !== 'undefined' ? playerLng : -2.97733);

  const creatureData = getRandomBrainrot();
  
  const offsetLat = (Math.random() - 0.5) * 0.003;
  const offsetLng = (Math.random() - 0.5) * 0.003;
  
  const spawnLat = currentLat + offsetLat;
  const spawnLng = currentLng + offsetLng;

  const imageUrl = creatureData.image;
  const rarityColor = getRarityColor(creatureData.rarity);
  const safeName = creatureData.name.replace(/'/g, "\\'");

  if (typeof L !== 'undefined' && typeof map !== 'undefined') {
    
    const cardHtml = `
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
    `;

    const customIcon = L.divIcon({
      className: '', 
      html: cardHtml,
      iconSize: [80, 80], 
      iconAnchor: [40, 40],
      popupAnchor: [0, -35]
    });

    const marker = L.marker([spawnLat, spawnLng], { icon: customIcon }).addTo(map);
    
    marker.bindPopup(`
      <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
        <b style="font-size: 16px; color: #222;">${creatureData.name}</b><br>
        <span style="font-size: 12px; color: #008000; font-weight: bold; display: block; margin-top: 4px;">Reward: ${creatureData.reward} Rot</span>
        <button onclick="startEncounter('${safeName}', '${creatureData.rarity}', '${creatureData.reward}', '${imageUrl}')" style="
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
      data: creatureData,
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