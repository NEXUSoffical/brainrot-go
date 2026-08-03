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
            // FAIL! But let's check WHY it failed...
            if (error.code === 1) {
                // Error Code 1 means PERMISSION DENIED. 
                // ONLY show the red screen if they actually told the bodyguard to block it! 🛑
                document.getElementById('locationErrorModal').style.display = 'flex';
            } else {
                // Error Code 2 or 3 means the GPS is just being slow or lost signal.
                // Do NOT show the red screen. Just log it and wait patiently! ⏳
                console.log("GPS is taking a bit long to connect, still searching...");
            }
        },
        {
            enableHighAccuracy: true, // Exact satellite GPS, no guessing!
            timeout: 30000,           // Wait 30 whole seconds to find them instead of panicking at 10!
            maximumAge: 10000         // It's okay if the location is 10 seconds old
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