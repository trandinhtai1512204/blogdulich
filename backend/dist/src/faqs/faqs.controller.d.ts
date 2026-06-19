import { CreateFaqDto, QueryFaqDto, ResolveFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FaqsService } from './faqs.service';
export declare class FaqsController {
    private faqsService;
    constructor(faqsService: FaqsService);
    findAll(query: QueryFaqDto): import(".prisma/client").Prisma.PrismaPromise<{
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
    create(dto: CreateFaqDto): import(".prisma/client").Prisma.Prisma__FaqClient<{
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
}
