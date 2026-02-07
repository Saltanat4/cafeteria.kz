
const menuContainer = document.getElementById('menu-container');

async function fetchProducts() {
    try {
        const response = await fetch('/lists'); 
        const products = await response.json();
        
        displayMenuItems(products);
        setupFilters(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        menuContainer.innerHTML = "<p>Coffee is brewing... please refresh in a moment!</p>";
    }
}


function displayMenuItems(menuList) {
    if (menuList.length < 1) {
        menuContainer.innerHTML = "<h3>No items match your search.</h3>";
        return;
    }
    
    let displayMenu = menuList.map((item) => {
        return `
            <div class="product-card">
                <img src="${item.image_url}" alt="${item.name}">
                <div class="card-content">
                    <span class="category-label">${item.category}</span>
                    <h3>${item.name}</h3>
                    <div class="card-footer">
                        <span class="price">$${item.price}</span>
                        <button class="add-btn" onclick="addToCart('${item._id}')">Add to Cart</button>
                    </div>
                </div>
            </div>`;
    }).join("");
    menuContainer.innerHTML = displayMenu;
}


window.addEventListener('DOMContentLoaded', fetchProducts);