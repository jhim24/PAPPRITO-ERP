/* ==========================================================
   PAPPRITO ERP
   Enterprise POS v2
   File : assets/js/pos/pos-cart.js
   Description : Shopping Cart
========================================================== */

/* ==========================================================
   ADD TO CART
========================================================== */

function addToCart(product) {

    const existing = cart.find(item => item.id === product.id);

    if (existing) {

        existing.qty++;

    } else {

        cart.push({

            id: product.id,
            name: product.name,
            price: Number(product.sellingPrice || 0),
            image: product.image || "",
            qty: 1

        });

    }

    renderCart();

}

/* ==========================================================
   RENDER CART
========================================================== */

function renderCart() {

    const container = document.getElementById("cartItems");

    const totalElement = document.getElementById("cartTotal");

    container.innerHTML = "";

    let grandTotal = 0;

    if (cart.length === 0) {

        container.innerHTML = "No Item";

        totalElement.innerHTML = "₱0.00";

        return;

    }

    cart.forEach(item => {

        const subtotal = item.price * item.qty;

        grandTotal += subtotal;

        const row = document.createElement("div");

        row.style.borderBottom = "1px solid #eee";
        row.style.padding = "10px 0";

        row.innerHTML = `

            <strong>${item.name}</strong>

            <br>

            ₱${item.price.toFixed(2)}

            <br><br>

            <button onclick="decreaseQty('${item.id}')">−</button>

            <strong style="padding:0 10px">${item.qty}</strong>

            <button onclick="increaseQty('${item.id}')">+</button>

            <button
                onclick="removeItem('${item.id}')"
                style="float:right;color:red">
                Remove
            </button>

        `;

        container.appendChild(row);

    });

    totalElement.innerHTML =
        "₱" + grandTotal.toLocaleString(undefined, {

            minimumFractionDigits: 2

        });

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
   REMOVE
========================================================== */

function removeItem(id) {

    cart = cart.filter(item => item.id !== id);

    renderCart();

}
