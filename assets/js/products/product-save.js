// ==========================================================
// PAPPRITO ERP
// PRODUCT SAVE / UPDATE ENGINE V6
// File : assets/js/products/product-save.js
//
// FINAL FLOW:
//
// ADD:
// Product -> Database -> Image Upload -> Image URL
//
// UPDATE:
// Product Data -> Database FIRST
// New Image -> Storage SECOND
//
// IMPORTANT:
// Firebase Storage must NEVER block Product Update.
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
            "Save Product button not found."
        );

        return;

    }


    // Prevent duplicate listener

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
        "Product Save Engine V6 initialized."
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


    let isUpdate =
        Boolean(
            editingProductId
        );


    try {

        // ==================================================
        // FIREBASE CHECK
        // ==================================================

        if (
            typeof db ===
            "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        // ==================================================
        // FORM VALUES
        // ==================================================

        const code =
            document
                .getElementById(
                    "productCode"
                )
                ?.value
                .trim() || "";


        const name =
            document
                .getElementById(
                    "productName"
                )
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


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            name === ""
        ) {

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


        // ==================================================
        // BUTTON STATE
        // ==================================================

        if (btnSave) {

            btnSave.disabled =
                true;

        }


        if (btnText) {

            btnText.textContent =
                isUpdate
                    ? "Updating..."
                    : "Saving...";

        }


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
        // SELECTED IMAGE STATE
        // ==================================================

        if (
            !imageURL &&
            typeof selectedProductImage !==
            "undefined"
        ) {

            const selectedImage =
                selectedProductImage || "";


            // Only use actual remote URL.
            // Do not save blob/data preview.

            if (
                selectedImage.startsWith(
                    "http://"
                )
                ||
                selectedImage.startsWith(
                    "https://"
                )
            ) {

                imageURL =
                    selectedImage;

            }

        }


        // ==================================================
        // PRESERVE EXISTING IMAGE DURING UPDATE
        // ==================================================

        if (
            isUpdate &&
            !imageURL
        ) {

            const existingSnapshot =
                await db
                    .ref(
                        "products/" +
                        editingProductId
                    )
                    .once(
                        "value"
                    );


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
        // CATEGORY NAME
        // ==================================================

        let categoryName =
            "";


        if (
            category.selectedIndex >=
            0
        ) {

            const selectedOption =
                category.options[
                    category.selectedIndex
                ];


            if (selectedOption) {

                categoryName =
                    selectedOption.text.trim();

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
                category.value,

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


        // ==================================================
        // GET / CREATE PRODUCT REFERENCE
        // ==================================================

        let productRef;


        if (isUpdate) {

            productRef =
                db.ref(
                    "products/" +
                    editingProductId
                );

        }

        else {

            productRef =
                db
                    .ref(
                        "products"
                    )
                    .push();

        }


        const productId =
            productRef.key;


        // ==================================================
        // ADD CREATED AT
        // ==================================================

        if (!isUpdate) {

            productData.createdAt =
                firebase.database
                    .ServerValue
                    .TIMESTAMP;

        }


        // ==================================================
        // IMPORTANT
        //
        // DATABASE FIRST
        //
        // Storage cannot block Product Update.
        // ==================================================

        console.log(
            isUpdate
                ? "Updating product in Database..."
                : "Creating product in Database..."
        );


        await productRef.set(
            productData
        );


        console.log(
            "Product database save successful:",
            productId
        );


        // ==================================================
        // PRODUCT DATABASE IS NOW SAFE
        // ==================================================

        if (btnText) {

            btnText.textContent =
                "Saved";

        }


        // ==================================================
        // IMAGE FILE
        // ==================================================

        const imageFileInput =
            document.getElementById(
                "productImageFile"
            );


        let selectedFile =
            null;


        if (
            imageFileInput &&
            imageFileInput.files &&
            imageFileInput.files.length >
            0
        ) {

            selectedFile =
                imageFileInput.files[0];

        }


        // ==================================================
        // IMAGE UPLOAD
        //
        // THIS HAPPENS AFTER DATABASE SAVE.
        // ==================================================

        if (selectedFile) {

            console.log(
                "New image detected."
            );


            try {

                const uploadedURL =
                    await uploadProductImageSafe(
                        selectedFile,
                        productId
                    );


                if (uploadedURL) {

                    // --------------------------------------
                    // SAVE IMAGE URL ONLY
                    // --------------------------------------

                    await productRef.update({

                        image:
                            uploadedURL,

                        updatedAt:
                            firebase.database
                                .ServerValue
                                .TIMESTAMP

                    });


                    console.log(
                        "Product image URL saved."
                    );

                }

            }

            catch (imageError) {

                console.error(
                    "Image upload failed:",
                    imageError
                );


                // ------------------------------------------
                // IMPORTANT
                //
                // Product is ALREADY saved.
                // Do NOT throw error.
                // ------------------------------------------

                alert(
                    isUpdate

                        ? "Product updated successfully.\n\nThe product image could not be uploaded."

                        : "Product saved successfully.\n\nThe product image could not be uploaded."
                );

            }

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        if (
            !selectedFile
        ) {

            alert(
                isUpdate
                    ? "Product updated successfully."
                    : "Product saved successfully."
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

        else if (
            typeof renderProductTable ===
            "function"
        ) {

            renderProductTable();

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
// SAFE PRODUCT IMAGE UPLOAD
// ==========================================================

function uploadProductImageSafe(
    file,
    productId
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            // =================================================
            // FIREBASE CHECK
            // =================================================

            if (
                typeof firebase ===
                "undefined"
            ) {

                reject(
                    new Error(
                        "Firebase is not loaded."
                    )
                );

                return;

            }


            if (
                typeof firebase.storage !==
                "function"
            ) {

                reject(
                    new Error(
                        "Firebase Storage is not loaded."
                    )
                );

                return;

            }


            // =================================================
            // FILE CHECK
            // =================================================

            if (!file) {

                reject(
                    new Error(
                        "No image file selected."
                    )
                );

                return;

            }


            // =================================================
            // ALLOWED TYPES
            // =================================================

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

                reject(
                    new Error(
                        "Only JPG, PNG and WEBP images are allowed."
                    )
                );

                return;

            }


            // =================================================
            // MAX SIZE
            // =================================================

            const maxSize = 10 * 1024 * 1024;


            if (
                file.size >
                maxSize
            ) {

                reject(
                    new Error(
                        "Image size must not exceed 2MB."
                    )
                );

                return;

            }


            // =================================================
            // STORAGE
            // =================================================

            let storage;


            try {

                storage =
                    firebase.storage();

            }

            catch (error) {

                reject(
                    error
                );

                return;

            }


            // =================================================
            // SAFE FILE NAME
            // =================================================

            const safeName =
                file.name
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        "_"
                    );


            // =================================================
            // UNIQUE STORAGE PATH
            // =================================================

            const storagePath =
                "products/" +
                productId +
                "/" +
                Date.now() +
                "_" +
                safeName;


            console.log(
                "Starting image upload:",
                storagePath
            );


            const storageRef =
                storage
                    .ref()
                    .child(
                        storagePath
                    );


            // =================================================
            // UPLOAD TASK
            // =================================================

            const uploadTask =
                storageRef.put(
                    file
                );


            let finished =
                false;


            // =================================================
            // TIMEOUT
            //
            // Prevents UI from waiting forever.
            // =================================================

            const timeout =
                setTimeout(
                    function () {

                        if (finished) {

                            return;

                        }


                        finished =
                            true;


                        console.warn(
                            "Image upload timeout."
                        );


                        reject(
                            new Error(
                                "Image upload timed out. Product data was already saved."
                            )
                        );


                    },
                    30000
                );


            // =================================================
            // UPLOAD EVENTS
            // =================================================

            uploadTask.on(

                "state_changed",

                function (snapshot) {

                    const progress =
                        (
                            snapshot.bytesTransferred /
                            snapshot.totalBytes
                        ) *
                        100;


                    console.log(
                        "Image upload:",
                        progress.toFixed(0) +
                        "%"
                    );

                },


                function (error) {

                    if (finished) {

                        return;

                    }


                    finished =
                        true;


                    clearTimeout(
                        timeout
                    );


                    reject(
                        error
                    );

                },


                async function () {

                    if (finished) {

                        return;

                    }


                    try {

                        const downloadURL =
                            await uploadTask
                                .snapshot
                                .ref
                                .getDownloadURL();


                        finished =
                            true;


                        clearTimeout(
                            timeout
                        );


                        console.log(
                            "Image uploaded:",
                            downloadURL
                        );


                        resolve(
                            downloadURL
                        );

                    }

                    catch (error) {

                        finished =
                            true;


                        clearTimeout(
                            timeout
                        );


                        reject(
                            error
                        );

                    }

                }

            );

        }
    );

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


    // ======================================================
    // TEXT FIELDS
    // ======================================================

    const fields = [

        "productName",

        "productDescription"

    ];


    fields.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.value =
                    "";

            }

        }
    );


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
    // NUMERIC FIELDS
    // ======================================================

    const costPrice =
        document.getElementById(
            "costPrice"
        );


    if (costPrice) {

        costPrice.value =
            0;

    }


    const sellingPrice =
        document.getElementById(
            "sellingPrice"
        );


    if (sellingPrice) {

        sellingPrice.value =
            0;

    }


    const openingStock =
        document.getElementById(
            "openingStock"
        );


    if (openingStock) {

        openingStock.value =
            0;

    }


    const currentStock =
        document.getElementById(
            "currentStock"
        );


    if (currentStock) {

        currentStock.value =
            0;

    }


    const reorderLevel =
        document.getElementById(
            "reorderLevel"
        );


    if (reorderLevel) {

        reorderLevel.value =
            10;

    }


    // ======================================================
    // CATEGORY
    // ======================================================

    const category =
        document.getElementById(
            "productCategory"
        );


    if (category) {

        category.selectedIndex =
            0;

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
    // IMAGE FILE
    // ======================================================

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    // ======================================================
    // IMAGE PREVIEW
    // ======================================================

    const imagePreview =
        document.getElementById(
            "productImagePreview"
        );


    if (imagePreview) {

        imagePreview.src =
            "assets/img/no-product.png";

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
    // GENERATE NEW PRODUCT CODE
    // ======================================================

    if (
        typeof generateProductCode ===
        "function"
    ) {

        generateProductCode();

    }

}
