/* ==========================================================
   PAPPRITO ERP
   Enterprise POS v2
   File : assets/js/pos/pos-category.js
   Description : Load Categories from Firebase
========================================================== */

/* ==========================================================
   LOAD CATEGORIES
========================================================== */

function loadCategories() {

    db.ref("categories")
        .orderByChild("status")
        .equalTo("Active")
        .once("value")

        .then(snapshot => {

            allCategories = [];

            snapshot.forEach(child => {

                const category = child.val();

                allCategories.push(category);

            });

            renderCategories();

        })

        .catch(error => {

            console.error("Category Error:", error);

        });

}

/* ==========================================================
   RENDER CATEGORY BUTTONS
========================================================== */

function renderCategories() {

    const container =
        document.getElementById("categoryList");

    if (!container) return;

    container.innerHTML = "";

    // ==========================================
    // ALL PRODUCTS
    // ==========================================

    const allButton =
        document.createElement("button");

    allButton.className =
        "category-btn active";

    allButton.innerHTML =
        "All Products";

    allButton.onclick = function () {

        selectedCategory = "ALL";

        activateCategory(this);

        filterProducts();

    };

    container.appendChild(allButton);

    // ==========================================
    // FIREBASE CATEGORIES
    // ==========================================

    allCategories.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "category-btn";

        button.innerHTML =
            category.categoryName;

        button.onclick = function () {

            selectedCategory =
                category.categoryName;

            activateCategory(this);

            filterProducts();

        };

        container.appendChild(button);

    });

}

/* ==========================================================
   ACTIVE CATEGORY
========================================================== */

function activateCategory(button) {

    document
        .querySelectorAll(".category-btn")
        .forEach(item => {

            item.classList.remove("active");

        });

    button.classList.add("active");

}
