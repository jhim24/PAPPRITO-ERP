// ==========================================================
// PAPPRITO ERP
// PRODUCT SAVE / UPDATE ENGINE
// File : assets/js/products/product-save.js
// Description : Create and Update Product Master
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL EDIT STATE
// ==========================================================

let editingProductId = null;


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeProductSave() {

    const btnSave =
        document.getElementById("btnSaveProduct");

    if (!btnSave) {

        console.warn(
            "Product Save button not found."
        );

        return;

    }

    if (
        btnSave.dataset.saveInitialized === "true"
    ) {

        return;

    }

    btnSave.dataset.saveInitialized =
        "true";

    btnSave.addEventListener(
        "click",
        saveProduct
    );

    console.log(
        "Product Save Engine initialized."
    );

}


// ==========================================================
// SAVE / UPDATE PRODUCT
// ==========================================================

async function saveProduct() {

    const btnSave =
        document.getElementById(
            "btnSaveProduct"
        );

    const btnText =
        document.getElementById(
            "btnSaveProductText"
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
        // DISABLE BUTTON
        // ==================================================

        if (btnSave) {

            btnSave.disabled = true;

        }

        if (btnText) {

            btnText.textContent =
                editingProductId
                    ? "Updating..."
                    : "Saving...";

        }


        // ==================================================
        // FIELDS
        // ==================================================

        const codeInput =
            document.getElementById(
                "productCode"
            );

        const nameInput =
            document.getElementById(
                "productName"
            );

        const categoryInput =
            document.getElementById(
                "productCategory"
            );

        const descriptionInput =
            document.getElementById(
                "productDescription"
            );

        const costPriceInput =
            document.getElementById(
                "costPrice"
            );

        const sellingPriceInput =
            document.getElementById(
                "sellingPrice"
            );

        const openingStockInput =
            document.getElementById(
                "openingStock"
            );

        const currentStockInput =
            document.getElementById(
                "currentStock"
            );

        const reorderLevelInput =
            document.getElementById(
                "reorderLevel"
            );

        const unitInput =
            document.getElementById(
                "productUnit"
            );

        const statusInput =
            document.getElementById(
                "productStatus"
            );


        // ==================================================
        // REQUIRED
        // ==================================================

        if (!nameInput) {

            throw new Error(
                "Product Name field not found."
            );

        }

        if (!categoryInput) {

            throw new Error(
                "Product Category field not found."
            );

        }


        // ==================================================
        // VALUES
        // ==================================================

        const code =
            codeInput
                ? codeInput.value.trim()
                : "";

        const name =
            nameInput.value.trim();

        const categoryId =
            categoryInput.value.trim();

        const description =
            descriptionInput
                ? descriptionInput.value.trim()
                : "";

        const costPrice =
            Number(
                costPriceInput
                    ? costPriceInput.value
                    : 0
            ) || 0;

        const sellingPrice =
            Number(
                sellingPriceInput
                    ? sellingPriceInput.value
                    : 0
            ) || 0;

        const openingStock =
            Number(
                openingStockInput
                    ? openingStockInput.value
                    : 0
            ) || 0;

        const currentStock =
            Number(
                currentStockInput
                    ? currentStockInput.value
                    : 0
            ) || 0;

        const reorderLevel =
            Number(
                reorderLevelInput
                    ? reorderLevelInput.value
                    : 0
            ) || 0;

        const unit =
            unitInput
                ? unitInput.value
                : "Piece";

        const status =
            statusInput
                ? statusInput.value
                : "Active";


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!name) {

            alert(
                "Please enter Product Name."
            );

            nameInput.focus();

            return;

        }


        if (!categoryId) {

            alert(
                "Please select Product Category."
            );

            categoryInput.focus();

            return;

        }


        if (costPrice < 0) {

            alert(
                "Cost Price cannot be negative."
            );

            return;

        }


        if (sellingPrice < 0) {

            alert(
                "Selling Price cannot be negative."
            );

            return;

        }


        if (openingStock < 0) {

            alert(
                "Opening Stock cannot be negative."
            );

            return;

        }


        // ==================================================
        // CATEGORY NAME
        // ==================================================

        let categoryName = "";

        if (
            categoryInput.selectedIndex >= 0
        ) {

            const option =
                categoryInput.options[
                    categoryInput.selectedIndex
                ];

            if (option) {

                categoryName =
                    option.textContent.trim();

            }

        }


        // ==================================================
        // PRODUCT SETTINGS
        // ==================================================

        const showPOS =
            document.getElementById(
                "showPOS"
            )?.checked ?? true;

        const showKitchen =
            document.getElementById(
                "showKitchen"
            )?.checked ?? true;

        const showMenu =
            document.getElementById(
                "showMenu"
            )?.checked ?? true;

        const inventoryTracking =
            document.getElementById(
                "inventoryTracking"
            )?.checked ?? true;

        const featuredProduct =
            document.getElementById(
                "featuredProduct"
            )?.checked ?? false;

        const bestSeller =
            document.getElementById(
                "bestSeller"
            )?.checked ?? false;


        // ==================================================
        // IMAGE
        // ==================================================
        //
        // IMPORTANT:
        // We DO NOT upload to Firebase Storage here.
        //
        // This prevents:
        //
        // storage/retry-limit-exceeded
        //
        // from blocking Product Update.
        //
        // ==================================================

        let imageURL = "";


        // --------------------------------------------------
        // IMAGE URL FIELD
        // --------------------------------------------------

        const imageURLInput =
            document.getElementById(
                "productImageURL"
            );


        if (
            imageURLInput &&
            imageURLInput.value.trim() !== ""
        ) {

            imageURL =
                imageURLInput.value.trim();

        }


        // --------------------------------------------------
        // EXISTING IMAGE
        // --------------------------------------------------

        if (
            !imageURL &&
            typeof selectedProductImage !==
            "undefined"
        ) {

            // Only keep a real URL.
            // Do NOT save local blob/data
            // generated from file preview.

            if (
                selectedProductImage &&
                (
                    selectedProductImage.startsWith(
                        "http://"
                    )
                    ||
                    selectedProductImage.startsWith(
                        "https://"
                    )
                )
            ) {

                imageURL =
                    selectedProductImage;

            }

        }


        // ==================================================
        // IF EDITING
        // PRESERVE EXISTING IMAGE
        // ==================================================

        if (
            editingProductId &&
            !imageURL
        ) {

            const existingSnapshot =
                await db
                    .ref(
                        "products/" +
                        editingProductId
                    )
                    .once("value");


            if (
                existingSnapshot.exists()
            ) {

                const existingProduct =
                    existingSnapshot.val() || {};


                imageURL =
                    existingProduct.image ||
                    "";

            }

        }


        // ==================================================
        // PRODUCT DATA
        // ==================================================

        const productData = {

            code:
                code,

            name:
                name,

            categoryId:
                categoryId,

            categoryName:
                categoryName,

            description:
                description,

            costPrice:
                costPrice,

            sellingPrice:
                sellingPrice,

            openingStock:
                openingStock,

            currentStock:
                currentStock,

            reorderLevel:
                reorderLevel,

            unit:
                unit,

            image:
                imageURL,

            showPOS:
                showPOS,

            showKitchen:
                showKitchen,

            showMenu:
                showMenu,

            inventoryTracking:
                inventoryTracking,

            featuredProduct:
                featuredProduct,

            bestSeller:
                bestSeller,

            status:
                status,

            updatedAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        };


        // ==================================================
        // UPDATE EXISTING
        // ==================================================

        if (editingProductId) {

            console.log(
                "Updating product:",
                editingProductId
            );


            await db
                .ref(
                    "products/" +
                    editingProductId
                )
                .update(
                    productData
                );


            console.log(
                "Product updated successfully."
            );


            alert(
                "Product updated successfully."
            );

        }


        // ==================================================
        // CREATE NEW
        // ==================================================

        else {

            productData.createdAt =
                firebase.database
                    .ServerValue
                    .TIMESTAMP;


            console.log(
                "Creating new product..."
            );


            await db
                .ref("products")
                .push(
                    productData
                );


            console.log(
                "Product created successfully."
            );


            alert(
                "Product saved successfully."
            );

        }


        // ==================================================
        // REFRESH PRODUCT TABLE
        // ==================================================

        if (
            typeof startProductListener ===
            "function"
        ) {

            // Listener already exists.
            // No need to create another listener.

            renderProductTable();

            updateProductCounter();

        }


        // ==================================================
        // RESET FORM
        // ==================================================

        resetProductForm();


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        const modalElement =
            document.getElementById(
                "productModal"
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

    catch (error) {

        console.error(
            "Product Save / Update Error:",
            error
        );


        alert(
            "Unable to save/update product.\n\n" +
            error.message
        );

    }

    finally {

        if (btnSave) {

            btnSave.disabled =
                false;

        }


        if (btnText) {

            btnText.textContent =
                editingProductId
                    ? "Update Product"
                    : "Save Product";

        }

    }

}


// ==========================================================
// RESET PRODUCT FORM
// ==========================================================

function resetProductForm() {

    editingProductId =
        null;


    // ======================================================
    // IMAGE STATE
    // ======================================================

    if (
        typeof clearProductImageState ===
        "function"
    ) {

        clearProductImageState();

    }
    else {

        if (
            typeof selectedProductImage !==
            "undefined"
        ) {

            selectedProductImage =
                "";

        }

        if (
            typeof selectedProductFile !==
            "undefined"
        ) {

            selectedProductFile =
                null;

        }

    }


    // ======================================================
    // TEXT
    // ======================================================

    const productName =
        document.getElementById(
            "productName"
        );

    if (productName) {

        productName.value =
            "";

    }


    const description =
        document.getElementById(
            "productDescription"
        );

    if (description) {

        description.value =
            "";

    }


    // ======================================================
    // CODE
    // ======================================================

    const code =
        document.getElementById(
            "productCode"
        );

    if (code) {

        code.value =
            "";

    }


    // ======================================================
    // CATEGORY
    // ======================================================

    const category =
        document.getElementById(
            "productCategory"
        );

    if (category) {

        category.value =
            "";

    }


    // ======================================================
    // NUMERIC
    // ======================================================

    const fields = {

        costPrice:
            "0",

        sellingPrice:
            "0",

        openingStock:
            "0",

        currentStock:
            "0",

        reorderLevel:
            "10"

    };


    Object.keys(fields)
        .forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.value =
                        fields[id];

                }

            }
        );


    // ======================================================
    // UNIT
    // ======================================================

    const unit =
        document.getElementById(
            "productUnit"
        );

    if (unit) {

        unit.value =
            "Piece";

    }


    // ======================================================
    // STATUS
    // ======================================================

    const status =
        document.getElementById(
            "productStatus"
        );

    if (status) {

        status.value =
            "Active";

    }


    // ======================================================
    // CHECKBOXES
    // ======================================================

    const checkboxDefaults = {

        showPOS:
            true,

        showKitchen:
            true,

        showMenu:
            true,

        inventoryTracking:
            true,

        featuredProduct:
            false,

        bestSeller:
            false

    };


    Object.keys(
        checkboxDefaults
    )
        .forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.checked =
                        checkboxDefaults[id];

                }

            }
        );


    // ======================================================
    // BUTTON TEXT
    // ======================================================

    const btnText =
        document.getElementById(
            "btnSaveProductText"
        );


    if (btnText) {

        btnText.textContent =
            "Save Product";

    }


    // ======================================================
    // MODAL TITLE
    // ======================================================

    const modalTitle =
        document.getElementById(
            "productModalTitle"
        );


    if (modalTitle) {

        modalTitle.innerHTML = `

            <i class="fa-solid fa-box-open"></i>

            Add Product

        `;

    }


    // ======================================================
    // GENERATE NEW CODE
    // ======================================================

    if (
        typeof generateProductCode ===
        "function"
    ) {

        generateProductCode();

    }

}
