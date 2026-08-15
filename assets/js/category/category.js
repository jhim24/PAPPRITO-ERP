// ==========================================================
// PAPPRITO ERP
// CATEGORY MASTER
// COMPLETE JAVASCRIPT RESET
// File: assets/js/category/category.js
//
// FEATURES:
// - Load categories from Firebase
// - Add category
// - Edit category
// - Delete category
// - Search
// - Status filter
// - Refresh
// - Export CSV
// - Custom modal
// - X button
// - Cancel button
// - Save / Update
// - Icon preview
// - Color preview
// - Statistics
// - Pagination
// - Mobile friendly
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let categoryData = [];

let filteredCategories = [];

let editingCategoryId = null;

let categoryCurrentPage = 1;

const CATEGORY_PAGE_SIZE = 10;

let categoryEventsBound = false;


// ==========================================================
// FIREBASE REFERENCE
// ==========================================================

function getCategoryDatabase() {

    if (
        typeof db !== "undefined" &&
        db
    ) {

        return db;

    }


    if (
        typeof firebase !== "undefined" &&
        typeof firebase.database === "function"
    ) {

        try {

            return firebase.database();

        }

        catch (error) {

            console.error(
                "Firebase Database Error:",
                error
            );

        }

    }


    return null;

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


    categoryCurrentPage = 1;

    editingCategoryId = null;


    bindCategoryEvents();

    updateCategoryIconPreview();

    updateCategoryColorPreview();

    loadCategories();

}


// ==========================================================
// BIND EVENTS
// ==========================================================

function bindCategoryEvents() {

    const page =
        document.getElementById(
            "categoryPage"
        );


    if (!page) {

        console.error(
            "Category page not found."
        );

        return;

    }


    // ------------------------------------------------------
    // ADD
    // ------------------------------------------------------

    const addButton =
        document.getElementById(
            "btnAddCategory"
        );


    if (addButton) {

        addButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                openAddCategoryModal();

            };

    }


    // ------------------------------------------------------
    // CLOSE MODAL
    // ------------------------------------------------------

    const closeButton =
        document.getElementById(
            "btnCloseCategoryModal"
        );


    if (closeButton) {

        closeButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                closeCategoryModal();

            };

    }


    // ------------------------------------------------------
    // CANCEL
    // ------------------------------------------------------

    const cancelButton =
        document.getElementById(
            "btnCancelCategory"
        );


    if (cancelButton) {

        cancelButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                closeCategoryModal();

            };

    }


    // ------------------------------------------------------
    // SAVE
    // ------------------------------------------------------

    const saveButton =
        document.getElementById(
            "btnSaveCategory"
        );


    if (saveButton) {

        saveButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                saveCategory();

            };

    }


    // ------------------------------------------------------
    // SEARCH
    // ------------------------------------------------------

    const search =
        document.getElementById(
            "categorySearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            function() {

                categoryCurrentPage = 1;

                filterCategories();

            }
        );

    }


    // ------------------------------------------------------
    // STATUS FILTER
    // ------------------------------------------------------

    const statusFilter =
        document.getElementById(
            "categoryStatusFilter"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function() {

                categoryCurrentPage = 1;

                filterCategories();

            }
        );

    }


    // ------------------------------------------------------
    // REFRESH
    // ------------------------------------------------------

    const refreshButton =
        document.getElementById(
            "btnRefreshCategories"
        );


    if (refreshButton) {

        refreshButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                loadCategories(true);

            };

    }


    // ------------------------------------------------------
    // EXPORT
    // ------------------------------------------------------

    const exportButton =
        document.getElementById(
            "btnExportCategories"
        );


    if (exportButton) {

        exportButton.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                exportCategories();

            };

    }


    // ------------------------------------------------------
    // ICON
    // ------------------------------------------------------

    const iconInput =
        document.getElementById(
            "categoryIcon"
        );


    if (iconInput) {

        iconInput.addEventListener(
            "input",
            updateCategoryIconPreview
        );

    }


    // ------------------------------------------------------
    // COLOR PICKER
    // ------------------------------------------------------

    const colorInput =
        document.getElementById(
            "categoryColor"
        );


    if (colorInput) {

        colorInput.addEventListener(
            "input",
            function() {

                updateCategoryColorPreview();

            }
        );

    }


    // ------------------------------------------------------
    // COLOR TEXT
    // ------------------------------------------------------

    const colorText =
        document.getElementById(
            "categoryColorValue"
        );


    if (colorText) {

        colorText.addEventListener(
            "input",
            function() {

                const value =
                    colorText.value.trim();


                if (
                    /^#[0-9A-Fa-f]{6}$/.test(
                        value
                    )
                ) {

                    if (colorInput) {

                        colorInput.value =
                            value;

                    }


                    updateCategoryColorPreview();

                }

            }
        );

    }


    // ------------------------------------------------------
    // MODAL BACKDROP
    // ------------------------------------------------------

    const modal =
        document.getElementById(
            "categoryModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === modal
                ) {

                    closeCategoryModal();

                }

            }
        );

    }


    // ------------------------------------------------------
    // ESC KEY
    // ------------------------------------------------------

    document.addEventListener(
        "keydown",
        categoryEscapeHandler
    );


    categoryEventsBound = true;


    console.log(
        "Category events bound."
    );

}


// ==========================================================
// ESCAPE HANDLER
// ==========================================================

function categoryEscapeHandler(event) {

    if (
        event.key !== "Escape"
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "categoryModal"
        );


    if (
        modal &&
        modal.classList.contains("show")
    ) {

        closeCategoryModal();

    }

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadCategories(showRefresh = false) {

    const database =
        getCategoryDatabase();


    if (!database) {

        renderCategoryError(
            "Firebase Database is not initialized."
        );

        return;

    }


    const tableBody =
        document.getElementById(
            "categoryTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="category-loading"
                >

                    <div class="spinner"></div>

                    <div>

                        Loading categories...

                    </div>

                </td>

            </tr>

        `;

    }


    if (showRefresh) {

        const button =
            document.getElementById(
                "btnRefreshCategories"
            );


        if (button) {

            button.disabled = true;

        }

    }


    try {

        const snapshot =
            await database
                .ref("categories")
                .once("value");


        const data =
            snapshot.val() || {};


        categoryData =
            normalizeCategories(
                data
            );


        categoryData.sort(
            function(a, b) {

                const orderA =
                    Number(
                        a.displayOrder || 0
                    );


                const orderB =
                    Number(
                        b.displayOrder || 0
                    );


                if (
                    orderA !== orderB
                ) {

                    return orderA - orderB;

                }


                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                );

            }
        );


        updateStatistics();

        filterCategories();

        showCategoryAlert(
            "Categories loaded successfully.",
            "success",
            1800
        );


        console.log(
            "Categories loaded:",
            categoryData.length
        );

    }

    catch (error) {

        console.error(
            "Load Categories Error:",
            error
        );


        renderCategoryError(
            error.message ||
            "Unable to load categories."
        );

    }

    finally {

        if (showRefresh) {

            const button =
                document.getElementById(
                    "btnRefreshCategories"
                );


            if (button) {

                button.disabled = false;

            }

        }

    }

}


// ==========================================================
// NORMALIZE DATA
// ==========================================================

function normalizeCategories(data) {

    const result = [];


    if (
        !data ||
        typeof data !== "object"
    ) {

        return result;

    }


    Object.keys(data).forEach(
        function(id) {

            const item =
                data[id] || {};


            result.push({

                id: id,

                code:
                    item.code ||
                    "",

                name:
                    item.name ||
                    "",

                description:
                    item.description ||
                    "",

                icon:
                    item.icon ||
                    "fa-utensils",

                color:
                    item.color ||
                    "#C8102E",

                displayOrder:
                    Number(
                        item.displayOrder || 1
                    ),

                status:
                    item.status ||
                    "Active",

                productCount:
                    Number(
                        item.productCount ||
                        item.productsCount ||
                        0
                    ),

                createdAt:
                    item.createdAt ||
                    "",

                updatedAt:
                    item.updatedAt ||
                    ""

            });

        }
    );


    return result;

}


// ==========================================================
// FILTER
// ==========================================================

function filterCategories() {

    const searchInput =
        document.getElementById(
            "categorySearch"
        );


    const statusInput =
        document.getElementById(
            "categoryStatusFilter"
        );


    const search =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const status =
        statusInput?.value ||
        "all";


    filteredCategories =
        categoryData.filter(
            function(category) {

                const text = (

                    String(
                        category.code || ""
                    ) +
                    " " +
                    String(
                        category.name || ""
                    ) +
                    " " +
                    String(
                        category.description || ""
                    )

                ).toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(search);


                const matchesStatus =
                    status === "all" ||
                    String(
                        category.status
                    ).toLowerCase() ===
                    String(
                        status
                    ).toLowerCase();


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderCategoryTable();

    renderCategoryPagination();

}


// ==========================================================
// RENDER TABLE
// ==========================================================

function renderCategoryTable() {

    const tbody =
        document.getElementById(
            "categoryTableBody"
        );


    if (!tbody) {

        return;

    }


    const total =
        filteredCategories.length;


    if (!total) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="category-empty"
                >

                    <div
                        class="category-empty-icon"
                    >

                        <i class="fa-solid fa-tags"></i>

                    </div>


                    <h4>

                        No Categories Found

                    </h4>


                    <p>

                        Try another search or add
                        a new category.

                    </p>

                </td>

            </tr>

        `;


        updateListCount();

        return;

    }


    const start =
        (
            categoryCurrentPage - 1
        ) *
        CATEGORY_PAGE_SIZE;


    const end =
        Math.min(
            start +
            CATEGORY_PAGE_SIZE,
            total
        );


    const pageItems =
        filteredCategories.slice(
            start,
            end
        );


    tbody.innerHTML =
        pageItems
            .map(
                renderCategoryRow
            )
            .join("");


    updateListCount();

}


// ==========================================================
// RENDER ROW
// ==========================================================

function renderCategoryRow(category) {

    const id =
        escapeHTML(
            category.id
        );


    const code =
        escapeHTML(
            category.code ||
            "-"
        );


    const name =
        escapeHTML(
            category.name ||
            "Unnamed Category"
        );


    const description =
        escapeHTML(
            category.description ||
            "-"
        );


    const icon =
        sanitizeIcon(
            category.icon
        );


    const color =
        sanitizeColor(
            category.color
        );


    const status =
        String(
            category.status ||
            "Active"
        );


    const statusClass =
        status.toLowerCase() ===
        "active"
            ? "active"
            : "inactive";


    const productCount =
        Number(
            category.productCount || 0
        );


    const order =
        Number(
            category.displayOrder || 1
        );


    return `

        <tr>

            <td>

                <span class="category-code">

                    ${code}

                </span>

            </td>


            <td>

                <div class="category-name-cell">

                    <div
                        class="category-icon"
                        style="
                            background:${hexToRGBA(
                                color,
                                .10
                            )};
                            color:${color};
                        "
                    >

                        <i
                            class="fa-solid ${icon}"
                        ></i>

                    </div>


                    <span class="category-name">

                        ${name}

                    </span>

                </div>

            </td>


            <td>

                <div
                    class="category-description"
                    title="${description}"
                >

                    ${description}

                </div>

            </td>


            <td>

                <span
                    class="category-product-count"
                >

                    ${productCount}

                </span>

            </td>


            <td>

                <span
                    class="
                        category-status
                        ${statusClass}
                    "
                >

                    <i class="fa-solid fa-circle"></i>

                    ${escapeHTML(status)}

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
                        class="
                            category-action-button
                            category-edit-button
                        "
                        title="Edit Category"
                        data-action="edit"
                        data-id="${id}"
                    >

                        <i
                            class="fa-solid fa-pen"
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="
                            category-action-button
                            category-delete-button
                        "
                        title="Delete Category"
                        data-action="delete"
                        data-id="${id}"
                    >

                        <i
                            class="fa-solid fa-trash"
                        ></i>

                    </button>


                </div>

            </td>

        </tr>

    `;

}


// ==========================================================
// TABLE ACTIONS
// ==========================================================

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const id =
            button.dataset.id;


        if (!id) {

            return;

        }


        if (
            action === "edit"
        ) {

            editCategory(id);

        }


        if (
            action === "delete"
        ) {

            deleteCategory(id);

        }

    }
);


// ==========================================================
// OPEN ADD MODAL
// ==========================================================

function openAddCategoryModal() {

    editingCategoryId =
        null;


    resetCategoryForm();


    const title =
        document.getElementById(
            "categoryModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-plus"></i>

            Add Category

        `;

    }


    const saveText =
        document.getElementById(
            "btnSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Save Category";

    }


    const modal =
        document.getElementById(
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


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function() {

            const input =
                document.getElementById(
                    "categoryName"
                );


            if (input) {

                input.focus();

            }

        },
        100
    );

}


// ==========================================================
// OPEN EDIT MODAL
// ==========================================================

async function editCategory(categoryId) {

    const category =
        categoryData.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    categoryId
                );

            }
        );


    if (!category) {

        showCategoryAlert(
            "Category not found.",
            "error"
        );

        return;

    }


    editingCategoryId =
        category.id;


    setInputValue(
        "categoryCode",
        category.code
    );


    setInputValue(
        "categoryName",
        category.name
    );


    setInputValue(
        "categoryDescription",
        category.description
    );


    setInputValue(
        "categoryIcon",
        category.icon
    );


    setInputValue(
        "categoryColor",
        sanitizeColor(
            category.color
        )
    );


    setInputValue(
        "categoryColorValue",
        sanitizeColor(
            category.color
        )
    );


    setInputValue(
        "displayOrder",
        category.displayOrder || 1
    );


    setInputValue(
        "categoryStatus",
        category.status || "Active"
    );


    updateCategoryIconPreview();

    updateCategoryColorPreview();


    const title =
        document.getElementById(
            "categoryModalTitle"
        );


    if (title) {

        title.innerHTML = `

            <i class="fa-solid fa-pen-to-square"></i>

            Edit Category

        `;

    }


    const saveText =
        document.getElementById(
            "btnSaveText"
        );


    if (saveText) {

        saveText.textContent =
            "Update Category";

    }


    openCategoryModal();

}


// ==========================================================
// OPEN MODAL
// ==========================================================

function openCategoryModal() {

    const modal =
        document.getElementById(
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


    document.body.style.overflow =
        "hidden";

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeCategoryModal() {

    const modal =
        document.getElementById(
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


    document.body.style.overflow =
        "";


    editingCategoryId =
        null;


    resetCategoryForm();

}


// ==========================================================
// RESET FORM
// ==========================================================

function resetCategoryForm() {

    setInputValue(
        "categoryCode",
        generateCategoryCode()
    );


    setInputValue(
        "categoryName",
        ""
    );


    setInputValue(
        "categoryDescription",
        ""
    );


    setInputValue(
        "categoryIcon",
        "fa-utensils"
    );


    setInputValue(
        "categoryColor",
        "#C8102E"
    );


    setInputValue(
        "categoryColorValue",
        "#C8102E"
    );


    setInputValue(
        "displayOrder",
        getNextDisplayOrder()
    );


    setInputValue(
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

    const database =
        getCategoryDatabase();


    if (!database) {

        showCategoryAlert(
            "Firebase Database is not initialized.",
            "error"
        );

        return;

    }


    const name =
        getInputValue(
            "categoryName"
        ).trim();


    if (!name) {

        showCategoryAlert(
            "Category name is required.",
            "error"
        );


        focusInput(
            "categoryName"
        );


        return;

    }


    const code =
        getInputValue(
            "categoryCode"
        ).trim();


    const description =
        getInputValue(
            "categoryDescription"
        ).trim();


    const icon =
        normalizeIcon(
            getInputValue(
                "categoryIcon"
            )
        );


    const color =
        sanitizeColor(
            getInputValue(
                "categoryColor"
            )
        );


    const displayOrder =
        Math.max(
            1,
            Number(
                getInputValue(
                    "displayOrder"
                ) || 1
            )
        );


    const status =
        getInputValue(
            "categoryStatus"
        ) ||
        "Active";


    const duplicate =
        categoryData.find(
            function(item) {

                if (
                    editingCategoryId &&
                    String(item.id) ===
                    String(editingCategoryId)
                ) {

                    return false;

                }


                return (
                    String(
                        item.name || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    name.toLowerCase()
                );

            }
        );


    if (duplicate) {

        showCategoryAlert(
            "A category with this name already exists.",
            "error"
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "btnSaveCategory"
        );


    if (saveButton) {

        saveButton.disabled = true;

    }


    const saveText =
        document.getElementById(
            "btnSaveText"
        );


    const originalText =
        saveText
            ? saveText.textContent
            : "Save Category";


    if (saveText) {

        saveText.textContent =
            editingCategoryId
                ? "Updating..."
                : "Saving...";

    }


    try {

        const now =
            new Date().toISOString();


        const data = {

            code:
                code ||
                generateCategoryCode(),

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
                    ? getExistingProductCount(
                        editingCategoryId
                    )
                    : 0,

            updatedAt:
                now

        };


        if (
            editingCategoryId
        ) {

            await database
                .ref(
                    "categories/" +
                    editingCategoryId
                )
                .update(
                    data
                );


            showCategoryAlert(
                "Category updated successfully.",
                "success"
            );

        }

        else {

            data.createdAt =
                now;


            const newRef =
                database
                    .ref("categories")
                    .push();


            await newRef.set(
                data
            );


            showCategoryAlert(
                "Category added successfully.",
                "success"
            );

        }


        closeCategoryModal();


        await loadCategories();


    }

    catch (error) {

        console.error(
            "Save Category Error:",
            error
        );


        showCategoryAlert(
            error.message ||
            "Unable to save category.",
            "error"
        );

    }

    finally {

        if (saveButton) {

            saveButton.disabled = false;

        }


        if (saveText) {

            saveText.textContent =
                originalText;

        }

    }

}


// ==========================================================
// DELETE CATEGORY
// ==========================================================

async function deleteCategory(categoryId) {

    const category =
        categoryData.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    categoryId
                );

            }
        );


    if (!category) {

        showCategoryAlert(
            "Category not found.",
            "error"
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Delete category \"" +
            category.name +
            "\"?\n\n" +
            "This action cannot be undone."
        );


    if (!confirmed) {

        return;

    }


    const database =
        getCategoryDatabase();


    if (!database) {

        showCategoryAlert(
            "Firebase Database is not initialized.",
            "error"
        );

        return;

    }


    try {

        await database
            .ref(
                "categories/" +
                categoryId
            )
            .remove();


        showCategoryAlert(
            "Category deleted successfully.",
            "success"
        );


        await loadCategories();

    }

    catch (error) {

        console.error(
            "Delete Category Error:",
            error
        );


        showCategoryAlert(
            error.message ||
            "Unable to delete category.",
            "error"
        );

    }

}


// ==========================================================
// GENERATE CATEGORY CODE
// ==========================================================

function generateCategoryCode() {

    let maxNumber = 0;


    categoryData.forEach(
        function(category) {

            const code =
                String(
                    category.code || ""
                );


            const match =
                code.match(
                    /(\d+)$/
                );


            if (match) {

                maxNumber =
                    Math.max(
                        maxNumber,
                        Number(
                            match[1]
                        )
                    );

            }

        }
    );


    const next =
        maxNumber + 1;


    return (
        "CAT-" +
        String(next)
            .padStart(
                4,
                "0"
            )
    );

}


// ==========================================================
// NEXT DISPLAY ORDER
// ==========================================================

function getNextDisplayOrder() {

    if (
        !categoryData.length
    ) {

        return 1;

    }


    const orders =
        categoryData.map(
            function(item) {

                return Number(
                    item.displayOrder || 0
                );

            }
        );


    return (
        Math.max(
            ...orders,
            0
        ) + 1
    );

}


// ==========================================================
// PRODUCT COUNT
// ==========================================================

function getExistingProductCount(
    categoryId
) {

    const category =
        categoryData.find(
            function(item) {

                return String(
                    item.id
                ) ===
                String(
                    categoryId
                );

            }
        );


    return category
        ? Number(
            category.productCount || 0
        )
        : 0;

}


// ==========================================================
// ICON PREVIEW
// ==========================================================

function updateCategoryIconPreview() {

    const input =
        document.getElementById(
            "categoryIcon"
        );


    const preview =
        document.getElementById(
            "categoryIconPreview"
        );


    if (!preview) {

        return;

    }


    const icon =
        normalizeIcon(
            input?.value ||
            "fa-utensils"
        );


    preview.innerHTML = `

        <i
            class="fa-solid ${escapeHTML(icon)}"
        ></i>

    `;

}


// ==========================================================
// COLOR PREVIEW
// ==========================================================

function updateCategoryColorPreview() {

    const colorInput =
        document.getElementById(
            "categoryColor"
        );


    const colorText =
        document.getElementById(
            "categoryColorValue"
        );


    const color =
        sanitizeColor(
            colorInput?.value ||
            "#C8102E"
        );


    if (colorInput) {

        colorInput.value =
            color;

    }


    if (colorText) {

        colorText.value =
            color;

    }


    const preview =
        document.getElementById(
            "categoryIconPreview"
        );


    if (preview) {

        const icon =
            preview.querySelector(
                "i"
            );


        if (icon) {

            icon.style.color =
                color;

        }

    }

}


// ==========================================================
// UPDATE STATISTICS
// ==========================================================

function updateStatistics() {

    const total =
        categoryData.length;


    const active =
        categoryData.filter(
            function(item) {

                return String(
                    item.status
                ).toLowerCase() ===
                "active";

            }
        ).length;


    const products =
        categoryData.reduce(
            function(total, item) {

                return (
                    total +
                    Number(
                        item.productCount || 0
                    )
                );

            },
            0
        );


    setText(
        "totalCategories",
        total
    );


    setText(
        "activeCategories",
        active
    );


    setText(
        "assignedProducts",
        products
    );

}


// ==========================================================
// LIST COUNT
// ==========================================================

function updateListCount() {

    const element =
        document.getElementById(
            "categoryListCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        "Total: " +
        filteredCategories.length;

}


// ==========================================================
// PAGINATION
// ==========================================================

function renderCategoryPagination() {

    const container =
        document.getElementById(
            "categoryPaginationButtons"
        );


    const info =
        document.getElementById(
            "categoryPaginationInfo"
        );


    if (!container) {

        return;

    }


    const total =
        filteredCategories.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                CATEGORY_PAGE_SIZE
            )
        );


    if (
        categoryCurrentPage >
        totalPages
    ) {

        categoryCurrentPage =
            totalPages;

    }


    const start =
        total === 0
            ? 0
            : (
                (
                    categoryCurrentPage -
                    1
                ) *
                CATEGORY_PAGE_SIZE
            ) + 1;


    const end =
        Math.min(
            categoryCurrentPage *
            CATEGORY_PAGE_SIZE,
            total
        );


    if (info) {

        info.textContent =
            "Showing " +
            start +
            " to " +
            end +
            " of " +
            total +
            " Categories";

    }


    if (
        totalPages <= 1
    ) {

        container.innerHTML = "";

        return;

    }


    let html = "";


    html += `

        <button
            type="button"
            class="category-page-button"
            data-page-action="prev"
            ${categoryCurrentPage === 1
                ? "disabled"
                : ""}
        >

            <i class="fa-solid fa-chevron-left"></i>

        </button>

    `;


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `

            <button
                type="button"
                class="
                    category-page-button
                    ${
                        page ===
                        categoryCurrentPage
                            ? "active"
                            : ""
                    }
                "
                data-page="${page}"
            >

                ${page}

            </button>

        `;

    }


    html += `

        <button
            type="button"
            class="category-page-button"
            data-page-action="next"
            ${
                categoryCurrentPage ===
                totalPages
                    ? "disabled"
                    : ""
            }
        >

            <i class="fa-solid fa-chevron-right"></i>

        </button>

    `;


    container.innerHTML =
        html;

}


// ==========================================================
// PAGINATION CLICK
// ==========================================================

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-page], [data-page-action]"
            );


        if (!button) {

            return;

        }


        const page =
            button.dataset.page;


        const action =
            button.dataset.pageAction;


        if (page) {

            categoryCurrentPage =
                Number(page);

            renderCategoryTable();

            renderCategoryPagination();

        }


        if (
            action === "prev" &&
            categoryCurrentPage > 1
        ) {

            categoryCurrentPage--;

            renderCategoryTable();

            renderCategoryPagination();

        }


        if (
            action === "next"
        ) {

            const totalPages =
                Math.ceil(
                    filteredCategories.length /
                    CATEGORY_PAGE_SIZE
                );


            if (
                categoryCurrentPage <
                totalPages
            ) {

                categoryCurrentPage++;

                renderCategoryTable();

                renderCategoryPagination();

            }

        }

    }
);


// ==========================================================
// EXPORT CSV
// ==========================================================

function exportCategories() {

    if (
        !filteredCategories.length
    ) {

        showCategoryAlert(
            "There are no categories to export.",
            "error"
        );

        return;

    }


    const rows = [

        [
            "Code",
            "Category Name",
            "Description",
            "Products",
            "Status",
            "Display Order"
        ]

    ];


    filteredCategories.forEach(
        function(category) {

            rows.push([

                category.code || "",

                category.name || "",

                category.description || "",

                category.productCount || 0,

                category.status || "",

                category.displayOrder || 1

            ]);

        }
    );


    const csv =
        rows
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
            [csv],
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
        "papprito-categories.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showCategoryAlert(
        "Category list exported successfully.",
        "success"
    );

}


// ==========================================================
// ERROR
// ==========================================================

function renderCategoryError(
    message
) {

    const tbody =
        document.getElementById(
            "categoryTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="category-empty"
            >

                <div
                    class="category-empty-icon"
                >

                    <i
                        class="
                            fa-solid
                            fa-triangle-exclamation
                        "
                    ></i>

                </div>


                <h4>

                    Unable to Load Categories

                </h4>


                <p>

                    ${escapeHTML(
                        message
                    )}

                </p>

            </td>

        </tr>

    `;

}


// ==========================================================
// ALERT
// ==========================================================

function showCategoryAlert(
    message,
    type = "success",
    duration = 3000
) {

    const alert =
        document.getElementById(
            "categoryAlert"
        );


    const icon =
        document.getElementById(
            "categoryAlertIcon"
        );


    const text =
        document.getElementById(
            "categoryAlertMessage"
        );


    if (
        !alert ||
        !icon ||
        !text
    ) {

        console.log(
            "Category Alert:",
            message
        );

        return;

    }


    alert.className =
        "category-alert " +
        (
            type === "error"
                ? "error"
                : "success"
        );


    icon.className =
        type === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";


    text.textContent =
        message;


    alert.style.display =
        "flex";


    if (duration > 0) {

        clearTimeout(
            alert._hideTimer
        );


        alert._hideTimer =
            setTimeout(
                function() {

                    alert.style.display =
                        "none";

                },
                duration
            );

    }

}


// ==========================================================
// HELPERS
// ==========================================================

function getInputValue(id) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value
        : "";

}


function setInputValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function focusInput(id) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        setTimeout(
            function() {

                element.focus();

            },
            50
        );

    }

}


// ==========================================================
// NORMALIZE ICON
// ==========================================================

function normalizeIcon(
    icon
) {

    let value =
        String(
            icon ||
            "fa-utensils"
        ).trim();


    value =
        value.replace(
            /^fa-solid\s+/i,
            ""
        );


    value =
        value.replace(
            /^fa-/i,
            "fa-"
        );


    if (
        !value.startsWith(
            "fa-"
        )
    ) {

        value =
            "fa-" +
            value;

    }


    return value;

}


function sanitizeIcon(
    icon
) {

    return normalizeIcon(
        icon
    )
    .replace(
        /[^a-zA-Z0-9_-]/g,
        ""
    );

}


// ==========================================================
// COLOR
// ==========================================================

function sanitizeColor(
    color
) {

    const value =
        String(
            color ||
            "#C8102E"
        ).trim();


    if (
        /^#[0-9A-Fa-f]{6}$/.test(
            value
        )
    ) {

        return value;

    }


    return "#C8102E";

}


function hexToRGBA(
    hex,
    alpha
) {

    const value =
        sanitizeColor(
            hex
        );


    const r =
        parseInt(
            value.substring(
                1,
                3
            ),
            16
        );


    const g =
        parseInt(
            value.substring(
                3,
                5
            ),
            16
        );


    const b =
        parseInt(
            value.substring(
                5,
                7
            ),
            16
        );


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
// HTML ESCAPE
// ==========================================================

function escapeHTML(
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


window.openAddCategoryModal =
    openAddCategoryModal;


window.openCategoryModal =
    openCategoryModal;


window.closeCategoryModal =
    closeCategoryModal;


window.editCategory =
    editCategory;


window.deleteCategory =
    deleteCategory;


window.saveCategory =
    saveCategory;


window.resetCategoryForm =
    resetCategoryForm;


window.generateCategoryCode =
    generateCategoryCode;


window.updateCategoryIconPreview =
    updateCategoryIconPreview;


window.updateCategoryColorPreview =
    updateCategoryColorPreview;


window.exportCategories =
    exportCategories;


window.filterCategories =
    filterCategories;


console.log(
    "PAPPRITO Category Master - Complete V1 loaded."
);
