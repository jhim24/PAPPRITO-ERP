// ==========================================
// PAPPRITO ERP
// PRODUCT LOAD
// STEP 21.3.1
// ==========================================

// ==========================================
// LOAD PRODUCTS
// ==========================================

function loadProducts() {

    const table =
        document.getElementById("productTable");

    const total =
        document.getElementById("totalProducts");

    const footerTotal =
        document.getElementById("footerTotalProducts");

    if (!table) return;

    db.ref("products")
        .orderByChild("name")
        .on("value", (snapshot) => {

            table.innerHTML = "";

            let count = 0;

            if (!snapshot.exists()) {

                table.innerHTML = `

                    <tr>

                        <td colspan="8"
                            class="text-center py-5">

                            <i class="fa-solid fa-box-open
                               fa-3x text-secondary mb-3"></i>

                            <br>

                            No Products Found

                        </td>

                    </tr>

                `;

                total.textContent = "0";

                footerTotal.textContent = "0";

                return;

            }

            snapshot.forEach((child) => {

                const product = child.val();

                count++;

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

                        <td>${product.code}</td>

                        <td>

                            <img

                                src="${image}"

                                style="width:60px;
                                       height:60px;
                                       object-fit:cover;
                                       border-radius:10px;">

                        </td>

                        <td>

                            <strong>${product.name}</strong>

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

                                onclick="editProduct('${child.key}')">

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            <button

                                class="btn btn-danger btn-sm"

                                onclick="deleteProduct('${child.key}')">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>

                `;

            });

            total.textContent = count;

            footerTotal.textContent = count;

        });

}
