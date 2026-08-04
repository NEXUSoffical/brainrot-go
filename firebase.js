// firebase.js - Firebase Initialization and Authentication Handling

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
        if (titleEl) titleEl.innerText = "🔐 CREATE ACCOUNT";
        if (toggleText) toggleText.innerText = "Already have an account? Click here to Log In";
        if (starterSec) starterSec.style.display = 'block';
        if (typeof renderStarterSelection === 'function') renderStarterSelection();
    } else {
        if (titleEl) titleEl.innerText = "🔐 BRAINROT GO ACCOUNT";
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
        alert("❌ Please enter both username and password!");
        return;
    }

    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@brainrotgo.com`;

    if (isSignUpMode) {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                if (window.playerData) {
                    window.playerData.username = username;
                }
                if (typeof saveGameData === 'function') saveGameData();
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none';
            })
            .catch((error) => {
                alert("❌ Sign Up Error: " + error.message);
            });
    } else {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none';
            })
            .catch((error) => {
                alert("❌ Login Error: " + error.message);
            });
    }
};

window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'none';
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                auth.signInWithRedirect(provider).catch((redirectError) => {
                    alert("❌ Google Sign-In Redirect Error: " + redirectError.message);
                });
            } else {
                alert("❌ Google Sign-In Error: " + error.message);
            }
        });
};

window.logoutAccount = function() {
    auth.signOut().then(() => {
        location.reload();
    });
};