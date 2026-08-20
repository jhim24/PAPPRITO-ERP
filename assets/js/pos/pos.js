/* ==========================================================
   PAPPRITO ERP
   POS V2 — CONSOLIDATED POS ENGINE
   File:
   assets/js/pos/pos.js

   CART FORMAT:
   SN | ITEMS | QTY | TOTAL

   RECEIPT FORMAT:
   SN | ITEMS | QTY | TOTAL

   PAYMENT:
   TOTAL
   AMOUNT RECEIVED
   CHANGE

   IMPORTANT:
   - Standalone POS
   - Firebase Realtime Database
   - No ERP sidebar
   - No ERP navbar
========================================================== */

"use strict";


/* ==========================================================
   GLOBAL POS STATE
========================================================== */

let PAPPRITO_POS = {

    products: {},

    categories: {},

    cart: [],

    currentCategory: "all",

    paymentMethod: "Cash",

    discount: 0,

    customer: "Walk-in Customer",

    initialized: false,

    processing: false,

    lastSale: null

};


/* ==========================================================
   FIREBASE
========================================================== */

function posFirebaseReady() {

    return (
        typeof db !== "undefined" &&
        db &&
        typeof db.ref === "function"
    );

}


/* ==========================================================
   ELEMENT HELPER
========================================================== */

function posEl(id) {

    return document.getElementById(id);

}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function posNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


/* ==========================================================
   MONEY
========================================================== */

function posMoney(value) {

    const amount =
        posNumber(value);

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
   ESCAPE HTML
========================================================== */

function posEscape(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   SHOW STATUS
========================================================== */

function posStatus(message) {

    const element =
        posEl("posStatus");

    if (!element) {

        console.log(
            "PAPPRITO POS:",
            message
        );

        return;

    }

    element.textContent =
        message;

    element.classList.add("show");

    clearTimeout(
        window.pappritoPOSTimer
    );

    window.pappritoPOSTimer =
        setTimeout(
            function () {

                element.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ==========================================================
   ERROR
========================================================== */

function posError(message, error) {

    console.error(
        "PAPPRITO POS:",
        message,
        error || ""
    );

    posStatus(message);

}


/* ==========================================================
   PRODUCT NAME
========================================================== */

function getPOSProductName(product) {

    if (!product) {

        return "Unnamed Product";

    }

    return (
        product.name ||
        product.productName ||
        product.itemName ||
        product.title ||
        "Unnamed Product"
    );

}


/* ==========================================================
   PRODUCT PRICE
========================================================== */

function getPOSProductPrice(product) {

    if (!product) {

        return 0;

    }

    return posNumber(
        product.price ??
        product.sellingPrice ??
        product.salePrice ??
        product.unitPrice ??
        product.srp ??
        0
    );

}


/* ==========================================================
   PRODUCT CATEGORY
========================================================== */

function getPOSProductCategory(product) {

    if (!product) {

        return "Other";

    }

    return String(
        product.categoryName ??
        product.category ??
        product.categoryId ??
        "Other"
    );

}


/* ==========================================================
   PRODUCT IMAGE
========================================================== */

function getPOSProductImage(product) {

    if (!product) {

        return "../assets/img/no-image.png";

    }

    return (
        product.image ||
        product.imageUrl ||
        product.photo ||
        product.photoUrl ||
        "../assets/img/no-image.png"
    );

}


/* ==========================================================
   PRODUCT STOCK
========================================================== */

function getPOSProductStock(product) {

    if (!product) {

        return null;

    }

    if (
        product.stock !== undefined &&
        product.stock !== null &&
        product.stock !== ""
    ) {

        return posNumber(
            product.stock
        );

    }

    if (
        product.quantity !== undefined &&
        product.quantity !== null &&
        product.quantity !== ""
    ) {

        return posNumber(
            product.quantity
        );

    }

    return null;

}


/* ==========================================================
   GENERATE ORDER NUMBER
========================================================== */

function generatePOSOrderNumber() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    const milliseconds =
        String(
            now.getMilliseconds()
        ).padStart(3, "0");

    return (
        "POS-" +
        year +
        month +
        day +
        "-" +
        hours +
        minutes +
        seconds +
        milliseconds
    );

}


/* ==========================================================
   UPDATE ORDER NUMBER
========================================================== */

function updatePOSOrderNumber() {

    const element =
        posEl("posOrderNumber");

    if (!element) {

        return;

    }

    element.textContent =
        generatePOSOrderNumber();

}


/* ==========================================================
   LOAD CATEGORIES
========================================================== */

async function loadPOSCategories() {

    if (!posFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }

    try {

        const snapshot =
            await db
                .ref("categories")
                .once("value");

        PAPPRITO_POS.categories =
            snapshot.val() || {};

        renderPOSCategories();

        return PAPPRITO_POS.categories;

    }

    catch (error) {

        posError(
            "Unable to load categories.",
            error
        );

        throw error;

    }

}


/* ==========================================================
   LOAD PRODUCTS
========================================================== */

async function loadPOSProducts() {

    if (!posFirebaseReady()) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }

    try {

        const snapshot =
            await db
                .ref("products")
                .once("value");

        PAPPRITO_POS.products =
            snapshot.val() || {};

        renderPOSProducts();

        return PAPPRITO_POS.products;

    }

    catch (error) {

        posError(
            "Unable to load products.",
            error
        );

        throw error;

    }

}


/* ==========================================================
   RENDER CATEGORIES
========================================================== */

function renderPOSCategories() {

    const container =
        posEl("posCategories");

    if (!container) {

        return;

    }

    const categories = [];

    Object.entries(
        PAPPRITO_POS.categories
    )
    .forEach(
        function ([id, category]) {

            if (!category) {

                return;

            }

            const name =
                category.name ||
                category.categoryName ||
                category.title ||
                "Other";

            categories.push({

                id: id,

                name: String(name)

            });

        }
    );


    categories.sort(
        function (a, b) {

            return a.name.localeCompare(
                b.name
            );

        }
    );


    let html = `

        <button
            type="button"
            class="pos-category-btn active"
            data-category="all"
            onclick="filterPOSCategory('all')">

            <i class="fa-solid fa-border-all"></i>

            <span>
                All Products
            </span>

        </button>

    `;


    categories.forEach(
        function (category) {

            const encoded =
                posEscape(
                    category.name
                );

            html += `

                <button
                    type="button"
                    class="pos-category-btn"
                    data-category="${encoded}"
                    onclick="filterPOSCategory('${encoded}')">

                    <i class="fa-solid fa-tag"></i>

                    <span>
                        ${encoded}
                    </span>

                </button>

            `;

        }
    );


    container.innerHTML =
        html;


    document
        .querySelectorAll(
            ".pos-category-btn"
        )
        .forEach(
            function (button) {

                const category =
                    String(
                        button.dataset.category ||
                        ""
                    );

                button.classList.toggle(
                    "active",
                    category.toLowerCase() ===
                    PAPPRITO_POS.currentCategory.toLowerCase()
                );

            }
        );

}


/* ==========================================================
   FILTER CATEGORY
========================================================== */

function filterPOSCategory(category) {

    PAPPRITO_POS.currentCategory =
        category || "all";

    document
        .querySelectorAll(
            ".pos-category-btn"
        )
        .forEach(
            function (button) {

                const buttonCategory =
                    String(
                        button.dataset.category ||
                        ""
                    );

                button.classList.toggle(
                    "active",
                    buttonCategory.toLowerCase() ===
                    PAPPRITO_POS.currentCategory.toLowerCase()
                );

            }
        );

    renderPOSProducts();

}


/* ==========================================================
   SEARCH MATCH
========================================================== */

function POSProductMatchesSearch(
    product,
    search
) {

    if (!search) {

        return true;

    }

    const text = [

        product.name,

        product.productName,

        product.itemName,

        product.title,

        product.code,

        product.productCode,

        product.sku,

        product.category,

        product.categoryName

    ]
        .filter(
            value =>
                value !== undefined &&
                value !== null
        )
        .join(" ")
        .toLowerCase();

    return text.includes(
        search
    );

}


/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderPOSProducts() {

    const container =
        posEl("posProducts");

    if (!container) {

        return;

    }


    const searchInput =
        posEl("posProductSearch");

    const search =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const category =
        PAPPRITO_POS.currentCategory;


    const products =
        Object.entries(
            PAPPRITO_POS.products
        )
        .map(
            function ([id, product]) {

                return {

                    id: id,

                    ...(product || {})

                };

            }
        )
        .filter(
            function (product) {

                const status =
                    String(
                        product.status ??
                        "active"
                    )
                    .toLowerCase();

                if (
                    status === "inactive" ||
                    status === "disabled" ||
                    status === "deleted"
                ) {

                    return false;

                }


                if (
                    !POSProductMatchesSearch(
                        product,
                        search
                    )
                ) {

                    return false;

                }


                if (
                    category !== "all"
                ) {

                    const productCategory =
                        getPOSProductCategory(
                            product
                        )
                        .toLowerCase();

                    if (
                        productCategory !==
                        category.toLowerCase()
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

            <div class="pos-loading">

                <i
                    class="fa-solid fa-box-open"
                    style="font-size:36px;">
                </i>

                <strong>
                    No products found
                </strong>

                <span>
                    Try another search or category.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        products
        .map(
            function (product) {

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
                    getPOSProductStock(
                        product
                    );


                const stockHTML =
                    stock !== null
                    ?
                    `

                        <div class="pos-product-stock">

                            Stock:
                            ${posEscape(stock)}

                        </div>

                    `
                    :
                    "";


                return `

                    <div
                        class="pos-product-card"
                        data-product-id="${posEscape(product.id)}"
                        onclick="addPOSToCart('${posEscape(product.id)}')">

                        <img
                            src="${posEscape(image)}"
                            alt="${posEscape(name)}"
                            class="pos-product-image"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='../assets/img/no-image.png';
                            ">

                        <div class="pos-product-info">

                            <div class="pos-product-name">
                                ${posEscape(name)}
                            </div>

                            <div class="pos-product-price">
                                ${posMoney(price)}
                            </div>

                            ${stockHTML}

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* ==========================================================
   ADD PRODUCT TO CART
========================================================== */

function addPOSToCart(productId) {

    const product =
        PAPPRITO_POS.products[
            productId
        ];


    if (!product) {

        posError(
            "Product not found."
        );

        return;

    }


    const stock =
        getPOSProductStock(
            product
        );


    const existing =
        PAPPRITO_POS.cart.find(
            function (item) {

                return (
                    item.productId ===
                    productId
                );

            }
        );


    const currentQuantity =
        existing
        ?
        existing.quantity
        :
        0;


    if (
        stock !== null &&
        currentQuantity >= stock
    ) {

        posStatus(
            "Not enough stock available."
        );

        return;

    }


    if (existing) {

        existing.quantity += 1;

    }

    else {

        PAPPRITO_POS.cart.push({

            productId:
                productId,

            name:
                getPOSProductName(
                    product
                ),

            price:
                getPOSProductPrice(
                    product
                ),

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

    posStatus(
        "Product added."
    );

}


/* ==========================================================
   CART ITEM TOTAL
========================================================== */

function getPOSCartItemTotal(item) {

    return (
        posNumber(item.price) *
        posNumber(item.quantity)
    );

}


/* ==========================================================
   RENDER CART
==========================================================
//
// FORMAT:
//
// SN | ITEMS | QTY | TOTAL
//
// Each row:
//
// 1  | Chicken Adobo | 2 | ₱300.00
//
// Quantity controls are kept on the item row.
// ========================================================== */

function renderPOSCart() {

    const container =
        posEl("posCart");

    if (!container) {

        return;

    }


    if (
        PAPPRITO_POS.cart.length === 0
    ) {

        container.innerHTML = `

            <div class="pos-empty-cart">

                <div class="pos-empty-icon">

                    <i class="fa-solid fa-cart-shopping"></i>

                </div>

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


    let html = `

        <div class="pos-cart-table">

            <div class="pos-cart-header">

                <div class="pos-cart-sn">
                    SN
                </div>

                <div class="pos-cart-items">
                    ITEMS
                </div>

                <div class="pos-cart-qty">
                    QTY
                </div>

                <div class="pos-cart-total">
                    TOTAL
                </div>

            </div>

    `;


    PAPPRITO_POS.cart.forEach(
        function (item, index) {

            const lineTotal =
                getPOSCartItemTotal(
                    item
                );


            html += `

                <div
                    class="pos-cart-item"
                    data-cart-index="${index}">


                    <!-- SN -->

                    <div class="pos-cart-sn">

                        ${index + 1}

                    </div>


                    <!-- ITEM -->

                    <div class="pos-cart-items">

                        <div class="pos-cart-item-name">

                            ${posEscape(
                                item.name
                            )}

                        </div>


                        <div class="pos-cart-item-price">

                            ${posMoney(
                                item.price
                            )}
                            each

                        </div>


                        <div class="pos-cart-item-actions">

                            <button
                                type="button"
                                class="pos-cart-control"
                                onclick="
                                    event.stopPropagation();
                                    decreasePOSItem(${index});
                                "
                                title="Decrease">

                                <i class="fa-solid fa-minus"></i>

                            </button>


                            <button
                                type="button"
                                class="pos-cart-remove"
                                onclick="
                                    event.stopPropagation();
                                    removePOSItem(${index});
                                "
                                title="Remove">

                                <i class="fa-solid fa-trash"></i>

                            </button>


                            <button
                                type="button"
                                class="pos-cart-control"
                                onclick="
                                    event.stopPropagation();
                                    increasePOSItem(${index});
                                "
                                title="Increase">

                                <i class="fa-solid fa-plus"></i>

                            </button>

                        </div>

                    </div>


                    <!-- QTY -->

                    <div class="pos-cart-qty">

                        <span class="pos-cart-qty-value">

                            ${posEscape(
                                item.quantity
                            )}

                        </span>

                    </div>


                    <!-- TOTAL -->

                    <div class="pos-cart-total">

                        <strong>

                            ${posMoney(
                                lineTotal
                            )}

                        </strong>

                    </div>


                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    container.innerHTML =
        html;

}


/* ==========================================================
   INCREASE CART ITEM
========================================================== */

function increasePOSItem(index) {

    const item =
        PAPPRITO_POS.cart[index];

    if (!item) {

        return;

    }


    const product =
        PAPPRITO_POS.products[
            item.productId
        ];


    const stock =
        getPOSProductStock(
            product
        );


    if (
        stock !== null &&
        item.quantity >= stock
    ) {

        posStatus(
            "Maximum available stock reached."
        );

        return;

    }


    item.quantity++;

    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   DECREASE CART ITEM
========================================================== */

function decreasePOSItem(index) {

    const item =
        PAPPRITO_POS.cart[index];

    if (!item) {

        return;

    }


    item.quantity--;


    if (
        item.quantity <= 0
    ) {

        PAPPRITO_POS.cart.splice(
            index,
            1
        );

    }


    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   REMOVE CART ITEM
========================================================== */

function removePOSItem(index) {

    if (
        !PAPPRITO_POS.cart[index]
    ) {

        return;

    }


    PAPPRITO_POS.cart.splice(
        index,
        1
    );


    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   CLEAR CART
========================================================== */

function clearPOSCart(
    askConfirmation = true
) {

    if (
        PAPPRITO_POS.cart.length === 0
    ) {

        return;

    }


    if (
        askConfirmation &&
        !window.confirm(
            "Clear the current order?"
        )
    ) {

        return;

    }


    PAPPRITO_POS.cart = [];

    PAPPRITO_POS.discount = 0;


    const discount =
        posEl("posDiscount");

    if (discount) {

        discount.value = "";

    }


    const payment =
        posEl("posAmountReceived");

    if (payment) {

        payment.value = "";

    }


    const modalPayment =
        posEl("posModalAmountReceived");

    if (modalPayment) {

        modalPayment.value = "";

    }


    renderPOSCart();

    updatePOSSummary();

    updatePOSPayment();

}


/* ==========================================================
   SUBTOTAL
========================================================== */

function getPOSSubtotal() {

    return PAPPRITO_POS.cart.reduce(
        function (total, item) {

            return (
                total +
                getPOSCartItemTotal(
                    item
                )
            );

        },
        0
    );

}


/* ==========================================================
   DISCOUNT
========================================================== */

function getPOSDiscount() {

    const input =
        posEl("posDiscount");


    let discount =
        input
        ?
        posNumber(input.value)
        :
        PAPPRITO_POS.discount;


    discount =
        Math.max(
            0,
            Math.min(
                discount,
                getPOSSubtotal()
            )
        );


    PAPPRITO_POS.discount =
        discount;


    return discount;

}


/* ==========================================================
   TOTAL
========================================================== */

function getPOSGrandTotal() {

    return Math.max(
        0,
        getPOSSubtotal() -
        getPOSDiscount()
    );

}


/* ==========================================================
   UPDATE SUMMARY
========================================================== */

function updatePOSSummary() {

    const subtotal =
        getPOSSubtotal();

    const discount =
        getPOSDiscount();

    const total =
        getPOSGrandTotal();


    const subtotalElement =
        posEl("posSubtotal");

    if (subtotalElement) {

        subtotalElement.textContent =
            posMoney(subtotal);

    }


    const discountElement =
        posEl("posDiscount");


    if (
        discountElement &&
        discountElement.tagName !== "INPUT"
    ) {

        discountElement.textContent =
            posMoney(discount);

    }


    const discountAmountElement =
        posEl("posDiscountAmount");

    if (discountAmountElement) {

        discountAmountElement.textContent =
            posMoney(discount);

    }


    const totalElement =
        posEl("posTotal");

    if (totalElement) {

        totalElement.textContent =
            posMoney(total);

    }


    const grandTotalElement =
        posEl("posGrandTotal");

    if (grandTotalElement) {

        grandTotalElement.textContent =
            posMoney(total);

    }


    const taxElement =
        posEl("posTax");

    if (taxElement) {

        taxElement.textContent =
            posMoney(0);

    }


    updatePOSPayment();

}


/* ==========================================================
   PAYMENT METHOD
========================================================== */

function setPOSPaymentMethod(method) {

    let selected =
        String(
            method || "Cash"
        )
        .trim()
        .toLowerCase();


    if (
        selected.includes("cash")
    ) {

        selected = "Cash";

    }

    else if (
        selected.includes("card")
    ) {

        selected = "Card";

    }

    else if (
        selected.includes("gcash")
    ) {

        selected = "GCash";

    }

    else {

        selected = "Other";

    }


    PAPPRITO_POS.paymentMethod =
        selected;


    document
        .querySelectorAll(
            ".pos-payment-method-btn"
        )
        .forEach(
            function (button) {

                const buttonMethod =
                    String(
                        button.dataset.paymentMethod ||
                        button.dataset.method ||
                        button.textContent ||
                        ""
                    )
                    .toLowerCase();


                button.classList.toggle(
                    "active",
                    buttonMethod.includes(
                        selected.toLowerCase()
                    )
                );

            }
        );


    updatePOSPayment();

}


/* ==========================================================
   GET PAYMENT AMOUNT
========================================================== */

function getPOSPaymentAmount() {

    /*
       Support both old and new IDs.
    */

    const input =
        posEl("posAmountReceived") ||
        posEl("posPaymentAmount");


    if (!input) {

        return 0;

    }


    return Math.max(
        0,
        posNumber(input.value)
    );

}


/* ==========================================================
   CHANGE
========================================================== */

function getPOSChange() {

    const payment =
        getPOSPaymentAmount();

    const total =
        getPOSGrandTotal();


    return Math.max(
        0,
        payment - total
    );

}


/* ==========================================================
   UPDATE PAYMENT
========================================================== */

function updatePOSPayment() {

    const total =
        getPOSGrandTotal();

    const payment =
        getPOSPaymentAmount();

    const change =
        getPOSChange();


    const totalElements = [

        posEl("posPaymentTotal"),

        posEl("posFinalTotal"),

        posEl("posTotalPayment"),

        posEl("posPaymentAmountDisplay")

    ];


    totalElements.forEach(
        function (element) {

            if (element) {

                element.textContent =
                    posMoney(total);

            }

        }
    );


    const changeElement =
        posEl("posChange");

    if (changeElement) {

        changeElement.textContent =
            posMoney(change);

    }


    const modalChange =
        posEl("posModalChange");

    if (modalChange) {

        modalChange.textContent =
            posMoney(change);

    }


    const modalTotal =
        posEl("posModalTotal");

    if (modalTotal) {

        modalTotal.textContent =
            posMoney(total);

    }


    const payButton =
        posEl("posPayBtn");

    if (payButton) {

        payButton.disabled =
            PAPPRITO_POS.cart.length === 0 ||
            payment < total ||
            PAPPRITO_POS.processing;

    }

}


/* ==========================================================
   CUSTOMER
========================================================== */

function getPOSCustomer() {

    const input =
        posEl("posCustomerName");

    if (!input) {

        return "Walk-in Customer";

    }


    return (
        String(
            input.value || ""
        ).trim() ||
        "Walk-in Customer"
    );

}


/* ==========================================================
   UPDATE CUSTOMER
========================================================== */

function updatePOSCustomer() {

    PAPPRITO_POS.customer =
        getPOSCustomer();

}


/* ==========================================================
   STOCK VALIDATION
========================================================== */

function validatePOSCartStock() {

    for (
        const item of
        PAPPRITO_POS.cart
    ) {

        const product =
            PAPPRITO_POS.products[
                item.productId
            ];


        if (!product) {

            return {

                valid: false,

                message:
                    `${item.name} is no longer available.`

            };

        }


        const stock =
            getPOSProductStock(
                product
            );


        if (
            stock !== null &&
            item.quantity > stock
        ) {

            return {

                valid: false,

                message:
                    `Insufficient stock for ${item.name}. Available: ${stock}.`

            };

        }

    }


    return {

        valid: true,

        message: ""

    };

}


/* ==========================================================
   PROCESS PAYMENT
========================================================== */

async function processPOSPayment() {

    if (
        PAPPRITO_POS.processing
    ) {

        return;

    }


    if (
        PAPPRITO_POS.cart.length === 0
    ) {

        posStatus(
            "Please add products to the order."
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

        posStatus(
            "Payment amount is not enough."
        );

        return;

    }


    if (!posFirebaseReady()) {

        posError(
            "Firebase Database is not initialized."
        );

        return;

    }


    const stockCheck =
        validatePOSCartStock();


    if (
        !stockCheck.valid
    ) {

        posStatus(
            stockCheck.message
        );

        return;

    }


    PAPPRITO_POS.processing =
        true;


    const payButton =
        posEl("posPayBtn");


    const originalButtonHTML =
        payButton
        ?
        payButton.innerHTML
        :
        "";


    try {

        if (payButton) {

            payButton.disabled =
                true;

            payButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                PROCESSING

            `;

        }


        updatePOSCustomer();


        const orderNumber =
            generatePOSOrderNumber();


        const saleRef =
            db
                .ref("sales")
                .push();


        const saleId =
            saleRef.key;


        const subtotal =
            getPOSSubtotal();

        const discount =
            getPOSDiscount();

        const change =
            payment - total;


        const saleItems =
            PAPPRITO_POS.cart
            .map(
                function (item) {

                    return {

                        productId:
                            item.productId,

                        name:
                            item.name,

                        category:
                            item.category,

                        price:
                            posNumber(
                                item.price
                            ),

                        quantity:
                            posNumber(
                                item.quantity
                            ),

                        total:
                            getPOSCartItemTotal(
                                item
                            )

                    };

                }
            );


        const saleData = {

            id:
                saleId,

            orderNumber:
                orderNumber,

            customer:
                PAPPRITO_POS.customer,

            customerName:
                PAPPRITO_POS.customer,

            items:
                saleItems,

            subtotal:
                subtotal,

            discount:
                discount,

            tax:
                0,

            total:
                total,

            payment:
                payment,

            amountReceived:
                payment,

            change:
                change,

            paymentMethod:
                PAPPRITO_POS.paymentMethod,

            status:
                "Paid",

            source:
                "POS",

            createdAt:
                firebase.database.ServerValue.TIMESTAMP

        };


        /* ==================================================
           SAVE SALE
        ================================================== */

        await saleRef.set(
            saleData
        );


        /* ==================================================
           UPDATE STOCK
        ================================================== */

        await updatePOSProductStocks();


        PAPPRITO_POS.lastSale =
            saleData;


        window.currentPOSReceipt =
            saleData;


        /* ==================================================
           SHOW RECEIPT
        ================================================== */

        showPOSReceipt(
            saleData
        );


        /* ==================================================
           RESET ORDER
        ================================================== */

        PAPPRITO_POS.cart = [];

        PAPPRITO_POS.discount = 0;

        PAPPRITO_POS.customer =
            "Walk-in Customer";


        const discountInput =
            posEl("posDiscount");

        if (discountInput) {

            discountInput.value =
                "";

        }


        const paymentInput =
            posEl("posAmountReceived") ||
            posEl("posPaymentAmount");

        if (paymentInput) {

            paymentInput.value =
                "";

        }


        const modalPayment =
            posEl("posModalAmountReceived");

        if (modalPayment) {

            modalPayment.value =
                "";

        }


        const customerInput =
            posEl("posCustomerName");

        if (customerInput) {

            customerInput.value =
                "";

        }


        renderPOSCart();

        updatePOSSummary();

        updatePOSPayment();

        updatePOSOrderNumber();


        await loadPOSProducts();


        posStatus(
            "Payment completed successfully."
        );

    }

    catch (error) {

        console.error(
            "POS PAYMENT ERROR:",
            error
        );


        posStatus(
            "Unable to complete payment."
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

        PAPPRITO_POS.processing =
            false;


        if (payButton) {

            payButton.disabled =
                false;

            payButton.innerHTML =
                originalButtonHTML ||
                `

                    <i class="fa-solid fa-check"></i>

                    PAY

                `;

            updatePOSPayment();

        }

    }

}


/* ==========================================================
   UPDATE PRODUCT STOCKS
========================================================== */

async function updatePOSProductStocks() {

    const updates = {};


    for (
        const item of
        PAPPRITO_POS.cart
    ) {

        const product =
            PAPPRITO_POS.products[
                item.productId
            ];


        if (!product) {

            continue;

        }


        const currentStock =
            getPOSProductStock(
                product
            );


        if (
            currentStock === null
        ) {

            continue;

        }


        const newStock =
            Math.max(
                0,
                currentStock -
                item.quantity
            );


        updates[
            `products/${item.productId}/stock`
        ] =
            newStock;


        updates[
            `products/${item.productId}/updatedAt`
        ] =
            firebase.database.ServerValue.TIMESTAMP;

    }


    if (
        Object.keys(updates).length === 0
    ) {

        return;

    }


    await db
        .ref()
        .update(
            updates
        );

}


/* ==========================================================
   RECEIPT ITEM ROW
========================================================== */

function buildPOSReceiptItemRows(items) {

    return (
        items || []
    )
    .map(
        function (item, index) {

            const quantity =
                posNumber(
                    item.quantity
                );

            const total =
                posNumber(
                    item.total
                );


            return `

                <div
                    class="receipt-item-row"
                    style="
                        display:grid;
                        grid-template-columns:30px minmax(0,1fr) 45px 85px;
                        gap:5px;
                        align-items:start;
                        padding:7px 0;
                        border-bottom:1px dashed #ccc;
                        font-size:11px;
                    ">


                    <div
                        style="
                            text-align:center;
                        ">

                        ${index + 1}

                    </div>


                    <div
                        style="
                            font-weight:700;
                            overflow-wrap:anywhere;
                        ">

                        ${posEscape(
                            item.name
                        )}

                    </div>


                    <div
                        style="
                            text-align:center;
                            font-weight:700;
                        ">

                        ${quantity}

                    </div>


                    <div
                        style="
                            text-align:right;
                            font-weight:700;
                        ">

                        ${posMoney(total)}

                    </div>


                </div>

            `;

        }
    )
    .join("");

}


/* ==========================================================
   RECEIPT HTML
========================================================== */

function buildPOSReceiptHTML(sale) {

    const items =
        buildPOSReceiptItemRows(
            sale.items
        );


    return `

        <div
            class="papprito-receipt"
            style="
                max-width:380px;
                margin:auto;
                font-family:Arial,sans-serif;
                color:#222;
            ">


            <!-- ============================================
                 HEADER
            ============================================= -->

            <div
                style="
                    text-align:center;
                    padding-bottom:10px;
                ">

                <div
                    style="
                        font-size:25px;
                        font-weight:900;
                        color:#c8102e;
                    ">

                    PAPPRITO

                </div>


                <div
                    style="
                        font-size:12px;
                        font-weight:700;
                    ">

                    RESTAURANT

                </div>

            </div>


            <hr>


            <!-- ============================================
                 ORDER INFORMATION
            ============================================= -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    font-size:12px;
                    margin-bottom:5px;
                ">

                <span>
                    Order
                </span>

                <strong>
                    ${posEscape(
                        sale.orderNumber
                    )}
                </strong>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    font-size:12px;
                    margin-bottom:5px;
                ">

                <span>
                    Customer
                </span>

                <strong>
                    ${posEscape(
                        sale.customer ||
                        "Walk-in Customer"
                    )}
                </strong>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    font-size:12px;
                    margin-bottom:5px;
                ">

                <span>
                    Payment
                </span>

                <strong>
                    ${posEscape(
                        sale.paymentMethod ||
                        "Cash"
                    )}
                </strong>

            </div>


            <hr>


            <!-- ============================================
                 ITEM TABLE
            ============================================= -->

            <div
                style="
                    display:grid;
                    grid-template-columns:30px minmax(0,1fr) 45px 85px;
                    gap:5px;
                    padding:7px 0;
                    border-bottom:2px solid #222;
                    font-size:10px;
                    font-weight:900;
                ">

                <div
                    style="text-align:center;">
                    SN
                </div>


                <div>
                    ITEMS
                </div>


                <div
                    style="text-align:center;">
                    QTY
                </div>


                <div
                    style="text-align:right;">
                    TOTAL
                </div>

            </div>


            ${items}


            <hr>


            <!-- ============================================
                 SUMMARY
            ============================================= -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    padding:4px 0;
                    font-size:12px;
                ">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${posMoney(
                        sale.subtotal
                    )}
                </strong>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    padding:4px 0;
                    font-size:12px;
                ">

                <span>
                    Discount
                </span>

                <strong>
                    ${posMoney(
                        sale.discount
                    )}
                </strong>

            </div>


            <!-- ============================================
                 TOTAL
            ============================================= -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:9px 0;
                    margin-top:4px;
                    border-top:2px solid #222;
                    font-size:18px;
                    font-weight:900;
                ">

                <span>
                    TOTAL
                </span>

                <strong
                    style="
                        color:#c8102e;
                    ">

                    ${posMoney(
                        sale.total
                    )}

                </strong>

            </div>


            <!-- ============================================
                 AMOUNT RECEIVED
            ============================================= -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    padding:4px 0;
                    font-size:12px;
                ">

                <span>
                    Amount Received
                </span>

                <strong>
                    ${posMoney(
                        sale.amountReceived
                    )}
                </strong>

            </div>


            <!-- ============================================
                 CHANGE — ONLY ONE
            ============================================= -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:7px 0;
                    font-size:15px;
                    font-weight:900;
                    border-top:1px dashed #aaa;
                ">

                <span>
                    CHANGE
                </span>

                <strong
                    style="
                        color:#198754;
                    ">

                    ${posMoney(
                        sale.change
                    )}

                </strong>

            </div>


            <div
                style="
                    text-align:center;
                    margin-top:18px;
                    font-weight:700;
                    font-size:12px;
                ">

                Thank you for dining with us!

            </div>


            <div
                style="
                    text-align:center;
                    margin-top:5px;
                    font-size:10px;
                    color:#777;
                ">

                PAPPRITO Restaurant POS

            </div>

        </div>

    `;

}


/* ==========================================================
   SHOW RECEIPT
========================================================== */

function showPOSReceipt(sale) {

    const content =
        posEl("posReceiptContent");


    if (content) {

        content.innerHTML =
            buildPOSReceiptHTML(
                sale
            );

    }


    const modal =
        posEl("posReceiptModal");


    if (
        modal &&
        typeof bootstrap !== "undefined"
    ) {

        const instance =
            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                );

        instance.show();

        return;

    }


    printPOSReceipt(
        sale
    );

}


/* ==========================================================
   PRINT RECEIPT
========================================================== */

function printPOSReceipt(sale) {

    if (!sale) {

        sale =
            PAPPRITO_POS.lastSale ||
            window.currentPOSReceipt;

    }


    if (!sale) {

        posStatus(
            "No receipt available."
        );

        return;

    }


    const receipt =
        buildPOSReceiptHTML(
            sale
        );


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=420,height=700"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the receipt."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                PAPPRITO Receipt
            </title>


            <style>

                @page {

                    margin: 5mm;

                }


                * {

                    box-sizing:border-box;

                }


                body {

                    margin:0;

                    padding:10px;

                    font-family:
                        Arial,
                        sans-serif;

                    font-size:12px;

                }


                @media print {

                    body {

                        width:80mm;

                        padding:0;

                    }

                }

            </style>

        </head>


        <body>

            ${receipt}


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
   REFRESH POS
========================================================== */

async function refreshPOS() {

    const refreshButton =
        posEl(
            "posRefreshProductsBtn"
        );


    const originalHTML =
        refreshButton
        ?
        refreshButton.innerHTML
        :
        "";


    try {

        if (refreshButton) {

            refreshButton.disabled =
                true;

            refreshButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

            `;

        }


        await Promise.all([

            loadPOSCategories(),

            loadPOSProducts()

        ]);


        posStatus(
            "POS data refreshed."
        );

    }

    catch (error) {

        posError(
            "Unable to refresh POS.",
            error
        );

    }

    finally {

        if (refreshButton) {

            refreshButton.disabled =
                false;

            refreshButton.innerHTML =
                originalHTML ||
                `
                    <i class="fa-solid fa-rotate"></i>
                `;

        }

    }

}


/* ==========================================================
   QUICK ENTRY
========================================================== */

function initializePOSKeypad() {

    const keys =
        document.querySelectorAll(
            ".pos-key, [data-key]"
        );


    keys.forEach(
        function (button) {

            if (
                button.dataset.posBound ===
                "true"
            ) {

                return;

            }


            button.dataset.posBound =
                "true";


            button.addEventListener(
                "click",
                function () {

                    const key =
                        button.dataset.key;


                    if (
                        key === undefined
                    ) {

                        return;

                    }


                    const amountInput =
                        posEl("posAmountReceived") ||
                        posEl("posPaymentAmount");


                    if (
                        !amountInput
                    ) {

                        return;

                    }


                    if (
                        key === "clear"
                    ) {

                        amountInput.value =
                            "";

                    }

                    else if (
                        key === "backspace"
                    ) {

                        amountInput.value =
                            amountInput.value.slice(
                                0,
                                -1
                            );

                    }

                    else {

                        amountInput.value +=
                            key;

                    }


                    updatePOSPayment();

                }
            );

        }
    );

}


/* ==========================================================
   BIND SEARCH
========================================================== */

function bindPOSSearch() {

    const search =
        posEl(
            "posProductSearch"
        );


    if (!search) {

        return;

    }


    if (
        search.dataset.posBound ===
        "true"
    ) {

        return;

    }


    search.dataset.posBound =
        "true";


    search.addEventListener(
        "input",
        function () {

            renderPOSProducts();

        }
    );

}


/* ==========================================================
   BIND REFRESH
========================================================== */

function bindPOSRefresh() {

    const button =
        posEl(
            "posRefreshProductsBtn"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.posBound ===
        "true"
    ) {

        return;

    }


    button.dataset.posBound =
        "true";


    button.addEventListener(
        "click",
        refreshPOS
    );

}


/* ==========================================================
   BIND CLEAR CART
========================================================== */

function bindPOSClear() {

    const button =
        posEl(
            "posClearCartBtn"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.posBound ===
        "true"
    ) {

        return;

    }


    button.dataset.posBound =
        "true";


    button.addEventListener(
        "click",
        function () {

            clearPOSCart(true);

        }
    );

}


/* ==========================================================
   BIND CUSTOMER
========================================================== */

function bindPOSCustomer() {

    const input =
        posEl(
            "posCustomerName"
        );


    if (!input) {

        return;

    }


    if (
        input.dataset.posBound ===
        "true"
    ) {

        return;

    }


    input.dataset.posBound =
        "true";


    input.addEventListener(
        "input",
        updatePOSCustomer
    );

}


/* ==========================================================
   BIND DISCOUNT
========================================================== */

function bindPOSDiscount() {

    const input =
        posEl("posDiscount");


    if (!input) {

        return;

    }


    if (
        input.dataset.posBound ===
        "true"
    ) {

        return;

    }


    input.dataset.posBound =
        "true";


    input.addEventListener(
        "input",
        function () {

            PAPPRITO_POS.discount =
                posNumber(
                    input.value
                );

            updatePOSSummary();

        }
    );

}


/* ==========================================================
   BIND PAYMENT AMOUNT
========================================================== */

function bindPOSPaymentInput() {

    const input =
        posEl("posAmountReceived") ||
        posEl("posPaymentAmount");


    if (!input) {

        return;

    }


    if (
        input.dataset.posBound ===
        "true"
    ) {

        return;

    }


    input.dataset.posBound =
        "true";


    input.addEventListener(
        "input",
        updatePOSPayment
    );

}


/* ==========================================================
   BIND PAYMENT METHODS
========================================================== */

function bindPOSPaymentMethods() {

    document
        .querySelectorAll(
            ".pos-payment-method-btn"
        )
        .forEach(
            function (button) {

                if (
                    button.dataset.posBound ===
                    "true"
                ) {

                    return;

                }


                button.dataset.posBound =
                    "true";


                button.addEventListener(
                    "click",
                    function () {

                        setPOSPaymentMethod(

                            button.dataset.paymentMethod ||
                            button.dataset.method ||
                            button.textContent.trim()

                        );

                    }
                );

            }
        );

}


/* ==========================================================
   BIND PAY
========================================================== */

function bindPOSPay() {

    const button =
        posEl("posPayBtn");


    if (!button) {

        return;

    }


    if (
        button.dataset.posBound ===
        "true"
    ) {

        return;

    }


    button.dataset.posBound =
        "true";


    button.addEventListener(
        "click",
        processPOSPayment
    );

}


/* ==========================================================
   BIND PRINT
========================================================== */

function bindPOSPrint() {

    const button =
        posEl("posPrintReceiptBtn") ||
        posEl("posPrintReceipt");


    if (!button) {

        return;

    }


    if (
        button.dataset.posBound ===
        "true"
    ) {

        return;

    }


    button.dataset.posBound =
        "true";


    button.addEventListener(
        "click",
        function () {

            printPOSReceipt(
                PAPPRITO_POS.lastSale
            );

        }
    );

}


/* ==========================================================
   BIND MODAL PAYMENT
========================================================== */

function bindPOSModalPayment() {

    const modalInput =
        posEl(
            "posModalAmountReceived"
        );


    const mainInput =
        posEl("posAmountReceived") ||
        posEl("posPaymentAmount");


    if (
        modalInput &&
        modalInput.dataset.posBound !==
        "true"
    ) {

        modalInput.dataset.posBound =
            "true";


        modalInput.addEventListener(
            "input",
            function () {

                const total =
                    getPOSGrandTotal();

                const payment =
                    posNumber(
                        modalInput.value
                    );

                const change =
                    Math.max(
                        0,
                        payment - total
                    );


                const changeElement =
                    posEl(
                        "posModalChange"
                    );

                if (changeElement) {

                    changeElement.textContent =
                        posMoney(change);

                }

            }
        );

    }


    const confirmButton =
        posEl(
            "posConfirmPaymentBtn"
        );


    if (
        confirmButton &&
        confirmButton.dataset.posBound !==
        "true"
    ) {

        confirmButton.dataset.posBound =
            "true";


        confirmButton.addEventListener(
            "click",
            function () {

                if (
                    modalInput &&
                    mainInput
                ) {

                    mainInput.value =
                        modalInput.value;

                }


                processPOSPayment();

            }
        );

    }

}


/* ==========================================================
   HOLD ORDER
========================================================== */

function holdPOSOrder() {

    if (
        PAPPRITO_POS.cart.length === 0
    ) {

        posStatus(
            "There is no order to hold."
        );

        return;

    }


    const holdData = {

        orderNumber:
            generatePOSOrderNumber(),

        customer:
            getPOSCustomer(),

        cart:
            PAPPRITO_POS.cart,

        discount:
            getPOSDiscount(),

        savedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        "papprito_pos_held_order",
        JSON.stringify(
            holdData
        )
    );


    posStatus(
        "Order placed on hold."
    );


    clearPOSCart(false);

}


/* ==========================================================
   RECALL ORDER
========================================================== */

function recallPOSOrder() {

    const stored =
        localStorage.getItem(
            "papprito_pos_held_order"
        );


    if (!stored) {

        posStatus(
            "No held order found."
        );

        return;

    }


    try {

        const holdData =
            JSON.parse(
                stored
            );


        PAPPRITO_POS.cart =
            Array.isArray(
                holdData.cart
            )
            ?
            holdData.cart
            :
            [];


        PAPPRITO_POS.discount =
            posNumber(
                holdData.discount
            );


        const customerInput =
            posEl("posCustomerName");

        if (customerInput) {

            customerInput.value =
                holdData.customer || "";

        }


        const discountInput =
            posEl("posDiscount");

        if (discountInput) {

            discountInput.value =
                PAPPRITO_POS.discount || "";

        }


        localStorage.removeItem(
            "papprito_pos_held_order"
        );


        renderPOSCart();

        updatePOSSummary();

        posStatus(
            "Held order recalled."
        );

    }

    catch (error) {

        console.error(
            "Recall order error:",
            error
        );

        posStatus(
            "Unable to recall held order."
        );

    }

}


/* ==========================================================
   BIND HOLD / RECALL
========================================================== */

function bindPOSHoldRecall() {

    const hold =
        posEl("posHoldBtn");


    if (
        hold &&
        hold.dataset.posBound !==
        "true"
    ) {

        hold.dataset.posBound =
            "true";

        hold.addEventListener(
            "click",
            holdPOSOrder
        );

    }


    const recall =
        posEl("posRecallBtn");


    if (
        recall &&
        recall.dataset.posBound !==
        "true"
    ) {

        recall.dataset.posBound =
            "true";

        recall.addEventListener(
            "click",
            recallPOSOrder
        );

    }

}


/* ==========================================================
   FULLSCREEN
========================================================== */

function togglePOSFullscreen() {

    if (
        !document.fullscreenElement
    ) {

        if (
            document.documentElement.requestFullscreen
        ) {

            document.documentElement
                .requestFullscreen();

        }

    }

    else {

        if (
            document.exitFullscreen
        ) {

            document.exitFullscreen();

        }

    }

}


/* ==========================================================
   BIND FULLSCREEN
========================================================== */

function bindPOSFullscreen() {

    const button =
        posEl("posFullscreenBtn");


    if (
        !button ||
        button.dataset.posBound ===
        "true"
    ) {

        return;

    }


    button.dataset.posBound =
        "true";


    button.addEventListener(
        "click",
        togglePOSFullscreen
    );

}


/* ==========================================================
   DATE / TIME
========================================================== */

function updatePOSDateTime() {

    const element =
        posEl("posDateTime");


    if (!element) {

        return;

    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleString(
            "en-PH",
            {

                year:
                    "numeric",

                month:
                    "short",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"

            }
        );

}


/* ==========================================================
   START DATE / TIME
========================================================== */

function startPOSClock() {

    updatePOSDateTime();


    if (
        window.pappritoPOSClock
    ) {

        clearInterval(
            window.pappritoPOSClock
        );

    }


    window.pappritoPOSClock =
        setInterval(
            updatePOSDateTime,
            1000
        );

}


/* ==========================================================
   BIND ALL EVENTS
========================================================== */

function bindPOSEvents() {

    bindPOSSearch();

    bindPOSRefresh();

    bindPOSClear();

    bindPOSCustomer();

    bindPOSDiscount();

    bindPOSPaymentInput();

    bindPOSPaymentMethods();

    bindPOSPay();

    bindPOSPrint();

    bindPOSModalPayment();

    bindPOSHoldRecall();

    bindPOSFullscreen();

    initializePOSKeypad();

}


/* ==========================================================
   INITIALIZE POS
========================================================== */

async function initializePOS() {

    /*
       Allow initialization after a page navigation/reload.
    */

    PAPPRITO_POS.initialized =
        false;


    console.log(
        "=========================================="
    );

    console.log(
        "PAPPRITO POS V2 INITIALIZING..."
    );

    console.log(
        "=========================================="
    );


    if (!posFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        posStatus(
            "Firebase is not ready."
        );

        return;

    }


    try {

        bindPOSEvents();

        startPOSClock();

        updatePOSOrderNumber();


        await Promise.all([

            loadPOSCategories(),

            loadPOSProducts()

        ]);


        renderPOSCategories();

        renderPOSProducts();

        renderPOSCart();

        updatePOSSummary();

        updatePOSPayment();


        PAPPRITO_POS.initialized =
            true;


        console.log(
            "=========================================="
        );

        console.log(
            "PAPPRITO POS V2 READY."
        );

        console.log(
            "Products:",
            Object.keys(
                PAPPRITO_POS.products
            ).length
        );

        console.log(
            "Categories:",
            Object.keys(
                PAPPRITO_POS.categories
            ).length
        );

        console.log(
            "=========================================="
        );

    }

    catch (error) {

        console.error(
            "PAPPRITO POS INITIALIZATION ERROR:",
            error
        );


        posStatus(
            "Unable to initialize POS."
        );

    }

}


/* ==========================================================
   GLOBAL EXPORTS
========================================================== */

window.PAPPRITO_POS =
    PAPPRITO_POS;

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

window.showPOSReceipt =
    showPOSReceipt;

window.holdPOSOrder =
    holdPOSOrder;

window.recallPOSOrder =
    recallPOSOrder;

window.togglePOSFullscreen =
    togglePOSFullscreen;


/* ==========================================================
   AUTO INITIALIZE
========================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePOS,
        {
            once: true
        }
    );

}

else {

    initializePOS();

}


console.log(
    "PAPPRITO POS V2 ENGINE LOADED."
);

console.log(
    "Cart format: SN | ITEMS | QTY | TOTAL"
);

console.log(
    "Receipt format: SN | ITEMS | QTY | TOTAL"
);

console.log(
    "Payment format: TOTAL | AMOUNT RECEIVED | CHANGE"
);
