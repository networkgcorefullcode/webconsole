import { NetworkSlicesService } from '../services/networkSlices.service';
import { NetworkSlice } from '../models/network-slice.model';

export class NetworkSlicesManager {
    private networkSlicesService: NetworkSlicesService;

    constructor() {
        this.networkSlicesService = new NetworkSlicesService();
    }

    public async createNetworkSlice(sliceData: NetworkSlice): Promise<NetworkSlice> {
        try {
            const response = await this.networkSlicesService.create(sliceData);
            return response.data;
        } catch (error) {
            console.error('Error creating network slice:', error);
            throw error;
        }
    }

    public async getNetworkSlices(): Promise<NetworkSlice[]> {
        try {
            const response = await this.networkSlicesService.getAll();
            return response.data;
        } catch (error) {
            console.error('Error fetching network slices:', error);
            throw error;
        }
    }

    public async updateNetworkSlice(sliceId: string, sliceData: NetworkSlice): Promise<NetworkSlice> {
        try {
            const response = await this.networkSlicesService.update(sliceId, sliceData);
            return response.data;
        } catch (error) {
            console.error('Error updating network slice:', error);
            throw error;
        }
    }

    public async deleteNetworkSlice(sliceId: string): Promise<void> {
        try {
            await this.networkSlicesService.delete(sliceId);
        } catch (error) {
            console.error('Error deleting network slice:', error);
            throw error;
        }
    }
}