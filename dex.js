// dex.js - Robust Account Management & Rot-Dex System

let isSignUpMode = false;
let selectedStarter = null;

window.playerData = {
    username: "",
    password: "",
    rotBalance: 500,
    caught: [],
    activeFighterIndex: 0
};

// Immediately check session on script load
(function checkExistingSession() {
    const activeUser = localStorage.getItem('brainrot_logged_in_user');
    if (activeUser) {
        const accounts = JSON.parse(localStorage.getItem('brainrot_accounts') || '{}');
        if (accounts[activeUser]) {
            window.playerData = accounts[activeUser];
            window.addEventListener('load', () => {
                const modal = document.getElementById('loginModal');
                if (modal) modal.style.display = 'none';
                updateHUD();
            });
        }
    }
})();

window.addEventListener('load', () => {
    setupStarterOptions();
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
            <div style="width: 40px; height: 40px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                <img src="${char.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 8px; color: #fff; text-align: center;">${char.name}</span>
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
        // Register new account
        if (accounts[username]) {
            alert("Username already exists! Please log in instead.");
            return;
        }

        if (!selectedStarter && typeof brainrotCharacters !== 'undefined') {
            selectedStarter = brainrotCharacters[0];
        }

        accounts[username] = {
            username: username,
            password: password,
            rotBalance: 500,
            caught: [{
                ...selectedStarter,
                level: 1,
                xp: 0,
                maxHp: 50,
                hp: 50
            }],
            activeFighterIndex: 0
        };

        localStorage.setItem('brainrot_accounts', JSON.stringify(accounts));
        window.playerData = accounts[username];
        localStorage.setItem('brainrot_logged_in_user', username);

        alert(`Account created successfully! Welcome, ${username}!`);
    } else {
        // Log in existing account
        if (!accounts[username] || accounts[username].password !== password) {
            alert("Invalid username or password!");
            return;
        }

        window.playerData = accounts[username];
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

// Add captured creature to Dex
window.addToDex = function(creature) {
    if (!window.playerData.caught) window.playerData.caught = [];
    const exists = window.playerData.caught.some(item => item.name === creature.name);
    if (!exists) {
        window.playerData.caught.push({
            ...creature,
            level: 1,
            xp: 0,
            maxHp: 50,
            hp: 50
        });
    }
    window.saveGameData();
    updateDexUI();
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
    const caughtCount = (window.playerData.caught) ? window.playerData.caught.length : 0;

    if (dexCountEl) dexCountEl.innerText = caughtCount;
    if (totalBrainrotsEl) totalBrainrotsEl.innerText = totalPossible;
    if (inventoryCountEl) inventoryCountEl.innerText = caughtCount;
    if (rotBalanceEl) rotBalanceEl.innerText = window.playerData.rotBalance || 500;
    if (hudTitle && window.playerData.username) hudTitle.innerText = `🎮 ${window.playerData.username.toUpperCase()}`;

    updateDexUI();
}

// Render Dex Grid with Active Fighter selector
function updateDexUI() {
    const dexGrid = document.getElementById('dexGrid');
    if (!dexGrid || typeof brainrotCharacters === 'undefined' || !brainrotCharacters) return;

    dexGrid.innerHTML = '';

    brainrotCharacters.forEach((char) => {
        if (!window.playerData.caught) window.playerData.caught = [];
        const caughtItemIndex = window.playerData.caught.findIndex(item => item.name === char.name);
        const isCaught = caughtItemIndex !== -1;
        const isActive = isCaught && window.playerData.activeFighterIndex === caughtItemIndex;
        const rarityColor = window.getRarityColor(char.rarity);
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${isCaught ? `linear-gradient(135deg, #111, ${rarityColor}33)` : '#111'};
            border: 2px solid ${isActive ? '#00ff00' : (isCaught ? rarityColor : '#444')};
            border-radius: 8px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            opacity: ${isCaught ? '1' : '0.35'};
        `;

        if (isCaught) {
            const caughtData = window.playerData.caught[caughtItemIndex];
            card.innerHTML = `
                <div style="width: 45px; height: 45px; background: #fff; border-radius: 4px; overflow: hidden; margin-bottom: 2px;">
                    <img src="${char.image}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <span style="font-size: 9px; color: #fff; font-family: monospace; font-weight: bold;">${char.name}</span>
                <span style="font-size: 8px; color: #00ff00; font-family: monospace;">Lvl ${caughtData.level || 1}</span>
                ${isActive ? '<span style="font-size: 7px; background: #00ff00; color: #000; padding: 1px 4px; border-radius: 3px; font-weight: bold;">ACTIVE</span>' : `<button onclick="setActiveFighter(${caughtItemIndex})" style="font-size: 7px; background: #333; color: #fff; border: 1px solid #777; cursor: pointer; padding: 2px 4px; border-radius: 3px; margin-top: 2px;">SELECT</button>`}
            `;
        } else {
            card.innerHTML = `
                <div style="width: 45px; height: 45px; background: #222; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; color: #555; font-size: 16px;">?</div>
                <span style="font-size: 9px; color: #777; font-family: monospace;">???</span>
                <span style="font-size: 8px; color: #444; font-family: monospace;">Locked</span>
            `;
        }

        dexGrid.appendChild(card);
    });
}

// Set active fighter
window.setActiveFighter = function(index) {
    window.playerData.activeFighterIndex = index;
    window.saveGameData();
    updateDexUI();
};

// Open/Close Modal Functions
window.openDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) {
        modal.style.display = 'block';
        updateDexUI();
    }
};

window.closeDex = function() {
    const modal = document.getElementById('dexModal');
    if (modal) {
        modal.style.display = 'none';
    }
};