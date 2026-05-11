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
        canonicalPath: string;
    } | {
        kind: "category";
        city: {
            id: string;
            name: string;
            slug: string;
        } | null;
        category: {
            id: string;
            name: string;
            slug: string;
            type: string;
            level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
            parentId: string | null;
            cityId: string | null;
        };
        chain: {
            id: string;
            name: string;
            slug: string;
            type: string;
            level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
            parentId: string | null;
            cityId: string | null;
        }[];
        canonicalPath: string;
    } | {
        kind: "post";
        city: {
            id: string;
            name: string;
            slug: string;
        } | null;
        category: {
            id: string;
            name: string;
            slug: string;
            type: string;
            level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
            parentId: string | null;
            cityId: string | null;
        } | null;
        chain: {
            id: string;
            name: string;
            slug: string;
            type: string;
            level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
            parentId: string | null;
            cityId: string | null;
        }[];
        post: any;
        canonicalPath: string;
    } | {
        kind: "not_found";
    }>;
    page(path: string): Promise<{
        resolved: {
            kind: "post";
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            category: {
                id: string;
                name: string;
                slug: string;
                type: string;
                level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
                parentId: string | null;
                cityId: string | null;
            } | null;
            chain: {
                id: string;
                name: string;
                slug: string;
                type: string;
                level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
                parentId: string | null;
                cityId: string | null;
            }[];
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
            city: {
                id: string;
                name: string;
                slug: string;
            };
            canonicalPath: string;
        };
        children: {
            id: string;
            slug: string;
            name: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        }[];
        cityPills: never[];
        posts: {
            canonicalUrl: string;
            id: string;
            slug: string;
            createdAt: Date;
            city: {
                id: string;
                slug: string;
                name: string;
            } | null;
            category: {
                id: string;
                slug: string;
                name: string;
                cityId: string | null;
                parentId: string | null;
                type: import(".prisma/client").$Enums.CategoryType;
                level: import(".prisma/client").$Enums.CategoryLevel;
                parent: {
                    id: string;
                    slug: string;
                    name: string;
                    cityId: string | null;
                    parentId: string | null;
                    type: import(".prisma/client").$Enums.CategoryType;
                    level: import(".prisma/client").$Enums.CategoryLevel;
                    parent: {
                        id: string;
                        slug: string;
                        name: string;
                        cityId: string | null;
                        parentId: string | null;
                        type: import(".prisma/client").$Enums.CategoryType;
                        level: import(".prisma/client").$Enums.CategoryLevel;
                        parent: {
                            id: string;
                            slug: string;
                            name: string;
                            cityId: string | null;
                            parentId: string | null;
                            type: import(".prisma/client").$Enums.CategoryType;
                            level: import(".prisma/client").$Enums.CategoryLevel;
                        } | null;
                    } | null;
                } | null;
            } | null;
            cityId: string | null;
            title: string;
            excerpt: string | null;
            thumbnail: string | null;
            categoryId: string | null;
        }[];
    } | {
        resolved: {
            kind: "category";
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            category: {
                id: string;
                name: string;
                slug: string;
                type: string;
                level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
                parentId: string | null;
                cityId: string | null;
            };
            chain: {
                id: string;
                name: string;
                slug: string;
                type: string;
                level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
                parentId: string | null;
                cityId: string | null;
            }[];
            canonicalPath: string;
        };
        children: never[];
        cityPills: {
            id: string;
            slug: string;
            name: string;
        }[];
        posts: {
            canonicalUrl: string;
            id: string;
            slug: string;
            createdAt: Date;
            city: {
                id: string;
                slug: string;
                name: string;
            } | null;
            category: {
                id: string;
                slug: string;
                name: string;
                cityId: string | null;
                parentId: string | null;
                type: import(".prisma/client").$Enums.CategoryType;
                level: import(".prisma/client").$Enums.CategoryLevel;
                parent: {
                    id: string;
                    slug: string;
                    name: string;
                    cityId: string | null;
                    parentId: string | null;
                    type: import(".prisma/client").$Enums.CategoryType;
                    level: import(".prisma/client").$Enums.CategoryLevel;
                    parent: {
                        id: string;
                        slug: string;
                        name: string;
                        cityId: string | null;
                        parentId: string | null;
                        type: import(".prisma/client").$Enums.CategoryType;
                        level: import(".prisma/client").$Enums.CategoryLevel;
                        parent: {
                            id: string;
                            slug: string;
                            name: string;
                            cityId: string | null;
                            parentId: string | null;
                            type: import(".prisma/client").$Enums.CategoryType;
                            level: import(".prisma/client").$Enums.CategoryLevel;
                        } | null;
                    } | null;
                } | null;
            } | null;
            cityId: string | null;
            title: string;
            excerpt: string | null;
            thumbnail: string | null;
            categoryId: string | null;
        }[];
    } | {
        resolved: {
            kind: "category";
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            category: {
                id: string;
                name: string;
                slug: string;
                type: string;
                level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
                parentId: string | null;
                cityId: string | null;
            };
            chain: {
                id: string;
                name: string;
                slug: string;
                type: string;
                level: "ROOT" | "SUBTYPE" | "CITY" | "SUB";
                parentId: string | null;
                cityId: string | null;
            }[];
            canonicalPath: string;
        };
        children: {
            id: string;
            slug: string;
            name: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        }[];
        cityPills: never[];
        posts: {
            canonicalUrl: string;
            id: string;
            slug: string;
            createdAt: Date;
            city: {
                id: string;
                slug: string;
                name: string;
            } | null;
            category: {
                id: string;
                slug: string;
                name: string;
                cityId: string | null;
                parentId: string | null;
                type: import(".prisma/client").$Enums.CategoryType;
                level: import(".prisma/client").$Enums.CategoryLevel;
                parent: {
                    id: string;
                    slug: string;
                    name: string;
                    cityId: string | null;
                    parentId: string | null;
                    type: import(".prisma/client").$Enums.CategoryType;
                    level: import(".prisma/client").$Enums.CategoryLevel;
                    parent: {
                        id: string;
                        slug: string;
                        name: string;
                        cityId: string | null;
                        parentId: string | null;
                        type: import(".prisma/client").$Enums.CategoryType;
                        level: import(".prisma/client").$Enums.CategoryLevel;
                        parent: {
                            id: string;
                            slug: string;
                            name: string;
                            cityId: string | null;
                            parentId: string | null;
                            type: import(".prisma/client").$Enums.CategoryType;
                            level: import(".prisma/client").$Enums.CategoryLevel;
                        } | null;
                    } | null;
                } | null;
            } | null;
            cityId: string | null;
            title: string;
            excerpt: string | null;
            thumbnail: string | null;
            categoryId: string | null;
        }[];
    }>;
}
