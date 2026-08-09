// ==========================================================
// PAPPRITO ERP
// PRODUCT IMAGE ENGINE
// File : assets/js/products/product-image.js
// Description : Product Image Upload, URL, Preview & Remove
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL IMAGE STATE
// ==========================================================

let selectedProductImage = "";

let selectedProductFile = null;


// ==========================================================
// DEFAULT IMAGE
// ==========================================================

const PRODUCT_DEFAULT_IMAGE =
    "assets/img/no-product.png";


// ==========================================================
// INITIALIZE PRODUCT IMAGE
// ==========================================================

function initializeProductImage() {

    console.log(
        "Product Image Engine initialized."
    );


    // ----------------------------------------------
    // File Upload
    // ----------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        if (
            imageFile.dataset.imageInitialized !==
            "true"
        ) {

            imageFile.dataset.imageInitialized =
                "true";


            imageFile.addEventListener(
                "change",
                handleProductImageFile
            );

        }

    }


    // ----------------------------------------------
    // Image URL
    // ----------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        if (
            imageURL.dataset.imageInitialized !==
            "true"
        ) {

            imageURL.dataset.imageInitialized =
                "true";


            imageURL.addEventListener(
                "input",
                handleProductImageURL
            );


            imageURL.addEventListener(
                "change",
                handleProductImageURL
            );

        }

    }


    // ----------------------------------------------
    // Default Image
    // ----------------------------------------------

    const btnDefault =
        document.getElementById(
            "btnDefaultImage"
        );


    if (btnDefault) {

        if (
            btnDefault.dataset.imageInitialized !==
            "true"
        ) {

            btnDefault.dataset.imageInitialized =
                "true";


            btnDefault.addEventListener(
                "click",
                setDefaultProductImage
            );

        }

    }


    // ----------------------------------------------
    // Remove Image
    // ----------------------------------------------

    const btnRemove =
        document.getElementById(
            "btnRemoveImage"
        );


    if (btnRemove) {

        if (
            btnRemove.dataset.imageInitialized !==
            "true"
        ) {

            btnRemove.dataset.imageInitialized =
                "true";


            btnRemove.addEventListener(
                "click",
                removeProductImage
            );

        }

    }


    // ----------------------------------------------
    // Initial Preview
    // ----------------------------------------------

    updateProductImagePreview(
        selectedProductImage
    );

}


// ==========================================================
// HANDLE IMAGE FILE
// ==========================================================

function handleProductImageFile(event) {

    const file =
        event.target.files &&
        event.target.files.length > 0

            ? event.target.files[0]

            : null;


    if (!file) {

        selectedProductFile =
            null;

        return;

    }


    // ----------------------------------------------
    // Validate File Type
    // ----------------------------------------------

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
            "Invalid image format.\n\n" +
            "Please use JPG, PNG or WEBP."
        );


        event.target.value = "";

        selectedProductFile =
            null;

        return;

    }


    // ----------------------------------------------
    // Validate File Size
    // ----------------------------------------------

    const maxSize =
        2 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        alert(
            "Image is too large.\n\n" +
            "Maximum allowed size is 2MB."
        );


        event.target.value = "";

        selectedProductFile =
            null;

        return;

    }


    // ----------------------------------------------
    // Save File
    // ----------------------------------------------

    selectedProductFile =
        file;


    // ----------------------------------------------
    // Preview Using FileReader
    // ----------------------------------------------

    const reader =
        new FileReader();


    reader.onload =
        function (loadEvent) {

            const imageData =
                loadEvent.target.result;


            selectedProductImage =
                imageData;


            updateProductImagePreview(
                imageData
            );

        };


    reader.onerror =
        function () {

            console.error(
                "Unable to preview product image."
            );

            alert(
                "Unable to preview the selected image."
            );

        };


    reader.readAsDataURL(
        file
    );

}


// ==========================================================
// HANDLE IMAGE URL
// ==========================================================

function handleProductImageURL() {

    const input =
        document.getElementById(
            "productImageURL"
        );


    if (!input) {

        return;

    }


    const url =
        input.value.trim();


    // ----------------------------------------------
    // Empty URL
    // ----------------------------------------------

    if (url === "") {

        selectedProductImage =
            "";

        updateProductImagePreview(
            PRODUCT_DEFAULT_IMAGE
        );

        return;

    }


    // ----------------------------------------------
    // Save URL
    // ----------------------------------------------

    selectedProductImage =
        url;


    // ----------------------------------------------
    // Preview
    // ----------------------------------------------

    updateProductImagePreview(
        url
    );

}


// ==========================================================
// UPDATE IMAGE PREVIEW
// ==========================================================

function updateProductImagePreview(
    image
) {

    const preview =
        document.getElementById(
            "productImagePreview"
        );


    if (!preview) {

        return;

    }


    const source =
        image &&
        String(image).trim() !== ""

            ? image

            : PRODUCT_DEFAULT_IMAGE;


    preview.src =
        source;


    preview.onerror =
        function () {

            this.onerror =
                null;

            this.src =
                PRODUCT_DEFAULT_IMAGE;

        };

}


// ==========================================================
// SET DEFAULT IMAGE
// ==========================================================

function setDefaultProductImage() {

    selectedProductImage =
        PRODUCT_DEFAULT_IMAGE;


    selectedProductFile =
        null;


    // ----------------------------------------------
    // Clear File
    // ----------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value = "";

    }


    // ----------------------------------------------
    // Set URL
    // ----------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    // ----------------------------------------------
    // Preview
    // ----------------------------------------------

    updateProductImagePreview(
        PRODUCT_DEFAULT_IMAGE
    );

}


// ==========================================================
// REMOVE IMAGE
// ==========================================================

function removeProductImage() {

    selectedProductImage =
        "";


    selectedProductFile =
        null;


    // ----------------------------------------------
    // Clear File
    // ----------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    // ----------------------------------------------
    // Clear URL
    // ----------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    // ----------------------------------------------
    // Preview
    // ----------------------------------------------

    updateProductImagePreview(
        PRODUCT_DEFAULT_IMAGE
    );

}


// ==========================================================
// LOAD EXISTING PRODUCT IMAGE
// ==========================================================

function loadProductImage(
    image
) {

    selectedProductFile =
        null;


    selectedProductImage =
        image || "";


    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            image || "";

    }


    updateProductImagePreview(
        image
    );

}


// ==========================================================
// CLEAR IMAGE STATE
// ==========================================================

function clearProductImageState() {

    selectedProductImage =
        "";

    selectedProductFile =
        null;


    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    updateProductImagePreview(
        PRODUCT_DEFAULT_IMAGE
    );

}
