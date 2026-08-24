// dex.js - Cloud-Connected Account Management, Full-Screen Sticker Dex & Admin System

if (typeof window.isSignUpMode === 'undefined') {
    window.isSignUpMode = false;
}
if (typeof window.selectedStarter === 'undefined') {
    window.selectedStarter = null;
}
if (typeof window.currentDexTab === 'undefined') {
    window.currentDexTab = 'standard';
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
                alert("Nice try! Anti-cheat blocked your hack.");
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
    
    const sourceList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length) ? brainrotCharacters : []);
    
    if (!grid || !sourceList.length) {
        setTimeout(setupStarterOptions, 200);
        return;
    }

    grid.innerHTML = '';
    const starters = sourceList.slice(0, 6);
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
        alert("Please enter both username and password!");
        return;
    }

    const email = rawUsername + "@brainrotgo.com";

    try {
        if (window.isSignUpMode) {
            await firebase.auth().createUserWithEmailAndPassword(email, password);

            const sourceList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length) ? brainrotCharacters : []);

            if (!window.selectedStarter && sourceList.length > 0) {
                window.selectedStarter = sourceList[0];
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
            alert(`Account created successfully! Welcome, ${rawUsername}!`);
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
            alert("Username already exists! Please log in instead.");
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            alert("Invalid username or password!");
        } else {
            alert("Error: " + err.message);
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
            const sourceList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters.length) ? brainrotCharacters : []);
            
            if (!window.selectedStarter && sourceList.length > 0) {
                window.selectedStarter = sourceList[0];
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
        alert("Error signing in with Google. Make sure popups aren't blocked!");
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
        alert(`Inventory is full! (${window.playerData.inventory.length}/${maxSlots}). Transfer rots or upgrade your storage.`);
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

    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : []);
    const totalPossible = masterList.length;
    
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

    if (typeof renderInventoryGrid === 'function') renderInventoryGrid();
    renderDexGrid();
    updatePotionHud();
}

window.updatePotionHud = function() {
    const potionHudCount = document.getElementById('potionHudCount');
    if (potionHudCount && window.playerData) {
        potionHudCount.innerText = window.playerData.revivePotions || 0;
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
    
    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : null);
    
    if (!dexGrid || !masterList) return;

    dexGrid.innerHTML = '';
    const isShinyTab = window.currentDexTab === 'shiny';
    const unlockedDex = isShinyTab ? (window.playerData.shinyDex || []) : (window.playerData.dex || []);

    masterList.forEach((char) => {
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
            // FIX: Replaced solid white box with a transparent dark background and used object-fit: contain
            card.innerHTML = `
                ${isShinyTab ? '<div style="font-size: 0.6rem; color: #00ffff; font-family: monospace; font-weight: bold; margin-bottom: 2px;">💎 SHINY</div>' : ''}
                <div style="font-size: 0.75rem; font-weight: bold; color: ${isShinyTab ? '#00ffff' : rarityColor}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${char.name}</div>
                <div style="font-size: 0.65rem; color: #888; margin-bottom: 4px;">${(char.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
                    <img src="${char.image || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.8)) ${isShinyTab ? 'brightness(1.2) contrast(2)' : ''};" onerror="this.style.display='none';">
                </div>
                <div style="font-size: 0.65rem; color: #00ff55; font-weight: bold;">COLLECTED</div>
            `;
        } else {
            // FIX: Replaced solid dark box with a semi-transparent one to match the unlocked cards
            card.innerHTML = `
                <div style="font-size: 0.75rem; font-weight: bold; color: #666; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">???</div>
                <div style="font-size: 0.65rem; color: #888; margin-bottom: 4px;">${(char.rarity || 'common').toUpperCase()}</div>
                <div style="width: 100%; height: 90px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 1.8rem; color: #444; font-weight: bold;">🔒</span>
                </div>
                <div style="font-size: 0.65rem; color: #555; font-weight: bold;">LOCKED</div>
            `;
        }

        dexGrid.appendChild(card);
    });
}

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
    
    const masterList = (typeof paranormalSpawns !== 'undefined' && paranormalSpawns.length) ? paranormalSpawns : ((typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters : []);
    const totalCount = masterList.length;

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
    if (typeof window.useRevivePotionMenu === 'function') {
        window.useRevivePotionMenu();
    }
};

window.openAdminPanel = function() {
    const passwordInput = prompt("Enter Admin Secret Key:");
    if (passwordInput !== "Kitkat10") {
        alert("Access Denied.");
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
                <h2 style="color: #ff0055; font-size: 1.3rem; margin-bottom: 10px;">🛠️ ADMIN PANEL</h2>
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
            alert("All cloud accounts wiped.");
            location.reload();
        } catch (err) {
            console.error("Error wiping cloud accounts:", err);
            alert("Failed to wipe database.");
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