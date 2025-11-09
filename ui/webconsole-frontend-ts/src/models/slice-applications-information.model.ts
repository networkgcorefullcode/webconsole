export interface SliceApplicationsInformation {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    applications: Array<{
        appId: number;
        appName: string;
        appVersion: string;
        appStatus: string;
    }>;
}