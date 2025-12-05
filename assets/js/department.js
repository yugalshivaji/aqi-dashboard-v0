/**
 * AQI NCR Delhi - Department Dashboard JavaScript
 * This file contains all department-specific functionality
 * Highly commented for easier addition of new features and customizations
 */

// ===== GLOBAL VARIABLES =====
let currentDepartment = null;
let departmentComplaints = [];
let departmentShelters = [];
let departmentEvents = [];
let currentPage = 1;
const complaintsPerPage = 10;
let filteredComplaints = [];
let selectedComplaints = new Set();
let departmentCharts = {};
let complaintMap = null;

// ===== MOCK DATA FOR DEPARTMENT =====
const MOCK_DEPARTMENT_DATA = {
    department: {
        id: 'DPCC001',
        name: 'Delhi Pollution Control Committee',
        email: 'dpcc@delhi.gov.in',
        phone: '011-2386 0182',
        address: 'DPCC Office, ISBT Building, Kashmere Gate, Delhi - 110006',
        officer: 'Rajesh Kumar',
        designation: 'Senior Environmental Officer',
        role: 'supervisor'
    },
    stats: {
        total: 245,
        pending: 45,
        inProgress: 68,
        resolved: 120,
        rejected: 12,
        highPriority: 32,
        critical: 15
    },
    performance: {
        resolutionRate: 85,
        avgResponseTime: 24, // hours
        citizenSatisfaction: 4.2,
        onTimeCompletion: 92
    }
};

const MOCK_DEPARTMENT_COMPLAINTS = [
    {
        id: 1,
        type: 'industrial_pollution',
        priority: 'high',
        location: 'Okhla Industrial Area',
        description: 'Black smoke coming from factory chimney, visible from 2km distance',
        status: 'pending',
        date: '2023-11-15',
        photos: [],
        citizen: 'John Doe',
        citizenContact: '9876543210',
        assignedTo: 'Rajesh Kumar',
        assignedDate: '2023-11-15',
        dueDate: '2023-11-22',
        investigationNotes: '',
        resolutionNotes: '',
        escalationLevel: 0
    },
    {
        id: 2,
        type: 'vehicle_emission',
        priority: 'medium',
        location: 'Connaught Place, Near Metro Station',
        description: 'Multiple vehicles emitting excessive black smoke during peak hours',
        status: 'in-progress',
        date: '2023-11-14',
        photos: [],
        citizen: 'Priya Sharma',
        citizenContact: '9876543211',
        assignedTo: 'Amit Singh',
        assignedDate: '2023-11-14',
        dueDate: '2023-11-21',
        investigationNotes: 'Field inspection completed, waiting for lab results',
        resolutionNotes: '',
        escalationLevel: 0
    },
    {
        id: 3,
        type: 'waste_burning',
        priority: 'critical',
        location: 'Dwarka Sector 12, Park Area',
        description: 'Large scale waste burning in open area, causing severe air pollution',
        status: 'resolved',
        date: '2023-11-10',
        photos: [],
        citizen: 'Ravi Verma',
        citizenContact: '9876543212',
        assignedTo: 'Neha Gupta',
        assignedDate: '2023-11-10',
        dueDate: '2023-11-17',
        investigationNotes: 'Identified local residents burning waste',
        resolutionNotes: 'Fined residents and provided alternative waste disposal solutions',
        escalationLevel: 0
    },
    {
        id: 4,
        type: 'construction_dust',
        priority: 'high',
        location: 'Rohini Sector 15, Construction Site',
        description: 'Construction site without proper dust control measures, affecting nearby residents',
        status: 'pending',
        date: '2023-11-12',
        photos: [],
        citizen: 'Anil Kumar',
        citizenContact: '9876543213',
        assignedTo: 'Rajesh Kumar',
        assignedDate: '2023-11-12',
        dueDate: '2023-11-19',
        investigationNotes: '',
        resolutionNotes: '',
        escalationLevel: 1
    },
    {
        id: 5,
        type: 'industrial_pollution',
        priority: 'medium',
        location: 'Mayapuri Industrial Area',
        description: 'Chemical odor coming from factory, causing breathing difficulties',
        status: 'in-progress',
        date: '2023-11-11',
        photos: [],
        citizen: 'Suresh Patel',
        citizenContact: '9876543214',
        assignedTo: 'Amit Singh',
        assignedDate: '2023-11-11',
        dueDate: '2023-11-18',
        investigationNotes: 'Air quality testing in progress',
        resolutionNotes: '',
        escalationLevel: 0
    }
];

const MOCK_DEPARTMENT_SHELTERS = [
    {
        id: 1,
        name: 'Central Delhi Shelter',
        zone: 'central',
        address: 'Connaught Place, New Delhi',
        capacity: 50,
        occupancy: 15,
        status: 'available',
        facilities: ['air_purifiers', 'medical_staff', 'masks', 'water'],
        contact: '011-12345678',
        lastMaintenance: '2023-11-01',
        nextMaintenance: '2023-12-01'
    },
    {
        id: 2,
        name: 'South Delhi Shelter',
        zone: 'south',
        address: 'Saket, New Delhi',
        capacity: 35,
        occupancy: 30,
        status: 'limited',
        facilities: ['air_purifiers', 'medical_staff'],
        contact: '011-12345679',
        lastMaintenance: '2023-10-25',
        nextMaintenance: '2023-11-25'
    },
    {
        id: 3,
        name: 'East Delhi Shelter',
        zone: 'east',
        address: 'Preet Vihar, Delhi',
        capacity: 40,
        occupancy: 40,
        status: 'full',
        facilities: ['air_purifiers', 'masks'],
        contact: '011-12345680',
        lastMaintenance: '2023-11-05',
        nextMaintenance: '2023-12-05'
    },
    {
        id: 4,
        name: 'North Delhi Shelter',
        zone: 'north',
        address: 'Rohini Sector 8',
        capacity: 45,
        occupancy: 10,
        status: 'available',
        facilities: ['air_purifiers', 'medical_staff', 'water'],
        contact: '011-12345681',
        lastMaintenance: '2023-10-30',
        nextMaintenance: '2023-11-30'
    }
];

const MOCK_DEPARTMENT_EVENTS = [
    {
        id: 1,
        name: 'Clean Air Awareness Workshop',
        type: 'workshop',
        start: '2023-11-15T10:00:00',
        end: '2023-11-15T13:00:00',
        location: 'India Habitat Centre, Lodhi Road',
        description: 'Learn about air pollution sources, health impacts, and preventive measures',
        maxAttendees: 100,
        currentAttendees: 45,
        status: 'active',
        organizer: 'Rajesh Kumar'
    },
    {
        id: 2,
        name: 'Tree Plantation Drive',
        type: 'campaign',
        start: '2023-11-20T09:00:00',
        end: '2023-11-20T12:00:00',
        location: 'Sanjay Van, Near Qutub Minar',
        description: 'Plant 5000 saplings to combat air pollution',
        maxAttendees: 200,
        currentAttendees: 120,
        status: 'planned',
        organizer: 'Neha Gupta'
    },
    {
        id: 3,
        name: 'Pollution Control Training',
        type: 'training',
        start: '2023-11-25T14:00:00',
        end: '2023-11-25T17:00:00',
        location: 'DPCC Training Center',
        description: 'Training for field officers on pollution monitoring and control',
        maxAttendees: 50,
        currentAttendees: 25,
        status: 'planned',
        organizer: 'Amit Singh'
    }
];

// ===== DEPARTMENT DASHBOARD FUNCTIONS =====

/**
 * Initialize the department dashboard when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeDepartmentDashboard();
});

/**
 * Initialize all department dashboard components
 */
function initializeDepartmentDashboard() {
    // Hide global loader
    setTimeout(() => {
        document.getElementById('globalLoader').style.display = 'none';
    }, 1000);
    
    // Load department data
    loadDepartmentData();
    
    // Set up event listeners
    setupDepartmentEventListeners();
    
    // Initialize sections
    initializeDepartmentDashboardSection();
    initializeComplaintManagementSection();
    initializeReportsSection();
    initializeSheltersSection();
    initializeEventsSection();
    initializePolicyRatingSection();
    initializeProfileSection();
    
    // Load initial data
    loadComplaints();
    loadDepartmentStats();
    createCharts();
    
    // Set up auto-refresh for dashboard data (every 2 minutes)
    setInterval(loadDepartmentStats, 120000);
}

/**
 * Set up all department-specific event listeners
 */
function setupDepartmentEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', handleDepartmentNavigation);
    });
    
    // Header buttons
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', toggleSidebar);
    document.getElementById('notificationsBtn').addEventListener('click', toggleNotificationPanel);
    document.getElementById('profileBtn').addEventListener('click', toggleProfilePanel);
    document.getElementById('translateBtn').addEventListener('click', toggleTranslationPanel);
    document.getElementById('floatingChatbotBtn').addEventListener('click', toggleChatbotPanel);
    document.getElementById('floatingMicrophoneBtn').addEventListener('click', toggleVoicePanel);
    
    // Logout buttons
    document.getElementById('logout-sidebar').addEventListener('click', logoutDepartment);
    document.getElementById('logout-profile').addEventListener('click', logoutDepartment);
    
    // Form submissions
    document.getElementById('departmentProfileForm').addEventListener('submit', saveDepartmentProfile);
    document.getElementById('officerProfileForm').addEventListener('submit', saveOfficerProfile);
    
    // Close buttons
    document.getElementById('closeChatbot').addEventListener('click', toggleChatbotPanel);
    document.getElementById('closeVoice').addEventListener('click', toggleVoicePanel);
    document.getElementById('closeTranslation').addEventListener('click', toggleTranslationPanel);
    
    // Mark all notifications as read
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsRead);
    
    // Apply translation
    document.getElementById('applyTranslation').addEventListener('click', applyTranslation);
    
    // Send chatbot message
    document.getElementById('sendChatbotMessage').addEventListener('click', sendDepartmentChatbotMessage);
    document.getElementById('chatbotInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendDepartmentChatbotMessage();
    });
}

/**
 * Handle department sidebar navigation
 */
function handleDepartmentNavigation(e) {
    e.preventDefault();
    if (e.target.id === 'logout-sidebar') {
        logoutDepartment();
        return;
    }
    const section = e.target.getAttribute('data-section');
    showSection(section);
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

/**
 * Load department data from localStorage or mock data
 */
function loadDepartmentData() {
    const savedDepartment = localStorage.getItem('currentDepartment');
    if (savedDepartment) {
        currentDepartment = JSON.parse(savedDepartment);
    } else {
        // Use mock data for demo
        currentDepartment = MOCK_DEPARTMENT_DATA.department;
        localStorage.setItem('currentDepartment', JSON.stringify(currentDepartment));
    }
    
    // Update UI with department data
    updateDepartmentUI();
}

/**
 * Update UI with current department information
 */
function updateDepartmentUI() {
    if (!currentDepartment) return;
    
    // Update header
    document.getElementById('headerPoints').textContent = `Dept ID: ${currentDepartment.id}`;
    
    // Update profile panel
    document.getElementById('profileUserName').textContent = currentDepartment.officer;
    document.getElementById('profileUserLocation').textContent = currentDepartment.designation;
    
    // Update profile forms
    document.getElementById('deptName').value = currentDepartment.name;
    document.getElementById('deptCode').value = currentDepartment.id;
    document.getElementById('deptEmail').value = currentDepartment.email;
    document.getElementById('deptPhone').value = currentDepartment.phone;
    document.getElementById('deptAddress').value = currentDepartment.address;
    
    document.getElementById('officerName').value = currentDepartment.officer;
    document.getElementById('officerDesignation').value = currentDepartment.designation;
    document.getElementById('officerEmail').value = currentDepartment.email;
    document.getElementById('officerMobile').value = currentDepartment.phone;
    document.getElementById('officerRole').value = currentDepartment.role;
}

/**
 * Logout department user
 */
function logoutDepartment() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentDepartment');
        window.location.href = 'auth.html';
    }
}

// ===== DEPARTMENT DASHBOARD SECTION =====

/**
 * Initialize department dashboard section
 */
function initializeDepartmentDashboardSection() {
    // Load recent complaints for dashboard
    loadRecentComplaints();
    
    // Set up quick action buttons
    setupQuickActions();
}

/**
 * Load department statistics and update dashboard
 */
function loadDepartmentStats() {
    // In a real app, this would fetch from API
    // For demo, use mock data
    
    const stats = MOCK_DEPARTMENT_DATA.stats;
    
    // Update stat cards
    document.getElementById('total-complaints').textContent = stats.total;
    document.getElementById('pending-complaints').textContent = stats.pending;
    document.getElementById('inprogress-complaints').textContent = stats.inProgress;
    document.getElementById('resolved-complaints').textContent = stats.resolved;
    
    // Update AQI value (random for demo)
    const aqi = Math.floor(200 + Math.random() * 100);
    document.getElementById('current-aqi-value').textContent = aqi;
    
    // Update AQI badge and progress bar
    const aqiBadge = document.querySelector('#department-dashboard-section-content .badge');
    const progressBar = document.querySelector('#department-dashboard-section-content .progress-bar');
    
    let aqiClass = 'aqi-moderate';
    let aqiCategory = 'Moderate';
    
    if (aqi <= 50) {
        aqiClass = 'aqi-good';
        aqiCategory = 'Good';
    } else if (aqi <= 100) {
        aqiClass = 'aqi-satisfactory';
        aqiCategory = 'Satisfactory';
    } else if (aqi <= 200) {
        aqiClass = 'aqi-moderate';
        aqiCategory = 'Moderate';
    } else if (aqi <= 300) {
        aqiClass = 'aqi-poor';
        aqiCategory = 'Poor';
    } else if (aqi <= 400) {
        aqiClass = 'aqi-very-poor';
        aqiCategory = 'Very Poor';
    } else {
        aqiClass = 'aqi-severe';
        aqiCategory = 'Severe';
    }
    
    aqiBadge.className = `badge fs-5 px-3 py-2 mb-3 ${aqiClass}`;
    aqiBadge.textContent = aqiCategory;
    
    progressBar.className = `progress-bar ${aqiClass}`;
    progressBar.style.width = `${Math.min((aqi / 500) * 100, 100)}%`;
}

/**
 * Load recent complaints for dashboard display
 */
function loadRecentComplaints() {
    const recentComplaints = MOCK_DEPARTMENT_COMPLAINTS.slice(0, 5);
    const container = document.getElementById('recentComplaints');
    
    if (recentComplaints.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No recent complaints</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    recentComplaints.forEach(complaint => {
        const statusClass = getStatusClass(complaint.status);
        const priorityClass = getPriorityClass(complaint.priority);
        const typeLabel = getTypeLabel(complaint.type);
        
        html += `
            <div class="recent-complaint-item border-bottom pb-2 mb-2">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${typeLabel}</h6>
                        <p class="small text-muted mb-1">${complaint.location}</p>
                        <small class="text-muted">Complaint #${complaint.id} • ${complaint.date}</small>
                    </div>
                    <div class="text-end ms-2">
                        <span class="status-badge ${statusClass}">${complaint.status.replace('-', ' ')}</span>
                        <span class="priority-badge ${priorityClass} d-block mt-1">${complaint.priority}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Set up quick action buttons functionality
 */
function setupQuickActions() {
    // Quick action buttons are already set up with onclick handlers
    // Add any additional setup here if needed
}

/**
 * Generate a report
 * @param {string} type - Report type (daily, weekly, monthly, etc.)
 */
function generateReport(type = 'daily') {
    showAlert(`Generating ${type} report... This would download a PDF report in a real application.`, 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`, 'success');
    }, 1500);
}

/**
 * Assign multiple complaints to team members
 */
function assignBulkComplaints() {
    showAlert('Opening bulk assignment dialog... In a real app, this would allow assigning multiple complaints to different officers.', 'info');
}

/**
 * Show emergency protocol
 */
function showEmergencyProtocol() {
    const protocol = `
        <h5>Emergency Pollution Control Protocol</h5>
        <ol>
            <li><strong>Immediate Action:</strong> Activate emergency response team</li>
            <li><strong>Communication:</strong> Notify higher authorities and relevant departments</li>
            <li><strong>Public Alert:</strong> Issue public health advisory</li>
            <li><strong>Shelter Activation:</strong> Open all AQI shelters</li>
            <li><strong>Field Operations:</strong> Deploy field teams to affected areas</li>
            <li><strong>Monitoring:</strong> Increase air quality monitoring frequency</li>
            <li><strong>Reporting:</strong> Submit emergency report within 2 hours</li>
        </ol>
    `;
    
    showAlert(protocol, 'warning');
}

// ===== COMPLAINT MANAGEMENT SECTION =====

/**
 * Initialize complaint management section
 */
function initializeComplaintManagementSection() {
    // Set up filter event listeners
    document.getElementById('filterStatus').addEventListener('change', filterComplaints);
    document.getElementById('filterPriority').addEventListener('change', filterComplaints);
    document.getElementById('filterType').addEventListener('change', filterComplaints);
    document.getElementById('filterDate').addEventListener('change', filterComplaints);
    
    // Set up select all checkbox
    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
}

/**
 * Load all complaints for management
 */
function loadComplaints() {
    // In a real app, this would fetch from API
    departmentComplaints = [...MOCK_DEPARTMENT_COMPLAINTS];
    filteredComplaints = [...departmentComplaints];
    
    // Update total count
    document.getElementById('totalCount').textContent = `${filteredComplaints.length} complaints`;
    
    // Render complaints table
    renderComplaintsTable();
}

/**
 * Render complaints table with current filtered data
 */
function renderComplaintsTable() {
    const tbody = document.getElementById('complaintsTableBody');
    const startIndex = (currentPage - 1) * complaintsPerPage;
    const endIndex = startIndex + complaintsPerPage;
    const pageComplaints = filteredComplaints.slice(startIndex, endIndex);
    
    if (pageComplaints.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No complaints found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    pageComplaints.forEach(complaint => {
        const statusClass = getStatusClass(complaint.status);
        const priorityClass = getPriorityClass(complaint.priority);
        const typeLabel = getTypeLabel(complaint.type);
        const isSelected = selectedComplaints.has(complaint.id);
        
        html += `
            <tr data-id="${complaint.id}">
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleComplaintSelection(${complaint.id})">
                </td>
                <td>#${complaint.id}</td>
                <td>${typeLabel}</td>
                <td>${complaint.location}</td>
                <td><span class="priority-badge ${priorityClass}">${complaint.priority}</span></td>
                <td><span class="status-badge ${statusClass}">${complaint.status.replace('-', ' ')}</span></td>
                <td>${complaint.date}</td>
                <td>${complaint.assignedTo || 'Unassigned'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails(${complaint.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editComplaint(${complaint.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="assignComplaint(${complaint.id})">
                        <i class="fas fa-user-plus"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Update pagination
    updatePagination();
}

/**
 * Filter complaints based on selected filters
 */
function filterComplaints() {
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const type = document.getElementById('filterType').value;
    const dateRange = document.getElementById('filterDate').value;
    
    filteredComplaints = departmentComplaints.filter(complaint => {
        // Status filter
        if (status !== 'all' && complaint.status !== status) return false;
        
        // Priority filter
        if (priority !== 'all' && complaint.priority !== priority) return false;
        
        // Type filter
        if (type !== 'all' && complaint.type !== type) return false;
        
        // Date filter
        if (dateRange !== 'all') {
            const complaintDate = new Date(complaint.date);
            const today = new Date();
            
            switch(dateRange) {
                case 'today':
                    if (complaintDate.toDateString() !== today.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date();
                    weekAgo.setDate(today.getDate() - 7);
                    if (complaintDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date();
                    monthAgo.setMonth(today.getMonth() - 1);
                    if (complaintDate < monthAgo) return false;
                    break;
            }
        }
        
        return true;
    });
    
    currentPage = 1;
    document.getElementById('totalCount').textContent = `${filteredComplaints.length} complaints`;
    renderComplaintsTable();
}

/**
 * Reset all filters
 */
function resetFilters() {
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterPriority').value = 'all';
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterDate').value = 'all';
    
    filterComplaints();
}

/**
 * Toggle select all complaints
 */
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('#complaintsTableBody input[type="checkbox"]');
    
    if (selectAll) {
        filteredComplaints.forEach(complaint => {
            selectedComplaints.add(complaint.id);
        });
    } else {
        selectedComplaints.clear();
    }
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll;
    });
}

/**
 * Toggle selection of individual complaint
 * @param {number} complaintId - ID of the complaint
 */
function toggleComplaintSelection(complaintId) {
    if (selectedComplaints.has(complaintId)) {
        selectedComplaints.delete(complaintId);
    } else {
        selectedComplaints.add(complaintId);
    }
    
    // Update select all checkbox
    const total = filteredComplaints.length;
    const selected = selectedComplaints.size;
    document.getElementById('selectAll').checked = selected === total;
    document.getElementById('selectAll').indeterminate = selected > 0 && selected < total;
}

/**
 * Perform bulk action on selected complaints
 */
function performBulkAction() {
    const action = document.getElementById('bulkAction').value;
    
    if (selectedComplaints.size === 0) {
        showAlert('Please select complaints to perform bulk action', 'warning');
        return;
    }
    
    if (!action) {
        showAlert('Please select an action to perform', 'warning');
        return;
    }
    
    switch(action) {
        case 'assign':
            assignSelectedComplaints();
            break;
        case 'status':
            changeSelectedStatus();
            break;
        case 'priority':
            changeSelectedPriority();
            break;
        case 'export':
            exportSelectedComplaints();
            break;
    }
}

/**
 * Assign selected complaints to officer
 */
function assignSelectedComplaints() {
    const officer = prompt('Enter officer name to assign selected complaints:');
    if (officer) {
        selectedComplaints.forEach(id => {
            const complaint = departmentComplaints.find(c => c.id === id);
            if (complaint) {
                complaint.assignedTo = officer;
                complaint.assignedDate = new Date().toISOString().split('T')[0];
            }
        });
        
        showAlert(`Assigned ${selectedComplaints.size} complaints to ${officer}`, 'success');
        selectedComplaints.clear();
        renderComplaintsTable();
    }
}

/**
 * Change status of selected complaints
 */
function changeSelectedStatus() {
    const status = prompt('Enter new status (pending, in-progress, resolved, rejected):');
    if (status && ['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
        selectedComplaints.forEach(id => {
            const complaint = departmentComplaints.find(c => c.id === id);
            if (complaint) {
                complaint.status = status;
            }
        });
        
        showAlert(`Updated status for ${selectedComplaints.size} complaints`, 'success');
        selectedComplaints.clear();
        renderComplaintsTable();
        loadDepartmentStats();
    } else if (status) {
        showAlert('Invalid status. Please use: pending, in-progress, resolved, or rejected', 'error');
    }
}

/**
 * Change priority of selected complaints
 */
function changeSelectedPriority() {
    const priority = prompt('Enter new priority (low, medium, high, critical):');
    if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
        selectedComplaints.forEach(id => {
            const complaint = departmentComplaints.find(c => c.id === id);
            if (complaint) {
                complaint.priority = priority;
            }
        });
        
        showAlert(`Updated priority for ${selectedComplaints.size} complaints`, 'success');
        selectedComplaints.clear();
        renderComplaintsTable();
    } else if (priority) {
        showAlert('Invalid priority. Please use: low, medium, high, or critical', 'error');
    }
}

/**
 * Export selected complaints
 */
function exportSelectedComplaints() {
    const selected = Array.from(selectedComplaints).map(id => 
        departmentComplaints.find(c => c.id === id)
    );
    
    // In a real app, this would generate a CSV or Excel file
    showAlert(`Preparing export for ${selected.length} complaints...`, 'info');
    
    setTimeout(() => {
        showAlert(`Exported ${selected.length} complaints successfully!`, 'success');
        selectedComplaints.clear();
        renderComplaintsTable();
    }, 1000);
}

/**
 * Export all complaints
 */
function exportComplaints() {
    showAlert(`Exporting all ${filteredComplaints.length} complaints...`, 'info');
    
    setTimeout(() => {
        showAlert(`Exported ${filteredComplaints.length} complaints successfully!`, 'success');
    }, 1000);
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = html;
}

/**
 * Change to a different page
 * @param {number} page - Page number to navigate to
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderComplaintsTable();
}

/**
 * View complaint details
 * @param {number} complaintId - ID of the complaint
 */
function viewComplaintDetails(complaintId) {
    const complaint = departmentComplaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    // Update modal title
    document.getElementById('complaintModalId').textContent = `#${complaint.id}`;
    
    // Create complaint details HTML
    const statusClass = getStatusClass(complaint.status);
    const priorityClass = getPriorityClass(complaint.priority);
    const typeLabel = getTypeLabel(complaint.type);
    
    const html = `
        <div class="row">
            <div class="col-md-6">
                <h6>Complaint Information</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="120">Type:</th>
                        <td>${typeLabel}</td>
                    </tr>
                    <tr>
                        <th>Priority:</th>
                        <td><span class="priority-badge ${priorityClass}">${complaint.priority}</span></td>
                    </tr>
                    <tr>
                        <th>Status:</th>
                        <td><span class="status-badge ${statusClass}">${complaint.status.replace('-', ' ')}</span></td>
                    </tr>
                    <tr>
                        <th>Location:</th>
                        <td>${complaint.location}</td>
                    </tr>
                    <tr>
                        <th>Date:</th>
                        <td>${complaint.date}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Assignment Details</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="120">Assigned To:</th>
                        <td>${complaint.assignedTo || 'Unassigned'}</td>
                    </tr>
                    <tr>
                        <th>Assigned Date:</th>
                        <td>${complaint.assignedDate || '-'}</td>
                    </tr>
                    <tr>
                        <th>Due Date:</th>
                        <td>${complaint.dueDate || '-'}</td>
                    </tr>
                    <tr>
                        <th>Escalation:</th>
                        <td>Level ${complaint.escalationLevel || 0}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-12">
                <h6>Description</h6>
                <p>${complaint.description}</p>
            </div>
        </div>
        
        ${complaint.investigationNotes ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Investigation Notes</h6>
                <p>${complaint.investigationNotes}</p>
            </div>
        </div>
        ` : ''}
        
        ${complaint.resolutionNotes ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Resolution Notes</h6>
                <p>${complaint.resolutionNotes}</p>
            </div>
        </div>
        ` : ''}
        
        <div class="row mt-3">
            <div class="col-12">
                <h6>Citizen Information</h6>
                <p>Name: ${complaint.citizen}</p>
                <p>Contact: ${complaint.citizenContact}</p>
            </div>
        </div>
    `;
    
    document.getElementById('complaintDetailsContent').innerHTML = html;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('complaintDetailsModal'));
    modal.show();
}

/**
 * Edit complaint
 * @param {number} complaintId - ID of the complaint
 */
function editComplaint(complaintId) {
    showAlert(`Editing complaint #${complaintId}... In a real app, this would open an edit form.`, 'info');
}

/**
 * Assign complaint to officer
 * @param {number} complaintId - ID of the complaint
 */
function assignComplaint(complaintId) {
    const officer = prompt('Enter officer name to assign this complaint:');
    if (officer) {
        const complaint = departmentComplaints.find(c => c.id === complaintId);
        if (complaint) {
            complaint.assignedTo = officer;
            complaint.assignedDate = new Date().toISOString().split('T')[0];
            renderComplaintsTable();
            showAlert(`Complaint #${complaintId} assigned to ${officer}`, 'success');
        }
    }
}

// ===== REPORTS & ANALYTICS SECTION =====

/**
 * Initialize reports section
 */
function initializeReportsSection() {
    // Create charts
    createComplaintTypeChart();
    createResolutionTimeChart();
    createGeographicMap();
}

/**
 * Create complaint type distribution chart
 */
function createComplaintTypeChart() {
    const ctx = document.getElementById('complaintTypeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (departmentCharts.complaintType) {
        departmentCharts.complaintType.destroy();
    }
    
    // Calculate complaint type distribution
    const types = {
        'Industrial Pollution': 0,
        'Vehicle Emission': 0,
        'Construction Dust': 0,
        'Waste Burning': 0,
        'Other': 0
    };
    
    departmentComplaints.forEach(complaint => {
        const typeLabel = getTypeLabel(complaint.type);
        types[typeLabel]++;
    });
    
    departmentCharts.complaintType = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(types),
            datasets: [{
                data: Object.values(types),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
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
 * Create resolution time trend chart
 */
function createResolutionTimeChart() {
    const ctx = document.getElementById('resolutionTimeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (departmentCharts.resolutionTime) {
        departmentCharts.resolutionTime.destroy();
    }
    
    // Mock data for resolution time trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const resolutionTimes = [48, 42, 36, 32, 28, 24]; // in hours
    
    departmentCharts.resolutionTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Average Resolution Time (hours)',
                data: resolutionTimes,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
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
                        text: 'Hours'
                    }
                }
            }
        }
    });
}

/**
 * Create geographic distribution map
 */
function createGeographicMap() {
    const mapContainer = document.getElementById('complaintMap');
    if (!mapContainer) return;
    
    // Initialize Leaflet map centered on Delhi
    complaintMap = L.map('complaintMap').setView([28.6139, 77.2090], 11);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(complaintMap);
    
    // Add markers for complaint hotspots
    const hotspots = [
        { lat: 28.5402, lng: 77.2739, name: 'Okhla Industrial Area', count: 45 },
        { lat: 28.6304, lng: 77.2177, name: 'Connaught Place', count: 32 },
        { lat: 28.5821, lng: 77.0458, name: 'Dwarka Sector 12', count: 28 },
        { lat: 28.7041, lng: 77.1025, name: 'Rohini Sector 15', count: 22 },
        { lat: 28.5272, lng: 77.0689, name: 'Mayapuri', count: 18 }
    ];
    
    hotspots.forEach(hotspot => {
        const marker = L.marker([hotspot.lat, hotspot.lng]).addTo(complaintMap);
        marker.bindPopup(`
            <strong>${hotspot.name}</strong><br>
            ${hotspot.count} complaints<br>
            <button class="btn btn-sm btn-primary mt-1" onclick="viewHotspotComplaints('${hotspot.name}')">
                View Complaints
            </button>
        `);
        
        // Add circle to show intensity
        L.circle([hotspot.lat, hotspot.lng], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.2,
            radius: hotspot.count * 50
        }).addTo(complaintMap);
    });
}

/**
 * View complaints for a specific hotspot
 * @param {string} hotspotName - Name of the hotspot area
 */
function viewHotspotComplaints(hotspotName) {
    showAlert(`Filtering complaints for ${hotspotName}...`, 'info');
    // In a real app, this would filter the complaints table
}

/**
 * Generate report based on selected options
 */
function generateReport() {
    const type = document.getElementById('reportType').value;
    const period = document.getElementById('reportPeriod').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    showAlert(`Generating ${type} report for ${period} period (${startDate} to ${endDate})...`, 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showAlert('Report generated successfully! Download will start automatically.', 'success');
        
        // In a real app, this would trigger a download
        // For demo, show a preview
        showReportPreview();
    }, 2000);
}

/**
 * Generate Excel report
 */
function generateExcelReport() {
    showAlert('Generating Excel report...', 'info');
    
    setTimeout(() => {
        showAlert('Excel report generated successfully! Download will start automatically.', 'success');
    }, 1500);
}

/**
 * Show report preview
 */
function showReportPreview() {
    const reportHtml = `
        <h5>Department Performance Report Preview</h5>
        <div class="report-preview">
            <h6>Summary (Nov 1 - Nov 30, 2023)</h6>
            <ul>
                <li>Total Complaints: 245</li>
                <li>Resolved: 120 (49%)</li>
                <li>Average Resolution Time: 24 hours</li>
                <li>Citizen Satisfaction: 4.2/5</li>
            </ul>
            
            <h6>Top Complaint Types</h6>
            <ol>
                <li>Industrial Pollution: 45%</li>
                <li>Vehicle Emission: 25%</li>
                <li>Construction Dust: 15%</li>
                <li>Waste Burning: 10%</li>
                <li>Other: 5%</li>
            </ol>
            
            <h6>Recommendations</h6>
            <p>1. Increase monitoring in Okhla Industrial Area<br>
            2. Implement stricter vehicle emission checks<br>
            3. Coordinate with construction authorities for dust control</p>
        </div>
    `;
    
    showAlert(reportHtml, 'info');
}

// ===== AQI SHELTERS MANAGEMENT SECTION =====

/**
 * Initialize shelters management section
 */
function initializeSheltersSection() {
    loadShelters();
    createShelterUtilizationChart();
}

/**
 * Load shelters data
 */
function loadShelters() {
    departmentShelters = [...MOCK_DEPARTMENT_SHELTERS];
    renderSheltersGrid();
}

/**
 * Render shelters grid
 */
function renderSheltersGrid() {
    const grid = document.getElementById('sheltersGrid');
    const statusFilter = document.getElementById('shelterStatusFilter').value;
    const zoneFilter = document.getElementById('shelterZoneFilter').value;
    const searchTerm = document.getElementById('shelterSearch').value.toLowerCase();
    
    let filteredShelters = departmentShelters.filter(shelter => {
        // Status filter
        if (statusFilter !== 'all' && shelter.status !== statusFilter) return false;
        
        // Zone filter
        if (zoneFilter !== 'all' && shelter.zone !== zoneFilter) return false;
        
        // Search filter
        if (searchTerm && !shelter.name.toLowerCase().includes(searchTerm)) return false;
        
        return true;
    });
    
    if (filteredShelters.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="fas fa-home fa-3x mb-3"></i>
                <p>No shelters found</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    filteredShelters.forEach(shelter => {
        const statusClass = getShelterStatusClass(shelter.status);
        const statusText = getShelterStatusText(shelter.status);
        const utilization = Math.round((shelter.occupancy / shelter.capacity) * 100);
        
        html += `
            <div class="col-md-4 mb-3">
                <div class="shelter-management-card">
                    <div class="shelter-card-header ${statusClass}">
                        <h5 class="mb-0">${shelter.name}</h5>
                        <span class="shelter-status">${statusText}</span>
                    </div>
                    <div class="shelter-card-body">
                        <p class="text-muted mb-2"><i class="fas fa-map-marker-alt me-1"></i> ${shelter.address}</p>
                        <div class="d-flex justify-content-between mb-2">
                            <span><i class="fas fa-user me-1"></i> Capacity: ${shelter.capacity}</span>
                            <span><i class="fas fa-users me-1"></i> Occupied: ${shelter.occupancy}</span>
                        </div>
                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar ${utilization > 80 ? 'bg-danger' : utilization > 50 ? 'bg-warning' : 'bg-success'}" 
                                 style="width: ${utilization}%"></div>
                        </div>
                        <small class="text-muted">Utilization: ${utilization}%</small>
                        <div class="mb-2 mt-2">
                            ${shelter.facilities.includes('air_purifiers') ? '<span class="badge bg-primary me-1"><i class="fas fa-wind me-1"></i> Air Purifiers</span>' : ''}
                            ${shelter.facilities.includes('medical_staff') ? '<span class="badge bg-success me-1"><i class="fas fa-user-md me-1"></i> Medical Staff</span>' : ''}
                        </div>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary" onclick="editShelter(${shelter.id})">
                                <i class="fas fa-edit me-1"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="viewShelterDetails(${shelter.id})">
                                <i class="fas fa-info-circle me-1"></i> Details
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="updateShelterStatus(${shelter.id}, 'maintenance')">
                                <i class="fas fa-tools me-1"></i> Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

/**
 * Filter shelters based on search and filters
 */
function filterShelters() {
    renderSheltersGrid();
}

/**
 * Get CSS class for shelter status
 * @param {string} status - Shelter status
 * @returns {string} CSS class
 */
function getShelterStatusClass(status) {
    switch(status) {
        case 'available': return 'available';
        case 'limited': return 'limited';
        case 'full': return 'full';
        case 'maintenance': return 'maintenance';
        default: return '';
    }
}

/**
 * Get display text for shelter status
 * @param {string} status - Shelter status
 * @returns {string} Display text
 */
function getShelterStatusText(status) {
    switch(status) {
        case 'available': return 'Available';
        case 'limited': return 'Limited';
        case 'full': return 'Full';
        case 'maintenance': return 'Under Maintenance';
        default: return status;
    }
}

/**
 * Open modal to add new shelter
 */
function openAddShelterModal() {
    // Reset form
    document.getElementById('shelterForm').reset();
    document.getElementById('shelterName').value = '';
    document.getElementById('shelterZone').value = '';
    document.getElementById('shelterCapacity').value = '';
    document.getElementById('shelterOccupancy').value = '';
    document.getElementById('shelterAddress').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('shelterModal'));
    modal.show();
}

/**
 * Edit existing shelter
 * @param {number} shelterId - ID of the shelter
 */
function editShelter(shelterId) {
    const shelter = departmentShelters.find(s => s.id === shelterId);
    if (!shelter) return;
    
    // Fill form with shelter data
    document.getElementById('shelterName').value = shelter.name;
    document.getElementById('shelterZone').value = shelter.zone;
    document.getElementById('shelterCapacity').value = shelter.capacity;
    document.getElementById('shelterOccupancy').value = shelter.occupancy;
    document.getElementById('shelterAddress').value = shelter.address;
    
    // Set facilities checkboxes
    document.getElementById('facilityAirPurifiers').checked = shelter.facilities.includes('air_purifiers');
    document.getElementById('facilityMedical').checked = shelter.facilities.includes('medical_staff');
    document.getElementById('facilityMasks').checked = shelter.facilities.includes('masks');
    document.getElementById('facilityWater').checked = shelter.facilities.includes('water');
    
    // Store shelter ID for update
    document.getElementById('shelterForm').dataset.shelterId = shelterId;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('shelterModal'));
    modal.show();
}

/**
 * Save shelter (create or update)
 */
function saveShelter() {
    const form = document.getElementById('shelterForm');
    const shelterId = form.dataset.shelterId;
    
    const shelterData = {
        name: document.getElementById('shelterName').value,
        zone: document.getElementById('shelterZone').value,
        capacity: parseInt(document.getElementById('shelterCapacity').value),
        occupancy: parseInt(document.getElementById('shelterOccupancy').value),
        address: document.getElementById('shelterAddress').value,
        facilities: []
    };
    
    // Collect facilities
    if (document.getElementById('facilityAirPurifiers').checked) shelterData.facilities.push('air_purifiers');
    if (document.getElementById('facilityMedical').checked) shelterData.facilities.push('medical_staff');
    if (document.getElementById('facilityMasks').checked) shelterData.facilities.push('masks');
    if (document.getElementById('facilityWater').checked) shelterData.facilities.push('water');
    
    // Determine status based on occupancy
    const utilization = (shelterData.occupancy / shelterData.capacity) * 100;
    if (utilization >= 100) {
        shelterData.status = 'full';
    } else if (utilization >= 80) {
        shelterData.status = 'limited';
    } else {
        shelterData.status = 'available';
    }
    
    if (shelterId) {
        // Update existing shelter
        const index = departmentShelters.findIndex(s => s.id === parseInt(shelterId));
        if (index !== -1) {
            departmentShelters[index] = { ...departmentShelters[index], ...shelterData };
            showAlert('Shelter updated successfully!', 'success');
        }
    } else {
        // Create new shelter
        const newId = departmentShelters.length > 0 ? 
            Math.max(...departmentShelters.map(s => s.id)) + 1 : 1;
        
        shelterData.id = newId;
        shelterData.contact = '011-12345678';
        shelterData.lastMaintenance = new Date().toISOString().split('T')[0];
        
        const nextMaintenance = new Date();
        nextMaintenance.setMonth(nextMaintenance.getMonth() + 1);
        shelterData.nextMaintenance = nextMaintenance.toISOString().split('T')[0];
        
        departmentShelters.push(shelterData);
        showAlert('New shelter added successfully!', 'success');
    }
    
    // Close modal and refresh grid
    bootstrap.Modal.getInstance(document.getElementById('shelterModal')).hide();
    renderSheltersGrid();
    createShelterUtilizationChart();
}

/**
 * View shelter details
 * @param {number} shelterId - ID of the shelter
 */
function viewShelterDetails(shelterId) {
    const shelter = departmentShelters.find(s => s.id === shelterId);
    if (!shelter) return;
    
    const utilization = Math.round((shelter.occupancy / shelter.capacity) * 100);
    
    const detailsHtml = `
        <h5>${shelter.name}</h5>
        <table class="table table-sm">
            <tr><th>Zone:</th><td>${shelter.zone.charAt(0).toUpperCase() + shelter.zone.slice(1)} Delhi</td></tr>
            <tr><th>Address:</th><td>${shelter.address}</td></tr>
            <tr><th>Capacity:</th><td>${shelter.capacity} people</td></tr>
            <tr><th>Current Occupancy:</th><td>${shelter.occupancy} people</td></tr>
            <tr><th>Utilization:</th><td>${utilization}%</td></tr>
            <tr><th>Status:</th><td><span class="shelter-status ${getShelterStatusClass(shelter.status)}">${getShelterStatusText(shelter.status)}</span></td></tr>
            <tr><th>Contact:</th><td>${shelter.contact}</td></tr>
            <tr><th>Last Maintenance:</th><td>${shelter.lastMaintenance}</td></tr>
            <tr><th>Next Maintenance:</th><td>${shelter.nextMaintenance}</td></tr>
        </table>
        
        <h6>Facilities</h6>
        <ul>
            ${shelter.facilities.includes('air_purifiers') ? '<li><i class="fas fa-wind text-primary me-2"></i> Air Purifiers</li>' : ''}
            ${shelter.facilities.includes('medical_staff') ? '<li><i class="fas fa-user-md text-success me-2"></i> Medical Staff</li>' : ''}
            ${shelter.facilities.includes('masks') ? '<li><i class="fas fa-mask text-info me-2"></i> Masks Available</li>' : ''}
            ${shelter.facilities.includes('water') ? '<li><i class="fas fa-tint text-primary me-2"></i> Drinking Water</li>' : ''}
        </ul>
    `;
    
    showAlert(detailsHtml, 'info');
}

/**
 * Update shelter status
 * @param {number} shelterId - ID of the shelter
 * @param {string} newStatus - New status to set
 */
function updateShelterStatus(shelterId, newStatus) {
    const shelter = departmentShelters.find(s => s.id === shelterId);
    if (!shelter) return;
    
    const oldStatus = shelter.status;
    shelter.status = newStatus;
    
    showAlert(`Shelter status changed from ${getShelterStatusText(oldStatus)} to ${getShelterStatusText(newStatus)}`, 'success');
    renderSheltersGrid();
}

/**
 * Create shelter utilization chart
 */
function createShelterUtilizationChart() {
    const ctx = document.getElementById('shelterUtilizationChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (departmentCharts.shelterUtilization) {
        departmentCharts.shelterUtilization.destroy();
    }
    
    const shelterNames = departmentShelters.map(s => s.name);
    const utilizationRates = departmentShelters.map(s => 
        Math.round((s.occupancy / s.capacity) * 100)
    );
    
    departmentCharts.shelterUtilization = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: shelterNames,
            datasets: [{
                label: 'Utilization Rate (%)',
                data: utilizationRates,
                backgroundColor: utilizationRates.map(rate => 
                    rate > 80 ? '#dc3545' : rate > 50 ? '#ffc107' : '#198754'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// ===== EVENTS MANAGEMENT SECTION =====

/**
 * Initialize events management section
 */
function initializeEventsSection() {
    loadEvents();
    initializeEventsCalendar();
}

/**
 * Load events data
 */
function loadEvents() {
    departmentEvents = [...MOCK_DEPARTMENT_EVENTS];
    renderEventsTable();
}

/**
 * Render events table
 */
function renderEventsTable() {
    const tbody = document.getElementById('eventsTable');
    
    if (departmentEvents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-calendar fa-3x mb-3"></i>
                    <p>No events scheduled</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    departmentEvents.forEach(event => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const now = new Date();
        
        let statusBadge = '';
        if (event.status === 'active' && now >= startDate && now <= endDate) {
            statusBadge = '<span class="badge bg-success">Active</span>';
        } else if (event.status === 'planned' && now < startDate) {
            statusBadge = '<span class="badge bg-primary">Planned</span>';
        } else if (event.status === 'completed') {
            statusBadge = '<span class="badge bg-secondary">Completed</span>';
        } else if (event.status === 'cancelled') {
            statusBadge = '<span class="badge bg-danger">Cancelled</span>';
        }
        
        const typeBadge = `<span class="badge bg-${getEventTypeColor(event.type)}">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>`;
        
        html += `
            <tr>
                <td>${event.name}</td>
                <td>${formatDateTime(event.start)}</td>
                <td>${event.location}</td>
                <td>${typeBadge}</td>
                <td>${event.currentAttendees}/${event.maxAttendees}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewEventDetails(${event.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="manageAttendees(${event.id})">
                        <i class="fas fa-users"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

/**
 * Get color for event type badge
 * @param {string} type - Event type
 * @returns {string} Bootstrap color class
 */
function getEventTypeColor(type) {
    switch(type) {
        case 'workshop': return 'info';
        case 'seminar': return 'primary';
        case 'campaign': return 'success';
        case 'training': return 'warning';
        default: return 'secondary';
    }
}

/**
 * Format date and time for display
 * @param {string} dateTime - ISO date string
 * @returns {string} Formatted date and time
 */
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-IN') + ', ' + date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

/**
 * Initialize events calendar
 */
function initializeEventsCalendar() {
    const calendarContainer = document.getElementById('eventsCalendar');
    
    // Create a simple calendar for demo
    // In a real app, you might use FullCalendar or similar library
    const today = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    let calendarHtml = `
        <div class="text-center mb-3">
            <h5>${monthNames[today.getMonth()]} ${today.getFullYear()}</h5>
        </div>
        <div class="calendar-grid">
            <div class="calendar-header">Sun</div>
            <div class="calendar-header">Mon</div>
            <div class="calendar-header">Tue</div>
            <div class="calendar-header">Wed</div>
            <div class="calendar-header">Thu</div>
            <div class="calendar-header">Fri</div>
            <div class="calendar-header">Sat</div>
    `;
    
    // Get first day of month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        calendarHtml += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of month
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const eventsOnDay = departmentEvents.filter(event => 
            event.start.startsWith(dateStr)
        );
        
        const hasEvents = eventsOnDay.length > 0;
        const isToday = day === today.getDate();
        
        calendarHtml += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
                ${day}
                ${hasEvents ? `<span class="event-dot" title="${eventsOnDay.length} event(s)"></span>` : ''}
            </div>
        `;
    }
    
    calendarHtml += '</div>';
    calendarContainer.innerHTML = calendarHtml;
}

/**
 * Open modal to add new event
 */
function openAddEventModal() {
    // Reset form
    document.getElementById('eventForm').reset();
    
    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(13, 0, 0, 0);
    
    document.getElementById('eventStart').value = tomorrow.toISOString().slice(0, 16);
    document.getElementById('eventEnd').value = endTime.toISOString().slice(0, 16);
    document.getElementById('eventMaxAttendees').value = 100;
    
    // Clear event ID
    delete document.getElementById('eventForm').dataset.eventId;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

/**
 * Edit existing event
 * @param {number} eventId - ID of the event
 */
function editEvent(eventId) {
    const event = departmentEvents.find(e => e.id === eventId);
    if (!event) return;
    
    // Fill form with event data
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventStart').value = event.start.slice(0, 16);
    document.getElementById('eventEnd').value = event.end.slice(0, 16);
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventMaxAttendees').value = event.maxAttendees;
    document.getElementById('eventStatus').value = event.status;
    
    // Store event ID for update
    document.getElementById('eventForm').dataset.eventId = eventId;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

/**
 * Save event (create or update)
 */
function saveEvent() {
    const form = document.getElementById('eventForm');
    const eventId = form.dataset.eventId;
    
    const eventData = {
        name: document.getElementById('eventName').value,
        type: document.getElementById('eventType').value,
        start: document.getElementById('eventStart').value,
        end: document.getElementById('eventEnd').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        maxAttendees: parseInt(document.getElementById('eventMaxAttendees').value),
        status: document.getElementById('eventStatus').value,
        organizer: currentDepartment.officer
    };
    
    // Set default current attendees for new events
    if (!eventId) {
        eventData.currentAttendees = 0;
    }
    
    if (eventId) {
        // Update existing event
        const index = departmentEvents.findIndex(e => e.id === parseInt(eventId));
        if (index !== -1) {
            departmentEvents[index] = { ...departmentEvents[index], ...eventData };
            showAlert('Event updated successfully!', 'success');
        }
    } else {
        // Create new event
        const newId = departmentEvents.length > 0 ? 
            Math.max(...departmentEvents.map(e => e.id)) + 1 : 1;
        
        eventData.id = newId;
        eventData.currentAttendees = 0;
        departmentEvents.push(eventData);
        showAlert('New event created successfully!', 'success');
    }
    
    // Close modal and refresh
    bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
    renderEventsTable();
    initializeEventsCalendar();
}

/**
 * View event details
 * @param {number} eventId - ID of the event
 */
function viewEventDetails(eventId) {
    const event = departmentEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const detailsHtml = `
        <h5>${event.name}</h5>
        <table class="table table-sm">
            <tr><th>Type:</th><td>${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</td></tr>
            <tr><th>Start:</th><td>${formatDateTime(event.start)}</td></tr>
            <tr><th>End:</th><td>${formatDateTime(event.end)}</td></tr>
            <tr><th>Location:</th><td>${event.location}</td></tr>
            <tr><th>Organizer:</th><td>${event.organizer}</td></tr>
            <tr><th>Status:</th><td>${event.status.charAt(0).toUpperCase() + event.status.slice(1)}</td></tr>
            <tr><th>Attendees:</th><td>${event.currentAttendees}/${event.maxAttendees}</td></tr>
        </table>
        
        <h6>Description</h6>
        <p>${event.description}</p>
    `;
    
    showAlert(detailsHtml, 'info');
}

/**
 * Manage event attendees
 * @param {number} eventId - ID of the event
 */
function manageAttendees(eventId) {
    const event = departmentEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const attendeeHtml = `
        <h5>Manage Attendees - ${event.name}</h5>
        <p>Current attendees: ${event.currentAttendees}/${event.maxAttendees}</p>
        
        <div class="mb-3">
            <label class="form-label">Add Attendee</label>
            <div class="input-group">
                <input type="text" class="form-control" id="attendeeName" placeholder="Enter attendee name">
                <button class="btn btn-primary" onclick="addAttendee(${eventId})">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
        
        <div class="attendee-list">
            <h6>Attendee List</h6>
            <div class="list-group">
                <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <span>Rajesh Kumar</span>
                        <button class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <!-- More attendees would be listed here -->
            </div>
        </div>
    `;
    
    showAlert(attendeeHtml, 'info');
}

/**
 * Add attendee to event (demo function)
 * @param {number} eventId - ID of the event
 */
function addAttendee(eventId) {
    const attendeeName = document.getElementById('attendeeName').value;
    if (!attendeeName) return;
    
    const event = departmentEvents.find(e => e.id === eventId);
    if (event && event.currentAttendees < event.maxAttendees) {
        event.currentAttendees++;
        showAlert(`Added ${attendeeName} to event. Total attendees: ${event.currentAttendees}`, 'success');
        renderEventsTable();
    } else {
        showAlert('Event is at full capacity', 'warning');
    }
}

// ===== POLICY RATING SECTION =====

/**
 * Initialize policy rating section
 */
function initializePolicyRatingSection() {
    createPolicyRatingChart();
    loadCitizenFeedback();
}

/**
 * Create policy rating chart
 */
function createPolicyRatingChart() {
    const ctx = document.getElementById('policyRatingChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (departmentCharts.policyRating) {
        departmentCharts.policyRating.destroy();
    }
    
    const policies = ['Odd-Even Policy', 'GRAP Implementation', 'EV Promotion'];
    const ratings = [4.2, 3.8, 4.5];
    const responseCounts = [245, 189, 156];
    
    departmentCharts.policyRating = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: policies,
            datasets: [
                {
                    label: 'Average Rating',
                    data: ratings,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Responses',
                    data: responseCounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
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
                    min: 0,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Rating (1-5)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Responses'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

/**
 * Load citizen feedback
 */
function loadCitizenFeedback() {
    // This would load from API in a real app
    // For demo, we'll use static data
    const feedbackContainer = document.getElementById('citizenFeedback');
    
    const feedback = [
        {
            name: 'Rahul Sharma',
            rating: 5,
            comment: 'The Odd-Even policy has significantly reduced traffic congestion in my area. Air quality feels better during implementation days.',
            policy: 'Odd-Even Vehicle Policy',
            date: '2 days ago'
        },
        {
            name: 'Priya Patel',
            rating: 4,
            comment: 'GRAP implementation is good but needs better communication to public about when measures are activated.',
            policy: 'GRAP Implementation',
            date: '3 days ago'
        },
        {
            name: 'Amit Kumar',
            rating: 5,
            comment: 'EV subsidies helped me switch to electric scooter. More charging stations needed though.',
            policy: 'EV Promotion',
            date: '5 days ago'
        }
    ];
    
    let html = '';
    
    feedback.forEach(item => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star ${i <= item.rating ? 'text-warning' : 'text-muted'}"></i>`;
        }
        
        html += `
            <div class="feedback-item border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <div class="rating-stars small">
                            ${stars}
                        </div>
                    </div>
                    <small class="text-muted">${item.date}</small>
                </div>
                <p class="mb-0">"${item.comment}"</p>
                <small class="text-muted">Policy: ${item.policy}</small>
            </div>
        `;
    });
    
    feedbackContainer.innerHTML = html;
}

/**
 * View detailed feedback for a policy
 * @param {string} policyCode - Policy code (odd-even, grap, ev)
 */
function viewPolicyFeedback(policyCode) {
    let policyName = '';
    switch(policyCode) {
        case 'odd-even': policyName = 'Odd-Even Policy'; break;
        case 'grap': policyName = 'GRAP Implementation'; break;
        case 'ev': policyName = 'EV Promotion'; break;
    }
    
    showAlert(`Loading detailed feedback for ${policyName}... In a real app, this would show detailed analytics and all feedback comments.`, 'info');
}

// ===== PROFILE SECTION =====

/**
 * Initialize profile section
 */
function initializeProfileSection() {
    // Load saved notification preferences
    loadNotificationPreferences();
}

/**
 * Save department profile
 * @param {Event} e - Form submission event
 */
function saveDepartmentProfile(e) {
    e.preventDefault();
    
    // Update current department data
    currentDepartment.email = document.getElementById('deptEmail').value;
    currentDepartment.phone = document.getElementById('deptPhone').value;
    currentDepartment.address = document.getElementById('deptAddress').value;
    
    // Save to localStorage
    localStorage.setItem('currentDepartment', JSON.stringify(currentDepartment));
    
    showAlert('Department information updated successfully!', 'success');
}

/**
 * Save officer profile
 * @param {Event} e - Form submission event
 */
function saveOfficerProfile(e) {
    e.preventDefault();
    
    // Update current department data
    currentDepartment.officer = document.getElementById('officerName').value;
    currentDepartment.designation = document.getElementById('officerDesignation').value;
    currentDepartment.email = document.getElementById('officerEmail').value;
    currentDepartment.phone = document.getElementById('officerMobile').value;
    currentDepartment.role = document.getElementById('officerRole').value;
    
    // Save to localStorage
    localStorage.setItem('currentDepartment', JSON.stringify(currentDepartment));
    
    // Update UI
    updateDepartmentUI();
    
    showAlert('Officer information updated successfully!', 'success');
}

/**
 * Load saved notification preferences
 */
function loadNotificationPreferences() {
    const savedPrefs = localStorage.getItem('departmentNotificationPrefs');
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        Object.keys(prefs).forEach(key => {
            const checkbox = document.getElementById(key);
            if (checkbox) {
                checkbox.checked = prefs[key];
            }
        });
    }
}

/**
 * Save notification preferences
 */
function saveNotificationPreferences() {
    const prefs = {
        notifyNewComplaint: document.getElementById('notifyNewComplaint').checked,
        notifyEscalation: document.getElementById('notifyEscalation').checked,
        notifyDeadline: document.getElementById('notifyDeadline').checked,
        notifyReport: document.getElementById('notifyReport').checked,
        notifyMaintenance: document.getElementById('notifyMaintenance').checked,
        notifyEmergency: document.getElementById('notifyEmergency').checked
    };
    
    localStorage.setItem('departmentNotificationPrefs', JSON.stringify(prefs));
    showAlert('Notification preferences saved successfully!', 'success');
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get CSS class for complaint status
 * @param {string} status - Complaint status
 * @returns {string} CSS class
 */
function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'in-progress': return 'status-in-progress';
        case 'resolved': return 'status-resolved';
        case 'rejected': return 'status-rejected';
        default: return 'status-pending';
    }
}

/**
 * Get CSS class for complaint priority
 * @param {string} priority - Complaint priority
 * @returns {string} CSS class
 */
function getPriorityClass(priority) {
    switch(priority) {
        case 'low': return 'priority-low';
        case 'medium': return 'priority-medium';
        case 'high': return 'priority-high';
        case 'critical': return 'priority-critical';
        default: return 'priority-medium';
    }
}

/**
 * Get display label for complaint type
 * @param {string} type - Complaint type code
 * @returns {string} Display label
 */
function getTypeLabel(type) {
    switch(type) {
        case 'industrial_pollution': return 'Industrial Pollution';
        case 'vehicle_emission': return 'Vehicle Emission';
        case 'construction_dust': return 'Construction Dust';
        case 'waste_burning': return 'Waste Burning';
        case 'other': return 'Other';
        default: return type;
    }
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, error, warning, info)
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show custom-alert" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.querySelector('.main-content').insertAdjacentHTML('afterbegin', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.custom-alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

/**
 * Show a specific content section and hide others
 * @param {string} section - The section to show
 */
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show the selected section
    const sectionElement = document.getElementById(`${section}-section-content`);
    if (sectionElement) {
        sectionElement.classList.add('active');
        
        // Activate corresponding sidebar link
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    }
}

/**
 * Create all charts for dashboard
 */
function createCharts() {
    createPerformanceChart();
    createPriorityChart();
}

/**
 * Create performance chart
 */
function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    departmentCharts.performance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Complaints Received',
                    data: [65, 59, 80, 81],
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Complaints Resolved',
                    data: [45, 48, 70, 75],
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Create priority distribution chart
 */
function createPriorityChart() {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    departmentCharts.priority = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Medium', 'High', 'Critical'],
            datasets: [{
                data: [40, 35, 20, 5],
                backgroundColor: [
                    '#6c757d',
                    '#ffc107',
                    '#fd7e14',
                    '#dc3545'
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
 * Send message to department chatbot
 */
function sendDepartmentChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const messagesContainer = document.getElementById('chatbotMessages');
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.textContent = message;
    messagesContainer.appendChild(userMessage);
    
    // Clear input
    input.value = '';
    
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate bot response after delay
    setTimeout(() => {
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response
        const botResponse = document.createElement('div');
        botResponse.className = 'message bot-message';
        
        let response = "I'm your department assistant. How can I help you with complaint management?";
        
        if (message.toLowerCase().includes('pending')) {
            response = "You have 45 pending complaints. 15 are high priority requiring immediate attention.";
        } else if (message.toLowerCase().includes('report')) {
            response = "I can help you generate reports. Use the Reports section for detailed analytics.";
        } else if (message.toLowerCase().includes('shelter')) {
            response = "There are 4 AQI shelters in Delhi. 2 are available, 1 is limited, and 1 is full.";
        } else if (message.toLowerCase().includes('help')) {
            response = "I can help you with: 1. Checking complaint status 2. Generating reports 3. Managing shelters 4. Viewing AQI data";
        }
        
        botResponse.textContent = response;
        messagesContainer.appendChild(botResponse);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

/**
 * Apply translation to page
 */
function applyTranslation() {
    const language = document.getElementById('translationLanguage').value;
    const languageName = language === 'en' ? 'English' : 'Hindi';
    
    showAlert(`Page translation to ${languageName} applied. In a real app, this would translate all page content.`, 'info');
    toggleTranslationPanel();
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsRead() {
    document.querySelectorAll('.notification-item').forEach(item => {
        item.classList.remove('fw-bold');
    });
    document.getElementById('notificationCount').textContent = '0';
    showAlert('All notifications marked as read', 'success');
}

// ===== SHARED FUNCTIONS (from shared.js) =====
// These functions would typically be in shared.js
// Included here for completeness

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
}

function toggleNotificationPanel() {
    document.getElementById('notificationPanel').classList.toggle('open');
    document.getElementById('profilePanel').classList.remove('open');
    document.getElementById('translationPanel').classList.remove('open');
}

function toggleProfilePanel() {
    document.getElementById('profilePanel').classList.toggle('open');
    document.getElementById('notificationPanel').classList.remove('open');
    document.getElementById('translationPanel').classList.remove('open');
}

function toggleTranslationPanel() {
    document.getElementById('translationPanel').classList.toggle('open');
    document.getElementById('notificationPanel').classList.remove('open');
    document.getElementById('profilePanel').classList.remove('open');
}

function toggleChatbotPanel() {
    document.getElementById('chatbotPanel').classList.toggle('open');
}

function toggleVoicePanel() {
    document.getElementById('voicePanel').classList.toggle('open');
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initializeDepartmentDashboard);