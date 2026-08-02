// firebase.js - Cloud Database & Auth Vault Connection

const firebaseConfig = {
    apiKey: "AIzaSyAUpE0pUHZlY6jGZgJIxHg2KnSfMs0iJTo",
    authDomain: "brainrot-go-b99c6.firebaseapp.com",
    projectId: "brainrot-go-b99c6",
    storageBucket: "brainrot-go-b99c6.firebasestorage.app",
    messagingSenderId: "668119995218",
    appId: "1:668119995218:web:faacf0823ade988e31e08b",
    measurementId: "G-BKE4DCJLQ2"
};

// Initialize Firebase Compat
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore(); 
window.auth = firebase.auth();