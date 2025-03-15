import { DomainRedirect } from '@vanyamate/url-shorten';


export interface IUrlRedirect {
    initialize (): Promise<void>;

    create (alias: string, ip: string): Promise<DomainRedirect>;

    removeAllByAlias (alias: string): Promise<boolean>;
}