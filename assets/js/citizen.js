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
                                        <p class="mb-0"><i class="fas fa-clock me-1"></i> ${hospital.hours}</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-success">${hospital.distance} km away</span>
                    <div class="mt-2">
                        <span class="badge ${hospital.emergency ? 'bg-danger' : 'bg-secondary'}">
                            ${hospital.emergency ? '24/7 Emergency' : 'Emergency Available'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="d-flex">
                <div class="flex-grow-1">
                    <small class="text-muted">Specialties: ${hospital.specialties.join(', ')}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary me-2" onclick="callHospital('${hospital.phone}')">
                        <i class="fas fa-phone me-1"></i>Call
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="getDirections('${hospital.name}', ${hospital.coords[0]}, ${hospital.coords[1]})">
                        <i class="fas fa-directions me-1"></i>Directions
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = hospitalsHtml;
}

/**
 * Search hospitals by query
 * @param {string} query - Search query
 */
function searchHospitals(query) {
    if (!query) {
        displayHospitals(citizenState.hospitals);
        return;
    }
    
    const filtered = citizenState.hospitals.filter(hospital => 
        hospital.name.toLowerCase().includes(query.toLowerCase()) ||
        hospital.address.toLowerCase().includes(query.toLowerCase()) ||
        hospital.specialties.some(specialty => 
            specialty.toLowerCase().includes(query.toLowerCase())
        )
    );
    
    displayHospitals(filtered);
}

/**
 * Call hospital phone number
 * @param {string} phoneNumber - Phone number to call
 */
function callHospital(phoneNumber) {
    if (confirm(`Do you want to call ${phoneNumber}?`)) {
        window.location.href = `tel:${phoneNumber}`;
    }
}

/**
 * Get directions to hospital
 * @param {string} name - Hospital name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function getDirections(name, lat, lng) {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
}

// ============================================================================
// SHELTERS FUNCTIONALITY
// ============================================================================

/**
 * Initialize shelters section
 */
function initializeShelters() {
    console.log('Initializing shelters section...');
    
    // Setup availability toggle
    document.getElementById('showOnlyAvailable').addEventListener('change', function(e) {
        loadShelters(e.target.checked);
    });
    
    // Load shelters
    loadShelters();
}

/**
 * Load shelters data
 * @param {boolean} onlyAvailable - Show only available shelters
 */
async function loadShelters(onlyAvailable = false) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        citizenState.shelters = generateMockShelters();
        
        // Filter if needed
        let shelters = citizenState.shelters;
        if (onlyAvailable) {
            shelters = shelters.filter(shelter => shelter.available);
        }
        
        // Display shelters
        displayShelters(shelters);
        
    } catch (error) {
        console.error('Error loading shelters:', error);
        showAlert('Failed to load shelters. Please try again.', 'error');
    }
}

/**
 * Display shelters in UI
 * @param {Array} shelters - Shelters to display
 */
function displayShelters(shelters) {
    const container = document.getElementById('sheltersList');
    
    if (shelters.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-home fa-3x mb-3"></i>
                <p>No shelters available at the moment</p>
                <p class="small">Check back later or try different filters</p>
            </div>
        `;
        return;
    }
    
    const sheltersHtml = shelters.map(shelter => `
        <div class="shelter-item border rounded p-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h5 class="mb-1">${shelter.name}</h5>
                    <p class="text-muted mb-1">${shelter.address}</p>
                    <p class="mb-0"><i class="fas fa-users me-1"></i> Capacity: ${shelter.capacity} people</p>
                </div>
                <div class="text-end">
                    <span class="badge ${shelter.available ? 'bg-success' : 'bg-secondary'}">
                        ${shelter.available ? 'Available' : 'Full'}
                    </span>
                    <div class="mt-2">
                        <span class="badge bg-info">${shelter.distance} km away</span>
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Available Features:</h6>
                    <div class="feature-list">
                        ${shelter.features.map(feature => `
                            <div class="feature-item mb-1">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                ${feature}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="col-md-6">
                    <h6>Current Status:</h6>
                    <div class="mb-2">
                        <span class="badge ${shelter.available_spots > 10 ? 'bg-success' : 'bg-warning'}">
                            Available Spots: ${shelter.available_spots}
                        </span>
                    </div>
                    <div class="mb-2">
                        <small>Last Updated: ${shelter.last_updated}</small>
                    </div>
                    <div class="mb-2">
                        <small>Air Quality Inside: ${shelter.inside_aqi} AQI</small>
                    </div>
                </div>
            </div>
            
            <div class="d-flex justify-content-between">
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="getShelterDirections('${shelter.name}', ${shelter.coords[0]}, ${shelter.coords[1]})">
                        <i class="fas fa-directions me-1"></i>Directions
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="showShelterDetails('${shelter.id}')">
                        <i class="fas fa-info-circle me-1"></i>Details
                    </button>
                </div>
                <div>
                    <button class="btn btn-sm ${shelter.available ? 'btn-success' : 'btn-secondary'}" 
                            onclick="bookShelter('${shelter.id}')"
                            ${!shelter.available ? 'disabled' : ''}>
                        <i class="fas fa-check me-1"></i>Book Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = sheltersHtml;
}

/**
 * Get directions to shelter
 * @param {string} name - Shelter name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function getShelterDirections(name, lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
}

/**
 * Show shelter details
 * @param {string} shelterId - Shelter ID
 */
function showShelterDetails(shelterId) {
    const shelter = citizenState.shelters.find(s => s.id === shelterId);
    if (!shelter) return;
    
    const details = `
        <strong>${shelter.name}</strong><br>
        <p>${shelter.address}</p>
        <hr>
        <strong>Contact Information:</strong><br>
        Phone: ${shelter.phone || 'Not available'}<br>
        Email: ${shelter.email || 'Not available'}<br>
        <hr>
        <strong>Operating Hours:</strong><br>
        ${shelter.operating_hours}<br>
        <hr>
        <strong>Rules and Regulations:</strong><br>
        <ul>
            <li>Bring valid ID proof</li>
            <li>Pets are not allowed</li>
            <li>Smoking is prohibited</li>
            <li>Maximum stay: 12 hours</li>
            <li>Follow staff instructions</li>
        </ul>
    `;
    
    showAlert(details, 'info');
}

/**
 * Book a shelter
 * @param {string} shelterId - Shelter ID
 */
function bookShelter(shelterId) {
    const shelter = citizenState.shelters.find(s => s.id === shelterId);
    if (!shelter || !shelter.available) {
        showAlert('Shelter is not available for booking', 'error');
        return;
    }
    
    if (confirm(`Do you want to book ${shelter.name}?\n\nAddress: ${shelter.address}\nAvailable spots: ${shelter.available_spots}`)) {
        showAlert('Shelter booked successfully! You will receive a confirmation message.', 'success');
        
        // Update shelter availability in UI
        loadShelters(document.getElementById('showOnlyAvailable').checked);
    }
}

// ============================================================================
// EVENTS FUNCTIONALITY
// ============================================================================

/**
 * Initialize events section
 */
function initializeEvents() {
    console.log('Initializing events section...');
    
    // Setup event filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterEvents(filter);
            
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Load events
    loadEvents();
}

/**
 * Load events data
 */
async function loadEvents() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        citizenState.events = generateMockEvents();
        
        // Display events
        displayEvents(citizenState.events);
        
    } catch (error) {
        console.error('Error loading events:', error);
        showAlert('Failed to load events. Please try again.', 'error');
    }
}

/**
 * Display events in UI
 * @param {Array} events - Events to display
 */
function displayEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-calendar-times fa-3x mb-3"></i>
                <p>No upcoming events</p>
                <p class="small">Check back later for new events</p>
            </div>
        `;
        return;
    }
    
    const eventsHtml = events.map(event => `
        <div class="event-item border rounded p-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h5 class="mb-1">${event.title}</h5>
                    <p class="text-muted mb-1">
                        <i class="fas fa-calendar me-1"></i> ${event.date} | 
                        <i class="fas fa-clock me-1"></i> ${event.time} |
                        <i class="fas fa-map-marker-alt me-1"></i> ${event.location}
                    </p>
                    <p class="mb-2">${event.description}</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-${getEventTypeColor(event.type)}">${event.type}</span>
                    <div class="mt-2">
                        <span class="badge ${event.points > 0 ? 'bg-success' : 'bg-secondary'}">
                            ${event.points} points
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <small class="text-muted">
                        <i class="fas fa-users me-1"></i> ${event.participants} participants |
                        <i class="fas ${event.certificate ? 'fa-award text-warning' : ''} me-1"></i> 
                        ${event.certificate ? 'Certificate available' : ''}
                    </small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="viewEventDetails('${event.id}')">
                        <i class="fas fa-info-circle me-1"></i>Details
                    </button>
                    <button class="btn btn-sm ${event.registered ? 'btn-secondary' : 'btn-success'}" 
                            onclick="${event.registered ? 'unregisterEvent' : 'registerEvent'}('${event.id}')"
                            ${event.registered ? 'disabled' : ''}>
                        <i class="fas ${event.registered ? 'fa-check' : 'fa-sign-in-alt'} me-1"></i>
                        ${event.registered ? 'Registered' : 'Register'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = eventsHtml;
}

/**
 * Filter events by type
 * @param {string} filter - Filter type
 */
function filterEvents(filter) {
    if (filter === 'all') {
        displayEvents(citizenState.events);
        return;
    }
    
    const filtered = citizenState.events.filter(event => event.type === filter);
    displayEvents(filtered);
}

/**
 * View event details
 * @param {string} eventId - Event ID
 */
function viewEventDetails(eventId) {
    const event = citizenState.events.find(e => e.id === eventId);
    if (!event) return;
    
    const details = `
        <strong>${event.title}</strong><br>
        <p><i class="fas fa-calendar me-1"></i> ${event.date} at ${event.time}</p>
        <p><i class="fas fa-map-marker-alt me-1"></i> ${event.location}</p>
        <hr>
        <strong>Description:</strong><br>
        <p>${event.description}</p>
        <hr>
        <strong>Additional Information:</strong><br>
        <ul>
            <li>Type: ${event.type}</li>
            <li>Duration: ${event.duration}</li>
            <li>Participants: ${event.participants}</li>
            <li>Points Awarded: ${event.points}</li>
            <li>Certificate: ${event.certificate ? 'Yes' : 'No'}</li>
            <li>Contact: ${event.contact || 'Not provided'}</li>
        </ul>
        <hr>
        <strong>Requirements:</strong><br>
        <p>${event.requirements || 'No special requirements'}</p>
    `;
    
    showAlert(details, 'info');
}

/**
 * Register for an event
 * @param {string} eventId - Event ID
 */
function registerEvent(eventId) {
    const event = citizenState.events.find(e => e.id === eventId);
    if (!event) return;
    
    if (confirm(`Register for "${event.title}"?\n\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}`)) {
        showAlert(`Successfully registered for "${event.title}"!`, 'success');
        
        // Update event status
        event.registered = true;
        event.participants++;
        
        // Update UI
        displayEvents(citizenState.events);
        
        // Update user points
        updateUserPoints((parseInt(document.getElementById('eventPoints').textContent) || 0) + event.points);
    }
}

/**
 * Unregister from an event
 * @param {string} eventId - Event ID
 */
function unregisterEvent(eventId) {
    const event = citizenState.events.find(e => e.id === eventId);
    if (!event) return;
    
    if (confirm(`Cancel registration for "${event.title}"?`)) {
        showAlert('Registration cancelled successfully', 'info');
        
        // Update event status
        event.registered = false;
        event.participants = Math.max(0, event.participants - 1);
        
        // Update UI
        displayEvents(citizenState.events);
    }
}

// ============================================================================
// AR FUNCTIONALITY
// ============================================================================

/**
 * Initialize AR functionality
 */
function initializeAR() {
    console.log('Initializing AR functionality...');
    
    // Setup AR button
    document.getElementById('startAR').addEventListener('click', startARExperience);
}

/**
 * Start AR experience
 */
function startARExperience() {
    showAlert('Starting AR experience... Please allow camera access.', 'info');
    
    // Check for device compatibility
    if (!isARSupported()) {
        showAlert('AR is not supported on your device', 'error');
        return;
    }
    
    // In a real app, this would launch AR view
    // For demo, we'll show a simulation
    simulateAR();
}

/**
 * Check if AR is supported
 * @returns {boolean} - AR support status
 */
function isARSupported() {
    // Basic device detection for AR support
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for ARCore (Android) or ARKit (iOS)
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    return (isAndroid && parseFloat(getAndroidVersion()) >= 8.0) || 
           (isIOS && parseFloat(getIOSVersion()) >= 11.0);
}

/**
 * Get Android version
 * @returns {string} - Android version
 */
function getAndroidVersion() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const match = userAgent.match(/Android\s([0-9\.]+)/);
    return match ? match[1] : '0';
}

/**
 * Get iOS version
 * @returns {string} - iOS version
 */
function getIOSVersion() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const match = userAgent.match(/OS\s([0-9_]+)/);
    return match ? match[1].replace('_', '.') : '0';
}

/**
 * Simulate AR experience (for demo)
 */
function simulateAR() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        padding: 20px;
    `;
    
    overlay.innerHTML = `
        <h3>AR Experience Simulation</h3>
        <p>Point your camera at your surroundings to see pollution data</p>
        
        <div style="background: #222; border-radius: 10px; padding: 20px; margin: 20px 0; width: 80%;">
            <h4>Pollution Hotspots Detected</h4>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 15px 0;">
                <div style="background: rgba(255,0,0,0.3); padding: 10px; border-radius: 5px;">
                    <strong>Traffic</strong><br>
                    AQI: 280
                </div>
                <div style="background: rgba(255,165,0,0.3); padding: 10px; border-radius: 5px;">
                    <strong>Construction</strong><br>
                    Dust Level: High
                </div>
                <div style="background: rgba(0,255,0,0.3); padding: 10px; border-radius: 5px;">
                    <strong>Park Area</strong><br>
                    AQI: 120
                </div>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <button id="arCapture" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px;">
                <i class="fas fa-camera"></i> Capture Image
            </button>
            <button id="arClose" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px;">
                <i class="fas fa-times"></i> Exit AR
            </button>
        </div>
        
        <p style="font-size: 12px; margin-top: 20px;">
            <i class="fas fa-info-circle"></i> This is a simulation. In real AR mode, you would see pollution data overlaid on your camera view.
        </p>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('arCapture').addEventListener('click', function() {
        showAlert('Image captured! You can use this to report pollution.', 'success');
    });
    
    document.getElementById('arClose').addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
}

// ============================================================================
// HEALTH & BREATHING FUNCTIONALITY
// ============================================================================

/**
 * Initialize health section
 */
function initializeHealth() {
    console.log('Initializing health section...');
    
    // Setup health form
    document.getElementById('healthForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateHealthRecommendations();
    });
    
    // Setup breathing exercise
    document.getElementById('startBreathing').addEventListener('click', startBreathingExercise);
    document.getElementById('pauseBreathing').addEventListener('click', pauseBreathingExercise);
    
    // Load default recommendations
    loadDefaultHealthRecommendations();
}

/**
 * Generate health recommendations based on form
 */
function generateHealthRecommendations() {
    const age = parseInt(document.getElementById('age').value);
    const hasCondition = document.querySelector('input[name="respiratoryCondition"]:checked').value === 'yes';
    const smokes = document.querySelector('input[name="smoking"]:checked').value === 'yes';
    const activityLevel = document.getElementById('activityLevel').value;
    
    // Get current AQI
    const currentAQI = parseInt(document.getElementById('mainAQI').textContent) || 200;
    
    // Generate recommendations
    let recommendations = [];
    
    // Age-based recommendations
    if (age < 12) {
        recommendations.push('Children are more sensitive to air pollution. Limit outdoor activities when AQI is high.');
    } else if (age > 60) {
        recommendations.push('Older adults should take extra precautions during high pollution days.');
    }
    
    // Condition-based recommendations
    if (hasCondition) {
        recommendations.push('Keep your inhaler/medications readily available.');
        recommendations.push('Consider using air purifiers at home.');
        recommendations.push('Monitor your symptoms closely and seek medical help if they worsen.');
    }
    
    // Smoking recommendations
    if (smokes) {
        recommendations.push('Consider reducing or quitting smoking to improve lung health.');
        recommendations.push('Smoking increases vulnerability to air pollution effects.');
    }
    
    // Activity level recommendations
    if (activityLevel === 'sedentary') {
        recommendations.push('Consider indoor exercises on high pollution days.');
    } else if (activityLevel === 'very') {
        recommendations.push('Reduce intensity and duration of outdoor exercise when AQI is high.');
    }
    
    // AQI-based recommendations
    if (currentAQI > 200) {
        recommendations.push('Avoid outdoor activities, especially during morning and evening hours.');
        recommendations.push('Wear N95 masks when going outside.');
        recommendations.push('Keep windows and doors closed at home.');
    }
    
    if (currentAQI > 300) {
        recommendations.push('Consider using air purifiers with HEPA filters.');
        recommendations.push('Stay in well-ventilated areas with air conditioning.');
        recommendations.push('Hydrate well to help your body flush out pollutants.');
    }
    
    // General recommendations
    recommendations.push('Eat foods rich in antioxidants (fruits, vegetables) to combat oxidative stress.');
    recommendations.push('Practice breathing exercises regularly to improve lung capacity.');
    recommendations.push('Monitor AQI levels regularly and plan activities accordingly.');
    
    // Display recommendations
    displayHealthRecommendations(recommendations);
    
    // Show success message
    showAlert('Health recommendations generated based on your profile', 'success');
}

/**
 * Display health recommendations
 * @param {Array} recommendations - Recommendations to display
 */
function displayHealthRecommendations(recommendations) {
    const container = document.getElementById('personalHealthRecommendations');
    
    const recommendationsHtml = `
        <div class="row">
            <div class="col-md-6">
                <h5>Immediate Actions:</h5>
                <ul>
                    ${recommendations.slice(0, Math.ceil(recommendations.length / 2)).map(rec => `
                        <li>${rec}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="col-md-6">
                <h5>Long-term Strategies:</h5>
                <ul>
                    ${recommendations.slice(Math.ceil(recommendations.length / 2)).map(rec => `
                        <li>${rec}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
        <div class="alert alert-info mt-3">
            <i class="fas fa-lightbulb me-2"></i>
            <strong>Tip:</strong> These recommendations are based on your profile and current air quality conditions.
            Always consult with a healthcare provider for personalized medical advice.
        </div>
    `;
    
    container.innerHTML = recommendationsHtml;
}

/**
 * Load default health recommendations
 */
function loadDefaultHealthRecommendations() {
    const defaultRecs = [
        'Check AQI levels before planning outdoor activities.',
        'Wear appropriate masks when air quality is poor.',
        'Stay hydrated to help your body flush out pollutants.',
        'Include antioxidant-rich foods in your diet.',
        'Practice breathing exercises regularly.'
    ];
    
    displayHealthRecommendations(defaultRecs);
}

/**
 * Start breathing exercise
 */
function startBreathingExercise() {
    const circle = document.getElementById('breathingCircle');
    const instruction = document.getElementById('breathingInstruction');
    const timer = document.getElementById('breathingTimer');
    const startBtn = document.getElementById('startBreathing');
    const pauseBtn = document.getElementById('pauseBreathing');
    
    let phase = 'inhale'; // inhale, hold, exhale, hold
    let count = 4;
    
    // Show pause button, hide start button
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    
    // Start animation
    circle.classList.add('breathing-animation');
    
    // Start interval
    citizenState.breathingInterval = setInterval(() => {
        count--;
        
        if (count <= 0) {
            // Move to next phase
            switch (phase) {
                case 'inhale':
                    phase = 'hold';
                    count = 4;
                    instruction.textContent = 'Hold your breath';
                    timer.textContent = 'Hold for 4 seconds';
                    circle.innerHTML = '<i class="fas fa-lungs fa-3x"></i><div class="mt-2">Hold</div>';
                    break;
                case 'hold':
                    phase = 'exhale';
                    count = 6;
                    instruction.textContent = 'Breathe out slowly';
                    timer.textContent = 'Exhale for 6 seconds';
                    circle.innerHTML = '<i class="fas fa-lungs fa-3x"></i><div class="mt-2">Breathe Out</div>';
                    break;
                case 'exhale':
                    phase = 'hold';
                    count = 2;
                    instruction.textContent = 'Hold your breath';
                    timer.textContent = 'Hold for 2 seconds';
                    circle.innerHTML = '<i class="fas fa-lungs fa-3x"></i><div class="mt-2">Hold</div>';
                    break;
                case 'hold':
                    phase = 'inhale';
                    count = 4;
                    instruction.textContent = 'Breathe in through your nose';
                    timer.textContent = 'Inhale for 4 seconds';
                    circle.innerHTML = '<i class="fas fa-lungs fa-3x"></i><div class="mt-2">Breathe In</div>';
                    break;
            }
        } else {
            timer.textContent = `${count} seconds remaining`;
        }
    }, 1000);
    
    // Show info
    showAlert('Breathing exercise started. Follow the instructions.', 'info');
}

/**
 * Pause breathing exercise
 */
function pauseBreathingExercise() {
    const startBtn = document.getElementById('startBreathing');
    const pauseBtn = document.getElementById('pauseBreathing');
    
    // Clear interval
    if (citizenState.breathingInterval) {
        clearInterval(citizenState.breathingInterval);
        citizenState.breathingInterval = null;
    }
    
    // Pause animation
    document.getElementById('breathingCircle').classList.remove('breathing-animation');
    
    // Show start button, hide pause button
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    
    // Update instruction
    document.getElementById('breathingInstruction').textContent = 'Breathing Exercise Paused';
    document.getElementById('breathingTimer').textContent = 'Click Start to continue';
}

// ============================================================================
// POLICY RATING FUNCTIONALITY
// ============================================================================

/**
 * Initialize policy rating section
 */
function initializePolicyRating() {
    console.log('Initializing policy rating section...');
    
    // Load policies
    loadPolicies();
}

/**
 * Load policies for rating
 */
async function loadPolicies() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        citizenState.policies = generateMockPolicies();
        
        // Display policies
        displayPolicies(citizenState.policies);
        
        // Initialize chart
        initializePolicyChart();
        
    } catch (error) {
        console.error('Error loading policies:', error);
        showAlert('Failed to load policies. Please try again.', 'error');
    }
}

/**
 * Display policies for rating
 * @param {Array} policies - Policies to display
 */
function displayPolicies(policies) {
    const container = document.getElementById('policiesList');
    
    const policiesHtml = policies.map(policy => `
        <div class="policy-item border rounded p-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h5 class="mb-1">${policy.title}</h5>
                    <p class="text-muted mb-2">${policy.description}</p>
                    <p class="mb-0"><small>Status: ${policy.status} | Implemented: ${policy.implemented}</small></p>
                </div>
                <div class="text-end">
                    <div class="policy-rating">
                        <div class="rating-stars mb-2">
                            ${[1,2,3,4,5].map(star => `
                                <i class="fas fa-star ${star <= policy.userRating ? 'text-warning' : 'text-muted'}" 
                                   onclick="ratePolicy('${policy.id}', ${star})"
                                   style="cursor: pointer;"></i>
                            `).join('')}
                        </div>
                        <small>${policy.userRating ? 'Your rating: ' + policy.userRating + '/5' : 'Rate this policy'}</small>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <h6>Policy Impact:</h6>
                    <p>${policy.impact}</p>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewPolicyDetails('${policy.id}')">
                        <i class="fas fa-info-circle me-1"></i>More Info
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = policiesHtml;
}

/**
 * Rate a policy
 * @param {string} policyId - Policy ID
 * @param {number} rating - Rating value (1-5)
 */
function ratePolicy(policyId, rating) {
    const policy = citizenState.policies.find(p => p.id === policyId);
    if (!policy) return;
    
    // Update policy rating
    policy.userRating = rating;
    
    // Update UI
    displayPolicies(citizenState.policies);
    
    // Update chart
    updatePolicyChart();
    
    // Update user points
    updateUserPoints((parseInt(document.getElementById('citizenPoints').textContent) || 0) + 5);
    
    // Show success message
    showAlert(`Thank you for rating "${policy.title}"! You earned 5 points.`, 'success');
}

/**
 * View policy details
 * @param {string} policyId - Policy ID
 */
function viewPolicyDetails(policyId) {
    const policy = citizenState.policies.find(p => p.id === policyId);
    if (!policy) return;
    
    const details = `
        <strong>${policy.title}</strong><br>
        <p>${policy.description}</p>
        <hr>
        <strong>Implementation Details:</strong><br>
        <p>${policy.implementation_details}</p>
        <hr>
        <strong>Expected Outcomes:</strong><br>
        <ul>
            ${policy.outcomes.map(outcome => `<li>${outcome}</li>`).join('')}
        </ul>
        <hr>
        <strong>Coverage Area:</strong><br>
        <p>${policy.coverage}</p>
        <hr>
        <strong>Contact for Feedback:</strong><br>
        <p>${policy.contact}</p>
    `;
    
    showAlert(details, 'info');
}

/**
 * Initialize policy impact chart
 */
function initializePolicyChart() {
    const ctx = document.getElementById('policyImpactChart').getContext('2d');
    
    citizenState.charts.policy = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: citizenState.policies.map(p => p.title),
            datasets: [{
                label: 'Average Rating',
                data: citizenState.policies.map(p => p.averageRating),
                backgroundColor: citizenState.policies.map(p => {
                    if (p.averageRating >= 4) return '#28a745';
                    if (p.averageRating >= 3) return '#ffc107';
                    return '#dc3545';
                })
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Average Rating (1-5)'
                    }
                }
            }
        }
    });
}

/**
 * Update policy chart
 */
function updatePolicyChart() {
    if (!citizenState.charts.policy) return;
    
    citizenState.charts.policy.data.datasets[0].data = citizenState.policies.map(p => p.averageRating);
    citizenState.charts.policy.update();
}

// ============================================================================
// PROFILE FUNCTIONALITY
// ============================================================================

/**
 * Initialize profile section
 */
function initializeProfile() {
    console.log('Initializing profile section...');
    
    // Setup profile form
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Setup password form
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
    
    // Setup dangerous actions
    document.getElementById('exportData').addEventListener('click', exportUserData);
    document.getElementById('deleteComplaints').addEventListener('click', deleteAllComplaints);
    document.getElementById('deleteAccount').addEventListener('click', deleteAccount);
    
    // Load user stats
    loadUserStats();
}

/**
 * Update user profile
 */
async function updateProfile() {
    const profileData = {
        name: document.getElementById('profileFullName').value,
        mobile: document.getElementById('profileMobile').value,
        address: document.getElementById('profileAddress').value,
        location: document.getElementById('profileLocation').value
    };
    
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate it
        await simulateApiCall({ type: 'profile_update', data: profileData });
        
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('currentUser'));
        Object.assign(user, profileData);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        document.getElementById('userName').textContent = profileData.name || 'Citizen';
        document.getElementById('profileUserName').textContent = profileData.name || 'Citizen User';
        document.getElementById('profileUserLocation').textContent = profileData.location || 'Delhi, India';
        
        showAlert('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('Failed to update profile. Please try again.', 'error');
    }
}

/**
 * Change user password
 */
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showAlert('New password must be at least 8 characters', 'error');
        return;
    }
    
    try {
        // In a real app, this would verify current password via API
        // For demo, we'll just simulate
        await simulateApiCall({ type: 'password_change', data: { newPassword } });
        
        // Clear form
        document.getElementById('passwordForm').reset();
        
        showAlert('Password changed successfully!', 'success');
        
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('Failed to change password. Please try again.', 'error');
    }
}

/**
 * Export user data
 */
function exportUserData() {
    if (!confirm('Export all your data? This may take a moment.')) {
        return;
    }
    
    try {
        // Gather user data
        const userData = {
            profile: citizenState.currentUser,
            complaints: citizenState.complaints,
            events: citizenState.events,
            ratings: citizenState.policies.filter(p => p.userRating).map(p => ({
                policy: p.title,
                rating: p.userRating
            })),
            timestamp: new Date().toISOString()
        };
        
        // Create download
        const dataStr = JSON.stringify(userData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `aqi_citizen_data_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showAlert('Data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Failed to export data. Please try again.', 'error');
    }
}

/**
 * Delete all complaints
 */
function deleteAllComplaints() {
    if (!confirm('Delete all your complaints? This action cannot be undone.')) {
        return;
    }
    
    try {
        // In a real app, this would be an API call
        // For demo, just update state
        citizenState.complaints = [];
        
        // Update UI
        updateComplaintStats();
        displayComplaints([]);
        
        showAlert('All complaints deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting complaints:', error);
        showAlert('Failed to delete complaints. Please try again.', 'error');
    }
}

/**
 * Delete user account
 */
function deleteAccount() {
    if (!confirm('Delete your account? This will remove all your data and cannot be undone.')) {
        return;
    }
    
    if (prompt('Type "DELETE" to confirm account deletion:') !== 'DELETE') {
        showAlert('Account deletion cancelled', 'info');
        return;
    }
    
    try {
        // In a real app, this would be an API call
        // For demo, just log out
        showAlert('Account deletion request submitted. Logging out...', 'info');
        
        setTimeout(() => {
            logout();
        }, 2000);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showAlert('Failed to delete account. Please try again.', 'error');
    }
}

/**
 * Load user statistics
 */
function loadUserStats() {
    // Update stats from state
    document.getElementById('totalPoints').textContent = citizenState.user.points;
    document.getElementById('totalComplaintsStat').textContent = citizenState.complaints.length;
    document.getElementById('eventsAttended').textContent = citizenState.events.filter(e => e.registered).length;
    document.getElementById('policiesRated').textContent = citizenState.policies.filter(p => p.userRating).length;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show section by ID
 * @param {string} sectionId - Section ID to show
 */
function showSection(sectionId) {
    citizenState.currentSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${sectionId}-section-content`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
    
    // Load section data if needed
    switch (sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'tracking':
            loadComplaints();
            break;
        case 'map':
            refreshMap();
            break;
        case 'hospitals':
            loadHospitals();
            break;
        case 'shelters':
            loadShelters();
            break;
        case 'events':
            loadEvents();
            break;
        case 'policy-rating':
            loadPolicies();
            break;
        case 'profile':
            loadUserStats();
            break;
    }
}

/**
 * Handle sidebar navigation
 * @param {Event} event - Click event
 */
function handleSidebarNavigation(event) {
    event.preventDefault();
    
    const sectionId = this.getAttribute('data-section');
    if (sectionId) {
        showSection(sectionId);
    }
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar.style.left === '0px') {
        sidebar.style.left = '-250px';
        overlay.style.display = 'none';
    } else {
        sidebar.style.left = '0';
        overlay.style.display = 'block';
    }
}

/**
 * Toggle notification panel
 */
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    
    // Hide profile panel if open
    document.getElementById('profilePanel').style.display = 'none';
}

/**
 * Toggle profile panel
 */
function toggleProfilePanel() {
    const panel = document.getElementById('profilePanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    
    // Hide notification panel if open
    document.getElementById('notificationPanel').style.display = 'none';
}

/**
 * Toggle chatbot panel
 */
function toggleChatbotPanel() {
    const panel = document.getElementById('chatbotPanel');
    if (panel.style.right === '0px') {
        panel.style.right = '-350px';
    } else {
        panel.style.right = '0';
    }
}

/**
 * Toggle voice panel
 */
function toggleVoicePanel() {
    showAlert('Voice commands activated. Say "Report pollution" or "Check AQI".', 'info');
    
    // In a real app, this would initialize voice recognition
    // For demo, we'll just show a message
}

/**
 * Show emergency help
 */
function showEmergencyHelp() {
    const emergencyNumbers = `
        <strong>Emergency Contacts:</strong><br><br>
        🚨 National Emergency: <strong>112</strong><br>
        🚑 Ambulance: <strong>102</strong><br>
        🏥 Delhi Pollution Control Committee: <strong>011-23860182</strong><br>
        🌡️ Health Helpline: <strong>104</strong><br><br>
        
        <button class="btn btn-danger btn-sm" onclick="window.location.href='tel:112'">
            <i class="fas fa-phone me-2"></i>Call 112 Now
        </button>
    `;
    
    showAlert(emergencyNumbers, 'danger');
}

/**
 * Send chatbot message
 */
function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatbotMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const response = getChatbotResponse(message);
        addChatbotMessage(response, 'bot');
    }, 1000);
}

/**
 * Add message to chatbot
 * @param {string} message - Message text
 * @param {string} sender - 'user' or 'bot'
 */
function addChatbotMessage(message, sender) {
    const container = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = message;
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

/**
 * Get chatbot response
 * @param {string} message - User message
 * @returns {string} - Bot response
 */
function getChatbotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('aqi') || lowerMessage.includes('air quality')) {
        const currentAQI = document.getElementById('mainAQI').textContent;
        const category = document.getElementById('mainAQICategory').textContent;
        return `Current AQI is ${currentAQI} (${category}). ${getAQIDescription(parseInt(currentAQI))}`;
    }
    
    if (lowerMessage.includes('complaint') || lowerMessage.includes('report')) {
        return 'You can submit a pollution complaint in the "Submit Complaint" section. Remember to include location and photos for faster resolution.';
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('sick')) {
        return 'For health concerns, check the "Health & Breathing" section. If you have emergency symptoms, seek medical help immediately.';
    }
    
    if (lowerMessage.includes('mask') || lowerMessage.includes('n95')) {
        return 'Wear N95 masks when AQI is above 200. Make sure the mask fits properly for best protection.';
    }
    
    if (lowerMessage.includes('shelter') || lowerMessage.includes('clean air')) {
        return 'Clean air shelters are available during severe pollution. Check the "AQI Shelters" section for locations and availability.';
    }
    
    if (lowerMessage.includes('event') || lowerMessage.includes('participate')) {
        return 'You can find environmental events in the "Events" section. Participation earns you citizen points!';
    }
    
    return "I'm here to help with air quality information. You can ask me about AQI, complaints, health tips, shelters, or events. How can I assist you?";
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsRead() {
    const badge = document.getElementById('notificationCount');
    badge.textContent = '0';
    badge.style.display = 'none';
    
    showAlert('All notifications marked as read', 'success');
}

/**
 * Load notifications
 */
function loadNotifications() {
    // Mock notifications for demo
    const notifications = [
        { id: 1, message: 'Your complaint #COMP-1234 is now "In Progress"', time: '2 hours ago', read: false },
        { id: 2, message: 'Tree plantation event this Saturday at Lodhi Garden', time: '1 day ago', read: false },
        { id: 3, message: 'Air Quality Alert: AQI expected to be Very Poor tomorrow', time: '2 days ago', read: true }
    ];
    
    // Update badge
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationCount');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    
    // Display notifications
    const container = document.getElementById('notificationPanelContent');
    const notificationsHtml = notifications.map(notif => `
        <div class="notification-item border-bottom p-3 ${notif.read ? 'read' : 'unread'}">
            <p class="mb-1">${notif.message}</p>
            <small class="text-muted">${notif.time}</small>
        </div>
    `).join('');
    
    container.innerHTML = notificationsHtml || '<div class="text-center text-muted py-4"><p>No new notifications</p></div>';
}

/**
 * Get status color class
 * @param {string} status - Status string
 * @returns {string} - Bootstrap color class
 */
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'secondary';
        case 'in-progress': return 'info';
        case 'under-investigation': return 'warning';
        case 'resolved': return 'success';
        default: return 'secondary';
    }
}

/**
 * Get status CSS class
 * @param {string} status - Status string
 * @returns {string} - CSS class
 */
function getStatusClass(status) {
    return `status-${status.replace('-', '')}`;
}

/**
 * Get priority CSS class
 * @param {string} priority - Priority string
 * @returns {string} - CSS class
 */
function getPriorityClass(priority) {
    switch (priority) {
        case 'critical': return 'priority-critical';
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-low';
    }
}

/**
 * Get event type color
 * @param {string} type - Event type
 * @returns {string} - Bootstrap color class
 */
function getEventTypeColor(type) {
    switch (type) {
        case 'workshop': return 'primary';
        case 'volunteering': return 'success';
        case 'seminar': return 'info';
        case 'campaign': return 'warning';
        default: return 'secondary';
    }
}

/**
 * Get complaint type label
 * @param {string} type - Complaint type key
 * @returns {string} - Human readable label
 */
function getComplaintTypeLabel(type) {
    const labels = {
        'industrial_pollution': 'Industrial Pollution',
        'vehicle_emission': 'Vehicle Emission',
        'construction_dust': 'Construction Dust',
        'waste_burning': 'Waste Burning',
        'garbage_dumping': 'Garbage Dumping',
        'water_pollution': 'Water Pollution',
        'noise_pollution': 'Noise Pollution',
        'other': 'Other'
    };
    
    return labels[type] || type;
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, error, info, warning)
 */
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
    `;
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to body
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// ============================================================================
// MOCK DATA GENERATORS (For demo purposes)
// ============================================================================

/**
 * Generate mock dashboard data
 * @returns {Object} - Mock dashboard data
 */
function generateMockDashboardData() {
    return {
        aqi: Math.floor(100 + Math.random() * 300),
        weather: {
            temperature: Math.floor(15 + Math.random() * 15),
            humidity: Math.floor(40 + Math.random() * 40),
            wind_speed: (Math.random() * 5).toFixed(1),
            visibility: (5 + Math.random() * 10).toFixed(1)
        },
        pollutants: {
            'PM2.5': Math.floor(50 + Math.random() * 200),
            'PM10': Math.floor(100 + Math.random() * 300),
            'NO₂': Math.floor(20 + Math.random() * 80),
            'SO₂': Math.floor(10 + Math.random() * 40),
            'O₃': Math.floor(30 + Math.random() * 70),
            'CO': Math.floor(1 + Math.random() * 4)
        },
        health: [
            'Avoid outdoor activities during morning hours',
            'Wear N95 mask if going outside',
            'Keep windows closed at home',
            'Use air purifier if available',
            'Stay hydrated throughout the day'
        ],
        complaints: [
            { id: 'COMP-001', type: 'vehicle_emission', status: 'pending', location: 'Connaught Place', date: '2024-01-15' },
            { id: 'COMP-002', type: 'waste_burning', status: 'in-progress', location: 'Dwarka', date: '2024-01-14' },
            { id: 'COMP-003', type: 'construction_dust', status: 'resolved', location: 'Rohini', date: '2024-01-10' }
        ],
        forecast: Array.from({ length: 12 }, (_, i) => ({
            time: `${i * 2}:00`,
            aqi: Math.floor(150 + Math.random() * 150 - Math.sin(i) * 50)
        })),
        points: Math.floor(Math.random() * 100)
    };
}

/**
 * Generate mock complaints
 * @returns {Array} - Mock complaints
 */
function generateMockComplaints() {
    const types = ['industrial_pollution', 'vehicle_emission', 'construction_dust', 'waste_burning', 'garbage_dumping'];
    const statuses = ['pending', 'in-progress', 'under-investigation', 'resolved'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const locations = ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Mayur Vihar'];
    
    return Array.from({ length: 8 }, (_, i) => ({
        id: `COMP-${1000 + i}`,
        type: types[Math.floor(Math.random() * types.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        description: 'Sample complaint description about pollution issue in the area.',
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        photos: []
    }));
}

/**
 * Generate mock hospitals
 * @returns {Array} - Mock hospitals
 */
function generateMockHospitals() {
    return [
        {
            name: 'AIIMS Delhi',
            address: 'Ansari Nagar, New Delhi',
            phone: '+91-11-26588500',
            hours: '24/7 Emergency',
            distance: (Math.random() * 5).toFixed(1),
            specialties: ['Respiratory', 'Emergency', 'Cardiology'],
            emergency: true,
            coords: [28.5671, 77.2111]
        },
        {
            name: 'Safdarjung Hospital',
            address: 'Ansari Nagar East, New Delhi',
            phone: '+91-11-26707000',
            hours: '24/7',
            distance: (Math.random() * 8).toFixed(1),
            specialties: ['Pulmonology', 'General Medicine', 'Pediatrics'],
            emergency: true,
            coords: [28.5679, 77.2082]
        },
        {
            name: 'Sir Ganga Ram Hospital',
            address: 'Rajinder Nagar, New Delhi',
            phone: '+91-11-25750000',
            hours: '24/7',
            distance: (Math.random() * 10).toFixed(1),
            specialties: ['Respiratory Medicine', 'ICU', 'Surgery'],
            emergency: true,
            coords: [28.6428, 77.1881]
        }
    ];
}

/**
 * Generate mock shelters
 * @returns {Array} - Mock shelters
 */
function generateMockShelters() {
    return [
        {
            id: 'SHELTER-001',
            name: 'Delhi Government AQI Shelter - CP',
            address: 'Connaught Place, New Delhi',
            capacity: 50,
            available: Math.random() > 0.3,
            available_spots: Math.floor(Math.random() * 50),
            distance: (Math.random() * 3).toFixed(1),
            features: ['HEPA Air Purifiers', 'Medical Staff', 'N95 Masks', 'Wi-Fi', 'Water'],
            inside_aqi: Math.floor(50 + Math.random() * 100),
            last_updated: '30 minutes ago',
            operating_hours: '24/7 during high pollution alerts',
            coords: [28.6304, 77.2177]
        },
        {
            id: 'SHELTER-002',
            name: 'Community Clean Air Center - Dwarka',
            address: 'Sector 14, Dwarka, Delhi',
            capacity: 30,
            available: Math.random() > 0.5,
            available_spots: Math.floor(Math.random() * 30),
            distance: (Math.random() * 5).toFixed(1),
            features: ['Air Purifiers', 'First Aid', 'Seating', 'Charging Points'],
            inside_aqi: Math.floor(60 + Math.random() * 80),
            last_updated: '1 hour ago',
            operating_hours: '6 AM - 10 PM',
            coords: [28.5925, 77.0396]
        }
    ];
}

/**
 * Generate mock events
 * @returns {Array} - Mock events
 */
function generateMockEvents() {
    return [
        {
            id: 'EVENT-001',
            title: 'Tree Plantation Drive',
            type: 'volunteering',
            date: '2024-01-20',
            time: '9:00 AM - 12:00 PM',
            location: 'Lodhi Garden, Delhi',
            description: 'Join us in planting trees to combat air pollution.',
            participants: 45,
            points: 20,
            certificate: true,
            duration: '3 hours',
            requirements: 'Comfortable clothes, water bottle',
            registered: Math.random() > 0.5
        },
        {
            id: 'EVENT-002',
            title: 'Air Pollution Awareness Workshop',
            type: 'workshop',
            date: '2024-01-22',
            time: '2:00 PM - 4:00 PM',
            location: 'India Habitat Centre',
            description: 'Learn about air pollution causes, effects, and solutions.',
            participants: 60,
            points: 15,
            certificate: true,
            duration: '2 hours',
            requirements: 'None',
            registered: Math.random() > 0.7
        }
    ];
}

/**
 * Generate mock policies
 * @returns {Array} - Mock policies
 */
function generateMockPolicies() {
    return [
        {
            id: 'POLICY-001',
            title: 'Odd-Even Vehicle Scheme',
            description: 'Restricts private vehicles based on registration numbers to reduce traffic congestion and emissions.',
            status: 'Active',
            implemented: '2016',
            impact: 'Reduced vehicular emissions by 15% during implementation periods.',
            averageRating: 3.8,
            userRating: null,
            implementation_details: 'Implemented during winter months when pollution levels peak.',
            outcomes: ['Reduced traffic congestion', 'Lower vehicle emissions', 'Increased public transport usage'],
            coverage: 'Delhi NCR',
            contact: 'Transport Department, Delhi Government'
        },
        {
            id: 'POLICY-002',
            title: 'Construction Dust Control',
            description: 'Mandatory dust control measures at construction sites.',
            status: 'Active',
            implemented: '2018',
            impact: 'Reduced PM10 levels near construction sites by 25%.',
            averageRating: 4.2,
            userRating: null,
            implementation_details: 'All construction sites above 500 sq.m must implement dust control measures.',
            outcomes: ['Reduced dust pollution', 'Better air quality at construction sites', 'Healthier environment for workers'],
            coverage: 'All construction sites in Delhi',
            contact: 'Delhi Pollution Control Committee'
        }
    ];
}

// ============================================================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================================================================

// Make functions available globally
window.initCitizenDashboard = initCitizenDashboard;
window.showSection = showSection;
window.logout = logout;
window.callHospital = callHospital;
window.getDirections = getDirections;
window.getShelterDirections = getShelterDirections;
window.bookShelter = bookShelter;
window.viewEventDetails = viewEventDetails;
window.registerEvent = registerEvent;
window.unregisterEvent = unregisterEvent;
window.viewComplaintDetails = viewComplaintDetails;
window.ratePolicy = ratePolicy;
window.viewPolicyDetails = viewPolicyDetails;
window.removePhotoPreview = removePhotoPreview;