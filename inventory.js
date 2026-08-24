// inventory.js - Inventory Management, Sorting, Upgrades & Items

if (typeof window.currentInventoryTab === 'undefined') {
    window.currentInventoryTab = 'rots';
}
if (typeof window.currentInventorySort === 'undefined') {
    window.currentInventorySort = 'newest';
}

window.setInventorySort = function(sortType) {
    window.currentInventorySort = sortType;
    renderInventoryGrid();
};

// Fallback just in case the background card is clicked
if (typeof window.openCardDetails === 'undefined') {
    window.openCardDetails = function(index) {
        console.log("Card details coming soon for index:", index);
    };
}

// ==========================================
// 🗑️ CUSTOM NEON TRANSFER MODAL SYSTEM
// ==========================================
window.showTransferModal = function(index) {
    let inventory = window.playerData.inventory;
    if (!inventory || !inventory[index]) return;
    
    let rot = inventory[index];
    
    if (rot.inGym) {
        alert("❌ You cannot transfer an entity that is currently defending a Ritual Site!");
        return;
    }
    
    if (index === window.playerData.activeFighterIndex) {
        alert("❌ You cannot transfer your currently active fighter! Make another entity active first.");
        return;
    }

    // 🎨 CUSTOM "ARE YOU SURE" MODAL
    let confirmModal = document.getElementById('transferConfirmModal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'transferConfirmModal';
        document.body.appendChild(confirmModal);
    }
    
    const rarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(rot.rarity) : '#ff0055';

    confirmModal.style.cssText = `
        position: fixed !important;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.92);
        z-index: 999999999 !important; 
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    confirmModal.innerHTML = `
        <div style="background: #111; border: 3px solid #ff0055; border-radius: 12px; padding: 25px; width: 90%; max-width: 400px; text-align: center; color: #fff; font-family: monospace; box-shadow: 0 0 30px rgba(255, 0, 85, 0.4);">
            <h2 style="color: #ff0055; margin-top: 0; font-size: 1.4rem;">⚠️ CONFIRM TRANSFER</h2>
            <div style="margin: 15px 0; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <img src="${rot.image}" style="width: 90px; height: 90px; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.8));">
                <div style="font-weight: bold; color: ${rarityColor}; margin-top: 10px; font-size: 1.2rem;">${rot.name}</div>
                <div style="font-size: 0.8rem; color: #888;">Lvl ${rot.level || 1}</div>
            </div>
            <p style="color: #aaa; font-size: 0.95rem; margin-bottom: 8px;">Are you sure you want to release this back to the spirit realm?</p>
            <p style="color: #00ff55; font-weight: bold; font-size: 1rem; margin-bottom: 25px; margin-top: 0;">You will receive 1 Rot Currency.</p>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="executeTransfer(${index})" style="flex: 1; background: #ff0055; color: #fff; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-family: monospace; cursor: pointer; font-size: 1rem; box-shadow: 0 0 15px rgba(255,0,85,0.5);">YES, TRANSFER</button>
                <button onclick="document.getElementById('transferConfirmModal').style.display='none'" style="flex: 1; background: #333; color: #fff; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-family: monospace; cursor: pointer; font-size: 1rem;">CANCEL</button>
            </div>
        </div>
    `;
};

// This actually fires the deletion when they click "YES, TRANSFER"
window.executeTransfer = function(index) {
    document.getElementById('transferConfirmModal').style.display = 'none';

    let inventory = window.playerData.inventory;
    if (!inventory || !inventory[index]) return;

    // 1. Remove the rot
    window.playerData.inventory.splice(index, 1);
    
    // 2. Adjust active fighter index safely
    if (window.playerData.activeFighterIndex > index) {
        window.playerData.activeFighterIndex--;
    }
    
    // 3. Reward exactly 1 Rot currency
    window.playerData.rotBalance = (window.playerData.rotBalance || 0) + 1;
    
    // 4. 🔥 FORCE INSTANT UI REDRAW
    renderInventoryGrid();
    
    // 5. 🛡️ Run HUD updates and Cloud Saves in an isolated background thread 
    setTimeout(() => {
        try { if (typeof updateHUD === 'function') updateHUD(); } catch (e) {}
        try { if (typeof window.saveGameData === 'function') window.saveGameData(); } catch (e) {}
    }, 10);
};

window.setActiveFighter = function(index) {
    let rot = window.playerData.inventory[index];
    if (!rot) return;

    if (rot.fainted) {
        alert("❌ This entity has fainted! Use a Revive Potion first.");
        return;
    }
    if (rot.inGym) {
        alert("❌ This entity is currently bound to a Ritual Site!");
        return;
    }
    
    window.playerData.activeFighterIndex = index;
    
    // 🔥 INSTANT UI REDRAW
    renderInventoryGrid();
    
    // 🛡️ ISOLATED BACKGROUND SAVE
    setTimeout(() => {
        try { if (typeof updateHUD === 'function') updateHUD(); } catch (e) {}
        try { if (typeof window.saveGameData === 'function') window.saveGameData(); } catch (e) {}
    }, 10);
};

function renderInventoryGrid() {
    let inventoryGrid = document.getElementById('inventoryGrid');
    let modal = document.getElementById('inventoryModal');
    
    let isModalOpen = false;
    if (modal) {
        isModalOpen = (modal.style.display === 'flex' || modal.style.display === 'block');
    } else {
        modal = document.createElement('div');
        modal.id = 'inventoryModal';
        document.body.appendChild(modal);
    }

    modal.className = '';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        transform: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        background: rgba(0,0,0,0.95) !important;
        z-index: 9999999 !important;
        display: ${isModalOpen ? 'flex' : 'none'} !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    // 🔧 THE ULTIMATE AUTO-REPAIR SCRIPT (WITH ACCENT REMOVAL) 🔧
    if (window.playerData && window.playerData.inventory) {
        window.playerData.inventory.forEach(rot => {
            if (rot.name) {
                let cleanName = rot.name.trim();
                // Strip special accents so things like "Púca" become "Puca" perfectly matching the file!
                cleanName = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                // Ensure the first letter is always capitalized
                cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
                // Reconstruct the perfect file path
                rot.image = 'brainrots/' + cleanName + '.png';
            }
        });
    }

    const currentSlots = (window.playerData.inventory || []).length;
    const maxSlots = window.playerData.maxInventorySlots || 100;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
                <h2 style="margin: 0; color: #ffcc00; text-transform: uppercase; font-size: 1.4rem;">📦 INVENTORY (${currentSlots} / ${maxSlots})</h2>
            </div>
            <button onclick="closeInventory()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">X</button>
        </div>

        <div id="inventoryTabSwitcher" style="width: 100%; max-width: 800px; display: flex; gap: 10px; margin-bottom: 10px;">
            <button onclick="switchInventoryTab('rots')" id="btnTabRots" style="flex: 1; background: ${window.currentInventoryTab === 'rots' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'rots' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: monospace;">🧠 ROTS</button>
            <button onclick="switchInventoryTab('items')" id="btnTabItems" style="flex: 1; background: ${window.currentInventoryTab === 'items' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'items' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: monospace;">📦 ITEMS</button>
        </div>

        ${window.currentInventoryTab === 'rots' ? `
        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 15px;">
            <button onclick="setInventorySort('power')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'power' ? '#00ff55' : '#222'}; color: ${window.currentInventorySort === 'power' ? '#000' : '#fff'}; border: 2px solid #00ff55; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                ⚔️ POWER
            </button>
            <button onclick="setInventorySort('rarity')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'rarity' ? '#00ccff' : '#222'}; color: ${window.currentInventorySort === 'rarity' ? '#000' : '#fff'}; border: 2px solid #00ccff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                💎 RARITY
            </button>
            <button onclick="setInventorySort('newest')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'newest' ? '#ff0055' : '#222'}; color: ${window.currentInventorySort === 'newest' ? '#000' : '#fff'}; border: 2px solid #ff0055; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                ⏱️ NEWEST
            </button>
        </div>` : ''}

        <div id="inventoryGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 800px; max-height: calc(100vh - 220px); overflow-y: auto; padding: 5px;"></div>
    `;

    inventoryGrid = document.getElementById('inventoryGrid');
    if (!inventoryGrid) return;
    inventoryGrid.innerHTML = '';

    if (window.currentInventoryTab === 'rots') {
        let inventory = window.playerData.inventory || [];
        if (inventory.length === 0) {
            inventoryGrid.innerHTML = `<p style="grid-column: 1 / -1; color: #777; font-size: 0.9rem; padding: 40px; text-align: center;">Your inventory is empty! Catch entities on the map.</p>`;
            return;
        }

        let indexedInventory = inventory.map((rot, originalIndex) => ({
            rot: rot,
            originalIndex: originalIndex
        }));

        const rarityRank = { 'og': 6, 'secret': 5, 'mythic': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'uncommon': 1, 'common': 0 };

        if (window.currentInventorySort === 'power') {
            indexedInventory.sort((a, b) => {
                const statsA = typeof calculateRotStats === 'function' ? calculateRotStats(a.rot) : {maxHp:50, atk:10, def:10};
                const statsB = typeof calculateRotStats === 'function' ? calculateRotStats(b.rot) : {maxHp:50, atk:10, def:10};
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

        indexedInventory.forEach(item => {
            const rot = item.rot;
            const index = item.originalIndex;
            const isActive = window.playerData.activeFighterIndex === index;
            const isFainted = rot.fainted === true;
            const isInGym = rot.inGym === true;
            const isShiny = rot.shiny === true;
            const rarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(rot.rarity) : '#00ff55';
            const rotLevel = rot.level || 1;
            const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : { maxHp: (rot.maxHp || 50), atk: (rot.atk || 10), def: (rot.def || 10) };

            const card = document.createElement('div');
            card.style.cssText = `
                background: ${isInGym ? '#1a222a' : (isFainted ? '#2a1a1a' : (isShiny ? 'linear-gradient(180deg, #111, #00ffff33)' : (isActive ? '#1a3a1a' : `linear-gradient(180deg, #111, ${rarityColor}33)`)))};
                border: 2px solid ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : (isShiny ? '#00ffff' : (isActive ? '#00ff00' : rarityColor)))};
                border-radius: 12px;
                padding: 8px;
                text-align: center;
                box-shadow: ${isShiny ? '0 0 10px rgba(0,255,255,0.4)' : `0 0 10px ${rarityColor}44`};
                cursor: pointer;
                position: relative;
                opacity: ${isFainted ? '0.6' : '1'};
            `;
            
            card.setAttribute('onclick', `openCardDetails(${index})`);

            card.innerHTML = `
                ${isShiny ? '<div style="font-size:0.6rem; color:#00ffff; font-family:monospace; font-weight:bold; margin-bottom:2px;">💎 SHINY</div>' : ''}
                <div style="font-size: 0.75rem; font-weight: bold; color: ${rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${rot.name}</div>
                <div style="font-size: 0.65rem; color: #aaa; margin-bottom: 4px;">Lvl ${rotLevel} | ${(rot.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
                    <img src="${rot.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.8)) ${isFainted || isInGym ? 'grayscale(100%) ' : ''}${isShiny ? 'brightness(1.2) contrast(2)' : ''};" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">
                    ❤️ ${stats.maxHp} | ⚔️ ${stats.atk}
                </div>
                <div style="font-size: 0.6rem; color: ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : '#00ff00')}; margin-top: 2px;">
                    ${isInGym ? '🏟️ [IN GYM]' : (isFainted ? '💀 FAINTED' : 'READY')}
                </div>
                <div style="display: flex; gap: 4px; margin-top: 6px;">
                    ${!isActive && !isInGym && !isFainted ? `<button onclick="event.stopPropagation(); setActiveFighter(${index})" style="background: #00ff00; color: #000; border: none; padding: 4px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">ACTIVE</button>` : ''}
                    <button onclick="event.stopPropagation(); showTransferModal(${index})" style="background: #ff0055; color: #fff; border: none; padding: 4px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">TRANSFER</button>
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    } else {
        const revives = window.playerData.revivePotions || 0;
        const luckyEggs = window.playerData.luckyEggs || 0;

        inventoryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 500px; margin: 0 auto;">
                <div style="background: #222; border: 2px solid #00ffcc; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 2.2rem;">🧪</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 1rem; color: #fff;">Revive Potion (x${revives})</div>
                            <div style="font-size: 0.75rem; color: #00ffcc;">Wakes up a fainted rot!</div>
                        </div>
                    </div>
                    <button onclick="useRevivePotionMenu()" style="background: #00ffcc; color: #000; border: none; padding: 10px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">USE</button>
                </div>
                <div style="background: #222; border: 2px solid #ff00ff; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 2.2rem;">🥚</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 1rem; color: #fff;">Lucky Egg (x${luckyEggs})</div>
                            <div style="font-size: 0.75rem; color: #ff00ff;">Double Account XP for 1hr!</div>
                        </div>
                    </div>
                    <button onclick="useLuckyEgg()" style="background: #ff00ff; color: #000; border: none; padding: 10px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">USE</button>
                </div>
            </div>
        `;
    }
};

window.switchInventoryTab = function(tabName) {
    window.currentInventoryTab = tabName;
    renderInventoryGrid();
};

window.openInventory = window.openInventoryModal = function() {
    let modal = document.getElementById('inventoryModal');
    if (!modal) {
        renderInventoryGrid();
        modal = document.getElementById('inventoryModal');
    }
    if (modal) {
        modal.style.display = 'flex';
        renderInventoryGrid();
    }
};

window.closeInventory = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'none';
};