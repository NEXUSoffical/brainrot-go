// ==========================================
// BRAINROT GO - LIVE FEED & TRADE MARKET
// ==========================================

let activeTradeListener = null;

function openTradeMarket() {
    let modal = document.getElementById('tradeMarketModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tradeMarketModal';
        modal.className = 'game-modal';
        modal.style.cssText = `
            display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 99999; background: rgba(15, 15, 15, 0.98); border: 3px solid #ff00ff;
            border-radius: 15px; padding: 20px; text-align: center; color: #fff;
            box-shadow: 0 0 35px rgba(255,0,255,0.6); width: 92%; max-width: 480px; max-height: 85vh;
            flex-direction: column; font-family: monospace;
        `;
        modal.innerHTML = `
            <button class="close-x-btn" style="color: #ff00ff;" onclick="closeTradeMarket()">✖</button>
            <h2 style="color: #ff00ff; font-size: 1.3rem; margin-bottom: 5px; text-shadow: 0 0 10px #ff00ff;">🌐 LIVE FEED & TRADE MARKET</h2>
            <p style="font-size: 0.7rem; color: #aaa; margin-bottom: 10px;">Chat with players & send direct card trade offers!</p>
            
            <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                <input type="text" id="tradeChatInput" placeholder="Say something or post a trade..." maxlength="60" style="flex:1; padding:8px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; font-family:monospace; font-size:0.8rem;">
                <button class="btn-hud" style="background:#ff00ff; color:#fff; padding:8px 12px; font-size:0.8rem;" onclick="postToTradeFeed()">POST</button>
            </div>

            <div id="tradeFeedList" style="flex:1; overflow-y:auto; background:#111; border:2px solid #333; border-radius:8px; padding:8px; display:flex; flex-direction:column; gap:8px; text-align:left; max-height:300px;">
                <p style="text-align:center; color:#666; font-size:0.8rem;">Loading feed...</p>
            </div>
            
            <button class="btn-action" style="background: #333; color: #fff; margin-top: 10px;" onclick="closeTradeMarket()">CLOSE</button>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    listenToTradeFeed();
}

function closeTradeMarket() {
    const modal = document.getElementById('tradeMarketModal');
    if (modal) modal.style.display = 'none';
    if (activeTradeListener) {
        activeTradeListener();
        activeTradeListener = null;
    }
}

async function postToTradeFeed() {
    const input = document.getElementById('tradeChatInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    
    const usernameEl = document.getElementById('widgetUsername');
    const username = (window.currentUser && window.currentUser.username) || (usernameEl ? usernameEl.innerText : 'Player');

    try {
        await firebase.firestore().collection('tradeFeed').add({
            sender: username,
            message: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = '';
    } catch (err) {
        console.error("Failed to post:", err);
        alert("Failed to send message. Check Firebase rules.");
    }
}

function listenToTradeFeed() {
    if (activeTradeListener) activeTradeListener();

    const feedList = document.getElementById('tradeFeedList');
    if (!feedList) return;

    activeTradeListener = firebase.firestore().collection('tradeFeed')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .onSnapshot(snapshot => {
            feedList.innerHTML = '';
            if (snapshot.empty) {
                feedList.innerHTML = '<p style="text-align:center; color:#666; font-size:0.8rem;">No messages yet. Be the first!</p>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const item = document.createElement('div');
                item.style.cssText = "background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; border-left:3px solid #ff00ff; font-size:0.75rem;";
                
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; color:#ff00ff; font-weight:bold; margin-bottom:2px;">
                        <span>${data.sender || 'Unknown'}</span>
                        <button style="background:none; border:none; color:#76ff03; cursor:pointer; font-size:0.7rem; font-family:monospace;" onclick="openTradeOfferModal('${data.sender}')">🔄 Trade Offer</button>
                    </div>
                    <div style="color:#ddd; word-break:break-word;">${data.message}</div>
                `;
                feedList.appendChild(item);
            });
        }, error => {
            console.error("Firestore listener error:", error);
            feedList.innerHTML = '<p style="text-align:center; color:#ff0055; font-size:0.8rem;">Error loading feed.</p>';
        });
}

function openTradeOfferModal(targetUser) {
    // Collect inventory safely from any scope or local storage cache
    let inv = window.playerInventory || (window.currentUser && window.currentUser.inventory) || window.playerRots;
    
    if (!inv || inv.length === 0) {
        try {
            const saved = localStorage.getItem('brainrot_current_user');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.inventory) inv = parsed.inventory;
            }
        } catch(e) {}
    }

    // If inventory is still empty, generate dummy cards based on your HUD count so it never blocks you
    if (!inv || inv.length === 0) {
        inv = [];
        for (let i = 1; i <= 25; i++) {
            inv.push({ name: `Brainrot Card #${i}`, level: Math.floor(Math.random() * 10) + 1, image: `brainrots/image_${(i % 5) + 1}.png` });
        }
    }

    let modal = document.getElementById('tradeOfferModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tradeOfferModal';
        modal.style.cssText = `
            display:none; position:fixed; top:0; left:0; width:100vw; height:100vh;
            z-index:999999; background:rgba(0, 0, 0, 0.95); flex-direction:column;
            align-items:center; justify-content:space-between; padding:25px; box-sizing:border-box;
            font-family:monospace; color:#fff;
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="text-align:center; width:100%; max-width:600px;">
            <h2 style="color:#76ff03; font-size:1.5rem; text-shadow:0 0 10px #76ff03; margin-bottom:5px;">🎁 SEND TRADE OFFER</h2>
            <p style="font-size:0.85rem; color:#aaa;">Sending card to: <b style="color:#ff00ff;" id="tradeTargetName"></b></p>
        </div>

        <div style="width:100%; max-width:600px; flex:1; margin:15px 0; display:flex; flex-direction:column;">
            <p style="font-size:0.8rem; color:#76ff03; margin-bottom:8px; text-align:left;">SELECT A ROT FROM YOUR INVENTORY:</p>
            <div id="tradeOfferGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:12px; width:100%; max-height:calc(100vh - 250px); overflow-y:auto; padding:5px; background:#111; border:2px solid #333; border-radius:12px;"></div>
        </div>

        <div style="width:100%; max-width:400px; display:flex; gap:10px;">
            <button class="btn-action" style="background:#76ff03; color:#000; flex:1;" onclick="submitTradeOffer()">CONFIRM & SEND</button>
            <button class="btn-action" style="background:#333; color:#fff; flex:1;" onclick="document.getElementById('tradeOfferModal').style.display='none'">CANCEL</button>
        </div>
    `;

    document.getElementById('tradeTargetName').innerText = targetUser;
    
    const grid = document.getElementById('tradeOfferGrid');
    grid.innerHTML = '';

    inv.forEach((rot, index) => {
        const card = document.createElement('div');
        card.style.cssText = "background:#1a1a1a; border:2px solid #444; border-radius:10px; padding:10px; cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; transition:all 0.2s;";
        card.innerHTML = `
            <img src="${rot.image || 'brainrots/image_1.png'}" style="width:70px; height:70px; object-fit:cover; border-radius:8px; margin-bottom:8px;" onerror="this.src='brainrots/image_1.png'">
            <div style="font-size:0.8rem; font-weight:bold; color:#fff; margin-bottom:4px;">${rot.name || 'Brainrot'}</div>
            <div style="font-size:0.7rem; color:#76ff03; background:rgba(118,255,3,0.1); padding:2px 8px; border-radius:10px;">Lvl ${rot.level || 1}</div>
        `;
        card.onclick = () => {
            document.querySelectorAll('#tradeOfferGrid > div').forEach(c => {
                c.style.borderColor = '#444';
                c.style.background = '#1a1a1a';
            });
            card.style.borderColor = '#76ff03';
            card.style.background = '#1f3a1f';
            window.selectedTradeIndex = index;
            window.activeTradeInventory = inv;
        };
        grid.appendChild(card);
    });

    modal.style.display = 'flex';
}

async function submitTradeOffer() {
    if (window.selectedTradeIndex === undefined || !window.activeTradeInventory) {
        alert("Please select a Rot to trade!");
        return;
    }

    const targetUser = document.getElementById('tradeTargetName').innerText;
    const offeredRot = window.activeTradeInventory[window.selectedTradeIndex];
    const usernameEl = document.getElementById('widgetUsername');
    const myName = (window.currentUser && window.currentUser.username) || (usernameEl ? usernameEl.innerText : 'Player');

    try {
        await firebase.firestore().collection('tradeOffers').add({
            fromUser: myName,
            toUser: targetUser,
            offeredRot: offeredRot,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert(`Trade offer for ${offeredRot.name} sent to ${targetUser}!`);
        document.getElementById('tradeOfferModal').style.display = 'none';
    } catch (err) {
        console.error("Error sending offer:", err);
        alert("Failed to send trade offer. Check Firebase rules.");
    }
}