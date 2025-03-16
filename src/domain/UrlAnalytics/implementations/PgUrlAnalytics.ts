import { IUrlAnalytics } from '../UrlAnalytics.interface';
import {
    URL_ANALYTICS_TABLE, URL_REDIRECT_TABLE, URL_SHORTEN_TABLE,
} from '../../const/tableNames';
import {
    IPostgreSQLQueryBuilder,
} from '../../PostgreSQL/PostgreSQLQueryBuilder/PostgreSQLQueryBuilder.interface';
import { DomainUrlAnalytics } from '@vanyamate/url-shorten';


export class PgUrlAnalytics implements IUrlAnalytics {
    constructor (private readonly _postgreQueryBuilder: IPostgreSQLQueryBuilder) {
    }

    async initialize (): Promise<void> {
        await this._postgreQueryBuilder.query(`
            CREATE TABLE IF NOT EXISTS ${URL_ANALYTICS_TABLE} (
                id SERIAL PRIMARY KEY,
                alias_id TEXT NOT NULL UNIQUE,
                count INT DEFAULT 0,
                CONSTRAINT fk_url FOREIGN KEY (alias_id) REFERENCES ${URL_SHORTEN_TABLE}(id) ON DELETE CASCADE
            )
        `);
    }

    async create (alias: string): Promise<void> {
        await this._postgreQueryBuilder.query(`
            INSERT INTO ${URL_ANALYTICS_TABLE} (alias_id) VALUES ($1)
        `, [ alias ]);
    }

    async getByAlias (alias: string): Promise<DomainUrlAnalytics> {
        const result = await this._postgreQueryBuilder.query<{
            count: number,
            last_redirects: Array<{
                id: string,
                ip: string,
                createdAt: number
            }>
        }>(`
            SELECT 
                a.count,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object('id', r.id, 'ip', r.ip, 'createdAt', r.created_at)
                        ORDER BY r.created_at DESC
                    ) FILTER (WHERE r.id IS NOT NULL), '[]'::jsonb
                ) AS last_redirects
            FROM ${URL_ANALYTICS_TABLE} a
            LEFT JOIN (
                SELECT * FROM ${URL_REDIRECT_TABLE}
                WHERE alias_id = $1
                ORDER BY created_at DESC
                LIMIT 5
            ) r ON a.alias_id = r.alias_id
            WHERE a.alias_id = $1
            GROUP BY a.alias_id, a.count;
        `, [ alias ]);

        const resultItem = result[0];

        if (resultItem) {
            return {
                count        : resultItem.count,
                lastRedirects: resultItem.last_redirects.map((redirect) => ({
                    ip          : redirect.ip,
                    redirectTime: redirect.createdAt,
                })),
            };
        }

        throw new Error(`Аналитика по URL отсутствует`);
    }

    async removeByAlias (alias: string): Promise<boolean> {
        const result = await this._postgreQueryBuilder.query(`
            DELETE FROM ${URL_ANALYTICS_TABLE} WHERE alias_id = $1
        `, [ alias ]);

        return !!result.length;
    }
}