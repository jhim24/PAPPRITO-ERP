// ==========================================
// PAPPRITO ERP
// PRODUCT EDIT ENGINE V5
// Description : Load Product For Editing
// ==========================================

"use strict";


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(productId) {

    try {

        // ======================================
        // VALIDATE PRODUCT ID
        // ======================================

        if (!productId) {

            alert("Invalid Product ID.");

            return;

        }


        // ======================================
        // CHECK FIREBASE
        // ======================================

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        // ======================================
        // CHECK PRODUCT MODAL
        // ======================================

        const modalElement =
            document.getElementById(
                "productModal"
            );


        if (!modalElement) {

            throw new Error(
                "Product modal not found."
            );

        }


        // ======================================
        // GET PRODUCT FROM FIREBASE
        // ======================================

        const snapshot =
            await db
                .ref(
                    "products/" +
                    productId
                )
                .once("value");


        if (!snapshot.exists()) {

            alert(
                "Product not found."
            );

            return;

        }


        const product =
            snapshot.val() || {};


        // ======================================
        // SET EDITING ID
        // ======================================

        if (
            typeof editingProductId ===
            "undefined"
        ) {

            throw new Error(
                "Product save module is not initialized."
            );

        }


        editingProductId =
            productId;


        // ======================================
        // PRODUCT CODE
        // ======================================

        const productCode =
            document.getElementById(
                "productCode"
            );

        if (productCode) {

            productCode.value =
                product.code || "";

        }


        // ======================================
        // PRODUCT NAME
        // ======================================

        const productName =
            document.getElementById(
                "productName"
            );

        if (productName) {

            productName.value =
                product.name || "";

        }


        // ======================================
        // DESCRIPTION
        // ======================================

        const description =
            document.getElementById(
                "productDescription"
            );

        if (description) {

            description.value =
                product.description || "";

        }


        // ======================================
        // COST PRICE
        // ======================================

        const costPrice =
            document.getElementById(
                "costPrice"
            );

        if (costPrice) {

            costPrice.value =
                Number(
                    product.costPrice || 0
                );

        }


        // ======================================
        // SELLING PRICE
        // ======================================

        const sellingPrice =
            document.getElementById(
                "sellingPrice"
            );

        if (sellingPrice) {

            sellingPrice.value =
                Number(
                    product.sellingPrice || 0
                );

        }


        // ======================================
        // OPENING STOCK
        // ======================================

        const openingStock =
            document.getElementById(
                "openingStock"
            );

        if (openingStock) {

            openingStock.value =
                Number(
                    product.openingStock || 0
                );

        }


        // ======================================
        // CURRENT STOCK
        // ======================================

        const currentStock =
            document.getElementById(
                "currentStock"
            );

        if (currentStock) {

            currentStock.value =
                Number(
                    product.currentStock || 0
                );

        }


        // ======================================
        // REORDER LEVEL
        // ======================================

        const reorderLevel =
            document.getElementById(
                "reorderLevel"
            );

        if (reorderLevel) {

            reorderLevel.value =
                Number(
                    product.reorderLevel || 10
                );

        }


        // ======================================
        // STATUS
        // ======================================

        const status =
            document.getElementById(
                "productStatus"
            );

        if (status) {

            status.value =
                product.status || "Active";

        }


        // ======================================
        // SHOW MENU
        // ======================================

        const showMenu =
            document.getElementById(
                "showMenu"
            );

        if (showMenu) {

            showMenu.checked =
                product.showMenu !== false;

        }


        // ======================================
        // SHOW POS
        // ======================================

        const showPOS =
            document.getElementById(
                "showPOS"
            );

        if (showPOS) {

            showPOS.checked =
                product.showPOS !== false;

        }


        // ======================================
        // CATEGORY
        // ======================================

        const productCategory =
            document.getElementById(
                "productCategory"
            );


        if (productCategory) {

            // ----------------------------------
            // Try immediately
            // ----------------------------------

            productCategory.value =
                product.categoryId || "";


            // ----------------------------------
            // If category option isn't loaded,
            // wait briefly and try again.
            // ----------------------------------

            if (
                product.categoryId &&
                productCategory.value !==
                    product.categoryId
            ) {

                if (
                    typeof loadProductCategories ===
                    "function"
                ) {

                    await loadProductCategories();

                }


                productCategory.value =
                    product.categoryId || "";

            }

        }


        // ======================================
        // IMAGE
        // ======================================

        if (
            typeof selectedProductImage !==
            "undefined"
        ) {

            selectedProductImage =
                product.image || "";

        }


        // ======================================
        // IMAGE URL
        // ======================================

        const imageURL =
            document.getElementById(
                "productImageURL"
            );


        if (imageURL) {

            imageURL.value =
                product.image || "";

        }


        // ======================================
        // IMAGE PREVIEW
        // ======================================

        const imagePreview =
            document.getElementById(
                "productImagePreview"
            );


        if (imagePreview) {

            imagePreview.src =
                product.image &&
                product.image.trim() !== ""

                    ? product.image

                    : "assets/img/no-product.png";

        }


        // ======================================
        // CLEAR NEW IMAGE FILE
        // ======================================

        if (
            typeof selectedProductFile !==
            "undefined"
        ) {

            selectedProductFile = null;

        }


        const imageFile =
            document.getElementById(
                "productImageFile"
            );


        if (imageFile) {

            imageFile.value = "";

        }


        // ======================================
        // CHANGE BUTTON TEXT
        // ======================================

        const saveText =
            document.getElementById(
                "btnSaveProductText"
            );


        if (saveText) {

            saveText.textContent =
                "Update Product";

        }


        // ======================================
        // SHOW MODAL
        // ======================================

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
            "Editing product:",
            productId
        );

    }

    catch (error) {

        console.error(
            "Edit Product Error:",
            error
        );


        if (
            typeof editingProductId !==
            "undefined"
        ) {

            editingProductId = null;

        }


        alert(
            "Unable to load product.\n\n" +
            error.message
        );

    }

}
