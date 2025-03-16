import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    IUrlShorten,
} from '../../../../domain/UrlShorten/UrlShorten.interface';
import { PgService } from '../../../services/pg/pg.service';
import {
    PgUrlShorten,
} from '../../../../domain/UrlShorten/implementations/PgUrlShorten';
import {
    DomainUrlCreateData,
    DomainUrl,
    DomainUrlInfo,
} from '@vanyamate/url-shorten';
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
        try {
            const domainUrl = await this._service.create(createData);
            this._analyticsService.create(domainUrl.id);
            return domainUrl;
        } catch (error: unknown) {
            throw new BadRequestException(`Ошибка создания ссылки. ${ (error as Error).message }`);
        }
    }

    async getAll (): Promise<Array<DomainUrl>> {
        return this._service.getAll();
    }

    async getInfoByAlias (alias: string): Promise<DomainUrlInfo> {
        try {
            return await this._service.getInfoByAlias(alias);
        } catch (error: unknown) {
            throw new NotFoundException(`Ошибка получения информации о ссылке. ${ (error as Error).message }`);
        }
    }

    async getByAlias (alias: string): Promise<DomainUrl> {
        try {
            return await this._service.getByAlias(alias);
        } catch (error: unknown) {
            throw new NotFoundException(`Ошибка получения информации о ссылке. ${ (error as Error).message }`);
        }
    }

    async getOriginalUrlByAlias (alias: string): Promise<string> {
        try {
            return await this._service.getOriginalUrlByAlias(alias);
        } catch (error: unknown) {
            throw new NotFoundException(`Ошибка получения оригинальной ссылки. ${ (error as Error).message }`);
        }
    }

    async removeByAlias (alias: string): Promise<boolean> {
        try {
            return await this._service.removeByAlias(alias);
        } catch (error: unknown) {
            throw new BadRequestException(`Ошибка удаления ссылки. ${ (error as Error).message }`);
        }
    }
}