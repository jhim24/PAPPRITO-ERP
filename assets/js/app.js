// ==========================================================
// PAPPRITO ERP
// PRODUCT MODULE LOADER
// ==========================================================

const productScripts = [

    "assets/js/products/product-load.js",

    "assets/js/products/product-search.js",

    "assets/js/products/product-image.js",

    "assets/js/products/product-save.js",

    "assets/js/products/product-edit.js",

    "assets/js/products/product-delete.js"

];

let productScriptsLoaded = false;


// ==========================================================
// LOAD SCRIPT
// ==========================================================

function loadScript(src) {

    return new Promise((resolve, reject) => {

        // ----------------------------------------------
        // CHECK IF ALREADY LOADED
        // ----------------------------------------------

        const existing =
            document.querySelector(
                `script[data-product-script="${src}"]`
            );


        if (existing) {

            resolve();

            return;

        }


        // ----------------------------------------------
        // CREATE SCRIPT
        // ----------------------------------------------

        const script =
            document.createElement("script");


        script.src =
            src;


        script.dataset.productScript =
            src;


        script.onload =
            () => {

                console.log(
                    "Loaded:",
                    src
                );

                resolve();

            };


        script.onerror =
            () => {

                console.error(
                    "Failed to load:",
                    src
                );

                reject(
                    new Error(
                        "Unable to load " +
                        src
                    )
                );

            };


        document.body.appendChild(
            script
        );

    });

}


// ==========================================================
// LOAD ALL PRODUCT SCRIPTS
// ==========================================================

async function loadProductScripts() {

    if (
        productScriptsLoaded
    ) {

        return;

    }


    console.log(
        "Loading PAPPRITO Product Engines..."
    );


    for (
        const script of productScripts
    ) {

        await loadScript(
            script
        );

    }


    productScriptsLoaded =
        true;


    console.log(
        "All Product Engines loaded."
    );

}
