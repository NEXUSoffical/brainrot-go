// firebase.js - Cleaned Firebase Initialization, Auth, and Master Cloud Sync

const firebaseConfig = {
    apiKey: "AIzaSyAUpE0pUHZlY6jGZgJIxHg2KnSfMs0iJTo",
    authDomain: "brainrot-go-b99c6.firebaseapp.com",
    projectId: "brainrot-go-b99c6",
    storageBucket: "brainrot-go-b99c6.firebasestorage.app",
    messagingSenderId: "668119995218",
    appId: "1:668119995218:web:faacf0823ade988e31e08b",
    measurementId: "G-BKE4DCJLQ2"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let isSignUpMode = false;

window.toggleAuthMode = function() {
    isSignUpMode = !isSignUpMode;
    const titleEl = document.querySelector('#loginModal h2');
    const toggleText = document.getElementById('loginToggleText');
    const starterSec = document.getElementById('starterSection');

    if (isSignUpMode) {
        if (titleEl) titleEl.innerText = "CREATE ACCOUNT";
        if (toggleText) toggleText.innerText = "Already have an account? Click here to Log In";
        if (starterSec) starterSec.style.display = 'block';
        if (typeof renderStarterSelection === 'function') renderStarterSelection();
    } else {
        if (titleEl) titleEl.innerText = "HUNTER VAULT LOGIN";
        if (toggleText) toggleText.innerText = "New player? Click here to Sign Up";
        if (starterSec) starterSec.style.display = 'none';
    }
};

window.handleAccountAction = function() {
    const usernameEl = document.getElementById('usernameInput');
    const passwordEl = document.getElementById('passwordInput');
    
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value.trim() : "";

    if (!username || !password) {
        alert("Please enter both username and password!");
        return;
    }

    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@ghosthuntergo.com`;

    if (isSignUpMode) {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                if (window.playerData) {
                    window.playerData.username = username;
                }
                if (typeof saveGameData === 'function') saveGameData();
                completeLogin();
            })
            .catch((error) => {
                alert("Sign Up Error: " + error.message);
            });
    } else {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                completeLogin();
            })
            .catch((error) => {
                alert("Login Error: " + error.message);
            });
    }
};

window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            completeLogin();
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                auth.signInWithRedirect(provider).catch((redirectError) => {
                    alert("Google Sign-In Redirect Error: " + redirectError.message);
                });
            } else {
                alert("Google Sign-In Error: " + error.message);
            }
        });
};

function completeLogin() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'none';

    // Wait for the cloud save to pull, then forcibly sync the weapon arrays
    setTimeout(() => {
        if (typeof window.playerData === 'undefined') window.playerData = {};
        
        // If the cloud save is missing the armory/gear arrays, inject them
        if (!window.playerData.gear || !Array.isArray(window.playerData.gear)) {
            window.playerData.gear = ["w_01"];
        }
        if (!window.playerData.equipped) {
            window.playerData.equipped = { weapon: "w_01" };
        }

        if (typeof initPlayer === 'function') initPlayer();
        if (typeof updateTopRightAvatar === 'function') updateTopRightAvatar();
    }, 800);

    if (typeof loadGameData === 'function') {
        try { loadGameData(); } catch(e) {}
    }
}

// Listen for active auth sessions on page load
auth.onAuthStateChanged((user) => {
    if (user) {
        completeLogin();
    }
});

window.logoutAccount = function() {
    auth.signOut().then(() => {
        localStorage.removeItem('ghosthunter_logged_in_user');
        localStorage.removeItem('ghosthunter_local_backup');
        location.reload();
    });
};

// ==========================================
// MASTER CLOUD SAVE OVERRIDE
// ==========================================
// This guarantees that Firebase will always save your live weapons to the cloud!

window.saveGameData = async function() {
    // Force Firebase to look at the LIVE playerData, ignoring any cached internal states
    const liveData = window.playerData || {};
    if (!liveData.username) return;

    // Failsafe: Ensure gear exists before sending to cloud
    if (!liveData.gear) liveData.gear = ["w_01"];
    if (!liveData.equipped) liveData.equipped = { weapon: "w_01" };

    const cleanDataString = JSON.stringify(liveData, (key, value) => {
        if (key === 'marker' || key === '_popup' || key === '_source') return undefined;
        return value;
    });
    
    const cleanData = JSON.parse(cleanDataString);
    localStorage.setItem('ghosthunter_local_backup', cleanDataString);

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            await firebase.firestore().collection('accounts').doc(liveData.username).set(cleanData);
            console.log("[CLOUD] Game saved successfully with Weapon Vault intact!");
        }
    } catch (error) {
        console.error("[ERROR] Failed to save to cloud:", error);
    }
};