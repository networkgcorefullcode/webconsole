import { DeviceGroup } from '../models/device-group.model';
import { DeviceGroupsService } from '../services/deviceGroups.service';

export class BaseManager<T> {
    protected service: DeviceGroupsService;

    constructor(service: DeviceGroupsService) {
        this.service = service;
    }

    async create(entity: T): Promise<T> {
        return await this.service.create(entity);
    }

    async read(id: number): Promise<T> {
        return await this.service.read(id);
    }

    async update(id: number, entity: T): Promise<T> {
        return await this.service.update(id, entity);
    }

    async delete(id: number): Promise<void> {
        return await this.service.delete(id);
    }

    async list(): Promise<T[]> {
        return await this.service.list();
    }
}