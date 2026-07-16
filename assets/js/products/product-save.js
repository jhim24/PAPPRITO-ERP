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
