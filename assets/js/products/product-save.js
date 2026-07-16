// ==========================================
// PAPPRITO ERP
// PRODUCT SAVE ENGINE V3
// STEP 21.4.2
// ==========================================

let editingProductId = null;

let selectedProductImage = "";

let selectedCategoryId = "";

let selectedCategoryName = "";
// ==========================================
// INITIALIZE PRODUCT SAVE
// ==========================================

function initializeProductSave(){

    const btnSave =
        document.getElementById("btnSaveProduct");

    if(btnSave){

        btnSave.removeEventListener("click", saveProduct);

        btnSave.addEventListener("click", saveProduct);

    }

}
// ==========================================
// SAVE PRODUCT
// ==========================================

function saveProduct(){

    const code =
        document.getElementById("productCode").value.trim();

    const name =
        document.getElementById("productName").value.trim();

    const category =
        document.getElementById("productCategory");

    const description =
        document.getElementById("productDescription").value.trim();

    const costPrice =
        Number(document.getElementById("costPrice").value || 0);

    const sellingPrice =
        Number(document.getElementById("sellingPrice").value || 0);

    const openingStock =
        Number(document.getElementById("openingStock").value || 0);

    const reorderLevel =
        Number(document.getElementById("reorderLevel").value || 0);

    const status =
        document.getElementById("productStatus").value;

    if(name === ""){

        alert("Please enter Product Name.");

        return;

    }

    if(category.value === ""){

        alert("Please select Category.");

        return;

    }

    const product = {

        code: code,

        name: name,

        categoryId: category.value,

        categoryName:
            category.options[category.selectedIndex].text,

        description: description,

        costPrice: costPrice,

        sellingPrice: sellingPrice,

        openingStock: openingStock,

        currentStock: openingStock,

        reorderLevel: reorderLevel,

        image: selectedProductImage,

        status: status,

        createdAt: Date.now()

    };

    if(editingProductId){

        db.ref("products/" + editingProductId)
            .update(product)
            .then(()=>{

                alert("Product Updated.");

            });

    }else{

        db.ref("products")
            .push(product)
            .then(()=>{

                alert("Product Saved.");

            });

    }

}
