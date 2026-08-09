// ==========================================================
// PAPPRITO ERP
// PRODUCT EDIT ENGINE
// File : assets/js/products/product-edit.js
// Description : Load Existing Product For Editing
// ==========================================================

"use strict";


// ==========================================================
// EDIT PRODUCT
// ==========================================================

async function editProduct(productId) {

    try {

        // ==================================================
        // VALIDATE PRODUCT ID
        // ==================================================

        if (!productId) {

            alert(
                "Invalid Product ID."
            );

            return;

        }


        // ==================================================
        // CHECK FIREBASE
        // ==================================================

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        console.log(
            "Loading product for edit:",
            productId
        );


        // ==================================================
        // SAVE EDITING ID
        // ==================================================

        editingProductId =
            productId;


        // ==================================================
        // GET PRODUCT
        // ==================================================

        const snapshot =
            await db
                .ref(
                    "products/" +
                    productId
                )
                .once("value");


        // ==================================================
        // PRODUCT NOT FOUND
        // ==================================================

        if (!snapshot.exists()) {

            editingProductId =
                null;

            alert(
                "Product not found."
            );

            return;

        }


        const product =
            snapshot.val() || {};


        console.log(
            "Product loaded:",
            product
        );


        // ==================================================
        // PRODUCT CODE
        // ==================================================

        setProductField(
            "productCode",
            product.code || ""
        );


        // ==================================================
        // PRODUCT NAME
        // ==================================================

        setProductField(
            "productName",
            product.name || ""
        );


        // ==================================================
        // CATEGORY
        // ==================================================

        const category =
            document.getElementById(
                "productCategory"
            );


        if (category) {

            const categoryId =
                product.categoryId || "";


            category.value =
                categoryId;


            // ----------------------------------------------
            // If category doesn't exist in dropdown,
            // load categories again and select it.
            // ----------------------------------------------

            if (
                category.value !==
                categoryId
            ) {

                if (
                    typeof loadProductCategories ===
                    "function"
                ) {

                    await loadProductCategories();

                    category.value =
                        categoryId;

                }

            }

        }


        // ==================================================
        // DESCRIPTION
        // ==================================================

        setProductField(
            "productDescription",
            product.description || ""
        );


        // ==================================================
        // COST PRICE
        // ==================================================

        setProductField(
            "costPrice",
            Number(
                product.costPrice || 0
            )
        );


        // ==================================================
        // SELLING PRICE
        // ==================================================

        setProductField(
            "sellingPrice",
            Number(
                product.sellingPrice || 0
            )
        );


        // ==================================================
        // OPENING STOCK
        // ==================================================

        setProductField(
            "openingStock",
            Number(
                product.openingStock || 0
            )
        );


        // ==================================================
        // CURRENT STOCK
        // ==================================================

        setProductField(
            "currentStock",
            Number(
                product.currentStock || 0
            )
        );


        // ==================================================
        // REORDER LEVEL
        // ==================================================

        setProductField(
            "reorderLevel",
            Number(
                product.reorderLevel || 0
            )
        );


        // ==================================================
        // UNIT
        // ==================================================

        const unit =
            document.getElementById(
                "productUnit"
            );


        if (unit) {

            unit.value =
                product.unit ||
                "Piece";

        }


        // ==================================================
        // STATUS
        // ==================================================

        const status =
            document.getElementById(
                "productStatus"
            );


        if (status) {

            status.value =
                product.status ||
                "Active";

        }


        // ==================================================
        // SHOW IN POS
        // ==================================================

        setProductCheckbox(
            "showPOS",
            product.showPOS !== false
        );


        // ==================================================
        // SHOW IN KITCHEN
        // ==================================================

        setProductCheckbox(
            "showKitchen",
            product.showKitchen !== false
        );


        // ==================================================
        // SHOW IN QR MENU
        // ==================================================

        setProductCheckbox(
            "showMenu",
            product.showMenu !== false
        );


        // ==================================================
        // INVENTORY TRACKING
        // ==================================================

        setProductCheckbox(
            "inventoryTracking",
            product.inventoryTracking !== false
        );


        // ==================================================
        // FEATURED PRODUCT
        // ==================================================

        setProductCheckbox(
            "featuredProduct",
            product.featuredProduct === true
        );


        // ==================================================
        // BEST SELLER
        // ==================================================

        setProductCheckbox(
            "bestSeller",
            product.bestSeller === true
        );


        // ==================================================
        // PRODUCT IMAGE
        // ==================================================

        const image =
            product.image || "";


        if (
            typeof loadProductImage ===
            "function"
        ) {

            loadProductImage(
                image
            );

        }
        else {

            // Fallback if image module
            // is not available.

            setProductField(
                "productImageURL",
                image
            );


            const preview =
                document.getElementById(
                    "productImagePreview"
                );


            if (preview) {

                preview.src =
                    image ||
                    "assets/img/no-product.png";

            }

        }


        // ==================================================
        // CLEAR FILE INPUT
        // ==================================================

        const imageFile =
            document.getElementById(
                "productImageFile"
            );


        if (imageFile) {

            imageFile.value =
                "";

        }


        // ==================================================
        // UPDATE MODAL TITLE
        // ==================================================

        const modalTitle =
            document.getElementById(
                "productModalTitle"
            );


        if (modalTitle) {

            modalTitle.innerHTML = `

                <i class="fa-solid fa-pen-to-square"></i>

                Edit Product

            `;

        }


        // ==================================================
        // UPDATE SAVE BUTTON TEXT
        // ==================================================

        const saveText =
            document.getElementById(
                "btnSaveProductText"
            );


        if (saveText) {

            saveText.textContent =
                "Update Product";

        }


        // ==================================================
        // OPEN MODAL
        // ==================================================

        const modalElement =
            document.getElementById(
                "productModal"
            );


        if (!modalElement) {

            throw new Error(
                "Product modal not found."
            );

        }


        if (
            typeof bootstrap ===
            "undefined"
        ) {

            throw new Error(
                "Bootstrap JavaScript is not loaded."
            );

        }


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();


        console.log(
            "Product edit modal opened."
        );

    }

    catch (error) {

        console.error(
            "Edit Product Error:",
            error
        );


        editingProductId =
            null;


        alert(
            "Unable to load product.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// SET PRODUCT FIELD
// ==========================================================

function setProductField(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {

        console.warn(
            "Product field not found:",
            id
        );

        return;

    }


    element.value =
        value;

}


// ==========================================================
// SET PRODUCT CHECKBOX
// ==========================================================

function setProductCheckbox(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {

        console.warn(
            "Product checkbox not found:",
            id
        );

        return;

    }


    element.checked =
        Boolean(value);

}


// ==========================================================
// PREPARE ADD PRODUCT MODAL
// ==========================================================

function prepareAddProduct() {

    console.log(
        "Preparing Add Product..."
    );


    // ==================================================
    // RESET FORM
    // ==================================================

    if (
        typeof resetProductForm ===
        "function"
    ) {

        resetProductForm();

    }
    else {

        editingProductId =
            null;

    }


    // ==================================================
    // MODAL TITLE
    // ==================================================

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


    // ==================================================
    // SAVE BUTTON
    // ==================================================

    const saveText =
        document.getElementById(
            "btnSaveProductText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Product";

    }


    // ==================================================
    // OPEN MODAL
    // ==================================================

    const modalElement =
        document.getElementById(
            "productModal"
        );


    if (!modalElement) {

        console.error(
            "Product modal not found."
        );

        return;

    }


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        console.error(
            "Bootstrap JavaScript is not loaded."
        );

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
// ADD PRODUCT BUTTON
// ==========================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#btnAddProduct"
            );


        if (!button) {

            return;

        }


        prepareAddProduct();

    }
);
