import { DomainUrlAnalytics } from '@vanyamate/url-shorten';


export interface IUrlAnalytics {
    initialize (): Promise<void>;

    create (alias: string): Promise<void>;

    getByAlias (alias: string): Promise<DomainUrlAnalytics>;

    removeByAlias (alias: string): Promise<boolean>;
}