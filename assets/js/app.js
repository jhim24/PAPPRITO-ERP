// ==========================================
// PAPPRITO ERP
// APP.JS
// ==========================================

// ==========================================
// LOAD COMPONENT
// ==========================================

async function loadComponent(id, file){

    try{

        const response = await fetch(file);

        if(!response.ok){

            throw new Error("Unable to load " + file);

        }

        document.getElementById(id).innerHTML =
            await response.text();

    }catch(error){

        console.error(error);

    }

}

// ==========================================
// LOAD PAGE
// ==========================================

async function loadPage(page){

    try{

        const response = await fetch(page);

        if(!response.ok){

            throw new Error(page);

        }

        document.getElementById("content").innerHTML =
            await response.text();

    }catch(error){

        console.error(error);

    }

}

// ==========================================
// LIVE CLOCK
// ==========================================

function updateClock(){

    const now = new Date();

    const date = document.getElementById("currentDate");

    const time = document.getElementById("currentTime");

    if(date){

        date.innerHTML =
            now.toLocaleDateString();

    }

    if(time){

        time.innerHTML =
            now.toLocaleTimeString();

    }

}

// ==========================================
// MOBILE SIDEBAR
// ==========================================

function initializeSidebar(){

    const toggle =
        document.getElementById("menuToggle");

    const sidebar =
        document.querySelector(".sidebar");

    if(!toggle || !sidebar) return;

    toggle.onclick = function(){

        sidebar.classList.toggle("show");

    };

}

// ==========================================
// MENU ACTIVE
// ==========================================

function initializeMenu(){

    document.querySelectorAll(".sidebar-menu a")
    .forEach(menu=>{

        menu.onclick = function(e){

            e.preventDefault();

            document
            .querySelectorAll(".sidebar-menu a")
            .forEach(item=>{

                item.classList.remove("active");

            });

            this.classList.add("active");

        };

    });

}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", async()=>{

    // Sidebar

    await loadComponent(

        "sidebar",

        "components/sidebar.html"

    );

    // Navbar

    await loadComponent(

        "navbar",

        "components/navbar.html"

    );

    // Dashboard

    await loadPage(

        "pages/dashboard.html"

    );

    // Initialize

    initializeSidebar();

    initializeMenu();

    updateClock();

    setInterval(updateClock,1000);

});

// ==========================================
// LOAD DASHBOARD
// ==========================================

function openDashboard(){

    loadPage("pages/dashboard.html");

}

// ==========================================
// LOAD CATEGORY
// ==========================================

function openCategory(){

    loadPage("pages/category.html");

}

// ==========================================
// LOAD PRODUCTS
// ==========================================

function openProducts(){

    loadPage("pages/products.html");

}

// ==========================================
// LOAD TABLES
// ==========================================

function openTables(){

    loadPage("pages/tables.html");

}

// ==========================================
// LOAD POS
// ==========================================

function openPOS(){

    loadPage("pages/pos.html");

}

// ==========================================
// LOAD KITCHEN
// ==========================================

function openKitchen(){

    loadPage("pages/kitchen.html");

}

// ==========================================
// LOAD INVENTORY
// ==========================================

function openInventory(){

    loadPage("pages/inventory.html");

}

// ==========================================
// LOAD SALES
// ==========================================

function openSales(){

    loadPage("pages/sales.html");

}

// ==========================================
// LOAD REPORTS
// ==========================================

function openReports(){

    loadPage("pages/reports.html");

}

// ==========================================
// LOAD CUSTOMERS
// ==========================================

function openCustomers(){

    loadPage("pages/customers.html");

}

// ==========================================
// LOAD SUPPLIERS
// ==========================================

function openSuppliers(){

    loadPage("pages/suppliers.html");

}

// ==========================================
// LOAD EMPLOYEES
// ==========================================

function openEmployees(){

    loadPage("pages/employees.html");

}

// ==========================================
// LOAD SETTINGS
// ==========================================

function openSettings(){

    loadPage("pages/settings.html");

}
