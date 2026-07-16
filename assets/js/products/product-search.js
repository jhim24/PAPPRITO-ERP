// ==========================================
// PAPPRITO ERP
// PRODUCT SEARCH ENGINE V2
// ==========================================

// ==========================================
// SEARCH PRODUCTS
// ==========================================

function searchProducts(){

    const keyword =
        document.getElementById("searchProduct")
        ?.value
        .trim()
        .toLowerCase() || "";

    const category =
        document.getElementById("filterCategory")
        ?.value || "";

    const status =
        document.getElementById("filterStatus")
        ?.value || "";

    const filtered = productList.filter(product=>{

        const name =
            (product.name || "").toLowerCase();

        const code =
            (product.code || "").toLowerCase();

        const cat =
            product.categoryId || "";

        const stat =
            product.status || "";

        const matchKeyword =
            keyword === "" ||
            name.includes(keyword) ||
            code.includes(keyword);

        const matchCategory =
            category === "" ||
            cat === category;

        const matchStatus =
            status === "" ||
            stat === status;

        return (
            matchKeyword &&
            matchCategory &&
            matchStatus
        );

    });

    renderFilteredProducts(filtered);

}
// ==========================================
// RENDER FILTERED PRODUCTS
// ==========================================

function renderFilteredProducts(products){

    const table =
        document.getElementById("productTable");

    if(!table) return;

    table.innerHTML = "";

    if(products.length === 0){

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

    products.forEach(product=>{

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

                <td>${product.code || ""}</td>

                <td>

                    <img

                        src="${image}"

                        style="width:60px;
                               height:60px;
                               object-fit:cover;
                               border-radius:10px;">

                </td>

                <td>

                    <strong>${product.name || ""}</strong>

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
