/* ==========================================================
   PAPPRITO ERP
   POS v2
   File : assets/js/pos/pos-init.js
   Description : POS Initialization
========================================================== */

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadCategories();

    loadProducts();

    // Search
    document
        .getElementById("searchProduct")
        .addEventListener("input", () => {

            filterProducts();

        });

    // Back Button
    document
        .getElementById("btnBack")
        .addEventListener("click", () => {

            window.location.href = "../index.html";

        });

});
