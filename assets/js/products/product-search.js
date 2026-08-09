// ==========================================================
// PAPPRITO ERP
// PRODUCT SEARCH & FILTER ENGINE
// File : assets/js/products/product-search.js
// Description : Product Search, Category Filter & Status Filter
// ==========================================================

"use strict";


// ==========================================================
// INITIALIZE PRODUCT SEARCH
// ==========================================================

function initializeProductSearch() {

    console.log(
        "Product Search Engine initialized."
    );


    // ======================================================
    // SEARCH PRODUCT
    // ======================================================

    const searchInput =
        document.getElementById(
            "searchProduct"
        );


    if (searchInput) {

        if (
            searchInput.dataset.searchInitialized !==
            "true"
        ) {

            searchInput.dataset.searchInitialized =
                "true";


            searchInput.addEventListener(
                "input",
                function () {

                    renderProductTable();

                }
            );

        }

    }


    // ======================================================
    // CATEGORY FILTER
    // ======================================================

    const categoryFilter =
        document.getElementById(
            "filterCategory"
        );


    if (categoryFilter) {

        if (
            categoryFilter.dataset.searchInitialized !==
            "true"
        ) {

            categoryFilter.dataset.searchInitialized =
                "true";


            categoryFilter.addEventListener(
                "change",
                function () {

                    renderProductTable();

                }
            );

        }

    }


    // ======================================================
    // STATUS FILTER
    // ======================================================

    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    if (statusFilter) {

        if (
            statusFilter.dataset.searchInitialized !==
            "true"
        ) {

            statusFilter.dataset.searchInitialized =
                "true";


            statusFilter.addEventListener(
                "change",
                function () {

                    renderProductTable();

                }
            );

        }

    }


    // ======================================================
    // REFRESH BUTTON
    // ======================================================

    const refreshButton =
        document.getElementById(
            "btnRefreshProducts"
        );


    if (refreshButton) {

        if (
            refreshButton.dataset.searchInitialized !==
            "true"
        ) {

            refreshButton.dataset.searchInitialized =
                "true";


            refreshButton.addEventListener(
                "click",
                function () {

                    refreshProductList();

                }
            );

        }

    }


    // ======================================================
    // INITIAL RENDER
    // ======================================================

    if (
        typeof renderProductTable ===
        "function"
    ) {

        renderProductTable();

    }

}


// ==========================================================
// FILTER PRODUCTS
// ==========================================================

function filterProductList() {

    if (
        typeof getFilteredProducts !==
        "function"
    ) {

        return [];

    }


    return getFilteredProducts();

}


// ==========================================================
// REFRESH PRODUCT LIST
// ==========================================================

function refreshProductList() {

    console.log(
        "Refreshing Product Master..."
    );


    // ------------------------------------------------------
    // Clear Search
    // ------------------------------------------------------

    const searchInput =
        document.getElementById(
            "searchProduct"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    // ------------------------------------------------------
    // Reset Category Filter
    // ------------------------------------------------------

    const categoryFilter =
        document.getElementById(
            "filterCategory"
        );


    if (categoryFilter) {

        categoryFilter.value =
            "";

    }


    // ------------------------------------------------------
    // Reset Status Filter
    // ------------------------------------------------------

    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    if (statusFilter) {

        statusFilter.value =
            "";

    }


    // ------------------------------------------------------
    // Re-render
    // ------------------------------------------------------

    if (
        typeof renderProductTable ===
        "function"
    ) {

        renderProductTable();

    }


    if (
        typeof updateProductCounter ===
        "function"
    ) {

        updateProductCounter();

    }

}


// ==========================================================
// CLEAR PRODUCT SEARCH
// ==========================================================

function clearProductSearch() {

    const searchInput =
        document.getElementById(
            "searchProduct"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (
        typeof renderProductTable ===
        "function"
    ) {

        renderProductTable();

    }

}


// ==========================================================
// SET CATEGORY FILTER
// ==========================================================

function setProductCategoryFilter(
    categoryId
) {

    const categoryFilter =
        document.getElementById(
            "filterCategory"
        );


    if (!categoryFilter) {

        return;

    }


    categoryFilter.value =
        categoryId || "";


    if (
        typeof renderProductTable ===
        "function"
    ) {

        renderProductTable();

    }

}


// ==========================================================
// SET STATUS FILTER
// ==========================================================

function setProductStatusFilter(
    status
) {

    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    if (!statusFilter) {

        return;

    }


    statusFilter.value =
        status || "";


    if (
        typeof renderProductTable ===
        "function"
    ) {

        renderProductTable();

    }

}


// ==========================================================
// SEARCH BY KEYWORD
// ==========================================================

function searchProducts(
    keyword
) {

    const searchInput =
        document.getElementById(
            "searchProduct"
        );


    if (!searchInput) {

        return;

    }


    searchInput.value =
        keyword || "";


    if (
        typeof renderProductTable ===
        "function"
    ) {

        renderProductTable();

    }

}


// ==========================================================
// EXPORT PRODUCTS
// ==========================================================

function exportProducts() {

    if (
        typeof productList ===
        "undefined" ||
        !Array.isArray(productList)
    ) {

        alert(
            "No product data available."
        );

        return;

    }


    const products =
        typeof getFilteredProducts ===
        "function"

            ? getFilteredProducts()

            : productList;


    if (
        products.length ===
        0
    ) {

        alert(
            "No products available to export."
        );

        return;

    }


    const headers = [

        "Code",
        "Product",
        "Category",
        "Description",
        "Cost Price",
        "Selling Price",
        "Opening Stock",
        "Current Stock",
        "Reorder Level",
        "Unit",
        "Status"

    ];


    const rows =
        products.map(
            function (product) {

                return [

                    product.code || "",

                    product.name || "",

                    product.categoryName || "",

                    product.description || "",

                    Number(
                        product.costPrice || 0
                    ).toFixed(2),

                    Number(
                        product.sellingPrice || 0
                    ).toFixed(2),

                    Number(
                        product.openingStock || 0
                    ),

                    Number(
                        product.currentStock || 0
                    ),

                    Number(
                        product.reorderLevel || 0
                    ),

                    product.unit || "",

                    product.status || ""

                ];

            }
        );


    // ======================================================
    // CSV
    // ======================================================

    let csv =
        headers.join(",") +
        "\n";


    rows.forEach(
        function (row) {

            csv +=
                row
                    .map(
                        function (value) {

                            return csvEscape(
                                value
                            );

                        }
                    )
                    .join(",") +
                "\n";

        }
    );


    // ======================================================
    // DOWNLOAD
    // ======================================================

    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "PAPPRITO-Products-" +
        new Date()
            .toISOString()
            .slice(
                0,
                10
            ) +
        ".csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// ==========================================================
// CSV ESCAPE
// ==========================================================

function csvEscape(
    value
) {

    const text =
        String(
            value ?? ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"';

    }


    return text;

}


// ==========================================================
// EXPORT BUTTON
// ==========================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#btnExportProducts"
            );


        if (!button) {

            return;

        }


        exportProducts();

    }
);
