// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';

export class NetworkSliceManager extends BaseManager {
    constructor() {
        super('/network-slice', 'network-slices-list');
        this.type = 'network-slice';
        this.displayName = 'Network Slice';
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
                <tr>
                    <td><strong>${sliceName}</strong></td>
                    <td><span class="badge bg-primary">${sst}</span></td>
                    <td><code>${sd}</code></td>
                    <td>${siteName}</td>
                    <td>
                        <span class="badge bg-secondary">${deviceGroups.length} groups</span>
                        ${deviceGroups.length > 0 ? `<br><small class="text-muted">${deviceGroups.join(', ')}</small>` : ''}
                    </td>
                    <td>
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
                        <input type="text" class="form-control" id="tac" 
                               placeholder="e.g., 1" required>
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
                        <input type="text" class="form-control" id="gnb_tac" 
                               placeholder="e.g., 1">
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
        
        if (!data.slice_name || data.slice_name.trim() === '') {
            errors.push('Slice name is required');
        }
        
        if (!data.sst || data.sst.trim() === '') {
            errors.push('SST (Slice Service Type) is required');
        }
        
        if (data.sd && !/^[0-9A-Fa-f]{6}$/.test(data.sd)) {
            errors.push('SD must be exactly 6 hexadecimal digits (e.g., 000001)');
        }
        
        if (!data.site_name || data.site_name.trim() === '') {
            errors.push('Site name is required');
        }
        
        if (!data.mcc || !/^[0-9]{3}$/.test(data.mcc)) {
            errors.push('MCC must be exactly 3 digits');
        }
        
        if (!data.mnc || !/^[0-9]{2,3}$/.test(data.mnc)) {
            errors.push('MNC must be 2 or 3 digits');
        }
        
        if (!data.tac || data.tac.trim() === '') {
            errors.push('TAC (Tracking Area Code) is required');
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
                "tac": formData.gnb_tac || "1"
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

    async loadDeviceGroups() {
        try {
            const response = await fetch(`${this.apiBase.replace('/network-slice', '/device-group')}`);
            if (response.ok) {
                const deviceGroups = await response.json();
                const select = document.getElementById('site_device_group');
                if (select) {
                    select.innerHTML = '<option value="">Select device groups...</option>';
                    deviceGroups.forEach(group => {
                        const option = document.createElement('option');
                        option.value = group.name || group['group-name'] || '';
                        option.textContent = group.name || group['group-name'] || 'Unknown Group';
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to load device groups:', error.message);
        }
    }

    async loadItemData(name) {
        try {
            const response = await fetch(`${this.apiBase}/${name}`);
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
}
