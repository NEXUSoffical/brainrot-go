// account.js - Core Account Management & Authentication Logic

if (typeof window.isSignUpMode === 'undefined') {
    window.isSignUpMode = false;
}
if (typeof window.selectedStarter === 'undefined') {
    window.selectedStarter = null;
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
        if (toggleText) toggleText.innerText = "New player? Click here to Sign Up";
    }
};

// Handle manual username/password login or registration action
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

            if (typeof setPlayerData === 'function') {
                setPlayerData({
                    username: rawUsername,
                    rotBalance: 500,
                    accountLevel: 1,
                    accountXp: 0,
                    dex: [window.selectedStarter.name],
                    inventory: [starterInstance],
                    activeFighterIndex: 0,
                    revivePotions: 3,
                    luckyEggs: 0
                });
            }

            if (typeof window.saveGameData === 'function') {
                await window.saveGameData();
            }
            alert(`Account created successfully! Welcome, ${rawUsername}!`);
        } else {
            await firebase.auth().signInWithEmailAndPassword(email, password);

            const docRef = firebase.firestore().collection('accounts').doc(rawUsername);
            const doc = await docRef.get();

            if (doc.exists && typeof setPlayerData === 'function') {
                setPlayerData(doc.data());
                if (window.playerData && !window.playerData.dex) window.playerData.dex = [];
                if (window.playerData && !window.playerData.inventory) window.playerData.inventory = [];
            }
            
            localStorage.setItem('brainrot_logged_in_user', rawUsername);
        }

        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        if (typeof updateHUD === 'function') updateHUD();
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

            if (typeof setPlayerData === 'function') {
                setPlayerData({
                    username: rawUsername,
                    rotBalance: 500,
                    accountLevel: 1,
                    accountXp: 0,
                    dex: [window.selectedStarter.name],
                    inventory: [starterInstance],
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
            if (window.playerData && !window.playerData.dex) window.playerData.dex = [];
            if (window.playerData && !window.playerData.inventory) window.playerData.inventory = [];
        }

        localStorage.setItem('brainrot_logged_in_user', rawUsername);
        
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        if (typeof updateHUD === 'function') updateHUD();

    } catch (err) {
        console.error("Google Auth Error:", err);
        alert("Error signing in with Google. Make sure popups aren't blocked!");
    }
};

// Log out user and clear session storage
window.logoutAccount = async function() {
    localStorage.removeItem('brainrot_logged_in_user');
    localStorage.removeItem('brainrot_local_backup');
    
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

// Global Save Function: Uploads to the Cloud (Firebase) AND saves a local backup!
window.saveGameData = async function() {
    // If there is no player logged in, stop right here
    if (typeof playerData === 'undefined' || !playerData.username) return;

    // 1. Clean the data! 
    // (Firebase hates it when we try to save live map markers, so we strip them out)
    const cleanDataString = JSON.stringify(playerData, (key, value) => {
        if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
        return value;
    });
    
    const cleanData = JSON.parse(cleanDataString);

    // 2. Save a quick backup to the device's local memory just in case
    localStorage.setItem('brainrot_local_backup', cleanDataString);

    // 3. ☁️ UPLOAD TO THE CLOUD! ☁️
    // This tells Firebase to update your master save file on the internet
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            await firebase.firestore().collection('accounts').doc(playerData.username).set(cleanData);
            console.log("☁️ Game saved to the Cloud perfectly!");
        }
    } catch (error) {
        console.error("❌ Failed to save to cloud:", error);
    }
};

// Auto-load local backup data when the page loads so progress persists on refresh
document.addEventListener('DOMContentLoaded', () => {
    const localBackup = localStorage.getItem('brainrot_local_backup');
    if (localBackup && typeof setPlayerData === 'function') {
        try {
            const parsedData = JSON.parse(localBackup);
            setPlayerData(parsedData);
            console.log("⚡ Loaded local game backup successfully!");
        } catch (e) {
            console.error("Failed to load local backup", e);
        }
    }
});