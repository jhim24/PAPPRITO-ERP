// ==========================================
// PAPPRITO ERP
// CATEGORY SAVE
// ==========================================

let categoryModal;

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const modalElement = document.getElementById("categoryModal");

    if(modalElement){

        categoryModal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener("show.bs.modal", () => {

            generateCategoryCode();

        });

    }

    const btnSave = document.getElementById("btnSaveCategory");

    if(btnSave){

        btnSave.addEventListener("click", saveCategory);

    }

});

// ==========================================
// GENERATE CATEGORY CODE
// ==========================================

async function generateCategoryCode(){

    try{

        const snapshot = await db.ref("categories").once("value");

        let highest = 0;

        snapshot.forEach(child=>{

            const code = child.val().code || "";

            const number = parseInt(code.replace("CAT","")) || 0;

            if(number > highest){

                highest = number;

            }

        });

        const next = highest + 1;

        document.getElementById("categoryCode").value =
            "CAT" + String(next).padStart(4,"0");

    }

    catch(error){

        console.error(error);

    }

}

// ==========================================
// SAVE CATEGORY
// ==========================================

async function saveCategory(){

    const code = document.getElementById("categoryCode").value.trim();

    const name = document.getElementById("categoryName").value.trim();

    const description =
        document.getElementById("categoryDescription").value.trim();

    const icon =
        document.getElementById("categoryIcon").value.trim() || "fa-utensils";

    const color =
        document.getElementById("categoryColor").value;

    const displayOrder =
        Number(document.getElementById("displayOrder").value);

    const status =
        document.getElementById("categoryStatus").value;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if(name===""){

        alert("Category Name is required.");

        return;

    }

    // -----------------------------
    // CHECK DUPLICATE NAME
    // -----------------------------

    const duplicate = await db.ref("categories")
        .orderByChild("name")
        .equalTo(name)
        .once("value");

    if(duplicate.exists()){

        alert("Category already exists.");

        return;

    }

    // -----------------------------
    // SAVE
    // -----------------------------

    const categoryRef = db.ref("categories").push();

    await categoryRef.set({

        categoryId: categoryRef.key,

        code,

        name,

        description,

        icon,

        color,

        displayOrder,

        status,

        productCount:0,

        createdDate:new Date().toISOString(),

        updatedDate:""

    });

    clearCategoryForm();

    categoryModal.hide();

    alert("Category saved successfully.");

}

// ==========================================
// CLEAR FORM
// ==========================================

function clearCategoryForm(){

    document.getElementById("categoryName").value="";

    document.getElementById("categoryDescription").value="";

    document.getElementById("categoryIcon").value="fa-utensils";

    document.getElementById("categoryColor").value="#C8102E";

    document.getElementById("displayOrder").value=1;

    document.getElementById("categoryStatus").value="Active";

}
