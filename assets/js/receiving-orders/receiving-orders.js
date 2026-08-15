/* ==========================================================
   PAPPRITO ERP
   RECEIVING ORDERS ENGINE
   File:
   assets/js/receiving-orders/receiving-orders.js

   FEATURES:
   - Firebase realtime orders
   - Search
   - Status filter
   - Order type filter
   - Statistics
   - View order
   - Accept order
   - Reject order
   - Print order
   - Pagination
   - Responsive modal
========================================================== */

"use strict";


/* ==========================================================
   CONFIGURATION
========================================================== */

const RECEIVING_ORDERS_PATH = "orders";

const RECEIVING_PAGE_SIZE = 10;


/* ==========================================================
   STATE
========================================================== */

let receivingOrders = [];

let receivingFilteredOrders = [];

let receivingCurrentPage = 1;

let receivingCurrentOrderId = null;

let receivingOrdersListener = null;


/* ==========================================================
   INITIALIZE
========================================================== */

function initializeReceivingOrders() {

    console.log(
        "PAPPRITO Receiving Orders initializing..."
    );


    receivingCurrentPage = 1;

    receivingCurrentOrderId = null;


    bindReceivingOrdersEvents();

    loadReceivingOrders();

}


/* ==========================================================
   BIND EVENTS
========================================================== */

function bindReceivingOrdersEvents() {


    const search =
        document.getElementById(
            "receivingOrderSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            function () {

                receivingCurrentPage = 1;

                applyReceivingOrderFilters();

            }
        );

    }


    const statusFilter =
        document.getElementById(
            "receivingOrderStatusFilter"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                receivingCurrentPage = 1;

                applyReceivingOrderFilters();

            }
        );

    }


    const typeFilter =
        document.getElementById(
            "receivingOrderTypeFilter"
        );


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            function () {

                receivingCurrentPage = 1;

                applyReceivingOrderFilters();

            }
        );

    }


    const refreshButton =
        document.getElementById(
            "btnRefreshReceivingOrders"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                loadReceivingOrders();

            }
        );

    }


    const closeButton =
        document.getElementById(
            "btnCloseReceivingOrderModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeReceivingOrderModal
        );

    }


    const modal =
        document.getElementById(
            "receivingOrderModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeReceivingOrderModal();

                }

            }
        );

    }


    const acceptButton =
        document.getElementById(
            "btnAcceptReceivingOrder"
        );


    if (acceptButton) {

        acceptButton.addEventListener(
            "click",
            function () {

                updateReceivingOrderStatus(
                    "Confirmed"
                );

            }
        );

    }


    const rejectButton =
        document.getElementById(
            "btnRejectReceivingOrder"
        );


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            function () {

                updateReceivingOrderStatus(
                    "Cancelled"
                );

            }
        );

    }


    const printButton =
        document.getElementById(
            "btnPrintReceivingOrder"
        );


    if (printButton) {

        printButton.addEventListener(
            "click",
            printReceivingOrder
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeReceivingOrderModal();

            }

        }
    );

}


/* ==========================================================
   LOAD ORDERS
========================================================== */

function loadReceivingOrders() {

    if (
        typeof firebase === "undefined"
    ) {

        showReceivingAlert(
            "Firebase is not available.",
            "error"
        );

        return;

    }


    if (
        typeof db === "undefined" ||
        !db
    ) {

        showReceivingAlert(
            "Firebase Database is not initialized.",
            "error"
        );

        return;

    }


    const tableBody =
        document.getElementById(
            "receivingOrdersTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="receiving-orders-loading"
                >

                    <div class="receiving-spinner"></div>

                    <div>

                        Loading orders...

                    </div>

                </td>

            </tr>

        `;

    }


    console.log(
        "Loading Firebase orders..."
    );


    try {

        const ordersRef =
            db.ref(
                RECEIVING_ORDERS_PATH
            );


        if (
            receivingOrdersListener
        ) {

            try {

                ordersRef.off(
                    "value",
                    receivingOrdersListener
                );

            }

            catch (error) {

                console.warn(
                    "Unable to remove previous order listener:",
                    error
                );

            }

        }


        receivingOrdersListener =
            function (snapshot) {

                const data =
                    snapshot.val();


                receivingOrders =
                    normalizeReceivingOrders(
                        data
                    );


                console.log(
                    "Receiving Orders:",
                    receivingOrders.length
                );


                updateReceivingStatistics();

                applyReceivingOrderFilters();

            };


        ordersRef.on(
            "value",
            receivingOrdersListener,
            function (error) {

                console.error(
                    "Firebase Orders Error:",
                    error
                );


                showReceivingAlert(
                    "Unable to load orders.",
                    "error"
                );

                renderReceivingOrders();

            }
        );

    }

    catch (error) {

        console.error(
            "Receiving Orders Load Error:",
            error
        );


        showReceivingAlert(
            error.message ||
            "Unable to load orders.",
            "error"
        );

    }

}


/* ==========================================================
   NORMALIZE ORDERS
========================================================== */

function normalizeReceivingOrders(
    data
) {

    const result = [];


    if (!data) {

        return result;

    }


    Object.keys(data).forEach(
        function (key) {

            const raw =
                data[key] || {};


            const order =
                Object.assign(
                    {},
                    raw
                );


            order.id =
                raw.id ||
                raw.orderId ||
                key;


            order.orderNumber =
                raw.orderNumber ||
                raw.orderNo ||
                raw.invoiceNumber ||
                raw.invoiceNo ||
                order.id;


            order.customerName =
                raw.customerName ||
                raw.customer ||
                raw.name ||
                "Walk-in Customer";


            order.customerPhone =
                raw.customerPhone ||
                raw.phone ||
                raw.mobile ||
                "";


            order.orderType =
                raw.orderType ||
                raw.type ||
                "Dine-in";


            order.status =
                normalizeOrderStatus(
                    raw.status ||
                    raw.orderStatus ||
                    "New"
                );


            order.paymentStatus =
                normalizePaymentStatus(
                    raw.paymentStatus ||
                    raw.payment_status ||
                    raw.paymentState ||
                    "Pending"
                );


            order.paymentMethod =
                raw.paymentMethod ||
                raw.paymentMethodName ||
                raw.payment ||
                "-";


            order.createdAt =
                raw.createdAt ||
                raw.created_at ||
                raw.timestamp ||
                raw.date ||
                raw.orderDate ||
                "";


            order.items =
                normalizeOrderItems(
                    raw.items ||
                    raw.orderItems ||
                    raw.cart ||
                    raw.products ||
                    []
                );


            order.subtotal =
                getNumber(
                    raw.subtotal
                );


            order.discount =
                getNumber(
                    raw.discount
                );


            order.deliveryFee =
                getNumber(
                    raw.deliveryFee ||
                    raw.delivery_fee
                );


            order.total =
                getOrderTotal(
                    raw
                );


            order.customerNotes =
                raw.customerNotes ||
                raw.notes ||
                raw.note ||
                "";


            result.push(
                order
            );

        }
    );


    result.sort(
        function (a, b) {

            return (
                getTimestamp(
                    b.createdAt
                ) -
                getTimestamp(
                    a.createdAt
                )
            );

        }
    );


    return result;

}


/* ==========================================================
   NORMALIZE STATUS
========================================================== */

function normalizeOrderStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "confirmed" ||
        value === "confirm"
    ) {

        return "Confirmed";

    }


    if (
        value === "preparing" ||
        value === "processing" ||
        value === "in preparation"
    ) {

        return "Preparing";

    }


    if (
        value === "ready" ||
        value === "ready for pickup"
    ) {

        return "Ready";

    }


    if (
        value === "completed" ||
        value === "complete" ||
        value === "served"
    ) {

        return "Completed";

    }


    if (
        value === "cancelled" ||
        value === "canceled" ||
        value === "rejected" ||
        value === "reject"
    ) {

        return "Cancelled";

    }


    return "New";

}


/* ==========================================================
   NORMALIZE PAYMENT STATUS
========================================================== */

function normalizePaymentStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "paid" ||
        value === "completed" ||
        value === "success" ||
        value === "successful"
    ) {

        return "Paid";

    }


    if (
        value === "failed" ||
        value === "declined"
    ) {

        return "Failed";

    }


    return "Pending";

}


/* ==========================================================
   NORMALIZE ITEMS
========================================================== */

function normalizeOrderItems(
    items
) {

    const result = [];


    if (
        Array.isArray(items)
    ) {

        items.forEach(
            function (item) {

                result.push(
                    normalizeSingleItem(
                        item
                    )
                );

            }
        );

        return result;

    }


    if (
        typeof items === "object" &&
        items !== null
    ) {

        Object.keys(items).forEach(
            function (key) {

                result.push(
                    normalizeSingleItem(
                        items[key]
                    )
                );

            }
        );

    }


    return result;

}


/* ==========================================================
   NORMALIZE SINGLE ITEM
========================================================== */

function normalizeSingleItem(
    item
) {

    item =
        item || {};


    const quantity =
        getNumber(
            item.quantity ||
            item.qty ||
            1
        );


    const price =
        getNumber(
            item.price ||
            item.sellingPrice ||
            item.unitPrice
        );


    const amount =
        getNumber(
            item.amount ||
            item.total
        ) ||
        (
            quantity *
            price
        );


    return {

        name:
            item.name ||
            item.productName ||
            "Product",

        quantity:
            quantity || 1,

        price:
            price,

        amount:
            amount

    };

}


/* ==========================================================
   GET ORDER TOTAL
========================================================== */

function getOrderTotal(
    order
) {

    const total =
        getNumber(
            order.total
        ) ||
        getNumber(
            order.grandTotal
        ) ||
        getNumber(
            order.totalAmount
        ) ||
        getNumber(
            order.amount
        );


    if (total) {

        return total;

    }


    const subtotal =
        getNumber(
            order.subtotal
        );


    const discount =
        getNumber(
            order.discount
        );


    const deliveryFee =
        getNumber(
            order.deliveryFee ||
            order.delivery_fee
        );


    return (
        subtotal -
        discount +
        deliveryFee
    );

}


/* ==========================================================
   GET NUMBER
========================================================== */

function getNumber(
    value
) {

    const number =
        Number(
            String(
                value ?? 0
            )
            .replace(
                /[^0-9.-]/g,
                ""
            )
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


/* ==========================================================
   GET TIMESTAMP
========================================================== */

function getTimestamp(
    value
) {

    if (!value) {

        return 0;

    }


    if (
        typeof value === "number"
    ) {

        return value;

    }


    const timestamp =
        new Date(
            value
        ).getTime();


    if (
        !Number.isNaN(
            timestamp
        )
    ) {

        return timestamp;

    }


    return 0;

}


/* ==========================================================
   FILTER
========================================================== */

function applyReceivingOrderFilters() {

    const searchElement =
        document.getElementById(
            "receivingOrderSearch"
        );


    const statusElement =
        document.getElementById(
            "receivingOrderStatusFilter"
        );


    const typeElement =
        document.getElementById(
            "receivingOrderTypeFilter"
        );


    const search =
        (
            searchElement
                ?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const status =
        statusElement
            ?.value ||
        "all";


    const type =
        typeElement
            ?.value ||
        "all";


    receivingFilteredOrders =
        receivingOrders.filter(
            function (order) {

                const searchText =
                    (
                        String(
                            order.orderNumber
                        ) +
                        " " +
                        String(
                            order.customerName
                        ) +
                        " " +
                        String(
                            order.customerPhone
                        )
                    )
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchText.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||
                    order.status === status;


                const normalizedType =
                    normalizeOrderType(
                        order.orderType
                    );


                const matchesType =
                    type === "all" ||
                    normalizedType === type;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );

            }
        );


    renderReceivingOrders();

}


/* ==========================================================
   NORMALIZE ORDER TYPE
========================================================== */

function normalizeOrderType(
    type
) {

    const value =
        String(
            type || ""
        )
        .trim()
        .toLowerCase();


    if (
        value.includes("take")
    ) {

        return "Takeout";

    }


    if (
        value.includes("deliver")
    ) {

        return "Delivery";

    }


    if (
        value.includes("online")
    ) {

        return "Online";

    }


    return "Dine-in";

}


/* ==========================================================
   RENDER ORDERS
========================================================== */

function renderReceivingOrders() {

    const tableBody =
        document.getElementById(
            "receivingOrdersTableBody"
        );


    if (!tableBody) {

        return;

    }


    const totalOrders =
        receivingFilteredOrders.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalOrders /
                RECEIVING_PAGE_SIZE
            )
        );


    if (
        receivingCurrentPage >
        totalPages
    ) {

        receivingCurrentPage =
            totalPages;

    }


    const start =
        (
            receivingCurrentPage -
            1
        ) *
        RECEIVING_PAGE_SIZE;


    const end =
        start +
        RECEIVING_PAGE_SIZE;


    const pageOrders =
        receivingFilteredOrders.slice(
            start,
            end
        );


    if (
        pageOrders.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="receiving-orders-empty"
                >

                    <div
                        class="receiving-orders-empty-icon"
                    >

                        <i class="fa-solid fa-inbox"></i>

                    </div>

                    <h4>

                        No Orders Found

                    </h4>

                    <p>

                        There are no orders matching
                        your current filters.

                    </p>

                </td>

            </tr>

        `;

    }

    else {

        tableBody.innerHTML =
            pageOrders
                .map(
                    renderReceivingOrderRow
                )
                .join("");

    }


    updateReceivingOrderCount();

    renderReceivingPagination();

}


/* ==========================================================
   RENDER ROW
========================================================== */

function renderReceivingOrderRow(
    order
) {

    const orderType =
        normalizeOrderType(
            order.orderType
        );


    const typeClass =
        orderType
            .toLowerCase()
            .replace(
                "-",
                "-"
            );


    const statusClass =
        order.status
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    const paymentClass =
        order.paymentStatus
            .toLowerCase();


    const itemCount =
        order.items.reduce(
            function (total, item) {

                return (
                    total +
                    getNumber(
                        item.quantity
                    )
                );

            },
            0
        );


    const dateText =
        formatReceivingDate(
            order.createdAt
        );


    return `

        <tr>

            <td>

                <span
                    class="receiving-order-number"
                >

                    ${escapeReceivingHtml(
                        order.orderNumber
                    )}

                </span>

            </td>


            <td>

                <span
                    class="receiving-order-date"
                >

                    ${escapeReceivingHtml(
                        dateText
                    )}

                </span>

            </td>


            <td>

                <div
                    class="receiving-customer"
                >

                    <span
                        class="receiving-customer-name"
                    >

                        ${escapeReceivingHtml(
                            order.customerName
                        )}

                    </span>


                    ${
                        order.customerPhone
                            ? `
                                <span
                                    class="receiving-customer-phone"
                                >
                                    ${escapeReceivingHtml(
                                        order.customerPhone
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

            </td>


            <td>

                <span
                    class="
                        receiving-order-type
                        ${typeClass}
                    "
                >

                    <i
                        class="${getOrderTypeIcon(
                            orderType
                        )}"
                    ></i>

                    ${escapeReceivingHtml(
                        orderType
                    )}

                </span>

            </td>


            <td>

                <span
                    class="receiving-items-count"
                >

                    ${itemCount}

                </span>

            </td>


            <td>

                <span
                    class="receiving-order-total"
                >

                    ${formatCurrency(
                        order.total
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        receiving-payment-status
                        ${paymentClass}
                    "
                >

                    ${escapeReceivingHtml(
                        order.paymentStatus
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        receiving-order-status
                        ${statusClass}
                    "
                >

                    ${escapeReceivingHtml(
                        order.status
                    )}

                </span>

            </td>


            <td>

                <div
                    class="receiving-order-actions"
                >

                    <button
                        type="button"
                        class="
                            receiving-action-btn
                            receiving-action-view
                        "
                        title="View Order"
                        onclick="viewReceivingOrder('${escapeJs(
                            order.id
                        )}')"
                    >

                        <i
                            class="fa-solid fa-eye"
                        ></i>

                    </button>


                    ${
                        order.status === "New"
                            ? `
                                <button
                                    type="button"
                                    class="
                                        receiving-action-btn
                                        receiving-action-accept
                                    "
                                    title="Accept Order"
                                    onclick="acceptReceivingOrder('${escapeJs(
                                        order.id
                                    )}')"
                                >

                                    <i
                                        class="fa-solid fa-check"
                                    ></i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        receiving-action-btn
                                        receiving-action-reject
                                    "
                                    title="Reject Order"
                                    onclick="rejectReceivingOrder('${escapeJs(
                                        order.id
                                    )}')"
                                >

                                    <i
                                        class="fa-solid fa-xmark"
                                    ></i>

                                </button>
                            `
                            : ""
                    }

                </div>

            </td>

        </tr>

    `;

}


/* ==========================================================
   ORDER TYPE ICON
========================================================== */

function getOrderTypeIcon(
    type
) {

    switch (type) {

        case "Takeout":

            return "fa-solid fa-bag-shopping";

        case "Delivery":

            return "fa-solid fa-motorcycle";

        case "Online":

            return "fa-solid fa-globe";

        default:

            return "fa-solid fa-chair";

    }

}


/* ==========================================================
   UPDATE STATISTICS
========================================================== */

function updateReceivingStatistics() {

    const counts = {

        New: 0,

        Confirmed: 0,

        Preparing: 0,

        Ready: 0,

        Completed: 0,

        Cancelled: 0

    };


    receivingOrders.forEach(
        function (order) {

            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    order.status
                )
            ) {

                counts[
                    order.status
                ]++;

            }

        }
    );


    setReceivingText(
        "receivingNewOrders",
        counts.New
    );


    setReceivingText(
        "receivingConfirmedOrders",
        counts.Confirmed
    );


    setReceivingText(
        "receivingPreparingOrders",
        counts.Preparing
    );


    setReceivingText(
        "receivingReadyOrders",
        counts.Ready
    );


    setReceivingText(
        "receivingCompletedOrders",
        counts.Completed
    );


    setReceivingText(
        "receivingCancelledOrders",
        counts.Cancelled
    );

}


/* ==========================================================
   ORDER COUNT
========================================================== */

function updateReceivingOrderCount() {

    const element =
        document.getElementById(
            "receivingOrdersCount"
        );


    if (!element) {

        return;

    }


    const count =
        receivingFilteredOrders.length;


    element.textContent =
        count +
        (
            count === 1
                ? " Order"
                : " Orders"
        );

}


/* ==========================================================
   PAGINATION
========================================================== */

function renderReceivingPagination() {

    const info =
        document.getElementById(
            "receivingOrdersPaginationInfo"
        );


    const buttons =
        document.getElementById(
            "receivingOrdersPaginationButtons"
        );


    if (!info || !buttons) {

        return;

    }


    const total =
        receivingFilteredOrders.length;


    if (!total) {

        info.textContent =
            "Showing 0 to 0 of 0 Orders";

        buttons.innerHTML = "";

        return;

    }


    const totalPages =
        Math.ceil(
            total /
            RECEIVING_PAGE_SIZE
        );


    const start =
        (
            receivingCurrentPage -
            1
        ) *
        RECEIVING_PAGE_SIZE +
        1;


    const end =
        Math.min(
            receivingCurrentPage *
            RECEIVING_PAGE_SIZE,
            total
        );


    info.textContent =
        `Showing ${start} to ${end} of ${total} Orders`;


    let html = "";


    html += `

        <button
            type="button"
            class="receiving-page-button"
            ${
                receivingCurrentPage === 1
                    ? "disabled"
                    : ""
            }
            onclick="changeReceivingOrderPage(${
                receivingCurrentPage - 1
            })"
        >

            <i class="fa-solid fa-chevron-left"></i>

        </button>

    `;


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        if (
            totalPages > 7 &&
            page > 3 &&
            page < totalPages - 2 &&
            Math.abs(
                page -
                receivingCurrentPage
            ) > 1
        ) {

            if (
                page === 4 ||
                page === totalPages - 3
            ) {

                html += `

                    <span
                        style="
                            padding:0 5px;
                            color:#9CA3AF;
                        "
                    >
                        ...
                    </span>

                `;

            }

            continue;

        }


        html += `

            <button
                type="button"
                class="
                    receiving-page-button
                    ${
                        page ===
                        receivingCurrentPage
                            ? "active"
                            : ""
                    }
                "
                onclick="changeReceivingOrderPage(${page})"
            >

                ${page}

            </button>

        `;

    }


    html += `

        <button
            type="button"
            class="receiving-page-button"
            ${
                receivingCurrentPage === totalPages
                    ? "disabled"
                    : ""
            }
            onclick="changeReceivingOrderPage(${
                receivingCurrentPage + 1
            })"
        >

            <i class="fa-solid fa-chevron-right"></i>

        </button>

    `;


    buttons.innerHTML =
        html;

}


/* ==========================================================
   CHANGE PAGE
========================================================== */

function changeReceivingOrderPage(
    page
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                receivingFilteredOrders.length /
                RECEIVING_PAGE_SIZE
            )
        );


    page =
        Number(page);


    if (
        !Number.isFinite(page)
    ) {

        return;

    }


    page =
        Math.max(
            1,
            Math.min(
                page,
                totalPages
            )
        );


    receivingCurrentPage =
        page;


    renderReceivingOrders();

}


/* ==========================================================
   VIEW ORDER
========================================================== */

function viewReceivingOrder(
    orderId
) {

    const order =
        findReceivingOrder(
            orderId
        );


    if (!order) {

        showReceivingAlert(
            "Order not found.",
            "error"
        );

        return;

    }


    receivingCurrentOrderId =
        order.id;


    setReceivingText(
        "receivingOrderModalTitle",
        "Order " +
        order.orderNumber
    );


    setReceivingText(
        "detailOrderNumber",
        order.orderNumber
    );


    setReceivingText(
        "detailOrderDate",
        formatReceivingDate(
            order.createdAt
        )
    );


    setReceivingText(
        "detailCustomer",
        order.customerName
    );


    setReceivingText(
        "detailOrderType",
        normalizeOrderType(
            order.orderType
        )
    );


    setReceivingText(
        "detailPaymentMethod",
        order.paymentMethod
    );


    setReceivingText(
        "detailPaymentStatus",
        order.paymentStatus
    );


    setReceivingText(
        "detailCustomerNotes",
        order.customerNotes ||
        "No notes."
    );


    renderReceivingOrderItems(
        order
    );


    setReceivingText(
        "detailSubtotal",
        formatCurrency(
            order.subtotal
        )
    );


    setReceivingText(
        "detailDiscount",
        formatCurrency(
            order.discount
        )
    );


    setReceivingText(
        "detailDeliveryFee",
        formatCurrency(
            order.deliveryFee
        )
    );


    setReceivingText(
        "detailGrandTotal",
        formatCurrency(
            order.total
        )
    );


    updateReceivingModalButtons(
        order
    );


    openReceivingOrderModal();

}


/* ==========================================================
   RENDER ORDER ITEMS
========================================================== */

function renderReceivingOrderItems(
    order
) {

    const body =
        document.getElementById(
            "detailOrderItems"
        );


    if (!body) {

        return;

    }


    if (
        !order.items ||
        !order.items.length
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        color:#9CA3AF;
                        padding:25px;
                    "
                >

                    No item details available.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        order.items
            .map(
                function (item) {

                    return `

                        <tr>

                            <td>

                                ${escapeReceivingHtml(
                                    item.name
                                )}

                            </td>


                            <td>

                                ${getNumber(
                                    item.quantity
                                )}

                            </td>


                            <td>

                                ${formatCurrency(
                                    item.price
                                )}

                            </td>


                            <td>

                                <strong>

                                    ${formatCurrency(
                                        item.amount
                                    )}

                                </strong>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* ==========================================================
   MODAL BUTTON STATE
========================================================== */

function updateReceivingModalButtons(
    order
) {

    const accept =
        document.getElementById(
            "btnAcceptReceivingOrder"
        );


    const reject =
        document.getElementById(
            "btnRejectReceivingOrder"
        );


    if (!accept || !reject) {

        return;

    }


    const canAccept =
        order.status === "New";


    const canReject =
        order.status !== "Completed" &&
        order.status !== "Cancelled";


    accept.style.display =
        canAccept
            ? "inline-flex"
            : "none";


    reject.style.display =
        canReject
            ? "inline-flex"
            : "none";

}


/* ==========================================================
   OPEN MODAL
========================================================== */

function openReceivingOrderModal() {

    const modal =
        document.getElementById(
            "receivingOrderModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeReceivingOrderModal() {

    const modal =
        document.getElementById(
            "receivingOrderModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* ==========================================================
   ACCEPT
========================================================== */

function acceptReceivingOrder(
    orderId
) {

    receivingCurrentOrderId =
        orderId;


    updateReceivingOrderStatus(
        "Confirmed"
    );

}


/* ==========================================================
   REJECT
========================================================== */

function rejectReceivingOrder(
    orderId
) {

    receivingCurrentOrderId =
        orderId;


    updateReceivingOrderStatus(
        "Cancelled"
    );

}


/* ==========================================================
   UPDATE STATUS
========================================================== */

async function updateReceivingOrderStatus(
    newStatus
) {

    if (
        !receivingCurrentOrderId
    ) {

        showReceivingAlert(
            "No order selected.",
            "error"
        );

        return;

    }


    if (
        typeof db === "undefined" ||
        !db
    ) {

        showReceivingAlert(
            "Firebase Database is not initialized.",
            "error"
        );

        return;

    }


    const order =
        findReceivingOrder(
            receivingCurrentOrderId
        );


    if (!order) {

        showReceivingAlert(
            "Order not found.",
            "error"
        );

        return;

    }


    if (
        newStatus === "Cancelled"
    ) {

        const confirmed =
            window.confirm(
                "Are you sure you want to reject this order?"
            );


        if (!confirmed) {

            return;

        }

    }


    try {

        await db
            .ref(
                RECEIVING_ORDERS_PATH +
                "/" +
                receivingCurrentOrderId
            )
            .update({

                status:
                    newStatus,

                orderStatus:
                    newStatus,

                updatedAt:
                    new Date().toISOString()

            });


        showReceivingAlert(
            "Order " +
            order.orderNumber +
            " updated to " +
            newStatus +
            ".",
            "success"
        );


        closeReceivingOrderModal();


        console.log(
            "Order status updated:",
            receivingCurrentOrderId,
            newStatus
        );

    }

    catch (error) {

        console.error(
            "Update Order Status Error:",
            error
        );


        showReceivingAlert(
            error.message ||
            "Unable to update order.",
            "error"
        );

    }

}


/* ==========================================================
   FIND ORDER
========================================================== */

function findReceivingOrder(
    orderId
) {

    return receivingOrders.find(
        function (order) {

            return (
                String(
                    order.id
                ) ===
                String(
                    orderId
                )
            );

        }
    ) || null;

}


/* ==========================================================
   PRINT ORDER
========================================================== */

function printReceivingOrder() {

    if (
        !receivingCurrentOrderId
    ) {

        return;

    }


    const order =
        findReceivingOrder(
            receivingCurrentOrderId
        );


    if (!order) {

        return;

    }


    const itemsHtml =
        order.items
            .map(
                function (item) {

                    return `

                        <tr>

                            <td>

                                ${escapeReceivingHtml(
                                    item.name
                                )}

                            </td>

                            <td>

                                ${item.quantity}

                            </td>

                            <td>

                                ${formatCurrency(
                                    item.amount
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=700,height=800"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the order."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>

                Order ${escapeReceivingHtml(
                    order.orderNumber
                )}

            </title>


            <style>

                * {
                    box-sizing: border-box;
                }

                body {

                    margin: 0;

                    padding: 25px;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #222;

                }

                .receipt {

                    max-width: 520px;

                    margin: auto;

                }

                h1 {

                    margin: 0;

                    text-align: center;

                    font-size: 22px;

                }

                .subtitle {

                    margin-top: 4px;

                    text-align: center;

                    color: #666;

                    font-size: 12px;

                }

                .line {

                    margin: 15px 0;

                    border-top:
                        1px dashed #999;

                }

                .info {

                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 7px;

                    font-size: 12px;

                }

                .info strong {

                    display: block;

                    margin-top: 2px;

                }

                table {

                    width: 100%;

                    margin-top: 15px;

                    border-collapse:
                        collapse;

                    font-size: 12px;

                }

                th,
                td {

                    padding: 7px 0;

                    border-bottom:
                        1px solid #eee;

                    text-align: left;

                }

                th:last-child,
                td:last-child {

                    text-align: right;

                }

                .totals {

                    margin-top: 15px;

                    font-size: 13px;

                }

                .total-row {

                    display: flex;

                    justify-content:
                        space-between;

                    padding: 4px 0;

                }

                .grand-total {

                    margin-top: 5px;

                    padding-top: 8px;

                    border-top:
                        1px solid #222;

                    font-size: 17px;

                    font-weight: bold;

                }

                .footer {

                    margin-top: 25px;

                    text-align: center;

                    font-size: 11px;

                    color: #777;

                }

                @media print {

                    body {

                        padding: 10px;

                    }

                }

            </style>

        </head>


        <body>

            <div class="receipt">


                <h1>

                    PAPPRITO

                </h1>


                <div class="subtitle">

                    Restaurant ERP

                </div>


                <div class="line"></div>


                <div class="info">

                    <div>

                        Order #

                        <strong>

                            ${escapeReceivingHtml(
                                order.orderNumber
                            )}

                        </strong>

                    </div>


                    <div>

                        Date

                        <strong>

                            ${escapeReceivingHtml(
                                formatReceivingDate(
                                    order.createdAt
                                )
                            )}

                        </strong>

                    </div>


                    <div>

                        Customer

                        <strong>

                            ${escapeReceivingHtml(
                                order.customerName
                            )}

                        </strong>

                    </div>


                    <div>

                        Type

                        <strong>

                            ${escapeReceivingHtml(
                                normalizeOrderType(
                                    order.orderType
                                )
                            )}

                        </strong>

                    </div>

                </div>


                <div class="line"></div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                Item
                            </th>

                            <th>
                                Qty
                            </th>

                            <th>
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${itemsHtml}

                    </tbody>

                </table>


                <div class="totals">


                    <div class="total-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>

                            ${formatCurrency(
                                order.subtotal
                            )}

                        </strong>

                    </div>


                    <div class="total-row">

                        <span>
                            Discount
                        </span>

                        <strong>

                            ${formatCurrency(
                                order.discount
                            )}

                        </strong>

                    </div>


                    <div class="total-row">

                        <span>
                            Delivery Fee
                        </span>

                        <strong>

                            ${formatCurrency(
                                order.deliveryFee
                            )}

                        </strong>

                    </div>


                    <div
                        class="
                            total-row
                            grand-total
                        "
                    >

                        <span>
                            TOTAL
                        </span>

                        <strong>

                            ${formatCurrency(
                                order.total
                            )}

                        </strong>

                    </div>


                </div>


                <div class="footer">

                    Thank you for ordering from PAPPRITO.

                </div>


            </div>


            <script>

                window.onload = function () {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* ==========================================================
   DATE FORMAT
========================================================== */

function formatReceivingDate(
    value
) {

    if (!value) {

        return "-";

    }


    let date;


    if (
        typeof value === "number"
    ) {

        date =
            new Date(
                value
            );

    }

    else {

        date =
            new Date(
                value
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleString(
        "en-PH",
        {

            year: "numeric",

            month: "short",

            day: "2-digit",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


/* ==========================================================
   CURRENCY
========================================================== */

function formatCurrency(
    value
) {

    const amount =
        getNumber(
            value
        );


    return (
        "₱" +
        amount.toLocaleString(
            "en-PH",
            {

                minimumFractionDigits: 2,

                maximumFractionDigits: 2

            }
        )
    );

}


/* ==========================================================
   SET TEXT
========================================================== */

function setReceivingText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ??
            "";

    }

}


/* ==========================================================
   ALERT
========================================================== */

function showReceivingAlert(
    message,
    type
) {

    const alertElement =
        document.getElementById(
            "receivingOrdersAlert"
        );


    const icon =
        document.getElementById(
            "receivingOrdersAlertIcon"
        );


    const messageElement =
        document.getElementById(
            "receivingOrdersAlertMessage"
        );


    if (
        !alertElement ||
        !messageElement
    ) {

        console.log(
            message
        );

        return;

    }


    alertElement.className =
        "receiving-orders-alert " +
        (
            type === "error"
                ? "error"
                : "success"
        );


    if (icon) {

        icon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";

    }


    messageElement.textContent =
        message;


    alertElement.style.display =
        "flex";


    window.clearTimeout(
        showReceivingAlert.timer
    );


    showReceivingAlert.timer =
        window.setTimeout(
            function () {

                alertElement.style.display =
                    "none";

            },
            4000
        );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeReceivingHtml(
    value
) {

    return String(
        value ??
        ""
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


/* ==========================================================
   ESCAPE JAVASCRIPT
========================================================== */

function escapeJs(
    value
) {

    return String(
        value ??
        ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /"/g,
        '\\"'
    )
    .replace(
        /\n/g,
        "\\n"
    )
    .replace(
        /\r/g,
        "\\r"
    );

}


/* ==========================================================
   CLEANUP
========================================================== */

function destroyReceivingOrders() {

    try {

        if (
            typeof db !== "undefined" &&
            db &&
            receivingOrdersListener
        ) {

            db
                .ref(
                    RECEIVING_ORDERS_PATH
                )
                .off(
                    "value",
                    receivingOrdersListener
                );

        }

    }

    catch (error) {

        console.warn(
            "Receiving Orders cleanup error:",
            error
        );

    }


    receivingOrdersListener =
        null;


    receivingOrders =
        [];


    receivingFilteredOrders =
        [];


    receivingCurrentOrderId =
        null;

}


/* ==========================================================
   GLOBAL EXPORT
========================================================== */

window.initializeReceivingOrders =
    initializeReceivingOrders;

window.destroyReceivingOrders =
    destroyReceivingOrders;

window.viewReceivingOrder =
    viewReceivingOrder;

window.acceptReceivingOrder =
    acceptReceivingOrder;

window.rejectReceivingOrder =
    rejectReceivingOrder;

window.changeReceivingOrderPage =
    changeReceivingOrderPage;

window.closeReceivingOrderModal =
    closeReceivingOrderModal;

window.printReceivingOrder =
    printReceivingOrder;


/* ==========================================================
   READY
========================================================== */

console.log(
    "PAPPRITO Receiving Orders Engine loaded."
);
