import { PostStatus } from '@prisma/client';
export declare class CreatePostDto {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnail?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    published?: boolean;
    status?: PostStatus;
    cityId?: string;
    categoryId?: string;
}
export declare class SubmitPostDto {
    title: string;
    content: string;
    slug?: string;
    excerpt?: string;
    thumbnail?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    cityId?: string;
    categoryId?: string;
}
