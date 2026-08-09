// ==========================================================
// PAPPRITO ERP
// APP / NAVIGATION ENGINE V2
// File : assets/js/app.js
// Description : Main ERP Navigation + Component Loader
// Mobile Hamburger Fixed
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

async function loadComponent(id, file) {

    try {

        const response =
            await fetch(file);

        if (!response.ok) {

            throw new Error(
                "Unable to load: " + file
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

        element.innerHTML = html;

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

function loadScript(src) {

    return new Promise(
        function(resolve, reject) {

            const existing =
                document.querySelector(
                    `script[data-papprito-script="${src}"]`
                );

            if (existing) {

                resolve();

                return;

            }

            const script =
                document.createElement("script");

            script.src = src;

            script.dataset.pappritoScript = src;

            script.onload = function() {

                console.log(
                    "Loaded:",
                    src
                );

                resolve();

            };

            script.onerror = function() {

                console.error(
                    "Failed to load:",
                    src
                );

                reject(
                    new Error(
                        "Unable to load " + src
                    )
                );

            };

            document.body.appendChild(script);

        }
    );

}


// ==========================================================
// LOAD ALL PRODUCT JAVASCRIPT
// ==========================================================

async function loadProductScripts() {

    if (productScriptsLoaded) {

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

        for (
            const script of productScripts
        ) {

            await loadScript(script);

        }

        productScriptsLoaded = true;

        console.log(
            "ALL PRODUCT ENGINES LOADED."
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

async function loadPage(page) {

    try {

        console.log(
            "Loading page:",
            page
        );

        const response =
            await fetch(page);

        if (!response.ok) {

            throw new Error(
                "Unable to load page: " + page
            );

        }

        const html =
            await response.text();

        const content =
            document.getElementById("content");

        if (!content) {

            throw new Error(
                "#content container not found."
            );

        }

        content.innerHTML = html;

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

                    await loadProductScripts();


                    if (
                        typeof initializeProductPage ===
                        "function"
                    ) {

                        initializeProductPage();

                    }

                    else {

                        console.error(
                            "initializeProductPage() not found."
                        );

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

                            <br><br>

                            ${escapeAppHTML(
                                productError.message
                            )}

                        </div>

                    `;

                }

                break;


            // ==================================================
            // CATEGORIES
            // ==================================================

            case "pages/categories.html":

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
            document.getElementById("content");

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
// NAVIGATION FUNCTIONS
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
        document.getElementById("sidebar");

    if (!sidebar) {

        console.warn(
            "Sidebar element not found."
        );

        return;

    }


    const isOpen =
        sidebar.classList.contains("show");


    if (isOpen) {

        sidebar.classList.remove("show");

        document.body.classList.remove(
            "sidebar-open"
        );

    }

    else {

        sidebar.classList.add("show");

        document.body.classList.add(
            "sidebar-open"
        );

    }


    console.log(
        "Sidebar:",
        isOpen
            ? "CLOSED"
            : "OPEN"
    );

}


// ==========================================================
// CLOSE MOBILE SIDEBAR
// ==========================================================

function closeSidebarMobile() {

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "show"
        );

    }

    document.body.classList.remove(
        "sidebar-open"
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeAppHTML(value) {

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
// UNIVERSAL MOBILE HAMBURGER HANDLER
// ==========================================================
//
// Supports:
//
// #sidebarToggle
// .sidebar-toggle
// [data-sidebar-toggle]
// .navbar-toggler
// buttons containing fa-bars
//
// This uses EVENT DELEGATION so it still works
// even when navbar.html is loaded dynamically.
// ==========================================================

document.addEventListener(
    "click",
    function(event) {

        const target =
            event.target.closest(
                "#sidebarToggle, " +
                ".sidebar-toggle, " +
                "[data-sidebar-toggle], " +
                ".navbar-toggler"
            );


        // ==================================================
        // HAMBURGER FOUND
        // ==================================================

        if (target) {

            event.preventDefault();

            event.stopPropagation();

            toggleSidebar();

            return;

        }


        // ==================================================
        // ALSO DETECT BUTTON WITH FA-BARS
        // ==================================================

        const bars =
            event.target.closest(
                "button"
            );


        if (
            bars &&
            bars.querySelector(
                ".fa-bars"
            )
        ) {

            event.preventDefault();

            event.stopPropagation();

            toggleSidebar();

            return;

        }


        // ==================================================
        // CLICK SIDEBAR LINK ON MOBILE
        // ==================================================

        const navLink =
            event.target.closest(
                "#sidebar a"
            );


        if (
            navLink &&
            window.innerWidth <= 992
        ) {

            setTimeout(
                function() {

                    closeSidebarMobile();

                },
                100
            );

        }


        // ==================================================
        // CLICK OVERLAY
        // ==================================================

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (
            sidebar &&
            sidebar.classList.contains("show") &&
            window.innerWidth <= 992
        ) {

            if (
                !event.target.closest(
                    "#sidebar"
                )
            ) {

                closeSidebarMobile();

            }

        }

    },
    true
);


// ==========================================================
// ESC KEY CLOSE
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
// WINDOW RESIZE
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
// RESTORE LAST PAGE
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
        // IMPORTANT
        //
        // DO NOT CALL initializeSidebar()
        //
        // Hamburger is handled by delegated
        // event listener above.
        // ==================================================

        console.log(
            "Sidebar component loaded."
        );


        // ==================================================
        // NAVBAR INITIALIZATION
        // ==================================================

        if (
            typeof initializeNavbar ===
            "function"
        ) {

            initializeNavbar();

        }


        // ==================================================
        // RESTORE CURRENT PAGE
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
