/* ==========================================================
   PAPPRITO ERP
   POS V3 — FRESH POS ENGINE
   File:
   assets/js/pos/pos.js

   FEATURES
   ----------------------------------------------------------
   - Firebase Realtime Database
   - Product Loading
   - Category Loading
   - Product Search
   - Category Filtering
   - Cart
   - SN | ITEMS | QTY | TOTAL
   - Quantity Controls
   - Discount
   - Tax
   - Payment Method
   - Amount Received
   - ONE Change
   - Save Sale
   - Stock Deduction
   - Hold Order
   - Recall Order
   - Receipt
   - Print Receipt
   - Refresh
   - Order Number
========================================================== */

"use strict";


/* ==========================================================
   GLOBAL POS STATE
========================================================== */

const POS_STATE = {

    products: [],

    categories: [],

    filteredProducts: [],

    cart: [],

    selectedCategory: "all",

    searchTerm: "",

    paymentMethod: "Cash",

    customerName: "Walk-in Customer",

    discount: 0,

    tax: 0,

    amountReceived: 0,

    change: 0,

    currentOrderNumber: "",

    heldOrders: [],

    processingPayment: false,

    initialized: false

};


/* ==========================================================
   FIREBASE REFERENCES
========================================================== */

let POS_DB = null;


/* ==========================================================
   CONFIG
========================================================== */

const POS_CONFIG = {

    productsPath:
        "products",

    categoriesPath:
        "categories",

    salesPath:
        "sales",

    heldOrdersPath:
        "posHeldOrders",

    stockFieldCandidates: [

        "stock",

        "quantity",

        "qty",

        "inventory",

        "currentStock"

    ],

    productNameFields: [

        "name",

        "productName",

        "itemName",

        "title"

    ],

    productPriceFields: [

        "price",

        "sellingPrice",

        "salePrice",

        "unitPrice"

    ],

    productCategoryFields: [

        "category",

        "categoryName",

        "categoryId"

    ],

    productImageFields: [

        "image",

        "imageUrl",

        "photo",

        "photoURL",

        "imageURL"

    ]

};


/* ==========================================================
   DOM HELPERS
========================================================== */

function posEl(id) {

    return document.getElementById(id);

}


function posQuery(selector) {

    return document.querySelector(selector);

}


function posQueryAll(selector) {

    return document.querySelectorAll(selector);

}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function posNumber(value, fallback = 0) {

    const number =
        Number(value);

    if (
        Number.isFinite(number)
    ) {

        return number;

    }

    return fallback;

}


/* ==========================================================
   FORMAT MONEY
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


/* ==========================================================
   GET FIRST AVAILABLE FIELD
========================================================== */

function getFirstField(
    object,
    fields,
    fallback = ""
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return fallback;

    }


    for (
        const field of fields
    ) {

        if (
            object[field] !== undefined &&
            object[field] !== null &&
            object[field] !== ""
        ) {

            return object[field];

        }

    }


    return fallback;

}


/* ==========================================================
   NORMALIZE PRODUCT
========================================================== */

function normalizeProduct(
    id,
    data
) {

    const product =
        data || {};


    const name =
        getFirstField(
            product,
            POS_CONFIG.productNameFields,
            "Unnamed Product"
        );


    const price =
        posNumber(
            getFirstField(
                product,
                POS_CONFIG.productPriceFields,
                0
            )
        );


    const category =
        getFirstField(
            product,
            POS_CONFIG.productCategoryFields,
            "Uncategorized"
        );


    const image =
        getFirstField(
            product,
            POS_CONFIG.productImageFields,
            ""
        );


    let stock =
        null;


    for (
        const field of
        POS_CONFIG.stockFieldCandidates
    ) {

        if (
            product[field] !== undefined &&
            product[field] !== null &&
            product[field] !== ""
        ) {

            stock =
                posNumber(
                    product[field]
                );

            break;

        }

    }


    return {

        id,

        ...product,

        name:
            String(name),

        price,

        category:
            String(category),

        image:
            String(image),

        stock

    };

}


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategory(
    id,
    data
) {

    const category =
        data || {};


    let name =
        "";


    if (
        typeof data === "string"
    ) {

        name =
            data;

    }

    else {

        name =
            getFirstField(
                category,
                [
                    "name",
                    "categoryName",
                    "title",
                    "label"
                ],
                id
            );

    }


    return {

        id,

        name:
            String(name)

    };

}


/* ==========================================================
   FIREBASE READY
========================================================== */

function initializePOSFirebase() {

    try {

        if (
            typeof firebase ===
            "undefined"
        ) {

            throw new Error(
                "Firebase is not loaded. Load Firebase before pos.js."
            );

        }


        if (
            !firebase.apps ||
            !firebase.apps.length
        ) {

            throw new Error(
                "Firebase has not been initialized."
            );

        }


        POS_DB =
            firebase.database();


        return true;

    }

    catch (error) {

        console.error(
            "POS Firebase initialization error:",
            error
        );


        showPOSStatus(
            error.message,
            "error"
        );


        return false;

    }

}


/* ==========================================================
   STATUS
========================================================== */

let posStatusTimer = null;


function showPOSStatus(
    message,
    type = "info"
) {

    const status =
        posEl("posStatus");


    if (!status) {

        return;

    }


    status.textContent =
        message;


    status.classList.add(
        "show"
    );


    if (
        type === "error"
    ) {

        status.style.background =
            "#b42318";

    }

    else if (
        type === "success"
    ) {

        status.style.background =
            "#087443";

    }

    else {

        status.style.background =
            "#20252b";

    }


    clearTimeout(
        posStatusTimer
    );


    posStatusTimer =
        setTimeout(
            function() {

                status.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ==========================================================
   GENERATE ORDER NUMBER
========================================================== */

function generateOrderNumber() {

    const now =
        new Date();


    const date =
        now.toISOString()
        .slice(
            0,
            10
        )
        .replace(
            /-/g,
            ""
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


    const random =
        Math.floor(
            Math.random() * 900
        ) + 100;


    return (
        "POS-" +
        date +
        "-" +
        time +
        "-" +
        random
    );

}


/* ==========================================================
   SET ORDER NUMBER
========================================================== */

function setNewOrderNumber() {

    POS_STATE.currentOrderNumber =
        generateOrderNumber();


    const element =
        posEl("posOrderNumber");


    if (element) {

        element.textContent =
            POS_STATE.currentOrderNumber;

    }

}


/* ==========================================================
   LOAD PRODUCTS
========================================================== */

async function loadPOSProducts() {

    if (!POS_DB) {

        return;

    }


    const productsContainer =
        posEl("posProducts");


    if (productsContainer) {

        productsContainer.innerHTML = `

            <div class="pos-products-loading">

                <div
                    class="spinner-border text-danger">
                </div>

                <span>
                    Loading products...
                </span>

            </div>

        `;

    }


    try {

        const snapshot =
            await POS_DB
                .ref(
                    POS_CONFIG.productsPath
                )
                .once(
                    "value"
                );


        const data =
            snapshot.val();


        const products = [];


        if (
            data &&
            typeof data === "object"
        ) {

            Object.entries(
                data
            ).forEach(
                function([
                    id,
                    value
                ]) {

                    products.push(
                        normalizeProduct(
                            id,
                            value
                        )
                    );

                }
            );

        }


        POS_STATE.products =
            products;


        POS_STATE.filteredProducts =
            products;


        renderPOSProducts();


        console.log(
            "PAPPRITO POS products loaded:",
            products.length
        );

    }

    catch (error) {

        console.error(
            "Unable to load POS products:",
            error
        );


        if (productsContainer) {

            productsContainer.innerHTML = `

                <div class="pos-products-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Unable to load products
                    </strong>

                    <span>
                        ${posEscape(
                            error.message
                        )}
                    </span>

                </div>

            `;

        }


        showPOSStatus(
            "Unable to load products.",
            "error"
        );

    }

}


/* ==========================================================
   LOAD CATEGORIES
========================================================== */

async function loadPOSCategories() {

    if (!POS_DB) {

        return;

    }


    const container =
        posEl("posCategories");


    if (container) {

        container.innerHTML = `

            <div class="pos-products-loading">

                <div
                    class="spinner-border text-danger">
                </div>

                <span>
                    Loading categories...
                </span>

            </div>

        `;

    }


    try {

        const snapshot =
            await POS_DB
                .ref(
                    POS_CONFIG.categoriesPath
                )
                .once(
                    "value"
                );


        const data =
            snapshot.val();


        const categories = [];


        if (
            data &&
            typeof data === "object"
        ) {

            Object.entries(
                data
            ).forEach(
                function([
                    id,
                    value
                ]) {

                    categories.push(
                        normalizeCategory(
                            id,
                            value
                        )
                    );

                }
            );

        }


        POS_STATE.categories =
            categories;


        renderPOSCategories();


        console.log(
            "PAPPRITO POS categories loaded:",
            categories.length
        );

    }

    catch (error) {

        console.error(
            "Unable to load POS categories:",
            error
        );


        renderPOSCategories();


        showPOSStatus(
            "Unable to load categories.",
            "error"
        );

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


    let html = "";


    html += `

        <button
            type="button"
            class="pos-category-btn ${
                POS_STATE.selectedCategory === "all"
                    ? "active"
                    : ""
            }"
            data-category="all">

            <i class="fa-solid fa-border-all"></i>

            <span>
                All Products
            </span>

        </button>

    `;


    POS_STATE.categories.forEach(
        function(category) {

            const active =
                String(
                    POS_STATE.selectedCategory
                ).toLowerCase() ===
                String(
                    category.id
                ).toLowerCase() ||
                String(
                    POS_STATE.selectedCategory
                ).toLowerCase() ===
                String(
                    category.name
                ).toLowerCase();


            html += `

                <button
                    type="button"
                    class="
                        pos-category-btn
                        ${active ? "active" : ""}
                    "
                    data-category="${posEscape(
                        category.id
                    )}"
                    data-category-name="${posEscape(
                        category.name
                    )}">

                    <i class="fa-solid fa-layer-group"></i>

                    <span>
                        ${posEscape(
                            category.name
                        )}
                    </span>

                </button>

            `;

        }
    );


    container.innerHTML =
        html;


    bindCategoryButtons();

}


/* ==========================================================
   CATEGORY BUTTONS
========================================================== */

function bindCategoryButtons() {

    const buttons =
        posQueryAll(
            ".pos-category-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const categoryId =
                        button.dataset.category;


                    POS_STATE.selectedCategory =
                        categoryId;


                    filterPOSProducts();


                    posQueryAll(
                        ".pos-category-btn"
                    )
                    .forEach(
                        function(item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* ==========================================================
   FILTER PRODUCTS
========================================================== */

function filterPOSProducts() {

    const search =
        String(
            POS_STATE.searchTerm
        )
        .trim()
        .toLowerCase();


    const category =
        String(
            POS_STATE.selectedCategory
        )
        .trim()
        .toLowerCase();


    POS_STATE.filteredProducts =
        POS_STATE.products.filter(
            function(product) {

                const productName =
                    String(
                        product.name
                    )
                    .toLowerCase();


                const productCategory =
                    String(
                        product.category
                    )
                    .toLowerCase();


                const categoryMatch =
                    category === "all" ||
                    category === "" ||
                    productCategory === category ||
                    productCategory.includes(
                        category
                    );


                const searchMatch =
                    !search ||
                    productName.includes(
                        search
                    ) ||
                    productCategory.includes(
                        search
                    );


                return (
                    categoryMatch &&
                    searchMatch
                );

            }
        );


    renderPOSProducts();

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


    const products =
        POS_STATE.filteredProducts;


    if (
        !products.length
    ) {

        container.innerHTML = `

            <div class="pos-products-empty">

                <i class="fa-solid fa-box-open"></i>

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


    let html = "";


    products.forEach(
        function(product) {

            const image =
                product.image;


            const imageHTML =
                image

                    ? `

                        <img
                            src="${posEscape(
                                image
                            )}"
                            class="pos-product-image"
                            alt="${posEscape(
                                product.name
                            )}"
                            loading="lazy"
                            onerror="
                                this.style.display='none';
                            "
                        >

                    `

                    : `

                        <div
                            class="pos-product-image
                                   d-flex
                                   align-items-center
                                   justify-content-center">

                            <i
                                class="
                                    fa-solid
                                    fa-utensils
                                    text-secondary
                                    fs-3
                                "
                            ></i>

                        </div>

                    `;


            let stockHTML = "";


            if (
                product.stock !== null
            ) {

                stockHTML = `

                    <div class="pos-product-stock">

                        Stock:
                        ${posEscape(
                            product.stock
                        )}

                    </div>

                `;

            }


            html += `

                <article
                    class="pos-product-card"
                    data-product-id="${posEscape(
                        product.id
                    )}">

                    ${imageHTML}

                    <div class="pos-product-info">

                        <div
                            class="pos-product-name">

                            ${posEscape(
                                product.name
                            )}

                        </div>

                        <div
                            class="pos-product-price">

                            ${posMoney(
                                product.price
                            )}

                        </div>

                        ${stockHTML}

                    </div>

                </article>

            `;

        }
    );


    container.innerHTML =
        html;


    bindProductCards();

}


/* ==========================================================
   PRODUCT CARD CLICK
========================================================== */

function bindProductCards() {

    const cards =
        posQueryAll(
            ".pos-product-card"
        );


    cards.forEach(
        function(card) {

            card.addEventListener(
                "click",
                function() {

                    const productId =
                        card.dataset.productId;


                    addProductToCart(
                        productId
                    );

                }
            );

        }
    );

}


/* ==========================================================
   FIND PRODUCT
========================================================== */

function findPOSProduct(
    productId
) {

    return POS_STATE.products.find(
        function(product) {

            return String(
                product.id
            ) === String(
                productId
            );

        }
    );

}


/* ==========================================================
   ADD PRODUCT TO CART
========================================================== */

function addProductToCart(
    productId
) {

    const product =
        findPOSProduct(
            productId
        );


    if (!product) {

        showPOSStatus(
            "Product not found.",
            "error"
        );

        return;

    }


    if (
        product.stock !== null &&
        product.stock <= 0
    ) {

        showPOSStatus(
            product.name +
            " is out of stock.",
            "error"
        );

        return;

    }


    const existing =
        POS_STATE.cart.find(
            function(item) {

                return String(
                    item.productId
                ) === String(
                    productId
                );

            }
        );


    if (existing) {

        if (
            product.stock !== null &&
            existing.qty >= product.stock
        ) {

            showPOSStatus(
                "Available stock reached.",
                "error"
            );

            return;

        }


        existing.qty += 1;

    }

    else {

        POS_STATE.cart.push({

            productId:
                product.id,

            name:
                product.name,

            price:
                product.price,

            category:
                product.category,

            qty:
                1

        });

    }


    renderPOSCart();

    updatePOSTotals();

    showPOSStatus(
        product.name +
        " added.",
        "success"
    );

}


/* ==========================================================
   CHANGE QUANTITY
========================================================== */

function changeCartQuantity(
    productId,
    amount
) {

    const item =
        POS_STATE.cart.find(
            function(cartItem) {

                return String(
                    cartItem.productId
                ) === String(
                    productId
                );

            }
        );


    if (!item) {

        return;

    }


    const product =
        findPOSProduct(
            productId
        );


    const newQty =
        item.qty +
        amount;


    if (
        newQty <= 0
    ) {

        removeCartItem(
            productId
        );

        return;

    }


    if (
        product &&
        product.stock !== null &&
        newQty > product.stock
    ) {

        showPOSStatus(
            "Available stock reached.",
            "error"
        );

        return;

    }


    item.qty =
        newQty;


    renderPOSCart();

    updatePOSTotals();

}


/* ==========================================================
   REMOVE CART ITEM
========================================================== */

function removeCartItem(
    productId
) {

    POS_STATE.cart =
        POS_STATE.cart.filter(
            function(item) {

                return String(
                    item.productId
                ) !== String(
                    productId
                );

            }
        );


    renderPOSCart();

    updatePOSTotals();

}


/* ==========================================================
   CLEAR CART
========================================================== */

function clearPOSCart(
    askConfirmation = true
) {

    if (
        !POS_STATE.cart.length
    ) {

        return;

    }


    if (
        askConfirmation
    ) {

        const confirmed =
            window.confirm(
                "Clear the current order?"
            );


        if (!confirmed) {

            return;

        }

    }


    POS_STATE.cart = [];

    POS_STATE.discount = 0;

    POS_STATE.tax = 0;

    POS_STATE.amountReceived = 0;

    POS_STATE.change = 0;

    const amount =
        posEl(
            "posPaymentAmount"
        );


    if (amount) {

        amount.value =
            "";

    }


    const customer =
        posEl(
            "posCustomerName"
        );


    if (customer) {

        customer.value =
            "";

    }


    setNewOrderNumber();

    renderPOSCart();

    updatePOSTotals();

    showPOSStatus(
        "Order cleared.",
        "info"
    );

}


/* ==========================================================
   CART TOTAL
========================================================== */

function calculateCartSubtotal() {

    return POS_STATE.cart.reduce(
        function(total, item) {

            return (
                total +
                (
                    posNumber(
                        item.price
                    ) *
                    posNumber(
                        item.qty
                    )
                )
            );

        },
        0
    );

}


/* ==========================================================
   CALCULATE GRAND TOTAL
========================================================== */

function calculateGrandTotal() {

    const subtotal =
        calculateCartSubtotal();


    const discount =
        Math.max(
            0,
            posNumber(
                POS_STATE.discount
            )
        );


    const tax =
        Math.max(
            0,
            posNumber(
                POS_STATE.tax
            )
        );


    return Math.max(
        0,
        subtotal -
        discount +
        tax
    );

}


/* ==========================================================
   UPDATE TOTALS
========================================================== */

function updatePOSTotals() {

    const subtotal =
        calculateCartSubtotal();


    const discount =
        posNumber(
            POS_STATE.discount
        );


    const tax =
        posNumber(
            POS_STATE.tax
        );


    const total =
        calculateGrandTotal();


    const subtotalElement =
        posEl(
            "posSubtotal"
        );


    const discountElement =
        posEl(
            "posDiscountAmount"
        );


    const taxElement =
        posEl(
            "posTax"
        );


    const totalElement =
        posEl(
            "posGrandTotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            posMoney(
                subtotal
            );

    }


    if (discountElement) {

        discountElement.textContent =
            posMoney(
                discount
            );

    }


    if (taxElement) {

        taxElement.textContent =
            posMoney(
                tax
            );

    }


    if (totalElement) {

        totalElement.textContent =
            posMoney(
                total
            );

    }


    calculateAndRenderChange();

}


/* ==========================================================
   RENDER CART
========================================================== */

function renderPOSCart() {

    const cart =
        posEl("posCart");


    if (!cart) {

        return;

    }


    if (
        !POS_STATE.cart.length
    ) {

        cart.innerHTML = `

            <div class="pos-empty-cart">

                <div class="pos-empty-icon">

                    <i
                        class="fa-solid fa-cart-shopping">
                    </i>

                </div>

                <strong>
                    No Items
                </strong>

                <span>
                    Select a product to start
                </span>

            </div>

        `;

        return;

    }


    let html = "";


    html += `

        <div class="pos-cart-header">

            <div class="cart-col-sn">
                SN
            </div>

            <div class="cart-col-items">
                ITEMS
            </div>

            <div class="cart-col-qty">
                QTY
            </div>

            <div class="cart-col-total">
                TOTAL
            </div>

        </div>

    `;


    POS_STATE.cart.forEach(
        function(item, index) {

            const lineTotal =
                posNumber(
                    item.price
                ) *
                posNumber(
                    item.qty
                );


            html += `

                <div
                    class="pos-cart-item"
                    data-product-id="${posEscape(
                        item.productId
                    )}">

                    <div
                        class="pos-cart-sn">

                        ${index + 1}

                    </div>


                    <div
                        class="pos-cart-item-details">

                        <div
                            class="pos-cart-item-name"
                            title="${posEscape(
                                item.name
                            )}">

                            ${posEscape(
                                item.name
                            )}

                        </div>


                        <div
                            class="pos-cart-item-price">

                            ${posMoney(
                                item.price
                            )}
                            / item

                        </div>


                        <div
                            class="pos-cart-item-category">

                            ${posEscape(
                                item.category
                            )}

                        </div>

                    </div>


                    <div
                        class="pos-cart-qty-area">

                        <div
                            class="pos-cart-qty">

                            ${item.qty}

                        </div>


                        <div
                            class="pos-cart-controls">


                            <button
                                type="button"
                                class="cart-minus"
                                data-product-id="${posEscape(
                                    item.productId
                                )}"
                                title="Decrease">

                                <i
                                    class="fa-solid fa-minus">
                                </i>

                            </button>


                            <button
                                type="button"
                                class="cart-plus"
                                data-product-id="${posEscape(
                                    item.productId
                                )}"
                                title="Increase">

                                <i
                                    class="fa-solid fa-plus">
                                </i>

                            </button>


                            <button
                                type="button"
                                class="
                                    cart-remove
                                "
                                data-product-id="${posEscape(
                                    item.productId
                                )}"
                                title="Remove">

                                <i
                                    class="
                                        fa-solid
                                        fa-xmark
                                    ">
                                </i>

                            </button>


                        </div>

                    </div>


                    <div
                        class="pos-cart-item-total">

                        ${posMoney(
                            lineTotal
                        )}

                    </div>

                </div>

            `;

        }
    );


    cart.innerHTML =
        html;


    bindCartControls();

}


/* ==========================================================
   CART CONTROLS
========================================================== */

function bindCartControls() {

    posQueryAll(
        ".cart-minus"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    changeCartQuantity(
                        button.dataset.productId,
                        -1
                    );

                }
            );

        }
    );


    posQueryAll(
        ".cart-plus"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    changeCartQuantity(
                        button.dataset.productId,
                        1
                    );

                }
            );

        }
    );


    posQueryAll(
        ".cart-remove"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    removeCartItem(
                        button.dataset.productId
                    );

                }
            );

        }
    );

}


/* ==========================================================
   PAYMENT METHOD
========================================================== */

function setPaymentMethod(
    method
) {

    POS_STATE.paymentMethod =
        method;


    posQueryAll(
        ".pos-payment-method-btn"
    )
    .forEach(
        function(button) {

            button.classList.toggle(
                "active",
                button.dataset.method ===
                method
            );

        }
    );


    calculateAndRenderChange();

}


/* ==========================================================
   CALCULATE CHANGE
========================================================== */

function calculateAndRenderChange() {

    const total =
        calculateGrandTotal();


    const amountElement =
        posEl(
            "posPaymentAmount"
        );


    const received =
        amountElement
            ? posNumber(
                amountElement.value
            )
            : posNumber(
                POS_STATE.amountReceived
            );


    POS_STATE.amountReceived =
        received;


    const change =
        received -
        total;


    POS_STATE.change =
        Math.max(
            0,
            change
        );


    const changeElement =
        posEl(
            "posChange"
        );


    if (changeElement) {

        changeElement.textContent =
            posMoney(
                POS_STATE.change
            );

    }


    return {

        total,

        received,

        change

    };

}


/* ==========================================================
   PAYMENT VALIDATION
========================================================== */

function validatePayment() {

    if (
        !POS_STATE.cart.length
    ) {

        return {

            valid:
                false,

            message:
                "Please add at least one item."

        };

    }


    const total =
        calculateGrandTotal();


    const amountElement =
        posEl(
            "posPaymentAmount"
        );


    const received =
        amountElement
            ? posNumber(
                amountElement.value
            )
            : 0;


    if (
        POS_STATE.paymentMethod ===
        "Cash"
    ) {

        if (
            received < total
        ) {

            return {

                valid:
                    false,

                message:
                    "Amount received is not enough."

            };

        }

    }


    return {

        valid:
            true,

        total,

        received,

        change:
            Math.max(
                0,
                received - total
            )

    };

}


/* ==========================================================
   PREPARE SALE DATA
========================================================== */

function buildSaleData() {

    const subtotal =
        calculateCartSubtotal();


    const discount =
        posNumber(
            POS_STATE.discount
        );


    const tax =
        posNumber(
            POS_STATE.tax
        );


    const grandTotal =
        calculateGrandTotal();


    const customerElement =
        posEl(
            "posCustomerName"
        );


    const customerName =
        customerElement &&
        customerElement.value.trim()

            ? customerElement.value.trim()

            : "Walk-in Customer";


    const paymentElement =
        posEl(
            "posPaymentAmount"
        );


    const amountReceived =
        paymentElement
            ? posNumber(
                paymentElement.value
            )
            : POS_STATE.amountReceived;


    const change =
        Math.max(
            0,
            amountReceived -
            grandTotal
        );


    const items = {};


    POS_STATE.cart.forEach(
        function(item, index) {

            const itemKey =
                String(
                    index + 1
                );


            items[itemKey] = {

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
                        item.qty
                    ),

                total:
                    posNumber(
                        item.price
                    ) *
                    posNumber(
                        item.qty
                    )

            };

        }
    );


    return {

        orderNumber:
            POS_STATE.currentOrderNumber,

        customerName,

        paymentMethod:
            POS_STATE.paymentMethod,

        items,

        subtotal,

        discount,

        tax,

        grandTotal,

        amountReceived,

        change,

        status:
            "Paid",

        source:
            "PAPPRITO POS",

        createdAt:
            firebase.database.ServerValue.TIMESTAMP

    };

}


/* ==========================================================
   SAVE SALE
========================================================== */

async function savePOSSale(
    saleData
) {

    if (!POS_DB) {

        throw new Error(
            "Firebase database is not available."
        );

    }


    const saleRef =
        POS_DB
            .ref(
                POS_CONFIG.salesPath
            )
            .push();


    saleData.id =
        saleRef.key;


    await saleRef.set(
        saleData
    );


    return saleRef.key;

}


/* ==========================================================
   UPDATE PRODUCT STOCK
========================================================== */

async function updateProductStockAfterSale() {

    if (!POS_DB) {

        return;

    }


    const updates = {};


    POS_STATE.cart.forEach(
        function(item) {

            const product =
                findPOSProduct(
                    item.productId
                );


            if (!product) {

                return;

            }


            if (
                product.stock === null
            ) {

                return;

            }


            const currentStock =
                posNumber(
                    product.stock
                );


            const newStock =
                Math.max(
                    0,
                    currentStock -
                    posNumber(
                        item.qty
                    )
                );


            let stockField =
                null;


            for (
                const field of
                POS_CONFIG.stockFieldCandidates
            ) {

                if (
                    product[field] !== undefined &&
                    product[field] !== null
                ) {

                    stockField =
                        field;

                    break;

                }

            }


            if (!stockField) {

                stockField =
                    "stock";

            }


            updates[
                item.productId +
                "/" +
                stockField
            ] =
                newStock;

        }
    );


    if (
        Object.keys(
            updates
        ).length
    ) {

        await POS_DB
            .ref(
                POS_CONFIG.productsPath
            )
            .update(
                updates
            );

    }

}


/* ==========================================================
   COMPLETE PAYMENT
========================================================== */

async function completePOSPayment() {

    if (
        POS_STATE.processingPayment
    ) {

        return;

    }


    const validation =
        validatePayment();


    if (
        !validation.valid
    ) {

        showPOSStatus(
            validation.message,
            "error"
        );

        return;

    }


    POS_STATE.processingPayment =
        true;


    const payButton =
        posEl(
            "posPayBtn"
        );


    if (payButton) {

        payButton.disabled =
            true;


        payButton.innerHTML = `

            <span
                class="spinner-border spinner-border-sm">
            </span>

            <span>
                PROCESSING
            </span>

        `;

    }


    try {

        const sale =
            buildSaleData();


        await savePOSSale(
            sale
        );


        await updateProductStockAfterSale();


        showPOSStatus(
            "Payment completed successfully.",
            "success"
        );


        showPOSReceipt(
            sale
        );


        clearOrderAfterPayment();


        await loadPOSProducts();

    }

    catch (error) {

        console.error(
            "Payment error:",
            error
        );


        showPOSStatus(
            "Unable to complete payment: " +
            error.message,
            "error"
        );

    }

    finally {

        POS_STATE.processingPayment =
            false;


        if (payButton) {

            payButton.disabled =
                false;


            payButton.innerHTML = `

                <i
                    class="fa-solid fa-check">
                </i>

                <span>
                    PAY
                </span>

            `;

        }

    }

}


/* ==========================================================
   CLEAR ORDER AFTER PAYMENT
========================================================== */

function clearOrderAfterPayment() {

    POS_STATE.cart = [];

    POS_STATE.discount = 0;

    POS_STATE.tax = 0;

    POS_STATE.amountReceived = 0;

    POS_STATE.change = 0;


    const amount =
        posEl(
            "posPaymentAmount"
        );


    if (amount) {

        amount.value =
            "";

    }


    const customer =
        posEl(
            "posCustomerName"
        );


    if (customer) {

        customer.value =
            "";

    }


    setNewOrderNumber();

    renderPOSCart();

    updatePOSTotals();

}


/* ==========================================================
   RECEIPT DATA
========================================================== */

function buildReceiptHTML(
    sale
) {

    const items =
        sale.items || {};


    const itemEntries =
        Object.entries(
            items
        );


    let itemsHTML = "";


    itemEntries.forEach(
        function([
            key,
            item
        ], index) {

            itemsHTML += `

                <tr>

                    <td
                        style="
                            padding:5px 0;
                            vertical-align:top;
                        ">

                        ${index + 1}

                    </td>


                    <td
                        style="
                            padding:5px 4px;
                            vertical-align:top;
                        ">

                        ${posEscape(
                            item.name
                        )}

                    </td>


                    <td
                        style="
                            padding:5px 4px;
                            text-align:center;
                            vertical-align:top;
                        ">

                        ${posNumber(
                            item.quantity
                        )}

                    </td>


                    <td
                        style="
                            padding:5px 0;
                            text-align:right;
                            vertical-align:top;
                        ">

                        ${posMoney(
                            item.total
                        )}

                    </td>

                </tr>

            `;

        }
    );


    return `

        <div
            style="
                max-width:420px;
                margin:0 auto;
                background:#fff;
                color:#111;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
            ">

            <div
                style="
                    text-align:center;
                    padding-bottom:12px;
                    border-bottom:1px dashed #aaa;
                ">

                <div
                    style="
                        font-size:21px;
                        font-weight:800;
                    ">

                    PAPPRITO

                </div>


                <div
                    style="
                        font-size:11px;
                        margin-top:2px;
                    ">

                    RESTAURANT

                </div>


                <div
                    style="
                        font-size:10px;
                        margin-top:5px;
                    ">

                    SALES RECEIPT

                </div>

            </div>


            <div
                style="
                    padding:10px 0;
                    border-bottom:1px dashed #aaa;
                ">

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
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
                        margin-top:4px;
                    ">

                    <span>
                        Customer
                    </span>

                    <strong>
                        ${posEscape(
                            sale.customerName
                        )}
                    </strong>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        margin-top:4px;
                    ">

                    <span>
                        Payment
                    </span>

                    <strong>
                        ${posEscape(
                            sale.paymentMethod
                        )}
                    </strong>

                </div>

            </div>


            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                    margin-top:8px;
                ">

                <thead>

                    <tr
                        style="
                            border-bottom:1px solid #222;
                        ">

                        <th
                            style="
                                text-align:left;
                                padding:5px 0;
                            ">

                            SN

                        </th>


                        <th
                            style="
                                text-align:left;
                                padding:5px 4px;
                            ">

                            ITEMS

                        </th>


                        <th
                            style="
                                text-align:center;
                                padding:5px 4px;
                            ">

                            QTY

                        </th>


                        <th
                            style="
                                text-align:right;
                                padding:5px 0;
                            ">

                            TOTAL

                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${itemsHTML}

                </tbody>

            </table>


            <div
                style="
                    border-top:1px dashed #aaa;
                    margin-top:7px;
                    padding-top:8px;
                ">

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin:3px 0;
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
                        margin:3px 0;
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


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin:3px 0;
                    ">

                    <span>
                        Tax
                    </span>

                    <strong>
                        ${posMoney(
                            sale.tax
                        )}
                    </strong>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin-top:8px;
                        padding-top:8px;
                        border-top:2px solid #111;
                        font-size:16px;
                    ">

                    <strong>
                        TOTAL
                    </strong>

                    <strong>
                        ${posMoney(
                            sale.grandTotal
                        )}
                    </strong>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin-top:8px;
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


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin-top:4px;
                    ">

                    <span>
                        CHANGE
                    </span>

                    <strong>
                        ${posMoney(
                            sale.change
                        )}
                    </strong>

                </div>

            </div>


            <div
                style="
                    text-align:center;
                    border-top:1px dashed #aaa;
                    margin-top:12px;
                    padding-top:10px;
                    font-size:10px;
                ">

                Thank you for dining with PAPPRITO!

            </div>

        </div>

    `;

}


/* ==========================================================
   SHOW RECEIPT
========================================================== */

function showPOSReceipt(
    sale
) {

    const receipt =
        posEl(
            "posReceipt"
        );


    if (!receipt) {

        return;

    }


    receipt.innerHTML =
        buildReceiptHTML(
            sale
        );


    const modalElement =
        posEl(
            "posReceiptModal"
        );


    if (
        modalElement &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

}


/* ==========================================================
   PRINT RECEIPT
========================================================== */

function printPOSReceipt() {

    const receipt =
        posEl(
            "posReceipt"
        );


    if (!receipt) {

        return;

    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=450,height=700"
        );


    if (!printWindow) {

        showPOSStatus(
            "Please allow pop-ups to print.",
            "error"
        );

        return;

    }


    printWindow.document.open();


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

                    size:
                        80mm auto;

                    margin:
                        4mm;

                }

                html,
                body {

                    margin:
                        0;

                    padding:
                        0;

                    background:
                        #ffffff;

                }

                body {

                    width:
                        72mm;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                }

            </style>

        </head>

        <body>

            ${receipt.innerHTML}

        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.focus();


    setTimeout(
        function() {

            printWindow.print();


            setTimeout(
                function() {

                    printWindow.close();

                },
                500
            );

        },
        300
    );

}


/* ==========================================================
   HOLD ORDER
========================================================== */

function holdCurrentOrder() {

    if (
        !POS_STATE.cart.length
    ) {

        showPOSStatus(
            "There is no order to hold.",
            "error"
        );

        return;

    }


    const customerElement =
        posEl(
            "posCustomerName"
        );


    const customerName =
        customerElement &&
        customerElement.value.trim()

            ? customerElement.value.trim()

            : "Walk-in Customer";


    const heldOrder = {

        id:
            "HOLD-" +
            Date.now(),

        orderNumber:
            POS_STATE.currentOrderNumber,

        customerName,

        paymentMethod:
            POS_STATE.paymentMethod,

        discount:
            POS_STATE.discount,

        tax:
            POS_STATE.tax,

        cart:
            POS_STATE.cart.map(
                function(item) {

                    return {
                        ...item
                    };

                }
            ),

        createdAt:
            Date.now()

    };


    POS_STATE.heldOrders.push(
        heldOrder
    );


    saveHeldOrdersLocally();


    clearPOSCart(
        false
    );


    showPOSStatus(
        "Order placed on hold.",
        "success"
    );

}


/* ==========================================================
   SAVE HELD ORDERS LOCALLY
========================================================== */

function saveHeldOrdersLocally() {

    try {

        localStorage.setItem(
            "pappritoPOSHeldOrders",
            JSON.stringify(
                POS_STATE.heldOrders
            )
        );

    }

    catch (error) {

        console.warn(
            "Unable to save held orders:",
            error
        );

    }

}


/* ==========================================================
   LOAD HELD ORDERS LOCALLY
========================================================== */

function loadHeldOrdersLocally() {

    try {

        const stored =
            localStorage.getItem(
                "pappritoPOSHeldOrders"
            );


        if (!stored) {

            POS_STATE.heldOrders =
                [];

            return;

        }


        const parsed =
            JSON.parse(
                stored
            );


        if (
            Array.isArray(
                parsed
            )
        ) {

            POS_STATE.heldOrders =
                parsed;

        }

        else {

            POS_STATE.heldOrders =
                [];

        }

    }

    catch (error) {

        console.warn(
            "Unable to load held orders:",
            error
        );


        POS_STATE.heldOrders =
            [];

    }

}


/* ==========================================================
   RECALL ORDER
========================================================== */

function recallHeldOrder() {

    if (
        !POS_STATE.heldOrders.length
    ) {

        showPOSStatus(
            "No held orders available.",
            "info"
        );

        return;

    }


    let message =
        "Held Orders:\n\n";


    POS_STATE.heldOrders.forEach(
        function(order, index) {

            const total =
                order.cart.reduce(
                    function(sum, item) {

                        return (
                            sum +
                            (
                                posNumber(
                                    item.price
                                ) *
                                posNumber(
                                    item.qty
                                )
                            )
                        );

                    },
                    0
                );


            message +=
                `${index + 1}. ` +
                `${order.orderNumber} - ` +
                `${order.customerName} - ` +
                `${posMoney(total)}\n`;

        }
    );


    const selection =
        window.prompt(
            message +
            "\nEnter order number:"
        );


    if (
        selection === null
    ) {

        return;

    }


    const selected =
        selection.trim();


    const index =
        POS_STATE.heldOrders.findIndex(
            function(order, orderIndex) {

                return (
                    order.orderNumber ===
                    selected ||
                    String(
                        orderIndex + 1
                    ) ===
                    selected
                );

            }
        );


    if (
        index < 0
    ) {

        showPOSStatus(
            "Held order not found.",
            "error"
        );

        return;

    }


    if (
        POS_STATE.cart.length
    ) {

        const confirmed =
            window.confirm(
                "Current order will be replaced. Continue?"
            );


        if (!confirmed) {

            return;

        }

    }


    const order =
        POS_STATE.heldOrders[index];


    POS_STATE.cart =
        order.cart.map(
            function(item) {

                return {
                    ...item
                };

            }
        );


    POS_STATE.paymentMethod =
        order.paymentMethod ||
        "Cash";


    POS_STATE.discount =
        posNumber(
            order.discount
        );


    POS_STATE.tax =
        posNumber(
            order.tax
        );


    POS_STATE.currentOrderNumber =
        order.orderNumber ||
        generateOrderNumber();


    const orderNumber =
        posEl(
            "posOrderNumber"
        );


    if (orderNumber) {

        orderNumber.textContent =
            POS_STATE.currentOrderNumber;

    }


    const customer =
        posEl(
            "posCustomerName"
        );


    if (customer) {

        customer.value =
            order.customerName ===
            "Walk-in Customer"

                ? ""

                : order.customerName;

    }


    setPaymentMethod(
        POS_STATE.paymentMethod
    );


    POS_STATE.heldOrders.splice(
        index,
        1
    );


    saveHeldOrdersLocally();


    renderPOSCart();

    updatePOSTotals();


    showPOSStatus(
        "Held order recalled.",
        "success"
    );

}


/* ==========================================================
   SEARCH EVENTS
========================================================== */

function initializePOSSearch() {

    const search =
        posEl(
            "posProductSearch"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function() {

            POS_STATE.searchTerm =
                search.value;


            filterPOSProducts();

        }
    );

}


/* ==========================================================
   PAYMENT EVENTS
========================================================== */

function initializePOSPaymentEvents() {

    posQueryAll(
        ".pos-payment-method-btn"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    setPaymentMethod(
                        button.dataset.method
                    );

                }
            );

        }
    );


    const amount =
        posEl(
            "posPaymentAmount"
        );


    if (amount) {

        amount.addEventListener(
            "input",
            function() {

                POS_STATE.amountReceived =
                    posNumber(
                        amount.value
                    );


                calculateAndRenderChange();

            }
        );

    }


    const customer =
        posEl(
            "posCustomerName"
        );


    if (customer) {

        customer.addEventListener(
            "input",
            function() {

                POS_STATE.customerName =
                    customer.value;

            }
        );

    }


    const pay =
        posEl(
            "posPayBtn"
        );


    if (pay) {

        pay.addEventListener(
            "click",
            completePOSPayment
        );

    }


    const print =
        posEl(
            "posPrintReceipt"
        );


    if (print) {

        print.addEventListener(
            "click",
            printPOSReceipt
        );

    }


    const clear =
        posEl(
            "posClearCartBtn"
        );


    if (clear) {

        clear.addEventListener(
            "click",
            function() {

                clearPOSCart(
                    true
                );

            }
        );

    }


    const hold =
        posEl(
            "posHoldBtn"
        );


    if (hold) {

        hold.addEventListener(
            "click",
            holdCurrentOrder
        );

    }


    const recall =
        posEl(
            "posRecallBtn"
        );


    if (recall) {

        recall.addEventListener(
            "click",
            recallHeldOrder
        );

    }


    const refresh =
        posEl(
            "posRefreshProductsBtn"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            async function() {

                refresh.disabled =
                    true;


                try {

                    await Promise.all([
                        loadPOSProducts(),
                        loadPOSCategories()
                    ]);


                    showPOSStatus(
                        "Products refreshed.",
                        "success"
                    );

                }

                finally {

                    refresh.disabled =
                        false;

                }

            }
        );

    }

}


/* ==========================================================
   KEYPAD
========================================================== */

function initializePOSKeypad() {

    const keys =
        posQueryAll(
            ".pos-keypad button"
        );


    keys.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const key =
                        button.dataset.key;


                    handlePOSKeypad(
                        key
                    );

                }
            );

        }
    );

}


/* ==========================================================
   KEYPAD HANDLER
========================================================== */

function handlePOSKeypad(
    key
) {

    const input =
        posEl(
            "posPaymentAmount"
        );


    if (!input) {

        return;

    }


    if (
        key === "clear"
    ) {

        input.value =
            "";


        POS_STATE.amountReceived =
            0;


        calculateAndRenderChange();


        return;

    }


    if (
        key === "."
    ) {

        if (
            input.value.includes(
                "."
            )
        ) {

            return;

        }

    }


    input.value +=
        key;


    POS_STATE.amountReceived =
        posNumber(
            input.value
        );


    calculateAndRenderChange();

}


/* ==========================================================
   KEYBOARD SHORTCUTS
========================================================== */

function initializePOSKeyboard() {

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeOpenPOSModal();

            }


            if (
                event.key === "F2"
            ) {

                event.preventDefault();


                const search =
                    posEl(
                        "posProductSearch"
                    );


                if (search) {

                    search.focus();

                }

            }


            if (
                event.key === "F4"
            ) {

                event.preventDefault();


                holdCurrentOrder();

            }


            if (
                event.key === "F8"
            ) {

                event.preventDefault();


                completePOSPayment();

            }

        }
    );

}


/* ==========================================================
   CLOSE MODALS
========================================================== */

function closeOpenPOSModal() {

    if (
        typeof bootstrap ===
        "undefined"
    ) {

        return;

    }


    posQueryAll(
        ".modal.show"
    )
    .forEach(
        function(element) {

            const instance =
                bootstrap.Modal.getInstance(
                    element
                );


            if (instance) {

                instance.hide();

            }

        }
    );

}


/* ==========================================================
   INITIALIZE POS
========================================================== */

async function initializePOS() {

    if (
        POS_STATE.initialized
    ) {

        return;

    }


    console.log(
        "=========================================="
    );


    console.log(
        "PAPPRITO POS V3 INITIALIZING..."
    );


    console.log(
        "=========================================="
    );


    const firebaseReady =
        initializePOSFirebase();


    if (!firebaseReady) {

        return;

    }


    loadHeldOrdersLocally();


    setNewOrderNumber();


    renderPOSCart();


    updatePOSTotals();


    initializePOSSearch();


    initializePOSPaymentEvents();


    initializePOSKeypad();


    initializePOSKeyboard();


    await Promise.all([
        loadPOSProducts(),
        loadPOSCategories()
    ]);


    POS_STATE.initialized =
        true;


    console.log(
        "=========================================="
    );


    console.log(
        "PAPPRITO POS V3 READY"
    );


    console.log(
        "=========================================="
    );

}


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializePOS();

    }
);


/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */

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


window.renderPOSCart =
    renderPOSCart;


window.addProductToCart =
    addProductToCart;


window.changeCartQuantity =
    changeCartQuantity;


window.removeCartItem =
    removeCartItem;


window.clearPOSCart =
    clearPOSCart;


window.updatePOSTotals =
    updatePOSTotals;


window.completePOSPayment =
    completePOSPayment;


window.showPOSReceipt =
    showPOSReceipt;


window.printPOSReceipt =
    printPOSReceipt;


window.holdCurrentOrder =
    holdCurrentOrder;


window.recallHeldOrder =
    recallHeldOrder;


window.showPOSStatus =
    showPOSStatus;


/* ==========================================================
   READY MESSAGE
========================================================== */

console.log(
    "PAPPRITO POS V3 pos.js loaded."
);

console.log(
    "Cart format: SN | ITEMS | QTY | TOTAL"
);

console.log(
    "Receipt change: ONE CHANGE"
);
