// inventory.js - Rot Management, Items, and the Weapon Vault Engine

window.injectAnimationStyles = window.injectAnimationStyles || function() {};

// --- GLOBAL DATABASE FALLBACK ---
if (!window.gameWeapons || window.gameWeapons.length === 0) {
    window.gameWeapons = [
        { id: "wpn_01", name: "Bent Butter Knife", rarity: "common", atk: 5, image: "gear/knife.png" },
        { id: "wpn_02", name: "Rusty Iron Sword", rarity: "common", atk: 12, image: "gear/rusty.png" },
        { id: "wpn_03", name: "Chipped Wood Axe", rarity: "common", atk: 16, image: "gear/axe.png" },
        { id: "wpn_05", name: "Thief's Silver Dagger", rarity: "uncommon", atk: 25, image: "gear/dagger.png" },
        { id: "wpn_06", name: "Spiked Goblin Club", rarity: "uncommon", atk: 34, image: "gear/club.png" },
        { id: "wpn_07", name: "Swift Neon Katana", rarity: "epic", atk: 65, image: "gear/katana.png" },
        { id: "wpn_08", name: "Heavy Blood-Axe", rarity: "epic", atk: 85, image: "gear/bloodaxe.png" },
        { id: "wpn_09", name: "Blazing Sun-Sword", rarity: "legendary", atk: 120, image: "gear/fire_sword.png" }
    ];
}

if (typeof window.currentInventoryTab === 'undefined') window.currentInventoryTab = 'rots';
if (typeof window.currentInventorySort === 'undefined') window.currentInventorySort = 'newest';

// ==========================================
// 🛡️ MASTER CHARACTER RENDERING ENGINE
// ==========================================
window.getHunterDollHtml = function(scale = 1) {
    let eqWpn = null;
    if (window.gameWeapons && window.gameWeapons.length > 0) {
        eqWpn = window.gameWeapons.find(w => w.id === window.playerData?.equipped?.weapon) || window.gameWeapons[0];
    }

    return `
    <div style="position: relative; width: ${140 * scale}px; height: ${180 * scale}px; display: flex; justify-content: center; align-items: flex-end;">
        <img src="gear/base_body_sprite.png" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: left center; z-index: 1;" onerror="this.src='https://placehold.co/140x180/111/444.png?text=HUNTER'">
        ${eqWpn ? `<img id="playerWeaponSprite" src="${eqWpn.image}" style="position: absolute; left: ${70 * scale}px; bottom: ${40 * scale}px; height: ${90 * scale}px; width: ${45 * scale}px; object-fit: contain; transform-origin: bottom center; transform: rotate(20deg) scale(1.6); filter: drop-shadow(0 0 10px #ff0055); z-index: 5;" onerror="if(!this.dataset.retried){this.dataset.retried=true; this.src='gear/rusty.png';}else{this.style.display='none';}">` : ''}
    </div>
    `;
};

// ==========================================
// 🖼️ TOP RIGHT AVATAR UPDATER
// ==========================================
window.updateTopRightAvatar = function() {
    const widget = document.getElementById('playerProfileWidget');
    if (!widget) return;
    
    // Grab the empty circle (the very first element inside the widget)
    let circle = widget.firstElementChild;
    if (circle) {
        circle.style.overflow = 'hidden';
        circle.style.display = 'flex';
        circle.style.justifyContent = 'center';
        circle.style.alignItems = 'flex-start'; // Align top so the head shows perfectly
        
        // Inject the exact same doll logic, but scaled down to 30% size!
        circle.innerHTML = `<div style="transform: translateY(5px);">${window.getHunterDollHtml(0.3)}</div>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'none';

    setTimeout(() => {
        const widget = document.getElementById('playerProfileWidget');
        if (widget) {
            widget.style.pointerEvents = 'auto';
            widget.style.cursor = 'pointer';
            widget.onclick = () => {
                if (typeof closeGameMenu === 'function') closeGameMenu();
                window.openWardrobeModal();
            };
            
            // Inject the avatar into the top right circle as soon as the game loads
            if (typeof window.updateTopRightAvatar === 'function') window.updateTopRightAvatar();
        }
    }, 1000);
});

// ==========================================
// ⚔️ WEAPON VAULT 
// ==========================================
window.equipWeapon = function(weaponId) {
    if (!window.playerData.equipped) window.playerData.equipped = {};
    window.playerData.equipped.weapon = weaponId;
    if (typeof window.saveGameData === 'function') window.saveGameData();
    
    // Automatically update the top right circle the exact second a new weapon is equipped!
    if (typeof window.updateTopRightAvatar === 'function') window.updateTopRightAvatar();
    
    window.openWardrobeModal(); 
};

function getGearRarityColor(rarity) {
    switch ((rarity || '').toLowerCase()) {
        case 'secret': return '#ff00ea'; 
        case 'legendary': return '#ffaa00';
        case 'epic': return '#9900ff';      
        case 'rare': return '#00ccff'; 
        case 'uncommon': return '#00ff80';  
        default: return '#aaaaaa';         
    }
}

window.openWardrobeModal = function() {
    let modal = document.getElementById('wardrobeModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'wardrobeModal';
        document.body.appendChild(modal);
    }

    if (!window.gameWeapons || window.gameWeapons.length === 0) {
        modal.innerHTML = `<div style="color:red; text-align:center; padding:40px; background:#111; height:100vh;">CRITICAL ERROR: gear.js database is empty or missing!</div>`;
        modal.style.display = 'block';
        return;
    }

    const starterId = window.gameWeapons[0].id;

    if (!window.playerData) window.playerData = {};
    if (!window.playerData.gear) window.playerData.gear = [];
    if (!window.playerData.equipped || !window.playerData.equipped.weapon) {
        window.playerData.equipped = { weapon: starterId };
    }

    // Safely reconstruct gear ownership
    let saveText = JSON.stringify(window.playerData.gear);
    let validGear = [];
    window.gameWeapons.forEach(wpn => {
        if (saveText.includes(wpn.id) || wpn.id === starterId || window.playerData.equipped.weapon === wpn.id) {
            validGear.push(wpn.id);
        }
    });
    window.playerData.gear = [...new Set(validGear)];
    if (typeof window.saveGameData === 'function') window.saveGameData();

    // --- STRICT STATS CALCULATION ---
    let stats = { maxHp: 100, atk: 5, def: 0 };
    let pLevel = Number(window.playerData.accountLevel) || 1;
    stats.maxHp = 100 + (pLevel * 15);
    stats.def = pLevel * 2;

    let safeWpn = window.gameWeapons.find(w => w.id === window.playerData.equipped.weapon);
    if (safeWpn) {
        stats.atk = Number(safeWpn.atk || safeWpn.attack || safeWpn.damage || 5);
    }

    if (isNaN(stats.atk)) stats.atk = 5;
    if (isNaN(stats.maxHp)) stats.maxHp = 115;
    if (isNaN(stats.def)) stats.def = 2;

    const dollHtml = window.getHunterDollHtml(1.4);

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10,5,15,0.98); z-index: 9999999; display: flex; flex-direction: column;
        padding: 20px; box-sizing: border-box; font-family: monospace; color: #fff; overflow-y: auto;
    `;

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #00ff80; font-size: 1.5rem;">🛡️ HUNTER PROFILE</h2>
            <button onclick="document.getElementById('wardrobeModal').style.display='none'" style="background: #ff0055; border: 2px solid #fff; color: #fff; width: 35px; height: 35px; border-radius: 50%; font-weight: bold; cursor: pointer;">X</button>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border: 1px solid #333;">
            <div style="flex: 1; display: flex; justify-content: center; align-items: center; min-height: 200px; background: #000; border-radius: 8px; border: 1px inset #222; position: relative;">
                ${dollHtml}
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 12px;">
                <div style="font-size: 0.7rem; color: #aaa;">VITALITY (HP) <br><b style="font-size: 1.5rem; color: #00ff80;">${stats.maxHp}</b></div>
                <div style="font-size: 0.7rem; color: #aaa;">STRENGTH (ATK) <br><b style="font-size: 1.5rem; color: #ff0055;">${stats.atk}</b></div>
                <div style="font-size: 0.7rem; color: #aaa;">ARMOR (DEF) <br><b style="font-size: 1.5rem; color: #00ccff;">${stats.def}</b></div>
            </div>
        </div>

        <h3 style="color: #ff0055; font-size: 1rem; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 15px;">ARMORY COLLECTION</h3>
        
        <div id="armoryListContainer" style="width: 100%; max-width: 500px; margin: 0 auto; padding-bottom: 30px;"></div>
    `;
    modal.style.display = 'flex';

    // --- DIRECT DOM INJECTION ---
    const listContainer = document.getElementById('armoryListContainer');
    
    window.gameWeapons.forEach(wpn => {
        if (window.playerData.gear.includes(wpn.id)) {
            const isEquipped = window.playerData.equipped.weapon === wpn.id;
            const rarityColor = getGearRarityColor(wpn.rarity);
            
            const displayAtk = wpn.atk || wpn.attack || wpn.damage || 5; 
            
            let card = document.createElement('div');
            card.style.cssText = `background: #110a1c; border: 2px solid ${isEquipped ? '#00ff80' : '#333'}; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 15px; margin-bottom: 12px; box-shadow: ${isEquipped ? '0 0 20px rgba(0,255,128,0.2)' : 'none'}; transition: transform 0.1s;`;
            
            card.innerHTML = `
                <div style="width: 70px; height: 70px; background: #000; border-radius: 8px; border: 1px solid ${rarityColor}; display: flex; justify-content: center; align-items: center; overflow: hidden; flex-shrink: 0;">
                    <img src="${wpn.image}" style="height: 120%; object-fit: contain; filter: drop-shadow(0 0 5px ${rarityColor});" onerror="if(!this.dataset.retried){this.dataset.retried=true; this.src='gear/rusty.png';}else{this.src='https://placehold.co/70x70/222/ff0055.png?text=?';}">
                </div>
                <div style="flex-grow: 1; text-align: left;">
                    <div style="font-weight: bold; font-size: 1.1rem; color: #fff;">${wpn.name}</div>
                    <div style="font-size: 0.75rem; color: ${rarityColor}; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">${wpn.rarity}</div>
                    <div style="font-size: 0.9rem; color: #aaa;">ATK: <span style="color: #ff0055; font-weight: bold;">+${displayAtk}</span></div>
                </div>
                <button id="equipBtn_${wpn.id}" style="background: ${isEquipped ? '#00ff80' : 'transparent'}; color: ${isEquipped ? '#000' : '#00ff80'}; border: 2px solid #00ff80; padding: 12px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 1rem;">
                    ${isEquipped ? 'EQUIPPED' : 'EQUIP'}
                </button>
            `;
            
            listContainer.appendChild(card);

            document.getElementById(`equipBtn_${wpn.id}`).addEventListener('click', () => {
                equipWeapon(wpn.id);
            });
        }
    });
};

// ==========================================
// 📦 INVENTORY UI (ROTS & ITEMS)
// ==========================================
window.setInventorySort = function(sortType) { window.currentInventorySort = sortType; renderInventoryGrid(); };
window.switchInventoryTab = function(tabName) { window.currentInventoryTab = tabName; renderInventoryGrid(); };

window.openInventory = window.openInventoryModal = function() {
    let modal = document.getElementById('inventoryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inventoryModal';
        document.body.appendChild(modal);
    }
    modal.setAttribute('data-is-open', 'true');
    if(window.currentInventoryTab === 'gear') window.currentInventoryTab = 'rots'; 
    renderInventoryGrid();
};

window.closeInventory = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.style.display = 'none';
        modal.removeAttribute('data-is-open');
    }
};

function renderInventoryGrid() {
    let modal = document.getElementById('inventoryModal');
    if (!modal) return;

    const isModalOpen = modal.getAttribute('data-is-open') === 'true';
    if (!isModalOpen) {
        modal.style.display = 'none';
        return;
    }

    modal.style.cssText = `
        position: fixed !important; top: 0 !important; left: 0 !important; transform: none !important;
        width: 100vw !important; height: 100vh !important; max-width: none !important; max-height: none !important;
        border-radius: 0 !important; background: rgba(0,0,0,0.95) !important; z-index: 9999999 !important;
        display: flex !important; flex-direction: column !important; align-items: center !important; 
        padding: 20px !important; box-sizing: border-box !important; font-family: monospace !important; color: #fff !important;
    `;

    const currentSlots = (window.playerData.inventory || []).length;
    const maxSlots = window.playerData.maxInventorySlots || 100;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h2 style="margin: 0; color: #ffcc00; font-size: 1.4rem;">📦 VAULT</h2>
            <button onclick="closeInventory()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer;">X</button>
        </div>

        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 10px;">
            <button onclick="switchInventoryTab('rots')" style="flex: 1; background: ${window.currentInventoryTab === 'rots' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'rots' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: monospace;">🧠 ROTS (${currentSlots})</button>
            <button onclick="switchInventoryTab('items')" style="flex: 1; background: ${window.currentInventoryTab === 'items' ? '#00ccff' : '#222'}; color: ${window.currentInventoryTab === 'items' ? '#000' : '#fff'}; border: 2px solid #00ccff; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: monospace;">🧪 ITEMS</button>
        </div>

        ${window.currentInventoryTab === 'rots' ? `
        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 15px;">
            <button onclick="setInventorySort('power')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'power' ? '#00ff55' : '#222'}; color: ${window.currentInventorySort === 'power' ? '#000' : '#fff'}; border: 2px solid #00ff55; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">⚔️ POWER</button>
            <button onclick="setInventorySort('rarity')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'rarity' ? '#00ccff' : '#222'}; color: ${window.currentInventorySort === 'rarity' ? '#000' : '#fff'}; border: 2px solid #00ccff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">💎 RARITY</button>
            <button onclick="setInventorySort('newest')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'newest' ? '#ff0055' : '#222'}; color: ${window.currentInventorySort === 'newest' ? '#000' : '#fff'}; border: 2px solid #ff0055; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">⏳ NEWEST</button>
        </div>` : ''}

        <div id="inventoryGrid" style="width: 100%; max-width: 800px; max-height: calc(100vh - 220px); overflow-y: auto; padding: 5px;"></div>
    `;

    const inventoryGrid = document.getElementById('inventoryGrid');
    
    if (window.currentInventoryTab === 'rots') {
        inventoryGrid.style.display = 'grid';
        inventoryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
        inventoryGrid.style.gap = '12px';

        let inventory = window.playerData.inventory || [];
        if (inventory.length === 0) {
            inventoryGrid.innerHTML = `<p style="grid-column: 1 / -1; color: #777; text-align: center; padding: 40px;">Your vault is empty! Slay anomalies to bind them.</p>`;
            return;
        }

        let indexedInventory = inventory.map((rot, index) => ({ rot, originalIndex: index }));
        const rarityRank = { 'og': 6, 'secret': 5, 'epic': 3, 'rare': 2, 'uncommon': 1, 'common': 0 };

        if (window.currentInventorySort === 'power') {
            indexedInventory.sort((a, b) => {
                const statsA = typeof calculateRotStats === 'function' ? calculateRotStats(a.rot) : {maxHp:50, atk:10, def:10};
                const statsB = typeof calculateRotStats === 'function' ? calculateRotStats(b.rot) : {maxHp:50, atk:10, def:10};
                return (statsB.maxHp + statsB.atk + statsB.def) - (statsA.maxHp + statsA.atk + statsA.def);
            });
        } else if (window.currentInventorySort === 'rarity') {
            indexedInventory.sort((a, b) => (rarityRank[(b.rot.rarity || 'common').toLowerCase()] || 0) - (rarityRank[(a.rot.rarity || 'common').toLowerCase()] || 0));
        } else if (window.currentInventorySort === 'newest') {
            indexedInventory.reverse();
        }

        indexedInventory.forEach(item => {
            const rot = item.rot;
            const index = item.originalIndex;
            const isFainted = rot.fainted === true;
            const isInGym = rot.inGym === true;
            const isShiny = rot.shiny === true;
            const rarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(rot.rarity) : '#00ff55';
            const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : { maxHp: (rot.maxHp || 50), atk: (rot.atk || 10) };

            const card = document.createElement('div');
            card.style.cssText = `
                background: ${isInGym ? '#1a222a' : (isFainted ? '#2a1a1a' : (isShiny ? 'linear-gradient(180deg, #111, #00ffff33)' : `linear-gradient(180deg, #111, ${rarityColor}33)`))};
                border: 2px solid ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : (isShiny ? '#00ffff' : rarityColor))};
                border-radius: 12px; padding: 8px; text-align: center; box-shadow: ${isShiny ? '0 0 10px rgba(0,255,255,0.4)' : `0 0 10px ${rarityColor}44`};
                cursor: pointer; position: relative; opacity: ${isFainted ? '0.6' : '1'};
            `;
            card.setAttribute('onclick', `openCardDetails(${index})`);
            card.innerHTML = `
                ${isShiny ? '<div style="font-size:0.6rem; color:#00ffff; font-family:monospace; font-weight:bold; margin-bottom:2px;">💎 SHINY</div>' : ''}
                <div style="font-size: 0.75rem; font-weight: bold; color: ${rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${rot.name}</div>
                <div style="font-size: 0.65rem; color: #aaa; margin-bottom: 4px;">Lvl ${rot.level || 1} | ${(rot.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
                    <img src="${rot.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.8)) ${isFainted || isInGym ? 'grayscale(100%) ' : ''}${isShiny ? 'brightness(1.2) contrast(2)' : ''};" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">❤️ ${stats.maxHp} | ⚔️ ${stats.atk}</div>
                <div style="font-size: 0.6rem; color: ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : '#00ff00')}; margin-top: 2px;">
                    ${isInGym ? '🏰 [IN GYM]' : (isFainted ? '💀 FAINTED' : 'READY')}
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    } else {
        inventoryGrid.style.display = 'grid';
        inventoryGrid.style.gridTemplateColumns = '1fr';
        
        const revives = window.playerData.revivePotions || 0;
        const luckyEggs = window.playerData.luckyEggs || 0;

        let itemsHtml = '';

        if (revives > 0) {
            itemsHtml += `
            <div style="background: #222; border: 2px solid #00ffcc; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 2.2rem;">🧪</div>
                    <div style="text-align: left;"><div style="font-weight: bold; font-size: 1rem; color: #fff;">Revive Potion (x${revives})</div><div style="font-size: 0.75rem; color: #00ffcc;">Wakes up a fainted entity!</div></div>
                </div>
                <button onclick="useRevivePotionMenu()" style="background: #00ffcc; color: #000; border: none; padding: 10px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">USE</button>
            </div>`;
        }

        if (luckyEggs > 0) {
            itemsHtml += `
            <div style="background: #222; border: 2px solid #ff00ff; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 2.2rem;">🥚</div>
                    <div style="text-align: left;"><div style="font-weight: bold; font-size: 1rem; color: #fff;">Lucky Egg (x${luckyEggs})</div><div style="font-size: 0.75rem; color: #ff00ff;">Double Account XP for 1hr!</div></div>
                </div>
                <button onclick="useLuckyEgg()" style="background: #ff00ff; color: #000; border: none; padding: 10px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">USE</button>
            </div>`;
        }

        if (itemsHtml === '') {
            itemsHtml = `<p style="color: #777; text-align: center; padding: 40px; font-size: 1rem;">Your item bag is completely empty.</p>`;
        }

        inventoryGrid.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 500px; margin: 0 auto;">
                ${itemsHtml}
            </div>
        `;
    }
}

if (typeof window.openCardDetails === 'undefined') window.openCardDetails = function(index) { console.log("Card details missing."); };