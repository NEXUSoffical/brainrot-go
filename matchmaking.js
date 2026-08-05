// matchmaking.js - Real-Time Online PvP Queue & Match Sync System (Instant Room Sync Fix)

if (typeof window.matchmakingState === 'undefined') {
    window.matchmakingState = {
        searching: false,
        matchId: null,
        unsubscribeQueue: null,
        unsubscribeMatch: null,
        isHost: false
    };
}

// Helper to clean objects of undefined fields for Firestore
function sanitizeForFirebase(data) {
    return JSON.parse(JSON.stringify(data, (key, value) => (value === undefined ? null : value)));
}

window.startOnlineMatchmaking = async function() {
    let squad = window.playerBattleSquad;
    if (!squad || squad.length !== 3) {
        alert("⚠️ You must select 3 Rots in your battle squad first!");
        if (typeof openTeamSelect === 'function') openTeamSelect('pvp');
        return;
    }

    if (typeof firebase === 'undefined' || !firebase.firestore) {
        alert("❌ Firebase is not connected. Cannot join online matchmaking.");
        return;
    }

    const username = (typeof playerData !== 'undefined' && playerData.username) ? playerData.username : "player_" + Math.floor(Math.random()*1000);

    // Show searching modal
    let modal = document.getElementById('matchmakingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'matchmakingModal';
        document.body.appendChild(modal);
    }

    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(5, 2, 10, 0.95) !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: monospace !important;
        color: #fff !important;
        text-align: center !important;
        padding: 20px !important;
    `;

    modal.innerHTML = `
        <div style="background: #111; border: 3px solid #00ff55; border-radius: 20px; padding: 30px; max-width: 400px; width: 100%; box-shadow: 0 0 30px rgba(0,255,85,0.4);">
            <h2 style="color: #00ff55; font-size: 1.4rem; margin-bottom: 15px;">🌐 ONLINE PVP QUEUE</h2>
            <div style="font-size: 3rem; margin: 15px 0;">🔍</div>
            <p id="matchStatusText" style="font-size: 0.9rem; color: #ccc; margin-bottom: 20px;">Searching for live opponent...</p>
            <button onclick="cancelMatchmaking()" style="background: #ff0055; color: #fff; border: none; padding: 12px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%; font-family: monospace; font-size: 1rem;">CANCEL</button>
        </div>
    `;

    window.matchmakingState.searching = true;
    const db = firebase.firestore();

    try {
        const queueRef = db.collection('matchmaking_queue');
        const snapshot = await queueRef.where('status', '==', 'waiting').get();

        let opponentData = null;
        let opponentDocId = null;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.username !== username && !opponentData) {
                opponentData = data;
                opponentDocId = doc.id;
            }
        });

        const cleanSquad = sanitizeForFirebase(squad);

        if (opponentData && opponentDocId) {
            const matchId = "match_" + Date.now() + "_" + Math.floor(Math.random()*1000);
            
            const matchData = {
                matchId: matchId,
                status: 'active',
                createdAt: Date.now(),
                player1: {
                    username: opponentData.username,
                    squad: opponentData.squad,
                    activeIndex: 0,
                    faintedCount: 0
                },
                player2: {
                    username: username,
                    squad: cleanSquad,
                    activeIndex: 0,
                    faintedCount: 0
                },
                turn: opponentData.username,
                lastAction: "Match started! " + opponentData.username + " vs " + username,
                winner: null
            };

            await db.collection('active_matches').doc(matchId).set(sanitizeForFirebase(matchData));
            await queueRef.doc(opponentDocId).delete();

            window.matchmakingState.matchId = matchId;
            window.matchmakingState.isHost = false;

            if (modal) modal.remove();
            if (typeof window.startPvPBattleScene === 'function') {
                window.startPvPBattleScene(matchId, 'player2');
            }

        } else {
            const myQueueRef = await queueRef.add(sanitizeForFirebase({
                username: username,
                squad: cleanSquad,
                status: 'waiting',
                timestamp: Date.now()
            }));

            window.matchmakingState.myQueueId = myQueueRef.id;

            // Listen globally to active matches to instantly pick up when a room is created for us
            window.matchmakingState.unsubscribeQueue = db.collection('active_matches')
                .where('status', '==', 'active')
                .onSnapshot(async (snapshot) => {
                    snapshot.forEach(async (docSnap) => {
                        const mData = docSnap.data();
                        if ((mData.player1 && mData.player1.username === username) || (mData.player2 && mData.player2.username === username)) {
                            if (window.matchmakingState.searching) {
                                window.matchmakingState.searching = false;
                                if (window.matchmakingState.unsubscribeQueue) {
                                    window.matchmakingState.unsubscribeQueue();
                                    window.matchmakingState.unsubscribeQueue = null;
                                }
                                try { await myQueueRef.delete(); } catch(e){}

                                window.matchmakingState.matchId = docSnap.id;
                                window.matchmakingState.isHost = true;

                                if (modal) modal.remove();

                                const assignedRole = mData.player1.username === username ? 'player1' : 'player2';
                                if (typeof window.startPvPBattleScene === 'function') {
                                    window.startPvPBattleScene(docSnap.id, assignedRole);
                                }
                            }
                        }
                    });
                });
        }

    } catch (err) {
        console.error("Matchmaking error:", err);
        alert("Matchmaking error: " + err.message);
        cancelMatchmaking();
    }
};

window.cancelMatchmaking = async function() {
    window.matchmakingState.searching = false;
    if (window.matchmakingState.unsubscribeQueue) {
        window.matchmakingState.unsubscribeQueue();
        window.matchmakingState.unsubscribeQueue = null;
    }

    if (window.matchmakingState.myQueueId && typeof firebase !== 'undefined') {
        try {
            await firebase.firestore().collection('matchmaking_queue').doc(window.matchmakingState.myQueueId).delete();
        } catch (e) {}
    }

    const modal = document.getElementById('matchmakingModal');
    if (modal) modal.remove();
};