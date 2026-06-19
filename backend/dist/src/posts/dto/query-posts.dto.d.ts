import { CategoryType } from '@prisma/client';
export declare class QueryPostsDto {
    cityId?: string;
    categoryId?: string;
    search?: string;
    page?: string;
    limit?: string;
    type?: CategoryType;
    sort?: 'latest' | 'hot';
}
