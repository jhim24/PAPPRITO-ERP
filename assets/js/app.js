// ==========================================================
// PAPPRITO ERP
// APP / NAVIGATION ENGINE V4
// File : assets/js/app.js
//
// MAIN FUNCTIONS:
// - Component Loader
// - Page Loader
// - Dashboard Engine Loader
// - Product Engine Loader
// - Category Engine Loader
// - Mobile Sidebar
// - Page Navigation
//
// IMPORTANT:
// Dashboard, Product and Category modules are loaded
// dynamically before their pages are initialized.
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let dashboardScriptsLoaded = false;

let productScriptsLoaded = false;

let categoryScriptsLoaded = false;


// ==========================================================
// DASHBOARD SCRIPTS
// ==========================================================

const dashboardScripts = [

    "assets/js/dashboard/dashboard.js"

];


// ==========================================================
// PRODUCT SCRIPTS
// ==========================================================

const productScripts = [

    "assets/js/products/product-load.js",

    "assets/js/products/product-search.js",

    "assets/js/products/product-image.js",

    "assets/js/products/product-save.js",

    "assets/js/products/product-edit.js",

    "assets/js/products/product-delete.js"

];


// ==========================================================
// CATEGORY SCRIPTS
// ==========================================================

const categoryScripts = [

    "assets/js/category/category-load.js",

    "assets/js/category/category-dropdown.js",

    "assets/js/category/category-search.js",

    "assets/js/category/category-save.js",

    "assets/js/category/category-edit.js",

    "assets/js/category/category-delete.js",

    "assets/js/category/category-export.js",

    "assets/js/category/category-modal.js"

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
            await fetch(file);


        if (!response.ok) {

            throw new Error(
                "Unable to load: " +
                file
            );

        }


        const html =
            await response.text();


        const element =
            document.getElementById(id);


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
            "Component Error:",
            error
        );

        return false;

    }

}


// ==========================================================
// LOAD JAVASCRIPT FILE
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


            script.onload =
                function() {

                    console.log(
                        "Loaded:",
                        src
                    );


                    resolve();

                };


            script.onerror =
                function() {

                    console.error(
                        "Failed to load:",
                        src
                    );


                    reject(
                        new Error(
                            "Unable to load " +
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
        " ENGINES..."
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
        "ALL " +
        groupName +
        " ENGINES LOADED."
    );

}


// ==========================================================
// LOAD DASHBOARD SCRIPTS
// ==========================================================

async function loadDashboardScripts() {

    if (
        dashboardScriptsLoaded
    ) {

        return;

    }


    try {

        await loadScriptGroup(
            dashboardScripts,
            "DASHBOARD"
        );


        dashboardScriptsLoaded =
            true;

    }

    catch (error) {

        console.error(
            "Dashboard Script Loading Error:",
            error
        );


        throw error;

    }

}


// ==========================================================
// LOAD PRODUCT SCRIPTS
// ==========================================================

async function loadProductScripts() {

    if (
        productScriptsLoaded
    ) {

        return;

    }


    try {

        await loadScriptGroup(
            productScripts,
            "PRODUCT"
        );


        productScriptsLoaded =
            true;

    }

    catch (error) {

        console.error(
            "Product Script Loading Error:",
            error
        );


        throw error;

    }

}


// ==========================================================
// LOAD CATEGORY SCRIPTS
// ==========================================================

async function loadCategoryScripts() {

    if (
        categoryScriptsLoaded
    ) {

        return;

    }


    try {

        await loadScriptGroup(
            categoryScripts,
            "CATEGORY"
        );


        categoryScriptsLoaded =
            true;

    }

    catch (error) {

        console.error(
            "Category Script Loading Error:",
            error
        );


        throw error;

    }

}


// ==========================================================
// LOAD PAGE
// ==========================================================

async function loadPage(
    page
) {

    try {

        console.log(
            "Loading page:",
            page
        );


        const response =
            await fetch(page);


        if (!response.ok) {

            throw new Error(
                "Unable to load page: " +
                page
            );

        }


        const html =
            await response.text();


        const content =
            document.getElementById(
                "content"
            );


        if (!content) {

            throw new Error(
                "#content container not found."
            );

        }


        // ==================================================
        // LOAD HTML
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
        // PAGE MODULES
        // ==================================================

        switch (page) {


            // ==================================================
            // DASHBOARD
            // ==================================================

            case "pages/dashboard.html":

                console.log(
                    "=== PREMIUM DASHBOARD PAGE ==="
                );


                try {

                    // ------------------------------------------
                    // LOAD DASHBOARD ENGINE
                    // ------------------------------------------

                    await loadDashboardScripts();


                    // ------------------------------------------
                    // INITIALIZE DASHBOARD
                    // ------------------------------------------

                    if (
                        typeof initializeDashboard ===
                        "function"
                    ) {

                        initializeDashboard();

                    }

                    else {

                        console.error(
                            "initializeDashboard() not found."
                        );

                    }


                    console.log(
                        "Premium Dashboard initialized successfully."
                    );

                }

                catch (error) {

                    console.error(
                        "Dashboard Page Initialization Error:",
                        error
                    );


                    showModuleError(
                        content,
                        "Dashboard Module",
                        error
                    );

                }

                break;


            // ==================================================
            // PRODUCTS
            // ==================================================

            case "pages/products.html":

                console.log(
                    "=== PRODUCTS PAGE ==="
                );


                try {

                    await loadProductScripts();


                    if (
                        typeof initializeProductPage ===
                        "function"
                    ) {

                        initializeProductPage();

                    }


                    if (
                        typeof startProductListener ===
                        "function"
                    ) {

                        startProductListener();

                    }


                    console.log(
                        "Product Master initialized successfully."
                    );

                }

                catch (error) {

                    console.error(
                        "Product Page Initialization Error:",
                        error
                    );


                    showModuleError(
                        content,
                        "Product Module",
                        error
                    );

                }

                break;


            // ==================================================
            // CATEGORIES
            // ==================================================

            case "pages/categories.html":

                console.log(
                    "=== CATEGORY MASTER PAGE ==="
                );


                try {

                    await loadCategoryScripts();


                    if (
                        typeof loadCategories ===
                        "function"
                    ) {

                        loadCategories();

                    }

                    else {

                        console.error(
                            "loadCategories() not found."
                        );

                    }


                    if (
                        typeof initializeCategoryPage ===
                        "function"
                    ) {

                        initializeCategoryPage();

                    }


                    if (
                        typeof initializeCategorySave ===
                        "function"
                    ) {

                        initializeCategorySave();

                    }


                    if (
                        typeof initializeCategoryPreview ===
                        "function"
                    ) {

                        initializeCategoryPreview();

                    }


                    if (
                        typeof generateCategoryCode ===
                        "function"
                    ) {

                        generateCategoryCode();

                    }


                    if (
                        typeof loadAllCategoryDropdowns ===
                        "function"
                    ) {

                        loadAllCategoryDropdowns();

                    }


                    console.log(
                        "Category Master initialized successfully."
                    );

                }

                catch (error) {

                    console.error(
                        "Category Page Initialization Error:",
                        error
                    );


                    showModuleError(
                        content,
                        "Category Module",
                        error
                    );

                }

                break;


            // ==================================================
            // RECEIVING ORDERS
            // ==================================================

            case "pages/receiving-orders.html":

                if (
                    typeof initializeReceivingOrders ===
                    "function"
                ) {

                    initializeReceivingOrders();

                }

                break;


            // ==================================================
            // KITCHEN
            // ==================================================

            case "pages/kitchen.html":

                if (
                    typeof initializeKitchen ===
                    "function"
                ) {

                    initializeKitchen();

                }

                break;


            // ==================================================
            // TABLES
            // ==================================================

            case "pages/tables.html":

                if (
                    typeof initializeTables ===
                    "function"
                ) {

                    initializeTables();

                }

                break;


            // ==================================================
            // INVENTORY
            // ==================================================

            case "pages/inventory.html":

                if (
                    typeof initializeInventory ===
                    "function"
                ) {

                    initializeInventory();

                }

                break;


            // ==================================================
            // STOCK IN
            // ==================================================

            case "pages/stock-in.html":

                if (
                    typeof initializeStockIn ===
                    "function"
                ) {

                    initializeStockIn();

                }

                break;


            // ==================================================
            // STOCK OUT
            // ==================================================

            case "pages/stock-out.html":

                if (
                    typeof initializeStockOut ===
                    "function"
                ) {

                    initializeStockOut();

                }

                break;


            // ==================================================
            // PURCHASE ORDERS
            // ==================================================

            case "pages/purchase-orders.html":

                if (
                    typeof initializePurchaseOrders ===
                    "function"
                ) {

                    initializePurchaseOrders();

                }

                break;


            // ==================================================
            // SUPPLIERS
            // ==================================================

            case "pages/suppliers.html":

                if (
                    typeof initializeSuppliers ===
                    "function"
                ) {

                    initializeSuppliers();

                }

                break;


            // ==================================================
            // CUSTOMERS
            // ==================================================

            case "pages/customers.html":

                if (
                    typeof initializeCustomers ===
                    "function"
                ) {

                    initializeCustomers();

                }

                break;


            // ==================================================
            // SALES
            // ==================================================

            case "pages/sales.html":

                if (
                    typeof initializeSales ===
                    "function"
                ) {

                    initializeSales();

                }

                break;


            // ==================================================
            // REPORTS
            // ==================================================

            case "pages/reports.html":

                if (
                    typeof initializeReports ===
                    "function"
                ) {

                    initializeReports();

                }

                break;


            // ==================================================
            // EMPLOYEES
            // ==================================================

            case "pages/employees.html":

                if (
                    typeof initializeEmployees ===
                    "function"
                ) {

                    initializeEmployees();

                }

                break;


            // ==================================================
            // ATTENDANCE
            // ==================================================

            case "pages/attendance.html":

                if (
                    typeof initializeAttendance ===
                    "function"
                ) {

                    initializeAttendance();

                }

                break;


            // ==================================================
            // PAYROLL
            // ==================================================

            case "pages/payroll.html":

                if (
                    typeof initializePayroll ===
                    "function"
                ) {

                    initializePayroll();

                }

                break;


            // ==================================================
            // SETTINGS
            // ==================================================

            case "pages/settings.html":

                if (
                    typeof initializeSettings ===
                    "function"
                ) {

                    initializeSettings();

                }

                break;


            // ==================================================
            // COMPANY PROFILE
            // ==================================================

            case "pages/company-profile.html":

                if (
                    typeof initializeCompanyProfile ===
                    "function"
                ) {

                    initializeCompanyProfile();

                }

                break;


            // ==================================================
            // DEFAULT
            // ==================================================

            default:

                console.log(
                    "Page loaded without specific module:",
                    page
                );

                break;

        }


        console.log(
            "Page loaded successfully:",
            page
        );

    }

    catch (error) {

        console.error(
            "Load Page Error:",
            error
        );


        const content =
            document.getElementById(
                "content"
            );


        if (content) {

            content.innerHTML = `

                <div class="container-fluid p-5">

                    <div class="alert alert-danger">

                        <h4>
                            Page Not Found
                        </h4>

                        <p>
                            ${escapeAppHTML(page)}
                        </p>

                        <hr>

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

}


// ==========================================================
// MODULE ERROR DISPLAY
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

            <strong>
                ${escapeAppHTML(
                    moduleName
                )} Error
            </strong>

            <br><br>

            ${escapeAppHTML(
                error.message ||
                error
            )}

        </div>

    `;

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
// NAVIGATION
// ==========================================================

function openDashboard() {

    closeSidebarMobile();

    loadPage(
        "pages/dashboard.html"
    );

}


function openPOS() {

    window.location.href =
        "pages/pos.html";

}


function openReceivingOrders() {

    closeSidebarMobile();

    loadPage(
        "pages/receiving-orders.html"
    );

}


function openKitchen() {

    closeSidebarMobile();

    loadPage(
        "pages/kitchen.html"
    );

}


function openTables() {

    closeSidebarMobile();

    loadPage(
        "pages/tables.html"
    );

}


function openProducts() {

    closeSidebarMobile();

    loadPage(
        "pages/products.html"
    );

}


function openCategory() {

    closeSidebarMobile();

    loadPage(
        "pages/categories.html"
    );

}


function openInventory() {

    closeSidebarMobile();

    loadPage(
        "pages/inventory.html"
    );

}


function openStockIn() {

    closeSidebarMobile();

    loadPage(
        "pages/stock-in.html"
    );

}


function openStockOut() {

    closeSidebarMobile();

    loadPage(
        "pages/stock-out.html"
    );

}


function openPurchaseOrders() {

    closeSidebarMobile();

    loadPage(
        "pages/purchase-orders.html"
    );

}


function openSuppliers() {

    closeSidebarMobile();

    loadPage(
        "pages/suppliers.html"
    );

}


function openCustomers() {

    closeSidebarMobile();

    loadPage(
        "pages/customers.html"
    );

}


function openSales() {

    closeSidebarMobile();

    loadPage(
        "pages/sales.html"
    );

}


function openReports() {

    closeSidebarMobile();

    loadPage(
        "pages/reports.html"
    );

}


function openEmployees() {

    closeSidebarMobile();

    loadPage(
        "pages/employees.html"
    );

}


function openAttendance() {

    closeSidebarMobile();

    loadPage(
        "pages/attendance.html"
    );

}


function openPayroll() {

    closeSidebarMobile();

    loadPage(
        "pages/payroll.html"
    );

}


function openSettings() {

    closeSidebarMobile();

    loadPage(
        "pages/settings.html"
    );

}


function openCompanyProfile() {

    closeSidebarMobile();

    loadPage(
        "pages/company-profile.html"
    );

}


// ==========================================================
// LOGOUT
// ==========================================================

function logoutERP() {

    if (
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {

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
            "Sidebar element not found."
        );

        return;

    }


    const isOpen =
        sidebar.classList.contains(
            "show"
        );


    if (isOpen) {

        sidebar.classList.remove(
            "show"
        );

        document.body.classList.remove(
            "sidebar-open"
        );

    }

    else {

        sidebar.classList.add(
            "show"
        );

        document.body.classList.add(
            "sidebar-open"
        );

    }


    const button =
        document.getElementById(
            "sidebarToggle"
        );


    if (button) {

        button.setAttribute(
            "aria-expanded",
            isOpen
                ? "false"
                : "true"
        );

    }

}


// ==========================================================
// CLOSE MOBILE SIDEBAR
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
// MOBILE HAMBURGER
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
// MOBILE TOUCH
// ==========================================================

document.addEventListener(
    "touchend",
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
    {
        capture: true,
        passive: false
    }
);


// ==========================================================
// CLOSE SIDEBAR AFTER MENU CLICK
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
                100
            );

        }

    }
);


// ==========================================================
// CLOSE WITH ESC
// ==========================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeSidebarMobile();

        }

    }
);


// ==========================================================
// CLOSE ON DESKTOP RESIZE
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
        // LOAD SIDEBAR
        // ==================================================

        await loadComponent(
            "sidebar",
            "components/sidebar.html"
        );


        // ==================================================
        // LOAD NAVBAR
        // ==================================================

        await loadComponent(
            "navbar",
            "components/navbar.html"
        );


        // ==================================================
        // INITIALIZE NAVBAR
        // ==================================================

        if (
            typeof initializeNavbar ===
            "function"
        ) {

            initializeNavbar();

        }


        // ==================================================
        // RESTORE LAST PAGE
        // ==================================================

        const savedPage =
            localStorage.getItem(
                "currentPage"
            );


        if (
            savedPage
        ) {

            await loadPage(
                savedPage
            );

        }

        else {

            await loadPage(
                "pages/dashboard.html"
            );

        }


        console.log(
            "=========================================="
        );


        console.log(
            "PAPPRITO ERP READY."
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

window.loadPage =
    loadPage;

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

window.logoutERP =
    logoutERP;


console.log(
    "PAPPRITO ERP app.js V4 loaded."
);
