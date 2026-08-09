// dex.js - Cloud-Connected Account Management, Full-Screen Sticker Dex, Inventory & Admin System

if (typeof window.isSignUpMode === 'undefined') {
    window.isSignUpMode = false;
}
if (typeof window.selectedStarter === 'undefined') {
    window.selectedStarter = null;
}
if (typeof window.currentInventoryTab === 'undefined') {
    window.currentInventoryTab = 'rots';
}
if (typeof window.currentDexTab === 'undefined') {
    window.currentDexTab = 'standard';
}
if (typeof window.currentInventorySort === 'undefined') {
    window.currentInventorySort = 'newest';
}

if (!window._internalPlayerData) {
    window._internalPlayerData = {
        username: "",
        rotBalance: 500,
        accountLevel: 1,
        accountXp: 0,
        dex: [],         
        shinyDex: [],    
        inventory: [],   
        activeFighterIndex: 0,
        revivePotions: 3,
        luckyEggs: 0,
        maxInventorySlots: 100
    };
}

if (!window.playerData) {
    window.playerData = new Proxy(window._internalPlayerData, {
        set(target, property, value) {
            if (property === 'rotBalance' && value > (target.rotBalance + 10000)) {
                console.warn("ANTI-CHEAT: Unauthorized balance modification blocked!");
                if (typeof showGameToast === 'function') {
                    showGameToast("Anti-cheat blocked your hack.");
                } else {
                    alert("Nice try! Anti-cheat blocked your hack.");
                }
                return false;
            }
            target[property] = value;
            if (typeof window.saveGameData === 'function') {
                window.saveGameData();
            }
            return true;
        }
    });
}

function setPlayerData(newData) {
    window._internalPlayerData.username = newData.username || window._internalPlayerData.username || "";
    window._internalPlayerData.rotBalance = typeof newData.rotBalance !== 'undefined' ? newData.rotBalance : (window._internalPlayerData.rotBalance || 500);
    
    const incomingLevel = newData.accountLevel || newData.accLvl || 1;
    window._internalPlayerData.accountLevel = Math.max(1, incomingLevel);
    
    let incomingXp = typeof newData.accountXp !== 'undefined' ? newData.accountXp : 0;
    let currentLevel = window._internalPlayerData.accountLevel;
    let requiredXp = currentLevel * 250;
    
    while (incomingXp >= requiredXp) {
        incomingXp -= requiredXp;
        currentLevel++;
        requiredXp = currentLevel * 250;
    }
    
    window._internalPlayerData.accountLevel = currentLevel;
    window._internalPlayerData.accountXp = incomingXp;

    window._internalPlayerData.dex = newData.dex || window._internalPlayerData.dex || [];
    window._internalPlayerData.shinyDex = newData.shinyDex || window._internalPlayerData.shinyDex || [];
    window._internalPlayerData.inventory = newData.inventory || window._internalPlayerData.inventory || [];
    window._internalPlayerData.activeFighterIndex = typeof newData.activeFighterIndex !== 'undefined' ? newData.activeFighterIndex : (window._internalPlayerData.activeFighterIndex || 0);
    window._internalPlayerData.revivePotions = typeof newData.revivePotions !== 'undefined' ? newData.revivePotions : (window._internalPlayerData.revivePotions || 3);
    window._internalPlayerData.luckyEggs = typeof newData.luckyEggs !== 'undefined' ? newData.luckyEggs : (window._internalPlayerData.luckyEggs || 0);
    window._internalPlayerData.maxInventorySlots = typeof newData.maxInventorySlots !== 'undefined' ? newData.maxInventorySlots : (window._internalPlayerData.maxInventorySlots || 100);
}

window.addAccountXp = function(amount) {
    const hasLuckyEgg = window.activeLuckyEggTime && Date.now() < window.activeLuckyEggTime;
    const finalXp = hasLuckyEgg ? amount * 2 : amount;

    window._internalPlayerData.accountXp = (window._internalPlayerData.accountXp || 0) + finalXp;
    
    let currentLevel = window._internalPlayerData.accountLevel || 1;
    let requiredXp = currentLevel * 250;
    
    while (window._internalPlayerData.accountXp >= requiredXp) {
        window._internalPlayerData.accountXp -= requiredXp;
        window._internalPlayerData.accountLevel = (window._internalPlayerData.accountLevel || 1) + 1;
        currentLevel = window._internalPlayerData.accountLevel;
        requiredXp = currentLevel * 250;
    }

    window.saveGameData();
    updateHUD();
};

window.saveGameData = async function() {
    if (!window._internalPlayerData) return;
    if (typeof firebase === 'undefined') return;
    
    if (!window._internalPlayerData.username) {
        window._internalPlayerData.username = "player";
    }

    try {
        const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
            if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
            return value;
        });

        localStorage.setItem('brainrot_local_backup', cleanDataString);

        const cleanDataObject = JSON.parse(cleanDataString);
        await firebase.firestore().collection('accounts').doc(window._internalPlayerData.username).set(cleanDataObject);
        localStorage.setItem('brainrot_logged_in_user', window._internalPlayerData.username);
    } catch (err) {
        console.warn("Cloud save skipped/failed, saved locally instead:", err);
    }
};

window.loadGameData = async function() {
    let localData = null;
    const localBackup = localStorage.getItem('brainrot_local_backup');
    if (localBackup) {
        try {
            localData = JSON.parse(localBackup);
            setPlayerData(localData);
        } catch (e) {
            console.error("Error reading local backup", e);
        }
    }

    const activeUser = localStorage.getItem('brainrot_logged_in_user');
    if (activeUser && activeUser !== "player" && typeof firebase !== 'undefined') {
        try {
            const doc = await firebase.firestore().collection('accounts').doc(activeUser).get();
            if (doc.exists) {
                const cloudData = doc.data();
                
                const mergedDex = Array.from(new Set([...(localData?.dex || []), ...(cloudData.dex || [])]));
                const mergedShinyDex = Array.from(new Set([...(localData?.shinyDex || []), ...(cloudData.shinyDex || [])]));
                
                let localInv = localData?.inventory || [];
                let cloudInv = cloudData.inventory || [];
                let finalInventory = localInv.length >= cloudInv.length ? localInv : cloudInv;

                const bestAccountLevel = Math.max(
                    cloudData.accountLevel || cloudData.accLvl || 1, 
                    localData?.accountLevel || localData?.accLvl || 1,
                    window._internalPlayerData.accountLevel || 1
                );

                const bestAccountXp = Math.max(
                    cloudData.accountXp || 0,
                    localData?.accountXp || 0,
                    window._internalPlayerData.accountXp || 0
                );

                const cloudRevives = typeof cloudData.revivePotions !== 'undefined' ? cloudData.revivePotions : 3;
                const localRevives = typeof localData?.revivePotions !== 'undefined' ? localData.revivePotions : 3;
                const bestRevives = Math.min(cloudRevives, localRevives);

                const cloudEggs = typeof cloudData.luckyEggs !== 'undefined' ? cloudData.luckyEggs : 0;
                const localEggs = typeof localData?.luckyEggs !== 'undefined' ? localData.luckyEggs : 0;
                const bestEggs = Math.min(cloudEggs, localEggs);

                const bestSlots = Math.max(cloudData.maxInventorySlots || 100, localData?.maxInventorySlots || 100);

                setPlayerData({
                    username: cloudData.username || activeUser,
                    rotBalance: Math.max(cloudData.rotBalance || 0, localData?.rotBalance || 0),
                    accountLevel: bestAccountLevel,
                    accountXp: bestAccountXp,
                    dex: mergedDex,
                    shinyDex: mergedShinyDex,
                    inventory: finalInventory,
                    activeFighterIndex: cloudData.activeFighterIndex || localData?.activeFighterIndex || 0,
                    revivePotions: bestRevives,
                    luckyEggs: bestEggs,
                    maxInventorySlots: bestSlots
                });
            }
        } catch (err) {
            console.error("Error restoring session from cloud:", err);
        }
    }

    if (!window.playerData.dex) window.playerData.dex = [];
    if (!window.playerData.shinyDex) window.playerData.shinyDex = [];
    if (!window.playerData.inventory) window.playerData.inventory = [];
};

(async function checkExistingSession() {
    await window.loadGameData();
    if (window._internalPlayerData.username && window._internalPlayerData.username !== "player") {
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('loginModal');
            if (modal) modal.style.display = 'none';
            updateHUD();
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    setupStarterOptions();
    updateHUD();
});

window.toggleAuthMode = function() {
    window.isSignUpMode = !window.isSignUpMode;
    const starterSec = document.getElementById('starterSection');
    const toggleText = document.getElementById('loginToggleText');
    
    if (window.isSignUpMode) {
        if (starterSec) starterSec.style.display = 'block';
        if (toggleText) toggleText.innerText = "Already have an account? Click here to Log In";
    } else {
        if (starterSec) starterSec.style.display = 'none';
        if (toggleText) toggleText.innerText = "New player? Click here to Sign Up";
    }
};

function setupStarterOptions() {
    const grid = document.getElementById('starterSelectionGrid');
    if (!grid || typeof brainrotCharacters === 'undefined' || !brainrotCharacters.length) {
        setTimeout(setupStarterOptions, 200);
        return;
    }

    grid.innerHTML = '';
    const starters = brainrotCharacters.slice(0, 6);
    window.selectedStarter = starters[0];

    starters.forEach((char, index) => {
        const item = document.createElement('div');
        item.className = `starter-option ${index === 0 ? 'selected' : ''}`;
        item.innerHTML = `
            <div style="width: 36px; height: 36px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                <img src="${char.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 7.5px; color: #fff; text-align: center;">${char.name}</span>
        `;
        item.onclick = () => {
            document.querySelectorAll('.starter-option').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            window.selectedStarter = char;
        };
        grid.appendChild(item);
    });
}

window.handleAccountAction = async function() {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    
    const rawUsername = usernameInput ? usernameInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!rawUsername || !password) {
        if (typeof showGameToast === 'function') showGameToast("Please enter both username and password!");
        else alert("Please enter both username and password!");
        return;
    }

    const email = rawUsername + "@brainrotgo.com";

    try {
        if (window.isSignUpMode) {
            await firebase.auth().createUserWithEmailAndPassword(email, password);

            if (!window.selectedStarter && typeof brainrotCharacters !== 'undefined') {
                window.selectedStarter = brainrotCharacters[0];
            }

            const starterInstance = {
                ...window.selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50,
                shiny: false
            };

            setPlayerData({
                username: rawUsername,
                rotBalance: 500,
                accountLevel: 1,
                accountXp: 0,
                dex: [window.selectedStarter.name],
                shinyDex: [],
                inventory: [starterInstance],
                activeFighterIndex: 0,
                revivePotions: 3,
                luckyEggs: 0,
                maxInventorySlots: 100
            });

            await window.saveGameData();
            if (typeof showGameToast === 'function') showGameToast(`Account created successfully! Welcome, ${rawUsername}!`);
        } else {
            await firebase.auth().signInWithEmailAndPassword(email, password);

            const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
            const doc = await docRef.get();

            if (doc.exists) {
                setPlayerData(doc.data());
                if (!window.playerData.dex) window.playerData.dex = [];
                if (!window.playerData.shinyDex) window.playerData.shinyDex = [];
                if (!window.playerData.inventory) window.playerData.inventory = [];
            }
            
            localStorage.setItem('brainrot_logged_in_user', rawUsername);
        }

        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        updateHUD();
    } catch (err) {
        console.error("Authentication error:", err);
        if (err.code === 'auth/email-already-in-use') {
            if (typeof showGameToast === 'function') showGameToast("Username already exists! Please log in instead.");
            else alert("Username already exists! Please log in instead.");
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            if (typeof showGameToast === 'function') showGameToast("Invalid username or password!");
            else alert("Invalid username or password!");
        } else {
            if (typeof showGameToast === 'function') showGameToast("Error: " + err.message);
            else alert("Error: " + err.message);
        }
    }
};

window.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        const rawUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
        const doc = await docRef.get();

        if (!doc.exists) {
            if (!window.selectedStarter && typeof brainrotCharacters !== 'undefined') {
                window.selectedStarter = brainrotCharacters[0];
            }

            const starterInstance = {
                ...window.selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50,
                shiny: false
            };

            setPlayerData({
                username: rawUsername,
                rotBalance: 500,
                accountLevel: 1,
                accountXp: 0,
                dex: [window.selectedStarter.name],
                shinyDex: [],
                inventory: [starterInstance],
                activeFighterIndex: 0,
                revivePotions: 3,
                luckyEggs: 0,
                maxInventorySlots: 100
            });

            const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
                if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
                return value;
            });
            await docRef.set(JSON.parse(cleanDataString));
        } else {
            setPlayerData(doc.data());
            if (!window.playerData.dex) window.playerData.dex = [];
            if (!window.playerData.shinyDex) window.playerData.shinyDex = [];
            if (!window.playerData.inventory) window.playerData.inventory = [];
        }

        localStorage.setItem('brainrot_logged_in_user', rawUsername);
        
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        updateHUD();

    } catch (err) {
        console.error("Google Auth Error:", err);
        if (typeof showGameToast === 'function') showGameToast("Error signing in with Google. Make sure popups aren't blocked!");
        else alert("Error signing in with Google. Make sure popups aren't blocked!");
    }
};

window.logoutAccount = async function() {
    localStorage.removeItem('brainrot_logged_in_user');
    localStorage.removeItem('brainrot_local_backup');
    window._internalPlayerData.username = "";
    
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
    } catch (e) {
        console.warn("Firebase signout error:", e);
    }
    
    window.location.href = window.location.pathname;
};

window.addToDex = function(creature) {
    if (!window.playerData.inventory) window.playerData.inventory = [];
    
    const maxSlots = window.playerData.maxInventorySlots || 100;
    if (window.playerData.inventory.length >= maxSlots) {
        if (typeof showGameToast === 'function') showGameToast(`Inventory is full! (${window.playerData.inventory.length}/${maxSlots}).`);
        else alert(`Inventory is full! (${window.playerData.inventory.length}/${maxSlots}).`);
        return;
    }

    if (!window.playerData.dex) window.playerData.dex = [];
    if (!window.playerData.shinyDex) window.playerData.shinyDex = [];

    const rotLevel = creature.level || 1;
    const rotMaxHp = creature.maxHp || (50 + (rotLevel - 1) * 12);
    const isShiny = creature.shiny === true;

    window.playerData.inventory.push({
        ...creature,
        marker: undefined,
        level: rotLevel,
        xp: creature.xp || 0,
        maxHp: rotMaxHp,
        hp: rotMaxHp,
        shiny: isShiny
    });

    if (isShiny) {
        if (!window.playerData.shinyDex.includes(creature.name)) {
            window.playerData.shinyDex.push(creature.name);
        }
    } else {
        if (!window.playerData.dex.includes(creature.name)) {
            window.playerData.dex.push(creature.name);
        }
    }

    window.addAccountXp(20);
    window.saveGameData();
    updateHUD();
};

window.getRarityColor = function(rarity) {
    switch ((rarity || '').toLowerCase()) {
        case 'secret': return '#ff0055';
        case 'mythic': return '#9900ff';
        case 'legendary': return '#ffaa00';
        case 'epic': return '#0088ff';
        case 'rare': return '#00cc44';
        case 'uncommon': return '#cccc00';
        default: return '#888888';
    }
};

function updateHUD() {
    const dexCountEl = document.getElementById('dexCount');
    const totalBrainrotsEl = document.getElementById('totalBrainrots');
    const inventoryCountEl = document.getElementById('inventoryCount');
    const rotBalanceEl = document.getElementById('rotBalance');
    const hudTitle = document.getElementById('hudTitle');
    const accLvlEls = document.querySelectorAll('#accLvl, .accLvlDisplay, #accountLevelVal, #widgetAccLevel');
    const widgetXpBar = document.getElementById('widgetXpBar');
    const widgetXpText = document.getElementById('widgetXpText');

    const totalPossible = (typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters.length : 0;
    
    const dexCount = (window.currentDexTab === 'shiny') 
        ? ((window.playerData.shinyDex) ? window.playerData.shinyDex.length : 0)
        : ((window.playerData.dex) ? window.playerData.dex.length : 0);

    const inventoryCount = (window.playerData.inventory) ? window.playerData.inventory.length : 0;

    if (dexCountEl) dexCountEl.innerText = dexCount;
    if (totalBrainrotsEl) totalBrainrotsEl.innerText = totalPossible;
    if (inventoryCountEl) inventoryCountEl.innerText = inventoryCount;
    if (rotBalanceEl) rotBalanceEl.innerText = window.playerData.rotBalance || 500;
    if (hudTitle && window.playerData.username) hudTitle.innerText = `📺 ${window.playerData.username.toUpperCase()}`;
    
    const currentLevel = window.playerData.accountLevel || 1;
    const currentXp = window.playerData.accountXp || 0;
    const requiredXp = currentLevel * 250;
    
    const xpPercent = Math.min(100, Math.max(0, (currentXp / requiredXp) * 100));

    accLvlEls.forEach(el => {
        el.innerText = currentLevel;
    });

    if (widgetXpBar) {
        widgetXpBar.style.width = xpPercent + '%';
    }

    if (widgetXpText) {
        widgetXpText.innerText = `${currentXp} / ${requiredXp}`;
    }

    const widgetUsername = document.getElementById('widgetUsername');
    if (widgetUsername && window.playerData.username) {
        widgetUsername.innerText = window.playerData.username;
    }

    renderInventoryGrid();
    renderDexGrid();
    updatePotionHud();
}

window.updatePotionHud = function() {
    const potionHudCount = document.getElementById('potionHudCount');
    if (potionHudCount && window.playerData) {
        potionHudCount.innerText = window.playerData.revivePotions || 0;
    }
};

window.setInventorySort = function(sortType) {
    window.currentInventorySort = sortType;
    renderInventoryGrid();
};

function renderInventoryGrid() {
    let inventoryGrid = document.getElementById('inventoryGrid');
    let modal = document.getElementById('inventoryModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inventoryModal';
        document.body.appendChild(modal);
    }

    modal.className = '';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        transform: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        background: rgba(0,0,0,0.95) !important;
        z-index: 9999999 !important;
        display: none;
        flex-direction: column !important;
        align-items: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    const currentSlots = (window.playerData.inventory || []).length;
    const maxSlots = window.playerData.maxInventorySlots || 100;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
                <h2 style="margin: 0; color: #ffcc00; text-transform: uppercase; font-size: 1.4rem;">📦 INVENTORY (${currentSlots}/${maxSlots})</h2>
            </div>
            <button onclick="closeInventory()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">X</button>
        </div>

        ${maxSlots < 200 ? `
        <div style="width: 100%; max-width: 800px; background: #1a1a1a; border: 2px dashed #ffcc00; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-sizing: border-box;">
            <div style="font-size: 0.75rem; color: #ffcc00;">💡 Expand storage limit to 200 slots!</div>
            <button onclick="upgradeInventorySlots()" style="background: #ffcc00; color: #000; border: none; padding: 6px 12px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">UPGRADE (250 Coins)</button>
        </div>` : ''}

        <div id="inventoryTabSwitcher" style="width: 100%; max-width: 800px; display: flex; gap: 10px; margin-bottom: 10px;">
            <button onclick="switchInventoryTab('rots')" id="btnTabRots" style="flex: 1; background: ${window.currentInventoryTab === 'rots' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'rots' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: monospace;">🧠 ROTS</button>
            <button onclick="switchInventoryTab('items')" id="btnTabItems" style="flex: 1; background: ${window.currentInventoryTab === 'items' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'items' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: monospace;">📦 ITEMS</button>
        </div>

        ${window.currentInventoryTab === 'rots' ? `
        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 15px;">
            <button onclick="setInventorySort('power')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'power' ? '#00ff55' : '#222'}; color: ${window.currentInventorySort === 'power' ? '#000' : '#fff'}; border: 2px solid #00ff55; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                ⚔️ POWER
            </button>
            <button onclick="setInventorySort('rarity')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'rarity' ? '#00ccff' : '#222'}; color: ${window.currentInventorySort === 'rarity' ? '#000' : '#fff'}; border: 2px solid #00ccff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                💎 RARITY
            </button>
            <button onclick="setInventorySort('newest')" style="flex: 1; padding: 8px; background: ${window.currentInventorySort === 'newest' ? '#ff0055' : '#222'}; color: ${window.currentInventorySort === 'newest' ? '#000' : '#fff'}; border: 2px solid #ff0055; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                ⏱️ NEWEST
            </button>
        </div>` : ''}

        <div id="inventoryGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 800px; max-height: calc(100vh - 220px); overflow-y: auto; padding: 5px;"></div>
    `;

    inventoryGrid = document.getElementById('inventoryGrid');
    if (!inventoryGrid) return;
    inventoryGrid.innerHTML = '';

    if (window.currentInventoryTab === 'rots') {
        let inventory = window.playerData.inventory || [];
        if (inventory.length === 0) {
            inventoryGrid.innerHTML = `<p style="grid-column: 1 / -1; color: #777; font-size: 0.9rem; padding: 40px; text-align: center;">Your inventory is empty! Catch rots on the map.</p>`;
            return;
        }

        let indexedInventory = inventory.map((rot, originalIndex) => ({
            rot: rot,
            originalIndex: originalIndex
        }));

        const rarityRank = { 'og': 6, 'secret': 5, 'mythic': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'uncommon': 1, 'common': 0 };

        if (window.currentInventorySort === 'power') {
            indexedInventory.sort((a, b) => {
                const statsA = typeof calculateRotStats === 'function' ? calculateRotStats(a.rot) : {maxHp:50, atk:10, def:10};
                const statsB = typeof calculateRotStats === 'function' ? calculateRotStats(b.rot) : {maxHp:50, atk:10, def:10};
                const powerA = statsA.maxHp + statsA.atk + statsA.def;
                const powerB = statsB.maxHp + statsB.atk + statsB.def;
                return powerB - powerA;
            });
        } else if (window.currentInventorySort === 'rarity') {
            indexedInventory.sort((a, b) => {
                const rankA = rarityRank[(a.rot.rarity || 'common').toLowerCase()] || 0;
                const rankB = rarityRank[(b.rot.rarity || 'common').toLowerCase()] || 0;
                return rankB - rankA;
            });
        } else if (window.currentInventorySort === 'newest') {
            indexedInventory.reverse();
        }

        indexedInventory.forEach(item => {
            const rot = item.rot;
            const index = item.originalIndex;
            const isActive = window.playerData.activeFighterIndex === index;
            const isFainted = rot.fainted === true;
            const isInGym = rot.inGym === true;
            const isShiny = rot.shiny === true;
            const rarityColor = window.getRarityColor(rot.rarity);
            const rotLevel = rot.level || 1;
            const stats = typeof calculateRotStats === 'function' ? calculateRotStats(rot) : { maxHp: 50, atk: 10, def: 10 };

            const card = document.createElement('div');
            card.style.cssText = `
                background: ${isInGym ? '#1a222a' : (isFainted ? '#2a1a1a' : (isShiny ? 'linear-gradient(180deg, #111, #00ffff33)' : (isActive ? '#1a3a1a' : `linear-gradient(180deg, #111, ${rarityColor}33)`)))};
                border: 2px solid ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : (isShiny ? '#00ffff' : (isActive ? '#00ff00' : rarityColor)))};
                border-radius: 12px;
                padding: 8px;
                text-align: center;
                box-shadow: ${isShiny ? '0 0 10px rgba(0,255,255,0.4)' : `0 0 10px ${rarityColor}44`};
                cursor: pointer;
                position: relative;
                opacity: ${isFainted ? '0.6' : '1'};
            `;
            
            card.setAttribute('onclick', `openCardDetails(${index})`);

            card.innerHTML = `
                ${isShiny ? '<div style="font-size:0.6rem; color:#00ffff; font-family:monospace; font-weight:bold; margin-bottom:2px;">💎 SHINY</div>' : ''}
                <div style="font-size: 0.75rem; font-weight: bold; color: ${rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${rot.name}</div>
                <div style="font-size: 0.65rem; color: #aaa; margin-bottom: 4px;">Lvl ${rotLevel} | ${(rot.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: #fff; border-radius: 6px; overflow: hidden; border: 1px solid #333; margin-bottom: 6px;">
                    <img src="${rot.image || ''}" style="width: 100%; height: 100%; object-fit: cover; ${isFainted || isInGym ? 'filter: grayscale(100%);' : (isShiny ? 'filter: brightness(1.2) contrast(2);' : '')}" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">
                    ❤️ ${stats.maxHp} | ⚔️ ${stats.atk}
                </div>
                <div style="font-size: 0.6rem; color: ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : '#00ff00')}; margin-top: 2px;">
                    ${isInGym ? '🏟️ [IN GYM]' : (isFainted ? '💀 FAINTED' : 'READY')}
                </div>
                <div style="display: flex; gap: 4px; margin-top: 6px;">
                    ${!isActive && !isInGym && !isFainted ? `<button onclick="event.stopPropagation(); setActiveFighter(${index})" style="background: #00ff00; color: #000; border: none; padding: 4px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">ACTIVE</button>` : ''}
                    <button onclick="event.stopPropagation(); transferRot(${index})" style="background: #ff0055; color: #fff; border: none; padding: 4px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">TRANSFER</button>
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    } else {
        const revives = window.playerData.revivePotions || 0;
        const luckyEggs = window.playerData.luckyEggs || 0;

        inventoryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 500px; margin: 0 auto;">
                <div style="background: #222; border: 2px solid #00ffcc; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 2.2rem;">🧪</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 1rem; color: #fff;">Revive Potion (x${revives})</div>
                            <div style="font-size: 0.75rem; color: #00ffcc;">Wakes up a fainted rot!</div>
                        </div>
                    </div>
                    <button onclick="useRevivePotionMenu()" style="background: #00ffcc; color: #000; border: none; padding: 10px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">USE</button>
                </div>
                <div style="background: #222; border: 2px solid #ff00ff; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 2.2rem;">🥚</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 1rem; color: #fff;">Lucky Egg (x${luckyEggs})</div>
                            <div style="font-size: 0.75rem; color: #ff00ff;">Double Account XP for 1hr!</div>
                        </div>
                    </div>
                    <button onclick="useLuckyEgg()" style="background: #ff00ff; color: #000; border: none; padding: 10px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">USE</button>
                </div>
            </div>
        `;
    }
};

window.upgradeInventorySlots = function() {
    const currentMax = window.playerData.maxInventorySlots || 100;
    if (currentMax >= 200) {
        if (typeof showGameToast === 'function') showGameToast("🎉 You already have the maximum inventory capacity of 200 slots!");
        else alert("🎉 You already have the maximum inventory capacity of 200 slots!");
        return;
    }

    const upgradeCost = 250;
    if ((window.playerData.rotBalance || 0) < upgradeCost) {
        if (typeof showGameToast === 'function') showGameToast(`❌ You need ${upgradeCost} coins to upgrade your inventory space!`);
        else alert(`❌ You need ${upgradeCost} coins to upgrade your inventory space!`);
        return;
    }

    if (confirm(`Upgrade inventory capacity from ${currentMax} to 200 slots for ${upgradeCost} coins?`)) {
        window.playerData.rotBalance -= upgradeCost;
        window.playerData.maxInventorySlots = 200;
        window.saveGameData();
        updateHUD();
        if (typeof showGameToast === 'function') showGameToast("🎉 Inventory upgraded successfully to 200 slots!");
        else alert("🎉 Inventory upgraded successfully to 200 slots!");
    }
};

window.switchInventoryTab = function(tabName) {
    window.currentInventoryTab = tabName;
    renderInventoryGrid();
};

window.useLuckyEgg = function() {
    if ((window.playerData.luckyEggs || 0) <= 0) {
        if (typeof showGameToast === 'function') showGameToast("❌ You don't have any Lucky Eggs! Visit the shop to buy some.");
        else alert("❌ You don't have any Lucky Eggs! Visit the shop to buy some.");
        return;
    }
    window.playerData.luckyEggs--;
    window.activeLuckyEggTime = Date.now() + 3600000;
    window.saveGameData();
    if (typeof showGameToast === 'function') showGameToast("🥚 Lucky Egg activated! Double Account XP is now active for 1 hour!");
    else alert("🥚 Lucky Egg activated! Double Account XP is now active for 1 hour!");
    renderInventoryGrid();
    updatePotionHud();
};

window.useRevivePotionMenu = function() {
    if ((window.playerData.revivePotions || 0) <= 0) {
        if (typeof showGameToast === 'function') showGameToast("❌ You don't have any Revive Potions! Visit the shop to buy some.");
        else alert("❌ You don't have any Revive Potions! Visit the shop to buy some.");
        return;
    }

    const faintedRots = (window.playerData.inventory || []).filter(r => r.fainted);
    if (faintedRots.length === 0) {
        if (typeof showGameToast === 'function') showGameToast("👍 None of your rots need reviving right now!");
        else alert("👍 None of your rots need reviving right now!");
        return;
    }

    let reviveModal = document.getElementById('reviveSelectModal');
    if (reviveModal) reviveModal.remove();

    reviveModal = document.createElement('div');
    reviveModal.id = 'reviveSelectModal';
    reviveModal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0,0,0,0.9) !important;
        z-index: 99999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    let listHtml = '';
    window.playerData.inventory.forEach((rot, index) => {
        if (rot.fainted) {
            listHtml += `
                <div onclick="executeRevive(${index})" style="background: #222; border: 2px solid #00ffcc; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${rot.image || ''}" style="width: 40px; height: 40px; object-fit: cover; filter: grayscale(100%);">
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: #fff;">${rot.name}</div>
                            <div style="font-size: 0.7rem; color: #ff0055;">💀 FAINTED (Lvl ${rot.level || 1})</div>
                        </div>
                    </div>
                    <button style="background: #00ffcc; color: #000; border: none; padding: 6px 10px; font-weight: bold; border-radius: 4px; cursor: pointer;">REVIVE</button>
                </div>
            `;
        }
    });

    reviveModal.innerHTML = `
        <div style="
            background: #111 !important;
            border: 3px solid #00ffcc !important;
            border-radius: 15px !important;
            padding: 20px !important;
            width: 90% !important;
            max-width: 380px !important;
            text-align: center !important;
            box-sizing: border-box !important;
        ">
            <h3 style="color: #00ffcc; margin-bottom: 8px;">🧪 SELECT ROT TO REVIVE</h3>
            <p style="font-size: 0.75rem; color: #aaa; margin-bottom: 12px;">Choose a fainted fighter to bring back to battle:</p>
            <div style="max-height: 220px; overflow-y: auto; margin-bottom: 15px;">
                ${listHtml}
            </div>
            <button onclick="document.getElementById('reviveSelectModal').remove()" style="background: #333; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; width: 100%;">CANCEL</button>
        </div>
    `;
    document.body.appendChild(reviveModal);
};

window.executeRevive = function(index) {
    let targetRot = window.playerData.inventory[index];
    if (!targetRot || !targetRot.fainted) return;

    if ((window.playerData.revivePotions || 0) <= 0) {
        if (typeof showGameToast === 'function') showGameToast("❌ No revive potions left!");
        else alert("❌ No revive potions left!");
        return;
    }

    window.playerData.revivePotions--;
    targetRot.fainted = false;
    targetRot.hp = targetRot.maxHp || 50;

    window.saveGameData();
    updatePotionHud();

    if (typeof showGameToast === 'function') {
        showGameToast(`🧪 Successfully revived ${targetRot.name}!`);
    } else {
        alert(`🧪 Successfully revived ${targetRot.name}!`);
    }
    
    const rModal = document.getElementById('reviveSelectModal');
    if (rModal) rModal.remove();
    renderInventoryGrid();
};

window.transferRot = function(index) {
    const inventory = window.playerData.inventory || [];
    if (inventory.length <= 1) {
        if (typeof showGameToast === 'function') showGameToast("You cannot transfer your last rot!");
        else alert("You cannot transfer your last rot!");
        return;
    }
    if (index === window.playerData.activeFighterIndex) {
        if (typeof showGameToast === 'function') showGameToast("You cannot transfer your active fighter! Select a different fighter first.");
        else alert("You cannot transfer your active fighter! Select a different fighter first.");
        return;
    }

    const rot = inventory[index];
    const coinGain = 1;

    if (confirm(`Transfer ${rot.name} (Lvl ${rot.level || 1}) in exchange for 1 coin?`)) {
        inventory.splice(index, 1);
        window.playerData.rotBalance = (window.playerData.rotBalance || 500) + coinGain;

        if (index < window.playerData.activeFighterIndex) {
            window.playerData.activeFighterIndex--;
        }

        window.saveGameData();
        updateHUD();
    }
};

window.switchDexTab = function(tabName) {
    window.currentDexTab = tabName;
    renderDexGrid();
    
    const dexCountEl = document.getElementById('dexCount');
    if (dexCountEl) {
        if (tabName === 'shiny') {
            dexCountEl.innerText = (window.playerData.shinyDex) ? window.playerData.shinyDex.length : 0;
        } else {
            dexCountEl.innerText = (window.playerData.dex) ? window.playerData.dex.length : 0;
        }
    }
};

function renderDexGrid() {
    const dexGrid = document.getElementById('dexGrid');
    if (!dexGrid || typeof brainrotCharacters === 'undefined' || !brainrotCharacters) return;

    dexGrid.innerHTML = '';
    const isShinyTab = window.currentDexTab === 'shiny';
    const unlockedDex = isShinyTab ? (window.playerData.shinyDex || []) : (window.playerData.dex || []);

    brainrotCharacters.forEach((char) => {
        const isUnlocked = unlockedDex.includes(char.name);
        const rarityColor = window.getRarityColor(char.rarity);
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${isUnlocked ? (isShinyTab ? 'linear-gradient(180deg, #111, #00ffff33)' : `linear-gradient(180deg, #111, ${rarityColor}33)`) : '#111'};
            border: 2px solid ${isUnlocked ? (isShinyTab ? '#00ffff' : rarityColor) : '#333'};
            border-radius: 12px;
            padding: 8px;
            text-align: center;
            opacity: ${isUnlocked ? '1' : '0.4'};
            box-shadow: ${isUnlocked && isShinyTab ? '0 0 10px rgba(0,255,255,0.4)' : (isUnlocked ? `0 0 10px ${rarityColor}44` : 'none')};
        `;

        if (isUnlocked) {
            card.innerHTML = `
                ${isShinyTab ? '<div style="font-size: 0.6rem; color: #00ffff; font-family: monospace; font-weight: bold; margin-bottom: 2px;">💎 SHINY</div>' : ''}
                <div style="font-size: 0.75rem; font-weight: bold; color: ${isShinyTab ? '#00ffff' : rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${char.name}</div>
                <div style="font-size: 0.65rem; color: #888; margin-bottom: 4px;">${(char.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: #fff; border-radius: 6px; overflow: hidden; border: 1px solid #333; margin-bottom: 6px;">
                    <img src="${char.image || ''}" style="width: 100%; height: 100%; object-fit: cover; ${isShinyTab ? 'filter: brightness(1.2) contrast(2);' : ''}" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">COLLECTED</div>
            `;
        } else {
            card.innerHTML = `
                <div style="font-size: 0.75rem; font-weight: bold; color: #666; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">???</div>
                <div style="font-size: 0.65rem; color: #888; margin-bottom: 4px;">${(char.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: #1a1a1a; border-radius: 6px; overflow: hidden; border: 1px solid #333; margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 1.8rem; color: #444; font-weight: bold;">🔒</span>
                </div>
                <div style="font-size: 0.65rem; color: #555; font-weight: bold;">LOCKED</div>
            `;
        }

        dexGrid.appendChild(card);
    });
}

window.setActiveFighter = function(index) {
    window.playerData.activeFighterIndex = index;
    window.saveGameData();
    renderInventoryGrid();
};

window.openInventory = function() {
    window.openInventoryModal();
};

window.openInventoryModal = function() {
    renderInventoryGrid();
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeInventory = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'none';
};

window.openDex = function() {
    let modal = document.getElementById('dexModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dexModal';
        document.body.appendChild(modal);
    }

    modal.className = '';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        transform: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        background: rgba(0,0,0,0.95) !important;
        z-index: 9999999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: monospace !important;
        color: #fff !important;
    `;

    const standardCount = (window.playerData.dex) ? window.playerData.dex.length : 0;
    const shinyCount = (window.playerData.shinyDex) ? window.playerData.shinyDex.length : 0;
    const totalCount = (typeof brainrotCharacters !== 'undefined') ? brainrotCharacters.length : 0;

    modal.innerHTML = `
        <div style="width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
                <h2 style="margin: 0; color: #00ccff; text-transform: uppercase; font-size: 1.5rem;">📖 ROT-DEX STICKER BOOK</h2>
                <div style="font-size: 0.85rem; color: #aaa; margin-top: 2px;">Collected: <span style="color: #00ff55; font-weight: bold;" id="dexHeaderCount">${window.currentDexTab === 'shiny' ? shinyCount : standardCount} / ${totalCount}</span></div>
            </div>
            <button onclick="closeDex()" style="background: #ff0055; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 35px; height: 35px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">X</button>
        </div>
        
        <div style="width: 100%; max-width: 800px; display: flex; gap: 8px; margin-bottom: 15px;">
            <button onclick="switchDexTab('standard')" id="btnDexStandard" style="
                flex: 1; padding: 10px; background: ${window.currentDexTab === 'standard' ? '#00ccff' : '#222'};
                color: ${window.currentDexTab === 'standard' ? '#000' : '#00ccff'};
                border: 2px solid #00ccff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;
                box-shadow: ${window.currentDexTab === 'standard' ? '0 0 10px #00ccff' : 'none'};
            ">📖 STANDARD DEX (${standardCount})</button>
            
            <button onclick="switchDexTab('shiny')" id="btnDexShiny" style="
                flex: 1; padding: 10px; background: ${window.currentDexTab === 'shiny' ? '#00ffff' : '#222'};
                color: ${window.currentDexTab === 'shiny' ? '#000' : '#00ffff'};
                border: 2px solid #00ffff; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: monospace;
                box-shadow: ${window.currentDexTab === 'shiny' ? '0 0 10px #00ffff' : 'none'};
            ">💎 SHINY DEX (${shinyCount})</button>
        </div>

        <div id="dexGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 800px; max-height: calc(100vh - 180px); overflow-y: auto; padding: 5px;"></div>
    `;

    renderDexGrid();
};

window.closeDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) modal.style.display = 'none';
};

window.openReviveModal = function() {
    window.useRevivePotionMenu();
};

window.openAdminPanel = function() {
    const passwordInput = prompt("Enter Admin Secret Key:");
    if (passwordInput !== "Kitkat10") {
        if (typeof showGameToast === 'function') showGameToast("Access Denied.");
        else alert("Access Denied.");
        return;
    }

    let modal = document.getElementById('adminModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminModal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.85) !important;
            z-index: 99999999 !important;
        `;
        modal.innerHTML = `
            <div style="
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                background: #111 !important;
                border: 3px solid #ff0055 !important;
                border-radius: 15px !important;
                padding: 20px !important;
                width: 90% !important;
                max-width: 420px !important;
                text-align: center !important;
                box-sizing: border-box !important;
                font-family: monospace !important;
                color: #fff !important;
            ">
                <h2 style="color: #ff0055; font-size: 1.3rem; margin-bottom: 10px;">🛡️ ADMIN PANEL</h2>
                <div id="adminAccountsList" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 15px; text-align: left;"></div>
                <button onclick="clearAllAccounts()" style="background: #ff0055; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-bottom: 8px;">WIPE ALL CLOUD ACCOUNTS</button>
                <button onclick="closeAdminPanel()" style="background: #333; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    window.renderAdminPanel();
};

window.closeAdminPanel = function() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
};

window.renderAdminPanel = async function() {
    const listEl = document.getElementById('adminAccountsList');
    if (!listEl) return;
    if (typeof firebase === 'undefined') return;

    listEl.innerHTML = `<p style="color:#00ccff; font-size:0.8rem; text-align:center;">Fetching accounts from cloud database...</p>`;

    try {
        const snapshot = await firebase.firestore().collection('accounts').get();
        listEl.innerHTML = '';

        if (snapshot.empty) {
            listEl.innerHTML = `<p style="color:#777; font-size:0.8rem; text-align:center;">No accounts found in cloud database.</p>`;
            return;
        }

        const activeUser = localStorage.getItem('brainrot_logged_in_user');

        snapshot.forEach(doc => {
            const acc = doc.data();
            const username = doc.id;
            const isCurrent = username === activeUser;
            const invCount = acc.inventory ? acc.inventory.length : 0;
            const dexCount = acc.dex ? acc.dex.length : 0;
            const shinyCount = acc.shinyDex ? acc.shinyDex.length : 0;

            const card = document.createElement('div');
            card.style.cssText = `
                background: #222; border: 1px solid ${isCurrent ? '#00ff00' : '#444'};
                padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;
            `;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:${isCurrent ? '#00ff00' : '#fff'}; font-size:0.9rem;">${username} ${isCurrent ? '(ACTIVE)' : ''}</b>
                    <span style="font-size:0.75rem; color:#ffaa00;">💰 ${acc.rotBalance || 0} Rot</span>
                </div>
                <span style="font-size:0.75rem; color:#00ccff;">Inventory: ${invCount} | Dex: ${dexCount} | Shiny: ${shinyCount}</span>
            `;
            listEl.appendChild(card);
        });
    } catch (err) {
        console.error("Error fetching admin accounts:", err);
        listEl.innerHTML = `<p style="color:#ff0055; font-size:0.8rem; text-align:center;">Failed to load cloud accounts.</p>`;
    }
};

window.clearAllAccounts = async function() {
    if (confirm("Are you sure you want to delete ALL accounts from the cloud database?")) {
        try {
            const snapshot = await firebase.firestore().collection('accounts').get();
            const batch = firebase.firestore().batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            localStorage.removeItem('brainrot_logged_in_user');
            if (typeof showGameToast === 'function') showGameToast("All cloud accounts wiped.");
            else alert("All cloud accounts wiped.");
            location.reload();
        } catch (err) {
            console.error("Error wiping cloud accounts:", err);
            if (typeof showGameToast === 'function') showGameToast("Failed to wipe database.");
            else alert("Failed to wipe database.");
        }
    }
};

setInterval(() => {
    if (window.playerData && window.playerData.username) {
        window.saveGameData();
    }
}, 60000);

window.addEventListener('beforeunload', (event) => {
    if (window.playerData && window.playerData.username && typeof firebase !== 'undefined') {
        try {
            const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
                if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
                return value;
            });
            localStorage.setItem('brainrot_local_backup', cleanDataString);
            firebase.firestore().collection('accounts').doc(window.playerData.username).set(JSON.parse(cleanDataString));
        } catch (e) {
            console.error("Unload save error:", e);
        }
    }
});