// ==========================================
// PAPPRITO ERP
// PRODUCT SAVE
// STEP 21.2.1
// ==========================================

// ==========================================
// GENERATE PRODUCT CODE
// ==========================================

async function generateProductCode() {

    try {

        const snapshot = await db.ref("products").once("value");

        let highest = 0;

        snapshot.forEach(child => {

            const product = child.val();

            if (!product.code) return;

            const number = parseInt(
                product.code.replace("PRD", "")
            ) || 0;

            if (number > highest) {

                highest = number;

            }

        });

        const nextCode =
            "PRD" + String(highest + 1).padStart(4, "0");

        const input =
            document.getElementById("productCode");

        if (input) {

            input.value = nextCode;

        }

    }

    catch (error) {

        console.error("Generate Product Code Error:", error);

    }

}

// ==========================================
// LOAD CATEGORY DROPDOWN
// ==========================================

function loadProductCategories() {

    const dropdown =
        document.getElementById("productCategory");

    if (!dropdown) return;

    db.ref("categories")
        .orderByChild("displayOrder")
        .once("value")

        .then(snapshot => {

            dropdown.innerHTML = `

                <option value="">

                    Select Category

                </option>

            `;

            snapshot.forEach(child => {

                const category = child.val();

                if (category.status !== "Active") {

                    return;

                }

                dropdown.innerHTML += `

                    <option value="${child.key}">

                        ${category.name}

                    </option>

                `;

            });

        })

        .catch(error => {

            console.error(
                "Load Categories Error:",
                error
            );

        });

}

// ==========================================
// INITIALIZE PRODUCT PAGE
// ==========================================

function initializeProductPage() {

    generateProductCode();

    loadProductCategories();

}
// ==========================================
// SAVE PRODUCT
// ==========================================

async function saveProduct() {

    try {

        const code = document.getElementById("productCode").value.trim();
        const name = document.getElementById("productName").value.trim();

        const categoryId =
            document.getElementById("productCategory").value;

        const description =
            document.getElementById("productDescription").value.trim();

        const costPrice =
            parseFloat(document.getElementById("costPrice").value) || 0;

        const sellingPrice =
            parseFloat(document.getElementById("sellingPrice").value) || 0;

        const openingStock =
            parseInt(document.getElementById("openingStock").value) || 0;

        const currentStock =
            parseInt(document.getElementById("currentStock").value) || openingStock;

        const reorderLevel =
            parseInt(document.getElementById("reorderLevel").value) || 0;

        const unit =
            document.getElementById("unit").value;

        const imageUrl =
            document.getElementById("productImageURL").value.trim();

        const status =
            document.getElementById("productStatus").value;

        const showPOS =
            document.getElementById("showPOS").checked;

        const showKitchen =
            document.getElementById("showKitchen").checked;

        const showMenu =
            document.getElementById("showMenu").checked;

        const inventoryTracking =
            document.getElementById("inventoryTracking").checked;

        const featuredProduct =
            document.getElementById("featuredProduct").checked;

        const bestSeller =
            document.getElementById("bestSeller").checked;

        // ==========================
        // VALIDATION
        // ==========================

        if (name === "") {

            alert("Product Name is required.");

            return;

        }

        if (categoryId === "") {

            alert("Please select a Category.");

            return;

        }

        // ==========================
        // GET CATEGORY NAME
        // ==========================

        const categorySnapshot =
            await db.ref("categories/" + categoryId).once("value");

        const categoryName =
            categorySnapshot.exists()
                ? categorySnapshot.val().name
                : "";

        // ==========================
        // DUPLICATE CHECK
        // ==========================

        const duplicate =
            await db.ref("products")
            .orderByChild("name")
            .equalTo(name)
            .once("value");

        if (duplicate.exists()) {

            alert("Product already exists.");

            return;

        }

        // ==========================
        // SAVE
        // ==========================

        const productRef =
            db.ref("products").push();

        await productRef.set({

            productId: productRef.key,

            code: code,

            name: name,

            categoryId: categoryId,

            categoryName: categoryName,

            description: description,

            costPrice: costPrice,

            sellingPrice: sellingPrice,

            openingStock: openingStock,

            currentStock: currentStock,

            reorderLevel: reorderLevel,

            unit: unit,

            image: imageUrl,

            imageType: imageUrl === "" ? "" : "URL",

            status: status,

            showPOS: showPOS,

            showKitchen: showKitchen,

            showMenu: showMenu,

            inventoryTracking: inventoryTracking,

            featuredProduct: featuredProduct,

            bestSeller: bestSeller,

            createdDate: new Date().toISOString(),

            updatedDate: ""

        });

        alert("Product saved successfully.");

        generateProductCode();

    }

    catch(error){

        console.error(error);

        alert("Unable to save product.");

    }

}
