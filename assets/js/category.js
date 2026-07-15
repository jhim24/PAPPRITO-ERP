// ==========================================
// PAPPRITO ERP
// CATEGORY MASTER
// ==========================================

// ==========================================
// AUTO CATEGORY CODE
// ==========================================

async function generateCategoryCode(){

    const snapshot = await db.ref("categories").once("value");

    const total = snapshot.numChildren() + 1;

    document.getElementById("categoryCode").value =
        "CAT" + String(total).padStart(4,"0");

}

// ==========================================
// LOAD CATEGORY
// ==========================================

function loadCategories(){

    db.ref("categories").on("value",snapshot=>{

        const tbody =
            document.getElementById("categoryTable");

        const total =
            document.getElementById("totalCategories");

        if(!tbody) return;

        tbody.innerHTML="";

        let count=0;

        snapshot.forEach(child=>{

            const cat = child.val();

            count++;

            tbody.innerHTML += `

            <tr>

                <td>${cat.code}</td>

                <td>

                    <i
                    class="fa-solid ${cat.icon}"
                    style="color:${cat.color};font-size:20px">

                    </i>

                </td>

                <td>

                    ${cat.name}

                </td>

                <td>

                    ${cat.description}

                </td>

                <td>

                    0

                </td>

                <td>

                    <span class="badge bg-success">

                        ${cat.status}

                    </span>

                </td>

                <td>

                    <button
                    class="btn btn-warning btn-sm">

                        <i class="fa fa-edit"></i>

                    </button>

                    <button
                    class="btn btn-danger btn-sm">

                        <i class="fa fa-trash"></i>

                    </button>

                </td>

            </tr>

            `;

        });

        if(count===0){

            tbody.innerHTML=`

            <tr>

                <td colspan="7"
                class="text-center p-5">

                    No Categories Found

                </td>

            </tr>

            `;

        }

        total.innerHTML=count;

    });

}

// ==========================================
// SAVE CATEGORY
// ==========================================

document.addEventListener("click",async function(e){

    if(e.target.id!=="btnSaveCategory") return;

    const code =
        document.getElementById("categoryCode").value;

    const name =
        document.getElementById("categoryName").value.trim();

    const description =
        document.getElementById("categoryDescription").value.trim();

    const icon =
        document.getElementById("categoryIcon").value.trim();

    const color =
        document.getElementById("categoryColor").value;

    const displayOrder =
        Number(document.getElementById("displayOrder").value);

    const status =
        document.getElementById("categoryStatus").value;

    if(name===""){

        alert("Category Name is required.");

        return;

    }

    const newCategory =
        db.ref("categories").push();

    await newCategory.set({

        code,

        name,

        description,

        icon,

        color,

        displayOrder,

        status,

        createdDate:new Date().toISOString(),

        updatedDate:""

    });

    bootstrap.Modal
    .getInstance(

        document.getElementById("categoryModal")

    ).hide();

    document.getElementById("categoryName").value="";

    document.getElementById("categoryDescription").value="";

    document.getElementById("categoryIcon").value="";

    document.getElementById("displayOrder").value=1;

    generateCategoryCode();

});

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded",()=>{

    generateCategoryCode();

    loadCategories();

});
