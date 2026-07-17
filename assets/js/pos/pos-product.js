/*
==========================================================
PAPPRITO ERP
Module : Point of Sale (POS)
File   : assets/js/pos/pos-product.js
Description : Load Products from Firebase
==========================================================
*/

// ==========================================================
// LOAD ALL PRODUCTS
// ==========================================================

function loadPOSProducts() {

    const productGrid = document.getElementById("productGrid");

    productGrid.innerHTML = "";

    // ==========================================================
    // GET ACTIVE PRODUCTS FROM FIREBASE
    // ==========================================================

    firebase.database()
        .ref("products")
        .orderByChild("status")
        .equalTo("Active")
        .on("value", function(snapshot){

            productGrid.innerHTML = "";

            // Products will be rendered in STEP 15

        });

}
