const AUTH_API_URL = '/api/auth';

// Utility to show error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Redirect to dashboard if already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('user')) {
        window.location.href = 'index.html';
    }
});

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('loginBtn');
        
        try {
            btn.textContent = 'Signing in...';
            btn.disabled = true;

            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Login failed');
            }

            const data = await response.json();
            
            // Save user to local storage to simulate session
            localStorage.setItem('user', JSON.stringify(data));
            
            // Redirect to dashboard
            window.location.href = 'index.html';

        } catch (error) {
            showError(error.message);
            btn.textContent = 'Sign In';
            btn.disabled = false;
        }
    });
}

// Registration Logic
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const department = document.getElementById('department').value;
        const password = document.getElementById('password').value;
        const rollNumber = document.getElementById('rollNumber').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const enrollmentYear = parseInt(document.getElementById('enrollmentYear').value);
        const cgpa = parseFloat(document.getElementById('cgpa').value);
        const btn = document.getElementById('registerBtn');

        try {
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            const response = await fetch(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, department, password, rollNumber, phoneNumber, enrollmentYear, cgpa })
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || 'Registration failed');
            }

            // Successfully registered, now redirect to login
            alert('Registration successful! Please sign in.');
            window.location.href = 'login.html';

        } catch (error) {
            showError(error.message);
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }
    });
}
