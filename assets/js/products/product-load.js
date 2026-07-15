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

    console.log("TABLE =", table);
    console.log("TOTAL =", total);
    console.log("FOOTER =", footerTotal);

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

    try {

        const product = child.val();

        console.log("Loading:", product);
console.log("Before append:", table.innerHTML.length);
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
                <td>${product.code || ""}</td>

                <td>
                    <img src="${image}"
                         style="width:60px;height:60px;object-fit:cover;border-radius:10px;">
                </td>

                <td>
                    <strong>${product.name || product.productName || "(No Name)"}</strong>
                </td>

                <td>
                    ${product.categoryName || product.category || ""}
                </td>

                <td>
                    ₱${Number(product.sellingPrice || product.price || 0).toFixed(2)}
                </td>

                <td>
                    ${product.currentStock || product.stock || 0}
                </td>

                <td>
                    ${badge}
                </td>

                <td>
                    Edit
                </td>
            </tr>
        `;
console.log("After append:", table.innerHTML.length);
    } catch (err) {

        console.error("Error on record:", child.key, err);

    }

});
            total.textContent = count;

            footerTotal.textContent = count;

        });

}
