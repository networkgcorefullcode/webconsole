export interface SliceSiteInfoPlmn {
    plmnId: string; // PLMN Identifier
    sliceId: string; // Slice Identifier
    sliceName: string; // Name of the slice
    description?: string; // Optional description of the slice
    status: 'active' | 'inactive'; // Status of the slice
    createdAt: Date; // Creation date of the slice
    updatedAt: Date; // Last updated date of the slice
}