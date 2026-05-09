import { PrismaService } from '../prisma/prisma.service';
type CategoryNode = {
    id: string;
    name: string;
    slug: string;
    type: string;
    level: 'ROOT' | 'SUBTYPE' | 'CITY' | 'SUB';
    parentId: string | null;
    cityId: string | null;
};
type CityNode = {
    id: string;
    name: string;
    slug: string;
};
type ResolveResult = {
    kind: 'city';
    city: CityNode;
    canonicalPath: string;
} | {
    kind: 'category';
    city: CityNode | null;
    category: CategoryNode;
    chain: CategoryNode[];
    canonicalPath: string;
} | {
    kind: 'post';
    city: CityNode | null;
    category: CategoryNode | null;
    chain: CategoryNode[];
    post: any;
    canonicalPath: string;
} | {
    kind: 'not_found';
};
export declare class TaxonomyService {
    private prisma;
    constructor(prisma: PrismaService);
    resolve(slugs: string[]): Promise<ResolveResult>;
    private resolveModuleRoot;
    private resolveFlatCityVertical;
    private resolveReview;
    private resolveDestination;
    private loadCity;
    private loadPost;
}
export {};
