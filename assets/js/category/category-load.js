// ==========================================================
// PAPPRITO ERP
// CATEGORY LOAD ENGINE V2
// File: assets/js/category/category-load.js
//
// INTEGRATED WITH:
// - Firebase categories
// - Firebase products
// - Product Master
// - POS
// - Online Menu
//
// IMPORTANT:
// Product count is calculated from products.categoryId.
// Category Master is the master source.
// ==========================================================

"use strict";

// ==========================================================
// GLOBAL CATEGORY LISTENER
// ==========================================================

let categoryListener = null;


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

function loadCategories() {

    const table =
        document.getElementById("categoryTable");

    const total =
        document.getElementById("totalCategories");

    const footerTotal =
        document.getElementById("footerTotal");


    if (!table) {

        console.warn(
            "Category table not found."
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


    // ======================================================
    // PREVENT DUPLICATE LISTENER
    // ======================================================

    if (categoryListener) {

        categoryListener.off();

    }


    categoryListener =
        db.ref("categories")
          .orderByChild("displayOrder");


    categoryListener.on(
        "value",
        async function(snapshot) {

            try {

                // ==================================================
                // GET CATEGORIES
                // ==================================================

                const categories = [];


                snapshot.forEach(
                    function(child) {

                        const category =
                            child.val() || {};


                        categories.push({

                            id:
                                child.key,

                            ...category

                        });

                    }
                );


                // ==================================================
                // GET PRODUCTS
                //
                // IMPORTANT:
                // Products are used to calculate the real count.
                // ==================================================

                let products = [];


                try {

                    const productSnapshot =
                        await db
                            .ref("products")
                            .once("value");


                    productSnapshot.forEach(
                        function(child) {

                            products.push({

                                id:
                                    child.key,

                                ...(child.val() || {})

                            });

                        }
                    );

                }

                catch (productError) {

                    console.error(
                        "Unable to load products for category count:",
                        productError
                    );

                }


                // ==================================================
                // BUILD PRODUCT COUNT
                // ==================================================

                const productCounts = {};


                products.forEach(
                    function(product) {

                        const categoryId =
                            product.categoryId;


                        if (!categoryId) {

                            return;

                        }


                        if (
                            !productCounts[categoryId]
                        ) {

                            productCounts[categoryId] =
                                0;

                        }


                        productCounts[categoryId]++;

                    }
                );


                // ==================================================
                // EMPTY STATE
                // ==================================================

                if (
                    categories.length === 0
                ) {

                    table.innerHTML = `

                        <tr>

                            <td
                                colspan="7"
                                class="text-center py-5">

                                <div class="mb-3">

                                    <i
                                        class="fa-solid
                                               fa-folder-open
                                               fa-3x
                                               text-secondary">
                                    </i>

                                </div>

                                <strong>
                                    No Categories Found
                                </strong>

                                <br>

                                <small class="text-muted">

                                    Click "Add Category"
                                    to create your first category.

                                </small>

                            </td>

                        </tr>

                    `;


                    if (total) {

                        total.textContent =
                            "0";

                    }


                    if (footerTotal) {

                        footerTotal.textContent =
                            "0";

                    }


                    return;

                }


                // ==================================================
                // SORT BY DISPLAY ORDER
                // ==================================================

                categories.sort(
                    function(a, b) {

                        const orderA =
                            Number(
                                a.displayOrder || 0
                            );

                        const orderB =
                            Number(
                                b.displayOrder || 0
                            );


                        if (
                            orderA !== orderB
                        ) {

                            return (
                                orderA -
                                orderB
                            );

                        }


                        return String(
                            a.name || ""
                        ).localeCompare(
                            String(
                                b.name || ""
                            )
                        );

                    }
                );


                // ==================================================
                // RENDER
                // ==================================================

                let html = "";


                categories.forEach(
                    function(category) {

                        const id =
                            category.id;


                        const code =
                            category.code ||
                            "N/A";


                        const name =
                            category.name ||
                            "Unnamed Category";


                        const description =
                            category.description ||
                            "";


                        const icon =
                            normalizeCategoryIcon(
                                category.icon
                            );


                        const color =
                            category.color ||
                            "#C8102E";


                        const status =
                            category.status ||
                            "Active";


                        const productCount =
                            productCounts[id] ||
                            0;


                        // ==================================================
                        // STATUS BADGE
                        // ==================================================

                        let badge = "";


                        if (
                            status ===
                            "Active"
                        ) {

                            badge = `

                                <span
                                    class="badge bg-success">

                                    Active

                                </span>

                            `;

                        }

                        else {

                            badge = `

                                <span
                                    class="badge bg-secondary">

                                    Inactive

                                </span>

                            `;

                        }


                        // ==================================================
                        // ESCAPED VALUES
                        // ==================================================

                        const safeCode =
                            escapeCategoryHTML(
                                code
                            );


                        const safeName =
                            escapeCategoryHTML(
                                name
                            );


                        const safeDescription =
                            escapeCategoryHTML(
                                description
                            );


                        const safeColor =
                            escapeCategoryAttribute(
                                color
                            );


                        // ==================================================
                        // TABLE ROW
                        // ==================================================

                        html += `

                            <tr>

                                <!-- CODE -->

                                <td>

                                    <strong>

                                        ${safeCode}

                                    </strong>

                                </td>


                                <!-- ICON -->

                                <td>

                                    <div
                                        class="d-flex
                                               align-items-center
                                               justify-content-center"
                                        style="
                                            width:40px;
                                            height:40px;
                                            border-radius:10px;
                                            background:${safeColor}15;
                                        ">

                                        <i
                                            class="fa-solid ${icon}"
                                            style="
                                                color:${safeColor};
                                                font-size:20px;
                                            ">
                                        </i>

                                    </div>

                                </td>


                                <!-- CATEGORY -->

                                <td>

                                    <strong>

                                        ${safeName}

                                    </strong>

                                </td>


                                <!-- DESCRIPTION -->

                                <td>

                                    <span
                                        class="text-muted">

                                        ${safeDescription}

                                    </span>

                                </td>


                                <!-- PRODUCT COUNT -->

                                <td>

                                    <span
                                        class="
                                            badge
                                            bg-light
                                            text-dark
                                            border
                                        ">

                                        ${productCount}

                                    </span>

                                </td>


                                <!-- STATUS -->

                                <td>

                                    ${badge}

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
                                            editCategory('${id}')
                                        "
                                        title="Edit Category">

                                        <i
                                            class="
                                                fa-solid
                                                fa-pen
                                            ">
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
                                            deleteCategory('${id}')
                                        "
                                        title="Delete Category">

                                        <i
                                            class="
                                                fa-solid
                                                fa-trash
                                            ">
                                        </i>

                                    </button>

                                </td>

                            </tr>

                        `;

                    }
                );


                // ==================================================
                // INSERT TABLE
                // ==================================================

                table.innerHTML =
                    html;


                // ==================================================
                // TOTAL
                // ==================================================

                const categoryCount =
                    categories.length;


                if (total) {

                    total.textContent =
                        categoryCount;

                }


                if (footerTotal) {

                    footerTotal.textContent =
                        categoryCount;

                }


                console.log(
                    "Categories loaded:",
                    categoryCount
                );


                console.log(
                    "Products used for category count:",
                    products.length
                );

            }

            catch (error) {

                console.error(
                    "Category Load Error:",
                    error
                );


                table.innerHTML = `

                    <tr>

                        <td
                            colspan="7"
                            class="text-center py-5">

                            <i
                                class="
                                    fa-solid
                                    fa-triangle-exclamation
                                    fa-2x
                                    text-danger
                                    mb-3
                                ">
                            </i>

                            <br>

                            <strong>
                                Unable to load categories
                            </strong>

                            <br>

                            <small class="text-muted">

                                ${escapeCategoryHTML(
                                    error.message
                                )}

                            </small>

                        </td>

                    </tr>

                `;

            }

        }
    );

}


// ==========================================================
// NORMALIZE CATEGORY ICON
// ==========================================================

function normalizeCategoryIcon(
    icon
) {

    let value =
        String(
            icon ||
            "fa-utensils"
        ).trim();


    // Remove accidental "fa-solid"
    // if saved in database.

    value =
        value.replace(
            /\bfa-solid\b/g,
            ""
        ).trim();


    // Remove accidental "fas"

    value =
        value.replace(
            /\bfas\b/g,
            ""
        ).trim();


    // Default

    if (
        value === ""
    ) {

        value =
            "fa-utensils";

    }


    return value;

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeCategoryHTML(
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
// ATTRIBUTE ESCAPE
// ==========================================================

function escapeCategoryAttribute(
    value
) {

    return String(
        value ?? ""
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
// REFRESH CATEGORIES
// ==========================================================

function refreshCategories() {

    loadCategories();

}


// ==========================================================
// CLEANUP
// ==========================================================

function destroyCategoryListener() {

    if (
        categoryListener
    ) {

        categoryListener.off();

        categoryListener =
            null;

    }

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.loadCategories =
    loadCategories;

window.refreshCategories =
    refreshCategories;

window.destroyCategoryListener =
    destroyCategoryListener;
