import ApiService from './api.service';
import { NetworkSlice } from '../models/network-slice.model';
import { ConfigMsg } from '../models/config-msg.model';

class NetworkSlicesService extends ApiService {
    private baseUrl: string = `${this.apiBaseUrl}/network-slices`;

    public async getAllNetworkSlices(): Promise<NetworkSlice[]> {
        const response = await this.get<NetworkSlice[]>(this.baseUrl);
        return response.data;
    }

    public async getNetworkSliceById(id: string): Promise<NetworkSlice> {
        const response = await this.get<NetworkSlice>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    public async createNetworkSlice(networkSlice: NetworkSlice): Promise<ConfigMsg> {
        const response = await this.post<NetworkSlice, ConfigMsg>(this.baseUrl, networkSlice);
        return response.data;
    }

    public async updateNetworkSlice(id: string, networkSlice: NetworkSlice): Promise<ConfigMsg> {
        const response = await this.put<NetworkSlice, ConfigMsg>(`${this.baseUrl}/${id}`, networkSlice);
        return response.data;
    }

    public async deleteNetworkSlice(id: string): Promise<ConfigMsg> {
        const response = await this.delete<ConfigMsg>(`${this.baseUrl}/${id}`);
        return response.data;
    }
}

export default NetworkSlicesService;