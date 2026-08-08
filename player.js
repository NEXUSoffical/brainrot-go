// 🌍 REAL-WORLD GPS & KEYBOARD MOVEMENT ENGINE
let playerLat;
let playerLng;
let playerMarker = null;
let isWalking = false;
let moveInterval = null;
let activeKeys = {};

// Mode Toggle State
let isRealWorldMode = false;
let realWorldWatchId = null;

window.toggleMovementMode = function() {
    isRealWorldMode = !isRealWorldMode;
    const btn = document.getElementById('movementModeBtn');

    if (isRealWorldMode) {
        if (btn) btn.innerText = "🗺️ MODE: REAL GPS";
        alert("📍 Switched to Real-World GPS Mode! Your character will now follow your physical steps.");
        
        // Stop D-pad loop if running
        isWalking = false;
        clearInterval(moveInterval);
        moveInterval = null;
        activeKeys = {};

        startRealWorldGPS();
    } else {
        if (btn) btn.innerText = "🕹️ MODE: D-PAD";
        alert("🕹️ Switched to D-Pad Mode! You can now use your keyboard or on-screen arrows to walk around.");

        if (realWorldWatchId !== null) {
            navigator.geolocation.clearWatch(realWorldWatchId);
            realWorldWatchId = null;
        }
    }
};

function startRealWorldGPS() {
    if (!navigator.geolocation) {
        alert("❌ Geolocation is not supported by your browser");
        isRealWorldMode = false;
        return;
    }

    if (realWorldWatchId !== null) {
        navigator.geolocation.clearWatch(realWorldWatchId);
    }

    realWorldWatchId = navigator.geolocation.watchPosition(
        (position) => {
            if (!isRealWorldMode) return;

            let lat = parseFloat(position.coords.latitude);
            let lng = parseFloat(position.coords.longitude);

            if (isNaN(lat) || isNaN(lng)) return;

            playerLat = lat;
            playerLng = lng;

            if (playerMarker && typeof playerMarker.setLatLng === 'function') {
                playerMarker.setLatLng([playerLat, playerLng]);
            }

            if (typeof map !== 'undefined' && map && typeof map.panTo === 'function') {
                map.panTo([playerLat, playerLng], { animate: true });
            }

            const latVal = document.getElementById('latVal');
            const lngVal = document.getElementById('lngVal');
            if (latVal) latVal.innerText = playerLat.toFixed(5);
            if (lngVal) lngVal.innerText = playerLng.toFixed(5);

            if (typeof cleanUpFarCreatures === 'function') {
                cleanUpFarCreatures();
            }
        },
        (error) => {
            console.error("GPS tracking error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function initPlayer() {
    // If the map isn't built yet, wait patiently!
    if (typeof map === 'undefined' || !map) return; 
    
    // Stop clones from spawning
    if (playerMarker !== null) return; 

    // 🚨 THE MAGIC TRICK: Steal the exact GPS location from the map! 🚨
    let mapCenter = map.getCenter();
    playerLat = mapCenter.lat;
    playerLng = mapCenter.lng;

    // Custom animated player SVG marker
    const playerSvgHtml = `
        <div id="playerAvatar" class="player-container facing-down">
            <svg class="character-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <!-- Back Hair (Visible when facing up) -->
                <g class="back-hair" style="display:none;">
                    <circle cx="32" cy="24" r="14" fill="#00ff00"/>
                </g>
                <!-- Body / Torso -->
                <g class="body-group">
                    <!-- Left Leg -->
                    <rect class="left-leg" x="20" y="40" width="8" height="16" rx="4" fill="#111"/>
                    <!-- Right Leg -->
                    <rect class="right-leg" x="36" y="40" width="8" height="16" rx="4" fill="#111"/>
                    <!-- Torso -->
                    <rect x="18" y="22" width="28" height="22" rx="6" fill="#ff007f"/>
                    <!-- Head -->
                    <circle cx="32" cy="16" r="12" fill="#ffccaa"/>
                    <!-- Cap / Hat -->
                    <path d="M 18 14 Q 32 6 46 14 Z" fill="#00ff00"/>
                    <rect x="28" y="10" width="16" height="4" rx="2" fill="#00ff00"/>
                    <!-- Face Features -->
                    <g class="face-features">
                        <circle cx="28" cy="16" r="2" fill="#000"/>
                        <circle cx="36" cy="16" r="2" fill="#000"/>
                        <path d="M 30 21 Q 32 24 34 21" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    </g>
                </g>
            </svg>
        </div>
    `;

    const playerIcon = L.divIcon({
        html: playerSvgHtml,
        className: 'player-div-icon',
        iconSize: [65, 85],
        iconAnchor: [32, 70]
    });

    // Drop the player marker exactly where they are standing in real life!
    playerMarker = L.marker([playerLat, playerLng], { icon: playerIcon }).addTo(map);
}

// Keyboard movement listeners with bulletproof string safety
window.addEventListener('keydown', (e) => {
    if (isRealWorldMode) return; // 🛑 Block keyboard movement while in real GPS mode!
    if (!e) return;
    const loginModal = document.getElementById('loginModal');
    if (loginModal && loginModal.style.display !== 'none') return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        activeKeys[key] = true;
        if (!isWalking) {
            isWalking = true;
            startMovementLoop();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (isRealWorldMode) return;
    if (!e) return;
    const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    activeKeys[key] = false;
    
    if (!activeKeys['w'] && !activeKeys['a'] && !activeKeys['s'] && !activeKeys['d'] &&
        !activeKeys['arrowup'] && !activeKeys['arrowdown'] && !activeKeys['arrowleft'] && !activeKeys['arrowright']) {
        isWalking = false;
        clearInterval(moveInterval);
        moveInterval = null;
        const avatar = document.getElementById('playerAvatar');
        if (avatar) avatar.classList.remove('walking');
    }
});

function startMovementLoop() {
    if (moveInterval || isRealWorldMode) return;

    const moveSpeed = 0.000005; 
    const avatar = document.getElementById('playerAvatar');

    moveInterval = setInterval(() => {
        if (isRealWorldMode) {
            clearInterval(moveInterval);
            moveInterval = null;
            return;
        }

        let dLat = 0;
        let dLng = 0;
        let facingClass = 'facing-down';

        if (activeKeys['w'] || activeKeys['arrowup']) {
            dLat += moveSpeed;
            facingClass = 'facing-up';
        }
        if (activeKeys['s'] || activeKeys['arrowdown']) {
            dLat -= moveSpeed;
            facingClass = 'facing-down';
        }
        if (activeKeys['a'] || activeKeys['arrowleft']) {
            dLng -= moveSpeed;
            facingClass = 'facing-left';
        }
        if (activeKeys['d'] || activeKeys['arrowright']) {
            dLng += moveSpeed;
            facingClass = 'facing-right';
        }

        if (dLat !== 0 || dLng !== 0) {
            // Normalize diagonal movement so it doesn't speed up diagonally
            if (dLat !== 0 && dLng !== 0) {
                dLat *= 0.7071;
                dLng *= 0.7071;
            }

            // Compensate for longitude scaling so left/right matches up/down speed
            const lngCorrection = 1 / Math.max(0.1, Math.cos(playerLat * (Math.PI / 180)));
            
            playerLat += dLat;
            playerLng += dLng * lngCorrection;

            // Safe checks to prevent null reference errors
            if (playerMarker && typeof playerMarker.setLatLng === 'function') {
                playerMarker.setLatLng([playerLat, playerLng]);
            }
            if (typeof map !== 'undefined' && map && typeof map.panTo === 'function') {
                map.panTo([playerLat, playerLng], { animate: false });
            }

            if (avatar) {
                avatar.className = `player-container walking ${facingClass}`;
            }

            // Update HUD coordinates safely
            const latVal = document.getElementById('latVal');
            const lngVal = document.getElementById('lngVal');
            if (latVal) latVal.innerText = playerLat.toFixed(5);
            if (lngVal) lngVal.innerText = playerLng.toFixed(5);

            if (typeof cleanUpFarCreatures === 'function') {
                cleanUpFarCreatures();
            }
        }
    }, 50);
}