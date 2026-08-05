// teamSelect.js - 3-Rot Battle Party Selection System

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
        background: rgba(0,0,0,0.92) !important;
        z-index: 9999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
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
        // Remove from party
        window.selectedBattleParty = party.filter(i => i !== indexNum);
    } else {
        // Add to party if less than 3
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
                <div style="width: 90px; height: 110px; background: #111; border: 2px solid ${rarityColor}; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 5px; box-shadow: 0 0 10px ${rarityColor}66;">
                    <button onclick="toggleTeamMember(${invIndex})" style="position: absolute; top: -5px; right: -5px; background: #ff0055; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-weight: bold; cursor: pointer; font-size: 0.7rem;">X</button>
                    <img src="${rot.image || ''}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-bottom: 4px;" onerror="this.style.display='none';">
                    <div style="font-size: 0.65rem; font-weight: bold; color: ${rarityColor}; white-space: nowrap; overflow: hidden; max-width: 80px;">${rot.name}</div>
                    <div style="font-size: 0.55rem; color: #aaa;">Lvl ${rot.level || 1}</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div style="width: 90px; height: 110px; background: #1a1a1a; border: 2px dashed #444; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #555; font-size: 0.7rem; font-weight: bold;">
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
                border-radius: 10px;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: ${isFainted || isInGym ? 'not-allowed' : 'pointer'};
                opacity: ${isFainted || isInGym ? '0.4' : '1'};
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${rot.image || ''}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;" onerror="this.style.display='none';">
                    <div style="text-align: left;">
                        <div style="font-weight: bold; color: ${rarityColor}; font-size: 0.85rem;">${rot.name}</div>
                        <div style="font-size: 0.7rem; color: #aaa;">Lvl ${rot.level || 1} | ❤️ ${stats.maxHp} | ⚔️ ${stats.atk}</div>
                        ${isFainted ? '<div style="font-size: 0.65rem; color: #ff0055; font-weight: bold;">💀 FAINTED</div>' : (isInGym ? '<div style="font-size: 0.65rem; color: #00ccff; font-weight: bold;">🏰 IN GYM</div>' : '')}
                    </div>
                </div>
                <div style="font-weight: bold; font-size: 0.8rem; color: ${isSelected ? '#00ff55' : '#666'};">
                    ${isSelected ? '✅ SELECTED' : (isFainted || isInGym ? 'LOCKED' : 'SELECT')}
                </div>
            </div>
        `;
    });

    const canBattle = party.length === 3;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 600px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #00ff55; text-transform: uppercase; font-size: 1.3rem;">⚔️ SELECT BATTLE SQUAD (3 ROTS)</h2>
            <button onclick="closeTeamSelect()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">X</button>
        </div>

        <!-- BATTLE SLOTS DISPLAY -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 12px; border: 1px solid #333; width: 100%; max-width: 600px; justify-content: center; box-sizing: border-box;">
            ${slotsHtml}
        </div>

        <!-- INVENTORY SELECTION LIST -->
        <div style="width: 100%; max-width: 600px; max-height: calc(100vh - 340px); overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; padding-right: 5px; box-sizing: border-box;">
            ${inventoryListHtml}
        </div>

        <!-- ACTION BUTTON -->
        <div style="width: 100%; max-width: 600px;">
            <button onclick="${canBattle ? `launchBattleWithTeam()` : `alert('You must select exactly 3 healthy Rots to enter battle!')`}" style="
                width: 100%;
                padding: 14px;
                background: ${canBattle ? '#00ff55' : '#333'};
                color: ${canBattle ? '#000' : '#777'};
                border: none;
                border-radius: 10px;
                font-weight: bold;
                font-size: 1rem;
                cursor: ${canBattle ? 'pointer' : 'not-allowed'};
                font-family: monospace;
                box-shadow: ${canBattle ? '0 0 15px #00ff5566' : 'none'};
            ">
                ${canBattle ? '🚀 START 3v3 BATTLE!' : `SELECT ${3 - party.length} MORE ROT(S)`}
            </button>
        </div>
    `;
    modal.style.display = 'flex';
};

window.launchBattleWithTeam = function() {
    if (window.selectedBattleParty.length !== 3) {
        alert("You must select 3 fighters!");
        return;
    }
    
    // Package the 3 chosen rots into a combat roster
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
    
    // Proceed to battle scene creation
    if (typeof window.startBattleScene === 'function') {
        window.startBattleScene(window.currentBattleModeTarget);
    } else {
        alert("Squad locked in successfully! Ready to build the 3v3 battle engine next.");
    }
};