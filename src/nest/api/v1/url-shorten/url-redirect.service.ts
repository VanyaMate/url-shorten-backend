import { Injectable } from '@nestjs/common';
import {
    IUrlRedirect,
} from '../../../../domain/UrlRedirect/UrlRedirect.interface';
import { DomainRedirect } from '@vanyamate/url-shorten';
import {
    IPostgreSQLQueryBuilder,
} from '../../../../domain/PostgreSQL/PostgreSQLQueryBuilder/PostgreSQLQueryBuilder.interface';
import {
    PgUrlRedirect,
} from '../../../../domain/UrlRedirect/implementations/PgUrlRedirect';
import { getAliasFromUrl } from '../../../../domain/utils/getAliasFromUrl';
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

    create (url: string, ip: string): Promise<DomainRedirect> {
        return this._service.create(getAliasFromUrl(url), ip);
    }

    removeAllByAlias (url: string): Promise<boolean> {
        return this._service.removeAllByAlias(getAliasFromUrl(url));
    }
}