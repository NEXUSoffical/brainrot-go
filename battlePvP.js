// battlePvP.js - Real-Time Online PvP Combat & Room Sync Engine

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
        padding: 15px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
        overflow: hidden !important;
    `;

    if (typeof firebase === 'undefined' || !firebase.firestore) {
        alert("Firebase error: Firestore not available.");
        return;
    }

    const db = firebase.firestore();
    window.pvpBattleState.unsubscribeMatch = db.collection('active_matches').doc(matchId).onSnapshot((doc) => {
        if (!doc.exists) {
            console.warn("Match room closed or deleted.");
            return;
        }

        const matchData = doc.data();
        try {
            renderPvPArena(matchData);
        } catch (err) {
            console.error("Error rendering PvP arena:", err);
            modal.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                    <h2 style="color: #ff0055; margin-bottom: 10px;">⚠️ SYNC ERROR</h2>
                    <p style="color: #aaa; margin-bottom: 20px;">${err.message}</p>
                    <button onclick="window.exitPvPBattle()" style="padding: 10px 20px; background: #ff0055; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-family: monospace;">RETURN TO MAP</button>
                </div>
            `;
        }
    }, (error) => {
        console.error("Match subscription error:", error);
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

    const myHpPercent = Math.max(0, Math.min(100, (myActiveRot.currentHp / myActiveRot.maxHp) * 100));
    const enemyHpPercent = Math.max(0, Math.min(100, (enemyActiveRot.currentHp / enemyActiveRot.maxHp) * 100));

    const isMyTurn = matchData.turn === myData.username;
    const isGameOver = matchData.winner !== null && matchData.winner !== undefined;

    if (isGameOver) {
        const isWinner = matchData.winner === myData.username;
        modal.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h1 style="color: ${isWinner ? '#00ff55' : '#ff0055'}; font-size: 2.2rem; margin-bottom: 10px;">${isWinner ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
                <p style="font-size: 1rem; color: #fff; margin-bottom: 20px;">${isWinner ? 'You crushed your online opponent!' : 'Your squad was defeated in online PvP.'}</p>
                <button onclick="window.exitPvPBattle()" style="padding: 12px 30px; background: ${isWinner ? '#00ff55' : '#ff0055'}; color: ${isWinner ? '#000' : '#fff'}; border: none; border-radius: 10px; font-weight: bold; font-size: 1.1rem; cursor: pointer; font-family: monospace;">
                    RETURN TO MAP
                </button>
            </div>
        `;
        return;
    }

    modal.innerHTML = `
        <style>
            @keyframes gridPulse { 0% { background-position: 0 0; } 100% { background-position: 0 50px; } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); filter: brightness(2); } 75% { transform: translateX(8px); filter: brightness(2); } }
            .anim-shake { animation: shake 0.4s ease-in-out; }
        </style>

        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #090314 0%, #1a0b36 50%, #05020a 100%); z-index: 1;"></div>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 0, 127, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 200, 0.1) 1px, transparent 1px); background-size: 40px 40px; animation: gridPulse 4s linear infinite; z-index: 2; pointer-events: none;"></div>

        <!-- HEADER / USERNAMES -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 650px; margin: 0 auto; background: rgba(15, 10, 30, 0.85); padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255, 0, 127, 0.5); z-index: 10; backdrop-filter: blur(8px);">
            <div style="text-align: left;">
                <div style="font-size: 0.7rem; color: #ff0055; font-weight: bold;">🔴 OPPONENT: ${enemyData.username}</div>
                <div style="font-size: 0.6rem; color: #aaa;">Active: ${enemyData.activeIndex + 1}/3</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.7rem; color: #00ff55; font-weight: bold;">🟢 YOU: ${myData.username}</div>
                <div style="font-size: 0.6rem; color: #aaa;">Active: ${myData.activeIndex + 1}/3</div>
            </div>
        </div>

        <!-- ARENA FIELD -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; width: 100%; max-width: 500px; margin: 0 auto; z-index: 10;">
            
            <!-- ENEMY CARD -->
            <div style="background: linear-gradient(180deg, #120826, #ff005544); border: 3px solid #ff0055; border-radius: 16px; padding: 12px; width: 190px; text-align: center; box-shadow: 0 0 25px #ff005566; transform: scale(0.85);">
                <div style="font-size: 0.8rem; color: #ff0055; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">${activeEnemyRot.name}</div>
                <div style="width: 100%; height: 100px; background: #1a102f; border-radius: 8px; overflow: hidden; margin-bottom: 6px;">
                    <img src="${activeEnemyRot.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';">
                </div>
                <div style="width: 100%; height: 8px; background: #111; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin-bottom: 4px;">
                    <div style="width: ${enemyHpPercent}%; height: 100%; background: #ff0055; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.6rem; color: #aaa; text-align: right;">${activeEnemyRot.currentHp} / ${activeEnemyRot.maxHp} HP</div>
            </div>

            <!-- LIVE LOG CHAT -->
            <div style="background: rgba(15, 10, 30, 0.95); border: 2px solid #00ff55; padding: 12px 18px; border-radius: 12px; width: 100%; max-width: 420px; text-align: center; font-size: 0.85rem; color: #00ff55; box-shadow: 0 0 20px rgba(0,255,85,0.3); font-weight: bold;">
                ${matchData.lastAction || "Match in progress..."} <br>
                <span style="font-size: 0.75rem; color: ${isMyTurn ? '#00ff55' : '#ffcc00'};">${isMyTurn ? "👉 Your Turn!" : "⏳ Opponent's Turn..."}</span>
            </div>

            <!-- PLAYER CARD -->
            <div style="background: linear-gradient(180deg, #120826, #00ff5544); border: 4px solid #00ff55; border-radius: 18px; padding: 14px; width: 220px; text-align: center; box-shadow: 0 0 35px #00ff5577;">
                <div style="font-size: 0.9rem; color: #00ff55; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">${myActiveRot.name}</div>
                <div style="width: 100%; height: 120px; background: #1a102f; border-radius: 10px; overflow: hidden; margin-bottom: 8px;">
                    <img src="${myActiveRot.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';">
                </div>
                <div style="width: 100%; height: 10px; background: #111; border-radius: 5px; overflow: hidden; border: 1px solid #444; margin-bottom: 4px;">
                    <div style="width: ${myHpPercent}%; height: 100%; background: #00ff55; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.65rem; color: #aaa; text-align: right;">${myActiveRot.currentHp} / ${myActiveRot.maxHp} HP</div>
            </div>

        </div>

        <!-- CONTROLS -->
        <div style="width: 100%; max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; z-index: 10;">
            <button onclick="window.executePvPAttack()" ${!isMyTurn ? 'disabled' : ''} style="width: 100%; padding: 14px; background: ${isMyTurn ? '#ff0055' : '#333'}; color: #fff; border: none; border-radius: 10px; font-weight: bold; font-size: 1.1rem; cursor: ${isMyTurn ? 'pointer' : 'not-allowed'}; font-family: monospace;">
                ${isMyTurn ? '⚔️ ATTACK OPPONENT' : '⏳ WAITING FOR OPPONENT...'}
            </button>
            <button onclick="window.exitPvPBattle()" style="width: 100%; padding: 10px; background: rgba(30, 20, 50, 0.9); color: #ccc; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;">
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
    
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(matchRef);
            if (!doc.exists) throw "Match does not exist!";

            const data = doc.data();
            const myKey = role === 'player1' ? 'player1' : 'player2';
            const enemyKey = role === 'player1' ? 'player2' : 'player1';

            const myData = data[myKey];
            const enemyData = data[enemyKey];

            if (data.turn !== myData.username) return;

            const myRot = myData.squad[myData.activeIndex];
            const enemyRot = enemyData.squad[enemyData.activeIndex];

            const dmg = Math.max(10, Math.floor(myRot.atk * (0.8 + Math.random() * 0.4)));
            enemyRot.currentHp = Math.max(0, enemyRot.currentHp - dmg);

            let nextEnemyActiveIndex = enemyData.activeIndex;
            let winner = data.winner;

            if (enemyRot.currentHp <= 0) {
                if (nextEnemyActiveIndex < enemyData.squad.length - 1) {
                    nextEnemyActiveIndex++;
                } else {
                    winner = myData.username;
                }
            }

            const updates = {};
            updates[`${enemyKey}.squad`] = enemyData.squad;
            updates[`${enemyKey}.activeIndex`] = nextEnemyActiveIndex;
            updates['turn'] = enemyData.username;
            updates['lastAction'] = `${myData.username}'s ${myRot.name} dealt ${dmg} damage to ${enemyRot.name}!`;
            updates['winner'] = winner;

            transaction.update(matchRef, updates);
        });
    } catch (err) {
        console.error("Transaction failed: ", err);
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