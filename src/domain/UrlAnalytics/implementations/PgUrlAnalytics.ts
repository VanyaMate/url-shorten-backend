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
                aliasId TEXT NOT NULL,
                count INT DEFAULT 0,
                CONSTRAINT fk_url FOREIGN KEY (aliasId) REFERENCES ${URL_SHORTEN_TABLE}(id) ON DELETE CASCADE
            )
        `);
    }

    async create (alias: string): Promise<void> {
        await this._postgreQueryBuilder.query(`
            INSERT INTO ${URL_ANALYTICS_TABLE} (aliasId) VALUES ($1)
        `, [ alias ]);
    }

    async getByAlias (alias: string): Promise<DomainUrlAnalytics> {
        const result = await this._postgreQueryBuilder.query<DomainUrlAnalytics>(`
            SELECT 
                a.count,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object('id', r.id, 'ip', r.ip, 'createdAt', r.createdAt)
                        ORDER BY r.createdAt DESC
                    ) FILTER (WHERE r.id IS NOT NULL), '[]'::jsonb
                ) AS last_redirects
            FROM ${URL_ANALYTICS_TABLE} a
            LEFT JOIN (
                SELECT * FROM ${URL_REDIRECT_TABLE}
                WHERE aliasId = $1
                ORDER BY createdAt DESC
                LIMIT 5
            ) r ON a.aliasId = r.aliasId
            WHERE a.aliasId = $1
            GROUP BY a.aliasId, a.count;
        `, [ alias ]);

        if (result[0]) {
            return result[0];
        }

        throw new Error(`Аналитика по URL отсутствует`);
    }

    async removeByAlias (alias: string): Promise<boolean> {
        const result = await this._postgreQueryBuilder.query(`
            DELETE FROM ${URL_ANALYTICS_TABLE} WHERE aliasId = $1
        `, [ alias ]);

        return !!result.length;
    }
}