import { IPostgreSQLQueryBuilder } from '../PostgreSQLQueryBuilder.interface';
import { Client, ClientConfig } from 'pg';


export class PostgreSQLQueryBuilder implements IPostgreSQLQueryBuilder {
    private readonly _client: Client | null;

    constructor (private readonly _config: ClientConfig | string) {
        this._client = new Client(this._config);
    }

    async connect () {
        await this._client.connect();
    }

    async disconnect () {
        await this._client.end();
    }

    async query<ResponseType> (query: string, values?: Array<any>): Promise<Array<ResponseType>> {
        if (this._client !== null) {
            return this._client.query<ResponseType>(query, values).then((response) => response.rows);
        }

        throw new Error('Вы не подключены к базе данных');
    }
}