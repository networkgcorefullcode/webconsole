export interface TrafficClass {
    id: number;
    name: string;
    description?: string;
    priority: number;
    qosParameters: {
        guaranteedBitRate: number;
        maximumBitRate: number;
        latency: number;
        packetLossRate: number;
    };
}