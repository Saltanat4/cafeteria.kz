const showLogin = document.getElementById('show-login');
const showRegister = document.getElementById('show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

showLogin.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    showLogin.classList.add('active');
    showRegister.classList.remove('active');
});

showRegister.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    showRegister.classList.add('active');
    showLogin.classList.remove('active');
});
