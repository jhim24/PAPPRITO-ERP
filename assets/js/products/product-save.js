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
