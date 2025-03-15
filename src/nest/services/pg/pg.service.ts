import {
    IPostgreSQLQueryBuilder,
} from '../../../domain/PostgreSQL/PostgreSQLQueryBuilder/PostgreSQLQueryBuilder.interface';
import {
    PostgreSQLQueryBuilder,
} from '../../../domain/PostgreSQL/PostgreSQLQueryBuilder/implementations/PostgreSQLQueryBuilder';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';


@Injectable()
export class PgService implements IPostgreSQLQueryBuilder {
    private _pgBuilder: IPostgreSQLQueryBuilder;

    constructor (private readonly _config: ConfigService) {
        this._pgBuilder = new PostgreSQLQueryBuilder({
            user    : this._config.get<string>('POSTGRES_USER'),
            password: this._config.get<string>('POSTGRES_PASSWORD'),
            host    : this._config.get<string>('POSTGRES_HOST'),
            port    : this._config.get<number>('POSTGRES_PORT'),
            database: this._config.get<string>('POSTGRES_DATABASE'),
        });
    }

    async connect (): Promise<void> {
        await this._pgBuilder.connect();
    }

    async disconnect (): Promise<void> {
        await this._pgBuilder.disconnect();
    }

    async query<ResponseType> (query: string, values?: Array<any>): Promise<Array<ResponseType>> {
        return this._pgBuilder.query(query, values);
    }
}