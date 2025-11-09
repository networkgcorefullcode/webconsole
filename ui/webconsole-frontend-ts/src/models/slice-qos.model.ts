export interface SliceQoS {
    id: number;
    sliceId: string;
    priorityLevel: number;
    guaranteedBitRate: number;
    maximumBitRate: number;
    latency: number;
    packetLossRate: number;
    description?: string;
}