import { Injectable } from '@nestjs/common';
import {
    IUrlRedirect,
} from '../../../../domain/UrlRedirect/UrlRedirect.interface';
import { DomainRedirect } from '@vanyamate/url-shorten';
import {
    PgUrlRedirect,
} from '../../../../domain/UrlRedirect/implementations/PgUrlRedirect';
import { PgService } from '../../../services/pg/pg.service';


@Injectable()
export class UrlRedirectService implements IUrlRedirect {
    private readonly _service: IUrlRedirect;

    constructor (private readonly _pgBuilder: PgService) {
        this._service = new PgUrlRedirect(this._pgBuilder);
    }

    initialize (): Promise<void> {
        return this._service.initialize();
    }

    create (alias: string, ip: string): Promise<DomainRedirect> {
        return this._service.create(alias, ip);
    }

    removeAllByAlias (alias: string): Promise<boolean> {
        return this._service.removeAllByAlias(alias);
    }
}