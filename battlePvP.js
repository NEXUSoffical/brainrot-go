// battlePvP.js - Real-Time Online PvP Combat & Room Sync Engine with Custom Character Abilities

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
        unsubscribeMatch: null
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
        background: #05020a !important;
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

    const isMyTurn = matchData.turn === myData.username;
    const isGameOver = matchData.winner !== null && matchData.winner !== undefined;

    const myPartyDots = myData.squad.map((r, i) => `
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${r.currentHp > 0 ? '#00ff55' : '#ff0055'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: bold; color: #000;">
            ${i + 1}
        </div>
    `).join('');

    const enemyPartyDots = enemyData.squad.map((r, i) => `
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${r.currentHp > 0 ? '#ff0055' : '#444'}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: bold; color: #fff;">
            ${i + 1}
        </div>
    `).join('');

    if (isGameOver) {
        const isWinner = matchData.winner === myData.username;
        modal.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h1 style="color: ${isWinner ? '#00ff55' : '#ff0055'}; font-size: 2rem; margin-bottom: 10px;">${isWinner ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
                <p style="font-size: 0.9rem; color: #fff; margin-bottom: 20px;">${isWinner ? 'You crushed your online opponent!' : 'Your squad was defeated in online PvP.'}</p>
                <button onclick="window.exitPvPBattle()" style="padding: 12px 30px; background: ${isWinner ? '#00ff55' : '#ff0055'}; color: ${isWinner ? '#000' : '#fff'}; border: none; border-radius: 10px; font-weight: bold; font-size: 1rem; cursor: pointer; font-family: monospace;">
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
                25% { transform: scale(0.92) translateX(-6px); filter: brightness(2.5) drop-shadow(0 0 15px #ff0000); }
                75% { transform: scale(0.92) translateX(6px); filter: brightness(2.5) drop-shadow(0 0 15px #ff0000); }
            }
            @keyframes gridPulse {
                0% { background-position: 0 0; }
                100% { background-position: 0 50px; }
            }
            .fighter-float { animation: floatIdle 3s ease-in-out infinite; }
            .anim-strike { animation: strikeAttack 0.35s ease-out; }
            .anim-flash { animation: damageFlash 0.35s ease-in-out; }
        </style>

        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #090314 0%, #1a0b36 50%, #05020a 100%); z-index: 1;"></div>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 0, 127, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 200, 0.1) 1px, transparent 1px); background-size: 40px 40px; animation: gridPulse 4s linear infinite; z-index: 2; pointer-events: none;" id="pvpFxContainer"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 550px; margin: 0 auto; background: rgba(15, 10, 30, 0.9); padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255, 0, 127, 0.4); z-index: 10; backdrop-filter: blur(8px);">
            <div style="text-align: left;">
                <div style="font-size: 0.65rem; color: #ff0055; font-weight: bold; margin-bottom: 2px;">🔴 ${enemyData.username || 'Enemy'}</div>
                <div style="display: flex; gap: 4px;">${enemyPartyDots}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold; margin-bottom: 2px;">🟢 ${myData.username || 'You'}</div>
                <div style="display: flex; gap: 4px; justify-content: flex-end;">${myPartyDots}</div>
            </div>
        </div>

        <!-- CARD-FREE CINEMATIC FIELD -->
        <div id="arenaField" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 15px 0; width: 100%; max-width: 450px; margin: 0 auto; z-index: 10; position: relative;">
            
            <!-- ENEMY FIGHTER (CLEAN ART + HP BADGE) -->
            <div id="pvpEnemyCombatant" class="fighter-float" style="display: flex; flex-direction: column; align-items: center;">
                <div style="font-size: 0.75rem; color: ${enemyRarityColor}; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; text-shadow: 0 0 8px ${enemyRarityColor};">${enemyActiveRot.name || 'Enemy'}</div>
                <div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 15px ${enemyRarityColor}aa);">
                    <img src="${enemyActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: contain; background: transparent !important;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'transparent\'/><text x=\'50%\' y=\'50%\' fill=\'%23aaa\' font-size=\'12\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>';">
                </div>
                <div class="hp-badge" style="background: rgba(10, 10, 10, 0.85); border: 2px solid #ff007f; border-radius: 10px; padding: 6px 10px; min-width: 140px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-top: 4px;">
                    <div class="hp-bar-outer" style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin: 2px 0;"><div style="width: ${enemyHpPercent}%; height: 100%; background: #ff0055; transition: width 0.3s ease-out; box-shadow: 0 0 8px #ff0055;"></div></div>
                    <div style="font-size: 0.55rem; color: #aaa; text-align: right;">${enemyActiveRot.currentHp || 0} / ${enemyActiveRot.maxHp || 100} HP</div>
                </div>
            </div>

            <!-- ACTION LOG -->
            <div style="background: rgba(15, 10, 30, 0.95); border: 2px solid #00ff55; padding: 10px 14px; border-radius: 10px; width: 100%; max-width: 380px; text-align: center; font-size: 0.75rem; color: #00ff55; font-weight: bold; box-shadow: 0 0 15px rgba(0,255,85,0.2);">
                ${matchData.lastAction || "Match in progress..."} <br>
                <span style="font-size: 0.7rem; color: ${isMyTurn ? '#00ff55' : '#ffcc00'};">${isMyTurn ? "👉 Your Turn to Attack!" : "⏳ Opponent's Turn..."}</span>
            </div>

            <!-- PLAYER FIGHTER (CLEAN ART + HP BADGE) -->
            <div id="pvpPlayerCombatant" class="fighter-float" style="display: flex; flex-direction: column; align-items: center;">
                <div style="width: 130px; height: 130px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 20px ${playerRarityColor}aa);">
                    <img src="${myActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: contain; background: transparent !important;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'transparent\'/><text x=\'50%\' y=\'50%\' fill=\'%23aaa\' font-size=\'12\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>';">
                </div>
                <div class="hp-badge" style="background: rgba(10, 10, 10, 0.85); border: 2px solid #76ff03; border-radius: 10px; padding: 6px 10px; min-width: 140px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-top: 4px;">
                    <div style="font-weight: bold; font-size: 0.7rem; color: ${playerRarityColor}; text-align: center; margin-bottom: 2px;">${myActiveRot.name || 'Fighter'}</div>
                    <div class="hp-bar-outer" style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin: 2px 0;"><div style="width: ${myHpPercent}%; height: 100%; background: #00ff55; transition: width 0.3s ease-out; box-shadow: 0 0 10px #00ff55;"></div></div>
                    <div style="font-size: 0.55rem; color: #aaa; text-align: right;">${myActiveRot.currentHp || 0} / ${myActiveRot.maxHp || 100} HP</div>
                </div>
            </div>

        </div>

        <!-- CONTROLS -->
        <div style="width: 100%; max-width: 380px; margin: 0 auto; display: flex; flex-direction: column; gap: 6px; z-index: 10;">
            <button onclick="window.executePvPAttack()" ${!isMyTurn ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${isMyTurn ? '#ff0055' : '#333'}; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 0.95rem; cursor: ${isMyTurn ? 'pointer' : 'not-allowed'}; font-family: monospace; box-shadow: ${isMyTurn ? '0 0 15px #ff0055aa' : 'none'};">
                ${isMyTurn ? '⚔️ ATTACK OPPONENT' : '⏳ WAITING FOR OPPONENT...'}
            </button>
            <button onclick="window.exitPvPBattle()" style="width: 100%; padding: 8px; background: rgba(30, 20, 50, 0.9); color: #ccc; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.75rem;">
                🏃 SURRENDER / LEAVE
            </button>
        </div>
    `;
};

window.executePvPAttack = async function() {
    const matchId = window.pvpBattleState.matchId;
    const role = window.pvpBattleState.role;
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

    const fighterName = (myRot && myRot.name) ? myRot.name.toLowerCase().trim().replace(/[\s-]/g, '') : "";
    const isGodCloud = fighterName === "godcloud";
    const isCloud = fighterName.includes("cloud") && !isGodCloud;
    const isHashtagHell = fighterName === "hashtaghell";
    const isHashtagBase = fighterName === "hashtag" && !isHashtagHell;
    const isFomoDoom = fighterName === "fomodoom";
    const isFomo = fighterName === "fomophantom" && !isFomoDoom;

    const finalizePvPStrike = async () => {
        const dmg = Math.max(10, Math.floor((myRot.atk || 15) * (0.8 + Math.random() * 0.4)));
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
        const actionLog = `${myData.username}'s ${myRot.name} dealt ${dmg} dmg to ${enemyRot.name}!`;

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

    // Trigger specific custom attack animations if available, else use standard smooth strike
    if (isGodCloud && typeof window.playPlayerCloudAttack === 'function') {
        window.playPlayerCloudAttack(finalizePvPStrike, true);
    } else if (isCloud && typeof window.playPlayerCloudAttack === 'function') {
        window.playPlayerCloudAttack(finalizePvPStrike, false);
    } else if (isHashtagHell && typeof window.playPlayerHashtagHellAttack === 'function') {
        window.playPlayerHashtagHellAttack(finalizePvPStrike);
    } else if (isHashtagBase && typeof window.playPlayerHashtagBaseAttack === 'function') {
        window.playPlayerHashtagBaseAttack(finalizePvPStrike);
    } else if (isFomoDoom && typeof window.playPlayerFomoDoomAttack === 'function') {
        window.playPlayerFomoDoomAttack(finalizePvPStrike);
    } else if (isFomo && typeof window.playPlayerFomoAttack === 'function') {
        window.playPlayerFomoAttack(finalizePvPStrike);
    } else {
        const playerBox = document.getElementById('pvpPlayerCombatant');
        const enemyBox = document.getElementById('pvpEnemyCombatant');
        if (playerBox) playerBox.classList.add('anim-strike');
        if (enemyBox) enemyBox.classList.add('anim-flash');

        setTimeout(async () => {
            if (playerBox) playerBox.classList.remove('anim-strike');
            if (enemyBox) enemyBox.classList.remove('anim-flash');
            await finalizePvPStrike();
        }, 400);
    }
};

window.exitPvPBattle = function() {
    if (window.pvpBattleState && window.pvpBattleState.unsubscribeMatch) {
        window.pvpBattleState.unsubscribeMatch();
    }
    window.pvpBattleState = null;

    const modal = document.getElementById('battlePvPModal');
    if (modal) modal.remove();

    if (typeof updateHUD === 'function') updateHUD();
};