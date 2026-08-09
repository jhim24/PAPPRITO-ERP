// ==========================================
// PAPPRITO ERP
// PRODUCT IMAGE ENGINE V4
// ==========================================

"use strict";


// ==========================================
// GLOBAL IMAGE VARIABLES
// ==========================================

let selectedProductImage = "";

let selectedProductFile = null;


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
        document.getElementById(
            "productImagePreview"
        );

    const fileInput =
        document.getElementById(
            "productImageFile"
        );

    const urlInput =
        document.getElementById(
            "productImageURL"
        );


    selectedProductImage = "";

    selectedProductFile = null;


    if (preview) {

        preview.src =
            DEFAULT_PRODUCT_IMAGE;

    }


    if (fileInput) {

        fileInput.value = "";

    }


    if (urlInput) {

        urlInput.value = "";

    }

}


// ==========================================
// RESET PRODUCT IMAGE
// ==========================================

function resetProductImage() {

    selectedProductImage = "";

    selectedProductFile = null;


    const preview =
        document.getElementById(
            "productImagePreview"
        );

    const fileInput =
        document.getElementById(
            "productImageFile"
        );

    const urlInput =
        document.getElementById(
            "productImageURL"
        );


    if (preview) {

        preview.src =
            DEFAULT_PRODUCT_IMAGE;

    }


    if (fileInput) {

        fileInput.value = "";

    }


    if (urlInput) {

        urlInput.value = "";

    }

}


// ==========================================
// IMAGE UPLOAD PREVIEW
// ==========================================

function previewUploadedImage(event) {

    const file =
        event.target.files[0];


    if (!file) {

        selectedProductFile = null;

        return;

    }


    // ======================================
    // ALLOWED FILE TYPES
    // ======================================

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Only JPG, PNG and WEBP images are allowed."
        );

        resetProductImage();

        return;

    }


    // ======================================
    // MAX SIZE
    // ======================================

    const maxSize =
        2 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "Image size must not exceed 2MB."
        );

        resetProductImage();

        return;

    }


    // ======================================
    // STORE FILE
    // ======================================

    selectedProductFile = file;


    // ======================================
    // CLEAR URL
    // ======================================

    const urlInput =
        document.getElementById(
            "productImageURL"
        );


    if (urlInput) {

        urlInput.value = "";

    }


    selectedProductImage = "";


    // ======================================
    // PREVIEW
    // ======================================

    const reader =
        new FileReader();


    reader.onload = function (e) {

        const preview =
            document.getElementById(
                "productImagePreview"
            );


        if (preview) {

            preview.src =
                e.target.result;

        }

    };


    reader.readAsDataURL(file);

}


// ==========================================
// FILE EVENT
// ==========================================

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.id ===
            "productImageFile"
        ) {

            previewUploadedImage(event);

        }

    }
);


// ==========================================
// IMAGE URL
// ==========================================

document.addEventListener(
    "input",
    function (event) {

        if (
            event.target.id !==
            "productImageURL"
        ) {

            return;

        }


        const url =
            event.target.value.trim();


        // URL takes priority

        if (url !== "") {

            selectedProductFile = null;

            selectedProductImage =
                url;


            const fileInput =
                document.getElementById(
                    "productImageFile"
                );


            if (fileInput) {

                fileInput.value = "";

            }


            const preview =
                document.getElementById(
                    "productImagePreview"
                );


            if (preview) {

                preview.src = url;

            }

        }

        else {

            selectedProductImage = "";

        }

    }
);


// ==========================================
// DEFAULT IMAGE BUTTON
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#btnDefaultImage"
            );


        if (!button) return;


        selectedProductFile = null;

        selectedProductImage =
            DEFAULT_PRODUCT_IMAGE;


        const preview =
            document.getElementById(
                "productImagePreview"
            );


        if (preview) {

            preview.src =
                DEFAULT_PRODUCT_IMAGE;

        }


        const fileInput =
            document.getElementById(
                "productImageFile"
            );


        if (fileInput) {

            fileInput.value = "";

        }


        const urlInput =
            document.getElementById(
                "productImageURL"
            );


        if (urlInput) {

            urlInput.value = "";

        }

    }
);


// ==========================================
// REMOVE IMAGE BUTTON
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#btnRemoveImage"
            );


        if (!button) return;


        resetProductImage();

    }
);
