// firebase.js - Cloud Database Connection

const firebaseConfig = {
    apiKey: "AIzaSyAUpE0pUHZLY6jGZgJiXHg2KnSfMs8iJTo",
    authDomain: "brainrot-go-b99c6.firebaseapp.com",
    projectId: "brainrot-go-b99c6",
    storageBucket: "brainrot-go-b99c6.appspot.com",
    messagingSenderId: "66811995218",
    appId: "1:66811995218:web:faacf0823ade988e31e08b",
    measurementId: "G-BKE4DCJLQ2"
};

// Initialize Firebase Compat
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore(); // Attached globally to prevent reference errors