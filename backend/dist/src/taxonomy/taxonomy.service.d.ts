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
    private resolveNestedCityVertical;
    private resolveReview;
    private resolveCityMixedNode;
    private resolveDestination;
    resolvePage(slugs: string[]): Promise<{
        resolved: {
            kind: "post";
            city: CityNode | null;
            category: CategoryNode | null;
            chain: CategoryNode[];
            post: any;
            canonicalPath: string;
        } | {
            kind: "not_found";
        };
        children: never[];
        cityPills: never[];
        posts: never[];
    } | {
        resolved: {
            kind: "city";
            city: CityNode;
            canonicalPath: string;
        };
        children: {
            id: string;
            name: string;
            slug: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        }[];
        cityPills: never[];
        posts: {
            canonicalUrl: string;
            category: {
                id: string;
                name: string;
                slug: string;
                cityId: string | null;
                parentId: string | null;
                type: import(".prisma/client").$Enums.CategoryType;
                level: import(".prisma/client").$Enums.CategoryLevel;
                parent: {
                    id: string;
                    name: string;
                    slug: string;
                    cityId: string | null;
                    parentId: string | null;
                    type: import(".prisma/client").$Enums.CategoryType;
                    level: import(".prisma/client").$Enums.CategoryLevel;
                    parent: {
                        id: string;
                        name: string;
                        slug: string;
                        cityId: string | null;
                        parentId: string | null;
                        type: import(".prisma/client").$Enums.CategoryType;
                        level: import(".prisma/client").$Enums.CategoryLevel;
                        parent: {
                            id: string;
                            name: string;
                            slug: string;
                            cityId: string | null;
                            parentId: string | null;
                            type: import(".prisma/client").$Enums.CategoryType;
                            level: import(".prisma/client").$Enums.CategoryLevel;
                        } | null;
                    } | null;
                } | null;
            } | null;
            id: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            title: string;
            excerpt: string | null;
            thumbnail: string | null;
            categoryId: string | null;
        }[];
    } | {
        resolved: {
            kind: "category";
            city: CityNode | null;
            category: CategoryNode;
            chain: CategoryNode[];
            canonicalPath: string;
        };
        children: never[];
        cityPills: {
            id: string;
            name: string;
            slug: string;
        }[];
        posts: {
            canonicalUrl: string;
            category: {
                id: string;
                name: string;
                slug: string;
                cityId: string | null;
                parentId: string | null;
                type: import(".prisma/client").$Enums.CategoryType;
                level: import(".prisma/client").$Enums.CategoryLevel;
                parent: {
                    id: string;
                    name: string;
                    slug: string;
                    cityId: string | null;
                    parentId: string | null;
                    type: import(".prisma/client").$Enums.CategoryType;
                    level: import(".prisma/client").$Enums.CategoryLevel;
                    parent: {
                        id: string;
                        name: string;
                        slug: string;
                        cityId: string | null;
                        parentId: string | null;
                        type: import(".prisma/client").$Enums.CategoryType;
                        level: import(".prisma/client").$Enums.CategoryLevel;
                        parent: {
                            id: string;
                            name: string;
                            slug: string;
                            cityId: string | null;
                            parentId: string | null;
                            type: import(".prisma/client").$Enums.CategoryType;
                            level: import(".prisma/client").$Enums.CategoryLevel;
                        } | null;
                    } | null;
                } | null;
            } | null;
            id: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            title: string;
            excerpt: string | null;
            thumbnail: string | null;
            categoryId: string | null;
        }[];
    } | {
        resolved: {
            kind: "category";
            city: CityNode | null;
            category: CategoryNode;
            chain: CategoryNode[];
            canonicalPath: string;
        };
        children: {
            id: string;
            name: string;
            slug: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        }[];
        cityPills: never[];
        posts: {
            canonicalUrl: string;
            category: {
                id: string;
                name: string;
                slug: string;
                cityId: string | null;
                parentId: string | null;
                type: import(".prisma/client").$Enums.CategoryType;
                level: import(".prisma/client").$Enums.CategoryLevel;
                parent: {
                    id: string;
                    name: string;
                    slug: string;
                    cityId: string | null;
                    parentId: string | null;
                    type: import(".prisma/client").$Enums.CategoryType;
                    level: import(".prisma/client").$Enums.CategoryLevel;
                    parent: {
                        id: string;
                        name: string;
                        slug: string;
                        cityId: string | null;
                        parentId: string | null;
                        type: import(".prisma/client").$Enums.CategoryType;
                        level: import(".prisma/client").$Enums.CategoryLevel;
                        parent: {
                            id: string;
                            name: string;
                            slug: string;
                            cityId: string | null;
                            parentId: string | null;
                            type: import(".prisma/client").$Enums.CategoryType;
                            level: import(".prisma/client").$Enums.CategoryLevel;
                        } | null;
                    } | null;
                } | null;
            } | null;
            id: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            title: string;
            excerpt: string | null;
            thumbnail: string | null;
            categoryId: string | null;
        }[];
    }>;
    private loadCity;
    private loadPost;
}
export {};
