// battlePvP.js - Real-Time Online PvP Engine with Unique Signature Moves & Dynamic VFX

if (typeof window.pvpBattleState === 'undefined') {
    window.pvpBattleState = null;
}

window.startPvPBattleScene = function(matchId, role) {
    let squad = window.playerBattleSquad;
    if (!squad || squad.length !== 3) {
        alert("Battle squad missing!");
        return;
    }

    squad.forEach(rot => rot.animClass = '');

    window.pvpBattleState = {
        matchId: matchId,
        role: role, // 'player1' or 'player2'
        unsubscribeMatch: null,
        activeQteMultiplier: 1.0
    };

    let modal = document.getElementById('battlePvPModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battlePvPModal';
        document.body.appendChild(modal);
    }

    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: radial-gradient(circle at center, #180829 0%, #05010a 100%) !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        padding: 12px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
        overflow: hidden !important;
    `;

    modal.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <h1 style="color: #00ff55; font-size: 1.3rem; margin-bottom: 10px;">🌐 CONNECTING TO MATCH...</h1>
            <p style="color: #aaa; font-size: 0.8rem;">Syncing arena state with opponent...</p>
        </div>
    `;

    const db = firebase.firestore();
    window.pvpBattleState.unsubscribeMatch = db.collection('active_matches').doc(matchId).onSnapshot((doc) => {
        if (!doc.exists) {
            alert("⚠️ Match room was closed.");
            window.exitPvPBattle();
            return;
        }

        const matchData = doc.data();
        try {
            window.renderPvPArena(matchData);
        } catch (err) {
            console.error("PvP Render Error:", err);
            modal.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
                    <h2 style="color: #ff0055; margin-bottom: 10px;">⚠️ RENDER ERROR</h2>
                    <p style="font-size: 0.75rem; color: #ccc; margin-bottom: 20px;">${err.message}</p>
                    <button onclick="window.exitPvPBattle()" style="padding: 10px 20px; background: #ff0055; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">EXIT BATTLE</button>
                </div>
            `;
        }
    });
};

window.renderPvPArena = function(matchData) {
    const modal = document.getElementById('battlePvPModal');
    if (!modal) return;

    const role = window.pvpBattleState.role;
    const myData = role === 'player1' ? matchData.player1 : matchData.player2;
    const enemyData = role === 'player1' ? matchData.player2 : matchData.player1;

    if (!myData || !enemyData || !myData.squad || !enemyData.squad) return;

    const myActiveRot = myData.squad[myData.activeIndex] || myData.squad[0];
    const enemyActiveRot = enemyData.squad[enemyData.activeIndex] || enemyData.squad[0];

    const myHpPercent = Math.max(0, Math.min(100, ((myActiveRot.currentHp || 0) / (myActiveRot.maxHp || 100)) * 100));
    const enemyHpPercent = Math.max(0, Math.min(100, ((enemyActiveRot.currentHp || 0) / (enemyActiveRot.maxHp || 100)) * 100));

    const enemyRarityColor = typeof getRarityColor === 'function' ? getRarityColor(enemyActiveRot.rarity) : '#ff0055';
    const playerRarityColor = typeof getRarityColor === 'function' ? getRarityColor(myActiveRot.rarity) : '#00ff55';

    // Fallback safely to entity types if element function is missing
    const myElem = myActiveRot.type || 'paranormal';
    const enemyElem = enemyActiveRot.type || 'paranormal';

    const isMyTurn = matchData.turn === myData.username;
    const isGameOver = matchData.winner !== null && matchData.winner !== undefined;

    // Signature Move Retrieval
    const myMove = myActiveRot.move || (typeof window.getEntitySignatureMove === 'function' ? window.getEntitySignatureMove(myActiveRot.name) : { name: "Signature Move", icon: "✨" });

    const myPartyDots = myData.squad.map((r, i) => `
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${r.currentHp > 0 ? '#00ff55' : '#ff0055'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: bold; color: #000; box-shadow: 0 0 5px ${r.currentHp > 0 ? '#00ff55' : '#ff0055'};">
            ${i + 1}
        </div>
    `).join('');

    const enemyPartyDots = enemyData.squad.map((r, i) => `
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${r.currentHp > 0 ? '#ff0055' : '#444'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: bold; color: #fff; box-shadow: 0 0 5px ${r.currentHp > 0 ? '#ff0055' : '#444'};">
            ${i + 1}
        </div>
    `).join('');

    if (isGameOver) {
        const isWinner = matchData.winner === myData.username;
        modal.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h1 style="color: ${isWinner ? '#00ff55' : '#ff0055'}; font-size: 2.5rem; margin-bottom: 10px; text-shadow: 0 0 20px ${isWinner ? '#00ff55' : '#ff0055'};">${isWinner ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
                <p style="font-size: 1rem; color: #fff; margin-bottom: 30px;">${isWinner ? 'You crushed your online opponent!' : 'Your squad was defeated in online PvP.'}</p>
                <button onclick="window.exitPvPBattle()" style="padding: 15px 40px; background: ${isWinner ? '#00ff55' : '#ff0055'}; color: ${isWinner ? '#000' : '#fff'}; border: none; border-radius: 12px; font-weight: bold; font-size: 1.1rem; cursor: pointer; font-family: monospace; box-shadow: 0 0 20px ${isWinner ? '#00ff55' : '#ff0055'};">
                    RETURN TO MAP
                </button>
            </div>
        `;
        return;
    }

    modal.innerHTML = `
        <style>
            @keyframes floatIdle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            @keyframes strikeAttack {
                0% { transform: scale(1) translateY(0); }
                40% { transform: scale(1.15) translateY(-25px); filter: brightness(1.3); }
                100% { transform: scale(1) translateY(0); }
            }
            @keyframes damageFlash {
                0%, 100% { transform: scale(1); filter: none; }
                25% { transform: scale(0.92) translateX(-6px); filter: brightness(2.5) drop-shadow(0 0 20px #ff0000); }
                75% { transform: scale(0.92) translateX(6px); filter: brightness(2.5) drop-shadow(0 0 20px #ff0000); }
            }
            @keyframes gridPulse {
                0% { background-position: 0 0; }
                100% { background-position: 0 50px; }
            }
            @keyframes qteSlidePvP {
                0% { left: 0%; }
                50% { left: 90%; }
                100% { left: 0%; }
            }
            .qte-marker-pvp {
                position: absolute; top: 0; width: 6px; height: 100%; background: #fff;
                box-shadow: 0 0 10px #00ffff; animation: qteSlidePvP 1.1s infinite ease-in-out;
            }
            .qte-target-zone-pvp {
                position: absolute; top: 0; left: 62% !important; width: 22% !important; height: 100%;
                background: rgba(0, 255, 128, 0.45); border-left: 2px dashed #00ff80; border-right: 2px dashed #00ff80;
            }
            .fighter-float { animation: floatIdle 3s ease-in-out infinite; }
            .anim-strike { animation: strikeAttack 0.35s ease-out; }
            .anim-flash { animation: damageFlash 0.35s ease-in-out; }
        </style>

        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 0, 127, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 200, 0.05) 1px, transparent 1px); background-size: 40px 40px; animation: gridPulse 4s linear infinite; z-index: 2; pointer-events: none;" id="pvpFxContainer"></div>

        <!-- TOP HUD -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 550px; margin: 0 auto; background: rgba(15, 10, 30, 0.9); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255, 0, 127, 0.4); z-index: 10; backdrop-filter: blur(8px);">
            <div style="text-align: left;">
                <div style="font-size: 0.65rem; color: #ff0055; font-weight: bold; margin-bottom: 4px;">🔴 ${enemyData.username || 'Enemy'} [${enemyElem.toUpperCase()}]</div>
                <div style="display: flex; gap: 6px;">${enemyPartyDots}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold; margin-bottom: 4px;">🟢 ${myData.username || 'You'} [${myElem.toUpperCase()}]</div>
                <div style="display: flex; gap: 6px; justify-content: flex-end;">${myPartyDots}</div>
            </div>
        </div>

        <!-- CINEMATIC FIELD -->
        <div id="arenaField" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 15px 0; width: 100%; max-width: 450px; margin: 0 auto; z-index: 10; position: relative;">
            
            <!-- ENEMY FIGHTER -->
            <div id="pvpEnemyCombatant" class="fighter-float" style="display: flex; flex-direction: column; align-items: center;">
                <div style="font-size: 0.75rem; color: ${enemyRarityColor}; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; text-shadow: 0 0 8px ${enemyRarityColor};">${enemyActiveRot.name || 'Enemy'} (Lvl ${enemyActiveRot.level || 1})</div>
                <div style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 15px ${enemyRarityColor}aa);">
                    <img src="${enemyActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: contain; background: transparent !important;" onerror="this.style.display='none';">
                </div>
                <div class="hp-badge" style="background: rgba(10, 10, 10, 0.85); border: 2px solid #ff007f; border-radius: 10px; padding: 6px 10px; min-width: 150px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-top: 4px;">
                    <div class="hp-bar-outer" style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin: 2px 0;"><div style="width: ${enemyHpPercent}%; height: 100%; background: linear-gradient(90deg, #ff0055, #ff5500); transition: width 0.3s ease-out; box-shadow: 0 0 8px #ff0055;"></div></div>
                    <div style="font-size: 0.55rem; color: #aaa; text-align: right;">${Math.ceil(enemyActiveRot.currentHp || 0)} / ${enemyActiveRot.maxHp || 100} HP</div>
                </div>
            </div>

            <!-- ACTION LOG -->
            <div style="background: rgba(15, 10, 30, 0.95); border-left: 3px solid #00ccff; padding: 10px 14px; border-radius: 6px; width: 100%; max-width: 400px; text-align: center; font-size: 0.8rem; color: #00ccff; font-weight: bold; box-shadow: 0 0 15px rgba(0,204,255,0.2);">
                ${matchData.lastAction || "Match in progress..."} <br>
                <div style="font-size: 0.7rem; color: ${isMyTurn ? '#00ff55' : '#ffcc00'}; margin-top: 5px;">${isMyTurn ? "👉 Your Turn! Choose QTE or Attack!" : "⏳ Opponent's Turn..."}</div>
            </div>

            <!-- PLAYER FIGHTER -->
            <div id="pvpPlayerCombatant" class="fighter-float" style="display: flex; flex-direction: column; align-items: center;">
                <div style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 20px ${playerRarityColor}aa);">
                    <img src="${myActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: contain; background: transparent !important;" onerror="this.style.display='none';">
                </div>
                <div class="hp-badge" style="background: rgba(10, 10, 10, 0.85); border: 2px solid #76ff03; border-radius: 10px; padding: 6px 10px; min-width: 150px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-top: 4px;">
                    <div style="font-weight: bold; font-size: 0.75rem; color: ${playerRarityColor}; text-align: center; margin-bottom: 2px;">${myActiveRot.name || 'Fighter'} (Lvl ${myActiveRot.level || 1})</div>
                    <div class="hp-bar-outer" style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin: 2px 0;"><div style="width: ${myHpPercent}%; height: 100%; background: linear-gradient(90deg, #00ff80, #00ffff); transition: width 0.3s ease-out; box-shadow: 0 0 10px #00ff55;"></div></div>
                    <div style="font-size: 0.55rem; color: #aaa; text-align: right;">${Math.ceil(myActiveRot.currentHp || 0)} / ${myActiveRot.maxHp || 100} HP</div>
                </div>
            </div>

        </div>

        <!-- CONTROLS -->
        <div style="width: 100%; max-width: 400px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; z-index: 10;">
            <button onclick="window.openPvPQTEPrompt()" ${!isMyTurn ? 'disabled' : ''} style="padding: 14px; background: ${isMyTurn ? '#9900ff' : '#333'}; color: #fff; border: none; border-radius: 10px; font-weight: bold; font-size: 0.95rem; cursor: ${isMyTurn ? 'pointer' : 'not-allowed'}; font-family: monospace; box-shadow: ${isMyTurn ? '0 0 15px rgba(153,0,255,0.4)' : 'none'};">
                🎯 Critical QTE
            </button>
            <button onclick="window.executePvPAttack()" ${!isMyTurn ? 'disabled' : ''} style="padding: 14px; background: ${isMyTurn ? 'linear-gradient(135deg, #ff0055, #ff5500)' : '#333'}; color: #fff; border: none; border-radius: 10px; font-weight: bold; font-size: 0.9rem; cursor: ${isMyTurn ? 'pointer' : 'not-allowed'}; font-family: monospace; box-shadow: ${isMyTurn ? '0 0 15px rgba(255,0,85,0.4)' : 'none'}; text-transform: uppercase;">
                ${move.icon} ${move.name}
            </button>
            <button onclick="window.exitPvPBattle()" style="grid-column: span 2; padding: 12px; background: rgba(30, 20, 50, 0.9); color: #ccc; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                🏃 SURRENDER / LEAVE
            </button>
        </div>
    `;
};

// ==========================================
// 🎯 TIMING QTE FOR ONLINE COMBAT
// ==========================================
window.openPvPQTEPrompt = function() {
    const matchId = window.pvpBattleState.matchId;
    const role = window.pvpBattleState.role;
    
    firebase.firestore().collection('active_matches').doc(matchId).get().then(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        const myData = role === 'player1' ? data.player1 : data.player2;
        if (data.turn !== myData.username) return;

        let qteModal = document.getElementById('pvpQteModal');
        if (!qteModal) {
            qteModal = document.createElement('div');
            qteModal.id = 'pvpQteModal';
            qteModal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.85); z-index: 999999999; display: flex;
                flex-direction: column; align-items: center; justify-content: center;
                font-family: monospace; color: #fff;
            `;
            document.body.appendChild(qteModal);
        }

        qteModal.innerHTML = `
            <div style="background: #110a1c; border: 3px solid #00ff80; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 340px; box-shadow: 0 0 30px rgba(0,255,128,0.4);">
                <h3 style="color: #00ff80; margin-bottom: 8px; font-size: 1.2rem;">CRITICAL TIMING STRIKE!</h3>
                <p style="font-size: 0.8rem; margin-bottom: 15px; color: #ccc;">Strike when the marker aligns with the green zone!</p>
                <div id="qteTrack" style="position: relative; width: 100%; height: 36px; background: #222; border-radius: 6px; overflow: hidden; margin-bottom: 20px; border: 1px solid #444;">
                    <div class="qte-target-zone-pvp"></div>
                    <div id="movingPvPQteMarker" class="qte-marker-pvp"></div>
                </div>
                <button onclick="window.resolvePvPQTE()" style="background: linear-gradient(135deg, #00ff80, #00ffff); color: #000; font-weight: 900; border: none; padding: 14px 20px; border-radius: 8px; width: 100%; cursor: pointer; font-size: 1.05rem; font-family: monospace;">⚡ STRIKE NOW!</button>
            </div>
        `;
        qteModal.style.display = 'flex';
    });
};

window.resolvePvPQTE = function() {
    const marker = document.getElementById('movingPvPQteMarker');
    const qteModal = document.getElementById('pvpQteModal');
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
    window.pvpBattleState.activeQteMultiplier = multiplier;

    window.executePvPAttack();
};

// ==========================================
// 💥 ONLINE ATTACK SYNC EXECUTION
// ==========================================
window.executePvPAttack = async function() {
    const matchId = window.pvpBattleState.matchId;
    const role = window.pvpBattleState.role;
    const qteMult = window.pvpBattleState.activeQteMultiplier || 1.0;
    window.pvpBattleState.activeQteMultiplier = 1.0; // Reset

    const db = firebase.firestore();
    const matchRef = db.collection('active_matches').doc(matchId);
    const doc = await matchRef.get();
    if (!doc.exists) return;

    const data = doc.data();
    const myData = role === 'player1' ? data.player1 : data.player2;
    const enemyData = role === 'player1' ? data.player2 : data.player1;

    if (data.turn !== myData.username) return;

    const myRot = myData.squad[myData.activeIndex];
    const enemyRot = enemyData.squad[enemyData.activeIndex];

    // Grab signature move dynamically
    const move = myRot.move || (typeof window.getEntitySignatureMove === 'function' ? window.getEntitySignatureMove(myRot.name) : { name: "Paranormal Strike", icon: "✨" });

    // SFX
    if (window.gameAudio && typeof window.gameAudio.playHit === 'function') {
        window.gameAudio.playHit();
    }

    const finalizePvPStrike = async () => {
        // Base type interactions
        let typeMod = 1.0;
        if (myRot.type === 'water' && enemyRot.type === 'fire') typeMod = 1.5;
        if (myRot.type === 'fire' && enemyRot.type === 'forest') typeMod = 1.5;

        const rawDmg = Math.floor((myRot.atk || 15) * (0.8 + Math.random() * 0.4) * qteMult * typeMod);
        const dmg = Math.max(10, rawDmg);
        
        enemyRot.currentHp = Math.max(0, enemyRot.currentHp - dmg);

        let nextEnemyActiveIndex = enemyData.activeIndex;
        let winner = data.winner || null;

        if (enemyRot.currentHp <= 0) {
            if (nextEnemyActiveIndex < enemyData.squad.length - 1) {
                nextEnemyActiveIndex++;
            } else {
                winner = myData.username;
            }
        }

        const nextTurnUser = enemyData.username;
        let qteText = qteMult >= 2.0 ? ` 💥 CRITICAL HIT!` : (qteMult > 1.0 ? " ⚡ BOOSTED!" : "");
        let typeText = typeMod > 1.0 ? " [Super Effective!]" : "";
        const actionLog = `${move.icon} ${myRot.name} unleashed ${move.name} for ${dmg} damage!${qteText}${typeText}`;

        const updates = {};
        if (role === 'player1') {
            updates['player2.squad'] = enemyData.squad;
            updates['player2.activeIndex'] = nextEnemyActiveIndex;
        } else {
            updates['player1.squad'] = enemyData.squad;
            updates['player1.activeIndex'] = nextEnemyActiveIndex;
        }

        updates['turn'] = nextTurnUser;
        updates['lastAction'] = actionLog;
        updates['winner'] = winner;

        await matchRef.update(updates);
    };

    // Apply Strike Animation locally before syncing
    const playerBox = document.getElementById('pvpPlayerCombatant');
    const enemyBox = document.getElementById('pvpEnemyCombatant');
    
    if (playerBox) playerBox.classList.add('anim-strike');
    
    setTimeout(async () => {
        if (enemyBox) enemyBox.classList.add('anim-flash');
        
        setTimeout(async () => {
            if (playerBox) playerBox.classList.remove('anim-strike');
            if (enemyBox) enemyBox.classList.remove('anim-flash');
            await finalizePvPStrike();
        }, 400);
    }, 150);
};

// ==========================================
// 🚪 EXIT BATTLE
// ==========================================
window.exitPvPBattle = function() {
    if (window.pvpBattleState && window.pvpBattleState.unsubscribeMatch) {
        window.pvpBattleState.unsubscribeMatch();
    }
    window.pvpBattleState = null;

    const modal = document.getElementById('battlePvPModal');
    if (modal) modal.remove();

    if (typeof updateHUD === 'function') updateHUD();
};