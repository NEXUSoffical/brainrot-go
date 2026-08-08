// battle3v3.js - True 3v3 Turn-Based Battle Engine with Robust Turn Recovery

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
        log: "⚔️ True 3v3 Showdown Engaged! Defeat all 3 to win!"
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

    const wildNameEl = document.getElementById('wildName');
    if (wildNameEl) wildNameEl.innerText = `${activeEnemyRot.name.toUpperCase()} (Lvl ${activeEnemyRot.level}) [Enemy ${state.enemyActiveIndex + 1}/3]`;

    const wildBadgeName = document.getElementById('wildBadgeName');
    if (wildBadgeName) wildBadgeName.innerText = `${activeEnemyRot.name} (Lvl ${activeEnemyRot.level})`;

    const wildRarity = document.getElementById('wildRarity');
    if (wildRarity) wildRarity.innerText = `RARITY: ${(activeEnemyRot.rarity || 'common').toUpperCase()}`;

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
    if (myFighterName) myFighterName.innerText = `${activePlayerRot.name} (Lvl ${activePlayerRot.level}) [Your Squad ${state.playerActiveIndex + 1}/3]`;

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

    const attackBtn = document.getElementById('attackBtn');
    if (attackBtn) {
        attackBtn.innerText = state.isTurn ? "⚔️ ATTACK ENEMY SQUAD" : "⏳ ENEMY TURN...";
        attackBtn.onclick = function() {
            window.executeTrue3v3Attack();
        };
    }

    const battleLog = document.getElementById('battleLog');
    if (battleLog && state.log) {
        battleLog.innerText = state.log;
    }
};

window.executeTrue3v3Attack = function() {
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
        const dmg = Math.max(12, Math.floor(playerRot.atk * (0.8 + Math.random() * 0.4)));
        enemyRot.currentHp = Math.max(0, enemyRot.currentHp - dmg);
        
        state.log = `💥 ${playerRot.name} dealt ${dmg} damage to enemy ${enemyRot.name}!`;
        renderTrue3v3Scene();

        setTimeout(() => {
            if (enemyRot.currentHp <= 0) {
                enemyRot.fainted = true;
                if (state.enemyActiveIndex < state.enemySquad.length - 1) {
                    state.enemyActiveIndex++;
                    state.log = `🏆 Enemy ${enemyRot.name} fainted! Next enemy: ${state.enemySquad[state.enemyActiveIndex].name}!`;
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

                // Fail-safe timer: Forces turn back to player if animation callback hangs
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