export interface ApplicationFilteringRules {
    id: number;
    name: string;
    description: string;
    criteria: string;
    action: 'allow' | 'deny';
    createdAt: Date;
    updatedAt: Date;
}