// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';

export class UpfManager extends BaseManager {
    constructor() {
        super('/inventory/upf', 'upf-list');
        this.type = 'upf';
        this.displayName = 'UPF';
    }

    render(upfs) {
        const container = document.getElementById(this.containerId);
        
        if (!upfs || upfs.length === 0) {
            this.showEmpty('No UPFs found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Hostname</th><th>Port</th><th>Actions</th></tr></thead><tbody>';
        
        upfs.forEach(upf => {
            html += `
                <tr>
                    <td><strong>${upf.hostname || 'N/A'}</strong></td>
                    <td>${upf.port || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${upf.hostname}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${upf.hostname}')">
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
                <label class="form-label">UPF Hostname</label>
                <input type="text" class="form-control" id="hostname" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            <div class="mb-3">
                <label class="form-label">Port</label>
                <input type="text" class="form-control" id="port" 
                       placeholder="e.g., 8805" required>
                <div class="form-text">Port number as string</div>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.hostname || data.hostname.trim() === '') {
            errors.push('UPF hostname is required');
        }
        
        if (!data.port || data.port.trim() === '') {
            errors.push('Port is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        return {
            "hostname": formData.hostname,
            "port": formData.port
        };
    }
}

export class UpfManager extends BaseManager {
    constructor() {
        super('/inventory/upf', 'upf-list');
        this.type = 'upf';
        this.displayName = 'UPF';
    }

    render(upfs) {
        const container = document.getElementById(this.containerId);
        
        if (!upfs || upfs.length === 0) {
            this.showEmpty('No UPFs found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Hostname</th><th>IP Address</th><th>Port</th><th>DNN</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        
        upfs.forEach(upf => {
            html += `
                <tr>
                    <td><strong>${upf.hostname || 'N/A'}</strong></td>
                    <td>${upf.ip || 'N/A'}</td>
                    <td>${upf.port || 'N/A'}</td>
                    <td><code>${upf.dnn || 'N/A'}</code></td>
                    <td><span class="badge bg-success">Online</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${upf.hostname}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${upf.hostname}')">
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
                <label class="form-label">UPF Hostname</label>
                <input type="text" class="form-control" id="hostname" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <div class="mb-3">
                        <label class="form-label">IP Address</label>
                        <input type="text" class="form-control" id="ip" 
                               placeholder="e.g., 192.168.1.200" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Port</label>
                        <input type="number" class="form-control" id="port" 
                               placeholder="e.g., 8805" required>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">DNN (Data Network Name)</label>
                <input type="text" class="form-control" id="dnn" 
                       placeholder="e.g., internet" required>
                <div class="form-text">Common values: internet, ims, enterprise</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="description" rows="2" 
                          placeholder="Optional description"></textarea>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.hostname || data.hostname.trim() === '') {
            errors.push('UPF hostname is required');
        }
        
        if (!data.ip || data.ip.trim() === '') {
            errors.push('IP address is required');
        } else {
            // Basic IP validation
            const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipPattern.test(data.ip)) {
                errors.push('Invalid IP address format');
            }
        }
        
        if (!data.port) {
            errors.push('Port is required');
        } else if (data.port < 1 || data.port > 65535) {
            errors.push('Port must be between 1 and 65535');
        }
        
        if (!data.dnn || data.dnn.trim() === '') {
            errors.push('DNN is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        return {
            "upf-hostname": formData.hostname,
            "ip": formData.ip,
            "port": parseInt(formData.port),
            "dnn": formData.dnn,
            "description": formData.description || ""
        };
    }
}
