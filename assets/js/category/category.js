// ==========================================================
// PAPPRITO ERP
// CATEGORY MASTER ENGINE V1
// File: assets/js/category/category.js
//
// FEATURES:
// - Load Categories
// - Firebase Realtime Database
// - Search
// - Status Filter
// - Add Category
// - Edit Category
// - Save Category
// - Update Category
// - Delete Category
// - Custom Modal
// - X Button
// - Cancel Button
// - ESC Close
// - Overlay Close
// - Icon Preview
// - Color Preview
// - Auto Category Code
// - Statistics
// - Product Count
// - Export CSV
// - Refresh
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let categoryData = {};

let editingCategoryId = null;

let categoryInitialized = false;


// ==========================================================
// FIREBASE CHECK
// ==========================================================

function categoryFirebaseReady() {

    return (
        typeof db !== "undefined" &&
        db !== null &&
        typeof db.ref === "function"
    );

}


// ==========================================================
// ELEMENT HELPER
// ==========================================================

function categoryElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// INITIALIZE CATEGORY PAGE
// ==========================================================

function initializeCategoryPage() {

    console.log(
        "=========================================="
    );

    console.log(
        "PAPPRITO CATEGORY MASTER"
    );

    console.log(
        "Initializing..."
    );

    console.log(
        "=========================================="
    );


    if (categoryInitialized) {

        console.log(
            "Category page already initialized."
        );

        loadCategories();

        return;

    }


    categoryInitialized = true;


    bindCategoryEvents();

    updateCategoryIconPreview();

    updateCategoryColorPreview();

    loadCategories();


    console.log(
        "Category Master initialized."
    );

}


// ==========================================================
// BIND EVENTS
// ==========================================================

function bindCategoryEvents() {

    // ======================================================
    // ADD BUTTON
    // ======================================================

    const addButton =
        categoryElement(
            "btnAddCategory"
        );


    if (addButton) {

        addButton.onclick =
            function(event) {

                event.preventDefault();

                openAddCategoryModal();

            };

    }


    // ======================================================
    // EMPTY ADD BUTTON
    // ======================================================

    const emptyAddButton =
        categoryElement(
            "btnEmptyAddCategory"
        );


    if (emptyAddButton) {

        emptyAddButton.onclick =
            function(event) {

                event.preventDefault();

                openAddCategoryModal();

            };

    }


    // ======================================================
    // CLOSE X
    // ======================================================

    const closeButton =
        categoryElement(
            "btnCloseCategoryModal"
        );


    if (closeButton) {

        closeButton.onclick =
            function(event) {

                event.preventDefault();

                closeCategoryModal();

            };

    }


    // ======================================================
    // CANCEL
    // ======================================================

    const cancelButton =
        categoryElement(
            "btnCancelCategory"
        );


    if (cancelButton) {

        cancelButton.onclick =
            function(event) {

                event.preventDefault();

                closeCategoryModal();

            };

    }


    // ======================================================
    // SAVE
    // ======================================================

    const saveButton =
        categoryElement(
            "btnSaveCategory"
        );


    if (saveButton) {

        saveButton.onclick =
            function(event) {

                event.preventDefault();

                saveCategory();

            };

    }


    // ======================================================
    // FORM SUBMIT
    // ======================================================

    const form =
        categoryElement(
            "categoryForm"
        );


    if (form) {

        form.onsubmit =
            function(event) {

                event.preventDefault();

                saveCategory();

            };

    }


    // ======================================================
    // SEARCH
    // ======================================================

    const search =
        categoryElement(
            "categorySearch"
        );


    if (search) {

        search.oninput =
            function() {

                renderCategories();

            };

    }


    // ======================================================
    // STATUS FILTER
    // ======================================================

    const statusFilter =
        categoryElement(
            "categoryStatusFilter"
        );


    if (statusFilter) {

        statusFilter.onchange =
            function() {

                renderCategories();

            };

    }


    // ======================================================
    // REFRESH
    // ======================================================

    const refreshButton =
        categoryElement(
            "btnRefreshCategory"
        );


    if (refreshButton) {

        refreshButton.onclick =
            function(event) {

                event.preventDefault();

                loadCategories();

            };

    }


    // ======================================================
    // EXPORT
    // ======================================================

    const exportButton =
        categoryElement(
            "btnExportCategory"
        );


    if (exportButton) {

        exportButton.onclick =
            function(event) {

                event.preventDefault();

                exportCategories();

            };

    }


    // ======================================================
    // ICON INPUT
    // ======================================================

    const iconInput =
        categoryElement(
            "categoryIcon"
        );


    if (iconInput) {

        iconInput.oninput =
            function() {

                updateCategoryIconPreview();

            };

        iconInput.onchange =
            function() {

                updateCategoryIconPreview();

            };

    }


    // ======================================================
    // COLOR INPUT
    // ======================================================

    const colorInput =
        categoryElement(
            "categoryColor"
        );


    if (colorInput) {

        colorInput.oninput =
            function() {

                updateCategoryColorPreview();

            };

        colorInput.onchange =
            function() {

                updateCategoryColorPreview();

            };

    }


    // ======================================================
    // COLOR TEXT
    // ======================================================

    const colorText =
        categoryElement(
            "categoryColorText"
        );


    if (colorText) {

        colorText.oninput =
            function() {

                const color =
                    colorText.value.trim();


                if (
                    /^#[0-9A-Fa-f]{6}$/.test(
                        color
                    )
                ) {

                    const colorInput =
                        categoryElement(
                            "categoryColor"
                        );


                    if (colorInput) {

                        colorInput.value =
                            color;

                    }


                    updateCategoryColorPreview();

                }

            };

    }


    // ======================================================
    // ESCAPE KEY
    // ======================================================

    document.addEventListener(
        "keydown",
        categoryEscapeHandler
    );


    // ======================================================
    // OVERLAY
    // ======================================================

    const modal =
        categoryElement(
            "categoryModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === modal ||
                    event.target.dataset.categoryClose ===
                    "true"
                ) {

                    closeCategoryModal();

                }

            }
        );

    }

}


// ==========================================================
// ESCAPE HANDLER
// ==========================================================

function categoryEscapeHandler(event) {

    const modal =
        categoryElement(
            "categoryModal"
        );


    if (!modal) {

        return;

    }


    if (
        event.key === "Escape" &&
        modal.classList.contains("show")
    ) {

        closeCategoryModal();

    }

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadCategories() {

    if (!categoryFirebaseReady()) {

        console.error(
            "Firebase Database is not initialized."
        );

        showCategoryError(
            "Firebase Database is not initialized."
        );

        return;

    }


    showCategoryLoading();


    try {

        const snapshot =
            await db
                .ref("categories")
                .once("value");


        categoryData = {};


        if (snapshot.exists()) {

            snapshot.forEach(
                function(child) {

                    categoryData[
                        child.key
                    ] = child.val() || {};

                }
            );

        }


        renderCategories();

        updateCategoryStatistics();


        console.log(
            "Categories loaded:",
            Object.keys(categoryData).length
        );

    }

    catch (error) {

        console.error(
            "Load Categories Error:",
            error
        );


        categoryData = {};

        renderCategories();

        showCategoryError(
            error.message ||
            "Unable to load categories."
        );

    }

}


// ==========================================================
// RENDER CATEGORIES
// ==========================================================

function renderCategories() {

    const tbody =
        categoryElement(
            "categoryTableBody"
        );


    const empty =
        categoryElement(
            "categoryEmpty"
        );


    if (!tbody) {

        return;

    }


    const searchElement =
        categoryElement(
            "categorySearch"
        );


    const filterElement =
        categoryElement(
            "categoryStatusFilter"
        );


    const search =
        (
            searchElement?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const statusFilter =
        filterElement?.value ||
        "";


    const categories =
        Object.entries(
            categoryData
        )
        .map(
            function(entry) {

                return {

                    id: entry[0],

                    ...(
                        entry[1] || {}
                    )

                };

            }
        )
        .filter(
            function(category) {

                const name =
                    String(
                        category.name ||
                        ""
                    ).toLowerCase();


                const code =
                    String(
                        category.code ||
                        ""
                    ).toLowerCase();


                const description =
                    String(
                        category.description ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    code.includes(search) ||
                    description.includes(search);


                const matchesStatus =
                    !statusFilter ||
                    String(
                        category.status ||
                        "Active"
                    ) === statusFilter;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        )
        .sort(
            function(a, b) {

                return (
                    Number(
                        a.displayOrder || 999999
                    ) -
                    Number(
                        b.displayOrder || 999999
                    )
                );

            }
        );


    // ======================================================
    // EMPTY
    // ======================================================

    if (
        categories.length === 0
    ) {

        tbody.innerHTML = "";

        if (empty) {

            empty.style.display =
                "flex";

        }

        updateCategoryTotal(0);

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    // ======================================================
    // TABLE
    // ======================================================

    tbody.innerHTML =
        categories
            .map(
                function(category) {

                    return buildCategoryRow(
                        category
                    );

                }
            )
            .join("");


    updateCategoryTotal(
        categories.length
    );

}


// ==========================================================
// BUILD CATEGORY ROW
// ==========================================================

function buildCategoryRow(category) {

    const id =
        escapeCategoryHTML(
            category.id
        );


    const code =
        escapeCategoryHTML(
            category.code ||
            "-"
        );


    const name =
        escapeCategoryHTML(
            category.name ||
            "Unnamed Category"
        );


    const description =
        escapeCategoryHTML(
            category.description ||
            "—"
        );


    const icon =
        normalizeCategoryIcon(
            category.icon
        );


    const color =
        category.color ||
        "#C8102E";


    const status =
        category.status ||
        "Active";


    const order =
        Number(
            category.displayOrder ||
            1
        );


    const productCount =
        Number(
            category.productCount ||
            0
        );


    const statusClass =
        status.toLowerCase() ===
        "active"
            ? "active"
            : "inactive";


    return `

        <tr>

            <td>

                <span class="category-code">

                    ${code}

                </span>

            </td>


            <td>

                <div class="category-name">

                    <div
                        class="category-name-icon"
                        style="
                            background:
                            ${escapeCategoryHTML(
                                hexToRGBA(
                                    color,
                                    .10
                                )
                            )};

                            color:
                            ${escapeCategoryHTML(
                                color
                            )};
                        "
                    >

                        <i
                            class="fa-solid ${icon}">
                        </i>

                    </div>

                    <div>

                        ${name}

                    </div>

                </div>

            </td>


            <td>

                <div class="category-description">

                    ${description}

                </div>

            </td>


            <td>

                <span
                    class="category-product-count">

                    ${productCount}

                </span>

            </td>


            <td>

                <span
                    class="category-status ${statusClass}">

                    ${escapeCategoryHTML(
                        status
                    )}

                </span>

            </td>


            <td>

                <span class="category-order">

                    ${order}

                </span>

            </td>


            <td>

                <div class="category-actions">

                    <button
                        type="button"
                        class="category-action-btn edit"
                        title="Edit Category"
                        onclick="
                            editCategory('${id}')
                        "
                    >

                        <i
                            class="fa-solid fa-pen-to-square">
                        </i>

                    </button>


                    <button
                        type="button"
                        class="category-action-btn delete"
                        title="Delete Category"
                        onclick="
                            deleteCategory('${id}')
                        "
                    >

                        <i
                            class="fa-solid fa-trash">
                        </i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


// ==========================================================
// OPEN ADD MODAL
// ==========================================================

async function openAddCategoryModal() {

    editingCategoryId = null;


    resetCategoryForm();


    const title =
        categoryElement(
            "categoryModalTitle"
        );


    if (title) {

        title.textContent =
            "Add Category";

    }


    const saveText =
        categoryElement(
            "btnSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Category";

    }


    const code =
        categoryElement(
            "categoryCode"
        );


    if (code) {

        code.value =
            await generateCategoryCode();

    }


    const modal =
        categoryElement(
            "categoryModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "category-modal-open"
    );


    setTimeout(
        function() {

            const name =
                categoryElement(
                    "categoryName"
                );


            if (name) {

                name.focus();

            }

        },
        100
    );


    updateCategoryIconPreview();

    updateCategoryColorPreview();

}


// ==========================================================
// OPEN EDIT MODAL
// ==========================================================

async function editCategory(categoryId) {

    if (!categoryId) {

        return;

    }


    const category =
        categoryData[categoryId];


    if (!category) {

        await loadCategories();

    }


    const currentCategory =
        categoryData[categoryId];


    if (!currentCategory) {

        alert(
            "Category not found."
        );

        return;

    }


    editingCategoryId =
        categoryId;


    // ======================================================
    // FILL FORM
    // ======================================================

    setCategoryValue(
        "categoryCode",
        currentCategory.code || ""
    );


    setCategoryValue(
        "categoryName",
        currentCategory.name || ""
    );


    setCategoryValue(
        "categoryDescription",
        currentCategory.description || ""
    );


    setCategoryValue(
        "categoryIcon",
        currentCategory.icon ||
        "fa-utensils"
    );


    setCategoryValue(
        "categoryColor",
        currentCategory.color ||
        "#C8102E"
    );


    setCategoryValue(
        "categoryColorText",
        currentCategory.color ||
        "#C8102E"
    );


    setCategoryValue(
        "displayOrder",
        Number(
            currentCategory.displayOrder ||
            1
        )
    );


    setCategoryValue(
        "categoryStatus",
        currentCategory.status ||
        "Active"
    );


    // ======================================================
    // TITLE
    // ======================================================

    const title =
        categoryElement(
            "categoryModalTitle"
        );


    if (title) {

        title.textContent =
            "Edit Category";

    }


    const saveText =
        categoryElement(
            "btnSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Update Category";

    }


    updateCategoryIconPreview();

    updateCategoryColorPreview();


    openCategoryModal();

}


// ==========================================================
// OPEN MODAL
// ==========================================================

function openCategoryModal() {

    const modal =
        categoryElement(
            "categoryModal"
        );


    if (!modal) {

        console.error(
            "Category modal not found."
        );

        return;

    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "category-modal-open"
    );

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeCategoryModal() {

    const modal =
        categoryElement(
            "categoryModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "category-modal-open"
    );


    editingCategoryId =
        null;


    resetCategoryForm();


    const title =
        categoryElement(
            "categoryModalTitle"
        );


    if (title) {

        title.textContent =
            "Add Category";

    }


    const saveText =
        categoryElement(
            "btnSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Category";

    }

}


// ==========================================================
// RESET FORM
// ==========================================================

function resetCategoryForm() {

    const form =
        categoryElement(
            "categoryForm"
        );


    if (form) {

        form.reset();

    }


    setCategoryValue(
        "categoryIcon",
        "fa-utensils"
    );


    setCategoryValue(
        "categoryColor",
        "#C8102E"
    );


    setCategoryValue(
        "categoryColorText",
        "#C8102E"
    );


    setCategoryValue(
        "displayOrder",
        1
    );


    setCategoryValue(
        "categoryStatus",
        "Active"
    );


    updateCategoryIconPreview();

    updateCategoryColorPreview();

}


// ==========================================================
// SAVE CATEGORY
// ==========================================================

async function saveCategory() {

    if (!categoryFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    const nameElement =
        categoryElement(
            "categoryName"
        );


    const name =
        (
            nameElement?.value ||
            ""
        ).trim();


    if (!name) {

        alert(
            "Please enter Category Name."
        );


        if (nameElement) {

            nameElement.focus();

        }


        return;

    }


    const code =
        (
            categoryElement(
                "categoryCode"
            )?.value ||
            ""
        ).trim();


    const description =
        (
            categoryElement(
                "categoryDescription"
            )?.value ||
            ""
        ).trim();


    const icon =
        normalizeCategoryIcon(
            categoryElement(
                "categoryIcon"
            )?.value
        );


    const color =
        categoryElement(
            "categoryColor"
        )?.value ||
        "#C8102E";


    const displayOrder =
        Number(
            categoryElement(
                "displayOrder"
            )?.value ||
            1
        );


    const status =
        categoryElement(
            "categoryStatus"
        )?.value ||
        "Active";


    // ======================================================
    // DUPLICATE NAME CHECK
    // ======================================================

    const duplicate =
        Object.entries(
            categoryData
        )
        .some(
            function(entry) {

                const id =
                    entry[0];


                const category =
                    entry[1] || {};


                if (
                    editingCategoryId &&
                    id === editingCategoryId
                ) {

                    return false;

                }


                return (
                    String(
                        category.name ||
                        ""
                    )
                    .trim()
                    .toLowerCase() ===
                    name.toLowerCase()
                );

            }
        );


    if (duplicate) {

        alert(
            "A category with this name already exists."
        );

        return;

    }


    const saveButton =
        categoryElement(
            "btnSaveCategory"
        );


    const saveText =
        categoryElement(
            "btnSaveText"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

    }


    if (saveText) {

        saveText.textContent =
            editingCategoryId
                ? "Updating..."
                : "Saving...";

    }


    try {

        const category = {

            code:
                code ||
                await generateCategoryCode(),

            name:
                name,

            description:
                description,

            icon:
                icon,

            color:
                color,

            displayOrder:
                displayOrder,

            status:
                status,

            productCount:
                editingCategoryId
                    ? Number(
                        categoryData[
                            editingCategoryId
                        ]?.productCount ||
                        0
                    )
                    : 0,

            updatedAt:
                firebase.database.ServerValue
                .TIMESTAMP

        };


        // ==================================================
        // UPDATE
        // ==================================================

        if (editingCategoryId) {

            await db
                .ref(
                    "categories/" +
                    editingCategoryId
                )
                .update(
                    category
                );


            alert(
                "Category updated successfully."
            );

        }

        // ==================================================
        // NEW
        // ==================================================

        else {

            category.createdAt =
                firebase.database.ServerValue
                .TIMESTAMP;


            const newRef =
                db
                    .ref("categories")
                    .push();


            await newRef.set(
                category
            );


            alert(
                "Category saved successfully."
            );

        }


        await loadCategories();

        closeCategoryModal();

    }

    catch (error) {

        console.error(
            "Save Category Error:",
            error
        );


        alert(
            "Unable to save category.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

        }


        if (saveText) {

            saveText.textContent =
                editingCategoryId
                    ? "Update Category"
                    : "Save Category";

        }

    }

}


// ==========================================================
// DELETE CATEGORY
// ==========================================================

async function deleteCategory(categoryId) {

    if (!categoryId) {

        return;

    }


    const category =
        categoryData[categoryId];


    if (!category) {

        alert(
            "Category not found."
        );

        return;

    }


    const name =
        category.name ||
        "this category";


    const confirmed =
        window.confirm(
            "Delete category \"" +
            name +
            "\"?\n\n" +
            "This action cannot be undone."
        );


    if (!confirmed) {

        return;

    }


    if (!categoryFirebaseReady()) {

        alert(
            "Firebase Database is not initialized."
        );

        return;

    }


    try {

        await db
            .ref(
                "categories/" +
                categoryId
            )
            .remove();


        delete categoryData[
            categoryId
        ];


        renderCategories();

        updateCategoryStatistics();


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
// GENERATE CATEGORY CODE
// ==========================================================

async function generateCategoryCode() {

    const numbers =
        Object.values(
            categoryData
        )
        .map(
            function(category) {

                const code =
                    String(
                        category.code ||
                        ""
                    );


                const match =
                    code.match(
                        /CAT-(\d+)/i
                    );


                return match
                    ? Number(match[1])
                    : 0;

            }
        );


    const highest =
        numbers.length
            ? Math.max(...numbers)
            : 0;


    const next =
        highest + 1;


    return (
        "CAT-" +
        String(next).padStart(
            3,
            "0"
        )
    );

}


// ==========================================================
// UPDATE STATISTICS
// ==========================================================

function updateCategoryStatistics() {

    const categories =
        Object.values(
            categoryData
        );


    const total =
        categories.length;


    const active =
        categories.filter(
            function(category) {

                return (
                    String(
                        category.status ||
                        "Active"
                    ).toLowerCase() ===
                    "active"
                );

            }
        ).length;


    const products =
        categories.reduce(
            function(total, category) {

                return (
                    total +
                    Number(
                        category.productCount ||
                        0
                    )
                );

            },
            0
        );


    setCategoryText(
        "totalCategories",
        total
    );


    setCategoryText(
        "activeCategories",
        active
    );


    setCategoryText(
        "categoryProductCount",
        products
    );


    setCategoryText(
        "categoryTotal",
        total
    );

}


// ==========================================================
// UPDATE TOTAL
// ==========================================================

function updateCategoryTotal(total) {

    setCategoryText(
        "categoryTotal",
        total
    );

}


// ==========================================================
// ICON PREVIEW
// ==========================================================

function updateCategoryIconPreview() {

    const input =
        categoryElement(
            "categoryIcon"
        );


    const preview =
        categoryElement(
            "iconPreview"
        );


    if (!preview) {

        return;

    }


    const icon =
        normalizeCategoryIcon(
            input?.value
        );


    preview.className =
        "fa-solid " +
        icon;

}


// ==========================================================
// COLOR PREVIEW
// ==========================================================

function updateCategoryColorPreview() {

    const colorInput =
        categoryElement(
            "categoryColor"
        );


    const colorText =
        categoryElement(
            "categoryColorText"
        );


    const color =
        colorInput?.value ||
        "#C8102E";


    if (colorText) {

        colorText.value =
            color;

    }


    const preview =
        categoryElement(
            "categoryIconPreview"
        );


    if (preview) {

        preview.style.background =
            hexToRGBA(
                color,
                .08
            );

        preview.style.borderColor =
            hexToRGBA(
                color,
                .25
            );

    }


    const icon =
        categoryElement(
            "iconPreview"
        );


    if (icon) {

        icon.style.color =
            color;

    }

}


// ==========================================================
// HEX TO RGBA
// ==========================================================

function hexToRGBA(
    hex,
    alpha
) {

    let value =
        String(
            hex ||
            "#C8102E"
        )
        .replace(
            "#",
            ""
        );


    if (value.length === 3) {

        value =
            value
            .split("")
            .map(
                function(char) {

                    return char + char;

                }
            )
            .join("");

    }


    const number =
        parseInt(
            value,
            16
        );


    if (
        Number.isNaN(number)
    ) {

        return (
            "rgba(200,16,46," +
            alpha +
            ")"
        );

    }


    const r =
        (number >> 16) & 255;


    const g =
        (number >> 8) & 255;


    const b =
        number & 255;


    return (
        "rgba(" +
        r +
        "," +
        g +
        "," +
        b +
        "," +
        alpha +
        ")"
    );

}


// ==========================================================
// EXPORT CSV
// ==========================================================

function exportCategories() {

    const categories =
        Object.entries(
            categoryData
        )
        .map(
            function(entry) {

                return {

                    id:
                        entry[0],

                    ...(
                        entry[1] || {}
                    )

                };

            }
        );


    if (
        categories.length === 0
    ) {

        alert(
            "There are no categories to export."
        );

        return;

    }


    const headers = [

        "Category Code",

        "Category Name",

        "Description",

        "Products",

        "Status",

        "Display Order"

    ];


    const rows =
        categories.map(
            function(category) {

                return [

                    category.code || "",

                    category.name || "",

                    category.description || "",

                    Number(
                        category.productCount ||
                        0
                    ),

                    category.status ||
                    "Active",

                    Number(
                        category.displayOrder ||
                        1
                    )

                ];

            }
        );


    const csv = [

        headers,

        ...rows

    ]
    .map(
        function(row) {

            return row
                .map(
                    function(value) {

                        return (
                            '"' +
                            String(
                                value
                            )
                            .replace(
                                /"/g,
                                '""'
                            ) +
                            '"'
                        );

                    }
                )
                .join(",");

        }
    )
    .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
                csv
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


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "PAPPRITO-Categories-" +
        getDateStamp() +
        ".csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// ==========================================================
// DATE STAMP
// ==========================================================

function getDateStamp() {

    const date =
        new Date();


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )
    );

}


// ==========================================================
// SHOW LOADING
// ==========================================================

function showCategoryLoading() {

    const tbody =
        categoryElement(
            "categoryTableBody"
        );


    const empty =
        categoryElement(
            "categoryEmpty"
        );


    if (empty) {

        empty.style.display =
            "none";

    }


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="category-loading">

                <div
                    class="category-spinner">
                </div>

                <span>
                    Loading categories...
                </span>

            </td>

        </tr>

    `;

}


// ==========================================================
// ERROR
// ==========================================================

function showCategoryError(
    message
) {

    const tbody =
        categoryElement(
            "categoryTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="
                    padding:40px;
                    text-align:center;
                    color:#C8102E;
                "
            >

                <i
                    class="fa-solid
                           fa-circle-exclamation"
                    style="
                        font-size:28px;
                        margin-bottom:10px;
                    "
                ></i>

                <div>

                    Unable to load categories.

                </div>

                <small>

                    ${escapeCategoryHTML(
                        message
                    )}

                </small>

            </td>

        </tr>

    `;

}


// ==========================================================
// SET VALUE
// ==========================================================

function setCategoryValue(
    id,
    value
) {

    const element =
        categoryElement(id);


    if (element) {

        element.value =
            value;

    }

}


// ==========================================================
// SET TEXT
// ==========================================================

function setCategoryText(
    id,
    value
) {

    const element =
        categoryElement(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================================
// NORMALIZE ICON
// ==========================================================

function normalizeCategoryIcon(
    icon
) {

    let value =
        String(
            icon ||
            "fa-utensils"
        )
        .trim();


    value =
        value.replace(
            /^fa-solid\s+/i,
            ""
        );


    if (!value.startsWith("fa-")) {

        value =
            "fa-" +
            value;

    }


    return value;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeCategoryHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================================
// GLOBAL EXPORTS
// ==========================================================

window.initializeCategoryPage =
    initializeCategoryPage;

window.loadCategories =
    loadCategories;

window.renderCategories =
    renderCategories;

window.openAddCategoryModal =
    openAddCategoryModal;

window.openCategoryModal =
    openCategoryModal;

window.closeCategoryModal =
    closeCategoryModal;

window.resetCategoryForm =
    resetCategoryForm;

window.saveCategory =
    saveCategory;

window.editCategory =
    editCategory;

window.deleteCategory =
    deleteCategory;

window.generateCategoryCode =
    generateCategoryCode;

window.updateCategoryIconPreview =
    updateCategoryIconPreview;

window.updateCategoryColorPreview =
    updateCategoryColorPreview;

window.exportCategories =
    exportCategories;


console.log(
    "PAPPRITO Category Master Engine V1 loaded."
);
