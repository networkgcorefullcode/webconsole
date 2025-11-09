export interface DeviceGroupsIpDomainExpandedUeDnnQos {
    id: number;
    name: string;
    ipDomain: string;
    dnn: string;
    qos: {
        priorityLevel: number;
        guaranteedBitRate: number;
        maximumBitRate: number;
    };
    description?: string;
}