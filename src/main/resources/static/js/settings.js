const API_BASE_URL = '/api/students';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Session Check
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userJson);
    
    // Setup Profile Display
    document.getElementById('userNameDisplay').textContent = currentUser.firstName;
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=6366f1&color=fff`;

    // Dropdown toggle
    const profileDropdown = document.getElementById('userProfileDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    profileDropdown.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Populate Settings form
    document.getElementById('sFirstName').value = currentUser.firstName || '';
    document.getElementById('sLastName').value = currentUser.lastName || '';
    document.getElementById('sEmail').value = currentUser.email || '';
    document.getElementById('sPhoneNumber').value = currentUser.phoneNumber || '';
    document.getElementById('sDepartment').value = currentUser.department || '';

    // Dark Mode init
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.checked = isDarkMode;
    if (isDarkMode) document.body.classList.add('dark-theme');

    darkModeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('darkMode', 'false');
        }
    });
});

// Update Profile Form
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('updateProfileBtn');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    if (!currentUser || !currentUser.id) {
        alert("Session is invalid or expired. Please log out and log in again.");
        btn.textContent = 'Save Profile';
        btn.disabled = false;
        return;
    }

    const updatedData = {
        firstName: document.getElementById('sFirstName').value,
        lastName: document.getElementById('sLastName').value,
        email: currentUser.email, // keeping it the same
        phoneNumber: document.getElementById('sPhoneNumber').value,
        department: document.getElementById('sDepartment').value,
        rollNumber: currentUser.rollNumber,
        enrollmentYear: currentUser.enrollmentYear,
        cgpa: currentUser.cgpa
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) throw new Error('Failed to update profile');
        
        const data = await response.json();
        
        // Update local storage
        const newUser = { ...currentUser, ...data };
        localStorage.setItem('user', JSON.stringify(newUser));
        currentUser = newUser;
        
        // Update header
        document.getElementById('userNameDisplay').textContent = currentUser.firstName;
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=6366f1&color=fff`;

        alert('Profile updated successfully!');
    } catch (error) {
        alert(error.message);
    } finally {
        btn.textContent = 'Save Profile';
        btn.disabled = false;
    }
});

// Update Password Form
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const btn = document.getElementById('updatePasswordBtn');

    if (!currentPassword || !newPassword) return;

    btn.textContent = 'Updating...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/${currentUser.id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const text = await response.text();

        if (!response.ok) throw new Error(text || 'Failed to update password');
        
        alert('Password updated successfully!');
        document.getElementById('passwordForm').reset();
    } catch (error) {
        alert(error.message);
    } finally {
        btn.textContent = 'Update Password';
        btn.disabled = false;
    }
});
