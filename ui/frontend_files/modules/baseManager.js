// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { API_BASE } from '../app.js';

export class BaseManager {
    constructor(apiEndpoint, containerId) {
        this.apiEndpoint = apiEndpoint;
        this.containerId = containerId;
        this.data = [];
    }

    async loadData() {
        try {
            this.showLoading();
            const response = await fetch(`${API_BASE}${this.apiEndpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Debug: Log the raw API response
            console.log(`${this.apiEndpoint} API response:`, data);
            
            this.data = Array.isArray(data) ? data : [data];
            
            // Debug: Log the processed data
            console.log(`${this.apiEndpoint} processed data:`, this.data);
            
            this.render(this.data);
            
        } catch (error) {
            this.showError(`Failed to load data: ${error.message}`);
            console.error('Load data error:', error);
        }
    }

    async createItem(itemData) {
        try {
            const response = await fetch(`${API_BASE}${this.apiEndpoint}`, {
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

    async updateItem(itemName, itemData) {
        try {
            const response = await fetch(`${API_BASE}${this.apiEndpoint}/${itemName}`, {
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

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async deleteItem(itemName) {
        try {
            const response = await fetch(`${API_BASE}${this.apiEndpoint}/${itemName}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    async getItem(itemName) {
        try {
            const response = await fetch(`${API_BASE}${this.apiEndpoint}/${itemName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Default implementation for showing create form
    async showCreateForm() {
        // Can be overridden by subclasses
    }

    // Default implementation for showing edit form
    async showEditForm(name) {
        // Can be overridden by subclasses
    }

    // Default implementation for loading item data
    async loadItemData(name) {
        try {
            const data = await this.getItem(name);
            
            // Populate form fields with flat structure
            Object.keys(data).forEach(key => {
                const field = document.getElementById(key);
                if (field) {
                    field.value = data[key] || '';
                }
            });
        } catch (error) {
            console.error('Failed to load item data:', error);
            throw error;
        }
    }

    showLoading() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            `;
        }
    }

    showEmpty(message) {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    ${message}
                </div>
            `;
        }
    }

    // Abstract methods to be implemented by subclasses
    render(data) {
        throw new Error('render() method must be implemented by subclass');
    }

    getFormFields(isEdit = false) {
        throw new Error('getFormFields() method must be implemented by subclass');
    }

    validateFormData(data) {
        // Default validation - can be overridden
        return { isValid: true, errors: [] };
    }

    preparePayload(formData, isEdit = false) {
        // Default payload preparation - can be overridden
        return formData;
    }
}
