import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
export declare class PostsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryPostsDto): Promise<{
        data: {
            city: {
                name: string;
                id: string;
                slug: string;
            } | null;
            category: {
                name: string;
                id: string;
                slug: string;
            } | null;
            id: string;
            createdAt: Date;
            slug: string;
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
            image: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            country: string;
        } | null;
        category: {
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
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
    create(dto: CreatePostDto): import(".prisma/client").Prisma.Prisma__PostClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: Partial<CreatePostDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
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
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
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
