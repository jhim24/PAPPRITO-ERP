// ==========================================================
// PAPPRITO ERP
// STOCK IN ENGINE V1
// File: assets/js/stock-in/stock-in.js
//
// FUNCTIONS:
// - Load Products
// - Load Suppliers
// - Select Product
// - Calculate New Stock
// - Calculate Total Cost
// - Save Stock In
// - Update Product Current Stock
// - Save Stock In Transaction
// - Load Stock In History
// - Search History
// - Reset Form
// - Refresh
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let stockInInitialized = false;

let stockInProducts = {};

let stockInSuppliers = {};

let stockInHistory = {};

let stockInHistoryRef = null;

let stockInProductRef = null;


// ==========================================================
// FIREBASE CHECK
// ==========================================================

function stockInFirebaseReady() {

    return (
        typeof db !== "undefined" &&
        db &&
        typeof db.ref === "function"
    );

}


// ==========================================================
// GET ELEMENT
// ==========================================================

function stockInElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// FORMAT NUMBER
// ==========================================================

function formatStockInNumber(
    value
) {

    const number =
        Number(value) || 0;

    return number.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ==========================================================
// FORMAT CURRENCY
// ==========================================================

function formatStockInCurrency(
    value
) {

    const number =
        Number(value) || 0;

    return "₱" +
        number.toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================================
// TODAY
// ==========================================================

function getStockInToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


// ==========================================================
// GENERATE REFERENCE
// ==========================================================

function generateStockInReference() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );

    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );

    return (
        "SI-" +
        year +
        month +
        day +
        "-" +
        hours +
        minutes +
        seconds
    );

}


// ==========================================================
// SET DEFAULT VALUES
// ==========================================================

function setStockInDefaults() {

    const reference =
        stockInElement(
            "stockInReference"
        );

    if (reference) {

        reference.value =
            generateStockInReference();

    }


    const date =
        stockInElement(
            "stockInDate"
        );

    if (date) {

        date.value =
            getStockInToday();

    }


    const quantity =
        stockInElement(
            "stockInQuantity"
        );

    if (quantity) {

        quantity.value =
            "1";

    }


    const unit =
        stockInElement(
            "stockInUnit"
        );

    if (unit) {

        unit.value =
            "pcs";

    }


    const unitCost =
        stockInElement(
            "stockInUnitCost"
        );

    if (unitCost) {

        unitCost.value =
            "0.00";

    }


    updateStockInCalculation();

}


// ==========================================================
// LOAD PRODUCTS
// ==========================================================

async function loadStockInProducts() {

    if (!stockInFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }


    const snapshot =
        await db
            .ref(
                "products"
            )
            .once(
                "value"
            );


    stockInProducts =
        snapshot.val() || {};


    populateStockInProducts();


    console.log(
        "Stock In products loaded:",
        Object.keys(
            stockInProducts
        ).length
    );

}


// ==========================================================
// POPULATE PRODUCTS
// ==========================================================

function populateStockInProducts() {

    const select =
        stockInElement(
            "stockInProduct"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">

            Select Product

        </option>

    `;


    Object.entries(
        stockInProducts
    )
    .forEach(
        function([
            id,
            product
        ]) {

            if (!product) {

                return;

            }


            const name =
                product.name ||
                product.productName ||
                "Unnamed Product";


            const code =
                product.code ||
                product.productCode ||
                "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                id;


            option.textContent =
                code
                    ? `${code} - ${name}`
                    : name;


            select.appendChild(
                option
            );

        }
    );

}


// ==========================================================
// LOAD SUPPLIERS
// ==========================================================

async function loadStockInSuppliers() {

    if (!stockInFirebaseReady()) {

        return;

    }


    try {

        const snapshot =
            await db
                .ref(
                    "suppliers"
                )
                .once(
                    "value"
                );


        stockInSuppliers =
            snapshot.val() || {};


        populateStockInSuppliers();

    }

    catch (error) {

        console.warn(
            "Supplier loading skipped:",
            error
        );

    }

}


// ==========================================================
// POPULATE SUPPLIERS
// ==========================================================

function populateStockInSuppliers() {

    const select =
        stockInElement(
            "stockInSupplier"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">

            Select Supplier

        </option>

    `;


    Object.entries(
        stockInSuppliers
    )
    .forEach(
        function([
            id,
            supplier
        ]) {

            if (!supplier) {

                return;

            }


            const name =
                supplier.name ||
                supplier.supplierName ||
                supplier.companyName ||
                "Unnamed Supplier";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                id;


            option.textContent =
                name;


            select.appendChild(
                option
            );

        }
    );

}


// ==========================================================
// PRODUCT CHANGE
// ==========================================================

function handleStockInProductChange() {

    const select =
        stockInElement(
            "stockInProduct"
        );


    if (!select) {

        return;

    }


    const productId =
        select.value;


    if (!productId) {

        clearStockInProductInfo();

        return;

    }


    const product =
        stockInProducts[
            productId
        ];


    if (!product) {

        clearStockInProductInfo();

        return;

    }


    const currentStock =
        Number(
            product.currentStock ??
            product.stock ??
            product.quantity ??
            0
        );


    const unit =
        product.unit ||
        product.uom ||
        "pcs";


    const cost =
        Number(
            product.costPrice ??
            product.unitCost ??
            product.purchasePrice ??
            0
        );


    const currentStockInput =
        stockInElement(
            "stockInCurrentStock"
        );


    if (currentStockInput) {

        currentStockInput.value =
            currentStock;

    }


    const unitInput =
        stockInElement(
            "stockInUnit"
        );


    if (unitInput) {

        unitInput.value =
            unit;

    }


    const costInput =
        stockInElement(
            "stockInUnitCost"
        );


    if (costInput) {

        costInput.value =
            cost.toFixed(2);

    }


    const info =
        stockInElement(
            "stockInProductInfo"
        );


    if (info) {

        const code =
            product.code ||
            product.productCode ||
            "";


        const category =
            product.categoryName ||
            product.category ||
            "";


        info.textContent =
            [
                code,
                category
                    ? "Category: " + category
                    : "",
                "Current Stock: " +
                    formatStockInNumber(
                        currentStock
                    )
            ]
            .filter(Boolean)
            .join(
                " • "
            );

    }


    updateStockInCalculation();

}


// ==========================================================
// CLEAR PRODUCT INFO
// ==========================================================

function clearStockInProductInfo() {

    const currentStock =
        stockInElement(
            "stockInCurrentStock"
        );


    if (currentStock) {

        currentStock.value =
            "0";

    }


    const unit =
        stockInElement(
            "stockInUnit"
        );


    if (unit) {

        unit.value =
            "pcs";

    }


    const cost =
        stockInElement(
            "stockInUnitCost"
        );


    if (cost) {

        cost.value =
            "0.00";

    }


    const info =
        stockInElement(
            "stockInProductInfo"
        );


    if (info) {

        info.textContent =
            "Select a product to view its information.";

    }


    updateStockInCalculation();

}


// ==========================================================
// CALCULATE STOCK
// ==========================================================

function updateStockInCalculation() {

    const currentStock =
        Number(
            stockInElement(
                "stockInCurrentStock"
            )?.value
        ) || 0;


    const quantity =
        Number(
            stockInElement(
                "stockInQuantity"
            )?.value
        ) || 0;


    const unitCost =
        Number(
            stockInElement(
                "stockInUnitCost"
            )?.value
        ) || 0;


    const newStock =
        currentStock +
        quantity;


    const totalCost =
        quantity *
        unitCost;


    const newStockInput =
        stockInElement(
            "stockInNewStock"
        );


    if (newStockInput) {

        newStockInput.value =
            newStock;

    }


    const totalCostInput =
        stockInElement(
            "stockInTotalCost"
        );


    if (totalCostInput) {

        totalCostInput.value =
            totalCost.toFixed(2);

    }

}


// ==========================================================
// VALIDATE FORM
// ==========================================================

function validateStockInForm() {

    const productId =
        stockInElement(
            "stockInProduct"
        )?.value;


    const quantity =
        Number(
            stockInElement(
                "stockInQuantity"
            )?.value
        );


    const unitCost =
        Number(
            stockInElement(
                "stockInUnitCost"
            )?.value
        );


    const date =
        stockInElement(
            "stockInDate"
        )?.value;


    if (!productId) {

        alert(
            "Please select a product."
        );

        return false;

    }


    if (
        !quantity ||
        quantity <= 0
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return false;

    }


    if (
        Number.isNaN(unitCost) ||
        unitCost < 0
    ) {

        alert(
            "Please enter a valid unit cost."
        );

        return false;

    }


    if (!date) {

        alert(
            "Please select the Stock In date."
        );

        return false;

    }


    return true;

}


// ==========================================================
// SAVE STOCK IN
// ==========================================================

async function saveStockIn(
    event
) {

    if (event) {

        event.preventDefault();

    }


    if (!validateStockInForm()) {

        return;

    }


    if (!stockInFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    const saveButton =
        stockInElement(
            "stockInSaveBtn"
        );


    const originalButtonHTML =
        saveButton
            ? saveButton.innerHTML
            : "";


    try {

        if (saveButton) {

            saveButton.disabled =
                true;


            saveButton.innerHTML = `

                <span
                    class="spinner-border spinner-border-sm me-2"
                ></span>

                Saving...

            `;

        }


        const productId =
            stockInElement(
                "stockInProduct"
            ).value;


        const product =
            stockInProducts[
                productId
            ];


        if (!product) {

            throw new Error(
                "Selected product was not found."
            );

        }


        const quantity =
            Number(
                stockInElement(
                    "stockInQuantity"
                ).value
            );


        const unitCost =
            Number(
                stockInElement(
                    "stockInUnitCost"
                ).value
            );


        const date =
            stockInElement(
                "stockInDate"
            ).value;


        const reference =
            stockInElement(
                "stockInReference"
            ).value ||
            generateStockInReference();


        const supplierSelect =
            stockInElement(
                "stockInSupplier"
            );


        const supplierId =
            supplierSelect
                ? supplierSelect.value
                : "";


        const supplierName =
            supplierId &&
            stockInSuppliers[
                supplierId
            ]
                ? (
                    stockInSuppliers[
                        supplierId
                    ].name ||
                    stockInSuppliers[
                        supplierId
                    ].supplierName ||
                    stockInSuppliers[
                        supplierId
                    ].companyName ||
                    ""
                )
                : "";


        const invoice =
            stockInElement(
                "stockInInvoice"
            ).value
            .trim();


        const receivedBy =
            stockInElement(
                "stockInReceivedBy"
            ).value
            .trim();


        const notes =
            stockInElement(
                "stockInNotes"
            ).value
            .trim();


        const unit =
            stockInElement(
                "stockInUnit"
            ).value ||
            product.unit ||
            "pcs";


        const productName =
            product.name ||
            product.productName ||
            "";


        const productCode =
            product.code ||
            product.productCode ||
            "";


        const totalCost =
            quantity *
            unitCost;


        // ==================================================
        // PRODUCT STOCK TRANSACTION
        // ==================================================

        const productRef =
            db.ref(
                "products/" +
                productId
            );


        let updatedStock = 0;


        await productRef.transaction(
            function(currentProduct) {

                if (
                    currentProduct === null
                ) {

                    return currentProduct;

                }


                const currentStock =
                    Number(
                        currentProduct.currentStock ??
                        currentProduct.stock ??
                        currentProduct.quantity ??
                        0
                    );


                updatedStock =
                    currentStock +
                    quantity;


                currentProduct.currentStock =
                    updatedStock;


                /*
                 * Keep legacy stock field
                 * synchronized when it exists.
                 */

                if (
                    Object.prototype.hasOwnProperty.call(
                        currentProduct,
                        "stock"
                    )
                ) {

                    currentProduct.stock =
                        updatedStock;

                }


                /*
                 * Keep quantity synchronized
                 * when the existing product
                 * uses quantity.
                 */

                if (
                    Object.prototype.hasOwnProperty.call(
                        currentProduct,
                        "quantity"
                    )
                ) {

                    currentProduct.quantity =
                        updatedStock;

                }


                /*
                 * Update cost price to the
                 * latest received unit cost.
                 */

                if (
                    unitCost >= 0
                ) {

                    currentProduct.costPrice =
                        unitCost;

                }


                /*
                 * Inventory metadata
                 */

                currentProduct.updatedAt =
                    firebase.database.ServerValue.TIMESTAMP;


                return currentProduct;

            }
        );


        // ==================================================
        // CREATE STOCK-IN TRANSACTION
        // ==================================================

        const transactionRef =
            db
                .ref(
                    "stockInTransactions"
                )
                .push();


        const transactionId =
            transactionRef.key;


        const transactionData = {

            id:
                transactionId,

            reference:
                reference,

            date:
                date,

            timestamp:
                firebase.database.ServerValue.TIMESTAMP,

            productId:
                productId,

            productCode:
                productCode,

            productName:
                productName,

            supplierId:
                supplierId,

            supplierName:
                supplierName,

            invoice:
                invoice,

            quantity:
                quantity,

            unit:
                unit,

            unitCost:
                unitCost,

            totalCost:
                totalCost,

            previousStock:
                updatedStock -
                quantity,

            newStock:
                updatedStock,

            receivedBy:
                receivedBy,

            notes:
                notes,

            status:
                "Completed"

        };


        await transactionRef.set(
            transactionData
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            "Stock In saved successfully.\n\n" +
            productName +
            "\n" +
            "Quantity: " +
            formatStockInNumber(
                quantity
            ) +
            "\n" +
            "New Stock: " +
            formatStockInNumber(
                updatedStock
            ) +
            "\n" +
            "Total Cost: " +
            formatStockInCurrency(
                totalCost
            )
        );


        resetStockInForm();


        await loadStockInProducts();

        await loadStockInHistory();


        console.log(
            "Stock In saved:",
            transactionData
        );

    }

    catch (error) {

        console.error(
            "Stock In Save Error:",
            error
        );


        alert(
            "Unable to save Stock In.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

    finally {

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.innerHTML =
                originalButtonHTML ||
                `

                    <i class="fa-solid fa-floppy-disk"></i>

                    Save Stock In

                `;

        }

    }

}


// ==========================================================
// LOAD HISTORY
// ==========================================================

async function loadStockInHistory() {

    if (!stockInFirebaseReady()) {

        return;

    }


    try {

        if (stockInHistoryRef) {

            stockInHistoryRef.off();

        }


        stockInHistoryRef =
            db.ref(
                "stockInTransactions"
            );


        const snapshot =
            await stockInHistoryRef
                .once(
                    "value"
                );


        stockInHistory =
            snapshot.val() || {};


        renderStockInHistory();

        updateStockInSummary();

    }

    catch (error) {

        console.error(
            "Stock In History Error:",
            error
        );

    }

}


// ==========================================================
// RENDER HISTORY
// ==========================================================

function renderStockInHistory() {

    const tbody =
        stockInElement(
            "stockInHistoryBody"
        );


    if (!tbody) {

        return;

    }


    const search =
        (
            stockInElement(
                "stockInSearch"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const transactions =
        Object.entries(
            stockInHistory
        )
        .map(
            function([
                id,
                transaction
            ]) {

                return {
                    id,
                    ...transaction
                };

            }
        )
        .filter(
            function(transaction) {

                if (!search) {

                    return true;

                }


                const text =
                    [

                        transaction.reference,

                        transaction.productName,

                        transaction.productCode,

                        transaction.supplierName,

                        transaction.invoice,

                        transaction.receivedBy

                    ]
                    .join(
                        " "
                    )
                    .toLowerCase();


                return text.includes(
                    search
                );

            }
        )
        .sort(
            function(a, b) {

                return (
                    Number(
                        b.timestamp
                    ) || 0
                ) -
                (
                    Number(
                        a.timestamp
                    ) || 0
                );

            }
        );


    if (
        transactions.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center py-5 text-muted"
                >

                    <i
                        class="
                            fa-solid
                            fa-box-open
                            fs-3
                            mb-2
                        "
                    ></i>

                    <div>

                        No stock-in transactions found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        transactions
        .map(
            function(transaction) {

                const status =
                    transaction.status ||
                    "Completed";


                return `

                    <tr>

                        <td>

                            <strong>

                                ${escapeStockInHTML(
                                    transaction.reference ||
                                    "-"
                                )}

                            </strong>

                        </td>


                        <td>

                            ${escapeStockInHTML(
                                transaction.date ||
                                "-"
                            )}

                        </td>


                        <td>

                            <strong>

                                ${escapeStockInHTML(
                                    transaction.productName ||
                                    "-"
                                )}

                            </strong>

                            ${
                                transaction.productCode
                                    ? `
                                        <div class="small text-muted">

                                            ${escapeStockInHTML(
                                                transaction.productCode
                                            )}

                                        </div>
                                    `
                                    : ""
                            }

                        </td>


                        <td>

                            ${escapeStockInHTML(
                                transaction.supplierName ||
                                "-"
                            )}

                        </td>


                        <td class="text-end">

                            ${formatStockInNumber(
                                transaction.quantity
                            )}

                        </td>


                        <td>

                            ${escapeStockInHTML(
                                transaction.unit ||
                                "-"
                            )}

                        </td>


                        <td class="text-end">

                            ${formatStockInCurrency(
                                transaction.unitCost
                            )}

                        </td>


                        <td class="text-end fw-bold">

                            ${formatStockInCurrency(
                                transaction.totalCost
                            )}

                        </td>


                        <td>

                            ${escapeStockInHTML(
                                transaction.receivedBy ||
                                "-"
                            )}

                        </td>


                        <td class="text-center">

                            <span class="stock-status stock-status-success">

                                ${escapeStockInHTML(
                                    status
                                )}

                            </span>

                        </td>

                    </tr>

                `;

            }
        )
        .join(
            ""
        );

}


// ==========================================================
// UPDATE SUMMARY
// ==========================================================

function updateStockInSummary() {

    const transactions =
        Object.values(
            stockInHistory
        );


    const totalTransactions =
        transactions.length;


    let totalQuantity = 0;

    let totalValue = 0;

    let todayCount = 0;


    const today =
        getStockInToday();


    transactions.forEach(
        function(transaction) {

            totalQuantity +=
                Number(
                    transaction.quantity
                ) || 0;


            totalValue +=
                Number(
                    transaction.totalCost
                ) || 0;


            if (
                transaction.date ===
                today
            ) {

                todayCount++;

            }

        }
    );


    const totalTransactionsElement =
        stockInElement(
            "stockInTotalTransactions"
        );


    if (
        totalTransactionsElement
    ) {

        totalTransactionsElement.textContent =
            formatStockInNumber(
                totalTransactions
            );

    }


    const totalQuantityElement =
        stockInElement(
            "stockInTotalQuantity"
        );


    if (
        totalQuantityElement
    ) {

        totalQuantityElement.textContent =
            formatStockInNumber(
                totalQuantity
            );

    }


    const totalValueElement =
        stockInElement(
            "stockInTotalValue"
        );


    if (
        totalValueElement
    ) {

        totalValueElement.textContent =
            formatStockInCurrency(
                totalValue
            );

    }


    const todayElement =
        stockInElement(
            "stockInToday"
        );


    if (todayElement) {

        todayElement.textContent =
            formatStockInNumber(
                todayCount
            );

    }

}


// ==========================================================
// SEARCH
// ==========================================================

function handleStockInSearch() {

    renderStockInHistory();

}


// ==========================================================
// RESET FORM
// ==========================================================

function resetStockInForm() {

    const form =
        stockInElement(
            "stockInForm"
        );


    if (form) {

        form.reset();

    }


    setStockInDefaults();


    clearStockInProductInfo();


    const product =
        stockInElement(
            "stockInProduct"
        );


    if (product) {

        product.value =
            "";

    }


    updateStockInCalculation();

}


// ==========================================================
// REFRESH
// ==========================================================

async function refreshStockIn() {

    try {

        await loadStockInProducts();

        await loadStockInSuppliers();

        await loadStockInHistory();

        console.log(
            "Stock In refreshed."
        );

    }

    catch (error) {

        console.error(
            "Stock In refresh error:",
            error
        );

    }

}


// ==========================================================
// CANCEL
// ==========================================================

function cancelStockIn() {

    const confirmed =
        window.confirm(
            "Cancel this Stock In transaction?"
        );


    if (!confirmed) {

        return;

    }


    resetStockInForm();

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeStockInHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================================
// STOP LISTENER
// ==========================================================

function stopStockInListener() {

    if (stockInHistoryRef) {

        stockInHistoryRef.off();

        stockInHistoryRef =
            null;

    }


    if (stockInProductRef) {

        stockInProductRef.off();

        stockInProductRef =
            null;

    }


    console.log(
        "Stock In listeners stopped."
    );

}


// ==========================================================
// EVENT BINDING
// ==========================================================

function bindStockInEvents() {

    const form =
        stockInElement(
            "stockInForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveStockIn
        );

    }


    const product =
        stockInElement(
            "stockInProduct"
        );


    if (product) {

        product.addEventListener(
            "change",
            handleStockInProductChange
        );

    }


    const quantity =
        stockInElement(
            "stockInQuantity"
        );


    if (quantity) {

        quantity.addEventListener(
            "input",
            updateStockInCalculation
        );

    }


    const unitCost =
        stockInElement(
            "stockInUnitCost"
        );


    if (unitCost) {

        unitCost.addEventListener(
            "input",
            updateStockInCalculation
        );

    }


    const search =
        stockInElement(
            "stockInSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            handleStockInSearch
        );

    }


    const refresh =
        stockInElement(
            "stockInRefreshBtn"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            refreshStockIn
        );

    }


    const reset =
        stockInElement(
            "stockInResetBtn"
        );


    if (reset) {

        reset.addEventListener(
            "click",
            function() {

                setTimeout(
                    function() {

                        setStockInDefaults();

                        clearStockInProductInfo();

                    },
                    0
                );

            }
        );

    }


    const cancel =
        stockInElement(
            "stockInCancelBtn"
        );


    if (cancel) {

        cancel.addEventListener(
            "click",
            cancelStockIn
        );

    }

}


// ==========================================================
// INITIALIZE STOCK IN
// ==========================================================

async function initializeStockIn() {

    console.log(
        "=========================================="
    );


    console.log(
        "PAPPRITO STOCK IN INITIALIZING..."
    );


    console.log(
        "=========================================="
    );


    /*
     * Prevent duplicate initialization
     * when navigating back to Stock In.
     */

    if (stockInInitialized) {

        stockInInitialized =
            false;

    }


    if (!stockInFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        bindStockInEvents();

        setStockInDefaults();

        await loadStockInProducts();

        await loadStockInSuppliers();

        await loadStockInHistory();


        stockInInitialized =
            true;


        console.log(
            "PAPPRITO Stock In initialized successfully."
        );


    }

    catch (error) {

        console.error(
            "Stock In Initialization Error:",
            error
        );


        const content =
            document.getElementById(
                "content"
            );


        if (content) {

            content.insertAdjacentHTML(
                "afterbegin",
                `

                    <div class="alert alert-danger m-3">

                        <strong>

                            Stock In Error

                        </strong>

                        <div class="mt-2">

                            ${escapeStockInHTML(
                                error.message ||
                                error
                            )}

                        </div>

                    </div>

                `
            );

        }

    }

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializeStockIn =
    initializeStockIn;


window.loadStockInProducts =
    loadStockInProducts;


window.loadStockInSuppliers =
    loadStockInSuppliers;


window.loadStockInHistory =
    loadStockInHistory;


window.saveStockIn =
    saveStockIn;


window.resetStockInForm =
    resetStockInForm;


window.refreshStockIn =
    refreshStockIn;


window.cancelStockIn =
    cancelStockIn;


window.updateStockInCalculation =
    updateStockInCalculation;


window.stopStockInListener =
    stopStockInListener;


console.log(
    "PAPPRITO Stock In Engine V1 loaded."
);
