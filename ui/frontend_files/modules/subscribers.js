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
                <tr>
                    <td><span class="badge bg-primary fs-6">${key.k4_sno}</span></td>
                    <td><code>${key.k4}</code></td>
                    <td>
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
                       placeholder="Hexadecimal characters" 
                       pattern="[0-9a-fA-F]+" required>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        if (data.k4_sno === undefined || data.k4_sno < 0) {
            errors.push('K4 SNO is required and must be a non-negative number.');
        }
        if (!data.k4 || !/^[0-9a-fA-F]+$/.test(data.k4)) { // Regex actualizada
            errors.push('K4 Key is required and must contain only hexadecimal characters.'); // Mensaje actualizado
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