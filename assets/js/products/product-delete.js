// ==========================================
// PAPPRITO ERP
// PRODUCT DELETE ENGINE V3
// ==========================================

async function deleteProduct(productId){

    try{

        const confirmDelete = confirm(
            "Are you sure you want to delete this product?"
        );

        if(!confirmDelete){

            return;

        }

        await db.ref("products/" + productId).remove();

        alert("Product deleted successfully.");

    }

    catch(error){

        console.error(error);

        alert("Unable to delete product.");

    }

}
