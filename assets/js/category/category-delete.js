// ==========================================
// PAPPRITO ERP
// CATEGORY DELETE
// ==========================================

async function deleteCategory(categoryId) {

    try {

        const snapshot = await db.ref("categories/" + categoryId).once("value");

        if (!snapshot.exists()) {

            alert("Category not found.");

            return;

        }

        const category = snapshot.val();

        const confirmDelete = confirm(
            `Delete Category?\n\n${category.name}\n\nThis action cannot be undone.`
        );

        if (!confirmDelete) {

            return;

        }

        await db.ref("categories/" + categoryId).remove();

        alert("Category deleted successfully.");

    }

    catch (error) {

        console.error("Delete Error:", error);

        alert("Unable to delete category.");

    }

}
