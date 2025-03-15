export interface IPostgreSQLQueryBuilder {
    connect (): Promise<void>;

    disconnect (): Promise<void>;

    query<ResponseType> (query: string, values?: Array<any>): Promise<Array<ResponseType>>;
}