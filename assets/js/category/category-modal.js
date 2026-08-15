// ==========================================================
// PAPPRITO ERP
// CATEGORY MODAL ENGINE V2
// File:
// assets/js/category/category-modal.js
//
// FUNCTIONS:
// - Open Add Category
// - Close Category Modal
// - X Button
// - Cancel Button
// - Bootstrap Modal Events
// - Reset Form
// - Add Category Mode
// - Edit Category Support
// - Prevent Button Submit
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
// GET BOOTSTRAP MODAL INSTANCE
// ==========================================================

function getCategoryModalInstance() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        console.warn(
            "Category modal element not found."
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
            modalElement
        );

}


// ==========================================================
// OPEN ADD CATEGORY
// ==========================================================

function openAddCategory() {

    console.log(
        "Opening Add Category..."
    );


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
    // SAVE BUTTON TEXT
    // ======================================================

    const buttonText =
        document.getElementById(
            "btnSaveText"
        );


    if (buttonText) {

        buttonText.textContent =
            "Save Category";

    }


    // ======================================================
    // GENERATE CATEGORY CODE
    // ======================================================

    if (
        typeof generateCategoryCode ===
        "function"
    ) {

        generateCategoryCode();

    }


    // ======================================================
    // UPDATE ICON PREVIEW
    // ======================================================

    if (
        typeof updateCategoryIconPreview ===
        "function"
    ) {

        updateCategoryIconPreview();

    }


    // ======================================================
    // OPEN MODAL
    // ======================================================

    const modal =
        getCategoryModalInstance();


    if (!modal) {

        return;

    }


    modal.show();


    console.log(
        "Category modal opened."
    );

}


// ==========================================================
// CLOSE CATEGORY MODAL
// ==========================================================

function closeCategoryModal() {

    console.log(
        "Closing Category Modal..."
    );


    const modal =
        getCategoryModalInstance();


    if (!modal) {

        return;

    }


    modal.hide();

}


// ==========================================================
// X BUTTON
// ==========================================================

function initializeCategoryCloseButtons() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        console.warn(
            "Category modal not found."
        );

        return;

    }


    // ======================================================
    // X BUTTON
    // ======================================================

    const closeButton =
        modalElement.querySelector(
            ".btn-close"
        );


    if (closeButton) {

        if (
            closeButton.dataset.categoryCloseInitialized !==
            "true"
        ) {

            closeButton.dataset.categoryCloseInitialized =
                "true";


            closeButton.type =
                "button";


            closeButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    console.log(
                        "Category X button clicked."
                    );


                    closeCategoryModal();

                }
            );

        }

    }

    else {

        console.warn(
            "Category X button not found."
        );

    }


    // ======================================================
    // CANCEL BUTTON
    // ======================================================

    const cancelButton =
        modalElement.querySelector(
            "#categoryCancelBtn"
        );


    const fallbackCancel =
        modalElement.querySelector(
            ".category-cancel-btn"
        );


    const button =
        cancelButton ||
        fallbackCancel;


    if (button) {

        if (
            button.dataset.categoryCancelInitialized !==
            "true"
        ) {

            button.dataset.categoryCancelInitialized =
                "true";


            button.type =
                "button";


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    console.log(
                        "Category Cancel button clicked."
                    );


                    closeCategoryModal();

                }
            );

        }

    }

    else {

        console.warn(
            "Category Cancel button not found."
        );

    }


    console.log(
        "Category modal buttons initialized."
    );

}


// ==========================================================
// INITIALIZE BOOTSTRAP MODAL EVENTS
// ==========================================================

function initializeCategoryModalEvents() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        return;

    }


    // ======================================================
    // PREVENT DUPLICATE EVENTS
    // ======================================================

    if (
        modalElement.dataset.categoryEventsInitialized ===
        "true"
    ) {

        return;

    }


    modalElement.dataset.categoryEventsInitialized =
        "true";


    // ======================================================
    // MODAL SHOWN
    // ======================================================

    modalElement.addEventListener(
        "shown.bs.modal",
        function() {

            console.log(
                "Category modal opened."
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
    // MODAL HIDDEN
    // ======================================================

    modalElement.addEventListener(
        "hidden.bs.modal",
        function() {

            console.log(
                "Category modal closed."
            );


            // Clear edit mode

            window.editingCategoryId =
                null;


            // Reset form

            if (
                typeof resetCategoryForm ===
                "function"
            ) {

                resetCategoryForm();

            }

        }
    );


    console.log(
        "Category Bootstrap modal events initialized."
    );

}


// ==========================================================
// INITIALIZE BUTTON TYPES
// ==========================================================

function initializeCategoryButtonTypes() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        return;

    }


    const buttons =
        modalElement.querySelectorAll(
            "button"
        );


    buttons.forEach(
        function(button) {

            /*
             * If button has no type,
             * make it a normal button.
             *
             * This prevents accidental
             * form submission.
             */

            if (
                !button.hasAttribute(
                    "type"
                )
            ) {

                button.setAttribute(
                    "type",
                    "button"
                );

            }

        }
    );


    console.log(
        "Category button types initialized."
    );

}


// ==========================================================
// ADD CATEGORY BUTTON
// ==========================================================
//
// Supports buttons such as:
//
// onclick="openAddCategory()"
//
// or:
//
// onclick="openAddCategory(); return false;"
//

function initializeAddCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            "#btnAddCategory, .btn-add-category"
        );


    buttons.forEach(
        function(button) {

            if (
                button.dataset.addCategoryInitialized ===
                "true"
            ) {

                return;

            }


            button.dataset.addCategoryInitialized =
                "true";


            button.type =
                "button";


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    openAddCategory();

                }
            );

        }
    );

}


// ==========================================================
// ESCAPE KEY SUPPORT
// ==========================================================

function initializeCategoryEscapeSupport() {

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
                "Escape pressed. Closing Category Modal."
            );


            closeCategoryModal();

        }
    );

}


// ==========================================================
// BACKDROP CLICK SUPPORT
// ==========================================================

function initializeCategoryBackdropSupport() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        return;

    }


    modalElement.addEventListener(
        "click",
        function(event) {

            /*
             * Only close when the actual
             * modal container is clicked.
             *
             * Do NOT close when clicking
             * inside modal-content.
             */

            if (
                event.target ===
                modalElement
            ) {

                console.log(
                    "Category backdrop clicked."
                );


                closeCategoryModal();

            }

        }
    );

}


// ==========================================================
// FULL INITIALIZATION
// ==========================================================

function initializeCategoryModal() {

    console.log(
        "Initializing PAPPRITO Category Modal..."
    );


    initializeCategoryCloseButtons();

    initializeCategoryModalEvents();

    initializeCategoryButtonTypes();

    initializeAddCategoryButtons();

    initializeCategoryEscapeSupport();

    initializeCategoryBackdropSupport();


    console.log(
        "PAPPRITO Category Modal Engine V2 ready."
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


window.initializeCategoryModal =
    initializeCategoryModal;


// ==========================================================
// AUTO INITIALIZATION
// ==========================================================

function startCategoryModalEngine() {

    /*
     * Important:
     * The Category HTML is loaded dynamically
     * by app.js.
     *
     * Therefore, if the modal does not exist
     * yet, wait for the page loader.
     */

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        console.log(
            "Category modal not available yet."
        );

        return;

    }


    initializeCategoryModal();

}


// ==========================================================
// DOM READY
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startCategoryModalEngine,
        {
            once: true
        }
    );

}

else {

    startCategoryModalEngine();

}


// ==========================================================
// READY MESSAGE
// ==========================================================

console.log(
    "PAPPRITO Category Modal Engine V2 loaded."
);
