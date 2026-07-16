// ==========================================
// PAPPRITO ERP
// PRODUCT EDIT ENGINE V3
// ==========================================

async function editProduct(productId){

    try{

        editingProductId = productId;

        const snapshot =
            await db.ref("products/" + productId).once("value");

        if(!snapshot.exists()){

            alert("Product not found.");

            return;

        }

        const product = snapshot.val();

        document.getElementById("productCode").value =
            product.code || "";

        document.getElementById("productName").value =
            product.name || "";

        document.getElementById("productCategory").value =
            product.categoryId || "";

        document.getElementById("productDescription").value =
            product.description || "";

        document.getElementById("costPrice").value =
            product.costPrice || 0;

        document.getElementById("sellingPrice").value =
            product.sellingPrice || 0;

        document.getElementById("openingStock").value =
            product.openingStock || 0;

        document.getElementById("currentStock").value =
            product.currentStock || 0;

        document.getElementById("reorderLevel").value =
            product.reorderLevel || 10;

        document.getElementById("productStatus").value =
            product.status || "Active";

        selectedProductImage =
            product.image || "";

        document.getElementById("productImageURL").value =
            selectedProductImage;

        document.getElementById("productImagePreview").src =
            selectedProductImage || "assets/img/no-product.png";

        document.getElementById("btnSaveProductText").textContent =
            "Update Product";

        const modal = new bootstrap.Modal(
            document.getElementById("productModal")
        );

        modal.show();

    }

    catch(error){

        console.error(error);

        alert("Unable to load product.");

    }

}
