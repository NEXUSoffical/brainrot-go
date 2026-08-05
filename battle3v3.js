// battle3v3.js - Cinematic 3v3 Battle Engine with Pacing, Critical Hits & Ultimate Moves

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

    const validBotChars = (typeof brainrotCharacters !== 'undefined') 
        ? brainrotCharacters.filter(c => c.image && c.image.trim() !== '' && c.name.toLowerCase() !== 'skibidi toilet')
        : [];

    if (validBotChars.length === 0) {
        alert("Error: No valid battle opponents found in database.");
        return;
    }

    const playerLvl = playerData.accountLevel || 1;
    let enemySquad = [];

    for (let i = 0; i < 3; i++) {
        const randomChar = validBotChars[Math.floor(Math.random() * validBotChars.length)];
        const enemyLvl = Math.max(1, playerLvl + 2 + Math.floor(Math.random() * 4)); 
        const rarityGrowth = { 'common': 1.2, 'uncommon': 1.8, 'rare': 2.6, 'epic': 4.0, 'secret': 7.0, 'og': 10.0 };
        const mult = rarityGrowth[(randomChar.rarity || 'common').toLowerCase()] || 1.2;
        const baseHp = randomChar.baseHp || 60;
        const baseAtk = randomChar.baseAtk || 15;
        const maxHp = Math.floor(baseHp + (enemyLvl * 8 * mult));
        const atk = Math.floor(baseAtk + (enemyLvl * 3 * mult));

        enemySquad.push({
            name: randomChar.name,
            image: randomChar.image,
            rarity: randomChar.rarity || 'common',
            level: enemyLvl,
            maxHp: maxHp,
            currentHp: maxHp,
            atk: atk,
            animClass: ''
        });
    }

    squad.forEach(rot => {
        rot.animClass = '';
        rot.ultimateCooldown = 0; // Cooldown tracker for Ultimate Move
    });

    window.battleState = {
        mode: mode,
        playerSquad: squad,
        playerActiveIndex: 0,
        enemySquad: enemySquad,
        enemyActiveIndex: 0,
        isTurn: true,
        log: "⚔️ Cinematic 3v3 Showdown Engaged!"
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
        background: #05020a !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        padding: 15px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
        overflow: hidden !important;
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

    const enemyRarityColor = typeof getRarityColor === 'function' ? getRarityColor(activeEnemyRot.rarity) : '#ff0055';
    const playerRarityColor = typeof getRarityColor === 'function' ? getRarityColor(activePlayerRot.rarity) : '#00ff55';

    const playerPartyDots = state.playerSquad.map((r, i) => `
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${r.currentHp > 0 ? '#00ff55' : '#ff0055'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; color: #000; box-shadow: 0 0 10px ${r.currentHp > 0 ? '#00ff55' : '#ff0055'};">
            ${i + 1}
        </div>
    `).join('');

    const enemyPartyDots = state.enemySquad.map((r, i) => `
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${r.currentHp > 0 ? '#ff0055' : '#444'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; color: #fff; box-shadow: 0 0 10px ${r.currentHp > 0 ? '#ff0055' : 'transparent'};">
            ${i + 1}
        </div>
    `).join('');

    const ultimateReady = (activePlayerRot.ultimateCooldown || 0) === 0;

    modal.innerHTML = `
        <style>
            @keyframes lungePlayer {
                0% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-70px) scale(1.12); }
                100% { transform: translateY(0) scale(1); }
            }
            @keyframes lungeEnemy {
                0% { transform: translateY(0) scale(0.85); }
                50% { transform: translateY(70px) scale(0.95); }
                100% { transform: translateY(0) scale(0.85); }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-10px); filter: brightness(2.5) drop-shadow(0 0 20px #ff0000); }
                40% { transform: translateX(10px); filter: brightness(2.5) drop-shadow(0 0 20px #ff0000); }
                60% { transform: translateX(-6px); }
                80% { transform: translateX(6px); }
            }
            @keyframes gridPulse {
                0% { background-position: 0 0; }
                100% { background-position: 0 50px; }
            }
            @keyframes orbFloat {
                0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
                50% { transform: translateY(-20px) scale(1.1); opacity: 0.9; }
            }
            .anim-lunge-player { animation: lungePlayer 0.5s ease-in-out; }
            .anim-lunge-enemy { animation: lungeEnemy 0.5s ease-in-out; }
            .anim-shake { animation: shake 0.5s ease-in-out; }
        </style>

        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #090314 0%, #1a0b36 50%, #05020a 100%); z-index: 1;"></div>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 0, 127, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 200, 0.1) 1px, transparent 1px); background-size: 40px 40px; animation: gridPulse 4s linear infinite; z-index: 2; pointer-events: none;"></div>

        <div style="position: absolute; top: 15%; left: 10%; width: 180px; height: 180px; background: radial-gradient(circle, rgba(255,0,127,0.3) 0%, transparent 70%); border-radius: 50%; animation: orbFloat 6s ease-in-out infinite; z-index: 2; pointer-events: none;"></div>
        <div style="position: absolute; bottom: 10%; right: 10%; width: 220px; height: 220px; background: radial-gradient(circle, rgba(0,255,200,0.25) 0%, transparent 70%); border-radius: 50%; animation: orbFloat 8s ease-in-out infinite reverse; z-index: 2; pointer-events: none;"></div>

        <!-- HEADER / SQUAD STATUS -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 650px; margin: 0 auto; background: rgba(15, 10, 30, 0.85); padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255, 0, 127, 0.5); z-index: 10; box-shadow: 0 0 20px rgba(255, 0, 127, 0.3); backdrop-filter: blur(8px);">
            <div style="text-align: left;">
                <div style="font-size: 0.65rem; color: #ff0055; font-weight: bold; margin-bottom: 3px; letter-spacing: 1px;">🔴 ENEMY SQUAD</div>
                <div style="display: flex; gap: 6px;">${enemyPartyDots}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold; margin-bottom: 3px; letter-spacing: 1px;">🟢 YOUR SQUAD</div>
                <div style="display: flex; gap: 6px; justify-content: flex-end;">${playerPartyDots}</div>
            </div>
        </div>

        <!-- ARENA: PERSPECTIVE FIELD -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; width: 100%; max-width: 500px; margin: 0 auto; z-index: 10;">
            
            <!-- ENEMY LARGE CARD -->
            <div id="enemyCardBox" class="${activeEnemyRot.animClass || ''}" style="
                background: linear-gradient(180deg, #120826, ${enemyRarityColor}44);
                border: 3px solid ${enemyRarityColor};
                border-radius: 16px;
                padding: 12px;
                width: 190px;
                text-align: center;
                box-shadow: 0 0 30px ${enemyRarityColor}66;
                transform: scale(0.85);
                transform-origin: center center;
                transition: transform 0.2s;
                backdrop-filter: blur(5px);
            ">
                <div style="font-size: 0.7rem; color: #aaa; margin-bottom: 2px; font-weight: bold;">ENEMY ACTIVE</div>
                <div style="font-size: 0.85rem; color: ${enemyRarityColor}; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${activeEnemyRot.name}</div>
                
                <div style="width: 100%; height: 110px; background: #1a102f; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">
                    <img src="${activeEnemyRot.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'%23222\'/><text x=\'50%\' y=\'50%\' fill=\'%23aaa\' font-size=\'12\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>';">
                </div>

                <div style="font-size: 0.7rem; color: #fff; margin-bottom: 4px; font-weight: bold;">Lvl ${activeEnemyRot.level} | ${(activeEnemyRot.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 8px; background: #111; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin-bottom: 4px;">
                    <div style="width: ${enemyHpPercent}%; height: 100%; background: #ff0055; transition: width 0.4s ease-out; box-shadow: 0 0 8px #ff0055;"></div>
                </div>
                <div style="font-size: 0.6rem; color: #aaa; text-align: right;">${activeEnemyRot.currentHp} / ${activeEnemyRot.maxHp} HP</div>
            </div>

            <!-- COMBAT LOG CHAT -->
            <div style="background: rgba(15, 10, 30, 0.95); border: 2px solid #00ff55; padding: 12px 18px; border-radius: 12px; width: 100%; max-width: 420px; text-align: center; font-size: 0.85rem; color: #00ff55; box-shadow: 0 0 20px rgba(0,255,85,0.3); backdrop-filter: blur(5px); font-weight: bold;">
                ${state.log}
            </div>

            <!-- PLAYER LARGE CARD -->
            <div id="playerCardBox" class="${activePlayerRot.animClass || ''}" style="
                background: linear-gradient(180deg, #120826, ${playerRarityColor}44);
                border: 4px solid ${playerRarityColor};
                border-radius: 18px;
                padding: 14px;
                width: 220px;
                text-align: center;
                box-shadow: 0 0 35px ${playerRarityColor}77;
                transition: transform 0.2s;
                backdrop-filter: blur(5px);
            ">
                <div style="font-size: 0.75rem; color: #aaa; margin-bottom: 2px; font-weight: bold;">YOUR ACTIVE FIGHTER</div>
                <div style="font-size: 0.95rem; color: ${playerRarityColor}; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${activePlayerRot.name}</div>
                
                <div style="width: 100%; height: 130px; background: #1a102f; border-radius: 10px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">
                    <img src="${activePlayerRot.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'%23222\'/><text x=\'50%\' y=\'50%\' fill=\'%23aaa\' font-size=\'12\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>';">
                </div>

                <div style="font-size: 0.75rem; color: #fff; margin-bottom: 4px; font-weight: bold;">Lvl ${activePlayerRot.level || 1} | ${(activePlayerRot.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 10px; background: #111; border-radius: 5px; overflow: hidden; border: 1px solid #444; margin-bottom: 4px;">
                    <div style="width: ${playerHpPercent}%; height: 100%; background: #00ff55; transition: width 0.4s ease-out; box-shadow: 0 0 10px #00ff55;"></div>
                </div>
                <div style="font-size: 0.65rem; color: #aaa; text-align: right;">${activePlayerRot.currentHp} / ${activePlayerRot.maxHp} HP</div>
            </div>

        </div>

        <!-- BATTLE CONTROLS -->
        <div style="width: 100%; max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; z-index: 10;">
            <div style="display: flex; gap: 8px;">
                <button onclick="executePlayerAttack('standard')" ${!state.isTurn ? 'disabled' : ''} style="flex: 1; padding: 12px; background: ${state.isTurn ? '#ff0055' : '#333'}; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 0.95rem; cursor: ${state.isTurn ? 'pointer' : 'not-allowed'}; font-family: monospace; box-shadow: ${state.isTurn ? '0 0 15px #ff0055aa' : 'none'};">
                    ⚔️ STANDARD
                </button>
                <button onclick="executePlayerAttack('ultimate')" ${!state.isTurn || !ultimateReady ? 'disabled' : ''} style="flex: 1; padding: 12px; background: ${state.isTurn && ultimateReady ? '#ffcc00' : '#333'}; color: ${state.isTurn && ultimateReady ? '#000' : '#777'}; border: none; border-radius: 8px; font-weight: bold; font-size: 0.95rem; cursor: ${state.isTurn && ultimateReady ? 'pointer' : 'not-allowed'}; font-family: monospace; box-shadow: ${state.isTurn && ultimateReady ? '0 0 15px #ffcc00aa' : 'none'};">
                    ⚡ ULTIMATE ${!ultimateReady ? '(CD)' : ''}
                </button>
            </div>
            <button onclick="exitBattleScene()" style="width: 100%; padding: 10px; background: rgba(30, 20, 50, 0.9); color: #ccc; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">
                🏃 FLEE BATTLE
            </button>
        </div>
    `;
};

window.executePlayerAttack = function(type = 'standard') {
    const state = window.battleState;
    if (!state || !state.isTurn) return;

    state.isTurn = false;
    const playerRot = state.playerSquad[state.playerActiveIndex];
    const enemyRot = state.enemySquad[state.enemyActiveIndex];

    if (type === 'ultimate') {
        playerRot.ultimateCooldown = 2; // 2 turn cooldown
    } else if (playerRot.ultimateCooldown > 0) {
        playerRot.ultimateCooldown--;
    }

    // Step 1: Charging / Stance
    state.log = `⚡ ${playerRot.name} prepares to strike...`;
    renderBattle3v3Scene();

    setTimeout(() => {
        // Step 2: Lunge & Animation
        playerRot.animClass = 'anim-lunge-player';
        enemyRot.animClass = 'anim-shake';
        renderBattle3v3Scene();

        // Calculate Damage with Critical & Miss mechanics
        let baseDmg = type === 'ultimate' ? Math.floor(playerRot.atk * 1.8) : Math.floor(playerRot.atk * (0.8 + Math.random() * 0.4));
        const isMiss = Math.random() < 0.10; // 10% chance to miss
        const isCrit = !isMiss && Math.random() < 0.20; // 20% chance for critical hit

        let finalDmg = baseDmg;
        if (isMiss) {
            finalDmg = 0;
            state.log = `💨 ${playerRot.name} swung, but missed the target!`;
        } else if (isCrit) {
            finalDmg = Math.floor(baseDmg * 1.6);
            state.log = `💥 CRITICAL BRAINROT HIT! ${playerRot.name} dealt ${finalDmg} damage!`;
        } else {
            state.log = `⚔️ ${playerRot.name} struck for ${finalDmg} damage!`;
        }

        enemyRot.currentHp = Math.max(0, enemyRot.currentHp - finalDmg);
        renderBattle3v3Scene();

        // Step 3: Recovery & Check Enemy Status
        setTimeout(() => {
            playerRot.animClass = '';
            enemyRot.animClass = '';
            renderBattle3v3Scene();

            if (enemyRot.currentHp <= 0) {
                setTimeout(() => {
                    if (state.enemyActiveIndex < state.enemySquad.length - 1) {
                        state.enemyActiveIndex++;
                        state.log = `🏆 Enemy fainted! Next up: ${state.enemySquad[state.enemyActiveIndex].name}.`;
                        state.isTurn = true;
                        renderBattle3v3Scene();
                    } else {
                        handleBattleVictory();
                    }
                }, 1200);
                return;
            }

            // Step 4: Enemy Counter-Attack Sequence (with cinematic pause)
            setTimeout(() => {
                state.log = `⚠️ ${activeEnemyName(state)} prepares to counter-attack...`;
                renderBattle3v3Scene();

                setTimeout(() => {
                    enemyRot.animClass = 'anim-lunge-enemy';
                    playerRot.animClass = 'anim-shake';
                    renderBattle3v3Scene();

                    const enemyMiss = Math.random() < 0.08;
                    const enemyCrit = !enemyMiss && Math.random() < 0.15;
                    let enemyDmg = Math.floor(enemyRot.atk * (0.8 + Math.random() * 0.4));

                    if (enemyMiss) {
                        enemyDmg = 0;
                        state.log = `🛡️ ${enemyRot.name} attacked, but your fighter dodged!`;
                    } else if (enemyCrit) {
                        enemyDmg = Math.floor(enemyDmg * 1.5);
                        state.log = `💥 OUCH! Critical counter-attack for ${enemyDmg} damage!`;
                    } else {
                        state.log = `🔴 ${enemyRot.name} counter-attacked for ${enemyDmg} damage!`;
                    }

                    playerRot.currentHp = Math.max(0, playerRot.currentHp - enemyDmg);
                    renderBattle3v3Scene();

                    setTimeout(() => {
                        enemyRot.animClass = '';
                        playerRot.animClass = '';
                        renderBattle3v3Scene();

                        if (playerRot.currentHp <= 0) {
                            if (typeof playerData !== 'undefined' && playerData.inventory) {
                                const invIdx = playerRot.inventoryIndex;
                                if (playerData.inventory[invIdx]) playerData.inventory[invIdx].fainted = true;
                            }

                            setTimeout(() => {
                                let nextIdx = state.playerActiveIndex + 1;
                                while (nextIdx < state.playerSquad.length && state.playerSquad[nextIdx].currentHp <= 0) {
                                    nextIdx++;
                                }
                                if (nextIdx < state.playerSquad.length) {
                                    state.playerActiveIndex = nextIdx;
                                    state.log = `💀 ${playerRot.name} fainted! Sent out ${state.playerSquad[state.playerActiveIndex].name}!`;
                                    state.isTurn = true;
                                    renderBattle3v3Scene();
                                    return;
                                }
                                handleBattleDefeat();
                            }, 1200);
                        } else {
                            state.isTurn = true;
                            renderBattle3v3Scene();
                        }
                    }, 500);
                }, 1000);
            }, 1200);
        }, 500);
    }, 800);
};

function activeEnemyName(state) {
    return state.enemySquad[state.enemyActiveIndex].name;
}

window.handleBattleVictory = function() {
    const modal = document.getElementById('battle3v3Modal');
    if (!modal) return;

    const xpReward = 250;
    const potionReward = 1;
    const luckyEggChance = Math.random() < 0.5 ? 1 : 0; 

    if (typeof playerData !== 'undefined') {
        if (typeof addAccountXp === 'function') addAccountXp(xpReward);
        playerData.revivePotions = (playerData.revivePotions || 0) + potionReward;
        if (luckyEggChance > 0) {
            playerData.luckyEggs = (playerData.luckyEggs || 0) + luckyEggChance;
        }
        if (typeof saveGameData === 'function') saveGameData();
    }

    modal.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <h1 style="color: #00ff55; font-size: 2.2rem; text-shadow: 0 0 20px #00ff55; margin-bottom: 10px;">🏆 VICTORY!</h1>
            <p style="font-size: 1rem; color: #fff; margin-bottom: 20px;">Your squad conquered the enemy bots!</p>
            <div style="background: rgba(0,255,85,0.1); border: 2px solid #00ff55; padding: 15px 30px; border-radius: 12px; margin-bottom: 25px; display: flex; flex-direction: column; gap: 8px;">
                <div style="color: #00ccff; font-size: 1.1rem; font-weight: bold;">+${xpReward} Account XP ⭐</div>
                <div style="color: #00ffcc; font-size: 1.1rem; font-weight: bold;">+${potionReward} Revive Potion 🧪</div>
                ${luckyEggChance > 0 ? `<div style="color: #ff00ff; font-size: 1.1rem; font-weight: bold;">+${luckyEggChance} Lucky Egg 🥚</div>` : ''}
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