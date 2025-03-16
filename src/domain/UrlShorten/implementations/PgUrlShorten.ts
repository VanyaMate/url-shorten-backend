import { IUrlShorten } from '../UrlShorten.interface';
import {
    IPostgreSQLQueryBuilder,
} from '../../PostgreSQL/PostgreSQLQueryBuilder/PostgreSQLQueryBuilder.interface';
import {
    DomainUrlCreateData,
    DomainUrl,
    DomainUrlInfo,
} from '@vanyamate/url-shorten';
import { URL_ANALYTICS_TABLE, URL_SHORTEN_TABLE } from '../../const/tableNames';


type PgUrlResponse = {
    id: string,
    original_url: string,
    expires_at: string,
    created_at: string
};

export class PgUrlShorten implements IUrlShorten {
    constructor (private readonly _postgreQueryBuilder: IPostgreSQLQueryBuilder) {
    }

    async initialize (): Promise<void> {
        await this._postgreQueryBuilder.query(`
            CREATE TABLE IF NOT EXISTS ${URL_SHORTEN_TABLE} (
                id TEXT PRIMARY KEY,
                original_url TEXT NOT NULL,
                expires_at BIGINT DEFAULT 0,
                created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::BIGINT
            )
        `);
    }

    async create (createData: DomainUrlCreateData): Promise<DomainUrl> {
        if (createData.alias.length > 20) {
            throw new Error('Максимальная длина алиаса 20 символов');
        }

        try {
            const safeAlias     = createData.alias
                                  ? createData.alias
                                  : Math.random().toString(16).split('.')[1];
            const safeExpiresAt = createData.expiresAt ?? 0;

            const result = await this._postgreQueryBuilder.query<PgUrlResponse>(`
                INSERT INTO ${URL_SHORTEN_TABLE} (id, original_url, expires_at) 
                VALUES ($1, $2, $3)
                RETURNING *
            `, [
                safeAlias, createData.originalUrl, safeExpiresAt,
            ]);

            const createdItem = result[0];

            return {
                id         : createdItem.id,
                createdAt  : +createdItem.created_at,
                expiresAt  : +createdItem.expires_at,
                originalUrl: createdItem.original_url,
            };
        } catch (e) {
            throw new Error('Ссылка с таким алиасом уже существует');
        }
    }

    async getAll (): Promise<Array<DomainUrl>> {
        return this._postgreQueryBuilder.query<PgUrlResponse>(`
            SELECT * FROM ${URL_SHORTEN_TABLE}
        `, [])
            .then((response) => response.map((url) => ({
                id         : url.id,
                createdAt  : +url.created_at,
                expiresAt  : +url.expires_at,
                originalUrl: url.original_url,
            })));
    }

    async getInfoByAlias (alias: string): Promise<DomainUrlInfo> {
        const result = await this._postgreQueryBuilder.query<{
            original_url: string,
            created_at: number,
            count: number
        }>(`
            SELECT 
                a.original_url,
                a.created_at,
                COALESCE(r.count, 0) AS count
            FROM ${URL_SHORTEN_TABLE} a
            LEFT JOIN ${URL_ANALYTICS_TABLE} r 
                ON a.id = r.alias_id
            WHERE a.id = $1
            GROUP BY a.original_url, a.created_at, r.count;
        `, [ alias ]);

        const createdItem = result[0];

        if (createdItem) {
            return {
                createdAt  : +createdItem.created_at,
                clickCount : +createdItem.count,
                originalUrl: createdItem.original_url,
            };
        }

        throw new Error(`URL не существует`);
    }

    async getByAlias (alias: string): Promise<DomainUrl> {
        const result = await this._postgreQueryBuilder.query<PgUrlResponse>(`
            SELECT * FROM ${URL_SHORTEN_TABLE} WHERE id = $1
        `, [ alias ]);

        const createdItem = result[0];

        if (createdItem) {
            return {
                id         : createdItem.id,
                createdAt  : +createdItem.created_at,
                expiresAt  : +createdItem.expires_at,
                originalUrl: createdItem.original_url,
            };
        }

        throw new Error(`URL не существует`);
    }

    async getOriginalUrlByAlias (alias: string): Promise<string> {
        const result = await this._postgreQueryBuilder.query<{
            original_url: string,
            expires_at: number
        }>(`
            SELECT id, original_url, expires_at
            FROM ${URL_SHORTEN_TABLE} 
            WHERE id = $1
        `, [ alias ]);

        if (result[0]) {
            const expiresAt = Number(result[0].expires_at);

            if (expiresAt === 0 || expiresAt > Date.now()) {
                return result[0].original_url;
            }

            throw new Error(`Срок давности URL истек`);
        }

        throw new Error(`URL не существует`);
    }

    async removeByAlias (alias: string): Promise<boolean> {
        const result = await this._postgreQueryBuilder.query(`
            DELETE FROM ${URL_SHORTEN_TABLE} WHERE id = $1
        `, [ alias ]);
        return !!result[0];
    }
}