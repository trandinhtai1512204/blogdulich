import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    create(hotelId: string, req: any, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hotelId: string;
        userId: string;
        rating: number;
        comment: string | null;
    }>;
    findByHotel(hotelId: string): Promise<{
        reviews: ({
            user: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hotelId: string;
            userId: string;
            rating: number;
            comment: string | null;
        })[];
        total: number;
        avg: number;
        distribution: {
            star: number;
            count: number;
        }[];
    }>;
    delete(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hotelId: string;
        userId: string;
        rating: number;
        comment: string | null;
    }>;
}
