export interface SliceSiteInfo {
    id: number;
    name: string;
    description?: string;
    gNodeBId: number;
    plmnId: string;
    sliceId: string;
    createdAt: Date;
    updatedAt: Date;
}