// ==========================================================
// PAPPRITO ERP
// APP / NAVIGATION ENGINE
// File : assets/js/app.js
// Description : Main ERP Navigation + Component Loader
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let productScriptsLoaded = false;


// ==========================================================
// PRODUCT SCRIPT LIST
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

            return;

        }


        element.innerHTML =
            html;


    }

    catch (error) {

        console.error(
            "Component Error:",
            error
        );

    }

}


// ==========================================================
// LOAD JAVASCRIPT FILE
// ==========================================================

function loadScript(
    src
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            // ----------------------------------------------
            // CHECK IF ALREADY LOADED
            // ----------------------------------------------

            const existing =
                document.querySelector(
                    `script[data-papprito-script="${src}"]`
                );


            if (existing) {

                resolve();

                return;

            }


            // ----------------------------------------------
            // CREATE SCRIPT
            // ----------------------------------------------

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                src;


            script.dataset.pappritoScript =
                src;


            script.onload =
                function () {

                    console.log(
                        "Loaded:",
                        src
                    );


                    resolve();

                };


            script.onerror =
                function () {

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
// LOAD ALL PRODUCT JAVASCRIPT
// ==========================================================

async function loadProductScripts() {

    // ------------------------------------------------------
    // ALREADY LOADED
    // ------------------------------------------------------

    if (
        productScriptsLoaded
    ) {

        return;

    }


    console.log(
        "=========================================="
    );

    console.log(
        "LOADING PAPPRITO PRODUCT ENGINES..."
    );

    console.log(
        "=========================================="
    );


    try {

        // --------------------------------------------------
        // LOAD ONE BY ONE
        // --------------------------------------------------

        for (
            const script of productScripts
        ) {

            await loadScript(
                script
            );

        }


        productScriptsLoaded =
            true;


        console.log(
            "=========================================="
        );

        console.log(
            "ALL PRODUCT ENGINES LOADED."
        );

        console.log(
            "=========================================="
        );

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


        // ==================================================
        // GET PAGE
        // ==================================================

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


        // ==================================================
        // CONTENT CONTAINER
        // ==================================================

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
                    "=== DASHBOARD PAGE ==="
                );


                if (
                    typeof loadDashboard ===
                    "function"
                ) {

                    loadDashboard();

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

                    // ------------------------------------------
                    // LOAD PRODUCT JS FIRST
                    // ------------------------------------------

                    await loadProductScripts();


                    // ------------------------------------------
                    // INITIALIZE PRODUCT PAGE
                    // ------------------------------------------

                    if (
                        typeof initializeProductPage ===
                        "function"
                    ) {

                        console.log(
                            "Running initializeProductPage()"
                        );


                        initializeProductPage();

                    }

                    else {

                        console.error(
                            "initializeProductPage() not found."
                        );

                    }


                    // ------------------------------------------
                    // PRODUCT IMAGE
                    // ------------------------------------------

                    if (
                        typeof initializeProductImage ===
                        "function"
                    ) {

                        console.log(
                            "Product Image Engine ready."
                        );

                    }


                    // ------------------------------------------
                    // PRODUCT LISTENER
                    // ------------------------------------------

                    if (
                        typeof startProductListener ===
                        "function"
                    ) {

                        console.log(
                            "Starting Product Firebase Listener..."
                        );


                        startProductListener();

                    }


                    console.log(
                        "Product Master initialized successfully."
                    );

                }

                catch (productError) {

                    console.error(
                        "Product Page Initialization Error:",
                        productError
                    );


                    content.innerHTML += `

                        <div class="alert alert-danger m-3">

                            <strong>
                                Product Module Error
                            </strong>

                            <br>

                            Unable to initialize
                            Product Master.

                            <br><br>

                            <small>
                                ${escapeAppHTML(
                                    productError.message
                                )}
                            </small>

                        </div>

                    `;

                }


                break;


            // ==================================================
            // CATEGORIES
            // ==================================================

            case "pages/categories.html":

                console.log(
                    "=== CATEGORIES PAGE ==="
                );


                if (
                    typeof loadCategories ===
                    "function"
                ) {

                    loadCategories();

                }


                if (
                    typeof initializeCategoryPage ===
                    "function"
                ) {

                    initializeCategoryPage();

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
// DASHBOARD
// ==========================================================

function openDashboard() {

    loadPage(
        "pages/dashboard.html"
    );

}


// ==========================================================
// POS
// ==========================================================

function openPOS() {

    window.location.href =
        "pages/pos.html";

}


// ==========================================================
// RECEIVING ORDERS
// ==========================================================

function openReceivingOrders() {

    loadPage(
        "pages/receiving-orders.html"
    );

}


// ==========================================================
// KITCHEN
// ==========================================================

function openKitchen() {

    loadPage(
        "pages/kitchen.html"
    );

}


// ==========================================================
// TABLES
// ==========================================================

function openTables() {

    loadPage(
        "pages/tables.html"
    );

}


// ==========================================================
// PRODUCTS
// ==========================================================

function openProducts() {

    loadPage(
        "pages/products.html"
    );

}


// ==========================================================
// CATEGORIES
// ==========================================================

function openCategory() {

    loadPage(
        "pages/categories.html"
    );

}


// ==========================================================
// INVENTORY
// ==========================================================

function openInventory() {

    loadPage(
        "pages/inventory.html"
    );

}


// ==========================================================
// STOCK IN
// ==========================================================

function openStockIn() {

    loadPage(
        "pages/stock-in.html"
    );

}


// ==========================================================
// STOCK OUT
// ==========================================================

function openStockOut() {

    loadPage(
        "pages/stock-out.html"
    );

}


// ==========================================================
// PURCHASE ORDERS
// ==========================================================

function openPurchaseOrders() {

    loadPage(
        "pages/purchase-orders.html"
    );

}


// ==========================================================
// SUPPLIERS
// ==========================================================

function openSuppliers() {

    loadPage(
        "pages/suppliers.html"
    );

}


// ==========================================================
// CUSTOMERS
// ==========================================================

function openCustomers() {

    loadPage(
        "pages/customers.html"
    );

}


// ==========================================================
// SALES
// ==========================================================

function openSales() {

    loadPage(
        "pages/sales.html"
    );

}


// ==========================================================
// REPORTS
// ==========================================================

function openReports() {

    loadPage(
        "pages/reports.html"
    );

}


// ==========================================================
// EMPLOYEES
// ==========================================================

function openEmployees() {

    loadPage(
        "pages/employees.html"
    );

}


// ==========================================================
// ATTENDANCE
// ==========================================================

function openAttendance() {

    loadPage(
        "pages/attendance.html"
    );

}


// ==========================================================
// PAYROLL
// ==========================================================

function openPayroll() {

    loadPage(
        "pages/payroll.html"
    );

}


// ==========================================================
// SETTINGS
// ==========================================================

function openSettings() {

    loadPage(
        "pages/settings.html"
    );

}


// ==========================================================
// COMPANY PROFILE
// ==========================================================

function openCompanyProfile() {

    loadPage(
        "pages/company-profile.html"
    );

}


// ==========================================================
// LOGOUT
// ==========================================================

function logoutERP() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;

    }


    // ------------------------------------------------------
    // CLEAR ERP SESSION
    // ------------------------------------------------------

    localStorage.clear();


    // ------------------------------------------------------
    // RELOAD
    // ------------------------------------------------------

    location.reload();

}


// ==========================================================
// SIDEBAR MOBILE TOGGLE
// ==========================================================

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!sidebar) {

        return;

    }


    sidebar.classList.toggle(
        "show"
    );


    document.body.classList.toggle(
        "sidebar-open"
    );

}


// ==========================================================
// CLOSE SIDEBAR ON MOBILE
// ==========================================================

function closeSidebarMobile() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!sidebar) {

        return;

    }


    sidebar.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "sidebar-open"
    );

}


// ==========================================================
// ESCAPE HTML
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
// GLOBAL SIDEBAR CLICK HANDLER
// ==========================================================

document.addEventListener(
    "click",
    function (event) {

        // --------------------------------------------------
        // HAMBURGER
        // --------------------------------------------------

        const hamburger =
            event.target.closest(
                "#sidebarToggle, .sidebar-toggle, [data-sidebar-toggle]"
            );


        if (hamburger) {

            event.preventDefault();

            toggleSidebar();

            return;

        }


        // --------------------------------------------------
        // MOBILE SIDEBAR NAVIGATION
        // --------------------------------------------------

        const navLink =
            event.target.closest(
                "#sidebar a"
            );


        if (
            navLink &&
            window.innerWidth <= 992
        ) {

            setTimeout(
                function () {

                    closeSidebarMobile();

                },
                100
            );

        }

    }
);


// ==========================================================
// RESTORE LAST PAGE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

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
        // INITIALIZE SIDEBAR
        // ==================================================

        if (
            typeof initializeSidebar ===
            "function"
        ) {

            initializeSidebar();

        }

        else {

            console.warn(
                "initializeSidebar() not found."
            );

        }


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
        // RESTORE PAGE
        // ==================================================

        const savedPage =
            localStorage.getItem(
                "currentPage"
            );


        const page =
            savedPage &&
            savedPage.trim() !== ""

                ? savedPage

                : "pages/dashboard.html";


        console.log(
            "Opening page:",
            page
        );


        await loadPage(
            page
        );


        // ==================================================
        // ERP READY
        // ==================================================

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
