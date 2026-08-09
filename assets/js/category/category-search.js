// ==========================================================
// PAPPRITO ERP
// CATEGORY SEARCH / FILTER ENGINE V2
// File : assets/js/category/category-search.js
//
// FEATURES:
// - Search Category Code
// - Search Category Name
// - Search Description
// - Filter Active / Inactive
// - Real-time table filtering
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL
// ==========================================================

let categorySearchInitialized = false;


// ==========================================================
// INITIALIZE CATEGORY SEARCH
// ==========================================================

function initializeCategorySearch() {

    const searchInput =
        document.getElementById(
            "searchCategory"
        );

    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    if (!searchInput && !statusFilter) {

        console.warn(
            "Category search controls not found."
        );

        return;

    }


    // Prevent duplicate listeners

    if (
        categorySearchInitialized
    ) {

        return;

    }


    categorySearchInitialized =
        true;


    // ======================================================
    // SEARCH
    // ======================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyCategoryFilters
        );

    }


    // ======================================================
    // STATUS FILTER
    // ======================================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyCategoryFilters
        );

    }


    console.log(
        "Category Search Engine V2 initialized."
    );

}


// ==========================================================
// APPLY FILTERS
// ==========================================================

function applyCategoryFilters() {

    const searchInput =
        document.getElementById(
            "searchCategory"
        );


    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    const table =
        document.getElementById(
            "categoryTable"
        );


    if (!table) {

        return;

    }


    const search =
        (
            searchInput
                ?.value
                .trim()
                .toLowerCase()
        ) || "";


    const status =
        statusFilter
            ?.value || "";


    const rows =
        table.querySelectorAll(
            "tr[data-category-id]"
        );


    let visibleCount =
        0;


    rows.forEach(
        function(row) {

            const code =
                (
                    row.dataset.code ||
                    ""
                ).toLowerCase();


            const name =
                (
                    row.dataset.name ||
                    ""
                ).toLowerCase();


            const description =
                (
                    row.dataset.description ||
                    ""
                ).toLowerCase();


            const rowStatus =
                row.dataset.status ||
                "";


            // ==================================================
            // SEARCH MATCH
            // ==================================================

            const searchMatch =
                !search ||

                code.includes(
                    search
                ) ||

                name.includes(
                    search
                ) ||

                description.includes(
                    search
                );


            // ==================================================
            // STATUS MATCH
            // ==================================================

            const statusMatch =
                !status ||

                rowStatus ===
                status;


            // ==================================================
            // SHOW / HIDE
            // ==================================================

            if (
                searchMatch &&
                statusMatch
            ) {

                row.style.display =
                    "";

                visibleCount++;

            }

            else {

                row.style.display =
                    "none";

            }

        }
    );


    // ======================================================
    // EMPTY SEARCH RESULT
    // ======================================================

    showCategorySearchEmptyState(
        table,
        visibleCount
    );


    // ======================================================
    // UPDATE COUNTER
    // ======================================================

    updateCategoryFilteredCounter(
        visibleCount
    );

}


// ==========================================================
// EMPTY SEARCH RESULT
// ==========================================================

function showCategorySearchEmptyState(
    table,
    visibleCount
) {

    let emptyRow =
        document.getElementById(
            "categorySearchEmpty"
        );


    if (
        visibleCount > 0
    ) {

        if (emptyRow) {

            emptyRow.remove();

        }

        return;

    }


    // Don't show empty search message
    // when there are no actual category rows.

    const categoryRows =
        table.querySelectorAll(
            "tr[data-category-id]"
        );


    if (
        categoryRows.length ===
        0
    ) {

        return;

    }


    if (!emptyRow) {

        emptyRow =
            document.createElement(
                "tr"
            );


        emptyRow.id =
            "categorySearchEmpty";


        emptyRow.innerHTML = `

            <td
                colspan="7"
                class="text-center py-5">

                <i
                    class="
                        fa-solid
                        fa-magnifying-glass
                        fa-3x
                        text-secondary
                        mb-3
                    ">
                </i>

                <br>

                <strong>
                    No Matching Categories
                </strong>

                <br>

                <small class="text-muted">

                    Try another category name,
                    code or status.

                </small>

            </td>

        `;


        table.appendChild(
            emptyRow
        );

    }

}


// ==========================================================
// UPDATE FILTERED COUNTER
// ==========================================================

function updateCategoryFilteredCounter(
    count
) {

    const total =
        document.getElementById(
            "totalCategories"
        );


    const footerTotal =
        document.getElementById(
            "footerTotal"
        );


    if (total) {

        total.textContent =
            count;

    }


    if (footerTotal) {

        footerTotal.textContent =
            count;

    }

}


// ==========================================================
// CLEAR SEARCH
// ==========================================================

function clearCategorySearch() {

    const searchInput =
        document.getElementById(
            "searchCategory"
        );


    const statusFilter =
        document.getElementById(
            "filterStatus"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (statusFilter) {

        statusFilter.value =
            "";

    }


    applyCategoryFilters();

}


// ==========================================================
// REFRESH SEARCH
// ==========================================================

function refreshCategorySearch() {

    applyCategoryFilters();

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.initializeCategorySearch =
    initializeCategorySearch;

window.applyCategoryFilters =
    applyCategoryFilters;

window.clearCategorySearch =
    clearCategorySearch;

window.refreshCategorySearch =
    refreshCategorySearch;


// ==========================================================
// AUTO INITIALIZE
// ==========================================================

function autoInitializeCategorySearch() {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function() {

                initializeCategorySearch();

            },
            {
                once: true
            }
        );

    }

    else {

        initializeCategorySearch();

    }

}


autoInitializeCategorySearch();


console.log(
    "PAPPRITO Category Search Engine V2 loaded."
);
