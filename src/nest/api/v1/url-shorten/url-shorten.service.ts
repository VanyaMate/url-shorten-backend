import { Injectable } from '@nestjs/common';
import {
    IUrlShorten,
} from '../../../../domain/UrlShorten/UrlShorten.interface';
import { PgService } from '../../../services/pg/pg.service';
import {
    PgUrlShorten,
} from '../../../../domain/UrlShorten/implementations/PgUrlShorten';
import { DomainUrlCreateData, DomainUrl } from '@vanyamate/url-shorten';


@Injectable()
export class UrlShortenService implements IUrlShorten {
    private readonly _service: IUrlShorten;

    constructor (private readonly _pgBuilder: PgService) {
        this._service = new PgUrlShorten(this._pgBuilder);
    }

    async initialize (): Promise<void> {
        return this._service.initialize();
    }

    async create (createData: DomainUrlCreateData): Promise<DomainUrl> {
        return this._service.create(createData);
    }

    async getAll (): Promise<Array<DomainUrl>> {
        return this._service.getAll();
    }

    async getByAlias (alias: string): Promise<DomainUrl> {
        return this._service.getByAlias(alias);
    }

    async getOriginalUrlByAlias (alias: string): Promise<string> {
        return this._service.getOriginalUrlByAlias(alias);
    }

    async removeByAlias (alias: string): Promise<boolean> {
        return this._service.removeByAlias(alias);
    }
}