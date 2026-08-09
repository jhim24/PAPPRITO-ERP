// ==========================================================
// PAPPRITO ERP
// CATEGORY SAVE / UPDATE ENGINE V2
// File: assets/js/category/category-save.js
//
// INTEGRATED WITH:
// - Category Master
// - Product Master
// - POS
// - Online Menu
//
// Firebase:
// categories/{categoryId}
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL EDIT STATE
// ==========================================================

let editingCategoryId =
    null;


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeCategorySave() {

    const button =
        document.getElementById(
            "btnSaveCategory"
        );


    if (!button) {

        console.warn(
            "Category Save button not found."
        );

        return;

    }


    // Prevent duplicate listeners

    if (
        button.dataset.initialized ===
        "true"
    ) {

        return;

    }


    button.dataset.initialized =
        "true";


    button.addEventListener(
        "click",
        saveCategory
    );


    console.log(
        "Category Save Engine V2 initialized."
    );

}


// ==========================================================
// SAVE / UPDATE CATEGORY
// ==========================================================

async function saveCategory() {

    const button =
        document.getElementById(
            "btnSaveCategory"
        );


    const buttonText =
        document.getElementById(
            "btnSaveText"
        );


    const isUpdate =
        Boolean(
            editingCategoryId
        );


    try {

        // ==================================================
        // FIREBASE CHECK
        // ==================================================

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        // ==================================================
        // FORM VALUES
        // ==================================================

        const codeInput =
            document.getElementById(
                "categoryCode"
            );


        const nameInput =
            document.getElementById(
                "categoryName"
            );


        const descriptionInput =
            document.getElementById(
                "categoryDescription"
            );


        const iconInput =
            document.getElementById(
                "categoryIcon"
            );


        const colorInput =
            document.getElementById(
                "categoryColor"
            );


        const orderInput =
            document.getElementById(
                "displayOrder"
            );


        const statusInput =
            document.getElementById(
                "categoryStatus"
            );


        const code =
            codeInput
                ?.value
                .trim() || "";


        const name =
            nameInput
                ?.value
                .trim() || "";


        const description =
            descriptionInput
                ?.value
                .trim() || "";


        const icon =
            iconInput
                ?.value
                .trim()
                .replace(/^fa-solid\s+/i, "")
                || "fa-utensils";


        const color =
            colorInput
                ?.value || "#C8102E";


        const displayOrder =
            Number(
                orderInput
                    ?.value || 1
            );


        const status =
            statusInput
                ?.value || "Active";


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!name) {

            alert(
                "Please enter Category Name."
            );

            nameInput?.focus();

            return;

        }


        if (
            !Number.isFinite(
                displayOrder
            )
        ) {

            alert(
                "Invalid Display Order."
            );

            orderInput?.focus();

            return;

        }


        if (
            status !== "Active" &&
            status !== "Inactive"
        ) {

            alert(
                "Invalid Category Status."
            );

            return;

        }


        // ==================================================
        // BUTTON STATE
        // ==================================================

        if (button) {

            button.disabled =
                true;

        }


        if (buttonText) {

            buttonText.textContent =
                isUpdate
                    ? "Updating..."
                    : "Saving...";

        }


        // ==================================================
        // CHECK DUPLICATE CATEGORY NAME
        // ==================================================

        const categoriesSnapshot =
            await db
                .ref("categories")
                .once("value");


        let duplicateId =
            null;


        if (
            categoriesSnapshot.exists()
        ) {

            categoriesSnapshot.forEach(
                function(child) {

                    // Don't compare category
                    // against itself during update.

                    if (
                        isUpdate &&
                        child.key ===
                        editingCategoryId
                    ) {

                        return;

                    }


                    const existing =
                        child.val() || {};


                    const existingName =
                        String(
                            existing.name || ""
                        )
                        .trim()
                        .toLowerCase();


                    if (
                        existingName ===
                        name.toLowerCase()
                    ) {

                        duplicateId =
                            child.key;

                    }

                }
            );

        }


        if (duplicateId) {

            alert(
                "Category already exists.\n\n" +
                "Please use a different Category Name."
            );

            return;

        }


        // ==================================================
        // GET / CREATE CATEGORY REFERENCE
        // ==================================================

        let categoryRef;


        if (isUpdate) {

            categoryRef =
                db.ref(
                    "categories/" +
                    editingCategoryId
                );

        }

        else {

            categoryRef =
                db
                    .ref("categories")
                    .push();

        }


        const categoryId =
            categoryRef.key;


        // ==================================================
        // EXISTING PRODUCT COUNT
        // ==================================================

        let productCount =
            0;


        if (isUpdate) {

            const existingSnapshot =
                await categoryRef.once(
                    "value"
                );


            if (
                existingSnapshot.exists()
            ) {

                const existingCategory =
                    existingSnapshot.val() ||
                    {};


                productCount =
                    Number(
                        existingCategory.productCount ||
                        0
                    );

            }

        }


        // ==================================================
        // CATEGORY DATA
        // ==================================================

        const categoryData = {

            // ----------------------------------------------
            // PRIMARY IDENTIFIER
            // ----------------------------------------------

            code:
                code,

            name:
                name,

            // ----------------------------------------------
            // DESCRIPTION
            // ----------------------------------------------

            description:
                description,

            // ----------------------------------------------
            // UI
            // ----------------------------------------------

            icon:
                icon,

            color:
                color,

            // ----------------------------------------------
            // SORTING
            // ----------------------------------------------

            displayOrder:
                displayOrder,

            // ----------------------------------------------
            // STATUS
            // ----------------------------------------------

            status:
                status,

            // ----------------------------------------------
            // PRODUCT COUNT
            // ----------------------------------------------

            productCount:
                productCount,

            // ----------------------------------------------
            // UPDATED
            // ----------------------------------------------

            updatedAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        };


        // ==================================================
        // CREATED AT
        // ==================================================

        if (!isUpdate) {

            categoryData.createdAt =
                firebase.database
                    .ServerValue
                    .TIMESTAMP;

        }


        // ==================================================
        // SAVE CATEGORY
        // ==================================================

        console.log(
            isUpdate
                ? "Updating category..."
                : "Creating category..."
        );


        await categoryRef.set(
            categoryData
        );


        console.log(
            "Category saved:",
            categoryId
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            isUpdate
                ? "Category updated successfully."
                : "Category created successfully."
        );


        // ==================================================
        // REFRESH CATEGORY LIST
        // ==================================================

        if (
            typeof loadCategories ===
            "function"
        ) {

            /*
             * loadCategories() already uses
             * Firebase realtime listener.
             *
             * Calling it here is harmless for
             * simple page refresh, but avoid
             * creating duplicate listeners.
             */

            const table =
                document.getElementById(
                    "categoryTable"
                );


            if (
                table &&
                !table.dataset.listenerActive
            ) {

                loadCategories();

            }

        }


        // ==================================================
        // REFRESH PRODUCT CATEGORY DROPDOWN
        // ==================================================

        if (
            typeof refreshCategoryDropdown ===
            "function"
        ) {

            refreshCategoryDropdown();

        }

        else if (
            typeof loadAllCategoryDropdowns ===
            "function"
        ) {

            loadAllCategoryDropdowns();

        }


        // ==================================================
        // RESET
        // ==================================================

        resetCategoryForm();


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        closeCategoryModal();


    }

    catch (error) {

        console.error(
            "CATEGORY SAVE ERROR:",
            error
        );


        alert(
            "Unable to save/update category.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

        }


        if (buttonText) {

            buttonText.textContent =
                "Save Category";

        }

    }

}


// ==========================================================
// RESET CATEGORY FORM
// ==========================================================

function resetCategoryForm() {

    editingCategoryId =
        null;


    // ======================================================
    // CODE
    // ======================================================

    const code =
        document.getElementById(
            "categoryCode"
        );


    if (code) {

        code.value =
            "";

    }


    // ======================================================
    // NAME
    // ======================================================

    const name =
        document.getElementById(
            "categoryName"
        );


    if (name) {

        name.value =
            "";

    }


    // ======================================================
    // DESCRIPTION
    // ======================================================

    const description =
        document.getElementById(
            "categoryDescription"
        );


    if (description) {

        description.value =
            "";

    }


    // ======================================================
    // ICON
    // ======================================================

    const icon =
        document.getElementById(
            "categoryIcon"
        );


    if (icon) {

        icon.value =
            "fa-utensils";

    }


    // ======================================================
    // COLOR
    // ======================================================

    const color =
        document.getElementById(
            "categoryColor"
        );


    if (color) {

        color.value =
            "#C8102E";

    }


    // ======================================================
    // DISPLAY ORDER
    // ======================================================

    const displayOrder =
        document.getElementById(
            "displayOrder"
        );


    if (displayOrder) {

        displayOrder.value =
            "1";

    }


    // ======================================================
    // STATUS
    // ======================================================

    const status =
        document.getElementById(
            "categoryStatus"
        );


    if (status) {

        status.value =
            "Active";

    }


    // ======================================================
    // ICON PREVIEW
    // ======================================================

    updateCategoryIconPreview();


    // ======================================================
    // MODAL TITLE
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
    // BUTTON TEXT
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
    // GENERATE CODE
    // ======================================================

    generateCategoryCode();

}


// ==========================================================
// GENERATE CATEGORY CODE
// ==========================================================

async function generateCategoryCode() {

    const codeInput =
        document.getElementById(
            "categoryCode"
        );


    if (!codeInput) {

        return;

    }


    // Don't overwrite code while editing.

    if (
        editingCategoryId
    ) {

        return;

    }


    try {

        const snapshot =
            await db
                .ref("categories")
                .once("value");


        let maxNumber =
            0;


        if (
            snapshot.exists()
        ) {

            snapshot.forEach(
                function(child) {

                    const category =
                        child.val() || {};


                    const code =
                        String(
                            category.code || ""
                        );


                    const match =
                        code.match(
                            /CAT[-_ ]?(\d+)/i
                        );


                    if (match) {

                        const number =
                            Number(
                                match[1]
                            );


                        if (
                            number >
                            maxNumber
                        ) {

                            maxNumber =
                                number;

                        }

                    }

                }
            );

        }


        const nextNumber =
            maxNumber + 1;


        codeInput.value =
            "CAT-" +
            String(
                nextNumber
            )
            .padStart(
                4,
                "0"
            );

    }

    catch (error) {

        console.error(
            "Category Code Error:",
            error
        );


        codeInput.value =
            "CAT-" +
            Date.now()
                .toString()
                .slice(-4);

    }

}


// ==========================================================
// ICON PREVIEW
// ==========================================================

function updateCategoryIconPreview() {

    const iconInput =
        document.getElementById(
            "categoryIcon"
        );


    const colorInput =
        document.getElementById(
            "categoryColor"
        );


    const preview =
        document.getElementById(
            "iconPreview"
        );


    if (!preview) {

        return;

    }


    let icon =
        iconInput
            ?.value
            .trim() ||
        "fa-utensils";


    // Remove fa-solid if user typed it.

    icon =
        icon.replace(
            /^fa-solid\s+/i,
            ""
        );


    const color =
        colorInput
            ?.value ||
        "#C8102E";


    preview.className =
        "fa-solid " +
        icon;


    preview.style.color =
        color;

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeCategoryModal() {

    const modalElement =
        document.getElementById(
            "categoryModal"
        );


    if (
        !modalElement ||
        typeof bootstrap ===
        "undefined"
    ) {

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

}


// ==========================================================
// OPEN ADD CATEGORY
// ==========================================================

function openAddCategory() {

    resetCategoryForm();


    const modalElement =
        document.getElementById(
            "categoryModal"
        );


    if (
        !modalElement ||
        typeof bootstrap ===
        "undefined"
    ) {

        return;

    }


    const modal =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    modal.show();

}


// ==========================================================
// LISTEN TO ICON / COLOR CHANGES
// ==========================================================

function initializeCategoryPreview() {

    const iconInput =
        document.getElementById(
            "categoryIcon"
        );


    const colorInput =
        document.getElementById(
            "categoryColor"
        );


    if (iconInput) {

        iconInput.addEventListener(
            "input",
            updateCategoryIconPreview
        );

    }


    if (colorInput) {

        colorInput.addEventListener(
            "input",
            updateCategoryIconPreview
        );

    }

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.editingCategoryId =
    editingCategoryId;

window.initializeCategorySave =
    initializeCategorySave;

window.saveCategory =
    saveCategory;

window.resetCategoryForm =
    resetCategoryForm;

window.generateCategoryCode =
    generateCategoryCode;

window.updateCategoryIconPreview =
    updateCategoryIconPreview;

window.closeCategoryModal =
    closeCategoryModal;

window.openAddCategory =
    openAddCategory;

window.initializeCategoryPreview =
    initializeCategoryPreview;


// ==========================================================
// AUTO INITIALIZE
// ==========================================================

function autoInitializeCategorySave() {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function() {

                initializeCategorySave();

                initializeCategoryPreview();

            },
            {
                once: true
            }
        );

    }

    else {

        initializeCategorySave();

        initializeCategoryPreview();

    }

}


autoInitializeCategorySave();


console.log(
    "PAPPRITO Category Save Engine V2 ready."
);
