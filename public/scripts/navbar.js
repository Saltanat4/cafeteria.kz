document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('navbar');
    if (!header) return;

    const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';

    header.innerHTML = `
        <nav class="navbar">
            <div id="logo"><a href="/">Cafeteria</a></div>

            ${isHome ? `
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Search menu...">
                    <button id="search-btn"><i class="fas fa-search"></i></button>
                </div>
            ` : ''}

            <ul class="nav-links" id="nav-links-container"></ul>
        </nav>
    `;

    renderNavLinks();
});


function renderNavLinks() {
	const role = localStorage.getItem('userRole'); // admin/user
	const token = localStorage.getItem('token');

	const nav = document.getElementById('nav-links-container');
	if (!nav) return;

	let links = `<li><a href="/">Menu</a></li>`;



	if (token) {
		if (role === 'admin') {
			links += `<li><a href="/admin">Admin Panel</a></li>`;
		} else {
			links += `
			<li><a href="/orders">My Orders</a></li>
			<li class="cart-container">
			<a href="/cart">
			<i class="fas fa-shopping-cart"></i>
			<span id="cart-count">0</span>
			</a>
			</li>
			`;
		}

		links += `<li><a href="#" id="logout-btn">Logout</a></li>`;
	} else {
		links += `<li><a href="/auth">Login</a></li>`;
	}

	nav.innerHTML = links;

	const logoutBtn = document.getElementById('logout-btn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', (e) => {
		e.preventDefault();
		localStorage.removeItem('token');
		localStorage.removeItem('userRole');
		window.location.href = '/';
		});
	}
}
