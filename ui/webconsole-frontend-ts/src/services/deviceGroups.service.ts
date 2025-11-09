import ApiService from './api.service';
import { DeviceGroup } from '../models/device-group.model';
import { ConfigMsg } from '../models/config-msg.model';

class DeviceGroupsService extends ApiService {
    private baseUrl: string = `${this.apiUrl}/device-groups`;

    async getAllDeviceGroups(): Promise<DeviceGroup[]> {
        const response = await this.get<DeviceGroup[]>(this.baseUrl);
        return response.data;
    }

    async getDeviceGroupById(id: string): Promise<DeviceGroup> {
        const response = await this.get<DeviceGroup>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async createDeviceGroup(deviceGroup: DeviceGroup): Promise<ConfigMsg> {
        const response = await this.post<ConfigMsg>(this.baseUrl, deviceGroup);
        return response.data;
    }

    async updateDeviceGroup(id: string, deviceGroup: DeviceGroup): Promise<ConfigMsg> {
        const response = await this.put<ConfigMsg>(`${this.baseUrl}/${id}`, deviceGroup);
        return response.data;
    }

    async deleteDeviceGroup(id: string): Promise<ConfigMsg> {
        const response = await this.delete<ConfigMsg>(`${this.baseUrl}/${id}`);
        return response.data;
    }
}

export default DeviceGroupsService;