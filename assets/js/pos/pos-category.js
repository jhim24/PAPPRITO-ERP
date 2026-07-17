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
        .on("value", function(snapshot) {

            categoryList.innerHTML = "";

            // ==========================================================
            // ALL CATEGORY BUTTON
            // ==========================================================

            categoryList.innerHTML += `
                <button
                    class="category-btn active"
                    data-category="all">

                    🍽 All Products

                </button>
            `;

            // ==========================================================
            // RENDER FIREBASE CATEGORIES
            // ==========================================================

            snapshot.forEach(function(child){

                const category = child.val();

                categoryList.innerHTML += `
                    <button
                        class="category-btn"
                        data-category="${category.categoryName}">

                        ${category.categoryName}

                    </button>
                `;

            });

        });

}
