// ==========================================================
// PAPPRITO ERP
// PRODUCT SAVE / UPDATE ENGINE V5
// File : assets/js/products/product-save.js
// Description : Create / Update Product + Firebase Storage
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
        document.getElementById(
            "btnSaveProduct"
        );


    if (!btnSave) {

        console.warn(
            "Product Save button not found."
        );

        return;

    }


    if (
        btnSave.dataset.saveInitialized ===
        "true"
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


    let imageUploadFailed =
        false;


    try {

        // ==================================================
        // FIREBASE DATABASE CHECK
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
        // DISABLE SAVE BUTTON
        // ==================================================

        if (btnSave) {

            btnSave.disabled =
                true;

        }


        if (btnText) {

            btnText.textContent =
                editingProductId
                    ? "Updating..."
                    : "Saving...";

        }


        // ==================================================
        // GET FORM ELEMENTS
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
        // REQUIRED FIELDS
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
        // READ VALUES
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
                    : 10
            ) || 10;


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

        let categoryName =
            "";


        if (
            categoryInput.selectedIndex >=
            0
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
        // PRODUCT OPTIONS
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
        // EXISTING IMAGE
        // ==================================================

        let imageURL =
            "";


        // ==================================================
        // IMAGE URL FIELD
        // ==================================================

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


        // ==================================================
        // EXISTING PRODUCT IMAGE
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
                    existingSnapshot.val() ||
                    {};


                imageURL =
                    existingProduct.image ||
                    "";

            }

        }


        // ==================================================
        // PRODUCT ID
        // ==================================================

        let productId =
            editingProductId;


        // ==================================================
        // CREATE NEW PRODUCT ID FIRST
        // ==================================================

        if (!productId) {

            const newProductRef =
                db.ref(
                    "products"
                ).push();


            productId =
                newProductRef.key;

        }


        // ==================================================
        // IMAGE UPLOAD
        // ==================================================

        if (
            typeof selectedProductFile !==
            "undefined" &&
            selectedProductFile
        ) {

            console.log(
                "New product image selected."
            );


            try {

                imageURL =
                    await uploadProductImage(
                        selectedProductFile,
                        productId
                    );


                console.log(
                    "Product image uploaded successfully."
                );

            }

            catch (imageError) {

                console.error(
                    "Product Image Upload Error:",
                    imageError
                );


                imageUploadFailed =
                    true;


                /*
                 * IMPORTANT:
                 *
                 * We do NOT cancel the product save.
                 *
                 * The product information will still
                 * be saved/updated.
                 *
                 * Existing image will be preserved
                 * during UPDATE.
                 */


                if (
                    editingProductId
                ) {

                    const existingSnapshot =
                        await db
                            .ref(
                                "products/" +
                                productId
                            )
                            .once("value");


                    if (
                        existingSnapshot.exists()
                    ) {

                        const existingProduct =
                            existingSnapshot.val() ||
                            {};


                        imageURL =
                            existingProduct.image ||
                            "";

                    }

                }

                else {

                    imageURL =
                        "";

                }

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
        // CREATE
        // ==================================================

        if (
            !editingProductId
        ) {

            productData.createdAt =
                firebase.database
                    .ServerValue
                    .TIMESTAMP;


            console.log(
                "Creating new product:",
                productId
            );


            await db
                .ref(
                    "products/" +
                    productId
                )
                .set(
                    productData
                );


            console.log(
                "Product created successfully."
            );

        }


        // ==================================================
        // UPDATE
        // ==================================================

        else {

            console.log(
                "Updating product:",
                productId
            );


            await db
                .ref(
                    "products/" +
                    productId
                )
                .update(
                    productData
                );


            console.log(
                "Product updated successfully."
            );

        }


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        if (
            imageUploadFailed
        ) {

            alert(
                "Product saved successfully.\n\n" +
                "However, the image could not be uploaded."
            );

        }

        else {

            alert(
                editingProductId
                    ? "Product updated successfully."
                    : "Product saved successfully."
            );

        }


        // ==================================================
        // REFRESH TABLE
        // ==================================================

        if (
            typeof renderProductTable ===
            "function"
        ) {

            renderProductTable();

        }


        if (
            typeof updateProductCounter ===
            "function"
        ) {

            updateProductCounter();

        }


        // ==================================================
        // RESET FORM
        // ==================================================

        resetProductForm();


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        closeProductModal();

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
// UPLOAD PRODUCT IMAGE
// ==========================================================

async function uploadProductImage(
    file,
    productId
) {

    // ======================================================
    // CHECK FIREBASE STORAGE
    // ======================================================

    if (
        typeof firebase ===
        "undefined"
    ) {

        throw new Error(
            "Firebase is not available."
        );

    }


    if (
        typeof firebase.storage !==
        "function"
    ) {

        throw new Error(
            "Firebase Storage SDK is not loaded."
        );

    }


    if (!file) {

        throw new Error(
            "No image file selected."
        );

    }


    if (!productId) {

        throw new Error(
            "Product ID is required for image upload."
        );

    }


    // ======================================================
    // FILE TYPE
    // ======================================================

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
            "Invalid image format. Please use JPG, PNG or WEBP."
        );

    }


    // ======================================================
    // FILE SIZE
    // ======================================================

    const maxSize =
        2 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        throw new Error(
            "Image is too large. Maximum size is 2MB."
        );

    }


    // ======================================================
    // STORAGE
    // ======================================================

    const storage =
        firebase.storage();


    // ======================================================
    // FILE NAME
    // ======================================================

    const extension =
        getImageExtension(
            file
        );


    const fileName =
        "product-" +
        productId +
        "-" +
        Date.now() +
        "." +
        extension;


    // ======================================================
    // STORAGE PATH
    // ======================================================

    const storageRef =
        storage
            .ref()
            .child(
                "products/" +
                productId +
                "/" +
                fileName
            );


    console.log(
        "Uploading image:",
        storageRef.fullPath
    );


    // ======================================================
    // UPLOAD
    // ======================================================

    await storageRef.put(
        file,
        {
            contentType:
                file.type,

            cacheControl:
                "public,max-age=31536000"
        }
    );


    // ======================================================
    // DOWNLOAD URL
    // ======================================================

    const downloadURL =
        await storageRef.getDownloadURL();


    if (!downloadURL) {

        throw new Error(
            "Firebase Storage did not return an image URL."
        );

    }


    return downloadURL;

}


// ==========================================================
// GET IMAGE EXTENSION
// ==========================================================

function getImageExtension(
    file
) {

    if (
        file.type ===
        "image/png"
    ) {

        return "png";

    }


    if (
        file.type ===
        "image/webp"
    ) {

        return "webp";

    }


    return "jpg";

}


// ==========================================================
// CLOSE PRODUCT MODAL
// ==========================================================

function closeProductModal() {

    const modalElement =
        document.getElementById(
            "productModal"
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


    Object.keys(
        fields
    ).forEach(
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

    const defaults = {

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
        defaults
    ).forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.checked =
                    defaults[id];

            }

        }
    );


    // ======================================================
    // IMAGE URL
    // ======================================================

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    // ======================================================
    // SAVE BUTTON TEXT
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
    // GENERATE CODE
    // ======================================================

    if (
        typeof generateProductCode ===
        "function"
    ) {

        generateProductCode();

    }

}
