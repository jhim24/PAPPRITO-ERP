/* ==========================================================
   PAPPRITO ERP
   POS v2
   File : assets/js/pos/pos-category.js
   Description : Category Module
========================================================== */

let currentCategory = "ALL";

/* ==========================================================
   LOAD CATEGORIES
========================================================== */

function loadCategories() {

    const categoryList =
        document.getElementById("categoryList");

    if (!categoryList) return;

    categoryList.innerHTML = "";

    // ==========================================
    // ALL BUTTON
    // ==========================================

    createCategoryButton("ALL", true);

    db.ref("categories")

        .orderByChild("status")

        .equalTo("Active")

        .once("value")

        .then(snapshot => {

            snapshot.forEach(child => {

                const category = child.val();

                // Change this if your category field has another name
                const categoryName =
                    category.categoryName ||
                    category.name ||
                    category.title;

                if (!categoryName) return;

                createCategoryButton(categoryName);

            });

        })

        .catch(error => {

            console.error("Category Error:", error);

        });

}

/* ==========================================================
   CREATE CATEGORY BUTTON
========================================================== */

function createCategoryButton(name, active = false) {

    const categoryList =
        document.getElementById("categoryList");

    const button =
        document.createElement("button");

    button.className = "category-btn";

    if (active) {

        button.classList.add("active");

    }

    button.innerHTML = name;

    button.onclick = function () {

        document

            .querySelectorAll(".category-btn")

            .forEach(btn => {

                btn.classList.remove("active");

            });

        this.classList.add("active");

        currentCategory = name;

        filterProducts();

    };

    categoryList.appendChild(button);

}
