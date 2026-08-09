// ==========================================
// PAPPRITO ERP
// PRODUCT SAVE / UPDATE ENGINE
// File : assets/js/products/product-save.js
// ==========================================

"use strict";


// ==========================================
// GLOBAL EDIT STATE
// ==========================================

let editingProductId = null;


// ==========================================
// INITIALIZE PRODUCT SAVE
// ==========================================

function initializeProductSave() {

    const btnSave =
        document.getElementById(
            "btnSaveProduct"
        );

    if (!btnSave) {

        console.warn(
            "Save Product button not found."
        );

        return;

    }

    // Prevent duplicate listener
    if (btnSave.dataset.saveInitialized === "true") {

        return;

    }

    btnSave.dataset.saveInitialized = "true";

    btnSave.addEventListener(
        "click",
        saveProduct
    );

}


// ==========================================
// SAVE / UPDATE PRODUCT
// ==========================================

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

        // ======================================
        // FORM VALUES
        // ======================================

        const code =
            document
                .getElementById("productCode")
                ?.value
                .trim() || "";

        const name =
            document
                .getElementById("productName")
                ?.value
                .trim() || "";

        const category =
            document.getElementById(
                "productCategory"
            );

        const description =
            document
                .getElementById(
                    "productDescription"
                )
                ?.value
                .trim() || "";

        const costPrice =
            Number(
                document
                    .getElementById(
                        "costPrice"
                    )
                    ?.value || 0
            );

        const sellingPrice =
            Number(
                document
                    .getElementById(
                        "sellingPrice"
                    )
                    ?.value || 0
            );

        const openingStock =
            Number(
                document
                    .getElementById(
                        "openingStock"
                    )
                    ?.value || 0
            );

        const currentStockElement =
            document.getElementById(
                "currentStock"
            );

        const currentStock =
            currentStockElement
                ? Number(
                    currentStockElement.value || 0
                )
                : openingStock;

        const reorderLevel =
            Number(
                document
                    .getElementById(
                        "reorderLevel"
                    )
                    ?.value || 0
            );

        const status =
            document
                .getElementById(
                    "productStatus"
                )
                ?.value || "Active";

        const showMenuElement =
            document.getElementById(
                "showMenu"
            );

        const showPOSElement =
            document.getElementById(
                "showPOS"
            );

        const showMenu =
            showMenuElement
                ? showMenuElement.checked
                : true;

        const showPOS =
            showPOSElement
                ? showPOSElement.checked
                : true;


        // ======================================
        // VALIDATION
        // ======================================

        if (name === "") {

            alert(
                "Please enter Product Name."
            );

            return;

        }

        if (
            !category ||
            category.value === ""
        ) {

            alert(
                "Please select Category."
            );

            return;

        }


        // ======================================
        // BUTTON STATE
        // ======================================

        if (btnSave) {

            btnSave.disabled = true;

        }

        if (btnText) {

            btnText.textContent =
                editingProductId
                    ? "Updating..."
                    : "Saving...";

        }


        // ======================================
        // IMAGE
        // ======================================

        let imageURL =
            typeof selectedProductImage !==
            "undefined"
                ? selectedProductImage
                : "";


        const imageURLInput =
            document.getElementById(
                "productImageURL"
            );

        const imageFileInput =
            document.getElementById(
                "productImageFile"
            );


        // ======================================
        // IMAGE URL
        // ======================================

        if (
            imageURLInput &&
            imageURLInput.value.trim() !== ""
        ) {

            imageURL =
                imageURLInput.value.trim();

        }


        // ======================================
        // IMAGE FILE UPLOAD
        // ======================================

        if (
            imageFileInput &&
            imageFileInput.files &&
            imageFileInput.files.length > 0
        ) {

            const file =
                imageFileInput.files[0];


            if (
                typeof firebase ===
                "undefined"
            ) {

                throw new Error(
                    "Firebase is not loaded."
                );

            }


            if (
                typeof firebase.storage !==
                "function"
            ) {

                throw new Error(
                    "Firebase Storage is not loaded."
                );

            }


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


            if (
                file.size >
                2 * 1024 * 1024
            ) {

                throw new Error(
                    "Image size must not exceed 2MB."
                );

            }


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
                "Uploading:",
                storagePath
            );


            const storage =
                firebase.storage();


            const storageRef =
                storage
                    .ref()
                    .child(storagePath);


            const uploadSnapshot =
                await storageRef.put(
                    file
                );


            imageURL =
                await uploadSnapshot
                    .ref
                    .getDownloadURL();


            console.log(
                "Image uploaded:",
                imageURL
            );

        }


        // ======================================
        // PRODUCT DATA
        // ======================================

        const productData = {

            code: code,

            name: name,

            categoryId:
                category.value,

            categoryName:
                category
                    .options[
                        category.selectedIndex
                    ]
                    .text,

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

            image:
                imageURL,

            showPOS:
                showPOS,

            showMenu:
                showMenu,

            status:
                status,

            updatedAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        };


        // ======================================
        // UPDATE EXISTING PRODUCT
        // ======================================

        if (editingProductId) {

            await db
                .ref(
                    "products/" +
                    editingProductId
                )
                .update(
                    productData
                );


            alert(
                "Product updated successfully."
            );

        }


        // ======================================
        // CREATE NEW PRODUCT
        // ======================================

        else {

            productData.createdAt =
                firebase.database
                    .ServerValue
                    .TIMESTAMP;


            await db
                .ref("products")
                .push(
                    productData
                );


            alert(
                "Product saved successfully."
            );

        }


        // ======================================
        // REFRESH PRODUCT LIST
        // ======================================

        if (
            typeof startProductListener ===
            "function"
        ) {

            startProductListener();

        }


        // ======================================
        // RESET FORM
        // ======================================

        resetProductForm();


        // ======================================
        // CLOSE MODAL
        // ======================================

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
            "PRODUCT SAVE / UPDATE ERROR:",
            error
        );

        alert(
            "Unable to save/update product.\n\n" +
            error.message
        );

    }

    finally {

        if (btnSave) {

            btnSave.disabled = false;

        }

        if (btnText) {

            btnText.textContent =
                "Save Product";

        }

    }

}


// ==========================================
// RESET PRODUCT FORM
// ==========================================

function resetProductForm() {

    editingProductId = null;


    // Do NOT redeclare these variables.
    // They belong to product-image.js.

    if (
        typeof selectedProductImage !==
        "undefined"
    ) {

        selectedProductImage = "";

    }

    if (
        typeof selectedProductFile !==
        "undefined"
    ) {

        selectedProductFile = null;

    }


    // ======================================
    // TEXT FIELDS
    // ======================================

    const fields = [

        "productName",
        "productDescription"

    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    // ======================================
    // NUMERIC FIELDS
    // ======================================

    const costPrice =
        document.getElementById(
            "costPrice"
        );

    if (costPrice) {

        costPrice.value = 0;

    }


    const sellingPrice =
        document.getElementById(
            "sellingPrice"
        );

    if (sellingPrice) {

        sellingPrice.value = 0;

    }


    const openingStock =
        document.getElementById(
            "openingStock"
        );

    if (openingStock) {

        openingStock.value = 0;

    }


    const currentStock =
        document.getElementById(
            "currentStock"
        );

    if (currentStock) {

        currentStock.value = 0;

    }


    const reorderLevel =
        document.getElementById(
            "reorderLevel"
        );

    if (reorderLevel) {

        reorderLevel.value = 10;

    }


    // ======================================
    // CATEGORY
    // ======================================

    const category =
        document.getElementById(
            "productCategory"
        );

    if (category) {

        category.selectedIndex = 0;

    }


    // ======================================
    // STATUS
    // ======================================

    const status =
        document.getElementById(
            "productStatus"
        );

    if (status) {

        status.value = "Active";

    }


    // ======================================
    // IMAGE
    // ======================================

    const imageURL =
        document.getElementById(
            "productImageURL"
        );

    if (imageURL) {

        imageURL.value = "";

    }


    const imageFile =
        document.getElementById(
            "productImageFile"
        );

    if (imageFile) {

        imageFile.value = "";

    }


    const imagePreview =
        document.getElementById(
            "productImagePreview"
        );

    if (imagePreview) {

        imagePreview.src =
            "assets/img/no-product.png";

    }


    // ======================================
    // BUTTON TEXT
    // ======================================

    const btnText =
        document.getElementById(
            "btnSaveProductText"
        );

    if (btnText) {

        btnText.textContent =
            "Save Product";

    }


    // ======================================
    // NEW PRODUCT CODE
    // ======================================

    if (
        typeof generateProductCode ===
        "function"
    ) {

        generateProductCode();

    }

}
