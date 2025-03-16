import { Module } from '@nestjs/common';
import { UrlShortenModule } from './api/v1/url-shorten/url-shorten.module';
import { RedirectController } from './redirect.controller';


@Module({
    imports    : [ UrlShortenModule ],
    controllers: [ RedirectController ],
})
export class RedirectModule {
}