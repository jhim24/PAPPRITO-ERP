// ==========================================
// SAVE PRODUCT
// ==========================================

async function saveProduct(){

    try {

        // ======================================
        // BASIC INFORMATION
        // ======================================

        const code =
            document
                .getElementById("productCode")
                .value
                .trim();

        const name =
            document
                .getElementById("productName")
                .value
                .trim();

        const category =
            document.getElementById(
                "productCategory"
            );

        const description =
            document
                .getElementById("productDescription")
                .value
                .trim();


        // ======================================
        // PRICING
        // ======================================

        const costPrice =
            Number(
                document
                    .getElementById("costPrice")
                    .value || 0
            );

        const sellingPrice =
            Number(
                document
                    .getElementById("sellingPrice")
                    .value || 0
            );


        // ======================================
        // INVENTORY
        // ======================================

        const openingStock =
            Number(
                document
                    .getElementById("openingStock")
                    .value || 0
            );

        const reorderLevel =
            Number(
                document
                    .getElementById("reorderLevel")
                    .value || 0
            );


        // ======================================
        // SETTINGS
        // ======================================

        const status =
            document
                .getElementById("productStatus")
                .value;

        const showMenu =
            document
                .getElementById("showMenu")
                .checked;

        const showPOS =
            document
                .getElementById("showPOS")
                .checked;


        // ======================================
        // VALIDATION
        // ======================================

        if(name === ""){

            alert(
                "Please enter Product Name."
            );

            return;

        }


        if(category.value === ""){

            alert(
                "Please select Category."
            );

            return;

        }


        // ======================================
        // IMAGE
        // ======================================

        let imageURL = "";


        const imageURLInput =
            document.getElementById(
                "productImageURL"
            );


        const imageFileInput =
            document.getElementById(
                "productImageFile"
            );


        // ======================================
        // URL IMAGE
        // ======================================

        if(
            imageURLInput &&
            imageURLInput.value.trim() !== ""
        ){

            imageURL =
                imageURLInput.value.trim();

        }


        // ======================================
        // UPLOAD FILE
        // ======================================

        if(
            imageFileInput &&
            imageFileInput.files &&
            imageFileInput.files.length > 0
        ){

            const file =
                imageFileInput.files[0];


            // ==================================
            // CHECK FIREBASE STORAGE
            // ==================================

            if(
                typeof firebase === "undefined" ||
                typeof firebase.storage !== "function"
            ){

                throw new Error(
                    "Firebase Storage SDK is not loaded."
                );

            }


            // ==================================
            // FILE VALIDATION
            // ==================================

            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"

            ];


            if(
                !allowedTypes.includes(
                    file.type
                )
            ){

                throw new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                );

            }


            // ==================================
            // MAX 2MB
            // ==================================

            if(
                file.size >
                2 * 1024 * 1024
            ){

                throw new Error(
                    "Image size must not exceed 2MB."
                );

            }


            // ==================================
            // SAFE FILE NAME
            // ==================================

            const safeName =
                file.name
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        "_"
                    );


            // ==================================
            // UNIQUE STORAGE PATH
            // ==================================

            const fileName =

                "products/" +

                Date.now() +

                "_" +

                safeName;


            console.log(
                "Uploading image:",
                fileName
            );


            // ==================================
            // FIREBASE STORAGE
            // ==================================

            const storage =
                firebase.storage();


            const storageRef =
                storage.ref().child(
                    fileName
                );


            // ==================================
            // UPLOAD
            // ==================================

            const uploadSnapshot =
                await storageRef.put(file);


            // ==================================
            // GET DOWNLOAD URL
            // ==================================

            imageURL =
                await uploadSnapshot
                    .ref
                    .getDownloadURL();


            console.log(
                "Image uploaded successfully:",
                imageURL
            );

        }


        // ======================================
        // PRODUCT OBJECT
        // ======================================

        const product = {

            code: code,

            name: name,

            categoryId:
                category.value,

            categoryName:
                category
                    .options[
                        category.selectedIndex
                    ]
                    .text,

            description:
                description,

            costPrice:
                costPrice,

            sellingPrice:
                sellingPrice,

            openingStock:
                openingStock,

            currentStock:
                openingStock,

            reorderLevel:
                reorderLevel,

            image:
                imageURL,

            showPOS:
                showPOS,

            showMenu:
                showMenu,

            status:
                status,

            createdAt:
                Date.now()

        };


        // ======================================
        // UPDATE PRODUCT
        // ======================================

        if(editingProductId){

            await db.ref(
                "products/" +
                editingProductId
            ).update(product);


            alert(
                "Product Updated Successfully."
            );

        }


        // ======================================
        // CREATE PRODUCT
        // ======================================

        else{

            await db.ref(
                "products"
            ).push(product);


            alert(
                "Product Saved Successfully."
            );

        }


        // ======================================
        // RESET
        // ======================================

        resetProductForm();


        // ======================================
        // REFRESH LIST
        // ======================================

        if(
            typeof startProductListener ===
            "function"
        ){

            startProductListener();

        }


        // ======================================
        // CLOSE MODAL
        // ======================================

        const modalElement =
            document.getElementById(
                "productModal"
            );


        if(
            modalElement &&
            typeof bootstrap !==
            "undefined"
        ){

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );


            if(modal){

                modal.hide();

            }

        }

    }

    catch(error){

        console.error(
            "SAVE PRODUCT ERROR:",
            error
        );


        alert(
            "Unable to save product.\n\n" +
            error.message
        );

    }

}
