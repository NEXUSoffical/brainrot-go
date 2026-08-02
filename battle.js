// battle.js - Full Card Battle Engine Logic (Fixed Scope)

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
    window.wildHp = 100;
    window.maxWildHp = 100;

    // Safety check for player data / active fighter
    if (typeof playerData === 'undefined') {
        window.playerData = { username: "Player", rotBalance: 500, caught: [], activeFighterIndex: 0 };
    }
    if (!playerData.caught || playerData.caught.length === 0) {
        playerData.caught = [{ name: "Skibidi", rarity: "common", image: "", level: 1, hp: 50, maxHp: 50 }];
        playerData.activeFighterIndex = 0;
    }

    const activeFighter = playerData.caught[playerData.activeFighterIndex] || playerData.caught[0] || { name: "Skibidi", rarity: "common", image: "", level: 1 };
    const fighterLvl = activeFighter.level || 1;
    window.maxPlayerHp = 50 + (fighterLvl * 15);
    window.playerHp = window.maxPlayerHp;

    // Set names and headers
    document.getElementById('wildName').innerText = (creature.name || "Unknown").toUpperCase();
    document.getElementById('wildBadgeName').innerText = creature.name || "Unknown";
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
                <span style="font-size: 9px; color: #fff; margin-top: 3px; font-family: monospace; font-weight: bold;">Wild</span>
            </div>
        `;
    }

    // Render Player Card Graphic
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

    updateHpBars();
    const battleLog = document.getElementById('battleLog');
    if (battleLog) {
        battleLog.innerText = `A wild ${creature.name} appeared!`;
    }
};

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

// Attack Button Action with Animations
window.battleAttack = function() {
    if (window.wildHp <= 0) return;

    const playerCombatant = document.getElementById('playerCombatant');
    const wildCombatant = document.getElementById('wildCombatant');
    
    let activeFighter = null;
    if (typeof playerData !== 'undefined' && playerData.caught && playerData.caught.length > 0) {
        activeFighter = playerData.caught[playerData.activeFighterIndex || 0];
    }
    const fighterLvl = activeFighter ? (activeFighter.level || 1) : 1;

    if (playerCombatant) playerCombatant.classList.add('charge-attack');

    setTimeout(() => {
        if (playerCombatant) playerCombatant.classList.remove('charge-attack');
        
        if (wildCombatant) wildCombatant.classList.add('hit-knockback');

        const damage = Math.floor(Math.random() * 20) + (10 + (fighterLvl * 5));
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
                activeFighter.level = (activeFighter.level || 1) + 1;
                playerData.rotBalance += 50;
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

                const counterDamage = Math.floor(Math.random() * 10) + 5;
                window.playerHp -= counterDamage;
                updateHpBars();
                
                if (battleLog) battleLog.innerText = `${window.currentWildCreature ? window.currentWildCreature.name : 'Target'} counter-attacked for ${counterDamage} damage!`;

                setTimeout(() => {
                    if (playerCombatant) playerCombatant.classList.remove('hit-knockback');
                }, 300);

                if (window.playerHp <= 0) {
                    window.playerHp = 0;
                    updateHpBars();
                    if (battleLog) battleLog.innerText = `You got knocked out! Fleeing...`;
                    setTimeout(closeBattle, 1500);
                }
            }, 300);
        }, 600);
    }, 300);
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

        if (battleLog) battleLog.innerText = `Successfully captured ${window.currentWildCreature.name}!`;
        setTimeout(closeBattle, 1200);
    }
};

// Close Battle Modal
window.closeBattle = function() {
    const modal = document.getElementById('battleModal');
    if (modal) {
        modal.style.display = 'none';
    }
};