import { Body, Controller, Get, Post } from '@nestjs/common';
import { UrlShortenService } from './url-shorten.service';
import { DomainUrlCreateData } from '@vanyamate/url-shorten';


@Controller('/api/v1/url-shorten')
export class UrlShortenController {
    constructor (private readonly _service: UrlShortenService) {
    }

    @Get()
    getAll () {
        return this._service.getAll();
    }

    @Post()
    create (
        @Body() createData: DomainUrlCreateData,
    ) {
        return this._service.create(createData);
    }
}