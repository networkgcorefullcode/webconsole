import { Notification } from '../models/notification.model';
import { ApiService } from '../services/api.service';

export class NotificationsManager {
    private apiService: ApiService;

    constructor() {
        this.apiService = new ApiService();
    }

    public async getNotifications(): Promise<Notification[]> {
        try {
            const response = await this.apiService.get('/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    public async createNotification(notification: Notification): Promise<Notification> {
        try {
            const response = await this.apiService.post('/notifications', notification);
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    public async updateNotification(notificationId: string, notification: Notification): Promise<Notification> {
        try {
            const response = await this.apiService.put(`/notifications/${notificationId}`, notification);
            return response.data;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    }

    public async deleteNotification(notificationId: string): Promise<void> {
        try {
            await this.apiService.delete(`/notifications/${notificationId}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
}