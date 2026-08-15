// ==========================================================
// PAPPRITO ERP
// CATEGORY SAVE / UPDATE ENGINE V3
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
//
// FUNCTIONS:
// - Add Category
// - Update Category
// - Duplicate Protection
// - Category Code Generator
// - Icon Preview
// - Modal Reset
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL EDIT STATE
// ==========================================================

window.editingCategoryId =
    window.editingCategoryId || null;


// ==========================================================
// INITIALIZE SAVE BUTTON
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
        "PAPPRITO Category Save Engine V3 initialized."
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


    // ======================================================
    // IMPORTANT
    // Always read the shared global edit ID.
    // ======================================================

    const editingId =
        window.editingCategoryId ||
        null;


    const isUpdate =
        Boolean(
            editingId
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
        // FORM ELEMENTS
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


        // ==================================================
        // FORM VALUES
        // ==================================================

        const code =
            codeInput?.value
                .trim() || "";


        const name =
            nameInput?.value
                .trim() || "";


        const description =
            descriptionInput?.value
                .trim() || "";


        let icon =
            iconInput?.value
                .trim() ||
            "fa-utensils";


        icon =
            icon.replace(
                /^fa-solid\s+/i,
                ""
            );


        const color =
            colorInput?.value ||
            "#C8102E";


        const displayOrder =
            Number(
                orderInput?.value || 1
            );


        const status =
            statusInput?.value ||
            "Active";


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
            displayOrder < 1
        ) {

            alert(
                "Display Order must be 1 or higher."
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
        // DISABLE SAVE BUTTON
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
        // LOAD EXISTING CATEGORIES
        // ==================================================

        const categoriesSnapshot =
            await db
                .ref("categories")
                .once("value");


        // ==================================================
        // DUPLICATE CATEGORY NAME CHECK
        // ==================================================

        let duplicateName =
            false;


        if (
            categoriesSnapshot.exists()
        ) {

            categoriesSnapshot.forEach(
                function(child) {

                    const childId =
                        child.key;


                    // Ignore itself during update

                    if (
                        isUpdate &&
                        childId ===
                        editingId
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

                        duplicateName =
                            true;

                    }

                }
            );

        }


        if (duplicateName) {

            alert(
                "Category already exists.\n\n" +
                "Please use a different Category Name."
            );

            nameInput?.focus();

            return;

        }


        // ==================================================
        // DUPLICATE CATEGORY CODE CHECK
        // ==================================================

        if (code) {

            let duplicateCode =
                false;


            if (
                categoriesSnapshot.exists()
            ) {

                categoriesSnapshot.forEach(
                    function(child) {

                        const childId =
                            child.key;


                        // Ignore itself during update

                        if (
                            isUpdate &&
                            childId ===
                            editingId
                        ) {

                            return;

                        }


                        const existing =
                            child.val() || {};


                        const existingCode =
                            String(
                                existing.code || ""
                            )
                            .trim()
                            .toLowerCase();


                        if (
                            existingCode &&
                            existingCode ===
                            code.toLowerCase()
                        ) {

                            duplicateCode =
                                true;

                        }

                    }
                );

            }


            if (duplicateCode) {

                alert(
                    "Category Code already exists.\n\n" +
                    "Please use a different Category Code."
                );

                codeInput?.focus();

                return;

            }

        }


        // ==================================================
        // CATEGORY REFERENCE
        // ==================================================

        let categoryRef;


        if (isUpdate) {

            categoryRef =
                db.ref(
                    "categories/" +
                    editingId
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
        // VERIFY UPDATE CATEGORY
        // ==================================================

        if (isUpdate) {

            const existingCategorySnapshot =
                await categoryRef.once(
                    "value"
                );


            if (
                !existingCategorySnapshot.exists()
            ) {

                throw new Error(
                    "The category you are trying to update no longer exists."
                );

            }

        }


        // ==================================================
        // PRESERVE PRODUCT COUNT
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

            id:
                categoryId,

            code:
                code,

            name:
                name,

            description:
                description,

            icon:
                icon,

            color:
                color,

            displayOrder:
                displayOrder,

            status:
                status,

            productCount:
                productCount,

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
        // SAVE TO FIREBASE
        // ==================================================

        console.log(
            isUpdate
                ? "Updating category:"
                : "Creating category:",
            categoryId
        );


        await categoryRef.set(
            categoryData
        );


        console.log(
            "Category saved successfully:",
            categoryId
        );


        // ==================================================
        // REFRESH CATEGORY LIST
        // ==================================================

        if (
            typeof loadCategories ===
            "function"
        ) {

            /*
             * loadCategories() should ideally
             * have one realtime listener only.
             *
             * Firebase will automatically update
             * the existing listener after .set().
             */

            const table =
                document.getElementById(
                    "categoryTable"
                );


            if (
                table &&
                table.innerHTML
            ) {

                // No manual reload needed
                // if realtime listener is active.

            }

        }


        // ==================================================
        // REFRESH PRODUCT DROPDOWNS
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
        // SUCCESS MESSAGE
        // ==================================================

        alert(
            isUpdate
                ? "Category updated successfully."
                : "Category created successfully."
        );


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

    // ======================================================
    // CLEAR EDIT MODE
    // ======================================================

    window.editingCategoryId =
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

    if (
        typeof updateCategoryIconPreview ===
        "function"
    ) {

        updateCategoryIconPreview();

    }


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
    // GENERATE NEW CODE
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


    // Don't overwrite edit code

    if (
        window.editingCategoryId
    ) {

        return;

    }


    if (
        typeof db === "undefined" ||
        !db
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


                    const categoryCode =
                        String(
                            category.code || ""
                        );


                    const match =
                        categoryCode.match(
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
            "Category Code Generation Error:",
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
        iconInput?.value
            .trim() ||
        "fa-utensils";


    icon =
        icon.replace(
            /^fa-solid\s+/i,
            ""
        );


    const color =
        colorInput?.value ||
        "#C8102E";


    preview.className =
        "fa-solid " +
        icon;


    preview.style.color =
        color;

}


// ==========================================================
// CLOSE CATEGORY MODAL
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
// CATEGORY PREVIEW INITIALIZER
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

        if (
            iconInput.dataset.previewInitialized !==
            "true"
        ) {

            iconInput.dataset.previewInitialized =
                "true";


            iconInput.addEventListener(
                "input",
                updateCategoryIconPreview
            );

        }

    }


    if (colorInput) {

        if (
            colorInput.dataset.previewInitialized !==
            "true"
        ) {

            colorInput.dataset.previewInitialized =
                "true";


            colorInput.addEventListener(
                "input",
                updateCategoryIconPreview
            );

        }

    }


    updateCategoryIconPreview();

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

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


// ==========================================================
// READY
// ==========================================================

console.log(
    "PAPPRITO Category Save Engine V3 ready."
);
