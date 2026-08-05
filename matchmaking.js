// matchmaking.js - Direct Room & Lobby PvP Matchmaking System

if (typeof window.matchmakingState === 'undefined') {
    window.matchmakingState = {
        searching: false,
        matchId: null,
        unsubscribe: null
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
        alert("❌ Firebase is not connected.");
        return;
    }

    const username = (typeof playerData !== 'undefined' && playerData.username) ? playerData.username : "player_" + Math.floor(Math.random()*1000);
    const cleanSquad = sanitizeForFirebase(squad);

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
        background: rgba(5, 2, 10, 0.96) !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: monospace !important;
        color: #fff !important;
        padding: 20px !important;
        box-sizing: border-box !important;
    `;

    modal.innerHTML = `
        <div style="background: #111; border: 3px solid #00ff55; border-radius: 16px; padding: 20px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 0 25px rgba(0,255,85,0.4);">
            <h2 style="color: #00ff55; font-size: 1.2rem; margin-bottom: 10px;">🌐 ONLINE PVP LOBBY</h2>
            <p style="font-size: 0.75rem; color: #aaa; margin-bottom: 15px;">Looking for open rooms or create your own:</p>
            <div id="roomListContainer" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                <div style="color: #666; font-size: 0.8rem;">Scanning for rooms...</div>
            </div>
            <button onclick="window.createPvPRoom('${username}', ${JSON.stringify(cleanSquad).replace(/"/g, '&quot;')})" style="background: #00ff55; color: #000; border: none; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%; font-family: monospace; font-size: 0.85rem; margin-bottom: 8px;">HOST NEW ROOM</button>
            <button onclick="cancelMatchmaking()" style="background: #ff0055; color: #fff; border: none; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%; font-family: monospace; font-size: 0.85rem;">CANCEL</button>
        </div>
    `;

    window.matchmakingState.searching = true;
    const db = firebase.firestore();

    // Listen to open rooms waiting for player 2
    window.matchmakingState.unsubscribe = db.collection('active_matches')
        .where('status', '==', 'waiting')
        .onSnapshot((snapshot) => {
            const container = document.getElementById('roomListContainer');
            if (!container) return;

            let roomsHtml = '';
            let myHostedMatchId = window.matchmakingState.myHostedMatchId;

            snapshot.forEach(doc => {
                const room = doc.data();
                if (room.player1.username === username) {
                    myHostedMatchId = doc.id;
                    window.matchmakingState.myHostedMatchId = doc.id;
                } else {
                    roomsHtml += `
                        <div style="background: #1a1a1a; border: 1px solid #00ff55; padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.75rem; color: #00ff55;">${room.player1.username}'s Room</span>
                            <button onclick="window.joinPvPRoom('${doc.id}', '${username}', ${JSON.stringify(cleanSquad).replace(/"/g, '&quot;')})" style="background: #00ff55; color: #000; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">JOIN</button>
                        </div>
                    `;
                }
            });

            if (myHostedMatchId) {
                roomsHtml = `<div style="background: #222; border: 1px dashed #ffcc00; padding: 8px; border-radius: 6px; color: #ffcc00; font-size: 0.75rem;">Hosting room... waiting for opponent to join.</div>` + roomsHtml;
            }

            if (!roomsHtml) {
                container.innerHTML = `<div style="color: #666; font-size: 0.8rem;">No open rooms found. Click Host below!</div>`;
            } else {
                container.innerHTML = roomsHtml;
            }
        });

    // Also listen if we hosted a room and someone joined it
    db.collection('active_matches').onSnapshot((snapshot) => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (window.matchmakingState.myHostedMatchId === doc.id && data.status === 'active') {
                if (window.matchmakingState.searching) {
                    window.matchmakingState.searching = false;
                    if (window.matchmakingState.unsubscribe) window.matchmakingState.unsubscribe();
                    if (modal) modal.remove();
                    if (typeof window.startPvPBattleScene === 'function') {
                        window.startPvPBattleScene(doc.id, 'player1');
                    }
                }
            }
        });
    });
};

window.createPvPRoom = async function(username, squad) {
    const db = firebase.firestore();
    const matchId = "match_" + Date.now() + "_" + Math.floor(Math.random()*1000);

    const matchData = {
        matchId: matchId,
        status: 'waiting',
        createdAt: Date.now(),
        player1: {
            username: username,
            squad: squad,
            activeIndex: 0,
            faintedCount: 0
        },
        player2: null,
        turn: username,
        lastAction: "Waiting for opponent to join...",
        winner: null
    };

    await db.collection('active_matches').doc(matchId).set(sanitizeForFirebase(matchData));
    window.matchmakingState.myHostedMatchId = matchId;
    alert("✅ Room hosted successfully! Your opponent can now see and join it in their online PvP menu.");
};

window.joinPvPRoom = async function(matchId, username, squad) {
    const db = firebase.firestore();
    const matchRef = db.collection('active_matches').doc(matchId);

    const doc = await matchRef.get();
    if (!doc.exists) {
        alert("❌ This room no longer exists.");
        return;
    }

    const roomData = doc.data();
    if (roomData.status !== 'waiting') {
        alert("❌ This room is already full or active.");
        return;
    }

    await matchRef.update({
        status: 'active',
        player2: {
            username: username,
            squad: squad,
            activeIndex: 0,
            faintedCount: 0
        },
        lastAction: "Match started! " + roomData.player1.username + " vs " + username
    });

    window.matchmakingState.searching = false;
    if (window.matchmakingState.unsubscribe) window.matchmakingState.unsubscribe();

    const modal = document.getElementById('matchmakingModal');
    if (modal) modal.remove();

    if (typeof window.startPvPBattleScene === 'function') {
        window.startPvPBattleScene(matchId, 'player2');
    }
};

window.cancelMatchmaking = async function() {
    window.matchmakingState.searching = false;
    if (window.matchmakingState.unsubscribe) {
        window.matchmakingState.unsubscribe();
        window.matchmakingState.unsubscribe = null;
    }

    if (window.matchmakingState.myHostedMatchId && typeof firebase !== 'undefined') {
        try {
            await firebase.firestore().collection('active_matches').doc(window.matchmakingState.myHostedMatchId).delete();
        } catch (e) {}
    }

    const modal = document.getElementById('matchmakingModal');
    if (modal) modal.remove();
};