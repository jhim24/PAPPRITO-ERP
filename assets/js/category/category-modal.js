// ==========================================================
// PAPPRITO ERP
// CATEGORY MODAL ENGINE V3
//
// File:
// assets/js/category/category-modal.js
//
// FINAL VERSION
//
// FUNCTIONS:
// - Add Category
// - Close Category
// - X Button
// - Cancel Button
// - ESC Close
// - Backdrop Close
// - Dynamic Page Support
// - Bootstrap Modal Support
// - Prevent Function Conflicts
// ==========================================================

"use strict";


// ==========================================================
// GET CATEGORY MODAL
// ==========================================================

function getCategoryModalElement() {

    return document.getElementById(
        "categoryModal"
    );

}


// ==========================================================
// GET BOOTSTRAP MODAL
// ==========================================================

function getCategoryModalInstance() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        console.warn(
            "Category Modal element not found."
        );

        return null;

    }


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        console.error(
            "Bootstrap is not loaded."
        );

        return null;

    }


    return bootstrap.Modal
        .getOrCreateInstance(
            modalElement,
            {
                backdrop: true,
                keyboard: true,
                focus: true
            }
        );

}


// ==========================================================
// OPEN ADD CATEGORY
// ==========================================================

function openAddCategory() {

    console.log(
        "Opening Add Category..."
    );


    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        console.error(
            "Cannot open Add Category: #categoryModal not found."
        );

        return;

    }


    // ======================================================
    // CLEAR EDIT MODE
    // ======================================================

    window.editingCategoryId =
        null;


    // ======================================================
    // RESET FORM
    // ======================================================

    if (
        typeof resetCategoryForm ===
        "function"
    ) {

        resetCategoryForm();

    }


    // ======================================================
    // TITLE
    // ======================================================

    const title =
        document.getElementById(
            "categoryModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-tags"></i>

            Add Category

        `;

    }


    // ======================================================
    // SAVE BUTTON
    // ======================================================

    const saveText =
        document.getElementById(
            "btnSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Category";

    }


    // ======================================================
    // GENERATE CODE
    // ======================================================

    if (
        typeof generateCategoryCode ===
        "function"
    ) {

        generateCategoryCode();

    }


    // ======================================================
    // ICON PREVIEW
    // ======================================================

    if (
        typeof updateCategoryIconPreview ===
        "function"
    ) {

        updateCategoryIconPreview();

    }


    // ======================================================
    // SHOW MODAL
    // ======================================================

    const modal =
        getCategoryModalInstance();


    if (!modal) {

        return;

    }


    modal.show();


    console.log(
        "Category Add Modal opened."
    );

}


// ==========================================================
// CLOSE CATEGORY MODAL
// ==========================================================

function closeCategoryModal() {

    console.log(
        "Closing Category Modal..."
    );


    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        console.warn(
            "Category Modal not found."
        );

        return;

    }


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        console.error(
            "Bootstrap is not loaded."
        );

        return;

    }


    const modal =
        bootstrap.Modal
            .getInstance(
                modalElement
            );


    if (modal) {

        modal.hide();

    }

    else {

        /*
         * If Bootstrap instance doesn't exist,
         * create one and immediately hide it.
         */

        const newModal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        newModal.hide();

    }

}


// ==========================================================
// FORCE CLOSE
// ==========================================================
//
// Emergency fallback if Bootstrap instance
// is not responding.
//

function forceCloseCategoryModal() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        return;

    }


    // Remove Bootstrap state

    modalElement.classList.remove(
        "show"
    );


    modalElement.style.display =
        "none";


    modalElement.setAttribute(
        "aria-hidden",
        "true"
    );


    modalElement.removeAttribute(
        "aria-modal"
    );


    modalElement.removeAttribute(
        "role"
    );


    // Remove body state

    document.body.classList.remove(
        "modal-open"
    );


    document.body.style.removeProperty(
        "padding-right"
    );


    // Remove backdrop

    document
        .querySelectorAll(
            ".modal-backdrop"
        )
        .forEach(
            function(backdrop) {

                backdrop.remove();

            }
        );


    // Clear edit state

    window.editingCategoryId =
        null;


    console.log(
        "Category Modal force closed."
    );

}


// ==========================================================
// DOCUMENT EVENT DELEGATION
// ==========================================================
//
// IMPORTANT:
// The Category page is dynamically loaded.
// Therefore we listen on document instead of
// attaching only once to #categoryModal.
//

function initializeCategoryDocumentEvents() {

    if (
        window.categoryDocumentEventsInitialized
    ) {

        return;

    }


    window.categoryDocumentEventsInitialized =
        true;


    // ======================================================
    // CLICK
    // ======================================================

    document.addEventListener(
        "click",
        function(event) {

            const target =
                event.target;


            // ==================================================
            // X BUTTON
            // ==================================================

            const closeButton =
                target.closest(
                    "#categoryModal .btn-close"
                );


            if (closeButton) {

                event.preventDefault();

                event.stopPropagation();

                console.log(
                    "CATEGORY X BUTTON CLICKED"
                );


                closeCategoryModal();

                return;

            }


            // ==================================================
            // CANCEL BUTTON
            // ==================================================

            const cancelButton =
                target.closest(
                    "#categoryModal #categoryCancelBtn, " +
                    "#categoryModal .category-cancel-btn"
                );


            if (cancelButton) {

                event.preventDefault();

                event.stopPropagation();

                console.log(
                    "CATEGORY CANCEL BUTTON CLICKED"
                );


                closeCategoryModal();

                return;

            }


            // ==================================================
            // ADD CATEGORY
            // ==================================================

            const addButton =
                target.closest(
                    "#btnAddCategory, " +
                    ".btn-add-category"
                );


            if (addButton) {

                event.preventDefault();

                event.stopPropagation();

                console.log(
                    "CATEGORY ADD BUTTON CLICKED"
                );


                openAddCategory();

                return;

            }

        },
        true
    );


    // ======================================================
    // ESC KEY
    // ======================================================

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            const modalElement =
                getCategoryModalElement();


            if (!modalElement) {

                return;

            }


            if (
                !modalElement.classList.contains(
                    "show"
                )
            ) {

                return;

            }


            console.log(
                "CATEGORY ESC PRESSED"
            );


            closeCategoryModal();

        },
        true
    );


    console.log(
        "Category document events initialized."
    );

}


// ==========================================================
// BOOTSTRAP MODAL EVENTS
// ==========================================================

function initializeCategoryBootstrapEvents() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        return false;

    }


    if (
        modalElement.dataset.categoryBootstrapEvents ===
        "true"
    ) {

        return true;

    }


    modalElement.dataset.categoryBootstrapEvents =
        "true";


    // ======================================================
    // SHOWN
    // ======================================================

    modalElement.addEventListener(
        "shown.bs.modal",
        function() {

            console.log(
                "Category modal shown."
            );


            if (
                typeof updateCategoryIconPreview ===
                "function"
            ) {

                updateCategoryIconPreview();

            }

        }
    );


    // ======================================================
    // HIDDEN
    // ======================================================

    modalElement.addEventListener(
        "hidden.bs.modal",
        function() {

            console.log(
                "Category modal hidden."
            );


            window.editingCategoryId =
                null;


            if (
                typeof resetCategoryForm ===
                "function"
            ) {

                resetCategoryForm();

            }

        }
    );


    return true;

}


// ==========================================================
// INITIALIZE MODAL
// ==========================================================

function initializeCategoryModal() {

    console.log(
        "Initializing Category Modal..."
    );


    initializeCategoryDocumentEvents();


    /*
     * The page is dynamically loaded.
     * If modal already exists, initialize
     * Bootstrap events immediately.
     */

    initializeCategoryBootstrapEvents();


    console.log(
        "PAPPRITO Category Modal Engine V3 ready."
    );

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.getCategoryModalElement =
    getCategoryModalElement;


window.getCategoryModalInstance =
    getCategoryModalInstance;


window.openAddCategory =
    openAddCategory;


window.closeCategoryModal =
    closeCategoryModal;


window.forceCloseCategoryModal =
    forceCloseCategoryModal;


window.initializeCategoryModal =
    initializeCategoryModal;


// ==========================================================
// AUTO INITIALIZE
// ==========================================================

initializeCategoryModal();


// ==========================================================
// PAGE LOAD WATCHER
// ==========================================================
//
// Since categories.html is inserted dynamically,
// watch for #categoryModal to appear.
//

if (
    typeof MutationObserver !==
    "undefined"
) {

    const observer =
        new MutationObserver(
            function() {

                const modal =
                    getCategoryModalElement();


                if (modal) {

                    initializeCategoryBootstrapEvents();

                }

            }
        );


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

}


// ==========================================================
// READY
// ==========================================================

console.log(
    "PAPPRITO Category Modal Engine V3 loaded."
);
