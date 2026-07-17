/* ==========================================================
   PAPPRITO ERP
   Enterprise POS v2
   File : assets/js/pos/pos-product.js
   Description : Load Products from Firebase
========================================================== */

/* ==========================================================
   LOAD PRODUCTS
========================================================== */

function loadProducts() {

    db.ref("products")
        .orderByChild("status")
        .equalTo("Active")
        .on("value", snapshot => {

            allProducts = [];

            snapshot.forEach(child => {

                const product = child.val();

                product.id = child.key;

                // Only products available in POS
                if (product.showPOS === true) {

                    allProducts.push(product);

                }

            });

            filterProducts();

        }, error => {

            console.error("Product Error:", error);

        });

}

/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderProducts(products) {

    const grid = document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = "";

    if (products.length === 0) {

        grid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#777;
                font-size:18px;
            ">
                No products found.
            </div>
        `;

        return;

    }

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        const image =
            product.image ||
            "../assets/img/no-image.png";

        const price =
            Number(product.sellingPrice || 0);

        card.innerHTML = `

            <img src="${image}"
                 alt="${product.productName}">

            <div class="product-info">

                <div class="product-name">

                    ${product.productName}

                </div>

                <div class="product-price">

                    ₱${price.toLocaleString(undefined,{
                        minimumFractionDigits:2
                    })}

                </div>

            </div>

        `;

        card.onclick = function () {

            addToCart(product);

        };

        grid.appendChild(card);

    });

}
