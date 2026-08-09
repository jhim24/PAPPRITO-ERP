// ==========================================================
// PAPPRITO ERP
// CATEGORY EDIT ENGINE V2
// File : assets/js/category/category-edit.js
//
// FUNCTIONS:
// - Edit Category
// - Load Category Data
// - Populate Modal
// - Preserve Category ID
// - Update Category
// ==========================================================

"use strict";


// ==========================================================
// EDIT CATEGORY
// ==========================================================

async function editCategory(categoryId) {

    if (!categoryId) {

        console.error(
            "Category ID is missing."
        );

        return;

    }


    if (
        typeof db === "undefined" ||
        !db
    ) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        console.log(
            "Editing category:",
            categoryId
        );


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
        // SAVE EDIT ID
        // ==================================================

        editingCategoryId =
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
                    category.displayOrder ||
                    1
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
        // MODAL TITLE
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
        // SAVE BUTTON
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


        if (
            modalElement &&
            typeof bootstrap !==
            "undefined"
        ) {

            const modal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        modalElement
                    );


            modal.show();

        }


        console.log(
            "Category loaded for editing."
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
// CANCEL EDIT
// ==========================================================

function cancelCategoryEdit() {

    editingCategoryId =
        null;


    if (
        typeof resetCategoryForm ===
        "function"
    ) {

        resetCategoryForm();

    }


    if (
        typeof closeCategoryModal ===
        "function"
    ) {

        closeCategoryModal();

    }

}


// ==========================================================
// CHECK EDIT MODE
// ==========================================================

function isCategoryEditMode() {

    return Boolean(
        editingCategoryId
    );

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


console.log(
    "PAPPRITO Category Edit Engine V2 loaded."
);
