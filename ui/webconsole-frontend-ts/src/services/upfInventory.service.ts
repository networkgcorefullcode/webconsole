import ApiService from './api.service';
import { Upf } from '../models/upf.model';

class UpfInventoryService extends ApiService {
    private baseUrl: string;

    constructor() {
        super();
        this.baseUrl = '/api/upf-inventory'; // Adjust the endpoint as necessary
    }

    async getAllUpfs(): Promise<Upf[]> {
        const response = await this.get(`${this.baseUrl}`);
        return response.data;
    }

    async getUpfById(id: string): Promise<Upf> {
        const response = await this.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async createUpf(upf: Upf): Promise<Upf> {
        const response = await this.post(`${this.baseUrl}`, upf);
        return response.data;
    }

    async updateUpf(id: string, upf: Upf): Promise<Upf> {
        const response = await this.put(`${this.baseUrl}/${id}`, upf);
        return response.data;
    }

    async deleteUpf(id: string): Promise<void> {
        await this.delete(`${this.baseUrl}/${id}`);
    }
}

export default UpfInventoryService;