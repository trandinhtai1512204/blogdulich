import { PrismaService } from '../prisma/prisma.service';
type ResolveResult = {
    kind: 'city';
    city: {
        id: string;
        name: string;
        slug: string;
    };
} | {
    kind: 'category';
    city?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    category: any;
    chain: any[];
} | {
    kind: 'post';
    city?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    category?: any | null;
    chain: any[];
    post: any;
} | {
    kind: 'not_found';
};
export declare class TaxonomyService {
    private prisma;
    constructor(prisma: PrismaService);
    resolve(slugs: string[]): Promise<ResolveResult>;
}
export {};
