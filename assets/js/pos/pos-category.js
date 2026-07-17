/*
==========================================================
PAPPRITO ERP
Module : Point of Sale (POS)
File   : assets/js/pos/pos-category.js
Description : Load Categories from Firebase
==========================================================
*/

// ==========================================================
// LOAD CATEGORY LIST
// ==========================================================

function loadPOSCategories() {

    const categoryList = document.getElementById("categoryList");

    categoryList.innerHTML = "";

   // ==========================================================
// GET ACTIVE CATEGORIES FROM FIREBASE
// ==========================================================

firebase.database()
    .ref("categories")
    .orderByChild("status")
    .equalTo("Active")
    .on("value", function (snapshot) {

        categoryList.innerHTML = "";

        // Category buttons will be rendered in the next step.

    });
