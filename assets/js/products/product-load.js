// ==========================================
// PAPPRITO ERP
// PRODUCT LOAD ENGINE V3
// File : assets/js/products/product-load.js
// Description : Integrated Product Loading,
// Category Loading, Firebase Listener,
// Product Table & Counters
// ==========================================

"use strict";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let productList = [];

let productListener = null;

let productPageInitialized = false;


// ==========================================
// INITIALIZE PRODUCT PAGE
// ==========================================

function initializeProductPage() {

    // Prevent duplicate initialization

    if (productPageInitialized) {

        console.log(
            "Product page already initialized."
        );

        return;

    }

    productPageInitialized = true;


    // ==========================================
    // PRODUCT CODE
    // ==========================================

    if (
        typeof generateProductCode ===
        "function"
    ) {

        generateProductCode();

    }


    // ==========================================
    // LOAD CATEGORIES
    // ==========================================

    loadProductCategories();


    // ==========================================
    // PRODUCT SEARCH
    // ==========================================

    if (
        typeof initializeProductSearch ===
        "function"
    ) {

        initializeProductSearch();

    }


    // ==========================================
    // PRODUCT SAVE
    // ==========================================

    if (
        typeof initializeProductSave ===
        "function"
    ) {

        initializeProductSave();

    }


    // ==========================================
    // START FIREBASE LISTENER
    // ==========================================

    startProductListener();

}


// ==========================================
// FIREBASE PRODUCT LISTENER
// ==========================================

function startProductListener() {

    // ==========================================
    // REMOVE OLD LISTENER
    // ==========================================

    if (productListener) {

        productListener.off();

        productListener = null;

    }


    // ==========================================
    // CREATE NEW LISTENER
    // ==========================================

    productListener =
        db.ref("products");


    productListener.on(
        "value",
        (snapshot) => {


            // ======================================
            // RESET PRODUCT LIST
            // ======================================

            productList = [];


            // ======================================
            // READ PRODUCTS
            // ======================================

            snapshot.forEach((child) => {

                const product =
                    child.val() || {};


                product.productId =
                    child.key;


                productList.push(product);

            });


            // ======================================
            // RENDER TABLE
            // ======================================

            renderProductTable();


            // ======================================
            // UPDATE COUNTERS
            // ======================================

            updateProductCounter();


        },
        (error) => {

            console.error(
                "Product Listener Error:",
                error
            );

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeProductHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// RENDER PRODUCT TABLE
// ==========================================

function renderProductTable() {

    const table =
        document.getElementById(
            "productTable"
        );


    if (!table) {

        return;

    }


    // ==========================================
    // CLEAR TABLE
    // ==========================================

    table.innerHTML = "";


    // ==========================================
    // NO PRODUCTS
    // ==========================================

    if (productList.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5"
                >

                    <i
                        class="fa-solid fa-box-open fa-3x text-secondary mb-3"
                    ></i>

                    <br>

                    <strong>
                        No Products Found
                    </strong>

                </td>

            </tr>

        `;

        return;

    }


    // ==========================================
    // RENDER PRODUCTS
    // ==========================================

    productList.forEach((product) => {


        // ======================================
        // IMAGE
        // ======================================

        const image =
            product.image &&
            String(product.image).trim() !== ""

                ? product.image

                : "../assets/img/no-product.png";


        // ======================================
        // STATUS
        // ======================================

        const isActive =
            String(product.status || "")
                .toLowerCase() === "active";


        const badge =
            isActive

                ? `
                    <span class="badge bg-success">
                        Active
                    </span>
                  `

                : `
                    <span class="badge bg-secondary">
                        Inactive
                    </span>
                  `;


        // ======================================
        // PRODUCT DATA
        // ======================================

        const code =
            escapeProductHTML(
                product.code || ""
            );


        const name =
            escapeProductHTML(
                product.name || ""
            );


        const categoryName =
            escapeProductHTML(
                product.categoryName || ""
            );


        const price =
            Number(
                product.sellingPrice || 0
            ).toFixed(2);


        const stock =
            Number(
                product.currentStock || 0
            );


        // ======================================
        // TABLE ROW
        // ======================================

        table.innerHTML += `

            <tr>

                <!-- PRODUCT CODE -->

                <td>

                    ${code}

                </td>


                <!-- IMAGE -->

                <td>

                    <img

                        src="${escapeProductHTML(image)}"

                        alt="${name}"

                        loading="lazy"

                        style="
                            width:60px;
                            height:60px;
                            object-fit:cover;
                            border-radius:10px;
                        "

                        onerror="
                            this.onerror=null;
                            this.src='../assets/img/no-product.png';
                        "

                    >

                </td>


                <!-- PRODUCT NAME -->

                <td>

                    <strong>

                        ${name}

                    </strong>

                </td>


                <!-- CATEGORY -->

                <td>

                    ${categoryName}

                </td>


                <!-- SELLING PRICE -->

                <td>

                    ₱${price}

                </td>


                <!-- CURRENT STOCK -->

                <td>

                    ${stock}

                </td>


                <!-- STATUS -->

                <td>

                    ${badge}

                </td>


                <!-- ACTIONS -->

                <td>

                    <button

                        type="button"

                        class="btn btn-warning btn-sm me-1"

                        onclick="
                            editProduct('${product.productId}')
                        "

                        title="Edit Product"

                    >

                        <i
                            class="fa-solid fa-pen"
                        ></i>

                    </button>


                    <button

                        type="button"

                        class="btn btn-danger btn-sm"

                        onclick="
                            deleteProduct('${product.productId}')
                        "

                        title="Delete Product"

                    >

                        <i
                            class="fa-solid fa-trash"
                        ></i>

                    </button>

                </td>

            </tr>

        `;

    });

}


// ==========================================
// UPDATE PRODUCT COUNTERS
// ==========================================

function updateProductCounter() {

    const total =
        document.getElementById(
            "totalProducts"
        );


    const footer =
        document.getElementById(
            "footerTotalProducts"
        );


    if (total) {

        total.textContent =
            productList.length;

    }


    if (footer) {

        footer.textContent =
            productList.length;

    }

}


// ==========================================
// LOAD PRODUCT CATEGORIES
// ==========================================

function loadProductCategories() {

    const productCategory =
        document.getElementById(
            "productCategory"
        );


    const filterCategory =
        document.getElementById(
            "filterCategory"
        );


    // ==========================================
    // NO CATEGORY ELEMENTS
    // ==========================================

    if (
        !productCategory &&
        !filterCategory
    ) {

        return;

    }


    // ==========================================
    // LOAD FROM FIREBASE
    // ==========================================

    db.ref("categories")
        .orderByChild("name")
        .once("value")

        .then((snapshot) => {


            // ======================================
            // PRODUCT FORM DROPDOWN
            // ======================================

            if (productCategory) {

                productCategory.innerHTML = `

                    <option value="">

                        Select Category

                    </option>

                `;

            }


            // ======================================
            // ALL CATEGORIES FILTER
            // ======================================

            if (filterCategory) {

                filterCategory.innerHTML = `

                    <option value="">

                        All Categories

                    </option>

                `;

            }


            // ======================================
            // LOOP CATEGORIES
            // ======================================

            snapshot.forEach((child) => {

                const category =
                    child.val() || {};


                const categoryId =
                    child.key;


                const categoryName =
                    category.name || "";


                // ==================================
                // PRODUCT FORM
                // ==================================

                if (productCategory) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        categoryId;


                    option.textContent =
                        categoryName;


                    productCategory.appendChild(
                        option
                    );

                }


                // ==================================
                // FILTER
                // ==================================

                if (filterCategory) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        categoryId;


                    option.textContent =
                        categoryName;


                    filterCategory.appendChild(
                        option
                    );

                }

            });

        })

        .catch((error) => {

            console.error(
                "Load Product Categories Error:",
                error
            );

        });

}


// ==========================================
// REFRESH PRODUCT CATEGORIES
// ==========================================

function refreshProductCategories() {

    loadProductCategories();

}


// ==========================================
// CLEANUP PRODUCT LISTENER
// ==========================================

function stopProductListener() {

    if (!productListener) {

        return;

    }


    productListener.off();

    productListener = null;

}


// ==========================================
// RESET PRODUCT PAGE INITIALIZATION
// ==========================================

function resetProductPage() {

    stopProductListener();

    productList = [];

    productPageInitialized = false;

}
