// matchmaking.js - Real-Time Online PvP Queue & Match Sync System (Atomic Pairing Fix)

if (typeof window.matchmakingState === 'undefined') {
    window.matchmakingState = {
        searching: false,
        matchId: null,
        unsubscribeQueue: null,
        unsubscribeMatch: null,
        isHost: false
    };
}

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
    const cleanSquad = sanitizeForFirebase(squad);

    try {
        const queueRef = db.collection('matchmaking_queue');

        // Add ourselves to the queue first
        const myQueueRef = await queueRef.add(sanitizeForFirebase({
            username: username,
            squad: cleanSquad,
            status: 'waiting',
            timestamp: Date.now()
        }));

        window.matchmakingState.myQueueId = myQueueRef.id;

        // Listen to queue changes to match instantly when another player appears
        window.matchmakingState.unsubscribeQueue = queueRef.orderBy('timestamp', 'asc').onSnapshot(async (snapshot) => {
            if (!window.matchmakingState.searching) return;

            let waitingPlayers = [];
            snapshot.forEach(doc => {
                if (doc.id !== window.matchmakingState.myQueueId) {
                    waitingPlayers.push({ id: doc.id, ...doc.data() });
                }
            });

            // If there is another player waiting in the queue, let's pair with the oldest one
            if (waitingPlayers.length > 0) {
                const opponent = waitingPlayers[0];

                // Attempt to claim the opponent by deleting their queue ticket atomically
                try {
                    await db.runTransaction(async (transaction) => {
                        const oppDoc = await transaction.get(queueRef.doc(opponent.id));
                        const myDoc = await transaction.get(queueRef.id ? queueRef.doc(window.matchmakingState.myQueueId) : null);

                        if (!oppDoc.exists || (myDoc && !myDoc.exists)) {
                            throw new Error("Match already taken");
                        }

                        transaction.delete(queueRef.doc(opponent.id));
                        if (window.matchmakingState.myQueueId) {
                            transaction.delete(queueRef.doc(window.matchmakingState.myQueueId));
                        }
                    });

                    // Successfully claimed! We are Player 1, opponent is Player 2
                    window.matchmakingState.searching = false;
                    if (window.matchmakingState.unsubscribeQueue) {
                        window.matchmakingState.unsubscribeQueue();
                        window.matchmakingState.unsubscribeQueue = null;
                    }

                    const matchId = "match_" + Date.now() + "_" + Math.floor(Math.random()*1000);
                    const matchData = {
                        matchId: matchId,
                        status: 'active',
                        createdAt: Date.now(),
                        player1: {
                            username: username,
                            squad: cleanSquad,
                            activeIndex: 0,
                            faintedCount: 0
                        },
                        player2: {
                            username: opponent.username,
                            squad: opponent.squad,
                            activeIndex: 0,
                            faintedCount: 0
                        },
                        turn: username,
                        lastAction: "Match started! " + username + " vs " + opponent.username,
                        winner: null
                    };

                    await db.collection('active_matches').doc(matchId).set(sanitizeForFirebase(matchData));

                    if (modal) modal.remove();
                    if (typeof window.startPvPBattleScene === 'function') {
                        window.startPvPBattleScene(matchId, 'player1');
                    }

                } catch (e) {
                    // Transaction failed because the other player claimed us first, which is fine—let's check active matches
                }
            }

            // Also check if an active match was created for us by the other player
            const activeMatchQuery = await db.collection('active_matches')
                .where('status', '==', 'active')
                .get();

            activeMatchQuery.forEach(docSnap => {
                const mData = docSnap.data();
                if (window.matchmakingState.searching && mData.player2 && mData.player2.username === username) {
                    window.matchmakingState.searching = false;
                    if (window.matchmakingState.unsubscribeQueue) {
                        window.matchmakingState.unsubscribeQueue();
                        window.matchmakingState.unsubscribeQueue = null;
                    }

                    if (modal) modal.remove();
                    if (typeof window.startPvPBattleScene === 'function') {
                        window.startPvPBattleScene(docSnap.id, 'player2');
                    }
                }
            });
        });

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