  // policymaker.js - Policymaker Dashboard Functionality
// Contains all policymaker-specific features and functionalities

// ============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// ============================================================================

const POLICYMAKER_CONFIG = {
    // API Endpoints (Replace with your actual endpoints)
    api: {
        dashboard: 'https://your-api.com/policymaker/dashboard',
        policyAnalysis: 'https://your-api.com/policymaker/analysis',
        feedback: 'https://your-api.com/policymaker/feedback',
        demographics: 'https://your-api.com/policymaker/demographics',
        reports: 'https://your-api.com/policymaker/reports',
        recommendations: 'https://your-api.com/policymaker/recommendations'
    },
    
    // Map Configuration
    map: {
        center: [28.6139, 77.2090], // Delhi coordinates
        zoom: 11,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    
    // Policy Categories
    policyCategories: {
        'odd-even': { name: 'Odd-Even Scheme', color: '#0d6efd' },
        'grap': { name: 'GRAP Implementation', color: '#ffc107' },
        'ev': { name: 'EV Promotion', color: '#28a745' },
        'construction': { name: 'Construction Regulations', color: '#fd7e14' },
        'industrial': { name: 'Industrial Controls', color: '#6f42c1' }
    },
    
    // Zones in Delhi-NCR
    zones: {
        'central': { name: 'Central Delhi', color: '#dc3545' },
        'south': { name: 'South Delhi', color: '#28a745' },
        'north': { name: 'North Delhi', color: '#0d6efd' },
        'east': { name: 'East Delhi', color: '#fd7e14' },
        'west': { name: 'West Delhi', color: '#6f42c1' },
        'ncr': { name: 'NCR Regions', color: '#20c997' }
    }
};

// Global state variables
let policymakerState = {
    currentUser: null,
    policyData: {},
    feedbackData: [],
    demographicData: {},
    reports: [],
    recommendations: [],
    charts: {},
    mapInstance: null,
    currentSection: 'dashboard'
};

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize the policymaker dashboard
 * This is the main entry point for policymaker functionality
 */
function initPolicymakerDashboard() {
    console.log('Initializing Policymaker Dashboard...');
    
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
    initializePolicyAnalysis();
    initializeFeedbackAnalysis();
    initializeDemographics();
    initializeAQITrends();
    initializeShelters();
    initializeEvents();
    initializeReports();
    initializeRecommendations();
    initializeProfile();
    
    // Load initial data
    loadDashboardData();
    loadNotifications();
    
    // Start auto-refresh for dashboard (every 5 minutes)
    startAutoRefresh();
    
    console.log('Policymaker Dashboard initialized successfully');
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
    
    policymakerState.currentUser = JSON.parse(user);
    return true;
}

/**
 * Load user data from localStorage or API
 */
function loadUserData() {
    if (policymakerState.currentUser) {
        // Update UI with user data
        document.getElementById('userName').textContent = policymakerState.currentUser.name || 'Policy Analyst';
        document.getElementById('profileUserName').textContent = policymakerState.currentUser.name || 'Policy Analyst';
        document.getElementById('profileUserDepartment').textContent = 'Policy & Planning Department';
    }
}

/**
 * Setup all event listeners for policymaker dashboard
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
    document.getElementById('floatingReportBtn').addEventListener('click', generateReport);
    document.getElementById('floatingAlertBtn').addEventListener('click', showPolicyAlerts);
    
    // Chatbot
    document.getElementById('closeChatbot').addEventListener('click', toggleChatbotPanel);
    document.getElementById('sendChatbotMessage').addEventListener('click', sendChatbotMessage);
    document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatbotMessage();
    });
    
    // Logout
    document.getElementById('logout-sidebar').addEventListener('click', logout);
    
    // Policy analysis filters
    document.getElementById('applyAnalysisFilter').addEventListener('click', applyPolicyAnalysisFilter);
    
    // Report generation
    document.getElementById('reportForm').addEventListener('submit', handleReportGeneration);
    document.getElementById('reportPeriod').addEventListener('change', handleReportPeriodChange);
    
    // Profile forms
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    
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
    
    // Setup policy update interval
    setInterval(updatePolicyMetrics, 300000); // Update every 5 minutes
    
    // Setup quick action buttons
    setupQuickActions();
    
    // Initialize charts
    initializeDashboardCharts();
}

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockPolicyDashboardData();
        
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
    // Update policy metrics
    updatePolicyMetrics(data.metrics);
    
    // Update performance chart
    updatePerformanceChart(data.performance);
    
    // Update sentiment analysis
    updateSentimentAnalysis(data.sentiment);
    
    // Update recent feedback
    updateRecentFeedback(data.recentFeedback);
    
    // Update policy timeline
    updatePolicyTimeline(data.timeline);
}

/**
 * Update policy metrics display
 * @param {Object} metrics - Policy metrics
 */
function updatePolicyMetrics(metrics) {
    document.getElementById('policyEffectiveness').textContent = `${metrics.effectiveness}%`;
    document.getElementById('approvalRating').textContent = `${metrics.approval}%`;
    document.getElementById('feedbackCount').textContent = metrics.feedbackCount.toLocaleString();
    document.getElementById('complianceRate').textContent = `${metrics.compliance}%`;
    
    // Update sentiment percentages
    document.getElementById('positiveSentiment').textContent = `${metrics.sentiment.positive}%`;
    document.getElementById('neutralSentiment').textContent = `${metrics.sentiment.neutral}%`;
    document.getElementById('negativeSentiment').textContent = `${metrics.sentiment.negative}%`;
    
    // Show/hide policy alert
    togglePolicyAlert(metrics);
}

/**
 * Toggle policy alert based on metrics
 * @param {Object} metrics - Policy metrics
 */
function togglePolicyAlert(metrics) {
    const alertElement = document.getElementById('policyAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    
    if (metrics.approval < 50 || metrics.sentiment.negative > 30) {
        alertTitle.textContent = 'Policy Alert';
        alertMessage.textContent = 'Citizen approval rating is below 50%. Consider reviewing current policies.';
        alertElement.style.display = 'block';
    } else if (metrics.effectiveness < 40) {
        alertTitle.textContent = 'Effectiveness Alert';
        alertMessage.textContent = 'Policy effectiveness is below 40%. Review implementation strategies.';
        alertElement.style.display = 'block';
    } else {
        alertElement.style.display = 'none';
    }
}

/**
 * Initialize dashboard charts
 */
function initializeDashboardCharts() {
    // Performance chart
    const perfCtx = document.getElementById('policyPerformanceChart').getContext('2d');
    policymakerState.charts.performance = new Chart(perfCtx, {
        type: 'bar',
        data: {
            labels: ['Odd-Even', 'GRAP', 'EV', 'Construction', 'Industrial'],
            datasets: [{
                label: 'Effectiveness',
                data: [72, 65, 58, 41, 68],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(111, 66, 193, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(255, 193, 7)',
                    'rgb(40, 167, 69)',
                    'rgb(253, 126, 20)',
                    'rgb(111, 66, 193)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Effectiveness (%)'
                    }
                }
            }
        }
    });
    
    // Sentiment chart
    const sentimentCtx = document.getElementById('sentimentChart').getContext('2d');
    policymakerState.charts.sentiment = new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [65, 23, 12],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgb(40, 167, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(220, 53, 69)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Update performance chart with new data
 * @param {Array} performanceData - Performance data
 */
function updatePerformanceChart(performanceData) {
    if (policymakerState.charts.performance) {
        policymakerState.charts.performance.data.datasets[0].data = performanceData;
        policymakerState.charts.performance.update();
    }
}

/**
 * Update sentiment analysis
 * @param {Object} sentimentData - Sentiment data
 */
function updateSentimentAnalysis(sentimentData) {
    if (policymakerState.charts.sentiment) {
        policymakerState.charts.sentiment.data.datasets[0].data = [
            sentimentData.positive,
            sentimentData.neutral,
            sentimentData.negative
        ];
        policymakerState.charts.sentiment.update();
    }
}

/**
 * Update recent feedback
 * @param {Array} feedbackData - Recent feedback
 */
function updateRecentFeedback(feedbackData) {
    const container = document.getElementById('recentFeedback');
    
    if (!feedbackData || feedbackData.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>No recent feedback available</p>
            </div>
        `;
        return;
    }
    
    const feedbackHtml = feedbackData.slice(0, 3).map(feedback => `
        <div class="feedback-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-1">${feedback.title}</h6>
                <span class="badge bg-${getSentimentColor(feedback.sentiment)}">
                    ${feedback.sentiment}
                </span>
            </div>
            <p class="mb-2 small">${feedback.message}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${feedback.policy} • ${feedback.location}</small>
                <small class="text-muted">${feedback.time}</small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = feedbackHtml;
}

/**
 * Update policy timeline
 * @param {Array} timelineData - Timeline data
 */
function updatePolicyTimeline(timelineData) {
    // This would update the policy timeline visualization
    // For now, we'll just log it
    console.log('Timeline data:', timelineData);
}

/**
 * Get color for sentiment
 * @param {string} sentiment - Sentiment type
 * @returns {string} - Bootstrap color class
 */
function getSentimentColor(sentiment) {
    switch(sentiment.toLowerCase()) {
        case 'positive': return 'success';
        case 'neutral': return 'warning';
        case 'negative': return 'danger';
        default: return 'secondary';
    }
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
// POLICY ANALYSIS FUNCTIONALITY
// ============================================================================

/**
 * Initialize policy analysis section
 */
function initializePolicyAnalysis() {
    console.log('Initializing policy analysis...');
    
    // Initialize charts
    initializePolicyAnalysisCharts();
    
    // Load initial data
    loadPolicyAnalysisData();
}

/**
 * Initialize policy analysis charts
 */
function initializePolicyAnalysisCharts() {
    // Impact analysis chart
    const impactCtx = document.getElementById('impactAnalysisChart').getContext('2d');
    policymakerState.charts.impactAnalysis = new Chart(impactCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'AQI Reduction',
                    data: [5, 8, 12, 10, 15, 18, 22, 20, 25, 28, 30, 32],
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Public Compliance',
                    data: [45, 50, 55, 58, 62, 65, 68, 70, 72, 75, 78, 80],
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
    
    // Trend analysis chart
    const trendCtx = document.getElementById('trendAnalysisChart').getContext('2d');
    policymakerState.charts.trendAnalysis = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Odd-Even',
                    data: [65, 68, 72, 75],
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'GRAP',
                    data: [58, 62, 65, 68],
                    borderColor: 'rgb(255, 193, 7)',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'EV Promotion',
                    data: [45, 48, 52, 55],
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Effectiveness (%)'
                    }
                }
            }
        }
    });
}

/**
 * Load policy analysis data
 */
async function loadPolicyAnalysisData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockPolicyAnalysisData();
        
        // Update policy comparison table
        updatePolicyComparisonTable(mockData.comparison);
        
        // Update zone effectiveness
        updateZoneEffectiveness(mockData.zones);
        
    } catch (error) {
        console.error('Error loading policy analysis data:', error);
        showAlert('Failed to load policy analysis data. Please try again.', 'error');
    }
}

/**
 * Apply policy analysis filter
 */
function applyPolicyAnalysisFilter() {
    const policy = document.getElementById('policySelect').value;
    const period = document.getElementById('timePeriod').value;
    const zone = document.getElementById('zoneSelect').value;
    
    showAlert(`Filters applied: ${policy}, ${period}, ${zone}`, 'info');
    
    // In a real app, this would reload data with filters
    loadPolicyAnalysisData();
}

/**
 * Update policy comparison table
 * @param {Array} comparisonData - Comparison data
 */
function updatePolicyComparisonTable(comparisonData) {
    const tableBody = document.getElementById('policyComparisonTable');
    
    const tableHtml = comparisonData.map(policy => `
        <tr>
            <td><strong>${policy.name}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 6px;">
                        <div class="progress-bar ${getImpactColor(policy.aqiImpact)}" style="width: ${policy.aqiImpact}%"></div>
                    </div>
                    <span>${policy.aqiImpact}%</span>
                </div>
            </td>
            <td>₹${policy.cost.toFixed(1)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 6px;">
                        <div class="progress-bar ${getSupportColor(policy.publicSupport)}" style="width: ${policy.publicSupport}%"></div>
                    </div>
                    <span>${policy.publicSupport}%</span>
                </div>
            </td>
            <td><span class="badge bg-${getImplementationColor(policy.implementation)}">${policy.implementation}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 6px;">
                        <div class="progress-bar ${getEffectivenessColor(policy.effectiveness)}" style="width: ${policy.effectiveness}%"></div>
                    </div>
                    <span>${policy.effectiveness}%</span>
                </div>
            </td>
            <td><span class="badge bg-${getRecommendationColor(policy.recommendation)}">${policy.recommendation}</span></td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = tableHtml;
}

/**
 * Update zone effectiveness
 * @param {Array} zonesData - Zones data
 */
function updateZoneEffectiveness(zonesData) {
    const container = document.getElementById('zoneEffectiveness');
    
    const zonesHtml = zonesData.map(zone => `
        <div class="zone-item mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <span><span class="zone-indicator zone-${zone.priority}"></span> ${zone.name}</span>
                <span class="badge bg-${getZoneStatusColor(zone.status)}">${zone.status}</span>
            </div>
            <small class="text-muted">${zone.description}</small>
        </div>
    `).join('');
    
    container.innerHTML = zonesHtml;
}

/**
 * Get color for impact percentage
 * @param {number} impact - Impact percentage
 * @returns {string} - Bootstrap color class
 */
function getImpactColor(impact) {
    if (impact >= 20) return 'success';
    if (impact >= 10) return 'warning';
    return 'danger';
}

/**
 * Get color for support percentage
 * @param {number} support - Support percentage
 * @returns {string} - Bootstrap color class
 */
function getSupportColor(support) {
    if (support >= 70) return 'success';
    if (support >= 50) return 'warning';
    return 'danger';
}

/**
 * Get color for implementation status
 * @param {string} implementation - Implementation status
 * @returns {string} - Bootstrap color class
 */
function getImplementationColor(implementation) {
    switch(implementation.toLowerCase()) {
        case 'excellent': return 'success';
        case 'good': return 'primary';
        case 'fair': return 'warning';
        case 'poor': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Get color for effectiveness percentage
 * @param {number} effectiveness - Effectiveness percentage
 * @returns {string} - Bootstrap color class
 */
function getEffectivenessColor(effectiveness) {
    if (effectiveness >= 70) return 'success';
    if (effectiveness >= 50) return 'warning';
    return 'danger';
}

/**
 * Get color for recommendation
 * @param {string} recommendation - Recommendation type
 * @returns {string} - Bootstrap color class
 */
function getRecommendationColor(recommendation) {
    switch(recommendation.toLowerCase()) {
        case 'continue': return 'success';
        case 'enhance': return 'primary';
        case 'modify': return 'warning';
        case 'review': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Get color for zone status
 * @param {string} status - Zone status
 * @returns {string} - Bootstrap color class
 */
function getZoneStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'good': return 'success';
        case 'stable': return 'info';
        case 'monitoring': return 'warning';
        case 'needs attention': return 'danger';
        default: return 'secondary';
    }
}

// ============================================================================
// FEEDBACK ANALYSIS FUNCTIONALITY
// ============================================================================

/**
 * Initialize feedback analysis section
 */
function initializeFeedbackAnalysis() {
    console.log('Initializing feedback analysis...');
    
    // Initialize charts
    initializeFeedbackCharts();
    
    // Setup feedback filters
    setupFeedbackFilters();
    
    // Load initial data
    loadFeedbackAnalysisData();
}

/**
 * Initialize feedback charts
 */
function initializeFeedbackCharts() {
    // Feedback trend chart
    const trendCtx = document.getElementById('feedbackTrendChart').getContext('2d');
    policymakerState.charts.feedbackTrend = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [
                {
                    label: 'Positive',
                    data: [120, 135, 145, 160, 155, 170, 180, 175, 190, 195, 210],
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Negative',
                    data: [45, 40, 35, 30, 28, 25, 22, 20, 18, 15, 12],
                    borderColor: 'rgb(220, 53, 69)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Suggestions',
                    data: [60, 65, 70, 75, 72, 78, 80, 82, 85, 88, 90],
                    borderColor: 'rgb(255, 193, 7)',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Feedback'
                    }
                }
            }
        }
    });
    
    // Feedback distribution chart
    const distCtx = document.getElementById('feedbackDistributionChart').getContext('2d');
    policymakerState.charts.feedbackDistribution = new Chart(distCtx, {
        type: 'pie',
        data: {
            labels: ['Odd-Even', 'GRAP', 'EV Promotion', 'Construction', 'Industrial', 'Other'],
            datasets: [{
                data: [35, 25, 15, 12, 8, 5],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(111, 66, 193, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(255, 193, 7)',
                    'rgb(40, 167, 69)',
                    'rgb(253, 126, 20)',
                    'rgb(111, 66, 193)',
                    'rgb(108, 117, 125)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Setup feedback filters
 */
function setupFeedbackFilters() {
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterFeedback(filter);
            
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

/**
 * Load feedback analysis data
 */
async function loadFeedbackAnalysisData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockFeedbackData();
        
        // Update feedback details
        updateFeedbackDetails(mockData.feedback);
        
        // Update feedback metrics
        updateFeedbackMetrics(mockData.metrics);
        
    } catch (error) {
        console.error('Error loading feedback analysis data:', error);
        showAlert('Failed to load feedback analysis data. Please try again.', 'error');
    }
}

/**
 * Filter feedback by type
 * @param {string} filter - Filter type
 */
function filterFeedback(filter) {
    // This would filter the feedback data in a real app
    console.log(`Filtering feedback by: ${filter}`);
    
    // For demo, just show an alert
    showAlert(`Filter applied: ${filter} feedback`, 'info');
}

/**
 * Update feedback details
 * @param {Array} feedbackData - Feedback data
 */
function updateFeedbackDetails(feedbackData) {
    const container = document.getElementById('feedbackDetails');
    
    const feedbackHtml = feedbackData.map(feedback => `
        <div class="feedback-item mb-4 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h6 class="mb-1">${feedback.title}</h6>
                    <small class="text-muted">By: ${feedback.author} | Location: ${feedback.location}</small>
                </div>
                <span class="badge bg-${getSentimentColor(feedback.sentiment)}">${feedback.sentiment}</span>
            </div>
            <p class="mb-2">${feedback.message}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Policy: ${feedback.policy} | Rating: ${feedback.rating}/5</small>
                <small class="text-muted">${feedback.time}</small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = feedbackHtml;
}

/**
 * Update feedback metrics
 * @param {Object} metrics - Feedback metrics
 */
function updateFeedbackMetrics(metrics) {
    document.getElementById('totalFeedback').textContent = metrics.total.toLocaleString();
    
    // Update chart data if available
    if (policymakerState.charts.feedbackTrend) {
        // Update with new data (simulated)
        policymakerState.charts.feedbackTrend.update();
    }
}

// ============================================================================
// DEMOGRAPHICS FUNCTIONALITY
// ============================================================================

/**
 * Initialize demographics section
 */
function initializeDemographics() {
    console.log('Initializing demographics...');
    
    // Initialize charts
    initializeDemographicsCharts();
    
    // Initialize map
    initializeDemographicsMap();
    
    // Load initial data
    loadDemographicsData();
}

/**
 * Initialize demographics charts
 */
function initializeDemographicsCharts() {
    // Age distribution chart
    const ageCtx = document.getElementById('ageDistributionChart').getContext('2d');
    policymakerState.charts.ageDistribution = new Chart(ageCtx, {
        type: 'bar',
        data: {
            labels: ['18-30', '31-45', '46-60', '60+'],
            datasets: [{
                label: 'Percentage',
                data: [35, 40, 18, 7],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(253, 126, 20, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(40, 167, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(253, 126, 20)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 50,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
    
    // Income distribution chart
    const incomeCtx = document.getElementById('incomeDistributionChart').getContext('2d');
    policymakerState.charts.incomeDistribution = new Chart(incomeCtx, {
        type: 'doughnut',
        data: {
            labels: ['High Income', 'Middle Income', 'Low Income'],
            datasets: [{
                data: [25, 50, 25],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)'
                ],
                borderColor: [
                    'rgb(40, 167, 69)',
                    'rgb(13, 110, 253)',
                    'rgb(255, 193, 7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Occupation chart
    const occCtx = document.getElementById('occupationChart').getContext('2d');
    policymakerState.charts.occupation = new Chart(occCtx, {
        type: 'polarArea',
        data: {
            labels: ['Professionals', 'Students', 'Business', 'Retired', 'Homemakers'],
            datasets: [{
                data: [42, 28, 15, 8, 7],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(111, 66, 193, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(40, 167, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(253, 126, 20)',
                    'rgb(111, 66, 193)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Initialize demographics map
 */
function initializeDemographicsMap() {
    if (!document.getElementById('demographicsMap')) return;
    
    // Create map instance
    policymakerState.mapInstance = L.map('demographicsMap').setView(
        POLICYMAKER_CONFIG.map.center,
        POLICYMAKER_CONFIG.map.zoom
    );
    
    // Add tile layer
    L.tileLayer(POLICYMAKER_CONFIG.map.tileLayer, {
        attribution: '© OpenStreetMap contributors'
    }).addTo(policymakerState.mapInstance);
    
    // Add zone markers
    addZoneMarkers();
}

/**
 * Add zone markers to map
 */
function addZoneMarkers() {
    const zones = [
        { name: 'Central Delhi', coords: [28.6304, 77.2177], responseRate: 78, color: '#dc3545' },
        { name: 'South Delhi', coords: [28.5245, 77.2065], responseRate: 65, color: '#28a745' },
        { name: 'North Delhi', coords: [28.7432, 77.0662], responseRate: 71, color: '#0d6efd' },
        { name: 'East Delhi', coords: [28.6021, 77.2974], responseRate: 82, color: '#fd7e14' },
        { name: 'West Delhi', coords: [28.6343, 77.1051], responseRate: 69, color: '#6f42c1' }
    ];
    
    zones.forEach(zone => {
        const marker = L.circleMarker(zone.coords, {
            radius: 15 + (zone.responseRate / 2),
            fillColor: zone.color,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(policymakerState.mapInstance);
        
        marker.bindPopup(`
            <strong>${zone.name}</strong><br>
            Response Rate: ${zone.responseRate}%<br>
            <small>Click for detailed demographics</small>
        `);
    });
}

/**
 * Load demographics data
 */
async function loadDemographicsData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockDemographicsData();
        
        // Update demographics display
        updateDemographicsDisplay(mockData);
        
    } catch (error) {
        console.error('Error loading demographics data:', error);
        showAlert('Failed to load demographics data. Please try again.', 'error');
    }
}

/**
 * Update demographics display
 * @param {Object} data - Demographics data
 */
function updateDemographicsDisplay(data) {
    // This would update various demographics visualizations
    console.log('Demographics data loaded:', data);
}

// ============================================================================
// AQI TRENDS FUNCTIONALITY
// ============================================================================

/**
 * Initialize AQI trends section
 */
function initializeAQITrends() {
    console.log('Initializing AQI trends...');
    
    // Initialize charts
    initializeAQITrendCharts();
    
    // Setup metric toggle buttons
    setupMetricToggle();
    
    // Load initial data
    loadAQITrendsData();
}

/**
 * Initialize AQI trend charts
 */
function initializeAQITrendCharts() {
    // AQI trend chart
    const trendCtx = document.getElementById('aqiTrendChart').getContext('2d');
    policymakerState.charts.aqiTrend = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [{
                label: 'AQI',
                data: [325, 310, 285, 240, 220, 210, 180, 195, 220, 280, 320],
                borderColor: 'rgb(220, 53, 69)',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'AQI Value'
                    }
                }
            }
        }
    });
    
    // Policy impact correlation chart
    const corrCtx = document.getElementById('policyImpactCorrelationChart').getContext('2d');
    policymakerState.charts.policyImpactCorrelation = new Chart(corrCtx, {
        type: 'radar',
        data: {
            labels: ['AQI Reduction', 'Cost Efficiency', 'Public Support', 'Implementation', 'Sustainability'],
            datasets: [
                {
                    label: 'Odd-Even',
                    data: [0.72, 0.65, 0.78, 0.85, 0.68],
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: true
                },
                {
                    label: 'GRAP',
                    data: [0.65, 0.58, 0.62, 0.78, 0.72],
                    borderColor: 'rgb(255, 193, 7)',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    fill: true
                },
                {
                    label: 'EV Promotion',
                    data: [0.58, 0.42, 0.68, 0.55, 0.82],
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1
                }

            }
        }
    });
    
    // Seasonal analysis chart
    const seasonalCtx = document.getElementById('seasonalAnalysisChart').getContext('2d');
    policymakerState.charts.seasonalAnalysis = new Chart(seasonalCtx, {
        type: 'bar',
        data: {
            labels: ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon'],
            datasets: [{
                label: 'Average AQI',
                data: [325, 185, 95, 145],
                backgroundColor: [
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(13, 110, 253, 0.7)'
                ],
                borderColor: [
                    'rgb(220, 53, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(40, 167, 69)',
                    'rgb(13, 110, 253)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'AQI Value'
                    }
                }
            }
        }
    });
    
    // Pollution source charts
    const sourceCurrentCtx = document.getElementById('sourceChartCurrent').getContext('2d');
    policymakerState.charts.sourceCurrent = new Chart(sourceCurrentCtx, {
        type: 'pie',
        data: {
            labels: ['Vehicle', 'Industrial', 'Construction', 'Waste Burning', 'Others'],
            datasets: [{
                data: [38, 28, 15, 12, 7],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(255, 193, 7)',
                    'rgb(253, 126, 20)',
                    'rgb(40, 167, 69)',
                    'rgb(108, 117, 125)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    const sourcePreviousCtx = document.getElementById('sourceChartPrevious').getContext('2d');
    policymakerState.charts.sourcePrevious = new Chart(sourcePreviousCtx, {
        type: 'pie',
        data: {
            labels: ['Vehicle', 'Industrial', 'Construction', 'Waste Burning', 'Others'],
            datasets: [{
                data: [43, 30, 16, 8, 3],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(255, 193, 7)',
                    'rgb(253, 126, 20)',
                    'rgb(40, 167, 69)',
                    'rgb(108, 117, 125)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Setup metric toggle buttons
 */
function setupMetricToggle() {
    document.querySelectorAll('[data-metric]').forEach(button => {
        button.addEventListener('click', function() {
            const metric = this.getAttribute('data-metric');
            changeAQIMetric(metric);
            
            // Update active button
            document.querySelectorAll('[data-metric]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

/**
 * Change AQI metric display
 * @param {string} metric - Metric type
 */
function changeAQIMetric(metric) {
    if (!policymakerState.charts.aqiTrend) return;
    
    // Mock data for different metrics
    const metricData = {
        'aqi': [325, 310, 285, 240, 220, 210, 180, 195, 220, 280, 320],
        'pm25': [215, 198, 175, 148, 135, 128, 105, 115, 135, 185, 210],
        'pm10': [350, 325, 290, 245, 225, 215, 180, 195, 225, 295, 335],
        'no2': [85, 82, 75, 65, 60, 58, 50, 55, 60, 75, 82]
    };
    
    // Update chart data
    policymakerState.charts.aqiTrend.data.datasets[0].data = metricData[metric] || metricData.aqi;
    policymakerState.charts.aqiTrend.data.datasets[0].label = metric.toUpperCase();
    policymakerState.charts.aqiTrend.update();
}

/**
 * Load AQI trends data
 */
async function loadAQITrendsData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockAQITrendsData();
        
        // Update AQI trends display
        updateAQITrendsDisplay(mockData);
        
    } catch (error) {
        console.error('Error loading AQI trends data:', error);
        showAlert('Failed to load AQI trends data. Please try again.', 'error');
    }
}

/**
 * Update AQI trends display
 * @param {Object} data - AQI trends data
 */
function updateAQITrendsDisplay(data) {
    // This would update various AQI trend visualizations
    console.log('AQI trends data loaded:', data);
}

// ============================================================================
// SHELTERS FUNCTIONALITY
// ============================================================================

/**
 * Initialize shelters section
 */
function initializeShelters() {
    console.log('Initializing shelters...');
    
    // Initialize chart
    initializeShelterChart();
    
    // Load initial data
    loadSheltersData();
}

/**
 * Initialize shelter chart
 */
function initializeShelterChart() {
    const shelterCtx = document.getElementById('shelterUtilizationChart').getContext('2d');
    policymakerState.charts.shelterUtilization = new Chart(shelterCtx, {
        type: 'bar',
        data: {
            labels: ['Central', 'South', 'East', 'North', 'West'],
            datasets: [
                {
                    label: 'Capacity',
                    data: [50, 35, 40, 45, 30],
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgb(13, 110, 253)',
                    borderWidth: 1
                },
                {
                    label: 'Current Usage',
                    data: [42, 28, 40, 32, 18],
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgb(40, 167, 69)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of People'
                    }
                }
            }
        }
    });
}

/**
 * Load shelters data
 */
async function loadSheltersData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockSheltersData();
        
        // Update shelters display
        updateSheltersDisplay(mockData);
        
    } catch (error) {
        console.error('Error loading shelters data:', error);
        showAlert('Failed to load shelters data. Please try again.', 'error');
    }
}

/**
 * Update shelters display
 * @param {Object} data - Shelters data
 */
function updateSheltersDisplay(data) {
    // Update shelter statistics
    document.getElementById('totalShelters').textContent = data.totalShelters;
    document.getElementById('totalCapacity').textContent = data.totalCapacity.toLocaleString();
    document.getElementById('currentUtilization').textContent = `${data.utilization}%`;
    document.getElementById('healthCases').textContent = data.healthCases;
}

// ============================================================================
// EVENTS FUNCTIONALITY
// ============================================================================

/**
 * Initialize events section
 */
function initializeEvents() {
    console.log('Initializing events...');
    
    // Initialize charts
    initializeEventCharts();
    
    // Load initial data
    loadEventsData();
}

/**
 * Initialize event charts
 */
function initializeEventCharts() {
    // Events participation chart
    const eventCtx = document.getElementById('eventsParticipationChart').getContext('2d');
    policymakerState.charts.eventsParticipation = new Chart(eventCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [
                {
                    label: 'Number of Events',
                    data: [8, 10, 12, 15, 14, 16, 18, 16, 20, 18, 15],
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Participants',
                    data: [800, 950, 1100, 1300, 1250, 1400, 1600, 1550, 1800, 1700, 1500],
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Events'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Participants'
                    }
                }
            }
        }
    });
    
    // Event type chart
    const typeCtx = document.getElementById('eventTypeChart').getContext('2d');
    policymakerState.charts.eventType = new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Workshops', 'Awareness Camps', 'Feedback Sessions', 'Training Programs', 'Other'],
            datasets: [{
                data: [35, 28, 20, 12, 5],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(40, 167, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(253, 126, 20)',
                    'rgb(108, 117, 125)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Load events data
 */
async function loadEventsData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockEventsData();
        
        // Update events display
        updateEventsDisplay(mockData);
        
    } catch (error) {
        console.error('Error loading events data:', error);
        showAlert('Failed to load events data. Please try again.', 'error');
    }
}

/**
 * Update events display
 * @param {Object} data - Events data
 */
function updateEventsDisplay(data) {
    // This would update events visualization
    console.log('Events data loaded:', data);
}

// ============================================================================
// REPORTS FUNCTIONALITY
// ============================================================================

/**
 * Initialize reports section
 */
function initializeReports() {
    console.log('Initializing reports...');
    
    // Setup form handlers
    setupReportFormHandlers();
    
    // Load initial data
    loadReportsData();
}

/**
 * Setup report form handlers
 */
function setupReportFormHandlers() {
    // Report period change handler
    document.getElementById('reportPeriod').addEventListener('change', handleReportPeriodChange);
    
    // Report form submission
    document.getElementById('reportForm').addEventListener('submit', handleReportGeneration);
}

/**
 * Handle report period change
 */
function handleReportPeriodChange() {
    const period = document.getElementById('reportPeriod').value;
    const customRange = document.getElementById('customDateRange');
    
    if (period === 'custom') {
        customRange.style.display = 'block';
    } else {
        customRange.style.display = 'none';
    }
}

/**
 * Handle report generation
 * @param {Event} e - Form submit event
 */
function handleReportGeneration(e) {
    e.preventDefault();
    
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    const reportFormat = document.getElementById('reportFormat').value;
    
    if (!reportType || !reportPeriod || !reportFormat) {
        showAlert('Please fill all required fields', 'error');
        return;
    }
    
    // Show generating message
    showAlert('Generating report... This may take a moment.', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        const reportName = `${reportType.replace('-', ' ').toUpperCase()} Report - ${new Date().toLocaleDateString()}`;
        
        showAlert(`Report "${reportName}" generated successfully!`, 'success');
        
        // In a real app, this would trigger download
        console.log(`Report generated: Type=${reportType}, Period=${reportPeriod}, Format=${reportFormat}`);
        
        // Refresh reports list
        loadReportsData();
    }, 2000);
}

/**
 * Preview report
 */
function previewReport() {
    showAlert('Report preview feature would open a preview window here.', 'info');
}

/**
 * Load reports data
 */
async function loadReportsData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockReportsData();
        
        // Update reports list
        updateReportsList(mockData);
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        showAlert('Failed to load reports data. Please try again.', 'error');
    }
}

/**
 * Update reports list
 * @param {Array} reportsData - Reports data
 */
function updateReportsList(reportsData) {
    // This would update the reports table
    console.log('Reports data loaded:', reportsData);
}

// ============================================================================
// RECOMMENDATIONS FUNCTIONALITY
// ============================================================================

/**
 * Initialize recommendations section
 */
function initializeRecommendations() {
    console.log('Initializing recommendations...');
    
    // Initialize charts
    initializeRecommendationCharts();
    
    // Setup recommendation actions
    setupRecommendationActions();
    
    // Load initial data
    loadRecommendationsData();
}

/**
 * Initialize recommendation charts
 */
function initializeRecommendationCharts() {
    // Recommendation analytics chart
    const analyticsCtx = document.getElementById('recommendationAnalyticsChart').getContext('2d');
    policymakerState.charts.recommendationAnalytics = new Chart(analyticsCtx, {
        type: 'bar',
        data: {
            labels: ['Approved', 'Implemented', 'Pending', 'Rejected'],
            datasets: [{
                label: 'Number of Recommendations',
                data: [42, 28, 14, 6],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgb(13, 110, 253)',
                    'rgb(40, 167, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(220, 53, 69)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Recommendations'
                    }
                }
            }
        }
    });
}

/**
 * Setup recommendation actions
 */
function setupRecommendationActions() {
    // Setup approve/modify/reject buttons
    document.querySelectorAll('.recommendations-list').forEach(container => {
        container.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const action = btn.textContent.trim();
            const recommendation = btn.closest('.recommendation-item').querySelector('h5').textContent;
            
            handleRecommendationAction(action, recommendation);
        });
    });
}

/**
 * Handle recommendation action
 * @param {string} action - Action type
 * @param {string} recommendation - Recommendation title
 */
function handleRecommendationAction(action, recommendation) {
    switch(action) {
        case 'Approve':
            showAlert(`Recommendation "${recommendation}" approved!`, 'success');
            break;
        case 'Modify':
            showAlert(`Recommendation "${recommendation}" marked for modification.`, 'info');
            break;
        case 'Reject':
            showAlert(`Recommendation "${recommendation}" rejected.`, 'warning');
            break;
    }
}

/**
 * Load recommendations data
 */
async function loadRecommendationsData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockRecommendationsData();
        
        // Update recommendations display
        updateRecommendationsDisplay(mockData);
        
    } catch (error) {
        console.error('Error loading recommendations data:', error);
        showAlert('Failed to load recommendations data. Please try again.', 'error');
    }
}

/**
 * Update recommendations display
 * @param {Object} data - Recommendations data
 */
function updateRecommendationsDisplay(data) {
    // This would update recommendations visualization
    console.log('Recommendations data loaded:', data);
}

// ============================================================================
// PROFILE FUNCTIONALITY
// ============================================================================

/**
 * Initialize profile section
 */
function initializeProfile() {
    console.log('Initializing profile...');
    
    // Setup form handlers
    setupProfileFormHandlers();
    
    // Setup danger zone actions
    setupDangerZoneActions();
    
    // Load initial data
    loadProfileData();
}

/**
 * Setup profile form handlers
 */
function setupProfileFormHandlers() {
    // Profile update form
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
    
    // Password change form
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
}

/**
 * Setup danger zone actions
 */
function setupDangerZoneActions() {
    document.getElementById('exportAllData').addEventListener('click', exportAllData);
    document.getElementById('clearAnalyticsCache').addEventListener('click', clearAnalyticsCache);
    document.getElementById('deleteAccount').addEventListener('click', deleteAccount);
}

/**
 * Update profile
 * @param {Event} e - Form submit event
 */
function updateProfile(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('profileFullName').value;
    const department = document.getElementById('profileDepartment').value;
    const designation = document.getElementById('profileDesignation').value;
    const phone = document.getElementById('profilePhone').value;
    
    // In a real app, this would be an API call
    showAlert('Profile updated successfully!', 'success');
    
    // Update user display
    document.getElementById('userName').textContent = fullName;
    document.getElementById('profileUserName').textContent = fullName;
}

/**
 * Change password
 * @param {Event} e - Form submit event
 */
function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showAlert('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // In a real app, this would validate current password and update via API
    showAlert('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('passwordForm').reset();
}

/**
 * Export all data
 */
function exportAllData() {
    if (confirm('Are you sure you want to export all data? This may take several minutes.')) {
        showAlert('Data export started. You will receive an email when it\'s ready.', 'info');
        console.log('Exporting all data...');
    }
}

/**
 * Clear analytics cache
 */
function clearAnalyticsCache() {
    if (confirm('Are you sure you want to clear analytics cache? This will not delete your data.')) {
        showAlert('Analytics cache cleared successfully.', 'success');
        console.log('Analytics cache cleared');
    }
}

/**
 * Delete account
 */
function deleteAccount() {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        if (prompt('Type "DELETE" to confirm account deletion:') === 'DELETE') {
            showAlert('Account deletion requested. Admin approval required.', 'warning');
            console.log('Account deletion requested');
        }
    }
}

/**
 * Load profile data
 */
async function loadProfileData() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockData = generateMockProfileData();
        
        // Update profile display
        updateProfileDisplay(mockData);
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        showAlert('Failed to load profile data. Please try again.', 'error');
    }
}

/**
 * Update profile display
 * @param {Object} data - Profile data
 */
function updateProfileDisplay(data) {
    // This would update profile visualizations
    console.log('Profile data loaded:', data);
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Load notifications
 */
async function loadNotifications() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        const mockNotifications = generateMockNotifications();
        
        // Update notification count
        updateNotificationCount(mockNotifications.length);
        
        // Update notification panel
        updateNotificationPanel(mockNotifications);
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

/**
 * Update notification count
 * @param {number} count - Number of notifications
 */
function updateNotificationCount(count) {
    const badge = document.getElementById('notificationCount');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Update notification panel
 * @param {Array} notifications - Notifications data
 */
function updateNotificationPanel(notifications) {
    const container = document.getElementById('notificationPanelContent');
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-3">No new notifications</p>';
        return;
    }
    
    const notificationsHtml = notifications.map(notif => `
        <div class="notification-item border-bottom pb-2 mb-2">
            <h6 class="mb-1">${notif.title}</h6>
            <p class="small mb-1">${notif.message}</p>
            <small class="text-muted">${notif.time}</small>
        </div>
    `).join('');
    
    container.innerHTML = notificationsHtml;
}

/**
 * Toggle notification panel
 */
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const profilePanel = document.getElementById('profilePanel');
    
    // Close profile panel if open
    if (profilePanel.style.display === 'block') {
        profilePanel.style.display = 'none';
    }
    
    // Toggle notification panel
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        loadNotifications(); // Refresh notifications
    }
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsRead() {
    // In a real app, this would be an API call
    updateNotificationCount(0);
    
    showAlert('All notifications marked as read', 'success');
    document.getElementById('notificationPanelContent').innerHTML = 
        '<p class="text-muted text-center py-3">No new notifications</p>';
}

/**
 * Toggle profile panel
 */
function toggleProfilePanel() {
    const panel = document.getElementById('profilePanel');
    const notificationPanel = document.getElementById('notificationPanel');
    
    // Close notification panel if open
    if (notificationPanel.style.display === 'block') {
        notificationPanel.style.display = 'none';
    }
    
    // Toggle profile panel
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
    }
}

// ============================================================================
// CHATBOT FUNCTIONS
// ============================================================================

/**
 * Toggle chatbot panel
 */
function toggleChatbotPanel() {
    const panel = document.getElementById('chatbotPanel');
    
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        document.getElementById('chatbotInput').focus();
        hideChatbotBadge();
    }
}

/**
 * Show chatbot badge
 */
function showChatbotBadge() {
    const badge = document.getElementById('chatbotBadge');
    badge.style.display = 'inline-block';
}

/**
 * Hide chatbot badge
 */
function hideChatbotBadge() {
    const badge = document.getElementById('chatbotBadge');
    badge.style.display = 'none';
}

/**
 * Send chatbot message
 */
async function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatbotMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // In a real app, this would be an API call to AI service
        // For demo, we'll simulate a response
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateChatbotResponse(message);
            addChatbotMessage(response, 'bot');
            
            // Scroll to bottom
            const chatbotBody = document.getElementById('chatbotMessages');
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }, 1000);
        
    } catch (error) {
        removeTypingIndicator();
        addChatbotMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Chatbot error:', error);
    }
}

/**
 * Add chatbot message
 * @param {string} message - Message text
 * @param {string} sender - 'user' or 'bot'
 */
function addChatbotMessage(message, sender) {
    const container = document.getElementById('chatbotMessages');
    const messageClass = sender === 'user' ? 'user-message' : 'bot-message';
    
    const messageHtml = `
        <div class="message ${messageClass}">
            ${message}
        </div>
    `;
    
    container.innerHTML += messageHtml;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const container = document.getElementById('chatbotMessages');
    const typingHtml = `
        <div class="message bot-message typing">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    container.innerHTML += typingHtml;
    
    // Scroll to bottom
    const chatbotBody = document.getElementById('chatbotMessages');
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const container = document.getElementById('chatbotMessages');
    const typingIndicator = container.querySelector('.typing');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Generate chatbot response
 * @param {string} message - User message
 * @returns {string} - Response message
 */
function generateChatbotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Policy-related queries
    if (lowerMessage.includes('policy') || lowerMessage.includes('effectiveness')) {
        return "Based on current data, the Odd-Even policy is showing 72% effectiveness, while EV promotion policies are at 58% effectiveness. Would you like detailed analysis on any specific policy?";
    }
    
    if (lowerMessage.includes('aqi') || lowerMessage.includes('pollution')) {
        return "Current AQI in Delhi-NCR is 245, which falls in the 'Poor' category. There has been an 18.5% improvement compared to last year. PM2.5 levels are at 128 µg/m³, which is 5.1 times above WHO guidelines.";
    }
    
    if (lowerMessage.includes('feedback') || lowerMessage.includes('citizen')) {
        return "Citizen feedback analysis shows 65% positive sentiment, 23% neutral, and 12% negative. Top concerns are public transport availability (45%) and enforcement effectiveness (32%).";
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
        return "I recommend: 1) Extend Odd-Even to commercial vehicles, 2) Increase metro frequency during pollution episodes, 3) Implement stricter construction site monitoring. Would you like detailed cost-benefit analysis for any of these?";
    }
    
    if (lowerMessage.includes('report') || lowerMessage.includes('generate')) {
        return "You can generate reports from the Reports section. Available report types include Policy Analysis, Citizen Feedback Summary, AQI Trends, and Shelter Utilization reports. What type of report do you need?";
    }
    
    if (lowerMessage.includes('shelter') || lowerMessage.includes('emergency')) {
        return "There are 52 AQI shelters operational with 68% utilization rate. East Delhi shelter is at full capacity (100%). Health cases reported: 124 in the last week.";
    }
    
    // Default response
    return "I'm your Policy AI Assistant. I can help you with policy analysis, AQI trends, citizen feedback, recommendations, and report generation. What would you like to know about?";
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock policy dashboard data
 * @returns {Object} - Mock dashboard data
 */
function generateMockPolicyDashboardData() {
    return {
        metrics: {
            effectiveness: 72,
            approval: 65,
            feedbackCount: 1245,
            compliance: 78,
            sentiment: {
                positive: 65,
                neutral: 23,
                negative: 12
            }
        },
        performance: [72, 65, 58, 41, 68],
        sentiment: {
            positive: 65,
            neutral: 23,
            negative: 12
        },
        recentFeedback: [
            {
                title: "Excellent policy implementation",
                message: "The odd-even scheme has really helped reduce traffic in our area.",
                sentiment: "positive",
                policy: "Odd-Even",
                location: "South Delhi",
                time: "2 hours ago"
            },
            {
                title: "Need better public transport",
                message: "More buses needed during odd-even days.",
                sentiment: "negative",
                policy: "Odd-Even",
                location: "East Delhi",
                time: "1 day ago"
            },
            {
                title: "Construction dust control",
                message: "Construction sites need better dust management.",
                sentiment: "neutral",
                policy: "Construction Regulations",
                location: "Central Delhi",
                time: "3 days ago"
            }
        ],
        timeline: [
            { date: "Nov 15, 2023", event: "Odd-Even Policy Implemented", description: "Phase 1 implementation started" },
            { date: "Nov 10, 2023", event: "GRAP Phase 2 Activated", description: "Emergency measures implemented" },
            { date: "Oct 25, 2023", event: "EV Subsidy Launched", description: "New electric vehicle incentives" }
        ]
    };
}

/**
 * Generate mock policy analysis data
 * @returns {Object} - Mock policy analysis data
 */
function generateMockPolicyAnalysisData() {
    return {
        comparison: [
            { name: "Odd-Even", aqiImpact: 15.2, cost: 4.2, publicSupport: 78.5, implementation: "Excellent", effectiveness: 72, recommendation: "Continue" },
            { name: "GRAP", aqiImpact: 12.8, cost: 3.8, publicSupport: 65.2, implementation: "Good", effectiveness: 65, recommendation: "Enhance" },
            { name: "EV Promotion", aqiImpact: 8.5, cost: 5.6, publicSupport: 82.1, implementation: "Good", effectiveness: 58, recommendation: "Continue" },
            { name: "Construction Regulations", aqiImpact: 5.2, cost: 2.1, publicSupport: 58.4, implementation: "Fair", effectiveness: 41, recommendation: "Modify" },
            { name: "Industrial Controls", aqiImpact: 18.2, cost: 6.8, publicSupport: 48.7, implementation: "Poor", effectiveness: 68, recommendation: "Review" }
        ],
        zones: [
            { name: "Critical Zones", priority: "critical", description: "Central, East Delhi", status: "Needs Attention" },
            { name: "High Priority", priority: "high", description: "North, West Delhi", status: "Monitoring" },
            { name: "Medium Priority", priority: "medium", description: "South Delhi", status: "Stable" },
            { name: "Low Priority", priority: "low", description: "NCR Regions", status: "Good" }
        ]
    };
}

/**
 * Generate mock feedback data
 * @returns {Object} - Mock feedback data
 */
function generateMockFeedbackData() {
    return {
        feedback: [
            {
                title: "Excellent initiative for clean air!",
                author: "Rajesh Kumar",
                location: "South Delhi",
                sentiment: "positive",
                message: "The odd-even policy has significantly reduced traffic congestion in our area. Air quality feels much better during implementation days.",
                policy: "Odd-Even",
                rating: 5,
                time: "2 days ago"
            },
            {
                title: "Need better public transport",
                author: "Priya Sharma",
                location: "East Delhi",
                sentiment: "suggestion",
                message: "While the policy is good, there should be more metro frequency and bus services on odd-even days to accommodate increased passengers.",
                policy: "Odd-Even",
                rating: 3,
                time: "1 week ago"
            },
            {
                title: "Construction dust control ineffective",
                author: "Amit Verma",
                location: "Central Delhi",
                sentiment: "negative",
                message: "Construction sites in our area continue to operate without proper dust control measures. The regulations exist but enforcement is weak.",
                policy: "Construction Regulations",
                rating: 1,
                time: "2 weeks ago"
            }
        ],
        metrics: {
            total: 1245,
            positive: 834,
            neutral: 286,
            negative: 125
        }
    };
}

/**
 * Generate mock demographics data
 * @returns {Object} - Mock demographics data
 */
function generateMockDemographicsData() {
    return {
        ageDistribution: [35, 40, 18, 7],
        incomeDistribution: [25, 50, 25],
        occupationDistribution: [42, 28, 15, 8, 7],
        zones: [
            { name: "Central Delhi", responseRate: 78 },
            { name: "South Delhi", responseRate: 65 },
            { name: "East Delhi", responseRate: 82 },
            { name: "North Delhi", responseRate: 71 },
            { name: "West Delhi", responseRate: 69 }
        ]
    };
}

/**
 * Generate mock AQI trends data
 * @returns {Object} - Mock AQI trends data
 */
function generateMockAQITrendsData() {
    return {
        aqiTrend: [325, 310, 285, 240, 220, 210, 180, 195, 220, 280, 320],
        seasonalAQI: [325, 185, 95, 145],
        sourceContribution: {
            current: [38, 28, 15, 12, 7],
            previous: [43, 30, 16, 8, 3]
        }
    };
}

/**
 * Generate mock shelters data
 * @returns {Object} - Mock shelters data
 */
function generateMockSheltersData() {
    return {
        totalShelters: 52,
        totalCapacity: 2150,
        utilization: 68,
        healthCases: 124
    };
}

/**
 * Generate mock events data
 * @returns {Object} - Mock events data
 */
function generateMockEventsData() {
    return {
        totalEvents: 156,
        totalParticipants: 12450,
        satisfactionRate: 84,
        upcomingEvents: [
            { name: "Policy Feedback Session", date: "Nov 25", location: "India Habitat Centre" },
            { name: "EV Awareness Campaign", date: "Nov 28", location: "Select Citywalk Mall" },
            { name: "Industrial Compliance Workshop", date: "Dec 2", location: "PHD Chamber of Commerce" }
        ]
    };
}

/**
 * Generate mock reports data
 * @returns {Array} - Mock reports data
 */
function generateMockReportsData() {
    return [
        { name: "Policy Effectiveness Q3 2023", type: "Policy Analysis", period: "Jul - Sep 2023", generated: "Oct 15, 2023", size: "2.4 MB", status: "Completed" },
        { name: "Citizen Feedback Analysis Nov 2023", type: "Feedback Summary", period: "Nov 1-15, 2023", generated: "Nov 18, 2023", size: "1.8 MB", status: "Completed" },
        { name: "AQI Shelter Utilization Report", type: "Shelter Analysis", period: "Oct 2023", generated: "Nov 5, 2023", size: "3.2 MB", status: "Completed" },
        { name: "Event Impact Assessment Q3", type: "Event Analysis", period: "Jul - Sep 2023", generated: "Oct 25, 2023", size: "2.1 MB", status: "Completed" },
        { name: "Annual Policy Review 2023", type: "Annual Report", period: "Jan - Dec 2023", generated: "In Progress", size: "--", status: "Processing" }
    ];
}

/**
 * Generate mock recommendations data
 * @returns {Object} - Mock recommendations data
 */
function generateMockRecommendationsData() {
    return {
        recommendations: [
            { title: "Enhance Odd-Even Policy", priority: "High", impact: "+15% AQI Reduction", cost: "₹2.1 Crores", timeline: "3-4 Months" },
            { title: "Improve Public Transport", priority: "Medium", impact: "+8% Compliance", cost: "₹5.8 Crores", timeline: "6-8 Months" },
            { title: "Stricter Construction Regulations", priority: "Critical", impact: "-12% PM10 Levels", cost: "₹3.4 Crores", timeline: "2-3 Months" }
        ],
        analytics: {
            approved: 42,
            implemented: 28,
            pending: 14,
            rejected: 6
        }
    };
}

/**
 * Generate mock profile data
 * @returns {Object} - Mock profile data
 */
function generateMockProfileData() {
    return {
        user: {
            name: "Policy Analyst",
            email: "policy@delhi.gov.in",
            department: "Policy & Planning",
            designation: "Senior Policy Analyst",
            phone: "+91 11 2386 0182"
        },
        preferences: {
            notifications: {
                policyAlerts: true,
                feedbackUpdates: true,
                aqiTrends: true,
                reports: true,
                emergency: true
            },
            reports: {
                defaultFormat: "pdf",
                frequency: "monthly"
            },
            analytics: {
                vizCharts: true,
                vizMaps: true,
                vizTrends: true,
                granularity: "daily",
                exportRawData: true,
                exportAnalysis: true,
                exportRecommendations: true
            }
        }
    };
}

/**
 * Generate mock notifications
 * @returns {Array} - Mock notifications
 */
function generateMockNotifications() {
    return [
        { title: "New Citizen Feedback Available", message: "245 new feedback entries received in the last 24 hours", time: "2 hours ago" },
        { title: "Policy Alert: Odd-Even Effectiveness", message: "Odd-Even policy shows 15% AQI reduction this week", time: "1 day ago" },
        { title: "Report Generated Successfully", message: "Monthly policy analysis report for October is ready", time: "2 days ago" },
        { title: "Emergency Alert: High Pollution Day", message: "AQI expected to reach 350+ tomorrow", time: "3 days ago" }
    ];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handle sidebar navigation
 * @param {Event} e - Click event
 */
function handleSidebarNavigation(e) {
    e.preventDefault();
    const section = this.getAttribute('data-section');
    
    if (section) {
        showSection(section);
        // Close sidebar on mobile
        if (window.innerWidth < 992) {
            toggleSidebar();
        }
    }
}

/**
 * Show policy alerts
 */
function showPolicyAlerts() {
    // Show the most critical policy alert
    const alertElement = document.getElementById('policyAlert');
    alertElement.style.display = 'block';
    
    // Scroll to alert
    alertElement.scrollIntoView({ behavior: 'smooth' });
    
    // Show notification
    showAlert('Policy alert displayed. Review critical issues.', 'warning');
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, error, info, warning)
 */
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 80px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * Export to PDF function
 */
function exportToPDF() {
    showAlert('PDF export feature would be implemented here. This would generate a comprehensive policy report.', 'info');
}

/**
 * Share report function
 */
function shareReport() {
    showAlert('Report sharing feature would be implemented here. This would allow sharing via email or download.', 'info');
}

// Make functions available globally
window.initPolicymakerDashboard = initPolicymakerDashboard;
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.logout = logout;
window.generateReport = generateReport;
window.exportToPDF = exportToPDF;
window.shareReport = shareReport;

console.log('policymaker.js loaded successfully');