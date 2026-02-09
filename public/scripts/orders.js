document.addEventListener('DOMContentLoaded', () => {
    fetchMyOrders();
});

async function fetchMyOrders() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('user-orders-container');

    if (!token) {
        container.innerHTML = '<p>Please <a href="/auth">login</a> to see your orders.</p>';
        return;
    }

    try {
        const res = await fetch('/orders/list', {
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
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order._id.slice(-5)}</h3>
                <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            
            <div class="order-info">
                <p><strong>Type:</strong> ${order.order_type === 'delivery' ? '🚗 Delivery' : '🥡 Pickup'}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div class="order-items">
                ${order.items.map(item => `
                    <div class="item-row">
                        <span>${item.product_name} x${item.quantity}</span>
                        <span>${item.subtotal} ₸</span>
                    </div>
                `).join('')}
            </div>

            <div class="order-footer">
                <div class="total">Total: ${order.total_amount} ₸</div>
            </div>
        </div>
    `).join('');
}