// account.js - Player Account Management, Authentication, and Cloud Save/Load

window.playerData = {
    username: "Player",
    rotBalance: 500,
    inventory: [],
    activeFighterIndex: 0,
    revivePotions: 3,
    luckyEggs: 0,
    accountLevel: 1,
    accountXp: 0
};

// SAVE GAME DATA TO FIREBASE (Includes revives & lucky eggs!)
window.saveGameData = function() {
    if (typeof auth === 'undefined' || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    if (!window.playerData) return;

    db.collection('users').doc(userId).set({
        username: playerData.username || "Player",
        rotBalance: playerData.rotBalance || 0,
        inventory: playerData.inventory || [],
        activeFighterIndex: playerData.activeFighterIndex || 0,
        revivePotions: playerData.revivePotions || 0,
        luckyEggs: playerData.luckyEggs || 0,
        accountLevel: playerData.accountLevel || 1,
        accountXp: playerData.accountXp || 0
    }, { merge: true }).then(() => {
        console.log("☁️ Game data & items saved successfully!");
    }).catch((error) => {
        console.error("❌ Error saving game data:", error);
    });
};

// LOAD GAME DATA FROM FIREBASE (Pulls revives & lucky eggs back down!)
window.loadGameData = async function() {
    if (typeof auth === 'undefined' || !auth.currentUser) return;
    const userId = auth.currentUser.uid;

    try {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            playerData.username = data.username || "Player";
            playerData.rotBalance = data.rotBalance || 0;
            playerData.inventory = data.inventory || [];
            playerData.activeFighterIndex = data.activeFighterIndex || 0;
            playerData.revivePotions = typeof data.revivePotions !== 'undefined' ? data.revivePotions : 3;
            playerData.luckyEggs = typeof data.luckyEggs !== 'undefined' ? data.luckyEggs : 0;
            playerData.accountLevel = data.accountLevel || 1;
            playerData.accountXp = data.accountXp || 0;

            // Update HUD elements immediately on load
            if (typeof updatePotionHud === 'function') updatePotionHud();
            const balanceEl = document.getElementById('rotBalance');
            if (balanceEl) balanceEl.innerText = playerData.rotBalance;
            
            console.log("☁️ Game data & items loaded successfully!");
        }
    } catch (error) {
        console.error("❌ Error loading game data:", error);
    }
};

// Potion HUD update helper
window.updatePotionHud = function() {
    const potionHudCount = document.getElementById('potionHudCount');
    if (potionHudCount && window.playerData) {
        potionHudCount.innerText = window.playerData.revivePotions || 0;
    }
};

// Handle authentication state changes to trigger load
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadGameData().then(() => {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none';
            });
        }
    });
}