const btnOrders = document.getElementById('btn-orders');
const btnProducts = document.getElementById('btn-products');
const sectionOrders = document.getElementById('section-orders');
const sectionProducts = document.getElementById('section-products');

btnOrders.addEventListener('click', () => {
    sectionOrders.classList.remove('hidden');
    sectionProducts.classList.add('hidden');
    btnOrders.classList.add('active');
    btnProducts.classList.remove('active');
});

btnProducts.addEventListener('click', () => {
    sectionProducts.classList.remove('hidden');
    sectionOrders.classList.add('hidden');
    btnProducts.classList.add('active');
    btnOrders.classList.remove('active');
});
