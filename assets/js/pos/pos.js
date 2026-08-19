// ==========================================================
// PAPPRITO ERP
// POS ENGINE V1
// File: assets/js/pos/pos.js
//
// FUNCTIONS:
// - Load Products
// - Load Categories
// - Search Products
// - Filter Categories
// - Add To Cart
// - Increase / Decrease Quantity
// - Remove Cart Item
// - Discount
// - Payment
// - Change Calculation
// - Save Sale To Firebase
// - Receipt
// - Mobile Responsive POS
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let posProducts = {};

let posCategories = {};

let posCart = [];

let posPaymentMethod = "Cash";

let posDiscount = 0;

let posInitialized = false;


// ==========================================================
// FIREBASE CHECK
// ==========================================================

function posFirebaseReady() {

    return (
        typeof db !== "undefined" &&
        db &&
        typeof db.ref === "function"
    );

}


// ==========================================================
// ELEMENT
// ==========================================================

function posElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapePOSHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// MONEY
// ==========================================================

function posMoney(value) {

    const amount =
        Number(value) || 0;

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


// ==========================================================
// NUMBER
// ==========================================================

function posNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==========================================================
// GENERATE SALE NUMBER
// ==========================================================

function generatePOSOrderNumber() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    const time =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        ) +
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        ) +
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );

    return (
        "POS-" +
        year +
        month +
        day +
        "-" +
        time
    );

}


// ==========================================================
// GET PRODUCT NAME
// ==========================================================

function getPOSProductName(product) {

    return (
        product.name ||
        product.productName ||
        product.itemName ||
        "Unnamed Product"
    );

}


// ==========================================================
// GET PRODUCT PRICE
// ==========================================================

function getPOSProductPrice(product) {

    return posNumber(
        product.price ??
        product.sellingPrice ??
        product.salePrice ??
        product.unitPrice
    );

}


// ==========================================================
// GET PRODUCT IMAGE
// ==========================================================

function getPOSProductImage(product) {

    return (
        product.image ||
        product.imageUrl ||
        product.photo ||
        "../assets/img/no-image.png"
    );

}


// ==========================================================
// GET CATEGORY
// ==========================================================

function getPOSProductCategory(product) {

    return (
        product.category ||
        product.categoryName ||
        product.categoryId ||
        "Other"
    );

}


// ==========================================================
// LOAD PRODUCTS
// ==========================================================

async function loadPOSProducts() {

    if (!posFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }

    const snapshot =
        await db
            .ref("products")
            .once("value");

    posProducts =
        snapshot.val() || {};

    console.log(
        "POS Products loaded:",
        Object.keys(posProducts).length
    );

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadPOSCategories() {

    if (!posFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }

    const snapshot =
        await db
            .ref("categories")
            .once("value");

    posCategories =
        snapshot.val() || {};

    console.log(
        "POS Categories loaded:",
        Object.keys(posCategories).length
    );

}


// ==========================================================
// RENDER CATEGORIES
// ==========================================================

function renderPOSCategories() {

    const container =
        posElement(
            "posCategories"
        );

    if (!container) {

        return;

    }

    const categories = [];

    Object.entries(
        posCategories
    ).forEach(
        function([
            id,
            category
        ]) {

            if (!category) {

                return;

            }

            categories.push({

                id,

                name:
                    category.name ||
                    category.categoryName ||
                    category.title ||
                    "Other"

            });

        }
    );


    // ======================================================
    // ALL PRODUCTS
    // ======================================================

    let html = `

        <button
            type="button"
            class="pos-category-btn active"
            data-category="all"
            onclick="filterPOSCategory('all')">

            <i class="fa-solid fa-border-all"></i>

            All

        </button>

    `;


    // ======================================================
    // CATEGORIES
    // ======================================================

    categories
        .sort(
            function(a, b) {

                return a.name.localeCompare(
                    b.name
                );

            }
        )
        .forEach(
            function(category) {

                html += `

                    <button
                        type="button"
                        class="pos-category-btn"
                        data-category="${escapePOSHTML(category.name)}"
                        onclick="filterPOSCategory('${escapePOSHTML(category.name)}')">

                        ${escapePOSHTML(
                            category.name
                        )}

                    </button>

                `;

            }
        );


    container.innerHTML =
        html;

}


// ==========================================================
// CURRENT CATEGORY
// ==========================================================

let currentPOSCategory = "all";


// ==========================================================
// RENDER PRODUCTS
// ==========================================================

function renderPOSProducts() {

    const container =
        posElement(
            "posProducts"
        );

    if (!container) {

        return;

    }


    const searchInput =
        posElement(
            "posProductSearch"
        );

    const search =
        String(
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const products =
        Object.entries(
            posProducts
        )
        .map(
            function([
                id,
                product
            ]) {

                return {

                    id,

                    ...product

                };

            }
        )
        .filter(
            function(product) {

                // ==========================================
                // STATUS
                // ==========================================

                if (
                    product.status &&
                    String(
                        product.status
                    ).toLowerCase() ===
                    "inactive"
                ) {

                    return false;

                }


                // ==========================================
                // SEARCH
                // ==========================================

                if (search) {

                    const searchText =
                        [

                            product.name,

                            product.productName,

                            product.itemName,

                            product.code,

                            product.productCode,

                            product.category,

                            product.categoryName

                        ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !searchText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                // ==========================================
                // CATEGORY
                // ==========================================

                if (
                    currentPOSCategory !==
                    "all"
                ) {

                    const category =
                        getPOSProductCategory(
                            product
                        )
                        .toLowerCase();


                    if (
                        category !==
                        currentPOSCategory.toLowerCase()
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    if (
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="pos-products-loading">

                <i class="
                    fa-solid
                    fa-box-open
                    fs-2
                "></i>

                <strong>
                    No products found.
                </strong>

            </div>

        `;

        return;

    }


    container.innerHTML =
        products
        .map(
            function(product) {

                const name =
                    getPOSProductName(
                        product
                    );

                const price =
                    getPOSProductPrice(
                        product
                    );

                const image =
                    getPOSProductImage(
                        product
                    );

                const stock =
                    product.stock ??
                    product.quantity ??
                    "";


                return `

                    <div
                        class="pos-product-card"
                        onclick="addPOSToCart('${escapePOSHTML(product.id)}')"
                    >

                        <img
                            src="${escapePOSHTML(image)}"
                            alt="${escapePOSHTML(name)}"
                            class="pos-product-image"
                            onerror="
                                this.src='../assets/img/no-image.png';
                            "
                        >


                        <div class="pos-product-info">

                            <div class="pos-product-name">

                                ${escapePOSHTML(
                                    name
                                )}

                            </div>


                            <div class="pos-product-price">

                                ${posMoney(
                                    price
                                )}

                            </div>


                            ${
                                stock !== ""
                                ?
                                `
                                <div class="pos-product-stock">

                                    Stock:
                                    ${escapePOSHTML(stock)}

                                </div>
                                `
                                :
                                ""
                            }

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


// ==========================================================
// FILTER CATEGORY
// ==========================================================

function filterPOSCategory(category) {

    currentPOSCategory =
        category ||
        "all";


    document
        .querySelectorAll(
            ".pos-category-btn"
        )
        .forEach(
            function(button) {

                const buttonCategory =
                    String(
                        button.dataset.category ||
                        ""
                    );


                button.classList.toggle(
                    "active",
                    buttonCategory.toLowerCase() ===
                    currentPOSCategory.toLowerCase()
                );

            }
        );


    renderPOSProducts();

}


// ==========================================================
// ADD TO CART
// ==========================================================

function addPOSToCart(productId) {

    const product =
        posProducts[
            productId
        ];


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    const price =
        getPOSProductPrice(
            product
        );


    const name =
        getPOSProductName(
            product
        );


    const existing =
        posCart.find(
            function(item) {

                return item.productId ===
                    productId;

            }
        );


    if (existing) {

        existing.quantity++;

    }

    else {

        posCart.push({

            productId:

                productId,

            name:

                name,

            price:

                price,

            quantity:

                1,

            category:

                getPOSProductCategory(
                    product
                )

        });

    }


    renderPOSCart();

    updatePOSSummary();

}


// ==========================================================
// RENDER CART
// ==========================================================

function renderPOSCart() {

    const container =
        posElement(
            "posCart"
        );

    if (!container) {

        return;

    }


    if (
        posCart.length === 0
    ) {

        container.innerHTML = `

            <div class="pos-empty-cart">

                <i class="fa-solid fa-cart-shopping"></i>

                <strong>
                    Cart is empty
                </strong>

                <span>
                    Select a product to start an order.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        posCart
        .map(
            function(item, index) {

                const total =
                    item.price *
                    item.quantity;


                return `

                    <div class="pos-cart-item">

                        <div>

                            <div class="pos-cart-item-name">

                                ${escapePOSHTML(
                                    item.name
                                )}

                            </div>


                            <div class="pos-cart-item-price">

                                ${posMoney(
                                    item.price
                                )}
                                each

                            </div>


                            <div class="pos-cart-item-total">

                                ${posMoney(
                                    total
                                )}

                            </div>

                        </div>


                        <div class="pos-cart-controls">

                            <button
                                type="button"
                                onclick="event.stopPropagation(); decreasePOSItem(${index})">

                                <i class="fa-solid fa-minus"></i>

                            </button>


                            <span class="pos-cart-qty">

                                ${item.quantity}

                            </span>


                            <button
                                type="button"
                                onclick="event.stopPropagation(); increasePOSItem(${index})">

                                <i class="fa-solid fa-plus"></i>

                            </button>


                            <button
                                type="button"
                                onclick="event.stopPropagation(); removePOSItem(${index})"
                                title="Remove">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


// ==========================================================
// INCREASE
// ==========================================================

function increasePOSItem(index) {

    if (
        !posCart[index]
    ) {

        return;

    }

    posCart[index].quantity++;

    renderPOSCart();

    updatePOSSummary();

}


// ==========================================================
// DECREASE
// ==========================================================

function decreasePOSItem(index) {

    if (
        !posCart[index]
    ) {

        return;

    }


    posCart[index].quantity--;


    if (
        posCart[index].quantity <= 0
    ) {

        posCart.splice(
            index,
            1
        );

    }


    renderPOSCart();

    updatePOSSummary();

}


// ==========================================================
// REMOVE
// ==========================================================

function removePOSItem(index) {

    if (
        !posCart[index]
    ) {

        return;

    }


    posCart.splice(
        index,
        1
    );


    renderPOSCart();

    updatePOSSummary();

}


// ==========================================================
// CLEAR CART
// ==========================================================

function clearPOSCart() {

    if (
        posCart.length === 0
    ) {

        return;

    }


    const confirmed =
        window.confirm(
            "Clear the current order?"
        );


    if (!confirmed) {

        return;

    }


    posCart = [];

    posDiscount = 0;


    const discount =
        posElement(
            "posDiscount"
        );

    if (discount) {

        discount.value = 0;

    }


    renderPOSCart();

    updatePOSSummary();

    updatePOSPayment();

}


// ==========================================================
// SUBTOTAL
// ==========================================================

function getPOSSubtotal() {

    return posCart.reduce(
        function(total, item) {

            return total +
                (
                    posNumber(
                        item.price
                    ) *
                    posNumber(
                        item.quantity
                    )
                );

        },
        0
    );

}


// ==========================================================
// DISCOUNT
// ==========================================================

function getPOSDiscount() {

    const input =
        posElement(
            "posDiscount"
        );


    const discount =
        posNumber(
            input?.value
        );


    return Math.max(
        0,
        Math.min(
            discount,
            getPOSSubtotal()
        )
    );

}


// ==========================================================
// GRAND TOTAL
// ==========================================================

function getPOSGrandTotal() {

    return Math.max(
        0,
        getPOSSubtotal() -
        getPOSDiscount()
    );

}


// ==========================================================
// UPDATE SUMMARY
// ==========================================================

function updatePOSSummary() {

    const subtotal =
        getPOSSubtotal();

    const discount =
        getPOSDiscount();

    const total =
        getPOSGrandTotal();


    const subtotalElement =
        posElement(
            "posSubtotal"
        );

    if (subtotalElement) {

        subtotalElement.textContent =
            posMoney(
                subtotal
            );

    }


    const discountElement =
        posElement(
            "posDiscountAmount"
        );

    if (discountElement) {

        discountElement.textContent =
            posMoney(
                discount
            );

    }


    const totalElement =
        posElement(
            "posGrandTotal"
        );

    if (totalElement) {

        totalElement.textContent =
            posMoney(
                total
            );

    }


    updatePOSPayment();

}


// ==========================================================
// PAYMENT METHOD
// ==========================================================

function setPOSPaymentMethod(
    method
) {

    posPaymentMethod =
        method ||
        "Cash";


    document
        .querySelectorAll(
            ".pos-payment-method-btn"
        )
        .forEach(
            function(button) {

                button.classList.toggle(
                    "active",
                    String(
                        button.dataset.method ||
                        button.textContent ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        posPaymentMethod.toLowerCase()
                    )
                );

            }
        );


    updatePOSPayment();

}


// ==========================================================
// PAYMENT
// ==========================================================

function getPOSPaymentAmount() {

    const input =
        posElement(
            "posPaymentAmount"
        );


    return posNumber(
        input?.value
    );

}


// ==========================================================
// CHANGE
// ==========================================================

function getPOSChange() {

    return Math.max(
        0,
        getPOSPaymentAmount() -
        getPOSGrandTotal()
    );

}


// ==========================================================
// UPDATE PAYMENT
// ==========================================================

function updatePOSPayment() {

    const total =
        getPOSGrandTotal();

    const payment =
        getPOSPaymentAmount();

    const change =
        getPOSChange();


    const totalElement =
        posElement(
            "posPaymentTotal"
        );

    if (totalElement) {

        totalElement.textContent =
            posMoney(
                total
            );

    }


    const changeElement =
        posElement(
            "posChange"
        );

    if (changeElement) {

        changeElement.textContent =
            posMoney(
                change
            );

    }


    const payButton =
        posElement(
            "posPayBtn"
        );


    if (payButton) {

        payButton.disabled =
            posCart.length === 0 ||
            payment < total;

    }

}


// ==========================================================
// SAVE SALE
// ==========================================================

async function processPOSPayment() {

    if (
        posCart.length === 0
    ) {

        alert(
            "Please add products to the cart."
        );

        return;

    }


    const total =
        getPOSGrandTotal();

    const payment =
        getPOSPaymentAmount();


    if (
        payment < total
    ) {

        alert(
            "Payment amount is not enough."
        );

        return;

    }


    if (!posFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    const payButton =
        posElement(
            "posPayBtn"
        );


    try {

        if (payButton) {

            payButton.disabled =
                true;

            payButton.innerHTML = `

                <i class="
                    fa-solid
                    fa-spinner
                    fa-spin
                "></i>

                Processing...

            `;

        }


        const orderNumber =
            generatePOSOrderNumber();


        const saleId =
            db
                .ref("sales")
                .push()
                .key;


        const subtotal =
            getPOSSubtotal();

        const discount =
            getPOSDiscount();

        const change =
            payment -
            total;


        const saleData = {

            id:
                saleId,

            orderNumber:
                orderNumber,

            items:
                posCart.map(
                    function(item) {

                        return {

                            productId:
                                item.productId,

                            name:
                                item.name,

                            category:
                                item.category,

                            price:
                                item.price,

                            quantity:
                                item.quantity,

                            total:
                                item.price *
                                item.quantity

                        };

                    }
                ),

            subtotal:
                subtotal,

            discount:
                discount,

            total:
                total,

            payment:
                payment,

            change:
                change,

            paymentMethod:
                posPaymentMethod,

            status:
                "Paid",

            createdAt:
                firebase
                    .database
                    .ServerValue
                    .TIMESTAMP

        };


        await db
            .ref(
                "sales/" +
                saleId
            )
            .set(
                saleData
            );


        // ==================================================
        // UPDATE PRODUCT STOCK
        // ==================================================

        await updatePOSProductStocks();


        // ==================================================
        // RECEIPT
        // ==================================================

        showPOSReceipt(
            saleData
        );


        // ==================================================
        // RESET ORDER
        // ==================================================

        posCart = [];

        posDiscount = 0;


        const discountInput =
            posElement(
                "posDiscount"
            );

        if (discountInput) {

            discountInput.value = 0;

        }


        const paymentInput =
            posElement(
                "posPaymentAmount"
            );

        if (paymentInput) {

            paymentInput.value = "";

        }


        renderPOSCart();

        updatePOSSummary();


    }

    catch (error) {

        console.error(
            "POS Payment Error:",
            error
        );


        alert(
            "Unable to complete payment.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

    finally {

        if (payButton) {

            payButton.disabled =
                false;

            payButton.innerHTML = `

                <i class="fa-solid fa-credit-card"></i>

                PAY

            `;

        }

    }

}


// ==========================================================
// UPDATE PRODUCT STOCK
// ==========================================================

async function updatePOSProductStocks() {

    for (
        const item of posCart
    ) {

        const product =
            posProducts[
                item.productId
            ];


        if (!product) {

            continue;

        }


        const currentStock =
            posNumber(
                product.stock ??
                product.quantity ??
                0
            );


        const newStock =
            Math.max(
                0,
                currentStock -
                item.quantity
            );


        const updates = {

            stock:
                newStock,

            updatedAt:
                firebase
                    .database
                    .ServerValue
                    .TIMESTAMP

        };


        await db
            .ref(
                "products/" +
                item.productId
            )
            .update(
                updates
            );

    }

}


// ==========================================================
// RECEIPT
// ==========================================================

function showPOSReceipt(
    sale
) {

    const receipt =
        posElement(
            "posReceipt"
        );


    if (!receipt) {

        printPOSReceipt(
            sale
        );

        return;

    }


    const itemsHTML =
        sale.items
        .map(
            function(item) {

                return `

                    <div class="d-flex justify-content-between">

                        <span>

                            ${escapePOSHTML(
                                item.name
                            )}
                            ×
                            ${item.quantity}

                        </span>

                        <strong>

                            ${posMoney(
                                item.total
                            )}

                        </strong>

                    </div>

                `;

            }
        )
        .join("");


    receipt.innerHTML = `

        <div class="text-center">

            <h4 class="fw-bold">
                PAPPRITO
            </h4>

            <div>
                Restaurant
            </div>

            <hr>

            <div class="small">

                ${escapePOSHTML(
                    sale.orderNumber
                )}

            </div>

        </div>


        <div class="my-3">

            ${itemsHTML}

        </div>


        <hr>


        <div class="d-flex justify-content-between">

            <span>
                Subtotal
            </span>

            <strong>
                ${posMoney(sale.subtotal)}
            </strong>

        </div>


        <div class="d-flex justify-content-between">

            <span>
                Discount
            </span>

            <strong>
                ${posMoney(sale.discount)}
            </strong>

        </div>


        <div class="d-flex justify-content-between fs-5">

            <strong>
                TOTAL
            </strong>

            <strong>
                ${posMoney(sale.total)}
            </strong>

        </div>


        <div class="d-flex justify-content-between mt-2">

            <span>
                Payment
            </span>

            <strong>
                ${posMoney(sale.payment)}
            </strong>

        </div>


        <div class="d-flex justify-content-between">

            <span>
                Change
            </span>

            <strong>
                ${posMoney(sale.change)}
            </strong>

        </div>


        <div class="text-center mt-3">

            Thank you!

        </div>

    `;


    const modal =
        posElement(
            "posReceiptModal"
        );


    if (
        modal &&
        typeof bootstrap !== "undefined"
    ) {

        bootstrap.Modal
            .getOrCreateInstance(
                modal
            )
            .show();

    }

}


// ==========================================================
// PRINT RECEIPT
// ==========================================================

function printPOSReceipt(
    sale
) {

    const items =
        sale.items
        .map(
            function(item) {

                return `

                    <tr>

                        <td>
                            ${escapePOSHTML(item.name)}
                        </td>

                        <td>
                            ${item.quantity}
                        </td>

                        <td>
                            ${posMoney(item.total)}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=400,height=700"
        );


    if (!receiptWindow) {

        alert(
            "Please allow pop-ups to print the receipt."
        );

        return;

    }


    receiptWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                PAPPRITO Receipt
            </title>

            <style>

                body {

                    width: 300px;

                    margin: auto;

                    font-family:
                        Arial,
                        sans-serif;

                    font-size: 12px;

                }

                h2 {

                    text-align: center;

                    margin-bottom: 2px;

                }

                .center {

                    text-align: center;

                }

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                }

                td {

                    padding:
                        4px 0;

                }

                .right {

                    text-align:
                        right;

                }

                hr {

                    border: 0;

                    border-top:
                        1px dashed #000;

                }

            </style>

        </head>

        <body>

            <h2>PAPPRITO</h2>

            <div class="center">
                Restaurant
            </div>

            <hr>

            <div class="center">

                ${escapePOSHTML(
                    sale.orderNumber
                )}

            </div>

            <hr>

            <table>

                ${items}

            </table>

            <hr>

            <table>

                <tr>

                    <td>
                        Subtotal
                    </td>

                    <td class="right">
                        ${posMoney(sale.subtotal)}
                    </td>

                </tr>

                <tr>

                    <td>
                        Discount
                    </td>

                    <td class="right">
                        ${posMoney(sale.discount)}
                    </td>

                </tr>

                <tr>

                    <td>
                        <strong>
                            TOTAL
                        </strong>
                    </td>

                    <td class="right">

                        <strong>
                            ${posMoney(sale.total)}
                        </strong>

                    </td>

                </tr>

                <tr>

                    <td>
                        Payment
                    </td>

                    <td class="right">
                        ${posMoney(sale.payment)}
                    </td>

                </tr>

                <tr>

                    <td>
                        Change
                    </td>

                    <td class="right">
                        ${posMoney(sale.change)}
                    </td>

                </tr>

            </table>

            <hr>

            <div class="center">

                Thank you!

            </div>

            <script>

                window.onload =
                    function() {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    receiptWindow.document.close();

}


// ==========================================================
// REFRESH POS
// ==========================================================

async function refreshPOS() {

    try {

        await loadPOSProducts();

        await loadPOSCategories();

        renderPOSCategories();

        renderPOSProducts();

    }

    catch (error) {

        console.error(
            "POS Refresh Error:",
            error
        );

    }

}


// ==========================================================
// BIND EVENTS
// ==========================================================

function bindPOSEvents() {

    // ======================================================
    // SEARCH
    // ======================================================

    const search =
        posElement(
            "posProductSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderPOSProducts
        );

    }


    // ======================================================
    // REFRESH
    // ======================================================

    const refresh =
        posElement(
            "posRefreshBtn"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            refreshPOS
        );

    }


    // ======================================================
    // CLEAR
    // ======================================================

    const clear =
        posElement(
            "posClearOrder"
        );


    if (clear) {

        clear.addEventListener(
            "click",
            clearPOSCart
        );

    }


    // ======================================================
    // DISCOUNT
    // ======================================================

    const discount =
        posElement(
            "posDiscount"
        );


    if (discount) {

        discount.addEventListener(
            "input",
            updatePOSSummary
        );

    }


    // ======================================================
    // PAYMENT
    // ======================================================

    const payment =
        posElement(
            "posPaymentAmount"
        );


    if (payment) {

        payment.addEventListener(
            "input",
            updatePOSPayment
        );

    }


    // ======================================================
    // PAYMENT METHODS
    // ======================================================

    document
        .querySelectorAll(
            ".pos-payment-method-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        setPOSPaymentMethod(
                            button.dataset.method ||
                            button.textContent.trim()
                        );

                    }
                );

            }
        );


    // ======================================================
    // PAY
    // ======================================================

    const pay =
        posElement(
            "posPayBtn"
        );


    if (pay) {

        pay.addEventListener(
            "click",
            processPOSPayment
        );

    }


    // ======================================================
    // PRINT
    // ======================================================

    const print =
        posElement(
            "posPrintReceipt"
        );


    if (print) {

        print.addEventListener(
            "click",
            function() {

                if (
                    window.currentPOSReceipt
                ) {

                    printPOSReceipt(
                        window.currentPOSReceipt
                    );

                }

            }
        );

    }

}


// ==========================================================
// INITIALIZE POS
// ==========================================================

async function initializePOS() {

    console.log(
        "=========================================="
    );

    console.log(
        "PAPPRITO POS INITIALIZING..."
    );

    console.log(
        "=========================================="
    );


    if (!posFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        bindPOSEvents();

        await loadPOSCategories();

        await loadPOSProducts();

        renderPOSCategories();

        renderPOSProducts();

        renderPOSCart();

        updatePOSSummary();

        const orderNumber =
            posElement(
                "posOrderNumber"
            );

        if (orderNumber) {

            orderNumber.textContent =
                generatePOSOrderNumber();

        }


        posInitialized =
            true;


        console.log(
            "PAPPRITO POS initialized."
        );

    }

    catch (error) {

        console.error(
            "POS Initialization Error:",
            error
        );

    }

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializePOS =
    initializePOS;

window.loadPOSProducts =
    loadPOSProducts;

window.loadPOSCategories =
    loadPOSCategories;

window.renderPOSProducts =
    renderPOSProducts;

window.renderPOSCategories =
    renderPOSCategories;

window.filterPOSCategory =
    filterPOSCategory;

window.addPOSToCart =
    addPOSToCart;

window.increasePOSItem =
    increasePOSItem;

window.decreasePOSItem =
    decreasePOSItem;

window.removePOSItem =
    removePOSItem;

window.clearPOSCart =
    clearPOSCart;

window.setPOSPaymentMethod =
    setPOSPaymentMethod;

window.processPOSPayment =
    processPOSPayment;

window.refreshPOS =
    refreshPOS;

window.printPOSReceipt =
    printPOSReceipt;


console.log(
    "PAPPRITO POS Engine V1 loaded."
);
