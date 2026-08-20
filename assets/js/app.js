// ==========================================================
// PAPPRITO ERP
// APP / NAVIGATION ENGINE V12
// File : assets/js/app.js
//
// IMPORTANT ARCHITECTURE:
//
// MAIN ERP
// - Uses Sidebar
// - Uses Navbar
// - Uses #content
//
// POS
// - Standalone page
// - NO ERP Sidebar
// - NO ERP Navbar
// - Fullscreen
// - Opens directly: pages/pos.html
//
// MAIN FUNCTIONS:
// - Component Loader
// - Page Loader
// - Dashboard Loader
// - Product Loader
// - Category Loader
// - Receiving Orders Loader
// - Inventory Loader
// - Raw Materials Loader
// - Stock In Loader
// - Supplier Loader
// - Mobile Sidebar
// - Page Navigation
// - Safe Script Loading
// - Page Re-initialization
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let dashboardScriptsLoaded = false;

let productScriptsLoaded = false;

let categoryScriptsLoaded = false;

let receivingOrdersScriptsLoaded = false;

let inventoryScriptsLoaded = false;

let rawMaterialsScriptsLoaded = false;

let stockInScriptsLoaded = false;

let suppliersScriptsLoaded = false;


// ==========================================================
// SCRIPT GROUPS
// ==========================================================

const dashboardScripts = [

    "assets/js/dashboard/dashboard.js"

];


const productScripts = [

    "assets/js/products/product-load.js",

    "assets/js/products/product-search.js",

    "assets/js/products/product-image.js",

    "assets/js/products/product-save.js",

    "assets/js/products/product-edit.js",

    "assets/js/products/product-delete.js"

];


const categoryScripts = [

    "assets/js/category/category.js"

];


const receivingOrdersScripts = [

    "assets/js/receiving-orders/receiving-orders.js"

];


const inventoryScripts = [

    "assets/js/inventory/inventory.js"

];


const rawMaterialsScripts = [

    "assets/js/raw-materials/raw-materials.js"

];


const stockInScripts = [

    "assets/js/stock-in/stock-in.js"

];


const suppliersScripts = [

    "assets/js/suppliers/suppliers.js"

];


// ==========================================================
// LOAD HTML COMPONENT
// ==========================================================

async function loadComponent(
    id,
    file
) {

    try {

        const response =
            await fetch(
                file,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load component: " +
                file
            );

        }


        const html =
            await response.text();


        const element =
            document.getElementById(
                id
            );


        if (!element) {

            console.warn(
                "Component container not found:",
                id
            );

            return false;

        }


        element.innerHTML =
            html;


        return true;

    }

    catch (error) {

        console.error(
            "Component Loading Error:",
            error
        );


        return false;

    }

}


// ==========================================================
// LOAD JAVASCRIPT
// ==========================================================

function loadScript(
    src
) {

    return new Promise(
        function(
            resolve,
            reject
        ) {

            const existing =
                document.querySelector(
                    `script[data-papprito-script="${src}"]`
                );


            if (existing) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                src;


            script.dataset.pappritoScript =
                src;


            script.async =
                false;


            script.onload =
                function() {

                    console.log(
                        "PAPPRITO JS Loaded:",
                        src
                    );


                    resolve();

                };


            script.onerror =
                function() {

                    console.error(
                        "PAPPRITO JS FAILED:",
                        src
                    );


                    reject(
                        new Error(
                            "Unable to load script: " +
                            src
                        )
                    );

                };


            document.body.appendChild(
                script
            );

        }
    );

}


// ==========================================================
// LOAD SCRIPT GROUP
// ==========================================================

async function loadScriptGroup(
    scripts,
    groupName
) {

    console.log(
        "=========================================="
    );


    console.log(
        "LOADING " +
        groupName +
        " MODULE"
    );


    console.log(
        "=========================================="
    );


    for (
        const script of scripts
    ) {

        await loadScript(
            script
        );

    }


    console.log(
        groupName +
        " MODULE LOADED."
    );

}


// ==========================================================
// DASHBOARD
// ==========================================================

async function loadDashboardScripts() {

    if (
        dashboardScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        dashboardScripts,
        "DASHBOARD"
    );


    dashboardScriptsLoaded =
        true;

}


// ==========================================================
// PRODUCTS
// ==========================================================

async function loadProductScripts() {

    if (
        productScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        productScripts,
        "PRODUCT"
    );


    productScriptsLoaded =
        true;

}


// ==========================================================
// CATEGORY
// ==========================================================

async function loadCategoryScripts() {

    if (
        categoryScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        categoryScripts,
        "CATEGORY"
    );


    categoryScriptsLoaded =
        true;

}


// ==========================================================
// RECEIVING ORDERS
// ==========================================================

async function loadReceivingOrdersScripts() {

    if (
        receivingOrdersScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        receivingOrdersScripts,
        "RECEIVING ORDERS"
    );


    receivingOrdersScriptsLoaded =
        true;

}


// ==========================================================
// INVENTORY
// ==========================================================

async function loadInventoryScripts() {

    if (
        inventoryScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        inventoryScripts,
        "INVENTORY"
    );


    inventoryScriptsLoaded =
        true;

}


// ==========================================================
// RAW MATERIALS
// ==========================================================

async function loadRawMaterialsScripts() {

    if (
        rawMaterialsScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        rawMaterialsScripts,
        "RAW MATERIALS"
    );


    rawMaterialsScriptsLoaded =
        true;

}


// ==========================================================
// STOCK IN
// ==========================================================

async function loadStockInScripts() {

    if (
        stockInScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        stockInScripts,
        "STOCK IN"
    );


    stockInScriptsLoaded =
        true;

}


// ==========================================================
// SUPPLIERS
// ==========================================================

async function loadSuppliersScripts() {

    if (
        suppliersScriptsLoaded
    ) {

        return;

    }


    await loadScriptGroup(
        suppliersScripts,
        "SUPPLIERS"
    );


    suppliersScriptsLoaded =
        true;

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeAppHTML(
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
// MODULE ERROR
// ==========================================================

function showModuleError(
    container,
    moduleName,
    error
) {

    if (!container) {

        return;

    }


    container.innerHTML += `

        <div class="alert alert-danger m-3">

            <div class="d-flex align-items-start gap-3">

                <i
                    class="
                        fa-solid
                        fa-circle-exclamation
                        fs-4
                    "
                ></i>

                <div>

                    <strong>

                        ${escapeAppHTML(
                            moduleName
                        )}

                        Error

                    </strong>

                    <div class="mt-2">

                        ${escapeAppHTML(
                            error?.message ||
                            error
                        )}

                    </div>

                </div>

            </div>

        </div>

    `;

}


// ==========================================================
// LOAD PAGE
// ==========================================================
//
// IMPORTANT:
// POS IS NOT LOADED HERE.
//
// POS MUST ALWAYS BE OPENED DIRECTLY:
//
// pages/pos.html
//
// This prevents the ERP sidebar and navbar from remaining
// around the POS application.
// ==========================================================

async function loadPage(
    page
) {

    // ======================================================
    // POS PROTECTION
    // ======================================================

    if (
        page ===
        "pages/pos.html"
    ) {

        console.log(
            "POS requested through ERP loader."
        );


        console.log(
            "Redirecting to standalone POS..."
        );


        window.location.href =
            "pages/pos.html";


        return;

    }


    const content =
        document.getElementById(
            "content"
        );


    if (!content) {

        console.error(
            "#content container not found."
        );

        return;

    }


    try {

        console.log(
            "=========================================="
        );


        console.log(
            "PAPPRITO loading page:",
            page
        );


        console.log(
            "=========================================="
        );


        // ==================================================
        // STOP INVENTORY LISTENER
        // ==================================================

        if (
            page !==
            "pages/inventory.html" &&
            typeof stopInventoryListener ===
            "function"
        ) {

            try {

                stopInventoryListener();

            }

            catch (error) {

                console.warn(
                    "Unable to stop inventory listener:",
                    error
                );

            }

        }


        // ==================================================
        // STOP RAW MATERIALS LISTENER
        // ==================================================

        if (
            page !==
            "pages/raw-materials.html" &&
            typeof stopRawMaterialsListener ===
            "function"
        ) {

            try {

                stopRawMaterialsListener();

            }

            catch (error) {

                console.warn(
                    "Unable to stop raw materials listener:",
                    error
                );

            }

        }


        // ==================================================
        // STOP STOCK IN LISTENER
        // ==================================================

        if (
            page !==
            "pages/stock-in.html" &&
            typeof stopStockInListener ===
            "function"
        ) {

            try {

                stopStockInListener();

            }

            catch (error) {

                console.warn(
                    "Unable to stop stock in listener:",
                    error
                );

            }

        }


        // ==================================================
        // LOAD PAGE HTML
        // ==================================================

        const response =
            await fetch(
                page,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load page: " +
                page
            );

        }


        const html =
            await response.text();


        // ==================================================
        // INSERT PAGE
        // ==================================================

        content.innerHTML =
            html;


        // ==================================================
        // SAVE CURRENT PAGE
        // ==================================================

        localStorage.setItem(
            "currentPage",
            page
        );


        // ==================================================
        // PAGE INITIALIZATION
        // ==================================================

        switch (page) {


            // ==================================================
            // DASHBOARD
            // ==================================================

            case "pages/dashboard.html":

                await initializeDashboardModule(
                    content
                );

                break;


            // ==================================================
            // PRODUCTS
            // ==================================================

            case "pages/products.html":

                await initializeProductModule(
                    content
                );

                break;


            // ==================================================
            // CATEGORIES
            // ==================================================

            case "pages/categories.html":

                await initializeCategoryModule(
                    content
                );

                break;


            // ==================================================
            // RECEIVING ORDERS
            // ==================================================

            case "pages/receiving-orders.html":

                await initializeReceivingOrdersModule(
                    content
                );

                break;


            // ==================================================
            // KITCHEN
            // ==================================================

            case "pages/kitchen.html":

                safeInitialize(
                    "initializeKitchen"
                );

                break;


            // ==================================================
            // TABLES
            // ==================================================

            case "pages/tables.html":

                safeInitialize(
                    "initializeTables"
                );

                break;


            // ==================================================
            // INVENTORY
            // ==================================================

            case "pages/inventory.html":

                await initializeInventoryModule(
                    content
                );

                break;


            // ==================================================
            // RAW MATERIALS
            // ==================================================

            case "pages/raw-materials.html":

                await initializeRawMaterialsModule(
                    content
                );

                break;


            // ==================================================
            // STOCK IN
            // ==================================================

            case "pages/stock-in.html":

                await initializeStockInModule(
                    content
                );

                break;


            // ==================================================
            // STOCK OUT
            // ==================================================

            case "pages/stock-out.html":

                safeInitialize(
                    "initializeStockOut"
                );

                break;


            // ==================================================
            // PURCHASE ORDERS
            // ==================================================

            case "pages/purchase-orders.html":

                safeInitialize(
                    "initializePurchaseOrders"
                );

                break;


            // ==================================================
            // SUPPLIERS
            // ==================================================

            case "pages/suppliers.html":

                await initializeSuppliersModule(
                    content
                );

                break;


            // ==================================================
            // CUSTOMERS
            // ==================================================

            case "pages/customers.html":

                safeInitialize(
                    "initializeCustomers"
                );

                break;


            // ==================================================
            // SALES
            // ==================================================

            case "pages/sales.html":

                safeInitialize(
                    "initializeSales"
                );

                break;


            // ==================================================
            // REPORTS
            // ==================================================

            case "pages/reports.html":

                safeInitialize(
                    "initializeReports"
                );

                break;


            // ==================================================
            // EMPLOYEES
            // ==================================================

            case "pages/employees.html":

                safeInitialize(
                    "initializeEmployees"
                );

                break;


            // ==================================================
            // ATTENDANCE
            // ==================================================

            case "pages/attendance.html":

                safeInitialize(
                    "initializeAttendance"
                );

                break;


            // ==================================================
            // PAYROLL
            // ==================================================

            case "pages/payroll.html":

                safeInitialize(
                    "initializePayroll"
                );

                break;


            // ==================================================
            // SETTINGS
            // ==================================================

            case "pages/settings.html":

                safeInitialize(
                    "initializeSettings"
                );

                break;


            // ==================================================
            // COMPANY PROFILE
            // ==================================================

            case "pages/company-profile.html":

                safeInitialize(
                    "initializeCompanyProfile"
                );

                break;


            // ==================================================
            // DEFAULT
            // ==================================================

            default:

                console.log(
                    "No specific initializer:",
                    page
                );

                break;

        }


        console.log(
            "PAPPRITO page loaded:",
            page
        );

    }

    catch (error) {

        console.error(
            "Page Loading Error:",
            error
        );


        content.innerHTML = `

            <div class="container-fluid p-4">

                <div class="alert alert-danger">

                    <h4 class="alert-heading">

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                            "
                        ></i>

                        Page Loading Error

                    </h4>

                    <hr>

                    <p class="mb-2">

                        Unable to load:

                        <strong>

                            ${escapeAppHTML(
                                page
                            )}

                        </strong>

                    </p>

                    <small>

                        ${escapeAppHTML(
                            error.message
                        )}

                    </small>

                </div>

            </div>

        `;

    }

}


// ==========================================================
// SAFE INITIALIZER
// ==========================================================

function safeInitialize(
    functionName
) {

    try {

        if (
            typeof window[
                functionName
            ] === "function"
        ) {

            window[
                functionName
            ]();


            console.log(
                functionName +
                "() initialized."
            );

        }

        else {

            console.warn(
                functionName +
                "() not found."
            );

        }

    }

    catch (error) {

        console.error(
            functionName +
            "() error:",
            error
        );

    }

}


// ==========================================================
// DASHBOARD INITIALIZATION
// ==========================================================

async function initializeDashboardModule(
    content
) {

    try {

        await loadDashboardScripts();


        if (
            typeof initializeDashboard ===
            "function"
        ) {

            await initializeDashboard();

        }

        else {

            console.warn(
                "initializeDashboard() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Dashboard Module Error:",
            error
        );


        showModuleError(
            content,
            "Dashboard",
            error
        );

    }

}


// ==========================================================
// PRODUCT INITIALIZATION
// ==========================================================

async function initializeProductModule(
    content
) {

    try {

        await loadProductScripts();


        if (
            typeof initializeProductPage ===
            "function"
        ) {

            await initializeProductPage();

        }

        else {

            console.warn(
                "initializeProductPage() not found."
            );

        }


        if (
            typeof startProductListener ===
            "function"
        ) {

            startProductListener();

        }

        else {

            console.warn(
                "startProductListener() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Product Module Error:",
            error
        );


        showModuleError(
            content,
            "Product",
            error
        );

    }

}


// ==========================================================
// CATEGORY INITIALIZATION
// ==========================================================

async function initializeCategoryModule(
    content
) {

    try {

        await loadCategoryScripts();


        if (
            typeof initializeCategoryPage ===
            "function"
        ) {

            await initializeCategoryPage();

        }

        else {

            throw new Error(
                "initializeCategoryPage() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Category Module Error:",
            error
        );


        showModuleError(
            content,
            "Category",
            error
        );

    }

}


// ==========================================================
// RECEIVING ORDERS INITIALIZATION
// ==========================================================

async function initializeReceivingOrdersModule(
    content
) {

    try {

        await loadReceivingOrdersScripts();


        if (
            typeof initializeReceivingOrders ===
            "function"
        ) {

            await initializeReceivingOrders();

        }

        else {

            throw new Error(
                "initializeReceivingOrders() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Receiving Orders Module Error:",
            error
        );


        showModuleError(
            content,
            "Receiving Orders",
            error
        );

    }

}


// ==========================================================
// INVENTORY INITIALIZATION
// ==========================================================

async function initializeInventoryModule(
    content
) {

    try {

        await loadInventoryScripts();


        if (
            typeof initializeInventory ===
            "function"
        ) {

            await initializeInventory();

        }

        else {

            throw new Error(
                "initializeInventory() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Inventory Module Error:",
            error
        );


        showModuleError(
            content,
            "Inventory",
            error
        );

    }

}


// ==========================================================
// RAW MATERIALS INITIALIZATION
// ==========================================================

async function initializeRawMaterialsModule(
    content
) {

    try {

        await loadRawMaterialsScripts();


        if (
            typeof initializeRawMaterials ===
            "function"
        ) {

            await initializeRawMaterials();

        }

        else {

            throw new Error(
                "initializeRawMaterials() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Raw Materials Module Error:",
            error
        );


        showModuleError(
            content,
            "Raw Materials",
            error
        );

    }

}


// ==========================================================
// STOCK IN INITIALIZATION
// ==========================================================

async function initializeStockInModule(
    content
) {

    try {

        await loadStockInScripts();


        if (
            typeof initializeStockIn ===
            "function"
        ) {

            await initializeStockIn();

        }

        else {

            throw new Error(
                "initializeStockIn() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Stock In Module Error:",
            error
        );


        showModuleError(
            content,
            "Stock In",
            error
        );

    }

}


// ==========================================================
// SUPPLIER INITIALIZATION
// ==========================================================

async function initializeSuppliersModule(
    content
) {

    try {

        await loadSuppliersScripts();


        if (
            typeof initializeSuppliers ===
            "function"
        ) {

            await initializeSuppliers();

        }

        else {

            throw new Error(
                "initializeSuppliers() not found."
            );

        }

    }

    catch (error) {

        console.error(
            "Supplier Module Error:",
            error
        );


        showModuleError(
            content,
            "Suppliers",
            error
        );

    }

}


// ==========================================================
// NAVIGATION
// ==========================================================

function openDashboard() {

    closeSidebarMobile();


    loadPage(
        "pages/dashboard.html"
    );

}


// ==========================================================
// POS — STANDALONE
// ==========================================================
//
// IMPORTANT:
//
// DO NOT use loadPage().
//
// POS must leave the ERP shell completely.
//
// This removes:
// - Main sidebar
// - Main navbar
// - ERP content wrapper
//
// POS opens as its own document.
// ==========================================================

function openPOS() {

    console.log(
        "Opening standalone PAPPRITO POS..."
    );


    // ======================================================
    // CLOSE MOBILE SIDEBAR FIRST
    // ======================================================

    closeSidebarMobile();


    // ======================================================
    // SAVE POS STATE
    // ======================================================

    localStorage.setItem(
        "currentPage",
        "pages/pos.html"
    );


    // ======================================================
    // OPEN STANDALONE POS
    // ======================================================

    window.location.href =
        "pages/pos.html";

}


// ==========================================================
// RECEIVING ORDERS
// ==========================================================

function openReceivingOrders() {

    closeSidebarMobile();


    loadPage(
        "pages/receiving-orders.html"
    );

}


// ==========================================================
// KITCHEN
// ==========================================================

function openKitchen() {

    closeSidebarMobile();


    loadPage(
        "pages/kitchen.html"
    );

}


// ==========================================================
// TABLES
// ==========================================================

function openTables() {

    closeSidebarMobile();


    loadPage(
        "pages/tables.html"
    );

}


// ==========================================================
// PRODUCTS
// ==========================================================

function openProducts() {

    closeSidebarMobile();


    loadPage(
        "pages/products.html"
    );

}


// ==========================================================
// CATEGORY
// ==========================================================

function openCategory() {

    closeSidebarMobile();


    loadPage(
        "pages/categories.html"
    );

}


// ==========================================================
// INVENTORY
// ==========================================================

function openInventory() {

    closeSidebarMobile();


    loadPage(
        "pages/inventory.html"
    );

}


// ==========================================================
// RAW MATERIALS
// ==========================================================

function openRawMaterials() {

    closeSidebarMobile();


    loadPage(
        "pages/raw-materials.html"
    );

}


// ==========================================================
// STOCK IN
// ==========================================================

function openStockIn() {

    closeSidebarMobile();


    loadPage(
        "pages/stock-in.html"
    );

}


// ==========================================================
// STOCK OUT
// ==========================================================

function openStockOut() {

    closeSidebarMobile();


    loadPage(
        "pages/stock-out.html"
    );

}


// ==========================================================
// PURCHASE ORDERS
// ==========================================================

function openPurchaseOrders() {

    closeSidebarMobile();


    loadPage(
        "pages/purchase-orders.html"
    );

}


// ==========================================================
// SUPPLIERS
// ==========================================================

function openSuppliers() {

    closeSidebarMobile();


    loadPage(
        "pages/suppliers.html"
    );

}


// ==========================================================
// CUSTOMERS
// ==========================================================

function openCustomers() {

    closeSidebarMobile();


    loadPage(
        "pages/customers.html"
    );

}


// ==========================================================
// SALES
// ==========================================================

function openSales() {

    closeSidebarMobile();


    loadPage(
        "pages/sales.html"
    );

}


// ==========================================================
// REPORTS
// ==========================================================

function openReports() {

    closeSidebarMobile();


    loadPage(
        "pages/reports.html"
    );

}


// ==========================================================
// EMPLOYEES
// ==========================================================

function openEmployees() {

    closeSidebarMobile();


    loadPage(
        "pages/employees.html"
    );

}


// ==========================================================
// ATTENDANCE
// ==========================================================

function openAttendance() {

    closeSidebarMobile();


    loadPage(
        "pages/attendance.html"
    );

}


// ==========================================================
// PAYROLL
// ==========================================================

function openPayroll() {

    closeSidebarMobile();


    loadPage(
        "pages/payroll.html"
    );

}


// ==========================================================
// SETTINGS
// ==========================================================

function openSettings() {

    closeSidebarMobile();


    loadPage(
        "pages/settings.html"
    );

}


// ==========================================================
// COMPANY PROFILE
// ==========================================================

function openCompanyProfile() {

    closeSidebarMobile();


    loadPage(
        "pages/company-profile.html"
    );

}


// ==========================================================
// RETURN TO ERP
// ==========================================================
//
// POS can call this function if we decide to add
// an "Exit POS" button later.
// ==========================================================

function returnToERP() {

    localStorage.setItem(
        "currentPage",
        "pages/dashboard.html"
    );


    window.location.href =
        "../index.html";

}


// ==========================================================
// LOGOUT
// ==========================================================

function logoutERP() {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.clear();

    location.reload();

}


// ==========================================================
// MOBILE SIDEBAR
// ==========================================================

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!sidebar) {

        console.warn(
            "Sidebar not found."
        );

        return;

    }


    const isOpen =
        sidebar.classList.contains(
            "show"
        );


    if (isOpen) {

        closeSidebarMobile();

    }

    else {

        sidebar.classList.add(
            "show"
        );


        document.body.classList.add(
            "sidebar-open"
        );


        const button =
            document.getElementById(
                "sidebarToggle"
            );


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "true"
            );

        }

    }

}


// ==========================================================
// CLOSE SIDEBAR
// ==========================================================

function closeSidebarMobile() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );


    const button =
        document.getElementById(
            "sidebarToggle"
        );


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// ==========================================================
// SIDEBAR TOGGLE CLICK
// ==========================================================

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "#sidebarToggle, .sidebar-toggle"
            );


        if (!button) {

            return;

        }


        event.preventDefault();

        event.stopPropagation();


        toggleSidebar();

    },
    true
);


// ==========================================================
// SIDEBAR MENU CLICK
// ==========================================================

document.addEventListener(
    "click",
    function(event) {

        const link =
            event.target.closest(
                "#sidebar a"
            );


        if (!link) {

            return;

        }


        if (
            window.innerWidth <= 992
        ) {

            setTimeout(
                function() {

                    closeSidebarMobile();

                },
                150
            );

        }

    }
);


// ==========================================================
// ESCAPE
// ==========================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeSidebarMobile();

        }

    }
);


// ==========================================================
// RESIZE
// ==========================================================

window.addEventListener(
    "resize",
    function() {

        if (
            window.innerWidth > 992
        ) {

            closeSidebarMobile();

        }

    }
);


// ==========================================================
// INITIALIZE ERP
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "=========================================="
        );


        console.log(
            "PAPPRITO ERP INITIALIZING..."
        );


        console.log(
            "=========================================="
        );


        // ==================================================
        // RESTORE LAST PAGE
        // ==================================================

        const savedPage =
            localStorage.getItem(
                "currentPage"
            );


        // ==================================================
        // POS PROTECTION
        // ==================================================
        //
        // If POS was the last page, DO NOT load it into
        // the ERP shell.
        //
        // Redirect immediately to standalone POS.
        // ==================================================

        if (
            savedPage ===
            "pages/pos.html"
        ) {

            console.log(
                "Last page was POS."
            );


            console.log(
                "Opening standalone POS..."
            );


            window.location.href =
                "pages/pos.html";


            return;

        }


        // ==================================================
        // SIDEBAR
        // ==================================================

        await loadComponent(
            "sidebar",
            "components/sidebar.html"
        );


        // ==================================================
        // NAVBAR
        // ==================================================

        await loadComponent(
            "navbar",
            "components/navbar.html"
        );


        // ==================================================
        // NAVBAR INITIALIZER
        // ==================================================

        if (
            typeof initializeNavbar ===
            "function"
        ) {

            try {

                initializeNavbar();

            }

            catch (error) {

                console.error(
                    "Navbar initialization error:",
                    error
                );

            }

        }


        // ==================================================
        // DEFAULT PAGE
        // ==================================================

        const firstPage =
            savedPage &&
            savedPage !==
            "pages/pos.html"

            ? savedPage

            : "pages/dashboard.html";


        // ==================================================
        // LOAD ERP PAGE
        // ==================================================

        await loadPage(
            firstPage
        );


        console.log(
            "=========================================="
        );


        console.log(
            "PAPPRITO ERP READY"
        );


        console.log(
            "=========================================="

        );

    }
);


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.loadComponent =
    loadComponent;


window.loadScript =
    loadScript;


window.loadScriptGroup =
    loadScriptGroup;


window.loadDashboardScripts =
    loadDashboardScripts;


window.loadProductScripts =
    loadProductScripts;


window.loadCategoryScripts =
    loadCategoryScripts;


window.loadReceivingOrdersScripts =
    loadReceivingOrdersScripts;


window.loadInventoryScripts =
    loadInventoryScripts;


window.loadRawMaterialsScripts =
    loadRawMaterialsScripts;


window.loadStockInScripts =
    loadStockInScripts;


window.loadSuppliersScripts =
    loadSuppliersScripts;


window.loadPage =
    loadPage;


window.safeInitialize =
    safeInitialize;


window.initializeDashboardModule =
    initializeDashboardModule;


window.initializeProductModule =
    initializeProductModule;


window.initializeCategoryModule =
    initializeCategoryModule;


window.initializeReceivingOrdersModule =
    initializeReceivingOrdersModule;


window.initializeInventoryModule =
    initializeInventoryModule;


window.initializeRawMaterialsModule =
    initializeRawMaterialsModule;


window.initializeStockInModule =
    initializeStockInModule;


window.initializeSuppliersModule =
    initializeSuppliersModule;


window.toggleSidebar =
    toggleSidebar;


window.closeSidebarMobile =
    closeSidebarMobile;


window.openDashboard =
    openDashboard;


window.openPOS =
    openPOS;


window.openReceivingOrders =
    openReceivingOrders;


window.openKitchen =
    openKitchen;


window.openTables =
    openTables;


window.openProducts =
    openProducts;


window.openCategory =
    openCategory;


window.openInventory =
    openInventory;


window.openRawMaterials =
    openRawMaterials;


window.openStockIn =
    openStockIn;


window.openStockOut =
    openStockOut;


window.openPurchaseOrders =
    openPurchaseOrders;


window.openSuppliers =
    openSuppliers;


window.openCustomers =
    openCustomers;


window.openSales =
    openSales;


window.openReports =
    openReports;


window.openEmployees =
    openEmployees;


window.openAttendance =
    openAttendance;


window.openPayroll =
    openPayroll;


window.openSettings =
    openSettings;


window.openCompanyProfile =
    openCompanyProfile;


window.returnToERP =
    returnToERP;


window.logoutERP =
    logoutERP;


// ==========================================================
// READY
// ==========================================================

console.log(
    "PAPPRITO ERP app.js V12 loaded."
);

console.log(
    "POS architecture: STANDALONE FULLSCREEN"
);
