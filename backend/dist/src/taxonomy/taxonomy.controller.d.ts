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
}
