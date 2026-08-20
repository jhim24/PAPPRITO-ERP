// ==========================================================
// PAPPRITO ERP
// PRODUCT STOCK ADJUSTMENT ENGINE V1
// File: assets/js/products/product-stock.js
//
// PURPOSE:
// - Stock In
// - Stock Out
// - Stock Adjustment
// - Stock History
// - Updates products/{productId}/currentStock
//
// IMPORTANT:
// - Does NOT modify Product Save Engine
// - Does NOT modify Product Edit Engine
// - Uses Firebase Realtime Database
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL
// ==========================================================

let stockAdjustmentProductId = null;


// ==========================================================
// OPEN STOCK ADJUSTMENT
// ==========================================================

async function openStockAdjustment(productId) {

    try {

        if (!productId) {

            alert("Invalid Product ID.");

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
                .once("value");


        if (!snapshot.exists()) {

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
        // PRODUCT INFORMATION
        // ==================================================

        const productName =
            document.getElementById(
                "stockProductName"
            );


        if (productName) {

            productName.textContent =
                product.name ||
                "Product";

        }


        const productCode =
            document.getElementById(
                "stockProductCode"
            );


        if (productCode) {

            productCode.textContent =
                product.code ||
                "";

        }


        const currentStock =
            Number(
                product.currentStock || 0
            );


        const currentStockElement =
            document.getElementById(
                "stockCurrentStock"
            );


        if (currentStockElement) {

            currentStockElement.textContent =
                formatStockNumber(
                    currentStock
                );

        }


        // ==================================================
        // RESET FORM
        // ==================================================

        const type =
            document.getElementById(
                "stockAdjustmentType"
            );


        if (type) {

            type.value =
                "in";

        }


        const quantity =
            document.getElementById(
                "stockAdjustmentQuantity"
            );


        if (quantity) {

            quantity.value =
                "";

        }


        const reason =
            document.getElementById(
                "stockAdjustmentReason"
            );


        if (reason) {

            reason.value =
                "";

        }


        updateStockAdjustmentPreview();


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
                "Bootstrap JavaScript is not loaded."
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
// UPDATE PREVIEW
// ==========================================================

async function updateStockAdjustmentPreview() {

    const productId =
        stockAdjustmentProductId;


    if (!productId) {

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


    try {

        const snapshot =
            await db
                .ref(
                    "products/" +
                    productId
                )
                .once("value");


        const product =
            snapshot.val() || {};


        const currentStock =
            Number(
                product.currentStock || 0
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

            newStock =
                0;

        }


        const preview =
            document.getElementById(
                "stockNewStock"
            );


        if (preview) {

            preview.textContent =
                formatStockNumber(
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
// SAVE STOCK ADJUSTMENT
// ==========================================================

async function saveStockAdjustment() {

    try {

        if (!stockAdjustmentProductId) {

            alert(
                "Please select a product."
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
        // VALIDATION
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
        // GET CURRENT PRODUCT
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


        if (!snapshot.exists()) {

            throw new Error(
                "Product no longer exists."
            );

        }


        const product =
            snapshot.val() || {};


        const currentStock =
            Number(
                product.currentStock || 0
            );


        // ==================================================
        // CALCULATE NEW STOCK
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
        // PREVENT NEGATIVE STOCK
        // ==================================================

        if (
            newStock < 0
        ) {

            alert(
                "Stock cannot become negative.\n\n" +
                "Current Stock: " +
                formatStockNumber(currentStock) +
                "\n" +
                "Stock Out: " +
                formatStockNumber(quantity)
            );

            return;

        }


        // ==================================================
        // CONFIRM
        // ==================================================

        const typeText =

            type === "in"

                ? "Stock In"

                : type === "out"

                    ? "Stock Out"

                    : "Stock Adjustment";


        const confirmed =
            confirm(

                typeText +
                "\n\n" +

                "Product: " +
                (
                    product.name ||
                    "Product"
                ) +

                "\n\n" +

                "Previous Stock: " +
                formatStockNumber(
                    currentStock
                ) +

                "\n" +

                "Quantity: " +
                formatStockNumber(
                    quantity
                ) +

                "\n" +

                "New Stock: " +
                formatStockNumber(
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
        // CREATE STOCK HISTORY
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
        // CLOSE MODAL
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
        // SUCCESS
        // ==================================================

        showStockAdjustmentStatus(
            "Stock updated successfully."
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

function formatStockNumber(
    value
) {

    const number =
        Number(
            value || 0
        );


    return number
        .toLocaleString(
            "en-PH",
            {
                maximumFractionDigits: 3
            }
        );

}


// ==========================================================
// STATUS MESSAGE
// ==========================================================

function showStockAdjustmentStatus(
    message
) {

    const status =
        document.getElementById(
            "posStatus"
        ) ||
        document.getElementById(
            "productStatusMessage"
        );


    if (!status) {

        alert(message);

        return;

    }


    status.textContent =
        message;


    status.classList.add(
        "show"
    );


    setTimeout(
        function () {

            status.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ==========================================================
// EVENT LISTENERS
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
// TYPE CHANGE
// ==========================================================

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target &&
            event.target.id ===
            "stockAdjustmentType"
        ) {

            updateStockAdjustmentPreview();

        }

    }
);


// ==========================================================
// QUANTITY INPUT
// ==========================================================

document.addEventListener(
    "input",
    function (event) {

        if (
            event.target &&
            event.target.id ===
            "stockAdjustmentQuantity"
        ) {

            updateStockAdjustmentPreview();

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
// GLOBAL EXPORTS
// ==========================================================

window.openStockAdjustment =
    openStockAdjustment;

window.updateStockAdjustmentPreview =
    updateStockAdjustmentPreview;

window.saveStockAdjustment =
    saveStockAdjustment;
