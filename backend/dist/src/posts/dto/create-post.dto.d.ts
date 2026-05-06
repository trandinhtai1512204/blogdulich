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
    cityId?: string;
    categoryId?: string;
}
