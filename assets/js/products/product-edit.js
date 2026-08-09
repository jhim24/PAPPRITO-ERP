// ==========================================
// PAPPRITO ERP
// PRODUCT EDIT ENGINE V4
// Description : Load Product For Editing
// ==========================================

"use strict";


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(productId) {

    try {

        if (!productId) {

            alert("Invalid Product ID.");

            return;

        }


        // ======================================
        // SAVE EDITING ID
        // ======================================

        editingProductId = productId;


        // ======================================
        // GET PRODUCT
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

            editingProductId = null;

            return;

        }


        const product =
            snapshot.val() || {};


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
        // CATEGORY
        // ======================================

        const productCategory =
            document.getElementById(
                "productCategory"
            );

        if (productCategory) {

            productCategory.value =
                product.categoryId || "";

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
                product.costPrice || 0;

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
                product.sellingPrice || 0;

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
                product.openingStock || 0;

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
                product.currentStock || 0;

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
                product.reorderLevel || 10;

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
        // IMAGE
        // ======================================

        selectedProductImage =
            product.image || "";


        const imageURL =
            document.getElementById(
                "productImageURL"
            );

        if (imageURL) {

            imageURL.value =
                selectedProductImage;

        }


        const imagePreview =
            document.getElementById(
                "productImagePreview"
            );

        if (imagePreview) {

            imagePreview.src =
                selectedProductImage ||
                "assets/img/no-product.png";

        }


        // ======================================
        // CLEAR NEW FILE SELECTION
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
        // OPEN MODAL
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


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

    catch (error) {

        console.error(
            "Edit Product Error:",
            error
        );


        editingProductId = null;


        alert(
            "Unable to load product.\n\n" +
            error.message
        );

    }

}
