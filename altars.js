// altars.js - Soul Obelisks (Wide Spread, Extract Menu Restored, Toast Notifications)

let spawnedAltars = [];
let altarCooldowns = JSON.parse(localStorage.getItem('altarCooldowns') || '{}');

// Inject Pure CSS for the 3D Obelisk Animations, Modal, & Toast Notifications
const altarStyles = document.createElement('style');
altarStyles.innerHTML = `
    @keyframes obeliskHover {
        0% { transform: translateY(0px); filter: drop-shadow(0 0 8px #ff0055); }
        50% { transform: translateY(-15px); filter: drop-shadow(0 0 20px #00ffff); }
        100% { transform: translateY(0px); filter: drop-shadow(0 0 8px #ff0055); }
    }
    @keyframes shadowPulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(0.6); opacity: 0.3; }
        100% { transform: scale(1); opacity: 0.8; }
    }
    .obelisk-marker {
        cursor: pointer;
        z-index: 500 !important;
    }
    .svg-obelisk-core {
        animation: obeliskHover 3.5s ease-in-out infinite;
        transform-origin: center;
    }
    .svg-shadow {
        transform-origin: 50% 140px;
        animation: shadowPulse 3.5s ease-in-out infinite;
    }
    
    /* Dead Stone Cooldown State */
    .altar-cooldown {
        cursor: not-allowed;
    }
    .altar-cooldown .svg-obelisk-core {
        animation: none;
        transform: translateY(10px);
        filter: grayscale(100%) brightness(0.3);
    }
    .altar-cooldown .svg-shadow {
        animation: none;
        opacity: 0.4;
        transform: scale(1);
    }

    #altarModal {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 2, 10, 0.95); z-index: 999999;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        color: #fff; font-family: monospace; backdrop-filter: blur(8px);
    }
    .altar-box {
        background: #110a1c; border: 3px solid #ff0055; border-radius: 15px;
        padding: 30px; text-align: center; box-shadow: 0 0 40px rgba(255,0,85,0.4);
        max-width: 350px; width: 90%;
    }

    /* --- TOAST NOTIFICATION STYLES --- */
    .game-toast {
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(10, 5, 20, 0.95);
        border: 2px solid #00ff80;
        color: #fff;
        padding: 12px 24px;
        border-radius: 30px;
        font-family: monospace;
        font-size: 1.1rem;
        font-weight: bold;
        box-shadow: 0 0 20px rgba(0,255,128,0.5);
        z-index: 99999999;
        text-align: center;
        transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
        opacity: 0;
        pointer-events: none;
        white-space: nowrap;
    }
    .game-toast.show {
        top: 20px;
        opacity: 1;
    }
`;
document.head.appendChild(altarStyles);

// The High-Quality Vector Graphic (SVG)
const obeliskSVG = `
<svg viewBox="0 0 100 150" style="width: 100%; height: 100%; overflow: visible;">
    <defs>
        <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff0055;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4a0018;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="gradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#004a4a;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Pulsing Shadow -->
    <ellipse cx="50" cy="140" rx="35" ry="10" fill="rgba(0,0,0,0.8)" class="svg-shadow"/>
    <ellipse cx="50" cy="140" rx="15" ry="5" fill="#9900ff" class="svg-shadow" style="filter: blur(4px);"/>
    
    <!-- Floating 3D Crystal -->
    <g class="svg-obelisk-core">
        <!-- Left Face -->
        <polygon points="50,10 50,125 15,60" fill="url(#gradLeft)"/>
        <!-- Right Face -->
        <polygon points="50,10 85,60 50,125" fill="url(#gradRight)"/>
        <!-- Bright Inner Core -->
        <polygon points="50,35 60,60 50,90 40,60" fill="#ffffff" style="filter: drop-shadow(0 0 5px #fff);"/>
    </g>
</svg>
`;

// --- IN-GAME TOAST FUNCTION ---
window.showGameToast = function(message, color = "#00ff80") {
    let existing = document.getElementById('gameToast');
    if (existing) existing.remove();

    let toast = document.createElement('div');
    toast.id = 'gameToast';
    toast.className = 'game-toast';
    toast.style.borderColor = color;
    toast.style.boxShadow = `0 0 20px ${color}88`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Animate out after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

function spawnAltars(lat, lng) {
    if (typeof L === 'undefined' || typeof map === 'undefined' || !map) return;
    
    spawnedAltars.forEach(a => map.removeLayer(a.marker));
    spawnedAltars = [];

    // WIDE SPREAD RADIUS: Spawns across multiple blocks/streets
    let spreadRadius = 0.008; 

    for (let i = 0; i < 6; i++) {
        let rngLat, rngLng, isValid;
        let attempts = 0;

        // Ensure they don't spawn on top of each other
        do {
            rngLat = lat + ((Math.random() - 0.5) * spreadRadius);
            rngLng = lng + ((Math.random() - 0.5) * spreadRadius);
            isValid = true;

            for (let existing of spawnedAltars) {
                let latDiff = Math.abs(existing.lat - rngLat);
                let lngDiff = Math.abs(existing.lng - rngLng);
                // If they are closer than ~100 meters to another obelisk, reject and try again
                if (latDiff < 0.0015 && lngDiff < 0.0015) {
                    isValid = false;
                    break;
                }
            }
            attempts++;
        } while (!isValid && attempts < 20);

        let altarId = `altar_${Math.floor(rngLat * 10000)}_${Math.floor(rngLng * 10000)}`;
        
        let isCoolingDown = altarCooldowns[altarId] && (Date.now() - altarCooldowns[altarId] < 300000);
        
        let icon = L.divIcon({ 
            className: `obelisk-marker ${isCoolingDown ? 'altar-cooldown' : ''}`, 
            html: `<div id="icon_${altarId}" style="width:100%; height:100%;">${obeliskSVG}</div>`, 
            iconSize: [44, 66],  
            iconAnchor: [22, 66] 
        });
        
        let marker = L.marker([rngLat, rngLng], { icon: icon }).addTo(map);
        
        // OPENS THE MENU MODAL
        marker.on('click', () => openAltar(altarId));
        
        spawnedAltars.push({ id: altarId, lat: rngLat, lng: rngLng, marker: marker });
    }
}

function openAltar(altarId) {
    if (altarCooldowns[altarId] && (Date.now() - altarCooldowns[altarId] < 300000)) {
        let remainingTime = Math.ceil((300000 - (Date.now() - altarCooldowns[altarId])) / 60000);
        showGameToast(`🌑 Drained. Back in ${remainingTime} min.`, "#555555");
        return;
    }

    let modal = document.getElementById('altarModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'altarModal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="altar-box">
            <h2 style="color: #ff0055; font-size: 1.8rem; text-shadow: 0 0 15px #ff0055; margin-bottom: 10px;">SOUL OBELISK</h2>
            <div style="width: 80px; height: 120px; margin: 15px auto;">
                ${obeliskSVG}
            </div>
            <p style="color: #ccc; font-size: 0.9rem; margin-bottom: 25px;">The ancient crystal hums with paranormal energy. Tap into the core to extract Revive Potions.</p>
            
            <button onclick="communeWithAltar('${altarId}')" style="background: #ff0055; color: #fff; border: 2px solid #fff; padding: 15px; width: 100%; border-radius: 10px; font-weight: bold; font-size: 1.1rem; cursor: pointer; font-family: monospace; box-shadow: 0 0 15px #ff0055; margin-bottom: 10px;">
                EXTRACT LOOT
            </button>
            <button onclick="document.getElementById('altarModal').style.display='none'" style="background: transparent; color: #aaa; border: none; padding: 10px; width: 100%; cursor: pointer; font-family: monospace;">LEAVE</button>
        </div>
    `;
    modal.style.display = 'flex';
}

window.communeWithAltar = function(altarId) {
    let revivesFound = Math.floor(Math.random() * 2) + 1;
    let coinDrop = Math.random() < 0.20 ? 1 : 0; 
    
    if (typeof playerData !== 'undefined') {
        playerData.revivePotions = (playerData.revivePotions || 0) + revivesFound;
        if (coinDrop > 0) {
            playerData.rotBalance = (playerData.rotBalance || 0) + 1;
            const rotEl = document.getElementById('rotBalance');
            if (rotEl) rotEl.innerText = playerData.rotBalance;
        }
        if (typeof saveGameData === 'function') saveGameData();
    }
    
    // Set 5-minute cooldown
    altarCooldowns[altarId] = Date.now();
    localStorage.setItem('altarCooldowns', JSON.stringify(altarCooldowns));
    
    // Visually turn it to stone immediately
    let markerContainer = document.getElementById(`icon_${altarId}`);
    if (markerContainer && markerContainer.parentElement) {
        markerContainer.parentElement.classList.add('altar-cooldown');
    }
    
    // Close the menu
    document.getElementById('altarModal').style.display = 'none';

    // Trigger the sleek toast notification instead of alert()
    let toastMsg = `✨ +${revivesFound} Revive Potion(s)`;
    if (coinDrop > 0) toastMsg += ` & 🪙 +1 Coin`;
    
    showGameToast(toastMsg, "#00ff80");
};

let altarInitTimer = setInterval(() => {
    if (spawnedAltars.length > 0) {
        clearInterval(altarInitTimer); 
        return;
    }
    
    if (typeof L !== 'undefined' && typeof map !== 'undefined' && map) {
        let latEl = document.getElementById('latVal');
        let lngEl = document.getElementById('lngVal');
        
        if (latEl && lngEl && latEl.innerText !== "Loading..." && lngEl.innerText !== "Loading...") {
            let realLat = parseFloat(latEl.innerText);
            let realLng = parseFloat(lngEl.innerText);
            
            if (!isNaN(realLat) && !isNaN(realLng)) {
                spawnAltars(realLat, realLng);
            }
        }
    }
}, 2000);