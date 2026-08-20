/* ==========================================================
   PAPPRITO ERP
   POS V3 — CONSOLIDATED POS ENGINE
   File:
   assets/js/pos/pos.js

   ARCHITECTURE:

   app.js
      ↓
   pages/pos.html
      ↓
   assets/css/pos.css
      ↓
   assets/js/pos/pos.js
      ↓
   Firebase Realtime Database

   IMPORTANT:
   - app.js owns page initialization.
   - POS waits for Firebase before loading data.
   - Safe against duplicate script loading.
   - No sidebar logic.
   - No ERP navbar logic.
========================================================== */

"use strict";


/* ==========================================================
   DUPLICATE ENGINE PROTECTION
========================================================== */

if (
    window.PAPPRITO_POS_ENGINE_ACTIVE
) {

    console.warn(
        "PAPPRITO POS engine already active. Duplicate load ignored."
    );

}
else {

    window.PAPPRITO_POS_ENGINE_ACTIVE = true;


    /* ======================================================
       PRIVATE POS MODULE
    ====================================================== */

    (() => {

        /* ==================================================
           POS STATE
        ================================================== */

        const POS = {

            products: {},

            categories: {},

            cart: [],

            currentCategory: "all",

            paymentMethod: "Cash",

            discount: 0,

            customer: "Walk-in Customer",

            initialized: false,

            initializing: false,

            processing: false,

            lastSale: null,

            firebaseReady: false

        };


        /* ==================================================
           GLOBAL STATE
        ================================================== */

        window.PAPPRITO_POS = POS;


        /* ==================================================
           ELEMENT
        ================================================== */

        function el(id) {

            return document.getElementById(id);

        }


        /* ==================================================
           NUMBER
        ================================================== */

        function number(value) {

            const n = Number(value);

            return Number.isFinite(n)
                ? n
                : 0;

        }


        /* ==================================================
           MONEY
        ================================================== */

        function money(value) {

            return (
                "₱" +
                number(value).toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )
            );

        }


        /* ==================================================
           ESCAPE
        ================================================== */

        function escapeHTML(value) {

            return String(value ?? "")

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


        /* ==================================================
           STATUS
        ================================================== */

        function status(message) {

            console.log(
                "PAPPRITO POS:",
                message
            );


            const target =
                el("posStatus");


            if (!target) {

                return;

            }


            target.textContent =
                message;


            target.classList.add(
                "show"
            );


            clearTimeout(
                window.pappritoPOSTimer
            );


            window.pappritoPOSTimer =
                setTimeout(
                    () => {

                        target.classList.remove(
                            "show"
                        );

                    },
                    3000
                );

        }


        /* ==================================================
           ERROR
        ================================================== */

        function error(message, err) {

            console.error(
                "PAPPRITO POS:",
                message,
                err || ""
            );


            status(
                message
            );

        }


        /* ==================================================
           FIREBASE CHECK
        ================================================== */

        function firebaseReady() {

            if (
                typeof window.db !== "undefined" &&
                window.db &&
                typeof window.db.ref === "function"
            ) {

                POS.firebaseReady =
                    true;

                return true;

            }


            POS.firebaseReady =
                false;

            return false;

        }


        /* ==================================================
           WAIT FOR FIREBASE
        ================================================== */

        async function waitForFirebase(
            timeout = 15000
        ) {

            if (
                firebaseReady()
            ) {

                return true;

            }


            const start =
                Date.now();


            status(
                "Connecting to Firebase..."
            );


            while (
                Date.now() - start <
                timeout
            ) {

                if (
                    firebaseReady()
                ) {

                    console.log(
                        "PAPPRITO POS: Firebase ready."
                    );


                    POS.firebaseReady =
                        true;


                    return true;

                }


                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            250
                        )
                );

            }


            POS.firebaseReady =
                false;


            throw new Error(
                "Firebase Database is not ready."
            );

        }


        /* ==================================================
           PRODUCT NAME
        ================================================== */

        function productName(product) {

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


        /* ==================================================
           PRODUCT PRICE
        ================================================== */

        function productPrice(product) {

            if (!product) {

                return 0;

            }


            return number(

                product.price ??

                product.sellingPrice ??

                product.salePrice ??

                product.unitPrice ??

                product.srp ??

                0

            );

        }


        /* ==================================================
           PRODUCT CATEGORY
        ================================================== */

        function productCategory(product) {

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


        /* ==================================================
           PRODUCT IMAGE
        ================================================== */

        function productImage(product) {

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


        /* ==================================================
           PRODUCT STOCK
        ================================================== */

        function productStock(product) {

            if (!product) {

                return null;

            }


            if (
                product.stock !== undefined &&
                product.stock !== null &&
                product.stock !== ""
            ) {

                return number(
                    product.stock
                );

            }


            if (
                product.quantity !== undefined &&
                product.quantity !== null &&
                product.quantity !== ""
            ) {

                return number(
                    product.quantity
                );

            }


            return null;

        }


        /* ==================================================
           ORDER NUMBER
        ================================================== */

        function generateOrderNumber() {

            const now =
                new Date();


            const date =
                now.getFullYear() +

                String(
                    now.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                ) +

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


            const random =
                Math.floor(
                    Math.random() * 900
                ) + 100;


            return (
                "POS-" +
                date +
                "-" +
                time +
                random
            );

        }


        /* ==================================================
           ORDER NUMBER UI
        ================================================== */

        function updateOrderNumber() {

            const target =
                el(
                    "posOrderNumber"
                );


            if (!target) {

                return;

            }


            target.textContent =
                generateOrderNumber();

        }


        /* ==================================================
           LOAD CATEGORIES
        ================================================== */

        async function loadCategories() {

            await waitForFirebase();


            const container =
                el(
                    "posCategories"
                );


            if (container) {

                container.innerHTML = `

                    <div class="pos-products-loading">

                        <div class="spinner-border text-danger"></div>

                        <span>
                            Loading categories...
                        </span>

                    </div>

                `;

            }


            try {

                const snapshot =
                    await window.db
                        .ref("categories")
                        .once("value");


                POS.categories =
                    snapshot.val() || {};


                console.log(
                    "POS Categories:",
                    Object.keys(
                        POS.categories
                    ).length
                );


                renderCategories();


                return POS.categories;

            }

            catch (err) {

                if (container) {

                    container.innerHTML = `

                        <div class="pos-loading">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                            <strong>
                                Unable to load categories
                            </strong>

                            <span>
                                Please refresh the POS.
                            </span>

                        </div>

                    `;

                }


                throw err;

            }

        }


        /* ==================================================
           LOAD PRODUCTS
        ================================================== */

        async function loadProducts() {

            await waitForFirebase();


            const container =
                el(
                    "posProducts"
                );


            if (container) {

                container.innerHTML = `

                    <div class="pos-products-loading">

                        <div class="spinner-border text-danger"></div>

                        <span>
                            Loading products...
                        </span>

                    </div>

                `;

            }


            try {

                const snapshot =
                    await window.db
                        .ref("products")
                        .once("value");


                POS.products =
                    snapshot.val() || {};


                console.log(
                    "POS Products:",
                    Object.keys(
                        POS.products
                    ).length
                );


                renderProducts();


                return POS.products;

            }

            catch (err) {

                if (container) {

                    container.innerHTML = `

                        <div class="pos-loading">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                            <strong>
                                Unable to load products
                            </strong>

                            <span>
                                Please refresh the POS.
                            </span>

                        </div>

                    `;

                }


                throw err;

            }

        }


        /* ==================================================
           RENDER CATEGORIES
        ================================================== */

        function renderCategories() {

            const container =
                el(
                    "posCategories"
                );


            if (!container) {

                return;

            }


            const categories =
                Object.entries(
                    POS.categories
                )

                .map(
                    ([id, category]) => ({

                        id,

                        name:
                            String(
                                category?.name ??
                                category?.categoryName ??
                                category?.title ??
                                id ??
                                "Other"
                            )

                    })
                )

                .filter(
                    category =>
                        category.name.trim()
                )

                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                );


            let html = `

                <button
                    type="button"
                    class="pos-category-btn"
                    data-category="all">

                    <i class="fa-solid fa-border-all"></i>

                    <span>
                        All Products
                    </span>

                </button>

            `;


            categories.forEach(
                category => {

                    html += `

                        <button
                            type="button"
                            class="pos-category-btn"
                            data-category="${escapeHTML(
                                category.name
                            )}">

                            <i class="fa-solid fa-tag"></i>

                            <span>
                                ${escapeHTML(
                                    category.name
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

                                filterCategory(
                                    button.dataset.category ||
                                    "all"
                                );

                            }
                        );

                    }
                );


            updateCategoryActive();

        }


        /* ==================================================
           ACTIVE CATEGORY
        ================================================== */

        function updateCategoryActive() {

            document
                .querySelectorAll(
                    ".pos-category-btn"
                )
                .forEach(
                    button => {

                        button.classList.toggle(
                            "active",

                            String(
                                button.dataset.category ||
                                ""
                            ).toLowerCase() ===

                            String(
                                POS.currentCategory
                            ).toLowerCase()

                        );

                    }
                );

        }


        /* ==================================================
           FILTER CATEGORY
        ================================================== */

        function filterCategory(
            category
        ) {

            POS.currentCategory =
                category || "all";


            updateCategoryActive();

            renderProducts();

        }


        /* ==================================================
           SEARCH MATCH
        ================================================== */

        function productMatchesSearch(
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


        /* ==================================================
           RENDER PRODUCTS
        ================================================== */

        function renderProducts() {

            const container =
                el(
                    "posProducts"
                );


            if (!container) {

                return;

            }


            const searchInput =
                el(
                    "posProductSearch"
                );


            const search =
                String(
                    searchInput?.value || ""
                )
                .trim()
                .toLowerCase();


            const category =
                String(
                    POS.currentCategory ||
                    "all"
                );


            const products =
                Object.entries(
                    POS.products
                )

                .map(
                    ([id, product]) => ({

                        id,

                        ...(product || {})

                    })
                )

                .filter(
                    product => {

                        const statusValue =
                            String(
                                product.status ??
                                "active"
                            )
                            .toLowerCase();


                        if (
                            [
                                "inactive",
                                "disabled",
                                "deleted"
                            ].includes(
                                statusValue
                            )
                        ) {

                            return false;

                        }


                        if (
                            !productMatchesSearch(
                                product,
                                search
                            )
                        ) {

                            return false;

                        }


                        if (
                            category !== "all"
                        ) {

                            const pc =
                                productCategory(
                                    product
                                )
                                .toLowerCase();


                            if (
                                pc !==
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

                        <i class="fa-solid fa-box-open"></i>

                        <strong>
                            No products found
                        </strong>

                        <span>
                            Try another category or search.
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
                            productName(
                                product
                            );


                        const price =
                            productPrice(
                                product
                            );


                        const image =
                            productImage(
                                product
                            );


                        const stock =
                            productStock(
                                product
                            );


                        let stockHTML =
                            "";


                        if (
                            stock !== null
                        ) {

                            stockHTML = `

                                <div class="pos-product-stock">

                                    Stock:
                                    ${escapeHTML(
                                        stock
                                    )}

                                </div>

                            `;

                        }


                        const disabled =
                            stock !== null &&
                            stock <= 0;


                        return `

                            <button
                                type="button"
                                class="pos-product-card ${
                                    disabled
                                    ? "out-of-stock"
                                    : ""
                                }"
                                data-product-id="${escapeHTML(
                                    product.id
                                )}"
                                ${
                                    disabled
                                    ? "disabled"
                                    : ""
                                }>

                                <div class="pos-product-image-wrap">

                                    <img
                                        src="${escapeHTML(
                                            image
                                        )}"
                                        alt="${escapeHTML(
                                            name
                                        )}"
                                        class="pos-product-image"
                                        loading="lazy"
                                        onerror="
                                            this.onerror=null;
                                            this.src='../assets/img/no-image.png';
                                        ">

                                </div>


                                <div class="pos-product-info">

                                    <div class="pos-product-name">

                                        ${escapeHTML(
                                            name
                                        )}

                                    </div>


                                    <div class="pos-product-price">

                                        ${money(
                                            price
                                        )}

                                    </div>


                                    ${stockHTML}

                                </div>

                            </button>

                        `;

                    }
                )
                .join("");


            container
                .querySelectorAll(
                    ".pos-product-card"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                addToCart(
                                    button.dataset.productId
                                );

                            }
                        );

                    }
                );

        }


        /* ==================================================
           ADD TO CART
        ================================================== */

        function addToCart(
            productId
        ) {

            const product =
                POS.products[
                    productId
                ];


            if (!product) {

                status(
                    "Product not found."
                );

                return;

            }


            const stock =
                productStock(
                    product
                );


            const existing =
                POS.cart.find(
                    item =>
                        item.productId ===
                        productId
                );


            const currentQty =
                existing
                ? existing.quantity
                : 0;


            if (
                stock !== null &&
                currentQty >= stock
            ) {

                status(
                    "Not enough stock available."
                );

                return;

            }


            if (existing) {

                existing.quantity += 1;

            }

            else {

                POS.cart.push({

                    productId,

                    name:
                        productName(
                            product
                        ),

                    price:
                        productPrice(
                            product
                        ),

                    quantity:
                        1,

                    category:
                        productCategory(
                            product
                        )

                });

            }


            renderCart();

            updateSummary();

            status(
                "Product added."
            );

        }


        /* ==================================================
           RENDER CART
        ================================================== */

        function renderCart() {

            const container =
                el(
                    "posCart"
                );


            if (!container) {

                return;

            }


            if (
                POS.cart.length === 0
            ) {

                container.innerHTML = `

                    <div class="pos-empty-cart">

                        <i class="fa-solid fa-cart-shopping"></i>

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


            container.innerHTML =
                POS.cart
                .map(
                    (item, index) => {

                        const lineTotal =
                            number(
                                item.price
                            ) *
                            number(
                                item.quantity
                            );


                        return `

                            <div
                                class="pos-cart-item"
                                data-cart-index="${index}">

                                <div class="pos-cart-item-main">

                                    <div class="pos-cart-item-name">

                                        ${escapeHTML(
                                            item.name
                                        )}

                                    </div>


                                    <div class="pos-cart-item-price">

                                        ${money(
                                            item.price
                                        )}
                                        each

                                    </div>

                                </div>


                                <div class="pos-cart-item-total">

                                    ${money(
                                        lineTotal
                                    )}

                                </div>


                                <div class="pos-cart-controls">

                                    <button
                                        type="button"
                                        data-action="decrease"
                                        data-index="${index}"
                                        aria-label="Decrease">

                                        <i class="fa-solid fa-minus"></i>

                                    </button>


                                    <span>

                                        ${item.quantity}

                                    </span>


                                    <button
                                        type="button"
                                        data-action="increase"
                                        data-index="${index}"
                                        aria-label="Increase">

                                        <i class="fa-solid fa-plus"></i>

                                    </button>


                                    <button
                                        type="button"
                                        data-action="remove"
                                        data-index="${index}"
                                        aria-label="Remove">

                                        <i class="fa-solid fa-trash"></i>

                                    </button>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


            container
                .querySelectorAll(
                    "[data-action]"
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

                                    increaseItem(
                                        index
                                    );

                                }

                                else if (
                                    action ===
                                    "decrease"
                                ) {

                                    decreaseItem(
                                        index
                                    );

                                }

                                else if (
                                    action ===
                                    "remove"
                                ) {

                                    removeItem(
                                        index
                                    );

                                }

                            }
                        );

                    }
                );

        }


        /* ==================================================
           INCREASE
        ================================================== */

        function increaseItem(
            index
        ) {

            const item =
                POS.cart[
                    index
                ];


            if (!item) {

                return;

            }


            const product =
                POS.products[
                    item.productId
                ];


            const stock =
                productStock(
                    product
                );


            if (
                stock !== null &&
                item.quantity >= stock
            ) {

                status(
                    "Maximum available stock reached."
                );

                return;

            }


            item.quantity += 1;


            renderCart();

            updateSummary();

        }


        /* ==================================================
           DECREASE
        ================================================== */

        function decreaseItem(
            index
        ) {

            const item =
                POS.cart[
                    index
                ];


            if (!item) {

                return;

            }


            item.quantity -= 1;


            if (
                item.quantity <= 0
            ) {

                POS.cart.splice(
                    index,
                    1
                );

            }


            renderCart();

            updateSummary();

        }


        /* ==================================================
           REMOVE
        ================================================== */

        function removeItem(
            index
        ) {

            if (
                !POS.cart[index]
            ) {

                return;

            }


            POS.cart.splice(
                index,
                1
            );


            renderCart();

            updateSummary();

        }


        /* ==================================================
           CLEAR CART
        ================================================== */

        function clearCart(
            confirmClear = true
        ) {

            if (
                POS.cart.length === 0
            ) {

                return;

            }


            if (
                confirmClear &&
                !window.confirm(
                    "Clear the current order?"
                )
            ) {

                return;

            }


            POS.cart = [];

            POS.discount = 0;

            POS.customer =
                "Walk-in Customer";


            const discountInput =
                el(
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
                el(
                    "posAmountReceived"
                );


            if (amountInput) {

                amountInput.value =
                    "";

            }


            const customerInput =
                el(
                    "posCustomerName"
                );


            if (customerInput) {

                customerInput.value =
                    "";

            }


            renderCart();

            updateSummary();

            updatePayment();

            updateOrderNumber();

        }


        /* ==================================================
           SUBTOTAL
        ================================================== */

        function subtotal() {

            return POS.cart.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        (
                            number(
                                item.price
                            ) *
                            number(
                                item.quantity
                            )
                        )
                    );

                },
                0
            );

        }


        /* ==================================================
           DISCOUNT
        ================================================== */

        function discount() {

            const input =
                el(
                    "posDiscount"
                );


            let value =
                input &&
                input.tagName ===
                "INPUT"

                ? number(
                    input.value
                )

                : POS.discount;


            value =
                Math.max(
                    0,
                    Math.min(
                        value,
                        subtotal()
                    )
                );


            POS.discount =
                value;


            return value;

        }


        /* ==================================================
           TOTAL
        ================================================== */

        function grandTotal() {

            return Math.max(
                0,
                subtotal() -
                discount()
            );

        }


        /* ==================================================
           SUMMARY
        ================================================== */

        function updateSummary() {

            const sub =
                subtotal();


            const disc =
                discount();


            const total =
                grandTotal();


            const subtotalEl =
                el(
                    "posSubtotal"
                );


            if (subtotalEl) {

                subtotalEl.textContent =
                    money(
                        sub
                    );

            }


            const discountEl =
                el(
                    "posDiscount"
                );


            if (
                discountEl &&
                discountEl.tagName !==
                "INPUT"
            ) {

                discountEl.textContent =
                    money(
                        disc
                    );

            }


            const discountAmount =
                el(
                    "posDiscountAmount"
                );


            if (discountAmount) {

                discountAmount.textContent =
                    money(
                        disc
                    );

            }


            const totalEl =
                el(
                    "posTotal"
                );


            if (totalEl) {

                totalEl.textContent =
                    money(
                        total
                    );

            }


            const grandTotalEl =
                el(
                    "posGrandTotal"
                );


            if (grandTotalEl) {

                grandTotalEl.textContent =
                    money(
                        total
                    );

            }


            updatePayment();

        }


        /* ==================================================
           PAYMENT METHOD
        ================================================== */

        function setPaymentMethod(
            method
        ) {

            const value =
                String(
                    method || "Cash"
                )
                .toLowerCase();


            if (
                value.includes(
                    "cash"
                )
            ) {

                POS.paymentMethod =
                    "Cash";

            }

            else if (
                value.includes(
                    "card"
                )
            ) {

                POS.paymentMethod =
                    "Card";

            }

            else if (
                value.includes(
                    "gcash"
                )
            ) {

                POS.paymentMethod =
                    "GCash";

            }

            else {

                POS.paymentMethod =
                    "Other";

            }


            document
                .querySelectorAll(
                    ".pos-payment-method-btn"
                )
                .forEach(
                    button => {

                        const buttonValue =
                            String(
                                button.dataset.paymentMethod ||
                                button.dataset.method ||
                                button.textContent ||
                                ""
                            )
                            .toLowerCase();


                        button.classList.toggle(
                            "active",

                            buttonValue.includes(
                                POS.paymentMethod.toLowerCase()
                            )

                        );

                    }
                );


            updatePayment();

        }


        /* ==================================================
           AMOUNT RECEIVED
        ================================================== */

        function paymentAmount() {

            const input =
                el(
                    "posAmountReceived"
                );


            return input
                ? Math.max(
                    0,
                    number(
                        input.value
                    )
                )
                : 0;

        }


        /* ==================================================
           CHANGE
        ================================================== */

        function changeAmount() {

            return Math.max(
                0,
                paymentAmount() -
                grandTotal()
            );

        }


        /* ==================================================
           UPDATE PAYMENT
        ================================================== */

        function updatePayment() {

            const total =
                grandTotal();


            const payment =
                paymentAmount();


            const change =
                Math.max(
                    0,
                    payment - total
                );


            [
                "posPaymentTotal",
                "posFinalTotal",
                "posTotalPayment",
                "posModalTotal"
            ]
                .forEach(
                    id => {

                        const target =
                            el(id);


                        if (target) {

                            target.textContent =
                                money(
                                    total
                                );

                        }

                    }
                );


            const changeEl =
                el(
                    "posChange"
                );


            if (changeEl) {

                changeEl.textContent =
                    money(
                        change
                    );

            }


            const modalChange =
                el(
                    "posModalChange"
                );


            if (modalChange) {

                modalChange.textContent =
                    money(
                        change
                    );

            }


            const payButton =
                el(
                    "posPayBtn"
                );


            if (payButton) {

                payButton.disabled =

                    POS.processing ||

                    POS.cart.length === 0 ||

                    payment < total;

            }

        }


        /* ==================================================
           CUSTOMER
        ================================================== */

        function updateCustomer() {

            const input =
                el(
                    "posCustomerName"
                );


            POS.customer =

                String(
                    input?.value || ""
                ).trim()

                ||

                "Walk-in Customer";

        }


        /* ==================================================
           STOCK VALIDATION
        ================================================== */

        function validateStock() {

            for (
                const item of
                POS.cart
            ) {

                const product =
                    POS.products[
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
                    productStock(
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


        /* ==================================================
           UPDATE STOCK
        ================================================== */

        async function updateProductStocks() {

            const updates = {};


            POS.cart.forEach(
                item => {

                    const product =
                        POS.products[
                            item.productId
                        ];


                    if (!product) {

                        return;

                    }


                    const stock =
                        productStock(
                            product
                        );


                    if (
                        stock === null
                    ) {

                        return;

                    }


                    updates[
                        `products/${item.productId}/stock`
                    ] =
                        Math.max(
                            0,
                            stock -
                            item.quantity
                        );


                    updates[
                        `products/${item.productId}/updatedAt`
                    ] =
                        firebase
                            .database
                            .ServerValue
                            .TIMESTAMP;

                }
            );


            if (
                Object.keys(
                    updates
                ).length === 0
            ) {

                return;

            }


            await window.db
                .ref()
                .update(
                    updates
                );

        }


        /* ==================================================
           PROCESS PAYMENT
        ================================================== */

        async function processPayment() {

            if (
                POS.processing
            ) {

                return;

            }


            if (
                POS.cart.length === 0
            ) {

                status(
                    "Please add products to the order."
                );

                return;

            }


            const total =
                grandTotal();


            const payment =
                paymentAmount();


            if (
                payment < total
            ) {

                status(
                    "Payment amount is not enough."
                );

                return;

            }


            try {

                await waitForFirebase();


                const stockCheck =
                    validateStock();


                if (
                    !stockCheck.valid
                ) {

                    status(
                        stockCheck.message
                    );

                    return;

                }


                POS.processing =
                    true;


                updatePayment();


                const payButton =
                    el(
                        "posPayBtn"
                    );


                const originalHTML =
                    payButton
                    ? payButton.innerHTML
                    : "";


                if (payButton) {

                    payButton.innerHTML = `

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        PROCESSING

                    `;

                }


                updateCustomer();


                const orderNumber =
                    generateOrderNumber();


                const saleRef =
                    window.db
                        .ref("sales")
                        .push();


                const saleId =
                    saleRef.key;


                const saleItems =
                    POS.cart.map(
                        item => ({

                            productId:
                                item.productId,

                            name:
                                item.name,

                            category:
                                item.category,

                            price:
                                number(
                                    item.price
                                ),

                            quantity:
                                number(
                                    item.quantity
                                ),

                            total:
                                number(
                                    item.price
                                ) *
                                number(
                                    item.quantity
                                )

                        })
                    );


                const saleData = {

                    id:
                        saleId,

                    orderNumber,

                    customer:
                        POS.customer,

                    customerName:
                        POS.customer,

                    items:
                        saleItems,

                    subtotal:
                        subtotal(),

                    discount:
                        discount(),

                    tax:
                        0,

                    total,

                    payment,

                    amountReceived:
                        payment,

                    change:
                        payment - total,

                    paymentMethod:
                        POS.paymentMethod,

                    status:
                        "Paid",

                    source:
                        "POS",

                    createdAt:
                        firebase
                            .database
                            .ServerValue
                            .TIMESTAMP

                };


                /* ==========================================
                   SAVE SALE
                ========================================== */

                await saleRef.set(
                    saleData
                );


                /* ==========================================
                   UPDATE STOCK
                ========================================== */

                await updateProductStocks();


                /* ==========================================
                   SAVE LAST SALE
                ========================================== */

                POS.lastSale =
                    saleData;


                window.currentPOSReceipt =
                    saleData;


                /* ==========================================
                   RECEIPT
                ========================================== */

                showReceipt(
                    saleData
                );


                /* ==========================================
                   RESET ORDER
                ========================================== */

                POS.cart = [];

                POS.discount = 0;

                POS.customer =
                    "Walk-in Customer";


                const customerInput =
                    el(
                        "posCustomerName"
                    );


                if (customerInput) {

                    customerInput.value =
                        "";

                }


                const discountInput =
                    el(
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
                    el(
                        "posAmountReceived"
                    );


                if (amountInput) {

                    amountInput.value =
                        "";

                }


                renderCart();

                updateSummary();

                updateOrderNumber();


                /* ==========================================
                   REFRESH PRODUCTS
                ========================================== */

                await loadProducts();


                status(
                    "Payment completed successfully."
                );


                if (payButton) {

                    payButton.innerHTML =
                        originalHTML;

                }

            }

            catch (err) {

                console.error(
                    "PAPPRITO POS PAYMENT ERROR:",
                    err
                );


                status(
                    "Unable to complete payment."
                );


                window.alert(
                    "Unable to complete payment.\n\n" +
                    (
                        err?.message ||
                        err
                    )
                );

            }

            finally {

                POS.processing =
                    false;


                updatePayment();

            }

        }


        /* ==================================================
           RECEIPT HTML
        ================================================== */

        function receiptHTML(
            sale
        ) {

            const items =
                (sale.items || [])
                .map(
                    item => `

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                gap:12px;
                                padding:6px 0;
                                border-bottom:1px dashed #ddd;
                            ">

                            <div>

                                <div
                                    style="
                                        font-weight:700;
                                    ">

                                    ${escapeHTML(
                                        item.name
                                    )}

                                </div>

                                <div
                                    style="
                                        font-size:11px;
                                        color:#777;
                                    ">

                                    ${item.quantity}
                                    ×
                                    ${money(
                                        item.price
                                    )}

                                </div>

                            </div>


                            <strong>

                                ${money(
                                    item.total
                                )}

                            </strong>

                        </div>

                    `
                )
                .join("");


            return `

                <div
                    style="
                        max-width:380px;
                        margin:auto;
                        font-family:Arial,sans-serif;
                        color:#222;
                    ">

                    <div
                        style="
                            text-align:center;
                            padding-bottom:10px;
                        ">

                        <div
                            style="
                                font-size:26px;
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


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            font-size:12px;
                            gap:10px;
                        ">

                        <span>
                            Order
                        </span>

                        <strong>
                            ${escapeHTML(
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
                            gap:10px;
                        ">

                        <span>
                            Customer
                        </span>

                        <strong>
                            ${escapeHTML(
                                sale.customer ||
                                "Walk-in Customer"
                            )}
                        </strong>

                    </div>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            font-size:12px;
                            margin-top:5px;
                            gap:10px;
                        ">

                        <span>
                            Payment
                        </span>

                        <strong>
                            ${escapeHTML(
                                sale.paymentMethod
                            )}
                        </strong>

                    </div>


                    <hr>


                    ${items}


                    <hr>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:4px 0;
                        ">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${money(
                                sale.subtotal
                            )}
                        </strong>

                    </div>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:4px 0;
                        ">

                        <span>
                            Discount
                        </span>

                        <strong>
                            ${money(
                                sale.discount
                            )}
                        </strong>

                    </div>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:8px 0;
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

                            ${money(
                                sale.total
                            )}

                        </strong>

                    </div>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:4px 0;
                        ">

                        <span>
                            Amount Received
                        </span>

                        <strong>
                            ${money(
                                sale.amountReceived
                            )}
                        </strong>

                    </div>


                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:4px 0;
                        ">

                        <span>
                            Change
                        </span>

                        <strong>
                            ${money(
                                sale.change
                            )}
                        </strong>

                    </div>


                    <div
                        style="
                            text-align:center;
                            margin-top:18px;
                            font-weight:700;
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


        /* ==================================================
           SHOW RECEIPT
        ================================================== */

        function showReceipt(
            sale
        ) {

            const content =
                el(
                    "posReceiptContent"
                );


            if (content) {

                content.innerHTML =
                    receiptHTML(
                        sale
                    );

            }


            const modal =
                el(
                    "posReceiptModal"
                );


            if (
                modal &&
                typeof bootstrap !==
                "undefined"
            ) {

                const instance =
                    bootstrap.Modal
                        .getOrCreateInstance(
                            modal
                        );


                instance.show();


                return;

            }

        }


        /* ==================================================
           PRINT RECEIPT
        ================================================== */

        function printReceipt(
            sale
        ) {

            sale =
                sale ||
                POS.lastSale ||
                window.currentPOSReceipt;


            if (!sale) {

                status(
                    "No receipt available."
                );

                return;

            }


            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=420,height=700"
                );


            if (!printWindow) {

                window.alert(
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
                            margin:5mm;
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
                            }

                        }

                    </style>

                </head>


                <body>

                    ${receiptHTML(
                        sale
                    )}


                    <script>

                        window.onload =
                            function () {

                                window.print();

                            };

                    <\/script>

                </body>

                </html>

            `);


            printWindow.document.close();

        }


        /* ==================================================
           REFRESH
        ================================================== */

        async function refreshPOS() {

            const button =
                el(
                    "posRefreshProductsBtn"
                );


            const original =
                button
                ? button.innerHTML
                : "";


            try {

                if (button) {

                    button.disabled =
                        true;


                    button.innerHTML = `

                        <i
                            class="
                                fa-solid
                                fa-spinner
                                fa-spin
                            "
                        ></i>

                    `;

                }


                await waitForFirebase();


                await Promise.all([

                    loadCategories(),

                    loadProducts()

                ]);


                status(
                    "POS data refreshed."
                );

            }

            catch (err) {

                console.error(
                    "POS refresh error:",
                    err
                );


                status(
                    "Unable to refresh POS."
                );

            }

            finally {

                if (button) {

                    button.disabled =
                        false;


                    button.innerHTML =
                        original ||

                        `<i class="fa-solid fa-rotate"></i>`;

                }

            }

        }


        /* ==================================================
           KEYPAD
        ================================================== */

        function initializeKeypad() {

            document
                .querySelectorAll(
                    "[data-key]"
                )
                .forEach(
                    button => {

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
                            () => {

                                const key =
                                    button.dataset.key;


                                const input =
                                    el(
                                        "posAmountReceived"
                                    );


                                if (!input) {

                                    return;

                                }


                                if (
                                    key ===
                                    "clear"
                                ) {

                                    input.value =
                                        "";

                                }

                                else if (
                                    key ===
                                    "backspace"
                                ) {

                                    input.value =
                                        input.value.slice(
                                            0,
                                            -1
                                        );

                                }

                                else {

                                    input.value +=
                                        key;

                                }


                                updatePayment();

                            }
                        );

                    }
                );

        }


        /* ==================================================
           SEARCH
        ================================================== */

        function bindSearch() {

            const input =
                el(
                    "posProductSearch"
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
                renderProducts
            );

        }


        /* ==================================================
           REFRESH BUTTON
        ================================================== */

        function bindRefresh() {

            const button =
                el(
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


        /* ==================================================
           CLEAR BUTTON
        ================================================== */

        function bindClear() {

            const button =
                el(
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
                () =>
                    clearCart(
                        true
                    )
            );

        }


        /* ==================================================
           CUSTOMER
        ================================================== */

        function bindCustomer() {

            const input =
                el(
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
                updateCustomer
            );

        }


        /* ==================================================
           DISCOUNT
        ================================================== */

        function bindDiscount() {

            const input =
                el(
                    "posDiscount"
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
                () => {

                    POS.discount =
                        number(
                            input.value
                        );


                    updateSummary();

                }
            );

        }


        /* ==================================================
           PAYMENT INPUT
        ================================================== */

        function bindPaymentInput() {

            const input =
                el(
                    "posAmountReceived"
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
                updatePayment
            );

        }


        /* ==================================================
           PAYMENT METHODS
        ================================================== */

        function bindPaymentMethods() {

            document
                .querySelectorAll(
                    ".pos-payment-method-btn"
                )
                .forEach(
                    button => {

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
                            () => {

                                setPaymentMethod(

                                    button.dataset.paymentMethod ||

                                    button.dataset.method ||

                                    button.textContent

                                );

                            }
                        );

                    }
                );

        }


        /* ==================================================
           PAY BUTTON
        ================================================== */

        function bindPay() {

            const button =
                el(
                    "posPayBtn"
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
                processPayment
            );

        }


        /* ==================================================
           PRINT BUTTON
        ================================================== */

        function bindPrint() {

            const button =
                el(
                    "posPrintReceiptBtn"
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
                () =>
                    printReceipt(
                        POS.lastSale
                    )
            );

        }


        /* ==================================================
           MODAL PAYMENT
        ================================================== */

        function bindModalPayment() {

            const input =
                el(
                    "posModalAmountReceived"
                );


            const mainInput =
                el(
                    "posAmountReceived"
                );


            if (
                input &&
                input.dataset.posBound !==
                "true"
            ) {

                input.dataset.posBound =
                    "true";


                input.addEventListener(
                    "input",
                    () => {

                        const total =
                            grandTotal();


                        const amount =
                            number(
                                input.value
                            );


                        const change =
                            Math.max(
                                0,
                                amount -
                                total
                            );


                        const changeEl =
                            el(
                                "posModalChange"
                            );


                        if (changeEl) {

                            changeEl.textContent =
                                money(
                                    change
                                );

                        }

                    }
                );

            }


            const confirm =
                el(
                    "posConfirmPaymentBtn"
                );


            if (
                confirm &&
                confirm.dataset.posBound !==
                "true"
            ) {

                confirm.dataset.posBound =
                    "true";


                confirm.addEventListener(
                    "click",
                    () => {

                        if (
                            input &&
                            mainInput
                        ) {

                            mainInput.value =
                                input.value;

                        }


                        processPayment();

                    }
                );

            }

        }


        /* ==================================================
           HOLD ORDER
        ================================================== */

        function holdOrder() {

            if (
                POS.cart.length === 0
            ) {

                status(
                    "There is no order to hold."
                );

                return;

            }


            const data = {

                orderNumber:
                    generateOrderNumber(),

                customer:
                    POS.customer,

                cart:
                    POS.cart,

                discount:
                    POS.discount,

                savedAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                "papprito_pos_held_order",
                JSON.stringify(
                    data
                )
            );


            clearCart(
                false
            );


            status(
                "Order placed on hold."
            );

        }


        /* ==================================================
           RECALL ORDER
        ================================================== */

        function recallOrder() {

            const stored =
                localStorage.getItem(
                    "papprito_pos_held_order"
                );


            if (!stored) {

                status(
                    "No held order found."
                );

                return;

            }


            try {

                const data =
                    JSON.parse(
                        stored
                    );


                POS.cart =
                    Array.isArray(
                        data.cart
                    )
                    ? data.cart
                    : [];


                POS.discount =
                    number(
                        data.discount
                    );


                POS.customer =
                    data.customer ||
                    "Walk-in Customer";


                const customerInput =
                    el(
                        "posCustomerName"
                    );


                if (customerInput) {

                    customerInput.value =
                        POS.customer;

                }


                const discountInput =
                    el(
                        "posDiscount"
                    );


                if (discountInput) {

                    discountInput.value =
                        POS.discount ||
                        "";

                }


                localStorage.removeItem(
                    "papprito_pos_held_order"
                );


                renderCart();

                updateSummary();


                status(
                    "Held order recalled."
                );

            }

            catch (err) {

                console.error(
                    "POS recall error:",
                    err
                );


                status(
                    "Unable to recall held order."
                );

            }

        }


        /* ==================================================
           HOLD / RECALL BINDINGS
        ================================================== */

        function bindHoldRecall() {

            const hold =
                el(
                    "posHoldBtn"
                );


            if (
                hold &&
                hold.dataset.posBound !==
                "true"
            ) {

                hold.dataset.posBound =
                    "true";


                hold.addEventListener(
                    "click",
                    holdOrder
                );

            }


            const recall =
                el(
                    "posRecallBtn"
                );


            if (
                recall &&
                recall.dataset.posBound !==
                "true"
            ) {

                recall.dataset.posBound =
                    "true";


                recall.addEventListener(
                    "click",
                    recallOrder
                );

            }

        }


        /* ==================================================
           FULLSCREEN
        ================================================== */

        async function toggleFullscreen() {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    if (
                        document.documentElement
                            .requestFullscreen
                    ) {

                        await document.documentElement
                            .requestFullscreen();

                    }

                }

                else {

                    if (
                        document.exitFullscreen
                    ) {

                        await document.exitFullscreen();

                    }

                }

            }

            catch (err) {

                console.warn(
                    "Fullscreen unavailable:",
                    err
                );

            }

        }


        /* ==================================================
           FULLSCREEN BUTTON
        ================================================== */

        function bindFullscreen() {

            const button =
                el(
                    "posFullscreenBtn"
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
                toggleFullscreen
            );

        }


        /* ==================================================
           CLOCK
        ================================================== */

        function updateClock() {

            const target =
                el(
                    "posDateTime"
                );


            if (!target) {

                return;

            }


            target.textContent =
                new Date()
                    .toLocaleString(
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


        function startClock() {

            updateClock();


            clearInterval(
                window.pappritoPOSClock
            );


            window.pappritoPOSClock =
                setInterval(
                    updateClock,
                    1000
                );

        }


        /* ==================================================
           ALL EVENTS
        ================================================== */

        function bindEvents() {

            bindSearch();

            bindRefresh();

            bindClear();

            bindCustomer();

            bindDiscount();

            bindPaymentInput();

            bindPaymentMethods();

            bindPay();

            bindPrint();

            bindModalPayment();

            bindHoldRecall();

            bindFullscreen();

            initializeKeypad();

        }


        /* ==================================================
           INITIALIZE POS
        ================================================== */

        async function initializePOS() {

            /*
               Important:
               app.js calls this function.

               If another script calls it again,
               initialization is ignored safely.
            */

            if (
                POS.initialized
            ) {

                console.log(
                    "PAPPRITO POS already initialized."
                );

                return;

            }


            if (
                POS.initializing
            ) {

                console.log(
                    "PAPPRITO POS initialization already running."
                );

                return;

            }


            POS.initializing =
                true;


            console.log(
                "=========================================="
            );


            console.log(
                "PAPPRITO POS V3 INITIALIZING..."
            );


            console.log(
                "=========================================="
            );


            try {

                /* ==========================================
                   WAIT FIREBASE
                ========================================== */

                await waitForFirebase();


                /* ==========================================
                   EVENTS
                ========================================== */

                bindEvents();


                /* ==========================================
                   CLOCK
                ========================================== */

                startClock();


                /* ==========================================
                   ORDER
                ========================================== */

                updateOrderNumber();


                /* ==========================================
                   INITIAL PAYMENT METHOD
                ========================================== */

                setPaymentMethod(
                    POS.paymentMethod
                );


                /* ==========================================
                   INITIAL UI
                ========================================== */

                renderCart();

                updateSummary();


                /* ==========================================
                   LOAD DATA
                ========================================== */

                await Promise.all([

                    loadCategories(),

                    loadProducts()

                ]);


                /* ==========================================
                   FINAL UI
                ========================================== */

                renderCategories();

                renderProducts();

                renderCart();

                updateSummary();

                updatePayment();


                POS.initialized =
                    true;


                console.log(
                    "=========================================="
                );


                console.log(
                    "PAPPRITO POS V3 READY."
                );


                console.log(
                    "Products:",
                    Object.keys(
                        POS.products
                    ).length
                );


                console.log(
                    "Categories:",
                    Object.keys(
                        POS.categories
                    ).length
                );


                console.log(
                    "=========================================="
                );


            }

            catch (err) {

                console.error(
                    "PAPPRITO POS INITIALIZATION ERROR:",
                    err
                );


                const categoryContainer =
                    el(
                        "posCategories"
                    );


                const productContainer =
                    el(
                        "posProducts"
                    );


                if (categoryContainer) {

                    categoryContainer.innerHTML = `

                        <div class="pos-loading">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                            <strong>
                                Firebase is not ready
                            </strong>

                            <span>
                                Please refresh the POS.
                            </span>

                        </div>

                    `;

                }


                if (productContainer) {

                    productContainer.innerHTML = `

                        <div class="pos-loading">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                            <strong>
                                Products unavailable
                            </strong>

                            <span>
                                Firebase connection is required.
                            </span>

                        </div>

                    `;

                }


                status(
                    "Firebase is not ready."
                );

            }

            finally {

                POS.initializing =
                    false;

            }

        }


        /* ==================================================
           PUBLIC API
        ================================================== */

        window.initializePOS =
            initializePOS;


        window.loadPOSProducts =
            loadProducts;


        window.loadPOSCategories =
            loadCategories;


        window.renderPOSProducts =
            renderProducts;


        window.renderPOSCategories =
            renderCategories;


        window.filterPOSCategory =
            filterCategory;


        window.addPOSToCart =
            addToCart;


        window.increasePOSItem =
            increaseItem;


        window.decreasePOSItem =
            decreaseItem;


        window.removePOSItem =
            removeItem;


        window.clearPOSCart =
            clearCart;


        window.setPOSPaymentMethod =
            setPaymentMethod;


        window.processPOSPayment =
            processPayment;


        window.refreshPOS =
            refreshPOS;


        window.printPOSReceipt =
            printReceipt;


        window.showPOSReceipt =
            showReceipt;


        window.holdPOSOrder =
            holdOrder;


        window.recallPOSOrder =
            recallOrder;


        window.togglePOSFullscreen =
            toggleFullscreen;


        /* ==================================================
           DIRECT POS SUPPORT
           
           Only initialize automatically when this script
           is used independently and app.js is NOT controlling
           initialization.
        ================================================== */

        function autoInitializeStandalone() {

            /*
               app.js will call initializePOS().
               Therefore we don't immediately initialize
               from DOMContentLoaded when the script is loaded
               dynamically by app.js.
            */

            if (
                window.PAPPRITO_APP_ENGINE_ACTIVE
            ) {

                return;

            }


            if (
                document.readyState ===
                "loading"
            ) {

                document.addEventListener(
                    "DOMContentLoaded",
                    () => {

                        initializePOS();

                    },
                    {
                        once: true
                    }
                );

            }

            else {

                initializePOS();

            }

        }


        /*
           We intentionally do NOT auto initialize here
           if app.js is present.
        */

        if (
            !window.PAPPRITO_APP_ENGINE_ACTIVE
        ) {

            autoInitializeStandalone();

        }


        console.log(
            "PAPPRITO POS V3 ENGINE LOADED."
        );

    })();

}
