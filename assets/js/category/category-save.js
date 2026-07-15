// ==========================================
// PAPPRITO ERP
// CATEGORY SAVE
// ==========================================

// Generate next Category Code
async function generateCategoryCode() {

    try {

        const snapshot = await db.ref("categories").once("value");

        let highest = 0;

        snapshot.forEach(child => {

            const data = child.val();

            if (!data.code) return;

            const number = parseInt(data.code.replace("CAT", "")) || 0;

            if (number > highest) {

                highest = number;

            }

        });

        const nextCode = "CAT" + String(highest + 1).padStart(4, "0");

        document.getElementById("categoryCode").value = nextCode;

    } catch (error) {

        console.error("Generate Code Error:", error);

    }

}

// Save Category
async function saveCategory() {

    try {
if (editingCategoryId) {

    return updateCategory();

}
        const code = document.getElementById("categoryCode").value.trim();

        const name = document.getElementById("categoryName").value.trim();

        const description = document.getElementById("categoryDescription").value.trim();

        const icon = document.getElementById("categoryIcon").value.trim() || "fa-utensils";

        const color = document.getElementById("categoryColor").value;

        const displayOrder = parseInt(document.getElementById("displayOrder").value) || 1;

        const status = document.getElementById("categoryStatus").value;

        // Validation
        if (name === "") {

            alert("Category Name is required.");

            return;

        }

        // Duplicate Name Check
        const duplicate = await db.ref("categories")
            .orderByChild("name")
            .equalTo(name)
            .once("value");

        if (duplicate.exists()) {

            alert("Category already exists.");

            return;

        }

        // Firebase Key
        const categoryRef = db.ref("categories").push();

        // Save
        await categoryRef.set({

            categoryId: categoryRef.key,

            code: code,

            name: name,

            description: description,

            icon: icon,

            color: color,

            displayOrder: displayOrder,

            status: status,

            productCount: 0,

            createdDate: new Date().toISOString(),

            updatedDate: ""

        });

        // Reset Form
        clearCategoryForm();

        // Generate Next Code
        generateCategoryCode();

        // Close Modal
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("categoryModal")
        );

        if (modal) {

            modal.hide();

        }

        alert("Category saved successfully.");

    } catch (error) {

        console.error(error);

        alert("Unable to save category.");

    }

}

// Clear Form
function clearCategoryForm() {

    document.getElementById("categoryName").value = "";

    document.getElementById("categoryDescription").value = "";

    document.getElementById("categoryIcon").value = "fa-utensils";

    document.getElementById("categoryColor").value = "#C8102E";

    document.getElementById("displayOrder").value = 1;

    document.getElementById("categoryStatus").value = "Active";

}

// Register Events
document.addEventListener("DOMContentLoaded", () => {

    generateCategoryCode();

    const btn = document.getElementById("btnSaveCategory");

    if (btn) {

        btn.addEventListener("click", saveCategory);

    }

});
