// ==========================================
// PAPPRITO ERP
// NAVIGATION
// ==========================================

function loadPage(page){

    fetch(page)

    .then(response=>{

        if(!response.ok){

            throw new Error(page);

        }

        return response.text();

    })

    .then(html=>{

        document.getElementById("content").innerHTML = html;

        // Save current page
        localStorage.setItem("currentPage", page);

    })

    .catch(error=>{

        console.error(error);

        document.getElementById("content").innerHTML = `

        <div class="container-fluid p-5">

            <div class="alert alert-danger">

                <h4>Page Not Found</h4>

                <p>${page}</p>

            </div>

        </div>

        `;

    });

}

// ==========================================
// DASHBOARD
// ==========================================

function openDashboard(){

    loadPage("pages/dashboard.html");

}

// ==========================================
// POS
// ==========================================

function openPOS(){

    loadPage("pages/pos.html");

}

// ==========================================
// RECEIVING ORDERS
// ==========================================

function openReceivingOrders(){

    loadPage("pages/receiving-orders.html");

}

// ==========================================
// KITCHEN
// ==========================================

function openKitchen(){

    loadPage("pages/kitchen.html");

}

// ==========================================
// TABLES
// ==========================================

function openTables(){

    loadPage("pages/tables.html");

}

// ==========================================
// PRODUCTS
// ==========================================

function openProducts(){

    loadPage("pages/products.html");

}

// ==========================================
// CATEGORIES
// ==========================================

function openCategory(){

    loadPage("pages/categories.html");

}

// ==========================================
// INVENTORY
// ==========================================

function openInventory(){

    loadPage("pages/inventory.html");

}

// ==========================================
// STOCK IN
// ==========================================

function openStockIn(){

    loadPage("pages/stock-in.html");

}

// ==========================================
// STOCK OUT
// ==========================================

function openStockOut(){

    loadPage("pages/stock-out.html");

}

// ==========================================
// PURCHASE ORDER
// ==========================================

function openPurchaseOrders(){

    loadPage("pages/purchase-orders.html");

}

// ==========================================
// SUPPLIERS
// ==========================================

function openSuppliers(){

    loadPage("pages/suppliers.html");

}

// ==========================================
// CUSTOMERS
// ==========================================

function openCustomers(){

    loadPage("pages/customers.html");

}

// ==========================================
// SALES
// ==========================================

function openSales(){

    loadPage("pages/sales.html");

}

// ==========================================
// REPORTS
// ==========================================

function openReports(){

    loadPage("pages/reports.html");

}

// ==========================================
// EMPLOYEES
// ==========================================

function openEmployees(){

    loadPage("pages/employees.html");

}

// ==========================================
// ATTENDANCE
// ==========================================

function openAttendance(){

    loadPage("pages/attendance.html");

}

// ==========================================
// PAYROLL
// ==========================================

function openPayroll(){

    loadPage("pages/payroll.html");

}

// ==========================================
// SETTINGS
// ==========================================

function openSettings(){

    loadPage("pages/settings.html");

}

// ==========================================
// COMPANY PROFILE
// ==========================================

function openCompanyProfile(){

    loadPage("pages/company-profile.html");

}

// ==========================================
// LOGOUT
// ==========================================

function logoutERP(){

    if(confirm("Are you sure you want to logout?")){

        localStorage.clear();

        location.reload();

    }

}

// ==========================================
// RESTORE LAST PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", async()=>{

    // Load Sidebar

    await loadComponent(

        "sidebar",

        "components/sidebar.html"

    );

    // Load Navbar

    await loadComponent(

        "navbar",

        "components/navbar.html"

    );

    // Restore last page

    const page =

        localStorage.getItem("currentPage");

    if(page){

        loadPage(page);

    }

    else{

        loadPage("pages/dashboard.html");

    }

});
