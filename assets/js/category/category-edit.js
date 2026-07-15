// ==========================================
// PAPPRITO ERP
// CATEGORY EDIT
// ==========================================

let editingCategoryId = null;

// ==========================================
// OPEN EDIT
// ==========================================

async function editCategory(categoryId) {

    try {

        editingCategoryId = categoryId;

        const snapshot = await db.ref("categories/" + categoryId).once("value");

        if (!snapshot.exists()) {

            alert("Category not found.");

            return;

        }

        const category = snapshot.val();

        document.getElementById("categoryCode").value =
            category.code || "";

        document.getElementById("categoryName").value =
            category.name || "";

        document.getElementById("categoryDescription").value =
            category.description || "";

        document.getElementById("categoryIcon").value =
            category.icon || "fa-utensils";

        document.getElementById("categoryColor").value =
            category.color || "#C8102E";

        document.getElementById("displayOrder").value =
            category.displayOrder || 1;

        document.getElementById("categoryStatus").value =
            category.status || "Active";

        document.querySelector("#categoryModal .modal-title").innerHTML =
            '<i class="fa-solid fa-pen"></i> Edit Category';

        document.getElementById("btnSaveCategory").innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Update Category';

        const modal = new bootstrap.Modal(
            document.getElementById("categoryModal")
        );

        modal.show();

    } catch (error) {

        console.error(error);

        alert("Unable to load category.");

    }

}
