import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UrlShortenService } from './url-shorten.service';
import { DomainUrlCreateData } from '@vanyamate/url-shorten';
import { UrlAnalyticsService } from './url-analytics.service';
import { Request } from 'express';


@Controller('/api/v1/url-shorten')
export class UrlShortenController {
    constructor (
        private readonly _shortenService: UrlShortenService,
        private readonly _analyticsService: UrlAnalyticsService,
    ) {
    }

    @Get()
    getAll () {
        return this._shortenService.getAll();
    }

    @Get('/info/*')
    getAnalytics (
        @Req() req: Request,
    ) {
        console.log(req.url);
        console.log(req.url.split('/info/')[1]);
        return this._analyticsService.getByAlias(req.url.split('/info/')[1]);
    }

    @Post()
    create (
        @Body() createData: DomainUrlCreateData,
    ) {
        return this._shortenService.create(createData);
    }
}