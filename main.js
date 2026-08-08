// 🚨 STRICT LOCATION SYSTEM 🚨
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
    `;
    document.head.appendChild(style);
}
injectAnimationStyles();

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
// RPG STAT ENGINE & FULL-SCREEN CARD UI
// ==========================================

window.calculateRotStats = function(rot) {
    const level = rot.level || 1;
    
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
    let baseAtk = 10;
    let baseDef = 10;

    if (typeof brainrotCharacters !== 'undefined') {
        const dbChar = brainrotCharacters.find(c => c.name.toLowerCase().trim() === rot.name.toLowerCase().trim());
        
        if (dbChar) {
            baseHp = dbChar.baseHp || 50;
            baseAtk = dbChar.baseAtk || 10;
            baseDef = dbChar.baseDef || 10;
        }
    } else {
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

    detailModal.innerHTML = `
        <div style="background: linear-gradient(180deg, #111, ${rarityColor}44); border: 4px solid ${rarityColor}; border-radius: 20px; padding: 20px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 0 50px ${rarityColor}88; position: relative;">
            
            <button onclick="document.getElementById('cardDetailModal').style.display='none'" style="position: absolute; top: -15px; right: -15px; background: #ff0055; color: white; border: 3px solid #fff; border-radius: 50%; width: 40px; height: 40px; font-weight: bold; font-size: 1.2rem; cursor: pointer; z-index: 10;">X</button>

            <h2 style="color: ${rarityColor}; margin: 0 0 5px 0; text-transform: uppercase; font-size: 1.4rem;">${rot.name}</h2>
            <div style="font-size: 0.9rem; margin-bottom: 15px; color: #aaa; font-weight: bold;">Lvl ${rot.level || 1} | ${(rot.rarity || 'common').toUpperCase()}</div>
            
            <div style="width: 100%; height: 180px; background: transparent; border-radius: 10px; overflow: hidden; border: 2px solid #444; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
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
        rot.hp = rot.maxHp;
        
        if (typeof window.saveGameData === 'function') window.saveGameData();
        
        openCardDetails(index);
    } else {
        alert(`❌ Not enough candy! You need ${cost} Candies to reach Level ${rot.level + 1}.`);
    }
};

window.transferRot = function(index) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[index]) return;
    
    if (playerData.inventory.length <= 1) {
        alert("🛑 You cannot transfer your very last Rot! You need at least one to fight.");
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
    }
};

// ==========================================
// FULL-SCREEN INVENTORY & SORTING SYSTEM
// ==========================================

window.currentInventorySort = 'newest';

window.openInventory = window.openInventoryModal = function() {
    let invModal = document.getElementById('inventoryModal');
    
    if (!invModal) {
        invModal = document.createElement('div');
        invModal.id = 'inventoryModal';
        document.body.appendChild(invModal);
    }

    invModal.style.cssText = `
        position: fixed !important; 
        top: 0 !important; 
        left: 0 !important; 
        width: 100vw !important; 
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.95) !important; 
        z-index: 9999999 !important; 
        display: flex !important;
        flex-direction: column !important; 
        align-items: center !important; 
        padding: 20px !important;
        box-sizing: border-box !important; 
        font-family: monospace !important; 
        color: #fff !important;
    `;

    renderInventoryModal();
};

window.setInventorySort = function(sortType) {
    window.currentInventorySort = sortType;
    renderInventoryModal();
};

window.renderInventoryModal = function() {
    const invModal = document.getElementById('inventoryModal');
    if (!invModal) return;

    if (typeof playerData === 'undefined' || !playerData.inventory) {
        playerData = playerData || {};
        playerData.inventory = playerData.inventory || [];
    }

    let indexedInventory = playerData.inventory.map((rot, originalIndex) => ({
        rot: rot,
        originalIndex: originalIndex
    }));

    const rarityRank = {
        'og': 6,
        'secret': 5,
        'epic': 4,
        'rare': 3,
        'uncommon': 2,
        'common': 1
    };

    if (window.currentInventorySort === 'power') {
        indexedInventory.sort((a, b) => {
            const statsA = calculateRotStats(a.rot);
            const statsB = calculateRotStats(b.rot);
            const powerA = statsA.maxHp + statsA.atk + statsA.def;
            const powerB = statsB.maxHp + statsB.atk + statsB.def;
            return powerB - powerA;
        });
    } else if (window.currentInventorySort === 'rarity') {
        indexedInventory.sort((a, b) => {
            const rankA = rarityRank[(a.rot.rarity || 'common').toLowerCase()] || 0;
            const rankB = rarityRank[(b.rot.rarity || 'common').toLowerCase()] || 0;
            return rankB - rankA;
        });
    } else if (window.currentInventorySort === 'newest') {
        indexedInventory.reverse();
    }

    let html = `
        <div style="width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #00ff55; text-transform: uppercase;">📦 Inventory (${playerData.inventory.length})</h2>
            <button onclick="document.getElementById('inventoryModal').style.display='none'" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">X</button>
        </div>

        <!-- SORT BUTTONS BAR -->
        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 15px;">
            <button onclick="setInventorySort('power')" style="flex: 1; padding: 10px; background: ${window.currentInventorySort === 'power' ? '#00ff55' : '#222'}; color: ${window.currentInventorySort === 'power' ? '#000' : '#fff'}; border: 2px solid #00ff55; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">
                ⚔️ POWER
            </button>
            <button onclick="setInventorySort('rarity')" style="flex: 1; padding: 10px; background: ${window.currentInventorySort === 'rarity' ? '#00ccff' : '#222'}; color: ${window.currentInventorySort === 'rarity' ? '#000' : '#fff'}; border: 2px solid #00ccff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">
                💎 RARITY
            </button>
            <button onclick="setInventorySort('newest')" style="flex: 1; padding: 10px; background: ${window.currentInventorySort === 'newest' ? '#ff0055' : '#222'}; color: ${window.currentInventorySort === 'newest' ? '#000' : '#fff'}; border: 2px solid #ff0055; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">
                🕒 NEWEST
            </button>
        </div>

        <!-- GRID CONTAINER -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 800px; max-height: calc(100vh - 160px); overflow-y: auto; padding: 5px;">
    `;

    indexedInventory.forEach(item => {
        const rot = item.rot;
        const origIndex = item.originalIndex;
        const stats = calculateRotStats(rot);
        const rarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(rot.rarity) : '#00ff55';
        const isFainted = rot.fainted === true;

        let rotImage = rot.image || '';
        if (rot.name && rot.name.toLowerCase().replace(/[\s-]/g, '') === 'hashtaghell') {
            rotImage = 'brainrots/hashtag_hell.png';
        }

        html += `
            <div onclick="openCardDetails(${origIndex})" style="
                background: linear-gradient(180deg, #111, ${rarityColor}33); 
                border: 2px solid ${rarityColor}; 
                border-radius: 12px; 
                padding: 8px; 
                text-align: center; 
                cursor: pointer; 
                box-shadow: 0 0 10px ${rarityColor}44; 
                position: relative;
                opacity: ${isFainted ? '0.6' : '1'};
            ">
                <div style="font-size: 0.75rem; font-weight: bold; color: ${rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    ${rot.name}
                </div>
                <div style="font-size: 0.65rem; color: #aaa; margin-bottom: 4px;">
                    Lvl ${rot.level || 1} | ${(rot.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: transparent; border-radius: 6px; overflow: hidden; border: 1px solid #333; margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">
                    <img src="${rotImage}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); ${isFainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">
                    ❤️ ${stats.maxHp} | ⚔️ ${stats.atk}
                </div>
                ${isFainted ? '<div style="font-size: 0.6rem; color: #ff0055; font-weight: bold; margin-top: 2px;">💀 FAINTED</div>' : ''}
            </div>
        `;
    });

    html += `</div>`;
    invModal.innerHTML = html;
};

window.renderInventory = window.renderInventoryModal;