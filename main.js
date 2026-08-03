// 🚨 STRICT LOCATION SYSTEM 🚨
let map;

function startStrictLocation() {
    // 1. Check if the player's phone has GPS at all
    if (!navigator.geolocation) {
        document.getElementById('locationErrorModal').style.display = 'flex';
        return;
    }

    // 2. Ask the player for their EXACT location
    navigator.geolocation.watchPosition(
        function(position) {
            // SUCCESS! They clicked "Allow"
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            
            // Hide the error box so they can play
            document.getElementById('locationErrorModal').style.display = 'none';

            // Update the HUD so they see their coordinates
            if(document.getElementById('latVal')) document.getElementById('latVal').innerText = lat.toFixed(5);
            if(document.getElementById('lngVal')) document.getElementById('lngVal').innerText = lng.toFixed(5);

            // If the map hasn't been built yet, build it right where THEY are standing!
            if (!map) {
                // Notice there are no hardcoded numbers here anymore! It uses their 'lat' and 'lng'
                map = L.map('map', { 
                    zoomControl: false, 
                    keyboard: false 
                }).setView([lat, lng], 19);
                
                // Standard OpenStreetMap - bold roads and clear streets
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                // Now that we have THEIR location, start the player 
                if (typeof initPlayer === 'function') {
                    initPlayer();
                }

                // Drop the initial batch of brainrots around THEIR location, not your house!
                if (typeof spawnBatch === 'function') {
                    spawnBatch(lat, lng, 15); 
                }
            }
        },
        function(error) {
            // FAIL! They clicked "Don't Allow" or the GPS is broken
            // SHOW THE BIG RED STOP SCREEN! 🛑
            document.getElementById('locationErrorModal').style.display = 'flex';
        },
        {
            enableHighAccuracy: true, // Exact satellite GPS, no guessing!
            timeout: 10000,           // Wait 10 seconds to find them
            maximumAge: 0             // Never use old saved locations
        }
    );
}

// Single unified DOM load handler for map, player, and spawns
window.addEventListener('DOMContentLoaded', () => {
    // DO NOT start the map blindly anymore. Start the strict location checker!
    startStrictLocation();

    // Automatically update the Rot-Dex total count based on total characters loaded
    const rotDexElement = document.querySelector('.rot-dex') || document.getElementById('rot-dex');
    if (rotDexElement && typeof brainrotCharacters !== 'undefined') {
        rotDexElement.innerText = `ROT-DEX (0/${brainrotCharacters.length})`;
    }
});