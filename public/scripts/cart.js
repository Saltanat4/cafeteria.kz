const cartContainer = document.getElementById('cart-items-container');

async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch('/cart/list', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const items = await res.json();
    renderCart(items);
}

function renderCart(items) {
    let subtotal = 0;
    if (items.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cartContainer.innerHTML = items.map(item => {
        const lineTotal = item.productId.price * item.quantity;
        subtotal += lineTotal;
        return `
        <div class="cart-item-card">
            <img src="${item.productId.image_url}" alt="Product">
            <div class="item-details">
                <h3>${item.productId.name}</h3>
                <p class="unit-price">${item.productId.price} ₸</p>
            </div>
            <div class="quantity-picker">
                <span>Qty: ${item.quantity}</span>
            </div>
            <div class="item-subtotal">${lineTotal} ₸</div>
        </div>`;
    }).join('');

    document.getElementById('subtotal-amount').innerText = `${subtotal} ₸`;
    document.getElementById('total-amount').innerText = `${subtotal} ₸`;
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        alert("Order placed! Head to 'My Orders' to track it.");
        window.location.href = '/orders.html';
    }
});

document.addEventListener('DOMContentLoaded', loadCart);