import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { UrlShortenService } from './url-shorten.service';
import { DomainUrlCreateData } from '@vanyamate/url-shorten';
import { UrlAnalyticsService } from './url-analytics.service';
import { Request } from 'express';
import { getAliasFromUrl } from '../../../../domain/utils/getAliasFromUrl';


const apiUrl = '/api/v1/url-shorten/';

@Controller(apiUrl)
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

    @Get('info/*')
    getInfo (
        @Req() req: Request,
    ) {
        return this._shortenService.getInfoByAlias(getAliasFromUrl(req.url.split('/info/')[1]));
    }

    @Get('analytics/*')
    getAnalytics (
        @Req() req: Request,
    ) {
        return this._analyticsService.getByAlias(getAliasFromUrl(req.url.split('/analytics/')[1]));
    }

    @Post()
    create (
        @Body() createData: DomainUrlCreateData,
    ) {
        return this._shortenService.create(createData);
    }

    @Delete('*')
    removeByAlias (
        @Req() req: Request,
    ) {
        return this._shortenService.removeByAlias(getAliasFromUrl(req.url.split(apiUrl)[1]));
    }
}