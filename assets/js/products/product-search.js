// ==========================================
// PAPPRITO ERP
// PRODUCT SEARCH ENGINE V2
// ==========================================

// ==========================================
// SEARCH PRODUCTS
// ==========================================

function searchProducts(){

    const keyword =
        document.getElementById("searchProduct")
        ?.value
        .trim()
        .toLowerCase() || "";

    const category =
        document.getElementById("filterCategory")
        ?.value || "";

    const status =
        document.getElementById("filterStatus")
        ?.value || "";

    const filtered = productList.filter(product=>{

        const name =
            (product.name || "").toLowerCase();

        const code =
            (product.code || "").toLowerCase();

        const cat =
            product.categoryId || "";

        const stat =
            product.status || "";

        const matchKeyword =
            keyword === "" ||
            name.includes(keyword) ||
            code.includes(keyword);

        const matchCategory =
            category === "" ||
            cat === category;

        const matchStatus =
            status === "" ||
            stat === status;

        return (
            matchKeyword &&
            matchCategory &&
            matchStatus
        );

    });

    renderFilteredProducts(filtered);

}
