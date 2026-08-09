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
    "assets/img/logo.png";


// ==========================================================
// INITIALIZE PRODUCT IMAGE
// ==========================================================

function initializeProductImage() {

    console.log(
        "Product Image Engine initialized."
    );


    // ======================================================
    // FILE INPUT
    // ======================================================

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


    // ======================================================
    // IMAGE URL
    // ======================================================

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


    // ======================================================
    // DEFAULT IMAGE
    // ======================================================

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


    // ======================================================
    // REMOVE IMAGE
    // ======================================================

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


    // ======================================================
    // INITIAL PREVIEW
    // ======================================================

    updateProductImagePreview(
        selectedProductImage
    );

}


// ==========================================================
// HANDLE IMAGE FILE
// ==========================================================

function handleProductImageFile(
    event
) {

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


    // ======================================================
    // ALLOWED TYPES
    // ======================================================

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


        event.target.value =
            "";

        selectedProductFile =
            null;

        return;

    }


    // ======================================================
    // FILE SIZE
    // ======================================================

    const maxSize =
        2 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        alert(
            "Image is too large.\n\n" +
            "Maximum allowed size is 2MB."
        );


        event.target.value =
            "";

        selectedProductFile =
            null;

        return;

    }


    // ======================================================
    // SAVE FILE
    // ======================================================

    selectedProductFile =
        file;


    // ======================================================
    // PREVIEW
    // ======================================================

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


    // ======================================================
    // EMPTY
    // ======================================================

    if (
        url === ""
    ) {

        selectedProductImage =
            "";


        updateProductImagePreview(
            PRODUCT_DEFAULT_IMAGE
        );


        return;

    }


    // ======================================================
    // SAVE URL
    // ======================================================

    selectedProductImage =
        url;


    // ======================================================
    // PREVIEW
    // ======================================================

    updateProductImagePreview(
        url
    );

}


// ==========================================================
// UPDATE PREVIEW
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
        String(
            image
        ).trim() !== ""

            ? image

            : PRODUCT_DEFAULT_IMAGE;


    preview.src =
        source;


    // ======================================================
    // IMAGE ERROR FALLBACK
    // ======================================================

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


    // ------------------------------------------------------
    // CLEAR FILE
    // ------------------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    // ------------------------------------------------------
    // CLEAR URL
    // ------------------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    // ------------------------------------------------------
    // PREVIEW
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // CLEAR FILE
    // ------------------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    // ------------------------------------------------------
    // CLEAR URL
    // ------------------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    // ------------------------------------------------------
    // PREVIEW
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // CLEAR FILE INPUT
    // ------------------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    // ------------------------------------------------------
    // LOAD URL
    // ------------------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            image || "";

    }


    // ------------------------------------------------------
    // PREVIEW
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // CLEAR FILE
    // ------------------------------------------------------

    const imageFile =
        document.getElementById(
            "productImageFile"
        );


    if (imageFile) {

        imageFile.value =
            "";

    }


    // ------------------------------------------------------
    // CLEAR URL
    // ------------------------------------------------------

    const imageURL =
        document.getElementById(
            "productImageURL"
        );


    if (imageURL) {

        imageURL.value =
            "";

    }


    // ------------------------------------------------------
    // DEFAULT PREVIEW
    // ------------------------------------------------------

    updateProductImagePreview(
        PRODUCT_DEFAULT_IMAGE
    );

}
