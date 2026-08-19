/* ==========================================================
   PAPPRITO ERP
   RESTAURANT POS
   POS ENGINE V2 — FULL RESET
   File:
   assets/js/pos/pos.js

   FEATURES
   ----------------------------------------------------------
   ✓ Firebase Products
   ✓ Firebase Categories
   ✓ Product Search
   ✓ Category Filter
   ✓ Shopping Cart
   ✓ Quantity + / -
   ✓ Remove Item
   ✓ Clear Order
   ✓ Discount
   ✓ Tax Ready
   ✓ Cash / Card / GCash / Other
   ✓ Amount Received
   ✓ Change Calculation
   ✓ Save Sale to Firebase
   ✓ Deduct Product Stock
   ✓ Receipt
   ✓ Print Receipt
   ✓ Refresh Products
   ✓ Quick Keypad
   ✓ Fullscreen
   ✓ Date / Time
   ✓ Mobile Responsive
========================================================== */

"use strict";


/* ==========================================================
   GLOBAL STATE
========================================================== */

let posProducts = {};
let posCategories = {};
let posCart = [];

let posPaymentMethod = "Cash";

let posDiscount = 0;
let posTaxRate = 0;

let posCurrentOrderNumber = "";
let posCurrentReceipt = null;

let posInitialized = false;
let posProcessingPayment = false;

let currentPOSCategory = "all";


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

function posElement(id) {

    return document.getElementById(id);

}


/* ==========================================================
   MULTIPLE ELEMENT ID HELPER
========================================================== */

function posFirstElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            return element;

        }

    }

    return null;

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapePOSHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   NUMBER
========================================================== */

function posNumber(value) {

    const number =
        Number(value);

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
   ORDER NUMBER
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

    const hour =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const second =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    const random =
        String(
            Math.floor(
                Math.random() * 100
            )
        ).padStart(2, "0");

    return (
        "POS-" +
        year +
        month +
        day +
        "-" +
        hour +
        minute +
        second +
        random
    );

}


/* ==========================================================
   RESET ORDER NUMBER
========================================================== */

function resetPOSOrderNumber() {

    posCurrentOrderNumber =
        generatePOSOrderNumber();

    const element =
        posElement(
            "posOrderNumber"
        );

    if (element) {

        element.textContent =
            posCurrentOrderNumber;

    }

}


/* ==========================================================
   PRODUCT NAME
========================================================== */

function getPOSProductName(product) {

    return (
        product?.name ||
        product?.productName ||
        product?.itemName ||
        product?.title ||
        "Unnamed Product"
    );

}


/* ==========================================================
   PRODUCT PRICE
========================================================== */

function getPOSProductPrice(product) {

    return posNumber(
        product?.sellingPrice ??
        product?.salePrice ??
        product?.unitPrice ??
        product?.price ??
        product?.selling_price ??
        0
    );

}


/* ==========================================================
   PRODUCT IMAGE
========================================================== */

function getPOSProductImage(product) {

    return (
        product?.image ||
        product?.imageUrl ||
        product?.photo ||
        product?.photoUrl ||
        "../assets/img/no-image.png"
    );

}


/* ==========================================================
   PRODUCT CATEGORY
========================================================== */

function getPOSProductCategory(product) {

    return String(
        product?.category ||
        product?.categoryName ||
        product?.categoryId ||
        product?.category_name ||
        "Other"
    );

}


/* ==========================================================
   PRODUCT STOCK
========================================================== */

function getPOSProductStock(product) {

    if (
        product?.stock !== undefined &&
        product?.stock !== null &&
        product?.stock !== ""
    ) {

        return posNumber(
            product.stock
        );

    }

    if (
        product?.quantity !== undefined &&
        product?.quantity !== null &&
        product?.quantity !== ""
    ) {

        return posNumber(
            product.quantity
        );

    }

    return null;

}


/* ==========================================================
   PRODUCT ACTIVE CHECK
========================================================== */

function isPOSProductActive(product) {

    if (!product) {

        return false;

    }

    const status =
        String(
            product.status ??
            "active"
        )
        .trim()
        .toLowerCase();

    return (
        status !== "inactive" &&
        status !== "disabled" &&
        status !== "archived"
    );

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

    const snapshot =
        await db
            .ref("products")
            .once("value");

    posProducts =
        snapshot.val() || {};

    console.log(
        "POS Products:",
        Object.keys(posProducts).length
    );

    return posProducts;

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

    const snapshot =
        await db
            .ref("categories")
            .once("value");

    posCategories =
        snapshot.val() || {};

    console.log(
        "POS Categories:",
        Object.keys(posCategories).length
    );

    return posCategories;

}


/* ==========================================================
   CATEGORY NAME
========================================================== */

function getPOSCategoryName(category) {

    if (
        typeof category === "string"
    ) {

        return category;

    }

    return (
        category?.name ||
        category?.categoryName ||
        category?.title ||
        "Other"
    );

}


/* ==========================================================
   RENDER CATEGORIES
========================================================== */

function renderPOSCategories() {

    const container =
        posElement(
            "posCategories"
        );

    if (!container) {

        return;

    }

    const categoryMap =
        new Map();


    /* ------------------------------------------------------
       FIREBASE CATEGORIES
    ------------------------------------------------------ */

    Object.entries(
        posCategories || {}
    )
    .forEach(
        ([id, category]) => {

            if (!category) {

                return;

            }

            const name =
                getPOSCategoryName(
                    category
                );

            if (!name) {

                return;

            }

            categoryMap.set(
                String(name).trim(),
                name
            );

        }
    );


    /* ------------------------------------------------------
       ALSO GET CATEGORIES FROM PRODUCTS
       This makes POS work even when categories node
       is incomplete.
    ------------------------------------------------------ */

    Object.values(
        posProducts || {}
    )
    .forEach(
        product => {

            if (!product) {

                return;

            }

            const category =
                getPOSProductCategory(
                    product
                );

            if (
                category &&
                category !== "Other"
            ) {

                categoryMap.set(
                    String(category).trim(),
                    category
                );

            }

        }
    );


    let categories =
        Array.from(
            categoryMap.values()
        );


    categories.sort(
        (a, b) =>
            String(a)
                .localeCompare(
                    String(b)
                )
    );


    let html = `

        <button
            type="button"
            class="pos-category-btn ${
                currentPOSCategory === "all"
                    ? "active"
                    : ""
            }"
            data-category="all">

            <i class="fa-solid fa-border-all"></i>

            <span>All Products</span>

        </button>

    `;


    categories.forEach(
        category => {

            const active =
                String(
                    currentPOSCategory
                )
                .toLowerCase() ===
                String(category)
                    .toLowerCase();


            html += `

                <button
                    type="button"
                    class="pos-category-btn ${
                        active
                            ? "active"
                            : ""
                    }"
                    data-category="${escapePOSHTML(
                        category
                    )}">

                    <i class="fa-solid fa-layer-group"></i>

                    <span>
                        ${escapePOSHTML(
                            category
                        )}
                    </span>

                </button>

            `;

        }
    );


    container.innerHTML =
        html;


    container
        .querySelectorAll(
            ".pos-category-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        filterPOSCategory(
                            button.dataset.category ||
                            "all"
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   FILTER CATEGORY
========================================================== */

function filterPOSCategory(category) {

    currentPOSCategory =
        category ||
        "all";

    renderPOSCategories();

    renderPOSProducts();

}


/* ==========================================================
   PRODUCT SEARCH TEXT
========================================================== */

function getPOSProductSearchText(product) {

    return [

        product?.name,

        product?.productName,

        product?.itemName,

        product?.title,

        product?.code,

        product?.productCode,

        product?.sku,

        product?.barcode,

        product?.category,

        product?.categoryName

    ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

}


/* ==========================================================
   PRODUCT FILTER
========================================================== */

function getFilteredPOSProducts() {

    const searchInput =
        posFirstElement(
            "posProductSearch",
            "posSearch"
        );

    const search =
        String(
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    return Object.entries(
        posProducts || {}
    )
    .map(
        ([id, product]) => ({

            id,

            ...(product || {})

        })
    )
    .filter(
        product => {

            /* ----------------------------------------------
               STATUS
            ---------------------------------------------- */

            if (
                !isPOSProductActive(
                    product
                )
            ) {

                return false;

            }


            /* ----------------------------------------------
               SEARCH
            ---------------------------------------------- */

            if (search) {

                const searchText =
                    getPOSProductSearchText(
                        product
                    );

                if (
                    !searchText.includes(
                        search
                    )
                ) {

                    return false;

                }

            }


            /* ----------------------------------------------
               CATEGORY
            ---------------------------------------------- */

            if (
                currentPOSCategory !==
                "all"
            ) {

                const productCategory =
                    getPOSProductCategory(
                        product
                    )
                    .trim()
                    .toLowerCase();

                const selectedCategory =
                    String(
                        currentPOSCategory
                    )
                    .trim()
                    .toLowerCase();


                if (
                    productCategory !==
                    selectedCategory
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderPOSProducts() {

    const container =
        posElement(
            "posProducts"
        );

    if (!container) {

        return;

    }


    const products =
        getFilteredPOSProducts();


    if (
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="pos-products-loading">

                <i class="
                    fa-solid
                    fa-box-open
                    fa-2x
                "></i>

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
            product => {

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


                let stockHTML = "";


                if (
                    stock !== null
                ) {

                    if (
                        stock <= 0
                    ) {

                        stockHTML = `

                            <div
                                class="pos-product-stock"
                                style="
                                    color:#c8102e;
                                ">

                                Out of stock

                            </div>

                        `;

                    }

                    else {

                        stockHTML = `

                            <div class="pos-product-stock">

                                Stock:
                                ${escapePOSHTML(
                                    stock
                                )}

                            </div>

                        `;

                    }

                }


                const outOfStock =
                    stock !== null &&
                    stock <= 0;


                return `

                    <div
                        class="pos-product-card"
                        data-product-id="${escapePOSHTML(
                            product.id
                        )}"
                        ${
                            outOfStock
                                ? 'aria-disabled="true"'
                                : ""
                        }>

                        <img
                            src="${escapePOSHTML(
                                image
                            )}"
                            alt="${escapePOSHTML(
                                name
                            )}"
                            class="pos-product-image"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='../assets/img/no-image.png';
                            ">


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


                            ${stockHTML}

                        </div>

                    </div>

                `;

            }
        )
        .join("");


    container
        .querySelectorAll(
            ".pos-product-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const productId =
                            card.dataset.productId;

                        addPOSToCart(
                            productId
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   ADD TO CART
========================================================== */

function addPOSToCart(productId) {

    const product =
        posProducts?.[
            productId
        ];


    if (!product) {

        showPOSStatus(
            "Product not found.",
            "error"
        );

        return;

    }


    if (
        !isPOSProductActive(
            product
        )
    ) {

        showPOSStatus(
            "This product is inactive.",
            "error"
        );

        return;

    }


    const stock =
        getPOSProductStock(
            product
        );


    const existing =
        posCart.find(
            item =>
                item.productId ===
                productId
        );


    if (
        stock !== null
    ) {

        const currentQty =
            existing
                ? existing.quantity
                : 0;


        if (
            currentQty >= stock
        ) {

            showPOSStatus(
                "Not enough stock available.",
                "error"
            );

            return;

        }

    }


    if (existing) {

        existing.quantity++;

    }

    else {

        posCart.push({

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

    showPOSStatus(
        "Added to order.",
        "success"
    );

}


/* ==========================================================
   RENDER CART
========================================================== */

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

                <i class="
                    fa-solid
                    fa-cart-shopping
                "></i>

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
            (item, index) => {

                const total =
                    posNumber(
                        item.price
                    ) *
                    posNumber(
                        item.quantity
                    );


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
                                data-action="decrease"
                                data-index="${index}"
                                title="Decrease">

                                <i class="
                                    fa-solid
                                    fa-minus
                                "></i>

                            </button>


                            <span class="pos-cart-qty">

                                ${item.quantity}

                            </span>


                            <button
                                type="button"
                                data-action="increase"
                                data-index="${index}"
                                title="Increase">

                                <i class="
                                    fa-solid
                                    fa-plus
                                "></i>

                            </button>


                            <button
                                type="button"
                                data-action="remove"
                                data-index="${index}"
                                title="Remove">

                                <i class="
                                    fa-solid
                                    fa-trash
                                "></i>

                            </button>


                        </div>

                    </div>

                `;

            }
        )
        .join("");


    container
        .querySelectorAll(
            "button[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const index =
                            Number(
                                button.dataset.index
                            );

                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "increase"
                        ) {

                            increasePOSItem(
                                index
                            );

                        }

                        else if (
                            action ===
                            "decrease"
                        ) {

                            decreasePOSItem(
                                index
                            );

                        }

                        else if (
                            action ===
                            "remove"
                        ) {

                            removePOSItem(
                                index
                            );

                        }

                    }
                );

            }
        );

}


/* ==========================================================
   INCREASE ITEM
========================================================== */

function increasePOSItem(index) {

    const item =
        posCart[index];


    if (!item) {

        return;

    }


    const product =
        posProducts?.[
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

        showPOSStatus(
            "Maximum available stock reached.",
            "error"
        );

        return;

    }


    item.quantity++;

    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   DECREASE ITEM
========================================================== */

function decreasePOSItem(index) {

    const item =
        posCart[index];


    if (!item) {

        return;

    }


    item.quantity--;


    if (
        item.quantity <= 0
    ) {

        posCart.splice(
            index,
            1
        );

    }


    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   REMOVE ITEM
========================================================== */

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


/* ==========================================================
   CLEAR CART
========================================================== */

function clearPOSCart(force = false) {

    if (
        posCart.length === 0
    ) {

        return;

    }


    if (!force) {

        const confirmed =
            window.confirm(
                "Clear the current order?"
            );


        if (!confirmed) {

            return;

        }

    }


    posCart = [];

    posDiscount = 0;


    const discountInput =
        posFirstElement(
            "posDiscountInput",
            "posDiscount"
        );


    if (
        discountInput &&
        discountInput.tagName ===
        "INPUT"
    ) {

        discountInput.value =
            "";

    }


    const amountInput =
        posFirstElement(
            "posAmountReceived",
            "posPaymentAmount"
        );


    if (amountInput) {

        amountInput.value =
            "";

    }


    renderPOSCart();

    updatePOSSummary();

    resetPOSOrderNumber();

    showPOSStatus(
        "Order cleared.",
        "success"
    );

}


/* ==========================================================
   SUBTOTAL
========================================================== */

function getPOSSubtotal() {

    return posCart.reduce(
        (sum, item) => {

            return (
                sum +
                (
                    posNumber(
                        item.price
                    ) *
                    posNumber(
                        item.quantity
                    )
                )
            );

        },
        0
    );

}


/* ==========================================================
   DISCOUNT INPUT
========================================================== */

function getPOSDiscount() {

    const input =
        posFirstElement(
            "posDiscountInput",
            "posDiscount"
        );


    if (
        input &&
        input.tagName ===
        "INPUT"
    ) {

        const value =
            posNumber(
                input.value
            );

        return Math.max(
            0,
            Math.min(
                value,
                getPOSSubtotal()
            )
        );

    }


    return posNumber(
        posDiscount
    );

}


/* ==========================================================
   TAX
========================================================== */

function getPOSTax() {

    const subtotal =
        getPOSSubtotal();

    const discount =
        getPOSDiscount();

    const taxableAmount =
        Math.max(
            0,
            subtotal -
            discount
        );


    return (
        taxableAmount *
        posNumber(
            posTaxRate
        )
    );

}


/* ==========================================================
   GRAND TOTAL
========================================================== */

function getPOSGrandTotal() {

    return Math.max(
        0,
        getPOSSubtotal() -
        getPOSDiscount() +
        getPOSTax()
    );

}


/* ==========================================================
   PAYMENT AMOUNT
========================================================== */

function getPOSPaymentAmount() {

    const input =
        posFirstElement(
            "posAmountReceived",
            "posPaymentAmount"
        );


    return posNumber(
        input?.value
    );

}


/* ==========================================================
   CHANGE
========================================================== */

function getPOSChange() {

    return Math.max(
        0,
        getPOSPaymentAmount() -
        getPOSGrandTotal()
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

    const tax =
        getPOSTax();

    const total =
        getPOSGrandTotal();


    /* ------------------------------------------------------
       SUBTOTAL
    ------------------------------------------------------ */

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


    /* ------------------------------------------------------
       DISCOUNT DISPLAY
    ------------------------------------------------------ */

    const discountAmountElement =
        posFirstElement(
            "posDiscountAmount"
        );


    if (discountAmountElement) {

        discountAmountElement.textContent =
            posMoney(
                discount
            );

    }


    const discountDisplay =
        posElement(
            "posDiscount"
        );


    if (
        discountDisplay &&
        discountDisplay.tagName !==
        "INPUT"
    ) {

        discountDisplay.textContent =
            posMoney(
                discount
            );

    }


    /* ------------------------------------------------------
       TAX
    ------------------------------------------------------ */

    const taxElement =
        posFirstElement(
            "posTax"
        );


    if (taxElement) {

        taxElement.textContent =
            posMoney(
                tax
            );

    }


    /* ------------------------------------------------------
       TOTAL
    ------------------------------------------------------ */

    const totalElement =
        posFirstElement(
            "posTotal",
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


    /* ------------------------------------------------------
       TOTAL DISPLAY
    ------------------------------------------------------ */

    const paymentTotal =
        posFirstElement(
            "posPaymentTotal",
            "posModalTotal"
        );


    if (paymentTotal) {

        paymentTotal.textContent =
            posMoney(
                total
            );

    }


    /* ------------------------------------------------------
       CHANGE
    ------------------------------------------------------ */

    const changeElement =
        posFirstElement(
            "posChange",
            "posModalChange"
        );


    if (changeElement) {

        changeElement.textContent =
            posMoney(
                change
            );

    }


    /* ------------------------------------------------------
       PAY BUTTON
    ------------------------------------------------------ */

    const payButton =
        posElement(
            "posPayBtn"
        );


    if (payButton) {

        payButton.disabled =
            posProcessingPayment ||
            posCart.length === 0 ||
            total <= 0 ||
            payment < total;

    }

}


/* ==========================================================
   SET PAYMENT METHOD
========================================================== */

function setPOSPaymentMethod(method) {

    const normalized =
        String(
            method ||
            "Cash"
        )
        .trim()
        .toLowerCase();


    const map = {

        cash:
            "Cash",

        card:
            "Card",

        gcash:
            "GCash",

        other:
            "Other"

    };


    posPaymentMethod =
        map[
            normalized
        ] ||
        method ||
        "Cash";


    document
        .querySelectorAll(
            ".pos-payment-method-btn"
        )
        .forEach(
            button => {

                const buttonMethod =
                    String(
                        button.dataset.paymentMethod ||
                        button.dataset.method ||
                        ""
                    )
                    .toLowerCase();


                button.classList.toggle(
                    "active",
                    buttonMethod ===
                    normalized
                );

            }
        );


    updatePOSPayment();

}


/* ==========================================================
   CUSTOMER NAME
========================================================== */

function getPOSCustomerName() {

    const input =
        posFirstElement(
            "posCustomerName",
            "posCustomerInput"
        );


    const value =
        String(
            input?.value ||
            ""
        )
        .trim();


    return (
        value ||
        "Walk-in Customer"
    );

}


/* ==========================================================
   SAVE SALE
========================================================== */

async function processPOSPayment() {

    if (
        posProcessingPayment
    ) {

        return;

    }


    if (
        posCart.length === 0
    ) {

        showPOSStatus(
            "Please add products to the order.",
            "error"
        );

        return;

    }


    const subtotal =
        getPOSSubtotal();

    const discount =
        getPOSDiscount();

    const tax =
        getPOSTax();

    const total =
        getPOSGrandTotal();

    const payment =
        getPOSPaymentAmount();

    const change =
        Math.max(
            0,
            payment -
            total
        );


    if (
        total <= 0
    ) {

        showPOSStatus(
            "Order total must be greater than zero.",
            "error"
        );

        return;

    }


    if (
        payment < total
    ) {

        showPOSStatus(
            "Amount received is not enough.",
            "error"
        );

        return;

    }


    if (
        !posFirebaseReady()
    ) {

        showPOSStatus(
            "Firebase Database is not initialized.",
            "error"
        );

        return;

    }


    posProcessingPayment =
        true;


    const payButton =
        posElement(
            "posPayBtn"
        );


    const originalPayHTML =
        payButton?.innerHTML;


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

                PROCESSING...

            `;

        }


        /* --------------------------------------------------
           VERIFY STOCK BEFORE PAYMENT
        -------------------------------------------------- */

        for (
            const item of posCart
        ) {

            const product =
                posProducts?.[
                    item.productId
                ];


            if (!product) {

                throw new Error(
                    "A product in the cart no longer exists."
                );

            }


            const stock =
                getPOSProductStock(
                    product
                );


            if (
                stock !== null &&
                item.quantity > stock
            ) {

                throw new Error(
                    `${item.name} does not have enough stock.`
                );

            }

        }


        /* --------------------------------------------------
           ORDER NUMBER
        -------------------------------------------------- */

        if (
            !posCurrentOrderNumber
        ) {

            resetPOSOrderNumber();

        }


        const orderNumber =
            posCurrentOrderNumber;


        /* --------------------------------------------------
           SALE ID
        -------------------------------------------------- */

        const saleRef =
            db.ref(
                "sales"
            )
            .push();


        const saleId =
            saleRef.key;


        /* --------------------------------------------------
           ITEMS
        -------------------------------------------------- */

        const items =
            posCart.map(
                item => ({

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
                        posNumber(
                            item.price
                        ) *
                        posNumber(
                            item.quantity
                        )

                })
            );


        /* --------------------------------------------------
           SALE DATA
        -------------------------------------------------- */

        const saleData = {

            id:
                saleId,

            orderNumber:
                orderNumber,

            customerName:
                getPOSCustomerName(),

            items:
                items,

            subtotal:
                subtotal,

            discount:
                discount,

            tax:
                tax,

            taxRate:
                posTaxRate,

            total:
                total,

            amountReceived:
                payment,

            payment:
                payment,

            change:
                change,

            paymentMethod:
                posPaymentMethod,

            status:
                "Paid",

            source:
                "POS",

            createdAt:
                (
                    typeof firebase !==
                    "undefined" &&
                    firebase.database &&
                    firebase.database.ServerValue
                )
                ?
                firebase
                    .database
                    .ServerValue
                    .TIMESTAMP
                :
                Date.now()

        };


        /* --------------------------------------------------
           SAVE SALE
        -------------------------------------------------- */

        await saleRef.set(
            saleData
        );


        /* --------------------------------------------------
           UPDATE STOCK
        -------------------------------------------------- */

        await updatePOSProductStocks();


        /* --------------------------------------------------
           STORE RECEIPT
        -------------------------------------------------- */

        posCurrentReceipt =
            saleData;

        window.currentPOSReceipt =
            saleData;


        /* --------------------------------------------------
           SHOW RECEIPT
        -------------------------------------------------- */

        showPOSReceipt(
            saleData
        );


        /* --------------------------------------------------
           RESET CART
        -------------------------------------------------- */

        posCart = [];

        posDiscount = 0;


        const discountInput =
            posFirstElement(
                "posDiscountInput",
                "posDiscount"
            );


        if (
            discountInput &&
            discountInput.tagName ===
            "INPUT"
        ) {

            discountInput.value =
                "";

        }


        const amountInput =
            posFirstElement(
                "posAmountReceived",
                "posPaymentAmount"
            );


        if (amountInput) {

            amountInput.value =
                "";

        }


        const customerInput =
            posFirstElement(
                "posCustomerName",
                "posCustomerInput"
            );


        if (customerInput) {

            customerInput.value =
                "";

        }


        renderPOSCart();

        updatePOSSummary();

        resetPOSOrderNumber();

        await loadPOSProducts();

        renderPOSProducts();


        showPOSStatus(
            "Payment completed successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "PAPPRITO POS PAYMENT ERROR:",
            error
        );


        showPOSStatus(
            error?.message ||
            "Unable to complete payment.",
            "error"
        );

    }

    finally {

        posProcessingPayment =
            false;


        if (payButton) {

            payButton.innerHTML =
                originalPayHTML ||
                `

                    <i class="fa-solid fa-check"></i>

                    <span>
                        PAY
                    </span>

                `;

        }


        updatePOSPayment();

    }

}


/* ==========================================================
   UPDATE STOCK
========================================================== */

async function updatePOSProductStocks() {

    if (
        !posFirebaseReady()
    ) {

        throw new Error(
            "Firebase Database is not initialized."
        );

    }


    const updates = {};


    for (
        const item of posCart
    ) {

        const product =
            posProducts?.[
                item.productId
            ];


        if (!product) {

            continue;

        }


        const stock =
            getPOSProductStock(
                product
            );


        /* --------------------------------------------------
           If product has no stock field,
           don't create one automatically.
        -------------------------------------------------- */

        if (
            stock === null
        ) {

            continue;

        }


        const newStock =
            Math.max(
                0,
                stock -
                item.quantity
            );


        updates[
            `products/${item.productId}/stock`
        ] =
            newStock;

    }


    if (
        Object.keys(
            updates
        ).length === 0
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
   RECEIPT
========================================================== */

function showPOSReceipt(sale) {

    const container =
        posFirstElement(
            "posReceiptContent",
            "posReceipt"
        );


    if (!container) {

        return;

    }


    const itemsHTML =
        sale.items
        .map(
            item => `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        padding:4px 0;
                    ">

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

            `
        )
        .join("");


    container.innerHTML = `

        <div
            style="
                font-family:Arial,sans-serif;
                max-width:380px;
                margin:auto;
            ">


            <div
                style="
                    text-align:center;
                    margin-bottom:12px;
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
                        color:#666;
                    ">

                    Restaurant

                </div>

            </div>


            <hr>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    font-size:12px;
                ">

                <span>
                    Order No.
                </span>

                <strong>

                    ${escapePOSHTML(
                        sale.orderNumber
                    )}

                </strong>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    font-size:12px;
                    margin-top:5px;
                ">

                <span>
                    Customer
                </span>

                <strong>

                    ${escapePOSHTML(
                        sale.customerName
                    )}

                </strong>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    font-size:12px;
                    margin-top:5px;
                ">

                <span>
                    Payment
                </span>

                <strong>

                    ${escapePOSHTML(
                        sale.paymentMethod
                    )}

                </strong>

            </div>


            <hr>


            <div>

                ${itemsHTML}

            </div>


            <hr>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    padding:3px 0;
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
                    padding:3px 0;
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
                    padding:3px 0;
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
                    margin-top:7px;
                    padding-top:8px;
                    border-top:2px solid #222;
                    font-size:20px;
                ">

                <strong>
                    TOTAL
                </strong>

                <strong
                    style="
                        color:#c8102e;
                    ">

                    ${posMoney(
                        sale.total
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
                ">

                <span>
                    Change
                </span>

                <strong>
                    ${posMoney(
                        sale.change
                    )}
                </strong>

            </div>


            <hr>


            <div
                style="
                    text-align:center;
                    font-size:12px;
                    color:#666;
                    margin-top:10px;
                ">

                Thank you for dining with us!

            </div>

        </div>

    `;


    /* ------------------------------------------------------
       SHOW BOOTSTRAP MODAL
    ------------------------------------------------------ */

    const modal =
        posElement(
            "posReceiptModal"
        );


    if (
        modal &&
        typeof bootstrap !==
        "undefined"
    ) {

        bootstrap.Modal
            .getOrCreateInstance(
                modal
            )
            .show();

    }

}


/* ==========================================================
   PRINT RECEIPT
========================================================== */

function printPOSReceipt(
    sale = posCurrentReceipt
) {

    if (!sale) {

        showPOSStatus(
            "No receipt available.",
            "error"
        );

        return;

    }


    const items =
        sale.items
        .map(
            item => `

                <tr>

                    <td>
                        ${escapePOSHTML(
                            item.name
                        )}
                    </td>

                    <td
                        style="
                            text-align:center;
                        ">

                        ${item.quantity}

                    </td>

                    <td
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            item.total
                        )}

                    </td>

                </tr>

            `
        )
        .join("");


    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=420,height=700"
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

                * {
                    box-sizing:border-box;
                }

                body {

                    width:300px;

                    margin:0 auto;

                    padding:15px 0;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    font-size:12px;

                    color:#111;

                }

                h2 {

                    text-align:center;

                    margin:0;

                    font-size:24px;

                }

                .center {

                    text-align:center;

                }

                .muted {

                    color:#666;

                    font-size:11px;

                }

                hr {

                    border:0;

                    border-top:
                        1px dashed #000;

                    margin:
                        10px 0;

                }

                table {

                    width:100%;

                    border-collapse:
                        collapse;

                }

                td {

                    padding:
                        4px 0;

                    vertical-align:
                        top;

                }

                .total {

                    font-size:18px;

                    font-weight:900;

                    border-top:
                        2px solid #000;

                    padding-top:
                        7px;

                }

                .red {

                    color:#c8102e;

                }

            </style>

        </head>


        <body>


            <h2>
                PAPPRITO
            </h2>


            <div class="center muted">
                Restaurant
            </div>


            <hr>


            <div class="center">

                <strong>
                    ${escapePOSHTML(
                        sale.orderNumber
                    )}
                </strong>

            </div>


            <div class="center muted">

                ${escapePOSHTML(
                    sale.customerName
                )}

            </div>


            <hr>


            <table>

                <thead>

                    <tr>

                        <th
                            style="
                                text-align:left;
                            ">

                            Item

                        </th>

                        <th>
                            Qty
                        </th>

                        <th
                            style="
                                text-align:right;
                            ">

                            Amount

                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${items}

                </tbody>

            </table>


            <hr>


            <table>

                <tr>

                    <td>
                        Subtotal
                    </td>

                    <td
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            sale.subtotal
                        )}

                    </td>

                </tr>


                <tr>

                    <td>
                        Discount
                    </td>

                    <td
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            sale.discount
                        )}

                    </td>

                </tr>


                <tr>

                    <td>
                        Tax
                    </td>

                    <td
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            sale.tax
                        )}

                    </td>

                </tr>


                <tr>

                    <td class="total">
                        TOTAL
                    </td>

                    <td
                        class="total red"
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            sale.total
                        )}

                    </td>

                </tr>


                <tr>

                    <td>
                        Payment
                    </td>

                    <td
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            sale.amountReceived
                        )}

                    </td>

                </tr>


                <tr>

                    <td>
                        Change
                    </td>

                    <td
                        style="
                            text-align:right;
                        ">

                        ${posMoney(
                            sale.change
                        )}

                    </td>

                </tr>

            </table>


            <hr>


            <div class="center">

                ${escapePOSHTML(
                    sale.paymentMethod
                )}

            </div>


            <div
                class="center"
                style="
                    margin-top:12px;
                ">

                Thank you!

            </div>


            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>


        </body>

        </html>

    `);


    receiptWindow.document.close();

}


/* ==========================================================
   REFRESH POS
========================================================== */

async function refreshPOS() {

    const button =
        posFirstElement(
            "posRefreshBtn",
            "posRefreshProductsBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML = `

            <i class="
                fa-solid
                fa-spinner
                fa-spin
            "></i>

        `;

    }


    try {

        await Promise.all([

            loadPOSProducts(),

            loadPOSCategories()

        ]);


        renderPOSCategories();

        renderPOSProducts();


        showPOSStatus(
            "Products refreshed.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "POS Refresh Error:",
            error
        );


        showPOSStatus(
            "Unable to refresh POS data.",
            "error"
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML = `

                <i class="
                    fa-solid
                    fa-rotate
                "></i>

            `;

        }

    }

}


/* ==========================================================
   STATUS MESSAGE
========================================================== */

function showPOSStatus(
    message,
    type = "info"
) {

    const status =
        posElement(
            "posStatus"
        );


    if (!status) {

        return;

    }


    status.textContent =
        message;


    status.className =
        "pos-status show";


    if (
        type === "success"
    ) {

        status.style.background =
            "#008a4c";

    }

    else if (
        type === "error"
    ) {

        status.style.background =
            "#c8102e";

    }

    else {

        status.style.background =
            "#222";

    }


    clearTimeout(
        window.posStatusTimer
    );


    window.posStatusTimer =
        setTimeout(
            () => {

                status.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* ==========================================================
   FULLSCREEN
========================================================== */

async function togglePOSFullscreen() {

    const application =
        posElement(
            "pappritoPOS"
        );


    if (!application) {

        return;

    }


    try {

        if (
            !document.fullscreenElement
        ) {

            await application.requestFullscreen();

        }

        else {

            await document.exitFullscreen();

        }

    }

    catch (error) {

        console.error(
            "Fullscreen Error:",
            error
        );

    }

}


/* ==========================================================
   HOLD ORDER
========================================================== */

function holdPOSOrder() {

    if (
        posCart.length === 0
    ) {

        showPOSStatus(
            "There is no order to hold.",
            "error"
        );

        return;

    }


    try {

        const heldOrders =
            JSON.parse(
                localStorage.getItem(
                    "pappritoPOSHeldOrders"
                ) ||
                "[]"
            );


        heldOrders.push({

            orderNumber:
                posCurrentOrderNumber,

            customerName:
                getPOSCustomerName(),

            items:
                posCart,

            discount:
                getPOSDiscount(),

            paymentMethod:
                posPaymentMethod,

            createdAt:
                Date.now()

        });


        localStorage.setItem(
            "pappritoPOSHeldOrders",
            JSON.stringify(
                heldOrders
            )
        );


        clearPOSCart(
            true
        );


        showPOSStatus(
            "Order placed on hold.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Hold Order Error:",
            error
        );

    }

}


/* ==========================================================
   RECALL ORDER
========================================================== */

function recallPOSOrder() {

    try {

        const heldOrders =
            JSON.parse(
                localStorage.getItem(
                    "pappritoPOSHeldOrders"
                ) ||
                "[]"
            );


        if (
            heldOrders.length === 0
        ) {

            showPOSStatus(
                "No held orders.",
                "info"
            );

            return;

        }


        const order =
            heldOrders.pop();


        localStorage.setItem(
            "pappritoPOSHeldOrders",
            JSON.stringify(
                heldOrders
            )
        );


        posCart =
            Array.isArray(
                order.items
            )
                ? order.items
                : [];


        posDiscount =
            posNumber(
                order.discount
            );


        posPaymentMethod =
            order.paymentMethod ||
            "Cash";


        const customerInput =
            posFirstElement(
                "posCustomerName",
                "posCustomerInput"
            );


        if (customerInput) {

            customerInput.value =
                order.customerName ||
                "";

        }


        const discountInput =
            posFirstElement(
                "posDiscountInput",
                "posDiscount"
            );


        if (
            discountInput &&
            discountInput.tagName ===
            "INPUT"
        ) {

            discountInput.value =
                posDiscount ||
                "";

        }


        renderPOSCart();

        updatePOSSummary();

        setPOSPaymentMethod(
            posPaymentMethod
        );


        showPOSStatus(
            "Held order recalled.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Recall Order Error:",
            error
        );

    }

}


/* ==========================================================
   QUICK KEYPAD
========================================================== */

function handlePOSKeypad(
    key
) {

    const amountInput =
        posFirstElement(
            "posAmountReceived",
            "posPaymentAmount"
        );


    if (!amountInput) {

        return;

    }


    if (
        key === "clear"
    ) {

        amountInput.value =
            "";

        updatePOSPayment();

        amountInput.focus();

        return;

    }


    if (
        key === "backspace"
    ) {

        amountInput.value =
            amountInput.value.slice(
                0,
                -1
            );

        updatePOSPayment();

        amountInput.focus();

        return;

    }


    if (
        key === "."
    ) {

        if (
            amountInput.value.includes(
                "."
            )
        ) {

            return;

        }

    }


    amountInput.value +=
        String(key);


    updatePOSPayment();

    amountInput.focus();

}


/* ==========================================================
   DATE / TIME
========================================================== */

function updatePOSDateTime() {

    const element =
        posElement(
            "posDateTime"
        );


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
   BIND EVENTS
========================================================== */

function bindPOSEvents() {

    /* ------------------------------------------------------
       SEARCH
    ------------------------------------------------------ */

    const search =
        posFirstElement(
            "posProductSearch",
            "posSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderPOSProducts
        );

    }


    /* ------------------------------------------------------
       REFRESH
    ------------------------------------------------------ */

    const refresh =
        posFirstElement(
            "posRefreshProductsBtn",
            "posRefreshBtn"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            refreshPOS
        );

    }


    /* ------------------------------------------------------
       CLEAR ORDER
    ------------------------------------------------------ */

    const clear =
        posFirstElement(
            "posClearCartBtn",
            "posClearOrder"
        );


    if (clear) {

        clear.addEventListener(
            "click",
            () =>
                clearPOSCart()
        );

    }


    /* ------------------------------------------------------
       DISCOUNT
    ------------------------------------------------------ */

    const discountInput =
        posFirstElement(
            "posDiscountInput"
        );


    if (discountInput) {

        discountInput.addEventListener(
            "input",
            updatePOSSummary
        );

    }


    /* ------------------------------------------------------
       AMOUNT RECEIVED
    ------------------------------------------------------ */

    const amountInput =
        posFirstElement(
            "posAmountReceived",
            "posPaymentAmount"
        );


    if (amountInput) {

        amountInput.addEventListener(
            "input",
            updatePOSPayment
        );

        amountInput.addEventListener(
            "focus",
            function () {

                this.select();

            }
        );

    }


    /* ------------------------------------------------------
       PAYMENT METHODS
    ------------------------------------------------------ */

    document
        .querySelectorAll(
            ".pos-payment-method-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        setPOSPaymentMethod(

                            button.dataset
                                .paymentMethod ||

                            button.dataset
                                .method ||

                            "cash"

                        );

                    }
                );

            }
        );


    /* ------------------------------------------------------
       PAY
    ------------------------------------------------------ */

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


    /* ------------------------------------------------------
       HOLD
    ------------------------------------------------------ */

    const hold =
        posElement(
            "posHoldBtn"
        );


    if (hold) {

        hold.addEventListener(
            "click",
            holdPOSOrder
        );

    }


    /* ------------------------------------------------------
       RECALL
    ------------------------------------------------------ */

    const recall =
        posElement(
            "posRecallBtn"
        );


    if (recall) {

        recall.addEventListener(
            "click",
            recallPOSOrder
        );

    }


    /* ------------------------------------------------------
       FULLSCREEN
    ------------------------------------------------------ */

    const fullscreen =
        posFirstElement(
            "posFullscreenBtn",
            "posFullscreen"
        );


    if (fullscreen) {

        fullscreen.addEventListener(
            "click",
            togglePOSFullscreen
        );

    }


    /* ------------------------------------------------------
       PRINT RECEIPT
    ------------------------------------------------------ */

    const print =
        posFirstElement(
            "posPrintReceiptBtn",
            "posPrintReceipt"
        );


    if (print) {

        print.addEventListener(
            "click",
            () => {

                printPOSReceipt(
                    posCurrentReceipt
                );

            }
        );

    }


    /* ------------------------------------------------------
       QUICK KEYPAD
    ------------------------------------------------------ */

    document
        .querySelectorAll(
            ".pos-keypad button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        handlePOSKeypad(

                            button.dataset.key ||

                            ""

                        );

                    }
                );

            }
        );


    /* ------------------------------------------------------
       KEYBOARD SHORTCUTS
    ------------------------------------------------------ */

    document.addEventListener(
        "keydown",
        event => {

            /* ----------------------------------------------
               ENTER = PAY
            ---------------------------------------------- */

            if (
                event.key ===
                "Enter"
            ) {

                const active =
                    document.activeElement;


                if (
                    active &&
                    (
                        active.tagName ===
                        "INPUT" ||
                        active.tagName ===
                        "TEXTAREA"
                    )
                ) {

                    return;

                }


                const payButton =
                    posElement(
                        "posPayBtn"
                    );


                if (
                    payButton &&
                    !payButton.disabled
                ) {

                    event.preventDefault();

                    processPOSPayment();

                }

            }


            /* ----------------------------------------------
               ESC = CLEAR SEARCH
            ---------------------------------------------- */

            if (
                event.key ===
                "Escape"
            ) {

                const search =
                    posFirstElement(
                        "posProductSearch",
                        "posSearch"
                    );


                if (search) {

                    search.value =
                        "";

                    renderPOSProducts();

                }

            }

        }
    );

}


/* ==========================================================
   INITIALIZE POS
========================================================== */

async function initializePOS() {

    if (
        posInitialized
    ) {

        return;

    }


    console.log(
        "======================================"
    );

    console.log(
        "PAPPRITO POS V2 INITIALIZING..."
    );

    console.log(
        "======================================"
    );


    /* ------------------------------------------------------
       EVENTS
    ------------------------------------------------------ */

    bindPOSEvents();


    /* ------------------------------------------------------
       DATE TIME
    ------------------------------------------------------ */

    updatePOSDateTime();


    if (
        !window.pappritoPOSDateTimer
    ) {

        window.pappritoPOSDateTimer =
            setInterval(
                updatePOSDateTime,
                1000
            );

    }


    /* ------------------------------------------------------
       ORDER NUMBER
    ------------------------------------------------------ */

    resetPOSOrderNumber();


    /* ------------------------------------------------------
       FIREBASE
    ------------------------------------------------------ */

    if (
        !posFirebaseReady()
    ) {

        console.error(
            "Firebase Database is not initialized."
        );


        showPOSStatus(
            "Firebase is not connected.",
            "error"
        );

        return;

    }


    try {

        /* --------------------------------------------------
           LOAD BOTH AT SAME TIME
        -------------------------------------------------- */

        await Promise.all([

            loadPOSCategories(),

            loadPOSProducts()

        ]);


        /* --------------------------------------------------
           RENDER
        -------------------------------------------------- */

        renderPOSCategories();

        renderPOSProducts();

        renderPOSCart();

        updatePOSSummary();


        /* --------------------------------------------------
           DEFAULT PAYMENT
        -------------------------------------------------- */

        setPOSPaymentMethod(
            "cash"
        );


        posInitialized =
            true;


        console.log(
            "PAPPRITO POS V2 READY."
        );


    }

    catch (error) {

        console.error(
            "PAPPRITO POS INITIALIZATION ERROR:",
            error
        );


        showPOSStatus(
            "Unable to load POS data.",
            "error"
        );

    }

}


/* ==========================================================
   AUTO INITIALIZE
========================================================== */

function startPOSWhenReady() {

    if (
        document.readyState ===
        "loading"
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

}


/* ==========================================================
   GLOBAL EXPORTS
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

window.updatePOSSummary =
    updatePOSSummary;

window.updatePOSPayment =
    updatePOSPayment;

window.refreshPOS =
    refreshPOS;

window.printPOSReceipt =
    printPOSReceipt;

window.showPOSReceipt =
    showPOSReceipt;

window.togglePOSFullscreen =
    togglePOSFullscreen;

window.holdPOSOrder =
    holdPOSOrder;

window.recallPOSOrder =
    recallPOSOrder;


/* ==========================================================
   START
========================================================== */

startPOSWhenReady();


console.log(
    "PAPPRITO POS ENGINE V2 LOADED."
);
