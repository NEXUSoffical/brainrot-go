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
            let lat = parseFloat(position.coords.latitude);
            let lng = parseFloat(position.coords.longitude);

            // 🔥 THE ANTI-BLACK-SCREEN FIX 🔥
            // If the browser GPS glitches and sends "NaN", force valid numbers so the map doesn't crash!
            if (isNaN(lat) || isNaN(lng)) {
                console.warn("GPS sent NaN! Falling back to safe coordinates.");
                lat = 53.4808; // Safe default Latitude
                lng = -2.2426; // Safe default Longitude
            }
            
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

                // 🛠️ THE FIX: Force Leaflet to recalculate screen size after 1 second
                setTimeout(() => {
                    map.invalidateSize();
                }, 1000);

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

// ==========================================
// RPG STAT ENGINE & FULL-SCREEN CARD UI
// ==========================================

// Calculate a rot's true stats based on Level, Rarity, and Base Stats
window.calculateRotStats = function(rot) {
    const level = rot.level || 1;
    
    // Growth multiplier: OGs gain stats WAY faster than Commons
    const rarityGrowth = {
        'common': 1.0,
        'uncommon': 1.5,
        'rare': 2.2,
        'epic': 3.5,
        'secret': 6.0,
        'og': 8.5
    };
    
    const mult = rarityGrowth[(rot.rarity || 'common').toLowerCase()] || 1.0;

    // 🔥 THE ULTIMATE FIX: ALWAYS pull base stats directly from the master database!
    let baseHp = 50;
    let baseAtk = 10;
    let baseDef = 10;

    if (typeof brainrotCharacters !== 'undefined') {
        // Find the exact character in your database
        const dbChar = brainrotCharacters.find(c => c.name.toLowerCase().trim() === rot.name.toLowerCase().trim());
        
        if (dbChar) {
            // Apply the true database stats!
            baseHp = dbChar.baseHp || 50;
            baseAtk = dbChar.baseAtk || 10;
            baseDef = dbChar.baseDef || 10;
        }
    } else {
        // Failsafe fallback
        baseHp = rot.baseHp || 50;
        baseAtk = rot.baseAtk || 10;
        baseDef = rot.baseDef || 10;
    }

    return {
        maxHp: Math.floor(baseHp + (level * 5 * mult)),
        atk: Math.floor(baseAtk + (level * 2 * mult)),
        def: Math.floor(baseDef + (level * 2 * mult))
    };
};

// Open the Full-Screen Card Details Modal
window.openCardDetails = function(inventoryIndex) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[inventoryIndex]) return;
    
    const rot = playerData.inventory[inventoryIndex];
    const stats = calculateRotStats(rot);
    const rarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(rot.rarity) : '#00ff55';

    let detailModal = document.getElementById('cardDetailModal');
    if (!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'cardDetailModal';
        document.body.appendChild(detailModal);
    }

    // Modal styling
    detailModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.95); z-index: 9999999; display: flex;
        flex-direction: column; align-items: center; justify-content: center;
        font-family: monospace; padding: 20px; color: #fff;
    `;

    // Calculate percentages for the stat bars (so they fill up based on max possible stats)
    // Adjust these max values if your late-game stats go higher!
    const hpPercent = Math.min(100, (stats.maxHp / 2000) * 100);
    const atkPercent = Math.min(100, (stats.atk / 800) * 100);
    const defPercent = Math.min(100, (stats.def / 800) * 100);

    // The UI Layout
    detailModal.innerHTML = `
        <div style="background: linear-gradient(180deg, #111, ${rarityColor}44); border: 4px solid ${rarityColor}; border-radius: 20px; padding: 20px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 0 50px ${rarityColor}88; position: relative;">
            
            <button onclick="document.getElementById('cardDetailModal').style.display='none'" style="position: absolute; top: -15px; right: -15px; background: #ff0055; color: white; border: 3px solid #fff; border-radius: 50%; width: 40px; height: 40px; font-weight: bold; font-size: 1.2rem; cursor: pointer; z-index: 10;">X</button>

            <h2 style="color: ${rarityColor}; margin: 0 0 5px 0; text-transform: uppercase; font-size: 1.4rem;">${rot.name}</h2>
            <div style="font-size: 0.9rem; margin-bottom: 15px; color: #aaa; font-weight: bold;">Lvl ${rot.level || 1} | ${(rot.rarity || 'common').toUpperCase()}</div>
            
            <div style="width: 100%; height: 220px; background: #fff; border-radius: 10px; overflow: hidden; border: 2px solid #444; margin-bottom: 20px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                <img src="${rot.image || ''}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(1.1) contrast(1.2);" onerror="this.style.display='none';">
            </div>

            <!-- Stats Section -->
            <div style="text-align: left; background: rgba(0,0,0,0.6); padding: 15px; border-radius: 10px; border: 1px solid #333;">
                
                <!-- HP Bar -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: bold;">
                        <span style="color: #00ff55;">❤️ HEALTH</span>
                        <span style="color: #fff;">${stats.maxHp}</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${hpPercent}%; height: 100%; background: #00ff55; box-shadow: 0 0 8px #00ff55;"></div>
                    </div>
                </div>

                <!-- Attack Bar -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: bold;">
                        <span style="color: #ff0055;">⚔️ ATTACK</span>
                        <span style="color: #fff;">${stats.atk}</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${atkPercent}%; height: 100%; background: #ff0055; box-shadow: 0 0 8px #ff0055;"></div>
                    </div>
                </div>

                <!-- Defense Bar -->
                <div style="margin-bottom: 5px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: bold;">
                        <span style="color: #00ccff;">🛡️ DEFENSE</span>
                        <span style="color: #fff;">${stats.def}</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${defPercent}%; height: 100%; background: #00ccff; box-shadow: 0 0 8px #00ccff;"></div>
                    </div>
                </div>

            </div>
        </div>
    `;
    detailModal.style.display = 'flex';
};