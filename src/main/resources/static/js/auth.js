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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

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
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const department = document.getElementById('department').value;
        const password = document.getElementById('password').value.trim();
        const rollNumber = document.getElementById('rollNumber').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const enrollmentYearStr = document.getElementById('enrollmentYear').value.trim();
        const cgpaStr = document.getElementById('cgpa').value.trim();
        const btn = document.getElementById('registerBtn');

        // Client-side validation
        if (!firstName) {
            showError('First name is required!');
            return;
        }
        if (!lastName) {
            showError('Last name is required!');
            return;
        }
        if (!email) {
            showError('Email is required!');
            return;
        }
        if (!department) {
            showError('Please select a department!');
            return;
        }
        if (!password) {
            showError('Password is required!');
            return;
        }
        if (!rollNumber) {
            showError('Roll number is required!');
            return;
        }
        if (!enrollmentYearStr || isNaN(parseInt(enrollmentYearStr))) {
            showError('Valid enrollment year is required!');
            return;
        }

        const enrollmentYear = parseInt(enrollmentYearStr);
        const cgpa = cgpaStr ? parseFloat(cgpaStr) : null;

        try {
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            const response = await fetch(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, department, password, rollNumber, phoneNumber, enrollmentYear, cgpa })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
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
