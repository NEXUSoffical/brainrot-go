// battle.js - Full Card Battle Engine Logic with Proper Level Scaling

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
    window.maxWildHp = creature.maxHp || (50 + (wildLvl - 1) * 12);
    window.wildHp = window.maxWildHp;

    // Safety check for player data / active fighter using inventory (matching dex.js)
    if (typeof playerData === 'undefined') {
        window.playerData = { username: "Player", rotBalance: 500, inventory: [], activeFighterIndex: 0 };
    }
    if (!playerData.inventory || playerData.inventory.length === 0) {
        playerData.inventory = [{ name: "Skibidi", rarity: "common", image: "", level: 1, hp: 50, maxHp: 50 }];
        playerData.activeFighterIndex = 0;
    }

    const activeFighter = playerData.inventory[playerData.activeFighterIndex] || playerData.inventory[0] || { name: "Skibidi", rarity: "common", image: "", level: 1 };
    const fighterLvl = activeFighter.level || 1;
    window.maxPlayerHp = 50 + (fighterLvl * 15);
    window.playerHp = window.maxPlayerHp;

    // Set names and headers with levels
    document.getElementById('wildName').innerText = `${(creature.name || "Unknown").toUpperCase()} (Lvl ${wildLvl})`;
    document.getElementById('wildBadgeName').innerText = `${creature.name || "Unknown"} (Lvl ${wildLvl})`;
    document.getElementById('wildRarity').innerText = `RARITY: ${(creature.rarity || 'common').toUpperCase()}`;
    
    // Render Wild Card Graphic
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

    // Render Player Card Graphic
    updatePlayerFighterDisplay(activeFighter, fighterLvl);

    updateHpBars();
    const battleLog = document.getElementById('battleLog');
    if (battleLog) {
        battleLog.innerText = `A wild Level ${wildLvl} ${creature.name} appeared!`;
    }
};

// Helper to render active player fighter graphics & info
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
                    <img src="${activeFighter.image || ''}" style="width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; filter: brightness(1.2) contrast(3);" onerror="this.style.display='none';">
                </div>
                <span style="font-size: 9px; color: #fff; margin-top: 3px; font-family: monospace; font-weight: bold;">Lvl ${fighterLvl}</span>
            </div>
        `;
    }

    const fighterNameEl = document.getElementById('myFighterName');
    if (fighterNameEl) {
        fighterNameEl.innerText = `${activeFighter.name || 'Fighter'} (Lvl ${fighterLvl})`;
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

// Attack Button Action with Level-Based Balance & Animations
window.battleAttack = function() {
    if (window.wildHp <= 0) return;

    const playerCombatant = document.getElementById('playerCombatant');
    const wildCombatant = document.getElementById('wildCombatant');
    
    let activeFighter = null;
    if (typeof playerData !== 'undefined' && playerData.inventory && playerData.inventory.length > 0) {
        activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    }
    const fighterLvl = activeFighter ? (activeFighter.level || 1) : 1;
    const wildLvl = window.currentWildCreature ? (window.currentWildCreature.level || 1) : 1;

    if (playerCombatant) playerCombatant.classList.add('charge-attack');

    setTimeout(() => {
        if (playerCombatant) playerCombatant.classList.remove('charge-attack');
        
        if (wildCombatant) wildCombatant.classList.add('hit-knockback');

        let baseDamage = Math.floor(Math.random() * 15) + (5 + (fighterLvl * 3));
        const levelDiff = fighterLvl - wildLvl;
        
        if (levelDiff < 0) {
            const penaltyFactor = Math.max(0.05, 1 + (levelDiff * 0.08)); 
            baseDamage = Math.max(1, Math.floor(baseDamage * penaltyFactor));
        } else {
            baseDamage += levelDiff * 2;
        }

        const damage = baseDamage;
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
            
            if (activeFighter) {
                const levelGain = Math.max(1, Math.floor(wildLvl / 10));
                activeFighter.level = (activeFighter.level || 1) + levelGain;
                activeFighter.maxHp = 50 + (activeFighter.level - 1) * 15;
                activeFighter.hp = activeFighter.maxHp;

                playerData.rotBalance += (wildLvl * 10);
                if (typeof window.saveGameData === 'function') window.saveGameData();
                if (battleLog) battleLog.innerText = `Victory! ${activeFighter.name} leveled up to Lvl ${activeFighter.level}!`;
            } else {
                if (battleLog) battleLog.innerText = `Victory! Click 'Defeat to Unlock Vault' to catch it!`;
            }
            return;
        }

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.add('charge-attack');

            setTimeout(() => {
                if (wildCombatant) wildCombatant.classList.remove('charge-attack');
                if (playerCombatant) playerCombatant.classList.add('hit-knockback');

                let counterDamage = Math.floor(Math.random() * 10) + (5 + (wildLvl * 4));
                const reverseDiff = wildLvl - fighterLvl;
                if (reverseDiff > 0) {
                    counterDamage += reverseDiff * 3;
                }

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
                    if (battleLog) battleLog.innerText = `You got completely obliterated by the level gap! Fleeing...`;
                    setTimeout(closeBattle, 1500);
                }
            }, 300);
        }, 600);
    }, 300);
};

// Open a mini selection menu during battle to switch your active fighting rot
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
        gridHtml += `
            <div onclick="selectNewFighter(${index})" style="background: ${isCurrent ? '#1a3a1a' : '#222'}; border: 2px solid ${isCurrent ? '#00ff00' : '#555'}; border-radius: 8px; padding: 8px; cursor: pointer; text-align: center;">
                <img src="${rot.image || ''}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none';">
                <div style="font-size: 0.75rem; font-weight: bold; margin-top: 4px; color: #fff;">${rot.name}</div>
                <div style="font-size: 0.65rem; color: #00ff00;">Lvl ${rot.level || 1}</div>
                ${isCurrent ? '<div style="font-size: 0.55rem; color: #00ff00; font-weight: bold;">(ACTIVE)</div>' : ''}
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

// Switch the active player combatant and update battle stats
window.selectNewFighter = function(index) {
    if (typeof playerData === 'undefined' || !playerData.inventory || !playerData.inventory[index]) return;

    playerData.activeFighterIndex = index;
    const newRot = playerData.inventory[index];
    const fighterLvl = newRot.level || 1;

    window.maxPlayerHp = 50 + (fighterLvl * 15);
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

// Catch / Vault Button Action
window.battleCatch = function() {
    const battleLog = document.getElementById('battleLog');
    if (window.wildHp > 0) {
        if (battleLog) battleLog.innerText = `You must defeat it first!`;
        return;
    }

    if (window.currentWildCreature) {
        if (typeof window.addToDex === 'function') {
            window.addToDex(window.currentWildCreature);
        }

        // Instantly invoke spawner clean-up to wipe it from the map & array permanently
        if (typeof window.removeCapturedCreature === 'function') {
            window.removeCapturedCreature();
        } else {
            // Fallback safety if function isn't loaded yet
            if (window.currentWildCreature.marker) {
                window.currentWildCreature.marker.remove();
            }
            if (typeof window.activeCreatures !== 'undefined') {
                window.activeCreatures = window.activeCreatures.filter(c => c.data !== window.currentWildCreature);
            }
        }

        if (battleLog) battleLog.innerText = `Successfully captured Level ${window.currentWildCreature.level} ${window.currentWildCreature.name}!`;
        setTimeout(closeBattle, 1200);
    }
};

// Close Battle Modal
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