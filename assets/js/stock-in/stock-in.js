// ==========================================================
// PAPPRITO ERP
// STOCK IN ENGINE V1
// File: assets/js/stock-in/stock-in.js
//
// STOCK FLOW:
//
// PURCHASE / RECEIVING
//        ↓
//     STOCK IN
//        ↓
//    STOCK ROOM
//        ↓
//    PRODUCTION
//        ↓
// FINISHED INVENTORY
//
// FUNCTIONS:
// - Load Stock In
// - Add Stock In
// - Edit Stock In
// - Delete Stock In
// - Search Stock In
// - Filter Date
// - Supplier Dropdown
// - Raw Material Dropdown
// - Auto Total Cost
// - Stock Room Update
// - Firebase Realtime Database
// - Stock In Summary
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let stockInInitialized = false;

let stockInData = {};

let suppliersStockInData = {};

let rawMaterialsStockInData = {};

let editingStockInId = null;


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
// ELEMENT HELPER
// ==========================================================

function stockInElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeStockInHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// NUMBER HELPER
// ==========================================================

function stockInNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==========================================================
// CURRENCY
// ==========================================================

function formatStockInAmount(value) {

    return stockInNumber(value)
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================================
// DATE
// ==========================================================

function getStockInToday() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
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
// GENERATE STOCK IN NUMBER
// ==========================================================

function generateStockInNumber() {

    let highestNumber = 0;


    Object.values(
        stockInData
    ).forEach(
        function(transaction) {

            if (!transaction) {

                return;

            }


            const value =
                String(
                    transaction.stockInNo ||
                    transaction.referenceNo ||
                    ""
                )
                .toUpperCase();


            const match =
                value.match(
                    /SIN-(\d+)/
                );


            if (match) {

                const number =
                    Number(
                        match[1]
                    );


                if (
                    number >
                    highestNumber
                ) {

                    highestNumber =
                        number;

                }

            }

        }
    );


    return (
        "SIN-" +
        String(
            highestNumber + 1
        )
        .padStart(
            5,
            "0"
        )
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


        suppliersStockInData =
            snapshot.val() || {};


        renderStockInSupplierOptions();

    }

    catch (error) {

        console.error(
            "Stock In Supplier Loading Error:",
            error
        );

    }

}


// ==========================================================
// LOAD RAW MATERIALS
// ==========================================================

async function loadStockInRawMaterials() {

    if (!stockInFirebaseReady()) {

        return;

    }


    try {

        const snapshot =
            await db
                .ref(
                    "rawMaterials"
                )
                .once(
                    "value"
                );


        rawMaterialsStockInData =
            snapshot.val() || {};


        renderStockInRawMaterialOptions();

    }

    catch (error) {

        console.error(
            "Stock In Raw Material Loading Error:",
            error
        );

    }

}


// ==========================================================
// SUPPLIER OPTIONS
// ==========================================================

function renderStockInSupplierOptions() {

    const select =
        stockInElement(
            "stockInSupplier"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    let html = `

        <option value="">
            Select Supplier
        </option>

    `;


    const suppliers =
        Object.entries(
            suppliersStockInData
        )
        .map(
            function([
                id,
                supplier
            ]) {

                return {
                    id,
                    ...supplier
                };

            }
        )
        .filter(
            function(supplier) {

                return (
                    String(
                        supplier.status ||
                        "Active"
                    ).toLowerCase() ===
                    "active"
                );

            }
        )
        .sort(
            function(a, b) {

                return String(
                    a.name ||
                    a.companyName ||
                    ""
                )
                .localeCompare(
                    String(
                        b.name ||
                        b.companyName ||
                        ""
                    )
                );

            }
        );


    suppliers.forEach(
        function(supplier) {

            const name =
                supplier.name ||
                supplier.companyName ||
                "Unnamed Supplier";


            const code =
                supplier.code ||
                supplier.supplierCode ||
                "";


            html += `

                <option
                    value="${escapeStockInHTML(supplier.id)}"
                >

                    ${escapeStockInHTML(name)}
                    ${
                        code
                            ? " (" +
                              escapeStockInHTML(code) +
                              ")"
                            : ""
                    }

                </option>

            `;

        }
    );


    select.innerHTML =
        html;


    if (currentValue) {

        select.value =
            currentValue;

    }

}


// ==========================================================
// RAW MATERIAL OPTIONS
// ==========================================================

function renderStockInRawMaterialOptions() {

    const select =
        stockInElement(
            "stockInRawMaterial"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    let html = `

        <option value="">
            Select Raw Material
        </option>

    `;


    const materials =
        Object.entries(
            rawMaterialsStockInData
        )
        .map(
            function([
                id,
                material
            ]) {

                return {
                    id,
                    ...material
                };

            }
        )
        .filter(
            function(material) {

                return (
                    material.status ===
                    undefined ||
                    String(
                        material.status
                    ).toLowerCase() !==
                    "inactive"
                );

            }
        )
        .sort(
            function(a, b) {

                return String(
                    a.name ||
                    a.materialName ||
                    ""
                )
                .localeCompare(
                    String(
                        b.name ||
                        b.materialName ||
                        ""
                    )
                );

            }
        );


    materials.forEach(
        function(material) {

            const name =
                material.name ||
                material.materialName ||
                material.rawMaterialName ||
                "Unnamed Material";


            const code =
                material.code ||
                material.materialCode ||
                "";


            const unit =
                material.unit ||
                material.uom ||
                "";


            html += `

                <option
                    value="${escapeStockInHTML(material.id)}"
                    data-unit="${escapeStockInHTML(unit)}"
                >

                    ${escapeStockInHTML(name)}

                    ${
                        code
                            ? " (" +
                              escapeStockInHTML(code) +
                              ")"
                            : ""
                    }

                </option>

            `;

        }
    );


    select.innerHTML =
        html;


    if (currentValue) {

        select.value =
            currentValue;

    }


    updateStockInSelectedMaterial();

}


// ==========================================================
// MATERIAL CHANGE
// ==========================================================

function updateStockInSelectedMaterial() {

    const select =
        stockInElement(
            "stockInRawMaterial"
        );


    if (!select) {

        return;

    }


    const materialId =
        select.value;


    const material =
        rawMaterialsStockInData[
            materialId
        ];


    if (!material) {

        return;

    }


    const unit =
        material.unit ||
        material.uom ||
        "";


    const unitElement =
        stockInElement(
            "stockInUnit"
        );


    if (
        unitElement &&
        !unitElement.value
    ) {

        unitElement.value =
            unit;

    }


    const costElement =
        stockInElement(
            "stockInUnitCost"
        );


    if (
        costElement &&
        !costElement.value
    ) {

        const cost =
            material.cost ||
            material.unitCost ||
            material.purchaseCost ||
            material.averageCost ||
            0;


        if (stockInNumber(cost) > 0) {

            costElement.value =
                cost;

        }

    }


    calculateStockInTotal();

}


// ==========================================================
// CALCULATE TOTAL
// ==========================================================

function calculateStockInTotal() {

    const quantity =
        stockInNumber(
            stockInElement(
                "stockInQuantity"
            )?.value
        );


    const unitCost =
        stockInNumber(
            stockInElement(
                "stockInUnitCost"
            )?.value
        );


    const total =
        quantity *
        unitCost;


    const totalElement =
        stockInElement(
            "stockInTotalCost"
        );


    if (totalElement) {

        totalElement.value =
            total.toFixed(2);

    }


    const display =
        stockInElement(
            "stockInTotalDisplay"
        );


    if (display) {

        display.textContent =
            formatStockInAmount(
                total
            );

    }


    return total;

}


// ==========================================================
// OPEN MODAL
// ==========================================================

function openStockInModal() {

    const modalElement =
        stockInElement(
            "stockInModal"
        );


    if (
        !modalElement ||
        typeof bootstrap === "undefined"
    ) {

        console.error(
            "Stock In modal not available."
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


    editingStockInId =
        null;


    const hiddenId =
        stockInElement(
            "stockInId"
        );


    if (hiddenId) {

        hiddenId.value =
            "";

    }


    const number =
        stockInElement(
            "stockInNo"
        );


    if (number) {

        number.value =
            generateStockInNumber();

    }


    const date =
        stockInElement(
            "stockInDate"
        );


    if (date) {

        date.value =
            getStockInToday();

    }


    const destination =
        stockInElement(
            "stockInDestination"
        );


    if (destination) {

        destination.value =
            "Stock Room";

    }


    const status =
        stockInElement(
            "stockInStatus"
        );


    if (status) {

        status.value =
            "Posted";

    }


    const title =
        stockInElement(
            "stockInModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-arrow-down"></i>

            Add Stock In

        `;

    }


    const saveText =
        stockInElement(
            "stockInSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Stock In";

    }


    calculateStockInTotal();

}


// ==========================================================
// LOAD STOCK IN
// ==========================================================

async function loadStockIn() {

    if (!stockInFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }


    const snapshot =
        await db
            .ref(
                "stockIns"
            )
            .once(
                "value"
            );


    stockInData =
        snapshot.val() || {};


    renderStockIn();

    updateStockInSummary();


    console.log(
        "Stock In loaded:",
        Object.keys(
            stockInData
        ).length
    );

}


// ==========================================================
// GET SUPPLIER NAME
// ==========================================================

function getStockInSupplierName(
    id
) {

    const supplier =
        suppliersStockInData[
            id
        ];


    if (!supplier) {

        return "-";

    }


    return (
        supplier.name ||
        supplier.companyName ||
        "-"
    );

}


// ==========================================================
// GET MATERIAL NAME
// ==========================================================

function getStockInMaterialName(
    id
) {

    const material =
        rawMaterialsStockInData[
            id
        ];


    if (!material) {

        return "-";

    }


    return (
        material.name ||
        material.materialName ||
        material.rawMaterialName ||
        "-"
    );

}


// ==========================================================
// STATUS BADGE
// ==========================================================

function getStockInStatusBadge(
    status
) {

    const value =
        String(
            status ||
            "Posted"
        )
        .toLowerCase();


    if (
        value === "posted"
    ) {

        return `

            <span class="stock-in-status stock-in-status-posted">

                <i class="fa-solid fa-circle-check"></i>

                Posted

            </span>

        `;

    }


    if (
        value === "void"
    ) {

        return `

            <span class="stock-in-status stock-in-status-void">

                <i class="fa-solid fa-circle-xmark"></i>

                Void

            </span>

        `;

    }


    return `

        <span class="stock-in-status">

            ${escapeStockInHTML(status)}

        </span>

    `;

}


// ==========================================================
// RENDER STOCK IN
// ==========================================================

function renderStockIn() {

    const tbody =
        stockInElement(
            "stockInTableBody"
        );


    if (!tbody) {

        return;

    }


    const search =
        String(
            stockInElement(
                "stockInSearch"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const dateFilter =
        stockInElement(
            "stockInDateFilter"
        )?.value ||
        "";


    const records =
        Object.entries(
            stockInData
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

                if (search) {

                    const searchText =
                        [

                            transaction.stockInNo,

                            transaction.referenceNo,

                            transaction.invoiceNo,

                            transaction.supplierName,

                            transaction.materialName,

                            transaction.destination,

                            transaction.notes

                        ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !searchText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                if (
                    dateFilter &&
                    transaction.date !==
                    dateFilter
                ) {

                    return false;

                }


                return true;

            }
        )
        .sort(
            function(a, b) {

                const dateA =
                    String(
                        a.date ||
                        ""
                    );


                const dateB =
                    String(
                        b.date ||
                        ""
                    );


                if (
                    dateA !==
                    dateB
                ) {

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return stockInNumber(
                    b.createdAt
                ) -
                stockInNumber(
                    a.createdAt
                );

            }
        );


    const recordCount =
        stockInElement(
            "stockInRecordCount"
        );


    if (recordCount) {

        recordCount.textContent =
            records.length +
            (
                records.length === 1
                    ? " Transaction"
                    : " Transactions"
            );

    }


    if (
        records.length === 0
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
                            fa-boxes-stacked
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
        records
        .map(
            function(transaction) {

                const quantity =
                    stockInNumber(
                        transaction.quantity
                    );


                const unitCost =
                    stockInNumber(
                        transaction.unitCost
                    );


                const total =
                    stockInNumber(
                        transaction.totalCost
                    );


                return `

                    <tr>

                        <td>

                            <strong>

                                ${escapeStockInHTML(
                                    transaction.stockInNo ||
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

                            ${escapeStockInHTML(
                                transaction.supplierName ||
                                getStockInSupplierName(
                                    transaction.supplierId
                                )
                            )}

                        </td>


                        <td>

                            <strong>

                                ${escapeStockInHTML(
                                    transaction.materialName ||
                                    getStockInMaterialName(
                                        transaction.rawMaterialId
                                    )
                                )}

                            </strong>

                        </td>


                        <td class="text-end">

                            ${quantity.toLocaleString()}

                        </td>


                        <td>

                            ${escapeStockInHTML(
                                transaction.unit ||
                                "-"
                            )}

                        </td>


                        <td class="text-end">

                            ₱
                            ${formatStockInAmount(
                                unitCost
                            )}

                        </td>


                        <td class="text-end">

                            <strong>

                                ₱
                                ${formatStockInAmount(
                                    total
                                )}

                            </strong>

                        </td>


                        <td>

                            ${getStockInStatusBadge(
                                transaction.status
                            )}

                        </td>


                        <td class="text-center">

                            <div class="stock-in-actions">

                                <button
                                    type="button"
                                    class="btn btn-edit"
                                    title="Edit"
                                    onclick="editStockIn('${escapeStockInHTML(transaction.id)}')"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn btn-delete"
                                    title="Delete"
                                    onclick="deleteStockIn('${escapeStockInHTML(transaction.id)}')"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// SUMMARY
// ==========================================================

function updateStockInSummary() {

    const records =
        Object.values(
            stockInData
        )
        .filter(
            function(record) {

                return (
                    record &&
                    String(
                        record.status ||
                        "Posted"
                    ).toLowerCase() !==
                    "void"
                );

            }
        );


    let quantity = 0;

    let totalCost = 0;


    records.forEach(
        function(record) {

            quantity +=
                stockInNumber(
                    record.quantity
                );


            totalCost +=
                stockInNumber(
                    record.totalCost
                );

        }
    );


    const totalElement =
        stockInElement(
            "stockInTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            records.length;

    }


    const quantityElement =
        stockInElement(
            "stockInQuantityTotal"
        );


    if (quantityElement) {

        quantityElement.textContent =
            quantity.toLocaleString();

    }


    const costElement =
        stockInElement(
            "stockInCostTotal"
        );


    if (costElement) {

        costElement.textContent =
            "₱ " +
            formatStockInAmount(
                totalCost
            );

    }

}


// ==========================================================
// SAVE STOCK IN
// ==========================================================

async function saveStockIn(event) {

    if (event) {

        event.preventDefault();

    }


    if (!stockInFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    const stockInNo =
        stockInElement(
            "stockInNo"
        )?.value.trim();


    const date =
        stockInElement(
            "stockInDate"
        )?.value;


    const supplierId =
        stockInElement(
            "stockInSupplier"
        )?.value;


    const rawMaterialId =
        stockInElement(
            "stockInRawMaterial"
        )?.value;


    const quantity =
        stockInNumber(
            stockInElement(
                "stockInQuantity"
            )?.value
        );


    const unit =
        stockInElement(
            "stockInUnit"
        )?.value.trim();


    const unitCost =
        stockInNumber(
            stockInElement(
                "stockInUnitCost"
            )?.value
        );


    const totalCost =
        quantity *
        unitCost;


    const destination =
        stockInElement(
            "stockInDestination"
        )?.value ||
        "Stock Room";


    const referenceNo =
        stockInElement(
            "stockInReferenceNo"
        )?.value.trim() ||
        "";


    const invoiceNo =
        stockInElement(
            "stockInInvoiceNo"
        )?.value.trim() ||
        "";


    const status =
        stockInElement(
            "stockInStatus"
        )?.value ||
        "Posted";


    const notes =
        stockInElement(
            "stockInNotes"
        )?.value.trim() ||
        "";


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!stockInNo) {

        alert(
            "Please enter the Stock In number."
        );

        return;

    }


    if (!date) {

        alert(
            "Please select the stock-in date."
        );

        return;

    }


    if (!rawMaterialId) {

        alert(
            "Please select a raw material."
        );

        return;

    }


    if (
        quantity <= 0
    ) {

        alert(
            "Quantity must be greater than zero."
        );

        return;

    }


    if (
        unitCost < 0
    ) {

        alert(
            "Unit cost cannot be negative."
        );

        return;

    }


    if (!unit) {

        alert(
            "Please enter the unit."
        );

        return;

    }


    const saveButton =
        stockInElement(
            "stockInSaveBtn"
        );


    const saveText =
        stockInElement(
            "stockInSaveText"
        );


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

        }


        if (saveText) {

            saveText.textContent =
                "Saving...";

        }


        // ==================================================
        // ID
        // ==================================================

        const stockInId =
            editingStockInId ||
            stockInElement(
                "stockInId"
            )?.value ||
            db
                .ref(
                    "stockIns"
                )
                .push()
                .key;


        const existing =
            stockInData[
                stockInId
            ] || {};


        const supplierName =
            supplierId
                ? getStockInSupplierName(
                    supplierId
                )
                : "";


        const materialName =
            getStockInMaterialName(
                rawMaterialId
            );


        // ==================================================
        // DATA
        // ==================================================

        const transaction = {

            id:
                stockInId,

            stockInNo:
                stockInNo,

            date:
                date,

            supplierId:
                supplierId || "",

            supplierName:
                supplierName,

            rawMaterialId:
                rawMaterialId,

            materialName:
                materialName,

            quantity:
                quantity,

            unit:
                unit,

            unitCost:
                unitCost,

            totalCost:
                totalCost,

            destination:
                destination,

            referenceNo:
                referenceNo,

            invoiceNo:
                invoiceNo,

            status:
                status,

            notes:
                notes,

            createdAt:
                existing.createdAt ||
                firebase.database.ServerValue.TIMESTAMP,

            updatedAt:
                firebase.database.ServerValue.TIMESTAMP

        };


        // ==================================================
        // SAVE STOCK-IN TRANSACTION
        // ==================================================

        await db
            .ref(
                "stockIns/" +
                stockInId
            )
            .set(
                transaction
            );


        // ==================================================
        // UPDATE STOCK ROOM
        // ==================================================

        await updateStockRoom(
            transaction,
            existing
        );


        alert(
            editingStockInId
                ? "Stock In updated successfully."
                : "Stock In saved successfully."
        );


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        const modalElement =
            stockInElement(
                "stockInModal"
            );


        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        modalElement
                    );


            modal.hide();

        }


        resetStockInForm();


        await loadStockIn();


        editingStockInId =
            null;

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

        }


        if (saveText) {

            saveText.textContent =
                editingStockInId
                    ? "Update Stock In"
                    : "Save Stock In";

        }

    }

}


// ==========================================================
// UPDATE STOCK ROOM
// ==========================================================
//
// stockRooms/{rawMaterialId}
//
// {
//     materialId,
//     materialName,
//     quantity,
//     unit,
//     averageCost,
//     totalValue,
//     updatedAt
// }
//
// ==========================================================

async function updateStockRoom(
    transaction,
    previousTransaction
) {

    if (
        String(
            transaction.status ||
            "Posted"
        ).toLowerCase() ===
        "void"
    ) {

        return;

    }


    const materialId =
        transaction.rawMaterialId;


    if (!materialId) {

        return;

    }


    const stockRef =
        db
            .ref(
                "stockRooms/" +
                materialId
            );


    const snapshot =
        await stockRef.once(
            "value"
        );


    const current =
        snapshot.val() || {};


    let currentQuantity =
        stockInNumber(
            current.quantity
        );


    let currentTotalValue =
        stockInNumber(
            current.totalValue
        );


    // ======================================================
    // IF EDITING
    // REMOVE PREVIOUS POSTED TRANSACTION
    // ======================================================

    if (
        previousTransaction &&
        String(
            previousTransaction.status ||
            "Posted"
        ).toLowerCase() ===
        "posted"
    ) {

        const previousQuantity =
            stockInNumber(
                previousTransaction.quantity
            );


        const previousTotal =
            stockInNumber(
                previousTransaction.totalCost
            );


        currentQuantity -=
            previousQuantity;


        currentTotalValue -=
            previousTotal;


        if (
            currentQuantity < 0
        ) {

            currentQuantity = 0;

        }


        if (
            currentTotalValue < 0
        ) {

            currentTotalValue = 0;

        }

    }


    currentQuantity +=
        stockInNumber(
            transaction.quantity
        );


    currentTotalValue +=
        stockInNumber(
            transaction.totalCost
        );


    const averageCost =
        currentQuantity > 0
            ? currentTotalValue /
              currentQuantity
            : 0;


    await stockRef.set({

        materialId:
            materialId,

        materialName:
            transaction.materialName,

        quantity:
            currentQuantity,

        unit:
            transaction.unit,

        averageCost:
            averageCost,

        totalValue:
            currentTotalValue,

        location:
            "Stock Room",

        updatedAt:
            firebase.database.ServerValue.TIMESTAMP

    });

}


// ==========================================================
// EDIT STOCK IN
// ==========================================================

function editStockIn(id) {

    if (!id) {

        return;

    }


    const transaction =
        stockInData[
            id
        ];


    if (!transaction) {

        alert(
            "Stock In transaction not found."
        );

        return;

    }


    editingStockInId =
        id;


    const hiddenId =
        stockInElement(
            "stockInId"
        );


    if (hiddenId) {

        hiddenId.value =
            id;

    }


    const number =
        stockInElement(
            "stockInNo"
        );


    if (number) {

        number.value =
            transaction.stockInNo ||
            "";

    }


    const date =
        stockInElement(
            "stockInDate"
        );


    if (date) {

        date.value =
            transaction.date ||
            getStockInToday();

    }


    const supplier =
        stockInElement(
            "stockInSupplier"
        );


    if (supplier) {

        supplier.value =
            transaction.supplierId ||
            "";

    }


    const material =
        stockInElement(
            "stockInRawMaterial"
        );


    if (material) {

        material.value =
            transaction.rawMaterialId ||
            "";

    }


    const quantity =
        stockInElement(
            "stockInQuantity"
        );


    if (quantity) {

        quantity.value =
            transaction.quantity ||
            "";

    }


    const unit =
        stockInElement(
            "stockInUnit"
        );


    if (unit) {

        unit.value =
            transaction.unit ||
            "";

    }


    const unitCost =
        stockInElement(
            "stockInUnitCost"
        );


    if (unitCost) {

        unitCost.value =
            transaction.unitCost ||
            "";

    }


    const destination =
        stockInElement(
            "stockInDestination"
        );


    if (destination) {

        destination.value =
            transaction.destination ||
            "Stock Room";

    }


    const reference =
        stockInElement(
            "stockInReferenceNo"
        );


    if (reference) {

        reference.value =
            transaction.referenceNo ||
            "";

    }


    const invoice =
        stockInElement(
            "stockInInvoiceNo"
        );


    if (invoice) {

        invoice.value =
            transaction.invoiceNo ||
            "";

    }


    const status =
        stockInElement(
            "stockInStatus"
        );


    if (status) {

        status.value =
            transaction.status ||
            "Posted";

    }


    const notes =
        stockInElement(
            "stockInNotes"
        );


    if (notes) {

        notes.value =
            transaction.notes ||
            "";

    }


    const title =
        stockInElement(
            "stockInModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-pen-to-square"></i>

            Edit Stock In

        `;

    }


    const saveText =
        stockInElement(
            "stockInSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Update Stock In";

    }


    calculateStockInTotal();


    openStockInModal();

}


// ==========================================================
// DELETE STOCK IN
// ==========================================================

async function deleteStockIn(id) {

    if (!id) {

        return;

    }


    const transaction =
        stockInData[
            id
        ];


    if (!transaction) {

        alert(
            "Stock In transaction not found."
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Delete Stock In " +
            (
                transaction.stockInNo ||
                ""
            ) +
            "?\n\n" +
            "The quantity will also be deducted from Stock Room."
        );


    if (!confirmed) {

        return;

    }


    if (!stockInFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        // ==================================================
        // REMOVE STOCK FROM STOCK ROOM
        // ==================================================

        await reverseStockRoom(
            transaction
        );


        // ==================================================
        // DELETE TRANSACTION
        // ==================================================

        await db
            .ref(
                "stockIns/" +
                id
            )
            .remove();


        alert(
            "Stock In deleted successfully."
        );


        await loadStockIn();

    }

    catch (error) {

        console.error(
            "Stock In Delete Error:",
            error
        );


        alert(
            "Unable to delete Stock In.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

}


// ==========================================================
// REVERSE STOCK ROOM
// ==========================================================

async function reverseStockRoom(
    transaction
) {

    if (
        String(
            transaction.status ||
            "Posted"
        ).toLowerCase() ===
        "void"
    ) {

        return;

    }


    const materialId =
        transaction.rawMaterialId;


    if (!materialId) {

        return;

    }


    const stockRef =
        db
            .ref(
                "stockRooms/" +
                materialId
            );


    const snapshot =
        await stockRef.once(
            "value"
        );


    const current =
        snapshot.val() || {};


    let quantity =
        stockInNumber(
            current.quantity
        );


    let totalValue =
        stockInNumber(
            current.totalValue
        );


    quantity -=
        stockInNumber(
            transaction.quantity
        );


    totalValue -=
        stockInNumber(
            transaction.totalCost
        );


    if (
        quantity < 0
    ) {

        quantity = 0;

    }


    if (
        totalValue < 0
    ) {

        totalValue = 0;

    }


    const averageCost =
        quantity > 0
            ? totalValue /
              quantity
            : 0;


    await stockRef.update({

        quantity:
            quantity,

        totalValue:
            totalValue,

        averageCost:
            averageCost,

        updatedAt:
            firebase.database.ServerValue.TIMESTAMP

    });

}


// ==========================================================
// REFRESH
// ==========================================================

async function refreshStockIn() {

    try {

        await loadStockIn();

        await loadStockInSuppliers();

        await loadStockInRawMaterials();

    }

    catch (error) {

        console.error(
            "Stock In Refresh Error:",
            error
        );

    }

}


// ==========================================================
// FILTER
// ==========================================================

function handleStockInFilter() {

    renderStockIn();

}


// ==========================================================
// BIND EVENTS
// ==========================================================

function bindStockInEvents() {

    // ======================================================
    // ADD BUTTON
    // ======================================================

    const addButton =
        stockInElement(
            "addStockInBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function() {

                resetStockInForm();

                openStockInModal();

            }
        );

    }


    // ======================================================
    // FORM
    // ======================================================

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


    // ======================================================
    // REFRESH
    // ======================================================

    const refreshButton =
        stockInElement(
            "stockInRefreshBtn"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshStockIn
        );

    }


    // ======================================================
    // SEARCH
    // ======================================================

    const search =
        stockInElement(
            "stockInSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            handleStockInFilter
        );

    }


    // ======================================================
    // DATE FILTER
    // ======================================================

    const dateFilter =
        stockInElement(
            "stockInDateFilter"
        );


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            handleStockInFilter
        );

    }


    // ======================================================
    // QUANTITY
    // ======================================================

    const quantity =
        stockInElement(
            "stockInQuantity"
        );


    if (quantity) {

        quantity.addEventListener(
            "input",
            calculateStockInTotal
        );

    }


    // ======================================================
    // UNIT COST
    // ======================================================

    const unitCost =
        stockInElement(
            "stockInUnitCost"
        );


    if (unitCost) {

        unitCost.addEventListener(
            "input",
            calculateStockInTotal
        );

    }


    // ======================================================
    // RAW MATERIAL
    // ======================================================

    const rawMaterial =
        stockInElement(
            "stockInRawMaterial"
        );


    if (rawMaterial) {

        rawMaterial.addEventListener(
            "change",
            updateStockInSelectedMaterial
        );

    }


    // ======================================================
    // MODAL RESET
    // ======================================================

    const modal =
        stockInElement(
            "stockInModal"
        );


    if (modal) {

        modal.addEventListener(
            "hidden.bs.modal",
            function() {

                resetStockInForm();

            }
        );

    }

}


// ==========================================================
// INITIALIZE
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


    if (!stockInFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        bindStockInEvents();


        await Promise.all([

            loadStockIn(),

            loadStockInSuppliers(),

            loadStockInRawMaterials()

        ]);


        resetStockInForm();


        stockInInitialized =
            true;


        console.log(
            "PAPPRITO Stock In initialized."
        );

    }

    catch (error) {

        console.error(
            "Stock In Initialization Error:",
            error
        );

    }

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializeStockIn =
    initializeStockIn;

window.loadStockIn =
    loadStockIn;

window.openStockInModal =
    openStockInModal;

window.resetStockInForm =
    resetStockInForm;

window.saveStockIn =
    saveStockIn;

window.editStockIn =
    editStockIn;

window.deleteStockIn =
    deleteStockIn;

window.refreshStockIn =
    refreshStockIn;

window.calculateStockInTotal =
    calculateStockInTotal;

window.updateStockInSelectedMaterial =
    updateStockInSelectedMaterial;


console.log(
    "PAPPRITO Stock In Engine V1 loaded."
);
