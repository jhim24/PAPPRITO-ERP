// ==========================================
// PAPPRITO ERP
// CATEGORY EDIT / UPDATE
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

        document.getElementById("categoryCode").value = category.code || "";

        document.getElementById("categoryName").value = category.name || "";

        document.getElementById("categoryDescription").value = category.description || "";

        document.getElementById("categoryIcon").value = category.icon || "fa-utensils";

        document.getElementById("categoryColor").value = category.color || "#C8102E";

        document.getElementById("displayOrder").value = category.displayOrder || 1;

        document.getElementById("categoryStatus").value = category.status || "Active";

        document.getElementById("categoryModalTitle").innerHTML =
            '<i class="fa-solid fa-pen"></i> Edit Category';

        document.getElementById("btnSaveText").textContent =
            "Update Category";

        const modal = new bootstrap.Modal(
            document.getElementById("categoryModal")
        );

        modal.show();

    } catch (error) {

        console.error("Edit Error:", error);

        alert("Unable to load category.");

    }

}

// ==========================================
// UPDATE CATEGORY
// ==========================================

async function updateCategory() {

    try {

        if (!editingCategoryId) {

            return;

        }

        const name = document.getElementById("categoryName").value.trim();

        if (name === "") {

            alert("Category Name is required.");

            return;

        }

        await db.ref("categories/" + editingCategoryId).update({

            name: name,

            description: document.getElementById("categoryDescription").value.trim(),

            icon: document.getElementById("categoryIcon").value.trim() || "fa-utensils",

            color: document.getElementById("categoryColor").value,

            displayOrder: Number(document.getElementById("displayOrder").value),

            status: document.getElementById("categoryStatus").value,

            updatedDate: new Date().toISOString()

        });

        const modal = bootstrap.Modal.getInstance(
            document.getElementById("categoryModal")
        );

        if (modal) {

            modal.hide();

        }

        editingCategoryId = null;

        document.getElementById("categoryModalTitle").innerHTML =
            '<i class="fa-solid fa-tags"></i> Add Category';

        document.getElementById("btnSaveText").textContent =
            "Save Category";

        clearCategoryForm();

        alert("Category updated successfully.");

    }

    catch(error){

        console.error("Update Error:", error);

        alert("Unable to update category.");

    }

}
