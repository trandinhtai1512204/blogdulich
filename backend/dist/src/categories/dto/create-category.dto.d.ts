export declare enum CategoryType {
    about = "about",
    destination = "destination",
    itinerary = "itinerary",
    cost = "cost",
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
