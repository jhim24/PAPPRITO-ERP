// ==========================================================
// PAPPRITO ERP
// CATEGORY EDIT ENGINE V3
// File : assets/js/category/category-edit.js
//
// FUNCTIONS:
// - Edit Category
// - Load Category Data
// - Populate Modal
// - Preserve Category ID
// - Open Edit Modal
// - Cancel Edit
// - Check Edit Mode
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL EDIT STATE
// ==========================================================

window.editingCategoryId =
    window.editingCategoryId || null;


// ==========================================================
// EDIT CATEGORY
// ==========================================================

async function editCategory(categoryId) {

    if (!categoryId) {

        console.error(
            "Category ID is missing."
        );

        alert(
            "Unable to edit category. Category ID is missing."
        );

        return;

    }


    // ======================================================
    // FIREBASE CHECK
    // ======================================================

    if (
        typeof db === "undefined" ||
        !db
    ) {

        console.error(
            "Firebase Database is not initialized."
        );

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        console.log(
            "Loading category:",
            categoryId
        );


        // ==================================================
        // LOAD CATEGORY
        // ==================================================

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

            alert(
                "Category not found."
            );

            return;

        }


        const category =
            snapshot.val() || {};


        // ==================================================
        // SET EDIT MODE
        // ==================================================

        window.editingCategoryId =
            categoryId;


        // ==================================================
        // CATEGORY CODE
        // ==================================================

        const code =
            document.getElementById(
                "categoryCode"
            );


        if (code) {

            code.value =
                category.code || "";

        }


        // ==================================================
        // CATEGORY NAME
        // ==================================================

        const name =
            document.getElementById(
                "categoryName"
            );


        if (name) {

            name.value =
                category.name || "";

        }


        // ==================================================
        // DESCRIPTION
        // ==================================================

        const description =
            document.getElementById(
                "categoryDescription"
            );


        if (description) {

            description.value =
                category.description || "";

        }


        // ==================================================
        // ICON
        // ==================================================

        const icon =
            document.getElementById(
                "categoryIcon"
            );


        if (icon) {

            icon.value =
                category.icon ||
                "fa-utensils";

        }


        // ==================================================
        // COLOR
        // ==================================================

        const color =
            document.getElementById(
                "categoryColor"
            );


        if (color) {

            color.value =
                category.color ||
                "#C8102E";

        }


        // ==================================================
        // DISPLAY ORDER
        // ==================================================

        const displayOrder =
            document.getElementById(
                "displayOrder"
            );


        if (displayOrder) {

            displayOrder.value =
                Number(
                    category.displayOrder || 1
                );

        }


        // ==================================================
        // STATUS
        // ==================================================

        const status =
            document.getElementById(
                "categoryStatus"
            );


        if (status) {

            status.value =
                category.status ||
                "Active";

        }


        // ==================================================
        // UPDATE ICON PREVIEW
        // ==================================================

        if (
            typeof updateCategoryIconPreview ===
            "function"
        ) {

            updateCategoryIconPreview();

        }


        // ==================================================
        // UPDATE MODAL TITLE
        // ==================================================

        const title =
            document.getElementById(
                "categoryModalTitle"
            );


        if (title) {

            title.innerHTML = `

                <i class="fa-solid fa-pen-to-square"></i>

                Edit Category

            `;

        }


        // ==================================================
        // UPDATE SAVE BUTTON TEXT
        // ==================================================

        const buttonText =
            document.getElementById(
                "btnSaveText"
            );


        if (buttonText) {

            buttonText.textContent =
                "Update Category";

        }


        // ==================================================
        // OPEN MODAL
        // ==================================================

        const modalElement =
            document.getElementById(
                "categoryModal"
            );


        if (!modalElement) {

            console.error(
                "Category modal not found."
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

            alert(
                "Bootstrap is not loaded."
            );

            return;

        }


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();


        console.log(
            "Category loaded for editing:",
            category
        );

    }

    catch (error) {

        console.error(
            "Edit Category Error:",
            error
        );


        alert(
            "Unable to load category.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

}


// ==========================================================
// CANCEL CATEGORY EDIT
// ==========================================================

function cancelCategoryEdit() {

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
    // CLOSE MODAL
    // ======================================================

    const modalElement =
        document.getElementById(
            "categoryModal"
        );


    if (
        modalElement &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal
                .getInstance(
                    modalElement
                );


        if (modal) {

            modal.hide();

        }

    }

}


// ==========================================================
// CHECK EDIT MODE
// ==========================================================

function isCategoryEditMode() {

    return Boolean(
        window.editingCategoryId
    );

}


// ==========================================================
// GET EDITING CATEGORY ID
// ==========================================================

function getEditingCategoryId() {

    return (
        window.editingCategoryId ||
        null
    );

}


// ==========================================================
// EXIT EDIT MODE
// ==========================================================

function exitCategoryEditMode() {

    window.editingCategoryId =
        null;


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


    const buttonText =
        document.getElementById(
            "btnSaveText"
        );


    if (buttonText) {

        buttonText.textContent =
            "Save Category";

    }

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.editCategory =
    editCategory;

window.cancelCategoryEdit =
    cancelCategoryEdit;

window.isCategoryEditMode =
    isCategoryEditMode;

window.getEditingCategoryId =
    getEditingCategoryId;

window.exitCategoryEditMode =
    exitCategoryEditMode;


// ==========================================================
// READY
// ==========================================================

console.log(
    "PAPPRITO Category Edit Engine V3 loaded."
);
