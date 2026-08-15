// ==========================================================
// PAPPRITO ERP
// PREMIUM DASHBOARD ENGINE
// File: assets/js/dashboard/dashboard.js
//
// FEATURES
// - Today's Sales
// - Today's Orders
// - Occupied Tables
// - Total Products
// - Sales Overview Chart
// - Sales by Category Chart
// - Top Selling Products
// - Recent Orders
// - Firebase Realtime Database
// - Responsive / Mobile Safe
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL
// ==========================================================

let pappritoSalesChart = null;
let pappritoCategoryChart = null;

let dashboardInitialized = false;


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeDashboard() {

    if (dashboardInitialized) {
        return;
    }

    dashboardInitialized = true;

    console.log(
        "PAPPRITO PREMIUM DASHBOARD INITIALIZING..."
    );


    // ------------------------------------------------------
    // Firebase check
    // ------------------------------------------------------

    if (
        typeof db === "undefined" ||
        !db
    ) {

        console.error(
            "Dashboard: Firebase Database is not available."
        );

        return;

    }


    // ------------------------------------------------------
    // Initialize charts
    // ------------------------------------------------------

    initializeSalesChart();

    initializeCategoryChart();


    // ------------------------------------------------------
    // Firebase listeners
    // ------------------------------------------------------

    loadDashboardProducts();

    loadDashboardOrders();

    loadDashboardTables();


    console.log(
        "PAPPRITO PREMIUM DASHBOARD READY."
    );

}


// ==========================================================
// PRODUCTS
// ==========================================================

function loadDashboardProducts() {

    db.ref("products")
        .on(
            "value",
            function(snapshot) {

                let total = 0;

                if (snapshot.exists()) {

                    snapshot.forEach(
                        function(child) {

                            const product =
                                child.val() || {};

                            if (
                                product.status ===
                                "Inactive"
                            ) {

                                return;

                            }

                            total++;

                        }
                    );

                }


                const element =
                    document.getElementById(
                        "totalProducts"
                    );


                if (element) {

                    element.textContent =
                        formatNumber(total);

                }

            },
            function(error) {

                console.error(
                    "Products dashboard error:",
                    error
                );

            }
        );

}


// ==========================================================
// TABLES
// ==========================================================

function loadDashboardTables() {

    const possiblePaths = [
        "tables",
        "restaurantTables"
    ];


    findFirstFirebasePath(
        possiblePaths,
        function(snapshot) {

            let occupied = 0;


            if (
                snapshot &&
                snapshot.exists()
            ) {

                snapshot.forEach(
                    function(child) {

                        const table =
                            child.val() || {};


                        const status =
                            String(
                                table.status ||
                                ""
                            ).toLowerCase();


                        if (
                            status === "occupied" ||
                            status === "busy" ||
                            status === "serving" ||
                            table.occupied === true ||
                            table.isOccupied === true
                        ) {

                            occupied++;

                        }

                    }
                );

            }


            const element =
                document.getElementById(
                    "occupiedTables"
                );


            if (element) {

                element.textContent =
                    formatNumber(occupied);

            }

        }
    );

}


// ==========================================================
// ORDERS
// ==========================================================

function loadDashboardOrders() {

    db.ref("orders")
        .on(
            "value",
            function(snapshot) {

                const orders = [];

                let todayOrders = 0;

                let todaySales = 0;


                if (snapshot.exists()) {

                    snapshot.forEach(
                        function(child) {

                            const order =
                                child.val() || {};

                            const orderDate =
                                getOrderDate(order);


                            if (
                                isToday(
                                    orderDate
                                )
                            ) {

                                todayOrders++;

                                todaySales +=
                                    getOrderTotal(
                                        order
                                    );

                            }


                            orders.push({

                                id:
                                    child.key,

                                data:
                                    order

                            });

                        }
                    );

                }


                // ------------------------------------------------
                // KPI
                // ------------------------------------------------

                updateElement(
                    "todayOrders",
                    formatNumber(
                        todayOrders
                    )
                );


                updateElement(
                    "todaySales",
                    formatCurrency(
                        todaySales
                    )
                );


                // ------------------------------------------------
                // Charts
                // ------------------------------------------------

                updateSalesOverview(
                    orders
                );


                updateCategorySales(
                    orders
                );


                // ------------------------------------------------
                // Recent Orders
                // ------------------------------------------------

                renderRecentOrders(
                    orders
                );


                // ------------------------------------------------
                // Top Products
                // ------------------------------------------------

                renderTopSellingProducts(
                    orders
                );

            },
            function(error) {

                console.error(
                    "Orders dashboard error:",
                    error
                );

            }
        );

}


// ==========================================================
// FIND FIREBASE PATH
// ==========================================================

function findFirstFirebasePath(
    paths,
    callback
) {

    if (
        !Array.isArray(paths) ||
        paths.length === 0
    ) {

        callback(null);

        return;

    }


    let completed = 0;

    let returned = false;


    paths.forEach(
        function(path) {

            db.ref(path)
                .once("value")
                .then(
                    function(snapshot) {

                        completed++;


                        if (
                            !returned &&
                            snapshot.exists()
                        ) {

                            returned = true;

                            callback(
                                snapshot
                            );

                            return;

                        }


                        if (
                            completed ===
                            paths.length &&
                            !returned
                        ) {

                            returned = true;

                            callback(null);

                        }

                    }
                )
                .catch(
                    function(error) {

                        console.warn(
                            "Firebase path check failed:",
                            path,
                            error
                        );


                        completed++;


                        if (
                            completed ===
                            paths.length &&
                            !returned
                        ) {

                            returned = true;

                            callback(null);

                        }

                    }
                );

        }
    );

}


// ==========================================================
// ORDER DATE
// ==========================================================

function getOrderDate(order) {

    if (!order) {
        return null;
    }


    const possibleDates = [

        order.createdAt,

        order.orderDate,

        order.date,

        order.timestamp,

        order.created,

        order.updatedAt

    ];


    for (
        let i = 0;
        i < possibleDates.length;
        i++
    ) {

        const value =
            possibleDates[i];


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            continue;

        }


        const date =
            convertToDate(value);


        if (date) {

            return date;

        }

    }


    return null;

}


// ==========================================================
// CONVERT DATE
// ==========================================================

function convertToDate(value) {

    if (
        value instanceof Date
    ) {

        return value;

    }


    if (
        typeof value === "number"
    ) {

        const date =
            new Date(value);


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }


    if (
        typeof value === "string"
    ) {

        const numeric =
            Number(value);


        if (
            !isNaN(numeric) &&
            value.trim() !== ""
        ) {

            const date =
                new Date(numeric);


            if (
                !isNaN(
                    date.getTime()
                )
            ) {

                return date;

            }

        }


        const date =
            new Date(value);


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }


    return null;

}


// ==========================================================
// TODAY CHECK
// ==========================================================

function isToday(date) {

    if (!date) {
        return false;
    }


    const now =
        new Date();


    return (
        date.getFullYear() ===
            now.getFullYear()

        &&

        date.getMonth() ===
            now.getMonth()

        &&

        date.getDate() ===
            now.getDate()
    );

}


// ==========================================================
// ORDER TOTAL
// ==========================================================

function getOrderTotal(order) {

    if (!order) {
        return 0;
    }


    const possibleTotals = [

        order.total,

        order.grandTotal,

        order.amount,

        order.netTotal,

        order.totalAmount,

        order.finalTotal,

        order.payable

    ];


    for (
        let i = 0;
        i < possibleTotals.length;
        i++
    ) {

        const value =
            Number(
                possibleTotals[i]
            );


        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }


    // ------------------------------------------------------
    // Calculate from items if no total exists
    // ------------------------------------------------------

    const items =
        getOrderItems(order);


    if (
        items.length > 0
    ) {

        let total = 0;


        items.forEach(
            function(item) {

                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );


                const price =
                    Number(
                        item.price ||
                        item.sellingPrice ||
                        item.unitPrice ||
                        item.amount ||
                        0
                    );


                total +=
                    quantity *
                    price;

            }
        );


        return total;

    }


    return 0;

}


// ==========================================================
// ORDER ITEMS
// ==========================================================

function getOrderItems(order) {

    if (!order) {
        return [];
    }


    const possibleItems = [

        order.items,

        order.cart,

        order.products,

        order.orderItems,

        order.details

    ];


    for (
        let i = 0;
        i < possibleItems.length;
        i++
    ) {

        const value =
            possibleItems[i];


        if (
            Array.isArray(value)
        ) {

            return value;

        }


        if (
            value &&
            typeof value === "object"
        ) {

            return Object.keys(value)
                .map(
                    function(key) {

                        return value[key];

                    }
                );

        }

    }


    return [];

}


// ==========================================================
// SALES OVERVIEW CHART
// ==========================================================

function initializeSalesChart() {

    const canvas =
        document.getElementById(
            "salesChart"
        );


    if (!canvas) {
        return;
    }


    const context =
        canvas.getContext("2d");


    pappritoSalesChart =
        new Chart(
            context,
            {

                type: "line",

                data: {

                    labels: getLast7DaysLabels(),

                    datasets: [

                        {

                            label:
                                "Sales",

                            data:
                                [
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],

                            borderColor:
                                "#C8102E",

                            backgroundColor:
                                "rgba(200,16,46,.10)",

                            borderWidth:
                                3,

                            fill:
                                true,

                            tension:
                                .4,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#FFC107"

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            grid: {

                                color:
                                    "rgba(0,0,0,.05)"

                            },

                            ticks: {

                                callback:
                                    function(value) {

                                        return "₱" +
                                            formatCompactNumber(
                                                value
                                            );

                                    }

                            }

                        },

                        x: {

                            grid: {

                                display:
                                    false

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================================
// UPDATE SALES CHART
// ==========================================================

function updateSalesOverview(
    orders
) {

    if (
        !pappritoSalesChart
    ) {

        return;

    }


    const labels =
        getLast7DaysLabels();


    const values =
        getLast7DaysSales(
            orders
        );


    pappritoSalesChart.data.labels =
        labels;


    pappritoSalesChart.data.datasets[0].data =
        values;


    pappritoSalesChart.update();

}


// ==========================================================
// LAST 7 DAYS SALES
// ==========================================================

function getLast7DaysSales(
    orders
) {

    const result =
        [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(
            date.getDate() - i
        );


        let total = 0;


        orders.forEach(
            function(orderWrapper) {

                const order =
                    orderWrapper.data;


                const orderDate =
                    getOrderDate(order);


                if (!orderDate) {
                    return;
                }


                if (
                    sameDate(
                        orderDate,
                        date
                    )
                ) {

                    total +=
                        getOrderTotal(
                            order
                        );

                }

            }
        );


        result.push(
            total
        );

    }


    return result;

}


// ==========================================================
// CATEGORY CHART
// ==========================================================

function initializeCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas) {
        return;
    }


    const context =
        canvas.getContext("2d");


    pappritoCategoryChart =
        new Chart(
            context,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "No Sales"
                    ],

                    datasets: [

                        {

                            data: [
                                1
                            ],

                            backgroundColor: [
                                "#e5e7eb"
                            ],

                            borderWidth:
                                0

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "68%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                padding:
                                    15

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================================
// UPDATE CATEGORY SALES
// ==========================================================

function updateCategorySales(
    orders
) {

    if (
        !pappritoCategoryChart
    ) {

        return;

    }


    const categoryTotals =
        {};


    orders.forEach(
        function(orderWrapper) {

            const order =
                orderWrapper.data;


            const orderDate =
                getOrderDate(order);


            if (
                !orderDate ||
                !isToday(orderDate)
            ) {

                return;

            }


            const items =
                getOrderItems(order);


            items.forEach(
                function(item) {

                    const category =
                        item.categoryName ||
                        item.category ||
                        item.categoryId ||
                        "Uncategorized";


                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );


                    const price =
                        Number(
                            item.price ||
                            item.sellingPrice ||
                            item.unitPrice ||
                            item.amount ||
                            0
                        );


                    if (
                        !categoryTotals[
                            category
                        ]
                    ) {

                        categoryTotals[
                            category
                        ] = 0;

                    }


                    categoryTotals[
                        category
                    ] +=
                        quantity *
                        price;

                }
            );

        }
    );


    const labels =
        Object.keys(
            categoryTotals
        );


    const values =
        labels.map(
            function(category) {

                return categoryTotals[
                    category
                ];

            }
        );


    if (
        labels.length === 0
    ) {

        pappritoCategoryChart.data.labels =
            ["No Sales"];

        pappritoCategoryChart.data.datasets[0].data =
            [1];

        pappritoCategoryChart.data.datasets[0].backgroundColor =
            ["#e5e7eb"];

    }

    else {

        pappritoCategoryChart.data.labels =
            labels;

        pappritoCategoryChart.data.datasets[0].data =
            values;

        pappritoCategoryChart.data.datasets[0].backgroundColor =
            generateChartColors(
                labels.length
            );

    }


    pappritoCategoryChart.update();

}


// ==========================================================
// TOP SELLING PRODUCTS
// ==========================================================

function renderTopSellingProducts(
    orders
) {

    const panel =
        findDashboardTable(
            "Top Selling Products"
        );


    if (!panel) {
        return;
    }


    const tableBody =
        panel.querySelector(
            "tbody"
        );


    if (!tableBody) {
        return;
    }


    const productTotals =
        {};


    orders.forEach(
        function(orderWrapper) {

            const order =
                orderWrapper.data;


            const orderDate =
                getOrderDate(order);


            if (
                !orderDate ||
                !isToday(orderDate)
            ) {

                return;

            }


            const items =
                getOrderItems(order);


            items.forEach(
                function(item) {

                    const name =
                        item.name ||
                        item.productName ||
                        "Unknown Product";


                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );


                    const price =
                        Number(
                            item.price ||
                            item.sellingPrice ||
                            item.unitPrice ||
                            item.amount ||
                            0
                        );


                    if (
                        !productTotals[name]
                    ) {

                        productTotals[name] = {

                            quantity:
                                0,

                            sales:
                                0

                        };

                    }


                    productTotals[name].quantity +=
                        quantity;


                    productTotals[name].sales +=
                        quantity *
                        price;

                }
            );

        }
    );


    const products =
        Object.keys(
            productTotals
        )
        .map(
            function(name) {

                return {

                    name:
                        name,

                    quantity:
                        productTotals[name].quantity,

                    sales:
                        productTotals[name].sales

                };

            }
        )
        .sort(
            function(a,b) {

                return b.sales - a.sales;

            }
        )
        .slice(
            0,
            5
        );


    if (
        products.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty-table">

                    <div class="empty-icon">

                        <i class="fa-solid fa-box-open"></i>

                    </div>

                    <strong>
                        No Data
                    </strong>

                    <span>
                        Product sales will appear here.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        products.map(
            function(product) {

                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                        </td>

                        <td>
                            ${formatNumber(
                                product.quantity
                            )}
                        </td>

                        <td>

                            <strong>
                                ${formatCurrency(
                                    product.sales
                                )}
                            </strong>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// RECENT ORDERS
// ==========================================================

function renderRecentOrders(
    orders
) {

    const panel =
        findDashboardTable(
            "Recent Orders"
        );


    if (!panel) {
        return;
    }


    const tableBody =
        panel.querySelector(
            "tbody"
        );


    if (!tableBody) {
        return;
    }


    const recent =
        orders
        .sort(
            function(a,b) {

                const dateA =
                    getOrderDate(
                        a.data
                    ) || new Date(0);


                const dateB =
                    getOrderDate(
                        b.data
                    ) || new Date(0);


                return (
                    dateB.getTime() -
                    dateA.getTime()
                );

            }
        )
        .slice(
            0,
            5
        );


    if (
        recent.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty-table">

                    <div class="empty-icon">

                        <i class="fa-solid fa-receipt"></i>

                    </div>

                    <strong>
                        No Recent Orders
                    </strong>

                    <span>
                        New orders will appear here.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        recent.map(
            function(wrapper) {

                const order =
                    wrapper.data;


                const orderNumber =
                    order.orderNumber ||
                    order.orderNo ||
                    order.invoiceNumber ||
                    wrapper.id ||
                    "-";


                const customer =
                    order.customerName ||
                    order.customer ||
                    order.customerName ||
                    "Walk-in Customer";


                const total =
                    getOrderTotal(
                        order
                    );


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    String(
                                        orderNumber
                                    )
                                )}
                            </strong>

                        </td>

                        <td>

                            ${escapeHTML(
                                String(
                                    customer
                                )
                            )}

                        </td>

                        <td>

                            <strong>
                                ${formatCurrency(
                                    total
                                )}
                            </strong>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// ==========================================================
// FIND TABLE BY HEADER
// ==========================================================

function findDashboardTable(
    title
) {

    const panels =
        document.querySelectorAll(
            ".premium-panel"
        );


    for (
        let i = 0;
        i < panels.length;
        i++
    ) {

        const panel =
            panels[i];


        const text =
            panel.innerText || "";


        if (
            text.includes(title)
        ) {

            return panel;

        }

    }


    return null;

}


// ==========================================================
// SAME DATE
// ==========================================================

function sameDate(
    date1,
    date2
) {

    return (

        date1.getFullYear() ===
        date2.getFullYear()

        &&

        date1.getMonth() ===
        date2.getMonth()

        &&

        date1.getDate() ===
        date2.getDate()

    );

}


// ==========================================================
// LAST 7 DAYS LABELS
// ==========================================================

function getLast7DaysLabels() {

    const labels =
        [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() - i
        );


        labels.push(
            date.toLocaleDateString(
                "en-US",
                {
                    weekday:
                        "short"
                }
            )
        );

    }


    return labels;

}


// ==========================================================
// CHART COLORS
// ==========================================================

function generateChartColors(
    count
) {

    const colors = [

        "#C8102E",

        "#FFC107",

        "#E51D3F",

        "#F5B301",

        "#8E001D",

        "#FFCF40",

        "#B00025",

        "#D99A00"

    ];


    const result =
        [];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        result.push(
            colors[
                i %
                colors.length
            ]
        );

    }


    return result;

}


// ==========================================================
// UPDATE ELEMENT
// ==========================================================

function updateElement(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================================
// NUMBER FORMAT
// ==========================================================

function formatNumber(
    value
) {

    return Number(
        value || 0
    )
    .toLocaleString(
        "en-US"
    );

}


// ==========================================================
// CURRENCY FORMAT
// ==========================================================

function formatCurrency(
    value
) {

    return "₱" +
        Number(
            value || 0
        )
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        );

}


// ==========================================================
// COMPACT NUMBER
// ==========================================================

function formatCompactNumber(
    value
) {

    const number =
        Number(
            value || 0
        );


    if (
        number >= 1000000
    ) {

        return (
            number / 1000000
        ).toFixed(1) + "M";

    }


    if (
        number >= 1000
    ) {

        return (
            number / 1000
        ).toFixed(1) + "K";

    }


    return number.toLocaleString(
        "en-US"
    );

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHTML(
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
// DOM READY
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

}

else {

    initializeDashboard();

}


// ==========================================================
// GLOBAL
// ==========================================================

window.initializeDashboard =
    initializeDashboard;
