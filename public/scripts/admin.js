document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
        alert("Access denied!");
        window.location.href = '/';
        return;
    }

    setupAdminNavigation();
    fetchAdminOrders(); 
});

const addProductForm = document.getElementById('add-product-form');
const cancelBtn = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none'; 
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.style.display = 'block';

    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    
    if (sectionId === 'section-orders') document.getElementById('btn-orders')?.classList.add('active');
    if (sectionId === 'section-products') document.getElementById('btn-products')?.classList.add('active');
}

function setupAdminNavigation() {
    document.getElementById('btn-orders')?.addEventListener('click', () => {
        showSection('section-orders');
        fetchAdminOrders();
    });

    document.getElementById('btn-products')?.addEventListener('click', () => {
        showSection('section-products');
        resetForm();
        fetchAdminProducts(); 
    });
}

function resetForm() {
    if (!addProductForm) return;
    addProductForm.reset();
    delete addProductForm.dataset.editId;
    
    const submitBtn = addProductForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = "Create Product";
        submitBtn.style.backgroundColor = "";
    }
    if (formTitle) formTitle.textContent = "Add New Product";
    if (cancelBtn) cancelBtn.style.display = 'none';
}

if (cancelBtn) cancelBtn.addEventListener('click', resetForm);

function prepareEdit(id, name, price, category, imageUrl) {
    if (!addProductForm) return;

    addProductForm.querySelector('[name="name"]').value = name;
    addProductForm.querySelector('[name="price"]').value = price;
    addProductForm.querySelector('[name="category"]').value = category;
    addProductForm.querySelector('[name="image_url"]').value = imageUrl;

    addProductForm.dataset.editId = id;
    
    const submitBtn = addProductForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = "Update Product";
        submitBtn.style.backgroundColor = "#f39c12"; 
    }
    
    if (formTitle) formTitle.textContent = "Edit Product";
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    addProductForm.scrollIntoView({ behavior: 'smooth' });
}

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = addProductForm.dataset.editId;
        const formData = new FormData(addProductForm);
        
        const productData = {
            name: formData.get('name'),
            price: Number(formData.get('price')),
            category: formData.get('category'),
            image_url: formData.get('image_url') || 'images/default.jpg'
        };

        const url = editId ? `api/products/${editId}` : 'api/products';
        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                alert(editId ? "Product updated!" : "Product added!");
                resetForm();
                fetchAdminProducts();
            } else {
                alert("Server error. Check if the API path is correct.");
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    });
}

async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        const res = await fetch(`api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            fetchAdminProducts();
        } else {
            alert("Delete failed");
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
}

async function fetchAdminOrders() {
    try {
        const res = await fetch('/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const orders = await res.json();
        renderAdminOrders(orders);
    } catch (err) { console.error(err); }
}

async function fetchAdminProducts() {
    try {
        const response = await fetch('api/products'); 
        const products = await response.json();
        renderAdminTable(products);
    } catch (err) { console.error(err); }
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById('admin-orders-body');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => {
        const isFinal = order.status === 'cancelled' || order.status === 'completed';

        const statusCell = isFinal
        ? `<span class="status-final ${order.status}">
                ${order.status === 'cancelled' ? '❌ Cancelled' : '✅ Completed'}
            </span>`
        : `
            <select onchange="updateStatus('${order._id}', this.value)" class="status-select">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
        `;

        return `
        <tr>
            <td>#${order._id.slice(-5)}</td>
            <td>${order.user?.username || 'Guest'}</td>
            <td>${order.total_amount} ₸</td>
            <td>${statusCell}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        </tr>
        `;
    }).join('');
}



function renderAdminTable(products) {
    const tableContainer = document.getElementById('admin-table-container');
    if (!tableContainer) return;

    tableContainer.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td><img src="${p.image_url}" width="40"></td>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>${p.price} ₸</td>
                        <td>
                            <button class="edit-btn" onclick="prepareEdit('${p._id}', '${p.name}', ${p.price}, '${p.category}', '${p.image_url}')">Edit</button>
                            <button class="delete-btn" onclick="deleteProduct('${p._id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </table>
    `;
}

async function updateStatus(orderId, newStatus) {
    const token = localStorage.getItem('token');

    const critical = ['completed', 'cancelled'];
    if (critical.includes(newStatus)) {
        const ok = confirm(`Are you sure you want to mark this order as "${newStatus}"?`);
        if (!ok) {
            await fetchAdminOrders();
            return;
        }
    }

    try {
        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
        alert(data.message || 'Cannot change status');
        await fetchAdminOrders();
        return;
        }

        alert(data.message || 'Status updated');
        await fetchAdminOrders();

    } catch (err) {
        alert('Update failed');
        await fetchAdminOrders();
    }
}
