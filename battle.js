// battle.js - Full Battle Engine Logic with Animations

let currentWildCreature = null;
let wildHp = 100;
let maxWildHp = 100;
let playerHp = 50;
let maxPlayerHp = 50;

// Initialize the battle when a creature is clicked
window.initBattle = function(creature) {
    currentWildCreature = creature;
    wildHp = 100;
    maxWildHp = 100;
    playerHp = 50;
    maxPlayerHp = 50;

    // Set names and headers
    document.getElementById('wildName').innerText = creature.name.toUpperCase();
    document.getElementById('wildBadgeName').innerText = creature.name;
    document.getElementById('wildRarity').innerText = `RARITY: ${creature.rarity.toUpperCase()}`;
    
    // Set wild sprite image if available
    const wildSprite = document.getElementById('wildSprite');
    if (creature.image) {
        wildSprite.innerHTML = `<img src="${creature.image}" style="width: 80px; height: 80px; object-fit: contain;">`;
    } else {
        wildSprite.innerHTML = '🦈';
    }

    updateHpBars();
    document.getElementById('battleLog').innerText = `A wild ${creature.name} appeared!`;
};

// Update HP bars on screen
function updateHpBars() {
    const wildPercent = Math.max(0, (wildHp / maxWildHp) * 100);
    const playerPercent = Math.max(0, (playerHp / maxPlayerHp) * 100);

    document.getElementById('wildHpBar').style.width = wildPercent + '%';
    document.getElementById('wildHpText').innerText = `${Math.ceil(wildHp)}/${maxWildHp} HP`;

    document.getElementById('myHpBar').style.width = playerPercent + '%';
    document.getElementById('myHpText').innerText = `${Math.ceil(playerHp)}/${maxPlayerHp} HP`;
}

// Attack Button Action with Animations
window.battleAttack = function() {
    if (wildHp <= 0) return;

    const playerCombatant = document.getElementById('playerCombatant');
    const wildCombatant = document.getElementById('wildCombatant');

    // 1. Player charges forward
    if (playerCombatant) playerCombatant.classList.add('charge-attack');

    setTimeout(() => {
        if (playerCombatant) playerCombatant.classList.remove('charge-attack');
        
        // 2. Wild creature gets hit and knockback flash
        if (wildCombatant) wildCombatant.classList.add('hit-knockback');

        const damage = Math.floor(Math.random() * 20) + 15;
        wildHp -= damage;
        updateHpBars();
        document.getElementById('battleLog').innerText = `You attacked and dealt ${damage} damage!`;

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('hit-knockback');
        }, 300);

        if (wildHp <= 0) {
            wildHp = 0;
            updateHpBars();
            document.getElementById('battleLog').innerText = `Victory! Click 'Defeat to Unlock Vault' to catch it!`;
            return;
        }

        // 3. Wild creature counter-attack after delay
        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.add('charge-attack');

            setTimeout(() => {
                if (wildCombatant) wildCombatant.classList.remove('charge-attack');
                if (playerCombatant) playerCombatant.classList.add('hit-knockback');

                const counterDamage = Math.floor(Math.random() * 10) + 5;
                playerHp -= counterDamage;
                updateHpBars();
                document.getElementById('battleLog').innerText = `${currentWildCreature.name} counter-attacked for ${counterDamage} damage!`;

                setTimeout(() => {
                    if (playerCombatant) playerCombatant.classList.remove('hit-knockback');
                }, 300);

                if (playerHp <= 0) {
                    playerHp = 0;
                    updateHpBars();
                    document.getElementById('battleLog').innerText = `You got knocked out! Fleeing...`;
                    setTimeout(closeBattle, 1500);
                }
            }, 300);
        }, 600);
    }, 300);
};

// Catch / Vault Button Action
window.battleCatch = function() {
    if (wildHp > 0) {
        document.getElementById('battleLog').innerText = `You must defeat it first!`;
        return;
    }

    if (currentWildCreature) {
        if (typeof window.addToDex === 'function') {
            window.addToDex(currentWildCreature);
        }

        document.getElementById('battleLog').innerText = `Successfully captured ${currentWildCreature.name}!`;
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