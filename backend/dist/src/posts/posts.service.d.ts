import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
export declare class PostsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryPostsDto): Promise<{
        data: {
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
            content: string;
            excerpt: string | null;
            thumbnail: string | null;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            published: boolean;
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
        city: {
            id: string;
            slug: string;
            name: string;
            country: string;
            image: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        category: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        } | null;
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        cityId: string | null;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        published: boolean;
        categoryId: string | null;
    }>;
    create(dto: CreatePostDto): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        cityId: string | null;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        published: boolean;
        categoryId: string | null;
    }>;
    update(id: string, dto: Partial<CreatePostDto>): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        cityId: string | null;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        published: boolean;
        categoryId: string | null;
    }>;
    private handlePrismaWriteError;
    remove(id: string): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        cityId: string | null;
        title: string;
        content: string;
        excerpt: string | null;
        thumbnail: string | null;
        location: string | null;
        latitude: number | null;
        longitude: number | null;
        published: boolean;
        categoryId: string | null;
    }>;
}
