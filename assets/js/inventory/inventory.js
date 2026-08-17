// ==========================================================
// PAPPRITO ERP
// INVENTORY ENGINE V1
// File: assets/js/inventory/inventory.js
//
// FUNCTIONS:
// - Load Inventory
// - Firebase Realtime Database
// - Search
// - Category Filter
// - Stock Status Filter
// - Unit Filter
// - Statistics
// - Inventory Table
// - Stock In Modal
// - Stock Out Modal
// - Adjustment Modal
// - Details Modal
// - Real-time Refresh
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let inventoryData = [];

let inventoryFilteredData = [];

let inventoryCurrentPage = 1;

const inventoryItemsPerPage = 15;

let inventoryCurrentItemId = null;

let inventoryInitialized = false;


// ==========================================================
// FIREBASE DATABASE
// ==========================================================

function getInventoryDatabase() {

    if (
        typeof db !== "undefined" &&
        db
    ) {

        return db;

    }


    if (
        typeof firebase !== "undefined" &&
        typeof firebase.database === "function"
    ) {

        return firebase.database();

    }


    throw new Error(
        "Firebase Database is not initialized."
    );

}


// ==========================================================
// SAFE NUMBER
// ==========================================================

function inventoryNumber(
    value
) {

    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function inventoryEscape(
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
// CURRENCY
// ==========================================================

function inventoryCurrency(
    value
) {

    return "₱" +
        inventoryNumber(
            value
        ).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================================
// DATE FORMAT
// ==========================================================

function inventoryDate(
    value
) {

    if (!value) {

        return "-";

    }


    let date;


    if (
        typeof value === "number"
    ) {

        date =
            new Date(value);

    }

    else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================================
// GET STOCK
// ==========================================================

function getInventoryStock(
    item
) {

    return inventoryNumber(
        item.stock ??
        item.currentStock ??
        item.quantity ??
        item.qty ??
        0
    );

}


// ==========================================================
// GET REORDER LEVEL
// ==========================================================

function getInventoryReorderLevel(
    item
) {

    return inventoryNumber(
        item.reorderLevel ??
        item.minimumStock ??
        item.minStock ??
        item.minimumQty ??
        0
    );

}


// ==========================================================
// GET UNIT COST
// ==========================================================

function getInventoryUnitCost(
    item
) {

    return inventoryNumber(
        item.cost ??
        item.unitCost ??
        item.purchaseCost ??
        item.price ??
        0
    );

}


// ==========================================================
// GET ITEM NAME
// ==========================================================

function getInventoryItemName(
    item
) {

    return (
        item.name ||
        item.productName ||
        item.itemName ||
        item.title ||
        "Unnamed Item"
    );

}


// ==========================================================
// GET ITEM CODE
// ==========================================================

function getInventoryItemCode(
    item
) {

    return (
        item.code ||
        item.itemCode ||
        item.productCode ||
        item.sku ||
        "-"
    );

}


// ==========================================================
// GET CATEGORY
// ==========================================================

function getInventoryCategory(
    item
) {

    return (
        item.categoryName ||
        item.category ||
        item.categoryId ||
        "Uncategorized"
    );

}


// ==========================================================
// GET UNIT
// ==========================================================

function getInventoryUnit(
    item
) {

    return (
        item.unit ||
        item.uom ||
        item.unitOfMeasure ||
        "pcs"
    );

}


// ==========================================================
// STOCK STATUS
// ==========================================================

function getInventoryStatus(
    item
) {

    const stock =
        getInventoryStock(
            item
        );


    const reorder =
        getInventoryReorderLevel(
            item
        );


    if (
        stock <= 0
    ) {

        return {
            label: "Out of Stock",
            className: "out-of-stock"
        };

    }


    if (
        reorder > 0 &&
        stock <= reorder
    ) {

        return {
            label: "Low Stock",
            className: "low-stock"
        };

    }


    return {
        label: "In Stock",
        className: "in-stock"
    };

}


// ==========================================================
// LOAD INVENTORY
// ==========================================================

async function loadInventory() {

    try {

        renderInventoryLoading();


        const database =
            getInventoryDatabase();


        /*
         * Primary source:
         * products
         *
         * Inventory balance is normally
         * maintained from the product master.
         */

        const snapshot =
            await database
                .ref("products")
                .once("value");


        const data =
            snapshot.val() || {};


        inventoryData =
            Object.entries(
                data
            ).map(
                function([
                    id,
                    item
                ]) {

                    return {

                        id: id,

                        ...(item || {})

                    };

                }
            );


        inventoryFilteredData =
            [
                ...inventoryData
            ];


        populateInventoryFilters();


        updateInventoryStatistics();


        applyInventoryFilters();


        await loadRecentInventoryMovements();


        console.log(
            "Inventory loaded:",
            inventoryData.length
        );

    }

    catch (error) {

        console.error(
            "Inventory Load Error:",
            error
        );


        showInventoryAlert(
            "Unable to load inventory. " +
            error.message,
            "error"
        );


        renderInventoryError(
            error
        );

    }

}


// ==========================================================
// REAL-TIME INVENTORY LISTENER
// ==========================================================

function startInventoryListener() {

    try {

        const database =
            getInventoryDatabase();


        database
            .ref("products")
            .off(
                "value",
                inventoryFirebaseListener
            );


        database
            .ref("products")
            .on(
                "value",
                inventoryFirebaseListener,
                function(error) {

                    console.error(
                        "Inventory Firebase Listener Error:",
                        error
                    );

                }
            );


        console.log(
            "Inventory Firebase listener started."
        );

    }

    catch (error) {

        console.error(
            "Unable to start inventory listener:",
            error
        );

    }

}


// ==========================================================
// FIREBASE LISTENER
// ==========================================================

function inventoryFirebaseListener(
    snapshot
) {

    const data =
        snapshot.val() || {};


    inventoryData =
        Object.entries(
            data
        ).map(
            function([
                id,
                item
            ]) {

                return {

                    id: id,

                    ...(item || {})

                };

            }
        );


    inventoryFilteredData =
        [
            ...inventoryData
        ];


    populateInventoryFilters();


    updateInventoryStatistics();


    applyInventoryFilters();


    loadRecentInventoryMovements();

}


// ==========================================================
// STOP LISTENER
// ==========================================================

function stopInventoryListener() {

    try {

        const database =
            getInventoryDatabase();


        database
            .ref("products")
            .off(
                "value",
                inventoryFirebaseListener
            );

    }

    catch (error) {

        console.warn(
            "Unable to stop inventory listener:",
            error
        );

    }

}


// ==========================================================
// POPULATE FILTERS
// ==========================================================

function populateInventoryFilters() {

    const categorySelect =
        document.getElementById(
            "inventoryCategoryFilter"
        );


    const unitSelect =
        document.getElementById(
            "inventoryUnitFilter"
        );


    if (
        categorySelect
    ) {

        const categories =
            [
                ...new Set(
                    inventoryData
                        .map(
                            getInventoryCategory
                        )
                        .filter(
                            Boolean
                        )
                )
            ]
            .sort(
                function(a, b) {

                    return String(a)
                        .localeCompare(
                            String(b)
                        );

                }
            );


        const current =
            categorySelect.value;


        categorySelect.innerHTML = `

            <option value="all">

                All Categories

            </option>

        `;


        categories.forEach(
            function(category) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category;


                option.textContent =
                    category;


                categorySelect.appendChild(
                    option
                );

            }
        );


        if (
            categories.includes(
                current
            )
        ) {

            categorySelect.value =
                current;

        }

    }


    if (
        unitSelect
    ) {

        const units =
            [
                ...new Set(
                    inventoryData
                        .map(
                            getInventoryUnit
                        )
                        .filter(
                            Boolean
                        )
                )
            ]
            .sort(
                function(a, b) {

                    return String(a)
                        .localeCompare(
                            String(b)
                        );

                }
            );


        const current =
            unitSelect.value;


        unitSelect.innerHTML = `

            <option value="all">

                All Units

            </option>

        `;


        units.forEach(
            function(unit) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    unit;


                option.textContent =
                    unit;


                unitSelect.appendChild(
                    option
                );

            }
        );


        if (
            units.includes(
                current
            )
        ) {

            unitSelect.value =
                current;

        }

    }

}


// ==========================================================
// APPLY FILTERS
// ==========================================================

function applyInventoryFilters() {

    const searchInput =
        document.getElementById(
            "inventorySearch"
        );


    const categoryFilter =
        document.getElementById(
            "inventoryCategoryFilter"
        );


    const statusFilter =
        document.getElementById(
            "inventoryStockStatusFilter"
        );


    const unitFilter =
        document.getElementById(
            "inventoryUnitFilter"
        );


    const search =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const category =
        categoryFilter?.value ||
        "all";


    const status =
        statusFilter?.value ||
        "all";


    const unit =
        unitFilter?.value ||
        "all";


    inventoryFilteredData =
        inventoryData.filter(
            function(item) {

                const name =
                    getInventoryItemName(
                        item
                    )
                    .toLowerCase();


                const code =
                    String(
                        getInventoryItemCode(
                            item
                        )
                    )
                    .toLowerCase();


                const itemCategory =
                    String(
                        getInventoryCategory(
                            item
                        )
                    );


                const itemUnit =
                    String(
                        getInventoryUnit(
                            item
                        )
                    );


                const itemStatus =
                    getInventoryStatus(
                        item
                    ).label;


                const matchesSearch =
                    !search ||
                    name.includes(
                        search
                    ) ||
                    code.includes(
                        search
                    ) ||
                    itemCategory
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesCategory =
                    category === "all" ||
                    itemCategory ===
                        category;


                const matchesStatus =
                    status === "all" ||
                    itemStatus ===
                        status;


                const matchesUnit =
                    unit === "all" ||
                    itemUnit ===
                        unit;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus &&
                    matchesUnit
                );

            }
        );


    inventoryCurrentPage =
        1;


    renderInventoryTable();

}


// ==========================================================
// RENDER INVENTORY TABLE
// ==========================================================

function renderInventoryTable() {

    const tbody =
        document.getElementById(
            "inventoryTableBody"
        );


    if (!tbody) {

        return;

    }


    if (
        inventoryFilteredData.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="inventory-empty"
                >

                    <div
                        class="
                            inventory-empty-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-box-open
                            "
                        ></i>

                    </div>


                    <h4>

                        No Inventory Items

                    </h4>


                    <p>

                        No items match your
                        current search or filter.

                    </p>

                </td>

            </tr>

        `;


        updateInventoryPagination(
            0,
            0,
            0
        );


        return;

    }


    const total =
        inventoryFilteredData.length;


    const start =
        (
            inventoryCurrentPage - 1
        ) *
        inventoryItemsPerPage;


    const end =
        Math.min(
            start +
            inventoryItemsPerPage,
            total
        );


    const pageItems =
        inventoryFilteredData.slice(
            start,
            end
        );


    tbody.innerHTML =
        pageItems
            .map(
                function(item) {

                    return renderInventoryRow(
                        item
                    );

                }
            )
            .join("");


    updateInventoryPagination(
        start + 1,
        end,
        total
    );

}


// ==========================================================
// INVENTORY ROW
// ==========================================================

function renderInventoryRow(
    item
) {

    const stock =
        getInventoryStock(
            item
        );


    const reorder =
        getInventoryReorderLevel(
            item
        );


    const cost =
        getInventoryUnitCost(
            item
        );


    const value =
        stock *
        cost;


    const status =
        getInventoryStatus(
            item
        );


    const id =
        inventoryEscape(
            item.id
        );


    const code =
        inventoryEscape(
            getInventoryItemCode(
                item
            )
        );


    const name =
        inventoryEscape(
            getInventoryItemName(
                item
            )
        );


    const category =
        inventoryEscape(
            getInventoryCategory(
                item
            )
        );


    const unit =
        inventoryEscape(
            getInventoryUnit(
                item
            )
        );


    return `

        <tr>

            <td>

                <span
                    class="
                        inventory-item-code
                    "
                >

                    ${code}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-item-name
                    "
                >

                    ${name}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-category
                    "
                >

                    ${category}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-unit
                    "
                >

                    ${unit}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-stock
                    "
                >

                    ${stock.toLocaleString()}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-reorder
                    "
                >

                    ${reorder.toLocaleString()}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-cost
                    "
                >

                    ${inventoryCurrency(
                        cost
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-stock-value
                    "
                >

                    ${inventoryCurrency(
                        value
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        inventory-status
                        ${status.className}
                    "
                >

                    ${status.label}

                </span>

            </td>


            <td>

                <div
                    class="
                        inventory-actions
                    "
                >

                    <button
                        type="button"
                        class="
                            inventory-action-btn
                            inventory-action-view
                        "
                        data-action="view"
                        data-id="${id}"
                        title="View Details"
                    >

                        <i
                            class="
                                fa-solid
                                fa-eye
                            "
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="
                            inventory-action-btn
                            inventory-action-in
                        "
                        data-action="stock-in"
                        data-id="${id}"
                        title="Stock In"
                    >

                        <i
                            class="
                                fa-solid
                                fa-arrow-down
                            "
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="
                            inventory-action-btn
                            inventory-action-out
                        "
                        data-action="stock-out"
                        data-id="${id}"
                        title="Stock Out"
                    >

                        <i
                            class="
                                fa-solid
                                fa-arrow-up
                            "
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="
                            inventory-action-btn
                            inventory-action-adjust
                        "
                        data-action="adjust"
                        data-id="${id}"
                        title="Adjustment"
                    >

                        <i
                            class="
                                fa-solid
                                fa-sliders
                            "
                        ></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


// ==========================================================
// STATISTICS
// ==========================================================

function updateInventoryStatistics() {

    const totalItems =
        inventoryData.length;


    let totalStock = 0;

    let lowStock = 0;

    let outOfStock = 0;

    let totalValue = 0;


    inventoryData.forEach(
        function(item) {

            const stock =
                getInventoryStock(
                    item
                );


            const reorder =
                getInventoryReorderLevel(
                    item
                );


            const cost =
                getInventoryUnitCost(
                    item
                );


            totalStock +=
                stock;


            totalValue +=
                stock * cost;


            if (
                stock <= 0
            ) {

                outOfStock++;

            }

            else if (
                reorder > 0 &&
                stock <= reorder
            ) {

                lowStock++;

            }

        }
    );


    setInventoryText(
        "inventoryTotalItems",
        totalItems
    );


    setInventoryText(
        "inventoryTotalStock",
        totalStock.toLocaleString()
    );


    setInventoryText(
        "inventoryLowStock",
        lowStock
    );


    setInventoryText(
        "inventoryOutOfStock",
        outOfStock
    );


    setInventoryText(
        "inventoryTotalValue",
        inventoryCurrency(
            totalValue
        )
    );

}


// ==========================================================
// SET TEXT
// ==========================================================

function setInventoryText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================================
// PAGINATION
// ==========================================================

function updateInventoryPagination(
    start,
    end,
    total
) {

    const info =
        document.getElementById(
            "inventoryPaginationInfo"
        );


    const buttons =
        document.getElementById(
            "inventoryPaginationButtons"
        );


    if (info) {

        info.textContent =
            `Showing ${start || 0} to ${
                end || 0
            } of ${total} Items`;

    }


    if (!buttons) {

        return;

    }


    const totalPages =
        Math.ceil(
            total /
            inventoryItemsPerPage
        );


    if (
        totalPages <= 1
    ) {

        buttons.innerHTML =
            "";

        return;

    }


    let html = "";


    html += `

        <button
            type="button"
            class="
                inventory-page-button
            "
            data-page="${
                inventoryCurrentPage - 1
            }"
            ${
                inventoryCurrentPage <= 1
                    ? "disabled"
                    : ""
            }
        >

            <i
                class="
                    fa-solid
                    fa-chevron-left
                "
            ></i>

        </button>

    `;


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `

            <button
                type="button"
                class="
                    inventory-page-button
                    ${
                        page ===
                        inventoryCurrentPage
                            ? "active"
                            : ""
                    }
                "
                data-page="${page}"
            >

                ${page}

            </button>

        `;

    }


    html += `

        <button
            type="button"
            class="
                inventory-page-button
            "
            data-page="${
                inventoryCurrentPage + 1
            }"
            ${
                inventoryCurrentPage >=
                totalPages
                    ? "disabled"
                    : ""
            }
        >

            <i
                class="
                    fa-solid
                    fa-chevron-right
                "
            ></i>

        </button>

    `;


    buttons.innerHTML =
        html;

}


// ==========================================================
// CHANGE PAGE
// ==========================================================

function changeInventoryPage(
    page
) {

    const totalPages =
        Math.ceil(
            inventoryFilteredData.length /
            inventoryItemsPerPage
        );


    if (
        page < 1 ||
        page > totalPages
    ) {

        return;

    }


    inventoryCurrentPage =
        page;


    renderInventoryTable();

}


// ==========================================================
// RECENT MOVEMENTS
// ==========================================================

async function loadRecentInventoryMovements() {

    const tbody =
        document.getElementById(
            "inventoryMovementTableBody"
        );


    if (!tbody) {

        return;

    }


    try {

        const database =
            getInventoryDatabase();


        const snapshot =
            await database
                .ref("inventoryMovements")
                .limitToLast(20)
                .once("value");


        const data =
            snapshot.val() || {};


        const movements =
            Object.entries(
                data
            )
            .map(
                function([
                    id,
                    movement
                ]) {

                    return {

                        id: id,

                        ...(movement || {})

                    };

                }
            )
            .sort(
                function(a, b) {

                    return inventoryTimestamp(
                        b
                    ) -
                    inventoryTimestamp(
                        a
                    );

                }
            )
            .slice(
                0,
                10
            );


        if (
            movements.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="inventory-empty"
                    >

                        <div
                            class="
                                inventory-empty-icon
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-clock-rotate-left
                                "
                            ></i>

                        </div>


                        <h4>

                            No Stock Movements

                        </h4>


                        <p>

                            Stock movement history
                            will appear here.

                        </p>

                    </td>

                </tr>

            `;


            return;

        }


        tbody.innerHTML =
            movements
                .map(
                    renderInventoryMovementRow
                )
                .join("");

    }

    catch (error) {

        console.warn(
            "Inventory movements unavailable:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="inventory-empty"
                >

                    <div
                        class="
                            inventory-empty-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-database
                            "
                        ></i>

                    </div>


                    <h4>

                        No Movement Data

                    </h4>


                    <p>

                        Inventory movement history
                        is not available yet.

                    </p>

                </td>

            </tr>

        `;

    }

}


// ==========================================================
// MOVEMENT TIMESTAMP
// ==========================================================

function inventoryTimestamp(
    movement
) {

    return inventoryNumber(
        movement.timestamp ??
        movement.createdAt ??
        movement.date ??
        movement.updatedAt ??
        0
    );

}


// ==========================================================
// MOVEMENT ROW
// ==========================================================

function renderInventoryMovementRow(
    movement
) {

    const type =
        String(
            movement.type ||
            movement.movementType ||
            movement.action ||
            "Adjustment"
        );


    const quantity =
        inventoryNumber(
            movement.quantity ??
            movement.qty ??
            0
        );


    const itemName =
        movement.itemName ||
        movement.productName ||
        movement.name ||
        "-";


    const reference =
        movement.reference ||
        movement.referenceNo ||
        movement.refNo ||
        "-";


    const unit =
        movement.unit ||
        movement.uom ||
        "pcs";


    const user =
        movement.userName ||
        movement.user ||
        "System";


    let movementClass =
        "inventory-movement-adjustment";


    if (
        /in/i.test(
            type
        )
    ) {

        movementClass =
            "inventory-movement-in";

    }

    else if (
        /out/i.test(
            type
        )
    ) {

        movementClass =
            "inventory-movement-out";

    }


    return `

        <tr>

            <td>

                ${inventoryDate(
                    inventoryTimestamp(
                        movement
                    )
                )}

            </td>


            <td>

                ${inventoryEscape(
                    reference
                )}

            </td>


            <td>

                ${inventoryEscape(
                    itemName
                )}

            </td>


            <td>

                <span
                    class="${movementClass}"
                >

                    ${inventoryEscape(
                        type
                    )}

                </span>

            </td>


            <td>

                ${quantity.toLocaleString()}

            </td>


            <td>

                ${inventoryEscape(
                    unit
                )}

            </td>


            <td>

                ${inventoryEscape(
                    user
                )}

            </td>

        </tr>

    `;

}


// ==========================================================
// LOADING STATE
// ==========================================================

function renderInventoryLoading() {

    const tbody =
        document.getElementById(
            "inventoryTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="inventory-loading"
            >

                <div
                    class="
                        inventory-spinner
                    "
                ></div>


                <span>

                    Loading inventory...

                </span>

            </td>

        </tr>

    `;

}


// ==========================================================
// ERROR STATE
// ==========================================================

function renderInventoryError(
    error
) {

    const tbody =
        document.getElementById(
            "inventoryTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="inventory-empty"
            >

                <div
                    class="
                        inventory-empty-icon
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-triangle-exclamation
                        "
                    ></i>

                </div>


                <h4>

                    Unable to Load Inventory

                </h4>


                <p>

                    ${inventoryEscape(
                        error?.message ||
                        "Unknown error."
                    )}

                </p>

            </td>

        </tr>

    `;

}


// ==========================================================
// ALERT
// ==========================================================

function showInventoryAlert(
    message,
    type = "success"
) {

    const alert =
        document.getElementById(
            "inventoryAlert"
        );


    const icon =
        document.getElementById(
            "inventoryAlertIcon"
        );


    const text =
        document.getElementById(
            "inventoryAlertMessage"
        );


    if (
        !alert ||
        !text
    ) {

        return;

    }


    text.textContent =
        message;


    alert.className =
        "inventory-alert " +
        type;


    if (icon) {

        icon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";

    }


    alert.style.display =
        "flex";


    clearTimeout(
        showInventoryAlert.timer
    );


    showInventoryAlert.timer =
        setTimeout(
            function() {

                alert.style.display =
                    "none";

            },
            4000
        );

}


// ==========================================================
// MODAL
// ==========================================================

function openInventoryModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "inventory-modal-open"
    );

}


function closeInventoryModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !document.querySelector(
            ".inventory-modal.show"
        )
    ) {

        document.body.classList.remove(
            "inventory-modal-open"
        );

    }

}


// ==========================================================
// FIND ITEM
// ==========================================================

function findInventoryItem(
    id
) {

    return inventoryData.find(
        function(item) {

            return String(
                item.id
            ) ===
            String(id);

        }
    );

}


// ==========================================================
// OPEN STOCK IN
// ==========================================================

function openInventoryStockIn(
    id = null
) {

    inventoryCurrentItemId =
        id;


    populateInventoryItemSelect(
        "inventoryStockInItem",
        id
    );


    const quantity =
        document.getElementById(
            "inventoryStockInQuantity"
        );


    const cost =
        document.getElementById(
            "inventoryStockInCost"
        );


    const reference =
        document.getElementById(
            "inventoryStockInReference"
        );


    const remarks =
        document.getElementById(
            "inventoryStockInRemarks"
        );


    if (quantity) {

        quantity.value =
            "";

    }


    if (cost) {

        const item =
            id
                ? findInventoryItem(id)
                : null;


        cost.value =
            item
                ? getInventoryUnitCost(
                    item
                )
                : "";

    }


    if (reference) {

        reference.value =
            "";

    }


    if (remarks) {

        remarks.value =
            "";

    }


    openInventoryModal(
        "inventoryStockInModal"
    );

}


// ==========================================================
// OPEN STOCK OUT
// ==========================================================

function openInventoryStockOut(
    id = null
) {

    inventoryCurrentItemId =
        id;


    populateInventoryItemSelect(
        "inventoryStockOutItem",
        id
    );


    const quantity =
        document.getElementById(
            "inventoryStockOutQuantity"
        );


    const reference =
        document.getElementById(
            "inventoryStockOutReference"
        );


    const remarks =
        document.getElementById(
            "inventoryStockOutRemarks"
        );


    if (quantity) {

        quantity.value =
            "";

    }


    if (reference) {

        reference.value =
            "";

    }


    if (remarks) {

        remarks.value =
            "";

    }


    openInventoryModal(
        "inventoryStockOutModal"
    );

}


// ==========================================================
// OPEN ADJUSTMENT
// ==========================================================

function openInventoryAdjustment(
    id = null
) {

    inventoryCurrentItemId =
        id;


    populateInventoryItemSelect(
        "inventoryAdjustmentItem",
        id
    );


    const quantity =
        document.getElementById(
            "inventoryAdjustmentQuantity"
        );


    const reason =
        document.getElementById(
            "inventoryAdjustmentReason"
        );


    if (quantity) {

        const item =
            id
                ? findInventoryItem(id)
                : null;


        quantity.value =
            item
                ? getInventoryStock(
                    item
                )
                : "";

    }


    if (reason) {

        reason.value =
            "";

    }


    openInventoryModal(
        "inventoryAdjustmentModal"
    );

}


// ==========================================================
// POPULATE ITEM SELECT
// ==========================================================

function populateInventoryItemSelect(
    selectId,
    selectedId = null
) {

    const select =
        document.getElementById(
            selectId
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">

            Select Item

        </option>

    `;


    inventoryData
        .slice()
        .sort(
            function(a, b) {

                return getInventoryItemName(a)
                    .localeCompare(
                        getInventoryItemName(b)
                    );

            }
        )
        .forEach(
            function(item) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.id;


                option.textContent =
                    getInventoryItemCode(
                        item
                    ) +
                    " - " +
                    getInventoryItemName(
                        item
                    );


                if (
                    String(
                        item.id
                    ) ===
                    String(
                        selectedId
                    )
                ) {

                    option.selected =
                        true;

                }


                select.appendChild(
                    option
                );

            }
        );

}


// ==========================================================
// OPEN DETAILS
// ==========================================================

async function openInventoryDetails(
    id
) {

    const item =
        findInventoryItem(
            id
        );


    if (!item) {

        showInventoryAlert(
            "Inventory item not found.",
            "error"
        );

        return;

    }


    inventoryCurrentItemId =
        id;


    const stock =
        getInventoryStock(
            item
        );


    const reorder =
        getInventoryReorderLevel(
            item
        );


    const cost =
        getInventoryUnitCost(
            item
        );


    const status =
        getInventoryStatus(
            item
        );


    setInventoryText(
        "inventoryDetailsTitle",
        getInventoryItemName(
            item
        )
    );


    setInventoryText(
        "inventoryDetailCode",
        getInventoryItemCode(
            item
        )
    );


    setInventoryText(
        "inventoryDetailName",
        getInventoryItemName(
            item
        )
    );


    setInventoryText(
        "inventoryDetailCategory",
        getInventoryCategory(
            item
        )
    );


    setInventoryText(
        "inventoryDetailUnit",
        getInventoryUnit(
            item
        )
    );


    setInventoryText(
        "inventoryDetailStock",
        stock.toLocaleString()
    );


    setInventoryText(
        "inventoryDetailReorder",
        reorder.toLocaleString()
    );


    setInventoryText(
        "inventoryDetailCost",
        inventoryCurrency(
            cost
        )
    );


    setInventoryText(
        "inventoryDetailValue",
        inventoryCurrency(
            stock * cost
        )
    );


    setInventoryText(
        "inventoryDetailStatus",
        status.label
    );


    await loadInventoryItemHistory(
        id
    );


    openInventoryModal(
        "inventoryDetailsModal"
    );

}


// ==========================================================
// ITEM HISTORY
// ==========================================================

async function loadInventoryItemHistory(
    itemId
) {

    const tbody =
        document.getElementById(
            "inventoryDetailHistoryBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="4"
                class="inventory-loading"
            >

                <div
                    class="
                        inventory-spinner
                    "
                ></div>

            </td>

        </tr>

    `;


    try {

        const database =
            getInventoryDatabase();


        const snapshot =
            await database
                .ref(
                    "inventoryMovements"
                )
                .orderByChild(
                    "itemId"
                )
                .equalTo(
                    itemId
                )
                .once("value");


        const data =
            snapshot.val() || {};


        const movements =
            Object.values(
                data
            )
            .sort(
                function(a, b) {

                    return inventoryTimestamp(
                        b
                    ) -
                    inventoryTimestamp(
                        a
                    );

                }
            )
            .slice(
                0,
                20
            );


        if (
            movements.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="inventory-empty"
                    >

                        No movement history.

                    </td>

                </tr>

            `;


            return;

        }


        tbody.innerHTML =
            movements
                .map(
                    function(movement) {

                        const type =
                            movement.type ||
                            movement.movementType ||
                            "Adjustment";


                        return `

                            <tr>

                                <td>

                                    ${inventoryDate(
                                        inventoryTimestamp(
                                            movement
                                        )
                                    )}

                                </td>


                                <td>

                                    ${inventoryEscape(
                                        movement.reference ||
                                        movement.referenceNo ||
                                        "-"
                                    )}

                                </td>


                                <td>

                                    ${inventoryEscape(
                                        type
                                    )}

                                </td>


                                <td>

                                    ${inventoryNumber(
                                        movement.quantity ||
                                        movement.qty
                                    ).toLocaleString()}

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }

    catch (error) {

        console.warn(
            "Item history error:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="inventory-empty"
                >

                    Unable to load history.

                </td>

            </tr>

        `;

    }

}


// ==========================================================
// SAVE STOCK IN
// ==========================================================

async function saveInventoryStockIn() {

    const itemId =
        document.getElementById(
            "inventoryStockInItem"
        )?.value;


    const quantity =
        inventoryNumber(
            document.getElementById(
                "inventoryStockInQuantity"
            )?.value
        );


    const cost =
        inventoryNumber(
            document.getElementById(
                "inventoryStockInCost"
            )?.value
        );


    const reference =
        document.getElementById(
            "inventoryStockInReference"
        )?.value.trim();


    const remarks =
        document.getElementById(
            "inventoryStockInRemarks"
        )?.value.trim();


    if (!itemId) {

        showInventoryAlert(
            "Please select an item.",
            "error"
        );

        return;

    }


    if (
        quantity <= 0
    ) {

        showInventoryAlert(
            "Please enter a valid quantity.",
            "error"
        );

        return;

    }


    const item =
        findInventoryItem(
            itemId
        );


    if (!item) {

        showInventoryAlert(
            "Selected item was not found.",
            "error"
        );

        return;

    }


    try {

        const database =
            getInventoryDatabase();


        const currentStock =
            getInventoryStock(
                item
            );


        const newStock =
            currentStock +
            quantity;


        const updates = {};


        updates[
            "products/" +
            itemId +
            "/stock"
        ] =
            newStock;


        if (
            cost > 0
        ) {

            updates[
                "products/" +
                itemId +
                "/unitCost"
            ] =
                cost;

        }


        const movementKey =
            database
                .ref(
                    "inventoryMovements"
                )
                .push()
                .key;


        updates[
            "inventoryMovements/" +
            movementKey
        ] = {

            itemId: itemId,

            itemName:
                getInventoryItemName(
                    item
                ),

            itemCode:
                getInventoryItemCode(
                    item
                ),

            type:
                "Stock In",

            quantity:
                quantity,

            unit:
                getInventoryUnit(
                    item
                ),

            unitCost:
                cost,

            reference:
                reference ||
                "",

            remarks:
                remarks ||
                "",

            timestamp:
                Date.now(),

            createdAt:
                Date.now(),

            userName:
                "System"

        };


        await database
            .ref()
            .update(
                updates
            );


        closeInventoryModal(
            "inventoryStockInModal"
        );


        showInventoryAlert(
            "Stock In saved successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Stock In Error:",
            error
        );


        showInventoryAlert(
            "Unable to save Stock In. " +
            error.message,
            "error"
        );

    }

}


// ==========================================================
// SAVE STOCK OUT
// ==========================================================

async function saveInventoryStockOut() {

    const itemId =
        document.getElementById(
            "inventoryStockOutItem"
        )?.value;


    const quantity =
        inventoryNumber(
            document.getElementById(
                "inventoryStockOutQuantity"
            )?.value
        );


    const reference =
        document.getElementById(
            "inventoryStockOutReference"
        )?.value.trim();


    const reason =
        document.getElementById(
            "inventoryStockOutReason"
        )?.value ||
        "Other";


    const remarks =
        document.getElementById(
            "inventoryStockOutRemarks"
        )?.value.trim();


    if (!itemId) {

        showInventoryAlert(
            "Please select an item.",
            "error"
        );

        return;

    }


    if (
        quantity <= 0
    ) {

        showInventoryAlert(
            "Please enter a valid quantity.",
            "error"
        );

        return;

    }


    const item =
        findInventoryItem(
            itemId
        );


    if (!item) {

        showInventoryAlert(
            "Selected item was not found.",
            "error"
        );

        return;

    }


    const currentStock =
        getInventoryStock(
            item
        );


    if (
        quantity >
        currentStock
    ) {

        showInventoryAlert(
            "Stock Out quantity cannot exceed current stock.",
            "error"
        );

        return;

    }


    try {

        const database =
            getInventoryDatabase();


        const newStock =
            currentStock -
            quantity;


        const updates = {};


        updates[
            "products/" +
            itemId +
            "/stock"
        ] =
            newStock;


        const movementKey =
            database
                .ref(
                    "inventoryMovements"
                )
                .push()
                .key;


        updates[
            "inventoryMovements/" +
            movementKey
        ] = {

            itemId: itemId,

            itemName:
                getInventoryItemName(
                    item
                ),

            itemCode:
                getInventoryItemCode(
                    item
                ),

            type:
                "Stock Out",

            quantity:
                quantity,

            unit:
                getInventoryUnit(
                    item
                ),

            reference:
                reference ||
                "",

            reason:
                reason,

            remarks:
                remarks ||
                "",

            timestamp:
                Date.now(),

            createdAt:
                Date.now(),

            userName:
                "System"

        };


        await database
            .ref()
            .update(
                updates
            );


        closeInventoryModal(
            "inventoryStockOutModal"
        );


        showInventoryAlert(
            "Stock Out saved successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Stock Out Error:",
            error
        );


        showInventoryAlert(
            "Unable to save Stock Out. " +
            error.message,
            "error"
        );

    }

}


// ==========================================================
// SAVE ADJUSTMENT
// ==========================================================

async function saveInventoryAdjustment() {

    const itemId =
        document.getElementById(
            "inventoryAdjustmentItem"
        )?.value;


    const actualQuantity =
        inventoryNumber(
            document.getElementById(
                "inventoryAdjustmentQuantity"
            )?.value
        );


    const reason =
        document.getElementById(
            "inventoryAdjustmentReason"
        )?.value.trim();


    if (!itemId) {

        showInventoryAlert(
            "Please select an item.",
            "error"
        );

        return;

    }


    if (
        actualQuantity < 0
    ) {

        showInventoryAlert(
            "Quantity cannot be negative.",
            "error"
        );

        return;

    }


    if (!reason) {

        showInventoryAlert(
            "Please enter the reason for adjustment.",
            "error"
        );

        return;

    }


    const item =
        findInventoryItem(
            itemId
        );


    if (!item) {

        showInventoryAlert(
            "Selected item was not found.",
            "error"
        );

        return;

    }


    try {

        const database =
            getInventoryDatabase();


        const oldStock =
            getInventoryStock(
                item
            );


        const difference =
            actualQuantity -
            oldStock;


        const updates = {};


        updates[
            "products/" +
            itemId +
            "/stock"
        ] =
            actualQuantity;


        const movementKey =
            database
                .ref(
                    "inventoryMovements"
                )
                .push()
                .key;


        updates[
            "inventoryMovements/" +
            movementKey
        ] = {

            itemId: itemId,

            itemName:
                getInventoryItemName(
                    item
                ),

            itemCode:
                getInventoryItemCode(
                    item
                ),

            type:
                "Adjustment",

            quantity:
                Math.abs(
                    difference
                ),

            difference:
                difference,

            oldStock:
                oldStock,

            newStock:
                actualQuantity,

            unit:
                getInventoryUnit(
                    item
                ),

            remarks:
                reason,

            timestamp:
                Date.now(),

            createdAt:
                Date.now(),

            userName:
                "System"

        };


        await database
            .ref()
            .update(
                updates
            );


        closeInventoryModal(
            "inventoryAdjustmentModal"
        );


        closeInventoryModal(
            "inventoryDetailsModal"
        );


        showInventoryAlert(
            "Inventory adjustment saved successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Inventory Adjustment Error:",
            error
        );


        showInventoryAlert(
            "Unable to save adjustment. " +
            error.message,
            "error"
        );

    }

}


// ==========================================================
// EVENT LISTENERS
// ==========================================================

function bindInventoryEvents() {

    const search =
        document.getElementById(
            "inventorySearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyInventoryFilters
        );

    }


    const category =
        document.getElementById(
            "inventoryCategoryFilter"
        );


    if (category) {

        category.addEventListener(
            "change",
            applyInventoryFilters
        );

    }


    const status =
        document.getElementById(
            "inventoryStockStatusFilter"
        );


    if (status) {

        status.addEventListener(
            "change",
            applyInventoryFilters
        );

    }


    const unit =
        document.getElementById(
            "inventoryUnitFilter"
        );


    if (unit) {

        unit.addEventListener(
            "change",
            applyInventoryFilters
        );

    }


    // ======================================================
    // REFRESH
    // ======================================================

    document
        .getElementById(
            "btnRefreshInventory"
        )
        ?.addEventListener(
            "click",
            loadInventory
        );


    // ======================================================
    // STOCK IN
    // ======================================================

    document
        .getElementById(
            "btnInventoryStockIn"
        )
        ?.addEventListener(
            "click",
            function() {

                openInventoryStockIn();

            }
        );


    document
        .getElementById(
            "btnSaveInventoryStockIn"
        )
        ?.addEventListener(
            "click",
            saveInventoryStockIn
        );


    // ======================================================
    // STOCK OUT
    // ======================================================

    document
        .getElementById(
            "btnInventoryStockOut"
        )
        ?.addEventListener(
            "click",
            function() {

                openInventoryStockOut();

            }
        );


    document
        .getElementById(
            "btnSaveInventoryStockOut"
        )
        ?.addEventListener(
            "click",
            saveInventoryStockOut
        );


    // ======================================================
    // ADJUSTMENT
    // ======================================================

    document
        .getElementById(
            "btnSaveInventoryAdjustment"
        )
        ?.addEventListener(
            "click",
            saveInventoryAdjustment
        );


    // ======================================================
    // CLOSE MODALS
    // ======================================================

    document
        .getElementById(
            "btnCloseInventoryStockIn"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryStockInModal"
                );

            }
        );


    document
        .getElementById(
            "btnCancelInventoryStockIn"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryStockInModal"
                );

            }
        );


    document
        .getElementById(
            "btnCloseInventoryStockOut"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryStockOutModal"
                );

            }
        );


    document
        .getElementById(
            "btnCancelInventoryStockOut"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryStockOutModal"
                );

            }
        );


    document
        .getElementById(
            "btnCloseInventoryAdjustment"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryAdjustmentModal"
                );

            }
        );


    document
        .getElementById(
            "btnCancelInventoryAdjustment"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryAdjustmentModal"
                );

            }
        );


    document
        .getElementById(
            "btnCloseInventoryDetails"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryDetailsModal"
                );

            }
        );


    // ======================================================
    // HISTORY
    // ======================================================

    document
        .getElementById(
            "btnViewInventoryHistory"
        )
        ?.addEventListener(
            "click",
            function() {

                showInventoryAlert(
                    "Inventory history module will be connected next.",
                    "success"
                );

            }
        );


    // ======================================================
    // DETAILS ACTIONS
    // ======================================================

    document
        .getElementById(
            "btnInventoryStockInFromDetails"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryDetailsModal"
                );


                openInventoryStockIn(
                    inventoryCurrentItemId
                );

            }
        );


    document
        .getElementById(
            "btnInventoryStockOutFromDetails"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryDetailsModal"
                );


                openInventoryStockOut(
                    inventoryCurrentItemId
                );

            }
        );


    document
        .getElementById(
            "btnInventoryAdjustmentFromDetails"
        )
        ?.addEventListener(
            "click",
            function() {

                closeInventoryModal(
                    "inventoryDetailsModal"
                );


                openInventoryAdjustment(
                    inventoryCurrentItemId
                );

            }
        );


    // ======================================================
    // TABLE ACTIONS
    // ======================================================

    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );


    if (tableBody) {

        tableBody.addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {

                    return;

                }


                const action =
                    button.dataset.action;


                const id =
                    button.dataset.id;


                if (
                    action === "view"
                ) {

                    openInventoryDetails(
                        id
                    );

                }


                else if (
                    action === "stock-in"
                ) {

                    openInventoryStockIn(
                        id
                    );

                }


                else if (
                    action === "stock-out"
                ) {

                    openInventoryStockOut(
                        id
                    );

                }


                else if (
                    action === "adjust"
                ) {

                    openInventoryAdjustment(
                        id
                    );

                }

            }
        );

    }


    // ======================================================
    // PAGINATION
    // ======================================================

    const pagination =
        document.getElementById(
            "inventoryPaginationButtons"
        );


    if (pagination) {

        pagination.addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "[data-page]"
                    );


                if (!button) {

                    return;

                }


                if (
                    button.disabled
                ) {

                    return;

                }


                changeInventoryPage(
                    Number(
                        button.dataset.page
                    )
                );

            }
        );

    }


    // ======================================================
    // CLICK OUTSIDE MODAL
    // ======================================================

    document
        .querySelectorAll(
            ".inventory-modal"
        )
        .forEach(
            function(modal) {

                modal.addEventListener(
                    "click",
                    function(event) {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeInventoryModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );


    // ======================================================
    // ESC KEY
    // ======================================================

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".inventory-modal.show"
                )
                .forEach(
                    function(modal) {

                        closeInventoryModal(
                            modal.id
                        );

                    }
                );

        }
    );

}


// ==========================================================
// INITIALIZE INVENTORY
// ==========================================================

async function initializeInventory() {

    if (
        inventoryInitialized
    ) {

        /*
         * The page is dynamically replaced by app.js.
         * Therefore we still need to bind the new DOM.
         */

        inventoryInitialized =
            false;

    }


    console.log(
        "=========================================="
    );


    console.log(
        "PAPPRITO INVENTORY INITIALIZING"
    );


    console.log(
        "=========================================="
    );


    bindInventoryEvents();


    await loadInventory();


    startInventoryListener();


    inventoryInitialized =
        true;


    console.log(
        "PAPPRITO Inventory Engine V1 loaded."
    );

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializeInventory =
    initializeInventory;


window.loadInventory =
    loadInventory;


window.startInventoryListener =
    startInventoryListener;


window.stopInventoryListener =
    stopInventoryListener;


window.openInventoryStockIn =
    openInventoryStockIn;


window.openInventoryStockOut =
    openInventoryStockOut;


window.openInventoryAdjustment =
    openInventoryAdjustment;


window.openInventoryDetails =
    openInventoryDetails;


window.closeInventoryModal =
    closeInventoryModal;


window.saveInventoryStockIn =
    saveInventoryStockIn;


window.saveInventoryStockOut =
    saveInventoryStockOut;


window.saveInventoryAdjustment =
    saveInventoryAdjustment;


window.applyInventoryFilters =
    applyInventoryFilters;


window.changeInventoryPage =
    changeInventoryPage;


console.log(
    "PAPPRITO Inventory Engine V1 loaded."
);
