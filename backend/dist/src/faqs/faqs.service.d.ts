import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, QueryFaqDto, ResolveFaqDto, UpdateFaqDto } from './dto/faq.dto';
export declare class FaqsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryFaqDto): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        targetType: import(".prisma/client").$Enums.FaqTargetType;
        targetId: string | null;
        module: import(".prisma/client").$Enums.CategoryType | null;
        question: string;
        answer: string;
        sortOrder: number;
    }[]>;
    resolve(query: ResolveFaqDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        targetType: import(".prisma/client").$Enums.FaqTargetType;
        targetId: string | null;
        module: import(".prisma/client").$Enums.CategoryType | null;
        question: string;
        answer: string;
        sortOrder: number;
    }[] | {
        id: string;
        targetType: "global";
        targetId: null;
        module: import(".prisma/client").$Enums.CategoryType;
        question: string;
        answer: string;
        sortOrder: number;
        published: boolean;
        createdAt: null;
        updatedAt: null;
    }[]>;
    create(dto: CreateFaqDto): Prisma.Prisma__FaqClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        targetType: import(".prisma/client").$Enums.FaqTargetType;
        targetId: string | null;
        module: import(".prisma/client").$Enums.CategoryType | null;
        question: string;
        answer: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateFaqDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        targetType: import(".prisma/client").$Enums.FaqTargetType;
        targetId: string | null;
        module: import(".prisma/client").$Enums.CategoryType | null;
        question: string;
        answer: string;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    private normalizeCreateDto;
    private normalizeUpdateDto;
    private ensureExists;
    private resolveBuckets;
    private resolveModule;
    private categoryBuckets;
    private findPublished;
    private categoryChain;
    private mergeFaqs;
    private defaultFaqs;
}
