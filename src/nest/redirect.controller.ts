import { Controller, Get, Ip, Param, Res } from '@nestjs/common';
import { UrlRedirectService } from './api/v1/url-shorten/url-redirect.service';
import { UrlShortenService } from './api/v1/url-shorten/url-shorten.service';
import { Response } from 'express';


@Controller()
export class RedirectController {
    constructor (
        private readonly _redirectService: UrlRedirectService,
        private readonly _shortenService: UrlShortenService,
    ) {
    }

    @Get(':alias')
    async redirectTo (
        @Param('alias') alias: string,
        @Ip() ip: string,
        @Res() res: Response,
    ) {
        return await this._shortenService.getOriginalUrlByAlias(alias)
            .then((url) => {
                this._redirectService.create(alias, ip);
                res.redirect(url);
            })
            .catch((err) => {
                res.status(404);
                res.send((err as Error).message);
            });
    }
}