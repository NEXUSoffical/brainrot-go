// dex.js - Robust Account Management, Sticker Dex & Inventory Storage System

let isSignUpMode = false;
let selectedStarter = null;

window.playerData = {
    username: "",
    password: "",
    rotBalance: 500,
    dex: [],         // Sticker book: list of unlocked creature names
    inventory: [],   // Actual storage: list of owned creature instances with levels/HP
    activeFighterIndex: 0
};

// Immediately check session on script load and restore user data
(function checkExistingSession() {
    const activeUser = localStorage.getItem('brainrot_logged_in_user');
    if (activeUser) {
        const accounts = JSON.parse(localStorage.getItem('brainrot_accounts') || '{}');
        if (accounts[activeUser]) {
            window.playerData = accounts[activeUser];
            if (!window.playerData.dex) window.playerData.dex = [];
            if (!window.playerData.inventory) window.playerData.inventory = [];
            
            // Hide login modal safely once DOM is ready
            document.addEventListener('DOMContentLoaded', () => {
                const modal = document.getElementById('loginModal');
                if (modal) modal.style.display = 'none';
                updateHUD();
            });
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    setupStarterOptions();
    updateHUD();
});

// Toggle between Login and Sign Up mode
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

// Setup starter selector grid safely
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

// Handle Account Sign Up or Login
window.handleAccountAction = function() {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    
    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!username || !password) {
        alert("Please enter both username and password!");
        return;
    }

    let accounts = JSON.parse(localStorage.getItem('brainrot_accounts') || '{}');

    if (isSignUpMode) {
        if (accounts[username]) {
            alert("Username already exists! Please log in instead.");
            return;
        }

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

        accounts[username] = {
            username: username,
            password: password,
            rotBalance: 500,
            dex: [selectedStarter.name],
            inventory: [starterInstance],
            activeFighterIndex: 0
        };

        localStorage.setItem('brainrot_accounts', JSON.stringify(accounts));
        window.playerData = accounts[username];
        localStorage.setItem('brainrot_logged_in_user', username);

        alert(`Account created successfully! Welcome, ${username}!`);
    } else {
        if (!accounts[username] || accounts[username].password !== password) {
            alert("Invalid username or password!");
            return;
        }

        window.playerData = accounts[username];
        if (!window.playerData.dex) window.playerData.dex = [];
        if (!window.playerData.inventory) window.playerData.inventory = [];
        localStorage.setItem('brainrot_logged_in_user', username);
    }

    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'none';
    updateHUD();
};

// Logout active account
window.logoutAccount = function() {
    window.saveGameData();
    localStorage.removeItem('brainrot_logged_in_user');
    location.reload();
};

// Save player data to account store
window.saveGameData = function() {
    if (!window.playerData || !window.playerData.username) return;
    let accounts = JSON.parse(localStorage.getItem('brainrot_accounts') || '{}');
    accounts[window.playerData.username] = window.playerData;
    localStorage.setItem('brainrot_accounts', JSON.stringify(accounts));
    updateHUD();
};

// Add captured creature to Inventory and Sticker Dex
window.addToDex = function(creature) {
    if (!window.playerData.inventory) window.playerData.inventory = [];
    if (!window.playerData.dex) window.playerData.dex = [];

    // Add to Inventory (can store multiple copies/duplicates)
    window.playerData.inventory.push({
        ...creature,
        level: 1,
        xp: 0,
        maxHp: 50,
        hp: 50
    });

    // Add to Sticker Dex (encyclopedia unlocks unique sticker once)
    if (!window.playerData.dex.includes(creature.name)) {
        window.playerData.dex.push(creature.name);
    }

    window.saveGameData();
    updateHUD();
};

// Get rarity color helper
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

// Update HUD numbers
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
    if (hudTitle && window.playerData.username) hudTitle.innerText = `🎮 ${window.playerData.username.toUpperCase()}`;

    renderInventoryGrid();
    renderDexGrid();
}

// 🎒 Render Inventory Grid (Actual storage of owned rots)
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

// 📖 Render Sticker Book Dex Grid (Encyclopedia)
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

// Set active fighter from inventory
window.setActiveFighter = function(index) {
    window.playerData.activeFighterIndex = index;
    window.saveGameData();
    renderInventoryGrid();
};

// Open/Close Inventory Modal
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

// Open/Close Sticker Dex Modal
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