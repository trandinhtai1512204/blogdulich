import { PostsService } from './posts.service';
import { CreatePostDto, SubmitPostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import type { Request } from 'express';
type AuthenticatedRequest = Request & {
    user: {
        sub: string;
    };
};
export declare class PostsController {
    private postsService;
    constructor(postsService: PostsService);
    findAll(query: QueryPostsDto): Promise<{
        data: {
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
            viewCount: number;
            published: boolean;
            categoryId: string | null;
            author: {
                id: string;
                name: string | null;
                avatar: string | null;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findCityFeatured(citySlug: string): Promise<{
        city: {
            id: string;
            name: string;
            slug: string;
        };
        destination: {
            viewCount: number;
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
            published: boolean;
            categoryId: string | null;
            author: {
                id: string;
                name: string | null;
                avatar: string | null;
            } | null;
        }[];
        itinerary: {
            viewCount: number;
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
            published: boolean;
            categoryId: string | null;
            author: {
                id: string;
                name: string | null;
                avatar: string | null;
            } | null;
        }[];
        experience: {
            viewCount: number;
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
            published: boolean;
            categoryId: string | null;
            author: {
                id: string;
                name: string | null;
                avatar: string | null;
            } | null;
        }[];
        review: {
            groups: {
                posts: {
                    viewCount: number;
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
                    published: boolean;
                    categoryId: string | null;
                    author: {
                        id: string;
                        name: string | null;
                        avatar: string | null;
                    } | null;
                }[];
                slug: string;
                name: string;
            }[];
            posts: {
                viewCount: number;
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
                published: boolean;
                categoryId: string | null;
                author: {
                    id: string;
                    name: string | null;
                    avatar: string | null;
                } | null;
            }[];
        };
    }>;
    submitCommunityPost(dto: SubmitPostDto, req: AuthenticatedRequest): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        } | null;
        city: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            country: string;
            image: string | null;
            description: string | null;
            updatedAt: Date;
        } | null;
        author: {
            id: string;
            name: string | null;
            avatar: string | null;
        } | null;
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        viewCount: number;
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
    findMyPosts(req: AuthenticatedRequest): import(".prisma/client").Prisma.PrismaPromise<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        id: string;
        slug: string;
        createdAt: Date;
        city: {
            id: string;
            name: string;
            slug: string;
        } | null;
        updatedAt: Date;
        title: string;
        excerpt: string | null;
        thumbnail: string | null;
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
    }[]>;
    findAllForAdmin(query: QueryPostsDto): Promise<{
        data: {
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
            city: {
                id: string;
                name: string;
                slug: string;
            } | null;
            author: {
                id: string;
                name: string | null;
                email: string;
                avatar: string | null;
            } | null;
            id: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            updatedAt: Date;
            title: string;
            content: string;
            excerpt: string | null;
            thumbnail: string | null;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            viewCount: number;
            published: boolean;
            status: import(".prisma/client").$Enums.PostStatus;
            authorId: string | null;
            categoryId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(slug: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        } | null;
        city: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            country: string;
            image: string | null;
            description: string | null;
            updatedAt: Date;
        } | null;
        author: {
            id: string;
            name: string | null;
            avatar: string | null;
        } | null;
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        viewCount: number;
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
    incrementViewCount(id: string): Promise<{
        id: string;
        viewCount: number;
    }>;
    create(dto: CreatePostDto): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        viewCount: number;
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
    update(id: string, dto: Partial<CreatePostDto>): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        viewCount: number;
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        viewCount: number;
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
}
export {};
