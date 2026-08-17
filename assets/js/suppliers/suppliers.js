// ==========================================================
// PAPPRITO ERP
// SUPPLIER MASTER ENGINE V1
// File: assets/js/suppliers/suppliers.js
//
// FUNCTIONS:
// - Load Suppliers
// - Add Supplier
// - Edit Supplier
// - Delete Supplier
// - Search Supplier
// - Filter Status
// - Auto Supplier Code
// - Firebase Realtime Database
// - Supplier Summary
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let suppliersInitialized = false;

let suppliersData = {};

let editingSupplierId = null;


// ==========================================================
// FIREBASE CHECK
// ==========================================================

function suppliersFirebaseReady() {

    return (
        typeof db !== "undefined" &&
        db &&
        typeof db.ref === "function"
    );

}


// ==========================================================
// ELEMENT HELPER
// ==========================================================

function supplierElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeSupplierHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// GENERATE SUPPLIER CODE
// ==========================================================

function generateSupplierCode() {

    let highestNumber = 0;


    Object.values(
        suppliersData
    ).forEach(
        function(supplier) {

            if (!supplier) {

                return;

            }


            const code =
                String(
                    supplier.code ||
                    supplier.supplierCode ||
                    ""
                )
                .toUpperCase();


            const match =
                code.match(
                    /SUP-(\d+)/
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
        "SUP-" +
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

function openSupplierModal() {

    const modalElement =
        supplierElement(
            "supplierModal"
        );


    if (
        !modalElement ||
        typeof bootstrap === "undefined"
    ) {

        console.error(
            "Supplier modal not available."
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

function resetSupplierForm() {

    const form =
        supplierElement(
            "supplierForm"
        );


    if (form) {

        form.reset();

    }


    editingSupplierId =
        null;


    const id =
        supplierElement(
            "supplierId"
        );


    if (id) {

        id.value = "";

    }


    const title =
        supplierElement(
            "supplierModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-truck"></i>

            Add Supplier

        `;

    }


    const saveText =
        supplierElement(
            "supplierSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Supplier";

    }


    const code =
        supplierElement(
            "supplierCode"
        );


    if (code) {

        code.value =
            generateSupplierCode();

    }


    const type =
        supplierElement(
            "supplierType"
        );


    if (type) {

        type.value =
            "Raw Materials";

    }


    const paymentTerms =
        supplierElement(
            "supplierPaymentTerms"
        );


    if (paymentTerms) {

        paymentTerms.value =
            "Cash";

    }


    const status =
        supplierElement(
            "supplierStatus"
        );


    if (status) {

        status.value =
            "Active";

    }

}


// ==========================================================
// LOAD SUPPLIERS
// ==========================================================

async function loadSuppliers() {

    if (!suppliersFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }


    const snapshot =
        await db
            .ref(
                "suppliers"
            )
            .once(
                "value"
            );


    suppliersData =
        snapshot.val() || {};


    renderSuppliers();

    updateSupplierSummary();


    console.log(
        "Suppliers loaded:",
        Object.keys(
            suppliersData
        ).length
    );

}


// ==========================================================
// STATUS BADGE
// ==========================================================

function getSupplierStatusBadge(
    status
) {

    const active =
        String(
            status ||
            "Active"
        ).toLowerCase() ===
        "active";


    if (active) {

        return `

            <span class="supplier-status supplier-status-active">

                <i class="fa-solid fa-circle-check"></i>

                Active

            </span>

        `;

    }


    return `

        <span class="supplier-status supplier-status-inactive">

            <i class="fa-solid fa-circle-xmark"></i>

            Inactive

        </span>

    `;

}


// ==========================================================
// SUPPLIER TYPE BADGE
// ==========================================================

function getSupplierTypeBadge(
    type
) {

    const value =
        String(
            type ||
            "Other"
        );


    return `

        <span class="supplier-type-badge">

            ${escapeSupplierHTML(
                value
            )}

        </span>

    `;

}


// ==========================================================
// RENDER SUPPLIERS
// ==========================================================

function renderSuppliers() {

    const tbody =
        supplierElement(
            "supplierTableBody"
        );


    if (!tbody) {

        return;

    }


    const search =
        String(
            supplierElement(
                "supplierSearch"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const statusFilter =
        String(
            supplierElement(
                "supplierStatusFilter"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const suppliers =
        Object.entries(
            suppliersData
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

                // ==========================================
                // SEARCH
                // ==========================================

                if (search) {

                    const searchText =
                        [

                            supplier.code,

                            supplier.supplierCode,

                            supplier.name,

                            supplier.companyName,

                            supplier.contactPerson,

                            supplier.contactNumber,

                            supplier.phone,

                            supplier.email,

                            supplier.address,

                            supplier.type,

                            supplier.supplierType,

                            supplier.paymentTerms

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


                // ==========================================
                // STATUS
                // ==========================================

                if (
                    statusFilter &&
                    String(
                        supplier.status ||
                        "Active"
                    )
                    .toLowerCase() !==
                    statusFilter
                ) {

                    return false;

                }


                return true;

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


    // ======================================================
    // RECORD COUNT
    // ======================================================

    const recordCount =
        supplierElement(
            "supplierRecordCount"
        );


    if (recordCount) {

        recordCount.textContent =
            suppliers.length +
            (
                suppliers.length === 1
                    ? " Supplier"
                    : " Suppliers"
            );

    }


    // ======================================================
    // EMPTY
    // ======================================================

    if (
        suppliers.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center py-5 text-muted"
                >

                    <i
                        class="
                            fa-solid
                            fa-truck
                            fs-3
                            mb-2
                        "
                    ></i>

                    <div>

                        No suppliers found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    // ======================================================
    // TABLE ROWS
    // ======================================================

    tbody.innerHTML =
        suppliers
        .map(
            function(supplier) {

                const code =
                    supplier.code ||
                    supplier.supplierCode ||
                    "-";


                const name =
                    supplier.name ||
                    supplier.companyName ||
                    "-";


                const contactPerson =
                    supplier.contactPerson ||
                    "-";


                const contactNumber =
                    supplier.contactNumber ||
                    supplier.phone ||
                    "-";


                const email =
                    supplier.email ||
                    "-";


                const type =
                    supplier.type ||
                    supplier.supplierType ||
                    "Other";


                const paymentTerms =
                    supplier.paymentTerms ||
                    "-";


                return `

                    <tr>

                        <!-- CODE -->

                        <td>

                            <strong>

                                ${escapeSupplierHTML(
                                    code
                                )}

                            </strong>

                        </td>


                        <!-- NAME -->

                        <td>

                            <div class="supplier-name">

                                ${escapeSupplierHTML(
                                    name
                                )}

                            </div>

                        </td>


                        <!-- CONTACT PERSON -->

                        <td>

                            ${escapeSupplierHTML(
                                contactPerson
                            )}

                        </td>


                        <!-- CONTACT NUMBER -->

                        <td>

                            ${escapeSupplierHTML(
                                contactNumber
                            )}

                        </td>


                        <!-- EMAIL -->

                        <td>

                            ${
                                supplier.email
                                    ? `
                                        <a
                                            href="mailto:${escapeSupplierHTML(supplier.email)}"
                                            class="supplier-email"
                                        >

                                            ${escapeSupplierHTML(
                                                email
                                            )}

                                        </a>
                                      `
                                    :
                                      "-"
                            }

                        </td>


                        <!-- TYPE -->

                        <td>

                            ${getSupplierTypeBadge(
                                type
                            )}

                        </td>


                        <!-- PAYMENT TERMS -->

                        <td>

                            ${escapeSupplierHTML(
                                paymentTerms
                            )}

                        </td>


                        <!-- STATUS -->

                        <td>

                            ${getSupplierStatusBadge(
                                supplier.status
                            )}

                        </td>


                        <!-- ACTIONS -->

                        <td class="text-center">

                            <div class="supplier-actions">

                                <button
                                    type="button"
                                    class="btn btn-edit"
                                    title="Edit Supplier"
                                    onclick="editSupplier('${escapeSupplierHTML(supplier.id)}')">

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn btn-delete"
                                    title="Delete Supplier"
                                    onclick="deleteSupplier('${escapeSupplierHTML(supplier.id)}')">

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

function updateSupplierSummary() {

    const suppliers =
        Object.values(
            suppliersData
        );


    let active = 0;

    let inactive = 0;

    let withContact = 0;


    suppliers.forEach(
        function(supplier) {

            if (!supplier) {

                return;

            }


            const status =
                String(
                    supplier.status ||
                    "Active"
                ).toLowerCase();


            if (
                status === "active"
            ) {

                active++;

            }

            else {

                inactive++;

            }


            const contact =
                String(
                    supplier.contactPerson ||
                    supplier.contactNumber ||
                    supplier.phone ||
                    supplier.email ||
                    ""
                ).trim();


            if (contact) {

                withContact++;

            }

        }
    );


    const totalElement =
        supplierElement(
            "supplierTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            suppliers.length;

    }


    const activeElement =
        supplierElement(
            "supplierActive"
        );


    if (activeElement) {

        activeElement.textContent =
            active;

    }


    const inactiveElement =
        supplierElement(
            "supplierInactive"
        );


    if (inactiveElement) {

        inactiveElement.textContent =
            inactive;

    }


    const contactElement =
        supplierElement(
            "supplierWithContact"
        );


    if (contactElement) {

        contactElement.textContent =
            withContact;

    }

}


// ==========================================================
// SAVE SUPPLIER
// ==========================================================

async function saveSupplier(event) {

    if (event) {

        event.preventDefault();

    }


    if (!suppliersFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    const code =
        supplierElement(
            "supplierCode"
        )?.value
        .trim();


    const name =
        supplierElement(
            "supplierName"
        )?.value
        .trim();


    const contactPerson =
        supplierElement(
            "supplierContactPerson"
        )?.value
        .trim() ||
        "";


    const contactNumber =
        supplierElement(
            "supplierContactNumber"
        )?.value
        .trim() ||
        "";


    const email =
        supplierElement(
            "supplierEmail"
        )?.value
        .trim() ||
        "";


    const address =
        supplierElement(
            "supplierAddress"
        )?.value
        .trim() ||
        "";


    const type =
        supplierElement(
            "supplierType"
        )?.value ||
        "Other";


    const paymentTerms =
        supplierElement(
            "supplierPaymentTerms"
        )?.value ||
        "Cash";


    const taxId =
        supplierElement(
            "supplierTaxId"
        )?.value
        .trim() ||
        "";


    const status =
        supplierElement(
            "supplierStatus"
        )?.value ||
        "Active";


    const notes =
        supplierElement(
            "supplierNotes"
        )?.value
        .trim() ||
        "";


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!code) {

        alert(
            "Please enter the supplier code."
        );

        return;

    }


    if (!name) {

        alert(
            "Please enter the supplier/company name."
        );

        return;

    }


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    const saveButton =
        supplierElement(
            "supplierSaveBtn"
        );


    const saveText =
        supplierElement(
            "supplierSaveText"
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

        const supplierId =
            editingSupplierId ||
            supplierElement(
                "supplierId"
            )?.value ||
            db
                .ref(
                    "suppliers"
                )
                .push()
                .key;


        const existingSupplier =
            suppliersData[
                supplierId
            ] || {};


        // ==================================================
        // DATA
        // ==================================================

        const supplierData = {

            id:
                supplierId,

            code:
                code,

            supplierCode:
                code,

            name:
                name,

            companyName:
                name,

            contactPerson:
                contactPerson,

            contactNumber:
                contactNumber,

            phone:
                contactNumber,

            email:
                email,

            address:
                address,

            type:
                type,

            supplierType:
                type,

            paymentTerms:
                paymentTerms,

            taxId:
                taxId,

            status:
                status,

            notes:
                notes,

            createdAt:
                existingSupplier.createdAt ||
                firebase.database.ServerValue.TIMESTAMP,

            updatedAt:
                firebase.database.ServerValue.TIMESTAMP

        };


        // ==================================================
        // SAVE FIREBASE
        // ==================================================

        await db
            .ref(
                "suppliers/" +
                supplierId
            )
            .set(
                supplierData
            );


        alert(
            editingSupplierId
                ? "Supplier updated successfully."
                : "Supplier added successfully."
        );


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        const modalElement =
            supplierElement(
                "supplierModal"
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


        // ==================================================
        // RESET
        // ==================================================

        resetSupplierForm();


        // ==================================================
        // RELOAD
        // ==================================================

        await loadSuppliers();


        editingSupplierId =
            null;

    }

    catch (error) {

        console.error(
            "Supplier Save Error:",
            error
        );


        alert(
            "Unable to save supplier.\n\n" +
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
                editingSupplierId
                    ? "Update Supplier"
                    : "Save Supplier";

        }

    }

}


// ==========================================================
// EDIT SUPPLIER
// ==========================================================

function editSupplier(id) {

    if (!id) {

        return;

    }


    const supplier =
        suppliersData[
            id
        ];


    if (!supplier) {

        alert(
            "Supplier not found."
        );

        return;

    }


    editingSupplierId =
        id;


    const hiddenId =
        supplierElement(
            "supplierId"
        );


    if (hiddenId) {

        hiddenId.value =
            id;

    }


    const code =
        supplierElement(
            "supplierCode"
        );


    if (code) {

        code.value =
            supplier.code ||
            supplier.supplierCode ||
            "";

    }


    const name =
        supplierElement(
            "supplierName"
        );


    if (name) {

        name.value =
            supplier.name ||
            supplier.companyName ||
            "";

    }


    const contactPerson =
        supplierElement(
            "supplierContactPerson"
        );


    if (contactPerson) {

        contactPerson.value =
            supplier.contactPerson ||
            "";

    }


    const contactNumber =
        supplierElement(
            "supplierContactNumber"
        );


    if (contactNumber) {

        contactNumber.value =
            supplier.contactNumber ||
            supplier.phone ||
            "";

    }


    const email =
        supplierElement(
            "supplierEmail"
        );


    if (email) {

        email.value =
            supplier.email ||
            "";

    }


    const address =
        supplierElement(
            "supplierAddress"
        );


    if (address) {

        address.value =
            supplier.address ||
            "";

    }


    const type =
        supplierElement(
            "supplierType"
        );


    if (type) {

        type.value =
            supplier.type ||
            supplier.supplierType ||
            "Other";

    }


    const paymentTerms =
        supplierElement(
            "supplierPaymentTerms"
        );


    if (paymentTerms) {

        paymentTerms.value =
            supplier.paymentTerms ||
            "Cash";

    }


    const taxId =
        supplierElement(
            "supplierTaxId"
        );


    if (taxId) {

        taxId.value =
            supplier.taxId ||
            "";

    }


    const status =
        supplierElement(
            "supplierStatus"
        );


    if (status) {

        status.value =
            supplier.status ||
            "Active";

    }


    const notes =
        supplierElement(
            "supplierNotes"
        );


    if (notes) {

        notes.value =
            supplier.notes ||
            "";

    }


    // ======================================================
    // MODAL TITLE
    // ======================================================

    const title =
        supplierElement(
            "supplierModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-pen-to-square"></i>

            Edit Supplier

        `;

    }


    // ======================================================
    // BUTTON
    // ======================================================

    const saveText =
        supplierElement(
            "supplierSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Update Supplier";

    }


    openSupplierModal();

}


// ==========================================================
// DELETE SUPPLIER
// ==========================================================

async function deleteSupplier(id) {

    if (!id) {

        return;

    }


    const supplier =
        suppliersData[
            id
        ];


    if (!supplier) {

        alert(
            "Supplier not found."
        );

        return;

    }


    const name =
        supplier.name ||
        supplier.companyName ||
        "this supplier";


    const confirmed =
        window.confirm(
            "Are you sure you want to delete " +
            name +
            "?"
        );


    if (!confirmed) {

        return;

    }


    if (!suppliersFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        await db
            .ref(
                "suppliers/" +
                id
            )
            .remove();


        alert(
            "Supplier deleted successfully."
        );


        await loadSuppliers();

    }

    catch (error) {

        console.error(
            "Supplier Delete Error:",
            error
        );


        alert(
            "Unable to delete supplier.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

}


// ==========================================================
// REFRESH
// ==========================================================

async function refreshSuppliers() {

    try {

        await loadSuppliers();

    }

    catch (error) {

        console.error(
            "Supplier Refresh Error:",
            error
        );

    }

}


// ==========================================================
// FILTER
// ==========================================================

function handleSupplierFilter() {

    renderSuppliers();

}


// ==========================================================
// BIND EVENTS
// ==========================================================

function bindSupplierEvents() {

    const addButton =
        supplierElement(
            "addSupplierBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function() {

                resetSupplierForm();

                openSupplierModal();

            }
        );

    }


    const form =
        supplierElement(
            "supplierForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveSupplier
        );

    }


    const refreshButton =
        supplierElement(
            "supplierRefreshBtn"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshSuppliers
        );

    }


    const search =
        supplierElement(
            "supplierSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            handleSupplierFilter
        );

    }


    const statusFilter =
        supplierElement(
            "supplierStatusFilter"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            handleSupplierFilter
        );

    }


    const modal =
        supplierElement(
            "supplierModal"
        );


    if (modal) {

        modal.addEventListener(
            "hidden.bs.modal",
            function() {

                resetSupplierForm();

            }
        );

    }

}


// ==========================================================
// INITIALIZE
// ==========================================================

async function initializeSuppliers() {

    console.log(
        "=========================================="
    );

    console.log(
        "PAPPRITO SUPPLIERS INITIALIZING..."
    );

    console.log(
        "=========================================="
    );


    if (!suppliersFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        bindSupplierEvents();

        await loadSuppliers();


        suppliersInitialized =
            true;


        console.log(
            "PAPPRITO Supplier Master initialized."
        );

    }

    catch (error) {

        console.error(
            "Supplier Initialization Error:",
            error
        );

    }

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializeSuppliers =
    initializeSuppliers;

window.loadSuppliers =
    loadSuppliers;

window.openSupplierModal =
    openSupplierModal;

window.resetSupplierForm =
    resetSupplierForm;

window.saveSupplier =
    saveSupplier;

window.editSupplier =
    editSupplier;

window.deleteSupplier =
    deleteSupplier;

window.refreshSuppliers =
    refreshSuppliers;


console.log(
    "PAPPRITO Supplier Master Engine V1 loaded."
);
