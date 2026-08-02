// 🌍 MAIN APP INITIALIZER (CLEAR VISIBLE STREETS & FIXED WALKING)
let map;

function initMap() {
    if (map) return;
    
    // We added keyboard: false here so the map ignores the arrow keys
    map = L.map('map', { 
        zoomControl: false, 
        keyboard: false 
    }).setView([53.45544, -2.97630], 19);

    // Standard OpenStreetMap - bold roads and clear streets
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (typeof initPlayer === 'function') {
        initPlayer();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initMap();
});
// Run this automatically as soon as the game loads
window.addEventListener('DOMContentLoaded', () => {
  
  // 1. Automatically update the Rot-Dex total count to show your 100+ characters
  const rotDexElement = document.querySelector('.rot-dex') || document.getElementById('rot-dex');
  if (rotDexElement) {
    rotDexElement.innerText = `ROT-DEX (0/${brainrotCharacters.length})`;
  }

  // 2. Automatically drop an initial batch of brainrots around your starting coordinates
  if (typeof spawnBatch === 'function') {
    spawnBatch(53.45565, -2.97733, 15); // Spawns 15 brainrots immediately on load
  }
  
});