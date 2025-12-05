// citizen.js - Citizen Dashboard Functionality
// Contains all citizen-specific features and functionalities

// ============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// ============================================================================

const CITIZEN_CONFIG = {
    // API Endpoints (Replace with your actual endpoints)
    api: {
        dashboard: 'https://your-api.com/citizen/dashboard',
        complaints: 'https://your-api.com/citizen/complaints',
        hospitals: 'https://your-api.com/citizen/hospitals',
        shelters: 'https://your-api.com/citizen/shelters',
        events: 'https://your-api.com/citizen/events',
        profile: 'https://your-api.com/citizen/profile',
        policies: 'https://your-api.com/citizen/policies'
    },
    
    // Map Configuration
    map: {
        center: [28.6139, 77.2090], // Delhi coordinates
        zoom: 11,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    
    // AQI Categories
    aqiCategories: {
        good: { min: 0, max: 50, color: '#28a745', label: 'Good' },
        satisfactory: { min: 51, max: 100, color: '#87c159', label: 'Satisfactory' },
        moderate: { min: 101, max: 200, color: '#ffc107', label: 'Moderate' },
        poor: { min: 201, max: 300, color: '#fd7e14', label: 'Poor' },
        veryPoor: { min: 301, max: 400, color: '#dc3545', label: 'Very Poor' },
        severe: { min: 401, max: 500, color: '#6f42c1', label: 'Severe' }
    },
    
    // Default user data
    user: {
        points: 0,
        complaints: 0,
        events: 0,
        ratings: 0
    }
};

// Global state variables
let citizenState = {
    currentUser: null,
    complaints: [],
    hospitals: [],
    shelters: [],
    events: [],
    policies: [],
    uploadedPhotos: [],
    breathingInterval: null,
    mapInstance: null,
    charts: {},
    currentSection: 'dashboard'
};

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize the citizen dashboard
 * This is the main entry point for citizen functionality
 */
function initCitizenDashboard() {
    console.log('Initializing Citizen Dashboard...');
    
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Load user data
    loadUserData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize all sections
    initializeDashboard();
    initializeComplaintForm();
    initializeComplaintTracking();
    initializeMap();
    initializeHospitals();
    initializeShelters();
    initializeEvents();
    initializeAR();
    initializeHealth();
    initializePolicyRating();
    initializeProfile();
    
    // Load initial data
    loadDashboardData();
    loadNotifications();
    
    // Start auto-refresh for dashboard (every 5 minutes)
    startAutoRefresh();
    
    console.log('Citizen Dashboard initialized successfully');
}

/**
 * Check if user is authenticated
 * Redirects to login page if not authenticated
 */
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'auth.html';
        return false;
    }
    
    citizenState.currentUser = JSON.parse(user);
    return true;
}

/**
 * Load user data from localStorage or API
 */
function loadUserData() {
    if (citizenState.currentUser) {
        // Update UI with user data
        document.getElementById('userName').textContent = citizenState.currentUser.name || 'Citizen';
        document.getElementById('profileFullName').value = citizenState.currentUser.name || '';
        document.getElementById('profileEmail').value = citizenState.currentUser.email || '';
        
        // Load additional user stats
        loadUserStats();
    }
}

/**
 * Setup all event listeners for citizen dashboard
 */
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', handleSidebarNavigation);
    });
    
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', toggleSidebar);
    
    // Notification panel
    document.getElementById('notificationsBtn').addEventListener('click', toggleNotificationPanel);
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsRead);
    
    // Profile panel
    document.getElementById('profileBtn').addEventListener('click', toggleProfilePanel);
    
    // Floating buttons
    document.getElementById('floatingChatbotBtn').addEventListener('click', toggleChatbotPanel);
    document.getElementById('floatingMicrophoneBtn').addEventListener('click', toggleVoicePanel);
    document.getElementById('floatingEmergencyBtn').addEventListener('click', showEmergencyHelp);
    
    // Chatbot
    document.getElementById('closeChatbot').addEventListener('click', toggleChatbotPanel);
    document.getElementById('sendChatbotMessage').addEventListener('click', sendChatbotMessage);
    document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatbotMessage();
    });
    
    // Logout
    document.getElementById('logout-sidebar').addEventListener('click', logout);
    
    console.log('Event listeners setup complete');
}

// ============================================================================
// DASHBOARD FUNCTIONALITY
// ============================================================================

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    console.log('Initializing dashboard components...');
    
    // Setup AQI update interval
    setInterval(updateAQIDisplay, 300000); // Update every 5 minutes
    
    // Setup quick action buttons
    setupQuickActions();
}

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockDashboardData();
        
        // Update dashboard with data
        updateDashboard(mockData);
        
        // Update last updated time
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Failed to load dashboard data. Please try again.', 'error');
    }
}

/**
 * Update dashboard with new data
 * @param {Object} data - Dashboard data
 */
function updateDashboard(data) {
    // Update AQI display
    updateAQIDisplay(data.aqi);
    
    // Update weather info
    updateWeatherInfo(data.weather);
    
    // Update pollutant levels
    updatePollutantLevels(data.pollutants);
    
    // Update health recommendations
    updateHealthRecommendations(data.health);
    
    // Update recent complaints
    updateRecentComplaints(data.complaints);
    
    // Update forecast chart
    updateForecastChart(data.forecast);
    
    // Update user points
    updateUserPoints(data.points);
}

/**
 * Update AQI display with current data
 * @param {number} aqi - Current AQI value
 */
function updateAQIDisplay(aqi = null) {
    // If no AQI provided, generate random for demo
    const currentAQI = aqi || Math.floor(100 + Math.random() * 300);
    
    // Get AQI category
    const category = getAQICategory(currentAQI);
    const categoryInfo = CITIZEN_CONFIG.aqiCategories[category];
    
    // Update AQI value
    document.getElementById('mainAQI').textContent = currentAQI;
    document.getElementById('mainAQICategory').textContent = categoryInfo.label;
    document.getElementById('mainAQICategory').className = `badge fs-5 px-4 py-2 mb-4 aqi-${category}`;
    
    // Update progress bar
    const progress = Math.min((currentAQI / 500) * 100, 100);
    const progressBar = document.getElementById('aqiProgress');
    progressBar.style.width = `${progress}%`;
    progressBar.className = `progress-bar aqi-${category}`;
    
    // Update description
    document.getElementById('aqiDescription').textContent = getAQIDescription(currentAQI);
    document.getElementById('dominantPollutant').textContent = 'Dominant Pollutant: PM2.5';
    
    // Show/hide health alert
    toggleHealthAlert(currentAQI);
}

/**
 * Get AQI category based on value
 * @param {number} aqi - AQI value
 * @returns {string} - AQI category key
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
 * Get AQI description based on value
 * @param {number} aqi - AQI value
 * @returns {string} - Description text
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
 * Toggle health alert based on AQI
 * @param {number} aqi - AQI value
 */
function toggleHealthAlert(aqi) {
    const alertElement = document.getElementById('healthAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    
    if (aqi > 200) {
        let title = 'Health Alert';
        let message = 'Air quality is poor. Sensitive groups should reduce outdoor activities.';
        
        if (aqi > 300) {
            title = 'High Health Alert';
            message = 'Air quality is very poor. Everyone may begin to experience health effects.';
        }
        
        if (aqi > 400) {
            title = 'Severe Health Alert';
            message = 'Health emergency! Avoid all outdoor activities. Sensitive groups should take extra precautions.';
        }
        
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        alertElement.style.display = 'block';
    } else {
        alertElement.style.display = 'none';
    }
}

/**
 * Update weather information
 * @param {Object} weatherData - Weather data
 */
function updateWeatherInfo(weatherData) {
    document.getElementById('temperature').textContent = `${weatherData.temperature}°C`;
    document.getElementById('humidity').textContent = `${weatherData.humidity}%`;
    document.getElementById('windSpeed').textContent = `${weatherData.wind_speed} m/s`;
    document.getElementById('visibility').textContent = `${weatherData.visibility} km`;
}

/**
 * Update pollutant levels display
 * @param {Object} pollutants - Pollutant data
 */
function updatePollutantLevels(pollutants) {
    const container = document.getElementById('pollutantLevels');
    
    const pollutantsHtml = Object.entries(pollutants).map(([name, value]) => {
        let level = 'Low';
        let color = 'success';
        
        if (value > 100) {
            level = 'High';
            color = 'danger';
        } else if (value > 50) {
            level = 'Moderate';
            color = 'warning';
        }
        
        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span><strong>${name}</strong></span>
                    <span class="badge bg-${color}">${level}</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-${color}" style="width: ${Math.min(value, 100)}%"></div>
                </div>
                <small class="text-muted">${value} μg/m³</small>
            </div>
        `;
    }).join('');
    
    container.innerHTML = pollutantsHtml;
}

/**
 * Update health recommendations
 * @param {Array} recommendations - Health recommendations
 */
function updateHealthRecommendations(recommendations) {
    const container = document.getElementById('healthRecommendations');
    
    const recommendationsHtml = recommendations.map(rec => `
        <div class="mb-2">
            <i class="fas fa-check-circle text-success me-2"></i>
            ${rec}
        </div>
    `).join('');
    
    container.innerHTML = recommendationsHtml;
}

/**
 * Update recent complaints
 * @param {Array} complaints - Recent complaints
 */
function updateRecentComplaints(complaints) {
    const container = document.getElementById('recentComplaints');
    
    if (!complaints || complaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>No recent complaints</p>
                <button class="btn btn-sm btn-primary" onclick="showSection('complaints')">
                    Submit Your First Complaint
                </button>
            </div>
        `;
        return;
    }
    
    const complaintsHtml = complaints.slice(0, 3).map(complaint => `
        <div class="border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between">
                <strong>${complaint.type}</strong>
                <span class="badge bg-${getStatusColor(complaint.status)}">
                    ${complaint.status}
                </span>
            </div>
            <small class="text-muted">${complaint.location}</small><br>
            <small>${complaint.date}</small>
        </div>
    `).join('');
    
    container.innerHTML = complaintsHtml;
}

/**
 * Update forecast chart
 * @param {Array} forecast - Forecast data
 */
function updateForecastChart(forecast) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (citizenState.charts.forecast) {
        citizenState.charts.forecast.destroy();
    }
    
    citizenState.charts.forecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecast.map(f => f.time),
            datasets: [{
                label: 'AQI Forecast',
                data: forecast.map(f => f.aqi),
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

/**
 * Update user points display
 * @param {number} points - User points
 */
function updateUserPoints(points) {
    document.getElementById('headerPoints').textContent = `${points} pts`;
    document.getElementById('profilePoints').textContent = `${points} pts`;
    document.getElementById('citizenPoints').textContent = points;
}

/**
 * Setup quick action buttons
 */
function setupQuickActions() {
    // Quick action buttons are already set up in HTML
    // This function can be expanded for additional quick actions
    console.log('Quick actions setup complete');
}

/**
 * Start auto-refresh for dashboard
 */
function startAutoRefresh() {
    setInterval(loadDashboardData, 300000); // 5 minutes
    console.log('Auto-refresh started (every 5 minutes)');
}

// ============================================================================
// COMPLAINT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Initialize complaint form
 */
function initializeComplaintForm() {
    console.log('Initializing complaint form...');
    
    const complaintForm = document.getElementById('complaintForm');
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');
    
    // Reset uploaded photos
    citizenState.uploadedPhotos = [];
    
    // Handle photo upload
    photoUpload.addEventListener('change', function(e) {
        handlePhotoUpload(e.target.files);
    });
    
    // Handle current location button
    document.getElementById('useCurrentLocation').addEventListener('click', useCurrentLocation);
    
    // Handle form submission
    complaintForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitComplaint();
    });
    
    console.log('Complaint form initialized');
}

/**
 * Handle photo upload
 * @param {FileList} files - Uploaded files
 */
function handlePhotoUpload(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            showAlert('Please upload only images or videos', 'error');
            continue;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showAlert(`File ${file.name} is too large (max 5MB)`, 'error');
            continue;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            addPhotoPreview(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    // Reset file input
    document.getElementById('photoUpload').value = '';
}

/**
 * Add photo preview to UI
 * @param {string} fileName - File name
 * @param {string} dataUrl - File data URL
 */
function addPhotoPreview(fileName, dataUrl) {
    const previewId = `photo-${Date.now()}`;
    
    const previewItem = document.createElement('div');
    previewItem.className = 'photo-preview-item';
    previewItem.id = previewId;
    previewItem.innerHTML = `
        <img src="${dataUrl}" alt="${fileName}">
        <button type="button" class="photo-remove" onclick="removePhotoPreview('${previewId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.getElementById('photoPreview').appendChild(previewItem);
    
    // Store in state
    citizenState.uploadedPhotos.push({
        id: previewId,
        name: fileName,
        dataUrl: dataUrl
    });
}

/**
 * Remove photo preview
 * @param {string} previewId - Preview element ID
 */
function removePhotoPreview(previewId) {
    const element = document.getElementById(previewId);
    if (element) {
        element.remove();
    }
    
    // Remove from state
    citizenState.uploadedPhotos = citizenState.uploadedPhotos.filter(photo => photo.id !== previewId);
}

/**
 * Use current location for complaint
 */
function useCurrentLocation() {
    if (!navigator.geolocation) {
        showAlert('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showAlert('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Use reverse geocoding to get address
            // For demo, we'll just show coordinates
            document.getElementById('location').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            showAlert('Location obtained successfully', 'success');
        },
        (error) => {
            console.error('Geolocation error:', error);
            showAlert('Unable to get your location. Please enter manually.', 'error');
        }
    );
}

/**
 * Submit complaint
 */
async function submitComplaint() {
    // Get form data
    const complaintData = {
        type: document.getElementById('complaintType').value,
        priority: document.getElementById('priority').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        photos: citizenState.uploadedPhotos,
        timestamp: new Date().toISOString(),
        userId: citizenState.currentUser?.id || 'anonymous'
    };
    
    // Validate form
    if (!validateComplaint(complaintData)) {
        return;
    }
    
    try {
        // Show loading
        const submitBtn = document.querySelector('#complaintForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        submitBtn.disabled = true;
        
        // In a real app, this would be an API call
        // For demo, we'll simulate API call
        await simulateApiCall(complaintData);
        
        // Show success message
        showAlert('Complaint submitted successfully! You earned 10 points.', 'success');
        
        // Reset form
        document.getElementById('complaintForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        citizenState.uploadedPhotos = [];
        
        // Update user points
        updateUserPoints((parseInt(document.getElementById('citizenPoints').textContent) || 0) + 10);
        
        // Update recent complaints
        loadDashboardData();
        
    } catch (error) {
        console.error('Error submitting complaint:', error);
        showAlert('Failed to submit complaint. Please try again.', 'error');
    } finally {
        // Reset button
        const submitBtn = document.querySelector('#complaintForm button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Validate complaint data
 * @param {Object} complaintData - Complaint data
 * @returns {boolean} - Validation result
 */
function validateComplaint(complaintData) {
    if (!complaintData.type) {
        showAlert('Please select complaint type', 'error');
        return false;
    }
    
    if (!complaintData.priority) {
        showAlert('Please select priority level', 'error');
        return false;
    }
    
    if (!complaintData.location) {
        showAlert('Please enter location', 'error');
        return false;
    }
    
    if (!complaintData.description) {
        showAlert('Please enter description', 'error');
        return false;
    }
    
    return true;
}

/**
 * Simulate API call (for demo purposes)
 * @param {Object} data - Data to submit
 */
function simulateApiCall(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('API call simulated:', data);
            resolve({ success: true, id: 'COMP-' + Date.now() });
        }, 1500);
    });
}

// ============================================================================
// COMPLAINT TRACKING FUNCTIONS
// ============================================================================

/**
 * Initialize complaint tracking
 */
function initializeComplaintTracking() {
    console.log('Initializing complaint tracking...');
    
    // Setup filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterComplaints(filter);
            
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Load complaints
    loadComplaints();
}

/**
 * Load user complaints
 */
async function loadComplaints() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        citizenState.complaints = generateMockComplaints();
        
        // Update complaint stats
        updateComplaintStats();
        
        // Display complaints
        displayComplaints(citizenState.complaints);
        
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Failed to load complaints. Please try again.', 'error');
    }
}

/**
 * Update complaint statistics
 */
function updateComplaintStats() {
    const total = citizenState.complaints.length;
    const pending = citizenState.complaints.filter(c => c.status === 'pending').length;
    const inProgress = citizenState.complaints.filter(c => c.status === 'in-progress').length;
    const resolved = citizenState.complaints.filter(c => c.status === 'resolved').length;
    
    document.getElementById('totalComplaints').textContent = total;
    document.getElementById('pendingComplaints').textContent = pending;
    document.getElementById('inprogressComplaints').textContent = inProgress;
    document.getElementById('resolvedComplaints').textContent = resolved;
}

/**
 * Display complaints in UI
 * @param {Array} complaints - Complaints to display
 */
function displayComplaints(complaints) {
    const container = document.getElementById('complaintsList');
    
    if (!complaints || complaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No complaints submitted yet</p>
                <button class="btn btn-primary" onclick="showSection('complaints')">
                    Submit Your First Complaint
                </button>
            </div>
        `;
        return;
    }
    
    const complaintsHtml = complaints.map(complaint => `
        <div class="complaint-item border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h5 class="mb-1">${getComplaintTypeLabel(complaint.type)}</h5>
                    <p class="text-muted mb-1">${complaint.location}</p>
                    <small class="text-muted">Submitted on ${complaint.date}</small>
                </div>
                <div class="text-end">
                    <span class="status-badge ${getStatusClass(complaint.status)}">
                        ${complaint.status.replace('-', ' ')}
                    </span>
                    <span class="priority-badge ${getPriorityClass(complaint.priority)} ms-1">
                        ${complaint.priority}
                    </span>
                </div>
            </div>
            <p class="mb-2">${complaint.description}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Complaint ID: ${complaint.id}</small>
                <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails('${complaint.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = complaintsHtml;
}

/**
 * Filter complaints by status
 * @param {string} filter - Filter type
 */
function filterComplaints(filter) {
    if (filter === 'all') {
        displayComplaints(citizenState.complaints);
        return;
    }
    
    const filtered = citizenState.complaints.filter(complaint => complaint.status === filter);
    displayComplaints(filtered);
}

/**
 * View complaint details
 * @param {string} complaintId - Complaint ID
 */
function viewComplaintDetails(complaintId) {
    const complaint = citizenState.complaints.find(c => c.id === complaintId);
    if (!complaint) {
        showAlert('Complaint not found', 'error');
        return;
    }
    
    // Show complaint details in a modal or detailed view
    // For now, just show an alert with details
    const details = `
        Complaint ID: ${complaint.id}
        Type: ${getComplaintTypeLabel(complaint.type)}
        Status: ${complaint.status}
        Priority: ${complaint.priority}
        Location: ${complaint.location}
        Date: ${complaint.date}
        Description: ${complaint.description}
    `;
    
    showAlert(details, 'info');
}

// ============================================================================
// MAP FUNCTIONALITY
// ============================================================================

/**
 * Initialize AQI map
 */
function initializeMap() {
    console.log('Initializing AQI map...');
    
    // Create map instance
    citizenState.mapInstance = L.map('aqiMap').setView(
        CITIZEN_CONFIG.map.center,
        CITIZEN_CONFIG.map.zoom
    );
    
    // Add tile layer
    L.tileLayer(CITIZEN_CONFIG.map.tileLayer, {
        attribution: '© OpenStreetMap contributors'
    }).addTo(citizenState.mapInstance);
    
    // Add AQI markers
    addAQIMarkers();
    
    // Setup refresh button
    document.getElementById('refreshMap').addEventListener('click', refreshMap);
    
    console.log('Map initialized');
}

/**
 * Add AQI markers to map
 */
function addAQIMarkers() {
    // Mock AQI data for different locations in Delhi
    const locations = [
        { name: 'Connaught Place', coords: [28.6304, 77.2177], aqi: 245 },
        { name: 'Dwarka', coords: [28.5925, 77.0396], aqi: 210 },
        { name: 'Rohini', coords: [28.7432, 77.0662], aqi: 280 },
        { name: 'Saket', coords: [28.5245, 77.2065], aqi: 195 },
        { name: 'Mayur Vihar', coords: [28.6021, 77.2974], aqi: 310 },
        { name: 'Karol Bagh', coords: [28.6517, 77.1917], aqi: 350 }
    ];
    
    locations.forEach(location => {
        const category = getAQICategory(location.aqi);
        const categoryInfo = CITIZEN_CONFIG.aqiCategories[category];
        
        const marker = L.circleMarker(location.coords, {
            radius: 15,
            fillColor: categoryInfo.color,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(citizenState.mapInstance);
        
        marker.bindPopup(`
            <strong>${location.name}</strong><br>
            AQI: ${location.aqi} (${categoryInfo.label})<br>
            <small>Last updated: ${new Date().toLocaleTimeString()}</small>
        `);
    });
}

/**
 * Refresh map data
 */
function refreshMap() {
    showAlert('Refreshing map data...', 'info');
    
    // Clear existing markers
    citizenState.mapInstance.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            citizenState.mapInstance.removeLayer(layer);
        }
    });
    
    // Add new markers
    addAQIMarkers();
    
    showAlert('Map data refreshed', 'success');
}

// ============================================================================
// HOSPITALS FUNCTIONALITY
// ============================================================================

/**
 * Initialize hospitals section
 */
function initializeHospitals() {
    console.log('Initializing hospitals section...');
    
    // Setup search functionality
    document.getElementById('hospitalSearch').addEventListener('input', function(e) {
        searchHospitals(e.target.value);
    });
    
    // Load hospitals
    loadHospitals();
}

/**
 * Load hospitals data
 */
async function loadHospitals() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        citizenState.hospitals = generateMockHospitals();
        
        // Display hospitals
        displayHospitals(citizenState.hospitals);
        
    } catch (error) {
        console.error('Error loading hospitals:', error);
        showAlert('Failed to load hospitals. Please try again.', 'error');
    }
}

/**
 * Display hospitals in UI
 * @param {Array} hospitals - Hospitals to display
 */
function displayHospitals(hospitals) {
    const container = document.getElementById('hospitalsList');
    
    const hospitalsHtml = hospitals.map(hospital => `
        <div class="hospital-item border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h5 class="mb-1">${hospital.name}</h5>
                    <p class="text-muted mb-1">${hospital.address}</p>
                    <p class="mb-1"><i class="fas fa-phone me-1"></i> ${hospital.phone}</p>
                    <p class="mb-0"><i
