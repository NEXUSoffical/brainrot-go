// battle.js - Universal Battle Engine with Vampire Support + QTE & Type Matchups

if (typeof window.currentWildCreature === 'undefined') {
    window.currentWildCreature = null;
    window.wildHp = 100;
    window.maxWildHp = 100;
    window.playerHp = 60;
    window.maxPlayerHp = 60;
    
    window.playerVampireUltUsed = false;
    window.wildVampireUltUsed = false;

    window.activeQteMultiplier = 1.0;
}

// Inject Floating & Guaranteed Visible CSS Combat FX Styles + QTE Styles
function injectBattleAnimations() {
    if (document.getElementById('battleCustomAnimations')) return;
    const style = document.createElement('style');
    style.id = 'battleCustomAnimations';
    style.innerHTML = `
        @keyframes battleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
        }
        .battle-float {
            animation: battleFloat 2.5s ease-in-out infinite !important;
        }

        #wildCardContainer, #playerCardContainer, .battle-card-box {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
        }

        /* QTE Timing Bar Styles */
        @keyframes qteSlide {
            0% { left: 0%; }
            50% { left: 90%; }
            100% { left: 0%; }
        }
        .qte-marker {
            position: absolute; top: 0; width: 6px; height: 100%; background: #fff;
            box-shadow: 0 0 10px #00ffff; animation: qteSlide 1.1s infinite ease-in-out;
        }
        .qte-target-zone {
            position: absolute; top: 0; left: 62% !important; width: 22% !important; height: 100%;
            background: rgba(0, 255, 128, 0.45); border-left: 2px dashed #00ff80; border-right: 2px dashed #00ff80;
        }

        @keyframes waterShotArcPlayer {
            0% { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translate(100px, -80px) scale(1.4); }
            80% { transform: translate(200px, -160px) scale(1.8); opacity: 1; }
            100% { transform: translate(250px, -200px) scale(2.5); opacity: 0; }
        }
        .water-projectile-player {
            position: absolute; bottom: 25%; left: 25%; width: 32px; height: 32px;
            background: radial-gradient(circle, #ffffff 0%, #ff0055 50%, #550000 100%);
            box-shadow: 0 0 25px #ff0055, 0 0 10px #ffffff; border-radius: 50%;
            animation: waterShotArcPlayer 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes waterShotArcEnemy {
            0% { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translate(-100px, 80px) scale(1.4); }
            80% { transform: translate(-200px, 160px) scale(1.8); opacity: 1; }
            100% { transform: translate(-250px, 200px) scale(2.5); opacity: 0; }
        }
        .water-projectile-enemy {
            position: absolute; top: 25%; right: 25%; width: 32px; height: 32px;
            background: radial-gradient(circle, #ffffff 0%, #ff0055 50%, #550000 100%);
            box-shadow: 0 0 25px #ff0055, 0 0 10px #ffffff; border-radius: 50%;
            animation: waterShotArcEnemy 0.55s ease-in-out forwards; pointer-events: none; z-index: 999999;
        }
        @keyframes impactSplashRipple {
            0% { transform: scale(0.5); opacity: 1; border-width: 6px; }
            100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
        }
        .water-impact-ring-player {
            position: absolute; top: 25px; right: 25px; width: 80px; height: 40px;
            border: 4px solid #ff0055; border-radius: 50%; box-shadow: 0 0 20px #ff0055, inset 0 0 15px #ff0055;
            animation: impactSplashRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }
        .water-impact-ring-enemy {
            position: absolute; bottom: 25px; left: 25px; width: 80px; height: 40px;
            border: 4px solid #ff0055; border-radius: 50%; box-shadow: 0 0 20px #ff0055, inset 0 0 15px #ff0055;
            animation: impactSplashRipple 0.4s ease-out forwards; pointer-events: none; z-index: 999999;
        }
    `;
    document.head.appendChild(style);
}
injectAnimationStyles();

function shouldFloat(charName) {
    if (!charName) return false;
    const lower = charName.toLowerCase();
    return lower.includes('vampire') || lower.includes('spirit') || lower.includes('phantom');
}

// Element & Type Matchup Helpers
function getEntityElement(name) {
    if (!name) return 'tech';
    const n = name.toLowerCase();
    if (n.includes('vampire')) return 'void';
    return 'tech';
}

function getTypeMultiplier(attackerType, defenderType) {
    if (attackerType === defenderType) return 1.0;
    return 1.2;
}

window.initBattle = function(creature) {
    window.currentWildCreature = creature;
    window.activeQteMultiplier = 1.0;
    window.playerVampireUltUsed = false;
    window.wildVampireUltUsed = false;
    
    const wildLvl = creature.level || 1;
    let wildStats = typeof window.calculateEntityStats === 'function' 
        ? window.calculateEntityStats(creature) 
        : { maxHp: 60 + (wildLvl - 1) * 20, atk: 15, def: 10 };
        
    if (creature && creature.shiny) {
        wildStats.atk *= 1.3;
        wildStats.def *= 1.3;
        wildStats.maxHp = Math.floor(wildStats.maxHp * 1.3);
    }
        
    window.maxWildHp = wildStats.maxHp;
    window.wildHp = window.maxWildHp;

    if (typeof playerData === 'undefined') {
        window.playerData = { username: "Player", currency: 500, inventory: [], activeFighterIndex: 0, revivePotions: 0, candies: {} };
    }
    if (!playerData.inventory || playerData.inventory.length === 0) {
        playerData.inventory = [{ name: "Vampire", rarity: "common", image: "brainrots/vampire.png", level: 1, hp: 60, maxHp: 60, fainted: false }];
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
    let pStats = typeof window.calculateEntityStats === 'function' 
        ? window.calculateEntityStats(activeFighter) 
        : { maxHp: 60 + (fighterLvl * 20), atk: 15, def: 10 };

    if (activeFighter && activeFighter.shiny) {
        pStats.atk *= 1.3;
        pStats.def *= 1.3;
        pStats.maxHp = Math.floor(pStats.maxHp * 1.3);
    }

    window.maxPlayerHp = pStats.maxHp;
    window.playerHp = activeFighter.fainted ? 0 : window.maxPlayerHp;

    const wildElem = getEntityElement(creature.name);
    document.getElementById('wildName').innerText = `${creature.shiny ? '💎 SHINY ' : ''}${(creature.name || "Unknown").toUpperCase()} (Lvl ${wildLvl}) [${wildElem.toUpperCase()}]`;
    document.getElementById('wildBadgeName').innerText = `${creature.shiny ? '💎 ' : ''}${creature.name || "Unknown"} (Lvl ${wildLvl})`;
    document.getElementById('wildRarity').innerText = `TYPE: ${wildElem.toUpperCase()} | RARITY: ${(creature.rarity || 'common').toUpperCase()}${creature.shiny ? ' [💎 SHINY]' : ''}`;
    
    const wildIsFloating = shouldFloat(creature.name);
    const wildCardContainer = document.getElementById('wildCardContainer');
    if (wildCardContainer) {
        wildCardContainer.style.background = 'transparent';
        wildCardContainer.style.border = 'none';
        wildCardContainer.style.boxShadow = 'none';
        wildCardContainer.style.padding = '0';
        wildCardContainer.innerHTML = `
            <div id="wildFighterInner" class="${wildIsFloating ? 'battle-float' : ''}" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: transparent !important;">
                <img src="${creature.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.8));" onerror="this.style.display='none';">
            </div>
        `;
    }

    updatePlayerFighterDisplay(activeFighter, fighterLvl);
    updateHpBars();
    renderTacticalBattleMenu();

    const battleLog = document.getElementById('battleLog');
    if (battleLog) {
        if (activeFighter.fainted) {
            battleLog.innerText = `⚠️ Your active fighter is FAINTED! Switch fighters or visit the Revive Station!`;
        } else {
            battleLog.innerText = `A wild Level ${wildLvl} ${creature.name} appeared!`;
        }
    }
};

function updatePlayerFighterDisplay(activeFighter, fighterLvl) {
    const playerIsFloating = shouldFloat(activeFighter.name);
    const playerFighterInner = document.getElementById('playerFighterInner');
    const playerCardContainer = document.getElementById('playerCardContainer');
    
    if (playerFighterInner) {
        playerFighterInner.className = playerIsFloating ? 'battle-float' : '';
    }

    let imagePath = activeFighter.image || 'brainrots/vampire.png';

    if (playerCardContainer) {
        playerCardContainer.style.background = 'transparent';
        playerCardContainer.style.border = 'none';
        playerCardContainer.style.boxShadow = 'none';
        playerCardContainer.style.padding = '0';
        playerCardContainer.innerHTML = `
            <div class="${playerIsFloating ? 'battle-float' : ''}" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: transparent !important;">
                <img src="${imagePath}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.8)); ${activeFighter.fainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
            </div>
        `;
    }

    const fighterElem = getEntityElement(activeFighter.name);
    const fighterNameEl = document.getElementById('myFighterName');
    if (fighterNameEl) {
        fighterNameEl.innerText = `${activeFighter.name || 'Fighter'} (Lvl ${fighterLvl}) [${fighterElem.toUpperCase()}] ${activeFighter.fainted ? '💀 [FAINTED]' : ''}`;
    }
}

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

function renderTacticalBattleMenu() {
    const actionContainer = document.querySelector('.battle-actions') || document.getElementById('battleActionsContainer');
    if (!actionContainer) return;

    actionContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; width: 100%;">
            <button onclick="battleAttack()" style="background: #ff0055; color: #fff; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">✨ Signature Strike</button>
            <button onclick="openQTEPrompt()" style="background: #9900ff; color: #fff; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">🎯 Critical QTE</button>
            <button onclick="openBattleSwitch()" style="background: #00ff80; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">🔄 Switch</button>
            <button onclick="battleCatch()" style="background: #ffaa00; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">📦 Capture</button>
        </div>
    `;
}

window.openQTEPrompt = function() {
    let activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    if (activeFighter && (activeFighter.fainted || window.playerHp <= 0)) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `⚠️ Your fighter is fainted! Click 'Switch' to choose another entity.`;
        if (typeof openBattleSwitch === 'function') openBattleSwitch();
        return;
    }

    if (window.wildHp <= 0 || window.playerHp <= 0) return;

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
        <div style="background: #111; border: 3px solid #ff0055; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 320px; box-shadow: 0 0 25px rgba(255,0,85,0.3);">
            <h3 style="color: #ff0055; margin-bottom: 10px;">TIMING STRIKE!</h3>
            <p style="font-size: 0.8rem; margin-bottom: 15px; color: #ccc;">Tap when the marker is inside the green target zone!</p>
            <div id="qteTrack" style="position: relative; width: 100%; height: 35px; background: #222; border-radius: 6px; overflow: hidden; margin-bottom: 20px; border: 1px solid #444;">
                <div class="qte-target-zone"></div>
                <div id="movingQteMarker" class="qte-marker"></div>
            </div>
            <button onclick="resolveQTE()" style="background: #ff0055; color: #fff; font-weight: bold; border: none; padding: 12px 20px; border-radius: 6px; width: 100%; cursor: pointer; font-size: 1rem;">STRIKE NOW!</button>
        </div>
    `;
    qteModal.style.display = 'flex';
};

window.resolveQTE = function() {
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
    window.activeQteMultiplier = multiplier;
    
    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = `${resultText} Now execute your attack!`;
    
    window.battleAttack();
};

window.battleAttack = function() {
    let activeFighter = null;
    if (typeof playerData !== 'undefined' && playerData.inventory && playerData.inventory.length > 0) {
        activeFighter = playerData.inventory[playerData.activeFighterIndex || 0];
    }

    if (activeFighter && (activeFighter.fainted || window.playerHp <= 0)) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `⚠️ Active fighter is fainted! Click 'Switch' to choose another entity.`;
        if (typeof openBattleSwitch === 'function') openBattleSwitch();
        return;
    }

    if (window.wildHp <= 0) return;

    const wildCombatant = document.getElementById('wildCombatant');
    const arenaField = document.getElementById('arenaField');
    
    const fighterLvl = activeFighter ? (activeFighter.level || 1) : 1;
    const wildLvl = window.currentWildCreature ? (window.currentWildCreature.level || 1) : 1;

    let pStats = typeof window.calculateEntityStats === 'function' ? window.calculateEntityStats(activeFighter) : {atk: 15, def: 10};
    let wStats = typeof window.calculateEntityStats === 'function' ? window.calculateEntityStats(window.currentWildCreature) : {atk: 10, def: 10};

    // Player Animation & Attack Execution
    if (arenaField) {
        const projectile = document.createElement('div');
        projectile.className = 'water-projectile-player';
        arenaField.appendChild(projectile);
        setTimeout(() => {
            projectile.remove();
            const impactRing = document.createElement('div');
            impactRing.className = 'water-impact-ring-player';
            arenaField.appendChild(impactRing);
            setTimeout(() => impactRing.remove(), 400);
        }, 500);
    }

    setTimeout(() => {
        executeDamageSequence();
    }, 550);

    function executeDamageSequence() {
        if (wildCombatant) wildCombatant.classList.add('hit-knockback');

        const pElem = getEntityElement(activeFighter ? activeFighter.name : '');
        const wElem = getEntityElement(window.currentWildCreature ? window.currentWildCreature.name : '');
        const typeMod = getTypeMultiplier(pElem, wElem);

        let attackRoll = pStats.atk * (0.8 + (Math.random() * 0.4));
        let defenseRoll = wStats.def * (0.4 + (Math.random() * 0.2));
        let baseDamage = Math.floor((attackRoll - defenseRoll) * window.activeQteMultiplier * typeMod);

        const damage = Math.max(1, baseDamage); 
        window.wildHp -= damage;
        
        const currentQte = window.activeQteMultiplier;
        window.activeQteMultiplier = 1.0;
        
        updateHpBars();
        
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            let qteSuffix = currentQte > 1.0 ? ` (QTE x${currentQte})` : "";
            battleLog.innerText = `Vampire attacked for ${damage} damage!${qteSuffix}`;
        }

        setTimeout(() => {
            if (wildCombatant) wildCombatant.classList.remove('hit-knockback');
        }, 300);

        if (window.wildHp <= 0) {
            window.wildHp = 0;
            updateHpBars();
            if (battleLog) battleLog.innerText = `Victory! Click 'Capture' to claim it!`;
            if (typeof window.saveGameData === 'function') window.saveGameData();
            return;
        }

        setTimeout(() => {
            if (arenaField) {
                const projectile = document.createElement('div');
                projectile.className = 'water-projectile-enemy';
                arenaField.appendChild(projectile);
                setTimeout(() => {
                    projectile.remove();
                    const impactRing = document.createElement('div');
                    impactRing.className = 'water-impact-ring-enemy';
                    arenaField.appendChild(impactRing);
                    setTimeout(() => impactRing.remove(), 400);
                }, 500);
            }

            setTimeout(applyEnemyDamage, 550);

            function applyEnemyDamage() {
                const playerCombatant = document.getElementById('playerCombatant');
                if (playerCombatant) playerCombatant.classList.add('hit-knockback');

                let enemyAttackRoll = wStats.atk * (0.8 + (Math.random() * 0.4));
                let playerDefenseRoll = pStats.def * (0.4 + (Math.random() * 0.2));
                let counterDamage = Math.floor(Math.max(1, enemyAttackRoll - playerDefenseRoll));

                window.playerHp -= counterDamage;
                updateHpBars();
                
                if (battleLog) {
                    battleLog.innerText = `Wild entity counter-attacked for ${counterDamage} damage!`;
                }

                setTimeout(() => {
                    if (playerCombatant) playerCombatant.classList.remove('hit-knockback');
                }, 300);

                if (window.playerHp <= 0) {
                    window.playerHp = 0;
                    updateHpBars();
                    if (activeFighter) activeFighter.fainted = true;
                    if (typeof window.saveGameData === 'function') window.saveGameData();
                    
                    if (battleLog) battleLog.innerText = `💀 Your fighter was defeated! Fleeing battle...`;
                    
                    setTimeout(() => {
                        if (typeof window.closeBattle === 'function') {
                            window.closeBattle();
                        } else {
                            const modal = document.getElementById('battleModal');
                            if (modal) modal.style.display = 'none';
                        }
                        window.currentWildCreature = null;
                    }, 1500);
                }
            }
        }, 600);
    }
};

window.openBattleSwitch = function() {
    if (typeof playerData === 'undefined' || !playerData.inventory || playerData.inventory.length === 0) {
        alert("You don't have any entities in your inventory!");
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
        <div style="background: #111; border: 3px solid #ff0055; border-radius: 15px; padding: 20px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 0 30px rgba(255,0,85,0.4);">
            <h3 style="color: #ff0055; margin-bottom: 10px;">CHOOSE YOUR FIGHTER</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 15px;">
    `;

    playerData.inventory.forEach((entity, index) => {
        const isCurrent = playerData.activeFighterIndex === index;
        const isFainted = entity.fainted === true;
        let entityImage = entity.image || 'brainrots/vampire.png';

        gridHtml += `
            <div onclick="selectNewFighter(${index})" style="background: ${isFainted ? '#2a1a1a' : (isCurrent ? '#1a3a1a' : '#222')}; border: 2px solid ${isFainted ? '#ff0055' : (isCurrent ? '#00ff00' : '#555')}; border-radius: 8px; padding: 8px; cursor: pointer; text-align: center; opacity: ${isFainted ? '0.6' : '1'};">
                <img src="${entityImage}" style="width: 50px; height: 50px; object-fit: contain; ${isFainted ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
                <div style="font-size: 0.75rem; font-weight: bold; margin-top: 4px; color: #fff;">${entity.name}</div>
                <div style="font-size: 0.65rem; color: ${isFainted ? '#ff0055' : '#00ff00'};">${isFainted ? '💀 FAINTED' : 'Lvl ' + (entity.level || 1)}</div>
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

    const newEntity = playerData.inventory[index];
    if (newEntity.fainted) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) battleLog.innerText = `❌ ${newEntity.name} has fainted! Revive them first.`;
        const switchModal = document.getElementById('battleSwitchModal');
        if (switchModal) switchModal.style.display = 'none';
        return;
    }

    playerData.activeFighterIndex = index;
    const fighterLvl = newEntity.level || 1;
    let newStats = typeof window.calculateEntityStats === 'function' ? window.calculateEntityStats(newEntity) : {maxHp: 60 + (fighterLvl * 20)};

    window.maxPlayerHp = newStats.maxHp;
    window.playerHp = window.maxPlayerHp; 

    updatePlayerFighterDisplay(newEntity, fighterLvl);
    updateHpBars();

    if (typeof window.saveGameData === 'function') window.saveGameData();

    const switchModal = document.getElementById('battleSwitchModal');
    if (switchModal) switchModal.style.display = 'none';

    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = `Switched to ${newEntity.name}!`;
};

window.battleCatch = function() {
    const battleLog = document.getElementById('battleLog');
    if (window.wildHp > 0) {
        if (battleLog) battleLog.innerText = `You must defeat it first!`;
        return;
    }

    const maxSlots = 100;
    const currentSlots = (typeof playerData !== 'undefined' && playerData.inventory) ? playerData.inventory.length : 0;
    if (currentSlots >= maxSlots) {
        if (battleLog) battleLog.innerText = `🚨 Inventory is full (100 / 100)! Release some entities before capturing more.`;
        alert("🚨 Inventory is full (100 / 100)! Release some entities from your inventory before capturing more.");
        return;
    }

    if (window.currentWildCreature) {
        if (window.gameAudio && typeof window.gameAudio.playCatch === 'function') {
            window.gameAudio.playCatch();
        }

        const caughtName = window.currentWildCreature.name;
        const caughtLevel = window.currentWildCreature.level;
        const essenceKey = caughtName.toUpperCase().trim();

        if (typeof playerData !== 'undefined') {
            if (!playerData.candies) playerData.candies = {};
            playerData.candies[essenceKey] = (playerData.candies[essenceKey] || 0) + 3;

            let assignedQuality = window.currentWildCreature.quality;
            if (typeof assignedQuality !== 'number' || assignedQuality === 50) {
                assignedQuality = Math.floor(Math.random() * 100) + 1;
            }

            const caughtEntity = {
                id: window.currentWildCreature.id,
                name: caughtName,
                rarity: window.currentWildCreature.rarity,
                image: window.currentWildCreature.image,
                level: caughtLevel,
                quality: assignedQuality,
                maxHp: window.currentWildCreature.maxHp || 60,
                hp: window.currentWildCreature.maxHp || 60,
                atk: window.currentWildCreature.atk || 15,
                def: window.currentWildCreature.def || 10,
                fainted: false,
                inGym: false
            };

            if (!playerData.inventory) playerData.inventory = [];
            playerData.inventory.push(caughtEntity);

            if (typeof window.saveGameData === 'function') window.saveGameData();
        }

        if (typeof window.addToDex === 'function') {
            window.addToDex(window.currentWildCreature);
        }

        const mapMarkers = document.querySelectorAll('.leaflet-marker-icon');
        for (let i = 0; i < mapMarkers.length; i++) {
            if (mapMarkers[i].classList.contains('enhanced-player-marker')) continue;
            if (window.currentWildCreature.image && mapMarkers[i].innerHTML.includes(window.currentWildCreature.image)) {
                mapMarkers[i].style.display = 'none'; 
                mapMarkers[i].remove(); 
                break; 
            }
        }

        if (typeof map !== 'undefined' && map && typeof map.closePopup === 'function') {
            map.closePopup();
        }
        document.querySelectorAll('.leaflet-popup').forEach(popup => popup.remove());

        if (typeof window.activeCreatures !== 'undefined' && Array.isArray(window.activeCreatures)) {
            for (let i = window.activeCreatures.length - 1; i >= 0; i--) {
                let c = window.activeCreatures[i];
                if (c === window.currentWildCreature || c.data === window.currentWildCreature) {
                    window.activeCreatures.splice(i, 1); 
                }
            }
        }

        if (battleLog) battleLog.innerText = `Captured Lvl ${caughtLevel} ${caughtName}! (+3 Essence🔮)`;
        window.currentWildCreature = null;
        setTimeout(window.closeBattle, 1500);
    }
};

window.closeBattle = function() {
    const modal = document.getElementById('battleModal');
    if (modal) modal.style.display = 'none';
    const switchModal = document.getElementById('battleSwitchModal');
    if (switchModal) switchModal.style.display = 'none';
};