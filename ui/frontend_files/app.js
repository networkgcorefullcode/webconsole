// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

// API Base URL
const API_BASE = '/config/v1';

// Global variables
let currentSection = 'device-groups';
let currentEditType = '';
let currentEditName = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSection('device-groups');
});

// Section management
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section).style.display = 'block';
    
    // Add active class to current nav link
    event.target.classList.add('active');
    
    currentSection = section;
    loadData(section);
}

// Load data for current section
function loadData(section) {
    switch(section) {
        case 'device-groups':
            loadDeviceGroups();
            break;
        case 'network-slices':
            loadNetworkSlices();
            break;
        case 'gnb-inventory':
            loadGnbs();
            break;
        case 'upf-inventory':
            loadUpfs();
            break;
    }
}

// Device Groups functions
async function loadDeviceGroups() {
    try {
        const response = await fetch(`${API_BASE}/device-group`);
        const data = await response.json();
        renderDeviceGroups(data);
    } catch (error) {
        showError('Failed to load device groups: ' + error.message);
        document.getElementById('device-groups-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load device groups</div>';
    }
}

function renderDeviceGroups(groups) {
    const container = document.getElementById('device-groups-list');
    
    if (!groups || groups.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No device groups found</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Name</th><th>Description</th><th>Devices</th><th>Actions</th></tr></thead><tbody>';
    
    groups.forEach(group => {
        html += `
            <tr>
                <td><strong>${group.name || 'N/A'}</strong></td>
                <td>${group.description || 'N/A'}</td>
                <td><span class="badge bg-secondary">${group.devices ? group.devices.length : 0} devices</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem('device-group', '${group.name}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('device-group', '${group.name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Network Slices functions
async function loadNetworkSlices() {
    try {
        const response = await fetch(`${API_BASE}/network-slice`);
        const data = await response.json();
        renderNetworkSlices(data);
    } catch (error) {
        showError('Failed to load network slices: ' + error.message);
        document.getElementById('network-slices-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load network slices</div>';
    }
}

function renderNetworkSlices(slices) {
    const container = document.getElementById('network-slices-list');
    
    if (!slices || slices.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No network slices found</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Name</th><th>S-NSSAI</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    slices.forEach(slice => {
        html += `
            <tr>
                <td><strong>${slice.name || 'N/A'}</strong></td>
                <td><code>${slice.snssai || 'N/A'}</code></td>
                <td>${slice.description || 'N/A'}</td>
                <td><span class="badge bg-success">Active</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem('network-slice', '${slice.name}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('network-slice', '${slice.name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// gNB functions
async function loadGnbs() {
    try {
        const response = await fetch(`${API_BASE}/inventory/gnb`);
        const data = await response.json();
        renderGnbs(data);
    } catch (error) {
        showError('Failed to load gNBs: ' + error.message);
        document.getElementById('gnb-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load gNBs</div>';
    }
}

function renderGnbs(gnbs) {
    const container = document.getElementById('gnb-list');
    
    if (!gnbs || gnbs.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No gNBs found</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Name</th><th>IP Address</th><th>Port</th><th>TAC</th><th>Actions</th></tr></thead><tbody>';
    
    gnbs.forEach(gnb => {
        html += `
            <tr>
                <td><strong>${gnb.name || 'N/A'}</strong></td>
                <td>${gnb.ip || 'N/A'}</td>
                <td>${gnb.port || 'N/A'}</td>
                <td>${gnb.tac || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem('gnb', '${gnb.name}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('gnb', '${gnb.name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// UPF functions
async function loadUpfs() {
    try {
        const response = await fetch(`${API_BASE}/inventory/upf`);
        const data = await response.json();
        renderUpfs(data);
    } catch (error) {
        showError('Failed to load UPFs: ' + error.message);
        document.getElementById('upf-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load UPFs</div>';
    }
}

function renderUpfs(upfs) {
    const container = document.getElementById('upf-list');
    
    if (!upfs || upfs.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No UPFs found</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Hostname</th><th>IP Address</th><th>Port</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    upfs.forEach(upf => {
        html += `
            <tr>
                <td><strong>${upf.hostname || 'N/A'}</strong></td>
                <td>${upf.ip || 'N/A'}</td>
                <td>${upf.port || 'N/A'}</td>
                <td><span class="badge bg-success">Online</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem('upf', '${upf.hostname}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('upf', '${upf.hostname}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Create/Edit form functions
function showCreateForm(type) {
    currentEditType = type;
    currentEditName = '';
    
    const modal = new bootstrap.Modal(document.getElementById('createEditModal'));
    document.getElementById('modalTitle').textContent = `Create ${getTypeLabel(type)}`;
    
    generateForm(type);
    modal.show();
}

function editItem(type, name) {
    currentEditType = type;
    currentEditName = name;
    
    const modal = new bootstrap.Modal(document.getElementById('createEditModal'));
    document.getElementById('modalTitle').textContent = `Edit ${getTypeLabel(type)}: ${name}`;
    
    generateForm(type, true);
    loadItemData(type, name);
    modal.show();
}

function generateForm(type, isEdit = false) {
    const container = document.getElementById('formFields');
    let html = '';
    
    switch(type) {
        case 'device-group':
            html = `
                <div class="mb-3">
                    <label class="form-label">Group Name</label>
                    <input type="text" class="form-control" id="name" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="description" rows="3"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">IMSI Range</label>
                    <input type="text" class="form-control" id="imsi_range" placeholder="e.g., 001010000000000-001010000000999">
                </div>
            `;
            break;
            
        case 'network-slice':
            html = `
                <div class="mb-3">
                    <label class="form-label">Slice Name</label>
                    <input type="text" class="form-control" id="name" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="mb-3">
                    <label class="form-label">S-NSSAI</label>
                    <input type="text" class="form-control" id="snssai" placeholder="e.g., 01010203" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="description" rows="3"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">UE DNN QoS</label>
                    <input type="number" class="form-control" id="dnn_uplink" placeholder="Uplink (Mbps)">
                </div>
                <div class="mb-3">
                    <input type="number" class="form-control" id="dnn_downlink" placeholder="Downlink (Mbps)">
                </div>
            `;
            break;
            
        case 'gnb':
            html = `
                <div class="mb-3">
                    <label class="form-label">gNB Name</label>
                    <input type="text" class="form-control" id="name" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="mb-3">
                    <label class="form-label">IP Address</label>
                    <input type="text" class="form-control" id="ip" placeholder="e.g., 192.168.1.100" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Port</label>
                    <input type="number" class="form-control" id="port" placeholder="e.g., 38412" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">TAC (Tracking Area Code)</label>
                    <input type="text" class="form-control" id="tac" placeholder="e.g., 1" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">MCC</label>
                    <input type="text" class="form-control" id="mcc" placeholder="e.g., 001" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">MNC</label>
                    <input type="text" class="form-control" id="mnc" placeholder="e.g., 01" required>
                </div>
            `;
            break;
            
        case 'upf':
            html = `
                <div class="mb-3">
                    <label class="form-label">UPF Hostname</label>
                    <input type="text" class="form-control" id="hostname" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="mb-3">
                    <label class="form-label">IP Address</label>
                    <input type="text" class="form-control" id="ip" placeholder="e.g., 192.168.1.200" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Port</label>
                    <input type="number" class="form-control" id="port" placeholder="e.g., 8805" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">DNN</label>
                    <input type="text" class="form-control" id="dnn" placeholder="e.g., internet" required>
                </div>
            `;
            break;
    }
    
    container.innerHTML = html;
}

async function loadItemData(type, name) {
    try {
        let url = '';
        switch(type) {
            case 'device-group':
                url = `${API_BASE}/device-group/${name}`;
                break;
            case 'network-slice':
                url = `${API_BASE}/network-slice/${name}`;
                break;
            case 'gnb':
                url = `${API_BASE}/inventory/gnb/${name}`;
                break;
            case 'upf':
                url = `${API_BASE}/inventory/upf/${name}`;
                break;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Populate form fields
        Object.keys(data).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = data[key];
            }
        });
    } catch (error) {
        showError('Failed to load item data: ' + error.message);
    }
}

async function saveItem() {
    const formData = new FormData(document.getElementById('createEditForm'));
    const data = {};
    
    // Get all form inputs
    document.querySelectorAll('#formFields input, #formFields textarea').forEach(input => {
        data[input.id] = input.value;
    });
    
    try {
        let url = '';
        let method = currentEditName ? 'PUT' : 'POST';
        
        switch(currentEditType) {
            case 'device-group':
                url = `${API_BASE}/device-group/${data.name}`;
                break;
            case 'network-slice':
                url = `${API_BASE}/network-slice/${data.name}`;
                break;
            case 'gnb':
                url = `${API_BASE}/inventory/gnb${currentEditName ? '/' + currentEditName : ''}`;
                break;
            case 'upf':
                url = `${API_BASE}/inventory/upf${currentEditName ? '/' + data.hostname : ''}`;
                break;
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showSuccess(`${getTypeLabel(currentEditType)} ${currentEditName ? 'updated' : 'created'} successfully`);
            bootstrap.Modal.getInstance(document.getElementById('createEditModal')).hide();
            loadData(currentSection);
        } else {
            const error = await response.text();
            showError(`Failed to save: ${error}`);
        }
    } catch (error) {
        showError('Failed to save: ' + error.message);
    }
}

async function deleteItem(type, name) {
    if (!confirm(`Are you sure you want to delete ${getTypeLabel(type)}: ${name}?`)) {
        return;
    }
    
    try {
        let url = '';
        switch(type) {
            case 'device-group':
                url = `${API_BASE}/device-group/${name}`;
                break;
            case 'network-slice':
                url = `${API_BASE}/network-slice/${name}`;
                break;
            case 'gnb':
                url = `${API_BASE}/inventory/gnb/${name}`;
                break;
            case 'upf':
                url = `${API_BASE}/inventory/upf/${name}`;
                break;
        }
        
        const response = await fetch(url, { method: 'DELETE' });
        
        if (response.ok) {
            showSuccess(`${getTypeLabel(type)} deleted successfully`);
            loadData(currentSection);
        } else {
            const error = await response.text();
            showError(`Failed to delete: ${error}`);
        }
    } catch (error) {
        showError('Failed to delete: ' + error.message);
    }
}

// Utility functions
function getTypeLabel(type) {
    const labels = {
        'device-group': 'Device Group',
        'network-slice': 'Network Slice',
        'gnb': 'gNB',
        'upf': 'UPF'
    };
    return labels[type] || type;
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'danger');
}

function showNotification(message, type) {
    const toast = document.getElementById('notificationToast');
    const toastBody = document.getElementById('toastBody');
    
    toast.className = `toast bg-${type} text-white`;
    toastBody.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}
