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
