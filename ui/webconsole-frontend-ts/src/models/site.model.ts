export interface Site {
    id: number;
    name: string;
    location: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}