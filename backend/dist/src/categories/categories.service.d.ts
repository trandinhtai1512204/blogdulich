import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
export declare class CategoriesService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureSystemRoots;
    private walkParentChain;
    private computeChildLevel;
    private validateChildLevelByModule;
    private isSystemRootSlug;
    findAll(query: QueryCategoriesDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
        level: import(".prisma/client").$Enums.CategoryLevel;
    }[]>;
    findOne(slug: string): Promise<{
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
        parent: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            cityId: string | null;
            parentId: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            level: import(".prisma/client").$Enums.CategoryLevel;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
        level: import(".prisma/client").$Enums.CategoryLevel;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
        level: import(".prisma/client").$Enums.CategoryLevel;
    }>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
        level: import(".prisma/client").$Enums.CategoryLevel;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
        level: import(".prisma/client").$Enums.CategoryLevel;
    }>;
    bootstrapRoots(): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        cityId: string | null;
        parentId: string | null;
        type: import(".prisma/client").$Enums.CategoryType;
        level: import(".prisma/client").$Enums.CategoryLevel;
    }[]>;
}
