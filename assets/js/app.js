// ==========================================================
// PAPPRITO ERP
// APP CONTROLLER
// File : assets/js/app.js
// Description : Component Loader, Navigation & Page Control
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL PAGE STATE
// ==========================================================

let currentERPPage = "";


// ==========================================================
// LOAD HTML COMPONENT
// ==========================================================

async function loadComponent(id, file) {

    try {

        const response = await fetch(file);

        if (!response.ok) {

            throw new Error(
                "Unable to load component: " + file
            );

        }

        const html = await response.text();

        const element =
            document.getElementById(id);

        if (!element) {

            console.warn(
                "Component container not found: #" + id
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
// LOAD PAGE
// ==========================================================

async function loadPage(page) {

    try {

        console.log(
            "Loading page:",
            page
        );


        // ==================================================
        // FETCH PAGE
        // ==================================================

        const response =
            await fetch(page);


        if (!response.ok) {

            throw new Error(
                "Unable to load page: " + page
            );

        }


        const html =
            await response.text();


        // ==================================================
        // CONTENT CONTAINER
        // ==================================================

        const content =
            document.getElementById("content");


        if (!content) {

            throw new Error(
                "Content container not found."
            );

        }


        // ==================================================
        // INSERT PAGE
        // ==================================================

        content.innerHTML = html;


        // ==================================================
        // SAVE CURRENT PAGE
        // ==================================================

        currentERPPage = page;

        localStorage.setItem(
            "currentPage",
            page
        );


        // ==================================================
        // INITIALIZE PAGE
        // ==================================================

        await initializePage(
            page
        );


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

                        <h4 class="mb-3">

                            Page Not Found

                        </h4>

                        <p class="mb-0">

                            ${page}

                        </p>

                    </div>

                </div>

            `;

        }

    }

}


// ==========================================================
// PAGE INITIALIZATION CONTROLLER
// ==========================================================

async function initializePage(page) {

    switch (page) {


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
        // PRODUCTS
        // ==================================================

        case "pages/products.html":

            console.log(
                "=== PRODUCTS PAGE ==="
            );


            // ----------------------------------------------
            // ONLY ONE PRODUCT INITIALIZATION
            // ----------------------------------------------

            if (
                typeof initializeProductPage ===
                "function"
            ) {

                console.log(
                    "Initializing Product Page..."
                );

                initializeProductPage();

            }
            else {

                console.error(
                    "initializeProductPage() not found."
                );

            }

            /*
             * IMPORTANT:
             *
             * Do NOT call these here:
             *
             * initializeProductImage()
             * loadProducts()
             *
             * They are already handled by the
             * Product initialization engine.
             */

            break;


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
        // DEFAULT
        // ==================================================

        default:

            console.log(
                "Page loaded without special initialization:",
                page
            );

            break;

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


    localStorage.clear();

    sessionStorage.clear();

    location.reload();

}


// ==========================================================
// INITIALIZE ERP
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

        const sidebarLoaded =
            await loadComponent(
                "sidebar",
                "components/sidebar.html"
            );


        // ==================================================
        // INITIALIZE SIDEBAR
        // ==================================================

        if (
            sidebarLoaded &&
            typeof initializeSidebar ===
            "function"
        ) {

            initializeSidebar();

        }
        else {

            if (!sidebarLoaded) {

                console.error(
                    "Sidebar failed to load."
                );

            }

            if (
                typeof initializeSidebar !==
                "function"
            ) {

                console.warn(
                    "initializeSidebar() not found."
                );

            }

        }


        // ==================================================
        // LOAD NAVBAR
        // ==================================================

        const navbarLoaded =
            await loadComponent(
                "navbar",
                "components/navbar.html"
            );


        if (!navbarLoaded) {

            console.error(
                "Navbar failed to load."
            );

        }


        // ==================================================
        // RESTORE LAST PAGE
        // ==================================================

        const savedPage =
            localStorage.getItem(
                "currentPage"
            );


        if (
            savedPage &&
            savedPage.trim() !== ""
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


        // ==================================================
        // READY
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
