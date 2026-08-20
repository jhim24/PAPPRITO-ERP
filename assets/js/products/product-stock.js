// ==========================================================
// PAPPRITO ERP
// PRODUCT STOCK ADJUSTMENT ENGINE V1
// File: assets/js/products/product-stock.js
//
// FEATURES:
// - Stock In
// - Stock Out
// - Set Exact Stock
// - Stock History
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL
// ==========================================================

let stockAdjustmentProductId = null;


// ==========================================================
// OPEN STOCK MODAL
// ==========================================================

async function openStockAdjustment(
    productId
) {

    try {

        if (!productId) {

            alert(
                "Invalid Product ID."
            );

            return;

        }


        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        const snapshot =
            await db
                .ref(
                    "products/" +
                    productId
                )
                .once(
                    "value"
                );


        if (
            !snapshot.exists()
        ) {

            alert(
                "Product not found."
            );

            return;

        }


        const product =
            snapshot.val() || {};


        stockAdjustmentProductId =
            productId;


        // ==================================================
        // PRODUCT NAME
        // ==================================================

        const nameElement =
            document.getElementById(
                "stockProductName"
            );


        if (nameElement) {

            nameElement.textContent =
                product.name ||
                "Product";

        }


        // ==================================================
        // PRODUCT CODE
        // ==================================================

        const codeElement =
            document.getElementById(
                "stockProductCode"
            );


        if (codeElement) {

            codeElement.textContent =
                product.code ||
                "";

        }


        // ==================================================
        // CURRENT STOCK
        // ==================================================

        const currentStock =
            Number(
                product.currentStock || 0
            );


        const currentElement =
            document.getElementById(
                "stockCurrentStock"
            );


        if (currentElement) {

            currentElement.textContent =
                formatStock(
                    currentStock
                );

        }


        // ==================================================
        // RESET
        // ==================================================

        const typeElement =
            document.getElementById(
                "stockAdjustmentType"
            );


        if (typeElement) {

            typeElement.value =
                "in";

        }


        const quantityElement =
            document.getElementById(
                "stockAdjustmentQuantity"
            );


        if (quantityElement) {

            quantityElement.value =
                "";

        }


        const reasonElement =
            document.getElementById(
                "stockAdjustmentReason"
            );


        if (reasonElement) {

            reasonElement.value =
                "";

        }


        updateStockPreview();


        // ==================================================
        // OPEN MODAL
        // ==================================================

        const modalElement =
            document.getElementById(
                "stockAdjustmentModal"
            );


        if (!modalElement) {

            throw new Error(
                "Stock Adjustment modal not found."
            );

        }


        if (
            typeof bootstrap ===
            "undefined"
        ) {

            throw new Error(
                "Bootstrap is not loaded."
            );

        }


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();

    }

    catch (error) {

        console.error(
            "Open Stock Adjustment Error:",
            error
        );


        alert(
            "Unable to open stock adjustment.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// PREVIEW
// ==========================================================

async function updateStockPreview() {

    if (
        !stockAdjustmentProductId
    ) {

        return;

    }


    try {

        const snapshot =
            await db
                .ref(
                    "products/" +
                    stockAdjustmentProductId
                )
                .once(
                    "value"
                );


        const product =
            snapshot.val() || {};


        const currentStock =
            Number(
                product.currentStock || 0
            );


        const type =
            document.getElementById(
                "stockAdjustmentType"
            )?.value ||
            "in";


        const quantity =
            Number(
                document.getElementById(
                    "stockAdjustmentQuantity"
                )?.value || 0
            );


        let newStock =
            currentStock;


        if (
            type === "in"
        ) {

            newStock =
                currentStock +
                quantity;

        }


        else if (
            type === "out"
        ) {

            newStock =
                currentStock -
                quantity;

        }


        else if (
            type === "adjust"
        ) {

            newStock =
                quantity;

        }


        if (
            newStock < 0
        ) {

            newStock = 0;

        }


        const newStockElement =
            document.getElementById(
                "stockNewStock"
            );


        if (newStockElement) {

            newStockElement.textContent =
                formatStock(
                    newStock
                );

        }

    }

    catch (error) {

        console.error(
            "Stock Preview Error:",
            error
        );

    }

}


// ==========================================================
// SAVE
// ==========================================================

async function saveStockAdjustment() {

    try {

        if (
            !stockAdjustmentProductId
        ) {

            alert(
                "Please select a product."
            );

            return;

        }


        const type =
            document.getElementById(
                "stockAdjustmentType"
            )?.value ||
            "in";


        const quantity =
            Number(
                document.getElementById(
                    "stockAdjustmentQuantity"
                )?.value || 0
            );


        const reason =
            document.getElementById(
                "stockAdjustmentReason"
            )?.value
                .trim() ||
            "";


        // ==================================================
        // VALIDATE
        // ==================================================

        if (
            quantity <= 0
        ) {

            alert(
                "Please enter a quantity greater than 0."
            );

            return;

        }


        if (
            reason === ""
        ) {

            alert(
                "Please enter a reason."
            );

            return;

        }


        // ==================================================
        // PRODUCT
        // ==================================================

        const productRef =
            db.ref(
                "products/" +
                stockAdjustmentProductId
            );


        const snapshot =
            await productRef.once(
                "value"
            );


        if (
            !snapshot.exists()
        ) {

            throw new Error(
                "Product not found."
            );

        }


        const product =
            snapshot.val() || {};


        const currentStock =
            Number(
                product.currentStock || 0
            );


        // ==================================================
        // CALCULATE
        // ==================================================

        let newStock =
            currentStock;


        if (
            type === "in"
        ) {

            newStock =
                currentStock +
                quantity;

        }


        else if (
            type === "out"
        ) {

            newStock =
                currentStock -
                quantity;

        }


        else if (
            type === "adjust"
        ) {

            newStock =
                quantity;

        }


        // ==================================================
        // NEGATIVE STOCK
        // ==================================================

        if (
            newStock < 0
        ) {

            alert(
                "Stock cannot be negative."
            );

            return;

        }


        // ==================================================
        // TYPE LABEL
        // ==================================================

        const typeLabel =

            type === "in"

                ? "Stock In"

                : type === "out"

                    ? "Stock Out"

                    : "Stock Adjustment";


        // ==================================================
        // CONFIRM
        // ==================================================

        const confirmed =
            confirm(

                typeLabel +

                "\n\n" +

                "Product: " +
                (
                    product.name ||
                    ""
                ) +

                "\n\n" +

                "Previous Stock: " +
                formatStock(
                    currentStock
                ) +

                "\n" +

                "Quantity: " +
                formatStock(
                    quantity
                ) +

                "\n" +

                "New Stock: " +
                formatStock(
                    newStock
                ) +

                "\n\n" +

                "Reason: " +
                reason

            );


        if (!confirmed) {

            return;

        }


        // ==================================================
        // UPDATE PRODUCT
        // ==================================================

        await productRef.update({

            currentStock:
                newStock,

            updatedAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        });


        // ==================================================
        // STOCK HISTORY
        // ==================================================

        const historyRef =
            db
                .ref(
                    "stockAdjustments"
                )
                .push();


        await historyRef.set({

            productId:
                stockAdjustmentProductId,

            productName:
                product.name ||
                "",

            productCode:
                product.code ||
                "",

            type:
                type,

            quantity:
                quantity,

            previousStock:
                currentStock,

            newStock:
                newStock,

            reason:
                reason,

            createdAt:
                firebase.database
                    .ServerValue
                    .TIMESTAMP

        });


        console.log(
            "Stock adjustment saved:",
            historyRef.key
        );


        // ==================================================
        // CLOSE
        // ==================================================

        const modalElement =
            document.getElementById(
                "stockAdjustmentModal"
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


        // ==================================================
        // REFRESH
        // ==================================================

        if (
            typeof renderProductTable ===
            "function"
        ) {

            renderProductTable();

        }


        alert(
            "Stock updated successfully.\n\n" +

            "New Stock: " +

            formatStock(
                newStock
            )

        );

    }

    catch (error) {

        console.error(
            "Save Stock Adjustment Error:",
            error
        );


        alert(
            "Unable to update stock.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// FORMAT STOCK
// ==========================================================

function formatStock(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-PH",
        {
            maximumFractionDigits: 3
        }
    );

}


// ==========================================================
// CLICK STOCK BUTTON
// ==========================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".product-stock-btn"
            );


        if (!button) {

            return;

        }


        const productId =
            button.dataset.productId;


        if (!productId) {

            return;

        }


        openStockAdjustment(
            productId
        );

    }
);


// ==========================================================
// TYPE
// ==========================================================

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target?.id ===
            "stockAdjustmentType"
        ) {

            updateStockPreview();

        }

    }
);


// ==========================================================
// QUANTITY
// ==========================================================

document.addEventListener(
    "input",
    function (event) {

        if (
            event.target?.id ===
            "stockAdjustmentQuantity"
        ) {

            updateStockPreview();

        }

    }
);


// ==========================================================
// SAVE BUTTON
// ==========================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#btnSaveStockAdjustment"
            );


        if (!button) {

            return;

        }


        saveStockAdjustment();

    }
);


// ==========================================================
// GLOBAL
// ==========================================================

window.openStockAdjustment =
    openStockAdjustment;

window.updateStockPreview =
    updateStockPreview;

window.saveStockAdjustment =
    saveStockAdjustment;

window.formatStock =
    formatStock;
