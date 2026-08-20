// ==========================================
// PAPPRITO ERP
// FIREBASE CONFIG
// File: firebase-config.js
// ==========================================

"use strict";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAV9T5w_1azmPHIJczPZraXP06TItj7HEuA",

    authDomain:
        "papprito-orders.firebaseapp.com",

    databaseURL:
        "https://papprito-orders-default-rtdb.firebaseio.com",

    projectId:
        "papprito-orders",

    storageBucket:
        "papprito-orders.firebasestorage.app",

    messagingSenderId:
        "831941801424",

    appId:
        "1:831941801424:web:40a99cdfb312dac2d275d5"

};


// ==========================================
// INITIALIZE FIREBASE ONCE
// ==========================================

if (
    typeof firebase === "undefined"
) {

    console.error(
        "❌ Firebase SDK is not loaded."
    );

}

else {

    try {

        if (
            !firebase.apps.length
        ) {

            firebase.initializeApp(
                firebaseConfig
            );

            console.log(
                "✅ Firebase App Initialized"
            );

        }

        else {

            console.log(
                "✅ Firebase App Already Initialized"
            );

        }


        // ==================================
        // REALTIME DATABASE
        // ==================================

        window.db =
            firebase.database();


        // ==================================
        // GLOBAL FIREBASE REFERENCES
        // ==================================

        window.firebaseApp =
            firebase.app();


        window.firebaseConfig =
            firebaseConfig;


        console.log(
            "✅ PAPPRITO ERP Firebase Connected"
        );


        console.log(
            "✅ Realtime Database Ready"
        );


        console.log(
            "Database:",
            window.db
        );

    }

    catch (error) {

        console.error(
            "❌ Firebase Initialization Error:",
            error
        );

    }

}
