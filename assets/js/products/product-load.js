// ==========================================
// PAPPRITO ERP
// PRODUCT LOAD ENGINE V2
// STEP 21.3B-2B
// ==========================================

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let productList = [];

let productListener = null;

// ==========================================
// INITIALIZE PRODUCT PAGE
// ==========================================

function initializeProductPage(){

    generateProductCode();

    loadProductCategories();

    initializeProductSearch();

    initializeProductSave();

    startProductListener();

}
// ==========================================
// FIREBASE PRODUCT LISTENER
// ==========================================

function startProductListener(){

    // Prevent duplicate listeners

    if(productListener){

        productListener.off();

    }

    productListener = db.ref("products");

    productListener.on("value", (snapshot)=>{

        productList = [];

        snapshot.forEach((child)=>{

            const product = child.val();

            product.productId = child.key;

            productList.push(product);

        });

        renderProductTable();

        updateProductCounter();

    });

}
// ==========================================
// RENDER PRODUCT TABLE
// ==========================================

function renderProductTable(){

    const table =
        document.getElementById("productTable");

    if(!table) return;

    table.innerHTML = "";

    // No Products

    if(productList.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="8" class="text-center py-5">

                    <i class="fa-solid fa-box-open fa-3x text-secondary mb-3"></i>

                    <br>

                    <strong>No Products Found</strong>

                </td>

            </tr>

        `;

        return;

    }

    productList.forEach(product=>{

        const image =
            product.image && product.image !== ""
                ? product.image
                : "assets/img/no-product.png";

        const badge =
            product.status === "Active"

            ? `<span class="badge bg-success">Active</span>`

            : `<span class="badge bg-secondary">Inactive</span>`;

        table.innerHTML += `

            <tr>

                <td>

                    ${product.code || ""}

                </td>

                <td>

                    <img

                        src="${image}"

                        style="width:60px;
                               height:60px;
                               object-fit:cover;
                               border-radius:10px;">

                </td>

                <td>

                    <strong>

                        ${product.name || ""}

                    </strong>

                </td>

                <td>

                    ${product.categoryName || ""}

                </td>

                <td>

                    ₱${Number(product.sellingPrice || 0).toFixed(2)}

                </td>

                <td>

                    ${product.currentStock || 0}

                </td>

                <td>

                    ${badge}

                </td>

                <td>

                    <button

                        class="btn btn-warning btn-sm me-1"

                        onclick="editProduct('${product.productId}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button

                        class="btn btn-danger btn-sm"

                        onclick="deleteProduct('${product.productId}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}
// ==========================================
// UPDATE PRODUCT COUNTERS
// ==========================================

function updateProductCounter(){

    const total =
        document.getElementById("totalProducts");

    const footer =
        document.getElementById("footerTotalProducts");

    if(total){

        total.textContent = productList.length;

    }

    if(footer){

        footer.textContent = productList.length;

    }

}
// ==========================================
// LOAD PRODUCT CATEGORY DROPDOWN
// ==========================================

function loadProductCategories(){

    const dropdown =
        document.getElementById("productCategory");

    if(!dropdown) return;

    db.ref("categories")
        .orderByChild("name")
        .once("value")
        .then((snapshot)=>{

            dropdown.innerHTML =
                `<option value="">Select Category</option>`;

            snapshot.forEach((child)=>{

                const category = child.val();

                dropdown.innerHTML += `

                    <option value="${child.key}">

                        ${category.name}

                    </option>

                `;

            });

        });

}
