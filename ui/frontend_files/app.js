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

// API Base URL
export const API_BASE = '/config/v1';

// Global application state
class AppState {
    constructor() {
        this.currentSection = 'device-groups';
        this.managers = {
            deviceGroups: new DeviceGroupManager(),
            networkSlices: new NetworkSliceManager(),
            gnbInventory: new GnbManager(),
            upfInventory: new UpfManager()
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

// Export app instance for modules
export default app;


