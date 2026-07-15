// ==========================================
// PAPPRITO ERP
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyAV9T5w_1azmPHIJcZpraXP06TItj7HEuA",

    authDomain: "papprito-orders.firebaseapp.com",

    databaseURL: "https://papprito-orders-default-rtdb.firebaseio.com",

    projectId: "papprito-orders",

    storageBucket: "papprito-orders.firebasestorage.app",

    messagingSenderId: "831941801424",

    appId: "1:831941801424:web:40a99cdfb312dac2d275d5"

};

// Initialize once only

if(!firebase.apps.length){

    firebase.initializeApp(firebaseConfig);

}

// Global Database

const db = firebase.database();

console.log("✅ PAPPRITO ERP Firebase Connected");
