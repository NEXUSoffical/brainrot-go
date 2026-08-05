// battle.js - Full Card Battle Engine Logic with RPG Stats, Rarity Scaling, Faint & Audio FX

if (typeof window.currentWildCreature === 'undefined') {
    window.currentWildCreature = null;
    window.wildHp = 100;
    window.maxWildHp = 100;
    window.playerHp = 50;
    window.maxPlayerHp = 50;
}

// Initialize the battle when a creature is clicked
window.initBattle = function(creature) {
    window.currentWildCreature = creature;
    const wildLvl = creature.level || 1;
    
    const wildStats = typeof window.calculateRotStats === 'function' 
        ? window.calculateRotStats(creature) 
        : { maxHp: 50 + (wildLvl - 1) * 12, atk: 10, def: 10 };
        
    window.maxWildHp = wildStats.maxHp;
    window.wildHp = window.maxWildHp;

    if (typeof playerData === 'undefined') {
        window.playerData = { username: "Player", rotBalance: 500, inventory: [], activeFighterIndex: 0, revivePotions: 0, candies: {} };
    }
    if (!playerData.inventory || playerData.inventory.length === 0) {
        playerData.inventory = [{ name: "Skibidi", rarity: "common", image: "", level: 1, hp: 50, maxHp: 50, fainted: false }];
        playerData.activeFighterIndex = 0;
    }

    let activeFighter = playerData.inventory[playerData.activeFighterIndex] || playerData.inventory[0];
    if (activeFighter && activeFighter.fainted) {
        const healthyIndex = playerData.inventory.findIndex(r => !r.fainted);
        if (healthyIndex !== -1) {
            playerData.activeFighterIndex = healthyIndex;
            activeFighter = playerData.inventory[healthyIndex];
        }
    }

    const fighterLvl = activeFighter.level || 1;
    
    const pStats = typeof window.calculateRotStats === 'function' 
        ? window.calculateRotStats(activeFighter) 
        : { maxHp: 50 + (fighterLvl * 15), atk: 15, def: 10 };

    window.maxPlayerHp = pStats.maxHp;
    window.playerHp = activeFighter.fainted ? 0 : window.maxPlayerHp;

    document.getElementById('wildName').innerText = `${(creature.name || "Unknown").toUpperCase()} (Lvl ${wildLvl})`;
    document.getElementById('wildBadgeName').innerText = `${creature.name || "Unknown"} (Lvl ${wildLvl})`;
    document.getElementById('wildRarity').innerText = `RARITY: ${(creature.rarity || 'common').toUpperCase()}`;
    
    const wildRarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(creature.rarity) : '#ff0055';
    const wildCardContainer = document.getElementById('wildCardContainer');
    if (wildCardContainer) {
        wildCardContainer.innerHTML = `
            <div style="
                width: 85px; 
                background: linear-gradient(135deg, #111111, ${wildRarityColor}55); 
                border: 3px solid ${wildRarityColor}; 
                border-radius: 8px; 
                box-shadow: 0 0 15px ${wildRarityColor}; 
                padding: 4px; 
                display: flex; 
                flex-direction: column; 
                align-items: center;
            ">
                <div style="width: 100%; height: 70px; background-color: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #444;">
                    <img src="${creature.image || ''}" style="width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; filter: brightness(1.2) contrast(3);" onerror="this.style.display='none';">
                </div>
                <span style="font-size: 9px; color: #fff; margin-top: 3px; font-family: monospace; font-weight: bold;">Lvl ${wildLvl}</span>
            </div>
        `;
    }

    updatePlayerFighterDisplay(activeFighter, fighterLvl);
    updateHpBars();
    const battleLog = document.getElementById('battleLog');
    if (battleLog) {
        if (activeFighter.fainted) {
            battleLog.innerText = `⚠️ Your active fighter is FAINTED! Switch fighters or visit the Revive Station!`;
        } else {
            battleLog.innerText = `A wild Level ${wildLvl} ${creature.name} appeared!`;
        }
    }
};

// Helper to render active player fighter graphics
function updatePlayerFighterDisplay(activeFighter, fighterLvl) {
    const playerRarityColor = typeof window.getRarityColor === 'function' ? window.getRarityColor(activeFighter.rarity) : '#00ff00';
    const playerCardContainer = document.getElementById('playerCardContainer');
    
    if (playerCardContainer) {
        playerCardContainer.innerHTML = `
            <div style="
                width: 85px; 
                background: linear-gradient(135deg, #111111, ${playerRarityColor}55); 
                border: 3px solid ${playerRarityColor}; 
                border-radius: 8px; 
                box-shadow: 0 0 15px ${playerRarityColor}; 
                padding: 4px; 
                display: flex; 
                flex-direction: column; 
                align-items: center;
            ">
                <div style="width: 100%; height: 70px; background-color: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #444;">
                    <img src="${activeFighter.image || ''}" style="width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; filter: brightness(1.2) contrast(3); ${activeFighter.fainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
                </div>
                <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 3px;">
                    <span style="font-size: 9px; color: #fff; font-family: monospace; font-weight: bold;">Lvl ${fighterLvl}</span>
                </div>
            </div>
        `;
    }

    const fighterNameEl = document.getElementById('myFighterName');
    if (fighterNameEl) {
        fighterNameEl.innerText = `${activeFighter.name || 'Fighter'} (Lvl ${fighterLvl}) ${activeFighter.fainted ? '💀 [FAINTED]' : ''}`;
    }
}

// Update HP bars on screen
function updateHpBars() {
    const wildPercent = Math.max(0, (window.wildHp / window.maxWildHp) * 100);
    const playerPercent = Math.max(0, (window.playerHp / window.maxPlayerHp) * 100);

    const wildHpBar = document.getElementById('wildHpBar');
    if (wildHpBar) wildHpBar.style.width = wildPercent + '%';
    const wildHpText = document.getElementById('wildHpText');
    if (wildHpText) wildHpText.innerText = `${Math.ceil(window.wildHp)}/${window.maxWildHp} HP`;

    const myHpBar = document.getElementById('myHpBar');
    if (myHpBar) myHpBar.style.width = playerPercent + '%';
    const myHpText = document.getElementById('myHpText');
    if (myHpText) myHpText.innerText = `${Math.ceil(window.playerHp)}/${window.maxPlayerHp} HP`;
}

// Attack Button Action
window.battleAttack = function() {
    if (window.wildHp <= 0) return;

    let activeFighter = null;
    if (typeof playerData !== 'undefined' && playerData.inventory && playerData.inventory.length > 0) {
        activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    }

    if (activeFighter && activeFighter.fainted) {
        alert("❌ Your current fighter has fainted! Switch to a healthy rot or revive them first.");
        return;
    }

    const playerCombatant = document.getElementById('playerCombatant');
    const wildCombatant = document.getElementById('wildCombatant');
    
    const fighterLvl = activeFighter ? (activeFighter.level || 1) : 1;
    const wildLvl = window.currentWildCreature ? (window.currentWildCreature.level || 1) : 1;

    const pStats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(activeFighter) : {atk: 15, def: 10};
    const wStats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(window.currentWildCreature) : {atk: 10, def: 10};

    if (playerCombatant) playerCombatant.classList.add('charge-attack');

    setTimeout(() => {
        if (playerCombatant) playerCombatant.classList.remove('charge-attack');
        
        if (window.gameAudio && typeof window.gameAudio.playHit === 'function') {
            window.gameAudio.playHit();
        }

        if (wildCombatant) wildCombatant.classList.add('hit-knockback');

        let attackRoll = pStats.atk * (0.8 + (Math.random() * 0.4));
        let defenseRoll = wStats.def * (0.4 + (Math.random() * 0.2));
        let baseDamage = Math.floor(attackRoll - defenseRoll);

        const levelDiff = fighterLvl - wildLvl;
        if (levelDiff < 0) {
            baseDamage = Math.floor(baseDamage * Math.max(0.1, 1 + (levelDiff * 0.1)));
        }

        const damage = Math.max(1, baseDamage); 
        window.wildHp -= damage;
        updateHpBars();
        
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `You attacked and dealt ${damage} damage!`;

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('hit-knockback');
        }, 300);

        if (window.wildHp <= 0) {
            window.wildHp = 0;
            updateHpBars();
            
            // 🔥 XP SYSTEM REMOVED: Now it just tells them to catch it for the candy!
            if (battleLog) battleLog.innerText = `Victory! Click 'Defeat to Unlock Vault' to catch it and earn Candy!`;
            
            if (typeof window.saveGameData === 'function') window.saveGameData();
            return;
        }

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.add('charge-attack');

            setTimeout(() => {
                if (wildCombatant) wildCombatant.classList.remove('charge-attack');
                if (playerCombatant) playerCombatant.classList.add('hit-knockback');

                let enemyAttackRoll = wStats.atk * (0.8 + (Math.random() * 0.4));
                let playerDefenseRoll = pStats.def * (0.4 + (Math.random() * 0.2));
                let counterDamage = Math.floor(enemyAttackRoll - playerDefenseRoll);

                const reverseDiff = wildLvl - fighterLvl;
                if (reverseDiff > 0) {
                    counterDamage = Math.floor(counterDamage * (1 + (reverseDiff * 0.1)));
                }

                counterDamage = Math.max(1, counterDamage);
                window.playerHp -= counterDamage;
                updateHpBars();
                
                const wildName = window.currentWildCreature ? window.currentWildCreature.name : 'Target';
                if (battleLog) battleLog.innerText = `${wildName} counter-attacked savagely for ${counterDamage} damage!`;

                setTimeout(() => {
                    if (playerCombatant) playerCombatant.classList.remove('hit-knockback');
                }, 300);

                if (window.playerHp <= 0) {
                    window.playerHp = 0;
                    updateHpBars();

                    if (activeFighter) {
                        activeFighter.fainted = true;
                    }
                    if (typeof window.saveGameData === 'function') {
                        window.saveGameData();
                    }

                    if (battleLog) battleLog.innerText = `💀 Your fighter fainted! Fleeing battle...`;
                    setTimeout(closeBattle, 1500);
                }
            }, 300);
        }, 600);
    }, 300);
};

// Open a mini selection menu during battle
window.openBattleSwitch = function() {
    if (typeof playerData === 'undefined' || !playerData.inventory || playerData.inventory.length === 0) {
        alert("You don't have any other rots in your inventory!");
        return;
    }

    let switchModal = document.getElementById('battleSwitchModal');
    if (!switchModal) {
        switchModal = document.createElement('div');
        switchModal.id = 'battleSwitchModal';
        switchModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.9); z-index: 999999; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: monospace; color: #fff; padding: 20px;
        `;
        document.body.appendChild(switchModal);
    }

    let gridHtml = `
        <div style="background: #111; border: 3px solid #00ccff; border-radius: 15px; padding: 20px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 0 30px rgba(0,204,255,0.4);">
            <h3 style="color: #00ccff; margin-bottom: 10px;">CHOOSE YOUR FIGHTER</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 15px;">
    `;

    playerData.inventory.forEach((rot, index) => {
        const isCurrent = playerData.activeFighterIndex === index;
        const isFainted = rot.fainted === true;

        gridHtml += `
            <div onclick="selectNewFighter(${index})" style="background: ${isFainted ? '#2a1a1a' : (isCurrent ? '#1a3a1a' : '#222')}; border: 2px solid ${isFainted ? '#ff0055' : (isCurrent ? '#00ff00' : '#555')}; border-radius: 8px; padding: 8px; cursor: pointer; text-align: center; opacity: ${isFainted ? '0.6' : '1'};">
                <img src="${rot.image || ''}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; ${isFainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
                <div style="font-size: 0.75rem; font-weight: bold; margin-top: 4px; color: #fff;">${rot.name}</div>
                <div style="font-size: 0.65rem; color: ${isFainted ? '#ff0055' : '#00ff00'};">${isFainted ? '💀 FAINTED' : 'Lvl ' + (rot.level || 1)}</div>
                ${isCurrent ? '<div style="font-size: 0.55rem; color: #00ff00; font-weight: bold; margin-top: 2px;">(ACTIVE)</div>' : ''}
            </div>
        `;
    });

    gridHtml += `
            </div>
            <button class="btn-action" style="background: #ff0055; color: #fff;" onclick="document.getElementById('battleSwitchModal').style.display='none'">CANCEL</button>
        </div>
    `;

    switchModal.innerHTML = gridHtml;
    switchModal.style.display = 'flex';
};

window.selectNewFighter = function(index) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[index]) return;

    const newRot = playerData.inventory[index];
    if (newRot.fainted) {
        alert("❌ This rot has fainted! You must revive it at the Revive Station before using it in battle.");
        return;
    }

    playerData.activeFighterIndex = index;
    const fighterLvl = newRot.level || 1;

    const newStats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(newRot) : {maxHp: 50 + (fighterLvl * 15)};
    
    window.maxPlayerHp = newStats.maxHp;
    window.playerHp = window.maxPlayerHp; 

    updatePlayerFighterDisplay(newRot, fighterLvl);
    updateHpBars();

    if (typeof window.saveGameData === 'function') {
        window.saveGameData();
    }

    const switchModal = document.getElementById('battleSwitchModal');
    if (switchModal) switchModal.style.display = 'none';

    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = `Switched to ${newRot.name}!`;
};

// Catch / Vault Button Action - ANTI-CHEAT & CANDY DROP 🍬
window.battleCatch = function() {
    const battleLog = document.getElementById('battleLog');
    if (window.wildHp > 0) {
        if (battleLog) battleLog.innerText = `You must defeat it first!`;
        return;
    }

    if (window.currentWildCreature) {
        if (window.gameAudio && typeof window.gameAudio.playCatch === 'function') {
            window.gameAudio.playCatch();
        }

        const caughtName = window.currentWildCreature.name;
        const caughtLevel = window.currentWildCreature.level;
        
        // 🍬 THE UNIVERSAL CANDY KEY (Forces UPPERCASE and removes spaces)
        const candyKey = caughtName.toUpperCase().trim();

        // 🍬 THE CANDY DROP 🍬 (MUST happen before addToDex to prevent save overwriting!)
        if (typeof playerData !== 'undefined') {
            if (!playerData.candies) playerData.candies = {};
            playerData.candies[candyKey] = (playerData.candies[candyKey] || 0) + 3;
            if (typeof window.saveGameData === 'function') window.saveGameData();
        }

        // Add to Pokedex / Inventory
        if (typeof window.addToDex === 'function') {
            window.addToDex(window.currentWildCreature);
        }

        // 🛑 THE DOM NUKE (Destroys the Map Icon)
        const mapMarkers = document.querySelectorAll('.leaflet-marker-icon');
        for (let i = 0; i < mapMarkers.length; i++) {
            if (mapMarkers[i].classList.contains('enhanced-player-marker')) continue;
            if (window.currentWildCreature.image && mapMarkers[i].innerHTML.includes(window.currentWildCreature.image)) {
                mapMarkers[i].style.display = 'none'; 
                mapMarkers[i].remove(); 
                break; 
            }
        }

        // 🛑 POPUP NUKE
        if (typeof map !== 'undefined' && map && typeof map.closePopup === 'function') {
            map.closePopup();
        }
        const popups = document.querySelectorAll('.leaflet-popup');
        popups.forEach(popup => popup.remove());

        if (typeof window.activeCreatures !== 'undefined' && Array.isArray(window.activeCreatures)) {
            for (let i = window.activeCreatures.length - 1; i >= 0; i--) {
                let c = window.activeCreatures[i];
                if (c === window.currentWildCreature || c.data === window.currentWildCreature) {
                    window.activeCreatures.splice(i, 1); 
                }
            }
        }

        if (battleLog) battleLog.innerText = `Captured Lvl ${caughtLevel} ${caughtName}! (+3 Candy🍬)`;
        
        window.currentWildCreature = null;

        setTimeout(closeBattle, 1500);
    }
};

window.closeBattle = function() {
    const modal = document.getElementById('battleModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const switchModal = document.getElementById('battleSwitchModal');
    if (switchModal) {
        switchModal.style.display = 'none';
    }
};