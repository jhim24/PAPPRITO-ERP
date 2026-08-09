// ==========================================================
// PAPPRITO ERP
// PRODUCT DELETE ENGINE
// File : assets/js/products/product-delete.js
// Description : Delete Product From Firebase
// ==========================================================

"use strict";


// ==========================================================
// DELETE PRODUCT
// ==========================================================

async function deleteProduct(productId) {

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


        // ==================================================
        // FIND PRODUCT
        // ==================================================

        let product =
            null;


        if (
            typeof productList !==
            "undefined" &&
            Array.isArray(productList)
        ) {

            product =
                productList.find(
                    function (item) {

                        return (
                            item.productId ===
                            productId
                        );

                    }
                );

        }


        // ==================================================
        // PRODUCT NAME
        // ==================================================

        const productName =
            product &&
            product.name

                ? product.name

                : "this product";


        // ==================================================
        // CONFIRM DELETE
        // ==================================================

        const confirmed =
            confirm(

                "Delete Product?\n\n" +

                productName +

                "\n\n" +

                "This action cannot be undone."

            );


        if (!confirmed) {

            return;

        }


        // ==================================================
        // DELETE FROM FIREBASE
        // ==================================================

        console.log(
            "Deleting product:",
            productId
        );


        await db
            .ref(
                "products/" +
                productId
            )
            .remove();


        // ==================================================
        // CLEAR EDIT STATE
        // ==================================================

        if (
            typeof editingProductId !==
            "undefined"
        ) {

            if (
                editingProductId ===
                productId
            ) {

                editingProductId =
                    null;

            }

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "Product deleted successfully:",
            productId
        );


        alert(
            "Product deleted successfully."
        );


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

    }

    catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );


        alert(
            "Unable to delete product.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// DELETE ALL INACTIVE PRODUCTS
// ==========================================================

async function deleteInactiveProducts() {

    try {

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        if (
            typeof productList ===
            "undefined" ||
            !Array.isArray(productList)
        ) {

            alert(
                "Product data is not available."
            );

            return;

        }


        const inactiveProducts =
            productList.filter(
                function (product) {

                    return (
                        product.status !==
                        "Active"
                    );

                }
            );


        if (
            inactiveProducts.length ===
            0
        ) {

            alert(
                "There are no inactive products."
            );

            return;

        }


        const confirmed =
            confirm(

                "Delete " +

                inactiveProducts.length +

                " inactive product(s)?\n\n" +

                "This action cannot be undone."

            );


        if (!confirmed) {

            return;

        }


        const updates =
            {};


        inactiveProducts.forEach(
            function (product) {

                if (product.productId) {

                    updates[
                        "products/" +
                        product.productId
                    ] =
                        null;

                }

            }
        );


        await db
            .ref()
            .update(
                updates
            );


        alert(
            inactiveProducts.length +
            " inactive product(s) deleted successfully."
        );


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

    }

    catch (error) {

        console.error(
            "Delete Inactive Products Error:",
            error
        );


        alert(
            "Unable to delete inactive products.\n\n" +
            error.message
        );

    }

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
