// ==========================================================
// PAPPRITO ERP
// POS ENGINE V3
// File : assets/js/pos/pos.js
//
// CART:
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
// sales/
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

let posLastSale = null;


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
// GET PRODUCT CATEGORY ID
// ==========================================================

function getProductCategoryId(product) {

    return String(
        product.categoryId ||
        product.categoryID ||
        product.category_id ||
        ""
    )
    .trim();

}


// ==========================================================
// GET PRODUCT CATEGORY NAME
// ==========================================================

function getProductCategory(product) {

    return String(
        product.category ||
        product.categoryName ||
        product.categoryTitle ||
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
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const time =
        String(
            now.getHours()
        )
        .padStart(
            2,
            "0"
        ) +

        String(
            now.getMinutes()
        )
        .padStart(
            2,
            "0"
        ) +

        String(
            now.getSeconds()
        )
        .padStart(
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
            Object.entries(
                data
            )
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

                        ...(value || {})

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
// GET CATEGORY NAME
// ==========================================================

function getCategoryName(category) {

    return String(
        category.name ||
        category.categoryName ||
        category.title ||
        "Unnamed Category"
    )
    .trim();

}


// ==========================================================
// FIND CATEGORY FOR PRODUCT
// ==========================================================

function getProductResolvedCategory(
    product
) {

    const productCategoryId =
        getProductCategoryId(
            product
        )
        .toLowerCase();


    const productCategoryName =
        getProductCategory(
            product
        )
        .toLowerCase();


    if (
        productCategoryId
    ) {

        const matchedById =
            posCategories.find(
                function (category) {

                    return (
                        String(
                            category.categoryId
                        )
                        .toLowerCase() ===
                        productCategoryId
                    );

                }
            );


        if (
            matchedById
        ) {

            return getCategoryName(
                matchedById
            );

        }

    }


    if (
        productCategoryName
    ) {

        const matchedByName =
            posCategories.find(
                function (category) {

                    const name =
                        getCategoryName(
                            category
                        )
                        .toLowerCase();


                    const id =
                        String(
                            category.categoryId
                        )
                        .toLowerCase();


                    return (
                        name ===
                        productCategoryName
                    ) ||
                    (
                        id ===
                        productCategoryName
                    );

                }
            );


        if (
            matchedByName
        ) {

            return getCategoryName(
                matchedByName
            );

        }


        return getProductCategory(
            product
        );

    }


    return "";

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
                getCategoryName(
                    category
                );


            const categoryId =
                String(
                    category.categoryId
                );


            const active =
                String(
                    posSelectedCategory
                )
                .toLowerCase() ===
                categoryName
                    .toLowerCase();


            html += `

                <button
                    type="button"
                    class="
                        pos-category-btn
                        ${
                            active
                                ? "active"
                                : ""
                        }
                    "
                    data-category="${posEscape(
                        categoryName
                    )}"
                    data-category-id="${posEscape(
                        categoryId
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


                    const categoryId =
                        button.dataset.categoryId ||
                        "";


                    posSelectedCategory =
                        category;


                    window.posSelectedCategoryId =
                        categoryId;


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
            Object.entries(
                data
            )
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

                        ...(value || {})

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


    const selectedCategory =
        String(
            posSelectedCategory
        )
        .trim()
        .toLowerCase();


    const selectedCategoryId =
        String(
            window.posSelectedCategoryId ||
            ""
        )
        .trim()
        .toLowerCase();


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


            const rawCategory =
                getProductCategory(
                    product
                )
                .toLowerCase();


            const rawCategoryId =
                getProductCategoryId(
                    product
                )
                .toLowerCase();


            const resolvedCategory =
                getProductResolvedCategory(
                    product
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


            let matchesCategory =
                true;


            if (
                selectedCategory !==
                "all"
            ) {

                matchesCategory =
                    (
                        rawCategory ===
                        selectedCategory
                    ) ||

                    (
                        resolvedCategory ===
                        selectedCategory
                    ) ||

                    (
                        selectedCategoryId &&
                        rawCategoryId ===
                        selectedCategoryId
                    ) ||

                    (
                        rawCategory.includes(
                            selectedCategory
                        )
                    ) ||

                    (
                        resolvedCategory.includes(
                            selectedCategory
                        )
                    );

            }


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
// SN | ITEMS | QTY | TOTAL | ACTIONS
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
                        (
                            Number(
                                item.price
                            ) || 0
                        ) *
                        (
                            Number(
                                item.qty
                            ) || 0
                        );


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



                            <!-- ACTIONS AFTER TOTAL -->

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
// PAYMENT METHODS
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


    const total =
        getPOSGrandTotal();


    if (
        posPaymentMethod !==
        "Cash"
    ) {

        amountInput.value =
            total
                ? total.toFixed(2)
                : "";

    }


    amountInput.disabled =
        false;


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
// REFRESH
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

            catch (error) {

                console.error(
                    "Refresh Error:",
                    error
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
// CLEAR CART
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

                    await document
                        .documentElement
                        .requestFullscreen();

                }

                else {

                    await document
                        .exitFullscreen();

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


                if (customer) {

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


                if (discount) {

                    discount.value =
                        order.discount ||
                        0;

                }


                renderPOSCart();


                updatePaymentMethodUI();


                localStorage.removeItem(
                    "pappritoHeldOrder"
                );


                updatePOSOrderNumber();


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


    const modalChange =
        document.getElementById(
            "posModalChange"
        );


    if (modalTotal) {

        modalTotal.textContent =
            posMoney(
                total
            );

    }


    if (modalAmount) {

        modalAmount.value =
            getPOSAmountReceived()
                .toFixed(2);


        modalAmount.oninput =
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


                if (modalChange) {

                    modalChange.textContent =
                        posMoney(
                            change
                        );

                }

            };


        modalAmount.oninput();

    }


    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const element =
            document.getElementById(
                "posPaymentModal"
            );


        if (element) {

            const modal =
                bootstrap.Modal
                    .getOrCreateInstance(
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


        posLastSale =
            sale;


        window.currentPOSReceipt =
            sale;


        generatePOSReceipt(
            sale
        );


        posCart = [];


        renderPOSCart();


        const amountInput =
            document.getElementById(
                "posAmountReceived"
            );


        if (amountInput) {

            amountInput.value =
                "";

        }


        const discountInput =
            document.getElementById(
                "posDiscount"
            );


        if (discountInput) {

            discountInput.value =
                "";

        }


        const customerInput =
            document.getElementById(
                "posCustomerName"
            );


        if (customerInput) {

            customerInput.value =
                "Walk-in Customer";

        }


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
// GENERATE RECEIPT MODAL
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


                <div
                    class="
                        receipt-grand-total
                    ">

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


                <!-- ONE CHANGE ONLY -->

                <div
                    class="
                        receipt-change
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
//
// TRUE 80MM THERMAL STYLE
//
// SN | ITEMS | QTY | TOTAL
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

            const sale =
                posLastSale ||
                window.currentPOSReceipt;


            if (!sale) {

                showPOSStatus(
                    "No receipt available.",
                    "error"
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

                alert(
                    "Please allow pop-ups to print the receipt."
                );

                return;

            }


            const itemsHTML =
                (sale.items || [])
                    .map(
                        function (
                            item,
                            index
                        ) {

                            const qty =
                                Number(
                                    item.qty
                                ) || 0;


                            const price =
                                Number(
                                    item.price
                                ) || 0;


                            const itemTotal =
                                Number(
                                    item.total
                                ) ||
                                (
                                    price *
                                    qty
                                );


                            return `

                                <div
                                    class="
                                        thermal-item
                                    ">


                                    <div
                                        class="
                                            thermal-sn
                                        ">

                                        ${index + 1}

                                    </div>


                                    <div
                                        class="
                                            thermal-item-name
                                        ">

                                        ${posEscape(
                                            item.name
                                        )}

                                    </div>


                                    <div
                                        class="
                                            thermal-qty
                                        ">

                                        ${qty}

                                    </div>


                                    <div
                                        class="
                                            thermal-item-total
                                        ">

                                        ${posMoney(
                                            itemTotal
                                        )}

                                    </div>


                                </div>

                            `;

                        }
                    )
                    .join("");


            const receiptHTML = `

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0">

<title>
    PAPPRITO Receipt
</title>


<style>

/* ======================================================
   THERMAL 80MM
====================================================== */

@page {

    size:
        80mm auto;

    margin:
        0;

}


html,
body {

    width:
        80mm;

    margin:
        0;

    padding:
        0;

    background:
        #ffffff;

}


body {

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    color:
        #000000;

    font-size:
        10px;

    line-height:
        1.25;

    -webkit-print-color-adjust:
        exact;

    print-color-adjust:
        exact;

}


/* ======================================================
   RECEIPT
====================================================== */

.thermal-receipt {

    width:
        72mm;

    max-width:
        72mm;

    margin:
        0 auto;

    padding:
        3mm 0 6mm;

}


/* ======================================================
   HEADER
====================================================== */

.thermal-header {

    text-align:
        center;

    margin-bottom:
        5px;

}


.thermal-logo {

    font-size:
        22px;

    line-height:
        23px;

    font-weight:
        900;

    letter-spacing:
        .5px;

}


.thermal-restaurant {

    font-size:
        11px;

    font-weight:
        700;

    margin-top:
        2px;

}


.thermal-receipt-title {

    font-size:
        9px;

    margin-top:
        2px;

}


/* ======================================================
   LINES
====================================================== */

.thermal-line {

    border-top:
        1px dashed #000;

    margin:
        5px 0;

}


.thermal-line-solid {

    border-top:
        1px solid #000;

    margin:
        5px 0;

}


/* ======================================================
   INFO
====================================================== */

.thermal-info-row {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        flex-start;

    gap:
        8px;

    padding:
        1.5px 0;

    font-size:
        9px;

}


.thermal-info-label {

    white-space:
        nowrap;

}


.thermal-info-value {

    text-align:
        right;

    font-weight:
        700;

    overflow-wrap:
        anywhere;

}


/* ======================================================
   ITEM HEADER
====================================================== */

.thermal-items-header {

    display:
        grid;

    grid-template-columns:
        20px
        minmax(0,1fr)
        28px
        58px;

    column-gap:
        3px;

    align-items:
        center;

    padding:
        3px 0;

    border-top:
        1px solid #000;

    border-bottom:
        1px solid #000;

    font-size:
        8px;

    font-weight:
        900;

}


.thermal-items-header .sn {

    text-align:
        center;

}


.thermal-items-header .qty {

    text-align:
        center;

}


.thermal-items-header .total {

    text-align:
        right;

}


/* ======================================================
   ITEMS
====================================================== */

.thermal-item {

    display:
        grid;

    grid-template-columns:
        20px
        minmax(0,1fr)
        28px
        58px;

    column-gap:
        3px;

    align-items:
        start;

    padding:
        4px 0;

    border-bottom:
        1px dashed #aaa;

    font-size:
        9px;

}


.thermal-sn {

    text-align:
        center;

}


.thermal-item-name {

    min-width:
        0;

    overflow-wrap:
        anywhere;

    font-weight:
        700;

}


.thermal-qty {

    text-align:
        center;

    font-weight:
        700;

}


.thermal-item-total {

    text-align:
        right;

    font-weight:
        700;

    white-space:
        nowrap;

}


/* ======================================================
   SUMMARY
====================================================== */

.thermal-summary {

    margin-top:
        5px;

}


.thermal-summary-row {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        center;

    gap:
        8px;

    padding:
        2px 0;

    font-size:
        9px;

}


.thermal-summary-row strong {

    white-space:
        nowrap;

}


/* ======================================================
   GRAND TOTAL
====================================================== */

.thermal-grand-total {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        center;

    gap:
        8px;

    margin:
        4px 0;

    padding:
        5px 0;

    border-top:
        2px solid #000;

    border-bottom:
        2px solid #000;

    font-size:
        14px;

    font-weight:
        900;

}


.thermal-grand-total strong {

    font-size:
        15px;

    white-space:
        nowrap;

}


/* ======================================================
   CHANGE
====================================================== */

.thermal-change {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        center;

    gap:
        8px;

    padding:
        4px 0;

    font-size:
        12px;

    font-weight:
        900;

}


.thermal-change strong {

    white-space:
        nowrap;

}


/* ======================================================
   FOOTER
====================================================== */

.thermal-footer {

    text-align:
        center;

    margin-top:
        8px;

    font-size:
        9px;

}


.thermal-thank-you {

    font-size:
        10px;

    font-weight:
        700;

    margin-top:
        6px;

}


.thermal-system {

    font-size:
        7px;

    margin-top:
        3px;

}


/* ======================================================
   PRINT
====================================================== */

@media print {

    html,
    body {

        width:
            80mm;

        margin:
            0;

        padding:
            0;

    }


    .thermal-receipt {

        width:
            72mm;

        max-width:
            72mm;

        margin:
            0 auto;

        padding:
            3mm 0 6mm;

    }

}

</style>

</head>


<body>


<div class="thermal-receipt">


    <!-- ==============================================
         HEADER
    =============================================== -->

    <div class="thermal-header">

        <div class="thermal-logo">

            PAPPRITO

        </div>


        <div class="thermal-restaurant">

            RESTAURANT

        </div>


        <div class="thermal-receipt-title">

            Official Sales Receipt

        </div>

    </div>


    <div class="thermal-line"></div>


    <!-- ==============================================
         ORDER INFORMATION
    =============================================== -->

    <div class="thermal-info-row">

        <span class="thermal-info-label">
            Order
        </span>

        <span class="thermal-info-value">

            ${posEscape(
                sale.orderNumber ||
                ""
            )}

        </span>

    </div>


    <div class="thermal-info-row">

        <span class="thermal-info-label">
            Customer
        </span>

        <span class="thermal-info-value">

            ${posEscape(
                sale.customer ||
                "Walk-in Customer"
            )}

        </span>

    </div>


    <div class="thermal-info-row">

        <span class="thermal-info-label">
            Payment
        </span>

        <span class="thermal-info-value">

            ${posEscape(
                sale.paymentMethod ||
                "Cash"
            )}

        </span>

    </div>


    <div class="thermal-info-row">

        <span class="thermal-info-label">
            Date
        </span>

        <span class="thermal-info-value">

            ${new Date(
                sale.createdAt ||
                Date.now()
            ).toLocaleString(
                "en-PH"
            )}

        </span>

    </div>


    <div class="thermal-line"></div>


    <!-- ==============================================
         ITEMS HEADER
    =============================================== -->

    <div class="thermal-items-header">

        <div class="sn">
            SN
        </div>

        <div>
            ITEMS
        </div>

        <div class="qty">
            QTY
        </div>

        <div class="total">
            TOTAL
        </div>

    </div>


    <!-- ==============================================
         ITEMS
    =============================================== -->

    ${itemsHTML}


    <!-- ==============================================
         SUMMARY
    =============================================== -->

    <div class="thermal-summary">


        <div class="thermal-summary-row">

            <span>
                Subtotal
            </span>

            <strong>
                ${posMoney(
                    sale.subtotal
                )}
            </strong>

        </div>


        <div class="thermal-summary-row">

            <span>
                Discount
            </span>

            <strong>
                ${posMoney(
                    sale.discount
                )}
            </strong>

        </div>


        <div class="thermal-grand-total">

            <span>
                TOTAL
            </span>

            <strong>
                ${posMoney(
                    sale.total
                )}
            </strong>

        </div>


        <div class="thermal-summary-row">

            <span>
                Amount Received
            </span>

            <strong>
                ${posMoney(
                    sale.amountReceived
                )}
            </strong>

        </div>


        <!-- ONE CHANGE ROW -->

        <div class="thermal-change">

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


    <!-- ==============================================
         FOOTER
    =============================================== -->

    <div class="thermal-footer">

        <div class="thermal-line"></div>


        <div class="thermal-thank-you">

            Thank you for dining with us!

        </div>


        <div class="thermal-system">

            PAPPRITO Restaurant POS

        </div>

    </div>


</div>


<script>

window.onload = function () {

    setTimeout(
        function () {

            window.print();

        },
        300
    );

};


window.onafterprint = function () {

    setTimeout(
        function () {

            window.close();

        },
        300
    );

};

<\/script>


</body>

</html>

            `;


            printWindow.document.write(
                receiptHTML
            );


            printWindow.document.close();


            printWindow.focus();

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
// KEYPAD
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
                            input.tagName ===
                            "INPUT"
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
                        input.tagName ===
                        "INPUT"
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


                    if (amount) {

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
