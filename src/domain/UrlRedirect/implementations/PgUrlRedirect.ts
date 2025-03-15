import { IUrlRedirect } from '../UrlRedirect.interface';
import { URL_REDIRECT_TABLE, URL_SHORTEN_TABLE } from '../../const/tableNames';
import {
    IPostgreSQLQueryBuilder,
} from '../../PostgreSQL/PostgreSQLQueryBuilder/PostgreSQLQueryBuilder.interface';
import { DomainRedirect } from '@vanyamate/url-shorten';


export class PgUrlRedirect implements IUrlRedirect {
    constructor (private readonly _postgreQueryBuilder: IPostgreSQLQueryBuilder) {
    }

    async initialize (): Promise<void> {
        await this._postgreQueryBuilder.query(`
            CREATE TABLE IF NOT EXISTS ${URL_REDIRECT_TABLE} (
                id SERIAL PRIMARY KEY,
                aliasId TEXT NOT NULL,
                ip TEXT NOT NULL,
                createdAt BIGINT DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::BIGINT,
                CONSTRAINT fk_url FOREIGN KEY (aliasId) REFERENCES ${URL_SHORTEN_TABLE}(id) ON DELETE CASCADE
            )
        `);
    }

    async create (alias: string, ip: string): Promise<DomainRedirect> {
        const result = await this._postgreQueryBuilder.query<{
            id: number,
            aliasId: string,
            ip: string,
            createdAt: number
        }>(`
            INSERT INTO ${URL_REDIRECT_TABLE} (aliasId, ip) 
            VALUES ($1, $2) 
            RETURNING *
        `, [ alias, ip ]);

        const createdRedirect = result[0];

        return {
            id          : createdRedirect.id.toString(),
            ip          : createdRedirect.ip,
            redirectTime: createdRedirect.createdAt,
        };
    }

    async removeAllByAlias (alias: string): Promise<boolean> {
        const result = await this._postgreQueryBuilder.query(`
            DELETE FROM ${URL_REDIRECT_TABLE} WHERE id = $1
        `, [ alias ]);

        return !!result.length;
    }
}