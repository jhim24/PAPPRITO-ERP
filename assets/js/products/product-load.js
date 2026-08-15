// ==========================================================
// PAPPRITO ERP
// PRODUCT MASTER - LOAD ENGINE V2
// File : assets/js/products/product-load.js
//
// CATEGORY INTEGRATION:
//
// categories/
//      ↓
// Product Category Dropdown
//      ↓
// categoryId + categoryName
//      ↓
// products/
//
// IMPORTANT:
// Product Save Engine remains unchanged.
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL PRODUCT DATA
// ==========================================================

let productList = [];

let productListener = null;

let productCategories = [];


// ==========================================================
// INITIALIZE PRODUCT PAGE
// ==========================================================

function initializeProductPage() {

    console.log(
        "PAPPRITO PRODUCT MASTER V2 INITIALIZING..."
    );


    // ------------------------------------------------------
    // PRODUCT CODE
    // ------------------------------------------------------

    if (
        typeof generateProductCode ===
        "function"
    ) {

        generateProductCode();

    }


    // ------------------------------------------------------
    // LOAD CATEGORIES
    // ------------------------------------------------------

    loadProductCategories();


    // ------------------------------------------------------
    // SEARCH
    // ------------------------------------------------------

    if (
        typeof initializeProductSearch ===
        "function"
    ) {

        initializeProductSearch();

    }


    // ------------------------------------------------------
    // SAVE / UPDATE
    // ------------------------------------------------------

    if (
        typeof initializeProductSave ===
        "function"
    ) {

        initializeProductSave();

    }


    // ------------------------------------------------------
    // IMAGE
    // ------------------------------------------------------

    if (
        typeof initializeProductImage ===
        "function"
    ) {

        initializeProductImage();

    }


    // ------------------------------------------------------
    // FIREBASE PRODUCT LISTENER
    // ------------------------------------------------------

    startProductListener();

}


// ==========================================================
// FIREBASE PRODUCT LISTENER
// ==========================================================

function startProductListener() {

    if (
        typeof db === "undefined" ||
        !db
    ) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    // ------------------------------------------------------
    // REMOVE PREVIOUS LISTENER
    // ------------------------------------------------------

    if (productListener) {

        try {

            productListener.off();

        }

        catch (error) {

            console.warn(
                "Unable to remove previous product listener:",
                error
            );

        }

    }


    // ------------------------------------------------------
    // CREATE LISTENER
    // ------------------------------------------------------

    productListener =
        db.ref("products");


    // ------------------------------------------------------
    // LISTEN
    // ------------------------------------------------------

    productListener.on(

        "value",

        function (snapshot) {

            productList = [];


            snapshot.forEach(

                function (child) {

                    const product =
                        child.val() || {};


                    product.productId =
                        child.key;


                    productList.push(
                        product
                    );

                }

            );


            console.log(
                "Products loaded:",
                productList.length
            );


            // ------------------------------------------------
            // RENDER
            // ------------------------------------------------

            renderProductTable();


            // ------------------------------------------------
            // COUNTER
            // ------------------------------------------------

            updateProductCounter();


            // ------------------------------------------------
            // REFRESH CATEGORY FILTER
            // ------------------------------------------------

            refreshProductFilters();

        },

        function (error) {

            console.error(
                "Product Firebase Listener Error:",
                error
            );

        }

    );

}


// ==========================================================
// RENDER PRODUCT TABLE
// ==========================================================

function renderProductTable() {

    const table =
        document.getElementById(
            "productTable"
        );


    if (!table) {

        console.warn(
            "#productTable not found."
        );

        return;

    }


    // ------------------------------------------------------
    // CLEAR
    // ------------------------------------------------------

    table.innerHTML = "";


    // ------------------------------------------------------
    // FILTER
    // ------------------------------------------------------

    const products =
        getFilteredProducts();


    // ------------------------------------------------------
    // EMPTY
    // ------------------------------------------------------

    if (
        products.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5">

                    <div>

                        <i
                            class="fa-solid fa-box-open fa-3x text-secondary mb-3">
                        </i>

                    </div>

                    <strong>
                        No Products Found
                    </strong>

                    <br>

                    <small class="text-muted">
                        Click "Add Product" to create
                        your first product.
                    </small>

                </td>

            </tr>

        `;

        return;

    }


    // ------------------------------------------------------
    // PRODUCTS
    // ------------------------------------------------------

    products.forEach(

        function (product) {


            // ----------------------------------------------
            // IMAGE
            // ----------------------------------------------

            const image =

                product.image &&
                String(
                    product.image
                ).trim() !== ""

                    ? product.image

                    : "assets/img/logo.png";


            // ----------------------------------------------
            // STATUS
            // ----------------------------------------------

            const status =
                product.status ||
                "Inactive";


            const statusBadge =

                status === "Active"

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


            // ----------------------------------------------
            // STOCK
            // ----------------------------------------------

            const stock =
                Number(
                    product.currentStock || 0
                );


            // ----------------------------------------------
            // STOCK CLASS
            // ----------------------------------------------

            const reorderLevel =
                Number(
                    product.reorderLevel || 0
                );


            let stockClass =
                "product-stock";


            if (
                stock <= reorderLevel
            ) {

                stockClass +=
                    " stock-low";

            }

            else {

                stockClass +=
                    " stock-good";

            }


            // ----------------------------------------------
            // CATEGORY
            // ----------------------------------------------

            const categoryName =
                product.categoryName ||
                getCategoryNameById(
                    product.categoryId
                ) ||
                "Uncategorized";


            // ----------------------------------------------
            // TABLE
            // ----------------------------------------------

            table.innerHTML += `

                <tr>


                    <!-- CODE -->

                    <td>

                        <strong>

                            ${escapeProductHTML(
                                product.code || ""
                            )}

                        </strong>

                    </td>


                    <!-- IMAGE -->

                    <td>

                        <img

                            class="product-table-image"

                            src="${escapeProductAttribute(
                                image
                            )}"

                            alt="${escapeProductAttribute(
                                product.name ||
                                "Product"
                            )}"

                            onerror="
                                this.onerror=null;
                                this.src='assets/img/logo.png';
                            "

                        >

                    </td>


                    <!-- PRODUCT -->

                    <td>

                        <div class="product-name">

                            ${escapeProductHTML(
                                product.name || ""
                            )}

                        </div>


                        ${
                            product.description
                                ? `
                                    <small class="text-muted">

                                        ${escapeProductHTML(
                                            product.description
                                        )}

                                    </small>
                                `
                                : ""
                        }

                    </td>


                    <!-- CATEGORY -->

                    <td>

                        <span class="product-category">

                            <i class="fa-solid fa-tag"></i>

                            ${escapeProductHTML(
                                categoryName
                            )}

                        </span>

                    </td>


                    <!-- PRICE -->

                    <td>

                        <span class="product-price">

                            ₱${Number(
                                product.sellingPrice || 0
                            ).toFixed(2)}

                        </span>

                    </td>


                    <!-- STOCK -->

                    <td>

                        <span class="${stockClass}">

                            ${stock}

                        </span>

                    </td>


                    <!-- STATUS -->

                    <td>

                        ${statusBadge}

                    </td>


                    <!-- ACTION -->

                    <td>

                        <button

                            type="button"

                            class="
                                product-action-btn
                                product-edit-btn
                                me-1
                            "

                            onclick="
                                editProduct(
                                    '${escapeProductAttribute(
                                        product.productId
                                    )}'
                                )
                            "

                            title="Edit Product">

                            <i
                                class="fa-solid fa-pen">
                            </i>

                        </button>


                        <button

                            type="button"

                            class="
                                product-action-btn
                                product-delete-btn
                            "

                            onclick="
                                deleteProduct(
                                    '${escapeProductAttribute(
                                        product.productId
                                    )}'
                                )
                            "

                            title="Delete Product">

                            <i
                                class="fa-solid fa-trash">
                            </i>

                        </button>

                    </td>


                </tr>

            `;

        }

    );

}


// ==========================================================
// GET FILTERED PRODUCTS
// ==========================================================

function getFilteredProducts() {

    let products =

        Array.isArray(productList)

            ? [...productList]

            : [];


    // ======================================================
    // SEARCH
    // ======================================================

    const searchElement =
        document.getElementById(
            "searchProduct"
        );


    const keyword =

        searchElement

            ? searchElement.value
                .trim()
                .toLowerCase()

            : "";


    if (
        keyword !== ""
    ) {

        products =

            products.filter(

                function (product) {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const code =
                        String(
                            product.code || ""
                        ).toLowerCase();


                    const category =
                        String(
                            product.categoryName || ""
                        ).toLowerCase();


                    return (

                        name.includes(
                            keyword
                        )

                        ||

                        code.includes(
                            keyword
                        )

                        ||

                        category.includes(
                            keyword
                        )

                    );

                }

            );

    }


    // ======================================================
    // CATEGORY FILTER
    // ======================================================

    const categoryFilter =
        document.getElementById(
            "filterCategory"
        );


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "";


    if (
        selectedCategory !== ""
    ) {

        products =

            products.filter(

                function (product) {

                    return (

                        String(
                            product.categoryId || ""
                        ) ===
                        String(
                            selectedCategory
                        )

                    );

                }

            );

    }


    // ======================================================
    // STATUS FILTER
    // ======================================================

    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    if (
        selectedStatus !== ""
    ) {

        products =

            products.filter(

                function (product) {

                    return (

                        product.status ===
                        selectedStatus

                    );

                }

            );

    }


    return products;

}


// ==========================================================
// UPDATE PRODUCT COUNTER
// ==========================================================

function updateProductCounter() {

    const total =
        document.getElementById(
            "totalProducts"
        );


    const footer =
        document.getElementById(
            "footerTotalProducts"
        );


    const count =

        Array.isArray(productList)

            ? productList.length

            : 0;


    if (total) {

        total.textContent =
            count;

    }


    if (footer) {

        footer.textContent =
            count;

    }

}


// ==========================================================
// LOAD PRODUCT CATEGORIES
//
// SOURCE:
// Firebase categories/
//
// ONLY ACTIVE CATEGORIES
// ==========================================================

async function loadProductCategories() {

    const dropdown =
        document.getElementById(
            "productCategory"
        );


    if (!dropdown) {

        console.warn(
            "#productCategory not found."
        );

        return;

    }


    if (
        typeof db === "undefined" ||
        !db
    ) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        dropdown.innerHTML = `

            <option value="">

                Loading Categories...

            </option>

        `;


        const snapshot =

            await db
                .ref("categories")
                .orderByChild("displayOrder")
                .once("value");


        productCategories = [];


        snapshot.forEach(

            function (child) {

                const category =
                    child.val() || {};


                // ------------------------------------------
                // ONLY ACTIVE
                // ------------------------------------------

                const status =
                    category.status ||
                    "Active";


                if (
                    status !== "Active"
                ) {

                    return;

                }


                const name =
                    String(
                        category.name || ""
                    ).trim();


                if (
                    name === ""
                ) {

                    return;

                }


                productCategories.push({

                    id:
                        child.key,

                    name:
                        name,

                    code:
                        category.code || "",

                    icon:
                        category.icon ||
                        "fa-utensils",

                    color:
                        category.color ||
                        "#C8102E",

                    displayOrder:
                        Number(
                            category.displayOrder || 0
                        )

                });

            }

        );


        // --------------------------------------------------
        // SORT
        // --------------------------------------------------

        productCategories.sort(

            function (a, b) {

                if (
                    a.displayOrder !==
                    b.displayOrder
                ) {

                    return (
                        a.displayOrder -
                        b.displayOrder
                    );

                }


                return a.name.localeCompare(
                    b.name
                );

            }

        );


        // --------------------------------------------------
        // RESET DROPDOWN
        // --------------------------------------------------

        dropdown.innerHTML = `

            <option value="">

                Select Category

            </option>

        `;


        // --------------------------------------------------
        // ADD CATEGORIES
        // --------------------------------------------------

        productCategories.forEach(

            function (category) {

                dropdown.innerHTML += `

                    <option
                        value="${escapeProductAttribute(
                            category.id
                        )}">

                        ${escapeProductHTML(
                            category.name
                        )}

                    </option>

                `;

            }

        );


        console.log(
            "Active Product Categories loaded:",
            productCategories.length
        );


        // --------------------------------------------------
        // REFRESH FILTER
        // --------------------------------------------------

        refreshProductFilters();


        return productCategories;

    }

    catch (error) {

        console.error(
            "Load Product Categories Error:",
            error
        );


        productCategories = [];


        dropdown.innerHTML = `

            <option value="">

                Unable to load categories

            </option>

        `;

    }

}


// ==========================================================
// REFRESH PRODUCT CATEGORY FILTER
//
// IMPORTANT:
// This now uses Firebase categories,
// NOT only categories already used by products.
// ==========================================================

function refreshProductFilters() {

    const filter =
        document.getElementById(
            "filterCategory"
        );


    if (!filter) {

        return;

    }


    const currentValue =
        filter.value;


    // ------------------------------------------------------
    // IF CATEGORIES HAVE NOT LOADED YET
    // ------------------------------------------------------

    if (
        !Array.isArray(
            productCategories
        )
    ) {

        productCategories = [];

    }


    filter.innerHTML = `

        <option value="">

            All Categories

        </option>

    `;


    // ------------------------------------------------------
    // ADD ALL ACTIVE CATEGORIES
    // ------------------------------------------------------

    productCategories.forEach(

        function (category) {

            filter.innerHTML += `

                <option
                    value="${escapeProductAttribute(
                        category.id
                    )}">

                    ${escapeProductHTML(
                        category.name
                    )}

                </option>

            `;

        }

    );


    // ------------------------------------------------------
    // RESTORE FILTER
    // ------------------------------------------------------

    const optionExists =

        Array.from(
            filter.options
        ).some(

            function (option) {

                return (

                    option.value ===
                    currentValue

                );

            }

        );


    if (optionExists) {

        filter.value =
            currentValue;

    }

}


// ==========================================================
// FIND CATEGORY NAME BY ID
// ==========================================================

function getCategoryNameById(
    categoryId
) {

    if (
        !categoryId
    ) {

        return "";

    }


    const category =

        productCategories.find(

            function (item) {

                return (

                    String(
                        item.id
                    ) ===
                    String(
                        categoryId
                    )

                );

            }

        );


    return category
        ? category.name
        : "";

}


// ==========================================================
// GENERATE PRODUCT CODE
// ==========================================================

function generateProductCode() {

    const codeInput =
        document.getElementById(
            "productCode"
        );


    if (!codeInput) {

        return;

    }


    // ------------------------------------------------------
    // DO NOT REPLACE CODE DURING EDIT
    // ------------------------------------------------------

    if (

        typeof editingProductId !==
        "undefined"

        &&

        editingProductId

    ) {

        return;

    }


    if (

        codeInput.value &&

        codeInput.value.trim() !== ""

    ) {

        return;

    }


    const count =

        Array.isArray(productList)

            ? productList.length + 1

            : 1;


    const code =

        "PAP-" +

        String(
            count
        ).padStart(
            5,
            "0"
        );


    codeInput.value =
        code;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeProductHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================================
// ESCAPE HTML ATTRIBUTE
// ==========================================================

function escapeProductAttribute(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}


// ==========================================================
// SEARCH EVENTS
// ==========================================================

document.addEventListener(

    "input",

    function (event) {

        if (

            event.target &&
            event.target.id ===
            "searchProduct"

        ) {

            renderProductTable();

        }

    }

);


// ==========================================================
// FILTER EVENTS
// ==========================================================

document.addEventListener(

    "change",

    function (event) {

        if (!event.target) {

            return;

        }


        if (

            event.target.id ===
            "filterCategory"

            ||

            event.target.id ===
            "filterStatus"

        ) {

            renderProductTable();

        }

    }

);


// ==========================================================
// REFRESH BUTTON
// ==========================================================

document.addEventListener(

    "click",

    function (event) {

        const button =

            event.target.closest(
                "#btnRefreshProducts"
            );


        if (!button) {

            return;

        }


        console.log(
            "Refreshing Products..."
        );


        loadProductCategories();

        renderProductTable();

        updateProductCounter();

    }

);
