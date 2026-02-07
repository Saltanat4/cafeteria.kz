
const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

let allProducts = []; 


async function fetchProducts() {
    try {
        const response = await fetch('/products');
        
        if (!response.ok) throw new Error(`Server status: ${response.status}`);
        allProducts = await response.json();
        
        if (!allProducts || allProducts.length === 0) {
            menuContainer.innerHTML = "<p>The menu is loading..</p>";
            return;
        }

        renderMenu(allProducts);
        setupEventListeners(); 
    } catch (err) {
        console.error("Fetch Error:", err);
        menuContainer.innerHTML = "<p>Error loading menu. Please try again later.</p>";
    }
}


function renderMenu(products) {
    if (products.length === 0) {
        menuContainer.innerHTML = "<p>No matches found for your search</p>";
        return;
    }

    menuContainer.innerHTML = products.map(item => `
        <div class="product-card">
            <div class="product-image">
                <img src="${item.image_url || '/images/default-coffee.jpg'}" alt="${item.name}">
            </div>
            <div class="card-content">
                <span class="category-tag">${item.category}</span>
                <h3>${item.name}</h3>
                <p class="price">${item.price.toLocaleString()} ₸</p>
                <button class="add-btn" onclick="addToCart('${item._id}')">
                    <i class="fas fa-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}


function handleFilterAndSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';

    const filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = (activeCategory === 'all') || 
                                (product.category.toLowerCase() === activeCategory.toLowerCase());
        
        return matchesSearch && matchesCategory;
    });

    renderMenu(filtered);
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

async function addToCart(productId) {
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
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (response.ok) alert("Added to cart!");
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', fetchProducts);