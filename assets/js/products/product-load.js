// ==========================================
// PAPPRITO ERP
// PRODUCT LOAD ENGINE V2
// STEP 21.3B-2B
// ==========================================

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let productList = [];

let productListener = null;

// ==========================================
// INITIALIZE PRODUCT PAGE
// ==========================================

function initializeProductPage(){

    generateProductCode();

    loadProductCategories();

    startProductListener();

}
// ==========================================
// FIREBASE PRODUCT LISTENER
// ==========================================

function startProductListener(){

    // Prevent duplicate listeners

    if(productListener){

        productListener.off();

    }

    productListener = db.ref("products");

    productListener.on("value", (snapshot)=>{

        productList = [];

        snapshot.forEach((child)=>{

            const product = child.val();

            product.productId = child.key;

            productList.push(product);

        });

        renderProductTable();

        updateProductCounter();

    });

}
