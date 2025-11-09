import { UpfInventoryService } from '../services/upfInventory.service';
import { Upf } from '../models/upf.model';

export class UpfInventoryManager {
    private upfInventoryService: UpfInventoryService;

    constructor() {
        this.upfInventoryService = new UpfInventoryService();
    }

    async createUpf(upf: Upf): Promise<Upf> {
        try {
            const createdUpf = await this.upfInventoryService.createUpf(upf);
            return createdUpf;
        } catch (error) {
            console.error('Error creating UPF:', error);
            throw error;
        }
    }

    async readUpf(id: string): Promise<Upf> {
        try {
            const upf = await this.upfInventoryService.getUpfById(id);
            return upf;
        } catch (error) {
            console.error('Error reading UPF:', error);
            throw error;
        }
    }

    async updateUpf(id: string, upf: Upf): Promise<Upf> {
        try {
            const updatedUpf = await this.upfInventoryService.updateUpf(id, upf);
            return updatedUpf;
        } catch (error) {
            console.error('Error updating UPF:', error);
            throw error;
        }
    }

    async deleteUpf(id: string): Promise<void> {
        try {
            await this.upfInventoryService.deleteUpf(id);
        } catch (error) {
            console.error('Error deleting UPF:', error);
            throw error;
        }
    }

    async listUpfs(): Promise<Upf[]> {
        try {
            const upfs = await this.upfInventoryService.getAllUpfs();
            return upfs;
        } catch (error) {
            console.error('Error listing UPFs:', error);
            throw error;
        }
    }
}