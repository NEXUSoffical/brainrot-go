// battlePvP.js - Real-Time Online PvP Combat & Room Sync Engine (Robust Load Fix)

if (typeof window.pvpBattleState === 'undefined') {
    window.pvpBattleState = null;
}

window.startPvPBattleScene = function(matchId, role) {
    let squad = window.playerBattleSquad;
    if (!squad || squad.length !== 3) {
        alert("Battle squad missing!");
        return;
    }

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

    const isMyTurn = matchData.turn === myData.username;
    const isGameOver = matchData.winner !== null && matchData.winner !== undefined;

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
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 500px; margin: 0 auto; background: rgba(15, 10, 30, 0.9); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 0, 127, 0.4);">
            <div style="text-align: left;">
                <div style="font-size: 0.65rem; color: #ff0055; font-weight: bold;">🔴 ${enemyData.username || 'Enemy'}</div>
                <div style="font-size: 0.55rem; color: #aaa;">Fighter ${(enemyData.activeIndex || 0) + 1}/3</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">🟢 ${myData.username || 'You'}</div>
                <div style="font-size: 0.55rem; color: #aaa;">Fighter ${(myData.activeIndex || 0) + 1}/3</div>
            </div>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; width: 100%; max-width: 450px; margin: 0 auto;">
            
            <!-- ENEMY CARD -->
            <div style="background: #120826; border: 2px solid #ff0055; border-radius: 12px; padding: 10px; width: 170px; text-align: center; box-shadow: 0 0 15px #ff005544;">
                <div style="font-size: 0.75rem; color: #ff0055; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">${enemyActiveRot.name || 'Enemy'}</div>
                <div style="width: 100%; height: 80px; background: #1a102f; border-radius: 6px; overflow: hidden; margin-bottom: 6px;">
                    <img src="${enemyActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';">
                </div>
                <div style="width: 100%; height: 6px; background: #111; border-radius: 3px; overflow: hidden; border: 1px solid #444; margin-bottom: 3px;">
                    <div style="width: ${enemyHpPercent}%; height: 100%; background: #ff0055; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.55rem; color: #aaa; text-align: right;">${enemyActiveRot.currentHp || 0} / ${enemyActiveRot.maxHp || 100} HP</div>
            </div>

            <!-- ACTION LOG -->
            <div style="background: rgba(15, 10, 30, 0.95); border: 2px solid #00ff55; padding: 10px 14px; border-radius: 10px; width: 100%; max-width: 380px; text-align: center; font-size: 0.75rem; color: #00ff55; font-weight: bold;">
                ${matchData.lastAction || "Match in progress..."} <br>
                <span style="font-size: 0.7rem; color: ${isMyTurn ? '#00ff55' : '#ffcc00'};">${isMyTurn ? "👉 Your Turn to Attack!" : "⏳ Opponent's Turn..."}</span>
            </div>

            <!-- PLAYER CARD -->
            <div style="background: #120826; border: 2px solid #00ff55; border-radius: 12px; padding: 10px; width: 170px; text-align: center; box-shadow: 0 0 15px #00ff5544;">
                <div style="font-size: 0.75rem; color: #00ff55; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">${myActiveRot.name || 'Fighter'}</div>
                <div style="width: 100%; height: 80px; background: #1a102f; border-radius: 6px; overflow: hidden; margin-bottom: 6px;">
                    <img src="${myActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';">
                </div>
                <div style="width: 100%; height: 6px; background: #111; border-radius: 3px; overflow: hidden; border: 1px solid #444; margin-bottom: 3px;">
                    <div style="width: ${myHpPercent}%; height: 100%; background: #00ff55; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.55rem; color: #aaa; text-align: right;">${myActiveRot.currentHp || 0} / ${myActiveRot.maxHp || 100} HP</div>
            </div>

        </div>

        <!-- CONTROLS -->
        <div style="width: 100%; max-width: 380px; margin: 0 auto; display: flex; flex-direction: column; gap: 6px;">
            <button onclick="window.executePvPAttack()" ${!isMyTurn ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${isMyTurn ? '#ff0055' : '#333'}; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 0.95rem; cursor: ${isMyTurn ? 'pointer' : 'not-allowed'}; font-family: monospace;">
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

window.exitPvPBattle = function() {
    if (window.pvpBattleState && window.pvpBattleState.unsubscribeMatch) {
        window.pvpBattleState.unsubscribeMatch();
    }
    window.pvpBattleState = null;

    const modal = document.getElementById('battlePvPModal');
    if (modal) modal.remove();

    if (typeof updateHUD === 'function') updateHUD();
};