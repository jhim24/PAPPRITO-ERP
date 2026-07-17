/* ==========================================================
   PAPPRITO ERP
   POS v2
   File : assets/js/pos/pos-payment.js
   Description : Payment Module
========================================================== */

/* ==========================================================
   INITIALIZE PAYMENT
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializePayment();

});

/* ==========================================================
   PAYMENT EVENTS
========================================================== */

function initializePayment() {

    // Discount

    const discount = document.getElementById("discount");

    if (discount) {

        discount.addEventListener("input", () => {

            computeGrandTotal();

            computeChange();

        });

    }

   // Discount Type

const discountType = document.getElementById("discountType");

if (discountType) {

    discountType.addEventListener("change", () => {

        computeGrandTotal();

        computeChange();

    });

}

    // Cash

    const cash = document.getElementById("cashTendered");

    if (cash) {

        cash.addEventListener("input", () => {

            computeChange();

        });

    }

}

/* ==========================================================
   COMPUTE CHANGE
========================================================== */

function computeChange() {

    const grandTotalText =
        document.getElementById("grandTotal")
        .textContent
        .replace("₱", "")
        .replace(/,/g, "");

    const grandTotal =
        Number(grandTotalText || 0);

    const cash =
        Number(
            document.getElementById("cashTendered").value || 0
        );

    const change =
        cash - grandTotal;

    document.getElementById("change").innerHTML =

        "₱" +

        (change > 0 ? change : 0)

        .toFixed(2);

}

/* ==========================================================
   CLEAR CART
========================================================== */

document

.getElementById("btnClear")

?.addEventListener("click", () => {

    if (!confirm("Clear current order?")) return;

    cart = [];

    renderCart();

    document.getElementById("discount").value = 0;

    document.getElementById("cashTendered").value = "";

    document.getElementById("change").innerHTML = "₱0.00";

});

/* ==========================================================
   CHECKOUT
========================================================== */

document

.getElementById("btnCheckout")

?.addEventListener("click", () => {

    if (cart.length === 0) {

        alert("Cart is empty.");

        return;

    }

    alert("Checkout module will be connected to Firebase in STEP 7.");

});

/* ==========================================================
   PRINT
========================================================== */

document

.getElementById("btnPrint")

?.addEventListener("click", () => {

    alert("Print module will be added in STEP 8.");

});
