// 🌍 MAIN APP INITIALIZER (CLEAR VISIBLE STREETS & FIXED WALKING)
let map;

function initMap() {
    if (map) return;
    
    // Disable default map keyboard handling so D-pad/WASD work smoothly
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

// Single unified DOM load handler for map, player, and spawns
window.addEventListener('DOMContentLoaded', () => {
    initMap();

    // Automatically update the Rot-Dex total count based on total characters loaded
    const rotDexElement = document.querySelector('.rot-dex') || document.getElementById('rot-dex');
    if (rotDexElement && typeof brainrotCharacters !== 'undefined') {
        rotDexElement.innerText = `ROT-DEX (0/${brainrotCharacters.length})`;
    }

    // Automatically drop an initial batch of brainrots around starting coordinates
    if (typeof spawnBatch === 'function') {
        spawnBatch(53.45565, -2.97733, 15);
    }
})