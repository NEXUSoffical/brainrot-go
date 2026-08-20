// battle3v3.js - True 3v3 Turn-Based Battle Engine with QTE & Type Matchups Integration

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
            fainted: false
        });
    }

    const activePlayerSquad = squad.map(rot => {
        const lvl = rot.level || 1;
        const stats = typeof window.calculateRotStats === 'function' ? window.calculateRotStats(rot) : { maxHp: 50 + (lvl * 15), atk: 15 };
        return {
            name: rot.name,
            image: rot.image || rot.img || '',
            rarity: rot.rarity || 'common',
            level: lvl,
            maxHp: stats.maxHp,
            currentHp: stats.maxHp,
            atk: stats.atk,
            fainted: false
        };
    });

    window.battleState = {
        mode: mode,
        playerSquad: activePlayerSquad,
        playerActiveIndex: 0,
        enemySquad: enemySquad,
        enemyActiveIndex: 0,
        isTurn: true,
        log: "⚔️ True 3v3 Showdown Engaged with QTE & Types! Defeat all 3 to win!"
    };

    const catchModal = document.getElementById('battleModal');
    if (catchModal) catchModal.style.display = 'flex';

    renderTrue3v3Scene();
};

window.renderTrue3v3Scene = function() {
    const state = window.battleState;
    if (!state) return;

    const activePlayerRot = state.playerSquad[state.playerActiveIndex];
    const activeEnemyRot = state.enemySquad[state.enemyActiveIndex];

    const playerHpPercent = Math.max(0, Math.min(100, (activePlayerRot.currentHp / activePlayerRot.maxHp) * 100));
    const enemyHpPercent = Math.max(0, Math.min(100, (activeEnemyRot.currentHp / activeEnemyRot.maxHp) * 100));

    const enemyElem = typeof getRotElement === 'function' ? getRotElement(activeEnemyRot.name) : 'tech';
    const playerElem = typeof getRotElement === 'function' ? getRotElement(activePlayerRot.name) : 'tech';

    const wildNameEl = document.getElementById('wildName');
    if (wildNameEl) wildNameEl.innerText = `${activeEnemyRot.name.toUpperCase()} (Lvl ${activeEnemyRot.level}) [${enemyElem.toUpperCase()}]`;

    const wildBadgeName = document.getElementById('wildBadgeName');
    if (wildBadgeName) wildBadgeName.innerText = `${activeEnemyRot.name} (Lvl ${activeEnemyRot.level})`;

    const wildRarity = document.getElementById('wildRarity');
    if (wildRarity) wildRarity.innerText = `TYPE: ${enemyElem.toUpperCase()} | RARITY: ${(activeEnemyRot.rarity || 'common').toUpperCase()}`;

    const wildCardContainer = document.getElementById('wildCardContainer');
    if (wildCardContainer) {
        wildCardContainer.style.background = 'transparent';
        wildCardContainer.style.border = 'none';
        wildCardContainer.innerHTML = `
            <div id="wildCombatant" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                <img src="${activeEnemyRot.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,0,85,0.5);" onerror="this.style.display='none';">
            </div>
        `;
    }

    const myFighterName = document.getElementById('myFighterName');
    if (myFighterName) myFighterName.innerText = `${activePlayerRot.name} (Lvl ${activePlayerRot.level}) [${playerElem.toUpperCase()}]`;

    const playerCardContainer = document.getElementById('playerCardContainer');
    if (playerCardContainer) {
        playerCardContainer.style.background = 'transparent';
        playerCardContainer.style.border = 'none';
        playerCardContainer.innerHTML = `
            <div id="playerCombatant" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                <img src="${activePlayerRot.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 10px rgba(0,255,128,0.5);" onerror="this.style.display='none';">
            </div>
        `;
    }

    const wildHpBar = document.getElementById('wildHpBar');
    if (wildHpBar) wildHpBar.style.width = enemyHpPercent + '%';
    const wildHpText = document.getElementById('wildHpText');
    if (wildHpText) wildHpText.innerText = `${Math.ceil(activeEnemyRot.currentHp)}/${activeEnemyRot.maxHp} HP`;

    const myHpBar = document.getElementById('myHpBar');
    if (myHpBar) myHpBar.style.width = playerHpPercent + '%';
    const myHpText = document.getElementById('myHpText');
    if (myHpText) myHpText.innerText = `${Math.ceil(activePlayerRot.currentHp)}/${activePlayerRot.maxHp} HP`;

    // Update Action Controls Panel to include QTE option for 3v3 battles
    const controlPanel = document.querySelector('.battle-controls');
    if (controlPanel) {
        controlPanel.innerHTML = `
            <button onclick="window.open3v3QTEPrompt()" class="btn-action" style="background: #9900ff; color: #fff;">🎯 Critical QTE Strike</button>
            <button id="attackBtn" class="btn-action" style="background: #ff0055; color: #fff;" onclick="window.executeDirect3v3Attack(1.0)">✨ Signature Move</button>
            <button class="btn-action" style="background: #00ccff; color: #000;" onclick="alert('Switching squad members manually during combat coming soon!')">🔄 Switch Squad</button>
            <button class="btn-action" style="background: #333; color: #fff;" onclick="window.closeBattle(); window.battleState = null;">🏃 FLEE BATTLE</button>
        `;
    }

    const battleLog = document.getElementById('battleLog');
    if (battleLog && state.log) {
        battleLog.innerText = state.log;
    }
};

// 3v3 QTE Trigger
window.open3v3QTEPrompt = function() {
    const state = window.battleState;
    if (!state || !state.isTurn) return;

    let qteModal = document.getElementById('qteModal');
    if (!qteModal) {
        qteModal = document.createElement('div');
        qteModal.id = 'qteModal';
        qteModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); z-index: 9999999; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: monospace; color: #fff;
        `;
        document.body.appendChild(qteModal);
    }

    qteModal.innerHTML = `
        <div style="background: #111; border: 3px solid #00ff80; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 320px; box-shadow: 0 0 25px rgba(0,255,128,0.3);">
            <h3 style="color: #00ff80; margin-bottom: 10px;">3v3 TIMING STRIKE!</h3>
            <p style="font-size: 0.8rem; margin-bottom: 15px; color: #ccc;">Tap when the marker is inside the green zone!</p>
            <div id="qteTrack" style="position: relative; width: 100%; height: 35px; background: #222; border-radius: 6px; overflow: hidden; margin-bottom: 20px; border: 1px solid #444;">
                <div class="qte-target-zone"></div>
                <div id="movingQteMarker" class="qte-marker"></div>
            </div>
            <button onclick="window.resolve3v3QTE()" style="background: #00ff80; color: #000; font-weight: bold; border: none; padding: 12px 20px; border-radius: 6px; width: 100%; cursor: pointer; font-size: 1rem;">STRIKE NOW!</button>
        </div>
    `;
    qteModal.style.display = 'flex';
};

window.resolve3v3QTE = function() {
    const marker = document.getElementById('movingQteMarker');
    const qteModal = document.getElementById('qteModal');
    if (!marker) return;

    const computedStyle = window.getComputedStyle(marker);
    const leftPercent = parseFloat(computedStyle.left);

    let multiplier = 0.75; 
    let resultText = "❌ Weak Timing Strike!";

    if (leftPercent >= 60 && leftPercent <= 86) {
        multiplier = 2.0; 
        resultText = "🔥 PERFECT CRITICAL STRIKE! (2x)";
    } else if (leftPercent >= 52 && leftPercent <= 92) {
        multiplier = 1.35;
        resultText = "⚡ Good Timing Hit! (1.35x)";
    }

    if (qteModal) qteModal.style.display = 'none';
    
    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = `${resultText} Executing 3v3 strike!`;

    window.executeDirect3v3Attack(multiplier);
};

window.executeDirect3v3Attack = function(qteMultiplier = 1.0) {
    const state = window.battleState;
    if (!state || !state.isTurn) return;

    state.isTurn = false;
    const playerRot = state.playerSquad[state.playerActiveIndex];
    const enemyRot = state.enemySquad[state.enemyActiveIndex];

    const fighterName = (playerRot && playerRot.name) ? playerRot.name.toLowerCase().trim().replace(/[\s-]/g, '') : "";
    const isGodCloud = fighterName === "godcloud";
    const isCloud = fighterName.includes("cloud") && !isGodCloud;
    const isHashtagHell = fighterName === "hashtaghell";
    const isHashtagBase = fighterName === "hashtag" && !isHashtagHell;
    const isFomoDoom = fighterName === "fomodoom";
    const isFomo = fighterName === "fomophantom" && !isFomoDoom;

    const proceedWithDamage = () => {
        // Type matchup calculations
        const pElem = typeof getRotElement === 'function' ? getRotElement(playerRot.name) : 'tech';
        const wElem = typeof getRotElement === 'function' ? getRotElement(enemyRot.name) : 'tech';
        const typeMod = typeof getTypeMultiplier === 'function' ? getTypeMultiplier(pElem, wElem) : 1.0;

        const rawDmg = Math.floor(playerRot.atk * (0.8 + Math.random() * 0.4) * qteMultiplier * typeMod);
        const dmg = Math.max(12, rawDmg);
        
        enemyRot.currentHp = Math.max(0, enemyRot.currentHp - dmg);
        
        let qteText = qteMultiplier > 1.0 ? ` (QTE x${qteMultiplier})` : "";
        let typeText = typeMod > 1.0 ? " [Super Effective! 💥]" : "";
        state.log = `💥 ${playerRot.name} dealt ${dmg} dmg to ${enemyRot.name}!${qteText}${typeText}`;
        renderTrue3v3Scene();

        setTimeout(() => {
            if (enemyRot.currentHp <= 0) {
                enemyRot.fainted = true;
                if (state.enemyActiveIndex < state.enemySquad.length - 1) {
                    state.enemyActiveIndex++;
                    state.log = `🏆 Enemy ${enemyRot.name} fainted! Next: ${state.enemySquad[state.enemyActiveIndex].name}!`;
                    state.isTurn = true;
                    renderTrue3v3Scene();
                    return;
                } else {
                    state.log = `🏆 VICTORY! Your squad crushed all 3 enemy Rots!`;
                    renderTrue3v3Scene();
                    if (typeof addAccountXp === 'function') addAccountXp(300);
                    if (typeof playerData !== 'undefined' && typeof saveGameData === 'function') saveGameData();
                    setTimeout(() => {
                        window.closeBattle();
                        window.battleState = null;
                    }, 2000);
                    return;
                }
            }

            const enemyNameRaw = enemyRot.name ? enemyRot.name.toLowerCase().trim().replace(/[\s-]/g, '') : "";
            const isWildGodCloud = enemyNameRaw === "godcloud";
            const isWildCloud = enemyNameRaw.includes("cloud") && !isWildGodCloud;
            const isWildHashtagHell = enemyNameRaw === "hashtaghell";
            const isWildHashtagBase = enemyNameRaw === "hashtag" && !isWildHashtagHell;
            const isWildFomoDoom = enemyNameRaw === "fomodoom";
            const isWildFomo = enemyNameRaw === "fomophantom" && !isWildFomoDoom;

            const applyWildCounter = () => {
                const enemyDmg = Math.max(10, Math.floor(enemyRot.atk * (0.8 + Math.random() * 0.4)));
                playerRot.currentHp = Math.max(0, playerRot.currentHp - enemyDmg);

                state.log = `🔴 Enemy ${enemyRot.name} hit ${playerRot.name} for ${enemyDmg} damage!`;
                renderTrue3v3Scene();

                setTimeout(() => {
                    if (playerRot.currentHp <= 0) {
                        playerRot.fainted = true;
                        if (state.playerActiveIndex < state.playerSquad.length - 1) {
                            state.playerActiveIndex++;
                            state.log = `💀 Your ${playerRot.name} fainted! Sent out next squad member: ${state.playerSquad[state.playerActiveIndex].name}!`;
                            state.isTurn = true;
                            renderTrue3v3Scene();
                            return;
                        } else {
                            state.log = `💀 DEFEAT! All 3 of your squad members fainted.`;
                            renderTrue3v3Scene();
                            setTimeout(() => {
                                window.closeBattle();
                                window.battleState = null;
                            }, 2000);
                            return;
                        }
                    }

                    state.isTurn = true;
                    renderTrue3v3Scene();
                }, 400);
            };

            state.log = `⚠️ Enemy ${enemyRot.name} counter-attacks!`;
            renderTrue3v3Scene();

            setTimeout(() => {
                let callbackTriggered = false;
                const safeCallback = () => {
                    if (callbackTriggered) return;
                    callbackTriggered = true;
                    applyWildCounter();
                };

                if (isWildGodCloud && typeof window.playWildCloudAttack === 'function') {
                    window.playWildCloudAttack(safeCallback, true);
                } else if (isWildCloud && typeof window.playWildCloudAttack === 'function') {
                    window.playWildCloudAttack(safeCallback, false);
                } else if (isWildHashtagHell && typeof window.playWildHashtagHellAttack === 'function') {
                    window.playWildHashtagHellAttack(safeCallback);
                } else if (isWildHashtagBase && typeof window.playWildHashtagBaseAttack === 'function') {
                    window.playWildHashtagBaseAttack(safeCallback);
                } else if (isWildFomoDoom && typeof window.playWildFomoDoomAttack === 'function') {
                    window.playWildFomoDoomAttack(safeCallback);
                } else if (isWildFomo && typeof window.playWildFomoAttack === 'function') {
                    window.playWildFomoAttack(safeCallback);
                } else {
                    safeCallback();
                }

                setTimeout(() => {
                    if (!callbackTriggered) {
                        callbackTriggered = true;
                        applyWildCounter();
                    }
                }, 1500);
            }, 600);
        }, 400);
    };

    if (isGodCloud && typeof window.playPlayerCloudAttack === 'function') {
        window.playPlayerCloudAttack(proceedWithDamage, true);
    } else if (isCloud && typeof window.playPlayerCloudAttack === 'function') {
        window.playPlayerCloudAttack(proceedWithDamage, false);
    } else if (isHashtagHell && typeof window.playPlayerHashtagHellAttack === 'function') {
        window.playPlayerHashtagHellAttack(proceedWithDamage);
    } else if (isHashtagBase && typeof window.playPlayerHashtagBaseAttack === 'function') {
        window.playPlayerHashtagBaseAttack(proceedWithDamage);
    } else if (isFomoDoom && typeof window.playPlayerFomoDoomAttack === 'function') {
        window.playPlayerFomoDoomAttack(proceedWithDamage);
    } else if (isFomo && typeof window.playPlayerFomoAttack === 'function') {
        window.playPlayerFomoAttack(proceedWithDamage);
    } else {
        proceedWithDamage();
    }
};

window.executeTrue3v3Attack = function() {
    window.executeDirect3v3Attack(1.0);
};