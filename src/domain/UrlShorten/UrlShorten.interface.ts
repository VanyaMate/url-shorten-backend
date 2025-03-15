import { DomainUrl, DomainUrlCreateData } from '@vanyamate/url-shorten';


export interface IUrlShorten {
    initialize (): Promise<void>;

    create (createData: DomainUrlCreateData): Promise<DomainUrl>;

    getAll (): Promise<Array<DomainUrl>>;

    getByAlias (alias: string): Promise<DomainUrl>;

    getOriginalUrlByAlias (alias: string): Promise<string>;

    removeByAlias (alias: string): Promise<boolean>;
}