let allProducts = []; 

document.addEventListener('DOMContentLoaded', () => {
    updateNavbarUI();
    
    if (document.getElementById('menu-container')) {
        fetchProducts();
        setupEventListeners(); 
    }
});

async function fetchProducts() {
    const menuContainer = document.getElementById('menu-container');
    try {
        const response = await fetch('api/products');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        allProducts = await response.json();

        if (!allProducts || allProducts.length === 0) {
            menuContainer.innerHTML = "<p>The database is empty.</p>";
            return;
        }
        renderMenu(allProducts);
    } catch (err) {
        console.error("Fetch error:", err);
        if (menuContainer) menuContainer.innerHTML = "<p>Connection error.</p>";
    }
}

function renderMenu(products) {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    const userRole = localStorage.getItem('userRole'); 

    menuContainer.innerHTML = products.map(item => `
        <div class="product-card">
            <div class="product-image">
                <img src="${item.image_url || 'images/default-coffee.jpg'}" alt="${item.name}">
            </div>
            <div class="card-content">
                <span class="category-tag">${item.category}</span>
                <h3>${item.name}</h3>
                <p class="price">${item.price} ₸</p>

                ${userRole !== 'admin' ? `
                    <button class="add-btn" onclick="addToCart('${item._id}')">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                ` : ``}

            </div>
        </div>
    `).join('');
}

function handleFilterAndSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.getAttribute('data-category').toLowerCase() : 'all';

    const filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = (activeCategory === 'all') || (product.category.toLowerCase() === activeCategory);
        return matchesSearch && matchesCategory;
    });

    renderMenu(filtered);
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                handleFilterAndSearch();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleFilterAndSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleFilterAndSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleFilterAndSearch();
        });
    }
}

async function addToCart(product) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login first!");
        window.location.href = '/auth';
        return;
    }
    try {
        const response = await fetch('api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ product, quantity: 1 })
        });
        if (response.ok) {
            alert("Added to cart!");
            updateNavbarUI(); 
        }
    } catch (err) { console.error(err); }
}

async function updateNavbarUI() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); 
    const authLinkItem = document.getElementById('auth-link-item');
    const adminLinkItem = document.getElementById('admin-link-item');
    const cartCountElement = document.getElementById('cart-count');

    if (token && authLinkItem) {
        authLinkItem.innerHTML = `<a href="#" id="logout-btn">Logout</a>`;
        if (userRole === 'admin' && adminLinkItem) {
            adminLinkItem.style.display = 'block';
        }
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); 
            window.location.href = '/'; 
        });
        if (cartCountElement) fetchCartCount(token, cartCountElement);
    }
}

async function fetchCartCount(token, element) {
    try {
        const res = await fetch('api/cart/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const items = await res.json();
            element.innerText = items.reduce((sum, item) => sum + item.quantity, 0);
        }
    } catch (err) { console.error(err); }
}