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
// INITIALIZE PRODUCT SAVE
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

    // Prevent duplicate event listener

    if (
        btnSave.dataset.saveInitialized === "true"
    ) {

        return;

    }

    btnSave.dataset.saveInitialized = "true";

    btnSave.addEventListener(
        "click",
        saveProduct
    );

    console.log(
        "Product Save Engine initialized."
    );

}


// ==========================================================
// SAVE PRODUCT
// ==========================================================

async function saveProduct() {

    const btnSave =
        document.getElementById("btnSaveProduct");

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
        // GET FORM ELEMENTS
        // ==================================================

        const codeInput =
            document.getElementById("productCode");

        const nameInput =
            document.getElementById("productName");

        const categoryInput =
            document.getElementById(
                "productCategory"
            );

        const descriptionInput =
            document.getElementById(
                "productDescription"
            );

        const costPriceInput =
            document.getElementById("costPrice");

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
        // VALIDATE REQUIRED ELEMENTS
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
        // GET VALUES
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
                    : openingStock
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
        // GET CATEGORY NAME
        // ==================================================

        let categoryName = "";

        if (
            categoryInput.selectedIndex >= 0
        ) {

            const selectedOption =
                categoryInput.options[
                    categoryInput.selectedIndex
                ];

            if (selectedOption) {

                categoryName =
                    selectedOption.textContent.trim();

            }

        }


        // ==================================================
        // VALIDATION
        // ==================================================

        if (name === "") {

            alert(
                "Please enter Product Name."
            );

            nameInput.focus();

            return;

        }


        if (categoryId === "") {

            alert(
                "Please select Product Category."
            );

            categoryInput.focus();

            return;

        }


        if (sellingPrice < 0) {

            alert(
                "Selling Price cannot be negative."
            );

            return;

        }


        if (costPrice < 0) {

            alert(
                "Cost Price cannot be negative."
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
        // IMAGE STATE
        // ==================================================

        let imageURL = "";

        if (
            typeof selectedProductImage !==
            "undefined"
        ) {

            imageURL =
                selectedProductImage || "";

        }


        const imageURLInput =
            document.getElementById(
                "productImageURL"
            );

        const imageFileInput =
            document.getElementById(
                "productImageFile"
            );


        // ==================================================
        // IMAGE URL
        // ==================================================

        if (
            imageURLInput &&
            imageURLInput.value.trim() !== ""
        ) {

            imageURL =
                imageURLInput.value.trim();

        }


        // ==================================================
        // IMAGE FILE UPLOAD
        // ==================================================

        if (
            imageFileInput &&
            imageFileInput.files &&
            imageFileInput.files.length > 0
        ) {

            const file =
                imageFileInput.files[0];


            // ----------------------------------------------
            // Firebase Storage Check
            // ----------------------------------------------

            if (
                typeof firebase.storage !==
                "function"
            ) {

                throw new Error(
                    "Firebase Storage is not loaded."
                );

            }


            // ----------------------------------------------
            // File Type
            // ----------------------------------------------

            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                throw new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                );

            }


            // ----------------------------------------------
            // File Size
            // ----------------------------------------------

            const maxSize =
                2 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                throw new Error(
                    "Image size must not exceed 2MB."
                );

            }


            // ----------------------------------------------
            // Safe File Name
            // ----------------------------------------------

            const safeName =
                file.name.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );


            const storagePath =
                "products/" +
                Date.now() +
                "_" +
                safeName;


            console.log(
                "Uploading product image:",
                storagePath
            );


            // ----------------------------------------------
            // Upload
            // ----------------------------------------------

            const storage =
                firebase.storage();

            const storageRef =
                storage
                    .ref()
                    .child(storagePath);


            const uploadSnapshot =
                await storageRef.put(file);


            // ----------------------------------------------
            // Download URL
            // ----------------------------------------------

            imageURL =
                await uploadSnapshot
                    .ref
                    .getDownloadURL();


            console.log(
                "Product image uploaded successfully."
            );

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
        // UPDATE EXISTING PRODUCT
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
                "Product update successful."
            );


            alert(
                "Product updated successfully."
            );

        }


        // ==================================================
        // CREATE NEW PRODUCT
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
        // REFRESH PRODUCT LIST
        // ==================================================

        if (
            typeof startProductListener ===
            "function"
        ) {

            startProductListener();

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

        // ==================================================
        // ALWAYS RESTORE BUTTON
        // ==================================================

        if (btnSave) {

            btnSave.disabled =
                false;

        }


        if (btnText) {

            btnText.textContent =
                "Save Product";

        }

    }

}


// ==========================================================
// RESET PRODUCT FORM
// ==========================================================

function resetProductForm() {

    // ------------------------------------------------------
    // Reset Edit State
    // ------------------------------------------------------

    editingProductId =
        null;


    // ------------------------------------------------------
    // Reset Image State
    // ------------------------------------------------------

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
    // TEXT FIELDS
    // ======================================================

    const textFields = [

        "productName",
        "productDescription"

    ];


    textFields.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.value =
                    "";

            }

        }
    );


    // ======================================================
    // PRODUCT CODE
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
    // NUMERIC FIELDS
    // ======================================================

    const costPrice =
        document.getElementById(
            "costPrice"
        );

    if (costPrice) {

        costPrice.value =
            "0";

    }


    const sellingPrice =
        document.getElementById(
            "sellingPrice"
        );

    if (sellingPrice) {

        sellingPrice.value =
            "0";

    }


    const openingStock =
        document.getElementById(
            "openingStock"
        );

    if (openingStock) {

        openingStock.value =
            "0";

    }


    const currentStock =
        document.getElementById(
            "currentStock"
        );

    if (currentStock) {

        currentStock.value =
            "0";

    }


    const reorderLevel =
        document.getElementById(
            "reorderLevel"
        );

    if (reorderLevel) {

        reorderLevel.value =
            "10";

    }


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
    // PRODUCT SETTINGS
    // ======================================================

    const showPOS =
        document.getElementById(
            "showPOS"
        );

    if (showPOS) {

        showPOS.checked =
            true;

    }


    const showKitchen =
        document.getElementById(
            "showKitchen"
        );

    if (showKitchen) {

        showKitchen.checked =
            true;

    }


    const showMenu =
        document.getElementById(
            "showMenu"
        );

    if (showMenu) {

        showMenu.checked =
            true;

    }


    const inventoryTracking =
        document.getElementById(
            "inventoryTracking"
        );

    if (inventoryTracking) {

        inventoryTracking.checked =
            true;

    }


    const featuredProduct =
        document.getElementById(
            "featuredProduct"
        );

    if (featuredProduct) {

        featuredProduct.checked =
            false;

    }


    const bestSeller =
        document.getElementById(
            "bestSeller"
        );

    if (bestSeller) {

        bestSeller.checked =
            false;

    }


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
