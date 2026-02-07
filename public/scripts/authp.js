const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');


document.getElementById('show-register').addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    document.getElementById('show-login').classList.remove('active');
    document.getElementById('show-register').classList.add('active');
});

document.getElementById('show-login').addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.getElementById('show-register').classList.remove('active');
    document.getElementById('show-login').classList.add('active');
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);

    const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Registration successful! Now please login.");
        location.reload();
    } else {
        const error = await res.json();
        alert(error.message);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData);

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userRole', result.user.role);
        window.location.href = result.user.role === 'admin' ? '/admin.html' : '/index.html';
    } else {
        alert(result.message);
    }
});