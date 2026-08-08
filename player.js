// 🌍 REAL-WORLD GPS & KEYBOARD MOVEMENT ENGINE WITH ANIMATED LEGS
let playerLat;
let playerLng;
let playerMarker = null;
let isWalking = false;
let moveInterval = null;
let activeKeys = {};

// Mode Toggle State
let isRealWorldMode = false;
let realWorldWatchId = null;

// Automatically inject required walking leg styles and keyframes
function injectPlayerStyles() {
    if (document.getElementById('playerDynamicStyles')) return;
    const style = document.createElement('style');
    style.id = 'playerDynamicStyles';
    style.innerHTML = `
        @keyframes characterBounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
        }

        .player-container.walking {
            animation: characterBounce 0.3s ease-in-out infinite;
        }

        /* Independent alternating leg swings */
        .player-container.walking .left-leg-group {
            animation: swingLeftLeg 0.3s ease-in-out infinite alternate;
            transform-origin: 41px 85px;
        }

        .player-container.walking .right-leg-group {
            animation: swingRightLeg 0.3s ease-in-out infinite alternate;
            transform-origin: 59px 85px;
        }

        @keyframes swingLeftLeg {
            0% { transform: rotate(-25deg); }
            100% { transform: rotate(25deg); }
        }

        @keyframes swingRightLeg {
            0% { transform: rotate(25deg); }
            100% { transform: rotate(-25deg); }
        }

        .facing-left svg { transform: scaleX(-1); }
        .facing-right svg { transform: scaleX(1); }
    `;
    document.head.appendChild(style);
}
injectPlayerStyles();

window.toggleMovementMode = function() {
    isRealWorldMode = !isRealWorldMode;
    const btn = document.getElementById('movementModeBtn');

    if (isRealWorldMode) {
        if (btn) btn.innerText = "🗺️ MODE: REAL GPS";
        alert("📍 Switched to Real-World GPS Mode! Your character will now follow your physical steps.");
        
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
    if (typeof map === 'undefined' || !map) return; 
    if (playerMarker !== null) return; 

    let mapCenter = map.getCenter();
    playerLat = mapCenter.lat;
    playerLng = mapCenter.lng;

    const playerSvgHtml = `
        <div id="playerAvatar" class="player-container facing-down" style="width: 65px; height: 85px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4));">
            <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <!-- Shadow / Ground effect -->
                <ellipse cx="50" cy="112" rx="16" ry="5" fill="rgba(0,0,0,0.25)"/>
                
                <!-- Left Leg Group (Pivots smoothly from hip) -->
                <g class="left-leg-group">
                    <rect x="36" y="85" width="10" height="20" rx="5" fill="#222225"/>
                    <path d="M 32 103 Q 36 100 44 103 Z" fill="#d0d0d0"/>
                </g>

                <!-- Right Leg Group (Pivots smoothly from hip) -->
                <g class="right-leg-group">
                    <rect x="54" y="85" width="10" height="20" rx="5" fill="#222225"/>
                    <path d="M 56 103 Q 60 100 68 103 Z" fill="#d0d0d0"/>
                </g>

                <!-- Torso (Gray Hoodie) -->
                <path d="M 32 55 Q 50 50 68 55 L 70 88 Q 50 94 30 88 Z" fill="#6b7280"/>
                <!-- Hoodie Front Pocket / Strings -->
                <path d="M 43 72 Q 50 78 57 72" stroke="#4b5563" stroke-width="2.5" fill="none"/>
                <line x1="45" y1="58" x2="45" y2="70" stroke="#9ca3af" stroke-width="2"/>
                <line x1="55" y1="58" x2="55" y2="70" stroke="#9ca3af" stroke-width="2"/>

                <!-- Head & Face -->
                <circle cx="50" cy="44" r="15" fill="#fcd34d"/>
                <!-- Expressive Cartoon Eyes -->
                <ellipse cx="44" cy="42" rx="3" ry="3.5" fill="#1f2937"/>
                <circle cx="45" cy="40.5" r="1" fill="#ffffff"/>
                <ellipse cx="56" cy="42" rx="3" ry="3.5" fill="#1f2937"/>
                <circle cx="57" cy="40.5" r="1" fill="#ffffff"/>
                <!-- Smile -->
                <path d="M 47 48 Q 50 51 53 48" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
                <!-- Cute beak/nose detail -->
                <path d="M 49 45 L 51 45 L 50 47 Z" fill="#ea580c"/>

                <!-- Messy Top-Knot Hair (Man-bun) -->
                <path d="M 35 40 C 33 22, 42 20, 48 24 C 52 18, 65 22, 65 38 C 67 44, 35 44, 35 40 Z" fill="#38220f"/>
                <!-- Top bun circle -->
                <circle cx="48" cy="18" r="7" fill="#38220f"/>
                <circle cx="50" cy="16" r="3" fill="#4e3524"/>

                <!-- Smartphone in Hand -->
                <rect x="68" y="62" width="14" height="20" rx="3" fill="#111827"/>
                <rect x="70" y="64" width="10" height="16" rx="1" fill="#38bdf8"/>
            </svg>
        </div>
    `;

    const playerIcon = L.divIcon({
        html: playerSvgHtml,
        className: 'player-div-icon',
        iconSize: [65, 85],
        iconAnchor: [32, 70]
    });

    playerMarker = L.marker([playerLat, playerLng], { icon: playerIcon }).addTo(map);
}

// Keyboard movement listeners with bulletproof string safety
window.addEventListener('keydown', (e) => {
    if (isRealWorldMode) return; 
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
            if (dLat !== 0 && dLng !== 0) {
                dLat *= 0.7071;
                dLng *= 0.7071;
            }

            const lngCorrection = 1 / Math.max(0.1, Math.cos(playerLat * (Math.PI / 180)));
            
            playerLat += dLat;
            playerLng += dLng * lngCorrection;

            if (playerMarker && typeof playerMarker.setLatLng === 'function') {
                playerMarker.setLatLng([playerLat, playerLng]);
            }
            if (typeof map !== 'undefined' && map && typeof map.panTo === 'function') {
                map.panTo([playerLat, playerLng], { animate: false });
            }

            if (avatar) {
                avatar.className = `player-container walking ${facingClass}`;
            }

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