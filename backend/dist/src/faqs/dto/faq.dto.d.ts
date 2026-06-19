import { CategoryType, FaqTargetType } from '@prisma/client';
export declare class QueryFaqDto {
    targetType?: FaqTargetType;
    targetId?: string;
    module?: CategoryType;
    includeUnpublished?: string;
}
export declare class ResolveFaqDto {
    targetType: FaqTargetType;
    targetId?: string;
    module?: CategoryType;
}
export declare class CreateFaqDto {
    targetType: FaqTargetType;
    targetId?: string;
    module?: CategoryType;
    question: string;
    answer: string;
    sortOrder?: number;
    published?: boolean;
}
export declare class UpdateFaqDto {
    targetType?: FaqTargetType;
    targetId?: string;
    module?: CategoryType;
    question?: string;
    answer?: string;
    sortOrder?: number;
    published?: boolean;
}
