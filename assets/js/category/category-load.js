// ==========================================
// PAPPRITO ERP
// CATEGORY LOAD
// ==========================================

function loadCategories() {

    const table = document.getElementById("categoryTable");
    const total = document.getElementById("totalCategories");
    const footerTotal = document.getElementById("footerTotal");

    if (!table) return;

    db.ref("categories")
        .orderByChild("displayOrder")
        .on("value", (snapshot) => {

            table.innerHTML = "";

            let count = 0;

            if (!snapshot.exists()) {

                table.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-5">
                            <i class="fa-solid fa-folder-open fa-3x text-secondary mb-3"></i>
                            <br>
                            No Categories Found
                        </td>
                    </tr>
                `;

                if (total) total.textContent = "0";
                if (footerTotal) footerTotal.textContent = "0";

                return;
            }

            snapshot.forEach((child) => {

                const category = child.val();

                const icon = category.icon || "fa-utensils";
                const color = category.color || "#C8102E";
                const productCount = category.productCount || 0;
                const code = category.code || "N/A";

                const badge = category.status === "Active"
                    ? `<span class="badge bg-success">Active</span>`
                    : `<span class="badge bg-danger">Inactive</span>`;

                count++;

                table.innerHTML += `
                    <tr>

                        <td>${code}</td>

                        <td>
                            <i class="fa-solid ${icon}"
                               style="color:${color};font-size:20px;"></i>
                        </td>

                        <td>
                            <strong>${category.name}</strong>
                        </td>

                        <td>
                            ${category.description || ""}
                        </td>

                        <td>
                            ${productCount}
                        </td>

                        <td>
                            ${badge}
                        </td>

                        <td>

                            <button
                                class="btn btn-warning btn-sm me-1"
                                onclick="editCategory('${child.key}')">

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            <button
                                class="btn btn-danger btn-sm"
                                onclick="deleteCategory('${child.key}')">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>
                `;

            });

            if (total) total.textContent = count;
            if (footerTotal) footerTotal.textContent = count;

        });

}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadCategories();

});
