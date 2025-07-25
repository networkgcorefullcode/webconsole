// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';

export class GnbManager extends BaseManager {
    constructor() {
        super('/inventory/gnb', 'gnb-list');
        this.type = 'gnb';
        this.displayName = 'gNB';
    }

    render(gnbs) {
        const container = document.getElementById(this.containerId);
        
        if (!gnbs || gnbs.length === 0) {
            this.showEmpty('No gNBs found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Name</th><th>TAC</th><th>Actions</th></tr></thead><tbody>';
        
        gnbs.forEach(gnb => {
            html += `
                <tr>
                    <td><strong>${gnb.name || 'N/A'}</strong></td>
                    <td>${gnb.tac || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${gnb.name}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${gnb.name}')">
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
                <label class="form-label">gNB Name</label>
                <input type="text" class="form-control" id="name" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            <div class="mb-3">
                <label class="form-label">TAC (Tracking Area Code)</label>
                <input type="number" class="form-control" id="tac" 
                       placeholder="e.g., 1" min="1" max="16777215">
                <div class="form-text">Optional: Integer value between 1 and 16777215</div>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim() === '') {
            errors.push('gNB name is required');
        }
        
        if (data.tac && (data.tac < 1 || data.tac > 16777215)) {
            errors.push('TAC must be between 1 and 16777215');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        const payload = {
            "name": formData.name
        };

        // Only include tac if it's provided
        if (formData.tac && formData.tac.toString().trim() !== '') {
            payload.tac = parseInt(formData.tac);
        }

        return payload;
    }
}

export class GnbManager extends BaseManager {
    constructor() {
        super('/inventory/gnb', 'gnb-list');
        this.type = 'gnb';
        this.displayName = 'gNB';
    }

    render(gnbs) {
        const container = document.getElementById(this.containerId);
        
        if (!gnbs || gnbs.length === 0) {
            this.showEmpty('No gNBs found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Name</th><th>IP Address</th><th>Port</th><th>TAC</th><th>PLMN</th><th>Actions</th></tr></thead><tbody>';
        
        gnbs.forEach(gnb => {
            const plmn = gnb.mcc && gnb.mnc ? `${gnb.mcc}-${gnb.mnc}` : 'N/A';
            
            html += `
                <tr>
                    <td><strong>${gnb.name || 'N/A'}</strong></td>
                    <td>${gnb.ip || 'N/A'}</td>
                    <td>${gnb.port || 'N/A'}</td>
                    <td>${gnb.tac || 'N/A'}</td>
                    <td><code>${plmn}</code></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${gnb.name}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${gnb.name}')">
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
                <label class="form-label">gNB Name</label>
                <input type="text" class="form-control" id="name" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <div class="mb-3">
                        <label class="form-label">IP Address</label>
                        <input type="text" class="form-control" id="ip" 
                               placeholder="e.g., 192.168.1.100" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Port</label>
                        <input type="number" class="form-control" id="port" 
                               placeholder="e.g., 38412" required>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">TAC (Tracking Area Code)</label>
                <input type="text" class="form-control" id="tac" 
                       placeholder="e.g., 1" required>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">MCC (Mobile Country Code)</label>
                        <input type="text" class="form-control" id="mcc" 
                               placeholder="e.g., 001" pattern="[0-9]{3}" maxlength="3" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">MNC (Mobile Network Code)</label>
                        <input type="text" class="form-control" id="mnc" 
                               placeholder="e.g., 01" pattern="[0-9]{2,3}" maxlength="3" required>
                    </div>
                </div>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim() === '') {
            errors.push('gNB name is required');
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
        
        if (!data.tac || data.tac.trim() === '') {
            errors.push('TAC is required');
        }
        
        if (!data.mcc || !/^[0-9]{3}$/.test(data.mcc)) {
            errors.push('MCC must be exactly 3 digits');
        }
        
        if (!data.mnc || !/^[0-9]{2,3}$/.test(data.mnc)) {
            errors.push('MNC must be 2 or 3 digits');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        return {
            "gnb-name": formData.name,
            "ip": formData.ip,
            "port": parseInt(formData.port),
            "tac": formData.tac,
            "mcc": formData.mcc,
            "mnc": formData.mnc
        };
    }
}
