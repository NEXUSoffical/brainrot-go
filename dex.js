// dex.js - Cloud-Connected Account Management, Sticker Dex & Admin System

const db = firebase.firestore();
const auth = firebase.auth();

let isSignUpMode = false;
let selectedStarter = null;

window.playerData = {
    username: "",
    rotBalance: 500,
    dex: [],         
    inventory: [],   
    activeFighterIndex: 0
};

// Check existing session on load
(async function checkExistingSession() {
    const activeUser = localStorage.getItem('brainrot_logged_in_user');
    if (activeUser) {
        try {
            const doc = await db.collection('accounts').doc(activeUser).get();
            if (doc.exists) {
                window.playerData = doc.data();
                if (!window.playerData.dex) window.playerData.dex = [];
                if (!window.playerData.inventory) window.playerData.inventory = [];
                
                document.addEventListener('DOMContentLoaded', () => {
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.style.display = 'none';
                    updateHUD();
                });
            }
        } catch (err) {
            console.error("Error restoring session from cloud:", err);
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    setupStarterOptions();
    updateHUD();
});

window.toggleAuthMode = function() {
    isSignUpMode = !isSignUpMode;
    const starterSec = document.getElementById('starterSection');
    const toggleText = document.getElementById('loginToggleText');
    
    if (isSignUpMode) {
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
    selectedStarter = starters[0];

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
            selectedStarter = char;
        };
        grid.appendChild(item);
    });
}

// Handle Cloud Authentication (Sign Up / Login)
window.handleAccountAction = async function() {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    
    // Auto-lowercase to prevent mobile input mismatched casing bugs
    const rawUsername = usernameInput ? usernameInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!rawUsername || !password) {
        alert("Please enter both username and password!");
        return;
    }

    const email = rawUsername + "@brainrotgo.com";

    try {
        if (isSignUpMode) {
            // 1. Save password in secure Firebase Auth Vault
            await auth.createUserWithEmailAndPassword(email, password);

            if (!selectedStarter && typeof brainrotCharacters !== 'undefined') {
                selectedStarter = brainrotCharacters[0];
            }

            const starterInstance = {
                ...selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50
            };

            window.playerData = {
                username: rawUsername,
                rotBalance: 500,
                dex: [selectedStarter.name],
                inventory: [starterInstance],
                activeFighterIndex: 0
            };

            // 2. Save document to Firestore without storing password
            await db.collection('accounts').doc(rawUsername).set(window.playerData);
            
            localStorage.setItem('brainrot_logged_in_user', rawUsername);
            alert(`Account created successfully! Welcome, ${rawUsername}!`);
        } else {
            // 1. Verify credentials via Auth Vault
            await auth.signInWithEmailAndPassword(email, password);

            // 2. Load Firestore account document
            const docRef = db.collection('accounts').doc(rawUsername);
            const doc = await docRef.get();

            if (doc.exists) {
                window.playerData = doc.data();
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

// ==========================================
// GOOGLE SIGN-IN MAGIC
// ==========================================
window.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Turn their Google email (e.g., kieran@gmail.com) into a cool username (kieran)
        const rawUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        // Check if they already have a save file in the database
        const docRef = db.collection('accounts').doc(rawUsername);
        const doc = await docRef.get();

        if (!doc.exists) {
            // NEW GOOGLE PLAYER! Give them a starter rot
            if (!selectedStarter && typeof brainrotCharacters !== 'undefined') {
                selectedStarter = brainrotCharacters[0];
            }

            const starterInstance = {
                ...selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50
            };

            window.playerData = {
                username: rawUsername,
                rotBalance: 500,
                dex: [selectedStarter.name],
                inventory: [starterInstance],
                activeFighterIndex: 0
            };

            // Save their new profile to the cloud
            await docRef.set(window.playerData);
        } else {
            // RETURNING GOOGLE PLAYER! Load their data
            window.playerData = doc.data();
            if (!window.playerData.dex) window.playerData.dex = [];
            if (!window.playerData.inventory) window.playerData.inventory = [];
        }

        // Log them in instantly
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
    await auth.signOut();
    localStorage.removeItem('brainrot_logged_in_user');
    location.reload();
};

window.saveGameData = async function() {
    if (!window.playerData || !window.playerData.username) return;
    try {
        await db.collection('accounts').doc(window.playerData.username).set(window.playerData);
        updateHUD();
    } catch (err) {
        console.error("Error saving to cloud:", err);
    }
};

window.addToDex = function(creature) {
    if (!window.playerData.inventory) window.playerData.inventory = [];
    if (!window.playerData.dex) window.playerData.dex = [];

    const rotLevel = creature.level || 1;
    const rotMaxHp = creature.maxHp || (50 + (rotLevel - 1) * 12);

    window.playerData.inventory.push({
        ...creature,
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

    const totalPossible = (typeof brainrotCharacters !== 'undefined' && brainrotCharacters) ? brainrotCharacters.length : 0;
    const dexCount = (window.playerData.dex) ? window.playerData.dex.length : 0;
    const inventoryCount = (window.playerData.inventory) ? window.playerData.inventory.length : 0;

    if (dexCountEl) dexCountEl.innerText = dexCount;
    if (totalBrainrotsEl) totalBrainrotsEl.innerText = totalPossible;
    if (inventoryCountEl) inventoryCountEl.innerText = inventoryCount;
    if (rotBalanceEl) rotBalanceEl.innerText = window.playerData.rotBalance || 500;
    if (hudTitle && window.playerData.username) hudTitle.innerText = `🕹️ ${window.playerData.username.toUpperCase()}`;

    renderInventoryGrid();
    renderDexGrid();
}

function renderInventoryGrid() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = '';
    const inventory = window.playerData.inventory || [];

    if (inventory.length === 0) {
        inventoryGrid.innerHTML = `<p style="grid-column: span 3; color: #777; font-size: 0.8rem; padding: 20px;">Your inventory is empty! Catch rots on the map.</p>`;
        return;
    }

    inventory.forEach((rot, index) => {
        const isActive = window.playerData.activeFighterIndex === index;
        const rarityColor = window.getRarityColor(rot.rarity);

        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #111, ${rarityColor}33);
            border: 2px solid ${isActive ? '#00ff00' : rarityColor};
            border-radius: 8px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
        `;

        card.innerHTML = `
            <div style="width: 42px; height: 42px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                <img src="${rot.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 8.5px; color: #fff; font-family: monospace; font-weight: bold;">${rot.name}</span>
            <span style="font-size: 7.5px; color: #00ff00; font-family: monospace;">Lvl ${rot.level || 1}</span>
            ${isActive ? '<span style="font-size: 6.5px; background: #00ff00; color: #000; padding: 1px 4px; border-radius: 3px; font-weight: bold;">FIGHTING</span>' : `<button onclick="setActiveFighter(${index})" style="font-size: 6.5px; background: #333; color: #fff; border: 1px solid #777; cursor: pointer; padding: 2px 4px; border-radius: 3px; margin-top: 2px;">SELECT</button>`}
        `;
        inventoryGrid.appendChild(card);
    });
}

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

window.openInventory = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) {
        modal.style.display = 'block';
        renderInventoryGrid();
    }
};

window.closeInventory = function() {
    const modal = document.getElementById('inventoryModal');
    if (modal) modal.style.display = 'none';
};

window.openDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) {
        modal.style.display = 'block';
        renderDexGrid();
    }
};

window.closeDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) modal.style.display = 'none';
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

    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'flex';
        window.renderAdminPanel();
    }
};

window.closeAdminPanel = function() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
};

window.renderAdminPanel = async function() {
    const listEl = document.getElementById('adminAccountsList');
    if (!listEl) return;

    listEl.innerHTML = `<p style="color:#00ccff; font-size:0.8rem; text-align:center;">Fetching accounts from cloud database...</p>`;

    try {
        const snapshot = await db.collection('accounts').get();
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
            const snapshot = await db.collection('accounts').get();
            const batch = db.batch();
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