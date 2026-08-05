// battle3v3.js - 3v3 Squad Battle Engine (Offline AI Bot Mode)

if (typeof window.battleState === 'undefined') {
    window.battleState = null;
}

window.startBattleScene = function(mode = 'ai') {
    let squad = window.playerBattleSquad;
    if (!squad || squad.length !== 3) {
        alert("Battle squad not found! Please select 3 Rots first.");
        if (typeof openTeamSelect === 'function') openTeamSelect(mode);
        return;
    }

    // Generate Enemy AI Squad of 3 Rots based on player account level
    const playerLvl = playerData.accountLevel || 1;
    let enemySquad = [];

    if (typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length > 0) {
        for (let i = 0; i < 3; i++) {
            const randomChar = brainrotCharacters[Math.floor(Math.random() * brainrotCharacters.length)];
            const enemyLvl = Math.max(1, playerLvl + Math.floor(Math.random() * 3) - 1);
            const rarityGrowth = { 'common': 1.0, 'uncommon': 1.5, 'rare': 2.2, 'epic': 3.5, 'secret': 6.0, 'og': 8.5 };
            const mult = rarityGrowth[(randomChar.rarity || 'common').toLowerCase()] || 1.0;
            const baseHp = randomChar.baseHp || 50;
            const baseAtk = randomChar.baseAtk || 10;
            const maxHp = Math.floor(baseHp + (enemyLvl * 5 * mult));
            const atk = Math.floor(baseAtk + (enemyLvl * 2 * mult));

            enemySquad.push({
                name: randomChar.name + ` (Bot)`,
                image: randomChar.image,
                rarity: randomChar.rarity || 'common',
                level: enemyLvl,
                maxHp: maxHp,
                currentHp: maxHp,
                atk: atk
            });
        }
    }

    window.battleState = {
        mode: mode,
        playerSquad: squad,
        playerActiveIndex: 0,
        enemySquad: enemySquad,
        enemyActiveIndex: 0,
        isTurn: true,
        log: "Battle started! 3v3 Squad showdown initiated."
    };

    let modal = document.getElementById('battle3v3Modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battle3v3Modal';
        document.body.appendChild(modal);
    }

    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: radial-gradient(circle at center, #0f172a 0%, #030712 100%) !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    renderBattle3v3Scene();
};

window.renderBattle3v3Scene = function() {
    const modal = document.getElementById('battle3v3Modal');
    if (!modal || !window.battleState) return;

    const state = window.battleState;
    const activePlayerRot = state.playerSquad[state.playerActiveIndex];
    const activeEnemyRot = state.enemySquad[state.enemyActiveIndex];

    const playerHpPercent = Math.max(0, Math.min(100, (activePlayerRot.currentHp / activePlayerRot.maxHp) * 100));
    const enemyHpPercent = Math.max(0, Math.min(100, (activeEnemyRot.currentHp / activeEnemyRot.maxHp) * 100));

    // Remaining party indicators
    const playerPartyDots = state.playerSquad.map((r, i) => `
        <div style="width: 22px; height: 22px; border-radius: 50%; background: ${r.currentHp > 0 ? '#00ff55' : '#ff0055'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; color: #000;" title="${r.name}: ${r.currentHp}/${r.maxHp} HP">
            ${i + 1}
        </div>
    `).join('');

    const enemyPartyDots = state.enemySquad.map((r, i) => `
        <div style="width: 22px; height: 22px; border-radius: 50%; background: ${r.currentHp > 0 ? '#ff0055' : '#555'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; color: #fff;" title="Enemy ${i + 1}">
            ${i + 1}
        </div>
    `).join('');

    modal.innerHTML = `
        <!-- HEADER / PARTY STATUS -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 600px; margin: 0 auto;">
            <div style="text-align: left;">
                <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 3px;">ENEMY SQUAD</div>
                <div style="display: flex; gap: 5px;">${enemyPartyDots}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 3px;">YOUR SQUAD</div>
                <div style="display: flex; gap: 5px; justify-content: flex-end;">${playerPartyDots}</div>
            </div>
        </div>

        <!-- ARENA FIELD -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; align-items: center; max-width: 500px; width: 100%; margin: 0 auto;">
            
            <!-- ENEMY ROT CARD -->
            <div style="background: rgba(0,0,0,0.7); border: 2px solid #ff0055; border-radius: 15px; padding: 12px; width: 100%; max-width: 320px; display: flex; align-items: center; gap: 12px; box-shadow: 0 0 20px rgba(255,0,85,0.4);">
                <img src="${activeEnemyRot.image || ''}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ff0055;" onerror="this.style.display='none';">
                <div style="flex: 1; text-align: left;">
                    <div style="font-weight: bold; font-size: 0.85rem; color: #ff0055; white-space: nowrap; overflow: hidden; max-width: 200px;">${activeEnemyRot.name}</div>
                    <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 4px;">Lvl ${activeEnemyRot.level}</div>
                    <div style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${enemyHpPercent}%; height: 100%; background: #ff0055; transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 0.6rem; color: #aaa; text-align: right; margin-top: 2px;">${activeEnemyRot.currentHp} / ${activeEnemyRot.maxHp} HP</div>
                </div>
            </div>

            <!-- COMBAT LOG -->
            <div style="background: rgba(0,0,0,0.8); border: 1px dashed #00ff55; padding: 10px 15px; border-radius: 8px; width: 100%; max-width: 400px; text-align: center; font-size: 0.8rem; color: #00ff55; min-height: 40px; display: flex; align-items: center; justify-content: center;">
                ${state.log}
            </div>

            <!-- PLAYER ROT CARD -->
            <div style="background: rgba(0,0,0,0.7); border: 2px solid #00ff55; border-radius: 15px; padding: 12px; width: 100%; max-width: 320px; display: flex; align-items: center; gap: 12px; box-shadow: 0 0 20px rgba(0,255,3,0.4);">
                <img src="${activePlayerRot.image || ''}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #00ff55;" onerror="this.style.display='none';">
                <div style="flex: 1; text-align: left;">
                    <div style="font-weight: bold; font-size: 0.85rem; color: #00ff55; white-space: nowrap; overflow: hidden; max-width: 200px;">${activePlayerRot.name}</div>
                    <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 4px;">Lvl ${activePlayerRot.level || 1}</div>
                    <div style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #444;">
                        <div style="width: ${playerHpPercent}%; height: 100%; background: #00ff55; transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 0.6rem; color: #aaa; text-align: right; margin-top: 2px;">${activePlayerRot.currentHp} / ${activePlayerRot.maxHp} HP</div>
                </div>
            </div>

        </div>

        <!-- BATTLE CONTROLS -->
        <div style="width: 100%; max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px;">
            <button onclick="executePlayerAttack()" ${!state.isTurn ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${state.isTurn ? '#ff0055' : '#333'}; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: ${state.isTurn ? 'pointer' : 'not-allowed'}; font-family: monospace;">
                ⚔️ ATTACK
            </button>
            <button onclick="exitBattleScene()" style="width: 100%; padding: 10px; background: #222; color: #aaa; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">
                🏃 FLEE BATTLE
            </button>
        </div>
    `;
};

window.executePlayerAttack = function() {
    const state = window.battleState;
    if (!state || !state.isTurn) return;

    state.isTurn = false;
    const playerRot = state.playerSquad[state.playerActiveIndex];
    const enemyRot = state.enemySquad[state.enemyActiveIndex];

    // Deal damage to enemy
    const dmgToEnemy = Math.max(5, Math.floor(playerRot.atk * (0.8 + Math.random() * 0.4)));
    enemyRot.currentHp = Math.max(0, enemyRot.currentHp - dmgToEnemy);
    state.log = `${playerRot.name} dealt ${dmgToEnemy} damage to ${enemyRot.name}!`;
    renderBattle3v3Scene();

    // Check if enemy fainted
    if (enemyRot.currentHp <= 0) {
        setTimeout(() => {
            if (state.enemyActiveIndex < state.enemySquad.length - 1) {
                state.enemyActiveIndex++;
                state.log = `Enemy ${activeEnemyName(state)} fainted! Enemy sent out ${state.enemySquad[state.enemyActiveIndex].name}.`;
                state.isTurn = true;
                renderBattle3v3Scene();
            } else {
                // VICTORY!
                handleBattleVictory();
            }
        }, 1200);
        return;
    }

    // Enemy Counter-Attack after 1.2s
    setTimeout(() => {
        const dmgToPlayer = Math.max(3, Math.floor(enemyRot.atk * (0.8 + Math.random() * 0.4)));
        playerRot.currentHp = Math.max(0, playerRot.currentHp - dmgToPlayer);
        state.log = `${enemyRot.name} counter-attacked for ${dmgToPlayer} damage!`;
        renderBattle3v3Scene();

        // Check if player rot fainted
        if (playerRot.currentHp <= 0) {
            // Mark original inventory rot as fainted
            if (typeof playerData !== 'undefined' && playerData.inventory) {
                const invIdx = playerRot.inventoryIndex;
                if (playerData.inventory[invIdx]) playerData.inventory[invIdx].fainted = true;
            }

            setTimeout(() => {
                if (state.playerActiveIndex < state.playerSquad.length - 1 && hasHealthyRotsLeft(state.playerSquad)) {
                    // Find next healthy rot
                    let nextIdx = state.playerActiveIndex + 1;
                    while (nextIdx < state.playerSquad.length && state.playerSquad[nextIdx].currentHp <= 0) {
                        nextIdx++;
                    }
                    if (nextIdx < state.playerSquad.length) {
                        state.playerActiveIndex = nextIdx;
                        state.log = `${playerRot.name} fainted! Go ${state.playerSquad[state.playerActiveIndex].name}!`;
                        state.isTurn = true;
                        renderBattle3v3Scene();
                        return;
                    }
                }
                // DEFEAT!
                handleBattleDefeat();
            }, 1200);
        } else {
            state.isTurn = true;
            renderBattle3v3Scene();
        }
    }, 1200);
};

function hasHealthyRotsLeft(squad) {
    return squad.some(r => r.currentHp > 0);
}

function activeEnemyName(state) {
    return state.enemySquad[state.enemyActiveIndex].name;
}

window.handleBattleVictory = function() {
    const modal = document.getElementById('battle3v3Modal');
    if (!modal) return;

    // Rewards
    const coinReward = 150;
    const xpReward = 100;
    if (typeof playerData !== 'undefined') {
        playerData.rotBalance = (playerData.rotBalance || 500) + coinReward;
        if (typeof addAccountXp === 'function') addAccountXp(xpReward);
        if (typeof saveGameData === 'function') saveGameData();
    }

    modal.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <h1 style="color: #00ff55; font-size: 2.2rem; text-shadow: 0 0 20px #00ff55; margin-bottom: 10px;">🏆 VICTORY!</h1>
            <p style="font-size: 1rem; color: #fff; margin-bottom: 20px;">You defeated the opponent squad!</p>
            <div style="background: rgba(0,255,85,0.1); border: 2px solid #00ff55; padding: 15px 25px; border-radius: 12px; margin-bottom: 25px;">
                <div style="color: #ffcc00; font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">+${coinReward} Rot Coins 🪩</div>
                <div style="color: #00ccff; font-size: 1.1rem; font-weight: bold;">+${xpReward} Account XP ⭐</div>
            </div>
            <button onclick="exitBattleScene()" style="padding: 12px 30px; background: #00ff55; color: #000; border: none; border-radius: 10px; font-weight: bold; font-size: 1.1rem; cursor: pointer; font-family: monospace; box-shadow: 0 0 15px #00ff5588;">
                CLAIM REWARDS & RETURN
            </button>
        </div>
    `;
};

window.handleBattleDefeat = function() {
    const modal = document.getElementById('battle3v3Modal');
    if (!modal) return;

    modal.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <h1 style="color: #ff0055; font-size: 2.2rem; text-shadow: 0 0 20px #ff0055; margin-bottom: 10px;">💀 DEFEAT</h1>
            <p style="font-size: 1rem; color: #aaa; margin-bottom: 25px;">All 3 of your squad members fainted in battle.</p>
            <button onclick="exitBattleScene()" style="padding: 12px 30px; background: #ff0055; color: #fff; border: none; border-radius: 10px; font-weight: bold; font-size: 1.1rem; cursor: pointer; font-family: monospace;">
                RETURN TO MAP
            </button>
        </div>
    `;
};

window.exitBattleScene = function() {
    const modal = document.getElementById('battle3v3Modal');
    if (modal) modal.remove();
    window.battleState = null;
    if (typeof updateHUD === 'function') updateHUD();
};