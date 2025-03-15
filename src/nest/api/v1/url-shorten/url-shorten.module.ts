import { Module, OnModuleInit } from '@nestjs/common';
import { PgModule } from '../../../services/pg/pg.module';
import { UrlShortenService } from './url-shorten.service';
import { UrlShortenController } from './url-shorten.controller';


@Module({
    imports    : [ PgModule ],
    providers  : [ UrlShortenService ],
    controllers: [ UrlShortenController ],
})
export class UrlShortenModule implements OnModuleInit {
    constructor (private readonly _service: UrlShortenService) {
    }

    async onModuleInit () {
        await this._service.initialize();
    }
}