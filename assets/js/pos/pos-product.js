/* ==========================================================
   PAPPRITO ERP
   POS v2
   File : assets/js/pos/pos-product.js
   Description : Product Module
========================================================== */

let allProducts = [];

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

                allProducts.push(product);

            });

            filterProducts();

        });

}

/* ==========================================================
   FILTER PRODUCTS
========================================================== */

function filterProducts() {

    const keyword =

        document
        .getElementById("searchProduct")
        .value
        .toLowerCase();

    let products = [...allProducts];

    // ==========================================
    // CATEGORY FILTER
    // ==========================================

    if (currentCategory !== "ALL") {

        products = products.filter(product =>

            product.categoryName === currentCategory

        );

    }

    // ==========================================
    // SEARCH FILTER
    // ==========================================

    if (keyword !== "") {

        products = products.filter(product =>

            (product.name || "")
            .toLowerCase()
            .includes(keyword)

        );

    }

    renderProducts(products);

}

/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderProducts(products) {

    const grid =
        document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = "";

    if (products.length === 0) {

        grid.innerHTML = `

            <div style="
                width:100%;
                text-align:center;
                padding:50px;
                color:#777;
                font-size:18px;
            ">

                No Products Found

            </div>

        `;

        return;

    }

    products.forEach(product => {

        const image =

            product.image && product.image !== ""

            ? product.image

            : "../assets/img/no-image.png";

        const card =
            document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <img src="${image}" alt="${product.name}">

            <div class="product-info">

                <div class="product-name">

                    ${product.name}

                </div>

                <div class="product-price">

                    ₱${Number(product.sellingPrice || 0).toFixed(2)}

                </div>

            </div>

        `;

        card.onclick = function () {

            addToCart(product);

        };

        grid.appendChild(card);

    });

}
