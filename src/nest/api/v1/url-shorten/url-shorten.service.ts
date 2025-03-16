import { Injectable } from '@nestjs/common';
import {
    IUrlShorten,
} from '../../../../domain/UrlShorten/UrlShorten.interface';
import { PgService } from '../../../services/pg/pg.service';
import {
    PgUrlShorten,
} from '../../../../domain/UrlShorten/implementations/PgUrlShorten';
import { DomainUrlCreateData, DomainUrl } from '@vanyamate/url-shorten';
import { getAliasFromUrl } from '../../../../domain/utils/getAliasFromUrl';
import { UrlAnalyticsService } from './url-analytics.service';


@Injectable()
export class UrlShortenService implements IUrlShorten {
    private readonly _service: IUrlShorten;

    constructor (
        private readonly _pgBuilder: PgService,
        private readonly _analyticsService: UrlAnalyticsService,
    ) {
        this._service = new PgUrlShorten(this._pgBuilder);
    }

    async initialize (): Promise<void> {
        return this._service.initialize();
    }

    async create (createData: DomainUrlCreateData): Promise<DomainUrl> {
        const domainUrl = await this._service.create(createData);
        this._analyticsService.create(domainUrl.id);
        return domainUrl;
    }

    async getAll (): Promise<Array<DomainUrl>> {
        return this._service.getAll();
    }

    async getByAlias (url: string): Promise<DomainUrl> {
        try {
            return await this._service.getByAlias(getAliasFromUrl(url));
        } catch (error: unknown) {
            throw new Error(`Ошибка получения информации о ссылке. ${ JSON.stringify(error) }`);
        }
    }

    async getOriginalUrlByAlias (url: string): Promise<string> {
        try {
            return await this._service.getOriginalUrlByAlias(getAliasFromUrl(url));
        } catch (error: unknown) {
            throw new Error(`Ошибка получения оригинальной ссылки. ${ JSON.stringify(error) }`);
        }
    }

    async removeByAlias (url: string): Promise<boolean> {
        try {
            return await this._service.removeByAlias(getAliasFromUrl(url));
        } catch (error: unknown) {
            throw new Error(`Ошибка удаления ссылки. ${ JSON.stringify(error) }`);
        }
    }
}