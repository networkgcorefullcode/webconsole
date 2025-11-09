export interface ConfigMsg {
    id: number;
    message: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error';
}