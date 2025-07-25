// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';

export class DeviceGroupManager extends BaseManager {
    constructor() {
        super('/device-group', 'device-groups-list');
        this.type = 'device-group';
        this.displayName = 'Device Group';
    }

    render(groups) {
        const container = document.getElementById(this.containerId);
        
        if (!groups || groups.length === 0) {
            this.showEmpty('No device groups found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Name</th><th>Description</th><th>Devices</th><th>Actions</th></tr></thead><tbody>';
        
        groups.forEach(group => {
            const deviceCount = group.devices ? group.devices.length : 0;
            html += `
                <tr>
                    <td><strong>${group.name || 'N/A'}</strong></td>
                    <td>${group.description || 'N/A'}</td>
                    <td><span class="badge bg-secondary">${deviceCount} devices</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${group.name}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${group.name}')">
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
                <label class="form-label">Group Name</label>
                <input type="text" class="form-control" id="name" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="description" rows="3"></textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">IMSI Range</label>
                <input type="text" class="form-control" id="imsi_range" 
                       placeholder="e.g., 001010000000000-001010000000999">
                <div class="form-text">Format: start-end (15 digits each)</div>
            </div>
            <div class="mb-3">
                <label class="form-label">DNN (Data Network Name)</label>
                <input type="text" class="form-control" id="dnn" 
                       placeholder="e.g., internet">
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim() === '') {
            errors.push('Group name is required');
        }
        
        if (data.imsi_range) {
            const imsiPattern = /^\d{15}-\d{15}$/;
            if (!imsiPattern.test(data.imsi_range)) {
                errors.push('IMSI Range must be in format: 123456789012345-123456789012999');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        return {
            "group-name": formData.name,
            "description": formData.description || "",
            "imsi-range": formData.imsi_range || "",
            "dnn": formData.dnn || "internet"
        };
    }
}
