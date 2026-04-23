const API_BASE_URL = '/api/students';

// DOM Elements
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const studentModal = document.getElementById('studentModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');

// Form Inputs
const studentIdInput = document.getElementById('studentId');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rollNumberInput = document.getElementById('rollNumber');
const phoneNumberInput = document.getElementById('phoneNumber');
const enrollmentYearInput = document.getElementById('enrollmentYear');
const cgpaInput = document.getElementById('cgpa');
const departmentInput = document.getElementById('department');

let studentsList = [];
let currentUser = null;

// Initialize
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

    // Dark Mode check
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-theme');
    }

    fetchStudents();
});

// Fetch Students from API
async function fetchStudents() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch students');
        
        studentsList = await response.json();
        renderStudents(studentsList);
        updateKPIs(studentsList);
    } catch (error) {
        console.error('Error fetching students:', error);
        studentTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger)">Error loading data. Please ensure backend is running.</td></tr>`;
    }
}

// Update KPI Cards
function updateKPIs(students) {
    document.getElementById('kpiTotalStudents').textContent = students.length;
    
    if (students.length > 0) {
        let totalCgpa = 0;
        let validCgpaCount = 0;
        let departments = new Set();
        
        students.forEach(s => {
            if (s.cgpa) {
                totalCgpa += s.cgpa;
                validCgpaCount++;
            }
            if (s.department) {
                departments.add(s.department);
            }
        });
        
        const avgCgpa = validCgpaCount > 0 ? (totalCgpa / validCgpaCount).toFixed(2) : '0.00';
        document.getElementById('kpiAvgCgpa').textContent = avgCgpa;
        document.getElementById('kpiTotalDepts').textContent = departments.size;
    } else {
        document.getElementById('kpiAvgCgpa').textContent = '0.00';
        document.getElementById('kpiTotalDepts').textContent = '0';
    }
}

// Render Students to Table
function renderStudents(students) {
    studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
        studentTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 32px; color:var(--text-muted)">No students found. Add a new student to get started.</td></tr>`;
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="font-weight: 600; color: var(--primary-color)">${student.rollNumber || '#'+student.id}</span></td>
            <td>
                <div style="font-weight: 600">${student.firstName} ${student.lastName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted)">Enrolled: ${student.enrollmentYear || 'N/A'}</div>
            </td>
            <td>
                <div>${student.email}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted)">${student.phoneNumber || 'No phone'}</div>
            </td>
            <td><span class="badge">${student.department || 'N/A'}</span></td>
            <td style="font-weight: 600">${student.cgpa ? student.cgpa.toFixed(2) : '-'}</td>
            <td class="action-buttons">
                <button class="btn-icon" onclick="editStudent(${student.id})" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteStudent(${student.id})" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredStudents = studentsList.filter(student => 
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.department.toLowerCase().includes(searchTerm)
    );
    renderStudents(filteredStudents);
});

// Modal Actions
function openModal(isEdit = false) {
    if (!isEdit) {
        modalTitle.textContent = 'Add New Student';
        studentForm.reset();
        studentIdInput.value = '';
        document.getElementById('passwordGroup').style.display = 'block';
        passwordInput.required = true;
    } else {
        modalTitle.textContent = 'Edit Student';
        document.getElementById('passwordGroup').style.display = 'none';
        passwordInput.required = false;
    }
    studentModal.classList.add('active');
}

function closeModal() {
    studentModal.classList.remove('active');
}

openAddModalBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Click outside modal to close
studentModal.addEventListener('click', (e) => {
    if (e.target === studentModal) {
        closeModal();
    }
});

// Handle Form Submit
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: emailInput.value,
        department: departmentInput.value,
        rollNumber: rollNumberInput.value,
        phoneNumber: phoneNumberInput.value,
        enrollmentYear: enrollmentYearInput.value ? parseInt(enrollmentYearInput.value) : null,
        cgpa: cgpaInput.value ? parseFloat(cgpaInput.value) : null
    };

    const studentId = studentIdInput.value;

    try {
        if (studentId) {
            // Update existing using PUT
            const response = await fetch(`${API_BASE_URL}/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            if (!response.ok) throw new Error('Failed to update student');
        } else {
            // Create using Auth API to handle password properly
            studentData.password = passwordInput.value;
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to create student');
            }
        }
        
        closeModal();
        fetchStudents(); // Refresh data
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Error saving student: ' + error.message);
    }
});

// Edit Student
window.editStudent = function(id) {
    const student = studentsList.find(s => s.id === id);
    if (student) {
        studentIdInput.value = student.id;
        firstNameInput.value = student.firstName || '';
        lastNameInput.value = student.lastName || '';
        emailInput.value = student.email || '';
        departmentInput.value = student.department || '';
        rollNumberInput.value = student.rollNumber || '';
        phoneNumberInput.value = student.phoneNumber || '';
        enrollmentYearInput.value = student.enrollmentYear || '';
        cgpaInput.value = student.cgpa || '';
        openModal(true);
    }
};

// Delete Student
window.deleteStudent = async function(id) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete student');
            
            fetchStudents(); // Refresh data
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student: ' + error.message);
        }
    }
};
