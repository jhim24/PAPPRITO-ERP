/* ==========================================================
   PAPPRITO ERP
   Enterprise POS v2
   File : assets/js/pos/pos-init.js
========================================================== */

let allProducts = [];
let allCategories = [];
let cart = [];
let selectedCategory = "ALL";

/* ==========================================================
   INITIALIZE POS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Load Data
    loadCategories();
    loadProducts();

    // Search
    const search = document.getElementById("searchProduct");

    if (search) {

        search.addEventListener("input", filterProducts);

    }

    // Back Button
    const backBtn = document.getElementById("btnBack");

    if (backBtn) {

        backBtn.addEventListener("click", () => {

            window.location.href = "../index.html";

        });

    }

});

/* ==========================================================
   FILTER PRODUCTS
========================================================== */

function filterProducts() {

    const keyword = document
        .getElementById("searchProduct")
        .value
        .toLowerCase();

    let filtered = allProducts;

    // Category Filter
    if (selectedCategory !== "ALL") {

        filtered = filtered.filter(product =>
            product.categoryName === selectedCategory
        );

    }

    // Search Filter
    if (keyword !== "") {

        filtered = filtered.filter(product =>
            (product.productName || "")
                .toLowerCase()
                .includes(keyword)
        );

    }

    renderProducts(filtered);

}
