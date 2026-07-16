// ==========================================
// PAPPRITO ERP
// PRODUCT LOAD
// STEP 21.3.1B
// VERSION 2
// ==========================================

function loadProducts() {

    const table =
        document.getElementById("productTable");

    const total =
        document.getElementById("totalProducts");

    const footer =
        document.getElementById("footerTotalProducts");

    if (!table) {

        console.log("productTable not found.");

        return;

    }

    db.ref("products").once("value").then((snapshot) => {

    console.log("Firebase callback started");
    console.log("Exists:", snapshot.exists());
    console.log("Children:", snapshot.numChildren());

        table.innerHTML = "";

        let count = 0;

        if (!snapshot.exists()) {

            table.innerHTML = `

                <tr>

                    <td colspan="8"
                        class="text-center py-5">

                        <i class="fa-solid fa-box-open fa-3x text-secondary mb-3"></i>

                        <br>

                        No Products Found

                    </td>

                </tr>

            `;

            total.textContent = "0";

            footer.textContent = "0";

            return;

        }

        snapshot.forEach((child) => {

            const product = child.val();

            count++;

            const image =
                product.image ||
                "assets/img/no-product.png";

            const name =
                product.name ||
                product.productName ||
                "";

            const category =
                product.categoryName ||
                product.category ||
                "";

            const price =
                Number(
                    product.sellingPrice ??
                    product.price ??
                    0
                ).toFixed(2);

            const stock =
                product.currentStock ??
                product.stock ??
                0;

            const status =
                product.status || "Active";

            const badge =
                status === "Active"

                ? `<span class="badge bg-success">Active</span>`

                : `<span class="badge bg-secondary">Inactive</span>`;

                     table.innerHTML += `

                <tr>

                    <td>${product.code || ""}</td>

                    <td>
                        <img
                            src="${image}"
                            style="width:60px;height:60px;object-fit:cover;border-radius:10px;">
                    </td>

                    <td><strong>${name}</strong></td>

                    <td>${category}</td>

                    <td>₱${price}</td>

                    <td>${stock}</td>

                    <td>${badge}</td>

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

        });   // <-- Ito lang ang pang-close ng snapshot.forEach()

        total.textContent = count;
        footer.textContent = count;

    }).catch((error) => {

        console.error("Firebase Load Error:", error);

    });

}
