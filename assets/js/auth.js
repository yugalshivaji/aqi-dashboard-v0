// Authentication JavaScript Functions
// This file contains all the authentication logic from auth.html

const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJZyXEx8esRcN4mIxbEkqWqBljxvF0pU0O8fxRX6A_EBukqheh2U85pcfR37G0Bh8/exec';
let currentUser = null;
let currentOTP = null;
let otpEmail = null;
let otpRole = null;

// Initialize authentication
function initAuth() {
    // Check URL parameters for role
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role) {
        switchTab('login');
        document.getElementById('loginRole').value = role;
    }
    
    // Setup form submissions
    setupForms();
    
    // Load any saved credentials
    loadSavedCredentials();
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected tab
    document.querySelector(`.auth-tab:nth-child(${tabName === 'login' ? 1 : tabName === 'register' ? 2 : 3})`).classList.add('active');
    document.getElementById(`${tabName}Panel`).classList.add('active');
    
    // Clear alerts
    clearAlert();
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Setup Forms
function setupForms() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Registration Form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
    
    // Forgot Password Form
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleForgotPassword();
    });
}

// Handle Login
async function handleLogin() {
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate
    if (!role || !email || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    // Show loading
    const loginBtn = document.getElementById('loginBtn');
    const spinner = loginBtn.querySelector('.spinner');
    loginBtn.disabled = true;
    spinner.style.display = 'inline-block';
    loginBtn.innerHTML = spinner.outerHTML + ' Authenticating...';
    
    try {
        // Call Google Apps Script
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                role: role,
                email: email,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Check if user is approved
            if (result.approved === false || result.approved === 'false') {
                showAlert('Your account is pending approval. Please contact administrator.', 'warning');
                return;
            }
            
            // Store user data
            currentUser = {
                id: result.id,
                email: email,
                role: role,
                name: result.name,
                approved: result.approved
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('savedRole', role);
            }
            
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                switch(role) {
                    case 'citizen':
                        window.location.href = 'citizen.html';
                        break;
                    case 'department':
                        window.location.href = 'department.html';
                        break;
                    case 'policymaker':
                        window.location.href = 'policymaker.html';
                        break;
                }
            }, 1500);
            
        } else {
            showAlert(result.message || 'Invalid credentials', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        // Reset button
        loginBtn.disabled = false;
        spinner.style.display = 'none';
        loginBtn.innerHTML = 'Login to Portal';
    }
}

// Handle Registration
async function handleRegister() {
    const fullName = document.getElementById('regFullName').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const address = document.getElementById('regAddress').value.trim();
    
    // Validate
    if (!fullName || !mobile || !email || !role || !password || !confirmPassword) {
        showAlert('Please fill all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        showAlert('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Show loading
    const registerBtn = document.getElementById('registerBtn');
    const spinner = registerBtn.querySelector('.spinner');
    registerBtn.disabled = true;
    spinner.style.display = 'inline-block';
    registerBtn.innerHTML = spinner.outerHTML + ' Creating Account...';
    
    try {
        // Call Google Apps Script
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                full_name: fullName,
                mobile: mobile,
                email: email,
                role: role,
                password: password,
                address: address
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Registration successful! ' + 
                     (role === 'citizen' ? 'You can now login.' : 'Your account is pending approval.'), 
                     'success');
            
            // Clear form
            document.getElementById('registerForm').reset();
            
            // Switch to login tab for non-citizens
            if (role !== 'citizen') {
                setTimeout(() => switchTab('login'), 2000);
            }
            
        } else {
            showAlert(result.message || 'Registration failed', 'error');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        // Reset button
        registerBtn.disabled = false;
        spinner.style.display = 'none';
        registerBtn.innerHTML = 'Create Account';
    }
}

// Handle Forgot Password
async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    const role = document.getElementById('forgotRole').value;
    
    // Validate
    if (!email || !role) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    // Show loading
    const forgotBtn = document.getElementById('forgotBtn');
    const spinner = forgotBtn.querySelector('.spinner');
    forgotBtn.disabled = true;
    spinner.style.display = 'inline-block';
    forgotBtn.innerHTML = spinner.outerHTML + ' Sending OTP...';
    
    try {
        // Call Google Apps Script to send OTP
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'send_otp',
                email: email,
                role: role
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store OTP data
            currentOTP = result.otp;
            otpEmail = email;
            otpRole = role;
            
            // Show OTP modal
            showOTPModal(email);
            
            // Start resend timer
            startResendTimer();
            
            showAlert('OTP sent to your email', 'success');
            
        } else {
            showAlert(result.message || 'Failed to send OTP', 'error');
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        // Reset button
        forgotBtn.disabled = false;
        spinner.style.display = 'none';
        forgotBtn.innerHTML = 'Send OTP to Email';
    }
}

// Show OTP Modal
function showOTPModal(email) {
    const modal = document.getElementById('otpModal');
    const message = document.getElementById('otpMessage');
    
    message.textContent = `We've sent a 6-digit OTP to ${email}. Enter it below:`;
    modal.style.display = 'flex';
    
    // Clear OTP inputs
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
    });
    
    // Focus first input
    document.querySelector('.otp-input').focus();
}

// Close OTP Modal
function closeOTPModal() {
    document.getElementById('otpModal').style.display = 'none';
    currentOTP = null;
    otpEmail = null;
    otpRole = null;
}

// Move to next OTP input
function moveToNext(input, nextIndex) {
    if (input.value.length === 1) {
        const nextInput = input.parentElement.children[nextIndex];
        if (nextInput) {
            nextInput.focus();
        }
    }
}

// Verify OTP
async function verifyOTP() {
    // Collect OTP
    let otp = '';
    document.querySelectorAll('.otp-input').forEach(input => {
        otp += input.value;
    });
    
    if (otp.length !== 6) {
        showAlert('Please enter complete 6-digit OTP', 'error');
        return;
    }
    
    // Show loading
    const verifyBtn = document.getElementById('verifyOtpBtn');
    const spinner = verifyBtn.querySelector('.spinner');
    verifyBtn.disabled = true;
    spinner.style.display = 'inline-block';
    verifyBtn.innerHTML = spinner.outerHTML + ' Verifying...';
    
    try {
        // Check OTP
        if (otp === currentOTP) {
            // OTP verified - show new password form
            showNewPasswordForm();
            closeOTPModal();
        } else {
            showAlert('Invalid OTP. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('OTP verification error:', error);
        showAlert('Verification failed. Please try again.', 'error');
    } finally {
        // Reset button
        verifyBtn.disabled = false;
        spinner.style.display = 'none';
        verifyBtn.innerHTML = 'Verify OTP';
    }
}

// Show new password form
function showNewPasswordForm() {
    const html = `
        <div class="mt-4" id="newPasswordForm">
            <h4 style="color: var(--gov-blue);">Set New Password</h4>
            <div class="mb-3">
                <label class="form-label">New Password</label>
                <div class="password-container">
                    <input type="password" class="form-control" id="newPassword" 
                           placeholder="Enter new password" required>
                    <span class="password-toggle" onclick="togglePassword('newPassword')">
                        <i class="fas fa-eye"></i>
                    </span>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Confirm New Password</label>
                <div class="password-container">
                    <input type="password" class="form-control" id="confirmNewPassword" 
                           placeholder="Confirm new password" required>
                    <span class="password-toggle" onclick="togglePassword('confirmNewPassword')">
                        <i class="fas fa-eye"></i>
                    </span>
                </div>
            </div>
            <button type="button" class="btn-auth" onclick="resetPassword()">Reset Password</button>
        </div>
    `;
    
    // Remove existing form if any
    const existingForm = document.getElementById('newPasswordForm');
    if (existingForm) {
        existingForm.remove();
    }
    
    document.getElementById('forgotPanel').insertAdjacentHTML('beforeend', html);
}

// Reset Password
async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmNewPassword) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        // Call Google Apps Script to reset password
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'reset_password',
                email: otpEmail,
                role: otpRole,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Password reset successfully! You can now login with new password.', 'success');
            
            // Clear forms
            document.getElementById('forgotForm').reset();
            document.getElementById('newPasswordForm').remove();
            
            // Switch to login tab
            setTimeout(() => switchTab('login'), 2000);
            
        } else {
            showAlert(result.message || 'Password reset failed', 'error');
        }
        
    } catch (error) {
        console.error('Reset password error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Resend OTP
async function resendOTP() {
    if (!otpEmail || !otpRole) return;
    
    try {
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'send_otp',
                email: otpEmail,
                role: otpRole
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentOTP = result.otp;
            showAlert('New OTP sent to your email', 'success');
            startResendTimer();
        } else {
            showAlert(result.message || 'Failed to resend OTP', 'error');
        }
        
    } catch (error) {
        console.error('Resend OTP error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Start resend timer
function startResendTimer() {
    let timeLeft = 60;
    const timerElement = document.getElementById('resendTimer');
    
    const timer = setInterval(() => {
        timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            timerElement.textContent = '';
            timerElement.innerHTML = '<a href="javascript:void(0)" onclick="resendOTP()" class="text-decoration-none" style="color: var(--gov-blue);">Click here to resend OTP</a>';
        }
    }, 1000);
}

// Load saved credentials
function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRole = localStorage.getItem('savedRole');
    
    if (savedEmail && savedRole) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('loginRole').value = savedRole;
        document.getElementById('rememberMe').checked = true;
    }
}

// Show Alert
function showAlert(message, type) {
    const alertElement = document.getElementById('alertMessage');
    
    alertElement.textContent = message;
    alertElement.className = `alert-message alert-${type}`;
    alertElement.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        clearAlert();
    }, 5000);
}

// Clear Alert
function clearAlert() {
    const alertElement = document.getElementById('alertMessage');
    alertElement.style.display = 'none';
    alertElement.textContent = '';
}

// Logout function (to be used in other pages)
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

// Check authentication (to be used in other pages)
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'auth.html';
        return null;
    }
    return JSON.parse(user);
}

// Export functions for use in other files
export {
    initAuth,
    switchTab,
    togglePassword,
    moveToNext,
    closeOTPModal,
    verifyOTP,
    resendOTP,
    logout,
    checkAuth
};
