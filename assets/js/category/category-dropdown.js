// ==========================================================
// PAPPRITO ERP
// CATEGORY DROPDOWN ENGINE V2
// File: assets/js/category/category-dropdown.js
//
// INTEGRATED WITH:
// - Category Master
// - Product Master
// - POS
// - Online Menu
//
// Firebase path:
// categories/{categoryId}
//
// IMPORTANT:
// The CATEGORY ID is the permanent connection between
// Category Master and Products.
// ==========================================================

"use strict";

// ==========================================================
// GLOBAL
// ==========================================================

let categoryDropdownListener = null;


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeCategoryDropdown() {

    loadCategoryDropdown();

}


// ==========================================================
// LOAD CATEGORY DROPDOWN
// ==========================================================

function loadCategoryDropdown(
    selectId = "productCategory"
) {

    const select =
        document.getElementById(selectId);


    if (!select) {

        console.warn(
            "Category dropdown not found:",
            selectId
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
    // SAVE CURRENT VALUE
    // ======================================================

    const currentValue =
        select.value || "";


    // ======================================================
    // REMOVE OLD LISTENER
    // ======================================================

    if (
        categoryDropdownListener
    ) {

        categoryDropdownListener.off();

    }


    categoryDropdownListener =
        db
            .ref("categories")
            .orderByChild("displayOrder");


    categoryDropdownListener.on(
        "value",
        function(snapshot) {

            try {

                // ==================================================
                // RESET
                // ==================================================

                select.innerHTML = `

                    <option value="">

                        Select Category

                    </option>

                `;


                // ==================================================
                // NO CATEGORIES
                // ==================================================

                if (
                    !snapshot.exists()
                ) {

                    select.innerHTML += `

                        <option
                            value=""
                            disabled>

                            No categories available

                        </option>

                    `;

                    return;

                }


                // ==================================================
                // COLLECT
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
                // SORT
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
                // RENDER ACTIVE CATEGORIES
                // ==================================================

                categories.forEach(
                    function(category) {

                        // ------------------------------------------
                        // Only Active categories
                        // ------------------------------------------

                        if (
                            category.status &&
                            category.status !==
                            "Active"
                        ) {

                            return;

                        }


                        const option =
                            document.createElement(
                                "option"
                            );


                        // ------------------------------------------
                        // IMPORTANT
                        //
                        // VALUE = FIREBASE CATEGORY ID
                        // ------------------------------------------

                        option.value =
                            category.id;


                        option.textContent =
                            category.name ||
                            "Unnamed Category";


                        // ------------------------------------------
                        // Optional data
                        // ------------------------------------------

                        option.dataset.code =
                            category.code ||
                            "";


                        option.dataset.color =
                            category.color ||
                            "#C8102E";


                        option.dataset.icon =
                            category.icon ||
                            "fa-utensils";


                        select.appendChild(
                            option
                        );

                    }
                );


                // ==================================================
                // RESTORE SELECTED VALUE
                //
                // Important when editing a product.
                // ==================================================

                if (
                    currentValue
                ) {

                    const exists =
                        Array.from(
                            select.options
                        ).some(
                            function(option) {

                                return (
                                    option.value ===
                                    currentValue
                                );

                            }
                        );


                    if (exists) {

                        select.value =
                            currentValue;

                    }

                }


                // ==================================================
                // EVENT
                // ==================================================

                select.dispatchEvent(
                    new Event(
                        "categoryloaded"
                    )
                );


                console.log(
                    "Category dropdown loaded:",
                    selectId,
                    select.options.length - 1
                );

            }

            catch (error) {

                console.error(
                    "Category Dropdown Error:",
                    error
                );

            }

        }
    );

}


// ==========================================================
// LOAD ALL CATEGORY DROPDOWNS
//
// Any select can be connected by:
// data-category-select
//
// Example:
//
// <select
//     data-category-select
//     id="productCategory">
// </select>
// ==========================================================

function loadAllCategoryDropdowns() {

    const dropdowns =
        document.querySelectorAll(
            "[data-category-select]"
        );


    dropdowns.forEach(
        function(select) {

            loadCategoryDropdown(
                select.id
            );

        }
    );


    // Default Product Master dropdown

    const productCategory =
        document.getElementById(
            "productCategory"
        );


    if (
        productCategory &&
        !productCategory.hasAttribute(
            "data-category-select"
        )
    ) {

        loadCategoryDropdown(
            "productCategory"
        );

    }

}


// ==========================================================
// GET CATEGORY BY ID
// ==========================================================

async function getCategoryById(
    categoryId
) {

    if (
        !categoryId ||
        typeof db === "undefined" ||
        !db
    ) {

        return null;

    }


    try {

        const snapshot =
            await db
                .ref(
                    "categories/" +
                    categoryId
                )
                .once("value");


        if (
            !snapshot.exists()
        ) {

            return null;

        }


        return {

            id:
                snapshot.key,

            ...(snapshot.val() || {})

        };

    }

    catch (error) {

        console.error(
            "Get Category Error:",
            error
        );

        return null;

    }

}


// ==========================================================
// GET CATEGORY NAME
// ==========================================================
//
// Useful for Product Master, POS and Online Menu.
// ==========================================================

async function getCategoryName(
    categoryId
) {

    const category =
        await getCategoryById(
            categoryId
        );


    if (!category) {

        return "";

    }


    return (
        category.name ||
        ""
    );

}


// ==========================================================
// REFRESH
// ==========================================================

function refreshCategoryDropdown() {

    loadAllCategoryDropdowns();

}


// ==========================================================
// CLEANUP
// ==========================================================

function destroyCategoryDropdownListener() {

    if (
        categoryDropdownListener
    ) {

        categoryDropdownListener.off();

        categoryDropdownListener =
            null;

    }

}


// ==========================================================
// AUTO INITIALIZE
// ==========================================================

function autoInitializeCategoryDropdown() {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function() {

                loadAllCategoryDropdowns();

            },
            {
                once: true
            }
        );

    }

    else {

        loadAllCategoryDropdowns();

    }

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.initializeCategoryDropdown =
    initializeCategoryDropdown;

window.loadCategoryDropdown =
    loadCategoryDropdown;

window.loadAllCategoryDropdowns =
    loadAllCategoryDropdowns;

window.refreshCategoryDropdown =
    refreshCategoryDropdown;

window.getCategoryById =
    getCategoryById;

window.getCategoryName =
    getCategoryName;

window.destroyCategoryDropdownListener =
    destroyCategoryDropdownListener;


// ==========================================================
// START
// ==========================================================

autoInitializeCategoryDropdown();


// ==========================================================
// READY
// ==========================================================

console.log(
    "PAPPRITO Category Dropdown Engine V2 initialized."
);
