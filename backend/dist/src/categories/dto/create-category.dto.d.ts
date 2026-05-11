export declare enum CategoryType {
    destination = "destination",
    itinerary = "itinerary",
    review = "review",
    experience = "experience"
}
export declare class CreateCategoryDto {
    name: string;
    slug: string;
    type?: CategoryType;
    cityId?: string | null;
    parentId?: string | null;
}
