// 🌍 REAL-WORLD GPS & KEYBOARD MOVEMENT ENGINE
// Look! No more super-glued house numbers! We leave these empty now.
let playerLat;
let playerLng;
let playerMarker = null;
let isWalking = false;
let moveInterval = null;
let activeKeys = {};

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
    if (moveInterval) return;

    const moveSpeed = 0.000005; 
    const avatar = document.getElementById('playerAvatar');

    moveInterval = setInterval(() => {
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
            playerLat += dLat;
            playerLng += dLng;

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