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
// ==========================================
// IMAGE UPLOAD PREVIEW
// ==========================================

function previewUploadedImage(event) {

    const file = event.target.files[0];

    if (!file) {

        resetProductImage();

        return;

    }

    // Allow only image files

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Only JPG, PNG and WEBP images are allowed.");

        resetProductImage();

        return;

    }

    // Maximum file size (2MB)

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {

        alert("Image size must not exceed 2MB.");

        resetProductImage();

        return;

    }

    const reader = new FileReader();

    reader.onload = function (e) {

        document.getElementById("productImagePreview").src = e.target.result;

        // Clear URL input if upload is used

        document.getElementById("productImageURL").value = "";

    };

    reader.readAsDataURL(file);

}

// ==========================================
// REGISTER FILE EVENT
// ==========================================

document.addEventListener("change", function (e) {

    if (e.target.id === "productImageFile") {

        previewUploadedImage(e);

    }

});
// ==========================================
// IMAGE URL PREVIEW
// ==========================================

document.addEventListener("input", function (e) {

    if (e.target.id === "productImageURL") {

        const url = e.target.value.trim();

        selectedProductImage = url;

        document.getElementById("productImagePreview").src =
            url || DEFAULT_PRODUCT_IMAGE;

    }

});
