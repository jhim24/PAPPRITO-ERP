// ==========================================================
// PAPPRITO ERP
// RAW MATERIALS MASTER ENGINE V1
// File: assets/js/raw-materials/raw-materials.js
//
// FUNCTIONS:
// - Load Raw Materials
// - Add Raw Material
// - Edit Raw Material
// - Delete Raw Material
// - Search
// - Category Filter
// - Status Filter
// - Stock Filter
// - Supplier Loading
// - Summary
// - Firebase Realtime Database
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let rawMaterialsInitialized = false;

let rawMaterialsData = {};

let rawMaterialsSuppliers = {};

let editingRawMaterialId = null;

let rawMaterialsRef = null;


// ==========================================================
// FIREBASE CHECK
// ==========================================================

function rawMaterialsFirebaseReady() {

    return (
        typeof db !== "undefined" &&
        db &&
        typeof db.ref === "function"
    );

}


// ==========================================================
// ELEMENT HELPER
// ==========================================================

function rawMaterialElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeRawMaterialHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// NUMBER FORMAT
// ==========================================================

function formatRawMaterialNumber(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ==========================================================
// CURRENCY FORMAT
// ==========================================================

function formatRawMaterialCurrency(value) {

    return "₱" +
        (
            Number(value) || 0
        ).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================================
// GENERATE MATERIAL CODE
// ==========================================================

function generateRawMaterialCode() {

    let highestNumber = 0;

    Object.values(
        rawMaterialsData
    ).forEach(
        function(material) {

            if (!material) {
                return;
            }

            const code =
                String(
                    material.code ||
                    ""
                )
                .toUpperCase();

            const match =
                code.match(
                    /RM-(\d+)/
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
        "RM-" +
        String(
            highestNumber + 1
        ).padStart(
            4,
            "0"
        )
    );

}


// ==========================================================
// OPEN MODAL
// ==========================================================

function openRawMaterialModal() {

    const modalElement =
        rawMaterialElement(
            "rawMaterialModal"
        );

    if (
        !modalElement ||
        typeof bootstrap === "undefined"
    ) {

        console.error(
            "Raw Material modal unavailable."
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
// RESET MODAL
// ==========================================================

function resetRawMaterialForm() {

    const form =
        rawMaterialElement(
            "rawMaterialForm"
        );

    if (form) {

        form.reset();

    }

    editingRawMaterialId =
        null;


    const id =
        rawMaterialElement(
            "rawMaterialId"
        );

    if (id) {

        id.value = "";

    }


    const title =
        rawMaterialElement(
            "rawMaterialModalTitle"
        );

    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-boxes-stacked"></i>

            Add Raw Material

        `;

    }


    const saveText =
        rawMaterialElement(
            "rawMaterialSaveText"
        );

    if (saveText) {

        saveText.textContent =
            "Save Raw Material";

    }


    const code =
        rawMaterialElement(
            "rawMaterialCode"
        );

    if (code) {

        code.value =
            generateRawMaterialCode();

    }


    const stock =
        rawMaterialElement(
            "rawMaterialCurrentStock"
        );

    if (stock) {

        stock.value =
            "0";

    }


    const reorder =
        rawMaterialElement(
            "rawMaterialReorderLevel"
        );

    if (reorder) {

        reorder.value =
            "0";

    }


    const cost =
        rawMaterialElement(
            "rawMaterialCost"
        );

    if (cost) {

        cost.value =
            "0.00";

    }


    const status =
        rawMaterialElement(
            "rawMaterialStatus"
        );

    if (status) {

        status.value =
            "Active";

    }


    const unit =
        rawMaterialElement(
            "rawMaterialUnit"
        );

    if (unit) {

        unit.value =
            "pcs";

    }

}


// ==========================================================
// LOAD RAW MATERIALS
// ==========================================================

async function loadRawMaterials() {

    if (!rawMaterialsFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }


    const snapshot =
        await db
            .ref(
                "rawMaterials"
            )
            .once(
                "value"
            );


    rawMaterialsData =
        snapshot.val() || {};


    renderRawMaterials();

    updateRawMaterialSummary();

    populateRawMaterialCategories();


    console.log(
        "Raw Materials loaded:",
        Object.keys(
            rawMaterialsData
        ).length
    );

}


// ==========================================================
// LOAD SUPPLIERS
// ==========================================================

async function loadRawMaterialSuppliers() {

    if (!rawMaterialsFirebaseReady()) {

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


        rawMaterialsSuppliers =
            snapshot.val() || {};


        populateRawMaterialSuppliers();

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

function populateRawMaterialSuppliers() {

    const select =
        rawMaterialElement(
            "rawMaterialSupplier"
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
        rawMaterialsSuppliers
    ).forEach(
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
// POPULATE CATEGORIES
// ==========================================================

function populateRawMaterialCategories() {

    const select =
        rawMaterialElement(
            "rawMaterialCategoryFilter"
        );

    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    const categories =
        new Set();


    Object.values(
        rawMaterialsData
    ).forEach(
        function(material) {

            if (!material) {
                return;
            }


            const category =
                String(
                    material.category ||
                    ""
                ).trim();


            if (category) {

                categories.add(
                    category
                );

            }

        }
    );


    select.innerHTML = `

        <option value="">

            All Categories

        </option>

    `;


    Array.from(
        categories
    )
    .sort(
        function(a, b) {

            return a.localeCompare(b);

        }
    )
    .forEach(
        function(category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            select.appendChild(
                option
            );

        }
    );


    if (
        Array.from(
            categories
        ).includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


// ==========================================================
// GET STOCK
// ==========================================================

function getRawMaterialStock(material) {

    return Number(
        material?.currentStock ??
        material?.stock ??
        material?.quantity ??
        0
    ) || 0;

}


// ==========================================================
// GET REORDER LEVEL
// ==========================================================

function getRawMaterialReorderLevel(material) {

    return Number(
        material?.reorderLevel ??
        0
    ) || 0;

}


// ==========================================================
// STOCK STATUS
// ==========================================================

function getRawMaterialStockStatus(material) {

    const stock =
        getRawMaterialStock(
            material
        );

    const reorderLevel =
        getRawMaterialReorderLevel(
            material
        );


    if (
        stock <= 0
    ) {

        return "out";

    }


    if (
        reorderLevel > 0 &&
        stock <= reorderLevel
    ) {

        return "low";

    }


    return "normal";

}


// ==========================================================
// STOCK BADGE
// ==========================================================

function getRawMaterialStockBadge(material) {

    const status =
        getRawMaterialStockStatus(
            material
        );


    if (
        status === "out"
    ) {

        return `

            <span class="raw-material-stock-badge raw-material-stock-badge-out">

                Out of Stock

            </span>

        `;

    }


    if (
        status === "low"
    ) {

        return `

            <span class="raw-material-stock-badge raw-material-stock-badge-low">

                Low Stock

            </span>

        `;

    }


    return `

        <span class="raw-material-stock-badge raw-material-stock-badge-normal">

            In Stock

        </span>

    `;

}


// ==========================================================
// STATUS BADGE
// ==========================================================

function getRawMaterialStatusBadge(status) {

    const active =
        String(
            status ||
            "Active"
        ).toLowerCase() ===
        "active";


    if (active) {

        return `

            <span class="raw-material-status raw-material-status-active">

                Active

            </span>

        `;

    }


    return `

        <span class="raw-material-status raw-material-status-inactive">

            Inactive

        </span>

    `;

}


// ==========================================================
// RENDER TABLE
// ==========================================================

function renderRawMaterials() {

    const tbody =
        rawMaterialElement(
            "rawMaterialTableBody"
        );


    if (!tbody) {

        return;

    }


    const search =
        String(
            rawMaterialElement(
                "rawMaterialSearch"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const category =
        String(
            rawMaterialElement(
                "rawMaterialCategoryFilter"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const statusFilter =
        String(
            rawMaterialElement(
                "rawMaterialStatusFilter"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const stockFilter =
        String(
            rawMaterialElement(
                "rawMaterialStockFilter"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const materials =
        Object.entries(
            rawMaterialsData
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

                // SEARCH

                if (search) {

                    const searchText =
                        [

                            material.code,

                            material.name,

                            material.category,

                            material.unit,

                            material.supplierName,

                            material.notes

                        ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                    if (
                        !searchText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                // CATEGORY

                if (
                    category &&
                    String(
                        material.category ||
                        ""
                    )
                    .toLowerCase() !==
                    category
                ) {

                    return false;

                }


                // STATUS

                if (
                    statusFilter &&
                    String(
                        material.status ||
                        "Active"
                    )
                    .toLowerCase() !==
                    statusFilter
                ) {

                    return false;

                }


                // STOCK

                if (stockFilter) {

                    const stockStatus =
                        getRawMaterialStockStatus(
                            material
                        );


                    if (
                        stockFilter === "in" &&
                        stockStatus !== "normal"
                    ) {

                        return false;

                    }


                    if (
                        stockFilter === "low" &&
                        stockStatus !== "low"
                    ) {

                        return false;

                    }


                    if (
                        stockFilter === "out" &&
                        stockStatus !== "out"
                    ) {

                        return false;

                    }

                }


                return true;

            }
        )
        .sort(
            function(a, b) {

                return String(
                    a.name ||
                    ""
                ).localeCompare(
                    String(
                        b.name ||
                        ""
                    )
                );

            }
        );


    // ======================================================
    // RECORD COUNT
    // ======================================================

    const recordCount =
        rawMaterialElement(
            "rawMaterialRecordCount"
        );


    if (recordCount) {

        recordCount.textContent =
            materials.length +
            (
                materials.length === 1
                    ? " Material"
                    : " Materials"
            );

    }


    // ======================================================
    // EMPTY
    // ======================================================

    if (
        materials.length === 0
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

                        No raw materials found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    // ======================================================
    // ROWS
    // ======================================================

    tbody.innerHTML =
        materials
        .map(
            function(material) {

                const stock =
                    getRawMaterialStock(
                        material
                    );


                const reorderLevel =
                    getRawMaterialReorderLevel(
                        material
                    );


                const stockStatus =
                    getRawMaterialStockStatus(
                        material
                    );


                const stockClass =
                    stockStatus === "out"
                        ? "raw-material-stock-out"
                        : stockStatus === "low"
                            ? "raw-material-stock-low"
                            : "raw-material-stock-normal";


                const supplier =
                    material.supplierName ||
                    (
                        material.supplierId &&
                        rawMaterialsSuppliers[
                            material.supplierId
                        ]
                            ? (
                                rawMaterialsSuppliers[
                                    material.supplierId
                                ].name ||
                                rawMaterialsSuppliers[
                                    material.supplierId
                                ].supplierName ||
                                rawMaterialsSuppliers[
                                    material.supplierId
                                ].companyName ||
                                ""
                            )
                            : ""
                    );


                return `

                    <tr>

                        <!-- CODE -->

                        <td>

                            <strong>

                                ${escapeRawMaterialHTML(
                                    material.code ||
                                    "-"
                                )}

                            </strong>

                        </td>


                        <!-- NAME -->

                        <td>

                            <div class="raw-material-name">

                                ${escapeRawMaterialHTML(
                                    material.name ||
                                    "-"
                                )}

                            </div>

                        </td>


                        <!-- CATEGORY -->

                        <td>

                            ${escapeRawMaterialHTML(
                                material.category ||
                                "-"
                            )}

                        </td>


                        <!-- UNIT -->

                        <td>

                            ${escapeRawMaterialHTML(
                                String(
                                    material.unit ||
                                    "pcs"
                                ).toUpperCase()
                            )}

                        </td>


                        <!-- CURRENT STOCK -->

                        <td class="text-end">

                            <span
                                class="
                                    raw-material-stock
                                    ${stockClass}
                                "
                            >

                                ${formatRawMaterialNumber(
                                    stock
                                )}

                            </span>

                            <div class="mt-1">

                                ${getRawMaterialStockBadge(
                                    material
                                )}

                            </div>

                        </td>


                        <!-- REORDER -->

                        <td class="text-end">

                            ${formatRawMaterialNumber(
                                reorderLevel
                            )}

                        </td>


                        <!-- COST -->

                        <td class="text-end">

                            ${formatRawMaterialCurrency(
                                material.cost ||
                                material.unitCost ||
                                0
                            )}

                        </td>


                        <!-- SUPPLIER -->

                        <td>

                            ${escapeRawMaterialHTML(
                                supplier ||
                                "-"
                            )}

                        </td>


                        <!-- STATUS -->

                        <td class="text-center">

                            ${getRawMaterialStatusBadge(
                                material.status
                            )}

                        </td>


                        <!-- ACTION -->

                        <td class="text-center">

                            <div class="raw-material-actions">

                                <button
                                    type="button"
                                    class="btn btn-edit"
                                    title="Edit"
                                    onclick="editRawMaterial('${escapeRawMaterialHTML(material.id)}')">

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn btn-delete"
                                    title="Delete"
                                    onclick="deleteRawMaterial('${escapeRawMaterialHTML(material.id)}')">

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

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

function updateRawMaterialSummary() {

    const materials =
        Object.values(
            rawMaterialsData
        );


    let active = 0;

    let lowStock = 0;

    let outOfStock = 0;


    materials.forEach(
        function(material) {

            if (!material) {
                return;
            }


            const status =
                String(
                    material.status ||
                    "Active"
                ).toLowerCase();


            if (
                status === "active"
            ) {

                active++;

            }


            const stockStatus =
                getRawMaterialStockStatus(
                    material
                );


            if (
                stockStatus === "low"
            ) {

                lowStock++;

            }


            if (
                stockStatus === "out"
            ) {

                outOfStock++;

            }

        }
    );


    const totalElement =
        rawMaterialElement(
            "rawMaterialTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            formatRawMaterialNumber(
                materials.length
            );

    }


    const activeElement =
        rawMaterialElement(
            "rawMaterialActive"
        );


    if (activeElement) {

        activeElement.textContent =
            formatRawMaterialNumber(
                active
            );

    }


    const lowElement =
        rawMaterialElement(
            "rawMaterialLowStock"
        );


    if (lowElement) {

        lowElement.textContent =
            formatRawMaterialNumber(
                lowStock
            );

    }


    const outElement =
        rawMaterialElement(
            "rawMaterialOutOfStock"
        );


    if (outElement) {

        outElement.textContent =
            formatRawMaterialNumber(
                outOfStock
            );

    }

}


// ==========================================================
// GET SUPPLIER NAME
// ==========================================================

function getRawMaterialSupplierName() {

    const supplierSelect =
        rawMaterialElement(
            "rawMaterialSupplier"
        );


    const supplierId =
        supplierSelect
            ? supplierSelect.value
            : "";


    if (
        supplierId &&
        rawMaterialsSuppliers[
            supplierId
        ]
    ) {

        const supplier =
            rawMaterialsSuppliers[
                supplierId
            ];


        return (
            supplier.name ||
            supplier.supplierName ||
            supplier.companyName ||
            ""
        );

    }


    return (
        rawMaterialElement(
            "rawMaterialSupplierName"
        )?.value ||
        ""
    ).trim();

}


// ==========================================================
// SUPPLIER CHANGE
// ==========================================================

function handleRawMaterialSupplierChange() {

    const select =
        rawMaterialElement(
            "rawMaterialSupplier"
        );


    const nameInput =
        rawMaterialElement(
            "rawMaterialSupplierName"
        );


    if (
        !select ||
        !nameInput
    ) {

        return;

    }


    const supplier =
        rawMaterialsSuppliers[
            select.value
        ];


    if (!supplier) {

        return;

    }


    nameInput.value =
        supplier.name ||
        supplier.supplierName ||
        supplier.companyName ||
        "";

}


// ==========================================================
// SAVE
// ==========================================================

async function saveRawMaterial(event) {

    if (event) {

        event.preventDefault();

    }


    if (!rawMaterialsFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    const code =
        rawMaterialElement(
            "rawMaterialCode"
        )?.value
        .trim();


    const name =
        rawMaterialElement(
            "rawMaterialName"
        )?.value
        .trim();


    const category =
        rawMaterialElement(
            "rawMaterialCategory"
        )?.value
        .trim();


    const unit =
        rawMaterialElement(
            "rawMaterialUnit"
        )?.value ||
        "pcs";


    const currentStock =
        Number(
            rawMaterialElement(
                "rawMaterialCurrentStock"
            )?.value
        ) || 0;


    const reorderLevel =
        Number(
            rawMaterialElement(
                "rawMaterialReorderLevel"
            )?.value
        ) || 0;


    const cost =
        Number(
            rawMaterialElement(
                "rawMaterialCost"
            )?.value
        ) || 0;


    const status =
        rawMaterialElement(
            "rawMaterialStatus"
        )?.value ||
        "Active";


    const notes =
        rawMaterialElement(
            "rawMaterialNotes"
        )?.value
        .trim() ||
        "";


    const supplierId =
        rawMaterialElement(
            "rawMaterialSupplier"
        )?.value ||
        "";


    const supplierName =
        getRawMaterialSupplierName();


    if (!code) {

        alert(
            "Please enter the material code."
        );

        return;

    }


    if (!name) {

        alert(
            "Please enter the material name."
        );

        return;

    }


    if (!category) {

        alert(
            "Please enter the category."
        );

        return;

    }


    if (
        currentStock < 0
    ) {

        alert(
            "Current stock cannot be negative."
        );

        return;

    }


    if (
        reorderLevel < 0
    ) {

        alert(
            "Reorder level cannot be negative."
        );

        return;

    }


    if (
        cost < 0
    ) {

        alert(
            "Cost cannot be negative."
        );

        return;

    }


    const saveButton =
        rawMaterialElement(
            "rawMaterialSaveBtn"
        );


    const saveText =
        rawMaterialElement(
            "rawMaterialSaveText"
        );


    const originalText =
        saveText
            ? saveText.textContent
            : "Save Raw Material";


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

        }


        if (saveText) {

            saveText.textContent =
                "Saving...";

        }


        const materialId =
            editingRawMaterialId ||
            rawMaterialElement(
                "rawMaterialId"
            )?.value ||
            db
                .ref(
                    "rawMaterials"
                )
                .push()
                .key;


        const existing =
            rawMaterialsData[
                materialId
            ] || {};


        const materialData = {

            id:
                materialId,

            code:
                code,

            name:
                name,

            category:
                category,

            unit:
                unit,

            currentStock:
                currentStock,

            reorderLevel:
                reorderLevel,

            cost:
                cost,

            unitCost:
                cost,

            supplierId:
                supplierId,

            supplierName:
                supplierName,

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


        await db
            .ref(
                "rawMaterials/" +
                materialId
            )
            .set(
                materialData
            );


        alert(
            editingRawMaterialId
                ? "Raw Material updated successfully."
                : "Raw Material added successfully."
        );


        const modalElement =
            rawMaterialElement(
                "rawMaterialModal"
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


        resetRawMaterialForm();


        await loadRawMaterials();


        editingRawMaterialId =
            null;


    }

    catch (error) {

        console.error(
            "Raw Material Save Error:",
            error
        );


        alert(
            "Unable to save Raw Material.\n\n" +
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
                originalText;

        }

    }

}


// ==========================================================
// EDIT
// ==========================================================

function editRawMaterial(id) {

    if (!id) {

        return;

    }


    const material =
        rawMaterialsData[
            id
        ];


    if (!material) {

        alert(
            "Raw Material not found."
        );

        return;

    }


    editingRawMaterialId =
        id;


    const hiddenId =
        rawMaterialElement(
            "rawMaterialId"
        );


    if (hiddenId) {

        hiddenId.value =
            id;

    }


    const code =
        rawMaterialElement(
            "rawMaterialCode"
        );


    if (code) {

        code.value =
            material.code ||
            "";

    }


    const name =
        rawMaterialElement(
            "rawMaterialName"
        );


    if (name) {

        name.value =
            material.name ||
            "";

    }


    const category =
        rawMaterialElement(
            "rawMaterialCategory"
        );


    if (category) {

        category.value =
            material.category ||
            "";

    }


    const unit =
        rawMaterialElement(
            "rawMaterialUnit"
        );


    if (unit) {

        unit.value =
            material.unit ||
            "pcs";

    }


    const stock =
        rawMaterialElement(
            "rawMaterialCurrentStock"
        );


    if (stock) {

        stock.value =
            getRawMaterialStock(
                material
            );

    }


    const reorder =
        rawMaterialElement(
            "rawMaterialReorderLevel"
        );


    if (reorder) {

        reorder.value =
            getRawMaterialReorderLevel(
                material
            );

    }


    const cost =
        rawMaterialElement(
            "rawMaterialCost"
        );


    if (cost) {

        cost.value =
            Number(
                material.cost ??
                material.unitCost ??
                0
            ).toFixed(2);

    }


    const status =
        rawMaterialElement(
            "rawMaterialStatus"
        );


    if (status) {

        status.value =
            material.status ||
            "Active";

    }


    const supplier =
        rawMaterialElement(
            "rawMaterialSupplier"
        );


    if (supplier) {

        supplier.value =
            material.supplierId ||
            "";

    }


    const supplierName =
        rawMaterialElement(
            "rawMaterialSupplierName"
        );


    if (supplierName) {

        supplierName.value =
            material.supplierName ||
            "";

    }


    const notes =
        rawMaterialElement(
            "rawMaterialNotes"
        );


    if (notes) {

        notes.value =
            material.notes ||
            "";

    }


    const title =
        rawMaterialElement(
            "rawMaterialModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-pen-to-square"></i>

            Edit Raw Material

        `;

    }


    const saveText =
        rawMaterialElement(
            "rawMaterialSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Update Raw Material";

    }


    openRawMaterialModal();

}


// ==========================================================
// DELETE
// ==========================================================

async function deleteRawMaterial(id) {

    if (!id) {

        return;

    }


    const material =
        rawMaterialsData[
            id
        ];


    if (!material) {

        alert(
            "Raw Material not found."
        );

        return;

    }


    const name =
        material.name ||
        "this raw material";


    const confirmed =
        window.confirm(
            "Are you sure you want to delete " +
            name +
            "?"
        );


    if (!confirmed) {

        return;

    }


    if (!rawMaterialsFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        await db
            .ref(
                "rawMaterials/" +
                id
            )
            .remove();


        alert(
            "Raw Material deleted successfully."
        );


        await loadRawMaterials();

    }

    catch (error) {

        console.error(
            "Raw Material Delete Error:",
            error
        );


        alert(
            "Unable to delete Raw Material.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

}


// ==========================================================
// SEARCH / FILTER EVENTS
// ==========================================================

function handleRawMaterialFilter() {

    renderRawMaterials();

}


// ==========================================================
// REFRESH
// ==========================================================

async function refreshRawMaterials() {

    try {

        await loadRawMaterialSuppliers();

        await loadRawMaterials();

    }

    catch (error) {

        console.error(
            "Raw Material Refresh Error:",
            error
        );

    }

}


// ==========================================================
// BIND EVENTS
// ==========================================================

function bindRawMaterialEvents() {

    const addButton =
        rawMaterialElement(
            "addRawMaterialBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function() {

                resetRawMaterialForm();

                openRawMaterialModal();

            }
        );

    }


    const form =
        rawMaterialElement(
            "rawMaterialForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveRawMaterial
        );

    }


    const resetButton =
        rawMaterialElement(
            "rawMaterialResetBtn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function() {

                setTimeout(
                    function() {

                        resetRawMaterialForm();

                    },
                    0
                );

            }
        );

    }


    const refreshButton =
        rawMaterialElement(
            "rawMaterialRefreshBtn"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshRawMaterials
        );

    }


    const search =
        rawMaterialElement(
            "rawMaterialSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            handleRawMaterialFilter
        );

    }


    const category =
        rawMaterialElement(
            "rawMaterialCategoryFilter"
        );


    if (category) {

        category.addEventListener(
            "change",
            handleRawMaterialFilter
        );

    }


    const status =
        rawMaterialElement(
            "rawMaterialStatusFilter"
        );


    if (status) {

        status.addEventListener(
            "change",
            handleRawMaterialFilter
        );

    }


    const stock =
        rawMaterialElement(
            "rawMaterialStockFilter"
        );


    if (stock) {

        stock.addEventListener(
            "change",
            handleRawMaterialFilter
        );

    }


    const supplier =
        rawMaterialElement(
            "rawMaterialSupplier"
        );


    if (supplier) {

        supplier.addEventListener(
            "change",
            handleRawMaterialSupplierChange
        );

    }

}


// ==========================================================
// STOP LISTENER
// ==========================================================

function stopRawMaterialsListener() {

    if (rawMaterialsRef) {

        rawMaterialsRef.off();

        rawMaterialsRef =
            null;

    }

}


// ==========================================================
// INITIALIZE
// ==========================================================

async function initializeRawMaterials() {

    console.log(
        "=========================================="
    );

    console.log(
        "PAPPRITO RAW MATERIALS INITIALIZING..."
    );

    console.log(
        "=========================================="
    );


    if (!rawMaterialsFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        bindRawMaterialEvents();

        await loadRawMaterialSuppliers();

        await loadRawMaterials();


        rawMaterialsInitialized =
            true;


        console.log(
            "PAPPRITO Raw Materials initialized."
        );

    }

    catch (error) {

        console.error(
            "Raw Materials Initialization Error:",
            error
        );

    }

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializeRawMaterials =
    initializeRawMaterials;

window.loadRawMaterials =
    loadRawMaterials;

window.loadRawMaterialSuppliers =
    loadRawMaterialSuppliers;

window.editRawMaterial =
    editRawMaterial;

window.deleteRawMaterial =
    deleteRawMaterial;

window.resetRawMaterialForm =
    resetRawMaterialForm;

window.openRawMaterialModal =
    openRawMaterialModal;

window.refreshRawMaterials =
    refreshRawMaterials;

window.stopRawMaterialsListener =
    stopRawMaterialsListener;


console.log(
    "PAPPRITO Raw Materials Engine V1 loaded."
);
