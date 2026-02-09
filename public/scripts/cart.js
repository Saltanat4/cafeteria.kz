document.addEventListener('DOMContentLoaded', () => {
    fetchCartItems();
});

async function fetchCartItems() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth';
        return;
    }

    try {
        const response = await fetch('/cart/list', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const items = await response.json();
            renderCart(items);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function renderCart(items) {
    const cartContainer = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('total-amount');
    const subtotalElement = document.getElementById('subtotal-amount');
    
    if (!cartContainer || !totalElement) return;

    if (!items || items.length === 0) {
        cartContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        totalElement.innerText = "0 ₸";
        if (subtotalElement) subtotalElement.innerText = "0 ₸";
        return;
    }

    let grandTotal = 0;
    cartContainer.innerHTML = items.map(item => {
        if (!item.product) return ''; 
        const itemTotal = item.product.price * item.quantity;
        grandTotal += itemTotal;

        return `
            <div class="cart-item">
                <img src="${item.product.image_url}" alt="${item.product.name}">
                <div class="item-info">
                    <h4>${item.product.name}</h4>
                    <p>${item.product.price} ₸</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item._id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item._id}', ${item.quantity + 1})">+</button>
                </div>
                <p class="item-total">${itemTotal} ₸</p>
                <button class="delete-btn" onclick="removeItem('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
    }).join('');

    totalElement.innerText = `${grandTotal} ₸`;
    if (subtotalElement) subtotalElement.innerText = `${grandTotal} ₸`;
}

async function removeItem(itemId) {
    if (!confirm("Remove this item?")) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) fetchCartItems();
}

async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`/cart/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
    });
    if (response.ok) fetchCartItems();
}

async function clearCart() {
    if (!confirm("Clear your cart?")) return;
    const token = localStorage.getItem('token');
    const response = await fetch('/cart/', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) fetchCartItems();
}

async function placeOrder() {
    const token = localStorage.getItem('token');
    const orderType = document.getElementById('order-type').value;
    const notes = document.getElementById('order-notes').value;

    try {
const res = await fetch('/orders', { 
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
        order_type: orderType, 
        notes: notes 
    })
});

        if (res.ok) {
            alert("Order placed successfully!");
            window.location.href = '/orders'; 
        } else {
            const err = await res.json();
            alert(err.message || "Failed to place order");
        }
    } catch (err) {
        console.error("Checkout error:", err);
    }
}