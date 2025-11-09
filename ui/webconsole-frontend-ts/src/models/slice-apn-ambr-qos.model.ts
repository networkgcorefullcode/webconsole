export interface SliceApnAmbrQoS {
    maxBitRate: number; // Maximum bit rate for the APN
    guaranteedBitRate: number; // Guaranteed bit rate for the APN
    priorityLevel: number; // Priority level for the APN
    preemptionCapability: boolean; // Indicates if preemption is allowed
    preemptionVulnerability: boolean; // Indicates if the APN is vulnerable to preemption
}