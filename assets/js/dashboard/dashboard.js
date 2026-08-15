// ==========================================================
// PAPPRITO ERP
// PREMIUM DASHBOARD ENGINE V3
// File:
// assets/js/dashboard/dashboard.js
//
// IMPORTANT:
// app.js is the ONLY dashboard initializer.
//
// FEATURES
// - Today's Sales
// - Today's Orders
// - Occupied Tables
// - Total Products
// - Sales Overview
// - Sales by Category
// - Top Selling Products
// - Recent Orders
// - Firebase Realtime Database
// - Dynamic Page Loading Safe
// - Duplicate Listener Safe
// - Mobile Safe
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL
// ==========================================================

let pappritoSalesChart = null;
let pappritoCategoryChart = null;

let dashboardListenersInitialized = false;
let dashboardRetryTimer = null;


// ==========================================================
// INITIALIZE DASHBOARD
// ==========================================================

function initializeDashboard() {

    console.log(
        "PAPPRITO DASHBOARD INITIALIZING..."
    );


    // ------------------------------------------------------
    // Firebase check
    // ------------------------------------------------------

    if (
        typeof db === "undefined" ||
        !db
    ) {

        console.warn(
            "Dashboard: Firebase Database is not available."
        );

        scheduleDashboardRetry();

        return;

    }


    // ------------------------------------------------------
    // Dashboard HTML check
    // ------------------------------------------------------

    const dashboardElement =
        document.getElementById(
            "todaySales"
        );


    if (!dashboardElement) {

        console.warn(
            "Dashboard HTML is not ready."
        );

        scheduleDashboardRetry();

        return;

    }


    // ------------------------------------------------------
    // Cancel retry
    // ------------------------------------------------------

    if (dashboardRetryTimer) {

        clearTimeout(
            dashboardRetryTimer
        );

        dashboardRetryTimer = null;

    }


    // ------------------------------------------------------
    // Charts
    // ------------------------------------------------------

    initializeSalesChart();

    initializeCategoryChart();


    // ------------------------------------------------------
    // Firebase listeners
    // ------------------------------------------------------

    if (
        !dashboardListenersInitialized
    ) {

        dashboardListenersInitialized =
            true;


        loadDashboardProducts();

        loadDashboardOrders();

        loadDashboardTables();


        console.log(
            "Dashboard Firebase listeners initialized."
        );

    }


    console.log(
        "PAPPRITO DASHBOARD READY."
    );

}


// ==========================================================
// RETRY
// ==========================================================

function scheduleDashboardRetry() {

    if (dashboardRetryTimer) {

        return;

    }


    dashboardRetryTimer =
        setTimeout(
            function () {

                dashboardRetryTimer =
                    null;

                initializeDashboard();

            },
            500
        );

}


// ==========================================================
// PRODUCTS
// ==========================================================

function loadDashboardProducts() {

    if (
        typeof db === "undefined" ||
        !db
    ) {

        return;

    }


    db.ref("products")
        .on(

            "value",

            function (snapshot) {

                let total = 0;


                if (
                    snapshot.exists()
                ) {

                    snapshot.forEach(
                        function (child) {

                            const product =
                                child.val() || {};


                            const status =
                                String(
                                    product.status ||
                                    "Active"
                                )
                                .toLowerCase()
                                .trim();


                            if (
                                status ===
                                "inactive"
                            ) {

                                return;

                            }


                            total++;

                        }
                    );

                }


                updateElement(
                    "totalProducts",
                    formatNumber(total)
                );


                console.log(
                    "Dashboard Products:",
                    total
                );

            },

            function (error) {

                console.error(
                    "Dashboard products error:",
                    error
                );

            }

        );

}


// ==========================================================
// TABLES
// ==========================================================

function loadDashboardTables() {

    if (
        typeof db === "undefined" ||
        !db
    ) {

        return;

    }


    const paths = [

        "tables",

        "restaurantTables"

    ];


    findFirstFirebasePath(
        paths,
        function (snapshot) {

            let occupied = 0;


            if (
                snapshot &&
                snapshot.exists()
            ) {

                snapshot.forEach(
                    function (child) {

                        const table =
                            child.val() || {};


                        const status =
                            String(
                                table.status ||
                                ""
                            )
                            .toLowerCase()
                            .trim();


                        if (

                            status ===
                            "occupied"

                            ||

                            status ===
                            "busy"

                            ||

                            status ===
                            "serving"

                            ||

                            table.occupied ===
                            true

                            ||

                            table.isOccupied ===
                            true

                        ) {

                            occupied++;

                        }

                    }
                );

            }


            updateElement(
                "occupiedTables",
                formatNumber(occupied)
            );


            console.log(
                "Dashboard Occupied Tables:",
                occupied
            );

        }
    );

}


// ==========================================================
// ORDERS
// ==========================================================

function loadDashboardOrders() {

    if (
        typeof db === "undefined" ||
        !db
    ) {

        return;

    }


    db.ref("orders")
        .on(

            "value",

            function (snapshot) {

                const orders = [];

                let todayOrders = 0;

                let todaySales = 0;


                if (
                    snapshot.exists()
                ) {

                    snapshot.forEach(
                        function (child) {

                            const order =
                                child.val() || {};


                            const orderDate =
                                getOrderDate(
                                    order
                                );


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
                // Tables
                // ------------------------------------------------

                renderTopSellingProducts(
                    orders
                );


                renderRecentOrders(
                    orders
                );


                console.log(
                    "Dashboard Orders:",
                    orders.length
                );

            },

            function (error) {

                console.error(
                    "Dashboard orders error:",
                    error
                );

            }

        );

}


// ==========================================================
// FIND FIRST FIREBASE PATH
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
        function (path) {

            db.ref(path)
                .once("value")

                .then(
                    function (snapshot) {

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

                            callback(
                                null
                            );

                        }

                    }
                )

                .catch(
                    function (error) {

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

                            callback(
                                null
                            );

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
            convertToDate(
                value
            );


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

        const valueTrimmed =
            value.trim();


        if (
            valueTrimmed === ""
        ) {

            return null;

        }


        const numeric =
            Number(
                valueTrimmed
            );


        if (
            !isNaN(numeric)
        ) {

            const numericDate =
                new Date(numeric);


            if (
                !isNaN(
                    numericDate.getTime()
                )
            ) {

                return numericDate;

            }

        }


        const date =
            new Date(
                valueTrimmed
            );


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
// TODAY
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

        const rawValue =
            possibleTotals[i];


        if (
            rawValue === null ||
            rawValue === undefined ||
            rawValue === ""
        ) {

            continue;

        }


        const value =
            Number(
                rawValue
            );


        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }


    // ------------------------------------------------------
    // Calculate from items
    // ------------------------------------------------------

    const items =
        getOrderItems(
            order
        );


    if (
        items.length
    ) {

        let total = 0;


        items.forEach(
            function (item) {

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
            typeof value ===
            "object"
        ) {

            return Object.keys(value)
                .map(
                    function (key) {

                        return value[key];

                    }
                );

        }

    }


    return [];

}


// ==========================================================
// SALES CHART
// ==========================================================

function initializeSalesChart() {

    const canvas =
        document.getElementById(
            "salesChart"
        );


    if (!canvas) {

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    if (
        pappritoSalesChart
    ) {

        try {

            pappritoSalesChart.destroy();

        }
        catch (error) {

            console.warn(
                "Unable to destroy sales chart:",
                error
            );

        }


        pappritoSalesChart =
            null;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    pappritoSalesChart =
        new Chart(
            context,
            {

                type:
                    "line",

                data: {

                    labels:
                        getLast7DaysLabels(),

                    datasets: [

                        {

                            label:
                                "Sales",

                            data: [

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
                                "#FFC72C"

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },

                    plugins: {

                        legend: {

                            display:
                                false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " Sales: " +
                                            formatCurrency(
                                                context.parsed.y
                                            )
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            grid: {

                                color:
                                    "rgba(0,0,0,.06)"

                            },

                            ticks: {

                                callback:
                                    function (
                                        value
                                    ) {

                                        return (
                                            "₱" +
                                            formatCompactNumber(
                                                value
                                            )
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
// UPDATE SALES OVERVIEW
// ==========================================================

function updateSalesOverview(
    orders
) {

    if (
        !pappritoSalesChart
    ) {

        initializeSalesChart();

    }


    if (
        !pappritoSalesChart
    ) {

        return;

    }


    pappritoSalesChart.data.labels =
        getLast7DaysLabels();


    pappritoSalesChart.data.datasets[0].data =
        getLast7DaysSales(
            orders
        );


    pappritoSalesChart.update();

}


// ==========================================================
// LAST 7 DAYS SALES
// ==========================================================

function getLast7DaysSales(
    orders
) {

    const result = [];


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
            function (wrapper) {

                const order =
                    wrapper.data;


                const orderDate =
                    getOrderDate(
                        order
                    );


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


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    if (
        pappritoCategoryChart
    ) {

        try {

            pappritoCategoryChart.destroy();

        }
        catch (error) {

            console.warn(
                "Unable to destroy category chart:",
                error
            );

        }


        pappritoCategoryChart =
            null;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    pappritoCategoryChart =
        new Chart(
            context,
            {

                type:
                    "doughnut",

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

                                "#E5E7EB"

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

        initializeCategoryChart();

    }


    if (
        !pappritoCategoryChart
    ) {

        return;

    }


    const categoryTotals = {};


    orders.forEach(
        function (wrapper) {

            const order =
                wrapper.data;


            const orderDate =
                getOrderDate(
                    order
                );


            if (
                !orderDate ||
                !isToday(orderDate)
            ) {

                return;

            }


            const items =
                getOrderItems(
                    order
                );


            items.forEach(
                function (item) {

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
            function (category) {

                return categoryTotals[
                    category
                ];

            }
        );


    if (
        labels.length === 0
    ) {

        pappritoCategoryChart
            .data
            .labels = [

                "No Sales"

            ];


        pappritoCategoryChart
            .data
            .datasets[0]
            .data = [

                1

            ];


        pappritoCategoryChart
            .data
            .datasets[0]
            .backgroundColor = [

                "#E5E7EB"

            ];

    }
    else {

        pappritoCategoryChart
            .data
            .labels =
            labels;


        pappritoCategoryChart
            .data
            .datasets[0]
            .data =
            values;


        pappritoCategoryChart
            .data
            .datasets[0]
            .backgroundColor =
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
        findDashboardPanel(
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


    const productTotals = {};


    orders.forEach(
        function (wrapper) {

            const order =
                wrapper.data;


            const orderDate =
                getOrderDate(
                    order
                );


            if (
                !orderDate ||
                !isToday(orderDate)
            ) {

                return;

            }


            const items =
                getOrderItems(
                    order
                );


            items.forEach(
                function (item) {

                    const name =
                        item.name ||
                        item.productName ||
                        item.product ||
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


                    productTotals[name]
                        .quantity +=
                        quantity;


                    productTotals[name]
                        .sales +=
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
            function (name) {

                return {

                    name:
                        name,

                    quantity:
                        productTotals[name]
                            .quantity,

                    sales:
                        productTotals[name]
                            .sales

                };

            }
        )
        .sort(
            function (a, b) {

                return (
                    b.sales -
                    a.sales
                );

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
                    class="text-center py-5">

                    <div class="mb-2">

                        <i
                            class="fa-solid fa-box-open fa-2x text-secondary">
                        </i>

                    </div>

                    <strong>
                        No Data
                    </strong>

                    <div class="small text-muted">
                        Product sales will appear here.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        products
        .map(
            function (product) {

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
        findDashboardPanel(
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
        .slice()
        .sort(
            function (a, b) {

                const dateA =
                    getOrderDate(
                        a.data
                    ) ||
                    new Date(0);


                const dateB =
                    getOrderDate(
                        b.data
                    ) ||
                    new Date(0);


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
                    class="text-center py-5">

                    <div class="mb-2">

                        <i
                            class="fa-solid fa-receipt fa-2x text-secondary">
                        </i>

                    </div>

                    <strong>
                        No Recent Orders
                    </strong>

                    <div class="small text-muted">
                        New orders will appear here.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        recent
        .map(
            function (wrapper) {

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
// FIND DASHBOARD PANEL
// ==========================================================

function findDashboardPanel(
    title
) {

    const selectors = [

        ".premium-panel",

        ".dashboard-card",

        ".card"

    ];


    for (
        let s = 0;
        s < selectors.length;
        s++
    ) {

        const panels =
            document.querySelectorAll(
                selectors[s]
            );


        for (
            let i = 0;
            i < panels.length;
            i++
        ) {

            const panel =
                panels[i];


            const text =
                panel.innerText ||
                "";


            if (
                text.includes(title)
            ) {

                return panel;

            }

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

    if (
        !date1 ||
        !date2
    ) {

        return false;

    }


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

    const labels = [];


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

        "#FFC72C",

        "#E51D3F",

        "#F5B301",

        "#8E001D",

        "#FFCF40",

        "#B00025",

        "#D99A00"

    ];


    const result = [];


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
        document.getElementById(
            id
        );


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
// CURRENCY
// ==========================================================

function formatCurrency(
    value
) {

    return (
        "₱" +
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
        )
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
            number /
            1000000
        ).toFixed(1) + "M";

    }


    if (
        number >= 1000
    ) {

        return (
            number /
            1000
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
// GLOBAL API
//
// IMPORTANT:
//
// app.js is the ONLY initializer.
//
// DO NOT add:
// DOMContentLoaded
// MutationObserver
// startDashboardEngine()
// automatic initializeDashboard()
//
// app.js dynamically loads this file and calls:
// initializeDashboard()
// ==========================================================

window.initializeDashboard =
    initializeDashboard;

window.loadDashboardProducts =
    loadDashboardProducts;

window.loadDashboardOrders =
    loadDashboardOrders;

window.loadDashboardTables =
    loadDashboardTables;
