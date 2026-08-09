// ==========================================================
// PAPPRITO ERP
// CATEGORY EXPORT ENGINE V2
// File : assets/js/category/category-export.js
//
// FEATURES:
// - Export Category Master to CSV
// - Uses current Firebase categories
// - Includes real product count
// - Compatible with current Category Master
// ==========================================================

"use strict";


// ==========================================================
// INITIALIZE EXPORT
// ==========================================================

function initializeCategoryExport() {

    const button =
        document.getElementById(
            "btnExport"
        );


    if (!button) {

        console.warn(
            "Category Export button not found."
        );

        return;

    }


    if (
        button.dataset.exportInitialized ===
        "true"
    ) {

        return;

    }


    button.dataset.exportInitialized =
        "true";


    button.addEventListener(
        "click",
        exportCategories
    );


    console.log(
        "Category Export Engine V2 initialized."
    );

}


// ==========================================================
// EXPORT CATEGORIES
// ==========================================================

async function exportCategories() {

    try {

        if (
            typeof db === "undefined" ||
            !db
        ) {

            throw new Error(
                "Firebase Database is not initialized."
            );

        }


        const button =
            document.getElementById(
                "btnExport"
            );


        if (button) {

            button.disabled =
                true;

            button.dataset.originalText =
                button.innerHTML;

            button.innerHTML = `

                <span
                    class="spinner-border
                           spinner-border-sm
                           me-1">
                </span>

                Exporting...

            `;

        }


        // ==================================================
        // LOAD CATEGORIES
        // ==================================================

        const categorySnapshot =
            await db
                .ref("categories")
                .once("value");


        // ==================================================
        // LOAD PRODUCTS
        // ==================================================

        const productSnapshot =
            await db
                .ref("products")
                .once("value");


        const productCounts = {};


        productSnapshot.forEach(
            function(child) {

                const product =
                    child.val() || {};


                const categoryId =
                    product.categoryId;


                if (!categoryId) {

                    return;

                }


                if (
                    !productCounts[categoryId]
                ) {

                    productCounts[categoryId] =
                        0;

                }


                productCounts[categoryId]++;

            }
        );


        // ==================================================
        // BUILD CSV
        // ==================================================

        const rows = [];


        rows.push([

            "Category Code",

            "Category Name",

            "Description",

            "Icon",

            "Color",

            "Display Order",

            "Status",

            "Products"

        ]);


        categorySnapshot.forEach(
            function(child) {

                const category =
                    child.val() || {};


                const categoryId =
                    child.key;


                rows.push([

                    category.code ||
                    "",

                    category.name ||
                    "",

                    category.description ||
                    "",

                    category.icon ||
                    "",

                    category.color ||
                    "",

                    category.displayOrder ||
                    0,

                    category.status ||
                    "Active",

                    productCounts[
                        categoryId
                    ] || 0

                ]);

            }
        );


        // ==================================================
        // NO DATA
        // ==================================================

        if (
            rows.length === 1
        ) {

            alert(
                "There are no categories to export."
            );

            return;

        }


        // ==================================================
        // SORT BY DISPLAY ORDER
        // ==================================================

        const header =
            rows.shift();


        rows.sort(
            function(a, b) {

                return (
                    Number(
                        a[5] || 0
                    ) -
                    Number(
                        b[5] || 0
                    )
                );

            }
        );


        rows.unshift(
            header
        );


        // ==================================================
        // CONVERT TO CSV
        // ==================================================

        const csv =
            rows
                .map(
                    function(row) {

                        return row
                            .map(
                                csvEscape
                            )
                            .join(",");

                    }
                )
                .join("\r\n");


        // ==================================================
        // UTF-8 BOM
        // ==================================================

        const csvWithBOM =
            "\uFEFF" +
            csv;


        // ==================================================
        // CREATE FILE
        // ==================================================

        const blob =
            new Blob(
                [
                    csvWithBOM
                ],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        // ==================================================
        // FILE NAME
        // ==================================================

        const now =
            new Date();


        const date =
            now
                .toISOString()
                .slice(
                    0,
                    10
                );


        const fileName =
            "PAPPRITO_Category_Master_" +
            date +
            ".csv";


        // ==================================================
        // DOWNLOAD
        // ==================================================

        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            fileName;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        // ==================================================
        // CLEANUP
        // ==================================================

        setTimeout(
            function() {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        console.log(
            "Category export completed:",
            fileName
        );


        alert(
            "Category export completed successfully."
        );

    }

    catch (error) {

        console.error(
            "Category Export Error:",
            error
        );


        alert(
            "Unable to export categories.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

    finally {

        const button =
            document.getElementById(
                "btnExport"
            );


        if (button) {

            button.disabled =
                false;


            if (
                button.dataset.originalText
            ) {

                button.innerHTML =
                    button.dataset.originalText;

                delete button.dataset.originalText;

            }

        }

    }

}


// ==========================================================
// CSV ESCAPE
// ==========================================================

function csvEscape(
    value
) {

    const text =
        String(
            value ?? ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n") ||
        text.includes("\r")
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );

    }


    return text;

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.initializeCategoryExport =
    initializeCategoryExport;

window.exportCategories =
    exportCategories;


console.log(
    "PAPPRITO Category Export Engine V2 loaded."
);
