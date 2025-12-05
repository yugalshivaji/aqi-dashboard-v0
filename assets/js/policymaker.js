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

