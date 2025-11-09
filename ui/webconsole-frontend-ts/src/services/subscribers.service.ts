import ApiService from './api.service';
import { SubsData } from '../models/subs-data.model';

class SubscribersService extends ApiService {
    private baseUrl: string;

    constructor() {
        super();
        this.baseUrl = '/api/subscribers'; // Adjust the base URL as needed
    }

    async getAllSubscribers(): Promise<SubsData[]> {
        const response = await this.get(`${this.baseUrl}`);
        return response.data;
    }

    async getSubscriberById(id: string): Promise<SubsData> {
        const response = await this.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async createSubscriber(subscriberData: SubsData): Promise<SubsData> {
        const response = await this.post(`${this.baseUrl}`, subscriberData);
        return response.data;
    }

    async updateSubscriber(id: string, subscriberData: SubsData): Promise<SubsData> {
        const response = await this.put(`${this.baseUrl}/${id}`, subscriberData);
        return response.data;
    }

    async deleteSubscriber(id: string): Promise<void> {
        await this.delete(`${this.baseUrl}/${id}`);
    }
}

export default SubscribersService;