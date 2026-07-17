/* ==========================================================
   PAPPRITO ERP
   POS v2
   File : assets/js/pos/pos-cart.js
   Description : Shopping Cart Module
========================================================== */

let cart = [];

/* ==========================================================
   ADD TO CART
========================================================== */

function addToCart(product) {

    const existing = cart.find(item => item.id === product.id);

    if (existing) {

        existing.qty++;

    } else {

        cart.push({

            sr: cart.length + 1,

            id: product.id,

            name: product.name,

            qty: 1,

            price: Number(product.sellingPrice || 0)

        });

    }

    renderCart();

}

/* ==========================================================
   RENDER CART
========================================================== */

function renderCart() {

    const tbody = document.getElementById("cartItems");

    tbody.innerHTML = "";

    let subtotal = 0;

    cart.forEach((item, index) => {

        item.sr = index + 1;

        const total = item.qty * item.price;

        subtotal += total;

        tbody.innerHTML += `

        <tr>

            <td align="center">${item.sr}</td>

            <td>${item.name}</td>

            <td align="center">

                <button onclick="decreaseQty('${item.id}')">−</button>

                <strong style="margin:0 8px">

                    ${item.qty}

                </strong>

                <button onclick="increaseQty('${item.id}')">+</button>

            </td>

            <td align="right">

                ₱${item.price.toFixed(2)}

            </td>

            <td align="right">

                ₱${total.toFixed(2)}

            </td>

        </tr>

        `;

    });

    document.getElementById("subTotal").innerHTML =
        "₱" + subtotal.toFixed(2);

    computeGrandTotal();

}

/* ==========================================================
   INCREASE
========================================================== */

function increaseQty(id) {

    const item = cart.find(x => x.id === id);

    if (!item) return;

    item.qty++;

    renderCart();

}

/* ==========================================================
   DECREASE
========================================================== */

function decreaseQty(id) {

    const item = cart.find(x => x.id === id);

    if (!item) return;

    item.qty--;

    if (item.qty <= 0) {

        cart = cart.filter(x => x.id !== id);

    }

    renderCart();

}

/* ==========================================================
   COMPUTE GRAND TOTAL
========================================================== */

function computeGrandTotal() {

    let subtotal = 0;

    cart.forEach(item => {

        subtotal += item.qty * item.price;

    });

    const discountValue =
        Number(document.getElementById("discount").value || 0);

    const discountType =
        document.querySelector(
            "input[name='discountType']:checked"
        ).value;

    let discount = 0;

    if (discountType === "peso") {

        discount = discountValue;

    } else {

        discount = subtotal * (discountValue / 100);

    }

    if (discount > subtotal) {

        discount = subtotal;

    }

    const grandTotal = subtotal - discount;

    document.getElementById("grandTotal").innerHTML =
        "₱" + grandTotal.toFixed(2);

}
