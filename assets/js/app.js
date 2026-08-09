// ==========================================================
// PAPPRITO ERP
// APP CONTROLLER
// File : assets/js/app.js
// Description : Component Loader & Navigation
// ==========================================================

"use strict";


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
// PAPPRITO ERP
// NAVIGATION
// ==========================================================

async function loadPage(page) {

    try {

        const response =
            await fetch(page);

        if (!response.ok) {

            throw new Error(page);

        }

        const html =
            await response.text();

        const content =
            document.getElementById("content");

        if (!content) {

            throw new Error(
                "Content container not found."
            );

        }

        content.innerHTML = html;


        // ==================================================
        // SAVE CURRENT PAGE
        // ==================================================

        localStorage.setItem(
            "currentPage",
            page
        );


        // ==================================================
        // INITIALIZE PAGE MODULES
        // ==================================================

        switch (page) {


            // ==============================================
            // CATEGORIES
            // ==============================================

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


            // ==============================================
            // PRODUCTS
            // ==============================================

            case "pages/products.html":

                console.log(
                    "=== PRODUCTS PAGE ==="
                );

                console.log(
                    "initializeProductPage =",
                    typeof initializeProductPage
                );

                console.log(
                    "initializeProductImage =",
                    typeof initializeProductImage
                );

                console.log(
                    "loadProducts =",
                    typeof loadProducts
                );


                if (
                    typeof initializeProductPage ===
                    "function"
                ) {

                    console.log(
                        "Running initializeProductPage()"
                    );

                    initializeProductPage();

                }


                if (
                    typeof initializeProductImage ===
                    "function"
                ) {

                    console.log(
                        "Running initializeProductImage()"
                    );

                    initializeProductImage();

                }


                if (
                    typeof loadProducts ===
                    "function"
                ) {

                    console.log(
                        "Running loadProducts()"
                    );

                    loadProducts();

                }
                else {

                    console.log(
                        "loadProducts NOT FOUND"
                    );

                }

                break;


            // ==============================================
            // DASHBOARD
            // ==============================================

            case "pages/dashboard.html":

                if (
                    typeof loadDashboard ===
                    "function"
                ) {

                    loadDashboard();

                }

                break;


            // ==============================================
            // DEFAULT
            // ==============================================

            default:

                console.log(
                    "Page loaded:",
                    page
                );

                break;

        }

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
                            ${page}
                        </p>

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
// PURCHASE ORDER
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
// INITIALIZE ERP
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "=== PAPPRITO ERP INITIALIZING ==="
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


        // ==================================================
        // LOAD NAVBAR
        // ==================================================

        await loadComponent(
            "navbar",
            "components/navbar.html"
        );


        // ==================================================
        // RESTORE LAST PAGE
        // ==================================================

        const savedPage =
            localStorage.getItem(
                "currentPage"
            );


        if (savedPage) {

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
            "=== PAPPRITO ERP READY ==="
        );

    }
);
