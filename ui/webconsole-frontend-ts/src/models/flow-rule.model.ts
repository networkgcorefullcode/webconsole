export interface FlowRule {
    id: number;
    name: string;
    description: string;
    sourceIp: string;
    destinationIp: string;
    protocol: string;
    action: 'allow' | 'deny';
    createdAt: Date;
    updatedAt: Date;
}