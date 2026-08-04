// dex.js - Cloud-Connected Account Management, Sticker Dex, Inventory & Admin System

if (typeof window.isSignUpMode === 'undefined') {
    window.isSignUpMode = false;
}
if (typeof window.selectedStarter === 'undefined') {
    window.selectedStarter = null;
}
if (typeof window.currentInventoryTab === 'undefined') {
    window.currentInventoryTab = 'rots';
}

// 🛡️ SECURE STATE WRAPPER (ANTI-CHEAT GUARD DOG)
if (!window._internalPlayerData) {
    window._internalPlayerData = {
        username: "",
        rotBalance: 500,
        accountLevel: 1,
        dex: [],         
        inventory: [],   
        activeFighterIndex: 0,
        revivePotions: 3,
        luckyEggs: 0
    };
}

if (!window.playerData) {
    window.playerData = new Proxy(window._internalPlayerData, {
        set(target, property, value) {
            if (property === 'rotBalance' && value > (target.rotBalance + 10000)) {
                console.warn("🚨 ANTI-CHEAT: Unauthorized balance modification blocked!");
                alert("Nice try! Anti-cheat blocked your hack. 😉");
                return false;
            }
            target[property] = value;
            return true;
        }
    });
}

function setPlayerData(newData) {
    window._internalPlayerData.username = newData.username || "";
    window._internalPlayerData.rotBalance = newData.rotBalance || 500;
    window._internalPlayerData.accountLevel = newData.accountLevel || newData.accLvl || 1;
    window._internalPlayerData.dex = newData.dex || [];
    window._internalPlayerData.inventory = newData.inventory || [];
    window._internalPlayerData.activeFighterIndex = newData.activeFighterIndex || 0;
    window._internalPlayerData.revivePotions = typeof newData.revivePotions !== 'undefined' ? newData.revivePotions : 3;
    window._internalPlayerData.luckyEggs = typeof newData.luckyEggs !== 'undefined' ? newData.luckyEggs : 0;
}

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
        console.log("⚡ Game data saved successfully to cloud and local!");
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
                
                // Merge inventory safely by rot name, keeping the version with the highest level/XP
                const inventoryMap = new Map();
                const allItems = [...(cloudData.inventory || []), ...(localData?.inventory || [])];
                allItems.forEach(item => {
                    const key = item.name;
                    const existing = inventoryMap.get(key);
                    if (!existing || 
                        (item.level || 1) > (existing.level || 1) || 
                        ((item.level || 1) === (existing.level || 1) && (item.xp || 0) > (existing.xp || 0))) {
                        inventoryMap.set(key, item);
                    }
                });
                const mergedInventory = Array.from(inventoryMap.values());

                const bestAccountLevel = Math.max(
                    cloudData.accountLevel || cloudData.accLvl || 1, 
                    localData?.accountLevel || localData?.accLvl || 1
                );

                // Use Math.min for consumables so they properly decrease when used
                const cloudRevives = typeof cloudData.revivePotions !== 'undefined' ? cloudData.revivePotions : 3;
                const localRevives = typeof localData?.revivePotions !== 'undefined' ? localData.revivePotions : 3;
                const bestRevives = Math.min(cloudRevives, localRevives);

                const cloudEggs = typeof cloudData.luckyEggs !== 'undefined' ? cloudData.luckyEggs : 0;
                const localEggs = typeof localData?.luckyEggs !== 'undefined' ? localData.luckyEggs : 0;
                const bestEggs = Math.min(cloudEggs, localEggs);

                setPlayerData({
                    username: cloudData.username || activeUser,
                    rotBalance: Math.max(cloudData.rotBalance || 0, localData?.rotBalance || 0),
                    accountLevel: bestAccountLevel,
                    dex: mergedDex,
                    inventory: mergedInventory,
                    activeFighterIndex: cloudData.activeFighterIndex || localData?.activeFighterIndex || 0,
                    revivePotions: bestRevives,
                    luckyEggs: bestEggs
                });

                console.log("Game data successfully synced and merged from cloud!");
            }
        } catch (err) {
            console.error("Error restoring session from cloud:", err);
        }
    }

    if (!window.playerData.dex) window.playerData.dex = [];
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
        alert("Please enter both username and password!");
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
                hp: 50
            };

            setPlayerData({
                username: rawUsername,
                rotBalance: 500,
                accountLevel: 1,
                dex: [window.selectedStarter.name],
                inventory: [starterInstance],
                activeFighterIndex: 0,
                revivePotions: 3,
                luckyEggs: 0
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
            if (!window.selectedStarter && typeof brainrotCharacters !== 'undefined') {
                window.selectedStarter = brainrotCharacters[0];
            }

            const starterInstance = {
                ...window.selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50
            };

            setPlayerData({
                username: rawUsername,
                rotBalance: 500,
                accountLevel: 1,
                dex: [window.selectedStarter.name],
                inventory: [starterInstance],
                activeFighterIndex: 0,
                revivePotions: 3,
                luckyEggs: 0
            });

            const cleanDataString = JSON.stringify(window._internalPlayerData, (key, value) => {
                if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
                return value;
            });
            await docRef.set(JSON.parse(cleanDataString));
        } else {
            setPlayerData(doc.data());
            if (!window.playerData.dex) window.playerData.dex = [];
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
    await window.saveGameData();
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.warn("Firebase signout error:", e);
    }
    
    localStorage.removeItem('brainrot_logged_in_user');
    localStorage.removeItem('brainrot_local_backup');
    window._internalPlayerData.username = "";
    
    location.reload();
};

window.addToDex = function(creature) {
    if (!window.playerData.inventory) window.playerData.inventory = [];
    if (!window.playerData.dex) window.playerData.dex = [];

    const rotLevel = creature.level || 1;
    const rotMaxHp = creature.maxHp || (50 + (rotLevel - 1) * 12);

    window.playerData.inventory.push({
        ...creature,
        marker: undefined,
        level: rotLevel,
        xp: creature.xp || 0,
        maxHp: rotMaxHp,
        hp: rotMaxHp
    });

    if (!window.playerData.dex.includes(creature.name)) {
        window.playerData.dex.push(creature.name);
    }

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
    const accLvlEls = document.querySelectorAll('#accLvl, .accLvlDisplay');

    const totalPossible = (typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters.length : 0;
    const dexCount = (window.playerData.dex) ? window.playerData.dex.length : 0;
    const inventoryCount = (window.playerData.inventory) ? window.playerData.inventory.length : 0;

    if (dexCountEl) dexCountEl.innerText = dexCount;
    if (totalBrainrotsEl) totalBrainrotsEl.innerText = totalPossible;
    if (inventoryCountEl) inventoryCountEl.innerText = inventoryCount;
    if (rotBalanceEl) rotBalanceEl.innerText = window.playerData.rotBalance || 500;
    if (hudTitle && window.playerData.username) hudTitle.innerText = `🕹️ ${window.playerData.username.toUpperCase()}`;
    
    accLvlEls.forEach(el => {
        el.innerText = window.playerData.accountLevel || 1;
    });

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

function renderInventoryGrid() {
    let inventoryGrid = document.getElementById('inventoryGrid');
    let modal = document.getElementById('inventoryModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inventoryModal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.85) !important;
            z-index: 999999 !important;
            display: none;
        `;
        modal.innerHTML = `
            <div style="
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                background: #111 !important;
                border: 3px solid #ffcc00 !important;
                border-radius: 15px !important;
                padding: 20px !important;
                width: 90% !important;
                max-width: 420px !important;
                text-align: center !important;
                box-shadow: 0 0 30px rgba(255,204,0,0.4) !important;
                box-sizing: border-box !important;
            ">
                <h2 style="color: #ffcc00; font-size: 1.3rem; margin-bottom: 10px;">🎒 INVENTORY</h2>
                <div id="inventoryTabSwitcher" style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button onclick="switchInventoryTab('rots')" id="btnTabRots" style="flex: 1; background: ${window.currentInventoryTab === 'rots' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'rots' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 8px; font-weight: bold; border-radius: 6px; cursor: pointer;">🧠 ROTS</button>
                    <button onclick="switchInventoryTab('items')" id="btnTabItems" style="flex: 1; background: ${window.currentInventoryTab === 'items' ? '#ffcc00' : '#222'}; color: ${window.currentInventoryTab === 'items' ? '#000' : '#fff'}; border: 2px solid #ffcc00; padding: 8px; font-weight: bold; border-radius: 6px; cursor: pointer;">🎒 ITEMS</button>
                </div>
                <div id="inventoryGrid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 280px; overflow-y: auto; margin-bottom: 15px; padding-right: 4px;"></div>
                <button onclick="closeInventory()" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE</button>
            </div>
        `;
        document.body.appendChild(modal);
        inventoryGrid = document.getElementById('inventoryGrid');
    }

    if (!inventoryGrid) return;
    inventoryGrid.innerHTML = '';

    if (window.currentInventoryTab === 'rots') {
        const inventory = window.playerData.inventory || [];
        if (inventory.length === 0) {
            inventoryGrid.innerHTML = `<p style="grid-column: span 2; color: #777; font-size: 0.9rem; padding: 30px; text-align: center;">Your inventory is empty! Catch rots on the map.</p>`;
            return;
        }

        inventory.forEach((rot, index) => {
            const isActive = window.playerData.activeFighterIndex === index;
            const isFainted = rot.fainted === true;
            const isInGym = rot.inGym === true;
            const rarityColor = window.getRarityColor(rot.rarity);
            const rotLevel = rot.level || 1;
            const requiredXp = rotLevel * 100;
            const xpPercent = Math.min(100, Math.max(0, ((rot.xp || 0) / requiredXp) * 100));

            const card = document.createElement('div');
            card.style.cssText = `
                background: ${isInGym ? '#1a222a' : (isFainted ? '#2a1a1a' : (isActive ? '#1a3a1a' : '#222'))};
                border: 2px solid ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : (isActive ? '#00ff00' : rarityColor))};
                border-radius: 8px;
                padding: 8px;
                text-align: center;
            `;

            card.innerHTML = `
                <img src="${rot.image || ''}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px; ${isFainted || isInGym ? 'filter: grayscale(100%);' : ''}" onerror="this.style.display='none';">
                <div style="font-size: 0.75rem; font-weight: bold; margin-top: 4px; color: #fff;">${rot.name}</div>
                <div style="font-size: 0.65rem; color: ${isInGym ? '#00ccff' : (isFainted ? '#ff0055' : '#00ff00')};">
                    ${isInGym ? '🏢 [IN GYM]' : (isFainted ? '💀 FAINTED' : 'Lvl ' + rotLevel)}
                </div>
                ${!isFainted && !isInGym ? `
                <div style="width: 100%; height: 3px; background: #111; margin-top: 4px; border-radius: 2px; overflow: hidden;">
                    <div style="width: ${xpPercent}%; height: 100%; background: #00ccff;"></div>
                </div>` : ''}
                <div style="display: flex; gap: 4px; margin-top: 6px;">
                    ${!isActive && !isInGym && !isFainted ? `<button onclick="setActiveFighter(${index})" style="background: #00ff00; color: #000; border: none; padding: 3px 6px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">ACTIVE</button>` : ''}
                    <button onclick="transferRot(${index})" style="background: #ff0055; color: #fff; border: none; padding: 3px 6px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">TRANSFER</button>
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    } else {
        const revives = window.playerData.revivePotions || 0;
        const luckyEggs = window.playerData.luckyEggs || 0;

        inventoryGrid.innerHTML = `
            <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 10px; width: 100%;">
                <div style="background: #222; border: 2px solid #00ffcc; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 2rem;">🧪</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 0.9rem; color: #fff;">Revive Potion (x${revives})</div>
                            <div style="font-size: 0.7rem; color: #00ffcc;">Wakes up a fainted rot!</div>
                        </div>
                    </div>
                    <button onclick="useRevivePotionMenu()" style="background: #00ffcc; color: #000; border: none; padding: 8px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">USE</button>
                </div>
                <div style="background: #222; border: 2px solid #ff00ff; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 2rem;">🥚</div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 0.9rem; color: #fff;">Lucky Egg (x${luckyEggs})</div>
                            <div style="font-size: 0.7rem; color: #ff00ff;">Double Account XP for 1hr!</div>
                        </div>
                    </div>
                    <button onclick="useLuckyEgg()" style="background: #ff00ff; color: #000; border: none; padding: 8px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">USE</button>
                </div>
            </div>
        `;
    }
}

window.switchInventoryTab = function(tabName) {
    window.currentInventoryTab = tabName;
    const btnRots = document.getElementById('btnTabRots');
    const btnItems = document.getElementById('btnTabItems');
    if (btnRots && btnItems) {
        btnRots.style.background = tabName === 'rots' ? '#ffcc00' : '#222';
        btnRots.style.color = tabName === 'rots' ? '#000' : '#fff';
        btnItems.style.background = tabName === 'items' ? '#ffcc00' : '#222';
        btnItems.style.color = tabName === 'items' ? '#000' : '#fff';
    }
    renderInventoryGrid();
};

window.useLuckyEgg = function() {
    if ((window.playerData.luckyEggs || 0) <= 0) {
        alert("❌ You don't have any Lucky Eggs! Visit the shop to buy some.");
        return;
    }
    window.playerData.luckyEggs--;
    window.saveGameData();
    alert("🥚 Lucky Egg activated! Double Account XP is now active for 1 hour!");
    renderInventoryGrid();
    updatePotionHud();
};

window.useRevivePotionMenu = function() {
    if ((window.playerData.revivePotions || 0) <= 0) {
        alert("❌ You don't have any Revive Potions! Visit the shop to buy some.");
        return;
    }

    const faintedRots = (window.playerData.inventory || []).filter(r => r.fainted);
    if (faintedRots.length === 0) {
        alert("👍 None of your rots need reviving right now!");
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
        background: rgba(0,0,0,0.85) !important;
        z-index: 9999999 !important;
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
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
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
        alert("❌ No revive potions left!");
        return;
    }

    window.playerData.revivePotions--;
    targetRot.fainted = false;
    targetRot.hp = targetRot.maxHp || 50;

    window.saveGameData();
    updatePotionHud();

    alert(`🧪 Successfully revived ${targetRot.name}!`);
    
    const rModal = document.getElementById('reviveSelectModal');
    if (rModal) rModal.remove();
    renderInventoryGrid();
};

window.transferRot = function(index) {
    const inventory = window.playerData.inventory || [];
    if (inventory.length <= 1) {
        alert("You cannot transfer your last rot!");
        return;
    }
    if (index === window.playerData.activeFighterIndex) {
        alert("You cannot transfer your active fighter! Select a different fighter first.");
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

function renderDexGrid() {
    const dexGrid = document.getElementById('dexGrid');
    if (!dexGrid || typeof brainrotCharacters === 'undefined' || !brainrotCharacters) return;

    dexGrid.innerHTML = '';
    const unlockedDex = window.playerData.dex || [];

    brainrotCharacters.forEach((char) => {
        const isUnlocked = unlockedDex.includes(char.name);
        const rarityColor = window.getRarityColor(char.rarity);
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${isUnlocked ? `linear-gradient(135deg, #111, ${rarityColor}33)` : '#111'};
            border: 2px solid ${isUnlocked ? rarityColor : '#333'};
            border-radius: 8px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: ${isUnlocked ? '1' : '0.3'};
        `;

        if (isUnlocked) {
            card.innerHTML = `
                <div style="width: 42px; height: 42px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                    <img src="${char.image}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <span style="font-size: 8.5px; color: #fff; font-family: monospace; font-weight: bold;">${char.name}</span>
                <span style="font-size: 7px; color: ${rarityColor}; font-family: monospace; text-transform: uppercase;">${char.rarity}</span>
            `;
        } else {
            card.innerHTML = `
                <div style="width: 42px; height: 42px; background: #222; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; color: #555; font-size: 16px;">?</div>
                <span style="font-size: 8.5px; color: #777; font-family: monospace;">???</span>
                <span style="font-size: 7px; color: #444; font-family: monospace;">Locked</span>
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

// ==========================================
// UNIVERSAL BUTTON ALIASES & MODALS
// ==========================================
window.openInventory = function() {
    window.openInventoryModal();
};

window.openInventoryModal = function() {
    renderInventoryGrid();
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.style.display = 'block';
    }
};

window.closeInventory = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'none';
};

window.openDex = function() {
    const existingModal = document.getElementById('dexModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'dexModal';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0,0,0,0.85) !important;
        z-index: 999999 !important;
        display: block !important;
    `;

    modal.innerHTML = `
        <div style="
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: #111 !important;
            border: 3px solid #00ccff !important;
            border-radius: 15px !important;
            padding: 20px !important;
            width: 90% !important;
            max-width: 440px !important;
            text-align: center !important;
            box-shadow: 0 0 30px rgba(0,204,255,0.4) !important;
            box-sizing: border-box !important;
            font-family: monospace !important;
            color: #fff !important;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h2 style="color: #00ccff; font-size: 1.1rem; margin: 0;">📖 ROT-DEX STICKER BOOK</h2>
                <button onclick="closeDex()" style="background: #ff0055; color: #fff; border: none; width: 28px; height: 28px; border-radius: 50%; font-weight: bold; cursor: pointer;">✕</button>
            </div>
            <p style="font-size: 0.7rem; color: #aaa; margin-bottom: 12px;">Collect all stickers by exploring and catching rots!</p>
            <div id="dexGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 280px; overflow-y: auto; margin-bottom: 15px; padding-right: 4px; background: #0a0a0a; padding: 10px; border-radius: 8px;"></div>
            <button onclick="closeDex()" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE</button>
        </div>
    `;

    document.body.appendChild(modal);
    renderDexGrid();
};

window.closeDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) modal.remove();
};

window.openReviveModal = function() {
    window.useRevivePotionMenu();
};

// ==========================================
// SECURE CLOUD ADMIN PANEL FUNCTIONS
// ==========================================

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
            z-index: 999999 !important;
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
            ">
                <h2 style="color: #ff0055; font-size: 1.3rem; margin-bottom: 10px;">🛡️ ADMIN PANEL</h2>
                <div id="adminAccountsList" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 15px; text-align: left;"></div>
                <button onclick="clearAllAccounts()" style="background: #ff0055; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-bottom: 8px;">WIPE ALL CLOUD ACCOUNTS</button>
                <button onclick="closeAdminPanel()" style="background: #333; color: #fff; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">CLOSE</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'block';
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
                <span style="font-size:0.75rem; color:#00ccff;">Inventory: ${invCount} Rots | Sticker Dex: ${dexCount} Unlocked</span>
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

// ==========================================
// AUTO-SAVE THROTTLING & SAFETY NET
// ==========================================

setInterval(() => {
    if (window.playerData && window.playerData.username) {
        window.saveGameData();
        console.log("⚡ Auto-saved game state to cloud/local.");
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