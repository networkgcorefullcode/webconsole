// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

// Import modules
import { DeviceGroupManager } from './modules/deviceGroups.js';
import { NetworkSliceManager } from './modules/networkSlices.js';
import { GnbManager } from './modules/gnbInventory.js';
import { UpfManager } from './modules/upfInventory.js';
import { UIManager } from './modules/uiManager.js';
import { NotificationManager } from './modules/notifications.js';
import { ModalManager } from './modules/modalManager.js';
import { K4Manager, SubscriberManager } from './modules/subscribers.js';

// API Base URL
export const API_BASE = '/config/v1';
export const SUBSCRIBER_API_BASE = '/api';

// Global application state
class AppState {
    constructor() {
        this.currentSection = 'device-groups';
        this.managers = {
            deviceGroups: new DeviceGroupManager(),
            networkSlices: new NetworkSliceManager(),
            gnbInventory: new GnbManager(),
            upfInventory: new UpfManager(),
            k4Manager: new K4Manager(),
            subscriberManager: new SubscriberManager()
        };
        this.uiManager = new UIManager();
        this.notificationManager = new NotificationManager();
        this.modalManager = new ModalManager();
    }

    getCurrentManager() {
        return this.managers[this.currentSection];
    }
}

// Global app instance
const app = new AppState();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    app.uiManager.showSection('device-groups');
});

// Export global functions for HTML onclick handlers
window.showSection = (section) => app.uiManager.showSection(section);
window.showCreateForm = async (type) => await app.modalManager.showCreateForm(type);
window.editItem = async (type, name) => await app.modalManager.editItem(type, name);
window.deleteItem = async (type, name) => await app.modalManager.deleteItem(type, name);
window.saveItem = async () => await app.modalManager.saveItem();

// Device Group Details functions
window.showDeviceGroupDetails = async (groupName) => {
    await app.managers.deviceGroups.showDetails(groupName);
    app.uiManager.showSection('device-group-details');
};

window.toggleEditMode = () => {
    app.managers.deviceGroups.toggleEditMode();
};

window.cancelEdit = () => {
    app.managers.deviceGroups.toggleEditMode(false);
};

window.saveDetailsEdit = async () => {
    await app.managers.deviceGroups.saveEdit();
};

window.confirmDeleteDeviceGroup = () => {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    document.getElementById('deleteConfirmMessage').textContent = 
        `Are you sure you want to delete the device group "${app.managers.deviceGroups.currentGroupName}"? This action cannot be undone.`;
    
    window.currentDeleteAction = () => app.managers.deviceGroups.deleteFromDetails();
    modal.show();
};

// gNB Details functions
window.showGnbDetails = async (gnbName) => {
    await app.managers.gnbInventory.showDetails(gnbName);
    app.uiManager.showSection('gnb-details');
};

window.toggleGnbEditMode = () => {
    app.managers.gnbInventory.toggleEditMode();
};

window.cancelGnbEdit = () => {
    app.managers.gnbInventory.toggleEditMode(false);
};

window.saveGnbDetailsEdit = async () => {
    await app.managers.gnbInventory.saveEdit();
};

window.confirmDeleteGnb = () => {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    document.getElementById('deleteConfirmMessage').textContent = 
        `Are you sure you want to delete the gNB "${app.managers.gnbInventory.currentGnbName}"? This action cannot be undone.`;
    
    window.currentDeleteAction = () => app.managers.gnbInventory.deleteFromDetails();
    modal.show();
};

window.executeDelete = async () => {
    if (window.currentDeleteAction) {
        await window.currentDeleteAction();
        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
        window.currentDeleteAction = null;
    }
};

// Export app instance for modules
export default app;


