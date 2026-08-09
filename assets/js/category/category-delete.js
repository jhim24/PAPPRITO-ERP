// ==========================================================
// PAPPRITO ERP
// CATEGORY DELETE ENGINE V2
// File : assets/js/category/category-delete.js
//
// SAFE DELETE:
// - Checks Products first
// - Prevents deleting used categories
// - Deletes only unused categories
// - Keeps Product Master / POS / Online Menu safe
// ==========================================================

"use strict";


// ==========================================================
// DELETE CATEGORY
// ==========================================================

async function deleteCategory(categoryId) {

    if (!categoryId) {

        alert(
            "Invalid Category ID."
        );

        return;

    }


    if (
        typeof db === "undefined" ||
        !db
    ) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        // ==================================================
        // GET CATEGORY
        // ==================================================

        const categorySnapshot =
            await db
                .ref(
                    "categories/" +
                    categoryId
                )
                .once("value");


        if (
            !categorySnapshot.exists()
        ) {

            alert(
                "Category not found."
            );

            return;

        }


        const category =
            categorySnapshot.val() || {};


        const categoryName =
            category.name ||
            "this category";


        // ==================================================
        // CHECK PRODUCTS
        // ==================================================

        const productsSnapshot =
            await db
                .ref("products")
                .once("value");


        let linkedProducts = [];


        if (
            productsSnapshot.exists()
        ) {

            productsSnapshot.forEach(
                function(child) {

                    const product =
                        child.val() || {};


                    if (
                        String(
                            product.categoryId ||
                            ""
                        ) ===
                        String(
                            categoryId
                        )
                    ) {

                        linkedProducts.push({

                            id:
                                child.key,

                            name:
                                product.name ||
                                "Unnamed Product"

                        });

                    }

                }
            );

        }


        // ==================================================
        // PREVENT DELETE IF USED
        // ==================================================

        if (
            linkedProducts.length >
            0
        ) {

            const preview =
                linkedProducts
                    .slice(0, 5)
                    .map(
                        function(product) {

                            return (
                                "• " +
                                product.name
                            );

                        }
                    )
                    .join("\n");


            const more =
                linkedProducts.length >
                5

                    ? "\n• +" +
                      (
                          linkedProducts.length -
                          5
                      ) +
                      " more product(s)"

                    : "";


            alert(

                "Category cannot be deleted.\n\n" +

                "Category: " +
                categoryName +
                "\n\n" +

                "Products using this category: " +
                linkedProducts.length +
                "\n\n" +

                preview +
                more +
                "\n\n" +

                "Please move these products to another category first."

            );


            return;

        }


        // ==================================================
        // CONFIRM DELETE
        // ==================================================

        const confirmed =
            confirm(

                "Delete Category?\n\n" +

                categoryName +
                "\n\n" +

                "This category has no linked products.\n" +

                "This action cannot be undone."

            );


        if (!confirmed) {

            return;

        }


        // ==================================================
        // DELETE
        // ==================================================

        await db
            .ref(
                "categories/" +
                categoryId
            )
            .remove();


        console.log(
            "Category deleted:",
            categoryId
        );


        // ==================================================
        // REFRESH CATEGORY LIST
        // ==================================================

        if (
            typeof loadCategories ===
            "function"
        ) {

            loadCategories();

        }


        // ==================================================
        // REFRESH PRODUCT DROPDOWN
        // ==================================================

        if (
            typeof refreshCategoryDropdown ===
            "function"
        ) {

            refreshCategoryDropdown();

        }

        else if (
            typeof loadAllCategoryDropdowns ===
            "function"
        ) {

            loadAllCategoryDropdowns();

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            "Category deleted successfully."
        );

    }

    catch (error) {

        console.error(
            "Delete Category Error:",
            error
        );


        alert(

            "Unable to delete category.\n\n" +

            (
                error.message ||
                error
            )

        );

    }

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.deleteCategory =
    deleteCategory;


console.log(
    "PAPPRITO Category Delete Engine V2 loaded."
);
