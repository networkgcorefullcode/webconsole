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
