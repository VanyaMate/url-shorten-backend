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
                alias_id TEXT NOT NULL,
                ip TEXT NOT NULL,
                created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::BIGINT,
                CONSTRAINT fk_url FOREIGN KEY (alias_id) REFERENCES ${URL_SHORTEN_TABLE}(id) ON DELETE CASCADE
            )
        `);
    }

    async create (alias: string, ip: string): Promise<DomainRedirect> {
        const result = await this._postgreQueryBuilder.query<{
            id: number,
            alias_id: string,
            ip: string,
            created_at: number
        }>(`
            INSERT INTO ${URL_REDIRECT_TABLE} (alias_id, ip) 
            VALUES ($1, $2) 
            RETURNING *
        `, [ alias, ip ]);

        const createdRedirect = result[0];

        return {
            id          : createdRedirect.id.toString(),
            ip          : createdRedirect.ip,
            redirectTime: createdRedirect.created_at,
        };
    }

    async removeAllByAlias (alias: string): Promise<boolean> {
        const result = await this._postgreQueryBuilder.query(`
            DELETE FROM ${URL_REDIRECT_TABLE} WHERE id = $1
        `, [ alias ]);

        return !!result.length;
    }
}