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
                <tr class="k4-row" onclick="showK4Details('${key.k4_sno}')" style="cursor: pointer;">
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
        const container = document.getElementById('k4-details-content');
        const title = document.getElementById('k4-detail-title');
        
        if (!container || !title) {
            console.error('Details container not found');
            return;
        }

        const k4Sno = k4Data.k4_sno || 'Unknown';
        title.textContent = `K4 Key: SNO ${k4Sno}`;

        const html = `
            <div id="k4-details-view-mode">
                ${this.renderReadOnlyDetails(k4Data)}
            </div>
            <div id="k4-details-edit-mode" style="display: none;">
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
        const detailsView = document.getElementById('k4-details-view-mode');
        const editView = document.getElementById('k4-details-edit-mode');
        const editBtn = document.getElementById('edit-k4-btn');
        
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
            
            // Get list of subscribers (returns SubsListIE array)
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const subscribersList = await response.json();
            console.log('Subscribers List:', subscribersList);
            
            // Check if we got valid data
            if (!Array.isArray(subscribersList)) {
                console.error('Expected array of subscribers, got:', subscribersList);
                this.showError('Invalid response format from server');
                return;
            }
            
            // If no subscribers, show empty state
            if (subscribersList.length === 0) {
                this.data = [];
                this.render([]);
                return;
            }
            
            this.data = subscribersList;
            this.render(subscribersList);
            
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
        html += '<thead><tr><th>UE ID (IMSI)</th><th>PLMN ID</th><th>Actions</th></tr></thead><tbody>';
        
        subscribers.forEach(subscriber => {
            const ueId = subscriber.ueId || 'N/A';
            const plmnId = subscriber.plmnID || 'N/A';
            
            html += `
                <tr class="subscriber-row" onclick="showSubscriberDetails('${ueId}')" style="cursor: pointer;">
                    <td><strong>${ueId}</strong></td>
                    <td><code>${plmnId}</code></td>
                    <td onclick="event.stopPropagation();">
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${ueId}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${ueId}')">
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
                <label class="form-label">UE ID (IMSI)</label>
                <input type="text" class="form-control" id="sub_ueId" 
                       ${isEdit ? 'readonly' : ''} placeholder="e.g., imsi-208930100007487" required>
                <div class="form-text">International Mobile Subscriber Identity</div>
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
                       placeholder="Hexadecimal characters" pattern="[0-9a-fA-F]+" required>
                <div class="form-text">Authentication key (hexadecimal characters)</div>
            </div>
            <div class="mb-3">
                <label class="form-label">OPc</label>
                <input type="text" class="form-control" id="sub_opc" 
                       placeholder="Hexadecimal characters" pattern="[0-9a-fA-F]+" required>
                <div class="form-text">Operator key (hexadecimal characters)</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Sequence Number (SQN)</label>
                <input type="text" class="form-control" id="sub_sequenceNumber" 
                       placeholder="e.g., 16f3b3f70fc2" required>
                <div class="form-text">Authentication sequence number</div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">K4 SNO</label>
                    <select class="form-select" id="sub_k4_sno">
                        <option value="">Loading K4 keys...</option>
                    </select>
                    <div class="form-text">K4 Serial Number reference (optional)</div>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Encryption Algorithm</label>
                    <input type="number" class="form-control" id="sub_encryptionAlgorithm" 
                           placeholder="e.g., 0" value="0" min="0">
                    <div class="form-text">Algorithm identifier for encryption (optional)</div>
                </div>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.sub_ueId || data.sub_ueId.trim() === '') {
            errors.push('UE ID is required');
        }
        
        if (!data.sub_plmnID || !/^\d{5,6}$/.test(data.sub_plmnID)) {
            errors.push('PLMN ID must be 5 or 6 digits');
        }
        
        if (!data.sub_key || !/^[0-9a-fA-F]+$/.test(data.sub_key)) {
            errors.push('Key (Ki) must contain only hexadecimal characters');
        }
        
        if (!data.sub_opc || !/^[0-9a-fA-F]+$/.test(data.sub_opc)) {
            errors.push('OPc must contain only hexadecimal characters');
        }
        
        if (!data.sub_sequenceNumber || data.sub_sequenceNumber.trim() === '') {
            errors.push('Sequence Number is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        // Map form data to API structure - SubsOverrideData
        return {
            ueId: formData.sub_ueId,
            plmnID: formData.sub_plmnID,
            authenticationSubscription: {
                sequenceNumber: formData.sub_sequenceNumber,
                authenticationMethod: "5G_AKA",
                permanentKey: {
                    permanentKeyValue: formData.sub_key,
                    encryptionKey: 0,
                    encryptionAlgorithm: parseInt(formData.sub_encryptionAlgorithm) || 0
                },
                opc: {
                    opcValue: formData.sub_opc,
                    encryptionKey: 0,
                    encryptionAlgorithm: parseInt(formData.sub_encryptionAlgorithm) || 0
                }
            }
        };
    }

    async createItem(itemData, ueId) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(ueId)}`, {
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

            return response.status === 201 ? {} : await response.json();
        } catch (error) {
            throw error;
        }
    }

    async updateItem(ueId, itemData) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(ueId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            throw error;
        }
    }

    async deleteItem(ueId) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(ueId)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            throw error;
        }
    }

    async loadItemData(ueId) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(ueId)}`);
            if (response.ok) {
                const subsData = await response.json();
                
                // Populate basic fields
                this.setFieldValue('sub_ueId', subsData.ueId);
                this.setFieldValue('sub_plmnID', subsData.plmnID);
                
                // Extract authentication data if available
                if (subsData.AuthenticationSubscription) {
                    const authData = subsData.AuthenticationSubscription;
                    this.setFieldValue('sub_key', authData.PermanentKey?.PermanentKeyValue);
                    this.setFieldValue('sub_opc', authData.Opc?.OpcValue);
                    this.setFieldValue('sub_sequenceNumber', authData.SequenceNumber);
                    
                    // Set encryption algorithm if available
                    if (authData.Opc?.EncryptionAlgorithm !== undefined) {
                        this.setFieldValue('sub_encryptionAlgorithm', authData.Opc.EncryptionAlgorithm);
                    }
                }
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
    async showDetails(ueId) {
        try {
            const response = await fetch(`${this.apiBase}${this.apiEndpoint}/${encodeURIComponent(ueId)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const subscriberData = await response.json();
            this.currentSubscriberData = subscriberData;
            this.currentSubscriberUeId = ueId;
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

        const ueId = subscriberData.ueId || 'Unknown';
        title.textContent = `Subscriber: ${ueId}`;

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
        const authData = subscriberData.AuthenticationSubscription || {};
        const amData = subscriberData.AccessAndMobilitySubscriptionData || {};
        const smData = subscriberData.SessionManagementSubscriptionData || [];
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-user me-2"></i>Basic Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>UE ID:</strong> 
                                <code class="fs-6">${subscriberData.ueId || 'N/A'}</code>
                            </div>
                            <div class="mb-2">
                                <strong>PLMN ID:</strong> 
                                <code>${subscriberData.plmnID || 'N/A'}</code>
                            </div>
                            <div class="mb-2">
                                <strong>Authentication Method:</strong> 
                                <span class="badge bg-info">${authData.AuthenticationMethod || 'N/A'}</span>
                            </div>
                            <div class="mb-2">
                                <strong>Management Field:</strong> 
                                <span class="badge bg-secondary">${authData.AuthenticationManagementField || 'N/A'}</span>
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
                                    <code class="text-break small">${authData.PermanentKey?.PermanentKeyValue || 'N/A'}</code>
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>OPc:</strong>
                                <div class="mt-1">
                                    <code class="text-break small">${authData.Opc?.OpcValue || 'N/A'}</code>
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>Sequence Number:</strong>
                                <div class="mt-1">
                                    <code>${authData.SequenceNumber || 'N/A'}</code>
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>Encryption Algorithm:</strong>
                                <div class="mt-1">
                                    <span class="badge bg-primary">${authData.Opc?.EncryptionAlgorithm !== undefined ? authData.Opc.EncryptionAlgorithm : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-signal me-2"></i>Access & Mobility</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>GPSIs:</strong>
                                <div class="mt-1">
                                    ${amData.Gpsis && amData.Gpsis.length > 0 ? 
                                        amData.Gpsis.map(gpsi => `<span class="badge bg-light text-dark me-1">${gpsi}</span>`).join('') :
                                        '<span class="text-muted">None</span>'
                                    }
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>UE AMBR:</strong>
                                <div class="mt-1">
                                    ${amData.SubscribedUeAmbr ? 
                                        `<small>UL: ${amData.SubscribedUeAmbr.Uplink || 'N/A'}, DL: ${amData.SubscribedUeAmbr.Downlink || 'N/A'}</small>` :
                                        '<span class="text-muted">Not configured</span>'
                                    }
                                </div>
                            </div>
                            <div class="mb-2">
                                <strong>Network Slices:</strong>
                                <div class="mt-1">
                                    ${amData.Nssai?.DefaultSingleNssais ? 
                                        amData.Nssai.DefaultSingleNssais.map(nssai => 
                                            `<span class="badge bg-success me-1">SST:${nssai.Sst}${nssai.Sd ? ', SD:' + nssai.Sd : ''}</span>`
                                        ).join('') :
                                        '<span class="text-muted">None</span>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-cogs me-2"></i>Session Management</h6>
                        </div>
                        <div class="card-body">
                            ${smData && smData.length > 0 ? 
                                smData.map((session, index) => `
                                    <div class="mb-3 ${index > 0 ? 'border-top pt-3' : ''}">
                                        <div class="mb-1">
                                            <strong>Slice ${index + 1}:</strong> 
                                            <span class="badge bg-info">
                                                SST:${session.SingleNssai?.Sst}${session.SingleNssai?.Sd ? ', SD:' + session.SingleNssai.Sd : ''}
                                            </span>
                                        </div>
                                        <div class="small">
                                            <strong>DNNs:</strong> 
                                            ${session.DnnConfigurations ? 
                                                Object.keys(session.DnnConfigurations).map(dnn => 
                                                    `<span class="badge bg-light text-dark me-1">${dnn}</span>`
                                                ).join('') :
                                                '<span class="text-muted">None</span>'
                                            }
                                        </div>
                                    </div>
                                `).join('') :
                                '<div class="text-muted">No session management data</div>'
                            }
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
                                        <small class="text-muted">Network Type:</small>
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
                                    <div class="col-md-3">
                                        <small class="text-muted">Policy Data:</small>
                                        <div>
                                            ${subscriberData.AmPolicyData ? 
                                                '<span class="badge bg-info">Configured</span>' :
                                                '<span class="badge bg-secondary">None</span>'
                                            }
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <small class="text-muted">SMF Selection:</small>
                                        <div>
                                            ${subscriberData.SmfSelectionSubscriptionData ? 
                                                '<span class="badge bg-info">Configured</span>' :
                                                '<span class="badge bg-secondary">None</span>'
                                            }
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
        const authData = subscriberData.AuthenticationSubscription || {};
        
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
                                    <label class="form-label">UE ID</label>
                                    <input type="text" class="form-control" id="edit_sub_ueId" 
                                           value="${subscriberData.ueId || ''}" readonly>
                                    <div class="form-text">UE ID cannot be changed</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">PLMN ID</label>
                                    <input type="text" class="form-control" id="edit_sub_plmnID" 
                                           value="${subscriberData.plmnID || ''}" 
                                           placeholder="5 or 6 digits" pattern="\\d{5,6}" maxlength="6" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Encryption Algorithm</label>
                                    <input type="number" class="form-control" id="edit_sub_encryptionAlgorithm" 
                                           value="${authData.Opc?.EncryptionAlgorithm || 0}" 
                                           placeholder="e.g., 0" min="0">
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
                                           value="${authData.PermanentKey?.PermanentKeyValue || ''}" 
                                           placeholder="Hexadecimal characters" pattern="[0-9a-fA-F]+" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">OPc</label>
                                    <input type="text" class="form-control" id="edit_sub_opc" 
                                           value="${authData.Opc?.OpcValue || ''}" 
                                           placeholder="Hexadecimal characters" pattern="[0-9a-fA-F]+" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Sequence Number</label>
                                    <input type="text" class="form-control" id="edit_sub_sequenceNumber" 
                                           value="${authData.SequenceNumber || ''}" 
                                           placeholder="e.g., 16f3b3f70fc2" required>
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
            await this.updateItem(this.currentSubscriberUeId, payload);
            
            // Refresh the details view
            await this.showDetails(this.currentSubscriberUeId);
            this.toggleEditMode(false);
            
            window.app?.notificationManager?.showNotification('Subscriber updated successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save subscriber:', error);
            window.app?.notificationManager?.showNotification(`Failed to save subscriber: ${error.message}`, 'error');
        }
    }

    getEditFormData() {
        return {
            sub_ueId: document.getElementById('edit_sub_ueId')?.value || '',
            sub_plmnID: document.getElementById('edit_sub_plmnID')?.value || '',
            sub_key: document.getElementById('edit_sub_key')?.value || '',
            sub_opc: document.getElementById('edit_sub_opc')?.value || '',
            sub_sequenceNumber: document.getElementById('edit_sub_sequenceNumber')?.value || '',
            sub_encryptionAlgorithm: document.getElementById('edit_sub_encryptionAlgorithm')?.value || ''
        };
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
        }
    }

    async deleteFromDetails() {
        try {
            await this.deleteItem(this.currentSubscriberUeId);
            window.app?.notificationManager?.showNotification('Subscriber deleted successfully!', 'success');
            
            // Navigate back to the list
            window.showSection('subscribers-list');
            
        } catch (error) {
            console.error('Failed to delete subscriber:', error);
            window.app?.notificationManager?.showNotification(`Failed to delete subscriber: ${error.message}`, 'error');
        }
    }

    async createFromForm() {
        try {
            const formData = this.getCreateFormData();
            const validation = this.validateFormData(formData);
            
            if (!validation.isValid) {
                window.app?.notificationManager?.showNotification(validation.errors.join('<br>'), 'error');
                return;
            }

            const payload = this.prepareCreatePayload(formData);
            await this.createItem(payload, formData.sub_ueId);
            
            window.app?.notificationManager?.showNotification('Subscriber created successfully!', 'success');
            
            // Navigate back to the list
            window.showSection('subscribers-list');
            
        } catch (error) {
            console.error('Failed to create subscriber:', error);
            window.app?.notificationManager?.showNotification(`Failed to create subscriber: ${error.message}`, 'error');
        }
    }

    getCreateFormData() {
        return {
            sub_ueId: document.getElementById('create_sub_ueId')?.value || '',
            sub_plmnID: document.getElementById('create_sub_plmnID')?.value || '',
            sub_key: document.getElementById('create_sub_key')?.value || '',
            sub_opc: document.getElementById('create_sub_opc')?.value || '',
            sub_sequenceNumber: document.getElementById('create_sub_sequenceNumber')?.value || '',
            sub_encryptionAlgorithm: document.getElementById('create_sub_encryptionAlgorithm')?.value || ''
        };
    }

    prepareCreatePayload(formData) {
        // Map form data to API structure - SubsOverrideData
        return {
            ueId: formData.sub_ueId,
            plmnID: formData.sub_plmnID,
            authenticationSubscription: {
                sequenceNumber: formData.sub_sequenceNumber,
                authenticationMethod: "5G_AKA",
                permanentKey: {
                    permanentKeyValue: formData.sub_key,
                    encryptionKey: 0,
                    encryptionAlgorithm: parseInt(formData.sub_encryptionAlgorithm) || 0
                },
                opc: {
                    opcValue: formData.sub_opc,
                    encryptionKey: 0,
                    encryptionAlgorithm: parseInt(formData.sub_encryptionAlgorithm) || 0
                }
            }
        };
    }
}