// battle3v3.js - True 3v3 Engine with REAL Cinematic Elemental VFX

if (typeof window.battleState === 'undefined') {
    window.battleState = null;
}

// ==========================================
// 🎨 INJECT TRUE CINEMATIC VFX STYLES
// ==========================================
window.injectBattleVFXStyles = function() {
    if (document.getElementById('battleVfxStyles')) return;
    const style = document.createElement('style');
    style.id = 'battleVfxStyles';
    style.innerHTML = `
        /* Arena Camera Shakes */
        @keyframes arenaShake {
            0% { transform: translate(2px, 2px) rotate(0deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            40% { transform: translate(2px, -2px) rotate(1deg); }
            60% { transform: translate(-3px, 2px) rotate(0deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes arenaShakeHeavy {
            0% { transform: translate(0px, 12px); }
            25% { transform: translate(0px, -12px); }
            50% { transform: translate(0px, 8px); }
            75% { transform: translate(0px, -4px); }
            100% { transform: translate(0px, 0px); }
        }
        .vfx-shake-normal { animation: arenaShake 0.4s ease-out both; }
        .vfx-shake-heavy { animation: arenaShakeHeavy 0.5s ease-in-out both; }
        
        /* 🔥 THE FIREBALL */
        .vfx-fireball {
            position: absolute; width: 60px; height: 30px;
            background: linear-gradient(to right, #ffdd00, #ff0000);
            border-radius: 50% 20% 20% 50%;
            box-shadow: 0 0 20px #ff0000, -15px 0 20px #ff5500;
            z-index: 100; pointer-events: none;
            transition: all 0.35s cubic-bezier(0.4, 0, 1, 1);
        }

        /* 🌊 THE WATER BLAST */
        .vfx-waterblast {
            position: absolute; width: 70px; height: 20px;
            background: linear-gradient(to right, #ffffff, #00bbff);
            border-radius: 50% 10% 10% 50%;
            box-shadow: 0 0 20px #00bbff, -15px 0 20px #0055ff;
            z-index: 100; pointer-events: none;
            transition: all 0.35s cubic-bezier(0.4, 0, 1, 1);
        }

        /* ⚡ THE LIGHTNING BOLT */
        .vfx-lightning {
            position: absolute; width: 30px; height: 150px;
            background: #ffff00;
            clip-path: polygon(50% 0%, 100% 0, 40% 50%, 80% 50%, 0 100%, 30% 40%, 0 40%);
            box-shadow: 0 0 30px #ffff00, 0 0 50px #ffffff;
            z-index: 100; pointer-events: none; transform-origin: top;
            animation: lightningStrike 0.25s ease-out forwards;
        }
        @keyframes lightningStrike {
            0% { transform: scaleY(0); opacity: 1; }
            50% { transform: scaleY(1); opacity: 1; filter: brightness(2); }
            100% { transform: scaleY(1.2); opacity: 0; }
        }

        /* 🐾 THE BEAST SLASH (CLAW MARKS) */
        .vfx-claw {
            position: absolute; width: 6px; height: 100px; background: #ff0055;
            border-radius: 50%; box-shadow: 0 0 20px #ff0000;
            z-index: 100; pointer-events: none;
            animation: clawStrike 0.3s ease-out forwards;
        }
        @keyframes clawStrike {
            0% { transform: rotate(45deg) scaleY(0); opacity: 1; }
            50% { transform: rotate(45deg) scaleY(1); opacity: 1; }
            100% { transform: rotate(45deg) scaleY(1.5); opacity: 0; }
        }

        /* 👻 THE GHOST TELEPORT ANIMATIONS */
        @keyframes ghostTeleportPlayerToEnemy {
            0% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 15px #00ff80); }
            20% { opacity: 0; transform: scale(0.5); filter: drop-shadow(0 0 30px #9900ff); }
            40% { opacity: 0; transform: translate(120px, -150px) scale(1.5); }
            50% { opacity: 1; transform: translate(120px, -150px) scale(1.5); filter: drop-shadow(0 0 40px #9900ff) brightness(2); }
            70% { opacity: 0; transform: translate(120px, -150px) scale(0.5); }
            90% { opacity: 0; transform: translate(0px, 0px) scale(0.5); }
            100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 15px #00ff80); }
        }
        @keyframes ghostTeleportEnemyToPlayer {
            0% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 15px #ff0055); }
            20% { opacity: 0; transform: scale(0.5); filter: drop-shadow(0 0 30px #9900ff); }
            40% { opacity: 0; transform: translate(-120px, 150px) scale(1.5); }
            50% { opacity: 1; transform: translate(-120px, 150px) scale(1.5); filter: drop-shadow(0 0 40px #9900ff) brightness(2); }
            70% { opacity: 0; transform: translate(-120px, 150px) scale(0.5); }
            90% { opacity: 0; transform: translate(0px, 0px) scale(0.5); }
            100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 15px #ff0055); }
        }
        .anim-ghost-player { animation: ghostTeleportPlayerToEnemy 0.9s cubic-bezier(0.2, 0, 0.8, 1) forwards; }
        .anim-ghost-enemy { animation: ghostTeleportEnemyToPlayer 0.9s cubic-bezier(0.2, 0, 0.8, 1) forwards; }
    `;
    document.head.appendChild(style);
};
window.injectBattleVFXStyles();

// ==========================================
// ⚔️ INITIALIZE 3v3 BATTLE SCENE
// ==========================================
window.startBattleScene = function(mode = 'ai') {
    let squad = window.playerBattleSquad;
    if (!squad || squad.length !== 3) {
        alert("Battle squad not found! Please select 3 entities first.");
        if (typeof window.openTeamSelect === 'function') window.openTeamSelect(mode);
        return;
    }

    const masterList = (typeof paranormalSpawns !== 'undefined' && Array.isArray(paranormalSpawns) && paranormalSpawns.length > 0)
        ? paranormalSpawns
        : [{ name: "Vampire", rarity: "uncommon", type: "dark", image: "brainrots/Vampire.png", baseHp: 60, baseAtk: 22 }];

    const playerLvl = (window.playerData && window.playerData.accountLevel) ? window.playerData.accountLevel : 1;
    let enemySquad = [];

    for (let i = 0; i < 3; i++) {
        const randomChar = masterList[Math.floor(Math.random() * masterList.length)];
        const enemyLvl = Math.max(1, playerLvl + Math.floor(Math.random() * 3) - 1);
        
        const rarityGrowth = { 'common': 1.0, 'uncommon': 1.4, 'rare': 2.0, 'epic': 3.2, 'secret': 5.5 };
        const mult = rarityGrowth[(randomChar.rarity || 'common').toLowerCase()] || 1.0;
        
        const maxHp = Math.floor((randomChar.baseHp || 60) + (enemyLvl * 8 * mult));
        const atk = Math.floor((randomChar.baseAtk || 15) + (enemyLvl * 3 * mult));
        
        const signatureMove = typeof window.getEntitySignatureMove === 'function' 
            ? window.getEntitySignatureMove(randomChar.name)
            : { name: "Paranormal Strike", type: randomChar.type || "normal", icon: "✨" };

        enemySquad.push({
            name: randomChar.name, image: randomChar.image, rarity: randomChar.rarity || 'common', type: randomChar.type || 'dark',
            level: enemyLvl, maxHp: maxHp, currentHp: maxHp, atk: atk, move: signatureMove, fainted: false
        });
    }

    const activePlayerSquad = squad.map(entity => {
        const lvl = Number(entity.level) || 1;
        const stats = typeof window.calculateRotStats === 'function' 
            ? window.calculateRotStats(entity) 
            : { maxHp: (entity.baseHp || 60) + (lvl * 12), atk: (entity.baseAtk || 15) + (lvl * 3) };
            
        const signatureMove = entity.move || (typeof window.getEntitySignatureMove === 'function' 
            ? window.getEntitySignatureMove(entity.name) : { name: "Paranormal Strike", type: entity.type || "normal", icon: "✨" });

        return {
            name: entity.name, image: entity.image || '', rarity: entity.rarity || 'common', type: entity.type || 'normal',
            level: lvl, maxHp: Number(entity.maxHp) || stats.maxHp, currentHp: Number(entity.currentHp) || Number(entity.maxHp) || stats.maxHp,
            atk: Number(entity.atk) || stats.atk, move: signatureMove, fainted: false
        };
    });

    window.battleState = {
        mode: mode, playerSquad: activePlayerSquad, playerActiveIndex: 0, enemySquad: enemySquad, enemyActiveIndex: 0,
        isTurn: true, isAnimating: false, log: `⚔️ 3v3 BATTLE ENGAGED! Defeat all 3 enemy entities to claim victory!`
    };

    const battleModal = document.getElementById('battleModal');
    if (battleModal) battleModal.style.display = 'flex';

    renderTrue3v3Scene();
};

// ==========================================
// 🎨 RENDER 3v3 BATTLE ARENA
// ==========================================
window.renderTrue3v3Scene = function() {
    const state = window.battleState;
    if (!state) return;

    const activePlayer = state.playerSquad[state.playerActiveIndex];
    const activeEnemy = state.enemySquad[state.enemyActiveIndex];

    const playerHpPercent = Math.max(0, Math.min(100, (activePlayer.currentHp / activePlayer.maxHp) * 100));
    const enemyHpPercent = Math.max(0, Math.min(100, (activeEnemy.currentHp / activeEnemy.maxHp) * 100));

    // Names & Badges
    const wildNameEl = document.getElementById('wildName');
    if (wildNameEl) wildNameEl.innerText = `${activeEnemy.name.toUpperCase()} (LVL ${activeEnemy.level})`;
    const wildBadgeName = document.getElementById('wildBadgeName');
    if (wildBadgeName) wildBadgeName.innerText = `${activeEnemy.name} (Lvl ${activeEnemy.level})`;

    // ENEMY SPRITE CONTAINER
    const wildCardContainer = document.getElementById('wildCardContainer');
    if (wildCardContainer) {
        wildCardContainer.style.background = 'transparent'; wildCardContainer.style.border = 'none';
        wildCardContainer.innerHTML = `
            <div id="wildCombatantSprite" style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; z-index: 10;">
                <img src="${activeEnemy.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 15px rgba(255,0,85,0.6));" onerror="this.style.display='none';">
            </div>
        `;
    }

    const myFighterName = document.getElementById('myFighterName');
    if (myFighterName) myFighterName.innerText = `${activePlayer.name} (Lvl ${activePlayer.level})`;

    // PLAYER SPRITE CONTAINER
    const playerCardContainer = document.getElementById('playerCardContainer');
    if (playerCardContainer) {
        playerCardContainer.style.background = 'transparent'; playerCardContainer.style.border = 'none';
        playerCardContainer.innerHTML = `
            <div id="playerCombatantSprite" style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; z-index: 10;">
                <img src="${activePlayer.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 15px rgba(0,255,128,0.6));" onerror="this.style.display='none';">
            </div>
        `;
    }

    // Set up VFX Overlay Container
    const arenaField = document.getElementById('arenaField');
    if (arenaField && !document.getElementById('elementalVfxOverlay')) {
        const vfxOverlay = document.createElement('div');
        vfxOverlay.id = 'elementalVfxOverlay';
        vfxOverlay.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50; transition: background 0.15s ease-out;`;
        arenaField.appendChild(vfxOverlay);
    }

    const wildHpBar = document.getElementById('wildHpBar');
    if (wildHpBar) wildHpBar.style.width = enemyHpPercent + '%';
    const wildHpText = document.getElementById('wildHpText');
    if (wildHpText) wildHpText.innerText = `${Math.ceil(activeEnemy.currentHp)}/${activeEnemy.maxHp} HP`;

    const myHpBar = document.getElementById('myHpBar');
    if (myHpBar) myHpBar.style.width = playerHpPercent + '%';
    const myHpText = document.getElementById('myHpText');
    if (myHpText) myHpText.innerText = `${Math.ceil(activePlayer.currentHp)}/${activePlayer.maxHp} HP`;

    const controlPanel = document.querySelector('.battle-controls');
    if (controlPanel) {
        const move = activePlayer.move || { name: "Signature Move", icon: "✨" };
        controlPanel.innerHTML = `
            <button onclick="window.open3v3QTEPrompt()" class="btn-action" style="background: #9900ff; color: #fff; box-shadow: 0 0 10px rgba(153,0,255,0.5);">🎯 Critical QTE</button>
            <button id="attackBtn" class="btn-action" style="background: linear-gradient(135deg, #ff0055, #ff5500); color: #fff; box-shadow: 0 0 10px rgba(255,0,85,0.5);" onclick="window.executeDirect3v3Attack(1.0)">${move.icon} ${move.name}</button>
            <button class="btn-action" style="background: #00ccff; color: #000; font-weight:bold;" onclick="window.open3v3SwitchModal()">🔄 Switch Fighter</button>
            <button class="btn-action" style="background: rgba(255,255,255,0.1); border: 1px solid #555; color: #fff;" onclick="window.forfeit3v3Battle()">🏃 Flee</button>
        `;
    }

    const battleLog = document.getElementById('battleLog');
    if (battleLog && state.log) { battleLog.innerText = state.log; }
};

// ==========================================
// 🚀 THE REAL CINEMATIC ANIMATION ENGINE
// ==========================================
window.playCinematicAttack = function(moveType, isPlayerAttacking) {
    const arena = document.getElementById('arenaField');
    const overlay = document.getElementById('elementalVfxOverlay');
    const targetSprite = document.getElementById(isPlayerAttacking ? 'wildCombatantSprite' : 'playerCombatantSprite');
    const attackerSprite = document.getElementById(isPlayerAttacking ? 'playerCombatantSprite' : 'wildCombatantSprite');
    
    if (!arena || !targetSprite || !attackerSprite) return Promise.resolve();

    let type = (moveType || 'normal').toLowerCase();
    
    // 👻 GHOST / DARK TELEPORT ATTACK
    if (['dark', 'ghost', 'poison', 'illusion', 'chaos'].includes(type)) {
        return new Promise(resolve => {
            // Trigger vanishing teleport animation
            attackerSprite.classList.add(isPlayerAttacking ? 'anim-ghost-player' : 'anim-ghost-enemy');
            
            // Impact happens exactly at 50% of the 0.9s animation (450ms)
            setTimeout(() => {
                targetSprite.style.filter = 'brightness(3) drop-shadow(0 0 30px #ff0000)';
                targetSprite.style.transform = `translate(${isPlayerAttacking ? '10px' : '-10px'}, 0) scale(0.9)`;
                arena.classList.add('vfx-shake-heavy');
                if (overlay) overlay.style.background = 'radial-gradient(circle, rgba(153,0,255,0.6) 0%, transparent 80%)';
                
                resolve(); // APPLY DAMAGE
                
                setTimeout(() => {
                    targetSprite.style.filter = '';
                    targetSprite.style.transform = '';
                    arena.classList.remove('vfx-shake-heavy');
                    if (overlay) overlay.style.background = 'transparent';
                }, 300);

            }, 450);

            // Cleanup animation class when done
            setTimeout(() => {
                attackerSprite.classList.remove('anim-ghost-player', 'anim-ghost-enemy');
            }, 900);
        });
    }

    // ⚡ ELECTRIC / SKY INSTANT STRIKE
    if (['electric', 'speed', 'sonic', 'sky'].includes(type)) {
        return new Promise(resolve => {
            const lightning = document.createElement('div');
            lightning.className = 'vfx-lightning';
            lightning.style.left = isPlayerAttacking ? "70%" : "25%";
            lightning.style.top = isPlayerAttacking ? "5%" : "45%";
            arena.appendChild(lightning);

            setTimeout(() => {
                targetSprite.style.filter = 'brightness(4) drop-shadow(0 0 40px #ffff00)';
                arena.classList.add('vfx-shake-fast');
                if (overlay) overlay.style.background = 'radial-gradient(circle, rgba(255,255,0,0.4) 0%, transparent 80%)';
                
                resolve(); // APPLY DAMAGE

                setTimeout(() => {
                    lightning.remove();
                    targetSprite.style.filter = '';
                    arena.classList.remove('vfx-shake-fast');
                    if (overlay) overlay.style.background = 'transparent';
                }, 200);
            }, 100); // Lightning hits very fast
        });
    }

    // 🐾 BEAST / SLASH MELEE ATTACK
    if (['slash', 'beast', 'heavy', 'smash', 'earth'].includes(type)) {
        return new Promise(resolve => {
            // Attacker lunges
            attackerSprite.style.transform = `translate(${isPlayerAttacking ? '40px' : '-40px'}, ${isPlayerAttacking ? '-30px' : '30px'}) scale(1.2)`;
            attackerSprite.style.transition = "transform 0.2s ease-in";

            setTimeout(() => {
                // Generate 3 claw marks
                for(let i=0; i<3; i++) {
                    let claw = document.createElement('div');
                    claw.className = 'vfx-claw';
                    claw.style.left = isPlayerAttacking ? `${70 + (i*5)}%` : `${25 + (i*5)}%`;
                    claw.style.top = isPlayerAttacking ? `${15 + (i*5)}%` : `${55 + (i*5)}%`;
                    arena.appendChild(claw);
                    setTimeout(() => claw.remove(), 400);
                }

                targetSprite.style.filter = 'brightness(2) drop-shadow(0 0 30px #ff0000)';
                targetSprite.style.transform = `translate(${isPlayerAttacking ? '20px' : '-20px'}, 0) scale(0.9)`;
                arena.classList.add(type === 'earth' ? 'vfx-shake-heavy' : 'vfx-shake-normal');
                
                resolve(); // APPLY DAMAGE

                setTimeout(() => {
                    attackerSprite.style.transform = '';
                    targetSprite.style.filter = '';
                    targetSprite.style.transform = '';
                    arena.classList.remove('vfx-shake-normal', 'vfx-shake-heavy');
                }, 300);
            }, 200);
        });
    }

    // 🔥 FIRE / WATER / ICE PROJECTILE ATTACK
    return new Promise(resolve => {
        const isFire = ['fire', 'destruction', 'dragon'].includes(type);
        
        const projectile = document.createElement('div');
        projectile.className = isFire ? 'vfx-fireball' : 'vfx-waterblast';
        
        // Start position
        projectile.style.left = isPlayerAttacking ? "20%" : "70%";
        projectile.style.top = isPlayerAttacking ? "60%" : "15%";
        // Flip direction for enemy
        if (!isPlayerAttacking) projectile.style.transform = "scaleX(-1)";
        
        arena.appendChild(projectile);

        // Attacker recoil
        attackerSprite.style.transform = `translate(${isPlayerAttacking ? '-10px' : '10px'}, ${isPlayerAttacking ? '10px' : '-10px'})`;

        // Send projectile flying!
        setTimeout(() => {
            projectile.style.left = isPlayerAttacking ? "70%" : "20%";
            projectile.style.top = isPlayerAttacking ? "15%" : "60%";
        }, 20);

        // Impact
        setTimeout(() => {
            projectile.style.opacity = "0";
            
            targetSprite.style.filter = isFire 
                ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5) drop-shadow(0 0 40px #ff0000)' 
                : 'brightness(2) sepia(1) hue-rotate(180deg) saturate(3) drop-shadow(0 0 40px #00ffff)';
            
            targetSprite.style.transform = `translate(${isPlayerAttacking ? '15px' : '-15px'}, 0) scale(0.9)`;
            arena.classList.add(isFire ? 'vfx-shake-heavy' : 'vfx-shake-normal');
            
            if (overlay) overlay.style.background = isFire 
                ? 'radial-gradient(circle, rgba(255,50,0,0.6) 0%, transparent 80%)'
                : 'radial-gradient(circle, rgba(0,200,255,0.6) 0%, transparent 80%)';

            resolve(); // APPLY DAMAGE

            setTimeout(() => {
                projectile.remove();
                attackerSprite.style.transform = '';
                targetSprite.style.filter = '';
                targetSprite.style.transform = '';
                arena.classList.remove('vfx-shake-normal', 'vfx-shake-heavy');
                if (overlay) overlay.style.background = 'transparent';
            }, 300);
        }, 350); // 350ms travel time
    });
};

// ==========================================
// 🎯 3v3 TIMING STRIKE QTE SYSTEM
// ==========================================
window.open3v3QTEPrompt = function() {
    const state = window.battleState;
    if (!state || !state.isTurn || state.isAnimating) return;

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
        <div style="background: #110a1c; border: 3px solid #00ff80; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 340px; box-shadow: 0 0 30px rgba(0,255,128,0.4);">
            <h3 style="color: #00ff80; margin-bottom: 8px; font-size: 1.2rem;">CRITICAL TIMING STRIKE!</h3>
            <p style="font-size: 0.8rem; margin-bottom: 15px; color: #ccc;">Strike when the marker aligns with the green resonance zone!</p>
            <div id="qteTrack" style="position: relative; width: 100%; height: 36px; background: #222; border-radius: 6px; overflow: hidden; margin-bottom: 20px; border: 1px solid #444;">
                <div class="qte-target-zone"></div>
                <div id="movingQteMarker" class="qte-marker"></div>
            </div>
            <button onclick="window.resolve3v3QTE()" style="background: linear-gradient(135deg, #00ff80, #00ffff); color: #000; font-weight: 900; border: none; padding: 14px 20px; border-radius: 8px; width: 100%; cursor: pointer; font-size: 1.05rem; font-family: monospace;">⚡ STRIKE NOW!</button>
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

    let multiplier = 0.8; 
    let resultText = "❌ Weak Timing Strike!";

    if (leftPercent >= 60 && leftPercent <= 86) {
        multiplier = 2.0; 
        resultText = "🔥 PERFECT CRITICAL RESONANCE! (2.0x)";
    } else if (leftPercent >= 50 && leftPercent <= 92) {
        multiplier = 1.4;
        resultText = "⚡ Great Timing Hit! (1.4x)";
    }

    if (qteModal) qteModal.style.display = 'none';
    
    const battleLog = document.getElementById('battleLog');
    if (battleLog) battleLog.innerText = resultText;

    window.executeDirect3v3Attack(multiplier);
};

// ==========================================
// 💥 ATTACK LOGIC WITH SYNCED PROJECTILES
// ==========================================
window.executeDirect3v3Attack = async function(qteMultiplier = 1.0) {
    const state = window.battleState;
    if (!state || !state.isTurn || state.isAnimating) return;

    state.isTurn = false;
    state.isAnimating = true;

    const playerRot = state.playerSquad[state.playerActiveIndex];
    const enemyRot = state.enemySquad[state.enemyActiveIndex];
    const move = playerRot.move || { name: "Signature Move", type: "physical", icon: "✨" };

    if (window.gameAudio && typeof window.gameAudio.playHit === 'function') {
        window.gameAudio.playHit();
    }

    // 1. Await the Cinematic VFX Engine
    await window.playCinematicAttack(move.type, true);

    // 2. VFX Finished! Apply Damage & Update State
    const baseDamage = Math.max(15, Math.floor(playerRot.atk * (0.85 + Math.random() * 0.35)));
    const totalDamage = Math.floor(baseDamage * qteMultiplier);
    enemyRot.currentHp = Math.max(0, enemyRot.currentHp - totalDamage);

    const critNotice = qteMultiplier >= 2.0 ? " 💥 CRITICAL HIT!" : (qteMultiplier > 1.0 ? " ⚡ BOOSTED!" : "");
    state.log = `${move.icon} ${playerRot.name} unleashed ${move.name} for ${totalDamage} damage!${critNotice}`;

    renderTrue3v3Scene();

    // 3. Process Faint or Pass Turn
    setTimeout(() => {
        if (enemyRot.currentHp <= 0) {
            enemyRot.fainted = true;
            
            if (state.enemyActiveIndex < state.enemySquad.length - 1) {
                state.enemyActiveIndex++;
                state.log = `💀 Enemy ${enemyRot.name} fainted! Opponent summoned ${state.enemySquad[state.enemyActiveIndex].name}!`;
                state.isTurn = true;
                state.isAnimating = false;
                renderTrue3v3Scene();
                return;
            } else {
                state.log = `🏆 VICTORY! Your squad banished all 3 paranormal threats!`;
                renderTrue3v3Scene();

                const rewardRot = 100;
                const rewardXp = 80;

                if (window.playerData) {
                    window.playerData.rotBalance = (window.playerData.rotBalance || 0) + rewardRot;
                    if (typeof window.addAccountXp === 'function') window.addAccountXp(rewardXp);
                    if (typeof window.saveGameData === 'function') window.saveGameData();
                }

                setTimeout(() => {
                    alert(`🎉 VICTORY! You earned +${rewardRot} Currency and +${rewardXp} Hunter XP!`);
                    window.closeBattle();
                }, 1500);
                return;
            }
        }

        // Trigger Enemy Counter Attack
        setTimeout(executeEnemyCounterAttack, 500);
    }, 500);
};

async function executeEnemyCounterAttack() {
    const state = window.battleState;
    if (!state) return;

    const playerRot = state.playerSquad[state.playerActiveIndex];
    const enemyRot = state.enemySquad[state.enemyActiveIndex];
    const enemyMove = enemyRot.move || { name: "Dark Surge", type: "dark", icon: "🔥" };

    if (window.gameAudio && typeof window.gameAudio.playHit === 'function') {
        window.gameAudio.playHit();
    }

    // 1. Await the Cinematic VFX Engine for Enemy
    await window.playCinematicAttack(enemyMove.type, false);

    // 2. VFX Finished! Apply Damage
    const enemyDmg = Math.max(12, Math.floor(enemyRot.atk * (0.8 + Math.random() * 0.35)));
    playerRot.currentHp = Math.max(0, playerRot.currentHp - enemyDmg);

    state.log = `⚠️ Enemy ${enemyRot.name} retaliated with ${enemyMove.icon} ${enemyMove.name} for ${enemyDmg} damage!`;
    renderTrue3v3Scene();

    // 3. Process Faint or Reset Turn
    setTimeout(() => {
        if (playerRot.currentHp <= 0) {
            playerRot.fainted = true;

            const nextPlayerIdx = state.playerSquad.findIndex(p => !p.fainted);
            if (nextPlayerIdx === -1) {
                state.log = `💀 DEFEAT! All 3 of your fighters were overwhelmed!`;
                renderTrue3v3Scene();
                setTimeout(() => {
                    alert("Your battle squad was defeated! Use revive potions or rest up.");
                    window.closeBattle();
                }, 1500);
                return;
            } else {
                state.playerActiveIndex = nextPlayerIdx;
                state.log = `💀 Your ${playerRot.name} fainted! Sent out ${state.playerSquad[nextPlayerIdx].name}!`;
                renderTrue3v3Scene();
            }
        }

        state.isTurn = true;
        state.isAnimating = false;
    }, 500);
}

// ==========================================
// 🔄 IN-COMBAT SQUAD SWITCHING
// ==========================================
window.open3v3SwitchModal = function() {
    const state = window.battleState;
    if (!state || !state.isTurn || state.isAnimating) return;

    let switchModal = document.getElementById('combatSwitchModal');
    if (!switchModal) {
        switchModal = document.createElement('div');
        switchModal.id = 'combatSwitchModal';
        document.body.appendChild(switchModal);
    }

    switchModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.88); z-index: 99999999; display: flex;
        flex-direction: column; align-items: center; justify-content: center;
        font-family: monospace; color: #fff; padding: 20px; box-sizing: border-box;
    `;

    switchModal.innerHTML = `
        <div style="background: #110a1c; border: 2px solid #00ccff; padding: 20px; border-radius: 12px; width: 100%; max-width: 360px; text-align: center; box-shadow: 0 0 25px rgba(0,204,255,0.4);">
            <h3 style="color: #00ccff; margin-bottom: 12px;">SELECT ACTIVE FIGHTER</h3>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                ${state.playerSquad.map((rot, idx) => `
                    <button onclick="window.confirm3v3Switch(${idx})" ${rot.fainted || idx === state.playerActiveIndex ? 'disabled' : ''} style="
                        background: ${idx === state.playerActiveIndex ? '#222' : '#1a102a'};
                        color: ${rot.fainted ? '#555' : '#fff'}; border: 1px solid ${rot.fainted ? '#444' : '#00ff80'};
                        padding: 12px; border-radius: 8px; font-family: monospace; font-weight: bold;
                        cursor: ${rot.fainted || idx === state.playerActiveIndex ? 'not-allowed' : 'pointer'};
                        display: flex; justify-content: space-between; align-items: center;
                    ">
                        <span>${rot.name} (Lvl ${rot.level})</span>
                        <span>${rot.fainted ? '💀 FAINTED' : (idx === state.playerActiveIndex ? 'ACTIVE' : `${Math.ceil(rot.currentHp)}/${rot.maxHp} HP`)}</span>
                    </button>
                `).join('')}
            </div>
            <button onclick="document.getElementById('combatSwitchModal').style.display='none'" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; width: 100%; font-family: monospace; cursor: pointer;">CANCEL</button>
        </div>
    `;

    switchModal.style.display = 'flex';
};

window.confirm3v3Switch = function(newIdx) {
    const state = window.battleState;
    if (!state) return;

    state.playerActiveIndex = newIdx;
    state.log = `🔄 Switched active fighter to ${state.playerSquad[newIdx].name}!`;
    
    const switchModal = document.getElementById('combatSwitchModal');
    if (switchModal) switchModal.style.display = 'none';

    renderTrue3v3Scene();

    state.isTurn = false;
    state.isAnimating = true;
    setTimeout(executeEnemyCounterAttack, 700);
};

// ==========================================
// 🚪 EXIT & CLEANUP
// ==========================================
window.forfeit3v3Battle = function() {
    if (confirm("Are you sure you want to forfeit this battle?")) {
        window.closeBattle();
    }
};

window.closeBattle = function() {
    window.battleState = null;
    const battleModal = document.getElementById('battleModal');
    if (battleModal) battleModal.style.display = 'none';
};