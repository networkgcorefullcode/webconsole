import ApiService from './api.service';
import { GnbInventory } from '../models/gnb-inventory.model';
import { ConfigMsg } from '../models/config-msg.model';

class GnbInventoryService extends ApiService {
    private baseUrl: string = `${this.apiBaseUrl}/gnb-inventory`;

    async getAllGnbInventory(): Promise<GnbInventory[]> {
        const response = await this.get<GnbInventory[]>(this.baseUrl);
        return response.data;
    }

    async getGnbInventoryById(id: string): Promise<GnbInventory> {
        const response = await this.get<GnbInventory>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async createGnbInventory(data: GnbInventory): Promise<ConfigMsg> {
        const response = await this.post<ConfigMsg>(this.baseUrl, data);
        return response.data;
    }

    async updateGnbInventory(id: string, data: GnbInventory): Promise<ConfigMsg> {
        const response = await this.put<ConfigMsg>(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    async deleteGnbInventory(id: string): Promise<ConfigMsg> {
        const response = await this.delete<ConfigMsg>(`${this.baseUrl}/${id}`);
        return response.data;
    }
}

export default GnbInventoryService;