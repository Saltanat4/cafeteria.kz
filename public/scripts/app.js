
const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

let allProducts = []; 

async function fetchProducts() {
    const menuContainer = document.getElementById('menu-container');
    
    try {
        console.log("Requesting data from server...");
        const response = await fetch('/products');
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const products = await response.json();
        console.log("Data received:", products);

        if (!products || products.length === 0) {
            menuContainer.innerHTML = "<p>The database is empty. Please run node seed.js</p>";
            return;
        }

        allProducts = products; 
        renderMenu(products);
    } catch (err) {
        console.error("Fetch error:", err);
        if (menuContainer) {
            menuContainer.innerHTML = "<p>Connection error. Please try again later.</p>";
        }
    }
}

function renderMenu(products) {
    const menuContainer = document.getElementById('menu-container');
    
    if (!menuContainer) {
        console.error("Error: Element with id='menu-container' not found in HTML!");
        return;
    }

    try {
        menuContainer.innerHTML = "";
        menuContainer.innerHTML = products.map(item => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${item.image_url || 'images/default-coffee.jpg'}" alt="${item.name}">
                </div>
                <div class="card-content">
                    <span class="category-tag">${item.category}</span>
                    <h3>${item.name}</h3>
                    <p class="price">${item.price} ₸</p>
                    <button class="add-btn" onclick="addToCart('${item._id}')">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Rendering error:", err);
        menuContainer.innerHTML = "<p>Error displaying products.</p>";
    }
}

function handleFilterAndSearch() {
    try {
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const activeBtn = document.querySelector('.filter-btn.active');
        const activeCategory = activeBtn ? activeBtn.getAttribute('data-category').toLowerCase() : 'all';
        const filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
                        const matchesCategory = (activeCategory === 'all') || 
                                    (product.category.toLowerCase() === activeCategory);
            
            return matchesSearch && matchesCategory;
        });

        renderMenu(filtered);
    } catch (error) {
        console.error("Filtering logic failed:", error);
    }
}

function setupEventListeners() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            handleFilterAndSearch();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', handleFilterAndSearch);
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
        const response = await fetch('/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ product, quantity: 1 })
        });

        if (response.ok) {
            alert("Added to cart!");
            // This refreshes the number on the cart icon
            updateNavbarUI(); 
        } else {
            const errData = await response.json();
            alert(errData.message || "Failed to add to cart");
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}


async function updateNavbarUI() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); 
    
    const authLinkItem = document.getElementById('auth-link-item');
    const adminLinkItem = document.getElementById('admin-link-item');
    const cartCountElement = document.getElementById('cart-count');

    if (token) {
        authLinkItem.innerHTML = `<a href="#" id="logout-btn">Logout</a>`;
        
        if (userRole === 'admin') {
            adminLinkItem.style.display = 'block';
        }

        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); 
            window.location.href = '/'; 
        });

        fetchCartCount(token, cartCountElement);
    }
}

async function fetchCartCount(token, element) {
    try {
        const res = await fetch('/cart/list', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const items = await res.json();
            const total = items.reduce((sum, item) => sum + item.quantity, 0);
            element.innerText = total;
        }
    } catch (err) { console.error(err); }
}

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 1. Remove 'active' class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // 2. Add 'active' to the clicked button
        button.classList.add('active');
        
        // 3. Run the filter
        handleFilterAndSearch();
    });
});

document.addEventListener('DOMContentLoaded', updateNavbarUI);

document.addEventListener('DOMContentLoaded', fetchProducts);