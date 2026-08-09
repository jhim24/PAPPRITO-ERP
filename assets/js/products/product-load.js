// ==========================================================
// PAPPRITO ERP
// PRODUCT MASTER - LOAD ENGINE
// File : assets/js/products/product-load.js
// Description : Product Loading, Firebase Listener & Table
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL PRODUCT DATA
// ==========================================================

let productList = [];

let productListener = null;


// ==========================================================
// INITIALIZE PRODUCT PAGE
// ==========================================================

function initializeProductPage() {

    console.log(
        "PAPPRITO PRODUCT MASTER INITIALIZING..."
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
    // PRODUCT CATEGORIES
    // ------------------------------------------------------

    if (
        typeof loadProductCategories ===
        "function"
    ) {

        loadProductCategories();

    }


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
    // FIREBASE LISTENER
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
            // RENDER TABLE
            // ------------------------------------------------

            renderProductTable();


            // ------------------------------------------------
            // COUNTER
            // ------------------------------------------------

            updateProductCounter();


            // ------------------------------------------------
            // CATEGORY FILTER
            // ------------------------------------------------

            if (
                typeof refreshProductFilters ===
                "function"
            ) {

                refreshProductFilters();

            }

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
    // CLEAR TABLE
    // ------------------------------------------------------

    table.innerHTML = "";


    // ------------------------------------------------------
    // FILTER PRODUCTS
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
    // RENDER PRODUCTS
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
            // TABLE ROW
            // ----------------------------------------------

            table.innerHTML += `

                <tr>

                    <!-- PRODUCT CODE -->

                    <td>

                        ${escapeProductHTML(
                            product.code || ""
                        )}

                    </td>


                    <!-- IMAGE -->

                    <td>

                        <img

                            src="${escapeProductAttribute(
                                image
                            )}"

                            alt="${escapeProductAttribute(
                                product.name ||
                                "Product"
                            )}"

                            width="60"

                            height="60"

                            style="
                                width:60px;
                                height:60px;
                                object-fit:cover;
                                border-radius:10px;
                            "

                            onerror="
                                this.onerror=null;
                                this.src='assets/img/logo.png';
                            "

                        >

                    </td>


                    <!-- PRODUCT NAME -->

                    <td>

                        <strong>

                            ${escapeProductHTML(
                                product.name || ""
                            )}

                        </strong>

                    </td>


                    <!-- CATEGORY -->

                    <td>

                        ${escapeProductHTML(
                            product.categoryName || ""
                        )}

                    </td>


                    <!-- SELLING PRICE -->

                    <td>

                        ₱${Number(
                            product.sellingPrice || 0
                        ).toFixed(2)}

                    </td>


                    <!-- CURRENT STOCK -->

                    <td>

                        ${stock}

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
                                btn
                                btn-warning
                                btn-sm
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
                                btn
                                btn-danger
                                btn-sm
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

                        product.categoryId ===
                        selectedCategory

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
                .once("value");


        dropdown.innerHTML = `

            <option value="">
                Select Category
            </option>

        `;


        const categories = [];


        snapshot.forEach(
            function (child) {

                const category =
                    child.val() || {};


                categories.push({

                    id:
                        child.key,

                    name:
                        category.name || ""

                });

            }
        );


        // --------------------------------------------------
        // SORT
        // --------------------------------------------------

        categories.sort(
            function (a, b) {

                return a.name.localeCompare(
                    b.name
                );

            }
        );


        // --------------------------------------------------
        // ADD OPTIONS
        // --------------------------------------------------

        categories.forEach(
            function (category) {

                if (
                    category.name.trim() === ""
                ) {

                    return;

                }


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
            "Product categories loaded:",
            categories.length
        );


        return categories;

    }

    catch (error) {

        console.error(
            "Load Product Categories Error:",
            error
        );


        dropdown.innerHTML = `

            <option value="">
                Unable to load categories
            </option>

        `;

    }

}


// ==========================================================
// REFRESH PRODUCT FILTERS
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


    const categoryMap =
        new Map();


    productList.forEach(
        function (product) {

            if (
                product.categoryId &&
                product.categoryName
            ) {

                categoryMap.set(
                    product.categoryId,
                    product.categoryName
                );

            }

        }
    );


    filter.innerHTML = `

        <option value="">
            All Categories
        </option>

    `;


    const categories =
        Array.from(
            categoryMap.entries()
        ).sort(
            function (a, b) {

                return a[1].localeCompare(
                    b[1]
                );

            }
        );


    categories.forEach(
        function ([id, name]) {

            filter.innerHTML += `

                <option
                    value="${escapeProductAttribute(
                        id
                    )}">

                    ${escapeProductHTML(
                        name
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


    // Do not replace code during edit

    if (
        typeof editingProductId !==
        "undefined" &&
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
            "Refreshing products..."
        );


        renderProductTable();

        updateProductCounter();

    }
);
