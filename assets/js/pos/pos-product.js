/* ==========================================================
   PAPPRITO ERP
   POS v2
   File : assets/js/pos/pos-product.js
   Description : Product Module
========================================================== */

// Global products array
let allProducts = [];

/* ==========================================================
   LOAD PRODUCTS
========================================================== */

function loadProducts() {

    db.ref("products")
        .orderByChild("status")
        .equalTo("Active")
        .once("value")

        .then(snapshot => {

            allProducts = [];

            snapshot.forEach(child => {

                const product = child.val();

                product.id = child.key;

                allProducts.push(product);

            });

            filterProducts();

        })

        .catch(error => {

            console.error(error);

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

    if (typeof currentCategory !== "undefined" &&
        currentCategory !== "ALL") {

        products = products.filter(product =>
            product.categoryName === currentCategory
        );

    }

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

    products.forEach(product => {

       const image =
    product.image && product.image.trim() !== ""
        ? product.image
        : "../assets/img/no-image.png";

const stock = Number(product.stock || 0);

let stockClass = "stock-available";
let stockText = "Available";

if (stock <= 0) {

    stockClass = "stock-out";
    stockText = "Out of Stock";

} else if (stock <= 10) {

    stockClass = "stock-low";
    stockText = "Low Stock";

}

        grid.innerHTML += `

<div class="product-card"
     onclick="addToCart(allProducts.find(x=>x.id=='${product.id}'))">

    <div class="product-stock ${stockClass}">
        ${stockText}
    </div>

    <img src="${image}" alt="${product.name}">

    <div class="product-info">

        <div class="product-name">
            ${product.name}
        </div>

        <div class="product-category">
            ${product.categoryName || "-"}
        </div>

        <div class="product-price">
            ₱${Number(product.sellingPrice || 0).toFixed(2)}
        </div>

        <button
            class="btn-add"
            ${stock <= 0 ? "disabled" : ""}>

            <i class="fa-solid fa-cart-plus"></i>
            ${stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}

        </button>

    </div>

</div>

`;

    });

}
