// 🌍 REAL-WORLD GPS & KEYBOARD MOVEMENT ENGINE
let playerLat;
let playerLng;
let playerMarker = null;
let isWalking = false;
let moveInterval = null;
let activeKeys = {};
let isRealWorldMode = false;
let realWorldWatchId = null;

// ==========================================
// 🚶 ANIMATION ENGINE (4-Frame Spritesheet)
// ==========================================
function injectPlayerStyles() {
    let style = document.getElementById('playerDynamicStyles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'playerDynamicStyles';
        document.head.appendChild(style);
    }
    
    style.innerHTML = `
        :root { --player-flip: 1; }
        .facing-left { --player-flip: -1; }
        .facing-right { --player-flip: 1; }

        .player-container {
            transform: scaleX(var(--player-flip));
            transform-origin: bottom center;
            transition: transform 0.1s ease-out;
        }

        @keyframes playSpriteSheet {
            100% { transform: translateX(-100%); }
        }

        .sprite-layer {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 400% !important; 
            max-width: none !important; 
            object-fit: fill; 
        }

        .player-container.walking .sprite-layer {
            animation: playSpriteSheet 0.6s steps(4) infinite;
        }
    `;
}
injectPlayerStyles();

// ==========================================
// 🛡️ LAYERED RENDERING
// ==========================================
window.getPlayerAvatarHtml = function() {
    const eqWpn = window.gameWeapons ? window.gameWeapons.find(w => w.id === window.playerData?.equipped?.weapon) : null;
    const eqChest = window.gameArmor ? window.gameArmor.find(a => a.id === window.playerData?.equipped?.chest) : null;

    const w = 60; 
    const h = 90;
    const errSprite = "https://placehold.co/240x90/222/fff.png?text=MISSING";

    return `
    <div style="position: relative; width: ${w}px; height: ${h}px; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.6)); overflow: hidden;">
        <!-- LAYER 1: BASE BODY -->
        <img class="sprite-layer" src="gear/base_body_sprite.png" onerror="this.src='${errSprite}'">
        <!-- LAYER 2: CHEST ARMOR -->
        ${eqChest ? `<img class="sprite-layer" src="${eqChest.image}" onerror="this.src='${errSprite}'">` : ''}
        <!-- LAYER 3: WEAPON -->
        ${eqWpn ? `<img class="sprite-layer" src="${eqWpn.image}" onerror="this.src='${errSprite}'">` : ''}
    </div>
    `;
};

window.toggleMovementMode = function() {
    isRealWorldMode = !isRealWorldMode;
    const btn = document.getElementById('movementModeBtn');
    if (isRealWorldMode) {
        if (btn) btn.innerText = "🗺️ MODE: REAL GPS";
        isWalking = false;
        clearInterval(moveInterval);
        moveInterval = null;
        activeKeys = {};
        startRealWorldGPS();
    } else {
        if (btn) btn.innerText = "🕹️ MODE: D-PAD";
        if (realWorldWatchId !== null) {
            navigator.geolocation.clearWatch(realWorldWatchId);
            realWorldWatchId = null;
        }
    }
};

function startRealWorldGPS() {
    if (!navigator.geolocation) return;
    if (realWorldWatchId !== null) navigator.geolocation.clearWatch(realWorldWatchId);
    realWorldWatchId = navigator.geolocation.watchPosition(
        (position) => {
            if (!isRealWorldMode) return;
            let lat = parseFloat(position.coords.latitude);
            let lng = parseFloat(position.coords.longitude);
            if (isNaN(lat) || isNaN(lng)) return;
            playerLat = lat;
            playerLng = lng;
            if (playerMarker && typeof playerMarker.setLatLng === 'function') playerMarker.setLatLng([playerLat, playerLng]);
            if (typeof map !== 'undefined' && map && typeof map.panTo === 'function') map.panTo([playerLat, playerLng], { animate: true });
        },
        (error) => console.error("GPS error:", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function initPlayer() {
    if (typeof map === 'undefined' || !map || typeof map.getCenter !== 'function') return; 
    if (playerMarker !== null) return; 
    let mapCenter = map.getCenter();
    playerLat = mapCenter.lat;
    playerLng = mapCenter.lng;
    const playerHtml = `<div id="playerAvatar" class="player-container facing-right">${window.getPlayerAvatarHtml()}</div>`;
    const playerIcon = L.divIcon({ html: playerHtml, className: 'player-div-icon', iconSize: [60, 90], iconAnchor: [30, 90] });
    playerMarker = L.marker([playerLat, playerLng], { icon: playerIcon }).addTo(map);
}

window.addEventListener('keydown', (e) => {
    if (isRealWorldMode || !e) return; 
    const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        activeKeys[key] = true;
        if (!isWalking) { isWalking = true; startMovementLoop(); }
    }
});

window.addEventListener('keyup', (e) => {
    if (isRealWorldMode || !e) return;
    const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    activeKeys[key] = false;
    if (!activeKeys['w'] && !activeKeys['a'] && !activeKeys['s'] && !activeKeys['d'] && !activeKeys['arrowup'] && !activeKeys['arrowdown'] && !activeKeys['arrowleft'] && !activeKeys['arrowright']) {
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
        if (isRealWorldMode) { clearInterval(moveInterval); moveInterval = null; return; }
        let dLat = 0; let dLng = 0;
        if (activeKeys['w'] || activeKeys['arrowup']) dLat += moveSpeed;
        if (activeKeys['s'] || activeKeys['arrowdown']) dLat -= moveSpeed;
        if (activeKeys['a'] || activeKeys['arrowleft']) { dLng -= moveSpeed; if (avatar) avatar.className = 'player-container walking facing-left'; }
        if (activeKeys['d'] || activeKeys['arrowright']) { dLng += moveSpeed; if (avatar) avatar.className = 'player-container walking facing-right'; }
        if ((dLat !== 0 && dLng === 0) && avatar && !avatar.className.includes('walking')) avatar.classList.add('walking');
        if (dLat !== 0 || dLng !== 0) {
            if (dLat !== 0 && dLng !== 0) { dLat *= 0.7071; dLng *= 0.7071; }
            const lngCorrection = 1 / Math.max(0.1, Math.cos(playerLat * (Math.PI / 180)));
            playerLat += dLat;
            playerLng += dLng * lngCorrection;
            if (playerMarker) playerMarker.setLatLng([playerLat, playerLng]);
            if (map) map.panTo([playerLat, playerLng], { animate: false });
        }
    }, 50);
}

// Auto-spawn the player ONLY AFTER the map has found your real location
function autoStartPlayer() {
    // 1. Check if map exists yet
    if (typeof map !== 'undefined' && map && typeof map.getCenter === 'function') {
        let center = map.getCenter();
        
        // 2. If the map is still sitting at the default 0,0 coordinates, wait!
        if (center.lat === 0 && center.lng === 0) {
            setTimeout(autoStartPlayer, 500);
            return;
        }

        // 3. The map has moved to your real location, safe to drop character
        initPlayer();
        
        // Force the camera to look exactly at the character
        if (playerLat && playerLng) {
            map.panTo([playerLat, playerLng]);
        }
    } else {
        // Map hasn't even loaded yet, keep waiting
        setTimeout(autoStartPlayer, 500);
    }
}

// Start the check immediately (bypasses browser loading delays)
autoStartPlayer();