/*
==========================================================
PAPPRITO ERP
Module : Point of Sale (POS)
File   : assets/js/pos/pos-product.js
Description : Load & Render Products
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

            snapshot.forEach(function(child){

                const product = child.val();

                // ==========================================================
                // SHOW ONLY PRODUCTS ENABLED FOR POS
                // ==========================================================

                if(product.showPOS === false){
                    return;
                }

                // ==========================================================
                // PRODUCT IMAGE
                // ==========================================================

                const image = product.image && product.image !== ""
                    ? product.image
                    : "../assets/images/no-image.png";

                // ==========================================================
                // PRODUCT CARD
                // ==========================================================

                productGrid.innerHTML += `

                    <div class="product-card">

                        <img
                            src="${image}"
                            class="product-image"
                            alt="${product.productName}">

                        <div class="product-info">

                            <h3>${product.productName}</h3>

                            <small>${product.categoryName}</small>

                            <h2>₱${Number(product.sellingPrice || 0).toFixed(2)}</h2>

                            <button
                                class="add-cart-btn"
                                data-id="${child.key}">

                                Add to Cart

                            </button>

                        </div>

                    </div>

                `;

            });

        });

}
