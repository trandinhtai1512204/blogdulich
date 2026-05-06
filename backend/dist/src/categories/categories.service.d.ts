import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureSystemRoots;
    private resolveRootType;
    private isSystemRootSlug;
    findAll(query: QueryCategoriesDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
    }[]>;
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
        parent: {
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
        } | null;
        children: {
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
    }>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
    }>;
    bootstrapRoots(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
    }[]>;
}
