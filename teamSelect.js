// teamSelect.js - 3-Rot Battle Party Selection System (Persistent Health & Signature Moves)

// ==========================================
// 🧙‍♂️ 50-ENTITY SIGNATURE MOVE DICTIONARY
// ==========================================
window.getEntitySignatureMove = function(name) {
    const cleanName = (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const moveBook = {
        "Goblin": { name: "Rusty Shank", type: "physical", icon: "🗡️" },
        "Kappa": { name: "Hydro Jet", type: "water", icon: "💧" },
        "Chupacabra": { name: "Bloodthirsty Bite", type: "beast", icon: "🩸" },
        "Kelpie": { name: "Drowning Surge", type: "water", icon: "🌊" },
        "Gremlin": { name: "System Sabotage", type: "chaos", icon: "⚙️" },
        "Imp": { name: "Hellfire Spark", type: "fire", icon: "🔥" },
        "Boggart": { name: "Nightmare Jumpscare", type: "dark", icon: "👁️" },
        "Puca": { name: "Faerie Trample", type: "forest", icon: "🌿" },
        "PÃºca": { name: "Faerie Trample", type: "forest", icon: "🌿" },
        "Satyr": { name: "Pan Flute Discord", type: "sonic", icon: "🎵" },
        "Jackalope": { name: "Horn Rush", type: "speed", icon: "⚡" },
        "Vampire": { name: "Crimson Life Drain", type: "dark", icon: "🩸" },
        "Werewolf": { name: "Lunar Claws", type: "slash", icon: "🐺" },
        "Wendigo": { name: "Permafrost Feast", type: "ice", icon: "❄️" },
        "Minotaur": { name: "Labyrinth Gore", type: "smash", icon: "🪓" },
        "Siren": { name: "Hypnotic Dirge", type: "water", icon: "🎶" },
        "Harpy": { name: "Tempest Talons", type: "wind", icon: "🌪️" },
        "Banshee": { name: "Death Wail", type: "sonic", icon: "💀" },
        "Chimaera": { name: "Tri-Flame Breath", type: "fire", icon: "🔥" },
        "Skinwalker": { name: "Shadow Stalker", type: "dark", icon: "🌑" },
        "Tengu": { name: "Gale Blade", type: "wind", icon: "⚔️" },
        "Griffin": { name: "Solar Divebomb", type: "sky", icon: "🦅" },
        "Manticore": { name: "Venom Spikes", type: "poison", icon: "🦂" },
        "Basilisk": { name: "Petrifying Glare", type: "stone", icon: "👁️" },
        "Cyclops": { name: "Titan Boulder", type: "earth", icon: "🪨" },
        "Rakshasa": { name: "Mirage Strike", type: "illusion", icon: "✨" },
        "Oni": { name: "Demon Club Smash", type: "heavy", icon: "👹" },
        "Thunderbird": { name: "Gigavolt Storm", type: "electric", icon: "⚡" },
        "Sphinx": { name: "Riddle of Doom", type: "psychic", icon: "🔮" },
        "Yeti": { name: "Avalanche Slam", type: "ice", icon: "❄️" },
        "Nuckelavee": { name: "Plague Torrent", type: "poison", icon: "☣️" },
        "Kraken": { name: "Tidal Abyss Crush", type: "water", icon: "🐙" },
        "Hydra": { name: "Nine-Headed Acid", type: "poison", icon: "🐉" },
        "Cerberus": { name: "Infernal Hell-Bite", type: "fire", icon: "🔥" },
        "Roc": { name: "Hurricane Buffet", type: "wind", icon: "🌪️" },
        "Tarasque": { name: "Spiked Shell Crush", type: "heavy", icon: "🛡️" },
        "Scylla": { name: "Strait Fang Barrage", type: "water", icon: "🌊" },
        "Charybdis": { name: "Abyssal Ingestion", type: "water", icon: "🌀" },
        "Qilin": { name: "Celestial Holy Fire", type: "holy", icon: "✨" },
        "Gashadokuro": { name: "Bone Guillotine", type: "dark", icon: "💀" },
        "Grootslang": { name: "Primordial Quake", type: "earth", icon: "💎" },
        "Typhon": { name: "Cataclysmic Supernova", type: "destruction", icon: "💥" },
        "Behemoth": { name: "Continental Tremor", type: "earth", icon: "🌋" },
        "Jormungandr": { name: "World-Strangling Coil", type: "water", icon: "🐍" },
        "JÃ¶rmungandr": { name: "World-Strangling Coil", type: "water", icon: "🐍" },
        "Cipactli": { name: "Primeval Chomp", type: "water", icon: "🐊" },
        "Tiamat": { name: "Chaos Salt Torrent", type: "dragon", icon: "🌊" },
        "Leviathan": { name: "Abyssal Boiling Breath", type: "water", icon: "🔥" },
        "Bakunawa": { name: "Eclipse Moon-Swallow", type: "dark", icon: "🌑" },
        "Vritra": { name: "Drought World-Burn", type: "fire", icon: "🔥" },
        "Apophis": { name: "Eternal Void Oblivion", type: "dark", icon: "🌌" },
        "Fenrir": { name: "Ragnarok World-Bite", type: "frost", icon: "🐺" }
    };
    return moveBook[cleanName] || moveBook[name] || { name: "Paranormal Strike", type: "normal", icon: "✨" };
};

if (typeof window.selectedBattleParty === 'undefined') {
    window.selectedBattleParty = []; 
}

window.openTeamSelect = function(mode = 'ai') {
    window.currentBattleModeTarget = mode; 
    window.selectedBattleParty = []; 

    let modal = document.getElementById('teamSelectModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'teamSelectModal';
        document.body.appendChild(modal);
    }

    modal.style.cssText = `
        position: fixed !important; top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.96) !important;
        z-index: 9999999 !important; display: flex !important; flex-direction: column !important;
        align-items: center !important; justify-content: flex-start !important;
        padding: 10px 10px 40px 10px !important; box-sizing: border-box !important;
        font-family: monospace !important; color: #fff !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important;
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
            alert("⚠️ You can only select a maximum of 3 entities for your battle squad!");
            return;
        }
        const rot = playerData.inventory[indexNum];
        if (rot.fainted || rot.currentHp <= 0) {
            alert("❌ Cannot select a fainted entity! Revive it first.");
            return;
        }
        if (rot.inGym) {
            alert("❌ This entity is currently defending a Ritual Site!");
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
                <div style="width: 70px; height: 80px; background: #111; border: 2px solid ${rarityColor}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 2px; box-shadow: 0 0 6px ${rarityColor}66; flex-shrink: 0;">
                    <button onclick="toggleTeamMember(${invIndex})" style="position: absolute; top: -4px; right: -4px; background: #ff0055; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-weight: bold; cursor: pointer; font-size: 0.6rem;">X</button>
                    <img src="${rot.image || ''}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; margin-bottom: 2px;" onerror="this.style.display='none';">
                    <div style="font-size: 0.45rem; font-weight: bold; color: ${rarityColor}; white-space: nowrap; overflow: hidden; max-width: 60px;">${rot.name}</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div style="width: 70px; height: 80px; background: #1a1a1a; border: 2px dashed #444; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #555; font-size: 0.5rem; font-weight: bold; flex-shrink: 0;">
                    SLOT ${i + 1}
                </div>
            `;
        }
    }

    let inventoryListHtml = '';
    playerData.inventory.forEach((rot, index) => {
        const isSelected = party.includes(index);
        const isFainted = rot.fainted === true || rot.currentHp <= 0;
        const isInGym = rot.inGym === true;
        const rarityColor = typeof getRarityColor === 'function' ? getRarityColor(rot.rarity) : '#00ff55';
        const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : {maxHp:50, atk:10, def:10};
        
        // 🔮 Show precise saved health
        const displayHp = typeof rot.currentHp !== 'undefined' ? Math.ceil(rot.currentHp) : stats.maxHp;
        const move = window.getEntitySignatureMove(rot.name);

        inventoryListHtml += `
            <div onclick="${isFainted || isInGym ? '' : `toggleTeamMember(${index})`}" style="
                background: ${isSelected ? '#1a3a1a' : '#111'};
                border: 2px solid ${isSelected ? '#00ff55' : (isFainted || isInGym ? '#333' : rarityColor)};
                border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between;
                cursor: ${isFainted || isInGym ? 'not-allowed' : 'pointer'}; opacity: ${isFainted || isInGym ? '0.4' : '1'};
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${rot.image || ''}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 6px;" onerror="this.style.display='none';">
                    <div style="text-align: left;">
                        <div style="font-weight: bold; color: ${rarityColor}; font-size: 0.8rem;">${rot.name}</div>
                        <div style="font-size: 0.65rem; color: ${displayHp <= (stats.maxHp*0.3) ? '#ff0055' : '#aaa'};">Lvl ${rot.level || 1} | ❤️ ${displayHp}/${stats.maxHp} HP | ⚔️ ${stats.atk}</div>
                        <div style="font-size: 0.6rem; color: #00ccff; margin-top: 2px;">${move.icon} ${move.name}</div>
                        ${isFainted ? '<div style="font-size: 0.55rem; color: #ff0055; font-weight: bold; margin-top: 2px;">💀 FAINTED (Needs Revive)</div>' : (isInGym ? '<div style="font-size: 0.55rem; color: #00ccff; font-weight: bold; margin-top: 2px;">🏰 IN GYM</div>' : '')}
                    </div>
                </div>
                <div style="font-weight: bold; font-size: 0.7rem; color: ${isSelected ? '#00ff55' : '#666'};">
                    ${isSelected ? '✅ SELECTED' : (isFainted || isInGym ? 'LOCKED' : 'SELECT')}
                </div>
            </div>
        `;
    });

    const canBattle = party.length === 3;
    const modeLabel = window.currentBattleModeTarget === 'pvp' ? '🌐 START ONLINE PVP' : '🚀 START 3v3 BATTLE!';

    const actionButtonHtml = `
        <button onclick="${canBattle ? `launchBattleWithTeam()` : `alert('You must select exactly 3 healthy entities to enter battle!')`}" style="
            width: 100%; padding: 14px; background: ${canBattle ? '#00ff55' : '#1f1f1f'}; color: ${canBattle ? '#000' : '#666'};
            border: 2px solid ${canBattle ? '#00ff55' : '#333'}; border-radius: 10px; font-weight: bold; font-size: 0.95rem;
            cursor: ${canBattle ? 'pointer' : 'not-allowed'}; font-family: monospace; box-shadow: ${canBattle ? '0 0 15px #00ff5588' : 'none'};
        ">
            ${canBattle ? modeLabel : `🔒 SELECT 3 ENTITIES TO UNLOCK BATTLE`}
        </button>
    `;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 500px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h2 style="margin: 0; color: #00ff55; text-transform: uppercase; font-size: 1rem;">⚔️ SELECT SQUAD (3)</h2>
            <button onclick="closeTeamSelect()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 30px; height: 30px; font-weight: bold; cursor: pointer; font-size: 0.9rem;">X</button>
        </div>
        <div style="width: 100%; max-width: 500px; margin-bottom: 8px;">${actionButtonHtml}</div>
        <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 8px; border: 1px solid #333; width: 100%; max-width: 500px; justify-content: center; box-sizing: border-box; margin-bottom: 10px;">
            ${slotsHtml}
        </div>
        <div style="width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box; margin-bottom: 15px;">
            ${inventoryListHtml}
        </div>
        <div style="width: 100%; max-width: 500px; padding-bottom: 20px;">${actionButtonHtml}</div>
    `;
    modal.style.display = 'flex';
};

window.launchBattleWithTeam = function() {
    if (window.selectedBattleParty.length !== 3) {
        alert("You must select 3 fighters!");
        return;
    }
    
    // 🔥 LOAD ACTUAL CURRENT HP INTO THE BATTLE
    window.playerBattleSquad = window.selectedBattleParty.map(index => {
        const rot = playerData.inventory[index];
        const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : {maxHp: 50, atk: 10, def: 10};
        const signatureMove = window.getEntitySignatureMove(rot.name);

        return {
            ...rot,
            maxHp: stats.maxHp,
            currentHp: typeof rot.currentHp !== 'undefined' ? rot.currentHp : stats.maxHp, // Persistent HP
            atk: stats.atk,
            def: stats.def,
            move: signatureMove,
            inventoryIndex: index // 🔑 MUST PASS THIS TO SAVE DAMAGE LATER
        };
    });

    closeTeamSelect();
    
    if (window.currentBattleModeTarget === 'pvp') {
        if (typeof window.startOnlineMatchmaking === 'function') window.startOnlineMatchmaking();
        else alert("⚠️ Online matchmaking script not loaded yet!");
    } else {
        if (typeof window.startBattleScene === 'function') window.startBattleScene('ai');
        else alert("⚠️ 3v3 Combat script is missing!");
    }
};