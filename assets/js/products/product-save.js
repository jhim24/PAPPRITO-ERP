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

    const showMenu =
    document.getElementById("showMenu").checked;
    
    if(name === ""){

        alert("Please enter Product Name.");

        return;

    }

    if(category.value === ""){

        alert("Please select Category.");

        return;

    }
    
    const imageURL =
    document.getElementById("productImageURL").value.trim();

selectedProductImage = imageURL;
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

        showMenu: showMenu,

        status: status,

        createdAt: Date.now()

    };

    if(editingProductId){

        db.ref("products/" + editingProductId)
            .update(product)
            
            .then(()=>{

    alert("Product Updated.");

    resetProductForm();

    startProductListener();

    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById("productModal")
        );

    if(modal){

        modal.hide();

    }

});

    }else{

        db.ref("products")
            .push(product)
            
           .then(()=>{

    alert("Product Saved.");

    resetProductForm();

    startProductListener();

    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById("productModal")
        );

    if(modal){

        modal.hide();

    }

});

    }

}
// ==========================================
// RESET PRODUCT FORM
// ==========================================

function resetProductForm(){

    editingProductId = null;

    selectedProductImage = "";

    document.getElementById("productName").value = "";

    document.getElementById("productDescription").value = "";

    document.getElementById("costPrice").value = 0;

    document.getElementById("sellingPrice").value = 0;

    document.getElementById("openingStock").value = 0;

    document.getElementById("currentStock").value = 0;

    document.getElementById("reorderLevel").value = 10;

    document.getElementById("productStatus").value = "Active";

    document.getElementById("productCategory").selectedIndex = 0;

    document.getElementById("productImageURL").value = "";

    document.getElementById("productImagePreview").src =
        "assets/img/no-product.png";

    generateProductCode();

}
// ==========================================
// GENERATE PRODUCT CODE
// ==========================================

function generateProductCode(){

    db.ref("products").once("value").then((snapshot)=>{

        const total = snapshot.numChildren() + 1;

        const code =
            "PRD-" +
            String(total).padStart(5,"0");

        const txt =
            document.getElementById("productCode");

        if(txt){

            txt.value = code;

        }

    });

}
