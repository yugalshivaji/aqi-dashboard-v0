// app.js - Main Application Initialization
// This file handles the core application setup and shared functionality

// ============================================================================
// APPLICATION CONSTANTS AND CONFIGURATION
// ============================================================================

const APP_CONFIG = {
    // Application Information
    appName: 'AQI NCR Delhi - Gov Edition',
    version: '1.0.0',
    environment: 'production',
    
    // API Configuration
    api: {
        baseUrl: 'https://your-api-endpoint.com/api/v1',
        endpoints: {
            auth: '/auth',
            aqi: '/aqi',
            complaints: '/complaints',
            users: '/users'
        },
        timeout: 30000 // 30 seconds
    },
    
    // Local Storage Keys
    storage: {
        user: 'currentUser',
        token: 'authToken',
        preferences: 'userPreferences',
        notifications: 'userNotifications'
    },
    
    // Default Settings
    defaults: {
        theme: 'light',
        language: 'en',
        notifications: true,
        autoRefresh: true
    },
    
    // AQI Thresholds
    aqiThresholds: {
        good: 50,
        moderate: 100,
        poor: 200,
        veryPoor: 300,
        severe: 400
    }
};

// ============================================================================
// APPLICATION STATE MANAGEMENT
// ============================================================================

const AppState = {
    // User Information
    user: null,
    isAuthenticated: false,
    
    // Application State
    currentPage: 'home',
    isLoading: false,
    lastError: null,
    
    // Data Cache
    cache: {
        aqiData: null,
        complaints: null,
        lastUpdated: null
    },
    
    // UI State
    ui: {
        sidebarOpen: false,
        notificationsOpen: false,
        profileOpen: false,
        chatbotOpen: false,
        theme: 'light'
    }
};

// ============================================================================
// CORE APPLICATION FUNCTIONS
// ============================================================================

/**
 * Initialize the entire application
 * This is the main entry point called from index.html
 */
function initializeApp() {
    console.log(`${APP_CONFIG.appName} v${APP_CONFIG.version} - Initializing...`);
    
    // Check environment
    if (APP_CONFIG.environment === 'development') {
        enableDebugMode();
    }
    
    // Initialize application state
    initializeAppState();
    
    // Setup global event handlers
    setupGlobalEventListeners();
    
    // Initialize theme
    initializeTheme();
    
    // Check authentication state
    checkAuthState();
    
    // Load user preferences
    loadUserPreferences();
    
    // Initialize error handling
    initializeErrorHandling();
    
    console.log('Application initialized successfully');
    
    // Hide loading screen if exists
    hideGlobalLoader();
}

/**
 * Initialize application state from localStorage
 */
function initializeAppState() {
    console.log('Initializing application state...');
    
    // Load user from localStorage
    const userData = localStorage.getItem(APP_CONFIG.storage.user);
    if (userData) {
        try {
            AppState.user = JSON.parse(userData);
            AppState.isAuthenticated = true;
            console.log('User loaded from localStorage:', AppState.user.name);
        } catch (error) {
            console.error('Error parsing user data:', error);
            clearAuthData();
        }
    }
    
    // Load UI state
    const uiState = localStorage.getItem('uiState');
    if (uiState) {
        try {
            AppState.ui = { ...AppState.ui, ...JSON.parse(uiState) };
        } catch (error) {
            console.error('Error parsing UI state:', error);
        }
    }
    
    // Initialize cache
    AppState.cache.lastUpdated = new Date();
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
    console.log('Setting up global event listeners...');
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    // Online/offline detection
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Before unload - save state
    window.addEventListener('beforeunload', saveAppState);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Click outside handlers
    document.addEventListener('click', handleOutsideClick);
    
    console.log('Global event listeners setup complete');
}

/**
 * Initialize theme based on user preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || APP_CONFIG.defaults.theme;
    setTheme(savedTheme);
}

/**
 * Set application theme
 * @param {string} theme - Theme name (light/dark)
 */
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    AppState.ui.theme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme toggle button if exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
    
    console.log(`Theme set to: ${theme}`);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = AppState.ui.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

/**
 * Check authentication state and redirect if needed
 */
function checkAuthState() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // List of pages that require authentication
    const protectedPages = ['citizen.html', 'department.html', 'policymaker.html'];
    
    // List of pages that should redirect to home if authenticated
    const authPages = ['auth.html', 'index.html'];
    
    if (protectedPages.includes(currentPage) && !AppState.isAuthenticated) {
        // Redirect to login if trying to access protected page without auth
        console.log('Unauthorized access attempt, redirecting to login...');
        window.location.href = 'auth.html';
        return;
    }
    
    if (authPages.includes(currentPage) && AppState.isAuthenticated && currentPage === 'auth.html') {
        // Redirect to appropriate dashboard if already authenticated
        console.log('Already authenticated, redirecting to dashboard...');
        redirectToDashboard();
        return;
    }
}

/**
 * Redirect to appropriate dashboard based on user role
 */
function redirectToDashboard() {
    if (!AppState.user || !AppState.user.role) {
        window.location.href = 'index.html';
        return;
    }
    
    switch (AppState.user.role.toLowerCase()) {
        case 'citizen':
            window.location.href = 'citizen.html';
            break;
        case 'department':
            window.location.href = 'department.html';
            break;
        case 'policymaker':
            window.location.href = 'policymaker.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    try {
        const preferences = localStorage.getItem(APP_CONFIG.storage.preferences);
        if (preferences) {
            const userPrefs = JSON.parse(preferences);
            
            // Apply preferences
            if (userPrefs.language) {
                setLanguage(userPrefs.language);
            }
            
            if (userPrefs.notifications !== undefined) {
                AppState.ui.notificationsEnabled = userPrefs.notifications;
            }
            
            if (userPrefs.autoRefresh !== undefined) {
                AppState.ui.autoRefresh = userPrefs.autoRefresh;
            }
            
            console.log('User preferences loaded');
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

/**
 * Set application language
 * @param {string} lang - Language code (en, hi, etc.)
 */
function setLanguage(lang) {
    // In a real app, this would load translation files
    // For now, we'll just set the attribute
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('language', lang);
    
    // Update language selector if exists
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.value = lang;
    }
    
    console.log(`Language set to: ${lang}`);
}

/**
 * Initialize error handling
 */
function initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        logError(e.error);
    });
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        logError(e.reason);
    });
    
    // Network error handling
    setupNetworkErrorHandling();
}

/**
 * Setup network error handling
 */
function setupNetworkErrorHandling() {
    // Intercept fetch errors
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            showNetworkError(error);
            throw error;
        }
    };
}

/**
 * Log error to console and optionally to server
 * @param {Error} error - Error object
 */
function logError(error) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        user: AppState.user ? AppState.user.email : 'anonymous'
    };
    
    console.error('Error logged:', errorLog);
    
    // In production, send error to server
    if (APP_CONFIG.environment === 'production') {
        // sendErrorToServer(errorLog);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Check if toast container exists, create if not
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="closeToast('${toastId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            closeToast(toastId);
        }, duration);
    }
    
    return toastId;
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} - Icon class
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

/**
 * Close a toast notification
 * @param {string} toastId - ID of toast to close
 */
function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 * @param {Object} options - Dialog options
 */
function showConfirm(message, onConfirm, onCancel = null, options = {}) {
    const dialogId = 'confirm-dialog-' + Date.now();
    const defaultOptions = {
        title: 'Confirm',
        confirmText: 'Yes',
        cancelText: 'No',
        type: 'warning'
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.id = dialogId;
    dialog.className = 'confirm-dialog-overlay';
    dialog.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-header">
                <h5><i class="fas ${getConfirmIcon(config.type)} me-2"></i>${config.title}</h5>
                <button class="btn-close" onclick="closeConfirm('${dialogId}')"></button>
            </div>
            <div class="confirm-body">
                <p>${message}</p>
            </div>
            <div class="confirm-footer">
                <button class="btn btn-secondary" onclick="closeConfirm('${dialogId}')">
                    ${config.cancelText}
                </button>
                <button class="btn ${getConfirmButtonClass(config.type)}" onclick="handleConfirm('${dialogId}', true)">
                    ${config.confirmText}
                </button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(dialog);
    
    // Store callbacks
    dialog.dataset.onConfirm = onConfirm.toString();
    dialog.dataset.onCancel = onCancel ? onCancel.toString() : '';
    
    // Show dialog
    setTimeout(() => {
        dialog.classList.add('show');
    }, 10);
    
    return dialogId;
}

/**
 * Get icon for confirmation dialog type
 * @param {string} type - Dialog type
 * @returns {string} - Icon class
 */
function getConfirmIcon(type) {
    switch (type) {
        case 'warning': return 'fa-exclamation-triangle';
        case 'danger': return 'fa-exclamation-circle';
        case 'info': return 'fa-info-circle';
        case 'success': return 'fa-check-circle';
        default: return 'fa-question-circle';
    }
}

/**
 * Get button class for confirmation dialog type
 * @param {string} type - Dialog type
 * @returns {string} - Button class
 */
function getConfirmButtonClass(type) {
    switch (type) {
        case 'warning': return 'btn-warning';
        case 'danger': return 'btn-danger';
        case 'info': return 'btn-info';
        case 'success': return 'btn-success';
        default: return 'btn-primary';
    }
}

/**
 * Handle confirmation dialog result
 * @param {string} dialogId - Dialog ID
 * @param {boolean} confirmed - Whether user confirmed
 */
function handleConfirm(dialogId, confirmed) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    
    if (confirmed) {
        const onConfirm = eval(`(${dialog.dataset.onConfirm})`);
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    } else {
        const onCancel = dialog.dataset.onCancel ? eval(`(${dialog.dataset.onCancel})`) : null;
        if (typeof onCancel === 'function') {
            onCancel();
        }
    }
    
    closeConfirm(dialogId);
}

/**
 * Close confirmation dialog
 * @param {string} dialogId - Dialog ID to close
 */
function closeConfirm(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        }, 300);
    }
}

/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoading(message = 'Loading...') {
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    } else {
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    
    loadingOverlay.classList.add('show');
    AppState.isLoading = true;
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
        setTimeout(() => {
            if (loadingOverlay.parentNode && !AppState.isLoading) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 300);
    }
    AppState.isLoading = false;
}

/**
 * Format date to local string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const config = { ...defaultOptions, ...options };
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return dateObj.toLocaleDateString('en-IN', config);
}

/**
 * Format AQI value with category
 * @param {number} aqi - AQI value
 * @returns {Object} - Formatted AQI object
 */
function formatAQI(aqi) {
    const category = getAQICategory(aqi);
    const categoryInfo = getAQICategoryInfo(category);
    
    return {
        value: aqi,
        category: category,
        label: categoryInfo.label,
        color: categoryInfo.color,
        description: getAQIDescription(aqi)
    };
}

/**
 * Get AQI category based on value
 * @param {number} aqi - AQI value
 * @returns {string} - AQI category
 */
function getAQICategory(aqi) {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'satisfactory';
    if (aqi <= 200) return 'moderate';
    if (aqi <= 300) return 'poor';
    if (aqi <= 400) return 'veryPoor';
    return 'severe';
}

/**
 * Get AQI category information
 * @param {string} category - AQI category
 * @returns {Object} - Category information
 */
function getAQICategoryInfo(category) {
    const categories = {
        good: { label: 'Good', color: '#28a745' },
        satisfactory: { label: 'Satisfactory', color: '#87c159' },
        moderate: { label: 'Moderate', color: '#ffc107' },
        poor: { label: 'Poor', color: '#fd7e14' },
        veryPoor: { label: 'Very Poor', color: '#dc3545' },
        severe: { label: 'Severe', color: '#6f42c1' }
    };
    
    return categories[category] || categories.moderate;
}

/**
 * Get AQI description
 * @param {number} aqi - AQI value
 * @returns {string} - Description
 */
function getAQIDescription(aqi) {
    if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people.';
    if (aqi <= 200) return 'Members of sensitive groups may experience health effects.';
    if (aqi <= 300) return 'Everyone may begin to experience health effects.';
    if (aqi <= 400) return 'Health alert: The risk of health effects is increased for everyone.';
    return 'Health warning of emergency conditions.';
}

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle window resize
 */
function handleWindowResize() {
    // Update responsive elements if needed
    if (window.innerWidth < 768) {
        // Mobile layout adjustments
        if (AppState.ui.sidebarOpen) {
            toggleSidebar();
        }
    }
}

/**
 * Handle online status
 */
function handleOnlineStatus() {
    console.log('Application is online');
    showToast('You are back online', 'success', 2000);
    
    // Sync any pending data
    syncPendingData();
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
    console.log('Application is offline');
    showToast('You are offline. Some features may not work.', 'warning', 5000);
}

/**
 * Show network error
 * @param {Error} error - Network error
 */
function showNetworkError(error) {
    showToast(`Network error: ${error.message}`, 'error', 5000);
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcuts(e) {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Ctrl/Cmd + S - Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAppState();
        showToast('Application state saved', 'success', 1000);
    }
    
    // Ctrl/Cmd + T - Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Ctrl/Cmd + K - Open search (if implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // openSearch();
    }
    
    // Escape - Close modals/panels
    if (e.key === 'Escape') {
        closeAllPanels();
    }
}

/**
 * Handle clicks outside of panels
 * @param {MouseEvent} e - Mouse event
 */
function handleOutsideClick(e) {
    // Close sidebar if click is outside
    if (AppState.ui.sidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && !sidebar.contains(e.target) && 
            menuToggle && !menuToggle.contains(e.target)) {
            toggleSidebar();
        }
    }
    
    // Close notification panel if click is outside
    if (AppState.ui.notificationsOpen) {
        const notificationsPanel = document.getElementById('notificationPanel');
        const notificationsBtn = document.getElementById('notificationsBtn');
        
        if (notificationsPanel && !notificationsPanel.contains(e.target) &&
            notificationsBtn && !notificationsBtn.contains(e.target)) {
            toggleNotificationPanel();
        }
    }
    
    // Close profile panel if click is outside
    if (AppState.ui.profileOpen) {
        const profilePanel = document.getElementById('profilePanel');
        const profileBtn = document.getElementById('profileBtn');
        
        if (profilePanel && !profilePanel.contains(e.target) &&
            profileBtn && !profileBtn.contains(e.target)) {
            toggleProfilePanel();
        }
    }
}

/**
 * Toggle sidebar
 */
function toggleSidebar() {
    AppState.ui.sidebarOpen = !AppState.ui.sidebarOpen;
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        if (AppState.ui.sidebarOpen) {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    }
}

/**
 * Toggle notification panel
 */
function toggleNotificationPanel() {
    AppState.ui.notificationsOpen = !AppState.ui.notificationsOpen;
    const panel = document.getElementById('notificationPanel');
    
    if (panel) {
        if (AppState.ui.notificationsOpen) {
            panel.classList.add('open');
            // Close other panels
            closeProfilePanel();
            closeChatbotPanel();
        } else {
            panel.classList.remove('open');
        }
    }
}

/**
 * Toggle profile panel
 */
function toggleProfilePanel() {
    AppState.ui.profileOpen = !AppState.ui.profileOpen;
    const panel = document.getElementById('profilePanel');
    
    if (panel) {
        if (AppState.ui.profileOpen) {
            panel.classList.add('open');
            // Close other panels
            closeNotificationPanel();
            closeChatbotPanel();
        } else {
            panel.classList.remove('open');
        }
    }
}

/**
 * Toggle chatbot panel
 */
function toggleChatbotPanel() {
    AppState.ui.chatbotOpen = !AppState.ui.chatbotOpen;
    const panel = document.getElementById('chatbotPanel');
    
    if (panel) {
        if (AppState.ui.chatbotOpen) {
            panel.classList.add('open');
            // Close other panels
            closeNotificationPanel();
            closeProfilePanel();
        } else {
            panel.classList.remove('open');
        }
    }
}

/**
 * Close all panels
 */
function closeAllPanels() {
    AppState.ui.sidebarOpen = false;
    AppState.ui.notificationsOpen = false;
    AppState.ui.profileOpen = false;
    AppState.ui.chatbotOpen = false;
    
    const sidebar = document.querySelector('.sidebar');
    const notificationPanel = document.getElementById('notificationPanel');
    const profilePanel = document.getElementById('profilePanel');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('open');
    if (notificationPanel) notificationPanel.classList.remove('open');
    if (profilePanel) profilePanel.classList.remove('open');
    if (chatbotPanel) chatbotPanel.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

/**
 * Close notification panel
 */
function closeNotificationPanel() {
    AppState.ui.notificationsOpen = false;
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.classList.remove('open');
}

/**
 * Close profile panel
 */
function closeProfilePanel() {
    AppState.ui.profileOpen = false;
    const panel = document.getElementById('profilePanel');
    if (panel) panel.classList.remove('open');
}

/**
 * Close chatbot panel
 */
function closeChatbotPanel() {
    AppState.ui.chatbotOpen = false;
    const panel = document.getElementById('chatbotPanel');
    if (panel) panel.classList.remove('open');
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role
 * @returns {Promise<Object>} - Login result
 */
async function loginUser(email, password, role) {
    showLoading('Logging in...');
    
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate API response
        const response = await simulateLoginApi(email, password, role);
        
        if (response.success) {
            // Store user data
            AppState.user = response.user;
            AppState.isAuthenticated = true;
            
            // Save to localStorage
            localStorage.setItem(APP_CONFIG.storage.user, JSON.stringify(response.user));
            localStorage.setItem(APP_CONFIG.storage.token, response.token);
            
            // Update UI
            updateUIAfterLogin();
            
            // Show success message
            showToast('Login successful!', 'success', 2000);
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                redirectToDashboard();
            }, 1500);
            
            return { success: true, user: response.user };
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message, 'error', 3000);
        return { success: false, message: error.message };
    } finally {
        hideLoading();
    }
}

/**
 * Logout user
 */
function logout() {
    showConfirm(
        'Are you sure you want to logout?',
        () => {
            clearAuthData();
            window.location.href = 'auth.html';
        },
        null,
        { title: 'Logout', type: 'warning' }
    );
}

/**
 * Clear authentication data
 */
function clearAuthData() {
    // Clear state
    AppState.user = null;
    AppState.isAuthenticated = false;
    
    // Clear localStorage
    localStorage.removeItem(APP_CONFIG.storage.user);
    localStorage.removeItem(APP_CONFIG.storage.token);
    
    // Clear cache
    AppState.cache.aqiData = null;
    AppState.cache.complaints = null;
    
    console.log('Authentication data cleared');
}

/**
 * Update UI after login
 */
function updateUIAfterLogin() {
    // Update user name in header if exists
    const userNameElements = document.querySelectorAll('#userName, .user-name');
    userNameElements.forEach(element => {
        if (AppState.user && AppState.user.name) {
            element.textContent = AppState.user.name;
        }
    });
    
    // Update user role if exists
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(element => {
        if (AppState.user && AppState.user.role) {
            element.textContent = AppState.user.role;
        }
    });
}

// ============================================================================
// DATA MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Save application state
 */
function saveAppState() {
    try {
        // Save UI state
        localStorage.setItem('uiState', JSON.stringify(AppState.ui));
        
        // Save user preferences
        const preferences = {
            language: document.documentElement.getAttribute('lang') || APP_CONFIG.defaults.language,
            theme: AppState.ui.theme,
            notifications: AppState.ui.notificationsEnabled,
            autoRefresh: AppState.ui.autoRefresh
        };
        localStorage.setItem(APP_CONFIG.storage.preferences, JSON.stringify(preferences));
        
        console.log('Application state saved');
    } catch (error) {
        console.error('Error saving application state:', error);
    }
}

/**
 * Sync pending data when coming online
 */
async function syncPendingData() {
    // In a real app, this would sync offline data
    console.log('Syncing pending data...');
    
    // Check for offline complaints
    const offlineComplaints = localStorage.getItem('offlineComplaints');
    if (offlineComplaints) {
        try {
            const complaints = JSON.parse(offlineComplaints);
            if (complaints.length > 0) {
                showToast(`Syncing ${complaints.length} offline complaints...`, 'info');
                // Process offline complaints
                // await syncComplaints(complaints);
                localStorage.removeItem('offlineComplaints');
                showToast('Offline data synced successfully', 'success');
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }
}

/**
 * Export user data
 */
function exportUserData() {
    if (!AppState.user) {
        showToast('Please login to export data', 'warning');
        return;
    }
    
    showConfirm(
        'Export all your data? This may take a moment.',
        async () => {
            showLoading('Preparing data for export...');
            
            try {
                // Gather all user data
                const userData = {
                    user: AppState.user,
                    preferences: JSON.parse(localStorage.getItem(APP_CONFIG.storage.preferences) || '{}'),
                    complaints: citizenState ? citizenState.complaints : [],
                    activities: [],
                    exportDate: new Date().toISOString()
                };
                
                // Create JSON file
                const dataStr = JSON.stringify(userData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                
                // Create download link
                const exportFileDefaultName = `aqi-data-${AppState.user.email}-${Date.now()}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                showToast('Data exported successfully', 'success');
            } catch (error) {
                console.error('Error exporting data:', error);
                showToast('Failed to export data', 'error');
            } finally {
                hideLoading();
            }
        },
        null,
        { title: 'Export Data', type: 'info' }
    );
}

// ============================================================================
// DEBUG AND DEVELOPMENT FUNCTIONS
// ============================================================================

/**
 * Enable debug mode
 */
function enableDebugMode() {
    console.log('Debug mode enabled');
    
    // Expose state for debugging
    window.AppState = AppState;
    window.APP_CONFIG = APP_CONFIG;
    
    // Add debug controls
    addDebugControls();
}

/**
 * Add debug controls to page
 */
function addDebugControls() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.className = 'debug-panel';
    debugPanel.innerHTML = `
        <div class="debug-header">
            <span>Debug Panel</span>
            <button class="btn-close" onclick="document.getElementById('debugPanel').remove()"></button>
        </div>
        <div class="debug-body">
            <button class="btn btn-sm btn-secondary mb-2" onclick="console.log(AppState)">Log State</button>
            <button class="btn btn-sm btn-secondary mb-2" onclick="showToast('Test Toast', 'success')">Test Toast</button>
            <button class="btn btn-sm btn-secondary mb-2" onclick="showLoading('Test Loading')">Test Loading</button>
            <button class="btn btn-sm btn-secondary mb-2" onclick="hideLoading()">Hide Loading</button>
        </div>
    `;
    
    document.body.appendChild(debugPanel);
}

/**
 * Hide global loader
 */
function hideGlobalLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// ============================================================================
// MOCK API FUNCTIONS (FOR DEMO)
// ============================================================================

/**
 * Simulate login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role
 * @returns {Promise<Object>} - Mock API response
 */
async function simulateLoginApi(email, password, role) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Validate credentials (demo purposes)
            if (!email || !password || !role) {
                reject(new Error('Please fill all fields'));
                return;
            }
            
            // Create mock user
            const mockUser = {
                id: 'user_' + Date.now(),
                email: email,
                name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
                role: role,
                createdAt: new Date().toISOString()
            };
            
            resolve({
                success: true,
                user: mockUser,
                token: 'mock_jwt_token_' + Date.now()
            });
        }, 1500);
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if app.js is being loaded in a page with app container
    const appContainer = document.getElementById('appContainer');
    if (appContainer || window.location.pathname.includes('index.html')) {
        initializeApp();
    }
    
    // Add global error handler for uncaught errors
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Uncaught error:', { message, source, lineno, colno, error });
        logError(error || new Error(message));
        return true;
    };
});

// Export functions for use in other files
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.exportUserData = exportUserData;
window.toggleSidebar = toggleSidebar;
window.toggleNotificationPanel = toggleNotificationPanel;
window.toggleProfilePanel = toggleProfilePanel;
window.toggleChatbotPanel = toggleChatbotPanel;
window.closeAllPanels = closeAllPanels;
window.formatDate = formatDate;
window.formatAQI = formatAQI;
window.getAQICategory = getAQICategory;
window.getAQICategoryInfo = getAQICategoryInfo;
window.getAQIDescription = getAQIDescription;
