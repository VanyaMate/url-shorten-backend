import { Injectable } from '@nestjs/common';
import {
    IUrlAnalytics,
} from '../../../../domain/UrlAnalytics/UrlAnalytics.interface';
import { DomainUrlAnalytics } from '@vanyamate/url-shorten';
import { PgService } from '../../../services/pg/pg.service';
import {
    PgUrlAnalytics,
} from '../../../../domain/UrlAnalytics/implementations/PgUrlAnalytics';


@Injectable()
export class UrlAnalyticsService implements IUrlAnalytics {
    private readonly _service: IUrlAnalytics;

    constructor (private readonly _pgBuilder: PgService) {
        this._service = new PgUrlAnalytics(this._pgBuilder);
    }

    initialize (): Promise<void> {
        return this._service.initialize();
    }

    create (alias: string): Promise<void> {
        return this._service.create(alias);
    }

    async getByAlias (alias: string): Promise<DomainUrlAnalytics> {
        try {
            return await this._service.getByAlias(alias);
        } catch (error: unknown) {
            throw new Error(`Ошибка получения аналитики по ссылке. ${ (error as Error).message }`);
        }
    }

    removeByAlias (alias: string): Promise<boolean> {
        return this._service.removeByAlias(alias);
    }
}