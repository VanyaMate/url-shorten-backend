import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PgService } from './pg.service';
import { ConfigModule } from '@nestjs/config';


@Module({
    providers: [ PgService ],
    exports  : [ PgService ],
    imports  : [ ConfigModule ],
})
export class PgModule implements OnModuleInit, OnModuleDestroy {
    constructor (private readonly _pgBuilder: PgService) {
    }

    async onModuleInit () {
        await this._pgBuilder.connect();
    }

    async onModuleDestroy () {
        await this._pgBuilder.disconnect();
    }
}