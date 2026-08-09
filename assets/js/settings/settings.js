// ==========================================================
// PAPPRITO ERP
// SETTINGS MASTER ENGINE V1
// File : assets/js/settings/settings.js
//
// PURPOSE:
// Central Settings Controller
//
// FEATURES:
// - Settings navigation
// - Firebase Realtime Database
// - Load settings
// - Save settings
// - Reset settings
// - Database status
// - Storage status
// - Online Menu settings
// - POS settings
// - Inventory settings
// - Kitchen settings
// - Receipt settings
// - System settings
//
// DATABASE:
// /settings
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL SETTINGS STATE
// ==========================================================

const PAPPRITO_SETTINGS_PATH = "settings";

let pappritoSettings = {};

let settingsInitialized = false;

let settingsSaving = false;


// ==========================================================
// DEFAULT SETTINGS
// ==========================================================

const DEFAULT_SETTINGS = {

    // ------------------------------------------------------
    // GENERAL
    // ------------------------------------------------------

    general: {

        businessName:
            "PAPPRITO",

        businessDescription:
            "PAPPRITO Restaurant",

        currency:
            "PHP",

        currencySymbol:
            "₱",

        timezone:
            "Asia/Manila",

        dateFormat:
            "MM/DD/YYYY",

        timeFormat:
            "12",

        language:
            "en",

        theme:
            "light"

    },


    // ------------------------------------------------------
    // PRODUCT
    // ------------------------------------------------------

    product: {

        allowNegativeStock:
            false,

        allowDuplicateCode:
            false,

        requireCategory:
            true,

        defaultStatus:
            "Active",

        defaultReorderLevel:
            10,

        maxImageSize:
            2

    },


    // ------------------------------------------------------
    // POS
    // ------------------------------------------------------

    pos: {

        enablePOS:
            true,

        allowDiscount:
            true,

        allowVoid:
            true,

        allowRefund:
            true,

        requireCustomer:
            false,

        autoPrintReceipt:
            false,

        showProductImages:
            true,

        showProductCode:
            true,

        showStock:
            true,

        taxEnabled:
            false,

        taxRate:
            0

    },


    // ------------------------------------------------------
    // ONLINE MENU
    // ------------------------------------------------------

    onlineMenu: {

        enabled:
            true,

        showProductImages:
            true,

        showDescription:
            true,

        showPrice:
            true,

        showUnavailable:
            false,

        allowOnlineOrder:
            true,

        allowReservation:
            true,

        showBestSeller:
            true,

        showCategories:
            true

    },


    // ------------------------------------------------------
    // INVENTORY
    // ------------------------------------------------------

    inventory: {

        enabled:
            true,

        tracking:
            true,

        allowStockAdjustment:
            true,

        allowNegativeStock:
            false,

        lowStockAlert:
            true,

        defaultReorderLevel:
            10,

        autoDeductPOS:
            true,

        autoDeductProduction:
            true

    },


    // ------------------------------------------------------
    // KITCHEN
    // ------------------------------------------------------

    kitchen: {

        enabled:
            true,

        autoSendOrders:
            true,

        showOrderNumber:
            true,

        showTableNumber:
            true,

        soundAlert:
            true,

        autoRefresh:
            true,

        refreshSeconds:
            10

    },


    // ------------------------------------------------------
    // RECEIPT
    // ------------------------------------------------------

    receipt: {

        businessName:
            "PAPPRITO",

        address:
            "",

        phone:
            "",

        footer:
            "Thank you for dining with us!",

        paperSize:
            "80mm",

        showLogo:
            true,

        showAddress:
            true,

        showPhone:
            true,

        showCashier:
            true,

        showDate:
            true,

        showOrderNumber:
            true

    },


    // ------------------------------------------------------
    // USERS
    // ------------------------------------------------------

    users: {

        requireLogin:
            true,

        allowCashier:
            true,

        allowManager:
            true,

        allowAdmin:
            true

    },


    // ------------------------------------------------------
    // SYSTEM
    // ------------------------------------------------------

    system: {

        maintenanceMode:
            false,

        debugMode:
            false,

        autoBackup:
            false,

        enableNotifications:
            true,

        enableSound:
            true

    },


    // ------------------------------------------------------
    // META
    // ------------------------------------------------------

    meta: {

        version:
            "1.0.0",

        updatedAt:
            null

    }

};


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeSettings() {

    if (settingsInitialized) {

        return;

    }


    settingsInitialized =
        true;


    console.log(
        "=================================================="
    );

    console.log(
        "PAPPRITO ERP SETTINGS INITIALIZING..."
    );

    console.log(
        "=================================================="
    );


    initializeSettingsNavigation();

    initializeSettingsButtons();

    initializeSettingsInputs();

    loadSettings();

    checkFirebaseStatus();


    console.log(
        "PAPPRITO ERP SETTINGS READY"
    );

}


// ==========================================================
// NAVIGATION
// ==========================================================

function initializeSettingsNavigation() {

    const navItems =
        document.querySelectorAll(
            ".settings-nav-item"
        );


    if (!navItems.length) {

        console.warn(
            "Settings navigation not found."
        );

        return;

    }


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const target =
                        item.dataset.target;


                    if (!target) {

                        return;

                    }


                    activateSettingsSection(
                        target
                    );

                }
            );

        }
    );


    // ------------------------------------------------------
    // OPEN FIRST ACTIVE SECTION
    // ------------------------------------------------------

    const activeItem =
        document.querySelector(
            ".settings-nav-item.active"
        );


    if (activeItem) {

        const target =
            activeItem.dataset.target;


        if (target) {

            activateSettingsSection(
                target
            );

        }

    }

    else if (navItems[0]) {

        navItems[0].classList.add(
            "active"
        );


        const target =
            navItems[0].dataset.target;


        if (target) {

            activateSettingsSection(
                target
            );

        }

    }

}


// ==========================================================
// ACTIVATE SECTION
// ==========================================================

function activateSettingsSection(
    target
) {

    const navItems =
        document.querySelectorAll(
            ".settings-nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".settings-section"
        );


    navItems.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item.dataset.target === target
            );

        }
    );


    sections.forEach(
        function (section) {

            const sectionId =
                section.id;


            const isActive =
                sectionId === target ||
                sectionId ===
                "settings-" + target;


            section.classList.toggle(
                "active",
                isActive
            );

        }
    );


    console.log(
        "Settings section:",
        target
    );

}


// ==========================================================
// BUTTONS
// ==========================================================

function initializeSettingsButtons() {

    const saveButton =
        document.getElementById(
            "btnSaveSettings"
        );


    const resetButton =
        document.getElementById(
            "btnResetSettings"
        );


    if (saveButton) {

        if (
            saveButton.dataset.initialized !==
            "true"
        ) {

            saveButton.dataset.initialized =
                "true";


            saveButton.addEventListener(
                "click",
                saveSettings
            );

        }

    }


    if (resetButton) {

        if (
            resetButton.dataset.initialized !==
            "true"
        ) {

            resetButton.dataset.initialized =
                "true";


            resetButton.addEventListener(
                "click",
                resetSettings
            );

        }

    }

}


// ==========================================================
// INPUT LISTENERS
// ==========================================================

function initializeSettingsInputs() {

    const inputs =
        document.querySelectorAll(
            "#settingsPage input, " +
            "#settingsPage select, " +
            "#settingsPage textarea"
        );


    inputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function () {

                    markSettingsChanged();

                }
            );


            input.addEventListener(
                "input",
                function () {

                    markSettingsChanged();

                }
            );

        }
    );

}


// ==========================================================
// MARK CHANGED
// ==========================================================

function markSettingsChanged() {

    const status =
        document.getElementById(
            "settingsSaveStatus"
        );


    if (!status) {

        return;

    }


    status.textContent =
        "Unsaved Changes";


    status.className =
        "badge bg-warning text-dark";

}


// ==========================================================
// FIREBASE STATUS
// ==========================================================

function checkFirebaseStatus() {

    const databaseStatus =
        document.getElementById(
            "settingsDatabaseStatus"
        );


    const storageStatus =
        document.getElementById(
            "settingsStorageStatus"
        );


    // ------------------------------------------------------
    // DATABASE
    // ------------------------------------------------------

    if (
        typeof db !==
        "undefined" &&
        db
    ) {

        setStatusBadge(
            databaseStatus,
            "Connected",
            "success"
        );

    }

    else {

        setStatusBadge(
            databaseStatus,
            "Not Connected",
            "danger"
        );

    }


    // ------------------------------------------------------
    // STORAGE
    // ------------------------------------------------------

    if (
        typeof firebase !==
        "undefined" &&
        typeof firebase.storage ===
        "function"
    ) {

        try {

            const storage =
                firebase.storage();


            if (storage) {

                setStatusBadge(
                    storageStatus,
                    "Available",
                    "success"
                );

            }

        }

        catch (error) {

            setStatusBadge(
                storageStatus,
                "Unavailable",
                "danger"
            );

        }

    }

    else {

        setStatusBadge(
            storageStatus,
            "Unavailable",
            "danger"
        );

    }

}


// ==========================================================
// STATUS BADGE
// ==========================================================

function setStatusBadge(
    element,
    text,
    type
) {

    if (!element) {

        return;

    }


    element.textContent =
        text;


    element.className =
        "badge bg-" +
        type;

}


// ==========================================================
// LOAD SETTINGS
// ==========================================================

async function loadSettings() {

    if (
        typeof db ===
        "undefined" ||
        !db
    ) {

        console.warn(
            "Firebase Database unavailable."
        );

        pappritoSettings =
            deepClone(
                DEFAULT_SETTINGS
            );


        applySettingsToForm();

        return;

    }


    try {

        console.log(
            "Loading PAPPRITO settings..."
        );


        const snapshot =
            await db
                .ref(
                    PAPPRITO_SETTINGS_PATH
                )
                .once(
                    "value"
                );


        if (
            snapshot.exists()
        ) {

            const savedSettings =
                snapshot.val() || {};


            pappritoSettings =
                mergeSettings(
                    DEFAULT_SETTINGS,
                    savedSettings
                );


            console.log(
                "Settings loaded from Firebase."
            );

        }

        else {

            pappritoSettings =
                deepClone(
                    DEFAULT_SETTINGS
                );


            console.log(
                "No settings found. Using defaults."
            );

        }


        applySettingsToForm();


        updateLastSaved();


        const status =
            document.getElementById(
                "settingsSaveStatus"
            );


        if (status) {

            status.textContent =
                "Saved";

            status.className =
                "badge bg-success";

        }

    }

    catch (error) {

        console.error(
            "Unable to load settings:",
            error
        );


        pappritoSettings =
            deepClone(
                DEFAULT_SETTINGS
            );


        applySettingsToForm();


        showSettingsError(
            "Unable to load settings from Firebase."
        );

    }

}


// ==========================================================
// SAVE SETTINGS
// ==========================================================

async function saveSettings() {

    if (settingsSaving) {

        return;

    }


    if (
        typeof db ===
        "undefined" ||
        !db
    ) {

        alert(
            "Firebase Database is not connected."
        );

        return;

    }


    settingsSaving =
        true;


    const button =
        document.getElementById(
            "btnSaveSettings"
        );


    const originalText =
        button
            ? button.innerHTML
            : "";


    try {

        if (button) {

            button.disabled =
                true;


            button.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        }


        // --------------------------------------------------
        // READ FORM
        // --------------------------------------------------

        const formSettings =
            readSettingsFromForm();


        // --------------------------------------------------
        // MERGE
        // --------------------------------------------------

        pappritoSettings =
            mergeSettings(
                DEFAULT_SETTINGS,
                formSettings
            );


        // --------------------------------------------------
        // META
        // --------------------------------------------------

        pappritoSettings.meta =
            pappritoSettings.meta || {};


        pappritoSettings.meta.version =
            "1.0.0";


        pappritoSettings.meta.updatedAt =
            firebase.database.ServerValue.TIMESTAMP;


        // --------------------------------------------------
        // SAVE
        // --------------------------------------------------

        await db
            .ref(
                PAPPRITO_SETTINGS_PATH
            )
            .update(
                pappritoSettings
            );


        console.log(
            "PAPPRITO settings saved."
        );


        // --------------------------------------------------
        // STATUS
        // --------------------------------------------------

        const status =
            document.getElementById(
                "settingsSaveStatus"
            );


        if (status) {

            status.textContent =
                "Saved";

            status.className =
                "badge bg-success";

        }


        updateLastSaved();


        // --------------------------------------------------
        // APPLY GLOBAL SETTINGS
        // --------------------------------------------------

        applyGlobalSettings();


        alert(
            "Settings saved successfully."
        );

    }

    catch (error) {

        console.error(
            "SETTINGS SAVE ERROR:",
            error
        );


        alert(
            "Unable to save settings.\n\n" +
            error.message
        );

    }

    finally {

        settingsSaving =
            false;


        if (button) {

            button.disabled =
                false;


            button.innerHTML =
                originalText;
        }

    }

}


// ==========================================================
// READ FORM
// ==========================================================

function readSettingsFromForm() {

    const settings =
        deepClone(
            DEFAULT_SETTINGS
        );


    // ======================================================
    // GENERAL
    // ======================================================

    settings.general.businessName =
        getValue(
            "businessName",
            settings.general.businessName
        );


    settings.general.businessDescription =
        getValue(
            "businessDescription",
            settings.general.businessDescription
        );


    settings.general.currency =
        getValue(
            "currency",
            settings.general.currency
        );


    settings.general.currencySymbol =
        getValue(
            "currencySymbol",
            settings.general.currencySymbol
        );


    settings.general.timezone =
        getValue(
            "timezone",
            settings.general.timezone
        );


    settings.general.dateFormat =
        getValue(
            "dateFormat",
            settings.general.dateFormat
        );


    settings.general.timeFormat =
        getValue(
            "timeFormat",
            settings.general.timeFormat
        );


    settings.general.language =
        getValue(
            "language",
            settings.general.language
        );


    settings.general.theme =
        getValue(
            "theme",
            settings.general.theme
        );


    // ======================================================
    // PRODUCT
    // ======================================================

    settings.product.allowNegativeStock =
        getChecked(
            "allowNegativeStock",
            settings.product.allowNegativeStock
        );


    settings.product.allowDuplicateCode =
        getChecked(
            "allowDuplicateCode",
            settings.product.allowDuplicateCode
        );


    settings.product.requireCategory =
        getChecked(
            "requireCategory",
            settings.product.requireCategory
        );


    settings.product.defaultStatus =
        getValue(
            "defaultProductStatus",
            settings.product.defaultStatus
        );


    settings.product.defaultReorderLevel =
        getNumber(
            "defaultReorderLevel",
            settings.product.defaultReorderLevel
        );


    settings.product.maxImageSize =
        getNumber(
            "maxProductImageSize",
            settings.product.maxImageSize
        );


    // ======================================================
    // POS
    // ======================================================

    settings.pos.enablePOS =
        getChecked(
            "enablePOS",
            settings.pos.enablePOS
        );


    settings.pos.allowDiscount =
        getChecked(
            "allowDiscount",
            settings.pos.allowDiscount
        );


    settings.pos.allowVoid =
        getChecked(
            "allowVoid",
            settings.pos.allowVoid
        );


    settings.pos.allowRefund =
        getChecked(
            "allowRefund",
            settings.pos.allowRefund
        );


    settings.pos.requireCustomer =
        getChecked(
            "requireCustomer",
            settings.pos.requireCustomer
        );


    settings.pos.autoPrintReceipt =
        getChecked(
            "autoPrintReceipt",
            settings.pos.autoPrintReceipt
        );


    settings.pos.showProductImages =
        getChecked(
            "posShowProductImages",
            settings.pos.showProductImages
        );


    settings.pos.showProductCode =
        getChecked(
            "posShowProductCode",
            settings.pos.showProductCode
        );


    settings.pos.showStock =
        getChecked(
            "posShowStock",
            settings.pos.showStock
        );


    settings.pos.taxEnabled =
        getChecked(
            "taxEnabled",
            settings.pos.taxEnabled
        );


    settings.pos.taxRate =
        getNumber(
            "taxRate",
            settings.pos.taxRate
        );


    // ======================================================
    // ONLINE MENU
    // ======================================================

    settings.onlineMenu.enabled =
        getChecked(
            "onlineMenuEnabled",
            settings.onlineMenu.enabled
        );


    settings.onlineMenu.showProductImages =
        getChecked(
            "menuShowProductImages",
            settings.onlineMenu.showProductImages
        );


    settings.onlineMenu.showDescription =
        getChecked(
            "menuShowDescription",
            settings.onlineMenu.showDescription
        );


    settings.onlineMenu.showPrice =
        getChecked(
            "menuShowPrice",
            settings.onlineMenu.showPrice
        );


    settings.onlineMenu.showUnavailable =
        getChecked(
            "menuShowUnavailable",
            settings.onlineMenu.showUnavailable
        );


    settings.onlineMenu.allowOnlineOrder =
        getChecked(
            "allowOnlineOrder",
            settings.onlineMenu.allowOnlineOrder
        );


    settings.onlineMenu.allowReservation =
        getChecked(
            "allowReservation",
            settings.onlineMenu.allowReservation
        );


    settings.onlineMenu.showBestSeller =
        getChecked(
            "menuShowBestSeller",
            settings.onlineMenu.showBestSeller
        );


    settings.onlineMenu.showCategories =
        getChecked(
            "menuShowCategories",
            settings.onlineMenu.showCategories
        );


    // ======================================================
    // INVENTORY
    // ======================================================

    settings.inventory.enabled =
        getChecked(
            "inventoryEnabled",
            settings.inventory.enabled
        );


    settings.inventory.tracking =
        getChecked(
            "inventoryTracking",
            settings.inventory.tracking
        );


    settings.inventory.allowStockAdjustment =
        getChecked(
            "allowStockAdjustment",
            settings.inventory.allowStockAdjustment
        );


    settings.inventory.allowNegativeStock =
        getChecked(
            "inventoryAllowNegativeStock",
            settings.inventory.allowNegativeStock
        );


    settings.inventory.lowStockAlert =
        getChecked(
            "lowStockAlert",
            settings.inventory.lowStockAlert
        );


    settings.inventory.defaultReorderLevel =
        getNumber(
            "inventoryReorderLevel",
            settings.inventory.defaultReorderLevel
        );


    settings.inventory.autoDeductPOS =
        getChecked(
            "autoDeductPOS",
            settings.inventory.autoDeductPOS
        );


    settings.inventory.autoDeductProduction =
        getChecked(
            "autoDeductProduction",
            settings.inventory.autoDeductProduction
        );


    // ======================================================
    // KITCHEN
    // ======================================================

    settings.kitchen.enabled =
        getChecked(
            "kitchenEnabled",
            settings.kitchen.enabled
        );


    settings.kitchen.autoSendOrders =
        getChecked(
            "kitchenAutoSendOrders",
            settings.kitchen.autoSendOrders
        );


    settings.kitchen.showOrderNumber =
        getChecked(
            "kitchenShowOrderNumber",
            settings.kitchen.showOrderNumber
        );


    settings.kitchen.showTableNumber =
        getChecked(
            "kitchenShowTableNumber",
            settings.kitchen.showTableNumber
        );


    settings.kitchen.soundAlert =
        getChecked(
            "kitchenSoundAlert",
            settings.kitchen.soundAlert
        );


    settings.kitchen.autoRefresh =
        getChecked(
            "kitchenAutoRefresh",
            settings.kitchen.autoRefresh
        );


    settings.kitchen.refreshSeconds =
        getNumber(
            "kitchenRefreshSeconds",
            settings.kitchen.refreshSeconds
        );


    // ======================================================
    // RECEIPT
    // ======================================================

    settings.receipt.businessName =
        getValue(
            "receiptBusinessName",
            settings.receipt.businessName
        );


    settings.receipt.address =
        getValue(
            "receiptAddress",
            settings.receipt.address
        );


    settings.receipt.phone =
        getValue(
            "receiptPhone",
            settings.receipt.phone
        );


    settings.receipt.footer =
        getValue(
            "receiptFooter",
            settings.receipt.footer
        );


    settings.receipt.paperSize =
        getValue(
            "receiptPaperSize",
            settings.receipt.paperSize
        );


    settings.receipt.showLogo =
        getChecked(
            "receiptShowLogo",
            settings.receipt.showLogo
        );


    settings.receipt.showAddress =
        getChecked(
            "receiptShowAddress",
            settings.receipt.showAddress
        );


    settings.receipt.showPhone =
        getChecked(
            "receiptShowPhone",
            settings.receipt.showPhone
        );


    settings.receipt.showCashier =
        getChecked(
            "receiptShowCashier",
            settings.receipt.showCashier
        );


    settings.receipt.showDate =
        getChecked(
            "receiptShowDate",
            settings.receipt.showDate
        );


    settings.receipt.showOrderNumber =
        getChecked(
            "receiptShowOrderNumber",
            settings.receipt.showOrderNumber
        );


    // ======================================================
    // USERS
    // ======================================================

    settings.users.requireLogin =
        getChecked(
            "requireLogin",
            settings.users.requireLogin
        );


    settings.users.allowCashier =
        getChecked(
            "allowCashier",
            settings.users.allowCashier
        );


    settings.users.allowManager =
        getChecked(
            "allowManager",
            settings.users.allowManager
        );


    settings.users.allowAdmin =
        getChecked(
            "allowAdmin",
            settings.users.allowAdmin
        );


    // ======================================================
    // SYSTEM
    // ======================================================

    settings.system.maintenanceMode =
        getChecked(
            "maintenanceMode",
            settings.system.maintenanceMode
        );


    settings.system.debugMode =
        getChecked(
            "debugMode",
            settings.system.debugMode
        );


    settings.system.autoBackup =
        getChecked(
            "autoBackup",
            settings.system.autoBackup
        );


    settings.system.enableNotifications =
        getChecked(
            "enableNotifications",
            settings.system.enableNotifications
        );


    settings.system.enableSound =
        getChecked(
            "enableSound",
            settings.system.enableSound
        );


    return settings;

}


// ==========================================================
// APPLY SETTINGS TO FORM
// ==========================================================

function applySettingsToForm() {

    const s =
        pappritoSettings;


    // ======================================================
    // GENERAL
    // ======================================================

    setValue(
        "businessName",
        s.general.businessName
    );


    setValue(
        "businessDescription",
        s.general.businessDescription
    );


    setValue(
        "currency",
        s.general.currency
    );


    setValue(
        "currencySymbol",
        s.general.currencySymbol
    );


    setValue(
        "timezone",
        s.general.timezone
    );


    setValue(
        "dateFormat",
        s.general.dateFormat
    );


    setValue(
        "timeFormat",
        s.general.timeFormat
    );


    setValue(
        "language",
        s.general.language
    );


    setValue(
        "theme",
        s.general.theme
    );


    // ======================================================
    // PRODUCT
    // ======================================================

    setChecked(
        "allowNegativeStock",
        s.product.allowNegativeStock
    );


    setChecked(
        "allowDuplicateCode",
        s.product.allowDuplicateCode
    );


    setChecked(
        "requireCategory",
        s.product.requireCategory
    );


    setValue(
        "defaultProductStatus",
        s.product.defaultStatus
    );


    setValue(
        "defaultReorderLevel",
        s.product.defaultReorderLevel
    );


    setValue(
        "maxProductImageSize",
        s.product.maxImageSize
    );


    // ======================================================
    // POS
    // ======================================================

    setChecked(
        "enablePOS",
        s.pos.enablePOS
    );


    setChecked(
        "allowDiscount",
        s.pos.allowDiscount
    );


    setChecked(
        "allowVoid",
        s.pos.allowVoid
    );


    setChecked(
        "allowRefund",
        s.pos.allowRefund
    );


    setChecked(
        "requireCustomer",
        s.pos.requireCustomer
    );


    setChecked(
        "autoPrintReceipt",
        s.pos.autoPrintReceipt
    );


    setChecked(
        "posShowProductImages",
        s.pos.showProductImages
    );


    setChecked(
        "posShowProductCode",
        s.pos.showProductCode
    );


    setChecked(
        "posShowStock",
        s.pos.showStock
    );


    setChecked(
        "taxEnabled",
        s.pos.taxEnabled
    );


    setValue(
        "taxRate",
        s.pos.taxRate
    );


    // ======================================================
    // ONLINE MENU
    // ======================================================

    setChecked(
        "onlineMenuEnabled",
        s.onlineMenu.enabled
    );


    setChecked(
        "menuShowProductImages",
        s.onlineMenu.showProductImages
    );


    setChecked(
        "menuShowDescription",
        s.onlineMenu.showDescription
    );


    setChecked(
        "menuShowPrice",
        s.onlineMenu.showPrice
    );


    setChecked(
        "menuShowUnavailable",
        s.onlineMenu.showUnavailable
    );


    setChecked(
        "allowOnlineOrder",
        s.onlineMenu.allowOnlineOrder
    );


    setChecked(
        "allowReservation",
        s.onlineMenu.allowReservation
    );


    setChecked(
        "menuShowBestSeller",
        s.onlineMenu.showBestSeller
    );


    setChecked(
        "menuShowCategories",
        s.onlineMenu.showCategories
    );


    // ======================================================
    // INVENTORY
    // ======================================================

    setChecked(
        "inventoryEnabled",
        s.inventory.enabled
    );


    setChecked(
        "inventoryTracking",
        s.inventory.tracking
    );


    setChecked(
        "allowStockAdjustment",
        s.inventory.allowStockAdjustment
    );


    setChecked(
        "inventoryAllowNegativeStock",
        s.inventory.allowNegativeStock
    );


    setChecked(
        "lowStockAlert",
        s.inventory.lowStockAlert
    );


    setValue(
        "inventoryReorderLevel",
        s.inventory.defaultReorderLevel
    );


    setChecked(
        "autoDeductPOS",
        s.inventory.autoDeductPOS
    );


    setChecked(
        "autoDeductProduction",
        s.inventory.autoDeductProduction
    );


    // ======================================================
    // KITCHEN
    // ======================================================

    setChecked(
        "kitchenEnabled",
        s.kitchen.enabled
    );


    setChecked(
        "kitchenAutoSendOrders",
        s.kitchen.autoSendOrders
    );


    setChecked(
        "kitchenShowOrderNumber",
        s.kitchen.showOrderNumber
    );


    setChecked(
        "kitchenShowTableNumber",
        s.kitchen.showTableNumber
    );


    setChecked(
        "kitchenSoundAlert",
        s.kitchen.soundAlert
    );


    setChecked(
        "kitchenAutoRefresh",
        s.kitchen.autoRefresh
    );


    setValue(
        "kitchenRefreshSeconds",
        s.kitchen.refreshSeconds
    );


    // ======================================================
    // RECEIPT
    // ======================================================

    setValue(
        "receiptBusinessName",
        s.receipt.businessName
    );


    setValue(
        "receiptAddress",
        s.receipt.address
    );


    setValue(
        "receiptPhone",
        s.receipt.phone
    );


    setValue(
        "receiptFooter",
        s.receipt.footer
    );


    setValue(
        "receiptPaperSize",
        s.receipt.paperSize
    );


    setChecked(
        "receiptShowLogo",
        s.receipt.showLogo
    );


    setChecked(
        "receiptShowAddress",
        s.receipt.showAddress
    );


    setChecked(
        "receiptShowPhone",
        s.receipt.showPhone
    );


    setChecked(
        "receiptShowCashier",
        s.receipt.showCashier
    );


    setChecked(
        "receiptShowDate",
        s.receipt.showDate
    );


    setChecked(
        "receiptShowOrderNumber",
        s.receipt.showOrderNumber
    );


    // ======================================================
    // USERS
    // ======================================================

    setChecked(
        "requireLogin",
        s.users.requireLogin
    );


    setChecked(
        "allowCashier",
        s.users.allowCashier
    );


    setChecked(
        "allowManager",
        s.users.allowManager
    );


    setChecked(
        "allowAdmin",
        s.users.allowAdmin
    );


    // ======================================================
    // SYSTEM
    // ======================================================

    setChecked(
        "maintenanceMode",
        s.system.maintenanceMode
    );


    setChecked(
        "debugMode",
        s.system.debugMode
    );


    setChecked(
        "autoBackup",
        s.system.autoBackup
    );


    setChecked(
        "enableNotifications",
        s.system.enableNotifications
    );


    setChecked(
        "enableSound",
        s.system.enableSound
    );


    // ======================================================
    // APPLY GLOBAL
    // ======================================================

    applyGlobalSettings();

}


// ==========================================================
// APPLY GLOBAL SETTINGS
// ==========================================================

function applyGlobalSettings() {

    if (!pappritoSettings) {

        return;

    }


    const general =
        pappritoSettings.general || {};


    // ------------------------------------------------------
    // BUSINESS NAME
    // ------------------------------------------------------

    document
        .querySelectorAll(
            "[data-business-name]"
        )
        .forEach(
            function (element) {

                element.textContent =
                    general.businessName ||
                    "PAPPRITO";

            }
        );


    // ------------------------------------------------------
    // CURRENCY
    // ------------------------------------------------------

    window.PAPPRITO_CURRENCY =
        general.currency ||
        "PHP";


    window.PAPPRITO_CURRENCY_SYMBOL =
        general.currencySymbol ||
        "₱";


    // ------------------------------------------------------
    // THEME
    // ------------------------------------------------------

    if (
        general.theme ===
        "dark"
    ) {

        document.body
            .setAttribute(
                "data-theme",
                "dark"
            );

    }

    else {

        document.body
            .setAttribute(
                "data-theme",
                "light"
            );

    }

}


// ==========================================================
// RESET SETTINGS
// ==========================================================

async function resetSettings() {

    const confirmed =
        confirm(
            "Reset all PAPPRITO ERP settings to default?\n\n" +
            "Your Products, Categories, Orders and Sales will NOT be deleted."
        );


    if (!confirmed) {

        return;

    }


    pappritoSettings =
        deepClone(
            DEFAULT_SETTINGS
        );


    applySettingsToForm();


    if (
        typeof db ===
        "undefined" ||
        !db
    ) {

        alert(
            "Settings reset locally. Firebase is not connected."
        );

        return;

    }


    try {

        await db
            .ref(
                PAPPRITO_SETTINGS_PATH
            )
            .set(
                pappritoSettings
            );


        alert(
            "Settings have been reset successfully."
        );


        const status =
            document.getElementById(
                "settingsSaveStatus"
            );


        if (status) {

            status.textContent =
                "Reset";

            status.className =
                "badge bg-success";

        }


        updateLastSaved();

    }

    catch (error) {

        console.error(
            "RESET SETTINGS ERROR:",
            error
        );


        alert(
            "Unable to reset settings.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// UPDATE LAST SAVED
// ==========================================================

function updateLastSaved() {

    const element =
        document.getElementById(
            "settingsLastSaved"
        );


    if (!element) {

        return;

    }


    const timestamp =
        pappritoSettings
            ?.meta
            ?.updatedAt;


    if (
        typeof timestamp ===
        "number"
    ) {

        element.textContent =
            new Date(
                timestamp
            ).toLocaleString();

    }

    else {

        element.textContent =
            "Not saved yet";

    }

}


// ==========================================================
// GET VALUE
// ==========================================================

function getValue(
    id,
    fallback = ""
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return fallback;

    }


    return element.value !==
        undefined
        ? element.value
        : fallback;

}


// ==========================================================
// GET NUMBER
// ==========================================================

function getNumber(
    id,
    fallback = 0
) {

    const value =
        getValue(
            id,
            fallback
        );


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : fallback;

}


// ==========================================================
// GET CHECKED
// ==========================================================

function getChecked(
    id,
    fallback = false
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return fallback;

    }


    return Boolean(
        element.checked
    );

}


// ==========================================================
// SET VALUE
// ==========================================================

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.value =
        value !== undefined &&
        value !== null
            ? value
            : "";

}


// ==========================================================
// SET CHECKED
// ==========================================================

function setChecked(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.checked =
        Boolean(
            value
        );

}


// ==========================================================
// DEEP CLONE
// ==========================================================

function deepClone(
    object
) {

    return JSON.parse(
        JSON.stringify(
            object
        )
    );

}


// ==========================================================
// MERGE SETTINGS
// ==========================================================

function mergeSettings(
    defaults,
    saved
) {

    const result =
        deepClone(
            defaults
        );


    if (
        !saved ||
        typeof saved !==
        "object"
    ) {

        return result;

    }


    Object.keys(
        saved
    ).forEach(
        function (key) {

            if (
                saved[key] &&
                typeof saved[key] ===
                "object" &&
                !Array.isArray(
                    saved[key]
                ) &&
                result[key] &&
                typeof result[key] ===
                "object"
            ) {

                result[key] =
                    mergeSettings(
                        result[key],
                        saved[key]
                    );

            }

            else {

                result[key] =
                    saved[key];

            }

        }
    );


    return result;

}


// ==========================================================
// ERROR MESSAGE
// ==========================================================

function showSettingsError(
    message
) {

    const status =
        document.getElementById(
            "settingsSaveStatus"
        );


    if (!status) {

        return;

    }


    status.textContent =
        message;


    status.className =
        "badge bg-danger";

}


// ==========================================================
// PUBLIC API
// ==========================================================

window.PAPPRITO_SETTINGS =
    {

        get: function () {

            return pappritoSettings;

        },


        reload: function () {

            return loadSettings();

        },


        save: function () {

            return saveSettings();

        },


        reset: function () {

            return resetSettings();

        },


        activate: function (
            section
        ) {

            activateSettingsSection(
                section
            );

        }

    };


// ==========================================================
// AUTO INITIALIZE
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSettings
    );

}

else {

    initializeSettings();

}
