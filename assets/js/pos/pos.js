// ==========================================================
// PAPPRITO ERP
// POS ENGINE V3
// File : assets/js/pos/pos.js
//
// CART FORMAT:
//
// SN | ITEMS | QTY | TOTAL | ACTIONS
//
// ACTIONS:
// -
// +
// DELETE
//
// Firebase:
// products/
// categories/
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let posProducts = [];

let posCategories = [];

let posCart = [];

let posSelectedCategory = "ALL";

let posPaymentMethod = "Cash";

let posOrderNumber = "";


// ==========================================================
// HELPERS
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
// ESCAPE HTML
// ==========================================================

function posEscape(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ==========================================================
// GET PRODUCT NAME
// ==========================================================

function getProductName(product) {

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

function getProductPrice(product) {

    return Number(
        product.sellingPrice ??
        product.price ??
        product.salePrice ??
        0
    ) || 0;

}


// ==========================================================
// GET PRODUCT CATEGORY
// ==========================================================

function getProductCategory(product) {

    return String(
        product.category ||
        product.categoryName ||
        product.categoryId ||
        ""
    )
    .trim();

}


// ==========================================================
// GET PRODUCT IMAGE
// ==========================================================

function getProductImage(product) {

    return (
        product.imageURL ||
        product.imageUrl ||
        product.image ||
        product.productImage ||
        "../assets/img/no-product.png"
    );

}


// ==========================================================
// GENERATE ORDER NUMBER
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

    const random =
        Math.floor(
            Math.random() * 9000
        ) + 1000;

    return (
        "POS-" +
        year +
        month +
        day +
        "-" +
        time +
        "-" +
        random
    );

}


// ==========================================================
// STATUS
// ==========================================================

function showPOSStatus(
    message,
    type = "success"
) {

    const status =
        document.getElementById(
            "posStatus"
        );

    if (!status) {

        return;

    }

    status.textContent =
        message;

    status.className =
        "pos-status " +
        "pos-status-" +
        type;

    clearTimeout(
        window.posStatusTimer
    );

    window.posStatusTimer =
        setTimeout(
            function () {

                status.textContent =
                    "";

                status.className =
                    "pos-status";

            },
            2500
        );

}


// ==========================================================
// FIREBASE CHECK
// ==========================================================

function checkPOSFirebase() {

    if (
        typeof firebase ===
        "undefined"
    ) {

        return false;

    }

    if (
        typeof db ===
        "undefined" ||
        !db
    ) {

        return false;

    }

    return true;

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadPOSCategories() {

    const container =
        document.getElementById(
            "posCategories"
        );

    if (!container) {

        return;

    }

    container.innerHTML = `

        <div class="pos-loading">

            <div
                class="
                    spinner-border
                    text-danger
                ">
            </div>

            <span>
                Loading categories...
            </span>

        </div>

    `;


    if (
        !checkPOSFirebase()
    ) {

        container.innerHTML = `

            <div class="pos-error">

                <i
                    class="
                        fa-solid
                        fa-triangle-exclamation
                    ">
                </i>

                <strong>
                    Firebase is not ready
                </strong>

                <span>
                    Please refresh the POS.
                </span>

            </div>

        `;

        return;

    }


    try {

        const snapshot =
            await db
                .ref("categories")
                .once("value");


        const data =
            snapshot.val() || {};


        posCategories =
            Object.entries(data)
            .map(
                function (
                    [
                        id,
                        value
                    ]
                ) {

                    return {

                        categoryId:
                            id,

                        ...value

                    };

                }
            )
            .filter(
                function (category) {

                    return (
                        category.status !==
                        "Inactive"
                    );

                }
            );


        renderPOSCategories();

    }

    catch (error) {

        console.error(
            "POS Category Error:",
            error
        );


        container.innerHTML = `

            <div class="pos-error">

                <i
                    class="
                        fa-solid
                        fa-triangle-exclamation
                    ">
                </i>

                <strong>
                    Unable to load categories
                </strong>

                <span>
                    ${posEscape(
                        error.message
                    )}
                </span>

            </div>

        `;

    }

}


// ==========================================================
// RENDER CATEGORIES
// ==========================================================

function renderPOSCategories() {

    const container =
        document.getElementById(
            "posCategories"
        );

    if (!container) {

        return;

    }


    let html = `

        <button
            type="button"
            class="
                pos-category-btn
                ${
                    posSelectedCategory ===
                    "ALL"
                        ? "active"
                        : ""
                }
            "
            data-category="ALL">

            <i
                class="
                    fa-solid
                    fa-border-all
                ">
            </i>

            <span>
                All Products
            </span>

        </button>

    `;


    posCategories.forEach(
        function (category) {

            const categoryName =
                category.name ||
                category.categoryName ||
                category.title ||
                "Unnamed Category";


            html += `

                <button
                    type="button"
                    class="
                        pos-category-btn
                        ${
                            posSelectedCategory ===
                            categoryName
                                ? "active"
                                : ""
                        }
                    "
                    data-category="${posEscape(
                        categoryName
                    )}">

                    <i
                        class="
                            fa-solid
                            fa-tag
                        ">
                    </i>

                    <span>

                        ${posEscape(
                            categoryName
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


// ==========================================================
// CATEGORY BUTTONS
// ==========================================================

function bindCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            ".pos-category-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const category =
                        button.dataset.category ||
                        "ALL";


                    posSelectedCategory =
                        category;


                    renderPOSCategories();

                    renderPOSProducts();

                }
            );

        }
    );

}


// ==========================================================
// LOAD PRODUCTS
// ==========================================================

async function loadPOSProducts() {

    const container =
        document.getElementById(
            "posProducts"
        );

    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="pos-loading">

            <div
                class="
                    spinner-border
                    text-danger
                ">
            </div>

            <span>
                Loading products...
            </span>

        </div>

    `;


    if (
        !checkPOSFirebase()
    ) {

        container.innerHTML = `

            <div class="pos-error">

                <i
                    class="
                        fa-solid
                        fa-triangle-exclamation
                    ">
                </i>

                <strong>
                    Products unavailable
                </strong>

                <span>
                    Firebase connection is required.
                </span>

            </div>

        `;

        return;

    }


    try {

        const snapshot =
            await db
                .ref("products")
                .once("value");


        const data =
            snapshot.val() || {};


        posProducts =
            Object.entries(data)
            .map(
                function (
                    [
                        id,
                        value
                    ]
                ) {

                    return {

                        productId:
                            id,

                        ...value

                    };

                }
            )
            .filter(
                function (product) {

                    return (
                        product.status ===
                        undefined ||
                        product.status ===
                        "Active"
                    );

                }
            );


        renderPOSProducts();

    }

    catch (error) {

        console.error(
            "POS Product Error:",
            error
        );


        container.innerHTML = `

            <div class="pos-error">

                <i
                    class="
                        fa-solid
                        fa-triangle-exclamation
                    ">
                </i>

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

}


// ==========================================================
// GET FILTERED PRODUCTS
// ==========================================================

function getFilteredPOSProducts() {

    const searchInput =
        document.getElementById(
            "posProductSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    return posProducts.filter(
        function (product) {

            const productName =
                getProductName(
                    product
                )
                .toLowerCase();


            const productCode =
                String(
                    product.productCode ||
                    product.code ||
                    ""
                )
                .toLowerCase();


            const category =
                getProductCategory(
                    product
                )
                .toLowerCase();


            const selected =
                String(
                    posSelectedCategory
                )
                .toLowerCase();


            const matchesSearch =
                !search ||
                productName.includes(
                    search
                ) ||
                productCode.includes(
                    search
                );


            const matchesCategory =
                selected === "all" ||
                category === selected ||
                category.includes(
                    selected
                );


            return (
                matchesSearch &&
                matchesCategory
            );

        }
    );

}


// ==========================================================
// RENDER PRODUCTS
// ==========================================================

function renderPOSProducts() {

    const container =
        document.getElementById(
            "posProducts"
        );

    if (!container) {

        return;

    }


    const products =
        getFilteredPOSProducts();


    if (
        products.length ===
        0
    ) {

        container.innerHTML = `

            <div class="pos-empty-products">

                <i
                    class="
                        fa-solid
                        fa-box-open
                    ">
                </i>

                <strong>
                    No Products Found
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
                function (product) {

                    const name =
                        getProductName(
                            product
                        );


                    const price =
                        getProductPrice(
                            product
                        );


                    const image =
                        getProductImage(
                            product
                        );


                    return `

                        <button
                            type="button"
                            class="
                                pos-product-card
                            "
                            data-product-id="${posEscape(
                                product.productId
                            )}">


                            <div
                                class="
                                    pos-product-image
                                ">

                                <img
                                    src="${posEscape(
                                        image
                                    )}"
                                    alt="${posEscape(
                                        name
                                    )}"
                                    onerror="
                                        this.src='../assets/img/no-product.png'
                                    ">

                            </div>


                            <div
                                class="
                                    pos-product-info
                                ">


                                <strong>

                                    ${posEscape(
                                        name
                                    )}

                                </strong>


                                <span>

                                    ${posMoney(
                                        price
                                    )}

                                </span>


                            </div>


                        </button>

                    `;

                }
            )
            .join("");


    bindProductButtons();

}


// ==========================================================
// PRODUCT BUTTONS
// ==========================================================

function bindProductButtons() {

    const buttons =
        document.querySelectorAll(
            ".pos-product-card"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        button.dataset.productId;


                    addProductToCart(
                        productId
                    );

                }
            );

        }
    );

}


// ==========================================================
// ADD PRODUCT
// ==========================================================

function addProductToCart(
    productId
) {

    const product =
        posProducts.find(
            function (item) {

                return (
                    String(
                        item.productId
                    ) ===
                    String(
                        productId
                    )
                );

            }
        );


    if (!product) {

        showPOSStatus(
            "Product not found.",
            "error"
        );

        return;

    }


    const existing =
        posCart.find(
            function (item) {

                return (
                    String(
                        item.productId
                    ) ===
                    String(
                        productId
                    )
                );

            }
        );


    if (existing) {

        existing.qty += 1;

    }

    else {

        posCart.push({

            productId:
                product.productId,

            name:
                getProductName(
                    product
                ),

            price:
                getProductPrice(
                    product
                ),

            qty:
                1

        });

    }


    renderPOSCart();

    showPOSStatus(
        "Product added.",
        "success"
    );

}


// ==========================================================
// CHANGE QUANTITY
// ==========================================================

function changeCartQuantity(
    productId,
    amount
) {

    const item =
        posCart.find(
            function (cartItem) {

                return (
                    String(
                        cartItem.productId
                    ) ===
                    String(
                        productId
                    )
                );

            }
        );


    if (!item) {

        return;

    }


    item.qty +=
        Number(amount);


    if (
        item.qty <= 0
    ) {

        removeCartItem(
            productId
        );

        return;

    }


    renderPOSCart();

}


// ==========================================================
// REMOVE CART ITEM
// ==========================================================

function removeCartItem(
    productId
) {

    posCart =
        posCart.filter(
            function (item) {

                return (
                    String(
                        item.productId
                    ) !==
                    String(
                        productId
                    )
                );

            }
        );


    renderPOSCart();

}


// ==========================================================
// CLEAR CART
// ==========================================================

function clearPOSCart() {

    if (
        posCart.length ===
        0
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

    renderPOSCart();

    showPOSStatus(
        "Order cleared.",
        "success"
    );

}


// ==========================================================
// RENDER CART
//
// IMPORTANT:
//
// SN | ITEMS | QTY | TOTAL | ACTIONS
//
// ACTIONS ARE AFTER TOTAL.
// ==========================================================

function renderPOSCart() {

    const container =
        document.getElementById(
            "posCart"
        );


    if (!container) {

        return;

    }


    if (
        posCart.length ===
        0
    ) {

        container.innerHTML = `

            <div class="pos-empty-cart">

                <div class="pos-empty-icon">

                    <i
                        class="
                            fa-solid
                            fa-cart-shopping
                        ">
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


        updatePOSTotals();

        return;

    }


    container.innerHTML =
        posCart
            .map(
                function (
                    item,
                    index
                ) {

                    const lineTotal =
                        item.price *
                        item.qty;


                    return `

                        <div
                            class="
                                pos-cart-row
                            "
                            data-product-id="${posEscape(
                                item.productId
                            )}">


                            <!-- SN -->

                            <div
                                class="
                                    cart-col-sn
                                    pos-cart-sn
                                ">

                                ${index + 1}

                            </div>



                            <!-- ITEMS -->

                            <div
                                class="
                                    cart-col-items
                                    pos-cart-item
                                ">


                                <strong>

                                    ${posEscape(
                                        item.name
                                    )}

                                </strong>


                                <small>

                                    ${posMoney(
                                        item.price
                                    )}
                                    each

                                </small>


                            </div>



                            <!-- QTY -->

                            <div
                                class="
                                    cart-col-qty
                                    pos-cart-qty
                                ">

                                <span>

                                    ${item.qty}

                                </span>

                            </div>



                            <!-- TOTAL -->

                            <div
                                class="
                                    cart-col-total
                                    pos-cart-total
                                ">

                                ${posMoney(
                                    lineTotal
                                )}

                            </div>



                            <!-- ACTIONS -->

                            <div
                                class="
                                    cart-col-actions
                                    pos-cart-actions
                                ">


                                <button
                                    type="button"
                                    class="
                                        pos-cart-btn
                                        pos-cart-minus
                                    "
                                    data-action="minus"
                                    data-product-id="${posEscape(
                                        item.productId
                                    )}"
                                    title="Decrease Quantity">


                                    <i
                                        class="
                                            fa-solid
                                            fa-minus
                                        ">
                                    </i>


                                </button>



                                <button
                                    type="button"
                                    class="
                                        pos-cart-btn
                                        pos-cart-plus
                                    "
                                    data-action="plus"
                                    data-product-id="${posEscape(
                                        item.productId
                                    )}"
                                    title="Increase Quantity">


                                    <i
                                        class="
                                            fa-solid
                                            fa-plus
                                        ">
                                    </i>


                                </button>



                                <button
                                    type="button"
                                    class="
                                        pos-cart-btn
                                        pos-cart-delete
                                    "
                                    data-action="delete"
                                    data-product-id="${posEscape(
                                        item.productId
                                    )}"
                                    title="Delete Item">


                                    <i
                                        class="
                                            fa-solid
                                            fa-trash-can
                                        ">
                                    </i>


                                </button>


                            </div>


                        </div>

                    `;

                }
            )
            .join("");


    bindCartButtons();

    updatePOSTotals();

}


// ==========================================================
// CART BUTTONS
// ==========================================================

function bindCartButtons() {

    const buttons =
        document.querySelectorAll(
            "#posCart [data-action]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const action =
                        button.dataset.action;


                    const productId =
                        button.dataset.productId;


                    if (
                        action ===
                        "minus"
                    ) {

                        changeCartQuantity(
                            productId,
                            -1
                        );

                    }


                    else if (
                        action ===
                        "plus"
                    ) {

                        changeCartQuantity(
                            productId,
                            1
                        );

                    }


                    else if (
                        action ===
                        "delete"
                    ) {

                        removeCartItem(
                            productId
                        );

                    }

                }
            );

        }
    );

}


// ==========================================================
// CALCULATE SUBTOTAL
// ==========================================================

function calculatePOSSubtotal() {

    return posCart.reduce(
        function (
            total,
            item
        ) {

            return (
                total +
                (
                    Number(
                        item.price
                    ) || 0
                ) *
                (
                    Number(
                        item.qty
                    ) || 0
                )
            );

        },
        0
    );

}


// ==========================================================
// GET DISCOUNT
// ==========================================================

function getPOSDiscount() {

    const input =
        document.getElementById(
            "posDiscount"
        );


    if (!input) {

        return 0;

    }


    const value =
        Number(
            input.value
        ) || 0;


    return Math.max(
        0,
        value
    );

}


// ==========================================================
// UPDATE TOTALS
// ==========================================================

function updatePOSTotals() {

    const subtotal =
        calculatePOSSubtotal();


    const discount =
        Math.min(
            getPOSDiscount(),
            subtotal
        );


    const tax =
        0;


    const total =
        Math.max(
            0,
            subtotal -
            discount +
            tax
        );


    const subtotalElement =
        document.getElementById(
            "posSubtotal"
        );


    const discountElement =
        document.getElementById(
            "posDiscountAmount"
        );


    const taxElement =
        document.getElementById(
            "posTax"
        );


    const totalElement =
        document.getElementById(
            "posGrandTotal"
        );


    if (
        subtotalElement
    ) {

        subtotalElement.textContent =
            posMoney(
                subtotal
            );

    }


    if (
        discountElement
    ) {

        discountElement.textContent =
            posMoney(
                discount
            );

    }


    if (
        taxElement
    ) {

        taxElement.textContent =
            posMoney(
                tax
            );

    }


    if (
        totalElement
    ) {

        totalElement.textContent =
            posMoney(
                total
            );

    }


    updatePOSChange();

    updatePOSPayButton();

}


// ==========================================================
// GET GRAND TOTAL
// ==========================================================

function getPOSGrandTotal() {

    const subtotal =
        calculatePOSSubtotal();


    const discount =
        Math.min(
            getPOSDiscount(),
            subtotal
        );


    return Math.max(
        0,
        subtotal -
        discount
    );

}


// ==========================================================
// GET AMOUNT RECEIVED
// ==========================================================

function getPOSAmountReceived() {

    const input =
        document.getElementById(
            "posAmountReceived"
        );


    if (!input) {

        return 0;

    }


    return Math.max(
        0,
        Number(
            input.value
        ) || 0
    );

}


// ==========================================================
// UPDATE CHANGE
// ==========================================================

function updatePOSChange() {

    const total =
        getPOSGrandTotal();


    const received =
        getPOSAmountReceived();


    const change =
        Math.max(
            0,
            received -
            total
        );


    const element =
        document.getElementById(
            "posChange"
        );


    if (element) {

        element.textContent =
            posMoney(
                change
            );

    }


    const modalChange =
        document.getElementById(
            "posModalChange"
        );


    if (modalChange) {

        modalChange.textContent =
            posMoney(
                change
            );

    }

}


// ==========================================================
// UPDATE PAY BUTTON
// ==========================================================

function updatePOSPayButton() {

    const button =
        document.getElementById(
            "posPayBtn"
        );


    if (!button) {

        return;

    }


    const total =
        getPOSGrandTotal();


    const received =
        getPOSAmountReceived();


    button.disabled =
        posCart.length === 0 ||
        total <= 0 ||
        received < total;

}


// ==========================================================
// PAYMENT METHOD
// ==========================================================

function setupPaymentMethods() {

    const buttons =
        document.querySelectorAll(
            ".pos-payment-method-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    posPaymentMethod =
                        button.dataset.paymentMethod ||
                        "Cash";


                    updatePOSPaymentFields();

                }
            );

        }
    );

}


// ==========================================================
// PAYMENT FIELD BEHAVIOR
// ==========================================================

function updatePOSPaymentFields() {

    const amountInput =
        document.getElementById(
            "posAmountReceived"
        );


    if (!amountInput) {

        return;

    }


    if (
        posPaymentMethod ===
        "Cash"
    ) {

        amountInput.disabled =
            false;

    }

    else {

        const total =
            getPOSGrandTotal();


        amountInput.value =
            total
                ? total.toFixed(2)
                : "";


        amountInput.disabled =
            false;

    }


    updatePOSChange();

    updatePOSPayButton();

}


// ==========================================================
// SEARCH
// ==========================================================

function setupPOSSearch() {

    const input =
        document.getElementById(
            "posProductSearch"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            renderPOSProducts();

        }
    );

}


// ==========================================================
// REFRESH PRODUCTS
// ==========================================================

function setupPOSRefresh() {

    const button =
        document.getElementById(
            "posRefreshProductsBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async function () {

            button.classList.add(
                "is-loading"
            );


            try {

                await Promise.all(
                    [
                        loadPOSCategories(),
                        loadPOSProducts()
                    ]
                );


                showPOSStatus(
                    "Products refreshed.",
                    "success"
                );

            }

            finally {

                button.classList.remove(
                    "is-loading"
                );

            }

        }
    );

}


// ==========================================================
// DISCOUNT
// ==========================================================

function setupPOSDiscount() {

    const input =
        document.getElementById(
            "posDiscount"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            updatePOSTotals();

        }
    );

}


// ==========================================================
// AMOUNT RECEIVED
// ==========================================================

function setupPOSAmountReceived() {

    const input =
        document.getElementById(
            "posAmountReceived"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            updatePOSChange();

            updatePOSPayButton();

        }
    );

}


// ==========================================================
// CLEAR CART BUTTON
// ==========================================================

function setupPOSClearCart() {

    const button =
        document.getElementById(
            "posClearCartBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            clearPOSCart();

        }
    );

}


// ==========================================================
// FULLSCREEN
// ==========================================================

function setupPOSFullscreen() {

    const button =
        document.getElementById(
            "posFullscreenBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async function () {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document.documentElement.requestFullscreen();

                }

                else {

                    await document.exitFullscreen();

                }

            }

            catch (error) {

                console.warn(
                    "Fullscreen error:",
                    error
                );

            }

        }
    );

}


// ==========================================================
// EXIT POS
// ==========================================================

function setupPOSExit() {

    const button =
        document.getElementById(
            "posExitBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            localStorage.setItem(
                "currentPage",
                "pages/dashboard.html"
            );


            window.location.href =
                "../index.html";

        }
    );

}


// ==========================================================
// HOLD ORDER
// ==========================================================

function setupPOSHold() {

    const button =
        document.getElementById(
            "posHoldBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            if (
                posCart.length ===
                0
            ) {

                showPOSStatus(
                    "There is no order to hold.",
                    "error"
                );

                return;

            }


            localStorage.setItem(
                "pappritoHeldOrder",
                JSON.stringify(
                    {
                        orderNumber:
                            posOrderNumber,

                        cart:
                            posCart,

                        customer:
                            document.getElementById(
                                "posCustomerName"
                            )?.value ||
                            "Walk-in Customer",

                        paymentMethod:
                            posPaymentMethod,

                        discount:
                            getPOSDiscount(),

                        date:
                            new Date().toISOString()

                    }
                )
            );


            posCart = [];

            renderPOSCart();


            showPOSStatus(
                "Order placed on hold.",
                "success"
            );

        }
    );

}


// ==========================================================
// RECALL ORDER
// ==========================================================

function setupPOSRecall() {

    const button =
        document.getElementById(
            "posRecallBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            const saved =
                localStorage.getItem(
                    "pappritoHeldOrder"
                );


            if (!saved) {

                showPOSStatus(
                    "No held order found.",
                    "error"
                );

                return;

            }


            try {

                const order =
                    JSON.parse(
                        saved
                    );


                posCart =
                    Array.isArray(
                        order.cart
                    )
                        ? order.cart
                        : [];


                posOrderNumber =
                    order.orderNumber ||
                    generatePOSOrderNumber();


                const customer =
                    document.getElementById(
                        "posCustomerName"
                    );


                if (
                    customer
                ) {

                    customer.value =
                        order.customer ||
                        "Walk-in Customer";

                }


                posPaymentMethod =
                    order.paymentMethod ||
                    "Cash";


                const discount =
                    document.getElementById(
                        "posDiscount"
                    );


                if (
                    discount
                ) {

                    discount.value =
                        order.discount ||
                        0;

                }


                renderPOSCart();

                updatePaymentMethodUI();


                localStorage.removeItem(
                    "pappritoHeldOrder"
                );


                showPOSStatus(
                    "Held order recalled.",
                    "success"
                );

            }

            catch (error) {

                console.error(
                    "Recall Error:",
                    error
                );


                showPOSStatus(
                    "Unable to recall order.",
                    "error"
                );

            }

        }
    );

}


// ==========================================================
// UPDATE PAYMENT UI
// ==========================================================

function updatePaymentMethodUI() {

    const buttons =
        document.querySelectorAll(
            ".pos-payment-method-btn"
        );


    buttons.forEach(
        function (button) {

            const method =
                button.dataset.paymentMethod;


            button.classList.toggle(
                "active",
                method ===
                posPaymentMethod
            );

        }
    );

}


// ==========================================================
// PAYMENT
// ==========================================================

function setupPOSPayment() {

    const button =
        document.getElementById(
            "posPayBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            openPOSPaymentModal();

        }
    );


    const confirmButton =
        document.getElementById(
            "posConfirmPaymentBtn"
        );


    if (
        confirmButton
    ) {

        confirmButton.addEventListener(
            "click",
            function () {

                completePOSPayment();

            }
        );

    }

}


// ==========================================================
// OPEN PAYMENT MODAL
// ==========================================================

function openPOSPaymentModal() {

    const total =
        getPOSGrandTotal();


    if (
        posCart.length ===
        0
    ) {

        showPOSStatus(
            "Add products first.",
            "error"
        );

        return;

    }


    const modalTotal =
        document.getElementById(
            "posModalTotal"
        );


    const modalAmount =
        document.getElementById(
            "posModalAmountReceived"
        );


    if (
        modalTotal
    ) {

        modalTotal.textContent =
            posMoney(
                total
            );

    }


    if (
        modalAmount
    ) {

        modalAmount.value =
            getPOSAmountReceived()
                .toFixed(2);

        modalAmount.addEventListener(
            "input",
            function () {

                const amount =
                    Number(
                        modalAmount.value
                    ) || 0;


                const change =
                    Math.max(
                        0,
                        amount -
                        total
                    );


                const changeElement =
                    document.getElementById(
                        "posModalChange"
                    );


                if (
                    changeElement
                ) {

                    changeElement.textContent =
                        posMoney(
                            change
                        );

                }

            }
        );

    }


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const element =
            document.getElementById(
                "posPaymentModal"
            );


        if (
            element
        ) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    element
                );


            modal.show();

        }

    }

}


// ==========================================================
// COMPLETE PAYMENT
// ==========================================================

async function completePOSPayment() {

    const total =
        getPOSGrandTotal();


    const modalAmount =
        document.getElementById(
            "posModalAmountReceived"
        );


    const received =
        modalAmount
            ? Number(
                modalAmount.value
            ) || 0
            : getPOSAmountReceived();


    if (
        received <
        total
    ) {

        showPOSStatus(
            "Amount received is not enough.",
            "error"
        );

        return;

    }


    const change =
        received -
        total;


    const customer =
        document.getElementById(
            "posCustomerName"
        );


    const customerName =
        customer?.value.trim() ||
        "Walk-in Customer";


    const sale = {

        orderNumber:
            posOrderNumber,

        customer:
            customerName,

        paymentMethod:
            posPaymentMethod,

        items:
            posCart.map(
                function (item) {

                    return {

                        productId:
                            item.productId,

                        name:
                            item.name,

                        price:
                            item.price,

                        qty:
                            item.qty,

                        total:
                            item.price *
                            item.qty

                    };

                }
            ),

        subtotal:
            calculatePOSSubtotal(),

        discount:
            getPOSDiscount(),

        tax:
            0,

        total:
            total,

        amountReceived:
            received,

        change:
            change,

        createdAt:
            new Date().toISOString()

    };


    try {

        if (
            checkPOSFirebase()
        ) {

            await db
                .ref("sales")
                .push(
                    sale
                );

        }


        generatePOSReceipt(
            sale
        );


        posCart = [];

        renderPOSCart();


        document.getElementById(
            "posAmountReceived"
        ).value = "";


        document.getElementById(
            "posDiscount"
        ).value = "";


        document.getElementById(
            "posCustomerName"
        ).value =
            "Walk-in Customer";


        posOrderNumber =
            generatePOSOrderNumber();


        updatePOSOrderNumber();


        closePaymentModal();


        showPOSStatus(
            "Payment completed successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Payment Error:",
            error
        );


        showPOSStatus(
            "Payment failed: " +
            error.message,
            "error"
        );

    }

}


// ==========================================================
// CLOSE PAYMENT MODAL
// ==========================================================

function closePaymentModal() {

    const element =
        document.getElementById(
            "posPaymentModal"
        );


    if (
        element &&
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getInstance(
                element
            );


        if (modal) {

            modal.hide();

        }

    }

}


// ==========================================================
// RECEIPT
// ==========================================================

function generatePOSReceipt(
    sale
) {

    const container =
        document.getElementById(
            "posReceiptContent"
        );


    if (!container) {

        return;

    }


    const itemRows =
        sale.items
            .map(
                function (
                    item,
                    index
                ) {

                    return `

                        <div
                            class="
                                receipt-item
                            ">

                            <div>

                                <strong>

                                    ${index + 1}.
                                    ${posEscape(
                                        item.name
                                    )}

                                </strong>


                                <small>

                                    ${item.qty}
                                    ×
                                    ${posMoney(
                                        item.price
                                    )}

                                </small>

                            </div>


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


    container.innerHTML = `

        <div class="pos-receipt">


            <div
                class="
                    pos-receipt-header
                ">

                <h3>
                    PAPPRITO
                </h3>

                <p>
                    Restaurant
                </p>

                <p>
                    Official Receipt
                </p>

            </div>


            <div
                class="
                    pos-receipt-info
                ">

                <div>

                    <span>
                        Order
                    </span>

                    <strong>
                        ${posEscape(
                            sale.orderNumber
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Customer
                    </span>

                    <strong>
                        ${posEscape(
                            sale.customer
                        )}
                    </strong>

                </div>


                <div>

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


            <div
                class="
                    pos-receipt-items
                ">

                ${itemRows}

            </div>


            <div
                class="
                    pos-receipt-summary
                ">


                <div>

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${posMoney(
                            sale.subtotal
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Discount
                    </span>

                    <strong>
                        ${posMoney(
                            sale.discount
                        )}
                    </strong>

                </div>


                <div class="receipt-grand-total">

                    <span>
                        TOTAL
                    </span>

                    <strong>
                        ${posMoney(
                            sale.total
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Amount Received
                    </span>

                    <strong>
                        ${posMoney(
                            sale.amountReceived
                        )}
                    </strong>

                </div>


                <div class="receipt-change">

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
                class="
                    pos-receipt-footer
                ">

                Thank you for dining with us!

            </div>


        </div>

    `;


    const modal =
        document.getElementById(
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


// ==========================================================
// PRINT RECEIPT
// ==========================================================

function setupPOSPrintReceipt() {

    const button =
        document.getElementById(
            "posPrintReceiptBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            const receipt =
                document.getElementById(
                    "posReceiptContent"
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

                alert(
                    "Please allow pop-ups to print the receipt."
                );

                return;

            }


            printWindow.document.write(`

                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        PAPPRITO Receipt
                    </title>


                    <style>

                        body {

                            font-family:
                                Arial,
                                sans-serif;

                            width:
                                300px;

                            margin:
                                0 auto;

                            padding:
                                15px;

                            font-size:
                                12px;

                        }


                        .pos-receipt {

                            width:
                                100%;

                        }


                        .pos-receipt-header {

                            text-align:
                                center;

                            margin-bottom:
                                15px;

                        }


                        .pos-receipt-header h3 {

                            margin:
                                0;

                            font-size:
                                22px;

                        }


                        .pos-receipt-header p {

                            margin:
                                2px 0;

                        }


                        .pos-receipt-info > div,
                        .pos-receipt-summary > div {

                            display:
                                flex;

                            justify-content:
                                space-between;

                            gap:
                                10px;

                            margin:
                                5px 0;

                        }


                        .receipt-item {

                            display:
                                flex;

                            justify-content:
                                space-between;

                            gap:
                                10px;

                            border-bottom:
                                1px dashed #999;

                            padding:
                                7px 0;

                        }


                        .receipt-item small {

                            display:
                                block;

                        }


                        .receipt-grand-total {

                            border-top:
                                2px solid #000;

                            padding-top:
                                8px;

                            font-size:
                                15px;

                        }


                        .receipt-change {

                            font-size:
                                14px;

                        }


                        .pos-receipt-footer {

                            text-align:
                                center;

                            border-top:
                                1px dashed #000;

                            margin-top:
                                15px;

                            padding-top:
                                10px;

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
                function () {

                    printWindow.print();

                    printWindow.close();

                },
                300
            );

        }
    );

}


// ==========================================================
// UPDATE ORDER NUMBER
// ==========================================================

function updatePOSOrderNumber() {

    const element =
        document.getElementById(
            "posOrderNumber"
        );


    if (
        element
    ) {

        element.textContent =
            posOrderNumber;

    }

}


// ==========================================================
// DATE / TIME
// ==========================================================

function setupPOSDateTime() {

    const element =
        document.getElementById(
            "posDateTime"
        );


    if (!element) {

        return;

    }


    function update() {

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


    update();


    clearInterval(
        window.pappritoPOSDateTimer
    );


    window.pappritoPOSDateTimer =
        setInterval(
            update,
            1000
        );

}


// ==========================================================
// KEY PAD
// ==========================================================

function setupPOSKeypad() {

    const keys =
        document.querySelectorAll(
            ".pos-key"
        );


    keys.forEach(
        function (key) {

            key.addEventListener(
                "click",
                function () {

                    const value =
                        key.dataset.key;


                    const input =
                        document.activeElement;


                    if (
                        value ===
                        "clear"
                    ) {

                        if (
                            input &&
                            (
                                input.tagName ===
                                "INPUT"
                            )
                        ) {

                            input.value =
                                "";

                            input.dispatchEvent(
                                new Event(
                                    "input"
                                )
                            );

                        }

                        return;

                    }


                    if (
                        input &&
                        (
                            input.tagName ===
                            "INPUT"
                        )
                    ) {

                        input.value +=
                            value;


                        input.dispatchEvent(
                            new Event(
                                "input"
                            )
                        );

                        return;

                    }


                    const amount =
                        document.getElementById(
                            "posAmountReceived"
                        );


                    if (
                        amount
                    ) {

                        amount.value +=
                            value;


                        amount.dispatchEvent(
                            new Event(
                                "input"
                            )
                        );

                    }

                }
            );

        }
    );

}


// ==========================================================
// INITIALIZE POS
// ==========================================================

async function initializePOS() {

    console.log(
        "=========================================="
    );


    console.log(
        "PAPPRITO POS V3 INITIALIZING..."
    );


    console.log(
        "=========================================="
    );


    posOrderNumber =
        generatePOSOrderNumber();


    updatePOSOrderNumber();


    setupPOSDateTime();

    setupPOSSearch();

    setupPOSRefresh();

    setupPOSDiscount();

    setupPOSAmountReceived();

    setupPOSClearCart();

    setupPaymentMethods();

    setupPOSPayment();

    setupPOSPrintReceipt();

    setupPOSFullscreen();

    setupPOSExit();

    setupPOSHold();

    setupPOSRecall();

    setupPOSKeypad();


    renderPOSCart();


    await Promise.all(
        [
            loadPOSCategories(),
            loadPOSProducts()
        ]
    );


    console.log(
        "PAPPRITO POS V3 READY."
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
        initializePOS
    );

}

else {

    initializePOS();

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

window.getPOSGrandTotal =
    getPOSGrandTotal;

window.completePOSPayment =
    completePOSPayment;


console.log(
    "PAPPRITO POS V3 pos.js loaded."
);
