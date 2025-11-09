export class UiManager {
    private modalManager: ModalManager;
    private notificationsManager: NotificationsManager;

    constructor() {
        this.modalManager = new ModalManager();
        this.notificationsManager = new NotificationsManager();
    }

    public openModal(modalId: string): void {
        this.modalManager.open(modalId);
    }

    public closeModal(modalId: string): void {
        this.modalManager.close(modalId);
    }

    public showNotification(message: string, type: 'success' | 'error'): void {
        this.notificationsManager.show(message, type);
    }

    public handleApiError(error: any): void {
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
        this.showNotification(errorMessage, 'error');
    }

    // Additional UI management methods can be added here
}