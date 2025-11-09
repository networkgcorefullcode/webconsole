import { GnbInventoryService } from '../services/gnbInventory.service';
import { Inventory } from '../models/inventory.model';

export class GnbInventoryManager {
    private gnbInventoryService: GnbInventoryService;

    constructor() {
        this.gnbInventoryService = new GnbInventoryService();
    }

    async createGnbInventory(item: Inventory): Promise<Inventory> {
        try {
            const response = await this.gnbInventoryService.create(item);
            return response.data;
        } catch (error) {
            console.error('Error creating gNodeB inventory:', error);
            throw error;
        }
    }

    async readGnbInventory(id: string): Promise<Inventory> {
        try {
            const response = await this.gnbInventoryService.read(id);
            return response.data;
        } catch (error) {
            console.error('Error reading gNodeB inventory:', error);
            throw error;
        }
    }

    async updateGnbInventory(id: string, item: Inventory): Promise<Inventory> {
        try {
            const response = await this.gnbInventoryService.update(id, item);
            return response.data;
        } catch (error) {
            console.error('Error updating gNodeB inventory:', error);
            throw error;
        }
    }

    async deleteGnbInventory(id: string): Promise<void> {
        try {
            await this.gnbInventoryService.delete(id);
        } catch (error) {
            console.error('Error deleting gNodeB inventory:', error);
            throw error;
        }
    }

    async listGnbInventory(): Promise<Inventory[]> {
        try {
            const response = await this.gnbInventoryService.list();
            return response.data;
        } catch (error) {
            console.error('Error listing gNodeB inventory:', error);
            throw error;
        }
    }
}