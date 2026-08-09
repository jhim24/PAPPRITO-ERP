// ==========================================================
// PAPPRITO ERP
// SETTINGS SAVE ENGINE
// File: assets/js/settings/settings-save.js
// ==========================================================

"use strict";

async function savePAPPRITOSettings() {

    const button =
        document.getElementById("btnSaveSettings");

    const buttonText =
        document.getElementById("btnSaveSettingsText");

    if (
        typeof db === "undefined" ||
        !db
    ) {
        alert("Firebase Database is not initialized.");
        return;
    }

    try {

        if (button) {
            button.disabled = true;
        }

        if (buttonText) {
            buttonText.textContent = "Saving...";
        }

        // ==================================================
        // COLLECT SETTINGS
        // ==================================================

        const settings = {

            general: {

                businessName:
                    getSettingValue("businessName", "PAPPRITO"),

                businessDescription:
                    getSettingValue(
                        "businessDescription",
                        "PAPPRITO Restaurant"
                    ),

                currency:
                    getSettingValue(
                        "currency",
                        "PHP"
                    ),

                currencySymbol:
                    getSettingValue(
                        "currencySymbol",
                        "₱"
                    ),

                timezone:
                    getSettingValue(
                        "timezone",
                        "Asia/Manila"
                    ),

                dateFormat:
                    getSettingValue(
                        "dateFormat",
                        "MM/DD/YYYY"
                    ),

                timeFormat:
                    getSettingValue(
                        "timeFormat",
                        "12"
                    ),

                language:
                    getSettingValue(
                        "language",
                        "en"
                    ),

                theme:
                    getSettingValue(
                        "theme",
                        "light"
                    )

            },


            product: {

                maxImageSize:
                    getSettingNumber(
                        "maxProductImageSize",
                        2
                    ),

                defaultReorderLevel:
                    getSettingNumber(
                        "defaultReorderLevel",
                        10
                    ),

                defaultStatus:
                    getSettingValue(
                        "defaultProductStatus",
                        "Active"
                    ),

                requireCategory:
                    getSettingChecked(
                        "requireCategory",
                        true
                    ),

                allowDuplicateCode:
                    getSettingChecked(
                        "allowDuplicateCode",
                        false
                    ),

                allowNegativeStock:
                    getSettingChecked(
                        "allowNegativeStock",
                        false
                    )

            },


            pos: {

                enablePOS:
                    getSettingChecked(
                        "enablePOS",
                        true
                    ),

                allowDiscount:
                    getSettingChecked(
                        "allowDiscount",
                        true
                    ),

                allowVoid:
                    getSettingChecked(
                        "allowVoid",
                        true
                    ),

                allowRefund:
                    getSettingChecked(
                        "allowRefund",
                        true
                    ),

                requireCustomer:
                    getSettingChecked(
                        "requireCustomer",
                        false
                    ),

                autoPrintReceipt:
                    getSettingChecked(
                        "autoPrintReceipt",
                        false
                    ),

                showProductImages:
                    getSettingChecked(
                        "posShowProductImages",
                        true
                    ),

                showProductCode:
                    getSettingChecked(
                        "posShowProductCode",
                        true
                    ),

                showStock:
                    getSettingChecked(
                        "posShowStock",
                        true
                    ),

                taxEnabled:
                    getSettingChecked(
                        "taxEnabled",
                        false
                    ),

                taxRate:
                    getSettingNumber(
                        "taxRate",
                        0
                    )

            },


            onlineMenu: {

                enabled:
                    getSettingChecked(
                        "onlineMenuEnabled",
                        true
                    ),

                showProductImages:
                    getSettingChecked(
                        "menuShowProductImages",
                        true
                    ),

                showDescription:
                    getSettingChecked(
                        "menuShowDescription",
                        true
                    ),

                showPrice:
                    getSettingChecked(
                        "menuShowPrice",
                        true
                    ),

                showUnavailable:
                    getSettingChecked(
                        "menuShowUnavailable",
                        false
                    ),

                allowOnlineOrder:
                    getSettingChecked(
                        "allowOnlineOrder",
                        true
                    ),

                allowReservation:
                    getSettingChecked(
                        "allowReservation",
                        true
                    ),

                showBestSeller:
                    getSettingChecked(
                        "menuShowBestSeller",
                        true
                    ),

                showCategories:
                    getSettingChecked(
                        "menuShowCategories",
                        true
                    )

            },


            inventory: {

                enabled:
                    getSettingChecked(
                        "inventoryEnabled",
                        true
                    ),

                tracking:
                    getSettingChecked(
                        "inventoryTracking",
                        true
                    ),

                allowStockAdjustment:
                    getSettingChecked(
                        "allowStockAdjustment",
                        true
                    ),

                allowNegativeStock:
                    getSettingChecked(
                        "inventoryAllowNegativeStock",
                        false
                    ),

                lowStockAlert:
                    getSettingChecked(
                        "lowStockAlert",
                        true
                    ),

                defaultReorderLevel:
                    getSettingNumber(
                        "inventoryReorderLevel",
                        10
                    ),

                autoDeductPOS:
                    getSettingChecked(
                        "autoDeductPOS",
                        true
                    ),

                autoDeductProduction:
                    getSettingChecked(
                        "autoDeductProduction",
                        true
                    )

            },


            kitchen: {

                enabled:
                    getSettingChecked(
                        "kitchenEnabled",
                        true
                    ),

                autoSendOrders:
                    getSettingChecked(
                        "kitchenAutoSendOrders",
                        true
                    ),

                showOrderNumber:
                    getSettingChecked(
                        "kitchenShowOrderNumber",
                        true
                    ),

                showTableNumber:
                    getSettingChecked(
                        "kitchenShowTableNumber",
                        true
                    ),

                soundAlert:
                    getSettingChecked(
                        "kitchenSoundAlert",
                        true
                    ),

                autoRefresh:
                    getSettingChecked(
                        "kitchenAutoRefresh",
                        true
                    ),

                refreshSeconds:
                    getSettingNumber(
                        "kitchenRefreshSeconds",
                        10
                    )

            },


            receipt: {

                businessName:
                    getSettingValue(
                        "receiptBusinessName",
                        "PAPPRITO"
                    ),

                address:
                    getSettingValue(
                        "receiptAddress",
                        ""
                    ),

                phone:
                    getSettingValue(
                        "receiptPhone",
                        ""
                    ),

                footer:
                    getSettingValue(
                        "receiptFooter",
                        "Thank you for dining with us!"
                    ),

                paperSize:
                    getSettingValue(
                        "receiptPaperSize",
                        "80mm"
                    ),

                showLogo:
                    getSettingChecked(
                        "receiptShowLogo",
                        true
                    ),

                showAddress:
                    getSettingChecked(
                        "receiptShowAddress",
                        true
                    ),

                showPhone:
                    getSettingChecked(
                        "receiptShowPhone",
                        true
                    ),

                showCashier:
                    getSettingChecked(
                        "receiptShowCashier",
                        true
                    ),

                showDate:
                    getSettingChecked(
                        "receiptShowDate",
                        true
                    ),

                showOrderNumber:
                    getSettingChecked(
                        "receiptShowOrderNumber",
                        true
                    )

            },


            users: {

                requireLogin:
                    getSettingChecked(
                        "requireLogin",
                        true
                    ),

                allowCashier:
                    getSettingChecked(
                        "allowCashier",
                        true
                    ),

                allowManager:
                    getSettingChecked(
                        "allowManager",
                        true
                    ),

                allowAdmin:
                    getSettingChecked(
                        "allowAdmin",
                        true
                    )

            },


            system: {

                maintenanceMode:
                    getSettingChecked(
                        "maintenanceMode",
                        false
                    ),

                debugMode:
                    getSettingChecked(
                        "debugMode",
                        false
                    ),

                autoBackup:
                    getSettingChecked(
                        "autoBackup",
                        false
                    ),

                enableNotifications:
                    getSettingChecked(
                        "enableNotifications",
                        true
                    ),

                enableSound:
                    getSettingChecked(
                        "enableSound",
                        true
                    )

            },

            updatedAt:
                firebase.database.ServerValue.TIMESTAMP

        };


        // ==================================================
        // FIREBASE SAVE
        // ==================================================

        console.log(
            "Saving PAPPRITO settings..."
        );


        await db
            .ref("settings")
            .set(settings);


        console.log(
            "PAPPRITO settings saved successfully."
        );


        // ==================================================
        // UI
        // ==================================================

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


        if (buttonText) {

            buttonText.textContent =
                "Saved";

        }


        alert(
            "Settings saved successfully."
        );


        setTimeout(
            function() {

                if (buttonText) {

                    buttonText.textContent =
                        "Save Settings";

                }

            },
            1500
        );


    }

    catch (error) {

        console.error(
            "PAPPRITO SETTINGS SAVE ERROR:",
            error
        );


        alert(
            "Settings could not be saved.\n\n" +
            error.message
        );


        const status =
            document.getElementById(
                "settingsSaveStatus"
            );


        if (status) {

            status.textContent =
                "Save Failed";

            status.className =
                "badge bg-danger";

        }

    }

    finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


// ==========================================================
// VALUE
// ==========================================================

function getSettingValue(
    id,
    fallback = ""
) {

    const element =
        document.getElementById(id);


    if (!element) {

        return fallback;

    }


    return element.value !== undefined
        ? element.value
        : fallback;

}


// ==========================================================
// NUMBER
// ==========================================================

function getSettingNumber(
    id,
    fallback = 0
) {

    const value =
        getSettingValue(
            id,
            fallback
        );


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : fallback;

}


// ==========================================================
// CHECKBOX
// ==========================================================

function getSettingChecked(
    id,
    fallback = false
) {

    const element =
        document.getElementById(id);


    if (!element) {

        return fallback;

    }


    return element.checked;

}


// ==========================================================
// CONNECT SAVE BUTTON
// ==========================================================

function initializeSettingsSave() {

    const button =
        document.getElementById(
            "btnSaveSettings"
        );


    if (!button) {

        console.warn(
            "btnSaveSettings not found."
        );

        return;

    }


    if (
        button.dataset.saveInitialized ===
        "true"
    ) {

        return;

    }


    button.dataset.saveInitialized =
        "true";


    button.addEventListener(
        "click",
        savePAPPRITOSettings
    );


    console.log(
        "Settings Save Engine initialized."
    );

}


// ==========================================================
// AUTO INIT
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSettingsSave
    );

}

else {

    initializeSettingsSave();

}


// ==========================================================
// GLOBAL
// ==========================================================

window.savePAPPRITOSettings =
    savePAPPRITOSettings;

window.initializeSettingsSave =
    initializeSettingsSave;
