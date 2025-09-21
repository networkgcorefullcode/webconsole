// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';
import { API_BASE } from '../app.js';

export class NetworkSliceManager extends BaseManager {
    constructor() {
        super('/network-slice', 'network-slices-list');
        this.type = 'network-slice';
        this.displayName = 'Network Slice';
    }

    // Override loadData to fetch complete network slice details
    async loadData() {
        try {
            this.showLoading();
            
            // First, get the list of network slice names
            const response = await fetch(`${API_BASE}${this.apiEndpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const sliceNames = await response.json();
            console.log('Network slice names:', sliceNames);
            
            // Check if we got valid data
            if (!Array.isArray(sliceNames)) {
                console.error('Expected array of slice names, got:', sliceNames);
                this.showError('Invalid response format from server');
                return;
            }
            
            // If no slices, show empty state
            if (sliceNames.length === 0) {
                this.data = [];
                this.render([]);
                return;
            }
            
            // Then, fetch complete details for each slice
            const sliceDetails = [];
            for (const sliceName of sliceNames) {
                try {
                    if (typeof sliceName !== 'string') {
                        console.warn('Invalid slice name:', sliceName);
                        continue;
                    }
                    
                    const detailResponse = await fetch(`${API_BASE}${this.apiEndpoint}/${encodeURIComponent(sliceName)}`);
                    if (detailResponse.ok) {
                        const sliceDetail = await detailResponse.json();
                        sliceDetails.push(sliceDetail);
                    } else {
                        console.warn(`Failed to load details for slice ${sliceName}: ${detailResponse.status}`);
                    }
                } catch (error) {
                    console.error(`Failed to load details for slice ${sliceName}:`, error);
                }
            }
            
            console.log('Complete network slice details:', sliceDetails);
            
            this.data = sliceDetails;
            this.render(sliceDetails);
            
        } catch (error) {
            this.showError(`Failed to load network slices: ${error.message}`);
            console.error('Load network slices error:', error);
        }
    }

    render(slices) {
        const container = document.getElementById(this.containerId);
        
        if (!slices || slices.length === 0) {
            this.showEmpty('No network slices found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Slice Name</th><th>SST</th><th>SD</th><th>Site</th><th>Device Groups</th><th>Actions</th></tr></thead><tbody>';
        
        slices.forEach(slice => {
            const sliceName = slice['slice-name'] || 'N/A';
            const sst = slice['slice-id']?.sst || 'N/A';
            const sd = slice['slice-id']?.sd || 'N/A';
            const siteName = slice['site-info']?.['site-name'] || 'N/A';
            const deviceGroups = slice['site-device-group'] || [];
            
            html += `
                <tr class="network-slice-row" onclick="showNetworkSliceDetails('${sliceName}')" style="cursor: pointer;">
                    <td><strong>${sliceName}</strong></td>
                    <td><span class="badge bg-primary">${sst}</span></td>
                    <td><code>${sd}</code></td>
                    <td>${siteName}</td>
                    <td>
                        <span class="badge bg-secondary">${deviceGroups.length} groups</span>
                        ${deviceGroups.length > 0 ? `<br><small class="text-muted">${deviceGroups.join(', ')}</small>` : ''}
                    </td>
                    <td onclick="event.stopPropagation();">
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${sliceName}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${sliceName}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    getFormFields(isEdit = false) {
        return `
            <div class="mb-3">
                <label class="form-label">Slice Name</label>
                <input type="text" class="form-control" id="slice_name" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            
            <h6 class="mt-4 mb-3">Slice ID Configuration</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">SST (Slice Service Type)</label>
                        <input type="text" class="form-control" id="sst" 
                               placeholder="e.g., 1" required>
                        <div class="form-text">Values: 1=eMBB, 2=URLLC, 3=mMTC, 4=Custom</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">SD (Slice Differentiator)</label>
                        <input type="text" class="form-control" id="sd" 
                               placeholder="e.g., 000001 (6 hex digits)" 
                               pattern="[0-9A-Fa-f]{6}" maxlength="6">
                        <div class="form-text">Optional: 6 hexadecimal digits</div>
                    </div>
                </div>
            </div>

            <h6 class="mt-4 mb-3">Site Information</h6>
            <div class="mb-3">
                <label class="form-label">Site Name</label>
                <input type="text" class="form-control" id="site_name" 
                       placeholder="e.g., site-1" required>
            </div>

            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">MCC (Mobile Country Code)</label>
                        <input type="text" class="form-control" id="mcc" 
                               placeholder="e.g., 001" pattern="[0-9]{3}" maxlength="3" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">MNC (Mobile Network Code)</label>
                        <input type="text" class="form-control" id="mnc" 
                               placeholder="e.g., 01" pattern="[0-9]{2,3}" maxlength="3" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">TAC (Tracking Area Code)</label>
                        <input type="number" class="form-control" id="tac" 
                               placeholder="e.g., 1" min="1" max="16777215" required>
                    </div>
                </div>
            </div>

            <h6 class="mt-4 mb-3">Device Groups</h6>
            <div class="mb-3">
                <label class="form-label">Site Device Groups</label>
                <select class="form-select" id="site_device_group" multiple>
                    <option value="">Select device groups...</option>
                </select>
                <div class="form-text">Hold Ctrl/Cmd to select multiple groups</div>
            </div>

            <h6 class="mt-4 mb-3">gNodeB Configuration</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">gNodeB Name</label>
                        <input type="text" class="form-control" id="gnb_name" 
                               placeholder="e.g., gnb-1">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">gNodeB TAC</label>
                        <input type="number" class="form-control" id="gnb_tac" 
                               placeholder="e.g., 1" min="1" max="16777215">
                    </div>
                </div>
            </div>

            <h6 class="mt-4 mb-3">UPF Configuration</h6>
            <div class="mb-3">
                <label class="form-label">UPF Name</label>
                <input type="text" class="form-control" id="upf_name" 
                       placeholder="e.g., upf-1">
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.slice_name || String(data.slice_name).trim() === '') {
            errors.push('Slice name is required');
        }
        
        if (!data.sst || String(data.sst).trim() === '') {
            errors.push('SST (Slice Service Type) is required');
        }
        
        if (data.sd && !/^[0-9A-Fa-f]{6}$/.test(String(data.sd))) {
            errors.push('SD must be exactly 6 hexadecimal digits (e.g., 000001)');
        }
        
        if (!data.site_name || String(data.site_name).trim() === '') {
            errors.push('Site name is required');
        }
        
        if (!data.mcc || !/^[0-9]{3}$/.test(String(data.mcc))) {
            errors.push('MCC must be exactly 3 digits');
        }
        
        if (!data.mnc || !/^[0-9]{2,3}$/.test(String(data.mnc))) {
            errors.push('MNC must be 2 or 3 digits');
        }
        
        if (!data.tac || String(data.tac).trim() === '') {
            errors.push('TAC (Tracking Area Code) is required');
        } else {
            const tacNum = parseInt(data.tac);
            if (isNaN(tacNum) || tacNum < 1 || tacNum > 16777215) {
                errors.push('TAC must be a number between 1 and 16777215');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        // Prepare site device groups array
        const siteDeviceGroups = [];
        if (formData.site_device_group) {
            // If multiple values selected
            if (Array.isArray(formData.site_device_group)) {
                siteDeviceGroups.push(...formData.site_device_group.filter(g => g));
            } else if (formData.site_device_group.trim() !== '') {
                siteDeviceGroups.push(formData.site_device_group);
            }
        }

        // Prepare gNodeBs array
        const gNodeBs = [];
        if (formData.gnb_name && formData.gnb_name.trim() !== '') {
            gNodeBs.push({
                "name": formData.gnb_name,
                "tac": formData.gnb_tac ? parseInt(formData.gnb_tac) : 1
            });
        }

        // Prepare UPF object
        const upf = {};
        if (formData.upf_name && formData.upf_name.trim() !== '') {
            upf[formData.upf_name] = {};
        }

        return {
            "slice-name": formData.slice_name,
            "slice-id": {
                "sst": formData.sst,
                "sd": formData.sd || ""
            },
            "site-device-group": siteDeviceGroups,
            "site-info": {
                "site-name": formData.site_name,
                "plmn": {
                    "mcc": formData.mcc,
                    "mnc": formData.mnc
                },
                "gNodeBs": gNodeBs,
                "upf": upf
            },
            "application-filtering-rules": []
        };
    }

    // Override createItem to include slice name in URL for network slices
    async createItem(itemData) {
        try {
            const sliceName = itemData['slice-name'];
            const response = await fetch(`${API_BASE}${this.apiEndpoint}/${sliceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async loadDeviceGroups() {
        try {
            const response = await fetch(`${API_BASE}/device-group`);
            if (response.ok) {
                const deviceGroupNames = await response.json();
                const select = document.getElementById('site_device_group');
                if (select && Array.isArray(deviceGroupNames)) {
                    select.innerHTML = '<option value="">Select device groups...</option>';
                    deviceGroupNames.forEach(groupName => {
                        if (typeof groupName === 'string') {
                            const option = document.createElement('option');
                            option.value = groupName;
                            option.textContent = groupName;
                            select.appendChild(option);
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to load device groups:', error.message);
        }
    }

    async loadItemData(name) {
        try {
            const response = await fetch(`${API_BASE}${this.apiEndpoint}/${encodeURIComponent(name)}`);
            if (response.ok) {
                const data = await response.json();
                
                // Populate basic fields
                this.setFieldValue('slice_name', data['slice-name']);
                this.setFieldValue('sst', data['slice-id']?.sst);
                this.setFieldValue('sd', data['slice-id']?.sd);
                
                // Populate site info
                const siteInfo = data['site-info'] || {};
                this.setFieldValue('site_name', siteInfo['site-name']);
                this.setFieldValue('mcc', siteInfo.plmn?.mcc);
                this.setFieldValue('mnc', siteInfo.plmn?.mnc);
                this.setFieldValue('tac', siteInfo.plmn?.tac);
                
                // Populate device groups
                const deviceGroups = data['site-device-group'] || [];
                const select = document.getElementById('site_device_group');
                if (select && deviceGroups.length > 0) {
                    Array.from(select.options).forEach(option => {
                        option.selected = deviceGroups.includes(option.value);
                    });
                }
                
                // Populate gNodeB info
                const gNodeBs = siteInfo.gNodeBs || [];
                if (gNodeBs.length > 0) {
                    this.setFieldValue('gnb_name', gNodeBs[0].name);
                    this.setFieldValue('gnb_tac', gNodeBs[0].tac);
                }
                
                // Populate UPF info
                const upf = siteInfo.upf || {};
                const upfNames = Object.keys(upf);
                if (upfNames.length > 0) {
                    this.setFieldValue('upf_name', upfNames[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load item data:', error);
        }
    }

    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }

    // Override the base method to load device groups when form is shown
    async showCreateForm() {
        await super.showCreateForm();
        await this.loadDeviceGroups();
    }

    async showEditForm(name) {
        await super.showEditForm(name);
        await this.loadDeviceGroups();
    }

    // New methods for details view
    async showDetails(sliceName) {
        try {
            const response = await fetch(`${API_BASE}${this.apiEndpoint}/${encodeURIComponent(sliceName)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const sliceData = await response.json();
            this.currentSliceData = sliceData;
            this.currentSliceName = sliceName;
            this.renderDetailsView(sliceData);
            
        } catch (error) {
            console.error('Failed to load network slice details:', error);
            // Show error notification
            window.app?.notificationManager?.showNotification('Error loading network slice details', 'error');
        }
    }

    renderDetailsView(sliceData) {
        const container = document.getElementById('network-slice-details-content');
        const title = document.getElementById('network-slice-detail-title');
        
        if (!container || !title) {
            console.error('Details container not found');
            return;
        }

        const sliceName = sliceData['slice-name'] || 'Unknown';
        title.textContent = `Network Slice: ${sliceName}`;

        const html = `
            <div id="network-slice-details-view-mode">
                ${this.renderReadOnlyDetails(sliceData)}
            </div>
            <div id="network-slice-details-edit-mode" style="display: none;">
                ${this.renderEditableDetails(sliceData)}
            </div>
        `;

        container.innerHTML = html;
    }

    renderReadOnlyDetails(sliceData) {
        const siteInfo = sliceData['site-info'] || {};
        const plmn = siteInfo.plmn || {};
        const gNodeBs = siteInfo.gNodeBs || [];
        const upf = siteInfo.upf || {};
        const deviceGroups = sliceData['site-device-group'] || [];

        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-layer-group me-2"></i>Slice Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>Slice Name:</strong> ${sliceData['slice-name'] || 'N/A'}
                            </div>
                            <div class="mb-2">
                                <strong>SST (Slice Service Type):</strong> 
                                <span class="badge bg-primary ms-1">${sliceData['slice-id']?.sst || 'N/A'}</span>
                            </div>
                            <div class="mb-2">
                                <strong>SD (Slice Differentiator):</strong> 
                                <code class="ms-1">${sliceData['slice-id']?.sd || 'Not specified'}</code>
                            </div>
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-map-marker-alt me-2"></i>Site Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>Site Name:</strong> ${siteInfo['site-name'] || 'N/A'}
                            </div>
                            <div class="mb-2">
                                <strong>MCC:</strong> <code>${plmn.mcc || 'N/A'}</code>
                            </div>
                            <div class="mb-2">
                                <strong>MNC:</strong> <code>${plmn.mnc || 'N/A'}</code>
                            </div>
                            <div class="mb-2">
                                <strong>TAC:</strong> <code>${plmn.tac || 'N/A'}</code>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-mobile-alt me-2"></i>Device Groups</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>Total Groups:</strong> <span class="badge bg-secondary">${deviceGroups.length}</span>
                            </div>
                            ${deviceGroups.length > 0 ? `
                                <div class="mb-2">
                                    <strong>Groups:</strong>
                                    <div class="mt-2">
                                        ${deviceGroups.map(group => `<span class="badge bg-light text-dark me-1 mb-1">${group}</span>`).join('')}
                                    </div>
                                </div>
                            ` : '<p class="text-muted">No device groups assigned</p>'}
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-tower-broadcast me-2"></i>gNodeBs</h6>
                        </div>
                        <div class="card-body">
                            ${gNodeBs.length > 0 ? `
                                ${gNodeBs.map(gnb => `
                                    <div class="mb-2">
                                        <strong>Name:</strong> ${gnb.name || 'N/A'}<br>
                                        <strong>TAC:</strong> <code>${gnb.tac || 'N/A'}</code>
                                    </div>
                                `).join('')}
                            ` : '<p class="text-muted">No gNodeBs configured</p>'}
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-server me-2"></i>UPF Configuration</h6>
                        </div>
                        <div class="card-body">
                            ${Object.keys(upf).length > 0 ? `
                                <div class="mb-2">
                                    <strong>UPF Names:</strong>
                                    <div class="mt-2">
                                        ${Object.keys(upf).map(upfName => `<span class="badge bg-info text-dark me-1">${upfName}</span>`).join('')}
                                    </div>
                                </div>
                            ` : '<p class="text-muted">No UPF configured</p>'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Technical Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="bg-light p-3 rounded">
                                <div class="row">
                                    <div class="col-md-3">
                                        <small class="text-muted">SST Values:</small>
                                        <div><strong>1=eMBB, 2=URLLC, 3=mMTC, 4=Custom</strong></div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted">SD Format:</small>
                                        <div><strong>6 hexadecimal digits</strong></div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted">MCC/MNC:</small>
                                        <div><strong>Country/Network Codes</strong></div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted">Status:</small>
                                        <div>
                                            <span class="badge bg-success">
                                                <i class="fas fa-check-circle me-1"></i>Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditableDetails(sliceData) {
        const siteInfo = sliceData['site-info'] || {};
        const plmn = siteInfo.plmn || {};
        const gNodeBs = siteInfo.gNodeBs || [];
        const upf = siteInfo.upf || {};
        const deviceGroups = sliceData['site-device-group'] || [];

        return `
            <form id="networkSliceDetailsEditForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-edit me-2"></i>Edit Slice Information</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Slice Name</label>
                                    <input type="text" class="form-control" id="edit_slice_name" 
                                           value="${sliceData['slice-name'] || ''}" readonly>
                                    <div class="form-text">Slice name cannot be changed</div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">SST (Slice Service Type)</label>
                                            <input type="text" class="form-control" id="edit_sst" 
                                                   value="${sliceData['slice-id']?.sst || ''}" placeholder="e.g., 1" required>
                                            <div class="form-text">1=eMBB, 2=URLLC, 3=mMTC, 4=Custom</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">SD (Slice Differentiator)</label>
                                            <input type="text" class="form-control" id="edit_sd" 
                                                   value="${sliceData['slice-id']?.sd || ''}" placeholder="e.g., 000001" 
                                                   pattern="[0-9A-Fa-f]{6}" maxlength="6">
                                            <div class="form-text">6 hexadecimal digits</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-map-marker-alt me-2"></i>Site Information</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Site Name</label>
                                    <input type="text" class="form-control" id="edit_site_name" 
                                           value="${siteInfo['site-name'] || ''}" placeholder="e.g., site-1" required>
                                </div>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">MCC</label>
                                            <input type="text" class="form-control" id="edit_mcc" 
                                                   value="${plmn.mcc || ''}" placeholder="e.g., 001" 
                                                   pattern="[0-9]{3}" maxlength="3" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">MNC</label>
                                            <input type="text" class="form-control" id="edit_mnc" 
                                                   value="${plmn.mnc || ''}" placeholder="e.g., 01" 
                                                   pattern="[0-9]{2,3}" maxlength="3" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">TAC</label>
                                            <input type="number" class="form-control" id="edit_tac" 
                                                   value="${plmn.tac || ''}" placeholder="e.g., 1" 
                                                   min="1" max="16777215" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-mobile-alt me-2"></i>Device Groups</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Site Device Groups</label>
                                    <select class="form-select" id="edit_site_device_group" multiple>
                                        <option value="">Select device groups...</option>
                                    </select>
                                    <div class="form-text">Hold Ctrl/Cmd to select multiple groups</div>
                                </div>
                            </div>
                        </div>

                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-tower-broadcast me-2"></i>gNodeB Configuration</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">gNodeB Name</label>
                                            <input type="text" class="form-control" id="edit_gnb_name" 
                                                   value="${gNodeBs.length > 0 ? gNodeBs[0].name || '' : ''}" 
                                                   placeholder="e.g., gnb-1">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">gNodeB TAC</label>
                                            <input type="number" class="form-control" id="edit_gnb_tac" 
                                                   value="${gNodeBs.length > 0 ? gNodeBs[0].tac || '' : ''}" 
                                                   placeholder="e.g., 1" min="1" max="16777215">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-server me-2"></i>UPF Configuration</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">UPF Name</label>
                                    <input type="text" class="form-control" id="edit_upf_name" 
                                           value="${Object.keys(upf).length > 0 ? Object.keys(upf)[0] : ''}" 
                                           placeholder="e.g., upf-1">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" onclick="cancelNetworkSliceEdit()">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveNetworkSliceDetailsEdit()">Save Changes</button>
                        </div>
                    </div>
                </div>
            </form>
        `;
    }

    async saveEdit() {
        try {
            const formData = this.getEditFormData();
            const validation = this.validateFormData(formData);
            
            if (!validation.isValid) {
                window.app?.notificationManager?.showNotification(validation.errors.join('<br>'), 'error');
                return;
            }

            const payload = this.preparePayload(formData, true);
            await this.updateItem(this.currentSliceName, payload);
            
            // Refresh the details view
            await this.showDetails(this.currentSliceName);
            this.toggleEditMode(false);
            
            window.app?.notificationManager?.showNotification('Network slice updated successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save network slice:', error);
            window.app?.notificationManager?.showNotification(`Failed to save network slice: ${error.message}`, 'error');
        }
    }

    getEditFormData() {
        const deviceGroupSelect = document.getElementById('edit_site_device_group');
        const selectedGroups = Array.from(deviceGroupSelect.selectedOptions).map(option => option.value).filter(val => val);

        return {
            slice_name: document.getElementById('edit_slice_name')?.value || '',
            sst: document.getElementById('edit_sst')?.value || '',
            sd: document.getElementById('edit_sd')?.value || '',
            site_name: document.getElementById('edit_site_name')?.value || '',
            mcc: document.getElementById('edit_mcc')?.value || '',
            mnc: document.getElementById('edit_mnc')?.value || '',
            tac: document.getElementById('edit_tac')?.value || '',
            site_device_group: selectedGroups,
            gnb_name: document.getElementById('edit_gnb_name')?.value || '',
            gnb_tac: document.getElementById('edit_gnb_tac')?.value || '',
            upf_name: document.getElementById('edit_upf_name')?.value || ''
        };
    }

    async loadDeviceGroupsForEdit() {
        try {
            const response = await fetch(`${API_BASE}/device-group`);
            if (response.ok) {
                const deviceGroupNames = await response.json();
                const select = document.getElementById('edit_site_device_group');
                if (select && Array.isArray(deviceGroupNames)) {
                    select.innerHTML = '<option value="">Select device groups...</option>';
                    deviceGroupNames.forEach(groupName => {
                        if (typeof groupName === 'string') {
                            const option = document.createElement('option');
                            option.value = groupName;
                            option.textContent = groupName;
                            select.appendChild(option);
                        }
                    });

                    // Pre-select current device groups
                    const currentGroups = this.currentSliceData['site-device-group'] || [];
                    Array.from(select.options).forEach(option => {
                        option.selected = currentGroups.includes(option.value);
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to load device groups:', error.message);
        }
    }

    toggleEditMode(enable = null) {
        const detailsView = document.getElementById('network-slice-details-view-mode');
        const editView = document.getElementById('network-slice-details-edit-mode');
        const editBtn = document.getElementById('edit-network-slice-btn');
        
        if (!detailsView || !editView || !editBtn) return;
        
        const isEditing = enable !== null ? enable : editView.style.display !== 'none';
        
        if (isEditing) {
            detailsView.style.display = 'block';
            editView.style.display = 'none';
            editBtn.innerHTML = '<i class="fas fa-edit me-1"></i>Edit';
        } else {
            detailsView.style.display = 'none';
            editView.style.display = 'block';
            editBtn.innerHTML = '<i class="fas fa-times me-1"></i>Cancel';
            
            // Load device groups when entering edit mode
            this.loadDeviceGroupsForEdit();
        }
    }

    async deleteFromDetails() {
        try {
            await this.deleteItem(this.currentSliceName);
            window.app?.notificationManager?.showNotification('Network slice deleted successfully!', 'success');
            
            // Navigate back to the list
            window.showSection('network-slices');
            
        } catch (error) {
            console.error('Failed to delete network slice:', error);
            window.app?.notificationManager?.showNotification(`Failed to delete network slice: ${error.message}`, 'error');
        }
    }
}
