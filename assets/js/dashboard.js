// ==========================================
// PAPPRITO ERP
// DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

});

function loadDashboard(){

    loadProducts();

    loadOrders();

    loadTables();

}

// ==========================================
// PRODUCTS
// ==========================================

function loadProducts(){

    db.ref("products").on("value", snapshot=>{

        let total = 0;

        snapshot.forEach(child=>{

            total++;

        });

        const card = document.getElementById("totalProducts");

        if(card){

            card.innerHTML = total;

        }

    });

}

// ==========================================
// ORDERS
// ==========================================

function loadOrders(){

    db.ref("orders").on("value", snapshot=>{

        let today = 0;

        let sales = 0;

        const todayDate = new Date().toDateString();

        snapshot.forEach(child=>{

            const order = child.val();

            if(!order.date) return;

            const orderDate = new Date(order.date).toDateString();

            if(orderDate === todayDate){

                today++;

                sales += Number(order.total || 0);

            }

        });

        const orderCard = document.getElementById("todayOrders");

        if(orderCard){

            orderCard.innerHTML = today;

        }

        const salesCard = document.getElementById("todaySales");

        if(salesCard){

            salesCard.innerHTML =
                "₱" + sales.toLocaleString();

        }

    });

}

// ==========================================
// TABLES
// ==========================================

function loadTables(){

    db.ref("restaurantTables").on("value", snapshot=>{

        let occupied = 0;

        snapshot.forEach(child=>{

            const table = child.val();

            if(table.status === "Occupied"){

                occupied++;

            }

        });

        const tableCard =
            document.getElementById("occupiedTables");

        if(tableCard){

            tableCard.innerHTML = occupied;

        }

    });

}
