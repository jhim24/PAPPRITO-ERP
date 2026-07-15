// ==========================================
// PAPPRITO ERP
// PRODUCT IMAGE ENGINE
// STEP 21.2.3A
// ==========================================

// ==========================================
// DEFAULT IMAGE
// ==========================================

const DEFAULT_PRODUCT_IMAGE =
    "assets/img/no-product.png";

// ==========================================
// INITIALIZE IMAGE ENGINE
// ==========================================

function initializeProductImage() {

    const preview =
        document.getElementById("productImagePreview");

    if (preview) {

        preview.src = DEFAULT_PRODUCT_IMAGE;

    }

}

// ==========================================
// RESET PRODUCT IMAGE
// ==========================================

function resetProductImage() {

    const preview =
        document.getElementById("productImagePreview");

    const fileInput =
        document.getElementById("productImageFile");

    const urlInput =
        document.getElementById("productImageURL");

    if (preview) {

        preview.src = DEFAULT_PRODUCT_IMAGE;

    }

    if (fileInput) {

        fileInput.value = "";

    }

    if (urlInput) {

        urlInput.value = "";

    }

}

// ==========================================
// REGISTER EVENTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    initializeProductImage();

});
