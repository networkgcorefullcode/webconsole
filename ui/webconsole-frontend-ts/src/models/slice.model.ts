export interface Slice {
    id: number;
    name: string;
    description?: string;
    qos?: string;
    apnAmbr?: string;
    applications?: string[];
    siteInfo?: {
        gNodeBId?: string;
        plmnId?: string;
    };
}