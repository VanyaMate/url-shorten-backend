import { Module, OnModuleInit } from '@nestjs/common';
import { PgModule } from '../../../services/pg/pg.module';
import { UrlShortenService } from './url-shorten.service';
import { UrlShortenController } from './url-shorten.controller';
import { UrlAnalyticsService } from './url-analytics.service';
import { UrlRedirectService } from './url-redirect.service';


@Module({
    imports    : [ PgModule ],
    providers  : [
        UrlShortenService,
        UrlAnalyticsService,
        UrlRedirectService,
    ],
    controllers: [ UrlShortenController ],
})
export class UrlShortenModule implements OnModuleInit {
    constructor (
        private readonly _service: UrlShortenService,
        private readonly _analyticsService: UrlAnalyticsService,
        private readonly _redirectService: UrlRedirectService,
    ) {
    }

    async onModuleInit () {
        await this._service.initialize();
        await this._analyticsService.initialize();
        await this._redirectService.initialize();
    }
}