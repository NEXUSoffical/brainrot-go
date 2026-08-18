// ==========================================
// STRICT LOCATION SYSTEM
// ==========================================
let map;

// Inject the floating animation & RAIN for the map sprites
function injectAnimationStyles() {
    if (document.getElementById('mapSpriteAnimations')) return;
    const style = document.createElement('style');
    style.id = 'mapSpriteAnimations';
    style.innerHTML = `
        @keyframes floatSprite {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        .animated-map-sprite {
            animation: floatSprite 2.5s ease-in-out infinite;
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -10px); }
            15% { opacity: 1; transform: translate(-50%, 0); }
            85% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -10px); }
        }
    `;
    document.head.appendChild(style);
}
injectAnimationStyles();

// 🍞 NON-BLOCKING TOAST NOTIFICATION SYSTEM (Replaces annoying alerts!) 🍞
window.showGameToast = function(message) {
    const existing = document.getElementById('gameToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'gameToast';
    toast.style.cssText = `
        position: fixed !important; top: 20px !important; left: 50% !important;
        transform: translateX(-50%) !important; background: rgba(10, 10, 10, 0.95) !important;
        border: 2px solid #76ff03 !important; color: #fff !important; padding: 10px 20px !important;
        border-radius: 25px !important; z-index: 999999999 !important; font-family: monospace !important;
        font-size: 0.85rem !important; box-shadow: 0 0 20px rgba(118,255,3,0.5) !important;
        text-align: center !important; pointer-events: none !important;
        animation: fadeInOut 2.5s forwards !important;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => { toast.remove(); }, 2500);
};

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
            if (isNaN(lat) || isNaN(lng)) {
                console.warn("GPS sent NaN! Falling back to safe coordinates.");
                lat = 53.4808; 
                lng = -2.2426; 
            }
            
            // Hide the error box so they can play
            document.getElementById('locationErrorModal').style.display = 'none';

            // Update the HUD so they see their coordinates
            if(document.getElementById('latVal')) document.getElementById('latVal').innerText = lat.toFixed(5);
            if(document.getElementById('lngVal')) document.getElementById('lngVal').innerText = lng.toFixed(5);

            // If the map hasn't been built yet, build it right where THEY are standing!
            if (!map) {
                map = L.map('map', { 
                    zoomControl: false, 
                    keyboard: false 
                }).setView([lat, lng], 19);
                
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                setTimeout(() => {
                    map.invalidateSize();
                }, 1000);

                if (typeof initPlayer === 'function') {
                    initPlayer();
                }
            }
        },
        function(error) {
            if (error.code === 1) {
                document.getElementById('locationErrorModal').style.display = 'flex';
            } else {
                console.log("GPS is taking a bit long to connect, still searching...");
            }
        },
        {
            enableHighAccuracy: true, 
            timeout: 30000,           
            maximumAge: 10000         
        }
    );
}

// Single unified DOM load handler for map, player, and spawns
window.addEventListener('DOMContentLoaded', () => {
    startStrictLocation();

    const rotDexElement = document.querySelector('.rot-dex') || document.getElementById('rot-dex');
    if (rotDexElement && typeof brainrotCharacters !== 'undefined') {
        rotDexElement.innerText = `ROT-DEX (0/${brainrotCharacters.length})`;
    }
});

// ==========================================
// PERCENTAGE STAT RATING SYSTEM (IVs) & STARS
// ==========================================

function rollRotQuality() {
    const rand = Math.random() * 100;
    if (rand < 1) {
        return Math.floor(Math.random() * 6) + 95; // 95 to 100 (1% chance)
    } else if (rand < 10) {
        return Math.floor(Math.random() * 15) + 80; // 80 to 94 (9% chance)
    } else if (rand < 50) {
        return Math.floor(Math.random() * 30) + 50; // 50 to 79 (40% chance)
    } else {
        return Math.floor(Math.random() * 49) + 1;  // 1 to 49 (50% chance)
    }
}

// Converts percentage (1-100) into visual 3-star string (e.g. ⭐⭐⭐, ⭐⭐✨, etc.)
function getStarRatingHtml(quality) {
    const q = quality || 50;
    const score = (q / 100) * 3; 
    
    let starsHtml = '';
    for (let i = 1; i <= 3; i++) {
        if (score >= i) {
            starsHtml += '⭐'; // Full star
        } else if (score >= i - 0.5) {
            starsHtml += '🌟'; // Half star / glowing star
        } else {
            starsHtml += '☆'; // Empty star
        }
    }
    return starsHtml;
}

function createNewRot(template, baseLevel = 1) {
    const quality = rollRotQuality(); 
    const qualityMultiplier = 0.7 + (quality / 100) * 0.8;

    const baseHp = template.baseHp || 50;
    const baseAtk = template.baseAtk || 15;
    const baseDef = template.baseDef || 10;

    const finalHp = Math.floor((baseHp + (baseLevel - 1) * 20) * qualityMultiplier);
    const finalAtk = Math.floor((baseAtk + (baseLevel - 1) * 5) * qualityMultiplier);
    const finalDef = Math.floor((baseDef + (baseLevel - 1) * 4) * qualityMultiplier);

    return {
        id: template.id,
        name: template.name,
        rarity: template.rarity,
        image: template.image,
        level: baseLevel,
        quality: quality,
        maxHp: finalHp,
        hp: finalHp,
        atk: finalAtk,
        def: finalDef,
        fainted: false,
        inGym: false
    };
}

window.inspectRot = function(index) {
    if (!playerData || !playerData.inventory || !playerData.inventory[index]) return;
    const rot = playerData.inventory[index];

    let existingModal = document.getElementById('inspectModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'inspectModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10, 10, 15, 0.95); z-index: 9999999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: #fff; font-family: monospace; padding: 20px; box-sizing: border-box;
    `;

    let qualityColor = '#aaa';
    if (rot.quality >= 95) qualityColor = '#ffcc00';
    else if (rot.quality >= 80) qualityColor = '#ff00ff';
    else if (rot.quality >= 50) qualityColor = '#00ccff';

    const starDisplay = getStarRatingHtml(rot.quality || 50);

    modal.innerHTML = `
        <div style="background: #16161a; border: 2px solid ${qualityColor}; border-radius: 16px; padding: 30px; text-align: center; max-width: 350px; width: 100%; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
            <img src="${rot.image || ''}" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 15px;" onerror="this.style.display='none';" />
            <h2 style="margin: 0 0 5px 0; color: #fff;">${rot.name}</h2>
            <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: #aaa; text-transform: uppercase;">${rot.rarity || 'common'} • Lvl ${rot.level}</p>
            
            <div style="font-size: 1.3rem; margin-bottom: 12px; letter-spacing: 2px;">${starDisplay}</div>

            <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; margin-bottom: 20px;">
                <div style="font-size: 1.1rem; font-weight: bold; color: ${qualityColor}; margin-bottom: 8px;">
                    IV Rating: ${rot.quality || 50}%
                </div>
                <div style="font-size: 0.8rem; color: #ccc; display: flex; justify-content: space-around;">
                    <div>HP: ${rot.maxHp}</div>
                    <div>ATK: ${rot.atk}</div>
                    <div>DEF: ${rot.def}</div>
                </div>
            </div>

            <button onclick="document.getElementById('inspectModal').remove()" style="background: #333; color: #fff; border: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%;">BACK</button>
        </div>
    `;

    document.body.appendChild(modal);
};

// ==========================================
// RPG STAT ENGINE & FULL-SCREEN CARD UI
// ==========================================

window.calculateRotStats = function(rot) {
    const level = rot.level || 1;
    const qualityMultiplier = 0.7 + ((rot.quality || 50) / 100) * 0.8;
    
    const rarityGrowth = {
        'common': 1.0,
        'uncommon': 1.5,
        'rare': 2.2,
        'epic': 3.5,
        'secret': 6.0,
        'og': 8.5
    };
    
    const mult = rarityGrowth[(rot.rarity || 'common').toLowerCase()] || 1.0;

    let baseHp = 50;
    let baseAtk = 15;
    let baseDef = 10;

    if (typeof brainrotCharacters !== 'undefined') {
        const dbChar = brainrotCharacters.find(c => c.name.toLowerCase().trim() === rot.name.toLowerCase().trim());
        if (dbChar) {
            baseHp = dbChar.baseHp || 50;
            baseAtk = dbChar.baseAtk || 15;
            baseDef = dbChar.baseDef || 10;
        }
    }

    return {
        maxHp: Math.floor((baseHp + (level * 5 * mult)) * qualityMultiplier),
        atk: Math.floor((baseAtk + (level * 2 * mult)) * qualityMultiplier),
        def: Math.floor((baseDef + (level * 2 * mult)) * qualityMultiplier)
    };
};

window.openCardDetails = function(inventoryIndex) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[inventoryIndex]) return;
    
    const rot = playerData.inventory[inventoryIndex];
    const stats = calculateRotStats(rot);
    const rarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(rot.rarity) : '#00ff55';

    let rotImage = rot.image || '';
    if (rot.name && rot.name.toLowerCase().replace(/[\s-]/g, '') === 'hashtaghell') {
        rotImage = 'brainrots/hashtag_hell.png';
    }

    const candyKey = rot.name.toUpperCase().trim();
    if (!playerData.candies) playerData.candies = {};
    const candyCount = playerData.candies[candyKey] || 0; 
    const levelUpCost = rot.level * 2; 

    const charData = typeof brainrotCharacters !== 'undefined' 
        ? brainrotCharacters.find(c => c.name.toLowerCase().trim() === rot.name.toLowerCase().trim())
        : null;

    let evolveButtonHtml = '';
    if (charData && charData.evolution) {
        const requiredCandies = charData.evolution.candyCost || 50;
        const canEvolve = candyCount >= requiredCandies;

        evolveButtonHtml = `
            <button onclick="window.evolveRot(${inventoryIndex}); openCardDetails(${inventoryIndex});" style="width: 100%; background: ${canEvolve ? '#00ff55' : '#333'}; color: ${canEvolve ? '#000' : '#aaa'}; font-weight: bold; padding: 8px; border: none; border-radius: 5px; cursor: ${canEvolve ? 'pointer' : 'not-allowed'}; font-family: monospace; font-size: 0.8rem; margin-bottom: 8px;">
                🧬 EVOLVE (${candyCount}/${requiredCandies})
            </button>
        `;
    }

    let detailModal = document.getElementById('cardDetailModal');
    if (!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'cardDetailModal';
        document.body.appendChild(detailModal);
    }

    detailModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.95); z-index: 9999999; display: flex;
        flex-direction: column; align-items: center; justify-content: center;
        font-family: monospace; padding: 20px; color: #fff;
    `;

    const hpPercent = Math.min(100, (stats.maxHp / 2000) * 100);
    const atkPercent = Math.min(100, (stats.atk / 800) * 100);
    const defPercent = Math.min(100, (stats.def / 800) * 100);
    const starDisplay = getStarRatingHtml(rot.quality || 50);

    detailModal.innerHTML = `
        <div style="background: linear-gradient(180deg, #111, ${rarityColor}44); border: 4px solid ${rarityColor}; border-radius: 20px; padding: 20px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 0 50px ${rarityColor}88; position: relative;">
            
            <button onclick="document.getElementById('cardDetailModal').style.display='none'" style="position: absolute; top: -15px; right: -15px; background: #ff0055; color: white; border: 3px solid #fff; border-radius: 50%; width: 40px; height: 40px; font-weight: bold; font-size: 1.2rem; cursor: pointer; z-index: 10;">X</button>

            <h2 style="color: ${rarityColor}; margin: 0 0 5px 0; text-transform: uppercase; font-size: 1.4rem;">${rot.name}</h2>
            <div style="font-size: 0.9rem; margin-bottom: 5px; color: #aaa; font-weight: bold;">Lvl ${rot.level || 1} | ${(rot.rarity || 'common').toUpperCase()}</div>
            <div style="font-size: 1.1rem; margin-bottom: 10px; letter-spacing: 1px;">${starDisplay}</div>
            <div style="font-size: 0.75rem; color: #ffcc00; margin-bottom: 12px; font-weight: bold; cursor: pointer;" onclick="inspectRot(${inventoryIndex})">IV Rating: ${rot.quality || 50}% (Click to Inspect)</div>
            
            <div style="width: 100%; height: 140px; background: transparent; border-radius: 10px; overflow: hidden; border: 2px solid #444; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="inspectRot(${inventoryIndex})">
                <img src="${rotImage}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.8));" onerror="this.style.display='none';">
            </div>

            <!-- Stats Section -->
            <div style="text-align: left; background: rgba(0,0,0,0.6); padding: 15px; border-radius: 10px; border: 1px solid #333; margin-bottom: 15px;">
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: bold;">
                        <span style="color: #00ff55;">❤️ HEALTH</span>
                        <span style="color: #fff;">${stats.maxHp}</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${hpPercent}%; height: 100%; background: #00ff55; box-shadow: 0 0 8px #00ff55;"></div>
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: bold;">
                        <span style="color: #ff0055;">⚔️ ATTACK</span>
                        <span style="color: #fff;">${stats.atk}</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${atkPercent}%; height: 100%; background: #ff0055; box-shadow: 0 0 8px #ff0055;"></div>
                    </div>
                </div>

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

            <!-- 🍬 CANDY & UPGRADE UI -->
            <div style="background: rgba(0,0,0,0.8); padding: 10px; border-radius: 10px; border: 2px dashed ${rarityColor};">
                <div style="font-size: 1rem; color: #fff; font-weight: bold; margin-bottom: 10px;">
                    🍬 Candy: <span style="color: #00ccff;">${candyCount}</span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${evolveButtonHtml}
                    <div style="display: flex; justify-content: space-between; gap: 10px;">
                        <button onclick="levelUpRot(${inventoryIndex})" style="flex: 1; background: #00ff55; color: #000; font-weight: bold; padding: 8px; border: none; border-radius: 5px; cursor: pointer;">
                            LEVEL UP<br><span style="font-size: 0.7rem;">(Cost: ${levelUpCost})</span>
                        </button>
                        <button onclick="transferRot(${inventoryIndex})" style="flex: 1; background: #ff0055; color: #fff; font-weight: bold; padding: 8px; border: none; border-radius: 5px; cursor: pointer;">
                            TRANSFER<br><span style="font-size: 0.7rem;">(+1 Candy)</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;
    detailModal.style.display = 'flex';
};

// ==========================================
// CANDY ECONOMY LOGIC
// ==========================================

window.levelUpRot = function(index) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[index]) return;
    
    const rot = playerData.inventory[index];
    const cost = rot.level * 2; 
    const candyKey = rot.name.toUpperCase().trim();
    
    if (!playerData.candies) playerData.candies = {};

    if ((playerData.candies[candyKey] || 0) >= cost) {
        playerData.candies[candyKey] -= cost;
        rot.level++;
        
        const newStats = calculateRotStats(rot);
        rot.maxHp = newStats.maxHp;
        rot.hp = newStats.maxHp;
        rot.atk = newStats.atk;
        rot.def = newStats.def;
        
        if (typeof window.saveGameData === 'function') window.saveGameData();
        
        openCardDetails(index);
        showGameToast(`🎉 Successfully leveled up ${rot.name} to Lvl ${rot.level}!`);
    } else {
        showGameToast(`❌ Not enough candy! Need ${cost} candies.`);
    }
};

window.transferRot = function(index) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[index]) return;
    
    if (playerData.inventory.length <= 1) {
        showGameToast("🚨 You cannot transfer your very last Rot!");
        return;
    }

    const rot = playerData.inventory[index];
    const candyKey = rot.name.toUpperCase().trim();
    
    if (confirm(`⚠️ Are you sure you want to transfer this Lvl ${rot.level} ${rot.name} to the Professor? You will receive 1 Candy. This CANNOT be undone.`)) {
        
        if (!playerData.candies) playerData.candies = {};
        playerData.candies[candyKey] = (playerData.candies[candyKey] || 0) + 1;
        playerData.inventory.splice(index, 1);
        
        if (playerData.activeFighterIndex >= playerData.inventory.length) {
            playerData.activeFighterIndex = 0;
        } else if (playerData.activeFighterIndex === index) {
            playerData.activeFighterIndex = 0; 
        } else if (playerData.activeFighterIndex > index) {
            playerData.activeFighterIndex--; 
        }
        
        if (typeof window.saveGameData === 'function') window.saveGameData();
        
        document.getElementById('cardDetailModal').style.display = 'none';
        if (typeof window.renderInventory === 'function') window.renderInventory();
        showGameToast(`🍬 Transferred ${rot.name} for 1 Candy!`);
    }
};