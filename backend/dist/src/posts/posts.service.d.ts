import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, SubmitPostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
export declare class PostsService {
    private prisma;
    constructor(prisma: PrismaService);
    private slugify;
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
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
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
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
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
    submitCommunityPost(dto: SubmitPostDto, authorId: string): Promise<{
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
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
    findByAuthor(authorId: string): Prisma.PrismaPromise<{
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
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
    private handlePrismaWriteError;
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
        published: boolean;
        status: import(".prisma/client").$Enums.PostStatus;
        authorId: string | null;
        categoryId: string | null;
    }>;
}
