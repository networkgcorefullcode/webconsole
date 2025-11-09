export interface SliceSliceId {
    id: string; // Unique identifier for the slice
    name: string; // Name of the slice
    description?: string; // Optional description of the slice
    createdAt: Date; // Timestamp of when the slice was created
    updatedAt: Date; // Timestamp of when the slice was last updated
}