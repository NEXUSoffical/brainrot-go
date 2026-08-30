// account.js - Core Account Management & Authentication Logic

if (typeof window.isSignUpMode === 'undefined') {
    window.isSignUpMode = false;
}
if (typeof window.selectedStarter === 'undefined') {
    window.selectedStarter = null;
}

// Helper function to safely fallback to a Common starter entity only
function ensureCommonStarter() {
    if (!window.selectedStarter && typeof paranormalSpawns !== 'undefined') {
        const commonStarters = paranormalSpawns.filter(char => char.rarity && char.rarity.toLowerCase() === 'common');
        window.selectedStarter = commonStarters.length > 0 ? commonStarters[0] : paranormalSpawns[0];
    }
}

// Toggle between Login and Sign Up modes on the UI modal
window.toggleAuthMode = function() {
    window.isSignUpMode = !window.isSignUpMode;
    const starterSec = document.getElementById('starterSection');
    const toggleText = document.getElementById('loginToggleText');
    
    if (window.isSignUpMode) {
        if (starterSec) starterSec.style.display = 'block';
        if (toggleText) toggleText.innerText = "Already have an account? Click here to Log In";
    } else {
        if (starterSec) starterSec.style.display = 'none';
        if (toggleText) toggleText.innerText = "New hunter? Click here to Sign Up";
    }
};

// Handle manual username/password login or registration action
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

    const email = rawUsername + "@ghosthuntergo.com";

    try {
        if (window.isSignUpMode) {
            await firebase.auth().createUserWithEmailAndPassword(email, password);

            ensureCommonStarter();

            const starterInstance = {
                ...(window.selectedStarter || {
                    name: "Vampire",
                    rarity: "common",
                    image: "brainrots/vampire.png",
                    baseHp: 60,
                    baseAtk: 15,
                    baseDef: 10
                }),
                level: 1,
                xp: 0,
                maxHp: 60,
                hp: 60
            };

            if (typeof setPlayerData === 'function') {
                setPlayerData({
                    username: rawUsername,
                    currency: 500,
                    accountLevel: 1,
                    accountXp: 0,
                    dex: [starterInstance.name],
                    inventory: [starterInstance],
                    gear: ["w_01"], // Inject starting weapon to new accounts
                    equipped: { weapon: "w_01" }, // Auto-equip starting weapon
                    activeFighterIndex: 0,
                    revivePotions: 3,
                    luckyEggs: 0
                });
            }

            if (typeof window.saveGameData === 'function') {
                await window.saveGameData();
            }
            if (typeof showGameToast === 'function') {
                showGameToast(`Account created successfully! Welcome, Hunter ${rawUsername}!`);
            } else {
                alert(`Account created successfully! Welcome, Hunter ${rawUsername}!`);
            }
        } else {
            await firebase.auth().signInWithEmailAndPassword(email, password);

            const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
            const doc = await docRef.get();

            if (doc.exists && typeof setPlayerData === 'function') {
                setPlayerData(doc.data());
                
                // Protect and initialize arrays for older cloud saves
                if (window.playerData && !window.playerData.dex) window.playerData.dex = [];
                if (window.playerData && !window.playerData.inventory) window.playerData.inventory = [];
                if (window.playerData && !window.playerData.gear) window.playerData.gear = ["w_01"];
                if (window.playerData && !window.playerData.equipped) window.playerData.equipped = { weapon: "w_01" };
            }
            
            localStorage.setItem('ghosthunter_logged_in_user', rawUsername);
        }

        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        if (typeof updateHUD === 'function') updateHUD();
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

// Handle Google Sign-In authentication flow
window.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        const rawUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
        const doc = await docRef.get();

        if (!doc.exists) {
            ensureCommonStarter();

            const starterInstance = {
                ...(window.selectedStarter || {
                    name: "Vampire",
                    rarity: "common",
                    image: "brainrots/vampire.png",
                    baseHp: 60,
                    baseAtk: 15,
                    baseDef: 10
                }),
                level: 1,
                xp: 0,
                maxHp: 60,
                hp: 60
            };

            if (typeof setPlayerData === 'function') {
                setPlayerData({
                    username: rawUsername,
                    currency: 500,
                    accountLevel: 1,
                    accountXp: 0,
                    dex: [starterInstance.name],
                    inventory: [starterInstance],
                    gear: ["w_01"], // Inject starting weapon
                    equipped: { weapon: "w_01" }, // Auto-equip starting weapon
                    activeFighterIndex: 0,
                    revivePotions: 3,
                    luckyEggs: 0
                });
            }

            const cleanDataString = JSON.stringify(window._internalPlayerData || window.playerData, (key, value) => {
                if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
                return value;
            });
            await docRef.set(JSON.parse(cleanDataString));
        } else if (typeof setPlayerData === 'function') {
            setPlayerData(doc.data());
            
            // Protect and initialize arrays for older cloud saves
            if (window.playerData && !window.playerData.dex) window.playerData.dex = [];
            if (window.playerData && !window.playerData.inventory) window.playerData.inventory = [];
            if (window.playerData && !window.playerData.gear) window.playerData.gear = ["w_01"];
            if (window.playerData && !window.playerData.equipped) window.playerData.equipped = { weapon: "w_01" };
        }

        localStorage.setItem('ghosthunter_logged_in_user', rawUsername);
        
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        if (typeof updateHUD === 'function') updateHUD();

    } catch (err) {
        console.error("Google Auth Error:", err);
        if (typeof showGameToast === 'function') showGameToast("Error signing in with Google. Make sure popups aren't blocked!");
        else alert("Error signing in with Google. Make sure popups aren't blocked!");
    }
};

// Log out user and clear session storage
window.logoutAccount = async function() {
    localStorage.removeItem('ghosthunter_logged_in_user');
    localStorage.removeItem('ghosthunter_local_backup');
    
    if (window._internalPlayerData) {
        window._internalPlayerData.username = "";
    }
    
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
    } catch (e) {
        console.warn("Firebase signout error:", e);
    }
    
    window.location.href = window.location.pathname;
};

// ==========================================
// UNIVERSAL CLOUD SAVE SYSTEM
// ==========================================

window.saveGameData = async function() {
    // Pull from the safest internal player object to guarantee fresh arrays
    const targetData = window._internalPlayerData || window.playerData;
    if (typeof targetData === 'undefined' || !targetData.username) return;

    const cleanDataString = JSON.stringify(targetData, (key, value) => {
        if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
        return value;
    });
    
    const cleanData = JSON.parse(cleanDataString);
    localStorage.setItem('ghosthunter_local_backup', cleanDataString);

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            await firebase.firestore().collection('accounts').doc(targetData.username).set(cleanData);
            console.log("[CLOUD] Game saved to the database perfectly!");
        }
    } catch (error) {
        console.error("[ERROR] Failed to save to cloud:", error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const localBackup = localStorage.getItem('ghosthunter_local_backup');
    if (localBackup && typeof setPlayerData === 'function') {
        try {
            const parsedData = JSON.parse(localBackup);
            setPlayerData(parsedData);
            console.log("[LOCAL] Loaded offline game backup successfully!");
        } catch (e) {
            console.error("[ERROR] Failed to load local backup", e);
        }
    }
});