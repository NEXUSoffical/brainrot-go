// teamSelect.js - 3-Rot Battle Party Selection System (Absolute Viewport Fit Fix)

if (typeof window.selectedBattleParty === 'undefined') {
    window.selectedBattleParty = []; // Stores inventory indices of the 3 chosen rots
}

window.openTeamSelect = function(mode = 'ai') {
    window.currentBattleModeTarget = mode; // 'ai' or 'pvp'
    window.selectedBattleParty = []; // Reset party

    let modal = document.getElementById('teamSelectModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'teamSelectModal';
        document.body.appendChild(modal);
    }

    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0,0,0,0.96) !important;
        z-index: 9999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding: 8px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
        overflow: hidden !important;
    `;

    renderTeamSelectModal();
};

window.closeTeamSelect = function() {
    const modal = document.getElementById('teamSelectModal');
    if (modal) modal.style.display = 'none';
};

window.toggleTeamMember = function(index) {
    const indexNum = parseInt(index);
    const party = window.selectedBattleParty;
    
    if (party.includes(indexNum)) {
        window.selectedBattleParty = party.filter(i => i !== indexNum);
    } else {
        if (party.length >= 3) {
            alert("⚠️ You can only select a maximum of 3 Rots for your battle squad!");
            return;
        }
        const rot = playerData.inventory[indexNum];
        if (rot.fainted) {
            alert("❌ Cannot select a fainted Rot! Revive it first.");
            return;
        }
        if (rot.inGym) {
            alert("❌ This Rot is currently defending a Gym!");
            return;
        }
        party.push(indexNum);
    }
    renderTeamSelectModal();
};

window.renderTeamSelectModal = function() {
    const modal = document.getElementById('teamSelectModal');
    if (!modal) return;

    if (typeof playerData === 'undefined' || !playerData.inventory) {
        playerData = { inventory: [] };
    }

    const party = window.selectedBattleParty;

    let slotsHtml = '';
    for (let i = 0; i < 3; i++) {
        const invIndex = party[i];
        if (typeof invIndex !== 'undefined' && playerData.inventory[invIndex]) {
            const rot = playerData.inventory[invIndex];
            const rarityColor = typeof getRarityColor === 'function' ? getRarityColor(rot.rarity) : '#00ff55';
            slotsHtml += `
                <div style="width: 65px; height: 75px; background: #111; border: 2px solid ${rarityColor}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 2px; box-shadow: 0 0 6px ${rarityColor}66;">
                    <button onclick="toggleTeamMember(${invIndex})" style="position: absolute; top: -3px; right: -3px; background: #ff0055; color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; font-weight: bold; cursor: pointer; font-size: 0.55rem;">X</button>
                    <img src="${rot.image || ''}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px; margin-bottom: 2px;" onerror="this.style.display='none';">
                    <div style="font-size: 0.45rem; font-weight: bold; color: ${rarityColor}; white-space: nowrap; overflow: hidden; max-width: 55px;">${rot.name}</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div style="width: 65px; height: 75px; background: #1a1a1a; border: 2px dashed #444; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #555; font-size: 0.5rem; font-weight: bold;">
                    SLOT ${i + 1}
                </div>
            `;
        }
    }

    let inventoryListHtml = '';
    playerData.inventory.forEach((rot, index) => {
        const isSelected = party.includes(index);
        const isFainted = rot.fainted === true;
        const isInGym = rot.inGym === true;
        const rarityColor = typeof getRarityColor === 'function' ? getRarityColor(rot.rarity) : '#00ff55';
        const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : {maxHp:50, atk:10, def:10};

        inventoryListHtml += `
            <div onclick="${isFainted || isInGym ? '' : `toggleTeamMember(${index})`}" style="
                background: ${isSelected ? '#1a3a1a' : '#111'};
                border: 2px solid ${isSelected ? '#00ff55' : (isFainted || isInGym ? '#333' : rarityColor)};
                border-radius: 8px;
                padding: 6px 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: ${isFainted || isInGym ? 'not-allowed' : 'pointer'};
                opacity: ${isFainted || isInGym ? '0.4' : '1'};
                min-height: 44px;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${rot.image || ''}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none';">
                    <div style="text-align: left;">
                        <div style="font-weight: bold; color: ${rarityColor}; font-size: 0.75rem;">${rot.name}</div>
                        <div style="font-size: 0.6rem; color: #aaa;">Lvl ${rot.level || 1} | ❤️ ${stats.maxHp} | ⚔️ ${stats.atk}</div>
                        ${isFainted ? '<div style="font-size: 0.5rem; color: #ff0055; font-weight: bold;">💀 FAINTED</div>' : (isInGym ? '<div style="font-size: 0.5rem; color: #00ccff; font-weight: bold;">🏰 IN GYM</div>' : '')}
                    </div>
                </div>
                <div style="font-weight: bold; font-size: 0.65rem; color: ${isSelected ? '#00ff55' : '#666'};">
                    ${isSelected ? '✅ SELECTED' : (isFainted || isInGym ? 'LOCKED' : 'SELECT')}
                </div>
            </div>
        `;
    });

    const canBattle = party.length === 3;
    const modeLabel = window.currentBattleModeTarget === 'pvp' ? '🌐 START ONLINE PVP' : '🚀 START 3v3 BATTLE!';

    modal.innerHTML = `
        <!-- HEADER -->
        <div style="width: 100%; max-width: 500px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h2 style="margin: 0; color: #00ff55; text-transform: uppercase; font-size: 0.95rem;">⚔️ SELECT SQUAD (3 ROTS)</h2>
            <button onclick="closeTeamSelect()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 26px; height: 26px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">X</button>
        </div>

        <!-- ACTION BUTTON (PINNED AT THE TOP FOR IMMEDIATE PHONE ACCESS) -->
        <div style="width: 100%; max-width: 500px; margin-bottom: 6px;">
            <button onclick="${canBattle ? `launchBattleWithTeam()` : `alert('You must select exactly 3 healthy Rots to enter battle!')`}" style="
                width: 100%;
                padding: 10px;
                background: ${canBattle ? '#00ff55' : '#1f1f1f'};
                color: ${canBattle ? '#000' : '#666'};
                border: 2px solid ${canBattle ? '#00ff55' : '#333'};
                border-radius: 8px;
                font-weight: bold;
                font-size: 0.85rem;
                cursor: ${canBattle ? 'pointer' : 'not-allowed'};
                font-family: monospace;
                box-shadow: ${canBattle ? '0 0 12px #00ff5566' : 'none'};
            ">
                ${canBattle ? modeLabel : `🔒 SELECT 3 ROTS TO UNLOCK BATTLE`}
            </button>
        </div>

        <!-- BATTLE SLOTS DISPLAY -->
        <div style="display: flex; gap: 6px; background: rgba(0,0,0,0.5); padding: 6px; border-radius: 8px; border: 1px solid #333; width: 100%; max-width: 500px; justify-content: center; box-sizing: border-box; margin-bottom: 6px;">
            ${slotsHtml}
        </div>

        <!-- INVENTORY SELECTION LIST (SCROLLABLE AREA) -->
        <div style="width: 100%; max-width: 500px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; padding-right: 4px; box-sizing: border-box;">
            ${inventoryListHtml}
        </div>
    `;
    modal.style.display = 'flex';
};

window.launchBattleWithTeam = function() {
    if (window.selectedBattleParty.length !== 3) {
        alert("You must select 3 fighters!");
        return;
    }
    
    window.playerBattleSquad = window.selectedBattleParty.map(index => {
        const rot = playerData.inventory[index];
        const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : {maxHp: 50, atk: 10, def: 10};
        return {
            ...rot,
            maxHp: stats.maxHp,
            currentHp: stats.maxHp,
            atk: stats.atk,
            def: stats.def,
            inventoryIndex: index
        };
    });

    closeTeamSelect();
    
    if (window.currentBattleModeTarget === 'pvp') {
        if (typeof window.startOnlineMatchmaking === 'function') {
            window.startOnlineMatchmaking();
        } else {
            alert("⚠️ Online matchmaking script not loaded yet!");
        }
    } else {
        if (typeof window.startBattleScene === 'function') {
            window.startBattleScene('ai');
        } else {
            alert("Squad locked in successfully!");
        }
    }
};