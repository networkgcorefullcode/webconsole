import { DeviceGroupsService } from '../services/deviceGroups.service';
import { DeviceGroup } from '../models/device-group.model';

export class DeviceGroupsManager {
    private deviceGroupsService: DeviceGroupsService;

    constructor() {
        this.deviceGroupsService = new DeviceGroupsService();
    }

    async createDeviceGroup(deviceGroup: DeviceGroup): Promise<DeviceGroup> {
        try {
            const createdDeviceGroup = await this.deviceGroupsService.createDeviceGroup(deviceGroup);
            return createdDeviceGroup;
        } catch (error) {
            console.error('Error creating device group:', error);
            throw error;
        }
    }

    async getDeviceGroups(): Promise<DeviceGroup[]> {
        try {
            const deviceGroups = await this.deviceGroupsService.getDeviceGroups();
            return deviceGroups;
        } catch (error) {
            console.error('Error fetching device groups:', error);
            throw error;
        }
    }

    async updateDeviceGroup(deviceGroup: DeviceGroup): Promise<DeviceGroup> {
        try {
            const updatedDeviceGroup = await this.deviceGroupsService.updateDeviceGroup(deviceGroup);
            return updatedDeviceGroup;
        } catch (error) {
            console.error('Error updating device group:', error);
            throw error;
        }
    }

    async deleteDeviceGroup(id: number): Promise<void> {
        try {
            await this.deviceGroupsService.deleteDeviceGroup(id);
        } catch (error) {
            console.error('Error deleting device group:', error);
            throw error;
        }
    }
}