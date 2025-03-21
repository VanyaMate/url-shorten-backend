import { Module } from '@nestjs/common';
import { PgModule } from './nest/services/pg/pg.module';
import { UrlShortenModule } from './nest/api/v1/url-shorten/url-shorten.module';
import { ConfigModule } from '@nestjs/config';
import { RedirectModule } from './nest/redirect.module';


@Module({
    imports    : [
        PgModule,
        UrlShortenModule,
        RedirectModule,
        ConfigModule.forRoot({
            isGlobal   : true,
            envFilePath: '.env',
        }),
    ],
    controllers: [],
    providers  : [],
})
export class AppModule {
}
