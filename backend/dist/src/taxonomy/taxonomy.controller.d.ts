import { TaxonomyService } from './taxonomy.service';
export declare class TaxonomyController {
    private taxonomy;
    constructor(taxonomy: TaxonomyService);
    resolve(path: string): Promise<{
        kind: "city";
        city: {
            id: string;
            name: string;
            slug: string;
        };
    } | {
        kind: "category";
        city?: {
            id: string;
            name: string;
            slug: string;
        } | null;
        category: any;
        chain: any[];
    } | {
        kind: "post";
        city?: {
            id: string;
            name: string;
            slug: string;
        } | null;
        category?: any | null;
        chain: any[];
        post: any;
    } | {
        kind: "not_found";
    }>;
}
