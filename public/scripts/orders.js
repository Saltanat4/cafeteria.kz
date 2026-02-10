document.addEventListener('DOMContentLoaded', () => {
    fetchMyOrders();
});

const token = localStorage.getItem('token');
const container = document.getElementById('user-orders-container');

async function fetchMyOrders() {


    if (!token) {
        container.innerHTML = '<p>Please <a href="/auth">login</a> to see your orders.</p>';
        return;
    }

    try {
        const res = await fetch('api/orders/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 401) {
                container.innerHTML = '<p>Session expired. Please login again.</p>';
                return;
            }
            throw new Error('Failed to fetch orders');
        }

        const orders = await res.json();

        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-msg">You haven\'t placed any orders yet. <a href="/">Go to menu</a></p>';
            return;
        }

        renderOrders(orders, container);
    } catch (err) {
        console.error("Orders error:", err);
        container.innerHTML = '<p class="error-msg">Error loading order history. Please try again later.</p>';
    }
}

function renderOrders(orders, container) {
    container.innerHTML = orders.map(order => {
        const items = Array.isArray(order.items) ? order.items : [];

        const isDelivery = order.order_type === 'delivery';
        const address = (order.delivery_address || '').trim();
        const notes = (order.notes || '').trim();

        const cancellableStatuses = ['pending', 'preparing', 'ready'];
        const canCancel = cancellableStatuses.includes(String(order.status || '').toLowerCase());

        return `
        <div class="order-card">
            <div class="order-header">
            <h3>Order #${String(order._id).slice(-5)}</h3>
            <span class="status-badge ${order.status}">
                ${String(order.status || '').toUpperCase()}
            </span>
            </div>

            <div class="order-info">
            <p><strong>Type:</strong> ${isDelivery ? '🚗 Delivery' : '🥡 Pickup'}</p>

            ${isDelivery ? `
                <p><strong>Address:</strong> ${address ? address : '<em>Not provided</em>'}</p>
            ` : ''}

            ${notes ? `
                <p><strong>Notes:</strong> ${notes}</p>
            ` : ''}

            <p><strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</p>
            </div>

            <div class="order-items">
            ${items.length ? items.map(item => `
                <div class="item-row">
                <span>${item.product_name} x${item.quantity}</span>
                <span>${item.subtotal} ₸</span>
                </div>
            `).join('') : `<p class="empty-msg">No items</p>`}
            </div>

            <div class="order-footer">
            <div class="total">Total: ${order.total_amount} ₸</div>

            ${canCancel ? `
                <button class="btn-cancel" data-order-id="${order._id}" type="button">
                    Cancel order
                </button>
            ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-cancel');
    if (!btn) return;

    const orderId = btn.dataset.orderId;
    console.log(orderId)
    const ok = confirm('Are you sure you want to cancel this order?');
    if (!ok) return;

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = 'Cancelling...';

    try {
        const res = await fetch(`api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to cancel');

        const card = btn.closest('.order-card');
        const statusBadge = card.querySelector('.status-badge');

        statusBadge.className = `status-badge ${data.status}`;
        statusBadge.textContent = String(data.status).toUpperCase();

        btn.remove();
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
        btn.textContent = oldText || 'Cancel order';
    }
});
