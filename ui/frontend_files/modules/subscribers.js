// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';
import { SUBSCRIBER_API_BASE } from '../app.js';
import app from '../app.js';

// --- GESTOR PARA LAS CLAVES K4 ---
export class K4Manager extends BaseManager {
    constructor() {
        // se usa el BaseManager modificado pasándole el endpoint y la URL base.
        super('/k4opt', 'k4-keys-list', SUBSCRIBER_API_BASE);
        this.type = 'k4-key';
        this.displayName = 'K4 Key';
    }

    render(keys) {
        const container = document.getElementById(this.containerId);
        if (!keys || keys.length === 0) {
            this.showEmpty('No K4 keys found. Add one to provision a subscriber.');
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover">';
        html += '<thead><tr><th>Serial Number (SNO)</th><th>K4 Key</th><th>Actions</th></tr></thead><tbody>';

        keys.forEach(key => {
            html += `
                <tr class="k4-key-row" onclick="showK4KeyDetails('${key.k4_sno}')" style="cursor: pointer;">
                    <td><span class="badge bg-primary fs-6">${key.k4_sno}</span></td>
                    <td><code>${key.k4}</code></td>
                    <td onclick="event.stopPropagation();">
                        <button class="btn btn-sm btn-outline-primary me-1" title="Edit"
                                onclick="editItem('${this.type}', '${key.k4_sno}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" title="Delete"
                                onclick="deleteItem('${this.type}', '${key.k4_sno}')">
                            <i class="fas fa-trash"></i>
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
                <label class="form-label">K4 Serial Number (SNO)</label>
                <input type="number" class="form-control" id="k4_sno" min="0" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            <div class="mb-3">
                <label class="form-label">K4 Key (32 hex chars)</label>
                <input type="text" class="form-control" id="k4" 
                       placeholder="e.g., 00112233445566778899aabbccddeeff" 
                       pattern="[0-9a-fA-F]{32}" maxlength="32" required>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        if (data.k4_sno === undefined || data.k4_sno < 0) {
            errors.push('K4 SNO is required and must be a non-negative number.');
        }
        if (!data.k4 || !/^[0-9a-fA-F]{32}$/.test(data.k4)) {
            errors.push('K4 Key must be exactly 32 hexadecimal characters.');
        }
        return { isValid: errors.length === 0, errors: errors };
    }

    preparePayload(formData) {
        return {
            "k4_sno": parseInt(formData.k4_sno),
            "k4": formData.k4.toLowerCase()
        };
    }
    
    async showEditForm(name) {
        // Llama explícitamente al método genérico de carga de datos del padre.
        await this.loadItemData(name);
    }

    // New methods for details view
    async showDetails(k4Sno) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(k4Sno)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const k4Data = await response.json();
            this.currentK4Data = k4Data;
            this.currentK4Sno = k4Sno;
            this.renderDetailsView(k4Data);
            
        } catch (error) {
            console.error('Failed to load K4 key details:', error);
            // Show error notification
            window.app?.notificationManager?.showNotification('Error loading K4 key details', 'error');
        }
    }

    renderDetailsView(k4Data) {
        const container = document.getElementById('k4-key-details-content');
        const title = document.getElementById('k4-key-detail-title');
        
        if (!container || !title) {
            console.error('Details container not found');
            return;
        }

        const k4Sno = k4Data.k4_sno || 'Unknown';
        title.textContent = `K4 Key: SNO ${k4Sno}`;

        const html = `
            <div id="k4-key-details-view-mode">
                ${this.renderReadOnlyDetails(k4Data)}
            </div>
            <div id="k4-key-details-edit-mode" style="display: none;">
                ${this.renderEditableDetails(k4Data)}
            </div>
        `;

        container.innerHTML = html;
    }

    renderReadOnlyDetails(k4Data) {
        return `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-key me-2"></i>K4 Key Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <strong>Serial Number (SNO):</strong> 
                                        <div class="mt-1">
                                            <span class="badge bg-primary fs-6">${k4Data.k4_sno || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <strong>K4 Key:</strong>
                                        <div class="mt-1">
                                            <code class="text-break">${k4Data.k4 || 'N/A'}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="row">
                                <div class="col-12">
                                    <h6 class="mb-3"><i class="fas fa-info-circle me-2"></i>Technical Information</h6>
                                    <div class="bg-light p-3 rounded">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <small class="text-muted">Key Type:</small>
                                                <div><strong>K4 Authentication Key</strong></div>
                                            </div>
                                            <div class="col-md-6">
                                                <small class="text-muted">Format:</small>
                                                <div><strong>32 Hexadecimal Characters</strong></div>
                                            </div>
                                        </div>
                                        <div class="row mt-2">
                                            <div class="col-md-6">
                                                <small class="text-muted">Usage:</small>
                                                <div><strong>Subscriber Authentication</strong></div>
                                            </div>
                                            <div class="col-md-6">
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
                </div>
            </div>
        `;
    }

    renderEditableDetails(k4Data) {
        return `
            <form id="k4KeyDetailsEditForm">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-edit me-2"></i>Edit K4 Key Information</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Serial Number (SNO)</label>
                                            <input type="number" class="form-control" id="edit_k4_sno" 
                                                   value="${k4Data.k4_sno || ''}" readonly min="0">
                                            <div class="form-text">SNO cannot be changed</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">K4 Key</label>
                                            <input type="text" class="form-control" id="edit_k4_key" 
                                                   value="${k4Data.k4 || ''}" placeholder="32 hex characters" 
                                                   pattern="[0-9a-fA-F]{32}" maxlength="32" required>
                                            <div class="form-text">Exactly 32 hexadecimal characters</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <hr>
                                
                                <div class="bg-light p-3 rounded mb-3">
                                    <h6 class="mb-2"><i class="fas fa-info-circle me-2"></i>About K4 Keys</h6>
                                    <p class="mb-1 small">
                                        K4 keys are used for subscriber authentication in 5G networks. 
                                        Each key must be unique and exactly 32 hexadecimal characters long.
                                    </p>
                                    <p class="mb-0 small text-muted">
                                        <i class="fas fa-lightbulb me-1"></i>
                                        Ensure the key follows proper cryptographic standards for security.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-end mt-3">
                            <button type="button" class="btn btn-secondary me-2" onclick="cancelK4KeyEdit()">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveK4KeyDetailsEdit()">Save Changes</button>
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

            const payload = this.preparePayload(formData);
            await this.updateItem(this.currentK4Sno, payload);
            
            // Refresh the details view
            await this.showDetails(this.currentK4Sno);
            this.toggleEditMode(false);
            
            window.app?.notificationManager?.showNotification('K4 key updated successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save K4 key:', error);
            window.app?.notificationManager?.showNotification(`Failed to save K4 key: ${error.message}`, 'error');
        }
    }

    getEditFormData() {
        return {
            k4_sno: document.getElementById('edit_k4_sno')?.value || '',
            k4: document.getElementById('edit_k4_key')?.value || ''
        };
    }

    toggleEditMode(enable = null) {
        const detailsView = document.getElementById('k4-key-details-view-mode');
        const editView = document.getElementById('k4-key-details-edit-mode');
        const editBtn = document.getElementById('edit-k4-key-btn');
        
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
        }
    }

    async deleteFromDetails() {
        try {
            await this.deleteItem(this.currentK4Sno);
            window.app?.notificationManager?.showNotification('K4 key deleted successfully!', 'success');
            
            // Navigate back to the list
            window.showSection('k4-keys');
            
        } catch (error) {
            console.error('Failed to delete K4 key:', error);
            window.app?.notificationManager?.showNotification(`Failed to delete K4 key: ${error.message}`, 'error');
        }
    }
}

// --- GESTOR PARA EL FORMULARIO DEL SUSCRIPTOR ---
export class SubscriberManager {
    constructor() {
        this.containerId = 'subscriber-form-container';
        this.formId = 'subscriber-form';
        this.apiEndpoint = `${SUBSCRIBER_API_BASE}/subscriber`;
    }

    async renderForm() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        let k4Options = '<option value="" disabled selected>Loading...</option>';
        try {
            const response = await fetch(`${SUBSCRIBER_API_BASE}/k4opt`);
            if (response.ok) {
                const k4Keys = await response.json();
                if (k4Keys && k4Keys.length > 0) {
                    k4Options = '<option value="" disabled selected>Select a K4 Key...</option>';
                    k4Keys.forEach(key => {
                        k4Options += `<option value="${key.k4_sno}">SNO ${key.k4_sno}</option>`;
                    });
                } else {
                    k4Options = '<option value="" disabled>No K4 Keys available</option>';
                }
            }
        } catch (error) {
            console.error("Failed to load K4 keys:", error);
            k4Options = '<option value="" disabled>Error loading keys</option>';
        }

        const formHtml = `
            <div class="mb-3">
                <label class="form-label">Subscriber IMSI (ueId)</label>
                <input type="text" class="form-control" id="sub-imsi" placeholder="15 digits" pattern="\\d{15}" maxlength="15" required>
            </div>
            <div class="mb-3">
                <label class="form-label">PLMN ID</label>
                <input type="text" class="form-control" id="sub-plmnID" placeholder="5 or 6 digits" pattern="\\d{5,6}" maxlength="6" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Key (Ki)</label>
                <input type="text" class="form-control" id="sub-key" placeholder="32 hex chars" pattern="[0-9a-fA-F]{32}" maxlength="32" required>
            </div>
            <div class="mb-3">
                <label class="form-label">OPc</label>
                <input type="text" class="form-control" id="sub-opc" placeholder="32 hex chars" pattern="[0-9a-fA-F]{32}" maxlength="32" required>
            </div>
             <div class="mb-3">
                <label class="form-label">Sequence Number (SQN)</label>
                <input type="text" class="form-control" id="sub-sequenceNumber" placeholder="e.g., 1af347" required>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">K4 SNO</label>
                    <select class="form-select" id="sub-k4_sno" required>
                        ${k4Options}
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Encryption Algorithm</label>
                    <input type="number" class="form-control" id="sub-encryptionAlgorithm" placeholder="e.g., 2" value="2" min="0" required>
                </div>
            </div>
            <button type="submit" class="btn btn-success w-100">
                <i class="fas fa-save me-1"></i> Save Subscriber
            </button>
        `;

        container.innerHTML = formHtml;
        this.attachFormListener();
    }

    attachFormListener() {
        const form = document.getElementById(this.formId);
        if (form) {
            form.onsubmit = async (event) => {
                event.preventDefault();
                await this.saveSubscriber();
            };
        }
    }

    async saveSubscriber() {
        const form = document.getElementById(this.formId);
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            app.notificationManager.showError('Please fill all required fields correctly.');
            return;
        }

        const imsi = document.getElementById('sub-imsi').value;
        const payload = {
            plmnID: document.getElementById('sub-plmnID').value,
            opc: document.getElementById('sub-opc').value,
            key: document.getElementById('sub-key').value,
            sequenceNumber: document.getElementById('sub-sequenceNumber').value,
            k4_sno: parseInt(document.getElementById('sub-k4_sno').value),
            encryptionAlgorithm: parseInt(document.getElementById('sub-encryptionAlgorithm').value),
        };

        try {
            const response = await fetch(`${this.apiEndpoint}/${imsi}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            app.notificationManager.showSuccess(`Subscriber ${imsi} saved successfully!`);
            form.reset();
            form.classList.remove('was-validated');

        } catch (error) {
            app.notificationManager.showApiError(error, `save subscriber ${imsi}`);
        }
    }
}

// --- GESTOR PARA LA LISTA DE SUSCRIPTORES ---
export class SubscriberListManager extends BaseManager {
    constructor() {
        super('/subscriber', 'subscribers-list-content', SUBSCRIBER_API_BASE);
        this.type = 'subscriber';
        this.displayName = 'Subscriber';
    }

    async loadData() {
        try {
            this.showLoading();
            
            // Get list of subscriber IMSIs
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const subscriberImsis = await response.json();
            console.log('Subscriber IMSIs:', subscriberImsis);
            
            // Check if we got valid data
            if (!Array.isArray(subscriberImsis)) {
                console.error('Expected array of IMSIs, got:', subscriberImsis);
                this.showError('Invalid response format from server');
                return;
            }
            
            // If no subscribers, show empty state
            if (subscriberImsis.length === 0) {
                this.data = [];
                this.render([]);
                return;
            }
            
            // Then, fetch complete details for each subscriber
            const subscriberDetails = [];
            for (const imsi of subscriberImsis) {
                try {
                    if (typeof imsi !== 'string') {
                        console.warn('Invalid IMSI:', imsi);
                        continue;
                    }
                    
                    const detailResponse = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(imsi)}`);
                    if (detailResponse.ok) {
                        const subscriberDetail = await detailResponse.json();
                        subscriberDetail.imsi = imsi; // Add IMSI to the data
                        subscriberDetails.push(subscriberDetail);
                    } else {
                        console.warn(`Failed to load details for subscriber ${imsi}: ${detailResponse.status}`);
                    }
                } catch (error) {
                    console.error(`Failed to load details for subscriber ${imsi}:`, error);
                }
            }
            
            console.log('Complete subscriber details:', subscriberDetails);
            
            this.data = subscriberDetails;
            this.render(subscriberDetails);
            
        } catch (error) {
            this.showError(`Failed to load subscribers: ${error.message}`);
            console.error('Load subscribers error:', error);
        }
    }

    render(subscribers) {
        const container = document.getElementById(this.containerId);
        
        if (!subscribers || subscribers.length === 0) {
            this.showEmpty('No subscribers found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>IMSI</th><th>PLMN ID</th><th>K4 SNO</th><th>Encryption Algorithm</th><th>Actions</th></tr></thead><tbody>';
        
        subscribers.forEach(subscriber => {
            const imsi = subscriber.imsi || 'N/A';
            const plmnId = subscriber.plmnID || 'N/A';
            const k4Sno = subscriber.k4_sno || 'N/A';
            const encryptionAlg = subscriber.encryptionAlgorithm || 'N/A';
            
            html += `
                <tr class="subscriber-row" onclick="showSubscriberDetails('${imsi}')" style="cursor: pointer;">
                    <td><strong>${imsi}</strong></td>
                    <td><code>${plmnId}</code></td>
                    <td><span class="badge bg-info">${k4Sno}</span></td>
                    <td><span class="badge bg-secondary">${encryptionAlg}</span></td>
                    <td onclick="event.stopPropagation();">
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${imsi}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${imsi}')">
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
                <label class="form-label">Subscriber IMSI (ueId)</label>
                <input type="text" class="form-control" id="sub_imsi" 
                       ${isEdit ? 'readonly' : ''} placeholder="15 digits" 
                       pattern="\\d{15}" maxlength="15" required>
                <div class="form-text">International Mobile Subscriber Identity (15 digits)</div>
            </div>
            <div class="mb-3">
                <label class="form-label">PLMN ID</label>
                <input type="text" class="form-control" id="sub_plmnID" 
                       placeholder="5 or 6 digits" pattern="\\d{5,6}" maxlength="6" required>
                <div class="form-text">Public Land Mobile Network ID</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Key (Ki)</label>
                <input type="text" class="form-control" id="sub_key" 
                       placeholder="32 hex chars" pattern="[0-9a-fA-F]{32}" maxlength="32" required>
                <div class="form-text">Authentication key (32 hexadecimal characters)</div>
            </div>
            <div class="mb-3">
                <label class="form-label">OPc</label>
                <input type="text" class="form-control" id="sub_opc" 
                       placeholder="32 hex chars" pattern="[0-9a-fA-F]{32}" maxlength="32" required>
                <div class="form-text">Operator key (32 hexadecimal characters)</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Sequence Number (SQN)</label>
                <input type="text" class="form-control" id="sub_sequenceNumber" 
                       placeholder="e.g., 1af347" required>
                <div class="form-text">Authentication sequence number</div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">K4 SNO</label>
                    <select class="form-select" id="sub_k4_sno" required>
                        <option value="">Loading K4 keys...</option>
                    </select>
                    <div class="form-text">K4 Serial Number reference</div>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Encryption Algorithm</label>
                    <input type="number" class="form-control" id="sub_encryptionAlgorithm" 
                           placeholder="e.g., 2" value="2" min="0" required>
                    <div class="form-text">Algorithm identifier for encryption</div>
                </div>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.sub_imsi || !/^\d{15}$/.test(data.sub_imsi)) {
            errors.push('IMSI must be exactly 15 digits');
        }
        
        if (!data.sub_plmnID || !/^\d{5,6}$/.test(data.sub_plmnID)) {
            errors.push('PLMN ID must be 5 or 6 digits');
        }
        
        if (!data.sub_key || !/^[0-9a-fA-F]{32}$/.test(data.sub_key)) {
            errors.push('Key (Ki) must be exactly 32 hexadecimal characters');
        }
        
        if (!data.sub_opc || !/^[0-9a-fA-F]{32}$/.test(data.sub_opc)) {
            errors.push('OPc must be exactly 32 hexadecimal characters');
        }
        
        if (!data.sub_sequenceNumber || data.sub_sequenceNumber.trim() === '') {
            errors.push('Sequence Number is required');
        }
        
        if (!data.sub_k4_sno || data.sub_k4_sno === '') {
            errors.push('K4 SNO is required');
        }
        
        if (!data.sub_encryptionAlgorithm || data.sub_encryptionAlgorithm < 0) {
            errors.push('Encryption Algorithm must be a non-negative number');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        return {
            plmnID: formData.sub_plmnID,
            opc: formData.sub_opc.toLowerCase(),
            key: formData.sub_key.toLowerCase(),
            sequenceNumber: formData.sub_sequenceNumber,
            k4_sno: parseInt(formData.sub_k4_sno),
            encryptionAlgorithm: parseInt(formData.sub_encryptionAlgorithm)
        };
    }

    async createItem(itemData) {
        try {
            const imsi = itemData.imsi || itemData.sub_imsi;
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${imsi}`, {
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

    async loadK4Keys() {
        try {
            const response = await fetch(`${SUBSCRIBER_API_BASE}/k4opt`);
            if (response.ok) {
                const k4Keys = await response.json();
                const select = document.getElementById('sub_k4_sno');
                if (select && Array.isArray(k4Keys)) {
                    select.innerHTML = '<option value="">Select a K4 Key...</option>';
                    k4Keys.forEach(key => {
                        const option = document.createElement('option');
                        option.value = key.k4_sno;
                        option.textContent = `SNO ${key.k4_sno}`;
                        select.appendChild(option);
                    });
                } else {
                    select.innerHTML = '<option value="">No K4 keys available</option>';
                }
            }
        } catch (error) {
            console.warn('Failed to load K4 keys:', error.message);
        }
    }

    async loadItemData(imsi) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(imsi)}`);
            if (response.ok) {
                const data = await response.json();
                
                // Populate fields
                this.setFieldValue('sub_imsi', imsi);
                this.setFieldValue('sub_plmnID', data.plmnID);
                this.setFieldValue('sub_key', data.key);
                this.setFieldValue('sub_opc', data.opc);
                this.setFieldValue('sub_sequenceNumber', data.sequenceNumber);
                this.setFieldValue('sub_k4_sno', data.k4_sno);
                this.setFieldValue('sub_encryptionAlgorithm', data.encryptionAlgorithm);
            }
        } catch (error) {
            console.error('Failed to load subscriber data:', error);
        }
    }

    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }

    // New methods for details view
    async showDetails(imsi) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(imsi)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const subscriberData = await response.json();
            subscriberData.imsi = imsi; // Add IMSI to the data
            this.currentSubscriberData = subscriberData;
            this.currentSubscriberImsi = imsi;
            this.renderDetailsView(subscriberData);
            
        } catch (error) {
            console.error('Failed to load subscriber details:', error);
            // Show error notification
            window.app?.notificationManager?.showNotification('Error loading subscriber details', 'error');
        }
    }

    renderDetailsView(subscriberData) {
        const container = document.getElementById('subscriber-details-content');
        const title = document.getElementById('subscriber-detail-title');
        
        if (!container || !title) {
            console.error('Details container not found');
            return;
        }

        const imsi = subscriberData.imsi || 'Unknown';
        title.textContent = `Subscriber: ${imsi}`;

        const html = `
            <div id="subscriber-details-view-mode">
                ${this.renderReadOnlyDetails(subscriberData)}
            </div>
            <div id="subscriber-details-edit-mode" style="display: none;">
                ${this.renderEditableDetails(subscriberData)}
            </div>
        `;

        container.innerHTML = html;
    }

    renderReadOnlyDetails(subscriberData) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-user me-2"></i>Subscriber Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>IMSI:</strong> 
                                <code class="fs-6">${subscriberData.imsi || 'N/A'}</code>
                            </div>
                            <div class="mb-2">
                                <strong>PLMN ID:</strong> 
                                <code>${subscriberData.plmnID || 'N/A'}</code>
                            </div>
                            <div class="mb-2">
                                <strong>K4 SNO:</strong> 
                                <span class="badge bg-info">${subscriberData.k4_sno || 'N/A'}</span>
                            </div>
                            <div class="mb-2">
                                <strong>Encryption Algorithm:</strong> 
                                <span class="badge bg-secondary">${subscriberData.encryptionAlgorithm || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-key me-2"></i>Authentication Keys</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>Key (Ki):</strong>
                                <div class="mt-1">
                                    <code class="text-break small">${subscriberData.key || 'N/A'}</code>
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>OPc:</strong>
                                <div class="mt-1">
                                    <code class="text-break small">${subscriberData.opc || 'N/A'}</code>
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>Sequence Number:</strong>
                                <div class="mt-1">
                                    <code>${subscriberData.sequenceNumber || 'N/A'}</code>
                                </div>
                            </div>
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
                                        <small class="text-muted">IMSI Format:</small>
                                        <div><strong>15 digits</strong></div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted">Key Format:</small>
                                        <div><strong>32 hex characters</strong></div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted">Network Type:</strong>
                                        <div><strong>5G/LTE</strong></div>
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

    renderEditableDetails(subscriberData) {
        return `
            <form id="subscriberDetailsEditForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-edit me-2"></i>Edit Subscriber Information</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">IMSI</label>
                                    <input type="text" class="form-control" id="edit_sub_imsi" 
                                           value="${subscriberData.imsi || ''}" readonly>
                                    <div class="form-text">IMSI cannot be changed</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">PLMN ID</label>
                                    <input type="text" class="form-control" id="edit_sub_plmnID" 
                                           value="${subscriberData.plmnID || ''}" 
                                           placeholder="5 or 6 digits" pattern="\\d{5,6}" maxlength="6" required>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">K4 SNO</label>
                                            <select class="form-select" id="edit_sub_k4_sno" required>
                                                <option value="">Loading...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Encryption Algorithm</label>
                                            <input type="number" class="form-control" id="edit_sub_encryptionAlgorithm" 
                                                   value="${subscriberData.encryptionAlgorithm || ''}" 
                                                   placeholder="e.g., 2" min="0" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-key me-2"></i>Authentication Keys</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Key (Ki)</label>
                                    <input type="text" class="form-control" id="edit_sub_key" 
                                           value="${subscriberData.key || ''}" 
                                           placeholder="32 hex chars" pattern="[0-9a-fA-F]{32}" maxlength="32" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">OPc</label>
                                    <input type="text" class="form-control" id="edit_sub_opc" 
                                           value="${subscriberData.opc || ''}" 
                                           placeholder="32 hex chars" pattern="[0-9a-fA-F]{32}" maxlength="32" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Sequence Number</label>
                                    <input type="text" class="form-control" id="edit_sub_sequenceNumber" 
                                           value="${subscriberData.sequenceNumber || ''}" 
                                           placeholder="e.g., 1af347" required>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" onclick="cancelSubscriberEdit()">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveSubscriberDetailsEdit()">Save Changes</button>
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
            await this.updateItem(this.currentSubscriberImsi, payload);
            
            // Refresh the details view
            await this.showDetails(this.currentSubscriberImsi);
            this.toggleEditMode(false);
            
            window.app?.notificationManager?.showNotification('Subscriber updated successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save subscriber:', error);
            window.app?.notificationManager?.showNotification(`Failed to save subscriber: ${error.message}`, 'error');
        }
    }

    getEditFormData() {
        return {
            sub_imsi: document.getElementById('edit_sub_imsi')?.value || '',
            sub_plmnID: document.getElementById('edit_sub_plmnID')?.value || '',
            sub_key: document.getElementById('edit_sub_key')?.value || '',
            sub_opc: document.getElementById('edit_sub_opc')?.value || '',
            sub_sequenceNumber: document.getElementById('edit_sub_sequenceNumber')?.value || '',
            sub_k4_sno: document.getElementById('edit_sub_k4_sno')?.value || '',
            sub_encryptionAlgorithm: document.getElementById('edit_sub_encryptionAlgorithm')?.value || ''
        };
    }

    async loadK4KeysForEdit() {
        try {
            const response = await fetch(`${SUBSCRIBER_API_BASE}/k4opt`);
            if (response.ok) {
                const k4Keys = await response.json();
                const select = document.getElementById('edit_sub_k4_sno');
                if (select && Array.isArray(k4Keys)) {
                    select.innerHTML = '<option value="">Select a K4 Key...</option>';
                    k4Keys.forEach(key => {
                        const option = document.createElement('option');
                        option.value = key.k4_sno;
                        option.textContent = `SNO ${key.k4_sno}`;
                        select.appendChild(option);
                    });

                    // Pre-select current K4 SNO
                    const currentK4Sno = this.currentSubscriberData.k4_sno;
                    if (currentK4Sno) {
                        select.value = currentK4Sno;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load K4 keys:', error.message);
        }
    }

    toggleEditMode(enable = null) {
        const detailsView = document.getElementById('subscriber-details-view-mode');
        const editView = document.getElementById('subscriber-details-edit-mode');
        const editBtn = document.getElementById('edit-subscriber-btn');
        
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
            
            // Load K4 keys when entering edit mode
            this.loadK4KeysForEdit();
        }
    }

    async deleteFromDetails() {
        try {
            await this.deleteItem(this.currentSubscriberImsi);
            window.app?.notificationManager?.showNotification('Subscriber deleted successfully!', 'success');
            
            // Navigate back to the list
            window.showSection('subscribers-list');
            
        } catch (error) {
            console.error('Failed to delete subscriber:', error);
            window.app?.notificationManager?.showNotification(`Failed to delete subscriber: ${error.message}`, 'error');
        }
    }
}