export type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};

export interface CrudOperations<T> {
    create(item: T): Promise<ApiResponse<T>>;
    read(id: string): Promise<ApiResponse<T>>;
    update(id: string, item: T): Promise<ApiResponse<T>>;
    delete(id: string): Promise<ApiResponse<void>>;
}