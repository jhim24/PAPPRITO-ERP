/* ==========================================================
   PAPPRITO ERP
   POS V3 — FRESH CONSOLIDATED POS ENGINE
   File:
   assets/js/pos/pos.js

   ARCHITECTURE:

   pages/pos.html
        ↓
   assets/css/pos.css
        ↓
   assets/js/pos/pos.js
        ↓
   Firebase Realtime Database

   FEATURES:
   - Firebase products
   - Firebase categories
   - Category filtering
   - Robust category matching
   - Search
   - Cart
   - Quantity controls
   - Discount
   - Payment methods
   - Amount received
   - Change
   - Save sales
   - Stock deduction
   - Receipt
   - Print receipt
   - Hold / Recall
   - Fullscreen
   - Date / Time
   - Refresh
   - Standalone POS
========================================================== */

"use strict";


/* ==========================================================
   POS STATE
========================================================== */

const POS_STATE = {

    products: [],

    categories: [],

    filteredProducts: [],

    cart: [],

    selectedCategory: "all",

    searchTerm: "",

    paymentMethod: "Cash",

    discount: 0,

    customer: "Walk-in Customer",

    processing: false,

    initialized: false,

    lastSale: null

};


/* ==========================================================
   FIREBASE
========================================================== */

function posFirebaseReady() {

    return (
        typeof firebase !== "undefined" &&
        typeof db !== "undefined" &&
        db &&
        typeof db.ref === "function"
    );

}


/* ==========================================================
   ELEMENT
========================================================== */

function posEl(id) {

    return document.getElementById(id);

}


/* ==========================================================
   QUERY ALL
========================================================== */

function posQueryAll(selector) {

    return Array.from(
        document.querySelectorAll(selector)
    );

}


/* ==========================================================
   NUMBER
========================================================== */

function posNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/₱/g, "")
                .trim()
        );


    return Number.isFinite(number)
        ? number
        : 0;

}


/* ==========================================================
   MONEY
========================================================== */

function posMoney(value) {

    return (
        "₱" +
        posNumber(value).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


/* ==========================================================
   NORMALIZE TEXT
========================================================== */

function posNormalize(value) {

    return String(
        value ?? ""
    )
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

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


/* ==========================================================
   STATUS
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


    element.classList.add(
        "show"
    );


    clearTimeout(
        window.pappritoPOSTimer
    );


    window.pappritoPOSTimer =
        setTimeout(
            function() {

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

function posError(
    message,
    error
) {

    console.error(
        "PAPPRITO POS:",
        message,
        error || ""
    );


    posStatus(
        message
    );

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
   PRODUCT STOCK
========================================================== */

function getPOSProductStock(product) {

    if (!product) {

        return null;

    }


    const values = [

        product.stock,

        product.quantity,

        product.qty,

        product.currentStock,

        product.onHand

    ];


    for (
        const value of values
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            return Math.max(
                0,
                posNumber(value)
            );

        }

    }


    return null;

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
   PRODUCT CATEGORY VALUES
========================================================== */

function getPOSProductCategoryValues(product) {

    if (!product) {

        return {

            id: "",

            name: ""

        };

    }


    const categoryId =
        String(
            product.categoryId ??
            product.categoryID ??
            product.category_id ??
            ""
        )
        .trim();


    const categoryName =
        String(
            product.categoryName ??
            product.category ??
            product.category_name ??
            ""
        )
        .trim();


    return {

        id: categoryId,

        name: categoryName

    };

}


/* ==========================================================
   PRODUCT CATEGORY DISPLAY
========================================================== */

function getPOSProductCategory(product) {

    const values =
        getPOSProductCategoryValues(
            product
        );


    if (values.name) {

        return values.name;

    }


    if (values.id) {

        const category =
            POS_STATE.categories.find(
                function(item) {

                    return (
                        posNormalize(item.id) ===
                        posNormalize(values.id)
                    );

                }
            );


        if (category) {

            return category.name;

        }

    }


    return "Other";

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


    const hour =
        String(
            now.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minute =
        String(
            now.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    const second =
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
        hour +
        minute +
        second +
        "-" +
        random
    );

}


/* ==========================================================
   UPDATE ORDER NUMBER
========================================================== */

function updatePOSOrderNumber() {

    const element =
        posEl(
            "posOrderNumber"
        );


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


        const data =
            snapshot.val() || {};


        POS_STATE.categories =
            Object.entries(data)
                .map(
                    function([id, category]) {

                        return {

                            id: String(id),

                            ...(category || {})

                        };

                    }
                )
                .filter(
                    function(category) {

                        return Boolean(
                            category.name ||
                            category.categoryName ||
                            category.title
                        );

                    }
                )
                .map(
                    function(category) {

                        return {

                            ...category,

                            id:
                                String(
                                    category.id
                                ),

                            name:
                                String(
                                    category.name ||
                                    category.categoryName ||
                                    category.title ||
                                    "Other"
                                )
                                .trim()

                        };

                    }
                );


        POS_STATE.categories.sort(
            function(a, b) {

                return a.name.localeCompare(
                    b.name
                );

            }
        );


        console.log(
            "PAPPRITO POS categories:",
            POS_STATE.categories
        );


        renderPOSCategories();


        return POS_STATE.categories;

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


        const data =
            snapshot.val() || {};


        POS_STATE.products =
            Object.entries(data)
                .map(
                    function([id, product]) {

                        return {

                            id: String(id),

                            ...(product || {})

                        };

                    }
                )
                .filter(
                    function(product) {

                        const status =
                            posNormalize(
                                product.status ??
                                "active"
                            );


                        return ![
                            "inactive",
                            "disabled",
                            "deleted",
                            "archived"
                        ].includes(
                            status
                        );

                    }
                );


        console.log(
            "PAPPRITO POS products:",
            POS_STATE.products
        );


        filterPOSProducts();


        return POS_STATE.products;

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
        posEl(
            "posCategories"
        );


    if (!container) {

        return;

    }


    let html = "";


    /* ======================================================
       ALL
    ====================================================== */

    const selected =
        posNormalize(
            POS_STATE.selectedCategory
        );


    html += `

        <button
            type="button"
            class="
                pos-category-btn
                ${
                    selected === "all"
                        ? "active"
                        : ""
                }
            "
            data-category="all"
            data-category-name="all">

            <i class="fa-solid fa-border-all"></i>

            <span>
                All Products
            </span>

        </button>

    `;


    /* ======================================================
       CATEGORIES
    ====================================================== */

    POS_STATE.categories.forEach(
        function(category) {

            const name =
                String(
                    category.name || ""
                )
                .trim();


            const id =
                String(
                    category.id || ""
                )
                .trim();


            const isActive =
                selected ===
                    posNormalize(name)

                ||

                selected ===
                    posNormalize(id);


            html += `

                <button
                    type="button"
                    class="
                        pos-category-btn
                        ${
                            isActive
                                ? "active"
                                : ""
                        }
                    "
                    data-category="${posEscape(name)}"
                    data-category-id="${posEscape(id)}"
                    data-category-name="${posEscape(name)}">

                    <i class="fa-solid fa-tag"></i>

                    <span>
                        ${posEscape(name)}
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

    posQueryAll(
        ".pos-category-btn"
    )
    .forEach(
        function(button) {

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
                function() {

                    const name =
                        String(
                            button.dataset.categoryName ||
                            ""
                        )
                        .trim();


                    const id =
                        String(
                            button.dataset.categoryId ||
                            ""
                        )
                        .trim();


                    if (
                        posNormalize(name) ===
                        "all"
                    ) {

                        POS_STATE.selectedCategory =
                            "all";

                    }

                    else {

                        /*
                         PRIMARY FILTER:
                         category NAME

                         FALLBACK:
                         category ID
                        */

                        POS_STATE.selectedCategory =
                            name || id;

                    }


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


                    filterPOSProducts();

                }
            );

        }
    );

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


    const category =
        getPOSProductCategory(
            product
        );


    const values = [

        product.name,

        product.productName,

        product.itemName,

        product.title,

        product.code,

        product.productCode,

        product.sku,

        product.barcode,

        product.category,

        product.categoryName,

        category

    ];


    const text =
        values
            .filter(
                function(value) {

                    return (
                        value !== undefined &&
                        value !== null
                    );

                }
            )
            .join(" ")
            .toLowerCase();


    return text.includes(
        search
    );

}


/* ==========================================================
   CATEGORY MATCH
========================================================== */

function POSProductMatchesCategory(
    product,
    selectedCategory
) {

    const selected =
        posNormalize(
            selectedCategory
        );


    /* ======================================================
       ALL
    ====================================================== */

    if (
        !selected ||
        selected === "all"
    ) {

        return true;

    }


    const values =
        getPOSProductCategoryValues(
            product
        );


    const productCategoryId =
        posNormalize(
            values.id
        );


    const productCategoryName =
        posNormalize(
            values.name
        );


    /* ======================================================
       DIRECT PRODUCT CATEGORY MATCH
    ====================================================== */

    if (
        productCategoryName ===
        selected
    ) {

        return true;

    }


    if (
        productCategoryId ===
        selected
    ) {

        return true;

    }


    /* ======================================================
       RESOLVE SELECTED CATEGORY
    ====================================================== */

    const category =
        POS_STATE.categories.find(
            function(item) {

                return (

                    posNormalize(item.id) ===
                    selected

                    ||

                    posNormalize(item.name) ===
                    selected

                );

            }
        );


    if (!category) {

        return false;

    }


    const categoryId =
        posNormalize(
            category.id
        );


    const categoryName =
        posNormalize(
            category.name
        );


    /* ======================================================
       MATCH PRODUCT AGAINST RESOLVED CATEGORY
    ====================================================== */

    if (
        productCategoryId ===
        categoryId
    ) {

        return true;

    }


    if (
        productCategoryName ===
        categoryName
    ) {

        return true;

    }


    return false;

}


/* ==========================================================
   FILTER PRODUCTS
========================================================== */

function filterPOSProducts() {

    const searchInput =
        posEl(
            "posProductSearch"
        );


    if (searchInput) {

        POS_STATE.searchTerm =
            String(
                searchInput.value || ""
            )
            .trim()
            .toLowerCase();

    }


    const search =
        POS_STATE.searchTerm;


    const selectedCategory =
        POS_STATE.selectedCategory;


    POS_STATE.filteredProducts =
        POS_STATE.products.filter(
            function(product) {

                const categoryMatch =
                    POSProductMatchesCategory(
                        product,
                        selectedCategory
                    );


                if (!categoryMatch) {

                    return false;

                }


                return POSProductMatchesSearch(
                    product,
                    search
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
        posEl(
            "posProducts"
        );


    if (!container) {

        return;

    }


    const products =
        POS_STATE.filteredProducts;


    if (
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="pos-products-empty">

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
                        getPOSProductStock(
                            product
                        );


                    const category =
                        getPOSProductCategory(
                            product
                        );


                    const stockHTML =
                        stock !== null
                        ?
                        `

                            <span
                                class="pos-product-stock">

                                ${posEscape(
                                    stock
                                )}
                                in stock

                            </span>

                        `
                        :
                        "";


                    return `

                        <button
                            type="button"
                            class="pos-product-card"
                            data-product-id="${posEscape(
                                product.id
                            )}">

                            <div
                                class="pos-product-image-wrap">

                                <img
                                    src="${posEscape(
                                        image
                                    )}"
                                    alt="${posEscape(
                                        name
                                    )}"
                                    class="pos-product-image"
                                    loading="lazy"
                                    onerror="
                                        this.onerror=null;
                                        this.src='../assets/img/no-image.png';
                                    ">

                            </div>


                            <div
                                class="pos-product-info">

                                <div
                                    class="pos-product-category">

                                    ${posEscape(
                                        category
                                    )}

                                </div>


                                <div
                                    class="pos-product-name">

                                    ${posEscape(
                                        name
                                    )}

                                </div>


                                <div
                                    class="pos-product-bottom">

                                    <strong
                                        class="pos-product-price">

                                        ${posMoney(
                                            price
                                        )}

                                    </strong>


                                    ${stockHTML}

                                </div>

                            </div>

                        </button>

                    `;

                }
            )
            .join("");


    bindProductCards();

}


/* ==========================================================
   PRODUCT CARD BINDING
========================================================== */

function bindProductCards() {

    posQueryAll(
        ".pos-product-card"
    )
    .forEach(
        function(card) {

            if (
                card.dataset.posBound ===
                "true"
            ) {

                return;

            }


            card.dataset.posBound =
                "true";


            card.addEventListener(
                "click",
                function() {

                    addPOSToCart(
                        card.dataset.productId
                    );

                }
            );

        }
    );

}


/* ==========================================================
   ADD TO CART
========================================================== */

function addPOSToCart(
    productId
) {

    const product =
        POS_STATE.products.find(
            function(item) {

                return (
                    String(item.id) ===
                    String(productId)
                );

            }
        );


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
        POS_STATE.cart.find(
            function(item) {

                return (
                    String(item.productId) ===
                    String(productId)
                );

            }
        );


    const currentQuantity =
        existing
            ? existing.quantity
            : 0;


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

        POS_STATE.cart.push({

            productId:
                String(productId),

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
   CART TOTAL
========================================================== */

function getPOSSubtotal() {

    return POS_STATE.cart.reduce(
        function(total, item) {

            return (
                total +
                (
                    posNumber(item.price) *
                    posNumber(item.quantity)
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
        posEl(
            "posDiscount"
        );


    let discount;


    if (input) {

        discount =
            posNumber(
                input.value
            );

    }

    else {

        discount =
            POS_STATE.discount;

    }


    discount =
        Math.max(
            0,
            Math.min(
                discount,
                getPOSSubtotal()
            )
        );


    POS_STATE.discount =
        discount;


    return discount;

}


/* ==========================================================
   GRAND TOTAL
========================================================== */

function getPOSGrandTotal() {

    return Math.max(
        0,
        getPOSSubtotal() -
        getPOSDiscount()
    );

}


/* ==========================================================
   RENDER CART
========================================================== */

function renderPOSCart() {

    const container =
        posEl(
            "posCart"
        );


    if (!container) {

        return;

    }


    if (
        POS_STATE.cart.length === 0
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


    container.innerHTML =
        POS_STATE.cart
            .map(
                function(item, index) {

                    const lineTotal =
                        posNumber(
                            item.price
                        ) *
                        posNumber(
                            item.quantity
                        );


                    return `

                        <div
                            class="pos-cart-item"
                            data-cart-index="${index}">

                            <!-- SN -->

                            <div
                                class="pos-cart-sn">

                                ${index + 1}

                            </div>


                            <!-- ITEM -->

                            <div
                                class="pos-cart-item-info">

                                <strong
                                    class="pos-cart-item-name">

                                    ${posEscape(
                                        item.name
                                    )}

                                </strong>


                                <span
                                    class="pos-cart-item-price">

                                    ${posMoney(
                                        item.price
                                    )}
                                    each

                                </span>

                            </div>


                            <!-- QTY -->

                            <div
                                class="pos-cart-qty-control">

                                <button
                                    type="button"
                                    class="pos-cart-minus"
                                    data-index="${index}">

                                    <i
                                        class="fa-solid fa-minus">
                                    </i>

                                </button>


                                <strong>

                                    ${item.quantity}

                                </strong>


                                <button
                                    type="button"
                                    class="pos-cart-plus"
                                    data-index="${index}">

                                    <i
                                        class="fa-solid fa-plus">
                                    </i>

                                </button>

                            </div>


                            <!-- TOTAL -->

                            <strong
                                class="pos-cart-item-total">

                                ${posMoney(
                                    lineTotal
                                )}

                            </strong>


                            <!-- REMOVE -->

                            <button
                                type="button"
                                class="pos-cart-remove"
                                data-index="${index}"
                                title="Remove">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    bindCartButtons();

}


/* ==========================================================
   CART BUTTONS
========================================================== */

function bindCartButtons() {

    posQueryAll(
        ".pos-cart-minus"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    decreasePOSItem(
                        Number(
                            button.dataset.index
                        )
                    );

                }
            );

        }
    );


    posQueryAll(
        ".pos-cart-plus"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    increasePOSItem(
                        Number(
                            button.dataset.index
                        )
                    );

                }
            );

        }
    );


    posQueryAll(
        ".pos-cart-remove"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    removePOSItem(
                        Number(
                            button.dataset.index
                        )
                    );

                }
            );

        }
    );

}


/* ==========================================================
   INCREASE
========================================================== */

function increasePOSItem(index) {

    const item =
        POS_STATE.cart[index];


    if (!item) {

        return;

    }


    const product =
        POS_STATE.products.find(
            function(product) {

                return (
                    String(product.id) ===
                    String(item.productId)
                );

            }
        );


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


    item.quantity += 1;


    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   DECREASE
========================================================== */

function decreasePOSItem(index) {

    const item =
        POS_STATE.cart[index];


    if (!item) {

        return;

    }


    item.quantity -= 1;


    if (
        item.quantity <= 0
    ) {

        POS_STATE.cart.splice(
            index,
            1
        );

    }


    renderPOSCart();

    updatePOSSummary();

}


/* ==========================================================
   REMOVE
========================================================== */

function removePOSItem(index) {

    if (
        !POS_STATE.cart[index]
    ) {

        return;

    }


    POS_STATE.cart.splice(
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
    confirmAction = true
) {

    if (
        POS_STATE.cart.length === 0
    ) {

        return;

    }


    if (
        confirmAction &&
        !window.confirm(
            "Clear the current order?"
        )
    ) {

        return;

    }


    POS_STATE.cart = [];

    POS_STATE.discount = 0;

    POS_STATE.customer =
        "Walk-in Customer";


    const discount =
        posEl(
            "posDiscount"
        );


    if (discount) {

        discount.value =
            "";

    }


    const amount =
        posEl(
            "posAmountReceived"
        );


    if (amount) {

        amount.value =
            "";

    }


    const paymentAmount =
        posEl(
            "posPaymentAmount"
        );


    if (paymentAmount) {

        paymentAmount.value =
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


    renderPOSCart();

    updatePOSSummary();

    updatePOSPayment();

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
        posEl(
            "posSubtotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            posMoney(
                subtotal
            );

    }


    const discountElement =
        posEl(
            "posDiscountAmount"
        );


    if (discountElement) {

        discountElement.textContent =
            posMoney(
                discount
            );

    }


    const taxElement =
        posEl(
            "posTax"
        );


    if (taxElement) {

        taxElement.textContent =
            posMoney(
                0
            );

    }


    const totalElement =
        posEl(
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
   PAYMENT METHOD
========================================================== */

function setPOSPaymentMethod(
    method
) {

    const normalized =
        posNormalize(
            method
        );


    if (
        normalized.includes("cash")
    ) {

        POS_STATE.paymentMethod =
            "Cash";

    }

    else if (
        normalized.includes("card")
    ) {

        POS_STATE.paymentMethod =
            "Card";

    }

    else if (
        normalized.includes("gcash")
    ) {

        POS_STATE.paymentMethod =
            "GCash";

    }

    else {

        POS_STATE.paymentMethod =
            "Other";

    }


    posQueryAll(
        ".pos-payment-method-btn"
    )
    .forEach(
        function(button) {

            const value =
                posNormalize(
                    button.dataset.method ||
                    button.dataset.paymentMethod ||
                    button.textContent
                );


            button.classList.toggle(
                "active",
                value.includes(
                    posNormalize(
                        POS_STATE.paymentMethod
                    )
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

    const input =
        posEl(
            "posPaymentAmount"
        ) ||
        posEl(
            "posAmountReceived"
        );


    if (!input) {

        return 0;

    }


    return Math.max(
        0,
        posNumber(
            input.value
        )
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
   UPDATE PAYMENT
========================================================== */

function updatePOSPayment() {

    const total =
        getPOSGrandTotal();


    const payment =
        getPOSPaymentAmount();


    const change =
        getPOSChange();


    /* ======================================================
       TOTAL
    ====================================================== */

    [

        "posPaymentTotal",

        "posFinalTotal",

        "posTotalPayment"

    ]
    .forEach(
        function(id) {

            const element =
                posEl(id);


            if (element) {

                element.textContent =
                    posMoney(
                        total
                    );

            }

        }
    );


    /* ======================================================
       CHANGE
    ====================================================== */

    const changeElement =
        posEl(
            "posChange"
        );


    if (changeElement) {

        changeElement.textContent =
            posMoney(
                change
            );

    }


    const modalChange =
        posEl(
            "posModalChange"
        );


    if (modalChange) {

        modalChange.textContent =
            posMoney(
                change
            );

    }


    const modalTotal =
        posEl(
            "posModalTotal"
        );


    if (modalTotal) {

        modalTotal.textContent =
            posMoney(
                total
            );

    }


    /* ======================================================
       PAY BUTTON
    ====================================================== */

    const payButton =
        posEl(
            "posPayBtn"
        );


    if (payButton) {

        payButton.disabled =
            POS_STATE.cart.length === 0 ||
            payment < total ||
            POS_STATE.processing;

    }

}


/* ==========================================================
   CUSTOMER
========================================================== */

function getPOSCustomer() {

    const input =
        posEl(
            "posCustomerName"
        );


    if (!input) {

        return "Walk-in Customer";

    }


    return (
        String(
            input.value || ""
        )
        .trim()
        ||
        "Walk-in Customer"
    );

}


/* ==========================================================
   STOCK VALIDATION
========================================================== */

function validatePOSCartStock() {

    for (
        const item of
        POS_STATE.cart
    ) {

        const product =
            POS_STATE.products.find(
                function(product) {

                    return (
                        String(product.id) ===
                        String(item.productId)
                    );

                }
            );


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
   UPDATE STOCK
========================================================== */

async function updatePOSProductStocks() {

    const updates = {};


    POS_STATE.cart.forEach(
        function(item) {

            const product =
                POS_STATE.products.find(
                    function(product) {

                        return (
                            String(product.id) ===
                            String(item.productId)
                        );

                    }
                );


            if (!product) {

                return;

            }


            const currentStock =
                getPOSProductStock(
                    product
                );


            if (
                currentStock === null
            ) {

                return;

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
    );


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
   PROCESS PAYMENT
========================================================== */

async function processPOSPayment() {

    if (
        POS_STATE.processing
    ) {

        return;

    }


    if (
        POS_STATE.cart.length === 0
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


    POS_STATE.processing =
        true;


    const payButton =
        posEl(
            "posPayBtn"
        );


    const originalHTML =
        payButton
            ? payButton.innerHTML
            : "";


    try {

        if (payButton) {

            payButton.disabled =
                true;


            payButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Processing...

            `;

        }


        const customer =
            getPOSCustomer();


        const subtotal =
            getPOSSubtotal();


        const discount =
            getPOSDiscount();


        const change =
            payment -
            total;


        const orderNumber =
            generatePOSOrderNumber();


        const saleRef =
            db
                .ref("sales")
                .push();


        const saleId =
            saleRef.key;


        const saleItems =
            POS_STATE.cart.map(
                function(item) {

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
                            posNumber(
                                item.price
                            ) *
                            posNumber(
                                item.quantity
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
                customer,

            customerName:
                customer,

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
                POS_STATE.paymentMethod,

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


        /* ==================================================
           SAVE RECEIPT
        ================================================== */

        POS_STATE.lastSale =
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

        POS_STATE.cart =
            [];

        POS_STATE.discount =
            0;

        POS_STATE.customer =
            "Walk-in Customer";


        const discountInput =
            posEl(
                "posDiscount"
            );


        if (discountInput) {

            discountInput.value =
                "";

        }


        const amountInput =
            posEl(
                "posPaymentAmount"
            ) ||
            posEl(
                "posAmountReceived"
            );


        if (amountInput) {

            amountInput.value =
                "";

        }


        const customerInput =
            posEl(
                "posCustomerName"
            );


        if (customerInput) {

            customerInput.value =
                "";

        }


        renderPOSCart();

        updatePOSSummary();

        updatePOSOrderNumber();


        /* ==================================================
           REFRESH PRODUCTS
        ================================================== */

        await loadPOSProducts();


        posStatus(
            "Payment completed successfully."
        );

    }

    catch (error) {

        console.error(
            "PAPPRITO POS PAYMENT ERROR:",
            error
        );


        posStatus(
            "Unable to complete payment."
        );


        alert(
            "Unable to complete payment.\n\n" +
            (
                error?.message ||
                error
            )
        );

    }

    finally {

        POS_STATE.processing =
            false;


        if (payButton) {

            payButton.disabled =
                false;


            payButton.innerHTML =
                originalHTML ||
                `

                    <i class="fa-solid fa-check"></i>

                    PAY

                `;


            updatePOSPayment();

        }

    }

}


/* ==========================================================
   RECEIPT HTML
========================================================== */

function buildPOSReceiptHTML(
    sale
) {

    const items =
        (sale.items || [])
            .map(
                function(item, index) {

                    return `

                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    25px
                                    1fr
                                    45px
                                    80px;
                                gap:6px;
                                padding:6px 0;
                                border-bottom:
                                    1px dashed #ddd;
                                font-size:12px;
                            ">

                            <span>
                                ${index + 1}
                            </span>


                            <span>

                                ${posEscape(
                                    item.name
                                )}

                            </span>


                            <strong
                                style="text-align:center;">

                                ${item.quantity}

                            </strong>


                            <strong
                                style="
                                    text-align:right;
                                ">

                                ${posMoney(
                                    item.total
                                )}

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");


    return `

        <div
            style="
                width:100%;
                max-width:380px;
                margin:auto;
                font-family:Arial,sans-serif;
                color:#222;
                font-size:12px;
            ">


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


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin:4px 0;
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
                    margin:4px 0;
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
                    margin:4px 0;
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


            <hr>


            <!-- =========================================
                 ITEMS
            ========================================== -->

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        25px
                        1fr
                        45px
                        80px;
                    gap:6px;
                    padding-bottom:5px;
                    font-weight:900;
                ">

                <span>
                    SN
                </span>

                <span>
                    ITEM
                </span>

                <span
                    style="text-align:center;">

                    QTY

                </span>

                <span
                    style="text-align:right;">

                    TOTAL

                </span>

            </div>


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
                    padding:9px 0;
                    border-top:
                        2px solid #222;
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
                    ${posMoney(
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
                ">

                Thank you for dining with us!

            </div>


            <div
                style="
                    text-align:center;
                    margin-top:5px;
                    color:#777;
                    font-size:10px;
                ">

                PAPPRITO Restaurant POS

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

    const content =
        posEl(
            "posReceiptContent"
        ) ||
        posEl(
            "posReceipt"
        );


    if (content) {

        content.innerHTML =
            buildPOSReceiptHTML(
                sale
            );

    }


    const modal =
        posEl(
            "posReceiptModal"
        );


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

}


/* ==========================================================
   PRINT RECEIPT
========================================================== */

function printPOSReceipt(
    sale
) {

    sale =
        sale ||
        POS_STATE.lastSale ||
        window.currentPOSReceipt;


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

            ${receipt}


            <script>

                window.onload =
                    function() {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* ==========================================================
   REFRESH
========================================================== */

async function refreshPOS() {

    const button =
        posEl(
            "posRefreshProductsBtn"
        );


    const originalHTML =
        button
            ? button.innerHTML
            : "";


    try {

        if (button) {

            button.disabled =
                true;


            button.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin">
                </i>

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

        if (button) {

            button.disabled =
                false;


            button.innerHTML =
                originalHTML ||
                `
                    <i class="fa-solid fa-rotate"></i>
                `;

        }

    }

}


/* ==========================================================
   SEARCH
========================================================== */

function bindPOSSearch() {

    const input =
        posEl(
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
        function() {

            POS_STATE.searchTerm =
                String(
                    input.value || ""
                )
                .trim()
                .toLowerCase();


            filterPOSProducts();

        }
    );

}


/* ==========================================================
   REFRESH BUTTON
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
   CLEAR BUTTON
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
        function() {

            clearPOSCart(
                true
            );

        }
    );

}


/* ==========================================================
   CUSTOMER
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
        function() {

            POS_STATE.customer =
                getPOSCustomer();

        }
    );

}


/* ==========================================================
   DISCOUNT
========================================================== */

function bindPOSDiscount() {

    const input =
        posEl(
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
        function() {

            POS_STATE.discount =
                posNumber(
                    input.value
                );


            updatePOSSummary();

        }
    );

}


/* ==========================================================
   PAYMENT INPUT
========================================================== */

function bindPOSPaymentInput() {

    const input =
        posEl(
            "posPaymentAmount"
        ) ||
        posEl(
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
        updatePOSPayment
    );

}


/* ==========================================================
   PAYMENT METHODS
========================================================== */

function bindPOSPaymentMethods() {

    posQueryAll(
        ".pos-payment-method-btn"
    )
    .forEach(
        function(button) {

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
                function() {

                    setPOSPaymentMethod(

                        button.dataset.method ||

                        button.dataset.paymentMethod ||

                        button.textContent

                    );

                }
            );

        }
    );

}


/* ==========================================================
   PAY
========================================================== */

function bindPOSPay() {

    const button =
        posEl(
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
        processPOSPayment
    );

}


/* ==========================================================
   PRINT
========================================================== */

function bindPOSPrint() {

    const button =
        posEl(
            "posPrintReceiptBtn"
        ) ||
        posEl(
            "posPrintReceipt"
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
        function() {

            printPOSReceipt(
                POS_STATE.lastSale
            );

        }
    );

}


/* ==========================================================
   HOLD ORDER
========================================================== */

function holdPOSOrder() {

    if (
        POS_STATE.cart.length === 0
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
            POS_STATE.cart,

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


    clearPOSCart(
        false
    );


    posStatus(
        "Order placed on hold."
    );

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

        const data =
            JSON.parse(
                stored
            );


        POS_STATE.cart =
            Array.isArray(
                data.cart
            )
                ? data.cart
                : [];


        POS_STATE.discount =
            posNumber(
                data.discount
            );


        const customer =
            posEl(
                "posCustomerName"
            );


        if (customer) {

            customer.value =
                data.customer || "";

        }


        const discount =
            posEl(
                "posDiscount"
            );


        if (discount) {

            discount.value =
                POS_STATE.discount || "";

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
   HOLD / RECALL BIND
========================================================== */

function bindPOSHoldRecall() {

    const hold =
        posEl(
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
            holdPOSOrder
        );

    }


    const recall =
        posEl(
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
            recallPOSOrder
        );

    }

}


/* ==========================================================
   FULLSCREEN
========================================================== */

async function togglePOSFullscreen() {

    try {

        if (
            !document.fullscreenElement
        ) {

            if (
                document.documentElement.requestFullscreen
            ) {

                await document
                    .documentElement
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

    catch (error) {

        console.warn(
            "Fullscreen unavailable:",
            error
        );

    }

}


/* ==========================================================
   FULLSCREEN BIND
========================================================== */

function bindPOSFullscreen() {

    const button =
        posEl(
            "posFullscreenBtn"
        );


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
        posEl(
            "posDateTime"
        );


    if (!element) {

        return;

    }


    element.textContent =
        new Date().toLocaleString(
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
   CLOCK
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
   EXIT POS
========================================================== */

function bindPOSExit() {

    const button =
        posEl(
            "posExitBtn"
        );


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
        function() {

            localStorage.setItem(
                "currentPage",
                "pages/dashboard.html"
            );


            window.location.href =
                "../index.html";

        }
    );

}


/* ==========================================================
   QUICK KEYPAD
========================================================== */

function initializePOSKeypad() {

    posQueryAll(
        "[data-key]"
    )
    .forEach(
        function(button) {

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
                function() {

                    const key =
                        button.dataset.key;


                    const input =
                        posEl(
                            "posPaymentAmount"
                        ) ||
                        posEl(
                            "posAmountReceived"
                        );


                    if (!input) {

                        return;

                    }


                    if (
                        key === "clear"
                    ) {

                        input.value =
                            "";

                    }

                    else if (
                        key === "backspace"
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


                    updatePOSPayment();

                }
            );

        }
    );

}


/* ==========================================================
   MODAL PAYMENT
========================================================== */

function bindPOSModalPayment() {

    const modalInput =
        posEl(
            "posModalAmountReceived"
        );


    const mainInput =
        posEl(
            "posPaymentAmount"
        ) ||
        posEl(
            "posAmountReceived"
        );


    if (
        modalInput &&
        modalInput.dataset.posBound !==
        "true"
    ) {

        modalInput.dataset.posBound =
            "true";


        modalInput.addEventListener(
            "input",
            function() {

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


                const element =
                    posEl(
                        "posModalChange"
                    );


                if (element) {

                    element.textContent =
                        posMoney(
                            change
                        );

                }

            }
        );

    }


    const confirm =
        posEl(
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
            function() {

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

    bindPOSHoldRecall();

    bindPOSFullscreen();

    bindPOSExit();

    bindPOSModalPayment();

    initializePOSKeypad();

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


        /* ==================================================
           LOAD BOTH
        ================================================== */

        await Promise.all([

            loadPOSCategories(),

            loadPOSProducts()

        ]);


        /* ==================================================
           FINAL UI
        ================================================== */

        renderPOSCategories();

        filterPOSProducts();

        renderPOSCart();

        updatePOSSummary();

        updatePOSPayment();


        POS_STATE.initialized =
            true;


        console.log(
            "=========================================="
        );


        console.log(
            "PAPPRITO POS V3 READY"
        );


        console.log(
            "Products:",
            POS_STATE.products.length
        );


        console.log(
            "Categories:",
            POS_STATE.categories.length
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
   GLOBAL COMPATIBILITY
========================================================== */

window.POS_STATE =
    POS_STATE;


window.PAPPRITO_POS =
    POS_STATE;


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


window.filterPOSProducts =
    filterPOSProducts;


window.filterPOSCategory =
    function(category) {

        POS_STATE.selectedCategory =
            category || "all";

        filterPOSProducts();

    };


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


/* ==========================================================
   READY
========================================================== */

console.log(
    "PAPPRITO POS V3 ENGINE LOADED."
);

console.log(
    "Category filtering: ROBUST"
);

console.log(
    "Cart layout: SN | ITEM | QTY | TOTAL"
);

console.log(
    "Receipt: SINGLE CHANGE"
);
