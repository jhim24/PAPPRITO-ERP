// ==========================================================
// PAPPRITO ERP
// CATEGORY MODAL ENGINE V1
//
// FUNCTIONS:
// - Open Add Category
// - Close Category Modal
// - X Button
// - Cancel Button
// - Reset Form
// - Edit Modal Support
// ==========================================================

"use strict";


// ==========================================================
// GET MODAL
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

    if (
        !modalElement ||
        typeof bootstrap === "undefined"
    ) {

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


    // Make sure edit mode is cleared

    window.editingCategoryId =
        null;


    // Reset form

    if (
        typeof resetCategoryForm ===
        "function"
    ) {

        resetCategoryForm();

    }


    // Change title

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


    // Change button

    const buttonText =
        document.getElementById(
            "btnSaveText"
        );


    if (buttonText) {

        buttonText.textContent =
            "Save Category";

    }


    // Open modal

    const modal =
        getCategoryModalInstance();


    if (modal) {

        modal.show();

    }

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


    if (modal) {

        modal.hide();

    }


    // Clear edit state

    window.editingCategoryId =
        null;


    // Reset after animation

    setTimeout(
        function () {

            if (
                typeof resetCategoryForm ===
                "function"
            ) {

                resetCategoryForm();

            }

        },
        250
    );

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
    // CLOSE BUTTON
    // ======================================================

    const closeButtons =
        modalElement.querySelectorAll(
            ".btn-close, [data-bs-dismiss='modal']"
        );


    closeButtons.forEach(
        function(button) {

            if (
                button.dataset.categoryCloseInitialized ===
                "true"
            ) {

                return;

            }


            button.dataset.categoryCloseInitialized =
                "true";


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    closeCategoryModal();

                }
            );

        }
    );


    // ======================================================
    // CANCEL BUTTON
    // ======================================================

    const cancelButtons =
        modalElement.querySelectorAll(
            ".category-cancel-btn, .btn-secondary"
        );


    cancelButtons.forEach(
        function(button) {

            if (
                button.id ===
                "btnSaveCategory"
            ) {

                return;

            }


            if (
                button.dataset.categoryCancelInitialized ===
                "true"
            ) {

                return;

            }


            button.dataset.categoryCancelInitialized =
                "true";


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    closeCategoryModal();

                }
            );

        }
    );


    console.log(
        "Category modal buttons initialized."
    );

}


// ==========================================================
// MODAL HIDDEN EVENT
// ==========================================================

function initializeCategoryModalEvents() {

    const modalElement =
        getCategoryModalElement();


    if (!modalElement) {

        return;

    }


    if (
        modalElement.dataset.eventsInitialized ===
        "true"
    ) {

        return;

    }


    modalElement.dataset.eventsInitialized =
        "true";


    modalElement.addEventListener(
        "hidden.bs.modal",
        function() {

            console.log(
                "Category modal closed."
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


    modalElement.addEventListener(
        "shown.bs.modal",
        function() {

            console.log(
                "Category modal opened."
            );


            // Make sure icon preview is correct

            if (
                typeof updateCategoryIconPreview ===
                "function"
            ) {

                updateCategoryIconPreview();

            }

        }
    );

}


// ==========================================================
// PREVENT MODAL BUTTONS FROM SUBMITTING
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

}


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeCategoryModal() {

    initializeCategoryCloseButtons();

    initializeCategoryModalEvents();

    initializeCategoryButtonTypes();

    console.log(
        "PAPPRITO Category Modal Engine V1 ready."
    );

}


// ==========================================================
// GLOBAL
// ==========================================================

window.openAddCategory =
    openAddCategory;

window.closeCategoryModal =
    closeCategoryModal;

window.initializeCategoryModal =
    initializeCategoryModal;


// ==========================================================
// AUTO START
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCategoryModal,
        {
            once: true
        }
    );

}

else {

    initializeCategoryModal();

}
