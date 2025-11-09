export interface NetworkSlice {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}