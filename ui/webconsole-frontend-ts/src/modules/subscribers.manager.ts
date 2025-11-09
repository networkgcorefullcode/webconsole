import { SubscribersService } from '../services/subscribers.service';
import { SubsData } from '../models/subs-data.model';
import { SubsListIe } from '../models/subs-list-ie.model';

export class SubscribersManager {
    private subscribersService: SubscribersService;

    constructor() {
        this.subscribersService = new SubscribersService();
    }

    async createSubscriber(subscriberData: SubsData): Promise<void> {
        try {
            await this.subscribersService.createSubscriber(subscriberData);
            console.log('Subscriber created successfully');
        } catch (error) {
            console.error('Error creating subscriber:', error);
        }
    }

    async getSubscribers(): Promise<SubsData[]> {
        try {
            const subscribers = await this.subscribersService.getSubscribers();
            return subscribers;
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            return [];
        }
    }

    async updateSubscriber(subscriberId: string, subscriberData: SubsData): Promise<void> {
        try {
            await this.subscribersService.updateSubscriber(subscriberId, subscriberData);
            console.log('Subscriber updated successfully');
        } catch (error) {
            console.error('Error updating subscriber:', error);
        }
    }

    async deleteSubscriber(subscriberId: string): Promise<void> {
        try {
            await this.subscribersService.deleteSubscriber(subscriberId);
            console.log('Subscriber deleted successfully');
        } catch (error) {
            console.error('Error deleting subscriber:', error);
        }
    }

    async getSubscriberList(): Promise<SubsListIe[]> {
        try {
            const subscriberList = await this.subscribersService.getSubscriberList();
            return subscriberList;
        } catch (error) {
            console.error('Error fetching subscriber list:', error);
            return [];
        }
    }
}