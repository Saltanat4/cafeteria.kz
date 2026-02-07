async function fetchAdminOrders() {
    const token = localStorage.getItem('token');
    const res = await fetch('/orders/list', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await res.json();
    const tbody = document.getElementById('admin-orders-body');

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order._id.slice(-5)}</td>
            <td>${order.user.username}</td>
            <td>${order.items.map(i => i.productId.name).join(', ')}</td>
            <td>${order.totalAmount} ₸</td>
            <td>
                <select onchange="updateOrderStatus('${order._id}', this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(id, newStatus) {
    const token = localStorage.getItem('token');
    await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    });
}

document.getElementById('btn-products').addEventListener('click', () => {
    document.getElementById('section-products').classList.remove('hidden');
    document.getElementById('section-orders').classList.add('hidden');
});

document.getElementById('btn-orders').addEventListener('click', () => {
    document.getElementById('section-orders').classList.remove('hidden');
    document.getElementById('section-products').classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', fetchAdminOrders);